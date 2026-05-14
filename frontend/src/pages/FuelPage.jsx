import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fuel, TrendingDown, TrendingUp, Minus, RefreshCw, Info, Timer, ChevronDown, X, Check, Camera, Mic, MicOff, Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import FuelCard from '../components/FuelCard'
import { SkeletonList } from '../components/LoadingSkeleton'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const REFRESH_INTERVAL = 300

const COUNTRY_TABS = [
  { id: 'all', label: 'Alle', flag: '🌍' },
  { id: 'de', label: 'DE', flag: '🇩🇪' },
  { id: 'at', label: 'AT', flag: '🇦🇹' },
  { id: 'hu', label: 'HU', flag: '🇭🇺' },
  { id: 'rs', label: 'RS', flag: '🇷🇸' },
  { id: 'bg', label: 'BG', flag: '🇧🇬' },
  { id: 'tr', label: 'TR', flag: '🇹🇷' },
]

const LIVE_COUNTRIES = ['de', 'at']
const AVG_COUNTRIES = ['hu', 'rs', 'bg', 'tr']

const COUNTRY_NAMES = { de: 'Deutschland', at: 'Österreich', hu: 'Ungarn', rs: 'Serbien', bg: 'Bulgarien', tr: 'Türkei' }
const COUNTRY_FLAGS = { de: '🇩🇪', at: '🇦🇹', hu: '🇭🇺', rs: '🇷🇸', bg: '🇧🇬', tr: '🇹🇷' }

