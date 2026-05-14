import { motion } from 'framer-motion'
import { Clock, Users, Camera, Mic } from 'lucide-react'
import { useStore } from '../store/useStore'

const STATUS_CONFIG = {
  green: { label: 'Wenig Andrang', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', wait: '10-30 Min' },
  yellow: { label: 'Mittel', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', wait: '30-90 Min' },
  red: { label: 'Stark belegt', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', wait: '2-4 Std' },
}

export default function BorderCard({ border, onReport }) {
  const { isDark } = useStore()
  const status = STATUS_CONFIG[border.status || 'yellow']

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl p-5"
      style={{
        background: isDark ? '#111827' : '#ffffff',
        border: `1px solid ${status.color}30`,
        boxShadow: `0 4px 20px ${status.color}15`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            {border.name}
          </h3>
          <span className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{border.country}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: status.bg }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: status.color }} />
          <span className="text-xs font-semibold" style={{ color: status.color }}>{status.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <Clock size={14} style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
          <span className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{status.wait}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={14} style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
          <span className="text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>
            {border.reports || 0} Meldungen
          </span>
        </div>
      </div>

      {border.lastReport && (
        <div className="text-xs px-3 py-2 rounded-xl mb-3"
          style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: isDark ? '#94a3b8' : '#64748b' }}>
          💬 {border.lastReport}
        </div>
      )}

      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onReport?.(border, 'text')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium"
          style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#e2e8f0' : '#334155' }}
        >
          <Users size={14} /> Melden
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onReport?.(border, 'voice')}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(220,38,38,0.15)' }}
        >
          <Mic size={16} style={{ color: '#dc2626' }} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onReport?.(border, 'photo')}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(29,78,216,0.15)' }}
        >
          <Camera size={16} style={{ color: '#3b82f6' }} />
        </motion.button>
      </div>
    </motion.div>
  )
}
