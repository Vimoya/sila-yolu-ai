import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Volume2, VolumeX, Image, X, Mic, MicOff } from 'lucide-react'
import { useStore } from '../store/useStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const glass = {
  background: 'rgba(255,255,255,0.09)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
}

const QUICK_PROMPTS = [
  '🗺️ Beste Route von München',
  '🛂 Kapıkule Wartezeit',
  '⛽ Günstig tanken',
  '📋 Welche Dokumente?',
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
  const { user } = useStore()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! 👋 Ich bin dein Sıla Yolu Assistent. Wie kann ich dir bei deiner Reise in die Türkei helfen?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  const textMain = '#f5f5f5'
  const textMuted = 'rgba(255,255,255,0.4)'
  const borderColor = 'rgba(255,255,255,0.08)'

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [messages])

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function toggleRecording() {
    if (recording) {
      mediaRecorder?.stop()
      setRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      const chunks = []
      mr.ondataavailable = e => chunks.push(e.data)
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunks, { type: 'audio/webm' })
        sendVoiceMessage(blob)
      }
      mr.start()
      setMediaRecorder(mr)
      setRecording(true)
    } catch {
      sendMessage('🎤 Mikrofon-Zugriff nicht erlaubt.')
    }
  }

  async function sendVoiceMessage(blob) {
    const url = URL.createObjectURL(blob)
    const userMsg = { role: 'user', content: '🎤 Sprachnachricht', audio: url, isMe: true }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Sprachnachricht erhalten — bitte gib eine allgemeine Reisehilfe.', history: messages.slice(-6) }),
      })
      const data = await res.json()
      const reply = data.reply || getFallback('')
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (ttsEnabled) speak(reply)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: getFallback('') }])
    }
    setLoading(false)
  }

  async function sendMessage(text) {
    const hasPhoto = !!photoPreview
    if (!text.trim() && !hasPhoto) return
    if (loading) return
    const userMsg = {
      role: 'user',
      content: text.trim(),
      photo: photoPreview,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setPhotoFile(null)
    setPhotoPreview(null)
    setLoading(true)
    const fullText = hasPhoto ? `[Foto gesendet] ${text.trim()}` : text.trim()
    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: fullText, history: messages.slice(-8) }),
      })
      const data = await res.json()
      const reply = data.reply || getFallback(text)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (ttsEnabled) speak(reply)
    } catch {
      const fallback = getFallback(text)
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
      if (ttsEnabled) speak(fallback)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col" style={{ background: 'linear-gradient(135deg, #060610 0%, #0a0a18 50%, #060610 100%)', height: '100%', minHeight: '100%' }}>

      {/* Fixed ambient */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-5%', left: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '-5%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Bot size={20} style={{ color: textMain }} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2"
                style={{ borderColor: '#060610' }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: textMain }}>Sıla Yolu Assistent</div>
              <div className="text-xs" style={{ color: '#22c55e' }}>● Online</div>
            </div>
          </div>
          <button onClick={() => setTtsEnabled(!ttsEnabled)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={glass}>
            {ttsEnabled
              ? <Volume2 size={16} style={{ color: textMain }} />
              : <VolumeX size={16} style={{ color: textMuted }} />}
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="relative z-10 px-4 py-3 flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.09)', color: textMuted, border: `1px solid ${borderColor}` }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-2" style={{ minHeight: 0, scrollbarWidth: 'none' }}>
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 self-end"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {msg.role === 'assistant'
                ? <Bot size={14} style={{ color: textMain }} />
                : <User size={14} style={{ color: textMuted }} />}
            </div>
            <div className={`max-w-[78%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.photo && (
                <img src={msg.photo} alt="Foto" className="rounded-2xl mb-1 object-cover" style={{ maxWidth: 200, maxHeight: 160 }} />
              )}
              {msg.audio && (
                <div className="mb-1">
                  <audio controls src={msg.audio} style={{ height: 32, maxWidth: 180 }} />
                </div>
              )}
              {msg.content && (
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'user' ? {
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: textMain,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                  } : {
                    ...glass,
                    color: textMain,
                  }}>
                  {msg.content}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Bot size={14} style={{ color: textMain }} />
            </div>
            <div className="px-4 py-3 rounded-2xl flex gap-1 items-center" style={glass}>
              {[0,1,2].map(j => (
                <motion.div key={j} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.5)' }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7, delay: j * 0.12 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Photo preview */}
      <AnimatePresence>
        {photoPreview && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="relative z-10 px-4 pb-2 flex-shrink-0">
            <div className="relative inline-block">
              <img src={photoPreview} alt="Vorschau" className="rounded-2xl object-cover" style={{ height: 72 }} />
              <button onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <X size={11} style={{ color: 'white' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="relative z-10 px-4 pb-4 pt-2 flex-shrink-0" style={{ borderTop: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2">
          {/* Photo */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={glass}>
            <Image size={15} style={{ color: textMuted }} />
          </motion.button>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />

          {/* Text input */}
          <div className="flex-1 flex items-center rounded-2xl px-3"
            style={{ background: 'rgba(255,255,255,0.09)', border: `1px solid ${borderColor}`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Frag mich alles zur Türkei-Reise..."
              className="flex-1 py-3 text-sm bg-transparent outline-none"
              style={{ color: textMain }} />
          </div>

          {/* Voice */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggleRecording}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={recording ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' } : glass}>
            {recording
              ? <MicOff size={15} style={{ color: '#f87171' }} />
              : <Mic size={15} style={{ color: textMuted }} />}
          </motion.button>

          {/* Send */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage(input)}
            disabled={!input.trim() && !photoFile || loading}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={(input.trim() || photoFile) ? {
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
            } : glass}>
            <Send size={15} style={{ color: (input.trim() || photoFile) ? textMain : textMuted }} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function getFallback(input) {
  const q = input.toLowerCase()
  if (q.includes('vignette')) return 'Österreich: 15,40€/10 Tage. Ungarn: ~10€/10 Tage. Slowenien: 16€/7 Tage.'
  if (q.includes('grenze') || q.includes('kapıkule')) return 'Kapıkule: Früh morgens (4–7 Uhr) sind Wartezeiten am kürzesten. Community-Meldungen immer checken!'
  if (q.includes('tank')) return 'Serbien (~1,28€) und Bulgarien (~1,31€) haben die günstigsten Dieselpreise auf der Route.'
  if (q.includes('dokument')) return 'Pflicht: Reisepass, Führerschein, Fahrzeugschein, Grüne Karte. Empfohlen: EU-Krankenversicherungskarte.'
  if (q.includes('route')) return 'Schnellste Route: DE → AT → HU → RS → BG → Kapıkule → Istanbul. ~2.150 km, ~22h.'
  if (q.includes('hotel')) return 'Tipp: Niš oder Beograd (Serbien) — günstig, sicher, gute Lage auf der Route.'
  return 'Ich helfe dir gerne! Frag mich zu Routen, Vignetten, Grenzübergängen, Tankpreisen oder Reisedokumenten. 🚗🇹🇷'
}
