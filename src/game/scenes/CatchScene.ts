import Phaser from 'phaser'
import { CATCH_ITEMS } from '../data/objects.ts'
import { SettingsManager } from '../systems/SettingsManager.ts'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { SessionTimer } from '../systems/SessionTimer.ts'
import { AudioManager } from '../systems/AudioManager.ts'
import { CalmFeedback } from '../components/CalmFeedback.ts'
import { BigButton } from '../components/BigButton.ts'

const SPEED_BY_DIFFICULTY = { veryEasy: 12000, easy: 8000, normal: 6000 }
const BASKET_CATCH_RADIUS = 80

export class CatchScene extends Phaser.Scene {
  private basket!: Phaser.GameObjects.Image
  private fallingItem: Phaser.GameObjects.Image | null = null
  private itemTween: Phaser.Tweens.Tween | null = null
  private spawning = false

  constructor() {
    super({ key: 'CatchScene' })
  }

  create(): void {
    PaletteManager.apply()
    AudioManager.setScene(this)

    const palette = PaletteManager.get()
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, palette.background).setOrigin(0, 0)
    this.setupBackButton()

    // Basket at bottom centre
    this.basket = this.add.image(width / 2, height - 90, 'catch-basket')
      .setDisplaySize(120, 90)
      .setInteractive({ useHandCursor: false, draggable: true })
    this.input.setDraggable(this.basket)

    this.basket.on('drag', (_: Phaser.Input.Pointer, dragX: number) => {
      this.basket.x = Phaser.Math.Clamp(dragX, 60, width - 60)
    })

    // Also let tapping anywhere on bottom half move the basket
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (ptr.y > height * 0.6) {
        this.basket.x = Phaser.Math.Clamp(ptr.x, 60, width - 60)
      }
    })

    AudioManager.playNarration('Catch the falling things!')
    this.spawnItem()
    this.scale.on('resize', this.onResize, this)
  }

  private setupBackButton(): void {
    const palette = PaletteManager.get()
    new BigButton(this, {
      x: 56, y: 44, size: 72,
      label: '←',
      bgColour: palette.accent,
      onTap: () => {
        this.clearItem()
        SessionTimer.signalActionComplete()
        this.scene.start('MenuScene')
      },
    })
  }

  private spawnItem(): void {
    if (this.spawning) return
    this.spawning = true

    const { width, height } = this.scale
    const difficulty = SettingsManager.get('difficulty')
    const speed = SPEED_BY_DIFFICULTY[difficulty]

    const item = Phaser.Utils.Array.GetRandom(CATCH_ITEMS)
    const x = Phaser.Math.Between(48, width - 48)

    this.fallingItem = this.add.image(x, -40, item.asset).setDisplaySize(80, 80)

    // Gentle sine drift
    const driftX = x + Phaser.Math.Between(-60, 60)

    this.itemTween = this.tweens.add({
      targets: this.fallingItem,
      x: driftX,
      y: height + 60,
      duration: speed,
      ease: 'Sine.easeIn',
      onComplete: () => {
        // Missed — quietly remove and spawn next
        this.fallingItem?.destroy()
        this.fallingItem = null
        this.spawning = false
        this.time.delayedCall(600, () => this.spawnItem())
      },
    })
  }

  update(): void {
    if (!this.fallingItem) return

    const dx = this.fallingItem.x - this.basket.x
    const dy = this.fallingItem.y - this.basket.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < BASKET_CATCH_RADIUS) {
      this.onCatch()
    }
  }

  private onCatch(): void {
    if (!this.fallingItem) return

    const itemX = this.fallingItem.x
    const itemY = this.fallingItem.y

    this.itemTween?.stop()
    this.fallingItem.destroy()
    this.fallingItem = null

    CalmFeedback.sparkle(this, itemX, itemY)
    AudioManager.playSFX('sfx-chime')
    CalmFeedback.bounce(this.basket as unknown as Phaser.GameObjects.GameObject & { y: number; scene: Phaser.Scene })

    SessionTimer.signalActionComplete()

    this.spawning = false
    this.time.delayedCall(800, () => this.spawnItem())
  }

  private clearItem(): void {
    this.itemTween?.stop()
    this.fallingItem?.destroy()
    this.fallingItem = null
  }

  private onResize(): void {
    this.scene.restart()
  }

  shutdown(): void {
    this.scale.off('resize', this.onResize, this)
    this.clearItem()
  }
}