function ReportModal({ onClose, textMain, textMuted, borderColor, cardBg }) {
  const [form, setForm] = useState({ name: '', country: 'rs', diesel: '', benzin: '', note: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const fileRef = useRef(null)
  const recognitionRef = useRef(null)

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoLoading(true)
    setPhotoError('')
    try {
      // Resize to max 800px to save tokens
      const bitmap = await createImageBitmap(file)
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height))
      canvas.width = bitmap.width * scale
      canvas.height = bitmap.height * scale
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const base64 = canvas.toDataURL('image/jpeg', 0.8)

      const res = await fetch(`${API_BASE}/api/fuel/analyze-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })
      const data = await res.json()
      if (data.error) { setPhotoError(data.error); return }
      setForm(f => ({
        name: data.name || f.name,
        country: data.country || f.country,
        diesel: data.diesel != null ? String(data.diesel) : f.diesel,
        benzin: data.benzin != null ? String(data.benzin) : f.benzin,
        note: data.note || f.note,
      }))
    } catch {
      setPhotoError('Analyse fehlgeschlagen. Bitte manuell ausfüllen.')
    } finally {
      setPhotoLoading(false)
    }
  }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setPhotoError('Spracheingabe nicht unterstützt'); return }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const r = new SR()
    r.lang = 'de-DE'
    r.interimResults = true
    r.continuous = false
    recognitionRef.current = r

    r.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ')
      setTranscript(text)
      // Parse: "Shell Belgrad Diesel 1,39 Benzin 1,29"
      const dieselMatch = text.match(/diesel\s*([\d,\.]+)/i)
      const benzinMatch = text.match(/benzin\s*([\d,\.]+)/i)
      const nameMatch = text.match(/^([^0-9]+?)(?:\s+diesel|\s+benzin|\s+\d)/i)
      const countryMap = { deutschland: 'de', österreich: 'at', ungarn: 'hu', serbien: 'rs', bulgarien: 'bg', türkei: 'tr', turkei: 'tr' }
      let detectedCountry = null
      for (const [word, code] of Object.entries(countryMap)) {
        if (text.toLowerCase().includes(word)) { detectedCountry = code; break }
      }
      setForm(f => ({
        ...f,
        name: nameMatch ? nameMatch[1].trim() : f.name,
        country: detectedCountry || f.country,
        diesel: dieselMatch ? dieselMatch[1].replace(',', '.') : f.diesel,
        benzin: benzinMatch ? benzinMatch[1].replace(',', '.') : f.benzin,
      }))
    }
    r.onend = () => setListening(false)
    r.start()
    setListening(true)
    setTranscript('')
  }

  async function handleSubmit() {
    if (!form.name || !form.country || (!form.diesel && !form.benzin)) return
    setLoading(true)
    try {
      await fetch(`${API_BASE}/api/fuel/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          country: form.country,
          diesel: form.diesel ? parseFloat(form.diesel) : null,
          benzin: form.benzin ? parseFloat(form.benzin) : null,
          note: form.note,
        }),
      })
      setSubmitted(true)
    } catch {}
    setLoading(false)
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${borderColor}`,
    borderRadius: 12,
    color: textMain,
    padding: '11px 14px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-t-3xl p-5 pb-8"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto' }}>

        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.15)' }} />

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-black text-lg" style={{ color: textMain }}>⛽ Preis melden</div>
            <div className="text-xs mt-0.5" style={{ color: textMuted }}>Hilf anderen Fahrern</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <X size={15} style={{ color: textMuted }} />
          </button>
        </div>

        {/* Foto + Voice Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => fileRef.current?.click()}
            disabled={photoLoading}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
            {photoLoading
              ? <><Loader2 size={15} className="animate-spin" /> Analysiere…</>
              : <><Camera size={15} /> Foto scannen</>}
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={toggleVoice}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
            style={{
              background: listening ? 'rgba(232,25,44,0.15)' : 'rgba(59,130,246,0.12)',
              border: `1px solid ${listening ? 'rgba(232,25,44,0.4)' : 'rgba(59,130,246,0.25)'}`,
              color: listening ? '#e8192c' : '#3b82f6',
            }}>
            {listening ? <><MicOff size={15} /> Stop</> : <><Mic size={15} /> Sprache</>}
          </motion.button>
        </div>

        {/* Voice transcript */}
        {transcript && (
          <div className="rounded-xl px-3 py-2 mb-3 text-xs" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: textMuted }}>
            🎙 "{transcript}"
          </div>
        )}

        {/* Photo error */}
        {photoError && (
          <div className="rounded-xl px-3 py-2 mb-3 text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
            {photoError}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px" style={{ background: borderColor }} />
          <span className="text-xs" style={{ color: textMuted }}>oder manuell</span>
          <div className="flex-1 h-px" style={{ background: borderColor }} />
        </div>

        {submitted ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(34,197,94,0.15)' }}>
              <Check size={28} style={{ color: '#22c55e' }} />
            </div>
            <div className="font-bold text-base mb-1" style={{ color: textMain }}>Danke!</div>
            <div className="text-sm" style={{ color: textMuted }}>Deine Meldung wird geprüft und bald sichtbar.</div>
            <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #e8192c, #c0111f)', color: 'white' }}>
              Schließen
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Tankstelle Name */}
            <div>
              <label className="text-xs font-bold mb-1.5 block tracking-wider" style={{ color: textMuted }}>TANKSTELLE *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="z.B. NIS Novi Sad, OMV Wien..."
                style={inputStyle}
              />
            </div>

            {/* Land */}
            <div>
              <label className="text-xs font-bold mb-1.5 block tracking-wider" style={{ color: textMuted }}>LAND *</label>
              <div className="relative">
                <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: 36, cursor: 'pointer' }}>
                  {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>{COUNTRY_FLAGS[code]} {name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: textMuted }} />
              </div>
            </div>

            {/* Preise */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold mb-1.5 block tracking-wider" style={{ color: '#f59e0b' }}>DIESEL (€/L)</label>
                <input
                  type="number" step="0.001" min="0.5" max="4"
                  value={form.diesel}
                  onChange={e => setForm(f => ({ ...f, diesel: e.target.value }))}
                  placeholder="1.399"
                  style={{ ...inputStyle, borderColor: form.diesel ? 'rgba(245,158,11,0.4)' : borderColor }}
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block tracking-wider" style={{ color: '#3b82f6' }}>BENZIN (€/L)</label>
                <input
                  type="number" step="0.001" min="0.5" max="4"
                  value={form.benzin}
                  onChange={e => setForm(f => ({ ...f, benzin: e.target.value }))}
                  placeholder="1.299"
                  style={{ ...inputStyle, borderColor: form.benzin ? 'rgba(59,130,246,0.4)' : borderColor }}
                />
              </div>
            </div>

            {/* Hinweis */}
            <div>
              <label className="text-xs font-bold mb-1.5 block tracking-wider" style={{ color: textMuted }}>HINWEIS (optional)</label>
              <input
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="z.B. Autobahnpreis, günstiger in Stadt..."
                style={inputStyle}
              />
            </div>

            <div className="text-xs px-1" style={{ color: textMuted }}>
              * Pflichtfelder. Mindestens ein Preis (Diesel oder Benzin) erforderlich.
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading || !form.name || (!form.diesel && !form.benzin)}
              className="w-full py-3.5 rounded-2xl font-black text-white text-sm mt-1"
              style={{
                background: form.name && (form.diesel || form.benzin)
                  ? 'linear-gradient(135deg, #e8192c, #c0111f)'
                  : 'rgba(255,255,255,0.07)',
                color: form.name && (form.diesel || form.benzin) ? 'white' : textMuted,
                boxShadow: form.name && (form.diesel || form.benzin) ? '0 4px 20px rgba(232,25,44,0.4)' : 'none',
              }}>
              {loading ? 'Wird gesendet…' : '⛽ Preis melden'}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function FuelPage() {
  const { isDark } = useStore()
  const [stations, setStations] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCountry, setActiveCountry] = useState('all')
  const [fuelType, setFuelType] = useState('diesel')
  const [source, setSource] = useState('')
  const [activeView, setActiveView] = useState('stations')
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const [showReport, setShowReport] = useState(false)
  const countdownRef = useRef(null)
  const refreshTimerRef = useRef(null)

  const cardBg = '#1a1a1a'
  const cardBg2 = '#111111'
  const borderColor = 'rgba(255,255,255,0.08)'
  const textMain = '#f5f5f5'
  const textMuted = '#666'

  function loadData() {
    setLoading(true)
    setCountdown(REFRESH_INTERVAL)
    Promise.all([
      fetch(`${API_BASE}/api/fuel/route`).then(r => r.json()).catch(() => ({ stations: [] })),
      fetch(`${API_BASE}/api/fuel/summary`).then(r => r.json()).catch(() => ({ summary: [] })),
    ]).then(([routeData, summaryData]) => {
      setStations(routeData.stations || [])
      setSummary(summaryData.summary || [])
      setSource(routeData.source || '')
      setLoading(false)
    })
  }

  function startCountdown() {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(REFRESH_INTERVAL)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => prev <= 1 ? REFRESH_INTERVAL : prev - 1)
    }, 1000)
  }

  useEffect(() => {
    loadData()
    startCountdown()
    refreshTimerRef.current = setInterval(loadData, REFRESH_INTERVAL * 1000)
    return () => { clearInterval(countdownRef.current); clearInterval(refreshTimerRef.current) }
  }, [])

  const filtered = stations.filter(s => activeCountry === 'all' || s.country === activeCountry)
  const prices = filtered.map(s => fuelType === 'diesel' ? s.diesel : s.benzin).filter(Boolean)
  const avgPrice = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(3) : '—'
  const minPrice = prices.length ? Math.min(...prices).toFixed(3) : '—'

  const countdownMin = Math.floor(countdown / 60)
  const countdownSec = countdown % 60
  const progressPct = ((REFRESH_INTERVAL - countdown) / REFRESH_INTERVAL) * 100

  const isAvgCountry = activeCountry !== 'all' && AVG_COUNTRIES.includes(activeCountry)

  return (
    <div className="page-container" style={{ background: '#0a0a0a' }}>
      <div className="px-4 pt-6 pb-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black" style={{ color: textMain }}>Tankpreise</h1>
            <p className="text-xs mt-0.5" style={{ color: textMuted }}>Gesamte Sıla Yolu Route</p>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => { loadData(); startCountdown() }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            <RefreshCw size={15} style={{ color: textMuted }} />
          </motion.button>
        </div>

        {/* Countdown Bar */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Timer size={11} style={{ color: textMuted }} />
            <span className="text-xs" style={{ color: textMuted }}>
              Aktualisierung in {countdownMin}m {String(countdownSec).padStart(2, '0')}s
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #e8192c, #f59e0b)', width: `${progressPct}%` }}
              transition={{ duration: 0.5 }} />
          </div>
        </div>

        {/* Data source legend */}
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
            <span className="text-xs" style={{ color: textMuted }}>Live (DE/AT)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
            <span className="text-xs" style={{ color: textMuted }}>Ø Landespreis (HU/RS/BG/TR)</span>
          </div>
        </div>

        {/* Fuel Type Toggle */}
        <div className="flex gap-2 mb-4">
          {[['diesel', 'Diesel', '#f59e0b'], ['benzin', 'Benzin / E5', '#3b82f6']].map(([val, label, color]) => (
            <button key={val} onClick={() => setFuelType(val)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: fuelType === val ? color : cardBg2,
                color: fuelType === val ? 'white' : textMuted,
                border: `1px solid ${fuelType === val ? color : borderColor}`,
                boxShadow: fuelType === val ? `0 3px 14px ${color}55` : 'none',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-1.5 mb-4 p-1 rounded-xl" style={{ background: cardBg2, border: `1px solid ${borderColor}` }}>
          {[['stations', '⛽ Tankstellen'], ['summary', '🗺️ Länderübersicht']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveView(id)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: activeView === id ? 'linear-gradient(135deg, #e8192c, #c0111f)' : 'transparent',
                color: activeView === id ? 'white' : textMuted,
                boxShadow: activeView === id ? '0 2px 10px rgba(232,25,44,0.35)' : 'none',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Stats Banner */}
        {!loading && activeView === 'stations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-4 mb-4 grid grid-cols-2 gap-3"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.15)' }}>
                <TrendingDown size={16} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: textMuted }}>Ø Route</div>
                <div className="font-black text-base" style={{ color: '#f59e0b' }}>{avgPrice} €</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.15)' }}>
                <Fuel size={16} style={{ color: '#22c55e' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: textMuted }}>Günstigster</div>
                <div className="font-black text-base" style={{ color: '#22c55e' }}>{minPrice} €</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATIONS VIEW */}
        {activeView === 'stations' && (
          <>
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 no-scrollbar">
              {COUNTRY_TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveCountry(tab.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                  style={{
                    background: activeCountry === tab.id ? 'linear-gradient(135deg, #e8192c, #c0111f)' : cardBg2,
                    color: activeCountry === tab.id ? 'white' : textMuted,
                    border: `1px solid ${activeCountry === tab.id ? '#e8192c' : borderColor}`,
                    boxShadow: activeCountry === tab.id ? '0 2px 10px rgba(232,25,44,0.35)' : 'none',
                  }}>
                  {tab.flag} {tab.label}
                </button>
              ))}
            </div>

            {/* Avg country notice */}
            {isAvgCountry && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-3 py-2.5 mb-3 flex items-start gap-2"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <span style={{ color: '#f59e0b', fontSize: 13 }}>⚠️</span>
                <div className="text-xs" style={{ color: textMuted }}>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>Ø Landespreis</span> — kein Live-Preis verfügbar. Zeigt den aktuellen Durchschnitt für {COUNTRY_NAMES[activeCountry]}. Einzelpreise via "Preis melden" unten.
                </div>
              </motion.div>
            )}

            {loading ? <SkeletonList count={5} /> : (
              <div className="flex flex-col gap-3">
                {filtered.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <FuelCard station={s} fuelType={fuelType} />
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-14" style={{ color: textMuted }}>
                    <Fuel size={38} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Keine Daten für dieses Land</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* SUMMARY VIEW */}
        {activeView === 'summary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-2xl p-4 mb-4 flex gap-3"
              style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
              <span className="text-xl">💡</span>
              <div>
                <div className="font-bold text-sm" style={{ color: '#22c55e' }}>Spar-Tipp</div>
                <div className="text-xs mt-0.5" style={{ color: textMuted }}>
                  In <strong style={{ color: textMain }}>Serbien</strong> voll tanken! Vor der TR-Grenze nochmal in <strong style={{ color: textMain }}>Bulgarien</strong> nachtanken.
                </div>
              </div>
            </div>

            {loading ? <SkeletonList count={6} /> : (
              <div className="flex flex-col gap-3">
                {summary.map((c, i) => {
                  const price = fuelType === 'diesel' ? c.diesel : c.benzin
                  const isAvg = AVG_COUNTRIES.includes(c.code)
                  const TrendIcon = c.trend === 'down' ? TrendingDown : c.trend === 'up' ? TrendingUp : Minus
                  const trendColor = c.trend === 'down' ? '#22c55e' : c.trend === 'up' ? '#ef4444' : textMuted
                  return (
                    <motion.div key={c.code}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="rounded-2xl p-4"
                      style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{c.flag}</span>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: textMain }}>{c.country}</div>
                            <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: trendColor }}>
                              <TrendIcon size={11} />
                              {c.trend === 'down' ? 'günstig' : c.trend === 'up' ? 'teuer' : 'stabil'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-lg" style={{ color: price < 1.5 ? '#22c55e' : price < 1.7 ? '#f59e0b' : '#ef4444' }}>
                            {price?.toFixed(3)} €
                          </div>
                          <div className="text-xs flex items-center justify-end gap-1" style={{ color: isAvg ? '#f59e0b' : '#22c55e' }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: isAvg ? '#f59e0b' : '#22c55e' }} />
                            {isAvg ? 'Ø Landespreis' : 'Live'}
                          </div>
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
          <div className="mt-4 flex items-start gap-2 px-1">
            <Info size={12} style={{ color: textMuted, flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs" style={{ color: textMuted }}>
              Quellen: {source}
            </p>
          </div>
        )}

        {/* Report Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-5 rounded-2xl p-4"
          style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
          <div className="font-bold text-sm mb-0.5" style={{ color: textMain }}>Preis gesehen? Melden!</div>
          <p className="text-xs mb-3" style={{ color: textMuted }}>
            Tankstelle + Preis eintragen — direkt für alle sichtbar
          </p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowReport(true)}
            className="w-full py-3 rounded-xl text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #e8192c, #c0111f)', color: 'white', boxShadow: '0 3px 16px rgba(232,25,44,0.35)' }}>
            + Tankstelle & Preis melden
          </motion.button>
        </motion.div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <ReportModal
            onClose={() => setShowReport(false)}
            textMain={textMain}
            textMuted={textMuted}
            borderColor={borderColor}
            cardBg={cardBg}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
