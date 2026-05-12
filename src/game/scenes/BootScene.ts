import Phaser from 'phaser'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { SettingsManager } from '../systems/SettingsManager.ts'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  create(): void {
    // Apply palette before anything renders
    const paletteName = SettingsManager.get('palette')
    SettingsManager.set('palette', paletteName)  // ensure listeners fire
    PaletteManager.apply()

    this.scale.on('resize', () => {
      // scenes handle their own resize
    })

    this.scene.start('PreloadScene')
  }
}
