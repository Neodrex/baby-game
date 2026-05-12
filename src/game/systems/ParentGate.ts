import type Phaser from 'phaser'
import { PaletteManager } from './PaletteManager.ts'

interface Question {
  a: number
  b: number
  answer: number
}

function generateQuestion(): Question {
  // Result in range 2–9 using single-digit operands
  const answer = 2 + Math.floor(Math.random() * 8)
  const a = 1 + Math.floor(Math.random() * (answer - 1))
  const b = answer - a
  return { a, b, answer }
}

export class ParentGate {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container | null = null
  private resolve: ((passed: boolean) => void) | null = null

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /** Shows the arithmetic gate overlay. Resolves true if passed, false if cancelled. */
  show(): Promise<boolean> {
    return new Promise(resolve => {
      this.resolve = resolve
      this.render()
    })
  }

  private render(): void {
    const scene = this.scene
    const { width, height } = scene.scale
    const palette = PaletteManager.get()
    const q = generateQuestion()

    const bg = scene.add.rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setInteractive() // block input to game behind

    const panel = scene.add.rectangle(width / 2, height / 2, 480, 340, palette.surface)
      .setStrokeStyle(3, palette.primary)

    const prompt = scene.add.text(width / 2, height / 2 - 110,
      `Grown-ups only!\nTap the answer to:\n${q.a} + ${q.b} = ?`,
      {
        fontSize: '28px', color: '#5a4a3a', align: 'center',
        fontFamily: 'sans-serif', lineSpacing: 8,
      }
    ).setOrigin(0.5)

    // Generate 4 answer choices (one correct, three wrong)
    const choices = this.makeChoices(q.answer)
    const btnY = height / 2 + 60
    const btnSpacing = 100
    const startX = width / 2 - btnSpacing * 1.5

    const buttons = choices.map((val, i) => {
      const x = startX + i * btnSpacing
      const btnBg = scene.add.rectangle(x, btnY, 80, 80, palette.primary, 1)
        .setStrokeStyle(2, palette.accent)
        .setInteractive()

      const btnText = scene.add.text(x, btnY, String(val), {
        fontSize: '32px', color: '#ffffff', fontFamily: 'sans-serif',
      }).setOrigin(0.5)

      btnBg.on('pointerup', () => {
        if (val === q.answer) {
          this.dismiss()
          this.resolve?.(true)
        } else {
          // Wrong — shake the button gently
          scene.tweens.add({
            targets: [btnBg, btnText],
            x: { from: x - 6, to: x },
            duration: 120, ease: 'Sine.easeInOut', yoyo: true, repeat: 2,
          })
        }
      })

      return [btnBg, btnText]
    }).flat()

    const cancelText = scene.add.text(width / 2, height / 2 + 140,
      'Cancel',
      { fontSize: '20px', color: '#a09080', fontFamily: 'sans-serif' }
    ).setOrigin(0.5).setInteractive()

    cancelText.on('pointerup', () => {
      this.dismiss()
      this.resolve?.(false)
    })

    this.container = scene.add.container(0, 0, [bg, panel, prompt, ...buttons, cancelText])
    this.container.setDepth(100)
  }

  private makeChoices(correct: number): number[] {
    const wrong = new Set<number>()
    while (wrong.size < 3) {
      const v = 1 + Math.floor(Math.random() * 9)
      if (v !== correct) wrong.add(v)
    }
    const choices = [correct, ...wrong]
    // shuffle
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]]
    }
    return choices
  }

  private dismiss(): void {
    this.container?.destroy()
    this.container = null
  }
}
