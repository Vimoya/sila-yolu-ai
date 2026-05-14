import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'

export default function VoiceButton({ onTranscript, onStart, onStop, size = 'md' }) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const s = { sm: { btn: 44, icon: 18 }, md: { btn: 56, icon: 22 }, lg: { btn: 72, icon: 28 } }[size]

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError('Nicht unterstützt'); return }
    const r = new SR()
    r.lang = 'de-DE'
    r.interimResults = false
    r.onresult = e => { onTranscript?.(e.results[0][0].transcript); setListening(false) }
    r.onerror = () => setListening(false)
    r.onend = () => { setListening(false); onStop?.() }
    recognitionRef.current = r
    r.start()
    setListening(true)
    onStart?.()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <div className="flex flex-col items-center">
      <motion.button whileTap={{ scale: 0.88 }}
        onClick={listening ? stopListening : startListening}
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          width: s.btn, height: s.btn,
          background: listening ? 'linear-gradient(135deg, #e8192c, #c0111f)' : 'linear-gradient(135deg, #1a237e, #3b5bdb)',
          boxShadow: listening ? '0 0 0 6px rgba(232,25,44,0.15)' : '0 4px 16px rgba(26,35,126,0.3)',
        }}
        animate={listening ? { boxShadow: ['0 0 0 0px rgba(232,25,44,0.3)', '0 0 0 10px rgba(232,25,44,0)'] } : {}}
        transition={listening ? { repeat: Infinity, duration: 1 } : {}}>
        <AnimatePresence mode="wait">
          {listening
            ? <motion.div key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><MicOff size={s.icon} color="white" /></motion.div>
            : <motion.div key="on" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Mic size={s.icon} color="white" /></motion.div>}
        </AnimatePresence>
      </motion.button>
      {listening && (
        <div className="flex gap-0.5 items-end h-4 mt-1">
          {[1,2,3,4,5].map(i => (
            <motion.div key={i} className="w-1 rounded-full" style={{ background: '#e8192c' }}
              animate={{ height: [3, 14, 3] }}
              transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.1 }} />
          ))}
        </div>
      )}
    </div>
  )
}
