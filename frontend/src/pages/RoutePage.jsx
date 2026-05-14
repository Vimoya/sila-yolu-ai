import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import RouteCard from '../components/RouteCard'
import RouteTimeline from '../components/RouteTimeline'
import { ROUTE_TEMPLATES, EUROPE_STARTS, TURKEY_DESTINATIONS } from '../config/routes'

export default function RoutePage() {
  const { isDark, setCurrentRoute } = useStore()
  const [start, setStart] = useState('')
  const [dest, setDest] = useState('Istanbul')
  const [fuel, setFuel] = useState('diesel')
  const [consumption, setConsumption] = useState(8)
  const [fuelPrice, setFuelPrice] = useState(1.65)
  const [showOptions, setShowOptions] = useState(false)
  const [avoidFerry, setAvoidFerry] = useState(false)
  const [avoidToll, setAvoidToll] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [calculated, setCalculated] = useState(false)

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

  function calculate() {
    setCalculated(true)
    setSelectedRoute(null)
  }

  const routes = Object.values(ROUTE_TEMPLATES)

  return (
    <div className="page-container" style={{ background: bg }}>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black mb-1" style={{ color: textMain }}>Route berechnen</h1>
        <p className="text-sm mb-5" style={{ color: textMuted }}>Von Europa bis zur Türkei</p>

        {/* Input Form */}
        <div className="rounded-3xl p-4 mb-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="mb-3">
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: textMuted }}>STARTORT</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
              <input
                value={start}
                onChange={e => setStart(e.target.value)}
                placeholder="z.B. München, Paris, Amsterdam..."
                style={{ ...inputStyle, paddingLeft: 36 }}
                list="starts"
              />
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
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: textMuted }}>
              KRAFTSTOFFPREIS €/L (aktuell: {fuelPrice.toFixed(2)} €)
            </label>
            <input type="range" min={1.2} max={2.5} step={0.05} value={fuelPrice}
              onChange={e => setFuelPrice(+e.target.value)}
              className="w-full accent-red-600" />
          </div>

          <button onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1 text-xs mb-3" style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ChevronDown size={12} style={{ transform: showOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            Erweiterte Optionen
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3">
                <div className="flex flex-col gap-2">
                  {[
                    [avoidFerry, setAvoidFerry, 'Fähre vermeiden'],
                    [avoidToll, setAvoidToll, 'Maut vermeiden'],
                  ].map(([val, setter, label], i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setter(!val)}
                        className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{ background: val ? '#dc2626' : isDark ? '#1a1a1a' : '#f7f8fc', border: `1px solid ${val ? '#dc2626' : border}` }}>
                        {val && <div className="w-2.5 h-2.5 rounded-sm bg-white" />}
                      </div>
                      <span className="text-sm" style={{ color: textMain }}>{label}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={calculate}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-base"
            style={{ background: 'linear-gradient(135deg, #e8192c, #c0111f)', boxShadow: '0 4px 20px rgba(220,38,38,0.35)' }}
          >
            Route berechnen
          </motion.button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {calculated && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-base font-bold mb-3" style={{ color: textMain }}>Routen für {start || 'Deutschland'} → {dest}</h2>
              <div className="flex flex-col gap-3 mb-6">
                {routes.map((r, i) => (
                  <RouteCard key={r.name} route={r} index={i}
                    onSelect={(route) => { setSelectedRoute(route); setCurrentRoute(route) }} />
                ))}
              </div>

              <AnimatePresence>
                {selectedRoute && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
                    <h3 className="font-bold mb-4" style={{ color: textMain }}>
                      Route: {selectedRoute.name}
                    </h3>
                    <RouteTimeline route={selectedRoute} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
