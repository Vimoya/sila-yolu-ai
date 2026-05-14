import { Router } from 'express'

const router = Router()

const borders = {
  kapikule: { name: 'Kapıkule', status: 'yellow' },
  hamzabeyli: { name: 'Hamzabeyli', status: 'green' },
  ipsala: { name: 'İpsala', status: 'red' },
}

router.get('/borders', (_, res) => res.json(borders))

router.put('/borders/:id', (req, res) => {
  const { id } = req.params
  const { status } = req.body
  if (!borders[id]) return res.status(404).json({ error: 'Border not found' })
  if (!['green', 'yellow', 'red'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  borders[id].status = status
  res.json({ success: true, border: borders[id] })
})

export default router
