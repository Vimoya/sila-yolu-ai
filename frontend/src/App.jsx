import { useEffect, Component, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { onAuthStateChanged } from 'firebase/auth'
import { Toaster } from 'react-hot-toast'
import { auth } from './firebase/config'
import { useStore } from './store/useStore'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import RoutePage from './pages/RoutePage'
import BorderPage from './pages/BorderPage'
import FuelPage from './pages/FuelPage'
import AIChatPage from './pages/AIChatPage'
import CommunityPage from './pages/CommunityPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 32, color: '#f0f0f0', fontSize: 14 }}>
        <div style={{ marginBottom: 8, opacity: 0.5 }}>Fehler beim Laden</div>
        <div style={{ opacity: 0.4, fontSize: 12 }}>{this.state.error.message}</div>
        <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: '#f0f0f0', cursor: 'pointer' }}>Neu laden</button>
      </div>
    )
    return this.props.children
  }
}

const PAGES = {
  home: HomePage,
  route: RoutePage,
  border: BorderPage,
  fuel: FuelPage,
  ai: AIChatPage,
  community: CommunityPage,
  profile: ProfilePage,
}

export default function App() {
  const { isDark, activeTab, user, setUser } = useStore()
  const [showLanding, setShowLanding] = useState(() => {
    const v = localStorage.getItem('sila_seen_landing')
    return v !== 'v2' && v !== '1'
  })
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser({ displayName: u.displayName || u.email.split('@')[0], email: u.email, uid: u.uid, photoURL: u.photoURL })
      setAuthReady(true)
    })
    return unsub
  }, [])

  // Always show landing first if not seen yet (regardless of auth state)
  if (showLanding) return (
    <div className="app-shell">
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        <LandingPage onStart={() => { localStorage.setItem('sila_seen_landing', 'v2'); setShowLanding(false) }} />
      </div>
      <Toaster position="top-center" />
    </div>
  )

  // Wait for Firebase to resolve auth before showing anything
  if (!authReady) return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.5)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!user) return (
    <div className="app-shell">
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        <LoginPage />
      </div>
      <Toaster position="top-center" />
    </div>
  )

  const Page = PAGES[activeTab] || HomePage
  const isChatPage = activeTab === 'ai' || activeTab === 'community'
  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          style={isChatPage
            ? { flex: 1, minHeight: 0, overflow: 'clip', display: 'flex', flexDirection: 'column' }
            : { flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'clip', position: 'relative' }}
        >
          <ErrorBoundary key={activeTab}><Page /></ErrorBoundary>
        </motion.div>
      </AnimatePresence>
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: isDark ? '#1a1a1a' : '#ffffff',
            color: isDark ? '#f5f5f5' : '#0f172a',
            borderRadius: 16,
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            fontSize: 14,
          },
        }}
      />
    </div>
  )
}
