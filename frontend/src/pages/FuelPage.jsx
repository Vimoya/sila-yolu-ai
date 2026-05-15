import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Fuel, RefreshCw, Info, ChevronDown, X, Check,
  Camera, Mic, MicOff, Loader2, MapPin, Search, Navigation,
  TrendingDown, TrendingUp, Minus, Send,
} from 'lucide-react'
import { SkeletonList } from '../components/LoadingSkeleton'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const SEARCH_CACHE_TTL = 30 * 60 * 1000 // 30 Min localStorage cache für Suchergebnisse

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
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

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

const T = {
  bg: '#0a0a0f',
  card: 'rgba(255,255,255,0.035)',
  cardHover: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.12)',
  text: '#f1f1f3',
  muted: '#6b6b7a',
  mutedLight: '#9a9aaa',
  green: '#22c55e',
  greenBg: 'rgba(34,197,94,0.1)',
  greenBorder: 'rgba(34,197,94,0.2)',
  amber: '#f59e0b',
  amberBg: 'rgba(245,158,11,0.08)',
  amberBorder: 'rgba(245,158,11,0.18)',
  red: '#ef4444',
  redBg: 'rgba(239,68,68,0.08)',
  redBorder: 'rgba(239,68,68,0.18)',
  blue: '#60a5fa',
  accent: '#e8192c',
}

function priceColor(p) {
  if (!p) return T.muted
  if (p < 1.50) return T.green
  if (p < 1.75) return T.amber
  return T.red
}

function priceBg(p) {
  if (!p) return 'rgba(255,255,255,0.04)'
  if (p < 1.50) return T.greenBg
  if (p < 1.75) return T.amberBg
  return T.redBg
}

function priceBorder(p) {
  if (!p) return T.border
  if (p < 1.50) return T.greenBorder
  if (p < 1.75) return T.amberBorder
  return T.redBorder
}

