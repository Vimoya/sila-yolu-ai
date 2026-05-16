import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { useT } from '../i18n'
import { IconSearch, IconPin, IconArrow, IconBolt, IconChevron, IconClock, IconFuel } from '../components/Icons'

const API = import.meta.env.VITE_API_BASE_URL || ''
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(28px) saturate(140%)',
  WebkitBackdropFilter: 'blur(28px) saturate(140%)',
  borderRadius: 22,
}

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  color: '#F2F4F8',
  padding: '13px 16px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  boxSizing: 'border-box',
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

function SuggestionDropdown({ items, onSelect, renderItem }) {
  if (!items.length) return null
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
      borderRadius: 16, overflow: 'hidden',
      background: '#141420', border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
    }}>
      {items.map((item, i) => (
        <button key={i} onMouseDown={() => onSelect(item)}
          style={{
            width: '100%', textAlign: 'left', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            background: 'transparent', cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {renderItem(item)}
        </button>
      ))}
    </div>
  )
}

function RouteOption({ name, sub, cost, km, t, tag, tagColor, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: active ? 'rgba(245,181,68,0.08)' : 'rgba(255,255,255,0.03)',
      border: active ? '1px solid rgba(245,181,68,0.45)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18, padding: '12px 14px',
      boxShadow: active ? '0 8px 24px rgba(245,181,68,0.15)' : 'none',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Tag color={tagColor} style={{ marginBottom: 6 }}>{tag}</Tag>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{name}</div>
          <div style={{ color: 'var(--fg-3)', fontSize: 12, marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="sy-pump" style={{ fontSize: 22, color: active ? 'var(--turkis)' : 'var(--fg)', letterSpacing: -0.5 }}>{cost}</div>
          <div style={{ color: 'var(--fg-3)', fontSize: 11, marginTop: 2 }}>{km} · {t}</div>
        </div>
      </div>
    </div>
  )
}

function MapPreview({ km, hours }) {
  return (
    <div style={{ position: 'relative', height: 200, borderRadius: 22, overflow: 'hidden', background: 'linear-gradient(180deg, #0A1A26, #04080F)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 340 200">
        <defs>
          <pattern id="mgrid" width="34" height="20" patternUnits="userSpaceOnUse">
            <path d="M34 0H0V20" fill="none" stroke="rgba(77,168,255,0.08)" strokeWidth="0.5"/>
          </pattern>
          <linearGradient id="rline" x1="0" x2="1">
            <stop offset="0%" stopColor="#F5B544"/>
            <stop offset="50%" stopColor="#4DA8FF"/>
            <stop offset="100%" stopColor="#FF8A3D"/>
          </linearGradient>
        </defs>
        <rect width="340" height="200" fill="url(#mgrid)"/>
        <path d="M0 130 Q 50 110 90 120 T 180 100 T 260 110 T 340 90" stroke="rgba(77,168,255,0.18)" fill="none" strokeWidth="1.2"/>
        <path d="M30 140 C 70 100, 110 80, 170 95 S 260 130, 310 70" stroke="url(#rline)" strokeWidth="3" fill="none" strokeLinecap="round" filter="drop-shadow(0 0 6px #F5B544)"/>
        {[[30,140,'var(--turkis)','München'],[110,80,'var(--orange)','Wien'],[170,95,'var(--gruen)','Budapest'],[230,120,'#4DA8FF','Belgrad'],[310,70,'var(--orange)','Istanbul']].map(([x,y,c,n],i) => (
          <g key={i}><circle cx={x} cy={y} r="6" fill={c} opacity="0.25"/><circle cx={x} cy={y} r="3" fill={c}/></g>
        ))}
      </svg>
      <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
        {km && <div style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 10, fontWeight: 700, color: 'var(--turkis)' }}>{km} km</div>}
        {hours && <div style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 10, fontWeight: 700, color: 'var(--orange)' }}>~ {hours}h</div>}
      </div>
    </div>
  )
}

