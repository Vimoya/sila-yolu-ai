import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'

export default function VoiceButton({ onTranscript, onStart, onStop, size = 'md' }) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const sizes = {
    sm: { btn: 44, icon: 18 },
    md: { btn: 64, icon: 24 },
    lg: { btn: 80, icon: 32 },
  }
  const s = sizes[size]

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Spracherkennung nicht unterstützt')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'de-DE'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript
      onTranscript?.(text)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => { setListening(false); onStop?.() }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
    onStart?.()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={listening ? stopListening : startListening}
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: s.btn, height: s.btn,
          background: listening
            ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
            : 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
          boxShadow: listening
            ? '0 0 0 0 rgba(220,38,38,0.4)'
            : '0 4px 20px rgba(29,78,216,0.4)',
        }}
        animate={listening ? { boxShadow: ['0 0 0 0 rgba(220,38,38,0.4)', '0 0 0 20px rgba(220,38,38,0)'] } : {}}
        transition={listening ? { repeat: Infinity, duration: 1 } : {}}
      >
        <AnimatePresence mode="wait">
          {listening ? (
            <motion.div key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MicOff size={s.icon} color="white" />
            </motion.div>
          ) : (
            <motion.div key="on" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Mic size={s.icon} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {listening && (
        <div className="flex gap-1 items-end h-5">
          {[1,2,3,4,5].map(i => (
            <motion.div key={i} className="w-1 rounded-full bg-red-500"
              animate={{ height: [4, 16, 4] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
