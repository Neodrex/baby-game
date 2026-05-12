import { PaletteManager } from './PaletteManager.ts'

type TimerEvent = 'softWarning' | 'naturalPauseReady' | 'hardCeiling'
type EventHandler = () => void

class SessionTimerClass {
  private handlers = new Map<TimerEvent, EventHandler[]>()
  private softWarningHandle: ReturnType<typeof setTimeout> | null = null
  private hardCeilingHandle: ReturnType<typeof setTimeout> | null = null
  private elapsed = false
  private naturalPauseReady = false
  private running = false

  start(durationMinutes: number): void {
    this.stop()
    this.handlers.clear()
    this.elapsed = false
    this.naturalPauseReady = false
    this.running = true

    const durationMs = durationMinutes * 60 * 1000
    const softWarningMs = Math.max(0, durationMs - 60 * 1000)
    const hardCeilingMs = durationMs + 90 * 1000

    this.softWarningHandle = setTimeout(() => {
      PaletteManager.applySoftWarning()
      this.emit('softWarning')
    }, softWarningMs)

    this.hardCeilingHandle = setTimeout(() => {
      this.elapsed = true
      this.naturalPauseReady = true
      this.emit('hardCeiling')
    }, hardCeilingMs)

    // mark elapsed at durationMs so natural pause logic works
    setTimeout(() => {
      this.elapsed = true
    }, durationMs)
  }

  /** Called by game scenes at the end of each micro-action. */
  signalActionComplete(): void {
    if (!this.running) return
    if (!this.elapsed) return
    if (this.naturalPauseReady) return
    this.naturalPauseReady = true
    this.emit('naturalPauseReady')
  }

  stop(): void {
    this.running = false
    if (this.softWarningHandle !== null) clearTimeout(this.softWarningHandle)
    if (this.hardCeilingHandle !== null) clearTimeout(this.hardCeilingHandle)
    this.softWarningHandle = null
    this.hardCeilingHandle = null
  }

  on(event: TimerEvent, handler: EventHandler): void {
    const list = this.handlers.get(event) ?? []
    list.push(handler)
    this.handlers.set(event, list)
  }

  off(event: TimerEvent, handler: EventHandler): void {
    const list = this.handlers.get(event) ?? []
    this.handlers.set(event, list.filter(h => h !== handler))
  }

  private emit(event: TimerEvent): void {
    this.handlers.get(event)?.forEach(h => h())
  }
}

export const SessionTimer = new SessionTimerClass()
