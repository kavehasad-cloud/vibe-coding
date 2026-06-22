import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // `vercel dev` runs this dev server and tells it which port to use via
    // $PORT; bind to it so Vercel's proxy can reach the frontend. Falls back
    // to Vite's default when run on its own (`npm run dev`).
    port: Number(process.env.PORT) || 5173,
    strictPort: Boolean(process.env.PORT),
    // For plain `npm run dev` (no vercel dev), forward /api calls to the
    // deployed serverless function so the frontend works locally without
    // running `vercel dev`. Under `vercel dev` this proxy is never hit —
    // vercel dev intercepts /api and runs the local function instead.
    proxy: {
      '/api': {
        target: 'https://ai-tool-gamma-cyan.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
