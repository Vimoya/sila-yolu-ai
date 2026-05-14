import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Moon, Sun, Fuel, Map, LogOut, ChevronRight, Star, Bell, Shield } from 'lucide-react'
import { useStore } from '../store/useStore'
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth'

const CHECKLIST_CATEGORIES = [
  { id: 'docs', label: 'Dokumente', icon: '📋', items: ['Reisepass', 'Führerschein', 'Fahrzeugschein', 'Grüne Karte', 'Krankenversicherung'] },
  { id: 'car', label: 'Auto', icon: '🚗', items: ['Reifendruck', 'Öl prüfen', 'Wasser prüfen', 'Verbandskasten', 'Warndreieck', 'Ersatzglühbirnen'] },
  { id: 'family', label: 'Familie', icon: '👨‍👩‍👧', items: ['Kinderausweis', 'Kindersitz geprüft', 'Snacks & Getränke', 'Spielzeug/Tablet', 'Erste-Hilfe-Set'] },
  { id: 'tech', label: 'Technik', icon: '📱', items: ['Handy geladen', 'Powerbank', 'Ladekabel', 'Dashcam', 'Offline-Karten'] },
  { id: 'money', label: 'Geld & Vignetten', icon: '💳', items: ['Vignette Österreich', 'Vignette Ungarn', 'Auslandswährung', 'Kreditkarte', 'Bargeld Reserve'] },
]

export default function ProfilePage() {
  const { isDark, toggleDark, user, setUser, checklist, toggleCheckItem } = useStore()
  const [activeSection, setActiveSection] = useState('settings')

  const bg = isDark ? '#0d0d0d' : '#ffffff'
  const cardBg = isDark ? '#1a1a1a' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const textMain = isDark ? '#f5f5f5' : '#0f172a'
  const textMuted = isDark ? '#888' : '#64748b'

  const totalItems = CHECKLIST_CATEGORIES.flatMap(c => c.items).length
  const checkedItems = CHECKLIST_CATEGORIES.flatMap(c => c.items.map((_, i) => `${c.id}_${i}`)).filter(id => checklist[id]).length
  const progress = Math.round((checkedItems / totalItems) * 100)

  async function handleLogout() {
    await signOut(auth)
    setUser(null)
  }

  return (
    <div className="page-container" style={{ background: bg }}>
      <div className="px-4 pt-6 pb-4">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 mb-4 text-center"
          style={{ background: 'linear-gradient(135deg, #e8192c, #1a237e)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, #dc2626, #1d4ed8)' }}>
            {user?.photoURL ? <img src={user.photoURL} className="w-full h-full rounded-full object-cover" alt="avatar" /> : <User size={28} color="white" />}
          </div>
          <div className="text-white font-bold text-lg">{user?.displayName || 'Gast'}</div>
          <div className="text-white/50 text-sm mb-3">{user?.email || 'Nicht angemeldet'}</div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Star size={12} style={{ color: '#f59e0b' }} />
            <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Free Plan</span>
          </div>
        </motion.div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-4">
          {[['settings', '⚙️ Einstellungen'], ['checklist', '✅ Checkliste']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveSection(id)}
              className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
              style={{ background: activeSection === id ? 'linear-gradient(135deg, #e8192c, #c0111f)' : isDark ? '#1a1a1a' : '#f7f8fc', color: activeSection === id ? 'white' : textMuted }}>
              {label}
            </button>
          ))}
        </div>

        {activeSection === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
            {/* Dark Mode */}
            <div className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-3">
                {isDark ? <Moon size={18} style={{ color: '#3b82f6' }} /> : <Sun size={18} style={{ color: '#f59e0b' }} />}
                <span className="font-medium text-sm" style={{ color: textMain }}>Dark Mode</span>
              </div>
              <motion.button onClick={toggleDark} className="w-12 h-6 rounded-full relative"
                style={{ background: isDark ? '#3b82f6' : '#e2e8f0' }}>
                <motion.div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                  animate={{ left: isDark ? '26px' : '2px' }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </motion.button>
            </div>

            {/* Settings Items */}
            {[
              { icon: <Fuel size={18} />, label: 'Fahrzeug & Verbrauch', color: '#f59e0b' },
              { icon: <Map size={18} />, label: 'Bevorzugte Route', color: '#22c55e' },
              { icon: <Bell size={18} />, label: 'Benachrichtigungen', color: '#3b82f6' },
              { icon: <Shield size={18} />, label: 'Datenschutz', color: '#8b5cf6' },
            ].map((item, i) => (
              <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl p-4 flex items-center justify-between w-full text-left"
                style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}20`, color: item.color }}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm" style={{ color: textMain }}>{item.label}</span>
                </div>
                <ChevronRight size={16} style={{ color: textMuted }} />
              </motion.button>
            ))}

            {/* Premium Upgrade */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="rounded-3xl p-5"
              style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.3)'}` }}>
              <div className="font-bold mb-1" style={{ color: textMain }}>⭐ Premium freischalten</div>
              <div className="text-xs mb-3" style={{ color: textMuted }}>KI Voice, Offline, PDF Export, Live Warnungen</div>
              <button className="px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
                Jetzt upgraden
              </button>
            </motion.div>

            {/* Logout */}
            {user && (
              <motion.button onClick={handleLogout} whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', color: '#ef4444' }}>
                <LogOut size={16} /> Abmelden
              </motion.button>
            )}
          </motion.div>
        )}

        {activeSection === 'checklist' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Progress */}
            <div className="rounded-2xl p-4 mb-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold" style={{ color: textMain }}>Reise-Checkliste</span>
                <span className="font-bold" style={{ color: '#22c55e' }}>{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? '#1a1a1a' : '#f7f8fc' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #22c55e, #16a34a)' }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>
              <div className="text-xs mt-1.5" style={{ color: textMuted }}>{checkedItems} von {totalItems} erledigt</div>
            </div>

            {CHECKLIST_CATEGORIES.map(cat => (
              <div key={cat.id} className="mb-3">
                <div className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: textMain }}>
                  <span>{cat.icon}</span> {cat.label}
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  {cat.items.map((item, i) => {
                    const id = `${cat.id}_${i}`
                    const checked = !!checklist[id]
                    return (
                      <motion.button key={id} whileTap={{ scale: 0.99 }}
                        onClick={() => toggleCheckItem(id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                        style={{ borderBottom: i < cat.items.length - 1 ? `1px solid ${border}` : 'none' }}>
                        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ background: checked ? '#22c55e' : 'transparent', border: checked ? 'none' : `2px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                          {checked && <div className="text-white text-xs font-bold">✓</div>}
                        </div>
                        <span className="text-sm" style={{ color: checked ? textMuted : textMain, textDecoration: checked ? 'line-through' : 'none' }}>
                          {item}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