// ── Station Card ──────────────────────────────────────────────────────────────
function StationCard({ station, expanded, onExpand, rank }) {
  const isLive = station.updated?.includes('🟢')
  const d = station.diesel
  const b = station.benzin

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: T.card,
        border: `1px solid ${station.cheap ? T.greenBorder : T.border}`,
      }}>

      <button className="w-full text-left p-4" onClick={onExpand}>
        <div className="flex items-center gap-3">

          {/* Rank */}
          <div className="w-6 flex-shrink-0 text-center">
            <span className="text-xs font-bold" style={{ color: station.cheap ? T.green : T.muted }}>
              {station.cheap ? '★' : `#${rank + 1}`}
            </span>
          </div>

          {/* Station info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-sm" style={{ color: T.text }}>{station.name}</span>
              {isLive
                ? <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide" style={{ background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}` }}>● LIVE</span>
                : <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,255,255,0.05)', color: T.muted }}>täglich</span>
              }
            </div>
            <div className="flex items-center gap-1" style={{ color: T.muted }}>
              <MapPin size={9} className="flex-shrink-0" />
              <span className="text-[11px] truncate">{station.address}</span>
            </div>
          </div>

          {/* Prices */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-[9px] font-bold mb-0.5" style={{ color: T.muted }}>DSL</div>
              <div className="font-black text-base leading-none" style={{ color: d ? priceColor(d) : T.muted }}>
                {d != null ? d.toFixed(3) : '—'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold mb-0.5" style={{ color: T.muted }}>BNZ</div>
              <div className="font-black text-base leading-none" style={{ color: b ? priceColor(b) : T.muted }}>
                {b != null ? b.toFixed(3) : '—'}
              </div>
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-4" style={{ borderTop: `1px solid ${T.border}` }}>
              <div className="flex gap-2 mt-3">
                {d != null && (
                  <div className="flex-1 rounded-xl p-3 text-center" style={{ background: priceBg(d), border: `1px solid ${priceBorder(d)}` }}>
                    <div className="text-[9px] font-bold tracking-widest mb-1" style={{ color: priceColor(d) }}>DIESEL</div>
                    <div className="font-black text-xl" style={{ color: priceColor(d) }}>{d.toFixed(3)}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: T.muted }}>€ / Liter</div>
                  </div>
                )}
                {b != null && (
                  <div className="flex-1 rounded-xl p-3 text-center" style={{ background: priceBg(b), border: `1px solid ${priceBorder(b)}` }}>
                    <div className="text-[9px] font-bold tracking-widest mb-1" style={{ color: priceColor(b) }}>BENZIN</div>
                    <div className="font-black text-xl" style={{ color: priceColor(b) }}>{b.toFixed(3)}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: T.muted }}>€ / Liter</div>
                  </div>
                )}
              </div>
              {station.note && (
                <p className="text-[11px] mt-2.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', color: T.mutedLight }}>
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
  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [error, setError] = useState('')

  async function searchCity(city) {
    setLoading(true); setError('')
    try {
      const cacheKey = `fuel_search_${country}_${city.toLowerCase().trim()}`
      const cached = lsGet(cacheKey)
      if (cached) { onResult(cached.stations, cached.cityName); setLoading(false); return }

      const geo = await fetch(`${API_BASE}/api/fuel/geocode?q=${encodeURIComponent(city)}&country=${country}`).then(r => r.json())
      const place = Array.isArray(geo) ? geo[0] : null
      if (!place) { setError('Stadt nicht gefunden'); setLoading(false); return }
      const { lat, lon, display_name } = place
      const cityName = display_name.split(',')[0]
      const data = await fetch(`${API_BASE}/api/fuel/nearby?lat=${lat}&lng=${lon}&country=${country}`).then(r => r.json())
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
      (err) => { setError(err.code === 1 ? 'GPS verweigert – in Browser-Einstellungen erlauben' : 'Standort nicht verfügbar'); setGpsLoading(false) },
      { timeout: 15000, maximumAge: 60000, enableHighAccuracy: false }
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center rounded-2xl px-3.5 gap-2"
          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.borderStrong}` }}>
          <Search size={13} style={{ color: T.muted, flexShrink: 0 }} />
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query.trim() && searchCity(query.trim())}
            placeholder={placeholder}
            className="flex-1 py-3 text-sm bg-transparent outline-none min-w-0"
            style={{ color: T.text }} />
          {loading && <Loader2 size={12} className="animate-spin flex-shrink-0" style={{ color: T.muted }} />}
        </div>
        <motion.button whileTap={{ scale: 0.92 }} onClick={useGPS} disabled={gpsLoading}
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}` }}>
          {gpsLoading
            ? <Loader2 size={14} className="animate-spin" style={{ color: T.green }} />
            : <Navigation size={14} style={{ color: T.green }} />}
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }}
          onClick={() => query.trim() && searchCity(query.trim())}
          disabled={loading || !query.trim()}
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: query.trim() ? T.amberBg : 'rgba(255,255,255,0.04)', border: `1px solid ${query.trim() ? T.amberBorder : T.border}` }}>
          <Send size={14} style={{ color: query.trim() ? T.amber : T.muted }} />
        </motion.button>
      </div>
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-[11px] mt-2 px-1" style={{ color: T.red }}>
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
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    color: T.text,
    padding: '12px 16px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-t-3xl flex flex-col"
        style={{ background: '#111116', border: `1px solid ${T.borderStrong}`, borderBottom: 'none', maxWidth: 480, maxHeight: '88dvh' }}>

        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-8 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-base" style={{ color: T.text }}>⛽ Preis melden</div>
              <div className="text-xs mt-0.5" style={{ color: T.muted }}>Hilf anderen Fahrern auf der Route</div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={14} style={{ color: T.muted }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
          {submitted ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}` }}>
                <Check size={26} style={{ color: T.green }} />
              </div>
              <div className="font-bold text-sm mb-1" style={{ color: T.text }}>Danke!</div>
              <div className="text-xs" style={{ color: T.muted }}>Deine Meldung wird geprüft.</div>
              <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: T.accent, color: 'white' }}>Schließen</button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3 pb-2">
              <div className="flex gap-2 mt-1">
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => fileRef.current?.click()} disabled={photoLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-semibold"
                  style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}`, color: T.amber }}>
                  {photoLoading ? <><Loader2 size={13} className="animate-spin" /> Analysiere…</> : <><Camera size={13} /> Foto scannen</>}
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={toggleVoice}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-semibold"
                  style={{ background: listening ? T.redBg : 'rgba(96,165,250,0.08)', border: `1px solid ${listening ? T.redBorder : 'rgba(96,165,250,0.2)'}`, color: listening ? T.red : T.blue }}>
                  {listening ? <><MicOff size={13} /> Stop</> : <><Mic size={13} /> Sprache</>}
                </motion.button>
              </div>

              {error && <div className="rounded-xl px-3 py-2 text-xs" style={{ background: T.redBg, border: `1px solid ${T.redBorder}`, color: '#f87171' }}>{error}</div>}

              <div>
                <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: T.muted }}>TANKSTELLE *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Shell, OMV, NIS…" style={inp} />
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: T.muted }}>LAND *</label>
                <div className="relative">
                  <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    style={{ ...inp, appearance: 'none', paddingRight: 36, cursor: 'pointer' }}>
                    {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>{COUNTRY_FLAGS[code]} {name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.muted }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: T.amber }}>DIESEL €/L</label>
                  <input type="number" step="0.001" min="0.5" max="5" value={form.diesel}
                    onChange={e => setForm(f => ({ ...f, diesel: e.target.value }))} placeholder="1.399"
                    style={{ ...inp, borderColor: form.diesel ? T.amberBorder : T.border }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: T.blue }}>BENZIN €/L</label>
                  <input type="number" step="0.001" min="0.5" max="5" value={form.benzin}
                    onChange={e => setForm(f => ({ ...f, benzin: e.target.value }))} placeholder="1.299"
                    style={{ ...inp, borderColor: form.benzin ? 'rgba(96,165,250,0.3)' : T.border }} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: T.muted }}>HINWEIS</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional…" style={inp} />
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                disabled={loading || !form.name || (!form.diesel && !form.benzin)}
                className="w-full py-3.5 rounded-2xl font-bold text-sm mt-1"
                style={{
                  background: form.name && (form.diesel || form.benzin) ? T.accent : 'rgba(255,255,255,0.05)',
                  color: form.name && (form.diesel || form.benzin) ? 'white' : T.muted,
                  boxShadow: form.name && (form.diesel || form.benzin) ? '0 4px 24px rgba(232,25,44,0.3)' : 'none',
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
  const lastDataRef = useRef(null)

  async function loadData(force = false) {
    if (!force && loading === false) return // nicht nochmal laden wenn schon da
    setLoading(true)
    try {
      const [rd, sd] = await Promise.all([
        fetch(`${API_BASE}/api/fuel/route`).then(r => r.json()),
        fetch(`${API_BASE}/api/fuel/summary`).then(r => r.json()),
      ])
      const newHash = JSON.stringify(rd.stations)
      // Nur updaten wenn sich Preise wirklich geändert haben
      if (newHash !== lastDataRef.current) {
        lastDataRef.current = newHash
        setStations(rd.stations || [])
        setSummary(sd.summary || [])
        setSource(rd.source || '')
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadData(true)
    // Alle 10 Min prüfen ob Preise sich geändert haben — kein Countdown mehr
    const t = setInterval(() => loadData(), 10 * 60 * 1000)
    return () => clearInterval(t)
  }, [])

  const SEARCH_ONLY = ['de', 'fr']
  const routeFiltered = stations.filter(s => {
    if (SEARCH_ONLY.includes(s.country)) return false
    return activeCountry === 'all' || s.country === activeCountry
  })
  const displayStations = SEARCH_ONLY.includes(activeCountry)
    ? (localStations[activeCountry] || [])
    : routeFiltered

  const dieselPrices = displayStations.map(s => s.diesel).filter(Boolean)
  const avgPrice = dieselPrices.length ? (dieselPrices.reduce((a, b) => a + b) / dieselPrices.length).toFixed(3) : '—'
  const minPrice = dieselPrices.length ? Math.min(...dieselPrices).toFixed(3) : '—'

  return (
    <div className="page-container" style={{ background: T.bg }}>
      <div className="px-4 pt-6 pb-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: T.text }}>Tankpreise</h1>
            <p className="text-xs mt-0.5" style={{ color: T.muted }}>Sıla Yolu · Live Preise</p>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => loadData(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}` }}>
            <RefreshCw size={15} style={{ color: T.mutedLight }} />
          </motion.button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1.5 mb-5 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}` }}>
          {[['stations', '⛽ Tankstellen'], ['summary', '🗺️ Länderübersicht']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveView(id)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: activeView === id ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeView === id ? T.text : T.muted,
                border: activeView === id ? `1px solid ${T.borderStrong}` : '1px solid transparent',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── STATIONS VIEW ── */}
        {activeView === 'stations' && (
          <>
            {/* Country tabs */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 no-scrollbar">
              {COUNTRY_TABS.map(tab => (
                <button key={tab.id} onClick={() => { setActiveCountry(tab.id); setExpandedId(null) }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: activeCountry === tab.id ? 'rgba(255,255,255,0.09)' : 'transparent',
                    color: activeCountry === tab.id ? T.text : T.muted,
                    border: `1px solid ${activeCountry === tab.id ? T.borderStrong : 'transparent'}`,
                  }}>
                  {tab.flag} {tab.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            {!loading && displayStations.length > 0 && (
              <div className="flex gap-2 mb-4">
                <div className="flex-1 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}` }}>
                  <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: T.muted }}>Ø DIESEL</div>
                  <div className="font-black text-xl" style={{ color: avgPrice !== '—' ? priceColor(parseFloat(avgPrice)) : T.muted }}>{avgPrice} <span className="text-xs font-normal" style={{ color: T.muted }}>€/L</span></div>
                </div>
                <div className="flex-1 rounded-2xl px-4 py-3" style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}` }}>
                  <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: T.green }}>GÜNSTIGSTE</div>
                  <div className="font-black text-xl" style={{ color: T.green }}>{minPrice} <span className="text-xs font-normal" style={{ color: T.green }}>€/L</span></div>
                </div>
              </div>
            )}

            {/* DE / FR search */}
            {(activeCountry === 'de' || activeCountry === 'fr') && (
              <div className="mb-4">
                <LocationSearch
                  country={activeCountry}
                  placeholder={activeCountry === 'fr' ? 'Stadt in Frankreich suchen…' : 'Stadt in Deutschland suchen…'}
                  onResult={(s, city) => { setLocalStations(p => ({ ...p, [activeCountry]: s })); setLocalCity(p => ({ ...p, [activeCountry]: city })); setExpandedId(null) }}
                />
                {localCity[activeCountry] && localStations[activeCountry]?.length > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs" style={{ color: T.green }}>📍 {localStations[activeCountry].length} Stationen nahe {localCity[activeCountry]}</span>
                    <button onClick={() => { setLocalStations(p => ({ ...p, [activeCountry]: [] })); setLocalCity(p => ({ ...p, [activeCountry]: '' })) }}
                      className="text-[11px] px-2.5 py-1 rounded-lg" style={{ color: T.muted, background: 'rgba(255,255,255,0.05)' }}>
                      Zurücksetzen
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Average notice */}
            {activeCountry !== 'all' && AVG_COUNTRIES.includes(activeCountry) && (
              <div className="rounded-xl px-3 py-2.5 mb-4 text-xs flex items-center gap-2"
                style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}` }}>
                <span style={{ color: T.amber }}>⚠</span>
                <span style={{ color: T.mutedLight }}>Ø Markenpreis — täglich via <strong style={{ color: T.amber }}>fuelo.net</strong></span>
              </div>
            )}

            {/* Stations list */}
            {loading ? <SkeletonList count={5} /> : (
              <div className="flex flex-col gap-2">
                {displayStations.map((s, i) => (
                  <StationCard key={s.id} station={s} rank={i}
                    expanded={expandedId === s.id}
                    onExpand={() => setExpandedId(expandedId === s.id ? null : s.id)} />
                ))}

                {displayStations.length === 0 && SEARCH_ONLY.includes(activeCountry) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-2xl p-8 text-center"
                    style={{ background: 'rgba(255,255,255,0.02)', border: `1px dashed ${T.border}` }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}` }}>
                      <Navigation size={22} style={{ color: T.green }} />
                    </div>
                    <p className="font-bold text-sm mb-1.5" style={{ color: T.text }}>Stadt eingeben oder GPS nutzen</p>
                    <p className="text-xs leading-relaxed" style={{ color: T.muted }}>
                      {activeCountry === 'fr'
                        ? 'Live Preise via prix-carburants.gouv.fr'
                        : 'Live Preise via Tankerkönig'}
                    </p>
                  </motion.div>
                )}

                {displayStations.length === 0 && !SEARCH_ONLY.includes(activeCountry) && activeCountry !== 'all' && (
                  <div className="text-center py-12" style={{ color: T.muted }}>
                    <Fuel size={32} className="mx-auto mb-2 opacity-20" />
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
            <div className="rounded-2xl px-4 py-3.5 mb-4 flex gap-3 items-start"
              style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}` }}>
              <span className="text-base">💡</span>
              <p className="text-xs leading-relaxed" style={{ color: T.mutedLight }}>
                In <strong style={{ color: T.text }}>Serbien</strong> voll tanken! Nochmal in <strong style={{ color: T.text }}>Bulgarien</strong> vor der Türkei-Grenze.
              </p>
            </div>

            {/* Legend */}
            <div className="flex gap-3 mb-4">
              {[[T.green, '< 1.50 €'], [T.amber, '1.50–1.75 €'], [T.red, '> 1.75 €']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[10px]" style={{ color: T.muted }}>{label}</span>
                </div>
              ))}
            </div>

            {loading ? <SkeletonList count={6} /> : (
              <div className="flex flex-col gap-2">
                {summary.map((c, i) => {
                  const price = c.diesel
                  const TIcon = c.trend === 'down' ? TrendingDown : c.trend === 'up' ? TrendingUp : Minus
                  const tColor = c.trend === 'down' ? T.green : c.trend === 'up' ? T.red : T.muted
                  const isLive = c.source?.includes('live') || c.source?.includes('Tankerkönig') || c.source?.includes('fuelo')
                  return (
                    <motion.div key={c.code}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
                      style={{ background: T.card, border: `1px solid ${T.border}` }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <div className="font-bold text-sm" style={{ color: T.text }}>{c.country}</div>
                          <div className="flex items-center gap-1 text-[10px] mt-0.5" style={{ color: tColor }}>
                            <TIcon size={10} />
                            {c.trend === 'down' ? 'günstig' : c.trend === 'up' ? 'teuer' : 'stabil'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-2xl" style={{ color: priceColor(price) }}>
                          {price?.toFixed(3)}
                        </div>
                        <div className="text-[9px] mt-0.5" style={{ color: isLive ? T.green : T.muted }}>
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
          <div className="mt-5 flex items-start gap-1.5">
            <Info size={10} style={{ color: T.muted, flexShrink: 0, marginTop: 2 }} />
            <p className="text-[10px]" style={{ color: T.muted }}>{source}</p>
          </div>
        )}

        {/* Report button */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowReport(true)}
          className="w-full mt-5 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, color: T.mutedLight }}>
          <Fuel size={14} />
          Preis melden
        </motion.button>
      </div>

      <AnimatePresence>
        {showReport && <ReportModal onClose={() => setShowReport(false)} />}
      </AnimatePresence>
    </div>
  )
}
