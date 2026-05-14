import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Fuel, TrendingDown, TrendingUp, Minus, RefreshCw, Info } from 'lucide-react'
import { useStore } from '../store/useStore'
import FuelCard from '../components/FuelCard'
import { SkeletonList } from '../components/LoadingSkeleton'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const COUNTRY_TABS = [
  { id: 'all', label: 'Alle', flag: '🌍' },
  { id: 'de', label: 'DE', flag: '🇩🇪' },
  { id: 'at', label: 'AT', flag: '🇦🇹' },
  { id: 'hu', label: 'HU', flag: '🇭🇺' },
  { id: 'rs', label: 'RS', flag: '🇷🇸' },
  { id: 'bg', label: 'BG', flag: '🇧🇬' },
  { id: 'tr', label: 'TR', flag: '🇹🇷' },
]

export default function FuelPage() {
  const { isDark } = useStore()
  const [stations, setStations] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCountry, setActiveCountry] = useState('all')
  const [fuelType, setFuelType] = useState('diesel')
  const [source, setSource] = useState('')
  const [activeView, setActiveView] = useState('stations') // 'stations' | 'summary'

  const bg = isDark ? '#0d0d0d' : '#ffffff'
  const cardBg = isDark ? '#1a1a1a' : '#ffffff'
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const textMain = isDark ? '#f5f5f5' : '#0f172a'
  const textMuted = isDark ? '#888' : '#64748b'

  function loadData() {
    setLoading(true)
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

  useEffect(() => { loadData() }, [])

  const filtered = stations.filter(s => activeCountry === 'all' || s.country === activeCountry)
  const prices = filtered.map(s => fuelType === 'diesel' ? s.diesel : s.benzin).filter(Boolean)
  const avgPrice = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(3) : '—'
  const minPrice = prices.length ? Math.min(...prices).toFixed(3) : '—'

  return (
    <div className="page-container" style={{ background: bg }}>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black" style={{ color: textMain }}>Tankpreise</h1>
            <p className="text-xs mt-0.5" style={{ color: textMuted }}>Gesamte Sıla Yolu Route</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={loadData}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', border: `1px solid ${borderColor}` }}>
              <RefreshCw size={15} style={{ color: textMuted }} />
            </motion.button>
          </div>
        </div>

        {/* Fuel Type Toggle */}
        <div className="flex gap-2 mb-4">
          {[['diesel', 'Diesel', '#f59e0b'], ['benzin', 'Benzin / E5', '#3b82f6']].map(([val, label, color]) => (
            <button key={val} onClick={() => setFuelType(val)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: fuelType === val ? color : isDark ? '#1a1a1a' : '#f7f8fc',
                color: fuelType === val ? 'white' : textMuted,
                border: `1px solid ${fuelType === val ? color : borderColor}`,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-1.5 mb-4 p-1 rounded-xl" style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', border: `1px solid ${borderColor}` }}>
          {[['stations', '⛽ Tankstellen'], ['summary', '🗺️ Länderübersicht']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveView(id)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: activeView === id ? 'linear-gradient(135deg, #e8192c, #c0111f)' : 'transparent', color: activeView === id ? 'white' : textMuted }}>
              {label}
            </button>
          ))}
        </div>

        {/* Stats Banner */}
        {!loading && activeView === 'stations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-4 mb-4 grid grid-cols-2 gap-3"
            style={{ background: isDark ? '#1a1a1a' : '#fffbeb', border: `1px solid ${isDark ? borderColor : 'rgba(245,158,11,0.2)'}` }}>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
                <TrendingDown size={16} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: textMuted }}>Ø Route</div>
                <div className="font-black text-base" style={{ color: '#f59e0b' }}>{avgPrice} €</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
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
            {/* Country Filter */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 no-scrollbar">
              {COUNTRY_TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveCountry(tab.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1"
                  style={{
                    background: activeCountry === tab.id ? 'linear-gradient(135deg, #e8192c, #c0111f)' : isDark ? '#1a1a1a' : '#f7f8fc',
                    color: activeCountry === tab.id ? 'white' : textMuted,
                    border: `1px solid ${activeCountry === tab.id ? '#e8192c' : borderColor}`,
                  }}>
                  {tab.flag} {tab.label}
                </button>
              ))}
            </div>

            {loading ? <SkeletonList count={5} /> : (
              <div className="flex flex-col gap-3">
                {filtered.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <FuelCard station={s} fuelType={fuelType} />
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-12" style={{ color: textMuted }}>
                    <Fuel size={36} className="mx-auto mb-3 opacity-30" />
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
            {/* Tipp Banner */}
            <div className="rounded-2xl p-4 mb-4 flex gap-3"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="text-xl">💡</span>
              <div>
                <div className="font-semibold text-sm" style={{ color: '#22c55e' }}>Spar-Tipp</div>
                <div className="text-xs mt-0.5" style={{ color: textMuted }}>
                  In <strong style={{ color: textMain }}>Serbien</strong> voll tanken! Günstigste Preise auf der ganzen Route (~1,40 €). Vor der TR-Grenze nochmal in <strong style={{ color: textMain }}>Bulgarien</strong> nachtanken.
                </div>
              </div>
            </div>

            {loading ? <SkeletonList count={6} /> : (
              <div className="flex flex-col gap-3">
                {summary.map((c, i) => {
                  const price = fuelType === 'diesel' ? c.diesel : c.benzin
                  const TrendIcon = c.trend === 'down' ? TrendingDown : c.trend === 'up' ? TrendingUp : Minus
                  const trendColor = c.trend === 'down' ? '#22c55e' : c.trend === 'up' ? '#ef4444' : textMuted
                  return (
                    <motion.div key={c.code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="rounded-2xl p-4 flex items-center justify-between"
                      style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: textMain }}>{c.country}</div>
                          <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: trendColor }}>
                            <TrendIcon size={11} /> {c.trend === 'down' ? 'günstig' : c.trend === 'up' ? 'teuer' : 'stabil'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-lg" style={{ color: price < 1.5 ? '#22c55e' : price < 1.7 ? '#f59e0b' : '#ef4444' }}>
                          {price?.toFixed(3)} €
                        </div>
                        <div className="text-xs" style={{ color: textMuted }}>pro Liter</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Source Info */}
        {!loading && source && (
          <div className="mt-4 flex items-start gap-2 px-1">
            <Info size={12} style={{ color: textMuted, flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs" style={{ color: textMuted }}>
              Quelle: {source}. Preise können leicht abweichen.
            </p>
          </div>
        )}

        {/* Report Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-5 rounded-2xl p-4"
          style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
          <div className="font-semibold text-sm mb-1" style={{ color: textMain }}>Preis melden</div>
          <p className="text-xs mb-3" style={{ color: textMuted }}>Hilf anderen Fahrern mit aktuellen Preisen</p>
          <button className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #e8192c, #c0111f)', color: 'white' }}>
            + Tankstelle & Preis melden
          </button>
        </motion.div>
      </div>
    </div>
  )
}
