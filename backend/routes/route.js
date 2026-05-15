import { Router } from 'express'
import OpenAI from 'openai'

const router = Router()
let openai = null
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// Approximate fuel prices per country (€/L diesel) — used as fallback
const BASE_PRICES = {
  DE: { diesel: 1.70, benzin: 1.78, name: 'Deutschland', flag: '🇩🇪' },
  AT: { diesel: 1.60, benzin: 1.68, name: 'Österreich', flag: '🇦🇹' },
  HU: { diesel: 1.55, benzin: 1.62, name: 'Ungarn', flag: '🇭🇺' },
  SI: { diesel: 1.58, benzin: 1.65, name: 'Slowenien', flag: '🇸🇮' },
  HR: { diesel: 1.62, benzin: 1.70, name: 'Kroatien', flag: '🇭🇷' },
  RS: { diesel: 1.45, benzin: 1.52, name: 'Serbien', flag: '🇷🇸' },
  BG: { diesel: 1.42, benzin: 1.48, name: 'Bulgarien', flag: '🇧🇬' },
  RO: { diesel: 1.48, benzin: 1.55, name: 'Rumänien', flag: '🇷🇴' },
  MK: { diesel: 1.38, benzin: 1.45, name: 'Nordmazedonien', flag: '🇲🇰' },
  GR: { diesel: 1.68, benzin: 1.82, name: 'Griechenland', flag: '🇬🇷' },
  TR: { diesel: 1.20, benzin: 1.35, name: 'Türkei', flag: '🇹🇷' },
}

// Countries on each route in order
const ROUTE_COUNTRIES = {
  austria_hungary: ['DE', 'AT', 'HU', 'RS', 'BG', 'TR'],
  croatia_route:   ['DE', 'AT', 'SI', 'HR', 'RS', 'BG', 'TR'],
  romania_route:   ['DE', 'AT', 'HU', 'RO', 'BG', 'TR'],
  greece_route:    ['DE', 'AT', 'SI', 'RS', 'MK', 'GR', 'TR'],
}

function getPricesForRoute(routeKey, fuelType = 'diesel') {
  const codes = ROUTE_COUNTRIES[routeKey] || ROUTE_COUNTRIES.austria_hungary
  const result = {}
  for (const code of codes) {
    const p = BASE_PRICES[code]
    if (p) result[code] = { ...p, price: p[fuelType] ?? p.diesel }
  }
  return result
}

