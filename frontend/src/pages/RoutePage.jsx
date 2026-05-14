import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Map, Navigation, Clock, Fuel, Euro } from 'lucide-react'
import { useStore } from '../store/useStore'
import { ROUTE_TEMPLATES, EUROPE_STARTS, TURKEY_DESTINATIONS } from '../config/routes'

const VIGNETTES = [
  { country: '🇦🇹 Österreich', price: '15,40 €', days: '10 Tage', color: '#e8192c' },
  { country: '🇭🇺 Ungarn', price: '10,00 €', days: '10 Tage', color: '#22c55e' },
  { country: '🇸🇮 Slowenien', price: '16,00 €', days: '7 Tage', color: '#3b82f6' },
  { country: '🇷🇸 Serbien', price: 'Gratis', days: 'PKW frei', color: '#f59e0b' },
  { country: '🇧🇬 Bulgarien', price: '10,50 €', days: '7 Tage', color: '#7c3aed' },
]

function GoogleMapEmbed({ origin, destination }) {
  const src = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving&language=de`
  // Fallback to directions URL if no API key
  const fallbackUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`

  return (
    <div className="rounded-2xl overflow-hidden" style={{ height: 280 }}>
      <iframe
        title="Route"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
        onError={(e) => { e.target.src = '' }}
      />
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
        style={{ background: 'rgba(0,0,0,0.05)' }}>
      </div>
    </div>
  )
}

function OpenStreetMapEmbed({ origin, destination }) {
  // Use OpenStreetMap/OSRM — no API key needed
  const bbox = '8,42,32,52'
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=48.1351,11.5820`

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ height: 260 }}>
      <iframe
        title="Karte"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        src={src}
        loading="lazy"
      />
      {/* Open in Google Maps button */}
      <div className="absolute bottom-3 right-3">
        <a
          href={`https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: '#e8192c', boxShadow: '0 2px 12px rgba(232,25,44,0.4)' }}>
          <Map size={12} /> In Google Maps öffnen
        </a>
      </div>
    </div>
  )
}

