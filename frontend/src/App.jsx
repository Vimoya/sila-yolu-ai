import { useEffect } from 'react'
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser({ displayName: u.displayName || u.email.split('@')[0], email: u.email, uid: u.uid, photoURL: u.photoURL })
    })
    return unsub
  }, [])

  if (!user) return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <LoginPage />
      <Toaster position="top-center" />
    </div>
  )

  const Page = PAGES[activeTab] || HomePage

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', background: isDark ? '#0a0f1e' : '#f8fafc', minHeight: '100svh' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          style={{ minHeight: '100svh' }}
        >
          <Page />
        </motion.div>
      </AnimatePresence>
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: isDark ? '#111827' : '#ffffff',
            color: isDark ? '#f1f5f9' : '#0f172a',
            borderRadius: 16,
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            fontSize: 14,
          },
        }}
      />
    </div>
  )
}
