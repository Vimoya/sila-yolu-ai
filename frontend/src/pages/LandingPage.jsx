import { AnimatedRouteSection } from '../components/RouteAnimation'
import { IconRoute, IconCalc, IconCardSm, IconFuel, IconChat, IconCheck, IconArrow, IconBell, IconStar, IconClock, IconCar } from '../components/Icons'

function Logo({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.33),
      background: 'linear-gradient(135deg, #FFCC5C, #D49628 90%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 18px rgba(245,181,68,0.35)', flexShrink: 0,
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none"
        stroke="#04060A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19c4-1 4-7 8-7s4 6 8 5"/>
        <circle cx="4" cy="19" r="1.5" fill="#04060A"/>
        <circle cx="20" cy="17" r="1.5" fill="#04060A"/>
      </svg>
    </div>
  )
}

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '14px 22px', borderRadius: 999,
  background: 'linear-gradient(180deg, #FFCC5C, #D49628)',
  color: '#1F1402', border: 'none', fontWeight: 700, fontSize: 15,
  fontFamily: 'var(--font-body)', cursor: 'pointer',
  boxShadow: '0 10px 30px rgba(245,181,68,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
}
const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '13px 20px', borderRadius: 999,
  background: 'rgba(255,255,255,0.04)', color: 'var(--fg)',
  border: '1px solid var(--glass-border)',
  fontWeight: 600, fontSize: 15, fontFamily: 'var(--font-body)', cursor: 'pointer',
}
const btnOutline = { ...btnGhost, background: 'transparent' }

