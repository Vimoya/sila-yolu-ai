import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X, Camera, Send, Plus, Clock } from 'lucide-react'
import BorderCard from '../components/BorderCard'
import { SkeletonList } from '../components/LoadingSkeleton'

const glass = {
  background: 'rgba(255,255,255,0.09)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
}

const BORDERS = [
  { id: 'kapikule', name: 'Kapıkule', country: 'TR 🇹🇷 / BG 🇧🇬', status: 'yellow', reports: 12, lastReport: 'Ca. 45 Min Wartezeit, PKW-Spur normal', photos: [] },
  { id: 'hamzabeyli', name: 'Hamzabeyli', country: 'TR 🇹🇷 / BG 🇧🇬', status: 'green', reports: 3, lastReport: 'Sehr wenig los, schnell durchgekommen', photos: [] },
  { id: 'ipsala', name: 'İpsala', country: 'TR 🇹🇷 / GR 🇬🇷', status: 'red', reports: 27, lastReport: 'Starkes Aufkommen! 2–3 Stunden Wartezeit', photos: [] },
  { id: 'horgos', name: 'Horgoš', country: 'RS 🇷🇸 / HU 🇭🇺', status: 'yellow', reports: 8, lastReport: 'Normal, ca. 30 Min', photos: [] },
  { id: 'kalotina', name: 'Kalotina', country: 'BG 🇧🇬 / RS 🇷🇸', status: 'green', reports: 5, lastReport: 'Wenig Betrieb heute Morgen', photos: [] },
  { id: 'ruse', name: 'Ruse / Giurgiu', country: 'BG 🇧🇬 / RO 🇷🇴', status: 'yellow', reports: 6, lastReport: 'Brücke — ca. 40 Min Wartezeit', photos: [] },
  { id: 'promachonas', name: 'Promachonas', country: 'BG 🇧🇬 / GR 🇬🇷', status: 'green', reports: 4, lastReport: 'Flüssig durchgekommen', photos: [] },
  { id: 'tabanovce', name: 'Tabanovce', country: 'MK 🇲🇰 / RS 🇷🇸', status: 'green', reports: 2, lastReport: 'Wenig Verkehr', photos: [] },
]

const STATUS_OPTIONS = [
  { value: 'green', label: '🟢 Wenig Andrang', sub: '< 30 Min' },
  { value: 'yellow', label: '🟡 Mittlere Wartezeit', sub: '30–90 Min' },
  { value: 'red', label: '🔴 Stark belegt', sub: '> 90 Min' },
]

