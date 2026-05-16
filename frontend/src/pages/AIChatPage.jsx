import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { IconChat, IconArrow, IconCamera, IconBolt } from '../components/Icons'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const QUICK_PROMPTS = [
  'Beste Route von München',
  'Kapıkule Wartezeit',
  'Günstig tanken',
  'Welche Dokumente?',
  'Hotels unterwegs',
  'Vignetten & Kosten',
]

function speak(text) {
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'de-DE'
  utter.rate = 1.05
  window.speechSynthesis.speak(utter)
}

function getFallback(input) {
  const q = (input || '').toLowerCase()
  if (q.includes('vignette')) return 'Österreich: 15,40€/10 Tage. Ungarn: ~10€/10 Tage. Slowenien: 16€/7 Tage.'
  if (q.includes('grenze') || q.includes('kapıkule')) return 'Kapıkule: Früh morgens (4–7 Uhr) sind Wartezeiten am kürzesten. Community-Meldungen immer checken!'
  if (q.includes('tank')) return 'Serbien (~1,28€) und Bulgarien (~1,31€) haben die günstigsten Dieselpreise auf der Route.'
  if (q.includes('dokument')) return 'Pflicht: Reisepass, Führerschein, Fahrzeugschein, Grüne Karte. Empfohlen: EU-Krankenversicherungskarte.'
  if (q.includes('route')) return 'Schnellste Route: DE → AT → HU → RS → BG → Kapıkule → Istanbul. ~2.150 km, ~22h.'
  if (q.includes('hotel')) return 'Tipp: Niš oder Beograd (Serbien) — günstig, sicher, gute Lage auf der Route.'
  return 'Ich helfe dir gerne! Frag mich zu Routen, Vignetten, Grenzübergängen, Tankpreisen oder Reisedokumenten.'
}

export default function AIChatPage() {
  const { user, setActiveTab } = useStore()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! Ich bin dein Sıla Yolu Assistent. Wie kann ich dir bei deiner Reise in die Türkei helfen?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [messages])

  async function sendMessage(text) {
    if (!text.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text.trim() }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history: messages.slice(-8) }),
      })
      const data = await res.json()
      const reply = data.reply || getFallback(text)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: getFallback(text) }])
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Aurora */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(40% 25% at 15% 5%, rgba(77,168,255,0.12), transparent 60%),
          radial-gradient(35% 20% at 85% 20%, rgba(232,84,168,0.10), transparent 60%)
        `,
      }}/>

      {/* Header */}
      <div style={{
        position: 'relative', padding: '52px 16px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
        </button>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, rgba(77,168,255,0.3), rgba(232,84,168,0.2))', border: '1px solid rgba(77,168,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
          <IconBolt size={20} style={{ color: 'var(--e5)' }}/>
          <span style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: 'var(--gruen)', border: '2px solid #050608', boxShadow: '0 0 6px var(--gruen)' }}/>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>Sıla Yolu Assistent</div>
          <div style={{ fontSize: 11, color: 'var(--gruen)', fontWeight: 700 }}>● Online</div>
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '10px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)}
              style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--fg-3)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
              }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px', scrollbarWidth: 'none', paddingBottom: 120 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 11, flexShrink: 0, alignSelf: 'flex-end',
              background: msg.role === 'assistant' ? 'rgba(77,168,255,0.15)' : 'rgba(255,255,255,0.08)',
              border: msg.role === 'assistant' ? '1px solid rgba(77,168,255,0.3)' : '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {msg.role === 'assistant'
                ? <IconBolt size={14} style={{ color: 'var(--e5)' }}/>
                : <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-3)', fontFamily: 'var(--font-display)' }}>
                    {(user?.displayName || 'U')[0].toUpperCase()}
                  </span>}
            </div>
            <div style={{
              maxWidth: '78%',
              background: msg.role === 'user'
                ? 'rgba(255,255,255,0.09)'
                : 'rgba(255,255,255,0.04)',
              border: msg.role === 'user'
                ? '1px solid rgba(255,255,255,0.14)'
                : '1px solid rgba(77,168,255,0.15)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 18, padding: '12px 16px',
              fontSize: 14, lineHeight: 1.55, color: 'var(--fg)',
              fontFamily: 'var(--font-body)',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 11, background: 'rgba(77,168,255,0.15)', border: '1px solid rgba(77,168,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconBolt size={14} style={{ color: 'var(--e5)' }}/>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(77,168,255,0.15)', backdropFilter: 'blur(20px)', borderRadius: 18, padding: '14px 18px', display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `bounce 0.7s ease ${j * 0.12}s infinite` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '10px 12px',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
        background: 'rgba(5,6,8,0.88)', backdropFilter: 'blur(30px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 640, margin: '0 auto' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 18, padding: '10px 14px', gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Frag mich alles zur Türkei-Reise..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--fg)', fontSize: 14, fontFamily: 'var(--font-body)' }}
            />
          </div>
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{
            width: 44, height: 44, borderRadius: 14, border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            background: input.trim() ? 'var(--turkis)' : 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            <IconArrow size={18} style={{ color: input.trim() ? '#1F1402' : 'var(--fg-3)' }}/>
          </button>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }`}</style>
    </div>
  )
}
