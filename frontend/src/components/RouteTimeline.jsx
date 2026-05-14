import { motion } from 'framer-motion'
import { Fuel, Hotel, Coffee, AlertTriangle, Flag } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function RouteTimeline({ route }) {
  const { isDark } = useStore()
  if (!route) return null
  const stops = buildStops(route)
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const textMain = isDark ? '#f5f5f5' : '#0f172a'
  const textMuted = isDark ? '#888' : '#64748b'

  return (
    <div className="relative pl-4">
      <div className="absolute left-7 top-4 bottom-4 w-0.5"
        style={{ background: 'linear-gradient(180deg, #e8192c, #1a237e)' }} />
      {stops.map((stop, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }} className="flex gap-3 mb-4 relative">
          <div className="w-7 h-7 rounded-full flex items-center justify-center z-10 flex-shrink-0"
            style={{
              background: stop.isCity ? 'linear-gradient(135deg, #e8192c, #c0111f)' : isDark ? '#1a1a1a' : '#f7f8fc',
              border: `2px solid ${stop.isCity ? '#e8192c' : border}`,
            }}>
            {stop.isCity
              ? <span className="text-white text-[10px] font-bold">{i + 1}</span>
              : <stop.icon size={12} style={{ color: textMuted }} />}
          </div>
          <div className="flex-1 py-0.5">
            <div className="font-semibold text-sm" style={{ color: textMain }}>
              {stop.flag && <span className="mr-1">{stop.flag}</span>}{stop.name}
            </div>
            {stop.detail && <div className="text-xs mt-0.5" style={{ color: textMuted }}>{stop.detail}</div>}
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
    stops.push({ name: country, flag: flags[i], isCity: true })
    if (i === 1) stops.push({ name: 'Tankstopp empfohlen', icon: Fuel, isCity: false, detail: 'Günstigste Preise vor Grenze tanken' })
    if (i === Math.floor(countries.length / 2)) stops.push({ name: 'Übernachtung möglich', icon: Hotel, isCity: false, detail: 'Beograd / Niš – ab 30 €/Nacht' })
    if (i === countries.length - 2) stops.push({ name: 'Grenzübergang', icon: AlertTriangle, isCity: false, detail: route.borders?.join(', ') || 'Kapıkule' })
  })
  return stops
}
