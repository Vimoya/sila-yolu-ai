import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

const API = import.meta.env.VITE_API_BASE_URL || ''

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(28px) saturate(140%)',
  WebkitBackdropFilter: 'blur(28px) saturate(140%)',
  borderRadius: 22,
}

const STATUS_COLOR = { green: '#38E58A', yellow: '#F5B544', red: '#E854A8' }
const STATUS_LABEL = { green: 'Wenig Andrang', yellow: 'Moderate Wartezeit', red: 'Stark belegt' }
const STATUS_TIME  = { green: '< 30 Min', yellow: '30–90 Min', red: '> 90 Min' }

const BORDERS = [
  { id: 'kapikule',    name: 'Kapıkule',        route: 'Balkan-Klassiker', flags: '🇹🇷 / 🇧🇬' },
  { id: 'hamzabeyli', name: 'Hamzabeyli',       route: 'Balkan-Klassiker', flags: '🇹🇷 / 🇧🇬' },
  { id: 'ipsala',     name: 'İpsala',           route: 'Griechenland',     flags: '🇹🇷 / 🇬🇷' },
  { id: 'horgos',     name: 'Horgoš',           route: 'Balkan-Klassiker', flags: '🇷🇸 / 🇭🇺' },
  { id: 'kalotina',   name: 'Kalotina',         route: 'Balkan-Klassiker', flags: '🇧🇬 / 🇷🇸' },
  { id: 'gradina',    name: 'Gradinа / Lesovo', route: 'Balkan-Klassiker', flags: '🇧🇬 / 🇹🇷' },
  { id: 'ruse',       name: 'Ruse / Giurgiu',   route: 'Rumänien',         flags: '🇧🇬 / 🇷🇴' },
  { id: 'promachonas',name: 'Promachonas',      route: 'Griechenland',     flags: '🇧🇬 / 🇬🇷' },
  { id: 'tabanovce',  name: 'Tabanovce',        route: 'Griechenland',     flags: '🇲🇰 / 🇷🇸' },
  { id: 'bregana',    name: 'Bregana',          route: 'Kroatien',         flags: '🇸🇮 / 🇭🇷' },
  { id: 'karawanken', name: 'Karawankentunnel', route: 'Kroatien',         flags: '🇦🇹 / 🇸🇮' },
]

// Local state — in real app this would come from backend
const DEFAULT_STATUS = {
  kapikule: 'yellow', hamzabeyli: 'green', ipsala: 'red',
  horgos: 'yellow', kalotina: 'green', gradina: 'green',
  ruse: 'yellow', promachonas: 'green', tabanovce: 'green',
  bregana: 'green', karawanken: 'green',
}
const DEFAULT_REPORTS = {
  kapikule: 'Ca. 45 Min Wartezeit, PKW-Spur läuft normal',
  hamzabeyli: 'Sehr wenig los, schnell durchgekommen',
  ipsala: 'Starkes Aufkommen! 2–3 Stunden Wartezeit',
  horgos: 'Normal, ca. 30 Min',
  kalotina: 'Wenig Betrieb heute Morgen',
  gradina: 'Flüssig, kaum Wartezeit',
  ruse: 'Brücke — ca. 40 Min Wartezeit',
  promachonas: 'Flüssig durchgekommen',
  tabanovce: 'Wenig Verkehr',
  bregana: 'Normale Wartezeit',
  karawanken: 'Tunnel offen, kein Stau',
}

function StatusDot({ status, size = 8 }) {
  const c = STATUS_COLOR[status] || '#888'
  return <span style={{ width: size, height: size, borderRadius: '50%', background: c, boxShadow: `0 0 ${size}px ${c}`, display: 'inline-block', flexShrink: 0 }}/>
}

