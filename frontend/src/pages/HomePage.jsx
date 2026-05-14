import { motion } from 'framer-motion'
import { Map, AlertTriangle, Fuel, Bot, Users, CheckSquare, ChevronRight, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'

const features = [
  { icon: AlertTriangle, label: 'Live Grenzinfos', color: '#e8192c', bg: '#fff0f1', desc: 'Echtzeit Wartezeiten' },
  { icon: Fuel, label: 'Tankpreise', color: '#f59e0b', bg: '#fffbeb', desc: 'DE, AT & Route' },
  { icon: Bot, label: 'KI Assistent', color: '#1a237e', bg: '#eef0ff', desc: 'GPT-4 powered' },
  { icon: Map, label: 'Vignetten', color: '#7c3aed', bg: '#f5f3ff', desc: '9 Länder' },
  { icon: Users, label: 'Community', color: '#059669', bg: '#ecfdf5', desc: 'Live Meldungen' },
  { icon: CheckSquare, label: 'Checkliste', color: '#ea580c', bg: '#fff7ed', desc: 'Reise Vorbereitung' },
]

const stats = [
  { label: 'Aktive Fahrer', value: '12.4K' },
  { label: 'Grenz-Meldungen', value: '3.2K' },
  { label: 'Länder', value: '12+' },
]

export default function HomePage() {
  const { isDark, setActiveTab } = useStore()

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #e8192c 0%, #9b1120 60%, #1a237e 100%)', minHeight: 340 }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 px-5 pt-14 pb-8">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white text-xs font-medium">Live · 12.4K Fahrer aktiv</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-4xl font-black text-white leading-tight mb-2">
              Sıla Yolu<br /><span style={{ color: '#ffd700' }}>AI</span>
            </h1>
            <p className="text-white/70 text-sm mb-6">
              Dein smarter Reiseassistent für die Fahrt in die Türkei.
            </p>
          </motion.div>

          {/* Route animation */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-8 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span className="text-2xl">🇩🇪</span>
            <div className="flex-1 flex items-center gap-0.5">
              {[...Array(8)].map((_, i) => (
                <motion.div key={i} className="flex-1 h-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.4)' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15 }} />
              ))}
            </div>
            <motion.span className="text-xl" animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>🚗</motion.span>
            <div className="flex-1 flex items-center gap-0.5">
              {[...Array(8)].map((_, i) => (
                <motion.div key={i} className="flex-1 h-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.4)' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15 + 0.8 }} />
              ))}
            </div>
            <span className="text-2xl">🇹🇷</span>
          </motion.div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Map, label: 'Route berechnen', tab: 'route', primary: true },
              { icon: Bot, label: 'KI-Assistent', tab: 'ai', primary: false },
              { icon: AlertTriangle, label: 'Grenze Live', tab: 'border', primary: false },
              { icon: Users, label: 'Community', tab: 'community', primary: false },
            ].map((btn, i) => {
              const Icon = btn.icon
              return (
                <motion.button key={i} whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                  onClick={() => setActiveTab(btn.tab)}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
                  style={{
                    background: btn.primary ? 'white' : 'rgba(255,255,255,0.12)',
                    color: btn.primary ? '#e8192c' : 'white',
                    border: btn.primary ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  }}>
                  <Icon size={15} /> {btn.label}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-5">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="rounded-2xl p-3 text-center"
              style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}` }}>
              <div className="text-xl font-black" style={{ color: '#e8192c' }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: isDark ? '#888' : '#64748b' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ color: isDark ? '#f5f5f5' : '#0f172a' }}>Alle Features</h2>
          <div className="flex items-center gap-1 text-xs" style={{ color: '#e8192c' }}>
            <TrendingUp size={12} /> Neu
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}
                whileTap={{ scale: 0.97 }}
                className="rounded-2xl p-4 cursor-pointer"
                style={{ background: isDark ? '#1a1a1a' : f.bg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : f.color + '20'}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: isDark ? f.color + '20' : f.color + '15' }}>
                  <Icon size={18} style={{ color: f.color }} />
                </div>
                <div className="font-semibold text-sm" style={{ color: isDark ? '#f5f5f5' : '#0f172a' }}>{f.label}</div>
                <div className="text-xs mt-0.5" style={{ color: isDark ? '#888' : '#64748b' }}>{f.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Premium Banner */}
      <div className="px-4 pb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #e8192c, #1a237e)', boxShadow: '0 8px 32px rgba(232,25,44,0.25)' }}>
          <div>
            <div className="text-xs font-bold mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>⭐ PREMIUM</div>
            <div className="text-white font-bold">Alles freischalten</div>
            <div className="text-white/60 text-xs mt-0.5">KI Voice · Offline · PDF</div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            Upgrade <ChevronRight size={14} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
