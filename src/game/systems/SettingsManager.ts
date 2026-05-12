import { DEFAULT_SETTINGS, type Settings } from '../data/settings.ts'

const STORAGE_KEY = 'calmgames_settings'

type SettingsChangeHandler = (settings: Settings) => void

class SettingsManagerClass {
  private settings: Settings = { ...DEFAULT_SETTINGS }
  private handlers: SettingsChangeHandler[] = []

  constructor() {
    this.load()
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>
        this.settings = { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch {
      this.settings = { ...DEFAULT_SETTINGS }
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
    } catch {
      // storage unavailable — continue without persisting
    }
  }

  get<K extends keyof Settings>(key: K): Settings[K] {
    return this.settings[key]
  }

  set<K extends keyof Settings>(key: K, value: Settings[K]): void {
    this.settings[key] = value
    this.save()
    this.handlers.forEach(h => h(this.settings))
  }

  getAll(): Readonly<Settings> {
    return this.settings
  }

  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS }
    this.save()
    this.handlers.forEach(h => h(this.settings))
  }

  onChange(handler: SettingsChangeHandler): () => void {
    this.handlers.push(handler)
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler)
    }
  }
}

export const SettingsManager = new SettingsManagerClass()
