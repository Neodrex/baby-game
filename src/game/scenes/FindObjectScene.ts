import Phaser from 'phaser'
import { FIND_OBJECTS } from '../data/objects.ts'
import { SettingsManager } from '../systems/SettingsManager.ts'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { SessionTimer } from '../systems/SessionTimer.ts'
import { AudioManager } from '../systems/AudioManager.ts'
import { CalmFeedback } from '../components/CalmFeedback.ts'
import { BigButton } from '../components/BigButton.ts'
import { AccessibilityManager } from '../systems/AccessibilityManager.ts'

const WRONG_TAPS_BEFORE_HINT = 2

export class FindObjectScene extends Phaser.Scene {
  private targetId = ''
  private wrongTaps = 0
  private hintTimeout: ReturnType<typeof setTimeout> | null = null

  constructor() {
    super({ key: 'FindObjectScene' })
  }

  create(): void {
    PaletteManager.apply()
    AudioManager.setScene(this)

    const palette = PaletteManager.get()
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, palette.background).setOrigin(0, 0)
    this.setupBackButton()
    this.buildRound()

    this.scale.on('resize', this.onResize, this)
  }

  private setupBackButton(): void {
    const palette = PaletteManager.get()
    new BigButton(this, {
      x: 56, y: 44, size: 72,
      label: '←',
      bgColour: palette.accent,
      onTap: () => {
        if (this.hintTimeout) clearTimeout(this.hintTimeout)
        SessionTimer.signalActionComplete()
        this.scene.start('MenuScene')
      },
    })
  }

  private buildRound(): void {
    const { width, height } = this.scale
    const palette = PaletteManager.get()
    const difficulty = SettingsManager.get('difficulty')
    const count = difficulty === 'veryEasy' ? 2 : difficulty === 'easy' ? 3 : 4

    // Pick target and distractors
    const shuffled = Phaser.Utils.Array.Shuffle([...FIND_OBJECTS])
    const target = shuffled[0]
    const pool = shuffled.slice(0, count)
    Phaser.Utils.Array.Shuffle(pool)
    this.targetId = target.id
    this.wrongTaps = 0

    // Layout objects
    const spacing = width / (count + 1)
    const midY = height * 0.52

    const displayedObjects: Array<{ img: Phaser.GameObjects.Image; id: string }> = []

    pool.forEach((obj, i) => {
      const x = spacing * (i + 1)
      const img = this.add.image(x, midY, obj.asset)
        .setDisplaySize(120, 120)
        .setInteractive()

      img.on('pointerup', () => this.onObjectTapped(obj.id, img, displayedObjects))
      displayedObjects.push({ img, id: obj.id })
    })

    // Prompt area — visual thumbnail + thought bubble
    const promptBg = this.add.rectangle(width / 2, height * 0.16, 200, 90, palette.surface)
      .setStrokeStyle(3, palette.primary)

    const promptThumb = this.add.image(width / 2 - 28, height * 0.16, target.asset)
      .setDisplaySize(60, 60)

    const promptText = this.add.text(width / 2 + 28, height * 0.16, 'Find\nme!', {
      fontSize: '20px', color: `#${palette.text.toString(16).padStart(6, '0')}`,
      fontFamily: 'sans-serif', align: 'center',
    }).setOrigin(0.5)

    // Animate prompt in
    const dur = AccessibilityManager.animDuration(400)
    ;[promptBg, promptThumb, promptText].forEach(o => {
      o.setAlpha(0)
      this.tweens.add({ targets: o, alpha: 1, duration: dur || 1 })
    })

    // Narration
    AudioManager.playNarration(target.narration)
  }

  private onObjectTapped(id: string, img: Phaser.GameObjects.Image,
    all: Array<{ img: Phaser.GameObjects.Image; id: string }>): void {
    if (id === this.targetId) {
      CalmFeedback.softScale(img)
      CalmFeedback.sparkle(this, img.x, img.y)
      AudioManager.playSFX('sfx-chime')
      SessionTimer.signalActionComplete()

      // Brief pause then new round
      this.time.delayedCall(1000, () => {
        this.scene.restart()
      })
    } else {
      this.wrongTaps++
      if (this.wrongTaps >= WRONG_TAPS_BEFORE_HINT) {
        // Wiggle the correct object
        const correct = all.find(o => o.id === this.targetId)
        if (correct) {
          CalmFeedback.wiggle(correct.img as unknown as Phaser.GameObjects.GameObject & { x: number; scene: Phaser.Scene })
        }
        this.wrongTaps = 0
      }
    }
  }

  private onResize(): void {
    this.scene.restart()
  }

  shutdown(): void {
    this.scale.off('resize', this.onResize, this)
    if (this.hintTimeout) clearTimeout(this.hintTimeout)
  }
}
