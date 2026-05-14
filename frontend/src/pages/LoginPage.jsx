import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { useStore } from '../store/useStore'

export default function LoginPage() {
  const { isDark } = useStore()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const inputStyle = {
    background: isDark ? '#1e293b' : '#f8fafc',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: 16,
    color: isDark ? '#f1f5f9' : '#0f172a',
    padding: '14px 16px',
    fontSize: 15,
    width: '100%',
    outline: 'none',
  }

  async function handleSubmit() {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await sendPasswordResetEmail(auth, email)
        setSuccess('Reset-E-Mail gesendet!')
      }
    } catch (e) {
      setError(getErrorMsg(e.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isDark ? '#0a0f1e' : '#f8fafc' }}>
      {/* Hero */}
      <div className="relative overflow-hidden flex flex-col items-center justify-center pt-16 pb-8 px-6"
        style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #1a1035 100%)' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #dc2626, #1d4ed8)' }}>
          <Zap size={32} color="white" fill="white" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-white mb-2">
          Sıla Yolu <span style={{ color: '#f59e0b' }}>AI</span>
        </motion.h1>
        <p className="text-white/50 text-sm text-center">Dein smarter Reiseassistent für die Fahrt in die Türkei.</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pt-8 max-w-sm mx-auto w-full">
        {/* Mode Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl" style={{ background: isDark ? '#111827' : '#f1f5f9' }}>
          {[['login', 'Anmelden'], ['register', 'Registrieren']].map(([id, label]) => (
            <button key={id} onClick={() => setMode(id)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: mode === id ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'transparent', color: mode === id ? 'white' : isDark ? '#64748b' : '#94a3b8' }}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="E-Mail Adresse" style={{ ...inputStyle, paddingLeft: 44 }} />
          </div>

          {mode !== 'reset' && (
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Passwort" style={{ ...inputStyle, paddingLeft: 44, paddingRight: 44 }} />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2">
                {showPw ? <EyeOff size={16} style={{ color: isDark ? '#64748b' : '#94a3b8' }} /> : <Eye size={16} style={{ color: isDark ? '#64748b' : '#94a3b8' }} />}
              </button>
            </div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.1)', color: '#ef4444', border: '1px solid rgba(220,38,38,0.2)' }}>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              {success}
            </motion.div>
          )}

          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base mt-1"
            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 4px 20px rgba(220,38,38,0.35)', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : mode === 'login' ? 'Anmelden' : mode === 'register' ? 'Registrieren' : 'Reset senden'}
          </motion.button>

          {mode === 'login' && (
            <button onClick={() => setMode('reset')} className="text-center text-sm"
              style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
              Passwort vergessen?
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => setMode('login')} className="text-center text-sm"
              style={{ color: isDark ? '#64748b' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Zurück zum Login
            </button>
          )}
        </div>

        {/* Guest Mode */}
        <div className="mt-6 text-center">
          <p className="text-xs mb-2" style={{ color: isDark ? '#475569' : '#94a3b8' }}>Oder ohne Account weitermachen</p>
          <button className="text-sm font-medium" style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => useStore.getState().setUser({ displayName: 'Gast', email: '', isGuest: true })}>
            Als Gast fortfahren →
          </button>
        </div>
      </div>
    </div>
  )
}

function getErrorMsg(code) {
  const msgs = {
    'auth/user-not-found': 'Kein Konto mit dieser E-Mail gefunden.',
    'auth/wrong-password': 'Falsches Passwort.',
    'auth/email-already-in-use': 'Diese E-Mail ist bereits registriert.',
    'auth/weak-password': 'Passwort zu schwach (min. 6 Zeichen).',
    'auth/invalid-email': 'Ungültige E-Mail-Adresse.',
    'auth/too-many-requests': 'Zu viele Versuche. Bitte warte kurz.',
    'auth/network-request-failed': 'Netzwerkfehler. Internet prüfen.',
  }
  return msgs[code] || 'Ein Fehler ist aufgetreten.'
}
