import { motion } from 'framer-motion'
import { Home, Map, AlertTriangle, Fuel, Bot, Users, User } from 'lucide-react'
import { useStore } from '../store/useStore'

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'route', icon: Map, label: 'Route' },
  { id: 'border', icon: AlertTriangle, label: 'Grenze' },
  { id: 'fuel', icon: Fuel, label: 'Tanken' },
  { id: 'ai', icon: Bot, label: 'KI' },
  { id: 'community', icon: Users, label: 'Community' },
  { id: 'profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const { activeTab, setActiveTab, isDark } = useStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        maxWidth: 480, margin: '0 auto',
        background: isDark ? 'rgba(20,20,20,0.97)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
        left: '50%', transform: 'translateX(-50%)', width: '100%',
      }}>
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <motion.button key={tab.id} whileTap={{ scale: 0.82 }}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl relative transition-all"
              style={{ minWidth: 44 }}>
              {active && (
                <motion.div layoutId="nav-bg"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'rgba(232,25,44,0.1)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
              )}
              <Icon size={20}
                style={{ color: active ? '#e8192c' : isDark ? '#555' : '#94a3b8' }}
                strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[9px] font-semibold"
                style={{ color: active ? '#e8192c' : isDark ? '#555' : '#94a3b8' }}>
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
