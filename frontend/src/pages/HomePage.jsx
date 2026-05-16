import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { IconBell, IconArrow, IconRoute, IconFuel, IconChat, IconCardSm } from '../components/Icons'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(28px) saturate(140%)',
  WebkitBackdropFilter: 'blur(28px) saturate(140%)',
  borderRadius: 22,
}

function Tag({ children, color = 'var(--turkis)', style: s }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '5px 9px', borderRadius: 999,
      background: `${color}22`, color,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
      textTransform: 'uppercase', border: `1px solid ${color}33`,
      ...s,
    }}>{children}</span>
  )
}

function PumpMini({ fuel, price, c, loading }) {
  return (
    <div style={{
      background: 'rgba(10,12,16,0.6)', border: `1px solid ${c}33`,
      borderRadius: 16, padding: '10px 12px', textAlign: 'center',
      boxShadow: `inset 0 0 0 1px ${c}10`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, color: c }}>{fuel}</div>
      <div className="sy-pump" style={{ fontSize: 24, color: loading ? 'rgba(255,255,255,0.2)' : c, letterSpacing: -0.6, marginTop: 4, textShadow: loading ? 'none' : `0 0 12px ${c}55` }}>
        {loading ? '···' : (price ?? '—')}<span style={{ fontSize: 12, opacity: 0.6 }}>{!loading && price ? ' €' : ''}</span>
      </div>
    </div>
  )
}

