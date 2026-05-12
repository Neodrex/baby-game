import Phaser from 'phaser'
import { PaletteManager } from '../systems/PaletteManager.ts'
import { UsageTracker } from '../systems/UsageTracker.ts'
import { BigButton } from '../components/BigButton.ts'

export class ParentSummaryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ParentSummaryScene' })
  }

  create(): void {
    PaletteManager.apply()
    const palette = PaletteManager.get()
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, palette.background).setOrigin(0, 0)

    this.add.text(width / 2, 40, 'Usage', {
      fontSize: '36px', color: `#${palette.text.toString(16).padStart(6, '0')}`,
      fontFamily: 'sans-serif', fontStyle: 'bold',
    }).setOrigin(0.5)

    new BigButton(this, {
      x: 56, y: 40, size: 56,
      label: '←',
      bgColour: palette.accent,
      onTap: () => this.scene.start('ParentSettingsScene'),
    })

    const todayMins = UsageTracker.getTodayMinutes()
    const weekMins = UsageTracker.getWeekMinutes()
    const lastMins = UsageTracker.getLastSessionLength()
    const modes = UsageTracker.getModesUsed()

    const lines = [
      `Today: ${Math.round(todayMins)} min`,
      `This week: ${Math.round(weekMins)} min`,
      `Last session: ${Math.round(lastMins)} min`,
      `Modes today: ${modes.length > 0 ? modes.join(', ') : 'none'}`,
    ]

    const textColour = `#${palette.text.toString(16).padStart(6, '0')}`
    lines.forEach((line, i) => {
      this.add.text(width / 2, height * 0.3 + i * 56, line, {
        fontSize: '26px', color: textColour, fontFamily: 'sans-serif',
      }).setOrigin(0.5)
    })

    this.add.text(width / 2, height * 0.85, 'No goals, no streaks — just information.', {
      fontSize: '16px', color: '#a09080', fontFamily: 'sans-serif',
    }).setOrigin(0.5)
  }
}
