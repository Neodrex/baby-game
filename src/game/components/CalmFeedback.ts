import type Phaser from 'phaser'
import { AccessibilityManager } from '../systems/AccessibilityManager.ts'

export class CalmFeedback {
  static bounce(obj: Phaser.GameObjects.GameObject & { y: number; scene: Phaser.Scene }): void {
    const dur = AccessibilityManager.animDuration(200)
    if (dur === 0) return
    obj.scene.tweens.add({
      targets: obj,
      y: obj.y - 18,
      duration: dur, ease: 'Sine.easeOut',
      yoyo: true,
    })
  }

  static wiggle(obj: Phaser.GameObjects.GameObject & { x: number; scene: Phaser.Scene }): void {
    const dur = AccessibilityManager.animDuration(80)
    if (dur === 0) return
    const startX = obj.x
    obj.scene.tweens.add({
      targets: obj,
      x: { from: startX - 8, to: startX + 8 },
      duration: dur, ease: 'Sine.easeInOut',
      yoyo: true, repeat: 2,
      onComplete: () => { obj.x = startX },
    })
  }

  static softScale(obj: Phaser.GameObjects.GameObject, scale = 1): void {
    const dur = AccessibilityManager.animDuration(180)
    if (dur === 0) return
    const scene = (obj as Phaser.GameObjects.GameObject & { scene: Phaser.Scene }).scene
    scene.tweens.add({
      targets: obj,
      scaleX: scale * 1.15, scaleY: scale * 1.15,
      duration: dur, ease: 'Sine.easeOut',
      yoyo: true,
    })
  }

  static sparkle(scene: Phaser.Scene, x: number, y: number): void {
    const dur = AccessibilityManager.animDuration(500)
    if (dur === 0) return

    const COLOURS = [0xffd700, 0xffa0c8, 0xa0d8ff, 0xc8ffa0]
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const dist = 40 + Math.random() * 20
      const tx = x + Math.cos(angle) * dist
      const ty = y + Math.sin(angle) * dist
      const colour = COLOURS[i % COLOURS.length]

      const dot = scene.add.circle(x, y, 6, colour).setAlpha(1)
      scene.tweens.add({
        targets: dot,
        x: tx, y: ty,
        alpha: 0, scale: 0.2,
        duration: dur, ease: 'Cubic.easeOut',
        onComplete: () => dot.destroy(),
      })
    }
  }
}
