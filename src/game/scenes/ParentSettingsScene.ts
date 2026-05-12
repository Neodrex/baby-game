import Phaser from 'phaser'
import { SettingsManager } from '../systems/SettingsManager.ts'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { UsageTracker } from '../systems/UsageTracker.ts'
import { BigButton } from '../components/BigButton.ts'
import type { Difficulty, Palette, SessionDuration } from '../data/settings.ts'

export class ParentSettingsScene extends Phaser.Scene {
  private scrollY = 0
  private contentContainer!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'ParentSettingsScene' })
  }

  create(): void {
    PaletteManager.apply()
    const palette = PaletteManager.get()
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, palette.background).setOrigin(0, 0)

    // Header
    this.add.text(width / 2, 36, 'Settings', {
      fontSize: '36px', color: `#${palette.text.toString(16).padStart(6, '0')}`,
      fontFamily: 'sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5)

    // Back button
    new BigButton(this, {
      x: 56, y: 36, size: 56,
      label: '←',
      bgColour: palette.accent,
      onTap: () => this.scene.start('MenuScene'),
    })

    // Summary link
    const summaryBtn = this.add.text(width - 20, 36, 'Usage ›', {
      fontSize: '22px', color: `#${palette.primary.toString(16).padStart(6, '0')}`,
      fontFamily: 'sans-serif',
    }).setOrigin(1, 0.5).setInteractive()
    summaryBtn.on('pointerup', () => this.scene.start('ParentSummaryScene'))

    this.contentContainer = this.add.container(0, 80)
    this.buildSettings()

    // Scroll input
    this.input.on('wheel', (_: Phaser.Input.Pointer, __: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      this.scrollY = Math.max(0, this.scrollY + dy)
      this.contentContainer.y = 80 - this.scrollY
    })
  }

  private buildSettings(): void {
    const s = SettingsManager.getAll()
    const palette = PaletteManager.get()
    const { width } = this.scale
    let y = 0
    const col1 = 24
    const labelX = col1 + 16
    const valX = width - 200

    const row = (label: string, control: Phaser.GameObjects.GameObject): void => {
      const text = this.add.text(labelX, y + 20, label, {
        fontSize: '22px', color: `#${palette.text.toString(16).padStart(6, '0')}`,
        fontFamily: 'sans-serif',
      })
      this.contentContainer.add([text, control as Phaser.GameObjects.GameObject])
      y += 64
    }

    const toggle = (key: Parameters<typeof SettingsManager.set>[0], label: string): void => {
      const isOn = SettingsManager.get(key) as boolean
      const btn = this.add.text(valX, y + 20, isOn ? 'ON' : 'OFF', {
        fontSize: '22px', color: isOn ? '#60b060' : '#b06060',
        fontFamily: 'sans-serif', fontStyle: 'bold',
      }).setOrigin(0, 0.5).setInteractive()
      btn.on('pointerup', () => {
        const current = SettingsManager.get(key) as boolean
        SettingsManager.set(key, !current as never)
        btn.setText(!current ? 'ON' : 'OFF')
        btn.setColor(!current ? '#60b060' : '#b06060')
      })
      row(label, btn)
    }

    // --- Modes ---
    this.sectionHeader('Modes', y); y += 40
    toggle('colouringEnabled', 'Colouring')
    toggle('catchEnabled', 'Catch')
    toggle('sortingEnabled', 'Sort')
    toggle('findEnabled', 'Find')
    toggle('sceneBuilderEnabled', 'Scene Builder')

    // --- Session ---
    this.sectionHeader('Session', y); y += 40
    const durations: SessionDuration[] = [5, 10, 15, 20]
    const durBtn = this.add.text(valX, y + 20,
      `${s.sessionDuration} min`, {
        fontSize: '22px', color: `#${palette.primary.toString(16).padStart(6, '0')}`,
        fontFamily: 'sans-serif',
      }).setOrigin(0, 0.5).setInteractive()
    durBtn.on('pointerup', () => {
      const cur = SettingsManager.get('sessionDuration')
      const idx = durations.indexOf(cur)
      const next = durations[(idx + 1) % durations.length]
      SettingsManager.set('sessionDuration', next)
      durBtn.setText(`${next} min`)
    })
    row('Session length', durBtn)
    toggle('softWarning', 'Soft warning')

    // --- Audio ---
    this.sectionHeader('Audio', y); y += 40
    toggle('soundEffects', 'Sound effects')
    toggle('narration', 'Narration')
    toggle('backgroundMusic', 'Background music')

    // --- Difficulty ---
    this.sectionHeader('Difficulty', y); y += 40
    const difficulties: Difficulty[] = ['veryEasy', 'easy', 'normal']
    const diffLabels: Record<Difficulty, string> = { veryEasy: 'Very Easy', easy: 'Easy', normal: 'Normal' }
    const diffBtn = this.add.text(valX, y + 20, diffLabels[s.difficulty], {
      fontSize: '22px', color: `#${palette.primary.toString(16).padStart(6, '0')}`,
      fontFamily: 'sans-serif',
    }).setOrigin(0, 0.5).setInteractive()
    diffBtn.on('pointerup', () => {
      const cur = SettingsManager.get('difficulty')
      const idx = difficulties.indexOf(cur)
      const next = difficulties[(idx + 1) % difficulties.length]
      SettingsManager.set('difficulty', next)
      diffBtn.setText(diffLabels[next])
    })
    row('Difficulty', diffBtn)

    // --- Visual ---
    this.sectionHeader('Visual', y); y += 40
    const palettes: Palette[] = ['standard', 'muted', 'bedtime']
    const palBtn = this.add.text(valX, y + 20,
      s.palette.charAt(0).toUpperCase() + s.palette.slice(1), {
        fontSize: '22px', color: `#${palette.primary.toString(16).padStart(6, '0')}`,
        fontFamily: 'sans-serif',
      }).setOrigin(0, 0.5).setInteractive()
    palBtn.on('pointerup', () => {
      const cur = SettingsManager.get('palette')
      const idx = palettes.indexOf(cur)
      const next = palettes[(idx + 1) % palettes.length]
      SettingsManager.set('palette', next)
      palBtn.setText(next.charAt(0).toUpperCase() + next.slice(1))
    })
    row('Colour palette', palBtn)
    toggle('bedtimeMode', 'Bedtime mode')
    toggle('reducedMotion', 'Reduced motion')

    // --- Device ---
    this.sectionHeader('Device', y); y += 40
    toggle('fullscreen', 'Fullscreen')

    // --- Reset ---
    y += 20
    const resetBtn = this.add.text(width / 2, y + 20, 'Reset all data', {
      fontSize: '20px', color: '#e05050', fontFamily: 'sans-serif',
    }).setOrigin(0.5).setInteractive()
    resetBtn.on('pointerup', () => {
      SettingsManager.reset()
      UsageTracker.resetAll()
      this.scene.restart()
    })
    this.contentContainer.add(resetBtn)
  }

  private sectionHeader(title: string, y: number): void {
    const palette = PaletteManager.get()
    const text = this.add.text(24, y + 4, title.toUpperCase(), {
      fontSize: '14px', color: `#${palette.accent.toString(16).padStart(6, '0')}`,
      fontFamily: 'sans-serif', fontStyle: 'bold', letterSpacing: 2,
    })
    this.contentContainer.add(text)
  }
}
