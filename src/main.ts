import { createGame } from './game/GameShell.ts'
import { SettingsManager } from './game/systems/SettingsManager.ts'

const app = document.getElementById('app')!
const game = createGame(app)

SettingsManager.onChange(settings => {
  if (settings.fullscreen && !document.fullscreenElement) {
    game.scale.startFullscreen()
  } else if (!settings.fullscreen && document.fullscreenElement) {
    game.scale.stopFullscreen()
  }
})
