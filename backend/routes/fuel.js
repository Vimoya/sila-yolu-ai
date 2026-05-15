import { Router } from 'express'
import axios from 'axios'
import OpenAI from 'openai'
import { getFueloPrices, getAllFueloPrices } from '../scraper/fuelo.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const router = Router()

// Fallback falls Scraper nicht funktioniert
const STATIC_PRICES = {
  hu: { diesel: 1.620, benzin: 1.520, trend: 'down', note: 'Staatlich gedeckelt' },
  rs: { diesel: 1.390, benzin: 1.290, trend: 'down', note: 'Günstigste auf der Route – voll tanken!' },
  bg: { diesel: 1.610, benzin: 1.430, trend: 'stable', note: 'Vor Kapıkule nochmal tanken' },
  tr: { diesel: 1.250, benzin: 1.190, trend: 'down', note: 'In TRY – ca. Gegenwert in EUR' },
}

// Tankerkönig: live DE Preise — mehrere Städte entlang der Route
async function fetchDE(apiKey) {
  try {
    // Wichtigste Städte auf der Sıla Yolu Route in Deutschland
    const locations = [
      { lat: 48.137, lng: 11.576, city: 'München' },
      { lat: 48.775, lng: 9.182, city: 'Stuttgart' },
      { lat: 51.227, lng: 6.773, city: 'Düsseldorf' },
      { lat: 53.551, lng: 10.000, city: 'Hamburg' },
      { lat: 52.520, lng: 13.405, city: 'Berlin' },
      { lat: 50.938, lng: 6.960, city: 'Köln' },
    ]

    const results = await Promise.all(
      locations.map(loc =>
        axios.get(
          `https://creativecommons.tankerkoenig.de/json/list.php?lat=${loc.lat}&lng=${loc.lng}&rad=5&sort=price&type=diesel&apikey=${apiKey}`,
          { timeout: 5000 }
        ).then(r => ({ city: loc.city, data: r.data })).catch(() => null)
      )
    )

    const stations = []
    for (const result of results) {
      if (!result?.data?.ok || !result.data.stations?.length) continue
      const s = result.data.stations[0] // günstigste in dieser Stadt
      if (!s.diesel) continue
      stations.push({
        id: `de_${result.city}`,
        name: `${s.brand || s.name}`.trim(),
        address: `${result.city} — ${s.street || ''} ${s.houseNumber || ''}`.trim(),
        diesel: s.diesel,
        benzin: s.e5 || null,
        cheap: false,
        updated: 'live 🟢',
        country: 'de',
        note: `Günstigste in ${result.city}`,
        lat: s.lat,
        lng: s.lng,
      })
    }

    if (!stations.length) return null

    // Sortiere nach Preis, günstigste zuerst
    stations.sort((a, b) => a.diesel - b.diesel)
    stations[0].cheap = true

    return stations
  } catch { return null }
}

// Spritpreisrechner AT: live Österreich Preise (staatliche API, kostenlos)
async function fetchAT() {
  try {
    // Suche entlang der Route: Wien A2 Südautobahn
    const { data } = await axios.get(
      'https://api.e-control.at/sprit/1.0/search/gas-stations/by-address?latitude=48.2082&longitude=16.3738&fuelType=DIE&includeClosed=false',
      { timeout: 5000, headers: { 'Accept': 'application/json' } }
    )
    if (!Array.isArray(data) || !data.length) return null
    return data.slice(0, 3).map((s, i) => {
      const dieselEntry = s.prices?.find(p => p.fuelType === 'DIE')
      const benzinEntry = s.prices?.find(p => p.fuelType === 'SUP')
      return {
        id: `at_live_${i}`,
        name: s.name,
        address: `${s.location?.address || ''}, ${s.location?.city || 'Wien'}`,
        diesel: dieselEntry?.amount || null,
        benzin: benzinEntry?.amount || null,
        cheap: i === 0,
        updated: 'live 🟢',
        country: 'at',
        note: 'Live via e-control.at',
      }
    })
  } catch { return null }
}

