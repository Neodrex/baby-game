export interface GameModeDefinition {
  id: string
  sceneKey: string
  iconAsset: string
  label: string
  enabledByDefault: boolean
  settingsKey: keyof import('./settings.ts').Settings
}

export const GAME_MODES: GameModeDefinition[] = [
  {
    id: 'colouring',
    sceneKey: 'ColouringScene',
    iconAsset: 'icon-colouring',
    label: 'Colouring',
    enabledByDefault: true,
    settingsKey: 'colouringEnabled',
  },
  {
    id: 'catch',
    sceneKey: 'CatchScene',
    iconAsset: 'icon-catch',
    label: 'Catch',
    enabledByDefault: true,
    settingsKey: 'catchEnabled',
  },
  {
    id: 'sorting',
    sceneKey: 'SortingScene',
    iconAsset: 'icon-sorting',
    label: 'Sort',
    enabledByDefault: true,
    settingsKey: 'sortingEnabled',
  },
  {
    id: 'find',
    sceneKey: 'FindObjectScene',
    iconAsset: 'icon-find',
    label: 'Find',
    enabledByDefault: true,
    settingsKey: 'findEnabled',
  },
  {
    id: 'sceneBuilder',
    sceneKey: 'SceneBuilderScene',
    iconAsset: 'icon-scene',
    label: 'Build',
    enabledByDefault: true,
    settingsKey: 'sceneBuilderEnabled',
  },
]
