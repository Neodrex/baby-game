import Phaser from 'phaser'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { AccessibilityManager } from '../systems/AccessibilityManager.ts'

const MIN_SIZE = 88  // px — brief §13

export interface BigButtonConfig {
  x: number
  y: number
  size?: number
  iconKey?: string
  label?: string
  bgColour?: number
  onTap: () => void
}

export class BigButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics
  private onTap: () => void

  constructor(scene: Phaser.Scene, config: BigButtonConfig) {
    super(scene, config.x, config.y)
    scene.add.existing(this)

    const size = Math.max(MIN_SIZE, config.size ?? MIN_SIZE)
    const palette = PaletteManager.get()
    const bgColour = config.bgColour ?? palette.primary
    this.onTap = config.onTap

    this.bg = scene.add.graphics()
    this.bg.fillStyle(bgColour, 1)
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 16)
    this.bg.lineStyle(3, palette.accent, 1)
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 16)

    this.add(this.bg)

    if (config.iconKey) {
      const icon = scene.add.image(0, config.label ? -10 : 0, config.iconKey)
      const scale = (size * 0.55) / Math.max(icon.width, icon.height)
      icon.setScale(scale)
      this.add(icon)
    }

    if (config.label) {
      const labelY = config.iconKey ? size * 0.22 : 0
      const text = scene.add.text(0, labelY, config.label, {
        fontSize: '18px', color: '#ffffff', fontFamily: 'sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5)
      this.add(text)
    }

    this.setSize(size, size)
    this.setInteractive()
    this.on('pointerup', () => {
      this.pulse()
      this.onTap()
    })
    this.on('pointerover', () => this.bg.setAlpha(0.85))
    this.on('pointerout', () => this.bg.setAlpha(1))
  }

  private pulse(): void {
    const dur = AccessibilityManager.animDuration(120)
    if (dur === 0) return
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.92, scaleY: 0.92,
      duration: dur, ease: 'Sine.easeOut', yoyo: true,
    })
  }

  setHighlight(on: boolean): void {
    this.bg.setAlpha(on ? 1 : 0.7)
  }
}
