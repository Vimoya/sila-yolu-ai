import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import VoiceButton from '../components/VoiceButton'
import SilaLogo from '../components/SilaLogo'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const QUICK_PROMPTS = [
  '🗺️ Beste Route von München',
  '🛂 Kapıkule Wartezeit',
  '⛽ Günstig tanken auf Route',
  '📋 Welche Dokumente brauche ich?',
  '🏨 Hotels unterwegs',
  '🪟 Vignetten & Kosten',
]

function speak(text) {
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'de-DE'
  utter.rate = 1.05
  window.speechSynthesis.speak(utter)
}

export default function AIChatPage() {
  const { isDark } = useStore()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! 👋 Ich bin dein Sıla Yolu KI-Assistent — powered by GPT-4. Wie kann ich dir bei deiner Reise in die Türkei helfen?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const bottomRef = useRef(null)

  const bg = isDark ? '#0d0d0d' : '#ffffff'
  const textMain = isDark ? '#f5f5f5' : '#0f172a'
  const textMuted = isDark ? '#888' : '#64748b'
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage(text) {
    if (!text.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages.slice(-8) }),
      })
      const data = await res.json()
      const reply = data.reply || 'Ein Fehler ist aufgetreten.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (ttsEnabled) speak(reply)
    } catch {
      const fallback = getFallback(text)
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
      if (ttsEnabled) speak(fallback)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container flex flex-col" style={{ background: bg }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <SilaLogo size={44} />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2"
                style={{ borderColor: bg }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: textMain }}>Sıla Yolu KI</div>
              <div className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
                <Sparkles size={10} /> GPT-4 · Online
              </div>
            </div>
          </div>
          <button onClick={() => setTtsEnabled(!ttsEnabled)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: ttsEnabled ? 'rgba(232,25,44,0.1)' : isDark ? '#1a1a1a' : '#f7f8fc' }}>
            {ttsEnabled
              ? <Volume2 size={16} style={{ color: '#e8192c' }} />
              : <VolumeX size={16} style={{ color: textMuted }} />}
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap"
              style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', color: textMuted, border: `1px solid ${borderColor}` }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2" style={{ minHeight: 0 }}>
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: msg.role === 'assistant' ? 'linear-gradient(135deg, #e8192c, #1a237e)' : isDark ? '#2a2a2a' : '#f0f0f0' }}>
              {msg.role === 'assistant'
                ? <Bot size={14} color="white" />
                : <User size={14} style={{ color: textMuted }} />}
            </div>
            <div className="max-w-[78%]">
              <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #e8192c, #c0111f)'
                    : isDark ? '#1a1a1a' : '#f7f8fc',
                  color: msg.role === 'user' ? 'white' : textMain,
                  border: msg.role === 'user' ? 'none' : `1px solid ${borderColor}`,
                }}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #e8192c, #1a237e)' }}>
              <Bot size={14} color="white" />
            </div>
            <div className="px-4 py-3 rounded-2xl flex gap-1 items-center"
              style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', border: `1px solid ${borderColor}` }}>
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#e8192c' }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2">
          <VoiceButton size="sm" onTranscript={t => sendMessage(t)} />
          <div className="flex-1 flex items-center rounded-2xl px-4"
            style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', border: `1px solid ${borderColor}` }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Frag mich alles zur Türkei-Reise..."
              className="flex-1 py-3 text-sm bg-transparent outline-none"
              style={{ color: textMain }} />
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: input.trim() ? 'linear-gradient(135deg, #e8192c, #c0111f)' : isDark ? '#1a1a1a' : '#f7f8fc' }}>
            <Send size={16} style={{ color: input.trim() ? 'white' : textMuted }} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function getFallback(input) {
  const q = input.toLowerCase()
  if (q.includes('vignette')) return 'Österreich: 15,40€/10 Tage. Ungarn: ~10€/10 Tage. Slowenien: 16€/7 Tage.'
  if (q.includes('grenze') || q.includes('kapıkule')) return 'Kapıkule: Früh morgens (4-7 Uhr) sind Wartezeiten am kürzesten. Immer Community-Meldungen checken!'
  if (q.includes('tank')) return 'Serbien (~1,28€) und Bulgarien (~1,31€) haben die günstigsten Dieselpreise auf der Route.'
  if (q.includes('dokument')) return 'Pflicht: Reisepass, Führerschein, Fahrzeugschein, Grüne Karte. Empfohlen: EU-Krankenversicherungskarte.'
  if (q.includes('route')) return 'Schnellste Route: DE → AT → HU → RS → BG → Kapıkule → Istanbul. ~2.150 km, ~22h.'
  if (q.includes('hotel')) return 'Empfehlung für Übernachtung: Niš oder Beograd (Serbien) — günstig, sicher, gute Lage auf der Route.'
  return 'Ich helfe dir gerne! Frag mich zu Routen, Vignetten, Grenzübergängen, Tankpreisen oder Reisedokumenten. 🚗🇹🇷'
}
