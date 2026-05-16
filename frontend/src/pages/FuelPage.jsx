import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Fuel, RefreshCw, Info, ChevronDown, X, Check,
  Camera, Mic, MicOff, Loader2, MapPin, Search, Navigation,
  TrendingDown, TrendingUp, Minus, Send, Droplets,
} from 'lucide-react'
import { SkeletonList } from '../components/LoadingSkeleton'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const SEARCH_CACHE_TTL = 30 * 60 * 1000

function lsGet(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > SEARCH_CACHE_TTL) { localStorage.removeItem(key); return null }
    return data
  } catch { return null }
}
function lsSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })) } catch {} }

const COUNTRY_TABS = [
  { id: 'de', label: 'DE', flag: '🇩🇪' },
  { id: 'fr', label: 'FR', flag: '🇫🇷' },
  { id: 'at', label: 'AT', flag: '🇦🇹' },
  { id: 'hu', label: 'HU', flag: '🇭🇺' },
  { id: 'rs', label: 'RS', flag: '🇷🇸' },
  { id: 'bg', label: 'BG', flag: '🇧🇬' },
  { id: 'tr', label: 'TR', flag: '🇹🇷' },
  { id: 'gr', label: 'GR', flag: '🇬🇷' },
]

const AVG_COUNTRIES = ['fr', 'hu', 'rs', 'bg', 'tr', 'gr']
const COUNTRY_NAMES = { de: 'Deutschland', fr: 'Frankreich', at: 'Österreich', hu: 'Ungarn', rs: 'Serbien', bg: 'Bulgarien', tr: 'Türkei', gr: 'Griechenland' }
const COUNTRY_FLAGS = { de: '🇩🇪', fr: '🇫🇷', at: '🇦🇹', hu: '🇭🇺', rs: '🇷🇸', bg: '🇧🇬', tr: '🇹🇷', gr: '🇬🇷' }

// ── Design tokens ─────────────────────────────────────────────────────────────
const G = {
  // glass card
  glass: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(28px) saturate(140%)',
    WebkitBackdropFilter: 'blur(28px) saturate(140%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 22,
  },
  glassStrong: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(28px) saturate(140%)',
    WebkitBackdropFilter: 'blur(28px) saturate(140%)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 22,
  },
  glassDark: {
    background: 'rgba(10,12,16,0.92)',
    backdropFilter: 'blur(28px) saturate(140%)',
    WebkitBackdropFilter: 'blur(28px) saturate(140%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 22,
  },
  text: '#F2F4F8',
  muted: '#7A8090',
  mutedLight: '#B6BCC8',
  green: '#38E58A',
  greenGlow: 'rgba(56,229,138,0.14)',
  greenBorder: 'rgba(56,229,138,0.25)',
  amber: '#F5B544',
  amberGlow: 'rgba(245,181,68,0.14)',
  amberBorder: 'rgba(245,181,68,0.25)',
  red: '#FF6B6B',
  redGlow: 'rgba(255,107,107,0.14)',
  redBorder: 'rgba(255,107,107,0.25)',
  blue: '#4DA8FF',
  accent: '#F5B544',
}

function priceColor(p) {
  if (!p) return G.muted
  if (p < 1.50) return G.green
  if (p < 1.75) return G.amber
  return G.red
}
function priceGlow(p) {
  if (!p) return 'transparent'
  if (p < 1.50) return G.greenGlow
  if (p < 1.75) return G.amberGlow
  return G.redGlow
}
function priceBorder(p) {
  if (!p) return 'rgba(255,255,255,0.08)'
  if (p < 1.50) return G.greenBorder
  if (p < 1.75) return G.amberBorder
  return G.redBorder
}

