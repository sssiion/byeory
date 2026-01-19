import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/freepik-api': {
        target: 'https://api.freepik.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/freepik-api/, ''),
      },
    },
  },
})
