import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { useStore } from '../store/useStore'
import SilaLogo from '../components/SilaLogo'

const glass = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
}

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 14,
  color: '#f5f5f5',
  padding: '14px 16px',
  fontSize: 15,
  width: '100%',
  outline: 'none',
  backdropFilter: 'blur(8px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
}

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #060610 0%, #0a0a18 50%, #060610 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute pointer-events-none" style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(100,60,255,0.08) 0%, transparent 65%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-5%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(60,120,255,0.06) 0%, transparent 65%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '20%', left: '-10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,80,120,0.04) 0%, transparent 65%)' }} />

      <div className="relative z-10 w-full max-w-sm px-5">

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8">
          <div className="mb-4 p-3 rounded-2xl" style={glass}>
            <SilaLogo size={40} />
          </div>
          <div className="text-2xl font-black" style={{ color: '#f5f5f5' }}>Sıla Yolu <span style={{ color: 'rgba(255,255,255,0.4)' }}>AI</span></div>
          <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Dein smarter Reiseassistent</div>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl p-5" style={glass}>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[['login', 'Anmelden'], ['register', 'Registrieren']].map(([id, label]) => (
              <motion.button key={id} onClick={() => { setMode(id); setError(''); setSuccess('') }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: mode === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: mode === id ? '#f5f5f5' : 'rgba(255,255,255,0.35)',
                  border: mode === id ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                  boxShadow: mode === id ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                }}>
                {label}
              </motion.button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="E-Mail Adresse"
                style={{ ...inputStyle, paddingLeft: 44 }} />
            </div>

            {/* Password */}
            <AnimatePresence>
              {mode !== 'reset' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative overflow-hidden">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Passwort"
                    style={{ ...inputStyle, paddingLeft: 44, paddingRight: 44 }} />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2">
                    {showPw
                      ? <EyeOff size={15} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      : <Eye size={15} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,60,60,0.08)', color: 'rgba(255,120,120,0.9)', border: '1px solid rgba(255,60,60,0.15)' }}>
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(60,255,120,0.08)', color: 'rgba(80,220,100,0.9)', border: '1px solid rgba(60,255,120,0.15)' }}>
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mt-1"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#f5f5f5',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                opacity: loading ? 0.6 : 1,
              }}>
              {loading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Bitte warten...</>
                : mode === 'login' ? 'Anmelden' : mode === 'register' ? 'Konto erstellen' : 'Reset senden'}
            </motion.button>

            {/* Links */}
            <div className="text-center">
              {mode === 'login' && (
                <button onClick={() => { setMode('reset'); setError('') }}
                  className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Passwort vergessen?
                </button>
              )}
              {mode === 'reset' && (
                <button onClick={() => setMode('login')}
                  className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ← Zurück zum Login
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Guest */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-center mt-5">
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>Ohne Konto ausprobieren</p>
          <button className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => useStore.getState().setUser({ displayName: 'Gast', email: '', isGuest: true })}>
            Als Gast fortfahren →
          </button>
        </motion.div>
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
    'auth/invalid-credential': 'E-Mail oder Passwort falsch.',
  }
  return msgs[code] || 'Ein Fehler ist aufgetreten.'
}
