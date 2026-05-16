import { useState } from 'react'
import { useStore } from '../store/useStore'
import { auth } from '../firebase/config'
import { signOut, updateProfile } from 'firebase/auth'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { IconCheck, IconBell, IconGlobe, IconStar, IconPlus, IconChevron, IconShield, IconMail, IconLock, IconUser } from '../components/Icons'

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(28px) saturate(140%)',
  WebkitBackdropFilter: 'blur(28px) saturate(140%)',
  borderRadius: 22,
}

const inputStyle = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, color: '#F2F4F8', padding: '10px 12px', fontSize: 14,
  width: '100%', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
}

function Tag({ children, color = 'var(--turkis)', style: s }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '5px 9px', borderRadius: 999,
      background: `${color}22`, color,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
      textTransform: 'uppercase', border: `1px solid ${color}33`, ...s,
    }}>{children}</span>
  )
}

function Avatar({ name, size = 80, color = 'var(--turkis)' }) {
  const initials = (name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: 22,
      background: `linear-gradient(135deg, ${color}, rgba(245,181,68,0.3))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#1F1402', fontWeight: 800, fontSize: size * 0.35,
      fontFamily: 'var(--font-display)', boxShadow: `0 8px 24px ${color}44`, flexShrink: 0,
    }}>{initials}</div>
  )
}

const CHECKLIST_GROUPS = [
  {
    id: 'docs', label: 'Dokumente',
    items: [
      { id: 'reisepass', label: 'Reisepass', def: true },
      { id: 'fahrzeugschein', label: 'Fahrzeugschein', def: true },
      { id: 'fuehrerschein', label: 'Führerschein', def: true },
      { id: 'gruene_karte', label: 'Grüne Versicherungskarte', def: true },
      { id: 'auslandskranken', label: 'Auslandskrankenversicherung', def: false },
      { id: 'kinder_docs', label: 'Kinder-Dokumente', def: false },
      { id: 'vollmacht', label: 'Fahrzeugvollmacht', def: false },
    ],
  },
  {
    id: 'maut', label: 'Maut & Vignetten',
    items: [
      { id: 'vignette_at', label: 'Vignette Österreich (15,40€)', def: false },
      { id: 'vignette_hu', label: 'e-Matrica Ungarn (6,50€)', def: false },
      { id: 'maut_rs', label: 'Maut Serbien (~12€)', def: false },
      { id: 'maut_bg', label: 'e-Vignette Bulgarien (10,50€)', def: false },
      { id: 'hgs_tr', label: 'HGS/OGS Transponder Türkei', def: false },
    ],
  },
  {
    id: 'auto', label: 'Auto · Sicherheit',
    items: [
      { id: 'warnweste', label: 'Warnweste', def: true },
      { id: 'warndreieck', label: 'Warndreieck', def: true },
      { id: 'erste_hilfe', label: 'Erste-Hilfe-Set', def: false },
      { id: 'ersatzreifen', label: 'Ersatzreifen / Pannenset', def: false },
      { id: 'feuerloescher', label: 'Feuerlöscher (Pflicht in TR)', def: false },
    ],
  },
  {
    id: 'reise', label: 'Reisegepäck',
    items: [
      { id: 'ladekabel', label: 'Ladekabel / USB-Adapter', def: false },
      { id: 'powerbank', label: 'Powerbank', def: true },
      { id: 'bargeld', label: 'Bargeld Euro + TL', def: false },
      { id: 'hotel_beo', label: 'Unterkunft gebucht', def: false },
      { id: 'wasser', label: 'Wasser & Snacks', def: false },
    ],
  },
]

function ChecklistRow({ id, label, checked, onToggle }) {
  return (
    <button onClick={() => onToggle(id)} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
      borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
        background: checked ? 'var(--turkis)' : 'rgba(255,255,255,0.06)',
        border: checked ? 'none' : '1px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <IconCheck size={13} style={{ color: '#1F1402' }}/>}
      </div>
      <span style={{
        flex: 1, fontSize: 14, color: checked ? 'var(--fg-3)' : 'var(--fg)',
        textDecoration: checked ? 'line-through' : 'none', fontFamily: 'var(--font-body)',
      }}>{label}</span>
    </button>
  )
}

function ProgressRing({ pct }) {
  const r = 44, circ = 2 * Math.PI * r, off = circ * (1 - pct / 100)
  return (
    <svg width={100} height={100}>
      <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}/>
      <circle cx={50} cy={50} r={r} fill="none" stroke="var(--gruen)" strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.5s ease' }}/>
      <text x={50} y={55} textAnchor="middle" fill="var(--gruen)" fontSize="15" fontWeight="800" fontFamily="Space Grotesk">{pct}%</text>
    </svg>
  )
}

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: on ? 'var(--gruen)' : 'rgba(255,255,255,0.12)',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 22 : 3, width: 18, height: 18,
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
      }}/>
    </button>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 20px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#0F1318', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px 24px 0 0', padding: '20px 20px 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>{title}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: 'none', color: 'var(--fg-3)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const ROUTE_LABELS = {
  austria_hungary: { name: 'Balkan-Klassiker', icon: '🗺️' },
  croatia_route:   { name: 'Kroatien Route',   icon: '🏖️' },
  romania_route:   { name: 'Rumänien Route',   icon: '🌄' },
  greece_route:    { name: 'Griechenland',     icon: '☀️' },
}
const FUEL_LABELS = { diesel: 'Diesel', e10: 'Benzin (E10)', e5: 'Super (E5)' }
const LANGUAGES = ['Deutsch', 'Türkçe', 'English']

// ─── Login form (shown when not logged in) ───────────────────────────────────
function LoginForm({ onSuccess }) {
  const [mode, setMode] = useState('login') // login | register | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const { setUser } = useStore()

  async function handleSubmit() {
    if (!email.trim()) return setError('E-Mail eingeben')
    setLoading(true); setError('')
    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email.trim())
        setResetSent(true)
      } else if (mode === 'register') {
        if (!name.trim()) { setError('Name eingeben'); setLoading(false); return }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await updateProfile(cred.user, { displayName: name.trim() })
        setUser({ ...cred.user, displayName: name.trim() })
        onSuccess?.()
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
        setUser(cred.user)
        onSuccess?.()
      }
    } catch (e) {
      const msg = e.code === 'auth/user-not-found' ? 'Kein Konto mit dieser E-Mail'
        : e.code === 'auth/wrong-password' ? 'Falsches Passwort'
        : e.code === 'auth/email-already-in-use' ? 'E-Mail bereits registriert'
        : e.code === 'auth/weak-password' ? 'Passwort zu schwach (min. 6 Zeichen)'
        : e.message
      setError(msg)
    }
    setLoading(false)
  }

  if (resetSent) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>E-Mail gesendet</div>
      <div style={{ color: 'var(--fg-3)', fontSize: 13, marginBottom: 20 }}>Prüfe dein Postfach für den Reset-Link.</div>
      <button onClick={() => { setMode('login'); setResetSent(false) }} style={{ color: 'var(--turkis)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>Zurück zur Anmeldung</button>
    </div>
  )

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
        {[['login','Anmelden'],['register','Registrieren']].map(([m, l]) => (
          <button key={m} onClick={() => { setMode(m); setError('') }} style={{
            flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: mode === m ? 'rgba(245,181,68,0.15)' : 'transparent',
            color: mode === m ? 'var(--turkis)' : 'var(--fg-3)',
            fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-body)',
            outline: mode === m ? '1px solid rgba(245,181,68,0.35)' : 'none',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mode === 'register' && (
          <div style={{ position: 'relative' }}>
            <IconUser size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }}/>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ ...inputStyle, paddingLeft: 36 }}/>
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <IconMail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }}/>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail" style={{ ...inputStyle, paddingLeft: 36 }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
        </div>
        {mode !== 'reset' && (
          <div style={{ position: 'relative' }}>
            <IconLock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }}/>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Passwort" style={{ ...inputStyle, paddingLeft: 36 }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
          </div>
        )}
      </div>

      {error && <div style={{ color: 'var(--orange)', fontSize: 12, marginTop: 8, paddingLeft: 4 }}>{error}</div>}

      <button onClick={handleSubmit} disabled={loading} style={{
        width: '100%', marginTop: 14, padding: '13px 0', borderRadius: 14, border: 'none',
        background: loading ? 'rgba(245,181,68,0.3)' : 'linear-gradient(180deg, #FFCC5C, #D49628)',
        color: loading ? 'rgba(31,20,2,0.4)' : '#1F1402',
        fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-body)',
      }}>
        {loading ? '…' : mode === 'reset' ? 'Reset-Link senden' : mode === 'register' ? 'Konto erstellen' : 'Anmelden'}
      </button>

      {mode === 'login' && (
        <button onClick={() => { setMode('reset'); setError('') }} style={{
          display: 'block', width: '100%', marginTop: 12, textAlign: 'center',
          color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontFamily: 'var(--font-body)',
        }}>Passwort vergessen?</button>
      )}
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, setUser, checklist, toggleCheckItem, routeSettings, setRouteSettings, routeResult } = useStore()
  const [activeTab, setActiveTab] = useState('profil')
  const [editing, setEditing] = useState(false)
  const [notifOn, setNotifOn] = useState(() => localStorage.getItem('notifOn') !== 'false')
  const [communityNotif, setCommunityNotif] = useState(() => localStorage.getItem('communityNotif') !== 'false')
  const [customItems, setCustomItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [addingItem, setAddingItem] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [modal, setModal] = useState(null) // 'language' | 'privacy' | 'name'
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('lang') || 'Deutsch')

  const [editCar, setEditCar] = useState(routeSettings.car || '')
  const [editConsumption, setEditConsumption] = useState(routeSettings.consumption || 8)
  const [editFuel, setEditFuel] = useState(routeSettings.fuel || 'diesel')
  const [editName, setEditName] = useState(user?.displayName || '')
  const [nameLoading, setNameLoading] = useState(false)

  const allItems = CHECKLIST_GROUPS.flatMap(g => g.items).concat(customItems)
  const initChecked = (id) => checklist[id] !== undefined ? checklist[id] : allItems.find(i => i.id === id)?.def || false
  const checkedCount = allItems.filter(i => initChecked(i.id)).length
  const pct = Math.round((checkedCount / allItems.length) * 100)
  const selectedRoute = ROUTE_LABELS[routeSettings.selectedRouteKey] || ROUTE_LABELS.austria_hungary

  function saveEdit() {
    setRouteSettings({ car: editCar, consumption: editConsumption, fuel: editFuel })
    setEditing(false)
  }

  function addCustomItem() {
    if (!newItem.trim()) return
    const id = `custom_${Date.now()}`
    setCustomItems(prev => [...prev, { id, label: newItem.trim(), def: false }])
    toggleCheckItem(id)
    setNewItem('')
    setAddingItem(false)
  }

  async function handleSignOut() {
    try { await signOut(auth) } catch {}
    setUser(null)
  }

  function toggleNotif() {
    const v = !notifOn
    setNotifOn(v)
    localStorage.setItem('notifOn', v)
  }

  function toggleCommunityNotif() {
    const v = !communityNotif
    setCommunityNotif(v)
    localStorage.setItem('communityNotif', v)
  }

  function selectLang(lang) {
    setSelectedLang(lang)
    localStorage.setItem('lang', lang)
    setModal(null)
  }

  async function saveName() {
    if (!editName.trim() || !auth.currentUser) return
    setNameLoading(true)
    try {
      await updateProfile(auth.currentUser, { displayName: editName.trim() })
      setUser({ ...user, displayName: editName.trim() })
    } catch {}
    setNameLoading(false)
    setModal(null)
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ minHeight: '100%', padding: '0 16px', paddingBottom: 110, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(40% 30% at 50% 10%, rgba(245,181,68,0.12), transparent 60%)' }}/>
        <div style={{ position: 'relative', paddingTop: 52, paddingBottom: 24 }}>
          <div style={{ color: 'var(--fg-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Konto · Hesap</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: -0.6 }}>
            Profil & <span style={{ color: 'var(--turkis)' }}>Checkliste</span>
          </div>
        </div>
        <div style={{ ...glass, padding: '24px 20px' }}>
          <LoginForm />
        </div>
      </div>
    )
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100%', padding: '0 16px', paddingBottom: 110, position: 'relative' }}>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `
        radial-gradient(40% 25% at 20% 5%, rgba(245,181,68,0.12), transparent 60%),
        radial-gradient(35% 20% at 80% 25%, rgba(56,229,138,0.10), transparent 60%)
      `}}/>

      {/* Header */}
      <div style={{ position: 'relative', paddingTop: 52, paddingBottom: 18 }}>
        <div style={{ color: 'var(--fg-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Konto · Hesap</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: -0.6 }}>
          Profil & <span style={{ color: 'var(--turkis)' }}>Checkliste</span>
        </div>
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
        {[['profil','Profil'],['checklist','Checkliste']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14,
            background: activeTab === id ? 'rgba(245,181,68,0.15)' : 'transparent',
            color: activeTab === id ? 'var(--turkis)' : 'var(--fg-3)',
            outline: activeTab === id ? '1px solid rgba(245,181,68,0.35)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'profil' && (
        <div>
          {/* Avatar + info */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
            <Avatar name={user?.displayName || 'U'}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.displayName || 'Reisende'}
                </div>
                <button onClick={() => { setEditName(user?.displayName || ''); setModal('name') }} style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '3px 8px', fontSize: 11, color: 'var(--fg-3)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, flexShrink: 0,
                }}>✏️</button>
              </div>
              <div style={{ color: 'var(--fg-3)', fontSize: 13, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Tag color="var(--turkis)">Sıla Yolu</Tag>
                {routeResult && <Tag color="var(--gruen)">Route berechnet</Tag>}
              </div>
            </div>
          </div>

          {/* Travel info card */}
          <div style={{ ...glass, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Fahrzeug & Route</span>
              <button onClick={() => editing ? saveEdit() : setEditing(true)} style={{
                fontSize: 12, color: editing ? 'var(--gruen)' : 'var(--turkis)',
                background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)',
              }}>{editing ? '✓ Speichern' : 'Bearbeiten'}</button>
            </div>
            {editing ? (
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>Fahrzeug</div>
                  <input value={editCar} onChange={e => setEditCar(e.target.value)} placeholder="z.B. VW Passat TDI" style={inputStyle}/>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>Verbrauch (L/100km)</div>
                  <input type="number" value={editConsumption} onChange={e => setEditConsumption(+e.target.value)} min={3} max={25} step={0.5} style={inputStyle}/>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>Kraftstoff</div>
                  <select value={editFuel} onChange={e => setEditFuel(e.target.value)} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }}>
                    <option value="diesel" style={{ background: '#141420' }}>Diesel</option>
                    <option value="e10" style={{ background: '#141420' }}>Benzin (E10)</option>
                    <option value="e5" style={{ background: '#141420' }}>Super (E5)</option>
                  </select>
                </div>
              </div>
            ) : (
              <>
                {[
                  ['Fahrzeug', routeSettings.car || 'Nicht angegeben'],
                  ['Verbrauch', `${routeSettings.consumption} L / 100 km`],
                  ['Kraftstoff', FUEL_LABELS[routeSettings.fuel] || 'Diesel'],
                  ['Personen', `${routeSettings.persons || 4} Personen`],
                  ['Aktive Route', `${selectedRoute.icon} ${selectedRoute.name}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>{k}</span>
                    <span style={{ color: 'var(--fg)', fontSize: 14, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Last routes */}
          {routeResult?.routes && (
            <div style={{ ...glass, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Letzte berechnete Routen</div>
              {routeResult.routes.slice(0, 3).map((r, i) => {
                const info = ROUTE_LABELS[r.key] || {}
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ fontSize: 20 }}>{info.icon || '🗺️'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name || info.name}</div>
                      <div style={{ color: 'var(--fg-3)', fontSize: 11, marginTop: 1 }}>{r.km?.toLocaleString()} km · ~{r.hours}h</div>
                    </div>
                    <span className="sy-pump" style={{ color: 'var(--turkis)', fontSize: 16, flexShrink: 0 }}>{r.total} €</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Settings */}
          <div style={{ ...glass, overflow: 'hidden', marginBottom: 14 }}>
            {/* Notifications */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <IconBell size={16} style={{ color: 'var(--gruen)', width: 20 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Benachrichtigungen</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>Grenzwarnungen & Tanktipps</div>
              </div>
              <Toggle on={notifOn} onToggle={toggleNotif}/>
            </div>
            {/* Community notif */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <IconStar size={16} style={{ color: 'var(--orange)', width: 20 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Community-Meldungen</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>Neue Beiträge auf deiner Route</div>
              </div>
              <Toggle on={communityNotif} onToggle={toggleCommunityNotif}/>
            </div>
            {/* Language */}
            <button onClick={() => setModal('language')} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <IconGlobe size={16} style={{ color: 'var(--e5)', width: 20 }}/>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--fg)', fontFamily: 'var(--font-body)' }}>Sprache</span>
              <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>{selectedLang}</span>
              <IconChevron size={14} style={{ color: 'var(--fg-4)' }}/>
            </button>
            {/* Privacy */}
            <button onClick={() => setModal('privacy')} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <IconShield size={16} style={{ color: 'var(--fg-3)', width: 20 }}/>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--fg)', fontFamily: 'var(--font-body)' }}>Datenschutz</span>
              <IconChevron size={14} style={{ color: 'var(--fg-4)' }}/>
            </button>
            {/* Sign out */}
            {!showSignOutConfirm ? (
              <button onClick={() => setShowSignOutConfirm(true)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}>
                <span style={{ width: 20 }}/>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--orange)', fontFamily: 'var(--font-body)' }}>Abmelden</span>
              </button>
            ) : (
              <div style={{ padding: '14px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--fg-3)' }}>Wirklich abmelden?</span>
                <button onClick={handleSignOut} style={{ padding: '7px 14px', borderRadius: 10, background: 'var(--orange)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Ja</button>
                <button onClick={() => setShowSignOutConfirm(false)} style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--fg)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Nein</button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
            <ProgressRing pct={pct}/>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>
                {checkedCount} / {allItems.length} <span style={{ color: 'var(--fg-3)', fontSize: 16, fontWeight: 600 }}>erledigt</span>
              </div>
              <div style={{ color: 'var(--fg-3)', fontSize: 13, marginTop: 4 }}>
                {allItems.length - checkedCount === 0 ? '✓ Alles bereit für die Fahrt!' : `Noch ${allItems.length - checkedCount} Punkte offen`}
              </div>
              {pct === 100 && <Tag color="var(--gruen)" style={{ marginTop: 8 }}>Reisebereit!</Tag>}
            </div>
          </div>

          {CHECKLIST_GROUPS.map(group => (
            <div key={group.id} style={{ ...glass, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--fg-2)' }}>{group.label}</div>
              {group.items.map(item => (
                <ChecklistRow key={item.id} id={item.id} label={item.label} checked={initChecked(item.id)} onToggle={toggleCheckItem}/>
              ))}
            </div>
          ))}

          {customItems.length > 0 && (
            <div style={{ ...glass, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--fg-2)' }}>Eigene Punkte</div>
              {customItems.map(item => (
                <ChecklistRow key={item.id} id={item.id} label={item.label} checked={initChecked(item.id)} onToggle={toggleCheckItem}/>
              ))}
            </div>
          )}

          {addingItem ? (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input autoFocus value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCustomItem(); if (e.key === 'Escape') setAddingItem(false) }}
                placeholder="Neuer Punkt..." style={{ ...inputStyle, flex: 1 }}/>
              <button onClick={addCustomItem} style={{ padding: '10px 16px', borderRadius: 12, background: 'var(--turkis)', border: 'none', color: '#1F1402', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>+</button>
              <button onClick={() => setAddingItem(false)} style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--fg-3)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setAddingItem(true)} style={{
              width: '100%', padding: '14px 0', borderRadius: 18,
              background: 'none', border: '2px dashed rgba(255,255,255,0.10)',
              color: 'var(--fg-3)', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-body)',
            }}>
              <IconPlus size={16}/> Eigenen Punkt hinzufügen
            </button>
          )}
        </div>
      )}

      {/* ── Modals ── */}

      {modal === 'name' && (
        <Modal title="Name ändern" onClose={() => setModal(null)}>
          <input value={editName} onChange={e => setEditName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            placeholder="Dein Name" style={{ ...inputStyle, marginBottom: 12 }}/>
          <button onClick={saveName} disabled={nameLoading || !editName.trim()} style={{
            width: '100%', padding: '13px 0', borderRadius: 14, border: 'none',
            background: !editName.trim() ? 'rgba(245,181,68,0.3)' : 'linear-gradient(180deg, #FFCC5C, #D49628)',
            color: !editName.trim() ? 'rgba(31,20,2,0.4)' : '#1F1402',
            fontWeight: 800, fontSize: 14, cursor: !editName.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)',
          }}>{nameLoading ? 'Wird gespeichert…' : 'Speichern'}</button>
        </Modal>
      )}

      {modal === 'language' && (
        <Modal title="Sprache wählen" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LANGUAGES.map(lang => (
              <button key={lang} onClick={() => selectLang(lang)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                background: selectedLang === lang ? 'rgba(245,181,68,0.12)' : 'rgba(255,255,255,0.04)',
                border: selectedLang === lang ? '1px solid rgba(245,181,68,0.35)' : '1px solid rgba(255,255,255,0.08)',
                color: selectedLang === lang ? 'var(--turkis)' : 'var(--fg)',
                fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', textAlign: 'left',
              }}>
                <span>{lang === 'Deutsch' ? '🇩🇪 Deutsch' : lang === 'Türkçe' ? '🇹🇷 Türkçe' : '🇬🇧 English'}</span>
                {selectedLang === lang && <IconCheck size={16} style={{ color: 'var(--turkis)' }}/>}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, color: 'var(--fg-3)', fontSize: 11, textAlign: 'center' }}>
            Mehrsprachigkeit folgt in einem Update · Çok dilli destek yakında
          </div>
        </Modal>
      )}

      {modal === 'privacy' && (
        <Modal title="Datenschutz" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['Gespeicherte Daten', 'Route-Einstellungen, Checkliste und letzte Tanksuche werden lokal auf deinem Gerät gespeichert (localStorage).'],
              ['Firebase Auth', 'Deine E-Mail-Adresse wird über Firebase Authentication gespeichert. Passwörter werden nie im Klartext gespeichert.'],
              ['Community-Posts', 'Beiträge im Community-Tab sind öffentlich sichtbar und werden mit deinem Anzeigenamen gespeichert.'],
              ['Tankerdaten', 'Tankstellen-Anfragen gehen an die Tankerkönig-API (Deutschland) und werden nicht mit deinem Konto verknüpft.'],
              ['Konto löschen', 'Um dein Konto und alle Daten zu löschen, wende dich an support@silayolu.app'],
            ].map(([title, text]) => (
              <div key={title}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.6 }}>{text}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
