import Phaser from 'phaser'
import { SettingsManager } from '../systems/SettingsManager.ts'
import { AccessibilityManager } from '../systems/AccessibilityManager.ts'

type DroppedCallback = (x: number, y: number) => void

export class DraggableObject extends Phaser.GameObjects.Container {
  private img: Phaser.GameObjects.Image
  private homeX: number
  private homeY: number
  private onDroppedCb: DroppedCallback | null = null
  private pickedUp = false  // for tap-to-pick mode

  constructor(scene: Phaser.Scene, x: number, y: number, key: string, scale = 1) {
    super(scene, x, y)
    scene.add.existing(this)

    this.homeX = x
    this.homeY = y

    this.img = scene.add.image(0, 0, key).setScale(scale)
    this.add(this.img)
    this.setSize(this.img.displayWidth, this.img.displayHeight)
    this.setInteractive()

    this.setupInput()
  }

  private get tapMode(): boolean {
    return SettingsManager.get('difficulty') === 'veryEasy'
  }

  private setupInput(): void {
    if (this.tapMode) {
      this.setupTapMode()
    } else {
      this.setupDragMode()
    }
  }

  private setupDragMode(): void {
    this.scene.input.setDraggable(this)

    this.on(Phaser.Input.Events.DRAG, (_: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      this.x = dragX
      this.y = dragY
    })

    this.on(Phaser.Input.Events.DRAG_END, (_: Phaser.Input.Pointer) => {
      this.onDroppedCb?.(this.x, this.y)
    })
  }

  private setupTapMode(): void {
    this.on(Phaser.Input.Events.POINTER_UP, () => {
      if (!this.pickedUp) {
        this.pickedUp = true
        this.img.setTint(0xddddff)
        // Next tap anywhere fires the drop at the pointer location
        this.scene.input.once('pointerup', (ptr: Phaser.Input.Pointer) => {
          if (!this.pickedUp) return
          this.pickedUp = false
          this.img.clearTint()
          this.onDroppedCb?.(ptr.worldX, ptr.worldY)
        })
      }
    })
  }

  onDropped(cb: DroppedCallback): this {
    this.onDroppedCb = cb
    return this
  }

  returnToOrigin(): void {
    const dur = AccessibilityManager.animDuration(300)
    this.img.clearTint()
    this.pickedUp = false
    if (dur === 0) {
      this.x = this.homeX
      this.y = this.homeY
      return
    }
    this.scene.tweens.add({
      targets: this,
      x: this.homeX, y: this.homeY,
      duration: dur, ease: 'Sine.easeOut',
    })
  }

  updateOrigin(x: number, y: number): void {
    this.homeX = x
    this.homeY = y
  }
}
