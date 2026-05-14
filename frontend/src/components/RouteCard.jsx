import { motion } from 'framer-motion'
import { Clock, Navigation, Fuel, Euro, Star, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function RouteCard({ route, onSelect, index = 0 }) {
  const { isDark } = useStore()

  const cardBg = isDark
    ? 'linear-gradient(135deg, #111827 0%, #1e2940 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)'

  const fuelCost = Math.round((route.km / 100) * 8.5 * 1.65)
  const totalCost = fuelCost + (route.toll || 0) + (route.vignetteCost || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(route)}
      className="rounded-3xl p-5 cursor-pointer relative overflow-hidden"
      style={{ background: cardBg, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}
    >
      {route.recommended && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
          <Star size={10} fill="white" />
          Empfohlen
        </div>
      )}

      <div className="mb-3">
        <h3 className="font-bold text-base" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
          {route.name}
        </h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {route.flags?.map((flag, i) => (
            <span key={i} className="text-lg">{flag}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat icon={<Navigation size={14} />} label="Distanz" value={`${route.km?.toLocaleString()} km`} isDark={isDark} />
        <Stat icon={<Clock size={14} />} label="Fahrzeit" value={`~${route.hours}h`} isDark={isDark} />
        <Stat icon={<Fuel size={14} />} label="Tankkosten" value={`~${fuelCost} €`} isDark={isDark} />
        <Stat icon={<Euro size={14} />} label="Gesamt" value={`~${totalCost} €`} isDark={isDark} accent />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
          {route.vignettes?.map((v, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
              {v}
            </span>
          ))}
        </div>
        <ChevronRight size={18} style={{ color: '#dc2626' }} />
      </div>
    </motion.div>
  )
}

function Stat({ icon, label, value, isDark, accent }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-xl flex items-center justify-center"
        style={{ background: accent ? 'rgba(220,38,38,0.15)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
        <span style={{ color: accent ? '#dc2626' : isDark ? '#94a3b8' : '#64748b' }}>{icon}</span>
      </div>
      <div>
        <div className="text-[10px]" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{label}</div>
        <div className="text-sm font-semibold" style={{ color: accent ? '#dc2626' : isDark ? '#f1f5f9' : '#0f172a' }}>{value}</div>
      </div>
    </div>
  )
}
