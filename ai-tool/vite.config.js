import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The browser only ever calls its own origin; Vite forwards /api to Express.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