function CountryStrip({ routeKey }) {
  const routes = {
    austria_hungary: [
      { c: 'DE', km: 380 }, { c: 'AT', km: 320 }, { c: 'HU', km: 530 },
      { c: 'RS', km: 510 }, { c: 'BG', km: 320 }, { c: 'TR', km: 320 },
    ],
    adriatic: [
      { c: 'DE', km: 420 }, { c: 'AT', km: 280 }, { c: 'HR', km: 600 },
      { c: 'ME', km: 180 }, { c: 'AL', km: 280 }, { c: 'TR', km: 560 },
    ],
    south_axis: [
      { c: 'DE', km: 380 }, { c: 'AT', km: 320 }, { c: 'SI', km: 120 },
      { c: 'HR', km: 480 }, { c: 'RS', km: 380 }, { c: 'TR', km: 420 },
    ],
  }
  const segs = routes[routeKey] || routes.austria_hungary
  const total = segs.reduce((a, s) => a + s.km, 0)
  const N = 'rgba(255,255,255,0.55)'
  return (
    <div>
      <div style={{ display: 'flex', height: 36, borderRadius: 10, overflow: 'hidden', gap: 2 }}>
        {segs.map((s, i) => {
          const col = i < 2 ? 'var(--turkis)' : N
          return (
            <div key={s.c} style={{
              flex: s.km, background: `${col}22`, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: col, fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 10,
              border: `1px solid ${col}44`,
            }}>
              <span style={{ position: 'relative' }}>{s.c}</span>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: 'var(--fg-3)', fontSize: 11, fontWeight: 600 }}>
        <span>{segs.map(s => s.c).join(' → ')}</span>
        <span className="sy-pump">{total.toLocaleString('de')} km</span>
      </div>
    </div>
  )
}

// Notifications modal
function NotifModal({ onClose }) {
  const notifs = [
    { icon: '⛽', title: 'Diesel günstiger', body: 'Preise in München um 2 Cent gesunken.', time: 'vor 5 Min', color: 'var(--gruen)' },
    { icon: '🛂', title: 'Grenze HU→RS', body: 'Aktuelle Wartezeit: ~25 Min laut Community.', time: 'vor 1 Std', color: 'var(--orange)' },
    { icon: '🗺️', title: 'Route aktualisiert', body: 'Neue Mautgebühren in Bulgarien ab Juli 2026.', time: 'vor 2 Std', color: 'var(--e5)' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        margin: '60px 16px 0', width: 300, maxWidth: 'calc(100vw - 32px)',
        background: '#0F1318', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Benachrichtigungen</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--fg-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        {notifs.map((n, i) => (
          <div key={i} style={{ padding: '12px 16px', borderBottom: i < notifs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: `${n.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{n.title}</div>
              <div style={{ color: 'var(--fg-3)', fontSize: 12, marginBottom: 4 }}>{n.body}</div>
              <div style={{ color: 'var(--fg-3)', fontSize: 10, fontWeight: 600 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ROUTE_LABELS = {
  austria_hungary: 'Balkan-Klassiker',
  adriatic: 'Adria Route',
  south_axis: 'Süd-Achse',
}

// Cost estimates per route (diesel, ~8L/100km)
const ROUTE_COSTS = {
  austria_hungary: { km: 2380, fuel: 312, toll: 94, vignette: 58, other: 22 },
  adriatic:        { km: 2320, fuel: 298, toll: 88, vignette: 52, other: 22 },
  south_axis:      { km: 2100, fuel: 275, toll: 80, vignette: 48, other: 22 },
}

export default function HomePage() {
  const { user, setActiveTab, routeSettings, lastPosition } = useStore()
  const username = user?.displayName || 'Reisende'
  const routeKey = routeSettings?.selectedRouteKey || 'austria_hungary'
  const costs = ROUTE_COSTS[routeKey] || ROUTE_COSTS.austria_hungary
  const total = costs.fuel + costs.toll + costs.vignette + costs.other

  const [prices, setPrices] = useState({ diesel: null, e10: null, e5: null })
  const [pricesLoading, setPricesLoading] = useState(true)
  const [cheapStation, setCheapStation] = useState(null)
  const [showNotif, setShowNotif] = useState(false)
  const [locationCity, setLocationCity] = useState(lastPosition?.city || 'München')

  useEffect(() => {
    fetch(`${API_BASE}/api/fuel/summary`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.summary) return
        const de = d.summary.find(s => s.code === 'de')
        if (de) {
          setPrices({
            diesel: Number(de.diesel).toFixed(3),
            e10: null,
            e5: Number(de.benzin || de.diesel + 0.1).toFixed(3),
          })
        }
      })
      .catch(() => {})
      .finally(() => setPricesLoading(false))
  }, [])

  // Get GPS position + cheapest nearby station
  useEffect(() => {
    const loadStation = async (lat, lng) => {
      try {
        const res = await fetch(`${API_BASE}/api/fuel/nearby?lat=${lat}&lng=${lng}&country=de`)
        const data = await res.json()
        if (data.stations?.length) {
          const s = data.stations.find(x => x.diesel) || data.stations[0]
          setCheapStation({ name: s.name, addr: s.address, diesel: s.diesel, dist: s.dist, lat: s.lat, lng: s.lng })
        }
      } catch {}
    }

    // Sofort letzten Standort nutzen
    if (lastPosition) {
      setLocationCity(lastPosition.city || 'München')
      loadStation(lastPosition.lat, lastPosition.lng)
    }

    // Dann GPS aktualisieren
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      try {
        const geo = await fetch(`${API_BASE}/api/fuel/geocode?lat=${lat}&lon=${lng}`)
        const gd = await geo.json()
        const city = gd.address?.city || gd.address?.town || gd.address?.village
        if (city) setLocationCity(city)
        loadStation(lat, lng)
      } catch {}
    }, () => {}, { timeout: 8000, enableHighAccuracy: false })
  }, [])

  const openNavToStation = () => {
    if (!cheapStation) return
    if (cheapStation.lat && cheapStation.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${cheapStation.lat},${cheapStation.lng}`, '_blank')
    }
  }

  return (
    <div style={{ minHeight: '100%', padding: '0 16px', paddingBottom: 110, position: 'relative' }}>

      {/* Aurora */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(40% 25% at 15% 8%, rgba(245,181,68,0.16), transparent 60%),
          radial-gradient(35% 20% at 85% 15%, rgba(77,168,255,0.14), transparent 60%)
        `,
      }}/>

      {/* Header */}
      <div style={{ position: 'relative', paddingTop: 52, paddingBottom: 6, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'var(--fg-3)', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
            Hoş geldin, {username} · 🇩🇪 → 🇹🇷
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: -0.8, color: 'var(--fg)', lineHeight: 1.1 }}>
            Sıla Yolu <span style={{ color: 'var(--turkis)' }}>2026</span>
          </div>
        </div>
        <button
          onClick={() => setShowNotif(v => !v)}
          style={{ position: 'relative', width: 40, height: 40, borderRadius: 14, background: showNotif ? 'rgba(245,181,68,0.1)' : 'rgba(255,255,255,0.05)', border: showNotif ? '1px solid rgba(245,181,68,0.35)' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 8 }}
        >
          <IconBell size={18} style={{ color: showNotif ? 'var(--turkis)' : 'var(--fg-2)' }}/>
          <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)', boxShadow: '0 0 8px var(--orange)' }}/>
        </button>
      </div>

      {showNotif && <NotifModal onClose={() => setShowNotif(false)}/>}

      {/* Hero cost card — klickbar → Route-Tab */}
      <button
        onClick={() => setActiveTab('route')}
        style={{ position: 'relative', marginTop: 18, marginBottom: 14, borderRadius: 24, background: 'rgba(245,181,68,0.06)', border: '1px solid rgba(245,181,68,0.22)', backdropFilter: 'blur(28px) saturate(140%)', padding: '20px 18px', overflow: 'hidden', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 60% at 80% 0%, rgba(245,181,68,0.12), transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <div style={{ color: 'var(--fg-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Geschätzte Gesamtkosten</div>
            <Tag color="var(--gruen)" style={{ fontSize: 10 }}>↓ 12 % vs. 2024</Tag>
          </div>
          <div style={{ color: 'var(--fg-3)', fontSize: 12, marginBottom: 10 }}>
            {routeSettings?.start || 'München'} → {routeSettings?.dest || 'Istanbul'} · {ROUTE_LABELS[routeKey]}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
            <span className="sy-pump" style={{ fontSize: 64, color: 'var(--turkis)', letterSpacing: -3, lineHeight: 1, textShadow: '0 0 40px rgba(245,181,68,0.4)' }}>{total}</span>
            <span style={{ fontSize: 24, color: 'var(--turkis)', opacity: 0.7, fontWeight: 700 }}>€</span>
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 6, overflow: 'hidden', gap: 2, marginBottom: 10 }}>
            <div style={{ flex: costs.fuel,     background: 'var(--turkis)',              borderRadius: 6 }}/>
            <div style={{ flex: costs.toll,     background: 'rgba(255,255,255,0.55)',     borderRadius: 3 }}/>
            <div style={{ flex: costs.vignette, background: 'rgba(255,255,255,0.30)',     borderRadius: 3 }}/>
            <div style={{ flex: costs.other,    background: 'rgba(255,255,255,0.15)',     borderRadius: 3 }}/>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--fg-3)', fontWeight: 600, flexWrap: 'wrap' }}>
            <span><span style={{ color: 'var(--turkis)' }}>●</span> Sprit · {costs.fuel}€</span>
            <span><span style={{ color: 'rgba(255,255,255,0.55)' }}>●</span> Maut · {costs.toll}€</span>
            <span><span style={{ color: 'rgba(255,255,255,0.30)' }}>●</span> Vignette · {costs.vignette}€</span>
            <span><span style={{ color: 'rgba(255,255,255,0.15)' }}>●</span> Sonst. · {costs.other}€</span>
          </div>
        </div>
      </button>

      {/* 2x2 stat grid — klickbar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Distanz', value: costs.km.toLocaleString('de'), unit: 'km', color: 'var(--turkis)', tab: 'route' },
          { label: 'Fahrzeit', value: '~' + Math.round(costs.km / 85), unit: 'h', color: 'var(--fg-2)', tab: null },
          { label: 'Tankkosten', value: String(costs.fuel), unit: '€', color: 'var(--gruen)', tab: 'fuel' },
          { label: 'Maut+Vignette', value: String(costs.toll + costs.vignette), unit: '€', color: 'var(--fg-2)', tab: 'route' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => s.tab && setActiveTab(s.tab)}
            style={{ ...glass, padding: '14px 14px', textAlign: 'left', cursor: s.tab ? 'pointer' : 'default', fontFamily: 'var(--font-body)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="sy-pump" style={{ fontSize: 26, color: s.color, letterSpacing: -1 }}>{s.value}</span>
              <span style={{ color: 'var(--fg-3)', fontSize: 12, fontWeight: 600 }}>{s.unit}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Live prices — klickbar → Tanken */}
      <button
        onClick={() => setActiveTab('fuel')}
        style={{ marginBottom: 14, width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
            Aktuelle Preise · {locationCity}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: pricesLoading ? 'var(--fg-3)' : 'var(--gruen)', boxShadow: pricesLoading ? 'none' : '0 0 8px var(--gruen)', display: 'inline-block' }}/>
            <span style={{ fontSize: 11, color: pricesLoading ? 'var(--fg-3)' : 'var(--gruen)', fontWeight: 700 }}>{pricesLoading ? 'LÄDT' : 'LIVE'}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <PumpMini fuel="DIESEL" price={prices.diesel} c="var(--gruen)" loading={pricesLoading}/>
          <PumpMini fuel="E10" price={prices.e10} c="var(--orange)" loading={pricesLoading}/>
          <PumpMini fuel="E5" price={prices.e5} c="var(--e5)" loading={pricesLoading}/>
        </div>
      </button>

      {/* Cheapest station — live oder Fallback */}
      <div style={{ ...glass, padding: '14px 16px', marginBottom: 14, border: '1px solid rgba(56,229,138,0.22)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--gruen)', fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>
              {cheapStation ? 'Günstigste in der Nähe' : 'Tankstellen'}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {cheapStation?.name || 'GPS aktivieren für Live-Daten'}
            </div>
            {cheapStation ? (
              <>
                <div style={{ color: 'var(--fg-3)', fontSize: 12, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cheapStation.addr}{cheapStation.dist ? ` · ${Number(cheapStation.dist).toFixed(1)} km` : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="sy-pump" style={{ fontSize: 22, color: 'var(--gruen)' }}>
                    {Number(cheapStation.diesel).toFixed(3)}
                  </span>
                  <span style={{ color: 'var(--fg-3)', fontSize: 12 }}>€ Diesel</span>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--fg-3)', fontSize: 12 }}>Tankstellen im 5 km Radius anzeigen</div>
            )}
          </div>
          <button
            onClick={cheapStation ? openNavToStation : () => setActiveTab('fuel')}
            style={{
              padding: '10px 18px', borderRadius: 14, border: 'none',
              background: 'var(--turkis)', color: '#1F1402',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-body)', flexShrink: 0, marginLeft: 10,
            }}
          >
            <IconArrow size={14}/> {cheapStation ? 'Nav' : 'Alle'}
          </button>
        </div>
      </div>

      {/* Active route / country strip — klickbar → Route-Tab */}
      <button
        onClick={() => setActiveTab('route')}
        style={{ ...glass, padding: '16px 16px', marginBottom: 14, width: '100%', textAlign: 'left', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-body)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Aktive Route</div>
          <Tag color="var(--turkis)">{ROUTE_LABELS[routeKey]}</Tag>
        </div>
        <CountryStrip routeKey={routeKey}/>
      </button>

      {/* Quick actions */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Schnellzugriff</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => setActiveTab('route')} style={{
            ...glass, padding: '16px 16px',
            background: 'linear-gradient(135deg, rgba(245,181,68,0.18), rgba(245,181,68,0.06))',
            border: '1px solid rgba(245,181,68,0.35)',
            cursor: 'pointer', borderRadius: 18,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
            fontFamily: 'var(--font-body)',
          }}>
            <IconRoute size={22} style={{ color: 'var(--turkis)' }}/>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--turkis)' }}>Route planen</div>
          </button>
          <button onClick={() => setActiveTab('fuel')} style={{
            ...glass, padding: '16px 16px', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', borderRadius: 18, background: 'rgba(255,255,255,0.04)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
            fontFamily: 'var(--font-body)',
          }}>
            <IconFuel size={22} style={{ color: 'var(--gruen)' }}/>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>Tanken</div>
          </button>
          <button onClick={() => setActiveTab('ai')} style={{
            ...glass, padding: '16px 16px', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', borderRadius: 18, background: 'rgba(255,255,255,0.04)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
            fontFamily: 'var(--font-body)',
          }}>
            <IconChat size={22} style={{ color: 'var(--e5)' }}/>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>KI-Assistent</div>
          </button>
          <button onClick={() => setActiveTab('profile')} style={{
            ...glass, padding: '16px 16px', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', borderRadius: 18, background: 'rgba(255,255,255,0.04)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
            fontFamily: 'var(--font-body)',
          }}>
            <IconCardSm size={22} style={{ color: 'var(--orange)' }}/>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>Checkliste</div>
          </button>
        </div>
      </div>
    </div>
  )
}
