import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Volume2, VolumeX } from 'lucide-react'
import { useStore } from '../store/useStore'
import VoiceButton from '../components/VoiceButton'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const QUICK_PROMPTS = [
  'Welche Vignetten brauche ich?',
  'Beste Route von München',
  'Dokumente für die Türkei',
  'Tanktipps für die Route',
  'Grenzübergang Kapıkule',
  'Hotels unterwegs',
]

const SYSTEM_PERSONA = 'Du bist Sıla Yolu AI, ein intelligenter Reiseassistent für Autofahrer aus Europa, die in die Türkei fahren. Antworte kurz, freundlich und hilfreich auf Deutsch.'

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'de-DE'
  utter.rate = 1.05
  window.speechSynthesis.speak(utter)
}

export default function AIChatPage() {
  const { isDark } = useStore()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! 👋 Ich bin dein Sıla Yolu KI-Assistent. Wie kann ich dir bei deiner Reise in die Türkei helfen?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const bottomRef = useRef(null)

  const bg = isDark ? '#0a0f1e' : '#f8fafc'
  const textMain = isDark ? '#f1f5f9' : '#0f172a'
  const textMuted = isDark ? '#64748b' : '#94a3b8'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages.slice(-6) }),
      })
      const data = await res.json()
      const reply = data.reply || 'Entschuldigung, ein Fehler ist aufgetreten.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (ttsEnabled) speak(reply)
    } catch {
      const fallback = getFallbackReply(text)
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
      if (ttsEnabled) speak(fallback)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container flex flex-col" style={{ background: bg }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' }}>
            <Bot size={20} color="white" />
          </div>
          <div>
            <div className="font-bold" style={{ color: textMain }}>Sıla Yolu KI</div>
            <div className="text-xs" style={{ color: '#22c55e' }}>● Online</div>
          </div>
        </div>
        <button onClick={() => setTtsEnabled(!ttsEnabled)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: ttsEnabled ? 'rgba(29,78,216,0.2)' : isDark ? '#1e293b' : '#f1f5f9' }}>
          {ttsEnabled ? <Volume2 size={16} style={{ color: '#3b82f6' }} /> : <VolumeX size={16} style={{ color: textMuted }} />}
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: isDark ? '#1e293b' : '#f1f5f9', color: textMuted, border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2" style={{ minHeight: 0 }}>
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: msg.role === 'assistant' ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' : 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
              {msg.role === 'assistant' ? <Bot size={14} color="white" /> : <User size={14} color="white" />}
            </div>
            <div className="max-w-[78%]">
              <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.role === 'assistant'
                    ? isDark ? '#111827' : '#ffffff'
                    : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: msg.role === 'assistant' ? textMain : 'white',
                  border: msg.role === 'assistant' ? `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` : 'none',
                }}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' }}>
              <Bot size={14} color="white" />
            </div>
            <div className="px-4 py-3 rounded-2xl flex gap-1 items-center"
              style={{ background: isDark ? '#111827' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>
        <div className="flex items-center gap-2">
          <VoiceButton size="sm" onTranscript={(t) => sendMessage(t)} />
          <div className="flex-1 flex items-center rounded-2xl px-4"
            style={{ background: isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Frag mich alles über deine Reise..."
              className="flex-1 py-3 text-sm bg-transparent outline-none"
              style={{ color: textMain }}
            />
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: input.trim() ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : isDark ? '#1e293b' : '#f1f5f9' }}>
            <Send size={16} style={{ color: input.trim() ? 'white' : textMuted }} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function getFallbackReply(input) {
  const q = input.toLowerCase()
  if (q.includes('vignette') || q.includes('maut')) return 'Für die Route durch Österreich brauchst du eine Vignette (ab 15,40 € / 10 Tage). Ungarn kostet ca. 4.000 HUF. In der Türkei benötigst du ein HGS-Gerät für die Autobahn.'
  if (q.includes('dokument')) return 'Du brauchst: Reisepass/Personalausweis, Führerschein, Fahrzeugschein, grüne Karte (Auslandshaftpflicht), Krankenversicherungskarte und ggf. internationalen Führerschein.'
  if (q.includes('tank')) return 'Günstig tanken: Serbien und Bulgarien haben die niedrigsten Preise auf der Route (ca. 1,25-1,35 €/L Diesel). Vollgetankt in Deutschland losfahren zahlt sich nicht aus.'
  if (q.includes('grenze') || q.includes('kapıkule')) return 'Kapıkule ist der wichtigste Grenzübergang TR/Bulgarien. Reisezeit: früh morgens oder nachts sind Wartezeiten am kürzesten. Aktuelle Lage immer in der App prüfen!'
  if (q.includes('route') || q.includes('weg')) return 'Die schnellste Route geht über Österreich → Ungarn → Serbien → Bulgarien → Kapıkule → Istanbul. Ca. 2.150 km, 22 Stunden reine Fahrzeit.'
  return 'Ich helfe dir gerne mit deiner Türkei-Reise! Du kannst mich zu Routen, Vignetten, Grenzübergängen, Tankpreisen, Dokumenten oder Hotels fragen. 🚗🇹🇷'
}
