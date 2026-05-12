import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene.ts'
import { PreloadScene } from './scenes/PreloadScene.ts'
import { MenuScene } from './scenes/MenuScene.ts'
import { ParentSettingsScene } from './scenes/ParentSettingsScene.ts'
import { ParentSummaryScene } from './scenes/ParentSummaryScene.ts'
import { SessionEndScene } from './scenes/SessionEndScene.ts'
import { ColouringScene } from './scenes/ColouringScene.ts'
import { CatchScene } from './scenes/CatchScene.ts'
import { SortingScene } from './scenes/SortingScene.ts'
import { FindObjectScene } from './scenes/FindObjectScene.ts'
import { SceneBuilderScene } from './scenes/SceneBuilderScene.ts'

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#f5ede0',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
      min: { width: 320, height: 240 },
      max: { width: 1920, height: 1080 },
    },
    input: {
      touch: { capture: true },
    },
    scene: [
      BootScene,
      PreloadScene,
      MenuScene,
      ParentSettingsScene,
      ParentSummaryScene,
      SessionEndScene,
      ColouringScene,
      CatchScene,
      SortingScene,
      FindObjectScene,
      SceneBuilderScene,
    ],
  })
}
