import Phaser from 'phaser'
import { PaletteManager } from '../systems/PaletteManager.ts'

const BASE = import.meta.env.BASE_URL

// All SVG and audio assets declared in one place for easy addition
const SVG_ASSETS: [string, string][] = [
  // Menu icons
  ['icon-colouring', 'svg/icon-colouring.svg'],
  ['icon-catch',     'svg/icon-catch.svg'],
  ['icon-sorting',   'svg/icon-sorting.svg'],
  ['icon-find',      'svg/icon-find.svg'],
  ['icon-scene',     'svg/icon-scene.svg'],

  // Colouring outlines
  ['col-balloon', 'svg/col-balloon.svg'],
  ['col-duck',    'svg/col-duck.svg'],
  ['col-house',   'svg/col-house.svg'],
  ['col-flower',  'svg/col-flower.svg'],

  // Catch items
  ['catch-leaf',    'svg/catch-leaf.svg'],
  ['catch-bubble',  'svg/catch-bubble.svg'],
  ['catch-star',    'svg/catch-star.svg'],
  ['catch-balloon', 'svg/catch-balloon.svg'],
  ['catch-feather', 'svg/catch-feather.svg'],

  // Catch basket
  ['catch-basket', 'svg/catch-basket.svg'],

  // Sort items & baskets
  ['sort-red-circle',    'svg/sort-red-circle.svg'],
  ['sort-red-square',    'svg/sort-red-square.svg'],
  ['sort-blue-circle',   'svg/sort-blue-circle.svg'],
  ['sort-blue-square',   'svg/sort-blue-square.svg'],
  ['sort-yellow-circle', 'svg/sort-yellow-circle.svg'],
  ['sort-yellow-square', 'svg/sort-yellow-square.svg'],
  ['basket-red',    'svg/basket-red.svg'],
  ['basket-blue',   'svg/basket-blue.svg'],
  ['basket-yellow', 'svg/basket-yellow.svg'],

  // Find objects
  ['find-duck',  'svg/find-duck.svg'],
  ['find-ball',  'svg/find-ball.svg'],
  ['find-cat',   'svg/find-cat.svg'],
  ['find-car',   'svg/find-car.svg'],
  ['find-apple', 'svg/find-apple.svg'],
  ['find-teddy', 'svg/find-teddy.svg'],

  // Scene builder stickers
  ['sticker-cloud',  'svg/sticker-cloud.svg'],
  ['sticker-sun',    'svg/sticker-sun.svg'],
  ['sticker-tree',   'svg/sticker-tree.svg'],
  ['sticker-flower', 'svg/sticker-flower.svg'],
  ['sticker-bird',   'svg/sticker-bird.svg'],
  ['sticker-moon',   'svg/sticker-moon.svg'],
  ['sticker-star',   'svg/sticker-star.svg'],
  ['sticker-fish',   'svg/sticker-fish.svg'],

  // Session end
  ['end-moon',  'svg/end-moon.svg'],
  ['end-stars', 'svg/end-stars.svg'],
]

const AUDIO_ASSETS: [string, string][] = [
  ['sfx-chime', 'audio/chime.mp3'],
  ['sfx-tap',   'audio/tap.mp3'],
  ['sfx-pop',   'audio/pop.mp3'],
]

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload(): void {
    const palette = PaletteManager.get()
    this.cameras.main.setBackgroundColor(palette.background)

    for (const [key, path] of SVG_ASSETS) {
      this.load.svg(key, `${BASE}assets/${path}`, { width: 256, height: 256 })
    }
    for (const [key, path] of AUDIO_ASSETS) {
      this.load.audio(key, `${BASE}assets/${path}`)
    }
  }

  create(): void {
    this.scene.start('MenuScene')
  }
}
