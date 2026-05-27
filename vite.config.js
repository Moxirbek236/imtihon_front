import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mui/icons-material'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://seven-oy-crm-backned.onrender.com',
        // target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/file': {
        target: 'https://seven-oy-crm-backned.onrender.com',
        // target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})

