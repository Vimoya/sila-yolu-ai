import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Map, AlertTriangle, Fuel, Bot, Users, CheckSquare, ChevronRight, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import SilaLogo from '../components/SilaLogo'

const features = [
  { icon: AlertTriangle, label: 'Live Grenzinfos', color: '#f59e0b', desc: 'Echtzeit Wartezeiten', tab: 'border' },
  { icon: Fuel, label: 'Tankpreise', color: '#60a5fa', desc: 'DE, AT & Route', tab: 'fuel' },
  { icon: Bot, label: 'KI Assistent', color: '#a78bfa', desc: 'Reise-Assistent', tab: 'ai' },
  { icon: Map, label: 'Route & Maut', color: '#34d399', desc: '4 Routen, Vignetten', tab: 'route' },
  { icon: Users, label: 'Community', color: '#fb7185', desc: 'Live Meldungen', tab: 'community' },
  { icon: CheckSquare, label: 'Checkliste', color: '#e2e8f0', desc: 'Reise Vorbereitung', tab: 'profile' },
]

const stats = [
  { label: 'Aktive Fahrer', value: '12.4K' },
  { label: 'Grenz-Meldungen', value: '3.2K' },
  { label: 'Länder', value: '12+' },
]

const CITIES = [
  { label: 'München', pct: 0, flag: '🇩🇪' },
  { label: 'Wien', pct: 0.2, flag: '🇦🇹' },
  { label: 'Budapest', pct: 0.38, flag: '🇭🇺' },
  { label: 'Belgrad', pct: 0.56, flag: '🇷🇸' },
  { label: 'Sofia', pct: 0.74, flag: '🇧🇬' },
  { label: 'İstanbul', pct: 1, flag: '🇹🇷' },
]

const TOTAL_KM = 2800

function CarAnimation() {
  const x = useMotionValue(0)
  const [km, setKm] = useState(0)
  const [activeCity, setActiveCity] = useState(0)

  useEffect(() => {
    const ctrl = animate(x, [0, 1], {
      duration: 6,
      repeat: Infinity,
      repeatDelay: 1.2,
      ease: [0.4, 0, 0.2, 1],
      onUpdate(v) {
        setKm(Math.round(v * TOTAL_KM))
        const idx = CITIES.findLastIndex(c => v >= c.pct)
        setActiveCity(idx >= 0 ? idx : 0)
      },
    })
    return () => ctrl.stop()
  }, [])

  const roadWidth = 300
  const carX = useTransform(x, [0, 1], [0, roadWidth - 28])

  return (
    <div className="relative w-full select-none" style={{ height: 88 }}>
      {/* City labels */}
      <div className="absolute top-0 left-0 right-0 flex justify-between px-1" style={{ height: 32 }}>
        {CITIES.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5" style={{ width: 36 }}>
            <motion.div
              animate={{ scale: activeCity === i ? 1.3 : 1, opacity: activeCity >= i ? 1 : 0.35 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-sm leading-none">
              {c.flag}
            </motion.div>
            <span className="text-[8px] font-semibold leading-none"
              style={{ color: activeCity === i ? '#ffffff' : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {/* Road — glass dark */}
      <div className="absolute left-0 right-0 rounded-2xl overflow-hidden"
        style={{
          top: 36, height: 28,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
        }}>
        {/* Progress fill */}
        <motion.div className="absolute left-0 top-0 bottom-0 rounded-l-2xl"
          style={{
            width: useTransform(x, [0, 1], ['0%', '100%']),
            background: 'linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
          }} />
        {/* Dashes */}
        <motion.div className="absolute top-1/2 flex gap-4"
          style={{ transform: 'translateY(-50%)', width: 600 }}
          animate={{ x: [0, -120] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}>
          {[...Array(18)].map((_, i) => (
            <div key={i} className="rounded-full flex-shrink-0"
              style={{ width: 20, height: 2, background: 'rgba(255,255,255,0.2)' }} />
          ))}
        </motion.div>
        {/* City dots */}
        {CITIES.map((c, i) => (
          <motion.div key={i} className="absolute top-1/2 rounded-full"
            style={{
              left: `${c.pct * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: 5, height: 5,
              background: activeCity >= i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
              boxShadow: activeCity >= i ? '0 0 6px rgba(255,255,255,0.6)' : 'none',
            }}
            animate={{ scale: activeCity === i ? [1, 1.6, 1] : 1 }}
            transition={{ repeat: activeCity === i ? Infinity : 0, duration: 0.8 }} />
        ))}
      </div>

      {/* Car */}
      <motion.div
        style={{ x: carX, position: 'absolute', top: 30, fontSize: 22 }}
        animate={{ y: [0, -1, 0] }}
        transition={{ repeat: Infinity, duration: 0.35, ease: 'easeInOut' }}>
        🚗
      </motion.div>

      {/* KM */}
      <div className="absolute right-0 bottom-0">
        <span className="text-[10px] font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {km.toLocaleString()} km
        </span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { setActiveTab } = useStore()

  const glass = {
    background: 'rgba(255,255,255,0.09)',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
  }
  const cardBg = 'rgba(255,255,255,0.04)'
  const cardBorder = 'rgba(255,255,255,0.08)'
  const textMain = '#f5f5f5'
  const textMuted = 'rgba(255,255,255,0.38)'

  return (
    <div className="page-container" style={{ background: 'linear-gradient(135deg, #080810 0%, #0d0d1a 50%, #080810 100%)' }}>

      {/* Hero — liquid glass */}
      <div className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(40px)',
          minHeight: 340,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 pointer-events-none"
          style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(120,80,255,0.06) 0%, transparent 65%)', transform: 'translate(-50%,-40%)' }} />
        <div className="absolute bottom-0 right-0 pointer-events-none"
          style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(80,160,255,0.05) 0%, transparent 65%)', transform: 'translate(30%,30%)' }} />

        <div className="relative z-10 px-5 pt-12 pb-6">
          {/* Logo + Badge */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <SilaLogo size={44} />
              <div>
                <div className="font-black text-xl leading-none" style={{ color: textMain }}>Sıla Yolu</div>
                <div className="font-black text-xl leading-none" style={{ color: 'rgba(255,255,255,0.5)' }}>AI</div>
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>12.4K Live</span>
            </motion.div>
          </div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Dein smarter Reiseassistent für die Fahrt in die Türkei.
          </motion.p>

          {/* Car animation */}
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
                  style={btn.primary ? {
                    background: 'rgba(255,255,255,0.1)',
                    color: '#f0f0f0',
                    border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(8px)',
                  } : {
                    background: 'rgba(255,255,255,0.09)',
                    color: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.08)',
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
              style={glass}>
              <div className="text-xl font-black" style={{ color: textMain }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: textMuted }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ color: textMain }}>Alle Features</h2>
          <div className="flex items-center gap-1 text-xs" style={{ color: textMuted }}>
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
                style={glass}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Icon size={18} style={{ color: f.color }} />
                </div>
                <div className="font-semibold text-sm" style={{ color: textMain }}>{f.label}</div>
                <div className="text-xs mt-0.5" style={{ color: textMuted }}>{f.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Premium Banner — glass dark */}
      <div className="px-4 pb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-5 flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.09)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}>
          <div>
            <div className="text-xs font-bold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>⭐ PREMIUM</div>
            <div className="font-bold" style={{ color: textMain }}>Alles freischalten</div>
            <div className="text-xs mt-0.5" style={{ color: textMuted }}>KI Voice · Offline · PDF</div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
            Upgrade <ChevronRight size={14} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
