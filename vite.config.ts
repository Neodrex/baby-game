import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/calm-games/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // served from public/manifest.webmanifest
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,mp3,ogg,wav,webmanifest}'],
        runtimeCaching: [],
      },
    }),
  ],
  build: {
    target: 'es2020',
  },
})
