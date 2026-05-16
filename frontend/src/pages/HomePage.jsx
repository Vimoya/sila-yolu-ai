import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Map, AlertTriangle, Fuel, Bot, Users, CheckSquare, ChevronRight, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import SilaLogo from '../components/SilaLogo'

const features = [
  { icon: AlertTriangle, label: 'Live Grenzinfos', color: '#FF8A3D', desc: 'Echtzeit Wartezeiten', tab: 'border' },
  { icon: Fuel, label: 'Tankpreise', color: '#4DA8FF', desc: 'DE, AT & Route', tab: 'fuel' },
  { icon: Bot, label: 'KI Assistent', color: '#F5B544', desc: 'Reise-Assistent', tab: 'ai' },
  { icon: Map, label: 'Route & Maut', color: '#38E58A', desc: '4 Routen, Vignetten', tab: 'route' },
  { icon: Users, label: 'Community', color: '#E854A8', desc: 'Live Meldungen', tab: 'community' },
  { icon: CheckSquare, label: 'Checkliste', color: '#B6BCC8', desc: 'Reise Vorbereitung', tab: 'profile' },
]

const stats = [
  { label: 'Aktive Fahrer', value: '12.4K', color: '#F5B544' },
  { label: 'Grenz-Meldungen', value: '3.2K', color: '#38E58A' },
  { label: 'Länder', value: '12+', color: '#4DA8FF' },
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
              style={{
                color: activeCity === i ? '#F5B544' : 'rgba(255,255,255,0.3)',
                whiteSpace: 'nowrap',
                fontFamily: 'DM Sans, sans-serif',
              }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {/* Road */}
      <div className="absolute left-0 right-0 rounded-2xl overflow-hidden"
        style={{
          top: 36, height: 28,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
        }}>
        {/* Progress fill */}
        <motion.div className="absolute left-0 top-0 bottom-0 rounded-l-2xl"
          style={{
            width: useTransform(x, [0, 1], ['0%', '100%']),
            background: 'linear-gradient(90deg, rgba(245,181,68,0.25), rgba(245,181,68,0.06))',
          }} />
        {/* Dashes */}
        <motion.div className="absolute top-1/2 flex gap-4"
          style={{ transform: 'translateY(-50%)', width: 600 }}
          animate={{ x: [0, -120] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}>
          {[...Array(18)].map((_, i) => (
            <div key={i} className="rounded-full flex-shrink-0"
              style={{ width: 20, height: 2, background: 'rgba(255,255,255,0.15)' }} />
          ))}
        </motion.div>
        {/* City dots */}
        {CITIES.map((c, i) => (
          <motion.div key={i} className="absolute top-1/2 rounded-full"
            style={{
              left: `${c.pct * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: 5, height: 5,
              background: activeCity >= i ? '#F5B544' : 'rgba(255,255,255,0.2)',
              boxShadow: activeCity >= i ? '0 0 6px rgba(245,181,68,0.7)' : 'none',
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
        <span className="sy-pump text-[10px]" style={{ color: '#F5B544' }}>
          {km.toLocaleString()} km
        </span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { setActiveTab, user } = useStore()

  const glass = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(28px) saturate(140%)',
    WebkitBackdropFilter: 'blur(28px) saturate(140%)',
    borderRadius: 22,
  }

  const username = user?.displayName || 'Reisender'

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(40px)',
          minHeight: 320,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 pointer-events-none"
          style={{ width: 360, height: 360, background: 'radial-gradient(circle, rgba(245,181,68,0.08) 0%, transparent 65%)', transform: 'translate(-30%,-30%)' }} />
        <div className="absolute top-0 right-0 pointer-events-none"
          style={{ width: 280, height: 280, background: 'radial-gradient(circle, rgba(77,168,255,0.07) 0%, transparent 65%)', transform: 'translate(30%,-30%)' }} />

        <div className="relative z-10 px-5 pt-10 pb-6">
          {/* Greeting + Badge */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#7A8090', fontFamily: 'DM Sans, sans-serif' }}>
                Hoş geldin · {username}
              </p>
              <div className="font-black text-2xl leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F2F4F8' }}>
                Sıla Yolu <span style={{ color: '#F5B544' }}>2026</span>
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(56,229,138,0.10)', border: '1px solid rgba(56,229,138,0.2)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#38E58A' }} />
              <span className="text-xs font-medium" style={{ color: '#38E58A', fontFamily: 'DM Sans, sans-serif' }}>12.4K Live</span>
            </motion.div>
          </div>

          {/* Car animation */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <CarAnimation />
          </motion.div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { icon: Map, label: 'Route berechnen', tab: 'route', primary: true },
              { icon: Bot, label: 'KI-Assistent', tab: 'ai', primary: false },
              { icon: AlertTriangle, label: 'Grenze Live', tab: 'border', primary: false },
              { icon: Users, label: 'Community', tab: 'community', primary: false },
            ].map((btn, i) => {
              const Icon = btn.icon
              return (
                <motion.button key={i} whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                  onClick={() => setActiveTab(btn.tab)}
                  className="flex items-center justify-center gap-2 py-3 text-sm font-semibold"
                  style={btn.primary ? {
                    background: 'linear-gradient(180deg, #FFCC5C, #D49628)',
                    color: '#0A0C10',
                    border: 'none',
                    borderRadius: 16,
                    fontFamily: 'DM Sans, sans-serif',
                    boxShadow: '0 4px 20px rgba(245,181,68,0.30)',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    color: '#B6BCC8',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    fontFamily: 'DM Sans, sans-serif',
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
              className="rounded-[22px] p-3 text-center"
              style={glass}>
              <div className="sy-pump text-xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#7A8090', fontFamily: 'DM Sans, sans-serif' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Live Preise */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm" style={{ color: '#F5B544', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.05em' }}>LIVE PREISE</h2>
          <span className="text-xs" style={{ color: '#4E5462', fontFamily: 'DM Sans, sans-serif' }}>Tankerkönig · DE</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Diesel', price: '1.549', color: '#38E58A', soft: 'rgba(56,229,138,0.10)', border: 'rgba(56,229,138,0.20)', trend: '−0.2ct' },
            { label: 'E10', price: '1.699', color: '#FF8A3D', soft: 'rgba(255,138,61,0.10)', border: 'rgba(255,138,61,0.20)', trend: '+0.1ct' },
            { label: 'E5', price: '1.749', color: '#4DA8FF', soft: 'rgba(77,168,255,0.10)', border: 'rgba(77,168,255,0.20)', trend: '−0.3ct' },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-[22px] p-3 text-center"
              style={{ background: f.soft, border: `1px solid ${f.border}`, backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: f.color, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.06em' }}>{f.label}</div>
              <div className="sy-pump text-lg" style={{ color: f.color }}>{f.price}</div>
              <div className="text-[9px] mt-1" style={{ color: f.color, opacity: 0.7 }}>{f.trend} heute</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm" style={{ color: '#F5B544', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.05em' }}>ALLE FEATURES</h2>
          <div className="flex items-center gap-1 text-xs" style={{ color: '#4E5462' }}>
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
                className="rounded-[22px] p-4 cursor-pointer"
                style={glass}>
                <div className="w-9 h-9 rounded-[14px] flex items-center justify-center mb-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Icon size={18} style={{ color: f.color }} />
                </div>
                <div className="font-semibold text-sm" style={{ color: '#F2F4F8', fontFamily: 'DM Sans, sans-serif' }}>{f.label}</div>
                <div className="text-xs mt-0.5" style={{ color: '#7A8090', fontFamily: 'DM Sans, sans-serif' }}>{f.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Premium Banner */}
      <div className="px-4 pb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-[22px] p-5 flex items-center justify-between"
          style={{ background: 'rgba(245,181,68,0.06)', border: '1px solid rgba(245,181,68,0.15)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}>
          <div>
            <div className="text-xs font-bold mb-1" style={{ color: '#F5B544', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.06em' }}>⭐ PREMIUM</div>
            <div className="font-bold" style={{ color: '#F2F4F8', fontFamily: 'Space Grotesk, sans-serif' }}>Alles freischalten</div>
            <div className="text-xs mt-0.5" style={{ color: '#7A8090', fontFamily: 'DM Sans, sans-serif' }}>KI Voice · Offline · PDF</div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 rounded-[14px] text-sm font-bold flex items-center gap-1"
            style={{
              background: 'linear-gradient(180deg, #FFCC5C, #D49628)',
              color: '#0A0C10',
              border: 'none',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 4px 16px rgba(245,181,68,0.30)',
            }}>
            Upgrade <ChevronRight size={14} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
