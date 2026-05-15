import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Injects build timestamp into sw.js so every deploy invalidates the SW cache
function swVersionPlugin() {
  return {
    name: 'sw-version',
    closeBundle() {
      const swPath = path.resolve(__dirname, 'dist/sw.js')
      if (!fs.existsSync(swPath)) return
      const ts = Date.now()
      let src = fs.readFileSync(swPath, 'utf8')
      src = src.replace(/sila-assets-v\d+/, `sila-assets-v${ts}`)
      fs.writeFileSync(swPath, src)
    },
  }
}

export default defineConfig({
  plugins: [react(), swVersionPlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { proxy: { '/api': 'http://localhost:3000' } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
        },
      },
    },
  },
})
