import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

dotenv.config()

import aiRouter from './routes/ai.js'
import fuelRouter from './routes/fuel.js'
import routeRouter from './routes/route.js'
import communityRouter from './routes/community.js'
import stripeRouter from './routes/stripe.js'
import adminRouter from './routes/admin.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '../frontend/dist')

const app = express()
app.set('etag', false)

app.use(cors({ origin: '*' }))
app.use(express.json())

// API routes
app.use('/api/ai', aiRouter)
app.use('/api/fuel', fuelRouter)
app.use('/api/route', routeRouter)
app.use('/api/community', communityRouter)
app.use('/api/stripe', stripeRouter)
app.use('/api/admin', adminRouter)
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'Sıla Yolu AI Backend' }))

// Serve frontend static files
if (existsSync(DIST)) {
  app.use(express.static(DIST, {
    etag: false,
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html') || filePath.endsWith('sw.js')) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      } else if (filePath.includes('/assets/')) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable')
      }
    },
  }))
  // SPA fallback
  app.get('*', (_, res) => res.sendFile(join(DIST, 'index.html')))
}

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 Sıla Yolu läuft auf Port ${PORT}`))
