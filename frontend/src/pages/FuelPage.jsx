import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { IconSearch, IconArrow } from '../components/Icons'
import { useStore } from '../store/useStore'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

function PumpBig({ fuel, price, c, loading }) {
  return (
    <div style={{
      background: 'rgba(10,12,16,0.7)', border: `1px solid ${c}33`,
      borderRadius: 18, padding: '14px 12px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: '-50% -50% auto auto', width: '180%', height: '180%', background: `radial-gradient(circle at 50% 0%, ${c}22, transparent 60%)`, pointerEvents: 'none' }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: c }}>{fuel}</div>
        <div className="sy-pump" style={{ fontSize: 28, color: loading ? 'rgba(255,255,255,0.2)' : c, letterSpacing: -1, marginTop: 4, textShadow: loading ? 'none' : `0 0 16px ${c}66` }}>
          {loading ? '···' : price ?? '—'}<span style={{ fontSize: 12, opacity: 0.6 }}>{!loading && price ? ' €' : ''}</span>
        </div>
      </div>
    </div>
  )
}

function StationCard({ name, address, diesel, benzin, e10, e5, cheap, open, dist, onNav }) {
  const prices = []
  if (diesel != null) prices.push(['DIESEL', Number(diesel).toFixed(3), 'var(--gruen)'])
  if (e10   != null) prices.push(['E10',    Number(e10).toFixed(3),    'var(--orange)'])
  if (e5    != null) prices.push(['E5',     Number(e5).toFixed(3),     'var(--e5)'])
  if (benzin != null && e10 == null && e5 == null) prices.push(['BENZIN', Number(benzin).toFixed(3), 'var(--e5)'])

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: cheap ? '1px solid rgba(56,229,138,0.3)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: '14px 14px',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: open !== false ? 'var(--gruen)' : 'rgba(255,255,255,0.2)', boxShadow: open !== false ? '0 0 8px var(--gruen)' : 'none' }}/>
            <span style={{ fontSize: 10, color: open !== false ? 'var(--gruen)' : 'var(--fg-3)', fontWeight: 700, flexShrink: 0 }}>{open !== false ? 'GEÖFFNET' : 'GESCHL.'}</span>
          </div>
          <div style={{ color: 'var(--fg-3)', fontSize: 12 }}>{address}{dist ? ` · ${dist}` : ''}</div>
        </div>
        {cheap && <Tag color="var(--gruen)" style={{ flexShrink: 0 }}>GÜNSTIG</Tag>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {prices.length > 0 ? prices.map(([fuel, p, c]) => (
          <div key={fuel} style={{
            flex: 1, padding: '8px 6px', borderRadius: 12,
            background: 'rgba(10,12,16,0.55)', border: `1px solid ${c}33`, textAlign: 'center',
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: c, letterSpacing: 0.5 }}>{fuel}</div>
            <div className="sy-pump" style={{ fontSize: 16, color: c, marginTop: 2 }}>
              {p}<span style={{ fontSize: 9, opacity: 0.7 }}> €</span>
            </div>
          </div>
        )) : (
          <div style={{ flex: 1, padding: '8px', color: 'var(--fg-3)', fontSize: 12, textAlign: 'center' }}>Keine Preise verfügbar</div>
        )}
        <button onClick={onNav} style={{
          flex: 0.8, padding: '8px 6px', borderRadius: 12,
          background: 'var(--turkis)', color: '#1F1402',
          textAlign: 'center', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer',
          border: 'none', fontFamily: 'var(--font-body)',
        }}>
          <IconArrow size={16}/>
          <span style={{ fontSize: 10, fontWeight: 800 }}>Nav</span>
        </button>
      </div>
    </div>
  )
}

const StationsMap = memo(function StationsMap({ stations, userPos }) {
  const mapRef = useRef(null)
  const leafletRef = useRef(null)
  const markersRef = useRef([])
  const circleRef = useRef(null)
  const userMarkerRef = useRef(null)

  // Init map once
  useEffect(() => {
    if (leafletRef.current) return
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
    }).setView([48.137, 11.576], 13)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map)

    leafletRef.current = map
    return () => { map.remove(); leafletRef.current = null }
  }, [])

  // Update markers when stations/userPos change
  useEffect(() => {
    const map = leafletRef.current
    if (!map) return

    // Remove old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    circleRef.current?.remove()
    userMarkerRef.current?.remove()

    const points = []

    if (userPos) {
      points.push([userPos.lat, userPos.lng])

      // Blue user dot
      userMarkerRef.current = L.circleMarker([userPos.lat, userPos.lng], {
        radius: 8, fillColor: '#4DA8FF', color: '#fff',
        weight: 2, opacity: 1, fillOpacity: 1,
      }).bindTooltip('Du', { permanent: false, direction: 'top' }).addTo(map)

      // 5km radius circle
      circleRef.current = L.circle([userPos.lat, userPos.lng], {
        radius: 5000, color: 'rgba(77,168,255,0.4)', weight: 1.5,
        fillColor: 'rgba(77,168,255,0.04)', fillOpacity: 1,
      }).addTo(map)
    }

    stations.slice(0, 10).forEach((s, i) => {
      if (!s.lat || !s.lng) return
      const price = s.diesel ?? s.e5 ?? s.benzin
      const color = i === 0 ? '#38E58A' : '#F5B544'
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${color};color:#04060A;border-radius:999px;padding:3px 7px;font-size:11px;font-weight:800;font-family:JetBrains Mono,monospace;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.5);border:1.5px solid rgba(255,255,255,0.2)">${price ? Number(price).toFixed(2) + '€' : s.name.slice(0, 6)}</div>`,
        iconAnchor: [28, 10],
      })
      const marker = L.marker([s.lat, s.lng], { icon })
        .bindPopup(`<b>${s.name}</b><br>${s.address || ''}<br>Diesel: ${s.diesel ? s.diesel + '€' : '—'} · E5: ${s.e5 ? s.e5 + '€' : '—'}`)
        .addTo(map)
      markersRef.current.push(marker)
      points.push([s.lat, s.lng])
    })

    if (points.length > 0) {
      try { map.fitBounds(L.latLngBounds(points), { padding: [24, 24], maxZoom: 14 }) } catch {}
    }
  }, [stations, userPos])

  return (
    <div style={{ position: 'relative', height: 200, borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}/>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, pointerEvents: 'none' }}>
        <Tag color="var(--e5)" style={{ fontSize: 10 }}>5 km Radius · OpenStreetMap</Tag>
      </div>
      {stations.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(4,6,10,0.7)', color: 'var(--fg-3)', fontSize: 13, zIndex: 999,
        }}>
          GPS aktivieren um Karte zu laden
        </div>
      )}
    </div>
  )
})

