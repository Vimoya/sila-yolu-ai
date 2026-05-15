import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Fuel, TrendingDown, TrendingUp, Minus, RefreshCw, Info, Timer,
  ChevronDown, X, Check, Camera, Mic, MicOff, Loader2,
  MapPin, Search, Navigation, ChevronRight, Send,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { SkeletonList } from '../components/LoadingSkeleton'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const REFRESH_INTERVAL = 300

const COUNTRY_TABS = [
  { id: 'all', label: 'Alle', flag: '🌍' },
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

// Design tokens
const T = {
  bg: '#09090b',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.1)',
  text: '#f4f4f5',
  muted: '#71717a',
  accent: '#e8192c',
  green: '#22c55e',
  amber: '#f59e0b',
  blue: '#3b82f6',
}

const glass = {
  background: T.glass,
  border: `1px solid ${T.glassBorder}`,
  backdropFilter: 'blur(12px)',
}

function priceColor(p) {
  if (!p) return T.muted
  return p < 1.5 ? T.green : p < 1.75 ? T.amber : '#ef4444'
}

// ── Station Card ─────────────────────────────────────────────────────────────
function StationCard({ station, expanded, onExpand }) {
  const isLive = station.updated?.includes('🟢')

  return (
    <motion.div layout className="rounded-2xl overflow-hidden"
      style={{ background: T.card, border: `1px solid ${station.cheap ? 'rgba(34,197,94,0.2)' : T.cardBorder}` }}>
      <button className="w-full text-left px-4 py-3.5" onClick={onExpand}>
        <div className="flex items-center gap-2">
          {/* Diesel + Benzin pills */}
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-16 h-12 rounded-xl flex flex-col items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <span className="text-[9px] font-bold" style={{ color: T.amber }}>DSL</span>
              <span className="font-black text-sm leading-tight" style={{ color: station.diesel ? priceColor(station.diesel) : T.muted }}>
                {station.diesel != null ? station.diesel.toFixed(3) : '—'}
              </span>
            </div>
            <div className="w-16 h-12 rounded-xl flex flex-col items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <span className="text-[9px] font-bold" style={{ color: T.blue }}>BNZ</span>
              <span className="font-black text-sm leading-tight" style={{ color: station.benzin ? priceColor(station.benzin) : T.muted }}>
                {station.benzin != null ? station.benzin.toFixed(3) : '—'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm truncate" style={{ color: T.text }}>{station.name}</span>
              {isLive && <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: 'rgba(34,197,94,0.12)', color: T.green }}>LIVE</span>}
              {station.cheap && <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: 'rgba(34,197,94,0.1)', color: T.green }}>✓ GÜNSTIG</span>}
            </div>
            <div className="flex items-center gap-1 mt-0.5" style={{ color: T.muted }}>
              <MapPin size={9} className="flex-shrink-0" />
              <span className="text-xs truncate">{station.address}</span>
            </div>
          </div>

          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.18 }} className="flex-shrink-0">
            <ChevronRight size={14} style={{ color: T.muted }} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && station.note && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', color: T.muted }}>
                {station.note}
              </p>
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
      const geo = await fetch(`${API_BASE}/api/fuel/geocode?q=${encodeURIComponent(city)}&country=${country}`).then(r => r.json())
      const place = Array.isArray(geo) ? geo[0] : null
      if (!place) { setError('Stadt nicht gefunden'); setLoading(false); return }
      const { lat, lon, display_name } = place
      const cityName = display_name.split(',')[0]
      const data = await fetch(`${API_BASE}/api/fuel/nearby?lat=${lat}&lng=${lon}&country=${country}`).then(r => r.json())
      if (!data.stations?.length) {
        setError(`Keine Stationen nahe ${cityName} gefunden`)
        setLoading(false); return
      }
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
          const [geo, data] = await Promise.all([
            fetch(`${API_BASE}/api/fuel/geocode?lat=${lat}&lon=${lng}`).then(r => r.json()),
            fetch(`${API_BASE}/api/fuel/nearby?lat=${lat}&lng=${lng}&country=${country}`).then(r => r.json()),
          ])
          const city = geo?.address?.city || geo?.address?.town || geo?.address?.village || 'Dein Standort'
          if (!data.stations?.length) {
            setError('Keine Stationen in deiner Nähe gefunden')
            setGpsLoading(false); return
          }
          onResult(data.stations, city); setQuery(city)
        } catch { setError('Standortfehler') }
        setGpsLoading(false)
      },
      (err) => { setError(err.code === 1 ? 'GPS verweigert – bitte in den Browser-Einstellungen erlauben' : 'Standort nicht verfügbar'); setGpsLoading(false) },
      { timeout: 15000, maximumAge: 60000, enableHighAccuracy: false }
    )
  }

  return (
    <div className="mb-3">
      <div className="flex gap-1.5">
        <div className="flex-1 flex items-center rounded-xl px-3 gap-2 min-w-0" style={glass}>
          <Search size={13} style={{ color: T.muted, flexShrink: 0 }} />
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query.trim() && searchCity(query.trim())}
            placeholder={placeholder}
            className="flex-1 py-2.5 text-sm bg-transparent outline-none min-w-0"
            style={{ color: T.text }} />
          {loading && <Loader2 size={12} className="animate-spin flex-shrink-0" style={{ color: T.muted }} />}
        </div>
        <motion.button whileTap={{ scale: 0.92 }} onClick={useGPS} disabled={gpsLoading}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={glass}>
          {gpsLoading ? <Loader2 size={13} className="animate-spin" style={{ color: T.green }} /> : <Navigation size={13} style={{ color: T.green }} />}
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => query.trim() && searchCity(query.trim())} disabled={loading || !query.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ ...glass, borderColor: query.trim() ? T.accent : T.glassBorder }}>
          <Search size={13} style={{ color: query.trim() ? T.accent : T.muted }} />
        </motion.button>
      </div>
      {error && <p className="text-[11px] mt-1.5 px-1" style={{ color: '#ef4444' }}>{error}</p>}
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

  const inp = { background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.cardBorder}`, borderRadius: 12, color: T.text, padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-t-3xl flex flex-col"
        style={{
          background: 'rgba(15,15,18,0.97)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderBottom: 'none',
          maxWidth: 480,
          maxHeight: '88dvh',
        }}>

        {/* Fixed header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-8 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-base" style={{ color: T.text }}>⛽ Preis melden</div>
              <div className="text-xs mt-0.5" style={{ color: T.muted }}>Hilf anderen Fahrern</div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={14} style={{ color: T.muted }} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
          {submitted ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(34,197,94,0.12)' }}>
                <Check size={24} style={{ color: T.green }} />
              </div>
              <div className="font-bold text-sm mb-1" style={{ color: T.text }}>Danke!</div>
              <div className="text-xs" style={{ color: T.muted }}>Deine Meldung wird geprüft.</div>
              <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: T.accent, color: 'white' }}>Schließen</button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3 pb-2">
              {/* Scan buttons */}
              <div className="flex gap-2 mt-1">
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => fileRef.current?.click()} disabled={photoLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: T.amber }}>
                  {photoLoading ? <><Loader2 size={13} className="animate-spin" /> Analysiere…</> : <><Camera size={13} /> Foto scannen</>}
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={toggleVoice}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: listening ? 'rgba(232,25,44,0.1)' : 'rgba(59,130,246,0.08)', border: `1px solid ${listening ? 'rgba(232,25,44,0.3)' : 'rgba(59,130,246,0.2)'}`, color: listening ? T.accent : T.blue }}>
                  {listening ? <><MicOff size={13} /> Stop</> : <><Mic size={13} /> Sprache</>}
                </motion.button>
              </div>

              {error && <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}>{error}</div>}

              {/* Fields */}
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
                  <input type="number" step="0.001" min="0.5" max="5" value={form.diesel} onChange={e => setForm(f => ({ ...f, diesel: e.target.value }))} placeholder="1.399"
                    style={{ ...inp, borderColor: form.diesel ? 'rgba(245,158,11,0.35)' : T.cardBorder }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: T.blue }}>BENZIN €/L</label>
                  <input type="number" step="0.001" min="0.5" max="5" value={form.benzin} onChange={e => setForm(f => ({ ...f, benzin: e.target.value }))} placeholder="1.299"
                    style={{ ...inp, borderColor: form.benzin ? 'rgba(59,130,246,0.35)' : T.cardBorder }} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: T.muted }}>HINWEIS</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional…" style={inp} />
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                disabled={loading || !form.name || (!form.diesel && !form.benzin)}
                className="w-full py-3 rounded-xl font-bold text-sm mt-1"
                style={{
                  background: form.name && (form.diesel || form.benzin) ? T.accent : 'rgba(255,255,255,0.06)',
                  color: form.name && (form.diesel || form.benzin) ? 'white' : T.muted,
                  boxShadow: form.name && (form.diesel || form.benzin) ? '0 4px 20px rgba(232,25,44,0.3)' : 'none',
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
  const [localStations, setLocalStations] = useState({}) // { de: [...], fr: [...] }
  const [localCity, setLocalCity] = useState({}) // { de: 'München', fr: 'Paris' }
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCountry, setActiveCountry] = useState('all')
  const [source, setSource] = useState('')
  const [activeView, setActiveView] = useState('stations')
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const [showReport, setShowReport] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const countdownRef = useRef(null)
  const timerRef = useRef(null)

  function loadData() {
    setLoading(true); setCountdown(REFRESH_INTERVAL)
    Promise.all([
      fetch(`${API_BASE}/api/fuel/route`).then(r => r.json()).catch(() => ({ stations: [] })),
      fetch(`${API_BASE}/api/fuel/summary`).then(r => r.json()).catch(() => ({ summary: [] })),
    ]).then(([rd, sd]) => {
      setStations(rd.stations || []); setSummary(sd.summary || []); setSource(rd.source || ''); setLoading(false)
    })
  }

  function startCountdown() {
    clearInterval(countdownRef.current)
    setCountdown(REFRESH_INTERVAL)
    countdownRef.current = setInterval(() => setCountdown(p => p <= 1 ? REFRESH_INTERVAL : p - 1), 1000)
  }

  useEffect(() => {
    loadData(); startCountdown()
    timerRef.current = setInterval(loadData, REFRESH_INTERVAL * 1000)
    return () => { clearInterval(countdownRef.current); clearInterval(timerRef.current) }
  }, [])

  const SEARCH_ONLY = ['de', 'fr'] // these countries use search/GPS only
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
  const countdownMin = Math.floor(countdown / 60)
  const countdownSec = countdown % 60
  const progressPct = ((REFRESH_INTERVAL - countdown) / REFRESH_INTERVAL) * 100

  return (
    <div className="page-container" style={{ background: T.bg, overflowX: 'hidden' }}>
      <div className="px-4 pt-6 pb-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: T.text }}>Tankpreise</h1>
            <p className="text-xs mt-0.5" style={{ color: T.muted }}>Sıla Yolu Route</p>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => { loadData(); startCountdown() }}
            className="w-9 h-9 rounded-xl flex items-center justify-center" style={glass}>
            <RefreshCw size={14} style={{ color: T.muted }} />
          </motion.button>
        </div>

        {/* Countdown */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Timer size={10} style={{ color: T.muted }} />
            <span className="text-[11px]" style={{ color: T.muted }}>
              Aktualisierung in {countdownMin}:{String(countdownSec).padStart(2, '0')}
            </span>
          </div>
          <div className="h-px rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)', width: `${progressPct}%` }}
              transition={{ duration: 0.5 }} />
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.cardBorder}` }}>
          {[['stations', '⛽ Tankstellen'], ['summary', '🗺️ Länder']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveView(id)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: activeView === id ? 'rgba(232,25,44,0.15)' : 'transparent',
                color: activeView === id ? '#fca5a5' : T.muted,
                border: activeView === id ? '1px solid rgba(232,25,44,0.25)' : '1px solid transparent',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {!loading && activeView === 'stations' && (
          <div className="flex gap-2 mb-4">
            {[['Ø Diesel', avgPrice, T.text], ['Günstigste', minPrice, T.green]].map(([label, val, color]) => (
              <div key={label} className="flex-1 rounded-xl px-3 py-3" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
                <div className="text-[10px] mb-1" style={{ color: T.muted }}>{label}</div>
                <div className="font-black text-base" style={{ color }}>{val} €</div>
              </div>
            ))}
          </div>
        )}

        {/* ── STATIONS VIEW ── */}
        {activeView === 'stations' && (
          <>
            {/* Country tabs */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 no-scrollbar">
              {COUNTRY_TABS.map(tab => (
                <button key={tab.id} onClick={() => { setActiveCountry(tab.id); setExpandedId(null) }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: activeCountry === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: activeCountry === tab.id ? T.text : T.muted,
                    border: `1px solid ${activeCountry === tab.id ? T.glassBorder : 'transparent'}`,
                  }}>
                  {tab.flag} {tab.label}
                </button>
              ))}
            </div>

            {/* DE / FR location search */}
            {(activeCountry === 'de' || activeCountry === 'fr') && (
              <div className="mb-3">
                <LocationSearch
                  country={activeCountry}
                  placeholder={activeCountry === 'fr' ? 'Stadt in Frankreich…' : 'Stadt in Deutschland…'}
                  onResult={(s, city) => { setLocalStations(p => ({ ...p, [activeCountry]: s })); setLocalCity(p => ({ ...p, [activeCountry]: city })); setExpandedId(null) }}
                />
                {localCity[activeCountry] && localStations[activeCountry]?.length > 0 && (
                  <div className="flex items-center justify-between mt-1 mb-1">
                    <span className="text-xs" style={{ color: T.green }}>📍 {localStations[activeCountry].length} Stationen nahe {localCity[activeCountry]}</span>
                    <button onClick={() => { setLocalStations(p => ({ ...p, [activeCountry]: [] })); setLocalCity(p => ({ ...p, [activeCountry]: '' })) }} className="text-[11px] px-2 py-1 rounded-lg" style={{ color: T.muted, background: T.card }}>Zurücksetzen</button>
                  </div>
                )}
              </div>
            )}

            {/* Avg notice */}
            {activeCountry !== 'all' && AVG_COUNTRIES.includes(activeCountry) && (
              <div className="rounded-xl px-3 py-2.5 mb-3 text-xs" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: T.muted }}>
                ⚠️ <span style={{ color: T.amber }}>Ø Markenpreis</span> — täglich aktualisiert via fuelo.net
              </div>
            )}

            {loading ? <SkeletonList count={5} /> : (
              <div className="flex flex-col gap-2">
                {displayStations.map(s => (
                  <StationCard key={s.id} station={s}
                    expanded={expandedId === s.id}
                    onExpand={() => setExpandedId(expandedId === s.id ? null : s.id)} />
                ))}
                {displayStations.length === 0 && SEARCH_ONLY.includes(activeCountry) && (
                  <div className="rounded-2xl px-4 py-8 text-center" style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
                    <Navigation size={28} className="mx-auto mb-3 opacity-30" style={{ color: T.green }} />
                    <p className="text-sm font-semibold mb-1" style={{ color: T.text }}>Standort eingeben</p>
                    <p className="text-xs" style={{ color: T.muted }}>
                      {activeCountry === 'fr' ? 'Stadt in Frankreich suchen für live Preise via prix-carburants.gouv.fr' : 'Stadt suchen oder GPS nutzen für live Tankstellen via Tankerkönig'}
                    </p>
                  </div>
                )}
                {displayStations.length === 0 && !SEARCH_ONLY.includes(activeCountry) && (
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
            <div className="rounded-xl px-4 py-3 mb-4 flex gap-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <span>💡</span>
              <p className="text-xs" style={{ color: T.muted }}>
                In <strong style={{ color: T.text }}>Serbien</strong> voll tanken! Nochmal in <strong style={{ color: T.text }}>Bulgarien</strong> vor der TR-Grenze.
              </p>
            </div>

            {loading ? <SkeletonList count={6} /> : (
              <div className="flex flex-col gap-2">
                {summary.map((c, i) => {
                  const price = c.diesel
                  const isAvg = AVG_COUNTRIES.includes(c.code)
                  const TIcon = c.trend === 'down' ? TrendingDown : c.trend === 'up' ? TrendingUp : Minus
                  const tColor = c.trend === 'down' ? T.green : c.trend === 'up' ? '#ef4444' : T.muted
                  return (
                    <motion.div key={c.code} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="rounded-xl px-4 py-3 flex items-center justify-between"
                      style={{ background: T.card, border: `1px solid ${T.cardBorder}` }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{c.flag}</span>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: T.text }}>{c.country}</div>
                          <div className="flex items-center gap-1 text-[10px]" style={{ color: tColor }}>
                            <TIcon size={10} />
                            {c.trend === 'down' ? 'günstig' : c.trend === 'up' ? 'teuer' : 'stabil'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-base" style={{ color: priceColor(price) }}>
                          {price?.toFixed(3)} €
                        </div>
                        <div className="text-[10px]" style={{ color: isAvg ? T.amber : T.green }}>
                          {isAvg ? 'Ø Preis' : 'Live'}
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
          className="w-full mt-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.cardBorder}`, color: T.muted }}>
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