function SectionLabel({ kicker, title, sub }) {
  return (
    <div>
      <div style={{ color: 'var(--turkis)', fontWeight: 700, fontSize: 11, letterSpacing: 1.4, marginBottom: 8 }}>{kicker}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: -0.8, lineHeight: 1.1, marginBottom: sub ? 6 : 0 }}>{title}</div>
      {sub && <div style={{ color: 'var(--fg-2)', fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  )
}

function MiniBar({ w, c, label }) {
  return (
    <div style={{ flex: 1, fontSize: 9, color: 'var(--fg-3)' }}>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${w}%`, height: '100%', background: c, borderRadius: 999, boxShadow: `0 0 8px ${c}` }}/>
      </div>
      <div style={{ marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  )
}

function MiniDashboardMockup() {
  return (
    <div style={{ padding: '46px 14px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
        <div>
          <div style={{ color: 'var(--fg-3)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Hoş geldin, Mehmet</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginTop: 2 }}>Sıla Yolu 2026</div>
        </div>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
          <IconBell size={12}/>
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '12px 13px' }}>
        <div style={{ color: 'var(--fg-3)', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Gesamtkosten</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
          <span className="sy-pump" style={{ fontSize: 30, color: 'var(--turkis)', letterSpacing: -1 }}>486</span>
          <span style={{ color: 'var(--fg-2)', fontSize: 12, fontWeight: 600 }}>€</span>
          <span style={{ marginLeft: 'auto', color: 'var(--gruen)', fontSize: 9, fontWeight: 700 }}>-12% vs. 2024</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {[['Sprit','312 €','var(--gruen)'],['Maut','94 €','var(--orange)'],['Vignette','58 €','var(--blau)'],['Pause','22 €','var(--turkis)']].map(([k,v,c]) => (
          <div key={k} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '8px 10px' }}>
            <div style={{ fontSize: 8, color: 'var(--fg-3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.4 }}>{k}</div>
            <div className="sy-pump" style={{ fontSize: 14, color: c, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: '10px 12px' }}>
        <div style={{ color: 'var(--fg-3)', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Route</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 7 }}>
          {[['DE','#fff'],['AT','#FF8A3D'],['HU','#38E58A'],['RS','#4DA8FF'],['BG','#E854A8'],['TR','#F5B544']].map(([c,col],i) => (
            <span key={c}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 14, borderRadius: 3, background: 'var(--bg-3)', border: `1px solid ${col}55`, color: col, fontSize: 7, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{c}</span>
              {i < 5 && <span style={{ display: 'inline-block', width: 5, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 1px' }}/>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function BigPumpCard({ fuel, price, trend, c }) {
  const isUp = trend.startsWith('+')
  return (
    <div style={{
      background: 'rgba(10,12,16,0.7)', border: '1px solid var(--glass-border)',
      borderRadius: 22, padding: '18px 20px',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: `0 0 0 1px ${c}22 inset`,
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: c, textTransform: 'uppercase' }}>{fuel}</div>
        <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>Ø DE · heute</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span className="sy-pump" style={{ fontSize: 42, color: c, letterSpacing: -1.5, lineHeight: 1, textShadow: `0 0 20px ${c}55` }}>{price}</span>
        <span style={{ color: 'var(--fg-2)', fontSize: 16, fontWeight: 700 }}>€</span>
      </div>
      <div style={{
        padding: '5px 9px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
        background: isUp ? 'rgba(255,138,61,0.15)' : 'rgba(56,229,138,0.15)',
        color: isUp ? 'var(--orange)' : 'var(--gruen)',
        border: `1px solid ${isUp ? 'rgba(255,138,61,0.4)' : 'rgba(56,229,138,0.4)'}`,
      }}>{trend} ct</div>
    </div>
  )
}

const FEATURES = [
  { t: 'KI-Routenplanung', d: 'Günstigste, schnellste oder komfortabelste Route nach Istanbul, Ankara, Izmir.', Icon: IconRoute },
  { t: 'Tankkosten-Rechner', d: 'Genaue Spritkosten basierend auf Fahrzeug, Verbrauch und Live-Preisen.', Icon: IconCalc },
  { t: 'Maut & Vignetten', d: 'AT, HU, SRB, BG, TR — automatisch in Gesamtkosten eingerechnet.', Icon: IconCardSm },
  { t: 'Live Tankpreise', d: 'Diesel, E5, E10 von 14.000+ deutschen Tankstellen in Echtzeit.', Icon: IconFuel },
  { t: 'Community Chat', d: 'Grenzwartezeiten & Tipps von Reisenden, die gerade unterwegs sind.', Icon: IconChat },
  { t: 'Türkei-Checkliste', d: 'Grüne Karte, HGS, Fahrzeugvollmacht — vergiss nichts.', Icon: IconCheck },
]

const ROUTES = [
  { name: 'Balkan-Klassiker', sub: 'Beliebteste Route', countries: ['DE','AT','HU','RS','BG','TR'], km: '2.380 km', t: '~28 h', cost: '486 €', featured: true },
  { name: 'Adria-Route', sub: 'Über Kroatien', countries: ['DE','AT','SI','HR','RS','BG','TR'], km: '2.540 km', t: '~30 h', cost: '512 €' },
  { name: 'West-Europa', sub: 'Aus FR / BE / NL', countries: ['FR','DE','AT','HU','RS','BG','TR'], km: '2.890 km', t: '~34 h', cost: '598 €' },
  { name: 'Insel-Route', sub: 'Aus England', countries: ['GB','FR','BE','DE','AT','HU','RS','BG','TR'], km: '3.420 km', t: '~40 h', cost: '742 €' },
]

const STATS = [
  { v: '14.000+', l: 'Tankstellen DE' },
  { v: '5+', l: 'Routen TR' },
  { v: '8', l: 'Länder' },
  { v: '~30k', l: 'Community' },
]

const TIERS = [
  { n: 'Free', p: '0', s: '€ / dauerhaft', f: ['Route ohne Optimierung','Tankstellenpreise DE','Community lesen','1 gespeicherte Reise'], cta: 'Kostenlos starten' },
  { n: 'Pro Reise', p: '4,90', s: '€ / einmalig', f: ['KI-Routenoptimierung','Live Maut & Vignetten','Offline-Karte','Bis zu 5 Reisen speichern','Community posten'], cta: 'Pro Reise buchen', highlight: true },
  { n: 'Familie Jahr', p: '24,90', s: '€ / Jahr · 6 Konten', f: ['Alles in Pro','Familienteilung','Reisehistorie','Prioritäts-Support','Checkliste Plus'], cta: 'Familie wählen' },
]

export default function LandingPage({ onStart }) {
  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', color: 'var(--fg)', fontFamily: 'var(--font-body)', position: 'relative' }}>
      {/* Aurora */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(40% 30% at 20% 10%, rgba(245,181,68,0.18), transparent 70%),
          radial-gradient(35% 28% at 80% 20%, rgba(77,168,255,0.14), transparent 70%),
          radial-gradient(30% 20% at 50% 0%, rgba(255,138,61,0.08), transparent 70%)
        `,
        filter: 'blur(20px)',
      }}/>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 430, margin: '0 auto', padding: '0 20px' }}>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={32}/>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>
              Sıla Yolu <span style={{ color: 'var(--turkis)' }}>Pro</span>
            </span>
          </div>
          <button onClick={onStart} style={{ ...btnGhost, padding: '9px 16px', fontSize: 13 }}>Anmelden</button>
        </div>

        {/* Hero */}
        <div style={{ paddingTop: 8, paddingBottom: 28, animation: 'sy-fade-up 0.6s ease both' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px 6px 8px', borderRadius: 999,
            background: 'rgba(245,181,68,0.10)', color: 'var(--turkis)',
            border: '1px solid rgba(245,181,68,0.25)',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.4, marginBottom: 18,
          }}>
            <span style={{ background: 'var(--turkis)', color: '#1F1402', padding: '2px 7px', borderRadius: 999, fontSize: 9, letterSpacing: 0.6 }}>YENİ</span>
            Live Spritpreise · 14.000+ Tankstellen
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, lineHeight: 1.06, letterSpacing: -1.5, margin: '0 0 14px' }}>
            Plane deine{' '}
            <span style={{ backgroundImage: 'linear-gradient(120deg, #FFE08A 0%, #F5B544 45%, #C58418 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Sıla Yolu</span>
            {' '}smarter.
          </h1>

          <p style={{ color: 'var(--fg-2)', fontSize: 15, lineHeight: 1.55, margin: '0 0 24px' }}>
            Route, Tankkosten, Maut, Vignetten, Community und Türkei-Checkliste — alles in einer App.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={onStart} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>
              Route berechnen <IconArrow size={16}/>
            </button>
            <button onClick={onStart} style={{ ...btnGhost, width: '100%', justifyContent: 'center' }}>
              Kostenlos registrieren
            </button>
          </div>

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
            <div style={{ display: 'flex' }}>
              {['#F5B544','#D49628','#8C5F12','#3F2A06'].map((c, i) => (
                <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${c}, #0A0C10)`, marginLeft: i ? -7 : 0, border: '2px solid #04060A' }}/>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 1, color: '#FFB400', fontSize: 13 }}>
                {[0,1,2,3,4].map(i => <IconStar key={i} size={13}/>)}
              </div>
              <div style={{ color: 'var(--fg-3)', fontSize: 12, marginTop: 1 }}>
                <strong style={{ color: 'var(--fg)' }}>4.9</strong> · 2.840 Bewertungen
              </div>
            </div>
          </div>
        </div>

        {/* Phone mockup */}
        <div style={{ position: 'relative', margin: '0 auto 32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,181,68,0.28), transparent 60%)', filter: 'blur(30px)' }}/>
          <div style={{
            width: 220, borderRadius: 36,
            background: '#04060A', position: 'relative', overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 5px #0A0C10, 0 0 0 6px rgba(255,255,255,0.08)',
          }}>
            <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 80, height: 20, borderRadius: 12, background: '#000', zIndex: 5 }}/>
            <MiniDashboardMockup/>
          </div>
          {/* Floating price card */}
          <div style={{
            position: 'absolute', top: 36, right: -18, transform: 'rotate(5deg)',
            background: 'rgba(10,12,16,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '10px 12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: 105,
          }}>
            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.5, color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 7 }}>
              Live · Shell
            </div>
            {[['Diesel','1,67','var(--diesel)'],['E10','1,74','var(--e10)'],['E5','1,80','var(--e5)']].map(([k,v,c]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                <span style={{ fontSize: 8, color: 'var(--fg-3)', fontWeight: 700 }}>{k}</span>
                <span className="sy-pump" style={{ fontSize: 13, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 40,
          background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)',
          borderRadius: 22, padding: 16,
        }}>
          {STATS.map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div className="sy-pump" style={{ fontSize: 18, color: 'var(--turkis)', letterSpacing: -0.5 }}>{s.v}</div>
              <div style={{ color: 'var(--fg-3)', fontSize: 10, marginTop: 2, fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ marginBottom: 40 }}>
          <SectionLabel kicker="ALLES IN EINER APP" title="Sechs Werkzeuge, ein Ziel." sub="Stressfrei in die Heimat."/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            {FEATURES.map(({ t, d, Icon }) => (
              <div key={t} style={{
                position: 'relative', overflow: 'hidden',
                background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)', borderRadius: 20, padding: 16,
              }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,181,68,0.15), transparent 70%)', pointerEvents: 'none' }}/>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,181,68,0.12)', color: 'var(--turkis)', border: '1px solid rgba(245,181,68,0.3)', marginBottom: 10 }}>
                  <Icon size={20}/>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: -0.3, marginBottom: 4 }}>{t}</div>
                <div style={{ color: 'var(--fg-3)', fontSize: 11, lineHeight: 1.45 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Route animation section */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 8px', borderRadius: 999, background: 'rgba(56,229,138,0.10)', border: '1px solid rgba(56,229,138,0.25)', color: 'var(--gruen)', fontSize: 11, fontWeight: 700, marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gruen)', boxShadow: '0 0 8px var(--gruen)' }}/>
            Live Route-Animation
          </div>
          <AnimatedRouteSection/>
        </div>

        {/* Routes */}
        <div style={{ marginBottom: 40 }}>
          <SectionLabel kicker="FÜR ALLE WEGE IN DIE TÜRKEI" title="Fünf Reise­szenarien." sub="Egal ob aus Hamburg, Lyon, Amsterdam oder Birmingham."/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {ROUTES.map((r, i) => (
              <div key={r.name} style={{
                background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: r.featured ? '1px solid rgba(245,181,68,0.35)' : '1px solid var(--glass-border)',
                borderRadius: 22, padding: '16px 18px',
                boxShadow: r.featured ? '0 8px 30px rgba(245,181,68,0.12)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ color: r.featured ? 'var(--turkis)' : 'var(--fg-3)', fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>{r.sub}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: -0.3, marginTop: 2 }}>{r.name}</div>
                  </div>
                  <div style={{
                    background: r.featured ? 'rgba(245,181,68,0.15)' : 'rgba(255,255,255,0.06)',
                    color: r.featured ? 'var(--turkis)' : 'var(--fg-2)',
                    padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    border: `1px solid ${r.featured ? 'rgba(245,181,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    fontFamily: 'var(--font-mono)',
                  }}>ab {r.cost}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  {r.countries.map((c, ci) => (
                    <span key={c + ci}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 30, height: 21, borderRadius: 5, background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${ci === 0 || ci === r.countries.length - 1 ? (r.featured ? 'rgba(245,181,68,0.5)' : 'rgba(255,255,255,0.25)') : 'rgba(255,255,255,0.1)'}`,
                        color: ci === 0 || ci === r.countries.length - 1 ? (r.featured ? 'var(--turkis)' : 'var(--fg-2)') : 'var(--fg-3)',
                        fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 9,
                      }}>{c}</span>
                      {ci < r.countries.length - 1 && <span style={{ display: 'inline-block', width: 9, height: 1, background: 'rgba(255,255,255,0.14)', margin: '0 1px' }}/>}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'var(--fg-3)', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconRoute size={12}/> {r.km}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconClock size={12}/> {r.t}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCar size={12}/> Auto · Diesel</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fuel prices */}
        <div style={{ marginBottom: 40 }}>
          <SectionLabel kicker="LIVE SPRITPREISE" title="Große Zahlen. Echtzeit-Daten."/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <BigPumpCard fuel="Diesel" price="1,67" trend="-3" c="var(--diesel)"/>
            <BigPumpCard fuel="E10" price="1,74" trend="+1" c="var(--e10)"/>
            <BigPumpCard fuel="E5" price="1,80" trend="-2" c="var(--e5)"/>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: 40 }}>
          <SectionLabel kicker="EHRLICHE PREISE" title="Bezahle nur was du brauchst." sub="Free für gelegentliche Fahrer, einmalig für die nächste Reise."/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
            {TIERS.map(t => (
              <div key={t.n} style={{
                position: 'relative',
                background: t.highlight ? 'linear-gradient(180deg, rgba(245,181,68,0.10), rgba(10,12,16,0.6))' : 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: t.highlight ? '1px solid rgba(245,181,68,0.4)' : '1px solid var(--glass-border)',
                borderRadius: 22, padding: 22,
                boxShadow: t.highlight ? '0 20px 60px rgba(245,181,68,0.15)' : 'none',
              }}>
                {t.highlight && <div style={{ position: 'absolute', top: -12, left: 20, padding: '4px 12px', borderRadius: 999, background: 'var(--turkis)', color: '#1F1402', fontSize: 10, fontWeight: 800, letterSpacing: 0.4 }}>EMPFOHLEN</div>}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: t.highlight ? 'var(--turkis)' : 'var(--fg)' }}>{t.n}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 10 }}>
                  <span className="sy-pump" style={{ fontSize: 44, letterSpacing: -2, color: 'var(--fg)' }}>{t.p}</span>
                  <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>{t.s}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
                  {t.f.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--fg-2)', fontSize: 13 }}>
                      <span style={{ width: 20, height: 20, borderRadius: 6, background: t.highlight ? 'rgba(245,181,68,0.15)' : 'rgba(255,255,255,0.05)', color: t.highlight ? 'var(--turkis)' : 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconCheck size={12}/>
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={onStart} style={{ ...(t.highlight ? btnPrimary : btnOutline), width: '100%', marginTop: 20, justifyContent: 'center' }}>{t.cta}</button>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)', borderRadius: 22, padding: 20, marginBottom: 40, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', gap: 2, color: '#FFB400', marginBottom: 10, fontSize: 14 }}>
            {[0,1,2,3,4].map(i => <IconStar key={i} size={14}/>)}
          </div>
          <p style={{ color: 'var(--fg-2)', fontSize: 14, lineHeight: 1.55, margin: '0 0 14px' }}>
            "Endlich eine App die wirklich alle Kosten zeigt — Vignetten, Maut, Sprit alles zusammen. Hat mir viel gespart!"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--turkis), #D49628)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#1F1402', fontFamily: 'var(--font-display)' }}>A</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Ahmet K.</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>München → Istanbul</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          borderRadius: 26, padding: '30px 22px', marginBottom: 44,
          background: 'linear-gradient(120deg, rgba(245,181,68,0.18), rgba(245,181,68,0.04) 60%, rgba(255,255,255,0.04))',
          border: '1px solid rgba(255,255,255,0.10)',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 80% at 50% 0%, rgba(245,181,68,0.18), transparent 70%)', pointerEvents: 'none' }}/>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, letterSpacing: -0.8, marginBottom: 8 }}>
              Bereit für deine nächste Sıla Yolu?
            </div>
            <div style={{ color: 'var(--fg-2)', fontSize: 14, marginBottom: 20 }}>
              Erstelle deine erste Route in zwei Minuten. Kostenlos, ohne Kreditkarte.
            </div>
            <button onClick={onStart} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>
              Route berechnen <IconArrow size={16}/>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--line)', padding: '20px 0 32px', color: 'var(--fg-3)', fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Logo size={22}/>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg)' }}>Sıla Yolu Pro</span>
            <span>· © 2026 Made for the road home</span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['Impressum','Datenschutz','AGB','Kontakt'].map(x => <span key={x}>{x}</span>)}
          </div>
        </div>

      </div>
    </div>
  )
}
