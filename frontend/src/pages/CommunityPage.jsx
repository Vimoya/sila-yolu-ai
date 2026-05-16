import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Heart, Image, X, ArrowLeft, Mic, MicOff } from 'lucide-react'
import { useStore } from '../store/useStore'

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(28px) saturate(140%)',
  WebkitBackdropFilter: 'blur(28px) saturate(140%)',
  borderRadius: 22,
}

const ROOMS = [
  { id: 'route', name: 'Auf der Route', icon: '🚗' },
  { id: 'border', name: 'Grenze Live', icon: '🛂' },
  { id: 'fuel', name: 'Tankstellen', icon: '⛽' },
  { id: 'family', name: 'Familie', icon: '👨‍👩‍👧' },
  { id: 'hotels', name: 'Hotels', icon: '🏨' },
  { id: 'emergency', name: 'Notfall', icon: '🆘' },
]

const ONLINE_USERS = [
  { name: 'Mert K.', avatar: 'MK', status: 'Auf A9, Bayern', color: 'hsla(120,50%,35%,0.6)' },
  { name: 'Fatma Y.', avatar: 'FY', status: 'Österreich', color: 'hsla(200,50%,35%,0.6)' },
  { name: 'Ali T.', avatar: 'AT', status: 'Serbien', color: 'hsla(45,50%,35%,0.6)' },
  { name: 'Hasan D.', avatar: 'HD', status: 'Kapıkule', color: 'hsla(300,50%,35%,0.6)' },
  { name: 'Selma A.', avatar: 'SA', status: 'Bulgarien', color: 'hsla(160,50%,35%,0.6)' },
  { name: 'Zeynep C.', avatar: 'ZC', status: 'Istanbul', color: 'hsla(260,50%,35%,0.6)' },
]

const INIT_MESSAGES = {
  route: [
    { id: 1, user: 'Mert K.', avatar: 'MK', text: 'Hallo alle! Fahre morgen früh ab München los 🚗', time: '14:32', likes: 4 },
    { id: 2, user: 'Fatma Y.', avatar: 'FY', text: 'Wir sind gerade auf der A9, alles läuft super!', time: '14:45', likes: 2 },
    { id: 3, user: 'Ali T.', avatar: 'AT', text: 'Tipp: In Serbien an der NIS Tankstelle tanken, 1,28€/L Diesel heute!', time: '15:01', likes: 11 },
  ],
  border: [
    { id: 1, user: 'Hasan D.', avatar: 'HD', text: '⚠️ Kapıkule gerade VOLL! 2+ Stunden. Am besten Hamzabeyli nehmen!', time: '13:10', likes: 23 },
    { id: 2, user: 'Selma A.', avatar: 'SA', text: 'Hamzabeyli aktuell 20 Min. Sehr empfehlenswert!', time: '13:25', likes: 15 },
  ],
  fuel: [
    { id: 1, user: 'Osman B.', avatar: 'OB', text: 'Wien OMV A2: Diesel 1,579€ — günstigste in Österreich heute', time: '11:00', likes: 7 },
    { id: 2, user: 'Ayse M.', avatar: 'AM', text: 'Budapest Shell: 1,42€ Diesel. Voll tanken hier lohnt sich!', time: '12:15', likes: 9 },
  ],
  family: [
    { id: 1, user: 'Zeynep C.', avatar: 'ZC', text: 'Mit 3 Kindern unterwegs — Rastplatz Parndorf in AT super für Pause!', time: '10:15', likes: 9 },
  ],
  hotels: [
    { id: 1, user: 'Ibrahim K.', avatar: 'IK', text: 'Hotel Slavia in Niš — 35€/Nacht, sauber, kostenlos parken. Empfehlung!', time: '09:30', likes: 18 },
  ],
  emergency: [
    { id: 1, user: 'Admin', avatar: 'AD', text: '📌 Serbien Pannenhilfe AMSS: +381 11 987\n📌 Bulgarien SBA: 1290\n📌 Türkei IAT: 0850 456 0 456', time: '08:00', likes: 5, isAdmin: true },
  ],
}

