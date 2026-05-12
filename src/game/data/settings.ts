export type Difficulty = 'veryEasy' | 'easy' | 'normal'
export type Palette = 'standard' | 'muted' | 'bedtime'
export type SessionDuration = 5 | 10 | 15 | 20
export type OrientationLock = 'auto' | 'portrait' | 'landscape'

export interface Settings {
  // Modes
  colouringEnabled: boolean
  catchEnabled: boolean
  sortingEnabled: boolean
  findEnabled: boolean
  sceneBuilderEnabled: boolean

  // Session
  sessionDuration: SessionDuration
  softWarning: boolean

  // Audio
  soundEffects: boolean
  narration: boolean
  backgroundMusic: boolean

  // Visuals
  difficulty: Difficulty
  palette: Palette
  bedtimeMode: boolean
  reducedMotion: boolean

  // Device
  fullscreen: boolean
  orientationLock: OrientationLock
}

export const DEFAULT_SETTINGS: Settings = {
  colouringEnabled: true,
  catchEnabled: true,
  sortingEnabled: true,
  findEnabled: true,
  sceneBuilderEnabled: true,

  sessionDuration: 10,
  softWarning: true,

  soundEffects: true,
  narration: true,
  backgroundMusic: false,

  difficulty: 'easy',
  palette: 'standard',
  bedtimeMode: false,
  reducedMotion: false,

  fullscreen: false,
  orientationLock: 'auto',
}
