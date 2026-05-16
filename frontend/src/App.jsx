import { useEffect, Component, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { Toaster } from 'react-hot-toast'
import { auth } from './firebase/config'
import { useStore } from './store/useStore'
import { IconMap, IconRoute, IconFuel, IconChat, IconUser } from './components/Icons'
import HomePage from './pages/HomePage'
import RoutePage from './pages/RoutePage'
import FuelPage from './pages/FuelPage'
import CommunityPage from './pages/CommunityPage'
import ProfilePage from './pages/ProfilePage'
import AIChatPage from './pages/AIChatPage'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 32, color: '#F2F4F8', fontSize: 14 }}>
        <div style={{ marginBottom: 8, color: 'var(--fg-3)' }}>Fehler beim Laden</div>
        <div style={{ opacity: 0.4, fontSize: 12 }}>{this.state.error.message}</div>
        <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: '8px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, color: '#F2F4F8', cursor: 'pointer' }}>Neu laden</button>
      </div>
    )
    return this.props.children
  }
}

const PAGES = {
  dashboard: HomePage,
  route: RoutePage,
  fuel: FuelPage,
  community: CommunityPage,
  profile: ProfilePage,
  ai: AIChatPage,
}

const TABS = [
  { id: 'dashboard', label: 'Start',     Icon: IconMap },
  { id: 'route',     label: 'Route',     Icon: IconRoute },
  { id: 'fuel',      label: 'Tanken',    Icon: IconFuel },
  { id: 'community', label: 'Community', Icon: IconChat },
  { id: 'profile',   label: 'Profil',    Icon: IconUser },
]

function BottomNav() {
  const { activeTab, setActiveTab } = useStore()
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
      padding: '0 12px 12px',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    }}>
      <div style={{
        borderRadius: 28,
        background: 'rgba(10,12,16,0.88)',
        backdropFilter: 'blur(30px) saturate(160%)',
        WebkitBackdropFilter: 'blur(30px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.4)',
        padding: '10px 8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 2,
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const on = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '6px 0', borderRadius: 18, border: 'none', cursor: 'pointer',
                background: on ? 'var(--turkis-soft)' : 'transparent',
                color: on ? 'var(--turkis)' : 'var(--fg-3)',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={22}/>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.1 }}>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const BG = {
  background: `
    radial-gradient(60% 40% at 12% 8%, rgba(245,181,68,0.10), transparent 60%),
    radial-gradient(50% 35% at 90% 90%, rgba(77,168,255,0.10), transparent 60%),
    radial-gradient(35% 30% at 80% 12%, rgba(255,138,61,0.06), transparent 70%),
    linear-gradient(180deg, #05070B 0%, #060810 60%, #04060A 100%)
  `,
}

const toastStyle = {
  style: {
    background: '#11141A',
    color: '#F2F4F8',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: 14,
    fontFamily: 'DM Sans, sans-serif',
  },
}

export default function App() {
  const { activeTab, user, setUser } = useStore()
  const [showLanding, setShowLanding] = useState(true)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser({ displayName: u.displayName || u.email.split('@')[0], email: u.email, uid: u.uid, photoURL: u.photoURL })
      else setUser(null)
      setAuthReady(true)
    })
    return unsub
  }, [])

  if (showLanding) return (
    <div className="app-shell" style={BG}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        <LandingPage onStart={() => setShowLanding(false)} />
      </div>
      <Toaster position="top-center" toastOptions={toastStyle}/>
    </div>
  )

  if (!authReady) return (
    <div className="app-shell" style={{ ...BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#F5B544', animation: 'spin 0.8s linear infinite' }}/>
    </div>
  )

  if (!user) return (
    <div className="app-shell" style={BG}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        <LoginPage />
      </div>
      <Toaster position="top-center" toastOptions={toastStyle}/>
    </div>
  )

  const Page = PAGES[activeTab] || HomePage
  return (
    <div className="app-shell" style={BG}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 100 }}>
        <ErrorBoundary key={activeTab}><Page /></ErrorBoundary>
      </div>
      <BottomNav/>
      <Toaster position="top-center" toastOptions={toastStyle}/>
    </div>
  )
}
