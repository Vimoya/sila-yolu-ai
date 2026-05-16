import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Map, Navigation, Clock, Fuel, Euro, Loader2, MapPin, Zap, AlertCircle } from 'lucide-react'
import { useStore } from '../store/useStore'

const API = import.meta.env.VITE_API_BASE_URL || ''

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'

const TR_CITIES = [
  'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Konya', 'Adana',
  'Gaziantep', 'Trabzon', 'Samsun', 'Kayseri', 'Sivas', 'Erzurum',
  'Diyarbakir', 'Bodrum', 'Kusadasi', 'Marmaris', 'Cesme', 'Fethiye',
]


export default function RoutePage() {
  const { setCurrentRoute, routeSettings, setRouteSettings, routeResult, setRouteResult } = useStore()
  const { start, dest, fuel, consumption, fuelPrice, avoidToll, selectedRouteKey } = routeSettings

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

  const startRef = useRef(null)
  const destRef = useRef(null)
  const startDebounce = useRef(null)
  const destDebounce = useRef(null)

  const glass = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(28px) saturate(140%)',
    WebkitBackdropFilter: 'blur(28px) saturate(140%)',
    borderRadius: 22,
  }
  const glassStrong = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    backdropFilter: 'blur(28px) saturate(140%)',
    WebkitBackdropFilter: 'blur(28px) saturate(140%)',
    borderRadius: 22,
  }
  const cardBg = 'rgba(255,255,255,0.04)'
  const border = 'rgba(255,255,255,0.08)'
  const textMuted = '#7A8090'
  const textMain = '#F2F4F8'
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    color: textMain,
    padding: '13px 16px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
  }

  useEffect(() => {
    function close(e) {
      if (startRef.current && !startRef.current.contains(e.target)) setShowStartSugg(false)
      if (destRef.current && !destRef.current.contains(e.target)) setShowDestSugg(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  function searchStart(val) {
    setRouteSettings({ start: val })
    setResult(null)
    if (startDebounce.current) clearTimeout(startDebounce.current)
    if (val.length < 2) { setStartSugg([]); setShowStartSugg(false); return }
    startDebounce.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `${NOMINATIM_URL}/search?q=${encodeURIComponent(val)}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'de' } }
        )
        const data = await r.json()
        setStartSugg(data)
        setShowStartSugg(data.length > 0)
      } catch { setStartSugg([]) }
    }, 300)
  }

  function searchDest(val) {
    setRouteSettings({ dest: val })
    setResult(null)
    if (destDebounce.current) clearTimeout(destDebounce.current)
    if (val.length < 2) { setDestSugg([]); setShowDestSugg(false); return }
    destDebounce.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `${NOMINATIM_URL}/search?q=${encodeURIComponent(val)}&format=json&limit=8&addressdetails=1`,
          { headers: { 'Accept-Language': 'de', 'User-Agent': 'SilaYoluApp/1.0' } }
        )
        const data = await r.json()
        const items = data
          .map(d => {
            const name = d.address?.village || d.address?.town || d.address?.city || d.address?.county || d.display_name.split(',')[0]
            const state = d.address?.state || ''
            const country = d.address?.country || ''
            return { displayName: name + (state ? `, ${state}` : ''), shortName: name, country, flag: d.address?.country_code }
          })
          .filter((item, idx, arr) => arr.findIndex(x => x.shortName === item.shortName) === idx)
        setDestSugg(items)
        setShowDestSugg(items.length > 0)
      } catch { setDestSugg([]); setShowDestSugg(false) }
    }, 280)
  }

  function selectStart(item) {
    const name = item.address?.village || item.address?.town || item.address?.city || item.display_name.split(',')[0]
    const country = item.address?.country || ''
    setRouteSettings({ start: name + (country ? `, ${country}` : '') })
    setShowStartSugg(false)
    setResult(null)
  }

  function selectDest(item) {
    setRouteSettings({ dest: item.displayName || item.shortName })
    setShowDestSugg(false)
    setResult(null)
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
    if (!start.trim() || !dest.trim()) {
      setError('Bitte Start und Ziel eingeben.')
      return
    }
    setCalculating(true)
    setError(null)
    try {
      const r = await fetch(`${API}/api/route/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, dest, consumption, fuelPrice, avoidToll, fuel }),
      })
      const data = await r.json()
      if (!r.ok || !data.routes) throw new Error(data.error || `HTTP ${r.status}`)
      setResult(data)
      setRouteResult(data)
      const best = data.routes.find(r => r.key === selectedKey) || data.routes[0]
      fetchAiTips(best)
      setRouteSettings({ selectedRouteKey: best.key })
      setCurrentRoute({ ...best, start, dest })
    } catch (e) {
      setError(`Fehler: ${e.message}`)
    }
    setCalculating(false)
  }

  async function fetchAiTips(route) {
    if (!route) return
    setTipsLoading(true)
    setAiTips(null)
    setAiTankStops(null)
    try {
      const r = await fetch(`${API}/api/route/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, dest, routeKey: route.key, consumption, fuelPrice, avoidToll, fuel }),
      })
      const data = await r.json()
      setAiTips(data.aiTips)
      setAiTankStops(data.aiTankStops)
    } catch {}
    setTipsLoading(false)
  }

  function selectRoute(key) {
    setSelectedKey(key)
    setRouteSettings({ selectedRouteKey: key })
    setAiTankStops(null)
    if (result) {
      const r = result.routes.find(r => r.key === key)
      setCurrentRoute({ ...r, start, dest })
      fetchAiTips(r)
    }
  }

  const selectedResult = result?.routes?.find(r => r.key === selectedKey)

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black mb-1" style={{ color: textMain, fontFamily: 'Space Grotesk, sans-serif' }}>
          Route nach <span style={{ color: '#FF8A3D' }}>Türkei</span>
        </h1>
        <p className="text-sm mb-4" style={{ color: textMuted, fontFamily: 'DM Sans, sans-serif' }}>Türkiye yolu</p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Form card */}
          <div className="rounded-3xl p-4 mb-4" style={glassStrong}>

            {/* Start */}
            <div className="mb-3" ref={startRef}>
              <label className="text-xs font-bold mb-2 block tracking-widest" style={{ color: textMuted }}>STARTORT</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: textMuted }} />
                <input value={start} onChange={e => searchStart(e.target.value)}
                  onFocus={() => startSugg.length > 0 && setShowStartSugg(true)}
                  placeholder="z.B. München, Berlin, Paris..."
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 44 }}
                  autoComplete="off" />
                <button onClick={handleGps} disabled={gpsLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${border}` }}>
                  {gpsLoading
                    ? <Loader2 size={14} style={{ color: textMain, animation: 'spin 1s linear infinite' }} />
                    : <Navigation size={14} style={{ color: textMain }} />}
                </button>
                <AnimatePresence>
                  {showStartSugg && startSugg.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-full left-0 right-0 z-50 rounded-2xl overflow-hidden mt-1"
                      style={{ background: '#141420', border: `1px solid ${border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}>
                      {startSugg.map((item, i) => {
                        const city = item.address?.city || item.address?.town || item.address?.village || item.display_name.split(',')[0]
                        return (
                          <button key={item.place_id} onMouseDown={() => selectStart(item)}
                            className="w-full text-left px-4 py-3 flex items-center gap-2.5"
                            style={{ borderBottom: i < startSugg.length - 1 ? `1px solid ${border}` : 'none', background: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <MapPin size={13} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                            <div>
                              <div className="text-sm font-medium" style={{ color: textMain }}>{city}</div>
                              <div className="text-xs" style={{ color: textMuted }}>{item.address?.country}</div>
                            </div>
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Dest */}
            <div className="mb-3" ref={destRef}>
              <label className="text-xs font-bold mb-2 block tracking-widest" style={{ color: textMuted }}>ZIELORT</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: textMuted }} />
                <input value={dest} onChange={e => searchDest(e.target.value)}
                  onFocus={() => searchDest(dest)}
                  placeholder="z.B. Istanbul, Ankara, Antalya..."
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  autoComplete="off" />
                <AnimatePresence>
                  {showDestSugg && destSugg.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-full left-0 right-0 z-50 rounded-2xl overflow-hidden mt-1"
                      style={{ background: '#141420', border: `1px solid ${border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}>
                      {destSugg.map((item, i) => (
                        <button key={i} onMouseDown={() => selectDest(item)}
                          className="w-full text-left px-4 py-3 flex items-center gap-2.5"
                          style={{ borderBottom: i < destSugg.length - 1 ? `1px solid ${border}` : 'none', background: 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <MapPin size={13} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                          <div>
                            <div className="text-sm font-medium" style={{ color: textMain }}>{item.shortName}</div>
                            {item.country && <div className="text-xs" style={{ color: textMuted }}>{item.country}</div>}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Fuel & Consumption */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-bold mb-2 block tracking-widest" style={{ color: textMuted }}>KRAFTSTOFF</label>
                <div className="relative">
                  <select value={fuel} onChange={e => setRouteSettings({ fuel: e.target.value })}
                    style={{ ...inputStyle, appearance: 'none', paddingRight: 36 }}>
                    <option value="diesel">Diesel</option>
                    <option value="benzin">Benzin</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: textMuted }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold mb-2 block tracking-widest" style={{ color: textMuted }}>L/100KM</label>
                <input type="number" value={consumption}
                  onChange={e => setRouteSettings({ consumption: +e.target.value })}
                  min={4} max={20} step={0.5} style={inputStyle} />
              </div>
            </div>

            {/* Fuel Price */}
            <div className="mb-4">
              <label className="text-xs font-bold mb-2 flex justify-between tracking-widest" style={{ color: textMuted }}>
                <span>KRAFTSTOFFPREIS</span>
                <span style={{ color: textMain, fontWeight: 800 }}>{fuelPrice.toFixed(2)} €/L</span>
              </label>
              <input type="range" min={1.0} max={2.5} step={0.05} value={fuelPrice}
                onChange={e => setRouteSettings({ fuelPrice: +e.target.value })}
                className="w-full" style={{ accentColor: '#F5B544' }} />
              <div className="flex justify-between text-xs mt-1" style={{ color: textMuted }}>
                <span>1.00 €</span><span>2.50 €</span>
              </div>
            </div>

            {/* Maut toggle */}
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <div onClick={() => setRouteSettings({ avoidToll: !avoidToll })}
                className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: avoidToll ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${avoidToll ? 'rgba(255,255,255,0.3)' : border}` }}>
                {avoidToll && <div className="w-2.5 h-2.5 rounded-sm bg-white" />}
              </div>
              <span className="text-sm" style={{ color: textMain }}>Maut vermeiden</span>
            </label>

            {error && (
              <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.09)', border: `1px solid ${border}` }}>
                <AlertCircle size={14} style={{ color: textMuted }} />
                <span className="text-xs" style={{ color: textMuted }}>{error}</span>
              </div>
            )}

            <motion.button whileTap={{ scale: 0.97 }} onClick={calculate} disabled={calculating}
              className="w-full py-3.5 rounded-[18px] font-black text-sm flex items-center justify-center gap-2"
              style={{
                background: calculating ? 'rgba(255,255,255,0.06)' : 'linear-gradient(180deg, #FFCC5C, #D49628)',
                color: calculating ? textMuted : '#0A0C10',
                border: calculating ? '1px solid rgba(255,255,255,0.08)' : 'none',
                boxShadow: calculating ? 'none' : '0 4px 20px rgba(245,181,68,0.35)',
                fontFamily: 'Space Grotesk, sans-serif',
                opacity: calculating ? 0.6 : 1,
              }}>
              {calculating
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Berechne...</>
                : <><Zap size={16} /> Route berechnen</>}
            </motion.button>
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

                {/* Summary cards */}
                {selectedResult && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { icon: Navigation, label: 'Distanz', value: `${selectedResult.km.toLocaleString()} km`, color: '#F5B544' },
                      { icon: Clock, label: 'Fahrzeit', value: `~${selectedResult.hours}h`, color: '#4DA8FF' },
                      { icon: Fuel, label: 'Spritkosten', value: `${selectedResult.fuelCost} €`, color: '#38E58A' },
                      { icon: Euro, label: 'Gesamt', value: `${selectedResult.total} €`, color: '#FF8A3D' },
                    ].map((s, i) => (
                      <div key={i} className="p-3 flex items-center gap-2.5"
                        style={glass}>
                        <div className="w-8 h-8 rounded-[12px] flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <s.icon size={15} style={{ color: s.color }} />
                        </div>
                        <div>
                          <div className="sy-pump text-sm" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-xs" style={{ color: textMuted, fontFamily: 'DM Sans, sans-serif' }}>{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fees */}
                {selectedResult?.fees && (
                  <div className="rounded-2xl p-4 mb-4" style={glass}>
                    <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: textMuted }}>GEBÜHREN & VIGNETTEN</div>
                    {selectedResult.fees.filter(f => f.required || f.cost > 0).map((fee, i, arr) => {
                      const icon = fee.type === 'vignette' ? '🪟' : fee.type === 'toll' ? '🛣️' : 'ℹ️'
                      return (
                        <div key={i} className="py-2.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{icon}</span>
                              <div>
                                <span className="text-xs" style={{ color: textMuted }}>{fee.country}</span>
                                <div className="text-sm font-semibold" style={{ color: textMain }}>{fee.name}</div>
                              </div>
                            </div>
                            <span className="text-sm font-black ml-2 shrink-0" style={{ color: fee.cost > 0 ? textMain : textMuted }}>
                              {fee.cost > 0 ? `${fee.cost.toFixed(2)} €` : 'Gratis'}
                            </span>
                          </div>
                          <div className="text-xs ml-7" style={{ color: textMuted }}>{fee.note}</div>
                        </div>
                      )
                    })}
                    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${border}` }}>
                      {[
                        { label: `Sprit (${Math.round((selectedResult.km / 100) * consumption)}L × ${fuelPrice.toFixed(2)}€)`, val: `${selectedResult.fuelCost} €` },
                        { label: 'Gesamt Hinfahrt', val: `${selectedResult.total} €`, bold: true },
                        { label: 'Hin- & Rückfahrt ca.', val: `${selectedResult.total * 2} €`, bold: true },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between py-1.5">
                          <span className="text-sm" style={{ color: row.bold ? textMain : textMuted, fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
                          <span className="text-sm font-black" style={{ color: textMain }}>{row.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tank stops — KI optimized when available */}
                {(aiTankStops?.length > 0 || selectedResult?.tankStops?.length > 0) && (
                  <div className="rounded-2xl p-4 mb-4" style={glass}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold tracking-widest" style={{ color: textMuted }}>TANKSTOPPS</div>
                      {aiTankStops?.length > 0 && !tipsLoading && (
                        <div className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>KI-optimiert</div>
                      )}
                      {tipsLoading && (
                        <div className="text-[10px]" style={{ color: textMuted }}>KI berechnet…</div>
                      )}
                    </div>
                    {(aiTankStops?.length > 0 ? aiTankStops : selectedResult.tankStops).map((s, i, arr) => {
                      const price = typeof s.price === 'number' ? s.price : parseFloat(s.price)
                      const isTip = s.tip === true
                      const text = typeof s.reason === 'string' ? s.reason : typeof s.note === 'string' ? s.note : ''
                      const action = typeof s.action === 'string' ? s.action : ''
                      return (
                        <div key={i} className="flex items-start gap-3 py-2.5"
                          style={{ borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
                          <span className="text-lg mt-0.5">{s.flag}</span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold" style={{ color: textMain }}>{s.city}</span>
                              <div className="flex items-center gap-2">
                                {!isNaN(price) && price > 0 && (
                                  <span className="text-xs font-black" style={{ color: '#4ade80' }}>{price.toFixed(2)} €/L</span>
                                )}
                                <span className="text-xs" style={{ color: textMuted }}>~{s.km?.toLocaleString()} km</span>
                              </div>
                            </div>
                            {action ? <div className="text-xs font-semibold mt-0.5" style={{ color: '#fbbf24' }}>{action}</div> : null}
                            {text ? <div className="text-xs mt-0.5" style={{ color: isTip ? '#4ade80' : textMuted }}>{text}</div> : null}
                            {s.liters > 0 && (
                              <div className="text-xs mt-0.5" style={{ color: 'rgba(96,165,250,0.8)' }}>Empfehlung: {s.liters}L tanken</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Speed limits */}
                {selectedResult?.speedLimits?.length > 0 && (
                  <div className="rounded-2xl p-4 mb-4" style={glass}>
                    <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: textMuted }}>TEMPOLIMITS</div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 280 }}>
                        <thead>
                          <tr>
                            {['Land', 'Autobahn', 'Landstr.', 'Richtg.'].map(h => (
                              <th key={h} style={{ textAlign: h === 'Land' ? 'left' : 'center', fontSize: 9, fontWeight: 700, color: textMuted, paddingBottom: 8, borderBottom: `1px solid ${border}`, paddingRight: h === 'Land' ? 8 : 0, letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedResult.speedLimits.map((s, i, arr) => (
                            <tr key={i} style={{ borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none' }}>
                              <td style={{ paddingTop: 8, paddingBottom: 8, paddingRight: 8 }}>
                                <div className="flex items-center gap-1">
                                  <span style={{ fontSize: 13 }}>{s.flag}</span>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: textMain }}>{s.country}</span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#60a5fa', paddingTop: 8, paddingBottom: 8 }}>{s.autobahn}</td>
                              <td style={{ textAlign: 'center', fontSize: 11, color: textMuted, paddingTop: 8, paddingBottom: 8 }}>{s.land}</td>
                              <td style={{ textAlign: 'center', fontSize: 11, color: 'rgba(251,191,36,0.8)', paddingTop: 8, paddingBottom: 8 }}>{s.ort || '50'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 pt-2.5" style={{ borderTop: `1px solid ${border}` }}>
                      {[['#60a5fa','Autobahn'],['rgba(255,255,255,0.4)','Landstraße'],['rgba(251,191,36,0.8)','Ortschaft']].map(([c,l]) => (
                        <div key={l} className="flex items-center gap-1">
                          <div style={{ width: 6, height: 6, borderRadius: 3, background: c }} />
                          <span style={{ fontSize: 9, color: textMuted }}>{l}</span>
                        </div>
                      ))}
                      <span style={{ fontSize: 9, color: textMuted }}>* Richtgeschwindigkeit (DE = kein festes Limit)</span>
                    </div>
                  </div>
                )}

                {/* Reise-Tipps — no AI label */}
                {(aiTips || tipsLoading) && (
                  <div className="rounded-2xl p-4 mb-4" style={glass}>
                    <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: textMuted }}>REISETIPPS</div>
                    {tipsLoading
                      ? <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}><Zap size={12} style={{ animation: 'pulse 1s infinite' }} /> Tipps werden geladen...</div>
                      : aiTips?.map((tip, i) => (
                        <div key={i} className="flex gap-2.5 mb-3 last:mb-0">
                          <span className="text-xs font-black mt-0.5 w-4 shrink-0 text-center" style={{ color: textMuted }}>{i + 1}</span>
                          <span className="text-sm leading-relaxed" style={{ color: textMain }}>{tip}</span>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* Route comparison */}
                <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: textMuted }}>ROUTENVERGLEICH</div>
                <div className="flex flex-col gap-3 mb-4">
                  {result.routes.map((r) => {
                    const isSelected = selectedKey === r.key
                    return (
                      <motion.div key={r.key} whileTap={{ scale: 0.98 }} onClick={() => selectRoute(r.key)}
                        className="p-4 cursor-pointer"
                        style={isSelected ? {
                          background: 'rgba(245,181,68,0.08)',
                          border: '1px solid rgba(245,181,68,0.25)',
                          backdropFilter: 'blur(28px) saturate(140%)',
                          WebkitBackdropFilter: 'blur(28px) saturate(140%)',
                          borderRadius: 22,
                        } : glass}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm" style={{ color: textMain, fontFamily: 'Space Grotesk, sans-serif' }}>{r.name}</span>
                          {r.recommended && (
                            <span className="text-xs px-2 py-1 rounded-full font-bold"
                              style={{ background: 'rgba(245,181,68,0.14)', color: '#F5B544', border: '1px solid rgba(245,181,68,0.25)', fontFamily: 'DM Sans, sans-serif' }}>✓ Empfohlen</span>
                          )}
                        </div>
                        <div className="flex items-center flex-wrap gap-0.5 text-base mb-2">
                          {r.flags.map((f, fi) => (
                            <span key={fi}>{f}{fi < r.flags.length - 1 && <span className="text-xs mx-0.5" style={{ color: textMuted }}>›</span>}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { label: 'km', val: r.km.toLocaleString() },
                            { label: 'Std', val: `~${r.hours}h` },
                            { label: 'Sprit', val: `${r.fuelCost}€` },
                            { label: 'Gesamt', val: `${r.total}€` },
                          ].map((s, si) => (
                            <div key={si} className="rounded-[10px] p-1.5 text-center"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="sy-pump text-xs" style={{ color: textMain }}>{s.val}</div>
                              <div className="text-[9px] mt-0.5" style={{ color: textMuted, fontFamily: 'DM Sans, sans-serif' }}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs mt-2" style={{ color: textMuted }}>
                          🪟 Vignetten {r.vignetteCost}€{!avoidToll && r.tollCost > 0 ? ` · 🛣️ Maut ${r.tollCost}€` : ''}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Google Maps */}
                {selectedResult && (
                  <a href={`https://www.google.com/maps/dir/${encodeURIComponent(start)}/${selectedResult.countries.slice(1, -1).map(c => encodeURIComponent(c)).join('/')}/${encodeURIComponent(dest + ', Türkei')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 font-bold text-sm"
                    style={{ background: 'rgba(77,168,255,0.10)', color: '#4DA8FF', border: '1px solid rgba(77,168,255,0.20)', borderRadius: 18, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                    <Map size={16} /> In Google Maps öffnen
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
