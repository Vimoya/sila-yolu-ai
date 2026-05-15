import { Router } from 'express'
import axios from 'axios'
import OpenAI from 'openai'
import { getFueloPrices, getAllFueloPrices, getAllFueloStations } from '../scraper/fuelo.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const router = Router()

// Fallback falls Scraper nicht funktioniert
const STATIC_PRICES = {
  hu: { diesel: 1.620, benzin: 1.520, trend: 'down', note: 'Staatlich gedeckelt' },
  rs: { diesel: 1.390, benzin: 1.290, trend: 'down', note: 'Günstigste auf der Route – voll tanken!' },
  bg: { diesel: 1.610, benzin: 1.430, trend: 'stable', note: 'Vor Kapıkule nochmal tanken' },
  tr: { diesel: 1.250, benzin: 1.190, trend: 'down', note: 'In TRY – ca. Gegenwert in EUR' },
  fr: { diesel: 1.890, benzin: 1.950, trend: 'stable', note: 'Autoroute – teurer als Stadtgebiet' },
  gr: { diesel: 1.730, benzin: 1.910, trend: 'stable', note: 'Günstiger als DE/AT' },
}

// Tankerkönig: live DE Preise — günstigste Diesel-Stationen nahe Nutzern
// Nutzt nur 1 Request (Rate Limit: 1/min) — Zentrum Deutschland, 25km Radius
const tkCache = {}
const tkPending = {}
const TK_TTL = 5 * 60 * 1000

async function fetchDE(apiKey, lat = 48.137, lng = 11.576, rad = 25) {
  lat = parseFloat(lat); lng = parseFloat(lng)
  const cacheKey = `${lat.toFixed(1)}_${lng.toFixed(1)}`
  const now = Date.now()

  // Cache hit — alle User bekommen sofort die gecachte Antwort
  if (tkCache[cacheKey] && now - tkCache[cacheKey].fetchedAt < TK_TTL)
    return tkCache[cacheKey].data

  // Request läuft bereits — alle weiteren User warten auf dasselbe Ergebnis
  if (tkPending[cacheKey]) return tkPending[cacheKey]

  const parseP = v => {
    const n = parseFloat(String(v).replace(',', '.'))
    return isNaN(n) || n <= 0 ? null : n
  }

  // Erster User triggert den Request, alle anderen hängen sich dran
  tkPending[cacheKey] = axios.get(
    `https://creativecommons.tankerkoenig.de/json/list.php?lat=${lat}&lng=${lng}&rad=${rad}&sort=dist&type=all&apikey=${apiKey}`,
    { timeout: 8000 }
  ).then(res => {
    if (!res.data.ok || !res.data.stations?.length) return null
    const data = res.data.stations
      .filter(s => s.diesel || s.e5)
      .sort((a, b) => (parseP(a.diesel) || 99) - (parseP(b.diesel) || 99))
      .slice(0, 10)
      .map((s, i) => ({
        id: `de_tk_${i}`,
        name: `${s.brand || s.name}`.trim(),
        address: `${s.street || ''} ${s.houseNumber || ''}, ${s.place}`.trim(),
        diesel: parseP(s.diesel),
        benzin: parseP(s.e5),
        cheap: i === 0,
        updated: 'live 🟢',
        country: 'de',
        note: s.dist ? `${s.dist.toFixed(1)} km entfernt` : 'Live via Tankerkönig',
        lat: s.lat,
        lng: s.lng,
      }))
    tkCache[cacheKey] = { data, fetchedAt: Date.now() }
    return data
  }).catch(() => tkCache[cacheKey]?.data || null)
   .finally(() => { delete tkPending[cacheKey] })

  return tkPending[cacheKey]
}

