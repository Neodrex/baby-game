import type Phaser from 'phaser'
import { CalmFeedback } from './CalmFeedback.ts'

type MatchResult = 'match' | 'mismatch'
type MatchCallback = (result: MatchResult) => void

const HINT_WRONG_THRESHOLD = 2

export class DropZone {
  private zone: Phaser.GameObjects.Zone
  private radius: number
  private wrongCount = 0
  private targetObj: Phaser.GameObjects.GameObject | null = null
  private onMatchCb: MatchCallback | null = null

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number) {
    this.radius = radius
    this.zone = scene.add.zone(x, y, radius * 2, radius * 2).setInteractive()
  }

  get x(): number { return this.zone.x }
  get y(): number { return this.zone.y }

  /** Set which game object is considered the "correct" hint target for wiggle. */
  setHintTarget(obj: Phaser.GameObjects.GameObject): void {
    this.targetObj = obj
  }

  onMatch(cb: MatchCallback): this {
    this.onMatchCb = cb
    return this
  }

  /** Test whether a drop point falls within the zone radius. */
  test(dropX: number, dropY: number): boolean {
    const dx = dropX - this.zone.x
    const dy = dropY - this.zone.y
    return Math.sqrt(dx * dx + dy * dy) <= this.radius
  }

  /** Call after testing. Fires the callback and handles hint logic. */
  registerResult(matched: boolean): void {
    if (matched) {
      this.wrongCount = 0
      this.onMatchCb?.('match')
    } else {
      this.wrongCount++
      if (this.wrongCount >= HINT_WRONG_THRESHOLD && this.targetObj) {
        const obj = this.targetObj as Phaser.GameObjects.GameObject & { x: number; scene: Phaser.Scene }
        CalmFeedback.wiggle(obj)
        this.wrongCount = 0
      }
      this.onMatchCb?.('mismatch')
    }
  }

  resetWrongCount(): void {
    this.wrongCount = 0
  }

  destroy(): void {
    this.zone.destroy()
  }
}
