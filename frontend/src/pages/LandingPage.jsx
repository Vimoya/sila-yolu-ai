import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const gold = '#F5B544'
const goldGrad = 'linear-gradient(180deg, #FFCC5C, #D49628)'
const glassBg = 'rgba(255,255,255,0.025)'
const glassBorder = '1px solid rgba(255,255,255,0.08)'

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '14px 22px', borderRadius: 999,
  background: goldGrad, color: '#1F1402',
  border: 'none', fontWeight: 700, fontSize: 15,
  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
  boxShadow: '0 10px 30px rgba(245,181,68,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
}

const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '13px 20px', borderRadius: 999,
  background: 'rgba(255,255,255,0.04)', color: '#f5f5f5',
  border: '1px solid rgba(255,255,255,0.1)',
  fontWeight: 600, fontSize: 15,
  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
}

function Logo({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.33),
      background: goldGrad,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 18px rgba(245,181,68,0.35)',
      flexShrink: 0,
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none"
        stroke="#04060A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19c4-1 4-7 8-7s4 6 8 5" />
        <circle cx="4" cy="19" r="1.5" fill="#04060A" />
        <circle cx="20" cy="17" r="1.5" fill="#04060A" />
      </svg>
    </div>
  )
}

const features = [
  { t: 'KI-Routenplanung', d: 'Günstigste, schnellste oder komfortabelste Route nach Istanbul, Ankara, Izmir.', emoji: '🗺️' },
  { t: 'Tankkosten-Rechner', d: 'Genaue Spritkosten basierend auf Fahrzeug, Verbrauch und Live-Preisen.', emoji: '⛽' },
  { t: 'Maut & Vignetten', d: 'AT, HU, SRB, BG, TR — automatisch in Gesamtkosten eingerechnet.', emoji: '🪙' },
  { t: 'Live Tankpreise', d: 'Diesel, E5, E10 von 14.000+ deutschen Tankstellen in Echtzeit.', emoji: '📡' },
  { t: 'Community Chat', d: 'Grenzwartezeiten & Tipps von Reisenden, die gerade unterwegs sind.', emoji: '💬' },
  { t: 'Türkei-Checkliste', d: 'Grüne Karte, HGS, Fahrzeugvollmacht — vergiss nichts.', emoji: '✅' },
]

const routes = [
  { name: 'Balkan-Klassiker', sub: 'Beliebteste Route', countries: ['DE','AT','HU','RS','BG','TR'], km: '2.380 km', t: '~28 h', cost: '486 €' },
  { name: 'Adria-Route', sub: 'Über Kroatien', countries: ['DE','AT','SI','HR','RS','BG','TR'], km: '2.540 km', t: '~30 h', cost: '512 €' },
  { name: 'West-Europa', sub: 'Aus FR / BE / NL', countries: ['FR','DE','AT','HU','RS','BG','TR'], km: '2.890 km', t: '~34 h', cost: '598 €' },
  { name: 'Insel-Route', sub: 'Aus England', countries: ['GB','FR','BE','DE','AT','HU','RS','BG','TR'], km: '3.420 km', t: '~40 h', cost: '742 €' },
]

const stats = [
  { v: '14.000+', l: 'Tankstellen DE' },
  { v: '5+', l: 'Routen TR' },
  { v: '8', l: 'Länder' },
  { v: '~30k', l: 'Community' },
]

