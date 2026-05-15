import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import aiRouter from './routes/ai.js'
import fuelRouter from './routes/fuel.js'
import routeRouter from './routes/route.js'
import communityRouter from './routes/community.js'
import stripeRouter from './routes/stripe.js'
import adminRouter from './routes/admin.js'

const app = express()
app.set('etag', false)

app.use(cors({ origin: '*' }))
app.use(express.json())

app.use('/api/ai', aiRouter)
app.use('/api/fuel', fuelRouter)
app.use('/api/route', routeRouter)
app.use('/api/community', communityRouter)
app.use('/api/stripe', stripeRouter)
app.use('/api/admin', adminRouter)

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'Sıla Yolu AI Backend' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 Backend läuft auf Port ${PORT}`))
