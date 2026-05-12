import Phaser from 'phaser'
import { GAME_MODES } from '../data/gameModes.ts'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { SettingsManager } from '../systems/SettingsManager.ts'
import { SessionTimer } from '../systems/SessionTimer.ts'
import { UsageTracker } from '../systems/UsageTracker.ts'
import { AudioManager } from '../systems/AudioManager.ts'
import { BigButton } from '../components/BigButton.ts'
import { ParentGate } from '../systems/ParentGate.ts'

const BTN_SIZE = 120
const BTN_GAP = 24

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create(): void {
    PaletteManager.apply()
    AudioManager.setScene(this)
    AudioManager.stopAll()
    SessionTimer.stop()

    const palette = PaletteManager.get()
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, palette.background).setOrigin(0, 0)

    // Title
    this.add.text(width / 2, height * 0.12, 'Calm Games', {
      fontSize: '42px', color: `#${palette.text.toString(16).padStart(6, '0')}`,
      fontFamily: 'sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5)

    this.buildModeButtons()
    this.buildSettingsButton()
    this.scale.on('resize', this.onResize, this)
  }

  private buildModeButtons(): void {
    const { width, height } = this.scale
    const palette = PaletteManager.get()
    const isBedtime = SettingsManager.get('bedtimeMode')

    const enabledModes = GAME_MODES.filter(m => {
      const isEnabled = SettingsManager.get(m.settingsKey) as boolean
      if (!isEnabled) return false
      if (isBedtime && m.id !== 'colouring' && m.id !== 'sceneBuilder') return false
      return true
    })

    const cols = Math.min(enabledModes.length, 3)
    const totalW = cols * BTN_SIZE + (cols - 1) * BTN_GAP
    const startX = width / 2 - totalW / 2 + BTN_SIZE / 2
    const startY = height * 0.4

    enabledModes.forEach((mode, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * (BTN_SIZE + BTN_GAP)
      const y = startY + row * (BTN_SIZE + BTN_GAP)

      new BigButton(this, {
        x, y, size: BTN_SIZE,
        iconKey: mode.iconAsset,
        label: mode.label,
        bgColour: palette.primary,
        onTap: () => this.startMode(mode.id, mode.sceneKey),
      })
    })
  }

  private buildSettingsButton(): void {
    const { width, height } = this.scale
    // Small, unobtrusive settings button
    const btn = this.add.text(width - 24, height - 24, '⚙', {
      fontSize: '28px', color: '#a09080', fontFamily: 'sans-serif',
    }).setOrigin(1, 1).setInteractive()

    btn.on('pointerup', async () => {
      const gate = new ParentGate(this)
      const passed = await gate.show()
      if (passed) this.scene.start('ParentSettingsScene')
    })
  }

  private startMode(modeId: string, sceneKey: string): void {
    const duration = SettingsManager.get('sessionDuration')
    SessionTimer.start(duration)
    UsageTracker.startSession(modeId)

    SessionTimer.on('naturalPauseReady', () => this.endSession())
    SessionTimer.on('hardCeiling', () => this.endSession())

    this.scene.start(sceneKey)
  }

  private endSession(): void {
    SessionTimer.stop()
    UsageTracker.endSession()
    this.scene.start('SessionEndScene')
  }

  private onResize(): void {
    this.scene.restart()
  }

  shutdown(): void {
    this.scale.off('resize', this.onResize, this)
  }
}