// Real route data — verified distances Munich base
const ROUTE_DATA = {
  austria_hungary: {
    name: 'Österreich-Ungarn Route',
    flags: ['🇩🇪', '🇦🇹', '🇭🇺', '🇷🇸', '🇧🇬', '🇹🇷'],
    countries: ['Deutschland', 'Österreich', 'Ungarn', 'Serbien', 'Bulgarien', 'Türkei'],
    baseKm: 2150,
    vignetteCost: 22,
    tollCost: 35,
    recommended: true,
    fees: [
      { type: 'vignette', country: '🇦🇹 Österreich', name: 'Autobahnvignette', cost: 15.40, note: '10 Tage digital — online kaufen vor Fahrt', required: true },
      { type: 'vignette', country: '🇭🇺 Ungarn', name: 'e-Matrica', cost: 6.50, note: '10 Tage — online oder an der Grenze', required: true },
      { type: 'toll', country: '🇷🇸 Serbien', name: 'Autobahnmaut', cost: 12.00, note: 'Bar oder Karte — ca. 12€ gesamt durch Serbien', required: true },
      { type: 'toll', country: '🇧🇬 Bulgarien', name: 'Vignette + Maut', cost: 10.50, note: 'e-Vignette 7 Tage — an der Grenze oder online', required: true },
      { type: 'toll', country: '🇹🇷 Türkei', name: 'HGS/OGS Transponder', cost: 15.00, note: 'Transponder an Kapıkule Grenze kaufen — ~15–25€ Guthaben aufladen', required: true },
      { type: 'info', country: '🇩🇪 Deutschland', name: 'Keine Maut', cost: 0, note: 'Autobahn kostenlos', required: false },
    ],
  },
  croatia_route: {
    name: 'Kroatien Route',
    flags: ['🇩🇪', '🇦🇹', '🇸🇮', '🇭🇷', '🇷🇸', '🇧🇬', '🇹🇷'],
    countries: ['Deutschland', 'Österreich', 'Slowenien', 'Kroatien', 'Serbien', 'Bulgarien', 'Türkei'],
    baseKm: 2380,
    vignetteCost: 31,
    tollCost: 55,
    recommended: false,
    fees: [
      { type: 'vignette', country: '🇦🇹 Österreich', name: 'Autobahnvignette', cost: 15.40, note: '10 Tage digital — online kaufen vor Fahrt', required: true },
      { type: 'vignette', country: '🇸🇮 Slowenien', name: 'DarsGo Vignette', cost: 15.50, note: '7 Tage — darsgo.si oder an der Grenze', required: true },
      { type: 'toll', country: '🇭🇷 Kroatien', name: 'Autobahnmaut', cost: 18.00, note: 'Bar/Karte — ca. 18€ für die gesamte Strecke', required: true },
      { type: 'toll', country: '🇭🇷 Kroatien', name: 'Učka Tunnel', cost: 8.00, note: 'Tunnel durch Ćićarija — Pflicht auf dieser Route', required: true },
      { type: 'toll', country: '🇷🇸 Serbien', name: 'Autobahnmaut', cost: 12.00, note: 'Bar oder Karte — ca. 12€', required: true },
      { type: 'toll', country: '🇧🇬 Bulgarien', name: 'Vignette + Maut', cost: 10.50, note: 'e-Vignette 7 Tage', required: true },
      { type: 'toll', country: '🇹🇷 Türkei', name: 'HGS/OGS Transponder', cost: 15.00, note: 'Transponder an Kapıkule Grenze', required: true },
    ],
  },
  greece_route: {
    name: 'Griechenland Route',
    flags: ['🇩🇪', '🇦🇹', '🇸🇮', '🇷🇸', '🇲🇰', '🇬🇷', '🇹🇷'],
    countries: ['Deutschland', 'Österreich', 'Slowenien', 'Serbien', 'Nordmazedonien', 'Griechenland', 'Türkei'],
    baseKm: 2450,
    vignetteCost: 31,
    tollCost: 65,
    recommended: false,
    fees: [
      { type: 'vignette', country: '🇦🇹 Österreich', name: 'Autobahnvignette', cost: 15.40, note: '10 Tage digital — online kaufen vor Fahrt', required: true },
      { type: 'vignette', country: '🇸🇮 Slowenien', name: 'DarsGo Vignette', cost: 15.50, note: '7 Tage — darsgo.si oder an der Grenze', required: true },
      { type: 'toll', country: '🇷🇸 Serbien', name: 'Autobahnmaut', cost: 12.00, note: 'Bar oder Karte — ca. 12€ gesamt', required: true },
      { type: 'info', country: '🇲🇰 Nordmazedonien', name: 'Keine Vignette', cost: 0, note: 'PKW kostenlos, kurze Durchfahrt', required: false },
      { type: 'toll', country: '🇬🇷 Griechenland', name: 'Autobahnmaut', cost: 30.00, note: 'Viele Mautstellen — Egnatia Odos & A1 ca. 30€', required: true },
      { type: 'toll', country: '🇬🇷 Griechenland', name: 'Athos / Evros Brücke', cost: 3.00, note: 'Brückenmaut an der TR-Grenze', required: true },
      { type: 'toll', country: '🇹🇷 Türkei', name: 'HGS/OGS Transponder', cost: 15.00, note: 'Transponder an İpsala Grenze kaufen', required: true },
    ],
  },
  romania_route: {
    name: 'Rumänien Route',
    flags: ['🇩🇪', '🇦🇹', '🇭🇺', '🇷🇴', '🇧🇬', '🇹🇷'],
    countries: ['Deutschland', 'Österreich', 'Ungarn', 'Rumänien', 'Bulgarien', 'Türkei'],
    baseKm: 2290,
    vignetteCost: 34,
    tollCost: 30,
    recommended: false,
    fees: [
      { type: 'vignette', country: '🇦🇹 Österreich', name: 'Autobahnvignette', cost: 15.40, note: '10 Tage digital — online kaufen vor Fahrt', required: true },
      { type: 'vignette', country: '🇭🇺 Ungarn', name: 'e-Matrica', cost: 6.50, note: '10 Tage — online oder an der Grenze', required: true },
      { type: 'vignette', country: '🇷🇴 Rumänien', name: 'Rovinieta', cost: 12.00, note: '7 Tage — roviniete.ro oder an der Grenze', required: true },
      { type: 'toll', country: '🇷🇴 Rumänien', name: 'Cernavodă Brücke', cost: 3.00, note: 'Mautbrücke über die Donau', required: true },
      { type: 'toll', country: '🇧🇬 Bulgarien', name: 'Vignette + Maut', cost: 10.50, note: 'e-Vignette 7 Tage', required: true },
      { type: 'toll', country: '🇧🇬 Bulgarien', name: 'Drossia-Grenzbrücke (BG/TR)', cost: 6.00, note: 'Brückenmaut Bulgarien–Türkei Grenze', required: true },
      { type: 'toll', country: '🇹🇷 Türkei', name: 'HGS/OGS Transponder', cost: 15.00, note: 'Transponder an Kapıkule Grenze', required: true },
    ],
  },
}