// DM threads per user
const INIT_DMS = {
  'Mert K.': [{ id: 1, from: 'Mert K.', text: 'Hey! Fährst du auch diese Woche?', time: '14:33' }],
  'Ali T.': [{ id: 1, from: 'Ali T.', text: 'Diesel in Serbien ist gerade günstig, nutze es!', time: '15:02' }],
}

export default function CommunityPage() {
  const { user } = useStore()
  const [activeRoom, setActiveRoom] = useState('route')
  const [messages, setMessages] = useState(INIT_MESSAGES)
  const [dms, setDms] = useState(INIT_DMS)
  const [input, setInput] = useState('')
  const [likedIds, setLikedIds] = useState(new Set())
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [view, setView] = useState('rooms') // 'rooms' | 'chat' | 'online' | 'dm'
  const [dmTarget, setDmTarget] = useState(null)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  const textMain = '#F2F4F8'
  const textMuted = '#7A8090'
  const border = 'rgba(255,255,255,0.07)'

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [messages, activeRoom, dms, dmTarget])

  function handlePhotoChange(e) {
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
        const url = URL.createObjectURL(new Blob(chunks, { type: 'audio/webm' }))
        const myName = user?.displayName || 'Ich'
        const newMsg = {
          id: Date.now(),
          user: myName,
          avatar: myName.slice(0, 2).toUpperCase(),
          audio: url,
          text: '',
          time: now(),
          likes: 0,
          isMe: true,
        }
        if (view === 'dm' && dmTarget) {
          setDms(prev => ({ ...prev, [dmTarget.name]: [...(prev[dmTarget.name] || []), { ...newMsg, from: myName }] }))
        } else {
          setMessages(prev => ({ ...prev, [activeRoom]: [...(prev[activeRoom] || []), newMsg] }))
        }
      }
      mr.start()
      setMediaRecorder(mr)
      setRecording(true)
    } catch { /* Mikrofon verweigert */ }
  }

  function now() {
    return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  function sendMessage() {
    if (!input.trim() && !photoFile) return
    const myName = user?.displayName || 'Anonym'
    const newMsg = {
      id: Date.now(),
      user: myName,
      avatar: myName.slice(0, 2).toUpperCase(),
      text: input.trim(),
      photo: photoPreview,
      time: now(),
      likes: 0,
      isMe: true,
    }
    if (view === 'dm' && dmTarget) {
      setDms(prev => ({ ...prev, [dmTarget.name]: [...(prev[dmTarget.name] || []), { ...newMsg, from: myName }] }))
    } else {
      setMessages(prev => ({ ...prev, [activeRoom]: [...(prev[activeRoom] || []), newMsg] }))
    }
    setInput('')
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  function toggleLike(msgId) {
    setLikedIds(prev => {
      const next = new Set(prev)
      next.has(msgId) ? next.delete(msgId) : next.add(msgId)
      return next
    })
  }

  function openDM(u) {
    setDmTarget(u)
    setView('dm')
  }

  const roomMessages = messages[activeRoom] || []
  const dmMessages = dmTarget ? (dms[dmTarget.name] || []) : []

  // ── Online Users List ──
  if (view === 'online') {
    return (
      <div className="flex flex-col" style={{ height: '100%' }}>
        <div className="px-4 pt-6 pb-3 flex-shrink-0 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('rooms')}
            className="w-9 h-9 rounded-2xl flex items-center justify-center" style={glass}>
            <ArrowLeft size={16} style={{ color: textMain }} />
          </motion.button>
          <h1 className="text-xl font-black" style={{ color: textMain }}>Online ({ONLINE_USERS.length})</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2" style={{ scrollbarWidth: 'none' }}>
          {ONLINE_USERS.map((u, i) => (
            <motion.div key={u.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-2xl mb-3"
              style={glass}>
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm"
                  style={{ background: u.color, border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f5' }}>
                  {u.avatar}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2" style={{ borderColor: '#060610' }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: textMain }}>{u.name}</div>
                <div className="text-xs" style={{ color: textMuted }}>📍 {u.status}</div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => openDM(u)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: textMain }}>
                Schreiben
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // ── DM View ──
  if (view === 'dm' && dmTarget) {
    return (
      <div className="flex flex-col" style={{ height: '100%' }}>
        <div className="px-4 pt-6 pb-3 flex-shrink-0 flex items-center gap-3" style={{ borderBottom: `1px solid ${border}` }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('rooms')}
            className="w-9 h-9 rounded-2xl flex items-center justify-center" style={glass}>
            <ArrowLeft size={16} style={{ color: textMain }} />
          </motion.button>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs"
              style={{ background: dmTarget.color || 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: textMain }}>
              {dmTarget.avatar}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2" style={{ borderColor: '#060610' }} />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: textMain }}>{dmTarget.name}</div>
            <div className="text-xs" style={{ color: '#22c55e' }}>● Online · {dmTarget.status}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: 0, scrollbarWidth: 'none' }}>
          {dmMessages.map((msg, i) => {
            const isMe = msg.from === (user?.displayName || 'Anonym') || msg.isMe
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`flex gap-2.5 mb-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold self-end"
                  style={{ background: isMe ? 'rgba(255,255,255,0.1)' : (dmTarget.color || 'rgba(255,255,255,0.07)'), border: '1px solid rgba(255,255,255,0.1)', color: textMain }}>
                  {isMe ? (user?.displayName || 'AN').slice(0, 2).toUpperCase() : dmTarget.avatar}
                </div>
                <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {msg.photo && <img src={msg.photo} alt="Foto" className="rounded-2xl mb-1 object-cover" style={{ maxWidth: 200, maxHeight: 160 }} />}
                  {msg.audio && <audio controls src={msg.audio} style={{ height: 32, maxWidth: 180, marginBottom: 4 }} />}
                  {msg.text && (
                    <div className="px-3.5 py-2.5 rounded-2xl text-sm"
                      style={isMe ? { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: textMain, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }
                        : { background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.09)', color: textMain }}>
                      {msg.text}
                    </div>
                  )}
                  <span className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{msg.time}</span>
                </div>
              </motion.div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <InputBar input={input} setInput={setInput} photoPreview={photoPreview} setPhotoPreview={setPhotoPreview}
          setPhotoFile={setPhotoFile} fileInputRef={fileInputRef} handlePhotoChange={handlePhotoChange}
          sendMessage={sendMessage} recording={recording} toggleRecording={toggleRecording} textMain={textMain} textMuted={textMuted} border={border} />
      </div>
    )
  }

  // ── Main Room View ──
  return (
    <div className="flex flex-col" style={{ height: '100%', minHeight: '100%' }}>

      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black leading-tight" style={{ color: textMain, fontFamily: 'Space Grotesk, sans-serif' }}>Reisende heute</h1>
            <p className="text-xs mt-0.5" style={{ color: textMuted, fontFamily: 'DM Sans, sans-serif' }}>Topluluk · Community</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('online')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] text-xs font-semibold"
            style={{ background: 'rgba(56,229,138,0.10)', border: '1px solid rgba(56,229,138,0.20)', color: '#38E58A', fontFamily: 'DM Sans, sans-serif' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#38E58A' }} />
            {ONLINE_USERS.length} Online
          </motion.button>
        </div>

        {/* Online avatars strip */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {ONLINE_USERS.map(u => (
            <motion.button key={u.name} whileTap={{ scale: 0.9 }} onClick={() => openDM(u)}
              className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs"
                  style={{ background: u.color, border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f5' }}>
                  {u.avatar}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2" style={{ borderColor: '#060610' }} />
              </div>
              <span className="text-[9px]" style={{ color: textMuted }}>{u.name.split(' ')[0]}</span>
            </motion.button>
          ))}
        </div>

        {/* Room tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {ROOMS.map(room => (
            <motion.button key={room.id} whileTap={{ scale: 0.94 }} onClick={() => setActiveRoom(room.id)}
              className="flex-shrink-0 px-3 py-2 rounded-[14px] text-xs font-semibold flex items-center gap-1.5"
              style={activeRoom === room.id ? {
                background: 'rgba(245,181,68,0.14)', color: '#F5B544',
                border: '1px solid rgba(245,181,68,0.25)', backdropFilter: 'blur(28px)',
                fontFamily: 'DM Sans, sans-serif',
              } : {
                background: 'rgba(255,255,255,0.04)', color: textMuted,
                border: '1px solid rgba(255,255,255,0.07)',
                fontFamily: 'DM Sans, sans-serif',
              }}>
              <span>{room.icon}</span> {room.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2" style={{ minHeight: 0, scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeRoom} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {roomMessages.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`flex gap-2.5 mb-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold self-end"
                  style={{
                    background: msg.isAdmin ? 'rgba(251,191,36,0.2)' : msg.isMe ? 'rgba(255,255,255,0.12)' : `hsla(${(msg.user.charCodeAt(0) * 37) % 360}, 50%, 35%, 0.6)`,
                    border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f5',
                  }}>
                  {msg.avatar}
                </div>
                <div className={`max-w-[78%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  {!msg.isMe && <span className="text-xs mb-1 font-medium" style={{ color: textMuted }}>{msg.user}</span>}
                  {msg.photo && <img src={msg.photo} alt="Foto" className="rounded-2xl mb-1 object-cover" style={{ maxWidth: 200, maxHeight: 160 }} />}
                  {msg.audio && <audio controls src={msg.audio} style={{ height: 32, maxWidth: 180, marginBottom: 4 }} />}
                  {msg.text && (
                    <div className="px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line"
                      style={msg.isMe ? { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: textMain, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }
                        : msg.isAdmin ? { background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }
                        : { background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.09)', color: textMain }}>
                      {msg.text}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{msg.time}</span>
                    {!msg.isMe && (
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleLike(msg.id)} className="flex items-center gap-0.5">
                        <Heart size={10} style={{ color: likedIds.has(msg.id) ? '#E854A8' : '#4E5462', fill: likedIds.has(msg.id) ? '#E854A8' : 'none' }} />
                        <span className="text-[10px]" style={{ color: '#4E5462', fontFamily: 'DM Sans, sans-serif' }}>{msg.likes + (likedIds.has(msg.id) ? 1 : 0)}</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </motion.div>
        </AnimatePresence>
      </div>

      <InputBar input={input} setInput={setInput} photoPreview={photoPreview} setPhotoPreview={setPhotoPreview}
        setPhotoFile={setPhotoFile} fileInputRef={fileInputRef} handlePhotoChange={handlePhotoChange}
        sendMessage={sendMessage} recording={recording} toggleRecording={toggleRecording} textMain={textMain} textMuted={textMuted} border={border} />
    </div>
  )
}

function InputBar({ input, setInput, photoPreview, setPhotoPreview, setPhotoFile, fileInputRef, handlePhotoChange, sendMessage, recording, toggleRecording, textMain, textMuted, border }) {
  const glassBtn = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
  }
  return (
    <>
      <AnimatePresence>
        {photoPreview && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2 flex-shrink-0">
            <div className="relative inline-block">
              <img src={photoPreview} alt="Vorschau" className="rounded-2xl object-cover" style={{ height: 72 }} />
              <button onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <X size={11} style={{ color: 'white' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-3 pt-2 flex-shrink-0" style={{ borderTop: `1px solid ${border}`, paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center gap-1.5">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0" style={glassBtn}>
            <Image size={14} style={{ color: textMuted }} />
          </motion.button>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />

          <div className="flex-1 flex items-center rounded-[12px] px-3 min-w-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Nachricht schreiben..."
              className="flex-1 py-2.5 text-sm bg-transparent outline-none min-w-0"
              style={{ color: textMain, fontFamily: 'DM Sans, sans-serif' }} />
          </div>

          <motion.button whileTap={{ scale: 0.9 }} onClick={toggleRecording}
            className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={recording ? { background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)' } : glassBtn}>
            {recording ? <MicOff size={14} style={{ color: '#FF6B6B' }} /> : <Mic size={14} style={{ color: textMuted }} />}
          </motion.button>

          <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage}
            className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={(input.trim() || photoPreview) ? {
              background: 'rgba(245,181,68,0.14)', border: '1px solid rgba(245,181,68,0.25)',
            } : glassBtn}>
            <Send size={14} style={{ color: (input.trim() || photoPreview) ? '#F5B544' : textMuted }} />
          </motion.button>
        </div>
      </div>
    </>
  )
}
