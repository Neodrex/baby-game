import Phaser from 'phaser'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { ParentGate } from '../systems/ParentGate.ts'
import { AccessibilityManager } from '../systems/AccessibilityManager.ts'
import { CalmFeedback } from '../components/CalmFeedback.ts'

export class SessionEndScene extends Phaser.Scene {
  private locked = false

  constructor() {
    super({ key: 'SessionEndScene' })
  }

  create(): void {
    PaletteManager.clearSoftWarning()
    PaletteManager.apply()
    const palette = PaletteManager.get()
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, palette.background).setOrigin(0, 0)

    // Stars
    this.spawnStars()

    // Moon image (or drawn)
    const moon = this.add.circle(width / 2, height * 0.3, 70, palette.accent)
    moon.setAlpha(0)
    const dur = AccessibilityManager.animDuration(800)
    this.tweens.add({
      targets: moon,
      alpha: 1,
      duration: dur || 1,
      ease: 'Sine.easeOut',
    })
    CalmFeedback.bounce(moon as unknown as Phaser.GameObjects.GameObject & { y: number; scene: Phaser.Scene })

    const textColour = `#${palette.text.toString(16).padStart(6, '0')}`

    this.add.text(width / 2, height * 0.55, 'All done for now', {
      fontSize: '38px', color: textColour,
      fontFamily: 'sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.65, 'What a lovely play!', {
      fontSize: '24px', color: textColour, fontFamily: 'sans-serif',
    }).setOrigin(0.5)

    // Goodbye button — visible after short delay so child can see scene first
    this.time.delayedCall(800, () => {
      const goodbyeBtn = this.add.text(width / 2, height * 0.8, 'Goodbye', {
        fontSize: '32px', color: `#${palette.primary.toString(16).padStart(6, '0')}`,
        fontFamily: 'sans-serif', fontStyle: 'bold',
        backgroundColor: `#${palette.surface.toString(16).padStart(6, '0')}`,
        padding: { x: 32, y: 16 },
      }).setOrigin(0.5).setInteractive().setAlpha(0)

      this.tweens.add({ targets: goodbyeBtn, alpha: 1, duration: AccessibilityManager.animDuration(400) || 1 })

      goodbyeBtn.on('pointerup', () => this.goToLockedState())
    })
  }

  private spawnStars(): void {
    const { width, height } = this.scale
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(20, width - 20)
      const y = Phaser.Math.Between(20, height * 0.5)
      const r = Phaser.Math.Between(3, 7)
      const star = this.add.circle(x, y, r, 0xfff0a0).setAlpha(0)
      this.tweens.add({
        targets: star,
        alpha: 0.7 + Math.random() * 0.3,
        delay: Math.random() * 600,
        duration: AccessibilityManager.animDuration(500) || 1,
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }

  private goToLockedState(): void {
    if (this.locked) return
    this.locked = true

    const palette = PaletteManager.get()
    const { width, height } = this.scale

    // Fade to locked screen
    this.cameras.main.fadeOut(AccessibilityManager.animDuration(400) || 1, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.children.removeAll(true)
      this.cameras.main.fadeIn(AccessibilityManager.animDuration(400) || 1)

      this.add.rectangle(0, 0, width, height, palette.background).setOrigin(0, 0)

      this.add.text(width / 2, height * 0.4, '🌙', {
        fontSize: '80px',
      }).setOrigin(0.5)

      this.add.text(width / 2, height * 0.6, 'Ask a grown-up to play again', {
        fontSize: '26px', color: `#${palette.text.toString(16).padStart(6, '0')}`,
        fontFamily: 'sans-serif', align: 'center', wordWrap: { width: 320 },
      }).setOrigin(0.5)

      // Hidden unlock area for parent
      const unlockZone = this.add.rectangle(width / 2, height * 0.88, 200, 60, 0x000000, 0)
        .setInteractive()
      unlockZone.on('pointerup', async () => {
        const gate = new ParentGate(this)
        const passed = await gate.show()
        if (passed) this.scene.start('MenuScene')
      })
    })
  }
}
