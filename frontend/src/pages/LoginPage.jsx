import { useState } from 'react'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { useStore } from '../store/useStore'
import { AnimatedRouteMini } from '../components/RouteAnimation'
import { IconMail, IconLock, IconUser, IconArrow, IconGoogle, IconCheck } from '../components/Icons'

function Logo() {
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 14,
      background: 'linear-gradient(135deg, #FFCC5C, #D49628 90%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(245,181,68,0.4)', flexShrink: 0,
    }}>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#04060A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19c4-1 4-7 8-7s4 6 8 5"/>
        <circle cx="4" cy="19" r="1.5" fill="#04060A"/>
        <circle cx="20" cy="17" r="1.5" fill="#04060A"/>
      </svg>
    </div>
  )
}

function Field({ icon, label, type = 'text', value, onChange, placeholder, trailing, onFocus, onBlur, focused, onKeyDown }) {
  return (
    <div style={{
      background: focused ? 'rgba(245,181,68,0.06)' : 'rgba(255,255,255,0.04)',
      border: focused ? '1px solid rgba(245,181,68,0.45)' : '1px solid var(--glass-border)',
      borderRadius: 16, padding: '12px 16px',
      boxShadow: focused ? '0 0 0 4px rgba(245,181,68,0.08)' : 'none',
      transition: 'all 0.2s',
    }}>
      <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--fg-3)', flexShrink: 0 }}>{icon}</span>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--fg)', fontSize: 15, fontWeight: 500,
            fontFamily: 'var(--font-body)',
          }}
        />
        {trailing}
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

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    setError(''); setSuccess(''); setLoading(true)
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

  const btnLabel = mode === 'login' ? 'Anmelden' : mode === 'register' ? 'Konto erstellen' : 'Reset senden'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 20px 40px',
      position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-body)',
    }}>
      {/* Aurora */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(45% 30% at 20% 12%, rgba(245,181,68,0.20), transparent 70%),
          radial-gradient(40% 28% at 90% 24%, rgba(77,168,255,0.16), transparent 70%)
        `,
      }}/>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>

        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Logo/>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: -0.3, lineHeight: 1 }}>
              Sıla Yolu <span style={{ color: 'var(--turkis)' }}>Pro</span>
            </div>
            <div style={{ color: 'var(--fg-3)', fontSize: 13, marginTop: 3 }}>
              {mode === 'reset' ? 'Passwort zurücksetzen' : mode === 'login' ? 'Hoş geldin. Plane deine Reise.' : 'Konto erstellen.'}
            </div>
          </div>
        </div>

        {/* Route mini animation */}
        <div style={{ marginBottom: 22, padding: '14px 8px 8px', borderRadius: 18, background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)' }}>
          <AnimatedRouteMini/>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
          backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
          borderRadius: 26, padding: 20,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}>
          {/* Mode tabs */}
          {mode !== 'reset' && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 18, padding: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
              {[['login','Anmelden'],['register','Registrieren']].map(([id, label]) => (
                <button key={id} onClick={() => { setMode(id); setError(''); setSuccess('') }} style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  background: mode === id ? 'rgba(245,181,68,0.15)' : 'transparent',
                  color: mode === id ? 'var(--turkis)' : 'var(--fg-3)',
                  outline: mode === id ? '1px solid rgba(245,181,68,0.35)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}>{label}</button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field
              icon={<IconMail size={16}/>} label="E-Mail" type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="deine@email.de"
              focused={focusedField === 'email'}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />

            {mode !== 'reset' && (
              <Field
                icon={<IconLock size={16}/>} label="Passwort"
                type={showPw ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                focused={focusedField === 'password'}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                trailing={
                  <button onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 12, fontWeight: 600, padding: 0, fontFamily: 'var(--font-body)' }}>
                    {showPw ? 'Verbergen' : 'Anzeigen'}
                  </button>
                }
              />
            )}

            {error && (
              <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,60,60,0.08)', color: 'rgba(255,120,120,0.9)', border: '1px solid rgba(255,60,60,0.15)' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 12, background: 'rgba(56,229,138,0.08)', color: 'rgba(80,220,100,0.9)', border: '1px solid rgba(56,229,138,0.2)' }}>
                {success}
              </div>
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right' }}>
                <button onClick={() => { setMode('reset'); setError('') }} style={{ fontSize: 13, color: 'var(--turkis)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  Passwort vergessen?
                </button>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: '15px 0', borderRadius: 16, border: 'none',
              background: loading ? 'rgba(245,181,68,0.4)' : 'linear-gradient(180deg, #FFCC5C, #D49628)',
              color: '#1F1402', fontWeight: 700, fontSize: 15,
              fontFamily: 'var(--font-body)', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 10px 30px rgba(245,181,68,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
              marginTop: 4,
            }}>
              {loading
                ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(31,20,2,0.3)', borderTopColor: '#1F1402', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}/> Bitte warten...</>
                : <>{btnLabel} <IconArrow size={16}/></>
              }
            </button>

            {mode === 'reset' && (
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setMode('login')} style={{ fontSize: 13, color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  ← Zurück zum Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
          <span style={{ color: 'var(--fg-4)', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>ODER · YA DA</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
        </div>

        {/* Google */}
        <button style={{
          width: '100%', padding: '14px 0', borderRadius: 16, cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
          color: 'var(--fg)', fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          backdropFilter: 'blur(20px)',
        }}>
          <IconGoogle size={18}/> Mit Google fortfahren
        </button>

        {/* Guest */}
        <div style={{ textAlign: 'center', marginTop: 24, paddingBottom: 20 }}>
          <p style={{ color: 'var(--fg-4)', fontSize: 12, margin: '0 0 6px' }}>Ohne Konto ausprobieren</p>
          <button
            onClick={() => useStore.getState().setUser({ displayName: 'Gast', email: '', isGuest: true })}
            style={{ color: 'var(--fg-2)', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Als Gast fortfahren →
          </button>
        </div>

      </div>
    </div>
  )
}