export default function RoutePage() {
  const { isDark, setCurrentRoute } = useStore()
  const [start, setStart] = useState('München')
  const [dest, setDest] = useState('Istanbul')
  const [fuel, setFuel] = useState('diesel')
  const [consumption, setConsumption] = useState(8)
  const [fuelPrice, setFuelPrice] = useState(1.65)
  const [showOptions, setShowOptions] = useState(false)
  const [avoidFerry, setAvoidFerry] = useState(false)
  const [avoidToll, setAvoidToll] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [calculated, setCalculated] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [activeView, setActiveView] = useState('route') // 'route' | 'map' | 'vignetten'

  const bg = isDark ? '#0d0d0d' : '#ffffff'
  const cardBg = isDark ? '#1a1a1a' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const textMuted = isDark ? '#888' : '#64748b'
  const textMain = isDark ? '#f5f5f5' : '#0f172a'

  const inputStyle = {
    background: isDark ? '#1a1a1a' : '#f7f8fc',
    border: `1px solid ${border}`,
    borderRadius: 16,
    color: textMain,
    padding: '12px 16px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  }

  const routes = Object.values(ROUTE_TEMPLATES)
  const totalKm = selectedRoute?.distance || 2150
  const fuelCost = ((totalKm / 100) * consumption * fuelPrice).toFixed(0)
  const hours = selectedRoute?.duration || 22

  function calculate() {
    setCalculated(true)
    setSelectedRoute(routes[0])
    setCurrentRoute(routes[0])
  }

  return (
    <div className="page-container" style={{ background: bg }}>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black mb-1" style={{ color: textMain }}>Route berechnen</h1>
        <p className="text-sm mb-4" style={{ color: textMuted }}>Von Europa bis zur Türkei</p>

        {/* View Tabs */}
        <div className="flex gap-1.5 mb-4 p-1 rounded-2xl" style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', border: `1px solid ${border}` }}>
          {[['route', '🗺️ Route'], ['map', '📍 Karte'], ['vignetten', '🪟 Vignetten']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveView(id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: activeView === id ? 'linear-gradient(135deg, #e8192c, #c0111f)' : 'transparent', color: activeView === id ? 'white' : textMuted }}>
              {label}
            </button>
          ))}
        </div>

        {/* ROUTE TAB */}
        {activeView === 'route' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Input Form */}
            <div className="rounded-2xl p-4 mb-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="mb-3">
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: textMuted }}>STARTORT</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
                  <input value={start} onChange={e => setStart(e.target.value)}
                    placeholder="z.B. München, Paris..."
                    style={{ ...inputStyle, paddingLeft: 36 }} list="starts" />
                  <datalist id="starts">
                    {EUROPE_STARTS.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: textMuted }}>ZIELORT TÜRKEI</label>
                <div className="relative">
                  <select value={dest} onChange={e => setDest(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                    {TURKEY_DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: textMuted }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: textMuted }}>KRAFTSTOFF</label>
                  <select value={fuel} onChange={e => setFuel(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                    <option value="diesel">Diesel</option>
                    <option value="benzin">Benzin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: textMuted }}>VERBRAUCH L/100km</label>
                  <input type="number" value={consumption} onChange={e => setConsumption(+e.target.value)}
                    min={4} max={20} step={0.5} style={inputStyle} />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold mb-1.5 flex justify-between" style={{ color: textMuted }}>
                  <span>KRAFTSTOFFPREIS</span>
                  <span style={{ color: '#e8192c' }}>{fuelPrice.toFixed(2)} €/L</span>
                </label>
                <input type="range" min={1.2} max={2.5} step={0.05} value={fuelPrice}
                  onChange={e => setFuelPrice(+e.target.value)}
                  className="w-full" style={{ accentColor: '#e8192c' }} />
              </div>

              <button onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-1 text-xs mb-3" style={{ color: '#e8192c', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ChevronDown size={12} style={{ transform: showOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                Erweiterte Optionen
              </button>

              <AnimatePresence>
                {showOptions && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-3">
                    <div className="flex flex-col gap-2">
                      {[[avoidFerry, setAvoidFerry, 'Fähre vermeiden'], [avoidToll, setAvoidToll, 'Maut vermeiden']].map(([val, setter, label], i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <div onClick={() => setter(!val)}
                            className="w-5 h-5 rounded-md flex items-center justify-center"
                            style={{ background: val ? '#e8192c' : isDark ? '#1a1a1a' : '#f7f8fc', border: `1px solid ${val ? '#e8192c' : border}` }}>
                            {val && <div className="w-2.5 h-2.5 rounded-sm bg-white" />}
                          </div>
                          <span className="text-sm" style={{ color: textMain }}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button whileTap={{ scale: 0.97 }} onClick={calculate}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-base"
                style={{ background: 'linear-gradient(135deg, #e8192c, #c0111f)', boxShadow: '0 4px 20px rgba(232,25,44,0.35)' }}>
                🗺️ Route berechnen
              </motion.button>
            </div>

            {/* Results */}
            <AnimatePresence>
              {calculated && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Cost Summary */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { icon: Navigation, label: 'Distanz', value: `${totalKm} km`, color: '#e8192c' },
                      { icon: Clock, label: 'Fahrzeit', value: `${hours}h`, color: '#f59e0b' },
                      { icon: Euro, label: 'Spritkosten', value: `${fuelCost}€`, color: '#22c55e' },
                    ].map((s, i) => (
                      <div key={i} className="rounded-2xl p-3 text-center"
                        style={{ background: cardBg, border: `1px solid ${border}` }}>
                        <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
                        <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs" style={{ color: textMuted }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Route Options */}
                  <h2 className="text-sm font-bold mb-3" style={{ color: textMain }}>
                    {start} → {dest}
                  </h2>
                  <div className="flex flex-col gap-3 mb-4">
                    {routes.map((r, i) => (
                      <motion.div key={r.name} whileTap={{ scale: 0.98 }}
                        onClick={() => { setSelectedRoute(r); setCurrentRoute(r) }}
                        className="rounded-2xl p-4 cursor-pointer transition-all"
                        style={{
                          background: selectedRoute?.name === r.name ? 'rgba(232,25,44,0.08)' : cardBg,
                          border: `1px solid ${selectedRoute?.name === r.name ? '#e8192c' : border}`,
                        }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-sm" style={{ color: textMain }}>{r.name}</div>
                          {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(232,25,44,0.1)', color: '#e8192c' }}>Empfohlen</span>}
                        </div>
                        <div className="text-xs" style={{ color: textMuted }}>
                          {r.stops?.join(' → ') || 'DE → AT → HU → RS → BG → TR'}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Google Maps Link */}
                  <a href={`https://www.google.com/maps/dir/${encodeURIComponent(start)}/${encodeURIComponent('Budapest')}/${encodeURIComponent('Belgrade')}/${encodeURIComponent('Sofia')}/${encodeURIComponent(dest + ', Türkei')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #4285f4, #1a73e8)', boxShadow: '0 4px 16px rgba(66,133,244,0.35)', textDecoration: 'none' }}>
                    <Map size={16} /> In Google Maps öffnen
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* MAP TAB */}
        {activeView === 'map' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3 text-sm" style={{ color: textMuted }}>
              Route: <span style={{ color: textMain, fontWeight: 600 }}>{start} → {dest}</span>
            </div>
            <OpenStreetMapEmbed origin={start} destination={dest} />
            <div className="mt-4 rounded-2xl p-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="font-semibold text-sm mb-2" style={{ color: textMain }}>🗺️ Schnellroute</div>
              {['🇩🇪 Deutschland', '🇦🇹 Österreich', '🇭🇺 Ungarn', '🇷🇸 Serbien', '🇧🇬 Bulgarien', '🇹🇷 Türkei'].map((c, i, arr) => (
                <div key={c} className="flex items-center gap-2 py-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#e8192c' }} />
                  <span className="text-sm" style={{ color: textMain }}>{c}</span>
                  {i < arr.length - 1 && <div className="flex-1 border-l-2 border-dashed ml-1 h-4" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }} />}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIGNETTEN TAB */}
        {activeView === 'vignetten' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm mb-4" style={{ color: textMuted }}>Pflichtgebühren auf der Standardroute</p>
            <div className="flex flex-col gap-3">
              {VIGNETTES.map((v, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ background: cardBg, border: `1px solid ${border}` }}>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: textMain }}>{v.country}</div>
                    <div className="text-xs mt-0.5" style={{ color: textMuted }}>{v.days}</div>
                  </div>
                  <div className="font-black text-base" style={{ color: v.color }}>{v.price}</div>
                </motion.div>
              ))}
              <div className="rounded-2xl p-4 mt-1"
                style={{ background: 'rgba(232,25,44,0.08)', border: '1px solid rgba(232,25,44,0.2)' }}>
                <div className="font-bold text-sm mb-0.5" style={{ color: '#e8192c' }}>
                  Gesamtkosten Vignetten: ~52 €
                </div>
                <div className="text-xs" style={{ color: textMuted }}>Ohne Türkei-Maut (ggf. HGS/OGS System)</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
