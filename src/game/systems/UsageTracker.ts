const STORAGE_KEY = 'calmgames_usage'

interface SessionRecord {
  date: string   // YYYY-MM-DD
  startMs: number
  endMs: number
  modeId: string
}

interface UsageData {
  sessions: SessionRecord[]
}

class UsageTrackerClass {
  private data: UsageData = { sessions: [] }
  private currentSession: { startMs: number; modeId: string } | null = null

  constructor() {
    this.load()
    this.prune()
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) this.data = JSON.parse(raw) as UsageData
    } catch {
      this.data = { sessions: [] }
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch { /* silent */ }
  }

  private prune(): void {
    // keep only last 7 days
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    this.data.sessions = this.data.sessions.filter(s => s.endMs > cutoff)
    this.save()
  }

  private todayStr(): string {
    return new Date().toISOString().slice(0, 10)
  }

  startSession(modeId: string): void {
    this.currentSession = { startMs: Date.now(), modeId }
  }

  endSession(): void {
    if (!this.currentSession) return
    const record: SessionRecord = {
      date: this.todayStr(),
      startMs: this.currentSession.startMs,
      endMs: Date.now(),
      modeId: this.currentSession.modeId,
    }
    this.data.sessions.push(record)
    this.save()
    this.currentSession = null
  }

  getTodayMinutes(): number {
    const today = this.todayStr()
    return this.data.sessions
      .filter(s => s.date === today)
      .reduce((sum, s) => sum + (s.endMs - s.startMs) / 60000, 0)
  }

  getWeekMinutes(): number {
    return this.data.sessions
      .reduce((sum, s) => sum + (s.endMs - s.startMs) / 60000, 0)
  }

  getLastSessionLength(): number {
    const sessions = [...this.data.sessions]
    if (sessions.length === 0) return 0
    const last = sessions[sessions.length - 1]
    return (last.endMs - last.startMs) / 60000
  }

  getModesUsed(): string[] {
    const today = this.todayStr()
    const ids = this.data.sessions
      .filter(s => s.date === today)
      .map(s => s.modeId)
    return [...new Set(ids)]
  }

  resetAll(): void {
    this.data = { sessions: [] }
    this.save()
  }
}

export const UsageTracker = new UsageTrackerClass()
