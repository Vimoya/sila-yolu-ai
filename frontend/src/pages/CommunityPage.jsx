import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Heart, Flag, Hash } from 'lucide-react'
import { useStore } from '../store/useStore'
import VoiceButton from '../components/VoiceButton'

const ROOMS = [
  { id: 'general', name: 'Allgemein', icon: '💬' },
  { id: 'border', name: 'Grenze Live', icon: '🛂' },
  { id: 'fuel', name: 'Tankstellen', icon: '⛽' },
  { id: 'family', name: 'Familienreise', icon: '👨‍👩‍👧' },
  { id: 'hotels', name: 'Hotels & Schlafen', icon: '🏨' },
  { id: 'emergency', name: 'Notfall & Hilfe', icon: '🆘' },
]

const DUMMY_MESSAGES = {
  general: [
    { id: 1, user: 'Mert K.', avatar: 'MK', text: 'Hallo alle! Fahre morgen früh ab München los 🚗', time: '14:32', likes: 4 },
    { id: 2, user: 'Fatma Y.', avatar: 'FY', text: 'Wir sind gerade auf der A9, alles läuft gut!', time: '14:45', likes: 2 },
    { id: 3, user: 'Ali T.', avatar: 'AT', text: 'Tipp: In Serbien an der NIS Tankstelle tanken, 1,28€/L Diesel!', time: '15:01', likes: 11 },
  ],
  border: [
    { id: 1, user: 'Hasan D.', avatar: 'HD', text: '⚠️ Kapıkule gerade VOLL! 2+ Stunden Wartezeit. Hamzabeyli nehmen!', time: '13:10', likes: 23 },
    { id: 2, user: 'Selma A.', avatar: 'SA', text: 'Hamzabeyli aktuell 20 Min. Sehr empfehlenswert!', time: '13:25', likes: 15 },
  ],
  fuel: [
    { id: 1, user: 'Osman B.', avatar: 'OB', text: 'Wien OMV A2: Diesel 1,579€ - günstigste in Österreich heute', time: '11:00', likes: 7 },
  ],
  family: [
    { id: 1, user: 'Zeynep C.', avatar: 'ZC', text: 'Mit 3 Kindern unterwegs - Rastplatz Parndorf in AT super für Pause!', time: '10:15', likes: 9 },
  ],
  hotels: [
    { id: 1, user: 'Ibrahim K.', avatar: 'IK', text: 'Hotel Slavia in Niš - 35€/Nacht, sauber, kostenlos parken. Empfehlung!', time: '09:30', likes: 18 },
  ],
  emergency: [
    { id: 1, user: 'Admin', avatar: 'AD', text: '📌 Bei Panne in Serbien: AMSS Pannenhilfe +381 11 987', time: '08:00', likes: 5, isAdmin: true },
  ],
}

export default function CommunityPage() {
  const { isDark, user } = useStore()
  const [activeRoom, setActiveRoom] = useState('general')
  const [messages, setMessages] = useState(DUMMY_MESSAGES)
  const [input, setInput] = useState('')
  const [likedIds, setLikedIds] = useState(new Set())
  const bottomRef = useRef(null)

  const bg = isDark ? '#0d0d0d' : '#ffffff'
  const textMain = isDark ? '#f5f5f5' : '#0f172a'
  const textMuted = isDark ? '#888' : '#64748b'
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeRoom])

  function sendMessage(text) {
    if (!text.trim()) return
    const newMsg = {
      id: Date.now(),
      user: user?.displayName || 'Anonym',
      avatar: (user?.displayName || 'AN').slice(0, 2).toUpperCase(),
      text,
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      isMe: true,
    }
    setMessages(prev => ({ ...prev, [activeRoom]: [...(prev[activeRoom] || []), newMsg] }))
    setInput('')
  }

  function toggleLike(msgId) {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(msgId)) next.delete(msgId)
      else next.add(msgId)
      return next
    })
  }

  const roomMessages = messages[activeRoom] || []

  return (
    <div className="page-container flex flex-col" style={{ background: bg }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-black mb-3" style={{ color: textMain }}>Community</h1>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ROOMS.map(room => (
            <button key={room.id} onClick={() => setActiveRoom(room.id)}
              className="flex-shrink-0 px-3 py-2 rounded-2xl text-xs font-medium flex items-center gap-1.5 transition-all"
              style={{
                background: activeRoom === room.id ? 'linear-gradient(135deg, #e8192c, #c0111f)' : isDark ? '#1a1a1a' : '#f7f8fc',
                color: activeRoom === room.id ? 'white' : textMuted,
              }}>
              <span>{room.icon}</span> {room.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2" style={{ minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeRoom} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {roomMessages.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex gap-2.5 mb-4 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: msg.isAdmin ? 'linear-gradient(135deg, #f59e0b, #d97706)' : `hsl(${(msg.user.charCodeAt(0) * 37) % 360}, 60%, 45%)` }}>
                  {msg.avatar}
                </div>
                <div className={`max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!msg.isMe && (
                    <span className="text-xs mb-1 font-medium" style={{ color: textMuted }}>{msg.user}</span>
                  )}
                  <div className="px-4 py-2.5 rounded-2xl text-sm"
                    style={{
                      background: msg.isMe ? 'linear-gradient(135deg, #e8192c, #c0111f)'
                        : msg.isAdmin ? 'rgba(245,158,11,0.15)'
                        : isDark ? '#1a1a1a' : '#ffffff',
                      color: msg.isMe ? 'white' : textMain,
                      border: msg.isMe ? 'none' : `1px solid ${borderColor}`,
                    }}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px]" style={{ color: textMuted }}>{msg.time}</span>
                    {!msg.isMe && (
                      <button onClick={() => toggleLike(msg.id)} className="flex items-center gap-0.5">
                        <Heart size={10} style={{ color: likedIds.has(msg.id) ? '#dc2626' : textMuted, fill: likedIds.has(msg.id) ? '#dc2626' : 'none' }} />
                        <span className="text-[10px]" style={{ color: textMuted }}>{msg.likes + (likedIds.has(msg.id) ? 1 : 0)}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2">
          <VoiceButton size="sm" onTranscript={t => sendMessage(t)} />
          <div className="flex-1 flex items-center rounded-2xl px-3"
            style={{ background: isDark ? '#1a1a1a' : '#f7f8fc', border: `1px solid ${borderColor}` }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Nachricht schreiben..."
              className="flex-1 py-3 text-sm bg-transparent outline-none"
              style={{ color: textMain }} />
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage(input)}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: input.trim() ? 'linear-gradient(135deg, #e8192c, #c0111f)' : isDark ? '#1a1a1a' : '#f7f8fc' }}>
            <Send size={16} style={{ color: input.trim() ? 'white' : textMuted }} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
