import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import { Map, AlertTriangle, Fuel, Bot, Users, CheckSquare, ChevronRight, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import SilaLogo from '../components/SilaLogo'

const features = [
  { icon: AlertTriangle, label: 'Live Grenzinfos', color: '#e8192c', bg: '#fff0f1', desc: 'Echtzeit Wartezeiten', tab: 'border' },
  { icon: Fuel, label: 'Tankpreise', color: '#f59e0b', bg: '#fffbeb', desc: 'DE, AT & Route', tab: 'fuel' },
  { icon: Bot, label: 'KI Assistent', color: '#1a237e', bg: '#eef0ff', desc: 'GPT-4 powered', tab: 'ai' },
  { icon: Map, label: 'Vignetten', color: '#7c3aed', bg: '#f5f3ff', desc: '9 Länder', tab: 'route' },
  { icon: Users, label: 'Community', color: '#059669', bg: '#ecfdf5', desc: 'Live Meldungen', tab: 'community' },
  { icon: CheckSquare, label: 'Checkliste', color: '#ea580c', bg: '#fff7ed', desc: 'Reise Vorbereitung', tab: 'profile' },
]

const stats = [
  { label: 'Aktive Fahrer', value: '12.4K' },
  { label: 'Grenz-Meldungen', value: '3.2K' },
  { label: 'Länder', value: '12+' },
]

// Animated car on road
function CarAnimation() {
  const x = useMotionValue(0)

  useEffect(() => {
    const ctrl = animate(x, [0, 260], {
      duration: 3.5,
      repeat: Infinity,
      repeatDelay: 0.5,
      ease: 'easeInOut',
    })
    return ctrl.stop
  }, [])

  const roadProgress = useTransform(x, [0, 260], [0, 1])

  return (
    <div className="relative w-full h-16 my-2">
      {/* Road */}
      <div className="absolute bottom-4 left-0 right-0 h-8 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.12)' }}>
        {/* Dashed lane */}
        <div className="absolute top-1/2 left-0 right-0 flex gap-3 px-4" style={{ transform: 'translateY(-50%)' }}>
          {[...Array(10)].map((_, i) => (
            <motion.div key={i} className="h-0.5 flex-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.4)' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }} />
          ))}
        </div>
        {/* Flags */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🇩🇪</div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">🇹🇷</div>
      </div>

      {/* Moving car */}
      <motion.div style={{ x, position: 'absolute', bottom: 6 }}
        className="text-2xl select-none">
        🚗
      </motion.div>
    </div>
  )
}

export default function HomePage() {
  const { isDark, setActiveTab } = useStore()
  const bg = isDark ? '#0d0d0d' : '#ffffff'
  const cardBg = isDark ? '#1a1a1a' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const textMain = isDark ? '#f5f5f5' : '#0f172a'
  const textMuted = isDark ? '#888' : '#64748b'

  return (
    <div className="page-container" style={{ background: bg }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #e8192c 0%, #9b1120 55%, #1a237e 100%)', minHeight: 340 }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(35%, -35%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10 px-5 pt-12 pb-6">
          {/* Logo + Badge */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <SilaLogo size={44} />
              <div>
                <div className="text-white font-black text-xl leading-none">Sıla Yolu</div>
                <div className="font-black text-xl leading-none" style={{ color: '#ffd700' }}>AI</div>
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-xs font-medium">12.4K Live</span>
            </motion.div>
          </div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-white/75 text-sm mb-4">
            Dein smarter Reiseassistent für die Fahrt in die Türkei.
          </motion.p>

          {/* Animated car road */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <CarAnimation />
          </motion.div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { icon: Map, label: 'Route berechnen', tab: 'route', primary: true },
              { icon: Bot, label: 'KI-Assistent', tab: 'ai', primary: false },
              { icon: AlertTriangle, label: 'Grenze Live', tab: 'border', primary: false },
              { icon: Users, label: 'Community', tab: 'community', primary: false },
            ].map((btn, i) => {
              const Icon = btn.icon
              return (
                <motion.button key={i} whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
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
              style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="text-xl font-black" style={{ color: '#e8192c' }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: textMuted }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ color: textMain }}>Alle Features</h2>
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
                onClick={() => setActiveTab(f.tab)}
                className="rounded-2xl p-4 cursor-pointer"
                style={{ background: isDark ? '#1a1a1a' : f.bg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : f.color + '20'}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: isDark ? f.color + '20' : f.color + '18' }}>
                  <Icon size={18} style={{ color: f.color }} />
                </div>
                <div className="font-semibold text-sm" style={{ color: textMain }}>{f.label}</div>
                <div className="text-xs mt-0.5" style={{ color: textMuted }}>{f.desc}</div>
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