// Verified city-to-Istanbul distances (one-way road km, not straight line)
const DEST_DISTANCES = {
  istanbul: 0,
  izmir: 480,       // Istanbul → Izmir via TEM/O-4: ~480km
  ankara: 453,      // Istanbul → Ankara TEM: ~453km
  bursa: 245,       // Istanbul → Bursa: ~245km
  antalya: 735,     // Istanbul → Antalya: ~735km
  konya: 660,       // Istanbul → Konya: ~660km
  adana: 940,       // Istanbul → Adana: ~940km
  gaziantep: 1100,  // Istanbul → Gaziantep: ~1100km
  trabzon: 1100,    // Istanbul → Trabzon (Black Sea): ~1100km
  samsun: 730,      // Istanbul → Samsun: ~730km
  kayseri: 770,     // Istanbul → Kayseri: ~770km
  sivas: 900,       // Istanbul → Sivas: ~900km
  erzurum: 1300,    // Istanbul → Erzurum: ~1300km
  diyarbakir: 1350, // Istanbul → Diyarbakir: ~1350km
  bodrum: 870,      // Istanbul → Bodrum: ~870km
  kusadasi: 620,    // Istanbul → Kuşadası: ~620km
  marmaris: 840,    // Istanbul → Marmaris: ~840km
  cesme: 560,       // Istanbul → Çeşme: ~560km
  fethiye: 790,     // Istanbul → Fethiye: ~790km
}

// Verified start city offsets from Munich base
const START_OFFSETS = {
  münchen: 0, munich: 0,
  berlin: 290, hamburg: 490, frankfurt: 170, stuttgart: 90,
  köln: 330, cologne: 330, düsseldorf: 350, dortmund: 370, hannover: 390,
  paris: 830, lyon: 720, marseille: 890,
  amsterdam: 850, rotterdam: 830,
  brüssel: 720, brussels: 720, antwerpen: 740,
  zürich: 110, zuerich: 110, bern: 200, basel: 160, genf: 340,
  wien: 340, vienna: 340,
  warschau: 830, warsaw: 830, krakau: 690, krakow: 690,
  prag: 380, prague: 380,
  budapest: 500,
  rom: 800, rome: 800, mailand: 390, milan: 390, florenz: 530,
  madrid: 1650, barcelona: 1150,
  london: 1200,
  kopenhagen: 860, copenhagen: 860,
  stockholm: 1350,
  luxemburg: 530,
}

function getOffset(city, map) {
  const key = city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(',')[0].trim()
  for (const [k, v] of Object.entries(map)) {
    const kn = k.normalize('NFD').replace(/[̀-ͯ]/g, '')
    if (key.includes(kn) || kn.includes(key)) return v
  }
  return null
}

function calcRouteKm(routeKey, startCity, destCity) {
  const r = ROUTE_DATA[routeKey]
  if (!r) return null
  const startOffset = getOffset(startCity, START_OFFSETS) ?? 0
  const destOffset = getOffset(destCity, DEST_DISTANCES) ?? 0
  return r.baseKm + startOffset + destOffset
}

