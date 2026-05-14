import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Fuel, TrendingDown, MapPin, RefreshCw, AlertCircle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
import { useStore } from '../store/useStore'
import FuelCard from '../components/FuelCard'
import { SkeletonList } from '../components/LoadingSkeleton'

const DUMMY_STATIONS = [
  { id: 1, name: 'ARAL München-Nord', address: 'A9, Km 520', diesel: 1.649, benzin: 1.759, cheap: false, updated: 'vor 15 Min', country: 'de' },
  { id: 2, name: 'Shell Rastanlage Inntal', address: 'A93, Österreich', diesel: 1.589, benzin: 1.699, cheap: true, updated: 'vor 8 Min', country: 'at' },
  { id: 3, name: 'OMV Wien Süd', address: 'A2, Wien', diesel: 1.579, benzin: 1.689, cheap: true, updated: 'vor 22 Min', country: 'at' },
  { id: 4, name: 'MOL Budapest', address: 'M7, Budapest', diesel: 1.42, benzin: 1.53, cheap: true, updated: 'vor 1 Std', country: 'hu' },
  { id: 5, name: 'NIS Beograd', address: 'E75, Serbien', diesel: 1.28, benzin: 1.35, cheap: true, updated: 'vor 2 Std', country: 'rs' },
  { id: 6, name: 'Lukoil Sofia', address: 'A1, Bulgarien', diesel: 1.31, benzin: 1.38, cheap: true, updated: 'vor 3 Std', country: 'bg' },
]

const COUNTRY_TABS = [
  { id: 'all', label: 'Alle', flag: '🌍' },
  { id: 'de', label: 'DE', flag: '🇩🇪' },
  { id: 'at', label: 'AT', flag: '🇦🇹' },
  { id: 'hu', label: 'HU', flag: '🇭🇺' },
  { id: 'rs', label: 'RS', flag: '🇷🇸' },
  { id: 'bg', label: 'BG', flag: '🇧🇬' },
]

export default function FuelPage() {
  const { isDark } = useStore()
  const [stations, setStations] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCountry, setActiveCountry] = useState('all')
  const [fuelType, setFuelType] = useState('diesel')

  const bg = isDark ? '#0d0d0d' : '#ffffff'
  const textMain = isDark ? '#f5f5f5' : '#0f172a'
  const textMuted = isDark ? '#888' : '#64748b'
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

  useEffect(() => {
    fetch(`${API_BASE}/api/fuel/route`)
      .then(r => r.json())
      .then(data => { setStations(data.stations || DUMMY_STATIONS); setLoading(false) })
      .catch(() => { setStations(DUMMY_STATIONS); setLoading(false) })
  }, [])

  const filtered = stations?.filter(s => activeCountry === 'all' || s.country === activeCountry) || []
  const avgPrice = filtered.length
    ? (filtered.reduce((sum, s) => sum + (fuelType === 'diesel' ? s.diesel : s.benzin), 0) / filtered.length).toFixed(3)
    : '—'

  return (
    <div className="page-container" style={{ background: bg }}>
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black" style={{ color: textMain }}>Tankpreise</h1>
            <p className="text-sm" style={{ color: textMuted }}>Entlang deiner Route</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFuelType('diesel')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: fuelType === 'diesel' ? '#f59e0b' : isDark ? '#1a1a1a' : '#f7f8fc', color: fuelType === 'diesel' ? 'white' : textMuted }}>
              Diesel
            </button>
            <button onClick={() => setFuelType('benzin')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: fuelType === 'benzin' ? '#3b82f6' : isDark ? '#1a1a1a' : '#f7f8fc', color: fuelType === 'benzin' ? 'white' : textMuted }}>
              Benzin
            </button>
          </div>
        </div>

        {/* Avg Price Banner */}
        {!loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-4 mb-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.2)' }}>
              <TrendingDown size={18} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <div className="text-xs" style={{ color: textMuted }}>Ø {fuelType === 'diesel' ? 'Diesel' : 'Benzin'} auf Route</div>
              <div className="text-xl font-black" style={{ color: '#f59e0b' }}>{avgPrice} €/L</div>
            </div>
          </motion.div>
        )}

        {/* Country Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {COUNTRY_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveCountry(tab.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1"
              style={{
                background: activeCountry === tab.id ? 'linear-gradient(135deg, #e8192c, #c0111f)' : isDark ? '#1a1a1a' : '#f7f8fc',
                color: activeCountry === tab.id ? 'white' : textMuted,
              }}>
              {tab.flag} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonList count={4} />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <FuelCard station={s} />
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12" style={{ color: textMuted }}>
                <Fuel size={40} className="mx-auto mb-3 opacity-30" />
                <p>Keine Tankstellen für dieses Land</p>
              </div>
            )}
          </div>
        )}

        {/* Community Report */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-6 rounded-3xl p-4"
          style={{ background: isDark ? '#1a1a1a' : '#ffffff', border: `1px solid ${borderColor}` }}>
          <h3 className="font-bold mb-2 text-sm" style={{ color: textMain }}>Preis melden</h3>
          <p className="text-xs mb-3" style={{ color: textMuted }}>Hilf anderen Fahrern mit aktuellen Preisen</p>
          <button className="w-full py-3 rounded-2xl text-sm font-semibold"
            style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', color: '#3b82f6' }}>
            + Tankstelle & Preis melden
          </button>
        </motion.div>
      </div>
    </div>
  )
}
