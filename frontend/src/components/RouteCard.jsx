import { motion } from 'framer-motion'
import { Clock, Navigation, Fuel, Euro, Star, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function RouteCard({ route, onSelect, index = 0 }) {
  const { isDark } = useStore()
  const cardBg = isDark ? '#1a1a1a' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const textMain = isDark ? '#f5f5f5' : '#0f172a'
  const textMuted = isDark ? '#888' : '#64748b'
  const fuelCost = Math.round((route.km / 100) * 8.5 * 1.65)
  const totalCost = fuelCost + (route.toll || 0) + (route.vignetteCost || 0)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }} whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(route)}
      className="rounded-2xl p-4 cursor-pointer relative"
      style={{ background: cardBg, border: `1px solid ${route.recommended ? '#e8192c' : border}` }}>
      {route.recommended && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: 'linear-gradient(135deg, #e8192c, #c0111f)', color: 'white' }}>
          <Star size={10} fill="white" /> Empfohlen
        </div>
      )}
      <div className="mb-3">
        <h3 className="font-bold text-sm pr-20" style={{ color: textMain }}>{route.name}</h3>
        <div className="flex flex-wrap gap-0.5 mt-1">
          {route.flags?.map((flag, i) => <span key={i} className="text-base">{flag}</span>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Navigation, label: 'Distanz', value: `${route.km?.toLocaleString()} km`, accent: false },
          { icon: Clock, label: 'Fahrzeit', value: `~${route.hours}h`, accent: false },
          { icon: Fuel, label: 'Sprit', value: `~${fuelCost} €`, accent: false },
          { icon: Euro, label: 'Gesamt', value: `~${totalCost} €`, accent: true },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: s.accent ? 'rgba(232,25,44,0.12)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
              <s.icon size={13} style={{ color: s.accent ? '#e8192c' : textMuted }} />
            </div>
            <div>
              <div className="text-[10px]" style={{ color: textMuted }}>{s.label}</div>
              <div className="text-sm font-semibold" style={{ color: s.accent ? '#e8192c' : textMain }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
