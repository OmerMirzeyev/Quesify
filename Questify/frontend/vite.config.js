import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Lets the app call relative '/api/...' paths in dev without hitting CORS at all — not
    // required by utils/api.js (which already targets the absolute backend origin directly),
    // but kept available as a same-origin fallback path.
    proxy: {
      '/api': {
        target: 'http://localhost:5271',
        changeOrigin: true,
      },
    },
  },
})
