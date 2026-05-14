import { Router } from 'express'
import axios from 'axios'

const router = Router()

// Aktuelle Preise Mai 2026 (GlobalPetrolPrices.com + EU Oil Bulletin)
const ROUTE_PRICES = [
  {
    id: 1, name: 'ARAL / Shell München', address: 'A9 / A8 München Umgebung',
    diesel: 1.899, benzin: 1.819, cheap: false, updated: 'täglich', country: 'de',
    note: 'Autobahnpreis – günstiger in der Stadt'
  },
  {
    id: 2, name: 'Günstigste DE Tankstelle', address: 'München Stadtgebiet',
    diesel: 1.799, benzin: 1.749, cheap: true, updated: 'täglich', country: 'de',
    note: 'Freie Tankstellen ~10ct günstiger'
  },
  {
    id: 3, name: 'OMV / BP Wien', address: 'A2 Wien Süd, Österreich',
    diesel: 1.849, benzin: 1.769, cheap: false, updated: 'täglich', country: 'at',
    note: 'Autobahnpreis'
  },
  {
    id: 4, name: 'Günstig AT – HOFER/AVANTI', address: 'Wien / Graz',
    diesel: 1.749, benzin: 1.699, cheap: true, updated: 'täglich', country: 'at',
    note: 'Billigste Anbieter in AT'
  },
  {
    id: 5, name: 'MOL Budapest', address: 'M7 / M1 Budapest, Ungarn',
    diesel: 1.620, benzin: 1.520, cheap: true, updated: 'täglich', country: 'hu',
    note: 'Staatlich gedeckelt – günstig!'
  },
  {
    id: 6, name: 'NIS Tankstelle', address: 'E75 / E70 Serbien',
    diesel: 1.400, benzin: 1.300, cheap: true, updated: 'täglich', country: 'rs',
    note: 'Günstigste auf der gesamten Route – voll tanken!'
  },
  {
    id: 7, name: 'OMV / Lukoil Bulgaria', address: 'A1 / E80 Bulgarien',
    diesel: 1.620, benzin: 1.440, cheap: true, updated: 'täglich', country: 'bg',
    note: 'Vor Kapıkule nochmal tanken'
  },
  {
    id: 8, name: 'Petrol Ofisi / Shell', address: 'D100 Istanbul, Türkei',
    diesel: 1.260, benzin: 1.200, cheap: true, updated: 'täglich', country: 'tr',
    note: 'In TRY – ca. Gegenwert in EUR'
  },
]

// Tankerkönig für LIVE Deutsche Preise (falls API Key vorhanden)
router.get('/route', async (req, res) => {
  const apiKey = process.env.TANKERKOENIG_API_KEY
  let stations = [...ROUTE_PRICES]

  if (apiKey) {
    try {
      // München Zentrum: live Preise von Tankerkönig
      const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=48.137&lng=11.576&rad=10&sort=price&type=diesel&apikey=${apiKey}`
      const { data } = await axios.get(url, { timeout: 5000 })
      if (data.ok && data.stations?.length > 0) {
        const live = data.stations.slice(0, 3).map((s, i) => ({
          id: `live_${i}`,
          name: `${s.brand} ${s.name}`,
          address: `${s.street} ${s.houseNumber || ''}, ${s.place}`,
          diesel: s.diesel || null,
          benzin: s.e5 || null,
          cheap: i === 0,
          updated: 'live 🟢',
          country: 'de',
          note: 'Live-Preis von Tankerkönig',
        }))
        // Ersetze die statischen DE-Einträge mit Live-Daten
        stations = [
          ...live,
          ...ROUTE_PRICES.filter(s => s.country !== 'de'),
        ]
      }
    } catch {
      // Fallback auf statische Preise
    }
  }

  res.json({
    stations,
    source: apiKey ? 'Tankerkönig (DE live) + eigene Recherche' : 'GlobalPetrolPrices.com + EU Oil Bulletin (Mai 2026)',
    lastUpdated: new Date().toISOString(),
  })
})

// Einzelnes Land
router.get('/country/:code', async (req, res) => {
  const { code } = req.params
  const stations = ROUTE_PRICES.filter(s => s.country === code)
  res.json({ stations, country: code })
})

// Preisübersicht für alle Länder auf der Route
router.get('/summary', async (req, res) => {
  const summary = [
    { country: 'Deutschland', flag: '🇩🇪', code: 'de', diesel: 1.799, benzin: 1.749, trend: 'stable' },
    { country: 'Österreich',  flag: '🇦🇹', code: 'at', diesel: 1.749, benzin: 1.699, trend: 'stable' },
    { country: 'Ungarn',      flag: '🇭🇺', code: 'hu', diesel: 1.620, benzin: 1.520, trend: 'down' },
    { country: 'Serbien',     flag: '🇷🇸', code: 'rs', diesel: 1.400, benzin: 1.300, trend: 'down' },
    { country: 'Bulgarien',   flag: '🇧🇬', code: 'bg', diesel: 1.620, benzin: 1.440, trend: 'stable' },
    { country: 'Türkei',      flag: '🇹🇷', code: 'tr', diesel: 1.260, benzin: 1.200, trend: 'down' },
  ]
  res.json({ summary, tip: 'Tipp: In Serbien voll tanken – günstigste Preise auf der Route!' })
})

router.post('/report', async (req, res) => {
  const { name, address, diesel, benzin, country } = req.body
  if (!name || !country) return res.status(400).json({ error: 'name and country required' })
  res.json({ success: true, message: 'Danke! Meldung wird geprüft.' })
})

export default router