// Per-route tank stop checkpoints (km from Munich, flag, city, note, tip=highlight)
const TANK_STOPS = {
  austria_hungary: [
    { km: 480, flag: '🇩🇪', city: 'Salzburg / Rosenheim (DE)', note: 'Letzter günstiger DE-Preis vor Österreich' },
    { km: 640, flag: '🇦🇹', city: 'Graz (AT)', note: 'Vor Ungarn — AT günstiger als HU auf Autobahn' },
    { km: 900, flag: '🇭🇺', city: 'Budapest (HU)', note: 'MOL Tankstellen — staatlich gedeckelter Preis', tip: true },
    { km: 1250, flag: '🇷🇸', city: 'Niš (RS)', note: '★ Günstigste Station — hier voll tanken!', tip: true },
    { km: 1650, flag: '🇧🇬', city: 'Sofia (BG)', note: 'Letzte Station vor türkischer Grenze' },
  ],
  croatia_route: [
    { km: 480, flag: '🇩🇪', city: 'Salzburg / Rosenheim (DE)', note: 'Letzter günstiger DE-Preis' },
    { km: 700, flag: '🇸🇮', city: 'Ljubljana (SI)', note: 'Slowenien — günstiger als Kroatien' },
    { km: 950, flag: '🇭🇷', city: 'Zagreb (HR)', note: 'INA Tankstellen — vor der langen HR-Strecke' },
    { km: 1300, flag: '🇭🇷', city: 'Split / Slavonski Brod (HR)', note: 'Vor Grenzübertritt nach Serbien', tip: true },
    { km: 1600, flag: '🇷🇸', city: 'Belgrad (RS)', note: 'NIS — günstigster Diesel der Route', tip: true },
    { km: 1950, flag: '🇧🇬', city: 'Sofia (BG)', note: 'Letzte Station vor türkischer Grenze' },
  ],
  romania_route: [
    { km: 480, flag: '🇩🇪', city: 'Salzburg / Rosenheim (DE)', note: 'Letzter günstiger DE-Preis' },
    { km: 850, flag: '🇭🇺', city: 'Budapest (HU)', note: 'MOL — staatlich gedeckelt, günstig', tip: true },
    { km: 1100, flag: '🇷🇴', city: 'Oradea / Cluj-Napoca (RO)', note: 'Rumänien — günstiger als DE & AT' },
    { km: 1450, flag: '🇷🇴', city: 'Bukarest (RO)', note: '★ Günstigster Diesel der Route — voll tanken!', tip: true },
    { km: 1750, flag: '🇧🇬', city: 'Varna / Russe (BG)', note: 'Nach Grenzübertritt BG — vor langer BG-Strecke' },
  ],
  greece_route: [
    { km: 480, flag: '🇩🇪', city: 'Salzburg / Rosenheim (DE)', note: 'Letzter günstiger DE-Preis' },
    { km: 700, flag: '🇸🇮', city: 'Ljubljana (SI)', note: 'Slowenien — günstiger als GR' },
    { km: 1100, flag: '🇷🇸', city: 'Belgrad (RS)', note: 'NIS — günstigster Diesel der Route', tip: true },
    { km: 1600, flag: '🇲🇰', city: 'Skopje (MK)', note: 'Nordmazedonien — günstige Preise' },
    { km: 1900, flag: '🇬🇷', city: 'Thessaloniki (GR)', note: '★ Vor teurer GR-Autobahn — hier voll tanken!', tip: true },
  ],
}

// Speed limits per country on the route
const SPEED_LIMITS = {
  austria_hungary: [
    { flag: '🇩🇪', country: 'Deutschland', autobahn: '130*', land: '100', ort: '50' },
    { flag: '🇦🇹', country: 'Österreich', autobahn: '130', land: '100', ort: '50' },
    { flag: '🇭🇺', country: 'Ungarn', autobahn: '130', land: '90', ort: '50' },
    { flag: '🇷🇸', country: 'Serbien', autobahn: '130', land: '80', ort: '50' },
    { flag: '🇧🇬', country: 'Bulgarien', autobahn: '140', land: '90', ort: '50' },
    { flag: '🇹🇷', country: 'Türkei', autobahn: '120', land: '90', ort: '50' },
  ],
  croatia_route: [
    { flag: '🇩🇪', country: 'Deutschland', autobahn: '130*', land: '100', ort: '50' },
    { flag: '🇦🇹', country: 'Österreich', autobahn: '130', land: '100', ort: '50' },
    { flag: '🇸🇮', country: 'Slowenien', autobahn: '130', land: '90', ort: '50' },
    { flag: '🇭🇷', country: 'Kroatien', autobahn: '130', land: '90', ort: '50' },
    { flag: '🇷🇸', country: 'Serbien', autobahn: '130', land: '80', ort: '50' },
    { flag: '🇧🇬', country: 'Bulgarien', autobahn: '140', land: '90', ort: '50' },
    { flag: '🇹🇷', country: 'Türkei', autobahn: '120', land: '90', ort: '50' },
  ],
  romania_route: [
    { flag: '🇩🇪', country: 'Deutschland', autobahn: '130*', land: '100', ort: '50' },
    { flag: '🇦🇹', country: 'Österreich', autobahn: '130', land: '100', ort: '50' },
    { flag: '🇭🇺', country: 'Ungarn', autobahn: '130', land: '90', ort: '50' },
    { flag: '🇷🇴', country: 'Rumänien', autobahn: '130', land: '90', ort: '50' },
    { flag: '🇧🇬', country: 'Bulgarien', autobahn: '140', land: '90', ort: '50' },
    { flag: '🇹🇷', country: 'Türkei', autobahn: '120', land: '90', ort: '50' },
  ],
  greece_route: [
    { flag: '🇩🇪', country: 'Deutschland', autobahn: '130*', land: '100', ort: '50' },
    { flag: '🇦🇹', country: 'Österreich', autobahn: '130', land: '100', ort: '50' },
    { flag: '🇸🇮', country: 'Slowenien', autobahn: '130', land: '90', ort: '50' },
    { flag: '🇷🇸', country: 'Serbien', autobahn: '130', land: '80', ort: '50' },
    { flag: '🇲🇰', country: 'Nordmazedonien', autobahn: '120', land: '80', ort: '50' },
    { flag: '🇬🇷', country: 'Griechenland', autobahn: '130', land: '90', ort: '50' },
    { flag: '🇹🇷', country: 'Türkei', autobahn: '120', land: '90', ort: '50' },
  ],
}

