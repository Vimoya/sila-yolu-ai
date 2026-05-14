import { motion } from 'framer-motion'
import { Map, AlertTriangle, Fuel, Bot, Users, CheckSquare, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'

const features = [
  { icon: AlertTriangle, label: 'Live Grenzinfos', color: '#ef4444', desc: 'Kapıkule, Horgoš & mehr' },
  { icon: Fuel, label: 'Tankpreise', color: '#f59e0b', desc: 'Deutschland & Österreich' },
  { icon: Bot, label: 'KI Assistent', color: '#3b82f6', desc: 'Dein smarter Reiseguide' },
  { icon: Map, label: 'Vignetten', color: '#8b5cf6', desc: '9 Länder, alle Preise' },
  { icon: Users, label: 'Community', color: '#22c55e', desc: 'Live Fahrer-Meldungen' },
  { icon: CheckSquare, label: 'Checkliste', color: '#f97316', desc: 'Nie wieder vergessen' },
]

export default function HomePage() {
  const { isDark, setActiveTab, user } = useStore()

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0a0f1e 0%, #1a1035 40%, #0f1a3e 100%)',
          minHeight: 320,
        }}>
        {/* Background orbs */}
        <motion.div className="absolute w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #dc2626, transparent)', top: -60, right: -60 }}
          animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} />
        <motion.div className="absolute w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1d4ed8, transparent)', bottom: -40, left: -40 }}
          animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }} />

        <div className="relative z-10 px-5 pt-16 pb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                <Zap size={16} color="white" fill="white" />
              </div>
              <span className="text-white/60 text-sm">Beta</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-1 leading-tight">
              Sıla Yolu<span style={{ color: '#f59e0b' }}>AI</span>
            </h1>
            <p className="text-white/60 text-sm mb-6">
              Dein smarter Reiseassistent für die Fahrt in die Türkei.
            </p>
          </motion.div>

          {/* Route illustration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-8 text-sm"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🇩🇪</span>
              <span className="text-white/50 text-xs">Europa</span>
            </div>
            <div className="flex-1 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} className="flex-1 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(220,38,38,0.6))' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }} />
              ))}
              <motion.span className="text-lg"
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}>
                🚗
              </motion.span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🇹🇷</span>
              <span className="text-white/50 text-xs">Türkei</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('route')}
              className="py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 4px 20px rgba(220,38,38,0.4)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            >
              <Map size={16} /> Route berechnen
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('ai')}
              className="py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', boxShadow: '0 4px 20px rgba(29,78,216,0.4)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            >
              <Bot size={16} /> KI-Assistent
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('border')}
              className="py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            >
              <AlertTriangle size={16} /> Grenze Live
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('community')}
              className="py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            >
              <Users size={16} /> Community
            </motion.button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
          Alles für deine Reise
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                whileTap={{ scale: 0.95 }}
                className="rounded-3xl p-4 cursor-pointer"
                style={{
                  background: isDark ? '#111827' : '#ffffff',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: `${f.color}20` }}>
                  <Icon size={20} style={{ color: f.color }} />
                </div>
                <div className="font-semibold text-sm" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                  {f.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                  {f.desc}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Premium Banner */}
      <div className="px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1035 100%)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <div className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>⭐ PREMIUM</div>
            <div className="text-white font-bold text-base mb-1">Alle Features freischalten</div>
            <div className="text-white/60 text-xs mb-3">KI Voice • Offline • PDF Export • Live Warnungen</div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}
            >
              Jetzt freischalten
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
