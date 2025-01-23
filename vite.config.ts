import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
const apiUrl = 'http://localhost:3000' // process.env.API_URL || 'http://debian.ten-velde.com:3005'

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
      theme_color: '#e0d4ac',
      background_color: '#e0d4ac',
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
        {
          src: 'maskable_icon_x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'maskable_icon_x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'maskable_icon_x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'maskable_icon_x384.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'maskable_icon_x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'maskable_icon_x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'maskable_icon_x48.png',
          sizes: '48x48',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'maskable_icon.png',
          sizes: 'any',
          type: 'image/png',
          purpose: 'maskable',
        },
]

      ,
      "share_target": {
        "action": "/scraper",
        "method": "GET",
        "enctype": "application/x-www-form-urlencoded",
        "params": {
          "text": "url"
        }
      }
    },
  }),
  ],
  server: {
    proxy: {
      '/api': {
        target: apiUrl, // Your backend API URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          // Log the request being forwarded
          proxy.on('proxyReq', (_proxyReq, req) => {
            // eslint-disable-next-line no-console
            console.log(`Proxying request to: ${req.url}`);
          });

          // Set cache-control for specific requests
          proxy.on('proxyRes', (_proxyRes, req, res) => {
            if (req?.url?.includes('/api/calendar/ical')) {
              // eslint-disable-next-line no-console
              console.log(`No cache for: ${req.url}`);
              res.setHeader('Cache-Control', 'no-store');
              res.setHeader('Pragma', 'no-cache');
              res.setHeader('Expires', '0');
            }
          });
        },
      },
      '/ical': {
        target: apiUrl, // Proxy /ical requests to the same backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ical/, '/calendar/ical'), // Map /ical to the backend route
      },
    },
  }
})
