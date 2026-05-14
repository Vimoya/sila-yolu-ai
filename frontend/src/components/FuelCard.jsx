import { motion } from 'framer-motion'
import { Fuel, MapPin, Clock, TrendingDown } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function FuelCard({ station }) {
  const { isDark } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: isDark ? '#111827' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-sm" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            {station.name}
          </div>
          <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
            <MapPin size={11} /> {station.address}
          </div>
        </div>
        {station.cheap && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
            <TrendingDown size={10} /> Günstig
          </span>
        )}
      </div>

      <div className="flex gap-3">
        {station.diesel != null && (
          <div className="flex-1 rounded-xl p-2 text-center"
            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
            <div className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Diesel</div>
            <div className="font-bold text-base" style={{ color: '#f59e0b' }}>
              {station.diesel.toFixed(3)} €
            </div>
          </div>
        )}
        {station.benzin != null && (
          <div className="flex-1 rounded-xl p-2 text-center"
            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
            <div className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Benzin</div>
            <div className="font-bold text-base" style={{ color: '#3b82f6' }}>
              {station.benzin.toFixed(3)} €
            </div>
          </div>
        )}
      </div>

      {station.updated && (
        <div className="flex items-center gap-1 text-xs mt-2" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
          <Clock size={10} /> Aktualisiert: {station.updated}
        </div>
      )}
    </motion.div>
  )
}
