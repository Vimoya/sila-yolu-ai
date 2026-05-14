import { useState } from 'react'
import { motion } from 'framer-motion'
import { Map, AlertTriangle, Fuel, Bot, Users, CheckSquare, ChevronRight, Star, Shield, Zap, Clock, Navigation } from 'lucide-react'
import SilaLogo from '../components/SilaLogo'

const glass = {
  background: 'rgba(255,255,255,0.09)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
}

const FEATURES = [
  { icon: Map, label: 'Route & Maut', desc: '4 optimierte Routen mit allen Vignetten, Mautgebühren und Tunneln', color: '#60a5fa' },
  { icon: AlertTriangle, label: 'Live Grenzinfo', desc: 'Echtzeit Wartezeiten an allen Grenzübergängen auf der Strecke', color: '#f59e0b' },
  { icon: Fuel, label: 'Tankpreise', desc: 'Aktuelle Preise in DE, AT, HU, RS, BG und TR — wann & wo tanken', color: '#34d399' },
  { icon: Bot, label: 'KI Assistent', desc: 'GPT-4 beantwortet all deine Fragen zur Reise — 24/7', color: '#a78bfa' },
  { icon: Users, label: 'Community', desc: 'Live Meldungen von anderen Fahrern auf der gleichen Route', color: '#fb7185' },
  { icon: CheckSquare, label: 'Checkliste', desc: 'Vignetten, Dokumente, Notfallausrüstung — nichts vergessen', color: '#e2e8f0' },
]

const ROUTES = [
  { flags: '🇩🇪→🇦🇹→🇭🇺→🇷🇸→🇧🇬→🇹🇷', name: 'Wien–Budapest Route', km: '~2.150 km', tag: 'Beliebteste' },
  { flags: '🇩🇪→🇦🇹→🇸🇮→🇭🇷→🇷🇸→🇧🇬→🇹🇷', name: 'Kroatien Route', km: '~2.350 km', tag: 'Scenic' },
  { flags: '🇩🇪→🇦🇹→🇭🇺→🇷🇴→🇧🇬→🇹🇷', name: 'Rumänien Route', km: '~2.500 km', tag: 'Alternativ' },
  { flags: '🇩🇪→🇦🇹→🇸🇮→🇷🇸→🇲🇰→🇬🇷→🇹🇷', name: 'Griechenland Route', km: '~2.450 km', tag: 'Via Athen' },
]

const STATS = [
  { icon: Users, value: '12.4K', label: 'Aktive Fahrer' },
  { icon: Navigation, value: '4', label: 'Routen' },
  { icon: Clock, value: '24/7', label: 'Live Updates' },
  { icon: Shield, value: '100%', label: 'Kostenlos' },
]

