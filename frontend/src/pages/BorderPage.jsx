import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Bot } from 'lucide-react'
import { useStore } from '../store/useStore'
import BorderCard from '../components/BorderCard'
import { SkeletonList } from '../components/LoadingSkeleton'

const DUMMY_BORDERS = [
  { id: 'kapikule', name: 'Kapıkule', country: 'TR 🇹🇷 / BG 🇧🇬', status: 'yellow', reports: 12, lastReport: 'Ca. 45 Min Wartezeit, PKW-Spur normal' },
  { id: 'hamzabeyli', name: 'Hamzabeyli', country: 'TR 🇹🇷 / BG 🇧🇬', status: 'green', reports: 3, lastReport: 'Sehr wenig los, schnell durchgekommen' },
  { id: 'ipsala', name: 'İpsala', country: 'TR 🇹🇷 / GR 🇬🇷', status: 'red', reports: 27, lastReport: 'Starkes Aufkommen! 2-3 Stunden Wartezeit' },
  { id: 'horgos', name: 'Horgoš', country: 'RS 🇷🇸 / HU 🇭🇺', status: 'yellow', reports: 8, lastReport: 'Normal, ca. 30 Min' },
  { id: 'kalotina', name: 'Kalotina', country: 'BG 🇧🇬 / RS 🇷🇸', status: 'green', reports: 5, lastReport: 'Wenig Betrieb heute Morgen' },
]

export default function BorderPage() {
  const { isDark } = useStore()
  const [borders, setBorders] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [reportModal, setReportModal] = useState(null)
  const [reportText, setReportText] = useState('')

  const bg = isDark ? '#0a0f1e' : '#f8fafc'
  const textMain = isDark ? '#f1f5f9' : '#0f172a'
  const textMuted = isDark ? '#64748b' : '#94a3b8'

  useEffect(() => {
    setTimeout(() => { setBorders(DUMMY_BORDERS); setLoading(false) }, 800)
  }, [])

  const refresh = () => {
    setLoading(true)
    setTimeout(() => {
      setBorders(DUMMY_BORDERS.map(b => ({ ...b, reports: b.reports + Math.floor(Math.random() * 2) })))
      setLoading(false)
      setLastUpdate(new Date())
    }, 1000)
  }

  const submitReport = () => {
    if (!reportText.trim()) return
    setBorders(prev => prev.map(b =>
      b.id === reportModal.id
        ? { ...b, reports: b.reports + 1, lastReport: reportText }
        : b
    ))
    setReportModal(null)
    setReportText('')
  }

  const aiSummary = borders ? summarize(borders) : null

  return (
    <div className="page-container" style={{ background: bg }}>
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-black" style={{ color: textMain }}>Live Grenze</h1>
          <motion.button whileTap={{ scale: 0.9 }} onClick={refresh}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: isDark ? '#1e293b' : '#f1f5f9' }}>
            <RefreshCw size={16} style={{ color: textMuted }} />
          </motion.button>
        </div>
        <p className="text-xs mb-4" style={{ color: textMuted }}>
          Aktualisiert: {lastUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </p>

        {/* KI Zusammenfassung */}
        {aiSummary && !loading && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 mb-4 flex gap-3"
            style={{ background: 'rgba(29,78,216,0.12)', border: '1px solid rgba(29,78,216,0.25)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(29,78,216,0.2)' }}>
              <Bot size={16} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <div className="text-xs font-semibold mb-0.5" style={{ color: '#3b82f6' }}>KI Zusammenfassung</div>
              <div className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{aiSummary}</div>
            </div>
          </motion.div>
        )}

        {/* Status Legend */}
        <div className="flex gap-3 mb-5">
          {[['🟢', 'Frei', '#22c55e'], ['🟡', 'Mittel', '#f59e0b'], ['🔴', 'Voll', '#ef4444']].map(([dot, label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-xs" style={{ color: textMuted }}>{label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <SkeletonList count={4} />
        ) : (
          <div className="flex flex-col gap-3">
            {borders.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <BorderCard border={b} onReport={(border) => setReportModal(border)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setReportModal(null)}>
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
            className="w-full max-w-md rounded-3xl p-5"
            style={{ background: isDark ? '#111827' : '#ffffff' }}>
            <h3 className="font-bold mb-1" style={{ color: textMain }}>Meldung: {reportModal.name}</h3>
            <p className="text-sm mb-4" style={{ color: textMuted }}>Teile aktuelle Infos mit anderen Fahrern</p>
            <textarea
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              placeholder="Was siehst du gerade? Wartezeit, Besonderheiten..."
              rows={3}
              className="w-full rounded-2xl p-3 text-sm mb-4 resize-none outline-none"
              style={{ background: isDark ? '#1e293b' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, color: textMain }}
            />
            <div className="flex gap-2">
              <button onClick={() => setReportModal(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: isDark ? '#1e293b' : '#f1f5f9', color: textMuted }}>
                Abbrechen
              </button>
              <button onClick={submitReport}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                Senden
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

function summarize(borders) {
  const red = borders.filter(b => b.status === 'red').map(b => b.name)
  const green = borders.filter(b => b.status === 'green').map(b => b.name)
  if (red.length > 0) return `⚠️ ${red.join(', ')} aktuell stark belegt. ${green.length > 0 ? green[0] + ' empfohlen.' : 'Viel Geduld einplanen.'}`
  return `✅ Alle Grenzen aktuell im normalen Bereich. ${green.map(b => b).join(', ')} läuft besonders gut.`
}