function BorderCard({ border, onReport }) {
  const c = STATUS_COLOR[border.status] || '#888'
  return (
    <div style={{
      ...glass,
      border: `1px solid ${c}22`,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <StatusDot status={border.status}/>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{border.name}</span>
            <span style={{ fontSize: 13 }}>{border.flags}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: c, letterSpacing: 0.4, textTransform: 'uppercase',
              padding: '3px 8px', borderRadius: 999, background: `${c}18`, border: `1px solid ${c}33` }}>
              {STATUS_LABEL[border.status]}
            </span>
            <span style={{ color: 'var(--fg-3)', fontSize: 11 }}>{STATUS_TIME[border.status]}</span>
            <span style={{ color: 'var(--fg-3)', fontSize: 11 }}>· {border.route}</span>
          </div>
        </div>
        <button onClick={() => onReport(border)} style={{
          padding: '7px 14px', borderRadius: 12, flexShrink: 0,
          background: 'rgba(245,181,68,0.12)', border: '1px solid rgba(245,181,68,0.3)',
          color: 'var(--turkis)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}>+ Melden</button>
      </div>
      {border.lastReport && (
        <div style={{
          padding: '8px 12px', borderRadius: 12,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          color: 'var(--fg-2)', fontSize: 13, lineHeight: 1.5,
        }}>
          "{border.lastReport}"
        </div>
      )}
      {border.reportCount > 0 && (
        <div style={{ marginTop: 8, color: 'var(--fg-3)', fontSize: 11 }}>
          {border.reportCount} Community-Meldung{border.reportCount !== 1 ? 'en' : ''} heute
        </div>
      )}
    </div>
  )
}

const STATUS_OPTS = [
  { value: 'green',  label: '🟢 Wenig Andrang',       sub: '< 30 Min' },
  { value: 'yellow', label: '🟡 Mittlere Wartezeit',   sub: '30–90 Min' },
  { value: 'red',    label: '🔴 Stark belegt',          sub: '> 90 Min' },
]

export default function BorderPage() {
  const { user } = useStore()
  const [borders, setBorders] = useState(
    BORDERS.map(b => ({ ...b, status: DEFAULT_STATUS[b.id] || 'green', lastReport: DEFAULT_REPORTS[b.id] || '', reportCount: 0 }))
  )
  const [reportModal, setReportModal] = useState(null)
  const [reportText, setReportText] = useState('')
  const [reportStatus, setReportStatus] = useState('yellow')
  const [sending, setSending] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [filter, setFilter] = useState('Alle')

  // Load community reports for borders
  useEffect(() => {
    async function loadReports() {
      try {
        const r = await fetch(`${API}/api/community/posts?room=Grenze`)
        const d = await r.json()
        if (!d?.posts?.length) return
        // Count recent posts per border name
        const counts = {}
        const latestText = {}
        const latestStatus = {}
        for (const post of d.posts) {
          const text = (post.text || '').toLowerCase()
          for (const b of BORDERS) {
            if (text.includes(b.name.toLowerCase()) || text.includes(b.id)) {
              counts[b.id] = (counts[b.id] || 0) + 1
              if (!latestText[b.id]) latestText[b.id] = post.text
              // Detect status from keywords
              if (!latestStatus[b.id]) {
                if (text.includes('stau') || text.includes('lang') || text.includes('2h') || text.includes('3h')) latestStatus[b.id] = 'red'
                else if (text.includes('warte') || text.includes('1h')) latestStatus[b.id] = 'yellow'
                else if (text.includes('frei') || text.includes('schnell') || text.includes('wenig')) latestStatus[b.id] = 'green'
              }
            }
          }
        }
        setBorders(prev => prev.map(b => ({
          ...b,
          reportCount: counts[b.id] || b.reportCount,
          lastReport: latestText[b.id] || b.lastReport,
          status: latestStatus[b.id] || b.status,
        })))
        setLastUpdate(Date.now())
      } catch {}
    }
    loadReports()
  }, [])

  async function submitReport() {
    if (!reportText.trim()) return
    setSending(true)
    try {
      await fetch(`${API}/api/community/posts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: user?.displayName || user?.email?.split('@')[0] || 'Reisender',
          text: `${reportModal.name}: ${reportText.trim()}`,
          room: 'Grenze',
          tag: 'Grenze',
          avatarColor: '#FF8A3D',
          country: reportModal.flags,
        }),
      })
      setBorders(prev => prev.map(b =>
        b.id === reportModal.id
          ? { ...b, status: reportStatus, lastReport: reportText.trim(), reportCount: (b.reportCount || 0) + 1 }
          : b
      ))
      setReportModal(null)
      setReportText('')
    } catch {}
    setSending(false)
  }

  const routes = ['Alle', ...new Set(BORDERS.map(b => b.route))]
  const filtered = filter === 'Alle' ? borders : borders.filter(b => b.route === filter)

  const redCount = borders.filter(b => b.status === 'red').length
  const yellowCount = borders.filter(b => b.status === 'yellow').length

  const mins = Math.floor((Date.now() - lastUpdate) / 60000)

  return (
    <div style={{ minHeight: '100%', padding: '0 16px', paddingBottom: 110, position: 'relative' }}>

      {/* Aurora */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(40% 25% at 10% 5%, rgba(255,138,61,0.10), transparent 60%),
          radial-gradient(35% 20% at 88% 18%, rgba(232,84,168,0.10), transparent 60%)
        `,
      }}/>

      {/* Header */}
      <div style={{ position: 'relative', paddingTop: 52, paddingBottom: 16 }}>
        <div style={{ color: 'var(--fg-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
          Live · Community-Meldungen
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: -0.6 }}>
          Grenz<span style={{ color: 'var(--orange)' }}>status</span>
        </div>
      </div>

      {/* Summary banner */}
      <div style={{
        ...glass,
        padding: '12px 16px', marginBottom: 16,
        background: redCount > 0 ? 'rgba(232,84,168,0.06)' : 'rgba(56,229,138,0.05)',
        border: redCount > 0 ? '1px solid rgba(232,84,168,0.2)' : '1px solid rgba(56,229,138,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            {redCount > 0
              ? <span style={{ fontWeight: 700, fontSize: 14 }}>⚠️ {redCount} Grenze{redCount > 1 ? 'n' : ''} stark belegt</span>
              : <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--gruen)' }}>✅ Alle Grenzen im normalen Bereich</span>
            }
            {yellowCount > 0 && <span style={{ color: 'var(--fg-3)', fontSize: 12 }}> · {yellowCount} mit mittlerer Wartezeit</span>}
          </div>
          <span style={{ color: 'var(--fg-3)', fontSize: 11, flexShrink: 0 }}>
            {mins === 0 ? 'Gerade aktualisiert' : `Vor ${mins} Min.`}
          </span>
        </div>
      </div>

      {/* Legende */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14, paddingLeft: 2 }}>
        {[['green','#38E58A','< 30 Min'], ['yellow','#F5B544','30–90 Min'], ['red','#E854A8','> 90 Min']].map(([, c, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }}/>
            <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Route filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {routes.map(r => (
          <button key={r} onClick={() => setFilter(r)} style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
            background: filter === r ? 'rgba(255,138,61,0.15)' : 'rgba(255,255,255,0.04)',
            color: filter === r ? 'var(--orange)' : 'var(--fg-3)',
            border: filter === r ? '1px solid rgba(255,138,61,0.35)' : '1px solid rgba(255,255,255,0.08)',
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)',
          }}>{r}</button>
        ))}
      </div>

      {/* Border cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(b => (
          <BorderCard key={b.id} border={b} onReport={b2 => { setReportModal(b2); setReportStatus(b2.status); setReportText('') }}/>
        ))}
      </div>

      {/* Report Modal */}
      {reportModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 0 20px',
        }} onClick={e => e.target === e.currentTarget && setReportModal(null)}>
          <div style={{
            width: '100%', maxWidth: 480,
            background: '#0F1318', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px 24px 0 0', padding: '20px 20px 32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>Meldung: {reportModal.name}</div>
                <div style={{ color: 'var(--fg-3)', fontSize: 12, marginTop: 2 }}>{reportModal.flags} · Was siehst du gerade?</div>
              </div>
              <button onClick={() => setReportModal(null)} style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,255,255,0.07)', border: 'none',
                color: 'var(--fg-3)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            {/* Status wählen */}
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fg-3)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Status wählen</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {STATUS_OPTS.map(s => (
                <button key={s.value} onClick={() => setReportStatus(s.value)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  background: reportStatus === s.value ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: reportStatus === s.value ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.07)',
                  color: 'var(--fg)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                }}>
                  <span>{s.label}</span>
                  <span style={{ color: 'var(--fg-3)', fontSize: 11 }}>{s.sub}</span>
                </button>
              ))}
            </div>

            <textarea
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              placeholder="Wartezeit, Spur-Infos, Besonderheiten…"
              rows={3}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
                padding: '10px 12px', color: 'var(--fg)', fontSize: 14,
                outline: 'none', resize: 'none', fontFamily: 'var(--font-body)',
                lineHeight: 1.5, boxSizing: 'border-box', marginBottom: 12,
              }}
            />

            {!user && (
              <div style={{ color: 'var(--orange)', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
                Anmeldung erforderlich um Meldungen zu senden
              </div>
            )}

            <button
              onClick={submitReport}
              disabled={sending || !reportText.trim() || !user}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 14, border: 'none',
                background: sending || !reportText.trim() || !user ? 'rgba(245,181,68,0.3)' : 'linear-gradient(180deg, #FFCC5C, #D49628)',
                color: sending || !reportText.trim() || !user ? 'rgba(31,20,2,0.4)' : '#1F1402',
                fontWeight: 800, fontSize: 14, cursor: sending || !reportText.trim() || !user ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {sending ? 'Wird gesendet…' : 'Meldung senden'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
