import { motion } from 'framer-motion'
import { Clock, Users, Camera, MessageSquare } from 'lucide-react'

const STATUS_CONFIG = {
  green: { label: 'Wenig Andrang', color: '#4ade80', glow: 'rgba(74,222,128,0.15)', wait: '10–30 Min' },
  yellow: { label: 'Mittel', color: '#fbbf24', glow: 'rgba(251,191,36,0.15)', wait: '30–90 Min' },
  red: { label: 'Stark belegt', color: '#f87171', glow: 'rgba(248,113,113,0.15)', wait: '2–4 Std' },
}

export default function BorderCard({ border, onReport }) {
  const status = STATUS_CONFIG[border.status || 'yellow']

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl p-4"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${status.glow.replace('0.15', '0.25')}`,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
      }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-base" style={{ color: '#f5f5f5' }}>{border.name}</h3>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{border.country}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: status.glow, border: `1px solid ${status.color}40` }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: status.color }} />
          <span className="text-xs font-bold" style={{ color: status.color }}>{status.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <Clock size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span className="text-sm font-semibold" style={{ color: status.color }}>{status.wait}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{border.reports} Meldungen</span>
        </div>
      </div>

      {border.lastReport && (
        <div className="text-xs px-3 py-2.5 rounded-2xl mb-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}>
          💬 {border.lastReport}
        </div>
      )}

      {border.photos?.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {border.photos.map((src, i) => (
            <img key={i} src={src} alt="Grenzbild" className="rounded-xl object-cover flex-shrink-0"
              style={{ width: 80, height: 56 }} />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onReport?.(border, 'text')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f5' }}>
          <MessageSquare size={13} /> Melden
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onReport?.(border, 'photo')}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}>
          <Camera size={15} style={{ color: '#60a5fa' }} />
        </motion.button>
      </div>
    </motion.div>
  )
}
