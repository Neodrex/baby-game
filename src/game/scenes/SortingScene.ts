import Phaser from 'phaser'
import { SORT_CATEGORIES, SORT_ITEMS } from '../data/objects.ts'
import { SettingsManager } from '../systems/SettingsManager.ts'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { SessionTimer } from '../systems/SessionTimer.ts'
import { AudioManager } from '../systems/AudioManager.ts'
import { CalmFeedback } from '../components/CalmFeedback.ts'
import { DraggableObject } from '../components/DraggableObject.ts'
import { DropZone } from '../components/DropZone.ts'
import { BigButton } from '../components/BigButton.ts'

const ZONE_RADIUS = 80

const HINT_AFTER_WRONGS = 2

export class SortingScene extends Phaser.Scene {
  private dropZones: Array<{ zone: DropZone; catId: string; visual: Phaser.GameObjects.Image }> = []
  private items: DraggableObject[] = []
  private placedCount = 0
  private wrongAttempts = new Map<DraggableObject, number>()

  constructor() {
    super({ key: 'SortingScene' })
  }

  create(): void {
    PaletteManager.apply()
    AudioManager.setScene(this)

    const palette = PaletteManager.get()
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, palette.background).setOrigin(0, 0)
    this.setupBackButton()

    const difficulty = SettingsManager.get('difficulty')
    const catCount = difficulty === 'normal' ? 3 : 2
    const categories = SORT_CATEGORIES.slice(0, catCount)

    this.buildDropZones(categories)
    this.buildItems(categories)

    AudioManager.playNarration('Sort the shapes into the right baskets')

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

  private buildDropZones(categories: typeof SORT_CATEGORIES): void {
    const { width, height } = this.scale
    const count = categories.length
    const spacing = width / (count + 1)

    categories.forEach((cat, i) => {
      const x = spacing * (i + 1)
      const y = height * 0.8

      // Visual basket
      const visual = this.add.image(x, y, cat.asset).setDisplaySize(110, 110)

      const zone = new DropZone(this, x, y, ZONE_RADIUS)
      this.dropZones.push({ zone, catId: cat.id, visual })
    })
  }

  private buildItems(categories: typeof SORT_CATEGORIES): void {
    const { width, height } = this.scale

    // Pick 2 items per category
    const items = categories.flatMap(cat =>
      SORT_ITEMS.filter(it => it.categoryId === cat.id).slice(0, 2)
    )

    const cols = Math.min(items.length, 3)
    const spacing = width / (cols + 1)

    items.forEach((item, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = spacing * (col + 1)
      const y = height * 0.3 + row * 100

      const draggable = new DraggableObject(this, x, y, item.asset, 0.4)
        .onDropped((dropX, dropY) => this.onItemDropped(draggable, item.categoryId, dropX, dropY))

      this.items.push(draggable)
    })
  }

  private onItemDropped(obj: DraggableObject, correctCatId: string, dropX: number, dropY: number): void {
    for (const { zone, catId } of this.dropZones) {
      if (zone.test(dropX, dropY)) {
        if (catId === correctCatId) {
          this.wrongAttempts.delete(obj)
          this.tweens.add({
            targets: obj,
            x: zone.x, y: zone.y,
            duration: 200, ease: 'Sine.easeOut',
          })
          obj.updateOrigin(zone.x, zone.y)
          CalmFeedback.bounce(obj as unknown as Phaser.GameObjects.GameObject & { y: number; scene: Phaser.Scene })
          AudioManager.playSFX('sfx-chime')
          this.placedCount++
          SessionTimer.signalActionComplete()
        } else {
          obj.returnToOrigin()
          const count = (this.wrongAttempts.get(obj) ?? 0) + 1
          this.wrongAttempts.set(obj, count)
          if (count >= HINT_AFTER_WRONGS) {
            // Wiggle the CORRECT basket, not the wrong one
            const correct = this.dropZones.find(dz => dz.catId === correctCatId)
            if (correct) {
              CalmFeedback.wiggle(correct.visual as unknown as Phaser.GameObjects.GameObject & { x: number; scene: Phaser.Scene })
            }
            this.wrongAttempts.set(obj, 0)
          }
        }
        return
      }
    }

    obj.returnToOrigin()
  }

  private onResize(): void {
    this.scene.restart()
  }

  shutdown(): void {
    this.scale.off('resize', this.onResize, this)
  }
}