const SORT_OPTS = ['Diesel', 'Benzin', 'Entfernung', 'Name']

export default function FuelPage() {
  const { lastPosition, setLastPosition } = useStore()
  const [userPos, setUserPos] = useState(lastPosition ? { lat: lastPosition.lat, lng: lastPosition.lng } : null)
  const [locationLabel, setLocationLabel] = useState(lastPosition?.city || 'Standort ermitteln...')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(false)
  const [avgPrices, setAvgPrices] = useState({ diesel: null, e10: null, e5: null })
  const [sort, setSort] = useState('Diesel')
  const [searchQ, setSearchQ] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [source, setSource] = useState('')
  const [error, setError] = useState(null)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  const fetchStations = useCallback(async (lat, lng, label) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/fuel/nearby?lat=${lat}&lng=${lng}&country=de`)
      const data = await res.json()
      if (data.stations?.length) {
        setStations(data.stations)
        setSource(data.source || 'Tankerkönig')
        // Calc avg prices
        const ds = data.stations.map(s => s.diesel).filter(Boolean)
        const bs = data.stations.map(s => s.benzin ?? s.e5).filter(Boolean)
        setAvgPrices({
          diesel: ds.length ? (ds.reduce((a, b) => a + b) / ds.length).toFixed(3) : null,
          e10: null,
          e5: bs.length ? (bs.reduce((a, b) => a + b) / bs.length).toFixed(3) : null,
        })
      } else {
        setStations([])
        setError('Keine Tankstellen gefunden – bitte anderen Ort eingeben.')
      }
    } catch {
      setError('Verbindungsfehler – bitte erneut versuchen.')
    } finally {
      setLoading(false)
      if (label) setLocationLabel(label)
    }
  }, [])

  const getGPS = useCallback(() => {
    if (!navigator.geolocation) {
      // No GPS → load München as default
      setLocationLabel('München')
      setSearchQ('München')
      fetchStations(48.137, 11.576, 'München')
      return
    }
    setGpsLoading(true)
    setLocationLabel('Standort wird ermittelt…')
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setUserPos({ lat, lng })
        let city = 'Aktueller Standort'
        try {
          const r = await fetch(`${API_BASE}/api/fuel/geocode?lat=${lat}&lon=${lng}`)
          const d = await r.json()
          city = d.address?.city || d.address?.town || d.address?.village || d.display_name?.split(',')[0] || city
          setLocationLabel(city)
          setSearchQ(city)
        } catch { setLocationLabel(city) }
        setLastPosition({ lat, lng, city, updatedAt: Date.now() })
        setGpsLoading(false)
        fetchStations(lat, lng)
      },
      () => {
        setGpsLoading(false)
        // GPS verweigert → letzten gespeicherten Standort nutzen oder München
        if (lastPosition) {
          setUserPos({ lat: lastPosition.lat, lng: lastPosition.lng })
          setLocationLabel(lastPosition.city || 'Letzter Standort')
          setSearchQ(lastPosition.city || '')
          fetchStations(lastPosition.lat, lastPosition.lng)
        } else {
          setLocationLabel('München (Standard)')
          setSearchQ('München')
          fetchStations(48.137, 11.576, 'München')
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    )
  }, [fetchStations])

  // On mount: load last position immediately, then try to refresh via GPS
  useEffect(() => {
    if (lastPosition) {
      fetchStations(lastPosition.lat, lastPosition.lng)
    }
    getGPS()
  }, [])

  // Search suggestions via Nominatim
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (searchQ.length < 3) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API_BASE}/api/fuel/geocode?q=${encodeURIComponent(searchQ)}&country=de`)
        const d = await r.json()
        if (Array.isArray(d) && d.length) setSuggestions(d.slice(0, 4))
        else if (d?.lat) setSuggestions([d])
        else setSuggestions([])
      } catch { setSuggestions([]) }
    }, 450)
  }, [searchQ])

  const handleSuggestion = async (s) => {
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    const city = s.display_name?.split(',')[0] || s.display_name
    setUserPos({ lat, lng })
    setSearchQ(s.display_name?.split(',').slice(0, 2).join(', ') || s.display_name)
    setSuggestions([])
    setLastPosition({ lat, lng, city, updatedAt: Date.now() })
    fetchStations(lat, lng, city)
  }

  const handleSearchSubmit = async () => {
    if (!searchQ.trim()) return
    setSuggestions([])
    try {
      const r = await fetch(`${API_BASE}/api/fuel/geocode?q=${encodeURIComponent(searchQ)}&country=de`)
      const d = await r.json()
      const item = Array.isArray(d) ? d[0] : d
      if (item?.lat) {
        const lat = parseFloat(item.lat)
        const lng = parseFloat(item.lon)
        const city = item.display_name?.split(',')[0] || searchQ
        setUserPos({ lat, lng })
        setLocationLabel(city)
        setLastPosition({ lat, lng, city, updatedAt: Date.now() })
        fetchStations(lat, lng)
      }
    } catch {}
  }

  const sorted = [...stations].sort((a, b) => {
    if (sort === 'Diesel') return (a.diesel ?? 99) - (b.diesel ?? 99)
    if (sort === 'Benzin') return ((a.benzin ?? a.e5 ?? 99)) - ((b.benzin ?? b.e5 ?? 99))
    if (sort === 'Name') return (a.name || '').localeCompare(b.name || '')
    return 0
  })

  const openNav = (s) => {
    if (s.lat && s.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`, '_blank')
    } else if (s.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`, '_blank')
    }
  }

  return (
    <div style={{ minHeight: '100%', padding: '0 16px', paddingBottom: 110, position: 'relative' }}>

      {/* Aurora */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(40% 25% at 10% 5%, rgba(56,229,138,0.12), transparent 60%),
          radial-gradient(35% 20% at 88% 18%, rgba(255,138,61,0.12), transparent 60%)
        `,
      }}/>

      {/* Header */}
      <div style={{ position: 'relative', paddingTop: 52, paddingBottom: 18 }}>
        <div style={{ color: 'var(--fg-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
          {source || 'Tankerkönig · Live'}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: -0.6, color: 'var(--fg)' }}>
          Tankstellen <span style={{ color: 'var(--gruen)' }}>in der Nähe</span>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{
          ...glass,
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
          border: searchFocus ? '1px solid rgba(245,181,68,0.45)' : '1px solid rgba(255,255,255,0.08)',
        }}>
          <IconSearch size={16} style={{ color: 'var(--fg-3)', flexShrink: 0 }}/>
          <input
            ref={searchRef}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
            onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="Stadt oder Adresse suchen…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--fg)', fontSize: 14, fontFamily: 'var(--font-body)',
            }}
          />
          <button
            onClick={getGPS}
            disabled={gpsLoading}
            style={{
              padding: '6px 12px', borderRadius: 10,
              background: gpsLoading ? 'rgba(255,255,255,0.06)' : 'rgba(245,181,68,0.15)',
              border: '1px solid rgba(245,181,68,0.35)',
              color: 'var(--turkis)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
              fontFamily: 'var(--font-body)',
            }}
          >
            <span>{gpsLoading ? '⏳' : '📍'}</span> GPS
          </button>
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && searchFocus && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, marginTop: 4,
            background: '#0F1318', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onMouseDown={() => handleSuggestion(s)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 16px', background: 'none', border: 'none',
                  color: 'var(--fg)', fontSize: 13, cursor: 'pointer',
                  borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <div style={{ fontWeight: 600 }}>{s.display_name?.split(',')[0]}</div>
                <div style={{ color: 'var(--fg-3)', fontSize: 11, marginTop: 2 }}>{s.display_name?.split(',').slice(1, 3).join(',').trim()}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Avg prices */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>
          Ø Preise · {locationLabel}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <PumpBig fuel="DIESEL" price={avgPrices.diesel} c="var(--gruen)" loading={loading}/>
          <PumpBig fuel="BENZIN" price={avgPrices.e5}     c="var(--e5)"   loading={loading}/>
          <PumpBig fuel="E10"    price={avgPrices.e10}    c="var(--orange)" loading={loading}/>
        </div>
      </div>

      {/* Sort chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {SORT_OPTS.map(opt => (
          <button key={opt} onClick={() => setSort(opt)} style={{
            flexShrink: 0, padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
            background: sort === opt ? 'rgba(245,181,68,0.15)' : 'rgba(255,255,255,0.04)',
            color: sort === opt ? 'var(--turkis)' : 'var(--fg-3)',
            border: sort === opt ? '1px solid rgba(245,181,68,0.35)' : '1px solid rgba(255,255,255,0.08)',
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)',
          }}>
            {opt === sort ? `↑ ${opt}` : opt}
          </button>
        ))}
      </div>

      {/* Cheapest station highlight */}
      {!loading && stations.length > 0 && (() => {
        const best = [...stations].filter(s => s.diesel != null).sort((a, b) => a.diesel - b.diesel)[0] || stations[0]
        if (!best) return null
        const prices = []
        if (best.diesel != null) prices.push(['DIESEL', best.diesel, 'var(--gruen)'])
        if (best.e5    != null) prices.push(['E5',     best.e5,     'var(--e5)'])
        if (best.e10   != null) prices.push(['E10',    best.e10,    'var(--orange)'])
        if (best.benzin != null && best.e5 == null && best.e10 == null) prices.push(['BENZIN', best.benzin, '#B388FF'])
        return (
          <div style={{ ...glass, background: 'rgba(56,229,138,0.04)', border: '1px solid rgba(56,229,138,0.25)', padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gruen)', boxShadow: '0 0 8px var(--gruen)' }}/>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--gruen)', letterSpacing: 0.8, textTransform: 'uppercase' }}>Günstigste Tankstelle in der Nähe</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{best.name}</div>
                <div style={{ color: 'var(--fg-3)', fontSize: 12 }}>{best.address}{best.dist ? ` · ${Number(best.dist).toFixed(1)} km` : ''}</div>
              </div>
              <button onClick={() => openNav(best)} style={{ padding: '8px 14px', borderRadius: 12, background: 'var(--gruen)', color: '#04060A', fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0 }}>Nav</button>
            </div>
            {prices.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {prices.map(([label, val, color]) => (
                  <div key={label} style={{ flex: 1, padding: '7px 6px', borderRadius: 10, background: `${color}12`, border: `1px solid ${color}33`, textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color, letterSpacing: 0.5 }}>{label}</div>
                    <div className="sy-pump" style={{ fontSize: 17, color, marginTop: 2 }}>{Number(val).toFixed(3)}<span style={{ fontSize: 9, opacity: 0.6 }}> €</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* Map */}
      <StationsMap stations={sorted} userPos={userPos}/>

      {/* Error */}
      {error && (
        <div style={{ ...glass, padding: '14px 16px', marginBottom: 16, color: 'var(--orange)', fontSize: 13, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 110, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }}/>
          ))}
        </div>
      )}

      {/* Station list */}
      {!loading && sorted.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {sorted.map((s, i) => (
            <div key={s.id || i}>
              {i === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, paddingLeft: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gruen)', boxShadow: '0 0 8px var(--gruen)', flexShrink: 0 }}/>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gruen)', letterSpacing: 0.5 }}>GÜNSTIGSTE TANKSTELLE IN DER NÄHE</span>
                </div>
              )}
              <StationCard
                name={s.name}
                address={s.address}
                diesel={s.diesel}
                benzin={s.benzin}
                e5={s.e5}
                e10={s.e10}
                cheap={s.cheap || i === 0}
                open={s.isOpen !== false}
                dist={s.dist ? `${Number(s.dist).toFixed(1)} km` : (s.note?.includes('km') ? s.note : null)}
                onNav={() => openNav(s)}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && sorted.length === 0 && !error && (
        <div style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 14, padding: '32px 0' }}>
          Ort eingeben um Tankstellen zu suchen.
        </div>
      )}

      {/* Attribution */}
      <div style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 10, paddingBottom: 8 }}>
        {source ? `Daten via ${source}` : 'Tankerkönig API · Markttransparenzstelle'}
      </div>
    </div>
  )
}