function staticStations() {
  return [
    { id: 's_de1', name: 'ARAL München Autobahn', address: 'A9 / A8 München Umgebung', diesel: 1.899, benzin: 1.819, cheap: false, updated: 'täglich', country: 'de', note: 'Autobahnpreis – günstiger in der Stadt' },
    { id: 's_de2', name: 'Freie Tankstelle München', address: 'München Stadtgebiet', diesel: 1.799, benzin: 1.749, cheap: true, updated: 'täglich', country: 'de', note: 'Freie Tankstellen ~10ct günstiger' },
    { id: 's_at1', name: 'OMV Wien Süd', address: 'A2 Wien Süd, Österreich', diesel: 1.849, benzin: 1.769, cheap: false, updated: 'täglich', country: 'at', note: 'Autobahnpreis' },
    { id: 's_at2', name: 'AVANTI / HOFER Wien', address: 'Wien / Graz', diesel: 1.749, benzin: 1.699, cheap: true, updated: 'täglich', country: 'at', note: 'Günstigste in AT' },
    { id: 's_hu1', name: 'MOL Budapest', address: 'M7 / M1 Budapest', diesel: 1.620, benzin: 1.520, cheap: true, updated: 'wöchentlich', country: 'hu', note: STATIC_PRICES.hu.note },
    { id: 's_rs1', name: 'NIS Tankstelle', address: 'E75 / E70 Serbien', diesel: 1.390, benzin: 1.290, cheap: true, updated: 'wöchentlich', country: 'rs', note: STATIC_PRICES.rs.note },
    { id: 's_bg1', name: 'OMV / Lukoil Bulgarien', address: 'A1 / E80 Bulgarien', diesel: 1.610, benzin: 1.430, cheap: true, updated: 'wöchentlich', country: 'bg', note: STATIC_PRICES.bg.note },
    { id: 's_tr1', name: 'Petrol Ofisi / Shell Istanbul', address: 'D100 Istanbul', diesel: 1.250, benzin: 1.190, cheap: true, updated: 'wöchentlich', country: 'tr', note: STATIC_PRICES.tr.note },
  ]
}

router.get('/route', async (req, res) => {
  const tkKey = process.env.TANKERKOENIG_API_KEY
  const base = staticStations()
  const sources = []

  const [liveDE, liveAT, fueloData] = await Promise.all([
    tkKey ? fetchDE(tkKey) : null,
    fetchAT(),
    getAllFueloPrices(),
  ])

  let stations = base

  // Update HU/RS/BG/TR stations with fuelo.net live data
  if (Object.keys(fueloData).length > 0) {
    stations = stations.map(s => {
      const live = fueloData[s.country]
      if (!live) return s
      return {
        ...s,
        diesel: live.diesel ?? s.diesel,
        benzin: live.benzin ?? s.benzin,
        updated: 'täglich 🟡',
        note: s.note + ' (fuelo.net)',
      }
    })
    sources.push('fuelo.net (HU/RS/BG/TR)')
  }

  if (liveDE) {
    stations = [...liveDE, ...stations.filter(s => s.country !== 'de')]
    sources.push('Tankerkönig DE live')
  }
  if (liveAT) {
    stations = [...stations.filter(s => s.country !== 'at'), ...liveAT]
    sources.push('e-control.at AT live')
  }

  const sourceStr = sources.length
    ? sources.join(' + ')
    : 'Statische Preise (Fallback)'

  res.json({ stations, source: sourceStr, lastUpdated: new Date().toISOString() })
})

router.get('/nearby', async (req, res) => {
  const { lat, lng, country } = req.query
  if (!lat || !lng) return res.status(400).json({ error: 'lat/lng required' })

  const tkKey = process.env.TANKERKOENIG_API_KEY
  if (country === 'de' && tkKey) {
    try {
      const { data } = await axios.get(
        `https://creativecommons.tankerkoenig.de/json/list.php?lat=${lat}&lng=${lng}&rad=5&sort=price&type=all&apikey=${tkKey}`,
        { timeout: 5000 }
      )
      if (data.ok && data.stations?.length) {
        const stations = data.stations.slice(0, 5).map((s, i) => ({
          id: `near_${i}`,
          name: `${s.brand} ${s.name}`.trim(),
          address: `${s.street} ${s.houseNumber || ''}, ${s.place}`,
          diesel: s.diesel || null,
          benzin: s.e5 || null,
          cheap: i === 0,
          updated: 'live 🟢',
          country: 'de',
          dist: s.dist ? `${s.dist.toFixed(1)} km` : null,
          note: 'Live via Tankerkönig',
          mapsUrl: `https://www.google.com/maps/search/tankstelle/@${s.lat},${s.lng},16z`,
        }))
        return res.json({ stations, source: 'Tankerkönig live' })
      }
    } catch {}
  }

  if (country === 'at') {
    try {
      const { data } = await axios.get(
        `https://api.e-control.at/sprit/1.0/search/gas-stations/by-address?latitude=${lat}&longitude=${lng}&fuelType=DIE&includeClosed=false`,
        { timeout: 5000, headers: { Accept: 'application/json' } }
      )
      if (Array.isArray(data) && data.length) {
        const stations = data.slice(0, 5).map((s, i) => {
          const d = s.prices?.find(p => p.fuelType === 'DIE')
          const b = s.prices?.find(p => p.fuelType === 'SUP')
          return {
            id: `near_at_${i}`,
            name: s.name,
            address: `${s.location?.address || ''}, ${s.location?.city || ''}`,
            diesel: d?.amount || null,
            benzin: b?.amount || null,
            cheap: i === 0,
            updated: 'live 🟢',
            country: 'at',
            note: 'Live via e-control.at',
            mapsUrl: `https://www.google.com/maps/search/tankstelle/@${s.location?.latitude},${s.location?.longitude},16z`,
          }
        })
        return res.json({ stations, source: 'e-control.at live' })
      }
    } catch {}
  }

  // Fallback: Google Maps deep link
  res.json({
    stations: [],
    mapsUrl: `https://www.google.com/maps/search/gas+station/@${lat},${lng},14z`,
    source: 'Google Maps',
  })
})

