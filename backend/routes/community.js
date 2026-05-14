import { Router } from 'express'

const router = Router()

router.get('/rooms', (_, res) => {
  res.json({
    rooms: [
      { id: 'general', name: 'Allgemein', icon: '💬' },
      { id: 'border', name: 'Grenze Live', icon: '🛂' },
      { id: 'fuel', name: 'Tankstellen', icon: '⛽' },
      { id: 'family', name: 'Familienreise', icon: '👨‍👩‍👧' },
      { id: 'hotels', name: 'Hotels & Schlafen', icon: '🏨' },
      { id: 'emergency', name: 'Notfall & Hilfe', icon: '🆘' },
    ],
  })
})

router.post('/report', (req, res) => {
  const { roomId, type, content } = req.body
  if (!roomId || !content) return res.status(400).json({ error: 'roomId and content required' })
  res.json({ success: true })
})

export default router
