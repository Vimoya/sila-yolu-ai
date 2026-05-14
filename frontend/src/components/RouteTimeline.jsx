import { motion } from 'framer-motion'
import { Fuel, Hotel, Coffee, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function RouteTimeline({ route }) {
  const { isDark } = useStore()
  if (!route) return null

  const stops = buildStops(route)

  return (
    <div className="relative px-4">
      <div className="absolute left-8 top-0 bottom-0 w-0.5"
        style={{ background: 'linear-gradient(180deg, #dc2626, #1d4ed8)' }} />
      {stops.map((stop, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex gap-4 mb-4 relative"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0"
            style={{ background: stop.isCity ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : isDark ? '#1e293b' : '#f1f5f9', border: `2px solid ${stop.isCity ? '#dc2626' : isDark ? '#334155' : '#e2e8f0'}` }}>
            {stop.isCity ? (
              <span className="text-white text-xs font-bold">{i + 1}</span>
            ) : (
              <stop.icon size={14} style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
            )}
          </div>
          <div className="flex-1 pb-1">
            <div className="font-semibold text-sm" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
              {stop.flag && <span className="mr-1">{stop.flag}</span>}
              {stop.name}
            </div>
            {stop.detail && (
              <div className="text-xs mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                {stop.detail}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function buildStops(route) {
  const stops = []
  const countries = route.countries || []
  const flags = route.flags || []

  countries.forEach((country, i) => {
    stops.push({ name: country, flag: flags[i], isCity: true, icon: null })

    if (i < countries.length - 1) {
      if (i === Math.floor(countries.length / 3)) {
        stops.push({ name: 'Tankstopp empfohlen', icon: Fuel, isCity: false, detail: 'Günstigste Preise vor der Grenze' })
      }
      if (i === Math.floor(countries.length / 2)) {
        stops.push({ name: 'Übernachtung möglich', icon: Hotel, isCity: false, detail: 'Beograd oder Niš – ab 30 €/Nacht' })
      }
      if (i === Math.floor(countries.length * 0.75)) {
        stops.push({ name: 'Rastplatz / Pause', icon: Coffee, isCity: false, detail: 'Empfohlene Pause nach ~10h' })
      }
    }
  })

  stops.push({ name: 'Grenzübergang', icon: AlertTriangle, isCity: false, detail: route.borders?.join(', ') })
  return stops
}
