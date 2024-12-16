import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';

const apiUrl = process.env.API_URL || 'http://localhost:3000'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    VitePWA({
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png', 'favicon-16x16.png', 'favicon-32x32.png'],
      registerType: 'autoUpdate', // Automatically update the service worker
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg}'], // Cache these file types
      },
      manifest: {
        name: 'Recepten',
        short_name: 'Recepten',
        description: 'Een app voor het bijhouden van recepten',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: apiUrl, // Point to your Express server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
}})
