import Phaser from 'phaser'
import { COLOURING_SHAPES } from '../data/objects.ts'
import { SettingsManager } from '../systems/SettingsManager.ts'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { SessionTimer } from '../systems/SessionTimer.ts'
import { AccessibilityManager } from '../systems/AccessibilityManager.ts'
import { AudioManager } from '../systems/AudioManager.ts'
import { BigButton } from '../components/BigButton.ts'
// Colour palette offered to the child
const CHILD_COLOURS: number[] = [
  0xe05050, // red
  0x50a0e0, // blue
  0x60b860, // green
  0xf0c030, // yellow
  0xe070c0, // pink
  0xa060e0, // purple
]

export class ColouringScene extends Phaser.Scene {
  private currentColour = CHILD_COLOURS[0]
  private colourLayer!: Phaser.GameObjects.Graphics
  private scribbleLayer!: Phaser.GameObjects.Graphics
  private undoStack: ImageData[] = []
  private shapeImg!: Phaser.GameObjects.Image
  private shapeIndex = 0
  private isDrawing = false

  constructor() {
    super({ key: 'ColouringScene' })
  }

  create(): void {
    PaletteManager.apply()
    AudioManager.setScene(this)

    const palette = PaletteManager.get()
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, palette.background).setOrigin(0, 0)
    this.setupBackButton()

    // Pick a random shape for this session
    this.shapeIndex = Phaser.Math.Between(0, COLOURING_SHAPES.length - 1)
    const shape = COLOURING_SHAPES[this.shapeIndex]

    // Drawing layers beneath the outline
    this.colourLayer = this.add.graphics()
    this.scribbleLayer = this.add.graphics()

    // Outline image on top
    this.shapeImg = this.add.image(width / 2, height / 2, shape.asset)
      .setScale(Math.min(width, height) * 0.65 / 256)

    // Tap-to-fill: treat whole shape area as a region (simplified flood-fill via tint regions)
    this.setupTapToFill()
    this.setupFreeScribble()
    this.buildColourPalette()
    this.buildUndoReset()

    AudioManager.playNarration(`Let's colour the ${shape.label}`)

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

  private setupTapToFill(): void {
    // Simplified: tap on the outline image → flood-fill the entire shape with a tint effect
    this.shapeImg.setInteractive()
    this.shapeImg.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      this.saveUndoState()
      // Draw a filled circle at tap point to simulate partial fill
      this.colourLayer.fillStyle(this.currentColour, 0.85)
      this.colourLayer.fillCircle(ptr.worldX, ptr.worldY, 28)
      AudioManager.playSFX('sfx-tap')
      SessionTimer.signalActionComplete()
    })
  }

  private setupFreeScribble(): void {
    // Pointer drag → scribble in current colour
    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (!ptr.isDown) { this.isDrawing = false; return }
      if (!this.isDrawing) {
        this.scribbleLayer.lineStyle(18, this.currentColour, 0.7)
        this.scribbleLayer.beginPath()
        this.scribbleLayer.moveTo(ptr.worldX, ptr.worldY)
        this.isDrawing = true
      } else {
        this.scribbleLayer.lineTo(ptr.worldX, ptr.worldY)
        this.scribbleLayer.strokePath()
        this.scribbleLayer.beginPath()
        this.scribbleLayer.moveTo(ptr.worldX, ptr.worldY)
      }
    })

    this.input.on('pointerup', () => {
      if (this.isDrawing) {
        this.scribbleLayer.strokePath()
        this.isDrawing = false
        SessionTimer.signalActionComplete()
      }
    })
  }

  private buildColourPalette(): void {
    const { width, height } = this.scale
    const palette = PaletteManager.get()
    const difficulty = SettingsManager.get('difficulty')
    const count = difficulty === 'normal' ? 6 : 4
    const colours = CHILD_COLOURS.slice(0, count)
    const btnSize = 56
    const gap = 12
    const totalW = count * btnSize + (count - 1) * gap
    const startX = width / 2 - totalW / 2 + btnSize / 2
    const y = height - 56

    colours.forEach((colour, i) => {
      const x = startX + i * (btnSize + gap)
      const circle = this.add.circle(x, y, btnSize / 2, colour)
        .setStrokeStyle(3, palette.surface)
        .setInteractive()

      circle.on('pointerup', () => {
        this.currentColour = colour
        // Visual feedback: scale up selected colour briefly
        this.tweens.add({
          targets: circle,
          scale: 1.3,
          duration: AccessibilityManager.animDuration(120),
          yoyo: true, ease: 'Sine.easeOut',
        })
      })
    })
  }

  private buildUndoReset(): void {
    const palette = PaletteManager.get()
    const { height } = this.scale

    new BigButton(this, {
      x: 56, y: height - 56, size: 72,
      label: 'Undo',
      bgColour: palette.primary,
      onTap: () => this.undo(),
    })

    new BigButton(this, {
      x: this.scale.width - 56, y: height - 56, size: 72,
      label: 'Clear',
      bgColour: palette.primary,
      onTap: () => this.reset(),
    })
  }

  private saveUndoState(): void {
    // Store current graphics state as snapshot key (simplified: track fill commands)
    this.undoStack.push({} as ImageData)  // placeholder — real impl would use renderTexture
    if (this.undoStack.length > 10) this.undoStack.shift()
  }

  private undo(): void {
    if (this.undoStack.length === 0) return
    this.undoStack.pop()
    // Re-draw: clear and replay (simplified version — clears scribble only if stack empty)
    if (this.undoStack.length === 0) {
      this.colourLayer.clear()
      this.scribbleLayer.clear()
    }
  }

  private reset(): void {
    this.colourLayer.clear()
    this.scribbleLayer.clear()
    this.undoStack = []
  }

  private onResize(): void {
    this.scene.restart()
  }

  shutdown(): void {
    this.scale.off('resize', this.onResize, this)
  }
}
