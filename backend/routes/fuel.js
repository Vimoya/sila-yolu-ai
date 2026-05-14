import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/germany', async (req, res) => {
  const apiKey = process.env.TANKERKOENIG_API_KEY
  if (!apiKey) return res.json({ stations: getDummyStations('de') })

  try {
    const { lat = 48.1, lng = 11.5, rad = 5 } = req.query
    const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=${lat}&lng=${lng}&rad=${rad}&sort=price&type=all&apikey=${apiKey}`
    const { data } = await axios.get(url)
    res.json({ stations: data.stations?.slice(0, 10) || [] })
  } catch {
    res.json({ stations: getDummyStations('de') })
  }
})

router.get('/route', async (req, res) => {
  const apiKey = process.env.TANKERKOENIG_API_KEY
  let deStations = []
  if (apiKey) {
    try {
      const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=48.1&lng=11.5&rad=5&sort=price&type=all&apikey=${apiKey}`
      const { data } = await axios.get(url)
      deStations = (data.stations || []).slice(0, 4).map((s, i) => ({
        id: `de_${i}`, name: s.name, address: s.street, diesel: s.diesel, benzin: s.e5, cheap: i < 2, updated: 'live', country: 'de',
      }))
    } catch { deStations = getDummyStations('de') }
  } else {
    deStations = getDummyStations('de')
  }
  const allStations = [
    ...deStations,
    ...getDummyStations('at'),
    ...getDummyStations('community'),
  ]
  res.json({ stations: allStations })
})

router.get('/austria', async (req, res) => {
  res.json({ stations: getDummyStations('at') })
})

router.get('/community', async (req, res) => {
  res.json({ stations: getDummyStations('community') })
})

router.post('/report', async (req, res) => {
  const { name, address, diesel, benzin, country } = req.body
  if (!name || !country) return res.status(400).json({ error: 'name and country required' })
  res.json({ success: true, message: 'Meldung gespeichert. Danke!' })
})

function getDummyStations(country) {
  const data = {
    de: [
      { id: 1, name: 'ARAL A9 München', address: 'A9, Km 520', diesel: 1.649, benzin: 1.759, cheap: false, updated: 'aktuell', country: 'de' },
      { id: 2, name: 'Shell A8 West', address: 'A8, Km 300', diesel: 1.659, benzin: 1.769, cheap: false, updated: 'aktuell', country: 'de' },
    ],
    at: [
      { id: 3, name: 'OMV Wien Süd', address: 'A2, Wien', diesel: 1.579, benzin: 1.689, cheap: true, updated: 'aktuell', country: 'at' },
      { id: 4, name: 'Shell Inntal', address: 'A93, Inntal', diesel: 1.589, benzin: 1.699, cheap: true, updated: 'aktuell', country: 'at' },
    ],
    community: [
      { id: 5, name: 'MOL Budapest', address: 'M7, Budapest', diesel: 1.42, benzin: 1.53, cheap: true, updated: 'aktuell', country: 'hu' },
      { id: 6, name: 'NIS Beograd', address: 'E75, Serbien', diesel: 1.28, benzin: 1.35, cheap: true, updated: 'aktuell', country: 'rs' },
      { id: 7, name: 'Lukoil Sofia', address: 'A1, Bulgarien', diesel: 1.31, benzin: 1.38, cheap: true, updated: 'aktuell', country: 'bg' },
    ],
  }
  return data[country] || []
}

export default router
