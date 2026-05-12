import Phaser from 'phaser'
import { SettingsManager } from './SettingsManager.ts'

class AudioManagerClass {
  private scene: Phaser.Scene | null = null
  private playing = false
  private queue: string[] = []

  setScene(scene: Phaser.Scene): void {
    this.scene = scene
    this.playing = false
    this.queue = []
  }

  private get sfxEnabled(): boolean {
    return SettingsManager.get('soundEffects')
  }

  private get narrationEnabled(): boolean {
    return SettingsManager.get('narration')
  }

  private get volume(): number {
    return SettingsManager.get('bedtimeMode') ? 0.4 : 0.8
  }

  playSFX(key: string): void {
    if (!this.sfxEnabled || !this.scene) return
    if (this.playing) {
      // drop rather than queue SFX — prevents audio pile-up
      return
    }
    try {
      const sound = this.scene.sound.add(key, { volume: this.volume })
      this.playing = true
      sound.once(Phaser.Sound.Events.COMPLETE, () => {
        this.playing = false
        this.processQueue()
      })
      sound.play()
    } catch {
      this.playing = false
    }
  }

  playNarration(text: string): void {
    if (!this.narrationEnabled) return
    if (!('speechSynthesis' in window)) return
    if (this.playing) {
      this.queue.push(text)
      return
    }
    this.speakText(text)
  }

  private speakText(text: string): void {
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.85
    utt.pitch = 1.05
    utt.volume = this.volume
    this.playing = true
    utt.onend = () => {
      this.playing = false
      this.processQueue()
    }
    utt.onerror = () => {
      this.playing = false
      this.processQueue()
    }
    window.speechSynthesis.speak(utt)
  }

  private processQueue(): void {
    if (this.queue.length === 0) return
    const next = this.queue.shift()!
    this.speakText(next)
  }

  stopAll(): void {
    this.queue = []
    this.playing = false
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }
}

export const AudioManager = new AudioManagerClass()
