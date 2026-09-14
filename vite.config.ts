import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const repositoryName = process.env.VITE_REPOSITORY_NAME || 'report-studio'

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? `/${repositoryName}/` : '/'

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        scope: base,
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Report Studio',
          short_name: 'Report Studio',
          description: 'Offline-first personal report generator',
          theme_color: '#0f172a',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
          navigateFallback: `${base}index.html`.replace(/\/{2,}/g, '/'),
        },
      }),
      {
        name: 'gh-pages-spa-fallback',
        closeBundle() {
          if (mode !== 'production') {
            return
          }
          const indexPath = join('dist', 'index.html')
          const fallbackPath = join('dist', '404.html')
          copyFileSync(indexPath, fallbackPath)
        },
      },
    ],
  }
})
