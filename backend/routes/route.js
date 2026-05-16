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
    tollCost: 62,
    recommended: false,
    fees: [
      { type: 'vignette', country: '🇦🇹 Österreich', name: 'Autobahnvignette', cost: 15.40, note: '10 Tage digital — online kaufen vor Fahrt', required: true },
      { type: 'tunnel', country: '🇦🇹 Österreich', name: 'Karawankentunnel (AT/SI)', cost: 7.90, note: 'Grenztunnel zwischen Österreich und Slowenien — Maut an Kabine', required: true },
      { type: 'vignette', country: '🇸🇮 Slowenien', name: 'DarsGo Vignette', cost: 15.50, note: '7 Tage — darsgo.si oder an der Grenze', required: true },
      { type: 'toll', country: '🇭🇷 Kroatien', name: 'Autobahnmaut', cost: 18.00, note: 'Bar/Karte — ca. 18€ für die gesamte Strecke', required: true },
      { type: 'tunnel', country: '🇭🇷 Kroatien', name: 'Učka Tunnel', cost: 8.00, note: 'Tunnel durch Ćićarija auf der Küstenroute', required: true },
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
    tollCost: 73,
    recommended: false,
    fees: [
      { type: 'vignette', country: '🇦🇹 Österreich', name: 'Autobahnvignette', cost: 15.40, note: '10 Tage digital — online kaufen vor Fahrt', required: true },
      { type: 'tunnel', country: '🇦🇹 Österreich', name: 'Karawankentunnel (AT/SI)', cost: 7.90, note: 'Grenztunnel zwischen Österreich und Slowenien', required: true },
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
  istanbul: 0, kapikule: 0, kapiküle: 0, kapıkule: 0,
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

// Country code from city name — used to skip fees for already-passed countries
const CITY_COUNTRY = {
  wien: 'AT', vienna: 'AT', graz: 'AT', salzburg: 'AT', linz: 'AT', innsbruck: 'AT',
  budapest: 'HU', debrecen: 'HU',
  zagreb: 'HR', split: 'HR',
  ljubljana: 'SI',
  belgrad: 'RS', beograd: 'RS', nis: 'RS', novi: 'RS',
  sofia: 'BG', plovdiv: 'BG', varna: 'BG',
  bukarest: 'RO', bucharest: 'RO', cluj: 'RO', timisoara: 'RO',
  skopje: 'MK',
  athen: 'GR', athens: 'GR', thessaloniki: 'GR',
  istanbul: 'TR', ankara: 'TR', izmir: 'TR', bursa: 'TR', antalya: 'TR',
  paris: 'FR', lyon: 'FR', marseille: 'FR',
  amsterdam: 'NL', rotterdam: 'NL',
  brüssel: 'BE', brussels: 'BE',
  zürich: 'CH', zuerich: 'CH', bern: 'CH', basel: 'CH',
  prag: 'CZ', prague: 'CZ',
  warschau: 'PL', warsaw: 'PL', krakau: 'PL',
  london: 'GB',
  madrid: 'ES', barcelona: 'ES',
}

// Country flag prefix → country code mapping for fees
const FEE_COUNTRY_CODE = {
  '🇦🇹': 'AT', '🇭🇺': 'HU', '🇸🇮': 'SI', '🇭🇷': 'HR',
  '🇷🇸': 'RS', '🇧🇬': 'BG', '🇷🇴': 'RO', '🇲🇰': 'MK',
  '🇬🇷': 'GR', '🇹🇷': 'TR', '🇩🇪': 'DE', '🇫🇷': 'FR',
}

// Route country order — fees for countries already passed (start is in/past them) are skipped
const ROUTE_ORDER = {
  austria_hungary: ['DE', 'AT', 'HU', 'RS', 'BG', 'TR'],
  croatia_route:   ['DE', 'AT', 'SI', 'HR', 'RS', 'BG', 'TR'],
  romania_route:   ['DE', 'AT', 'HU', 'RO', 'BG', 'TR'],
  greece_route:    ['DE', 'AT', 'SI', 'RS', 'MK', 'GR', 'TR'],
}

function adjustFeesForStart(fees, routeKey, startCity) {
  const key = startCity.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(',')[0].trim()
  let startCountry = null
  for (const [city, cc] of Object.entries(CITY_COUNTRY)) {
    if (key.includes(city) || city.includes(key)) { startCountry = cc; break }
  }
  if (!startCountry || startCountry === 'DE') return fees

  const order = ROUTE_ORDER[routeKey] || []
  const startIdx = order.indexOf(startCountry)
  if (startIdx <= 0) return fees

  // Countries already passed (including start country — no need to buy their vignette/toll if already there)
  const passed = new Set(order.slice(0, startIdx))

  return fees.map(fee => {
    const flagMatch = fee.country?.match(/[\u{1F1E0}-\u{1F1FF}]{2}/u)?.[0]
    const cc = flagMatch ? FEE_COUNTRY_CODE[flagMatch] : null
    if (!cc || !passed.has(cc)) return fee
    return {
      ...fee,
      cost: 0,
      note: `Nicht benötigt — Startort liegt bereits in/nach ${fee.country.replace(/[\u{1F1E0}-\u{1F1FF}]{2}/u, '').trim()}`,
      required: false,
    }
  })
}

// Extra fees for travelers starting outside Germany (prepended to route fees)
function getExtraFeesForStart(startCity) {
  const key = startCity.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(',')[0].trim()
  const extra = []

  const isGB = key.includes('london') || key.includes('england') || key.includes('birmingham') || key.includes('manchester') || key.includes('leeds') || key.includes('glasgow')
  const isFR = ['paris', 'lyon', 'marseille', 'lille', 'bordeaux', 'strasbourg', 'toulouse', 'nantes'].some(c => key.includes(c))
  const isNL = ['amsterdam', 'rotterdam', 'utrecht', 'eindhoven', 'den haag', 'haag'].some(c => key.includes(c))
  const isBE = ['brüssel', 'brussels', 'bruxelles', 'antwerpen', 'antwerp', 'gent', 'ghent', 'liège'].some(c => key.includes(c))
  const isCH = ['zürich', 'zuerich', 'zurich', 'bern', 'basel', 'genf', 'geneva', 'lausanne'].some(c => key.includes(c))
  const isPL = ['warschau', 'warsaw', 'krakau', 'krakow', 'poznan', 'breslau', 'wroclaw'].some(c => key.includes(c))
  const isDK = ['kopenhagen', 'copenhagen', 'aarhus', 'odense'].some(c => key.includes(c))
  const isSE = ['stockholm', 'göteborg', 'gothenburg', 'malmö', 'malmo'].some(c => key.includes(c))
  const isES = ['madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao', 'zaragoza'].some(c => key.includes(c))
  const isIT = ['rom', 'rome', 'mailand', 'milan', 'florenz', 'florence', 'neapel', 'naples', 'venedig', 'venice', 'turin'].some(c => key.includes(c))

  if (isGB) {
    extra.push({ type: 'tunnel', country: '🇬🇧 England', name: 'Eurotunnel / Fähre (Dover–Calais)', cost: 45, note: 'Folkestone → Coquelles via Eurotunnel (~35min) oder Fähre (~90min) — Preise je nach Buchung 30–70€', required: true })
    extra.push({ type: 'info', country: '🇬🇧 England', name: 'UK → FR: Keine Vignette', cost: 0, note: 'Großbritannien hat keine Autobahngebühren — Eurotunnel/Fähre ist die einzige Hauptkosten', required: false })
  }

  if (isFR) {
    const dist = isFR && (key.includes('paris') || key.includes('reims') || key.includes('strasbourg') || key.includes('lille')) ? 'bis zur deutschen Grenze' : 'bis München'
    extra.push({ type: 'toll', country: '🇫🇷 Frankreich', name: 'Autoroute Maut (FR)', cost: key.includes('marseille') ? 70 : key.includes('lyon') ? 50 : 35, note: `Mautstellen auf französischen Autobahnen ${dist} — ca. 35–70€ je nach Route (A4/A6/A36)`, required: true })
  }

  if (isGB && !isFR) {
    // After Eurotunnel, France section to German border
    extra.push({ type: 'toll', country: '🇫🇷 Frankreich', name: 'Autoroute Maut (Calais→DE)', cost: 30, note: 'Maut auf der A26/A4 von Calais zur deutschen Grenze — ca. 25–35€', required: true })
  }

  if (isCH) {
    extra.push({ type: 'vignette', country: '🇨🇭 Schweiz', name: 'Autobahnvignette CH', cost: 43, note: 'Jahresvignette 40 CHF (~43€) — obligatorisch, an der Grenze oder online', required: true })
  }

  if (isPL) {
    extra.push({ type: 'vignette', country: '🇵🇱 Polen', name: 'e-TOLL Polen', cost: 8, note: 'Elektronische Maut auf Autobahnen in Polen — ca. 5–15€ je nach Route', required: true })
  }

  if (isDK) {
    extra.push({ type: 'tunnel', country: '🇩🇰 Dänemark', name: 'Øresundbrücke oder Fähre', cost: 65, note: 'Øresundbrücke Kopenhagen→Malmö (50€) + Fehmarnbelt-Fähre (15€) oder nur Vogelfluglinie-Fähre', required: true })
  }

  if (isSE) {
    extra.push({ type: 'tunnel', country: '🇸🇪 Schweden', name: 'Øresundbrücke (Malmö→Kopenhagen)', cost: 65, note: 'Øresundbrücke 50€ + Fähre nach Deutschland 15€ — alternativ Göteborg→Kiel Fähre (~100€', required: true })
  }

  if (isES) {
    const esToll = key.includes('madrid') ? 80 : key.includes('barcelona') ? 40 : 65
    extra.push({ type: 'toll', country: '🇪🇸 Spanien', name: 'Autopista Maut (ES)', cost: esToll, note: `Mautstrecken auf spanischen Autobahnen — ca. ${esToll}€ bis zur französischen Grenze`, required: true })
    extra.push({ type: 'toll', country: '🇫🇷 Frankreich', name: 'Autoroute Maut (ES→DE)', cost: 55, note: 'Spanische Grenze bis Deutschland via A9/A6/A4 — ca. 45–65€', required: true })
  }

  if (isIT) {
    const itToll = key.includes('rom') || key.includes('rome') || key.includes('neap') ? 60 : key.includes('florenz') || key.includes('florence') ? 40 : 25
    extra.push({ type: 'toll', country: '🇮🇹 Italien', name: 'Autostrada Maut (IT)', cost: itToll, note: `Maut auf italienischen Autobahnen — ca. ${itToll}€ bis zur österreichischen/deutschen Grenze`, required: true })
    if (key.includes('rom') || key.includes('rome') || key.includes('neap') || key.includes('florenz') || key.includes('florence') || key.includes('venedig') || key.includes('venice')) {
      extra.push({ type: 'tunnel', country: '🇮🇹 Italien', name: 'Brenner-Pass oder Tauerntunnel', cost: 12, note: 'Brenner (A22, ca. 12€) oder Tauernautobahn nach Österreich — je nach Route', required: true })
    }
  }

  // NL and BE: no extra fees (toll-free motorways)
  if (isNL && extra.length === 0) {
    extra.push({ type: 'info', country: '🇳🇱 Niederlande', name: 'Keine Maut in NL', cost: 0, note: 'Niederländische Autobahnen sind mautfrei — keine Extrakosten bis zur deutschen Grenze', required: false })
  }
  if (isBE && extra.length === 0) {
    extra.push({ type: 'info', country: '🇧🇪 Belgien', name: 'Keine Maut in BE', cost: 0, note: 'Belgische Autobahnen sind mautfrei — keine Extrakosten bis zur deutschen Grenze', required: false })
  }

  return extra
}

// Detailed waypoints per route — cities, borders, km from Munich
const ROUTE_WAYPOINTS = {
  austria_hungary: [
    { type: 'city',   flag: '🇩🇪', name: 'München',          km: 0,    note: 'Start · A8 Richtung Salzburg' },
    { type: 'city',   flag: '🇩🇪', name: 'Rosenheim',         km: 60,   note: 'Letzte günstige DE-Tankstellen' },
    { type: 'border', flag: '🇩🇪🇦🇹', name: 'Grenze DE/AT',  km: 130,  note: 'Salzburg-Nord · Keine Kontrolle (Schengen) · Vignette kaufen!' },
    { type: 'city',   flag: '🇦🇹', name: 'Salzburg',          km: 135,  note: 'A1 Richtung Wien · Raststätte empfohlen' },
    { type: 'city',   flag: '🇦🇹', name: 'Graz',              km: 320,  note: 'A2 Richtung Spielfeld · Tanken vor HU empfohlen' },
    { type: 'border', flag: '🇦🇹🇭🇺', name: 'Grenze AT/HU',  km: 450,  note: 'Hegyeshalom · Passkontrollen möglich · e-Matrica kaufen' },
    { type: 'city',   flag: '🇭🇺', name: 'Budapest',          km: 560,  note: 'M1/M5 Richtung Kelebia · MOL Tankstellen empfohlen' },
    { type: 'border', flag: '🇭🇺🇷🇸', name: 'Grenze HU/RS',  km: 720,  note: 'Horgoš-Röszke · Oft Wartezeit 30–120 Min!' },
    { type: 'city',   flag: '🇷🇸', name: 'Novi Sad',          km: 780,  note: 'A1 Richtung Belgrad' },
    { type: 'city',   flag: '🇷🇸', name: 'Belgrad',           km: 880,  note: 'Kreuzung A1/A2 · Gute Raststätten' },
    { type: 'city',   flag: '🇷🇸', name: 'Niš',               km: 1050, note: '★ Günstigster Diesel — voll tanken! NIS Tankstellen' },
    { type: 'border', flag: '🇷🇸🇧🇬', name: 'Grenze RS/BG',  km: 1180, note: 'Gradina-Kalotina · Passkontrollen · e-Vignette kaufen' },
    { type: 'city',   flag: '🇧🇬', name: 'Sofia',             km: 1280, note: 'A4 Richtung Plovdiv · Lukoil/OMV Stationen' },
    { type: 'city',   flag: '🇧🇬', name: 'Plovdiv',           km: 1430, note: 'Letzte große Stadt vor TR-Grenze' },
    { type: 'border', flag: '🇧🇬🇹🇷', name: 'Grenze BG/TR',  km: 1580, note: 'Kapıkule · Wartezeit 1–4h · HGS kaufen · Passcheck' },
    { type: 'city',   flag: '🇹🇷', name: 'Edirne',            km: 1590, note: 'Erste TR-Stadt · Wechsel zu TL · Tanken möglich' },
    { type: 'city',   flag: '🇹🇷', name: 'İstanbul',          km: 1900, note: 'Ziel via TEM Autobahn (O-1/O-2)' },
  ],
  croatia_route: [
    { type: 'city',   flag: '🇩🇪', name: 'München',           km: 0,    note: 'Start · A8 Richtung Salzburg' },
    { type: 'border', flag: '🇩🇪🇦🇹', name: 'Grenze DE/AT',  km: 130,  note: 'Salzburg · Vignette kaufen' },
    { type: 'city',   flag: '🇦🇹', name: 'Salzburg',          km: 135,  note: 'A10 Richtung Villach' },
    { type: 'city',   flag: '🇦🇹', name: 'Villach',           km: 330,  note: 'Vor Karawankentunnel — Maut zahlen' },
    { type: 'border', flag: '🇦🇹🇸🇮', name: 'Grenze AT/SI',  km: 360,  note: 'Karawankentunnel (7,90€) · DarsGo Vignette kaufen' },
    { type: 'city',   flag: '🇸🇮', name: 'Ljubljana',         km: 430,  note: 'A1/E70 Richtung Zagreb · Günstiger tanken' },
    { type: 'border', flag: '🇸🇮🇭🇷', name: 'Grenze SI/HR',  km: 520,  note: 'Bregana · Schengen-intern · HR Maut beginnt' },
    { type: 'city',   flag: '🇭🇷', name: 'Zagreb',            km: 560,  note: 'A3 Richtung Slavonski Brod · INA tanken' },
    { type: 'city',   flag: '🇭🇷', name: 'Slavonski Brod',    km: 800,  note: '★ Vor RS-Grenze voll tanken!' },
    { type: 'border', flag: '🇭🇷🇷🇸', name: 'Grenze HR/RS',  km: 850,  note: 'Stara Gradiška · Passkontrollen' },
    { type: 'city',   flag: '🇷🇸', name: 'Belgrad',           km: 980,  note: 'NIS-Tankstellen · Weiter A1 Richtung Niš' },
    { type: 'city',   flag: '🇷🇸', name: 'Niš',               km: 1150, note: '★ Günstigster Diesel!' },
    { type: 'border', flag: '🇷🇸🇧🇬', name: 'Grenze RS/BG',  km: 1280, note: 'Gradina-Kalotina · e-Vignette kaufen' },
    { type: 'city',   flag: '🇧🇬', name: 'Sofia',             km: 1380, note: 'Letzte große Stadt vor TR' },
    { type: 'border', flag: '🇧🇬🇹🇷', name: 'Grenze BG/TR',  km: 1750, note: 'Kapıkule · HGS kaufen · Wartezeit einplanen' },
    { type: 'city',   flag: '🇹🇷', name: 'İstanbul',          km: 2100, note: 'Ziel' },
  ],
  romania_route: [
    { type: 'city',   flag: '🇩🇪', name: 'München',           km: 0,    note: 'Start · A8/A9 Richtung Wien' },
    { type: 'border', flag: '🇩🇪🇦🇹', name: 'Grenze DE/AT',  km: 130,  note: 'Salzburg · Vignette kaufen' },
    { type: 'city',   flag: '🇦🇹', name: 'Wien',              km: 450,  note: 'A1/E60 Richtung Hegyeshalom · Tanken empfohlen' },
    { type: 'border', flag: '🇦🇹🇭🇺', name: 'Grenze AT/HU',  km: 510,  note: 'Hegyeshalom · e-Matrica kaufen' },
    { type: 'city',   flag: '🇭🇺', name: 'Budapest',          km: 620,  note: 'M0 Ring · Richtung M35 / Debrecen' },
    { type: 'border', flag: '🇭🇺🇷🇴', name: 'Grenze HU/RO',  km: 820,  note: 'Borș/Csanádpalota · Rovinieta kaufen' },
    { type: 'city',   flag: '🇷🇴', name: 'Cluj-Napoca',       km: 950,  note: 'A3 Richtung Bukarest · Günstig tanken' },
    { type: 'city',   flag: '🇷🇴', name: 'Bukarest',          km: 1250, note: '★ Günstigster Diesel der Route — voll tanken!' },
    { type: 'border', flag: '🇷🇴🇧🇬', name: 'Grenze RO/BG',  km: 1380, note: 'Giurgiu-Ruse Brücke (Donau) · e-Vignette kaufen' },
    { type: 'city',   flag: '🇧🇬', name: 'Varna / Russe',     km: 1480, note: 'Schwarzmeer-Küste oder Richtung Sofia/TR' },
    { type: 'border', flag: '🇧🇬🇹🇷', name: 'Grenze BG/TR',  km: 1700, note: 'Kapıkule · HGS kaufen' },
    { type: 'city',   flag: '🇹🇷', name: 'İstanbul',          km: 2000, note: 'Ziel' },
  ],
  greece_route: [
    { type: 'city',   flag: '🇩🇪', name: 'München',           km: 0,    note: 'Start · A8 Richtung Salzburg' },
    { type: 'border', flag: '🇩🇪🇦🇹', name: 'Grenze DE/AT',  km: 130,  note: 'Vignette kaufen' },
    { type: 'city',   flag: '🇦🇹', name: 'Villach',           km: 330,  note: 'Vor Karawankentunnel' },
    { type: 'border', flag: '🇦🇹🇸🇮', name: 'Grenze AT/SI',  km: 360,  note: 'Karawankentunnel 7,90€ · DarsGo kaufen' },
    { type: 'city',   flag: '🇸🇮', name: 'Ljubljana',         km: 430,  note: 'E75 Richtung Belgrad' },
    { type: 'border', flag: '🇸🇮🇷🇸', name: 'Grenze SI/RS',  km: 600,  note: 'Šid/Horgoš · Passkontrollen' },
    { type: 'city',   flag: '🇷🇸', name: 'Belgrad',           km: 700,  note: 'E75 Richtung Niš · Tanken empfohlen' },
    { type: 'city',   flag: '🇷🇸', name: 'Niš',               km: 870,  note: '★ Günstigster Diesel!' },
    { type: 'border', flag: '🇷🇸🇲🇰', name: 'Grenze RS/MK',  km: 980,  note: 'Preševo-Tabanovce · Kurze Kontrolle' },
    { type: 'city',   flag: '🇲🇰', name: 'Skopje',            km: 1050, note: 'E75 Richtung Gevgelija · günstig tanken' },
    { type: 'border', flag: '🇲🇰🇬🇷', name: 'Grenze MK/GR',  km: 1150, note: 'Gevgelija-Evzoni · Passkontrollen · GR Maut beginnt' },
    { type: 'city',   flag: '🇬🇷', name: 'Thessaloniki',      km: 1230, note: '★ Voll tanken vor teurer GR-Autobahn!' },
    { type: 'border', flag: '🇬🇷🇹🇷', name: 'Grenze GR/TR',  km: 1600, note: 'Kipi-İpsala · Passkontrollen · HGS kaufen' },
    { type: 'city',   flag: '🇹🇷', name: 'İstanbul',          km: 2100, note: 'Ziel' },
  ],
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
  const extraFees = getExtraFeesForStart(start)
  const adjustedFees = [...extraFees, ...adjustFeesForStart(route.fees, routeKey, start)]
  const tollCost = avoidToll ? 0 : adjustedFees.filter(f => (f.type === 'toll' || f.type === 'tunnel') && f.required !== false).reduce((s, f) => s + f.cost, 0)
  const vignetteCost = adjustedFees.filter(f => f.type === 'vignette' && f.required !== false).reduce((s, f) => s + f.cost, 0)
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
    route: { key: routeKey, name: route.name, flags: route.flags, countries: route.countries, fees: adjustedFees, recommended: route.recommended },
    tankStops, aiTankStops, speedLimits, aiTips, countryPrices,
    waypoints: ROUTE_WAYPOINTS[routeKey] || ROUTE_WAYPOINTS.austria_hungary,
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
    const extraFees = getExtraFeesForStart(start)
    const adjFees = [...extraFees, ...adjustFeesForStart(r.fees, key, start)]
    const tollCost = avoidToll ? 0 : adjFees.filter(f => (f.type === 'toll' || f.type === 'tunnel') && f.required !== false).reduce((s, f) => s + f.cost, 0)
    const vignetteCost = adjFees.filter(f => f.type === 'vignette' && f.required !== false).reduce((s, f) => s + f.cost, 0)
    const total = fuelCost + tollCost + vignetteCost
    const tankStops = calcTankStops(key, km, fuel)
    const speedLimits = SPEED_LIMITS[key] || SPEED_LIMITS.austria_hungary
    return { key, name: r.name, flags: r.flags, countries: r.countries, km, hours, fuelCost, tollCost, vignetteCost, total, fees: adjFees, recommended: r.recommended, tankStops, speedLimits, countryPrices, waypoints: ROUTE_WAYPOINTS[key] || ROUTE_WAYPOINTS.austria_hungary }
  })

  res.json({ routes: results, start, dest })
})

export default router