export default function BorderPage() {
  const [borders, setBorders] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [reportModal, setReportModal] = useState(null)
  const [reportText, setReportText] = useState('')
  const [reportStatus, setReportStatus] = useState('yellow')
  const [reportPhoto, setReportPhoto] = useState(null)
  const [reportPhotoPreview, setReportPhotoPreview] = useState(null)
  const [createModal, setCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCountry, setNewCountry] = useState('')
  const [newStatus, setNewStatus] = useState('yellow')
  const [newText, setNewText] = useState('')
  const [countdown, setCountdown] = useState(30)
  const fileInputRef = useRef(null)

  const textMain = '#f5f5f5'
  const textMuted = 'rgba(255,255,255,0.4)'
  const borderColor = 'rgba(255,255,255,0.08)'

  useEffect(() => {
    setTimeout(() => { setBorders(BORDERS); setLoading(false) }, 400)
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    setCountdown(30)
    const tick = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          doRefresh(false)
          return 30
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  function doRefresh(showLoading = true) {
    if (showLoading) setLoading(true)
    setTimeout(() => {
      setBorders(prev => prev ? prev.map(b => ({ ...b, reports: b.reports + Math.floor(Math.random() * 2) })) : prev)
      if (showLoading) setLoading(false)
      setLastUpdate(new Date())
    }, showLoading ? 700 : 0)
  }

  function openReport(border) {
    setReportModal(border)
    setReportText('')
    setReportStatus('yellow')
    setReportPhoto(null)
    setReportPhotoPreview(null)
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setReportPhoto(file)
    setReportPhotoPreview(URL.createObjectURL(file))
  }

  function submitReport() {
    if (!reportText.trim() && !reportPhoto) return
    const text = reportText.trim() || '📷 Foto gesendet'
    setBorders(prev => prev.map(b =>
      b.id === reportModal.id
        ? { ...b, status: reportStatus, reports: b.reports + 1, lastReport: text, photos: reportPhotoPreview ? [...b.photos, reportPhotoPreview] : b.photos }
        : b
    ))
    setReportModal(null)
  }

  function submitCreate() {
    if (!newName.trim()) return
    const id = newName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    setBorders(prev => [...(prev || []), {
      id, name: newName.trim(), country: newCountry.trim() || '— / —',
      status: newStatus, reports: 1, lastReport: newText.trim() || 'Neue Meldung', photos: [],
    }])
    setCreateModal(false)
    setNewName(''); setNewCountry(''); setNewText(''); setNewStatus('yellow')
  }

  const summary = borders ? getSummary(borders) : null

  return (
    <div className="page-container" style={{ background: 'linear-gradient(135deg, #060610 0%, #0a0a18 50%, #060610 100%)' }}>

      <div className="px-4 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-black" style={{ color: textMain }}>Live Grenze</h1>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => doRefresh(true)}
              className="w-9 h-9 rounded-2xl flex items-center justify-center" style={glass}>
              <RefreshCw size={15} style={{ color: textMuted }} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCreateModal(true)}
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
              <Plus size={16} style={{ color: textMain }} />
            </motion.button>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="flex items-center gap-2 mb-4">
          <Clock size={11} style={{ color: textMuted }} />
          <p className="text-xs" style={{ color: textMuted }}>
            {lastUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} · Auto-Refresh in {countdown}s
          </p>
          <div className="flex-1 h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${((30 - countdown) / 30) * 100}%`, background: 'rgba(255,255,255,0.2)', transition: 'width 1s linear' }} />
          </div>
        </div>

        {/* Summary */}
        {summary && !loading && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-3.5 mb-4 text-sm" style={glass}>
            <div className="text-xs font-bold mb-1 tracking-widest" style={{ color: textMuted }}>AKTUELLE LAGE</div>
            <div style={{ color: textMain }}>{summary}</div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="flex gap-4 mb-5">
          {[['#4ade80', 'Frei < 30 Min'], ['#fbbf24', 'Mittel 30–90 Min'], ['#f87171', 'Voll > 90 Min']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-[10px]" style={{ color: textMuted }}>{label}</span>
            </div>
          ))}
        </div>

        {loading ? <SkeletonList count={4} /> : (
          <div className="flex flex-col gap-3">
            {borders.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <BorderCard border={b} onReport={() => openReport(b)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {reportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
            onClick={e => e.target === e.currentTarget && setReportModal(null)}>
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-5" style={glass}>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold" style={{ color: textMain }}>Meldung: {reportModal.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: textMuted }}>Was siehst du gerade?</div>
                </div>
                <button onClick={() => setReportModal(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <X size={14} style={{ color: textMuted }} />
                </button>
              </div>

              {/* Status auswählen */}
              <div className="text-xs font-bold mb-2 tracking-widest" style={{ color: textMuted }}>STATUS WÄHLEN</div>
              <div className="flex flex-col gap-2 mb-4">
                {STATUS_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => setReportStatus(s.value)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm text-left"
                    style={{
                      background: reportStatus === s.value ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${reportStatus === s.value ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                      color: textMain,
                    }}>
                    <span>{s.label}</span>
                    <span style={{ color: textMuted, fontSize: 11 }}>{s.sub}</span>
                  </button>
                ))}
              </div>

              <textarea value={reportText} onChange={e => setReportText(e.target.value)}
                placeholder="Wartezeit, Spur-Infos, Besonderheiten..."
                rows={3} className="w-full rounded-2xl p-3 text-sm mb-3 resize-none outline-none"
                style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.1)', color: textMain, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }} />

              {reportPhotoPreview && (
                <div className="relative mb-3">
                  <img src={reportPhotoPreview} alt="Vorschau" className="w-full rounded-2xl object-cover" style={{ maxHeight: 140 }} />
                  <button onClick={() => { setReportPhoto(null); setReportPhotoPreview(null) }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <X size={12} style={{ color: 'white' }} />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <Camera size={16} style={{ color: '#60a5fa' }} />
                </motion.button>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                <motion.button whileTap={{ scale: 0.97 }} onClick={submitReport}
                  disabled={!reportText.trim() && !reportPhoto}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold text-sm h-11"
                  style={{
                    background: (reportText.trim() || reportPhoto) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: (reportText.trim() || reportPhoto) ? textMain : textMuted,
                    opacity: (!reportText.trim() && !reportPhoto) ? 0.5 : 1,
                  }}>
                  <Send size={14} /> Senden
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create New Border Modal */}
      <AnimatePresence>
        {createModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
            onClick={e => e.target === e.currentTarget && setCreateModal(false)}>
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-5" style={glass}>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold" style={{ color: textMain }}>Grenze hinzufügen</div>
                  <div className="text-xs mt-0.5" style={{ color: textMuted }}>Neue Meldung erstellen</div>
                </div>
                <button onClick={() => setCreateModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <X size={14} style={{ color: textMuted }} />
                </button>
              </div>

              <div className="mb-3">
                <label className="text-xs font-bold tracking-widest block mb-1.5" style={{ color: textMuted }}>GRENZNAME</label>
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="z.B. Kapıkule, Horgoš..."
                  className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.1)', color: textMain }} />
              </div>

              <div className="mb-3">
                <label className="text-xs font-bold tracking-widest block mb-1.5" style={{ color: textMuted }}>LÄNDER</label>
                <input value={newCountry} onChange={e => setNewCountry(e.target.value)}
                  placeholder="z.B. TR 🇹🇷 / BG 🇧🇬"
                  className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.1)', color: textMain }} />
              </div>

              <div className="text-xs font-bold mb-2 tracking-widest" style={{ color: textMuted }}>AKTUELLER STATUS</div>
              <div className="flex flex-col gap-2 mb-3">
                {STATUS_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => setNewStatus(s.value)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm text-left"
                    style={{
                      background: newStatus === s.value ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${newStatus === s.value ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                      color: textMain,
                    }}>
                    <span>{s.label}</span>
                    <span style={{ color: textMuted, fontSize: 11 }}>{s.sub}</span>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold tracking-widest block mb-1.5" style={{ color: textMuted }}>BESCHREIBUNG</label>
                <textarea value={newText} onChange={e => setNewText(e.target.value)}
                  placeholder="Was siehst du gerade an der Grenze?"
                  rows={2} className="w-full rounded-2xl p-3 text-sm resize-none outline-none"
                  style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.1)', color: textMain }} />
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={submitCreate}
                disabled={!newName.trim()}
                className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: newName.trim() ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: newName.trim() ? textMain : textMuted,
                  opacity: !newName.trim() ? 0.5 : 1,
                }}>
                <Plus size={15} /> Grenze hinzufügen
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getSummary(borders) {
  const red = borders.filter(b => b.status === 'red')
  const green = borders.filter(b => b.status === 'green')
  if (red.length > 0) return `⚠️ ${red.map(b => b.name).join(', ')} aktuell stark belegt.${green.length > 0 ? ` ${green[0].name} empfohlen.` : ''}`
  return `✅ Alle Grenzen im normalen Bereich. ${green.map(b => b.name).slice(0, 2).join(', ')} laufen gut.`
}
