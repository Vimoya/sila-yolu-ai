import { motion } from 'framer-motion'
import { MapPin, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function FuelCard({ station, fuelType = 'diesel' }) {
  const { isDark } = useStore()
  const bg = isDark ? '#1a1a1a' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const textMain = isDark ? '#f5f5f5' : '#0f172a'
  const textMuted = isDark ? '#888' : '#64748b'
  const isLive = station.updated?.includes('live') || station.updated?.includes('🟢')

  const price = fuelType === 'diesel' ? station.diesel : station.benzin
  const priceColor = price < 1.5 ? '#22c55e' : price < 1.7 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div whileTap={{ scale: 0.99 }}
      className="rounded-2xl p-4"
      style={{ background: bg, border: `1px solid ${station.cheap ? 'rgba(34,197,94,0.3)' : border}` }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 pr-2">
          <div className="font-semibold text-sm flex items-center gap-1.5" style={{ color: textMain }}>
            {station.name}
            {isLive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: textMuted }}>
            <MapPin size={10} /> {station.address}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-black text-xl" style={{ color: priceColor }}>
            {price != null ? `${price.toFixed(3)}€` : '—'}
          </div>
          <div className="text-xs" style={{ color: textMuted }}>
            {fuelType === 'diesel' ? 'Diesel' : 'Benzin'}/L
          </div>
        </div>
      </div>

      {/* Both prices small */}
      <div className="flex gap-2 mb-2">
        {station.diesel != null && (
          <span className="text-xs px-2 py-1 rounded-lg"
            style={{ background: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)', color: '#f59e0b' }}>
            Diesel {station.diesel.toFixed(3)}€
          </span>
        )}
        {station.benzin != null && (
          <span className="text-xs px-2 py-1 rounded-lg"
            style={{ background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>
            Benzin {station.benzin.toFixed(3)}€
          </span>
        )}
        {station.cheap && (
          <span className="text-xs px-2 py-1 rounded-lg ml-auto"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
            ✓ Günstig
          </span>
        )}
      </div>

      {station.note && (
        <div className="text-xs px-3 py-2 rounded-xl flex items-start gap-1.5"
          style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: textMuted }}>
          <Zap size={10} style={{ flexShrink: 0, marginTop: 2, color: '#f59e0b' }} />
          {station.note}
        </div>
      )}
    </motion.div>
  )
}