export default function LandingPage({ onStart }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  return (
    <div className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #060610 0%, #0a0a1a 50%, #060610 100%)' }}>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '-15%', left: '20%', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(80,40,255,0.07) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', top: '30%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(40,100,255,0.05) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,60,100,0.04) 0%, transparent 60%)' }} />
      </div>

      <div className="relative z-10 max-w-sm mx-auto px-5">

        {/* Nav */}
        <div className="flex items-center justify-between pt-8 pb-6">
          <div className="flex items-center gap-2.5">
            <SilaLogo size={32} />
            <span className="font-black text-lg" style={{ color: '#f5f5f5' }}>Sıla Yolu <span style={{ color: 'rgba(255,255,255,0.4)' }}>AI</span></span>
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onStart}
            className="text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
            Login
          </motion.button>
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>12.4K Fahrer aktiv</span>
          </div>

          <h1 className="text-4xl font-black leading-tight mb-4" style={{ color: '#f5f5f5' }}>
            München bis<br />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>İstanbul</span>
          </h1>
          <p className="text-base mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Der smarte Reiseassistent für Sıla Yolu — Route, Vignetten, Grenzwartezeiten und KI-Tipps in einer App.
          </p>

          {/* CTA */}
          <motion.button whileTap={{ scale: 0.96 }} onClick={onStart}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 mb-3"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#f5f5f5',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
            }}>
            <Zap size={18} /> Jetzt kostenlos starten
          </motion.button>
          <button onClick={onStart}
            className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Kein Konto? Als Gast fortfahren →
          </button>
        </motion.div>

        {/* Phone mockup */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          className="relative mx-auto mb-10" style={{ width: 220 }}>
          {/* Phone frame */}
          <div className="rounded-[32px] p-[2px]"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.04))', boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
            <div className="rounded-[30px] overflow-hidden" style={{ background: '#0a0a14', minHeight: 380 }}>
              {/* Status bar */}
              <div className="flex justify-between items-center px-5 pt-3 pb-2">
                <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>9:41</span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => <div key={i} className="rounded-sm" style={{ width: 4, height: 4 + i * 2, background: 'rgba(255,255,255,0.4)' }} />)}
                </div>
              </div>
              {/* Mock route card */}
              <div className="px-3 pb-4">
                <div className="text-sm font-black mb-2 px-1" style={{ color: '#f5f5f5' }}>Route berechnen</div>
                <div className="rounded-2xl p-3 mb-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-[9px] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>STARTORT</div>
                  <div className="text-xs font-semibold" style={{ color: '#f5f5f5' }}>🇩🇪 München</div>
                </div>
                <div className="rounded-2xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-[9px] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>ZIELORT</div>
                  <div className="text-xs font-semibold" style={{ color: '#f5f5f5' }}>🇹🇷 Istanbul</div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {[['2.150 km', 'Distanz'], ['~22h', 'Fahrzeit'], ['186 €', 'Sprit'], ['244 €', 'Gesamt']].map(([v, l]) => (
                    <div key={l} className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.09)' }}>
                      <div className="text-[10px] font-black" style={{ color: '#f5f5f5' }}>{v}</div>
                      <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl py-2 text-center text-[10px] font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: '#f5f5f5' }}>
                  ⚡ Route berechnen
                </div>
              </div>
            </div>
          </div>
          {/* Reflection glow */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 140, height: 20, background: 'rgba(100,80,255,0.15)', filter: 'blur(16px)' }} />
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-4 gap-2 mb-10">
          {STATS.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="rounded-2xl p-3 text-center" style={glass}>
                <div className="font-black text-sm" style={{ color: '#f5f5f5' }}>{s.value}</div>
                <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              </div>
            )
          })}
        </motion.div>

        {/* Features */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black" style={{ color: '#f5f5f5' }}>Alles in einer App</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>Alles was du für Sıla Yolu brauchst</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              const isHovered = hoveredFeature === i
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                  onMouseEnter={() => setHoveredFeature(i)} onMouseLeave={() => setHoveredFeature(null)}
                  className="rounded-2xl p-4"
                  style={{
                    background: isHovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isHovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}`,
                    backdropFilter: 'blur(16px)',
                    boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Icon size={17} style={{ color: f.color }} />
                  </div>
                  <div className="font-bold text-sm mb-1" style={{ color: '#f5f5f5' }}>{f.label}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.desc}</div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Routes */}
        <div className="mb-10">
          <h2 className="text-xl font-black mb-1" style={{ color: '#f5f5f5' }}>4 Routen</h2>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>Inkl. Kosten, Vignetten & Maut</p>
          <div className="flex flex-col gap-2">
            {ROUTES.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                className="rounded-2xl p-3.5 flex items-center justify-between" style={glass}>
                <div>
                  <div className="text-sm mb-0.5" style={{ color: '#f5f5f5' }}>{r.flags}</div>
                  <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.name} · {r.km}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full ml-2 shrink-0"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {r.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-3xl p-5 mb-10" style={glass}>
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="rgba(255,200,60,0.8)" color="transparent" />)}
            <span className="text-xs ml-1 font-bold" style={{ color: 'rgba(255,200,60,0.7)' }}>4.9</span>
          </div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
            "Endlich eine App die wirklich alle Kosten für Sıla Yolu zeigt — Vignetten, Maut, Sprit alles zusammen. Hat mir viel Zeit und Geld gespart!"
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(255,255,255,0.08)' }}>A</div>
            <div>
              <div className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>Ahmet K.</div>
              <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>München → Istanbul</div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="pb-10 text-center">
          <h2 className="text-2xl font-black mb-2" style={{ color: '#f5f5f5' }}>Bereit für die Reise?</h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>Kostenlos · Kein Abo · Sofort starten</p>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onStart}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#f5f5f5',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
            }}>
            <ChevronRight size={18} /> App starten
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
