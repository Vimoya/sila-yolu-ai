import { Router } from 'express'
import OpenAI from 'openai'

const router = Router()

const SYSTEM_PROMPT = `Du bist Sıla Yolu AI, ein intelligenter Reiseassistent für Autofahrer aus Europa, die in die Türkei fahren.
Antworte immer auf Deutsch, kurz und hilfreich.
Themen: Routen, Vignetten, Maut, Grenzübergänge, Tankstellen, Dokumente, Hotels, Pannenhilfe, Fahrtipps.
Wenn du keine API-Verbindung hast, gib trotzdem hilfreiche Antworten.`

let openai = null
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body
  if (!message) return res.status(400).json({ error: 'message required' })

  if (!openai) {
    return res.json({ reply: getFallback(message) })
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8),
      { role: 'user', content: message },
    ]
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 400,
    })
    res.json({ reply: completion.choices[0].message.content })
  } catch (e) {
    res.json({ reply: getFallback(message) })
  }
})

function getFallback(input) {
  const q = input.toLowerCase()
  if (q.includes('vignette')) return 'Österreich: 15,40€/10 Tage. Ungarn: ~10€/10 Tage. Slowenien: 16€/7 Tage. Alle kaufbar online vor der Reise.'
  if (q.includes('grenze') || q.includes('kapıkule')) return 'Kapıkule ist der meistgenutzte Grenzübergang TR/BG. Tipp: Früh morgens (4-7 Uhr) oder nachts sind die Wartezeiten am kürzesten.'
  if (q.includes('tank')) return 'Günstig tanken: Serbien ~1,28€/L und Bulgarien ~1,31€/L Diesel. Deutschland vollgetankt losfahren und in Serbien nachtanken.'
  if (q.includes('dokument')) return 'Pflicht: Reisepass, Führerschein, Fahrzeugschein, Grüne Karte. Empfohlen: Internationaler Führerschein, EU-Krankenversicherungskarte.'
  if (q.includes('route')) return 'Schnellste Route: DE → AT → HU → RS → BG → TR (Kapıkule). Ca. 2.150 km ab München, ~22h reine Fahrzeit.'
  return 'Ich bin dein Sıla Yolu Reiseassistent! Frag mich zu: Routen, Vignetten, Grenzübergängen, Tankpreisen oder Reisedokumenten. 🚗🇹🇷'
}

export default router
