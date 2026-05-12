import Phaser from 'phaser'
import { STICKERS } from '../data/objects.ts'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { SessionTimer } from '../systems/SessionTimer.ts'
import { AudioManager } from '../systems/AudioManager.ts'
import { AccessibilityManager } from '../systems/AccessibilityManager.ts'
import { BigButton } from '../components/BigButton.ts'

const TRAY_HEIGHT = 110

export class SceneBuilderScene extends Phaser.Scene {
  private placedStickers: Phaser.GameObjects.Image[] = []
  private trayScrollX = 0
  private tray!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'SceneBuilderScene' })
  }

  create(): void {
    PaletteManager.apply()
    AudioManager.setScene(this)

    const palette = PaletteManager.get()
    const { width, height } = this.scale

    // Sky background
    this.add.rectangle(0, 0, width, height - TRAY_HEIGHT, palette.background).setOrigin(0, 0)

    // Tray background
    this.add.rectangle(0, height - TRAY_HEIGHT, width, TRAY_HEIGHT, palette.surface).setOrigin(0, 0)
      .setStrokeStyle(2, palette.accent)

    this.setupBackButton()
    this.buildStickerTray()
    this.buildResetButton()

    AudioManager.playNarration('Build your own scene!')
    this.scale.on('resize', this.onResize, this)
  }

  private setupBackButton(): void {
    const palette = PaletteManager.get()
    new BigButton(this, {
      x: 56, y: 44, size: 72,
      label: '←',
      bgColour: palette.accent,
      onTap: () => {
        SessionTimer.signalActionComplete()
        this.scene.start('MenuScene')
      },
    })
  }

  private buildStickerTray(): void {
    const { width, height } = this.scale
    const trayY = height - TRAY_HEIGHT
    const btnSize = 72
    const gap = 16
    this.tray = this.add.container(0, trayY)

    STICKERS.forEach((sticker, i) => {
      const x = gap + btnSize / 2 + i * (btnSize + gap)
      const img = this.add.image(x, TRAY_HEIGHT / 2, sticker.asset)
        .setDisplaySize(btnSize, btnSize)
        .setInteractive()

      img.on('pointerup', () => this.placeSticker(sticker.asset, sticker.narration))
      this.tray.add(img)
    })

    // Horizontal scroll on tray
    this.input.on('wheel', (_: Phaser.Input.Pointer, __: Phaser.GameObjects.GameObject[], dx: number) => {
      const maxScroll = Math.max(0, STICKERS.length * (btnSize + gap) - width)
      this.trayScrollX = Phaser.Math.Clamp(this.trayScrollX + dx, 0, maxScroll)
      this.tray.x = -this.trayScrollX
    })
  }

  private placeSticker(assetKey: string, narration: string): void {
    const { width, height } = this.scale
    const x = Phaser.Math.Between(80, width - 80)
    const y = Phaser.Math.Between(80, height - TRAY_HEIGHT - 80)

    const img = this.add.image(x, y, assetKey)
      .setDisplaySize(90, 90)
      .setInteractive({ draggable: true })

    this.input.setDraggable(img)
    img.on('drag', (_: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      img.x = dragX
      img.y = Phaser.Math.Clamp(dragY, 40, height - TRAY_HEIGHT - 40)
    })

    // Appear with gentle scale-in
    img.setScale(0.1)
    const dur = AccessibilityManager.animDuration(250)
    this.tweens.add({
      targets: img,
      scaleX: 90 / img.width, scaleY: 90 / img.height,
      duration: dur || 1, ease: 'Back.easeOut',
    })

    this.placedStickers.push(img)
    AudioManager.playNarration(narration)
    SessionTimer.signalActionComplete()
  }

  private buildResetButton(): void {
    const palette = PaletteManager.get()
    const { width, height } = this.scale
    new BigButton(this, {
      x: width - 56, y: height - TRAY_HEIGHT / 2, size: 72,
      label: 'Clear',
      bgColour: palette.primary,
      onTap: () => {
        const dur = AccessibilityManager.animDuration(300)
        this.placedStickers.forEach(s => {
          this.tweens.add({ targets: s, alpha: 0, duration: dur || 1, onComplete: () => s.destroy() })
        })
        this.placedStickers = []
      },
    })
  }

  private onResize(): void {
    this.scene.restart()
  }

  shutdown(): void {
    this.scale.off('resize', this.onResize, this)
  }
}