// Frankreich: offizielle Regierungs-API, kostenlos, alle 10 Min aktualisiert
// Route-Departements: 75=Paris, 69=Lyon, 13=Marseille, 67=Strasbourg, 68=Mulhouse
const FR_ROUTE_DEPTS = ['75', '69', '13', '67', '68', '01', '71', '21']
const frCache = { data: null, fetchedAt: 0 }
async function fetchFR() {
  const now = Date.now()
  if (frCache.data && now - frCache.fetchedAt < 30 * 60 * 1000) return frCache.data
  try {
    // Fetch multiple route departments in parallel
    const results = await Promise.allSettled(
      FR_ROUTE_DEPTS.map(dep =>
        axios.get(
          `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-carburants-quotidien/exports/json?limit=50&refine=dep_code:${dep}`,
          { timeout: 10000, headers: { Accept: 'application/json' } }
        )
      )
    )
    const allRows = results.flatMap(r => r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data : [])
    if (!allRows.length) return null

    // Group by station id
    const stationsMap = {}
    for (const row of allRows) {
      const id = row.id
      if (!stationsMap[id]) {
        stationsMap[id] = {
          name: `${row.ville || 'Frankreich'}`,
          address: `${row.adresse || ''}, ${row.ville || ''}`.trim().replace(/^,\s*/, ''),
          diesel: null, benzin: null,
          updated: 'live 🟢', country: 'fr',
          note: `Live via prix-carburants.gouv.fr`,
        }
      }
      const price = parseFloat(row.prix_valeur)
      if (isNaN(price) || price <= 0) continue
      if (row.prix_nom === 'Gazole') stationsMap[id].diesel = price
      if (row.prix_nom === 'SP95' || row.prix_nom === 'SP98') {
        if (!stationsMap[id].benzin || price < stationsMap[id].benzin) stationsMap[id].benzin = price
      }
    }

    const stations = Object.entries(stationsMap)
      .filter(([, s]) => s.diesel && s.diesel > 1 && s.diesel < 3)
      .sort((a, b) => a[1].diesel - b[1].diesel)
      .slice(0, 5)
      .map(([id, s], i) => ({ id: `fr_${id}`, ...s, cheap: i === 0 }))

    if (!stations.length) return null
    frCache.data = stations; frCache.fetchedAt = now
    return stations
  } catch { return frCache.data }
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

// Track when prices actually changed — only update timestamp on real price change
const routeCache = { stations: null, hash: null, lastChanged: null }

router.get('/route', async (req, res) => {
  const tkKey = process.env.TANKERKOENIG_API_KEY
  const sources = []

  const [liveDE, liveAT, liveFR, fueloStations] = await Promise.all([
    tkKey ? fetchDE(tkKey) : null,
    fetchAT(),
    fetchFR(),
    getAllFueloStations(),
  ])

  let stations = []

  // DE — kein Fallback, nur via /nearby (Suche/GPS im Frontend)
  if (liveDE?.length) sources.push('Tankerkönig DE live')

  // AT
  if (liveAT?.length) {
    stations.push(...liveAT)
    sources.push('e-control.at AT live')
  } else {
    stations.push(
      { id: 's_at1', name: 'OMV Wien Süd', address: 'A2 Wien Süd', diesel: 1.849, benzin: 1.769, cheap: false, updated: 'täglich', country: 'at', note: 'Autobahnpreis' },
      { id: 's_at2', name: 'AVANTI / HOFER Wien', address: 'Wien / Graz', diesel: 1.749, benzin: 1.699, cheap: true, updated: 'täglich', country: 'at', note: 'Günstigste in AT' },
    )
  }

  // FR
  if (liveFR?.length) {
    stations.push(...liveFR)
    sources.push('prix-carburants.gouv.fr FR live')
  } else {
    stations.push(
      { id: 's_fr1', name: 'TotalEnergies Paris', address: 'A6 / A7 Paris', diesel: 1.89, benzin: 1.95, cheap: true, updated: 'täglich', country: 'fr', note: 'Autoroute Frankreich' },
      { id: 's_fr2', name: 'BP / Shell Frankreich', address: 'A7 Lyon–Marseille', diesel: 1.92, benzin: 1.98, cheap: false, updated: 'täglich', country: 'fr', note: 'A7 Rhônetal' },
    )
  }

  // HU/RS/BG/TR/GR from fuelo.net (real per-brand stations)
  const fueloCountries = ['hu', 'rs', 'bg', 'tr', 'gr']
  const staticFallback = {
    hu: [{ id: 's_hu1', name: 'MOL Budapest', address: 'M7 / M1 Budapest', diesel: 1.620, benzin: 1.520, cheap: true, updated: 'wöchentlich', country: 'hu', note: 'Staatlich gedeckelt' }],
    rs: [{ id: 's_rs1', name: 'NIS Tankstelle', address: 'E75 / E70 Serbien', diesel: 1.390, benzin: 1.290, cheap: true, updated: 'wöchentlich', country: 'rs', note: 'Voll tanken!' }],
    bg: [
      { id: 's_bg1', name: 'Lukoil', address: 'A1 / E80 Sofia', diesel: 1.64, benzin: 1.53, cheap: true, updated: 'wöchentlich', country: 'bg', note: 'Vor Kapıkule nochmal tanken!' },
      { id: 's_bg2', name: 'OMV', address: 'A1 Plovdiv', diesel: 1.65, benzin: 1.54, cheap: false, updated: 'wöchentlich', country: 'bg', note: 'A1 Richtung Türkei' },
      { id: 's_bg3', name: 'Petrol', address: 'E80 Sofia', diesel: 1.63, benzin: 1.52, cheap: false, updated: 'wöchentlich', country: 'bg', note: 'E80 Route' },
      { id: 's_bg4', name: 'Shell', address: 'A1 Plovdiv–Sofia', diesel: 1.66, benzin: 1.56, cheap: false, updated: 'wöchentlich', country: 'bg', note: 'A1 Autobahn' },
      { id: 's_bg5', name: 'Rompetrol', address: 'E80 Plovdiv', diesel: 1.62, benzin: 1.51, cheap: false, updated: 'wöchentlich', country: 'bg', note: 'Günstig vor Grenze' },
    ],
    tr: [
      { id: 's_tr1', name: 'Petrol Ofisi', address: 'D100 / TEM Istanbul', diesel: 1.92, benzin: 1.52, cheap: true, updated: 'wöchentlich', country: 'tr', note: 'Größte TR Kette' },
      { id: 's_tr2', name: 'Shell Türkiye', address: 'D100 Istanbul', diesel: 1.94, benzin: 1.54, cheap: false, updated: 'wöchentlich', country: 'tr', note: 'D100 Hauptroute' },
      { id: 's_tr3', name: 'Opet', address: 'TEM Istanbul / Ankara', diesel: 1.91, benzin: 1.51, cheap: false, updated: 'wöchentlich', country: 'tr', note: 'TEM Autobahn' },
      { id: 's_tr4', name: 'BP Türkiye', address: 'TEM / E80 Istanbul', diesel: 1.93, benzin: 1.53, cheap: false, updated: 'wöchentlich', country: 'tr', note: 'E80 Richtung Edirne' },
    ],
    gr: [
      { id: 's_gr1', name: 'Avin', address: 'A1 / E75 Athen', diesel: 1.72, benzin: 1.89, cheap: true, updated: 'wöchentlich', country: 'gr', note: 'Günstigste in GR' },
      { id: 's_gr2', name: 'EKO', address: 'E75 Thessaloniki', diesel: 1.74, benzin: 1.91, cheap: false, updated: 'wöchentlich', country: 'gr', note: 'E75 Nordgriechenland' },
      { id: 's_gr3', name: 'Shell', address: 'A1 Athen', diesel: 1.76, benzin: 1.93, cheap: false, updated: 'wöchentlich', country: 'gr', note: 'A1 Autobahn' },
      { id: 's_gr4', name: 'BP', address: 'A1 / E94 Athen', diesel: 1.75, benzin: 1.92, cheap: false, updated: 'wöchentlich', country: 'gr', note: 'A1 Richtung Thessaloniki' },
    ],
  }

  let fueloUsed = false
  for (const code of fueloCountries) {
    const live = fueloStations[code] || []
    const fallback = staticFallback[code] || []
    // Merge: live stations + any fallback brands not already covered
    const liveNames = new Set(live.map(s => s.name.toLowerCase()))
    const extra = fallback.filter(s => !liveNames.has(s.name.toLowerCase()))
    const merged = [...live, ...extra]
    if (merged.length) {
      stations.push(...merged)
      if (live.length) fueloUsed = true
    }
  }
  if (fueloUsed) sources.push('fuelo.net (HU/RS/BG/TR/GR)')

  const sourceStr = sources.length ? sources.join(' + ') : 'Statische Preise (Fallback)'

  // Hash der Preise — nur Zahlen, keine IDs/Timestamps
  const priceHash = stations.map(s => `${s.name}${s.diesel}${s.benzin}`).join('|')

  if (priceHash !== routeCache.hash) {
    routeCache.hash = priceHash
    routeCache.stations = stations
    routeCache.lastChanged = Date.now()
  }

  // Client schickt seinen lastChanged mit — wenn gleich, 304 (keine Daten nötig)
  const clientTs = parseInt(req.headers['if-none-match'] || '0')
  if (clientTs && clientTs >= routeCache.lastChanged) {
    return res.status(304).end()
  }

  res.set('ETag', String(routeCache.lastChanged))
  res.json({ stations: routeCache.stations, source: sourceStr, lastChanged: routeCache.lastChanged })
})

router.get('/geocode', async (req, res) => {
  const { q, lat, lon } = req.query
  try {
    let url
    const { country: cc } = req.query
    if (q) {
      const codes = cc || 'de,fr,at'
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=${codes}`
    } else if (lat && lon) {
      url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    } else {
      return res.status(400).json({ error: 'q or lat/lon required' })
    }
    const { data } = await axios.get(url, {
      timeout: 6000,
      headers: { 'User-Agent': 'SilaYoluApp/1.0 (kilincerto@gmail.com)', 'Accept-Language': 'de' },
    })
    res.json(data)
  } catch (e) {
    res.status(502).json({ error: 'geocode failed', detail: e.message })
  }
})

router.get('/nearby', async (req, res) => {
  const { lat, lng, country } = req.query
  if (!lat || !lng) return res.status(400).json({ error: 'lat/lng required' })

  const tkKey = process.env.TANKERKOENIG_API_KEY
  if (country === 'de' && tkKey) {
    const stations = await fetchDE(tkKey, lat, lng, 25)
    if (stations?.length) {
      return res.json({ stations, source: 'Tankerkönig live 🟢' })
    }
    return res.json({ stations: [], source: 'unavailable' })
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
          }
        })
        return res.json({ stations, source: 'e-control.at live' })
      }
    } catch {}
  }

  if (country === 'fr') {
    try {
      // Reverse geocode to get dep_code, then query FR API
      const geo = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { timeout: 6000, headers: { 'User-Agent': 'SilaYoluApp/1.0 (kilincerto@gmail.com)' } }
      )
      const postcode = geo.data?.address?.postcode?.slice(0, 2)
      if (postcode) {
        const { data: rows } = await axios.get(
          `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-carburants-quotidien/exports/json?limit=100&refine=dep_code:${postcode}`,
          { timeout: 10000, headers: { Accept: 'application/json' } }
        )
        if (Array.isArray(rows) && rows.length) {
          const map = {}
          for (const row of rows) {
            if (!map[row.id]) map[row.id] = { name: row.ville || 'FR', address: `${row.adresse || ''}, ${row.ville || ''}`.trim(), diesel: null, benzin: null, country: 'fr', updated: 'live 🟢', note: 'Live via prix-carburants.gouv.fr' }
            const p = parseFloat(row.prix_valeur)
            if (isNaN(p) || p <= 0) continue
            if (row.prix_nom === 'Gazole') map[row.id].diesel = p
            if ((row.prix_nom === 'SP95' || row.prix_nom === 'SP98') && (!map[row.id].benzin || p < map[row.id].benzin)) map[row.id].benzin = p
          }
          const stations = Object.entries(map)
            .filter(([, s]) => s.diesel > 1 && s.diesel < 3)
            .sort((a, b) => a[1].diesel - b[1].diesel)
            .slice(0, 5)
            .map(([id, s], i) => ({ id: `fr_near_${id}`, ...s, cheap: i === 0 }))
          if (stations.length) return res.json({ stations, source: 'prix-carburants.gouv.fr live 🟢' })
        }
      }
    } catch {}
  }

  res.json({ stations: [], source: 'unavailable' })
})

router.get('/country/:code', (req, res) => {
  const stations = staticStations().filter(s => s.country === req.params.code)
  res.json({ stations, country: req.params.code })
})

router.get('/summary', async (req, res) => {
  const tkKey = process.env.TANKERKOENIG_API_KEY
  const [fueloData, liveDE, liveFRsum] = await Promise.all([
    getAllFueloPrices(),
    tkKey ? fetchDE(tkKey) : null,
    fetchFR(),
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

  let frDiesel = STATIC_PRICES.fr.diesel, frBenzin = STATIC_PRICES.fr.benzin, frSource = 'statisch'
  if (liveFRsum?.length) {
    const diesels = liveFRsum.map(s => s.diesel).filter(Boolean)
    const benzins = liveFRsum.map(s => s.benzin).filter(Boolean)
    if (diesels.length) frDiesel = Math.round(diesels.reduce((a, b) => a + b) / diesels.length * 1000) / 1000
    if (benzins.length) frBenzin = Math.round(benzins.reduce((a, b) => a + b) / benzins.length * 1000) / 1000
    frSource = 'prix-carburants.gouv.fr live 🟢'
  }

  res.json({
    summary: [
      { country: 'Deutschland', flag: '🇩🇪', code: 'de', diesel: deDiesel, benzin: deBenzin, trend: 'stable', source: deSource },
      { country: 'Frankreich',  flag: '🇫🇷', code: 'fr', diesel: frDiesel, benzin: frBenzin, trend: 'stable', source: frSource },
      { country: 'Österreich',  flag: '🇦🇹', code: 'at', diesel: 1.749, benzin: 1.699, trend: 'stable', source: 'e-control.at' },
      { country: 'Ungarn',      flag: '🇭🇺', code: 'hu', ...merge('hu', STATIC_PRICES.hu) },
      { country: 'Serbien',     flag: '🇷🇸', code: 'rs', ...merge('rs', STATIC_PRICES.rs) },
      { country: 'Bulgarien',   flag: '🇧🇬', code: 'bg', ...merge('bg', STATIC_PRICES.bg) },
      { country: 'Türkei',      flag: '🇹🇷', code: 'tr', ...merge('tr', STATIC_PRICES.tr) },
      { country: 'Griechenland',flag: '🇬🇷', code: 'gr', ...merge('gr', STATIC_PRICES.gr) },
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