export default function LandingPage({ onStart }) {
  return (
    <div style={{
      minHeight: '100vh', overflowX: 'hidden',
      background: '#04060A', color: '#f5f5f5',
      fontFamily: "'DM Sans', sans-serif", position: 'relative',
    }}>
      {/* Aurora */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(40% 30% at 20% 10%, rgba(245,181,68,0.18), transparent 70%),
          radial-gradient(35% 28% at 80% 20%, rgba(77,168,255,0.14), transparent 70%),
          radial-gradient(30% 20% at 50% 0%, rgba(255,138,61,0.08), transparent 70%)
        `,
        filter: 'blur(20px)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, margin: '0 auto', padding: '0 20px' }}>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={34} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>
              Sıla Yolu <span style={{ color: gold }}>Pro</span>
            </span>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onStart}
            style={{ ...btnGhost, padding: '9px 16px', fontSize: 13 }}>
            Anmelden
          </motion.button>
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ paddingTop: 16, paddingBottom: 32 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px 6px 8px', borderRadius: 999,
            background: 'rgba(245,181,68,0.10)', color: gold,
            border: '1px solid rgba(245,181,68,0.25)',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.4, marginBottom: 18,
          }}>
            <span style={{ background: gold, color: '#1F1402', padding: '2px 7px', borderRadius: 999, fontSize: 9, letterSpacing: 0.6 }}>YENİ</span>
            Live Spritpreise · 14.000+ Tankstellen
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 42, lineHeight: 1.05, letterSpacing: -1.5, margin: '0 0 14px',
          }}>
            Plane deine{' '}
            <span style={{
              backgroundImage: 'linear-gradient(120deg, #FFE08A 0%, #F5B544 45%, #C58418 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>Sıla Yolu</span>
            {' '}smarter.
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.55, margin: '0 0 26px' }}>
            Route, Tankkosten, Maut, Vignetten, Community und Türkei-Checkliste — alles in einer App.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
              style={{ ...btnPrimary, width: '100%', justifyContent: 'center', fontSize: 15 }}>
              Route berechnen <ChevronRight size={16} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
              style={{ ...btnGhost, width: '100%', justifyContent: 'center' }}>
              Kostenlos registrieren
            </motion.button>
          </div>

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
            <div style={{ display: 'flex' }}>
              {['#F5B544','#D49628','#8C5F12','#3F2A06'].map((c, i) => (
                <div key={i} style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${c}, #0A0C10)`,
                  marginLeft: i ? -7 : 0, border: '2px solid #04060A',
                }} />
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 1, color: '#FFB400', fontSize: 12 }}>{'★★★★★'}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 1 }}>
                <strong style={{ color: '#f5f5f5' }}>4.9</strong> · 2.840 Bewertungen
              </div>
            </div>
          </div>
        </motion.div>

        {/* Phone mockup */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          style={{ position: 'relative', margin: '0 auto 32px', width: 240, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            position: 'absolute', width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,181,68,0.28), transparent 60%)',
            filter: 'blur(30px)',
          }} />
          <div style={{
            width: 220, borderRadius: 36,
            background: '#04060A', position: 'relative', overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 5px #0A0C10, 0 0 0 6px rgba(255,255,255,0.08)',
          }}>
            {/* Dynamic island */}
            <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 80, height: 20, borderRadius: 12, background: '#000', zIndex: 5 }} />
            {/* Mini dashboard */}
            <div style={{ padding: '36px 14px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Hoş geldin, Mehmet</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, marginTop: 1 }}>Sıla Yolu 2026</div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '10px 12px' }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Gesamtkosten</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 1 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 28, color: gold, letterSpacing: -1 }}>486</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }}>€</span>
                  <span style={{ marginLeft: 'auto', color: '#38E58A', fontSize: 8, fontWeight: 700 }}>-12% vs. 2024</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[['Sprit','312 €','#38E58A'],['Maut','94 €','#FF8A3D'],['Vignette','58 €','#4DA8FF'],['Pause','22 €', gold]].map(([k, v, c]) => (
                  <div key={k} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 9px' }}>
                    <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>{k}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, color: c, marginTop: 1 }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* Country strip */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '9px 10px' }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 700, textTransform: 'uppercase' }}>Route</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  {[['DE','#f5f5f5'],['AT','#FF8A3D'],['HU','#38E58A'],['RS','#4DA8FF'],['BG','#E854A8'],['TR', gold]].map(([c, col], i) => (
                    <span key={c}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 18, height: 13, borderRadius: 3, background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${col}55`, color: col, fontSize: 6, fontWeight: 800,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>{c}</span>
                      {i < 5 && <span style={{ display: 'inline-block', width: 6, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 1px' }} />}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Floating price card */}
          <div style={{
            position: 'absolute', top: 40, right: -20, transform: 'rotate(5deg)',
            background: 'rgba(10,12,16,0.85)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '10px 12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: 110,
          }}>
            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.5, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 6 }}>
              Live · Shell
            </div>
            {[['Diesel','1,67','#38E58A'],['E10','1,74','#FFB400'],['E5','1,80','#4DA8FF']].map(([k, v, c]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{k}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 36,
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 16,
          }}>
          {stats.map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 18, color: gold, letterSpacing: -0.5 }}>{s.v}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2, fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </motion.div>

        {/* Features */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ color: gold, fontWeight: 700, fontSize: 11, letterSpacing: 1.4, marginBottom: 8 }}>ALLES IN EINER APP</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 6 }}>
            Sechs Werkzeuge,<br />ein Ziel.
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 20 }}>Stressfrei in die Heimat.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {features.map((f, i) => (
              <motion.div key={f.t}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
                style={{
                  position: 'relative', overflow: 'hidden',
                  background: glassBg, backdropFilter: 'blur(20px)',
                  border: glassBorder, borderRadius: 20, padding: 16,
                }}>
                <div style={{
                  position: 'absolute', top: -40, right: -40, width: 100, height: 100, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(245,181,68,0.15), transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <div style={{ fontSize: 24, marginBottom: 10 }}>{f.emoji}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: -0.3, marginBottom: 4 }}>{f.t}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 1.45 }}>{f.d}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Routes */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ color: gold, fontWeight: 700, fontSize: 11, letterSpacing: 1.4, marginBottom: 8 }}>FÜR ALLE WEGE IN DIE TÜRKEI</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 20 }}>
            Fünf Reise­szenarien.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {routes.map((r, i) => (
              <motion.div key={r.name}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}
                style={{
                  background: glassBg, backdropFilter: 'blur(20px)',
                  border: i === 0 ? `1px solid rgba(245,181,68,0.35)` : glassBorder,
                  borderRadius: 20, padding: '14px 16px',
                  boxShadow: i === 0 ? '0 8px 30px rgba(245,181,68,0.12)' : 'none',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ color: i === 0 ? gold : 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>{r.sub}</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: -0.3, marginTop: 2 }}>{r.name}</div>
                  </div>
                  <div style={{
                    background: i === 0 ? 'rgba(245,181,68,0.15)' : 'rgba(255,255,255,0.06)',
                    color: i === 0 ? gold : 'rgba(255,255,255,0.5)',
                    padding: '6px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    border: `1px solid ${i === 0 ? 'rgba(245,181,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>ab {r.cost}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  {r.countries.map((c, ci) => (
                    <span key={c + ci}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 30, height: 21, borderRadius: 5, background: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${ci === 0 || ci === r.countries.length - 1 ? (i === 0 ? 'rgba(245,181,68,0.5)' : 'rgba(255,255,255,0.25)') : 'rgba(255,255,255,0.1)'}`,
                        color: ci === 0 || ci === r.countries.length - 1 ? (i === 0 ? gold : 'rgba(255,255,255,0.7)') : 'rgba(255,255,255,0.4)',
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 9,
                      }}>{c}</span>
                      {ci < r.countries.length - 1 && <span style={{ display: 'inline-block', width: 10, height: 1, background: 'rgba(255,255,255,0.15)', margin: '0 1px' }} />}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                  <span>📍 {r.km}</span>
                  <span>⏱ {r.t}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mockup trio — fuel prices */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ color: gold, fontWeight: 700, fontSize: 11, letterSpacing: 1.4, marginBottom: 8 }}>LIVE SPRITPREISE</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 20 }}>
            Große Zahlen.<br />Echtzeit-Daten.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Diesel','1,67','-3','#38E58A'],['E10','1,74','+1','#FFB400'],['E5','1,80','-2','#4DA8FF']].map(([fuel, price, trend, c]) => {
              const isUp = trend.startsWith('+')
              return (
                <div key={fuel} style={{
                  background: 'rgba(10,12,16,0.7)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: '16px 18px', backdropFilter: 'blur(20px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: `inset 0 0 0 1px ${c}22`,
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: c, textTransform: 'uppercase' }}>{fuel}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>Ø DE · heute</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 40, color: c, letterSpacing: -1, lineHeight: 1, textShadow: `0 0 20px ${c}55` }}>{price}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 700 }}>€</span>
                  </div>
                  <div style={{
                    padding: '5px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: isUp ? 'rgba(255,138,61,0.15)' : 'rgba(56,229,138,0.15)',
                    color: isUp ? '#FF8A3D' : '#38E58A',
                    border: `1px solid ${isUp ? 'rgba(255,138,61,0.4)' : 'rgba(56,229,138,0.4)'}`,
                  }}>{trend} ct</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ background: glassBg, border: glassBorder, borderRadius: 24, padding: 20, marginBottom: 36, backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', gap: 2, color: '#FFB400', marginBottom: 10, fontSize: 14 }}>{'★★★★★'}</div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.55, margin: '0 0 14px' }}>
            "Endlich eine App die wirklich alle Kosten zeigt — Vignetten, Maut, Sprit alles zusammen. Hat mir viel gespart!"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${gold}, #D49628)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#1F1402' }}>A</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Ahmet K.</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>München → Istanbul</div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: 28, padding: '32px 24px', marginBottom: 40,
            background: 'linear-gradient(120deg, rgba(245,181,68,0.18), rgba(245,181,68,0.04) 60%, rgba(255,255,255,0.04))',
            border: '1px solid rgba(255,255,255,0.10)',
          }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 80% at 50% 0%, rgba(245,181,68,0.18), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: -0.8, marginBottom: 8 }}>
              Bereit für deine nächste Sıla Yolu?
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
              Erstelle deine erste Route in zwei Minuten. Kostenlos, ohne Kreditkarte.
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
              style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>
              Route berechnen <ChevronRight size={16} />
            </motion.button>
          </div>
        </motion.div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 0 32px', color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Logo size={22} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#f5f5f5' }}>Sıla Yolu Pro</span>
            <span>· © 2026 Made for the road home</span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['Impressum', 'Datenschutz', 'AGB', 'Kontakt'].map(x => <span key={x}>{x}</span>)}
          </div>
        </div>

      </div>
    </div>
  )
}
