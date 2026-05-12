export interface PaletteTokens {
  background: number   // Phaser hex colour int
  surface: number
  primary: number
  accent: number
  text: number
  softWarningTint: number  // palette shift applied during soft warning
  // CSS strings for non-Phaser uses
  backgroundCss: string
  surfaceCss: string
}

export const PALETTES: Record<string, PaletteTokens> = {
  standard: {
    background:      0xf5ede0,
    surface:         0xfdf6ee,
    primary:         0xf0a070,
    accent:          0x88c8a0,
    text:            0x5a4a3a,
    softWarningTint: 0xffd8a8,
    backgroundCss:   '#f5ede0',
    surfaceCss:      '#fdf6ee',
  },
  muted: {
    background:      0xe8e0d8,
    surface:         0xf0ebe3,
    primary:         0xb8906c,
    accent:          0x7aaa88,
    text:            0x504540,
    softWarningTint: 0xd8c090,
    backgroundCss:   '#e8e0d8',
    surfaceCss:      '#f0ebe3',
  },
  bedtime: {
    background:      0x1e1a30,
    surface:         0x2a2540,
    primary:         0x7060a8,
    accent:          0xf0c850,
    text:            0xddd0f0,
    softWarningTint: 0x3a3050,
    backgroundCss:   '#1e1a30',
    surfaceCss:      '#2a2540',
  },
}
