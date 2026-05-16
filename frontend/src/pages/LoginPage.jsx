import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, ChevronRight } from 'lucide-react'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { useStore } from '../store/useStore'

const gold = '#F5B544'
const goldGrad = 'linear-gradient(180deg, #FFCC5C, #D49628)'

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 14,
  color: '#f5f5f5',
  padding: '14px 16px',
  fontSize: 15,
  width: '100%',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

function Logo() {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 18,
      background: goldGrad,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(245,181,68,0.4)',
    }}>
      <svg width={30} height={30} viewBox="0 0 24 24" fill="none"
        stroke="#04060A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19c4-1 4-7 8-7s4 6 8 5" />
        <circle cx="4" cy="19" r="1.5" fill="#04060A" />
        <circle cx="20" cy="17" r="1.5" fill="#04060A" />
      </svg>
    </div>
  )
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
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#04060A', position: 'relative', overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Aurora */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(40% 40% at 50% 0%, rgba(245,181,68,0.20), transparent 70%),
          radial-gradient(30% 30% at 80% 80%, rgba(77,168,255,0.10), transparent 70%),
          radial-gradient(25% 25% at 10% 60%, rgba(255,138,61,0.07), transparent 70%)
        `,
        filter: 'blur(20px)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, padding: '0 20px' }}>

        {/* Logo + title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <Logo />
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: -0.5, marginTop: 14 }}>
            Sıla Yolu <span style={{ color: gold }}>Pro</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>
            {mode === 'reset' ? 'Passwort zurücksetzen' : mode === 'login' ? 'Hoş geldin. Plane deine Reise.' : 'Konto erstellen.'}
          </div>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(28px) saturate(140%)',
            WebkitBackdropFilter: 'blur(28px) saturate(140%)',
            borderRadius: 28, padding: 22,
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}>

          {/* Mode tabs */}
          {mode !== 'reset' && (
            <div style={{
              display: 'flex', gap: 4, marginBottom: 20, padding: 4,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
            }}>
              {[['login', 'Anmelden'], ['register', 'Registrieren']].map(([id, label]) => (
                <button key={id} onClick={() => { setMode(id); setError(''); setSuccess('') }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    background: mode === id ? 'rgba(245,181,68,0.15)' : 'transparent',
                    color: mode === id ? gold : 'rgba(255,255,255,0.35)',
                    outline: mode === id ? `1px solid rgba(245,181,68,0.35)` : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="E-Mail Adresse"
                style={{ ...inputStyle, paddingLeft: 42 }}
                onFocus={e => e.target.style.borderColor = 'rgba(245,181,68,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Password */}
            <AnimatePresence>
              {mode !== 'reset' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      placeholder="Passwort"
                      style={{ ...inputStyle, paddingLeft: 42, paddingRight: 42 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,181,68,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showPw
                        ? <EyeOff size={15} style={{ color: 'rgba(255,255,255,0.3)' }} />
                        : <Eye size={15} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 13, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,60,60,0.08)', color: 'rgba(255,120,120,0.9)', border: '1px solid rgba(255,60,60,0.15)' }}>
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 13, padding: '10px 14px', borderRadius: 12, background: 'rgba(56,229,138,0.08)', color: 'rgba(80,220,100,0.9)', border: '1px solid rgba(56,229,138,0.2)' }}>
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 999, border: 'none',
                background: loading ? 'rgba(245,181,68,0.4)' : goldGrad,
                color: '#1F1402', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 10px 30px rgba(245,181,68,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
                marginTop: 4,
              }}>
              {loading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Bitte warten...</>
                : <>{mode === 'login' ? 'Anmelden' : mode === 'register' ? 'Konto erstellen' : 'Reset senden'} <ChevronRight size={16} /></>}
            </motion.button>

            {/* Forgot / Back */}
            <div style={{ textAlign: 'center' }}>
              {mode === 'login' && (
                <button onClick={() => { setMode('reset'); setError('') }}
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Passwort vergessen?
                </button>
              )}
              {mode === 'reset' && (
                <button onClick={() => setMode('login')}
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ← Zurück zum Login
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>oder</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Google */}
        <motion.button whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 999, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#f5f5f5', fontWeight: 600, fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            backdropFilter: 'blur(20px)',
          }}>
          <svg width={18} height={18} viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Mit Google anmelden
        </motion.button>

        {/* Guest */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', marginTop: 20, paddingBottom: 20 }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: '0 0 6px' }}>Ohne Konto ausprobieren</p>
          <button style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            onClick={() => useStore.getState().setUser({ displayName: 'Gast', email: '', isGuest: true })}>
            Als Gast fortfahren →
          </button>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