const ROUTE_OPTIONS_STATIC = [
  { key: 'austria_hungary', name: 'Balkan-Klassiker', sub: 'DE → AT → HU → RS → BG → TR', cost: '~380 €', km: '2.150', t: '~28h', tag: 'EMPFOHLEN',  tagColor: 'var(--turkis)' },
  { key: 'croatia_route',   name: 'Kroatien Route',   sub: 'DE → AT → SI → HR → RS → BG → TR', cost: '~410 €', km: '2.380', t: '~31h', tag: 'LANDSCHAFT', tagColor: 'var(--e5)' },
  { key: 'romania_route',   name: 'Rumänien Route',   sub: 'DE → AT → HU → RO → BG → TR', cost: '~395 €', km: '2.290', t: '~29h', tag: 'ALTERNATIV', tagColor: 'var(--gruen)' },
  { key: 'greece_route',    name: 'Griechenland',     sub: 'DE → AT → SI → RS → MK → GR → TR', cost: '~430 €', km: '2.450', t: '~33h', tag: 'MALERISCH',  tagColor: 'var(--orange)' },
]

export default function RoutePage() {
  const t = useT()
  const { setCurrentRoute, routeSettings, setRouteSettings, routeResult, setRouteResult, tankSize, setTankSize, saveRoute } = useStore()
  const { start, dest, fuel, consumption, fuelPrice, avoidToll, selectedRouteKey, persons } = routeSettings

  const [consumptionInput, setConsumptionInput] = useState(String(consumption || 8))
  const [tankInput, setTankInput] = useState(String(tankSize || 60))
  const [routeSavedId, setRouteSavedId] = useState(null)
  const [startSugg, setStartSugg] = useState([])
  const [destSugg, setDestSugg] = useState([])
  const [showStartSugg, setShowStartSugg] = useState(false)
  const [showDestSugg, setShowDestSugg] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState(routeResult?.routes ? routeResult : null)
  const [error, setError] = useState(null)
  const [selectedKey, setSelectedKey] = useState(selectedRouteKey || 'austria_hungary')
  const [aiTips, setAiTips] = useState(null)
  const [aiTankStops, setAiTankStops] = useState(null)
  const [tipsLoading, setTipsLoading] = useState(false)
  const aiLoadedForKey = useRef(null)

  const startRef = useRef(null)
  const destRef = useRef(null)
  const startDebounce = useRef(null)
  const destDebounce = useRef(null)

  useEffect(() => {
    function close(e) {
      if (startRef.current && !startRef.current.contains(e.target)) setShowStartSugg(false)
      if (destRef.current && !destRef.current.contains(e.target)) setShowDestSugg(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  // Auto-load AI tips when result is restored from store but aiTips are empty
  useEffect(() => {
    if (!result?.routes?.length || aiTips || tipsLoading) return
    const key = selectedKey || result.routes[0]?.key
    if (aiLoadedForKey.current === key) return
    aiLoadedForKey.current = key
    const route = result.routes.find(r => r.key === key) || result.routes[0]
    if (route) fetchAiTips(route)
  }, [result]) // eslint-disable-line

  const KNOWN_START = [
    { shortName: 'München', displayName: 'München, Bayern, Deutschland', country: 'Deutschland' },
    { shortName: 'Berlin', displayName: 'Berlin, Deutschland', country: 'Deutschland' },
    { shortName: 'Hamburg', displayName: 'Hamburg, Deutschland', country: 'Deutschland' },
    { shortName: 'Frankfurt', displayName: 'Frankfurt am Main, Hessen', country: 'Deutschland' },
    { shortName: 'Köln', displayName: 'Köln, Nordrhein-Westfalen', country: 'Deutschland' },
    { shortName: 'Stuttgart', displayName: 'Stuttgart, Baden-Württemberg', country: 'Deutschland' },
    { shortName: 'Düsseldorf', displayName: 'Düsseldorf, Nordrhein-Westfalen', country: 'Deutschland' },
    { shortName: 'Dortmund', displayName: 'Dortmund, Nordrhein-Westfalen', country: 'Deutschland' },
    { shortName: 'Hannover', displayName: 'Hannover, Niedersachsen', country: 'Deutschland' },
    { shortName: 'Nürnberg', displayName: 'Nürnberg, Bayern', country: 'Deutschland' },
    { shortName: 'Leipzig', displayName: 'Leipzig, Sachsen', country: 'Deutschland' },
    { shortName: 'Dresden', displayName: 'Dresden, Sachsen', country: 'Deutschland' },
    { shortName: 'Wien', displayName: 'Wien, Österreich', country: 'Österreich' },
    { shortName: 'Zürich', displayName: 'Zürich, Schweiz', country: 'Schweiz' },
    { shortName: 'Amsterdam', displayName: 'Amsterdam, Niederlande', country: 'Niederlande' },
    { shortName: 'Paris', displayName: 'Paris, Frankreich', country: 'Frankreich' },
    { shortName: 'Brüssel', displayName: 'Brüssel, Belgien', country: 'Belgien' },
    { shortName: 'Rotterdam', displayName: 'Rotterdam, Niederlande', country: 'Niederlande' },
  ]

  function searchStart(val) {
    setRouteSettings({ start: val })
    setResult(null)
    if (startDebounce.current) clearTimeout(startDebounce.current)
    if (val.length < 2) { setStartSugg([]); setShowStartSugg(false); return }

    const q = val.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const local = KNOWN_START.filter(p =>
      p.shortName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q) ||
      p.displayName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)
    )
    if (local.length > 0) {
      setStartSugg(local.map(p => ({ display_name: p.displayName, address: { city: p.shortName, country: p.country }, _known: true }))); setShowStartSugg(true)
    }

    startDebounce.current = setTimeout(async () => {
      try {
        const r = await fetch(`${NOMINATIM_URL}/search?q=${encodeURIComponent(val)}&format=json&limit=6&addressdetails=1&accept-language=de`, { headers: { 'Accept-Language': 'de' } })
        const data = await r.json()
        // Merge local + nominatim
        const localNames = new Set(local.map(p => p.shortName.toLowerCase()))
        const extra = data.filter(d => {
          const n = (d.address?.city || d.address?.town || d.address?.village || d.display_name.split(',')[0]).toLowerCase()
          return !localNames.has(n)
        })
        const all = [
          ...local.map(p => ({ display_name: p.displayName, address: { city: p.shortName, country: p.country }, _known: true })),
          ...extra
        ].slice(0, 7)
        setStartSugg(all); setShowStartSugg(all.length > 0)
      } catch { if (local.length === 0) setStartSugg([]) }
    }, 300)
  }

  // Well-known places on the Sıla Yolu route for instant suggestions
  const KNOWN_PLACES = [
    { shortName: 'Istanbul', displayName: 'Istanbul, Türkei', country: 'Türkei' },
    { shortName: 'Kapıkule', displayName: 'Kapıkule (Grenzübergang TR/BG)', country: 'Türkei' },
    { shortName: 'Ankara', displayName: 'Ankara, Türkei', country: 'Türkei' },
    { shortName: 'Izmir', displayName: 'İzmir, Türkei', country: 'Türkei' },
    { shortName: 'Antalya', displayName: 'Antalya, Türkei', country: 'Türkei' },
    { shortName: 'Bursa', displayName: 'Bursa, Türkei', country: 'Türkei' },
    { shortName: 'Sofia', displayName: 'Sofia, Bulgarien', country: 'Bulgarien' },
    { shortName: 'Belgrad', displayName: 'Belgrad, Serbien', country: 'Serbien' },
    { shortName: 'Horgoš', displayName: 'Horgoš (Grenze HU/RS)', country: 'Serbien' },
    { shortName: 'Budapest', displayName: 'Budapest, Ungarn', country: 'Ungarn' },
    { shortName: 'Wien', displayName: 'Wien, Österreich', country: 'Österreich' },
    { shortName: 'Zagreb', displayName: 'Zagreb, Kroatien', country: 'Kroatien' },
    { shortName: 'Bukarest', displayName: 'Bukarest, Rumänien', country: 'Rumänien' },
    { shortName: 'Thessaloniki', displayName: 'Thessaloniki, Griechenland', country: 'Griechenland' },
    { shortName: 'Skopje', displayName: 'Skopje, Nordmazedonien', country: 'Nordmazedonien' },
    { shortName: 'Niš', displayName: 'Niš, Serbien', country: 'Serbien' },
    { shortName: 'Gaziantep', displayName: 'Gaziantep, Türkei', country: 'Türkei' },
    { shortName: 'Konya', displayName: 'Konya, Türkei', country: 'Türkei' },
    { shortName: 'Adana', displayName: 'Adana, Türkei', country: 'Türkei' },
    { shortName: 'Trabzon', displayName: 'Trabzon, Türkei', country: 'Türkei' },
  ]

  function searchDest(val) {
    setRouteSettings({ dest: val })
    setResult(null)
    if (destDebounce.current) clearTimeout(destDebounce.current)
    if (val.length < 2) { setDestSugg([]); setShowDestSugg(false); return }

    // Instant local matches first
    const q = val.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const local = KNOWN_PLACES.filter(p =>
      p.shortName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q) ||
      p.displayName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)
    )
    if (local.length > 0) { setDestSugg(local); setShowDestSugg(true) }

    destDebounce.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `${NOMINATIM_URL}/search?q=${encodeURIComponent(val)}&format=json&limit=8&addressdetails=1&accept-language=de`,
          { headers: { 'Accept-Language': 'de', 'User-Agent': 'SilaYoluApp/1.0' } }
        )
        const data = await r.json()
        const items = data.map(d => {
          const name = d.address?.village || d.address?.town || d.address?.city || d.address?.municipality || d.address?.county || d.display_name.split(',')[0]
          const country = d.address?.country || ''
          const state = d.address?.state || d.address?.province || ''
          return { displayName: `${name}${state && state !== name ? `, ${state}` : ''}, ${country}`, shortName: name, country }
        }).filter((item, idx, arr) => item.shortName && arr.findIndex(x => x.shortName === item.shortName) === idx)

        // Merge: local known places first, then Nominatim results not already covered
        const localNames = new Set(local.map(p => p.shortName.toLowerCase()))
        const extra = items.filter(i => !localNames.has(i.shortName.toLowerCase()))
        const merged = [...local, ...extra].slice(0, 8)
        setDestSugg(merged); setShowDestSugg(merged.length > 0)
      } catch { if (local.length === 0) { setDestSugg([]); setShowDestSugg(false) } }
    }, 300)
  }

  function selectStart(item) {
    if (item._known) {
      setRouteSettings({ start: item.address.city })
    } else {
      const name = item.address?.village || item.address?.town || item.address?.city || item.display_name.split(',')[0]
      setRouteSettings({ start: name })
    }
    setShowStartSugg(false); setResult(null)
  }

  function selectDest(item) {
    setRouteSettings({ dest: item.displayName || item.shortName })
    setShowDestSugg(false); setResult(null)
  }

  async function handleGps() {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const r = await fetch(`${NOMINATIM_URL}/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`, { headers: { 'Accept-Language': 'de' } })
        const data = await r.json()
        const city = data.address?.city || data.address?.town || data.address?.village || data.display_name.split(',')[0]
        setRouteSettings({ start: city })
      } catch {}
      setGpsLoading(false)
    }, () => setGpsLoading(false), { timeout: 8000 })
  }

  async function calculate() {
    if (!start.trim() || !dest.trim()) { setError('Bitte Start und Ziel eingeben.'); return }
    setCalculating(true); setError(null)
    try {
      const r = await fetch(`${API}/api/route/compare`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, dest, consumption, fuelPrice, avoidToll, fuel }),
      })
      const data = await r.json()
      if (!r.ok || !data.routes) throw new Error(data.error || `HTTP ${r.status}`)
      setResult(data); setRouteResult(data)
      const best = data.routes.find(r => r.key === selectedKey) || data.routes[0]
      fetchAiTips(best)
      setRouteSettings({ selectedRouteKey: best.key })
      setCurrentRoute({ ...best, start, dest })
      saveRoute({ start, dest, routeKey: best.key, km: best.km, hours: best.hours, total: best.total, countries: best.countries })
      setRouteSavedId(Date.now())
    } catch (e) { setError(`Fehler: ${e.message}`) }
    setCalculating(false)
  }

  async function fetchAiTips(route) {
    if (!route) return
    setTipsLoading(true); setAiTips(null); setAiTankStops(null)
    try {
      const r = await fetch(`${API}/api/route/calculate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, dest, routeKey: route.key, consumption, fuelPrice, avoidToll, fuel }),
      })
      const data = await r.json()
      setAiTips(data.aiTips); setAiTankStops(data.aiTankStops)
    } catch {}
    setTipsLoading(false)
  }

  function selectRoute(key) {
    setSelectedKey(key); setRouteSettings({ selectedRouteKey: key }); setAiTankStops(null)
    if (result) {
      const r = result.routes.find(r => r.key === key)
      setCurrentRoute({ ...r, start, dest }); fetchAiTips(r)
    }
  }

  const selectedResult = result?.routes?.find(r => r.key === selectedKey)

  const routeOptions = result?.routes?.length
    ? result.routes.map(r => ({
        key: r.key, name: r.name, sub: r.countries?.join(' → ') || '',
        cost: `${r.total} €`, km: r.km?.toLocaleString(), t: `~${r.hours}h`,
        tag: r.recommended ? 'EMPFOHLEN' : 'ROUTE',
        tagColor: r.recommended ? 'var(--turkis)' : 'var(--fg-3)',
      }))
    : ROUTE_OPTIONS_STATIC

  return (
    <div style={{ minHeight: '100%', padding: '0 16px', paddingBottom: 110, position: 'relative' }}>

      {/* Aurora */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(40% 25% at 12% 6%, rgba(255,138,61,0.12), transparent 60%),
          radial-gradient(35% 20% at 88% 20%, rgba(245,181,68,0.12), transparent 60%)
        `,
      }}/>

      {/* Header */}
      <div style={{ position: 'relative', paddingTop: 52, paddingBottom: 18, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'var(--fg-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{t.routeSubtitle}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: -0.6, color: 'var(--fg)' }}>
            {t.routeTitle} <span style={{ color: 'var(--orange)' }}>Türkei</span>
          </div>
        </div>
        <button onClick={calculate} disabled={calculating} style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(245,181,68,0.12)', border: '1px solid rgba(245,181,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 4 }}>
          <IconBolt size={18} style={{ color: 'var(--turkis)' }}/>
        </button>
      </div>

      {/* Form card */}
      <div style={{ ...glass, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', padding: 16, marginBottom: 14 }}>

        {/* Start */}
        <div ref={startRef} style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(245,181,68,0.15)', border: '1px solid rgba(245,181,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconPin size={15} style={{ color: 'var(--turkis)' }}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>{t.from}</div>
              <div style={{ position: 'relative' }}>
                <input value={start} onChange={e => searchStart(e.target.value)}
                  onFocus={() => startSugg.length > 0 && setShowStartSugg(true)}
                  placeholder="München, Deutschland..."
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--fg)', fontSize: 14, fontWeight: 600, width: '100%', fontFamily: 'var(--font-body)' }}
                  autoComplete="off"/>
                {showStartSugg && (
                  <SuggestionDropdown items={startSugg} onSelect={selectStart} renderItem={item => {
                    const city = item._known ? item.address.city : (item.address?.city || item.address?.town || item.address?.village || item.display_name?.split(',')[0])
                    const country = item.address?.country || ''
                    const sub = item._known ? item.display_name : country
                    return <>
                      <span style={{ color: 'var(--fg-3)' }}><IconPin size={13}/></span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#F2F4F8' }}>{city}</div>
                        {sub && <div style={{ fontSize: 11, color: '#7A8090' }}>{sub}</div>}
                      </div>
                    </>
                  }}/>
                )}
              </div>
            </div>
            <button onClick={handleGps} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {gpsLoading ? <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#F2F4F8', animation: 'spin 0.8s linear infinite' }}/> : <span style={{ fontSize: 12 }}>📍</span>}
            </button>
          </div>
        </div>

        {/* Dest */}
        <div ref={destRef}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,138,61,0.15)', border: '1px solid rgba(255,138,61,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconPin size={15} style={{ color: 'var(--orange)' }}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>{t.to}</div>
              <div style={{ position: 'relative' }}>
                <input value={dest} onChange={e => searchDest(e.target.value)}
                  onFocus={() => searchDest(dest)}
                  placeholder="Istanbul, Türkei..."
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--fg)', fontSize: 14, fontWeight: 600, width: '100%', fontFamily: 'var(--font-body)' }}
                  autoComplete="off"/>
                {showDestSugg && (
                  <SuggestionDropdown items={destSugg} onSelect={selectDest} renderItem={item => <>
                    <span style={{ color: 'var(--fg-3)' }}><IconPin size={13}/></span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#F2F4F8' }}>{item.shortName}</div>
                      {item.country && <div style={{ fontSize: 11, color: '#7A8090' }}>{item.country}</div>}
                    </div>
                  </>}/>
                )}
              </div>
            </div>
            <IconChevron size={14} style={{ color: 'var(--fg-4)', flexShrink: 0 }}/>
          </div>
        </div>

        {/* Vehicle grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>{t.fuelType}</div>
            <div style={{ position: 'relative' }}>
              <select value={fuel} onChange={e => setRouteSettings({ fuel: e.target.value })}
                style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 28, cursor: 'pointer', padding: '8px 12px', fontSize: 13, color: '#F2F4F8', background: 'rgba(255,255,255,0.05)' }}>
                <option value="diesel" style={{ background: '#141420', color: '#F2F4F8' }}>Diesel</option>
                <option value="e10" style={{ background: '#141420', color: '#F2F4F8' }}>Benzin (E10)</option>
                <option value="e5" style={{ background: '#141420', color: '#F2F4F8' }}>Super (E5)</option>
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--fg-3)', fontSize: 9 }}>▼</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>{t.persons}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <button onClick={() => setRouteSettings({ persons: Math.max(1, (persons || 4) - 1) })} style={{ width: 36, height: 38, background: 'none', border: 'none', color: 'var(--fg-2)', fontSize: 18, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>−</button>
              <span style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{persons || 4}</span>
              <button onClick={() => setRouteSettings({ persons: Math.min(9, (persons || 4) + 1) })} style={{ width: 36, height: 38, background: 'none', border: 'none', color: 'var(--fg-2)', fontSize: 18, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+</button>
            </div>
          </div>
        </div>

        {/* Consumption + Tank */}
        <div style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{t.consumption}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="sy-pump" style={{ fontSize: 13, color: 'var(--turkis)' }}>{consumption} L/100</span>
              <span className="sy-pump" style={{ fontSize: 13, color: 'var(--gruen)' }}>{fuelPrice.toFixed(2)} €/L</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input type="number" value={consumptionInput} onChange={e => {
              setConsumptionInput(e.target.value)
              const v = parseFloat(e.target.value)
              if (!isNaN(v) && v >= 2 && v <= 30) setRouteSettings({ consumption: v })
            }} onBlur={e => {
              const v = parseFloat(e.target.value)
              if (isNaN(v) || v < 2) { setConsumptionInput(String(consumption || 8)) }
            }} min={2} max={30} step={0.5} style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }} placeholder="L/100km"/>
            <input type="range" min={1.0} max={2.5} step={0.05} value={fuelPrice} onChange={e => setRouteSettings({ fuelPrice: +e.target.value })} style={{ accentColor: '#F5B544', width: '100%', alignSelf: 'center' }}/>
          </div>
          {/* Tank size */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>{t.tankSize}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="number" value={tankInput} onChange={e => {
                setTankInput(e.target.value)
                const v = parseInt(e.target.value)
                if (!isNaN(v) && v >= 20 && v <= 200) setTankSize(v)
              }} min={20} max={200} step={5} style={{ ...inputStyle, padding: '8px 12px', fontSize: 13, width: 90, flexShrink: 0 }} placeholder="60"/>
              {consumption > 0 && tankSize > 0 && (
                <div style={{ fontSize: 12, color: 'var(--gruen)', fontWeight: 600 }}>
                  ⛽ {t.rangeInfo}: <span className="sy-pump">{Math.round(tankSize / consumption * 100)}</span> km
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Route options */}
        <div style={{ paddingTop: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>{t.chooseRoute}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {routeOptions.map(opt => (
              <RouteOption key={opt.key} {...opt} active={selectedKey === opt.key} onClick={() => selectRoute(opt.key)}/>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 14, background: 'rgba(255,60,60,0.08)', color: 'rgba(255,120,120,0.9)', border: '1px solid rgba(255,60,60,0.15)', fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        {/* CTA */}
        <button onClick={calculate} disabled={calculating} style={{
          marginTop: 14, width: '100%', padding: '15px 0', borderRadius: 18, border: 'none',
          background: calculating ? 'rgba(245,181,68,0.3)' : 'linear-gradient(180deg, #FFCC5C, #D49628)',
          color: calculating ? 'rgba(31,20,2,0.6)' : '#1F1402',
          fontWeight: 800, fontSize: 15, cursor: calculating ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: 'var(--font-body)',
          boxShadow: calculating ? 'none' : '0 8px 28px rgba(245,181,68,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}>
          {calculating
            ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(31,20,2,0.3)', borderTopColor: '#1F1402', animation: 'spin 0.8s linear infinite' }}/> {t.calculating}</>
            : <><IconBolt size={16}/> {t.calcBtn}</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--turkis)', textTransform: 'uppercase', letterSpacing: 1 }}>KI-Empfehlung · Live</span>
            {tipsLoading
              ? <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(56,229,138,0.3)', borderTopColor: 'var(--gruen)', animation: 'spin 0.8s linear infinite' }}/>
              : <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gruen)', boxShadow: '0 0 8px var(--gruen)', display: 'inline-block' }}/>
            }
          </div>

          {/* Map preview */}
          <div style={{ marginBottom: 14 }}>
            <MapPreview km={selectedResult?.km?.toLocaleString()} hours={selectedResult?.hours}/>
          </div>

          {/* Country breakdown */}
          {selectedResult?.fees?.length > 0 && (
            <div style={{ ...glass, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{t.countryBreakdown}</span>
                <Tag color="var(--e5)">{selectedResult?.countries?.length || 5} {t.countries}</Tag>
              </div>
              {selectedResult.fees.filter(f => f.required !== false || f.cost > 0).map((fee, i, arr) => {
                const typeIcon = fee.type === 'tunnel' ? '🚇' : fee.type === 'vignette' ? '🏷️' : fee.type === 'toll' ? '🛣️' : 'ℹ️'
                const typeColor = fee.type === 'tunnel' ? 'var(--e5)' : fee.type === 'vignette' ? 'var(--turkis)' : fee.type === 'toll' ? 'var(--orange)' : 'var(--fg-3)'
                const skipped = fee.required === false && fee.cost === 0 && fee.note?.startsWith('Nicht benötigt')
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', opacity: skipped ? 0.45 : 1 }}>
                    <div style={{ width: 32, height: 24, borderRadius: 6, background: `${typeColor}18`, border: `1px solid ${typeColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                      {typeIcon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: skipped ? 'var(--fg-3)' : 'var(--fg)' }}>{fee.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>{fee.note}</div>
                    </div>
                    <span className="sy-pump" style={{ fontSize: 15, color: skipped ? 'var(--gruen)' : fee.cost > 0 ? 'var(--fg)' : 'var(--gruen)' }}>
                      {skipped ? '✓ entfällt' : fee.cost > 0 ? `${fee.cost.toFixed(2)} €` : 'Gratis'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tank stops — no prices, only location info */}
          {((aiTankStops?.length > 0) || (selectedResult?.tankStops?.length > 0)) && (
            <div style={{ ...glass, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{t.tankStops}</span>
                {!tipsLoading && aiTankStops?.length > 0 && <Tag color="var(--gruen)" style={{ fontSize: 10 }}>{t.aiOptimized}</Tag>}
                {tipsLoading && <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{t.loading}</span>}
              </div>
              {(aiTankStops?.length > 0 ? aiTankStops : selectedResult.tankStops).map((s, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{s.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{s.city}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>
                      {s.country && <span style={{ marginRight: 6, color: 'var(--turkis)', fontWeight: 600 }}>{s.country}</span>}
                      ~{s.km?.toLocaleString()} km
                    </div>
                  </div>
                  {s.tip && <Tag color="var(--gruen)" style={{ fontSize: 9 }}>⛽ Tanken</Tag>}
                </div>
              ))}
              {consumption > 0 && tankSize > 0 && (
                <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(56,229,138,0.06)', border: '1px solid rgba(56,229,138,0.15)', fontSize: 12, color: 'var(--gruen)' }}>
                  ⛽ {t.rangeInfo}: <strong>{Math.round(tankSize / consumption * 100)} km</strong> · {t.refuelAt}: <strong>~{Math.round(tankSize / consumption * 100 * 0.85)} km</strong>
                </div>
              )}
            </div>
          )}

          {/* AI tips */}
          {selectedResult?.waypoints?.length > 0 && (
            <div style={{ ...glass, padding: 16, marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                🗺️ {t.routeDetail || 'Detailroute'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 14 }}>
                {t.routeDetailSub || 'Städte & Grenzübergänge auf deiner Route'}
              </div>
              <div style={{ position: 'relative' }}>
                {/* vertical line */}
                <div style={{ position: 'absolute', left: 13, top: 8, bottom: 8, width: 1, background: 'rgba(255,255,255,0.07)' }}/>
                {selectedResult.waypoints.map((wp, i) => {
                  const isBorder = wp.type === 'border'
                  const accentColor = isBorder ? 'var(--orange)' : 'var(--fg-3)'
                  const dotColor = isBorder ? 'var(--orange)' : 'rgba(255,255,255,0.18)'
                  const isLast = i === selectedResult.waypoints.length - 1
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: isLast ? 0 : 10, position: 'relative' }}>
                      {/* dot */}
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%', flexShrink: 0, marginTop: 3,
                        background: dotColor,
                        border: isBorder ? '2px solid var(--orange)' : '2px solid rgba(255,255,255,0.15)',
                        boxShadow: isBorder ? '0 0 6px rgba(255,138,61,0.4)' : 'none',
                        zIndex: 1,
                      }}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14 }}>{wp.flag}</span>
                          <span style={{ fontSize: 13, fontWeight: isBorder ? 700 : 500, color: isBorder ? 'var(--orange)' : 'var(--fg)', letterSpacing: isBorder ? 0.2 : 0 }}>
                            {wp.name}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--fg-4)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginLeft: 'auto', flexShrink: 0 }}>
                            {wp.km} km
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: isBorder ? 'rgba(255,138,61,0.75)' : 'var(--fg-3)', marginTop: 2, lineHeight: 1.4 }}>
                          {wp.note}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(aiTips?.length > 0 || tipsLoading) && (
            <div style={{ ...glass, padding: 16, marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                ⚡ KI-Reisetipps
              </div>
              {tipsLoading
                ? [1,2,3].map(i => (
                  <div key={i} style={{ height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }}/>
                ))
                : aiTips.map((tip, i) => {
                  const clean = String(tip).replace(/^\d+\)\s*/, '')
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--gruen)', background: 'rgba(56,229,138,0.12)', border: '1px solid rgba(56,229,138,0.2)', borderRadius: 6, width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                      <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--fg-2)' }}>{clean}</span>
                    </div>
                  )
                })
              }
            </div>
          )}
        </div>
      )}
    </div>
  )
}