function calcTankStops(routeKey, totalKm, fuelType = 'diesel') {
  const stops = TANK_STOPS[routeKey] || TANK_STOPS.austria_hungary
  const prices = getPricesForRoute(routeKey, fuelType)
  // Map country flag emoji → country code
  const flagToCode = { '🇩🇪': 'DE', '🇦🇹': 'AT', '🇭🇺': 'HU', '🇸🇮': 'SI', '🇭🇷': 'HR', '🇷🇸': 'RS', '🇧🇬': 'BG', '🇷🇴': 'RO', '🇲🇰': 'MK', '🇬🇷': 'GR', '🇹🇷': 'TR' }
  return stops
    .filter(s => s.km < totalKm + 300)
    .map(s => {
      const code = flagToCode[s.flag]
      const priceData = code ? prices[code] : null
      return { ...s, price: priceData?.price ?? null }
    })
}

router.post('/calculate', async (req, res) => {
  const { start, dest, routeKey = 'austria_hungary', consumption = 8, fuelPrice = 1.65, tankSize = 60, avoidToll = false, fuel = 'diesel' } = req.body

  if (!start || !dest) return res.status(400).json({ error: 'start and dest required' })

  const route = ROUTE_DATA[routeKey]
  if (!route) return res.status(400).json({ error: 'invalid routeKey' })

  const totalKm = calcRouteKm(routeKey, start, dest)
  const hours = Math.round((totalKm / 90) + route.countries.length * 0.8)
  const countryPrices = getPricesForRoute(routeKey, fuel)
  // Weighted average fuel cost across countries
  const codes = ROUTE_COUNTRIES[routeKey] || []
  const avgPrice = codes.length
    ? codes.reduce((sum, c) => sum + (countryPrices[c]?.price ?? fuelPrice), 0) / codes.length
    : fuelPrice
  const fuelCost = Math.round((totalKm / 100) * consumption * avgPrice)
  const tollCost = avoidToll ? 0 : route.tollCost
  const vignetteCost = route.vignetteCost
  const totalCost = fuelCost + tollCost + vignetteCost

  const tankStops = calcTankStops(routeKey, totalKm, fuel)
  const speedLimits = SPEED_LIMITS[routeKey] || SPEED_LIMITS.austria_hungary
  const litersNeeded = Math.round((totalKm / 100) * consumption)

  // Build country price summary for AI
  const priceLines = codes
    .map(c => countryPrices[c] ? `  ${countryPrices[c].flag} ${countryPrices[c].name}: ${countryPrices[c].price.toFixed(2)} €/L` : null)
    .filter(Boolean).join('\n')

  const stopLines = tankStops
    .map(s => `  ${s.flag} ${s.city} (~${s.km}km)${s.price ? ` — ${s.price.toFixed(2)} €/L` : ''}`)
    .join('\n')

  // AI enrichment if available
  let aiTips = null
  let aiTankStops = null
  if (openai) {
    try {
      const prompt = `Du bist ein erfahrener Sıla Yolu Reiseexperte. Gib praktische Reisetipps für diese Fahrt.

Route: ${start} → ${dest} via ${route.countries.join(' → ')}
Strecke: ${totalKm} km, ~${hours}h Fahrzeit
Kraftstoff: ${fuel === 'diesel' ? 'Diesel' : 'Benzin'}, ${consumption}L/100km, ${litersNeeded}L gesamt, Tank: ${tankSize}L

Aktuelle Spritpreise pro Land (${fuel === 'diesel' ? 'Diesel' : 'Benzin'}):
${priceLines}

Vorgeschlagene Tankstopps:
${stopLines}

Gib genau 5 konkrete Tipps als JSON array mit je 1-2 Sätzen.
Themen: 1) Beste Abfahrtszeit & Fahrtplanung  2) Grenzwartezeiten & Wochentag-Tipps  3) Optimale Tankstrategie basierend auf den Preisen oben (wo günstig voll tanken, wo nur kurz nachtanken)  4) Wichtige Dokumente & Vorbereitungen  5) Pausen & Übernachtung empfehlung.
Auf Deutsch. NUR JSON array zurückgeben: ["tip1","tip2","tip3","tip4","tip5"]`

      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = resp.choices[0].message.content.trim()
      aiTips = JSON.parse(text.replace(/```json|```/g, '').trim())
    } catch { aiTips = null }

    // AI-optimized tank stops
    try {
      const stopPrompt = `Du bist ein Experte für Kraftstoffoptimierung auf Langstreckenreisen.

Route: ${start} → ${dest}
Strecke: ${totalKm} km
Tankgröße: ${tankSize} L, Verbrauch: ${consumption} L/100km (Reichweite: ${Math.round(tankSize / consumption * 100)} km pro Tank)

Aktuelle ${fuel === 'diesel' ? 'Diesel' : 'Benzin'}preise pro Land:
${priceLines}

Berechne die optimalen Tankstopps um die Gesamtspritkosten zu minimieren.
Berücksichtige: Tankreichweite, Preisunterschiede zwischen Ländern, dass man in günstigeren Ländern mehr tanken sollte.

Antworte NUR mit einem JSON Array mit Objekten:
[{"flag":"🇩🇪","city":"München (DE)","km":0,"action":"Voll tanken","reason":"Günstiger als Österreich","price":1.70,"liters":60},...]

Regeln:
- Nur realistische Stopps auf der Route (nutze vorhandene Städte auf der Route)
- km = km vom Start
- liters = empfohlene Liter zum Tanken
- Maximal 5-6 Stopps
- NUR JSON zurückgeben`

      const resp2 = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 600,
        messages: [{ role: 'user', content: stopPrompt }],
      })
      const text2 = resp2.choices[0].message.content.trim()
      aiTankStops = JSON.parse(text2.replace(/```json|```/g, '').trim())
    } catch { aiTankStops = null }
  }

  res.json({
    totalKm, hours, fuelCost, tollCost, vignetteCost, totalCost, litersNeeded,
    route: { key: routeKey, name: route.name, flags: route.flags, countries: route.countries, fees: route.fees, recommended: route.recommended },
    tankStops, aiTankStops, speedLimits, aiTips, countryPrices,
  })
})

