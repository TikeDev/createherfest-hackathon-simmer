import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import type { Plugin } from 'vite'

// Local dev middleware that mirrors api/fetch-recipe.ts for testing URL import without Vercel
const devFetchProxy: Plugin = {
  name: 'dev-fetch-proxy',
  configureServer(server) {
    server.middlewares.use('/api/fetch-recipe', async (req, res) => {
      const rawUrl = new URL(req.url ?? '', 'http://localhost').searchParams.get('url')
      if (!rawUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Missing url param' }))
        return
      }
      try {
        const upstream = await fetch(rawUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RecipeStreamliner-dev/1.0)',
            Accept: 'text/html,application/xhtml+xml',
          },
        })
        const html = await upstream.text()
        res.writeHead(upstream.status, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(html)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: message }))
      }
    })
  },
}

export default defineConfig({
  plugins: [
    react(),
    devFetchProxy,
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Recipe Streamliner',
        short_name: 'Recipes',
        description: 'Accessible recipe recommendations for your current abilities',
        theme_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
