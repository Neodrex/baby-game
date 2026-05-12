import { PALETTES, type PaletteTokens } from '../data/palettes.ts'
import { SettingsManager } from './SettingsManager.ts'

class PaletteManagerClass {
  private current: PaletteTokens = PALETTES.standard
  private softWarningActive = false

  apply(): void {
    const name = SettingsManager.get('palette')
    this.current = PALETTES[name] ?? PALETTES.standard
    this.softWarningActive = false
    document.documentElement.style.setProperty('--bg', this.current.backgroundCss)
    document.documentElement.style.setProperty('--surface', this.current.surfaceCss)
  }

  get(): PaletteTokens {
    return this.current
  }

  applySoftWarning(): void {
    if (this.softWarningActive) return
    this.softWarningActive = true
    // tint the Phaser background — callers read softWarningTint from tokens
  }

  clearSoftWarning(): void {
    this.softWarningActive = false
    this.apply()
  }

  isSoftWarningActive(): boolean {
    return this.softWarningActive
  }
}

export const PaletteManager = new PaletteManagerClass()
