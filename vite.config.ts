import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc";

const apiUrl = process.env.API_URL || 'http://localhost:3000'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiUrl, // Point to your Express server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
}})