// ── Station Card ──────────────────────────────────────────────────────────────
function StationCard({ station, expanded, onExpand, rank }) {
  const isLive = station.updated?.includes('🟢')
  const d = station.diesel
  const b = station.benzin
  const cheapPrice = d || b

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: rank * 0.045, type: 'spring', stiffness: 300, damping: 28 }}
      className="rounded-3xl overflow-hidden"
      style={{
        ...G.glass,
        border: station.cheap ? `1px solid ${G.greenBorder}` : G.glass.border,
        boxShadow: station.cheap
          ? `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${G.greenBorder}, inset 0 1px 0 rgba(255,255,255,0.1)`
          : G.glass.boxShadow,
      }}>

      {/* Top glow line for cheapest */}
      {station.cheap && (
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${G.green}, transparent)` }} />
      )}

      <button className="w-full text-left px-4 py-4" onClick={onExpand}>
        <div className="flex items-center gap-3">

          {/* Rank badge */}
          <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: station.cheap ? G.greenGlow : 'rgba(255,255,255,0.05)',
              border: `1px solid ${station.cheap ? G.greenBorder : 'rgba(255,255,255,0.08)'}`,
            }}>
            <span className="text-xs font-black" style={{ color: station.cheap ? G.green : G.muted }}>
              {station.cheap ? '★' : rank + 1}
            </span>
          </div>

          {/* Station info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-bold text-[15px] leading-tight" style={{ color: G.text }}>{station.name}</span>
              {isLive
                ? <span className="text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider"
                    style={{ background: 'rgba(74,222,128,0.12)', color: G.green, border: `1px solid ${G.greenBorder}` }}>● LIVE</span>
                : <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.05)', color: G.muted }}>täglich</span>
              }
            </div>
            <div className="flex items-center gap-1.5" style={{ color: G.muted }}>
              <MapPin size={9} className="flex-shrink-0" />
              <span className="text-[11px] truncate">{station.address}</span>
            </div>
          </div>

          {/* Prices */}
          <div className="flex gap-2.5 flex-shrink-0">
            {[['DSL', d], ['BNZ', b]].map(([label, price]) => (
              <div key={label} className="text-center">
                <div className="text-[9px] font-bold tracking-wider mb-0.5" style={{ color: G.muted }}>{label}</div>
                <div className="sy-pump text-[17px] leading-none"
                  style={{ color: price ? priceColor(price) : 'rgba(255,255,255,0.18)' }}>
                  {price != null ? price.toFixed(3) : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[['DIESEL', d], ['BENZIN', b]].map(([label, price]) => price != null && (
                  <div key={label} className="rounded-2xl p-3 text-center"
                    style={{
                      background: priceGlow(price),
                      border: `1px solid ${priceBorder(price)}`,
                      backdropFilter: 'blur(12px)',
                    }}>
                    <div className="text-[9px] font-bold tracking-widest mb-1.5" style={{ color: priceColor(price) }}>{label}</div>
                    <div className="sy-pump text-2xl" style={{ color: priceColor(price) }}>{price.toFixed(3)}</div>
                    <div className="text-[9px] mt-1" style={{ color: G.muted }}>€ / Liter</div>
                  </div>
                ))}
              </div>
              {station.note && (
                <p className="text-[11px] mt-3 px-3 py-2.5 rounded-2xl leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.04)', color: G.mutedLight, border: '1px solid rgba(255,255,255,0.07)' }}>
                  💡 {station.note}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Location Search ───────────────────────────────────────────────────────────
function LocationSearch({ onResult, country = 'de', placeholder = 'Stadt suchen…' }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [error, setError] = useState('')
  const suggestTimer = useRef(null)

  function onQueryChange(val) {
    setQuery(val); setSuggestions([]); clearTimeout(suggestTimer.current)
    if (val.trim().length < 2) return
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/fuel/geocode?q=${encodeURIComponent(val)}&country=${country}&limit=5`).then(r => r.json())
        setSuggestions((Array.isArray(res) ? res : []).slice(0, 5))
      } catch {}
    }, 300)
  }

  async function pickSuggestion(place) {
    const cityName = place.display_name.split(',')[0]
    setQuery(cityName); setSuggestions([]); setLoading(true); setError('')
    try {
      const cacheKey = `fuel_search_${country}_${cityName.toLowerCase().trim()}`
      const cached = lsGet(cacheKey)
      if (cached) { onResult(cached.stations, cached.cityName); setLoading(false); return }
      const data = await fetch(`${API_BASE}/api/fuel/nearby?lat=${place.lat}&lng=${place.lon}&country=${country}`).then(r => r.json())
      if (!data.stations?.length) { setError(`Keine Stationen nahe ${cityName}`); setLoading(false); return }
      lsSet(cacheKey, { stations: data.stations, cityName })
      onResult(data.stations, cityName)
    } catch { setError('Suche fehlgeschlagen') }
    setLoading(false)
  }

  async function searchCity(city) {
    setSuggestions([]); setLoading(true); setError('')
    try {
      const cacheKey = `fuel_search_${country}_${city.toLowerCase().trim()}`
      const cached = lsGet(cacheKey)
      if (cached) { onResult(cached.stations, cached.cityName); setLoading(false); return }
      const geo = await fetch(`${API_BASE}/api/fuel/geocode?q=${encodeURIComponent(city)}&country=${country}`).then(r => r.json())
      const place = Array.isArray(geo) ? geo[0] : null
      if (!place) { setError('Stadt nicht gefunden'); setLoading(false); return }
      const cityName = place.display_name.split(',')[0]
      const data = await fetch(`${API_BASE}/api/fuel/nearby?lat=${place.lat}&lng=${place.lon}&country=${country}`).then(r => r.json())
      if (!data.stations?.length) { setError(`Keine Stationen nahe ${cityName}`); setLoading(false); return }
      lsSet(cacheKey, { stations: data.stations, cityName })
      onResult(data.stations, cityName)
    } catch { setError('Suche fehlgeschlagen') }
    setLoading(false)
  }

  async function useGPS() {
    setGpsLoading(true); setError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const cacheKey = `fuel_gps_${country}_${lat.toFixed(1)}_${lng.toFixed(1)}`
          const cached = lsGet(cacheKey)
          if (cached) { onResult(cached.stations, cached.cityName); setQuery(cached.cityName); setGpsLoading(false); return }
          const [geo, data] = await Promise.all([
            fetch(`${API_BASE}/api/fuel/geocode?lat=${lat}&lon=${lng}`).then(r => r.json()),
            fetch(`${API_BASE}/api/fuel/nearby?lat=${lat}&lng=${lng}&country=${country}`).then(r => r.json()),
          ])
          const city = geo?.address?.city || geo?.address?.town || geo?.address?.village || 'Dein Standort'
          if (!data.stations?.length) { setError('Keine Stationen in deiner Nähe'); setGpsLoading(false); return }
          lsSet(cacheKey, { stations: data.stations, cityName: city })
          onResult(data.stations, city); setQuery(city)
        } catch { setError('Standortfehler') }
        setGpsLoading(false)
      },
      (err) => { setError(err.code === 1 ? 'GPS verweigert' : 'Standort nicht verfügbar'); setGpsLoading(false) },
      { timeout: 15000, maximumAge: 60000, enableHighAccuracy: false }
    )
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Search input */}
        <div className="flex-1 flex items-center rounded-2xl px-4 gap-2.5"
          style={{ ...G.glass, height: 52 }}>
          <Search size={14} style={{ color: G.muted, flexShrink: 0 }} />
          <input value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && query.trim()) { setSuggestions([]); searchCity(query.trim()) } }}
            placeholder={placeholder}
            className="flex-1 text-sm bg-transparent outline-none min-w-0"
            style={{ color: G.text }} />
          {loading && <Loader2 size={13} className="animate-spin flex-shrink-0" style={{ color: G.muted }} />}
        </div>
        {/* GPS */}
        <motion.button whileTap={{ scale: 0.88 }} onClick={useGPS} disabled={gpsLoading}
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 52, height: 52, borderRadius: 16, background: G.amberGlow, border: `1px solid ${G.amberBorder}` }}>
          {gpsLoading
            ? <Loader2 size={15} className="animate-spin" style={{ color: G.amber }} />
            : <Navigation size={15} style={{ color: G.amber }} />}
        </motion.button>
        {/* Search button */}
        <motion.button whileTap={{ scale: 0.88 }}
          onClick={() => query.trim() && searchCity(query.trim())}
          disabled={loading || !query.trim()}
          style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: query.trim() ? G.amberGlow : 'rgba(255,255,255,0.04)',
            border: `1px solid ${query.trim() ? G.amberBorder : 'rgba(255,255,255,0.07)'}`,
          }}>
          <Send size={15} style={{ color: query.trim() ? G.amber : G.muted }} />
        </motion.button>
      </div>

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 rounded-2xl overflow-hidden z-50 mt-2"
            style={{ ...G.glassDark, boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
            {suggestions.map((place, i) => (
              <button key={i} onClick={() => pickSuggestion(place)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors"
                style={{
                  borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  color: G.text,
                }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <MapPin size={10} style={{ color: G.blue }} />
                </div>
                <span className="truncate text-[13px]">{place.display_name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-[11px] mt-2 px-1 flex items-center gap-1.5" style={{ color: G.red }}>
          ⚠ {error}
        </motion.p>
      )}
    </div>
  )
}

// ── Report Modal ──────────────────────────────────────────────────────────────
function ReportModal({ onClose }) {
  const [form, setForm] = useState({ name: '', country: 'rs', diesel: '', benzin: '', note: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const fileRef = useRef(null)
  const recognitionRef = useRef(null)

  async function handlePhoto(e) {
    const file = e.target.files?.[0]; if (!file) return
    setPhotoLoading(true); setError('')
    try {
      const bitmap = await createImageBitmap(file)
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height))
      canvas.width = bitmap.width * scale; canvas.height = bitmap.height * scale
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const base64 = canvas.toDataURL('image/jpeg', 0.8)
      const res = await fetch(`${API_BASE}/api/fuel/analyze-photo`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setForm(f => ({ name: data.name || f.name, country: data.country || f.country, diesel: data.diesel != null ? String(data.diesel) : f.diesel, benzin: data.benzin != null ? String(data.benzin) : f.benzin, note: data.note || f.note }))
    } catch { setError('Analyse fehlgeschlagen') }
    setPhotoLoading(false)
  }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError('Spracheingabe nicht unterstützt'); return }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const r = new SR(); r.lang = 'de-DE'; r.interimResults = true; recognitionRef.current = r
    r.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ')
      const dieselMatch = text.match(/diesel\s*([\d,\.]+)/i)
      const benzinMatch = text.match(/benzin\s*([\d,\.]+)/i)
      const nameMatch = text.match(/^([^0-9]+?)(?:\s+diesel|\s+benzin|\s+\d)/i)
      const countryMap = { deutschland: 'de', österreich: 'at', ungarn: 'hu', serbien: 'rs', bulgarien: 'bg', türkei: 'tr' }
      let cc = null; for (const [w, c] of Object.entries(countryMap)) { if (text.toLowerCase().includes(w)) { cc = c; break } }
      setForm(f => ({ ...f, name: nameMatch?.[1]?.trim() || f.name, country: cc || f.country, diesel: dieselMatch ? dieselMatch[1].replace(',', '.') : f.diesel, benzin: benzinMatch ? benzinMatch[1].replace(',', '.') : f.benzin }))
    }
    r.onend = () => setListening(false); r.start(); setListening(true)
  }

  async function handleSubmit() {
    if (!form.name || (!form.diesel && !form.benzin)) return
    setLoading(true)
    try {
      await fetch(`${API_BASE}/api/fuel/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, diesel: form.diesel ? parseFloat(form.diesel) : null, benzin: form.benzin ? parseFloat(form.benzin) : null }) })
      setSubmitted(true)
    } catch {}
    setLoading(false)
  }

  const inp = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    color: G.text,
    padding: '13px 16px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-t-[28px] flex flex-col"
        style={{ background: 'rgba(10,12,16,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', maxWidth: 480, maxHeight: '88dvh', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}>

        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-base" style={{ color: G.text }}>⛽ Preis melden</div>
              <div className="text-xs mt-0.5" style={{ color: G.muted }}>Hilf anderen Fahrern auf der Route</div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <X size={14} style={{ color: G.muted }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
          {submitted ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
              <div className="w-18 h-18 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ width: 72, height: 72, background: 'rgba(74,222,128,0.15)', border: `1px solid ${G.greenBorder}` }}>
                <Check size={28} style={{ color: G.green }} />
              </div>
              <div className="font-bold text-base mb-1" style={{ color: G.text }}>Danke!</div>
              <div className="text-sm" style={{ color: G.muted }}>Deine Meldung wird geprüft.</div>
              <button onClick={onClose} className="mt-6 px-8 py-3 rounded-2xl font-bold text-sm"
                style={{ background: G.accent, color: 'white', boxShadow: '0 4px 20px rgba(232,25,44,0.35)' }}>Schließen</button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3 pb-2">
              <div className="flex gap-2 mt-1">
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => fileRef.current?.click()} disabled={photoLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-semibold"
                  style={{ background: G.amberGlow, border: `1px solid ${G.amberBorder}`, color: G.amber }}>
                  {photoLoading ? <><Loader2 size={13} className="animate-spin" /> Analysiere…</> : <><Camera size={13} /> Foto scannen</>}
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={toggleVoice}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-semibold"
                  style={{ background: listening ? G.redGlow : 'rgba(96,165,250,0.1)', border: `1px solid ${listening ? G.redBorder : 'rgba(96,165,250,0.25)'}`, color: listening ? G.red : G.blue }}>
                  {listening ? <><MicOff size={13} /> Stop</> : <><Mic size={13} /> Sprache</>}
                </motion.button>
              </div>

              {error && <div className="rounded-2xl px-3 py-2.5 text-xs" style={{ background: G.redGlow, border: `1px solid ${G.redBorder}`, color: G.red }}>{error}</div>}

              <div>
                <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: G.muted }}>TANKSTELLE *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Shell, OMV, NIS…" style={inp} />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: G.muted }}>LAND *</label>
                <div className="relative">
                  <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    style={{ ...inp, appearance: 'none', paddingRight: 36, cursor: 'pointer' }}>
                    {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>{COUNTRY_FLAGS[code]} {name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: G.muted }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: G.amber }}>DIESEL €/L</label>
                  <input type="number" step="0.001" min="0.5" max="5" value={form.diesel}
                    onChange={e => setForm(f => ({ ...f, diesel: e.target.value }))} placeholder="1.399"
                    style={{ ...inp, borderColor: form.diesel ? G.amberBorder : 'rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: G.blue }}>BENZIN €/L</label>
                  <input type="number" step="0.001" min="0.5" max="5" value={form.benzin}
                    onChange={e => setForm(f => ({ ...f, benzin: e.target.value }))} placeholder="1.299"
                    style={{ ...inp, borderColor: form.benzin ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.1)' }} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: G.muted }}>HINWEIS</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional…" style={inp} />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                disabled={loading || !form.name || (!form.diesel && !form.benzin)}
                className="w-full py-4 rounded-2xl font-bold text-sm mt-1"
                style={{
                  background: form.name && (form.diesel || form.benzin) ? G.accent : 'rgba(255,255,255,0.05)',
                  color: form.name && (form.diesel || form.benzin) ? 'white' : G.muted,
                  boxShadow: form.name && (form.diesel || form.benzin) ? '0 4px 24px rgba(232,25,44,0.35)' : 'none',
                }}>
                {loading ? 'Wird gesendet…' : '⛽ Preis melden'}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FuelPage() {
  const [stations, setStations] = useState([])
  const [localStations, setLocalStations] = useState({})
  const [localCity, setLocalCity] = useState({})
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCountry, setActiveCountry] = useState('de')
  const [source, setSource] = useState('')
  const [activeView, setActiveView] = useState('stations')
  const [showReport, setShowReport] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  async function loadData(force = false) {
    if (force) setLoading(true)
    try {
      const ts = Date.now()
      const rd = await fetch(`${API_BASE}/api/fuel/route?_=${ts}`, { cache: 'no-store' }).then(r => r.json())
      setStations(rd.stations || [])
      setSource(rd.source || '')
      const sd = await fetch(`${API_BASE}/api/fuel/summary?_=${ts}`, { cache: 'no-store' }).then(r => r.json())
      setSummary(sd.summary || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadData(true)
    const hour = new Date().getHours()
    const interval = (hour >= 6 && hour < 22) ? 30 * 60 * 1000 : null
    if (!interval) return
    const t = setInterval(() => loadData(), interval)
    return () => clearInterval(t)
  }, [])

  const SEARCH_ONLY = ['de', 'fr']
  const routeFiltered = stations.filter(s => {
    if (SEARCH_ONLY.includes(s.country)) return false
    return s.country === activeCountry
  })
  const displayStations = SEARCH_ONLY.includes(activeCountry)
    ? (localStations[activeCountry] || [])
    : routeFiltered

  const dieselPrices = displayStations.map(s => s.diesel).filter(Boolean)
  const avgPrice = dieselPrices.length ? (dieselPrices.reduce((a, b) => a + b) / dieselPrices.length).toFixed(3) : null
  const minPrice = dieselPrices.length ? Math.min(...dieselPrices).toFixed(3) : null

  return (
    <div style={{ minHeight: '100%', paddingBottom: 32 }}>

      <div className="relative z-10 px-4 pt-6 pb-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[16px] flex items-center justify-center"
              style={{ background: G.amberGlow, border: `1px solid ${G.amberBorder}`, boxShadow: `0 0 20px rgba(245,181,68,0.12)` }}>
              <Droplets size={20} style={{ color: G.amber }} />
            </div>
            <div>
              <h1 className="text-xl font-black leading-tight" style={{ color: G.text, fontFamily: 'Space Grotesk, sans-serif' }}>Tankstellen</h1>
              <p className="text-[11px]" style={{ color: G.muted, fontFamily: 'DM Sans, sans-serif' }}>Tankerkönig · Live</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.86 }} onClick={() => loadData(true)}
            className="w-10 h-10 flex items-center justify-center"
            style={{ ...G.glass, width: 40, height: 40 }}>
            <RefreshCw size={15} style={{ color: G.mutedLight }} />
          </motion.button>
        </div>

        {/* ── View Toggle ── */}
        <div className="flex gap-1 mb-5 p-1 rounded-[18px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[['stations', '⛽', 'Tankstellen'], ['summary', '🗺️', 'Länder']].map(([id, emoji, label]) => (
            <button key={id} onClick={() => setActiveView(id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[14px] text-xs font-bold transition-all"
              style={{
                background: activeView === id ? G.amberGlow : 'transparent',
                color: activeView === id ? G.amber : G.muted,
                border: activeView === id ? `1px solid ${G.amberBorder}` : '1px solid transparent',
                backdropFilter: activeView === id ? 'blur(12px)' : 'none',
                fontFamily: 'DM Sans, sans-serif',
              }}>
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* ── STATIONS VIEW ── */}
        {activeView === 'stations' && (
          <>
            {/* Country tabs */}
            <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 no-scrollbar">
              {COUNTRY_TABS.map(tab => {
                const active = activeCountry === tab.id
                return (
                  <button key={tab.id} onClick={() => { setActiveCountry(tab.id); setExpandedId(null) }}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-xs font-bold transition-all"
                    style={{
                      background: active ? G.amberGlow : 'rgba(255,255,255,0.03)',
                      color: active ? G.amber : G.muted,
                      border: `1px solid ${active ? G.amberBorder : 'rgba(255,255,255,0.06)'}`,
                      fontFamily: 'DM Sans, sans-serif',
                    }}>
                    <span className="text-sm leading-none">{tab.flag}</span>
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Stats bar */}
            {!loading && displayStations.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="px-4 py-3.5" style={G.glass}>
                  <div className="text-[9px] font-bold tracking-widest mb-1" style={{ color: G.amber, fontFamily: 'DM Sans, sans-serif' }}>Ø DIESEL</div>
                  <div className="flex items-baseline gap-1">
                    <span className="sy-pump text-2xl" style={{ color: avgPrice ? priceColor(parseFloat(avgPrice)) : G.muted }}>
                      {avgPrice ?? '—'}
                    </span>
                    <span className="text-xs" style={{ color: G.muted, fontFamily: 'DM Sans, sans-serif' }}>€/L</span>
                  </div>
                </div>
                <div className="px-4 py-3.5"
                  style={{ background: G.greenGlow, border: `1px solid ${G.greenBorder}`, backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderRadius: 22 }}>
                  <div className="text-[9px] font-bold tracking-widest mb-1" style={{ color: G.green, fontFamily: 'DM Sans, sans-serif' }}>GÜNSTIGSTE</div>
                  <div className="flex items-baseline gap-1">
                    <span className="sy-pump text-2xl" style={{ color: G.green }}>
                      {minPrice ?? '—'}
                    </span>
                    <span className="text-xs" style={{ color: G.green, fontFamily: 'DM Sans, sans-serif' }}>€/L</span>
                  </div>
                </div>
              </div>
            )}

            {/* Search (DE/FR) */}
            {(activeCountry === 'de' || activeCountry === 'fr') && (
              <div className="mb-5">
                <LocationSearch
                  country={activeCountry}
                  placeholder={activeCountry === 'fr' ? 'Stadt in Frankreich…' : 'Stadt in Deutschland…'}
                  onResult={(s, city) => { setLocalStations(p => ({ ...p, [activeCountry]: s })); setLocalCity(p => ({ ...p, [activeCountry]: city })); setExpandedId(null) }}
                />
                {localCity[activeCountry] && localStations[activeCountry]?.length > 0 && (
                  <div className="flex items-center justify-between mt-2.5 px-1">
                    <span className="text-xs flex items-center gap-1.5" style={{ color: G.green }}>
                      <MapPin size={10} /> {localStations[activeCountry].length} Stationen nahe {localCity[activeCountry]}
                    </span>
                    <button onClick={() => { setLocalStations(p => ({ ...p, [activeCountry]: [] })); setLocalCity(p => ({ ...p, [activeCountry]: '' })) }}
                      className="text-[11px] px-2.5 py-1 rounded-lg" style={{ color: G.muted, background: 'rgba(255,255,255,0.05)' }}>
                      Zurücksetzen
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Avg notice for fuelo countries */}
            {AVG_COUNTRIES.includes(activeCountry) && (
              <div className="rounded-2xl px-3.5 py-3 mb-5 flex items-center gap-2.5"
                style={{ background: G.amberGlow, border: `1px solid ${G.amberBorder}` }}>
                <span style={{ color: G.amber, fontSize: 14 }}>⚠</span>
                <span className="text-xs leading-relaxed" style={{ color: G.mutedLight }}>
                  Ø Markenpreis · täglich via <strong style={{ color: G.amber }}>fuelo.net</strong>
                </span>
              </div>
            )}

            {/* Stations list */}
            {loading ? <SkeletonList count={5} /> : (
              <div className="flex flex-col gap-3">
                {displayStations.map((s, i) => (
                  <StationCard key={s.id} station={s} rank={i}
                    expanded={expandedId === s.id}
                    onExpand={() => setExpandedId(expandedId === s.id ? null : s.id)} />
                ))}

                {displayStations.length === 0 && SEARCH_ONLY.includes(activeCountry) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl p-10 text-center" style={G.glass}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(74,222,128,0.1)', border: `1px solid ${G.greenBorder}` }}>
                      <Navigation size={24} style={{ color: G.green }} />
                    </div>
                    <p className="font-bold text-sm mb-2" style={{ color: G.text }}>Stadt eingeben oder GPS</p>
                    <p className="text-xs leading-relaxed" style={{ color: G.muted }}>
                      {activeCountry === 'fr' ? 'Live via prix-carburants.gouv.fr' : 'Live via Tankerkönig'}
                    </p>
                  </motion.div>
                )}

                {displayStations.length === 0 && !SEARCH_ONLY.includes(activeCountry) && (
                  <div className="text-center py-14" style={{ color: G.muted }}>
                    <Fuel size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Keine Daten verfügbar</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── SUMMARY VIEW ── */}
        {activeView === 'summary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Tip card */}
            <div className="rounded-3xl px-4 py-4 mb-5 flex gap-3 items-start"
              style={{ background: 'rgba(74,222,128,0.08)', border: `1px solid ${G.greenBorder}`, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
              <span className="text-xl leading-none">💡</span>
              <p className="text-xs leading-relaxed pt-0.5" style={{ color: G.mutedLight }}>
                In <strong style={{ color: G.text }}>Serbien</strong> voll tanken! Nochmal in{' '}
                <strong style={{ color: G.text }}>Bulgarien</strong> vor der Türkei-Grenze.
              </p>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-5 px-1">
              {[[G.green, '< 1.50 €'], [G.amber, '1.50–1.75 €'], [G.red, '> 1.75 €']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span className="text-[11px]" style={{ color: G.muted }}>{label}</span>
                </div>
              ))}
            </div>

            {loading ? <SkeletonList count={6} /> : (
              <div className="flex flex-col gap-3">
                {summary.map((c, i) => {
                  const price = c.diesel
                  const TIcon = c.trend === 'down' ? TrendingDown : c.trend === 'up' ? TrendingUp : Minus
                  const tColor = c.trend === 'down' ? G.green : c.trend === 'up' ? G.red : G.muted
                  const isLive = c.source?.includes('live') || c.source?.includes('Tankerkönig') || c.source?.includes('fuelo')
                  return (
                    <motion.div key={c.code}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="rounded-3xl px-4 py-4 flex items-center justify-between"
                      style={G.glass}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl leading-none">{c.flag}</span>
                        <div>
                          <div className="font-bold text-sm" style={{ color: G.text }}>{c.country}</div>
                          <div className="flex items-center gap-1 text-[10px] mt-0.5" style={{ color: tColor }}>
                            <TIcon size={10} />
                            {c.trend === 'down' ? 'günstig' : c.trend === 'up' ? 'teuer' : 'stabil'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="sy-pump text-2xl" style={{ color: priceColor(price) }}>
                          {price?.toFixed(3)}
                        </div>
                        <div className="text-[9px] mt-0.5" style={{ color: isLive ? G.green : G.muted }}>
                          {isLive ? '● LIVE' : 'Ø täglich'} · €/L DSL
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Source */}
        {!loading && source && (
          <div className="mt-6 flex items-start gap-2">
            <Info size={10} style={{ color: G.muted, flexShrink: 0, marginTop: 2 }} />
            <p className="text-[10px]" style={{ color: G.muted }}>{source}</p>
          </div>
        )}

        {/* Report button */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowReport(true)}
          className="w-full mt-5 py-4 text-sm font-bold flex items-center justify-center gap-2"
          style={{ ...G.glass, color: G.amber, fontFamily: 'DM Sans, sans-serif', border: `1px solid ${G.amberBorder}`, background: G.amberGlow }}>
          <Fuel size={15} />
          Preis melden
        </motion.button>
      </div>

      <AnimatePresence>
        {showReport && <ReportModal onClose={() => setShowReport(false)} />}
      </AnimatePresence>
    </div>
  )
}