router.get('/country/:code', (req, res) => {
  const stations = staticStations().filter(s => s.country === req.params.code)
  res.json({ stations, country: req.params.code })
})

router.get('/summary', async (req, res) => {
  const tkKey = process.env.TANKERKOENIG_API_KEY
  const [fueloData, liveDE] = await Promise.all([
    getAllFueloPrices(),
    tkKey ? fetchDE(tkKey) : null,
  ])

  const merge = (code, staticP) => {
    const live = fueloData[code]
    return {
      diesel: live?.diesel ?? staticP.diesel,
      benzin: live?.benzin ?? staticP.benzin,
      trend: staticP.trend,
      note: staticP.note,
      source: live ? 'fuelo.net' : 'statisch',
    }
  }

  // DE: Durchschnitt der günstigsten Stationen aus Tankerkönig
  let deDiesel = 1.799, deBenzin = 1.749, deSource = 'statisch'
  if (liveDE?.length) {
    deDiesel = Math.round((liveDE.reduce((s, x) => s + x.diesel, 0) / liveDE.length) * 1000) / 1000
    deBenzin = liveDE[0].benzin ?? 1.749
    deSource = 'Tankerkönig live 🟢'
  }

  res.json({
    summary: [
      { country: 'Deutschland', flag: '🇩🇪', code: 'de', diesel: deDiesel, benzin: deBenzin, trend: 'stable', source: deSource },
      { country: 'Österreich',  flag: '🇦🇹', code: 'at', diesel: 1.749, benzin: 1.699, trend: 'stable', source: 'e-control.at' },
      { country: 'Ungarn',      flag: '🇭🇺', code: 'hu', ...merge('hu', STATIC_PRICES.hu) },
      { country: 'Serbien',     flag: '🇷🇸', code: 'rs', ...merge('rs', STATIC_PRICES.rs) },
      { country: 'Bulgarien',   flag: '🇧🇬', code: 'bg', ...merge('bg', STATIC_PRICES.bg) },
      { country: 'Türkei',      flag: '🇹🇷', code: 'tr', ...merge('tr', STATIC_PRICES.tr) },
    ],
    tip: 'Tipp: In Serbien voll tanken – günstigste Preise auf der Route!',
  })
})

router.post('/report', (req, res) => {
  const { name, country } = req.body
  if (!name || !country) return res.status(400).json({ error: 'name and country required' })
  res.json({ success: true, message: 'Danke! Meldung wird geprüft.' })
})

// Foto-Analyse via GPT-4o Vision
router.post('/analyze-photo', async (req, res) => {
  const { image } = req.body // base64 data URL
  if (!image) return res.status(400).json({ error: 'image required' })
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'OpenAI API key not configured' })

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analysiere dieses Foto einer Tankstelle oder Preisanzeige. Extrahiere:
- name: Name der Tankstelle (z.B. "Shell", "OMV", "NIS") + Ort falls sichtbar
- country: Landeskürzel (de/at/hu/rs/bg/tr) — erkenne an Währung, Sprache, Flaggen
- diesel: Diesel-Preis als Zahl in EUR (falls in anderer Währung umrechnen: HUF/395, RSD/117, TRY/38)
- benzin: Benzin/Super-Preis als Zahl in EUR
- note: kurze Bemerkung falls relevant

Antworte NUR als JSON: {"name":"...","country":"...","diesel":1.399,"benzin":1.299,"note":"..."}
Falls ein Wert nicht erkennbar, setze null. Falls kein Tankstellenfoto, gib {"error":"Kein Tankstellenfoto erkannt"} zurück.`,
          },
          { type: 'image_url', image_url: { url: image, detail: 'low' } },
        ],
      }],
    })

    const text = response.choices[0].message.content.trim()
    const json = JSON.parse(text.replace(/```json|```/g, '').trim())
    res.json(json)
  } catch (e) {
    res.status(500).json({ error: 'Analyse fehlgeschlagen', detail: e.message })
  }
})

export default router
