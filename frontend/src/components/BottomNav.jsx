import { motion } from 'framer-motion'
import { Home, Map, AlertTriangle, Fuel, Bot, Users, User } from 'lucide-react'
import { useStore } from '../store/useStore'

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'route', icon: Map, label: 'Route' },
  { id: 'border', icon: AlertTriangle, label: 'Grenze' },
  { id: 'fuel', icon: Fuel, label: 'Tanken' },
  { id: 'ai', icon: Bot, label: 'KI Chat' },
  { id: 'community', icon: Users, label: 'Community' },
  { id: 'profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const { activeTab, setActiveTab, isDark } = useStore()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: isDark ? 'rgba(10,15,30,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.85 }}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 px-1 py-1 relative"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.2), rgba(29,78,216,0.2))' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                style={{ color: active ? '#dc2626' : isDark ? '#64748b' : '#94a3b8' }}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className="text-[9px] font-medium"
                style={{ color: active ? '#dc2626' : isDark ? '#64748b' : '#94a3b8' }}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  )
}