// All routes comparison
router.post('/compare', async (req, res) => {
  const { start, dest, consumption = 8, fuelPrice = 1.65, avoidToll = false, fuel = 'diesel' } = req.body
  if (!start || !dest) return res.status(400).json({ error: 'start and dest required' })

  const results = Object.entries(ROUTE_DATA).map(([key, r]) => {
    const km = calcRouteKm(key, start, dest)
    const hours = Math.round((km / 90) + r.countries.length * 0.8)
    const countryPrices = getPricesForRoute(key, fuel)
    const codes = ROUTE_COUNTRIES[key] || []
    const avgPrice = codes.length
      ? codes.reduce((sum, c) => sum + (countryPrices[c]?.price ?? fuelPrice), 0) / codes.length
      : fuelPrice
    const fuelCost = Math.round((km / 100) * consumption * avgPrice)
    const tollCost = avoidToll ? 0 : r.tollCost
    const total = fuelCost + tollCost + r.vignetteCost
    const tankStops = calcTankStops(key, km, fuel)
    const speedLimits = SPEED_LIMITS[key] || SPEED_LIMITS.austria_hungary
    return { key, name: r.name, flags: r.flags, countries: r.countries, km, hours, fuelCost, tollCost, vignetteCost: r.vignetteCost, total, fees: r.fees, recommended: r.recommended, tankStops, speedLimits, countryPrices }
  })

  res.json({ routes: results, start, dest })
})

export default router
