import { motion } from 'framer-motion'
import { Home, Map, AlertTriangle, Fuel, Bot, Users, User } from 'lucide-react'
import { useStore } from '../store/useStore'

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'route', icon: Map, label: 'Route' },
  { id: 'border', icon: AlertTriangle, label: 'Grenze' },
  { id: 'ai', icon: Bot, label: 'Assistent' },
  { id: 'community', icon: Users, label: 'Community' },
  { id: 'profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <nav className="relative z-50 flex-shrink-0"
      style={{
        height: 'var(--nav-h)',
        background: 'rgba(6,6,16,0.95)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
      }}>
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <motion.button key={tab.id} whileTap={{ scale: 0.82 }}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl relative"
              style={{ minWidth: 48 }}>
              {active && (
                <motion.div layoutId="nav-bg"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
              )}
              <Icon size={19}
                style={{ color: active ? '#f5f5f5' : 'rgba(255,255,255,0.3)' }}
                strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[9px] font-semibold relative z-10"
                style={{ color: active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }}>
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
