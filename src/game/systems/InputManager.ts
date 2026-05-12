import Phaser from 'phaser'

// Minimum ms between repeated tap callbacks on the same object (prevents rapid-fire mis-triggers)
const TAP_DEBOUNCE_MS = 80

export class InputManager {
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /** Register a tap/click callback on any interactive GameObject. */
  onTap(obj: Phaser.GameObjects.GameObject, callback: () => void): void {
    obj.setInteractive({ useHandCursor: false })
    let lastTap = 0
    obj.on(Phaser.Input.Events.POINTER_UP, () => {
      const now = Date.now()
      if (now - lastTap < TAP_DEBOUNCE_MS) return
      lastTap = now
      callback()
    })
  }

  /** Enable drag on a GameObject using Phaser's built-in drag system. */
  enableDrag(obj: Phaser.GameObjects.GameObject): void {
    obj.setInteractive({ useHandCursor: false, draggable: true })
    this.scene.input.setDraggable(obj)
  }

  /** Make an entire rectangular area tappable. Returns the zone. */
  createTapZone(
    x: number, y: number, w: number, h: number,
    callback: () => void
  ): Phaser.GameObjects.Zone {
    const zone = this.scene.add.zone(x, y, w, h).setInteractive()
    let lastTap = 0
    zone.on(Phaser.Input.Events.POINTER_UP, () => {
      const now = Date.now()
      if (now - lastTap < TAP_DEBOUNCE_MS) return
      lastTap = now
      callback()
    })
    return zone
  }
}
