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
        background: 'rgba(10,12,16,0.85)',
        backdropFilter: 'blur(30px) saturate(160%)',
        WebkitBackdropFilter: 'blur(30px) saturate(160%)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        margin: '0 14px 12px',
        borderRadius: 28,
        height: 'auto',
      }}>
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <motion.button key={tab.id} whileTap={{ scale: 0.82 }}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-[18px] relative"
              style={{ minWidth: 44 }}>
              {active && (
                <motion.div layoutId="nav-bg"
                  className="absolute inset-0 rounded-[18px]"
                  style={{
                    background: 'rgba(245,181,68,0.14)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
              )}
              <Icon size={19}
                style={{ color: active ? '#F5B544' : '#7A8090' }}
                strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[9px] font-semibold relative z-10"
                style={{ color: active ? '#F5B544' : '#7A8090', fontFamily: 'DM Sans, sans-serif' }}>
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
