import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, ChevronRight, Star, Bell, Shield, Fuel, Map, Car, Save, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth'

const glass = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
}

const CHECKLIST_CATEGORIES = [
  {
    id: 'docs', label: 'Pflichtdokumente', icon: '📋',
    items: [
      'Reisepass (für alle Mitreisenden)',
      'Personalausweis (nur EU-intern, TR akzeptiert)',
      'Führerschein (EU-Schein reicht)',
      'Fahrzeugschein (Zulassungsbescheinigung Teil I)',
      'Grüne Karte (Internationaler KFZ-Versicherungsnachweis)',
      'EU-Krankenversicherungskarte (EHIC/EHEC)',
      'Bei Mietwagen: Mietvertrag + Vollmacht',
      'Reiseversicherung / Notfallkarte',
    ],
  },
  {
    id: 'vignettes', label: 'Vignetten & Maut', icon: '🛂',
    items: [
      'Österreich: Autobahnvignette 10 Tage (15,40€) — digital kaufen auf asfinag.at',
      'Slowenien: DarsGo Vignette 7 Tage (15,50€) — darsgo.si',
      'Ungarn: e-Matrica 10 Tage (6,50€) — online oder an Grenze',
      'Kroatien: Maut bar/Karte (ca. 18€) — an den Mautstationen',
      'Serbien: Autobahnmaut bar/Karte (ca. 12€) — kein Vorkauf nötig',
      'Rumänien: Rovinieta 7 Tage (ca. 12€) — roviniete.ro oder Grenze',
      'Bulgarien: e-Vignette 7 Tage — bgtoll.bg oder an Grenze',
      'Türkei: HGS Transponder an Grenze kaufen (15–25€ Guthaben)',
      'Türkei: OGS Transponder-Alternative — an KAPIKULE Grenzstelle',
      'Griechenland: Maut Egnatia Odos & A1 (ca. 30€ gesamt)',
      'Nordmazedonien: PKW kostenlos — keine Vignette nötig',
    ],
  },
  {
    id: 'car', label: 'Auto & Sicherheit', icon: '🚗',
    items: [
      'Reifendruck prüfen (inkl. Reserverad)',
      'Reifenprofil mind. 3mm für lange Strecke',
      'Motoröl-Stand prüfen',
      'Kühlwasser prüfen',
      'Bremsflüssigkeit prüfen',
      'Scheibenwischerwasser (Sommermischung)',
      'Verbandskasten (Pflicht in TR, AT, HR)',
      'Warndreieck (mind. 1x, 2x empfohlen)',
      'Feuerlöscher (Pflicht in TR — 1kg min.)',
      'Warnweste (Pflicht in TR, HR, RS, BG)',
      'Ersatzglühbirnen-Set (Pflicht in einigen Ländern)',
      'Abschleppseil oder -stange',
      'Starthilfekabel',
      'Reifenreparaturset / Notrad',
    ],
  },
  {
    id: 'money', label: 'Geld & Währungen', icon: '💳',
    items: [
      'Kreditkarte Visa oder Mastercard (überall akzeptiert)',
      'Bargeld Euro (für AT, SI, HR, GR)',
      'Bargeld Serbischer Dinar (ca. 1500 RSD / 13€)',
      'Bargeld Bulgarischer Lew (ca. 25 BGN / 13€)',
      'Türkische Lira (in TR tauschen — besserer Kurs vor Ort)',
      'Ungarischer Forint optional (Kartenzahlung meist möglich)',
      'Reisekrankenversicherung mit Auslandsschutz',
      'Kfz-Auslandsschadenschutz (Schutzbrief ADAC/ÖAMTC)',
      'Notfallreserve in bar: mind. 200€',
    ],
  },
  {
    id: 'family', label: 'Familie & Kinder', icon: '👨‍👩‍👧',
    items: [
      'Kinderreisepass oder Personalausweis',
      'Kindersitz korrekt montiert & gesichert',
      'Sonnenschutz für Fenster',
      'Erste-Hilfe-Set für Kinder',
      'Fieberthermometer & Grundmedikamente',
      'Snacks & genug Getränke für Langstrecke',
      'Tablet / Spielzeug geladen',
      'Nackenkissen & Decke für Schlaf im Auto',
      'Krankenversicherungskarte auch für Kinder',
      'Schriftliche Einverständniserklärung (wenn Kind nur mit einem Elternteil)',
    ],
  },
  {
    id: 'health', label: 'Gesundheit & Apotheke', icon: '💊',
    items: [
      'Reisekrankenversicherung aktiv',
      'Persönliche Medikamente für gesamte Reisedauer',
      'Schmerzmittel (Ibuprofen / Paracetamol)',
      'Reiseübelkeitstabletten',
      'Durchfallmittel (Immodium o.ä.)',
      'Sonnencreme LSF 50+',
      'Mückenspray (Türkei, Balkan im Sommer)',
      'Pflaster & Wunddesinfektion',
      'Augentropfen für lange Fahrt',
      'Notfallkarte mit Blutgruppe & Allergien',
    ],
  },
  {
    id: 'tech', label: 'Technik & Navigation', icon: '📱',
    items: [
      'Handy vollgeladen',
      'Powerbank (20.000mAh empfohlen)',
      'Kfz-Ladekabel USB-C & Lightning',
      'Handyhalterung für Windschutzscheibe',
      'Offline-Karten geladen: Google Maps / HERE WeGo',
      'Reiseadapter für TR (Typ F passt überall)',
      'Dashcam (empfohlen für Schadensnachweis)',
      'Internationale Roaming-Daten aktivieren oder TR-SIM kaufen',
    ],
  },
  {
    id: 'border', label: 'Grenze & Einreise', icon: '🛃',
    items: [
      'Türkei Einreise: EU-Pass ohne Visum (90 Tage)',
      'Serbien: Kein Visum für EU-Bürger',
      'Bulgarien: EU-Innengrenze (kein Stopp)',
      'Ungarn: EU-Innengrenze (kein Stopp)',
      'Kroatien: EU-Innengrenze (kein Stopp)',
      'Fahrzeugversicherung gültig in allen Transitländern prüfen',
      'Haustiere: EU-Heimtierausweis + Tollwutimpfung (TR verlangt dies)',
      'Grüne Karte für alle Länder auf der Route gültig',
      'Notfallnummer TR gespeichert: 112 (allgemein), 156 (Gendarmerie)',
    ],
  },
]

const TABS = [
  { id: 'checklist', label: '✅ Checkliste' },
  { id: 'vehicle', label: '🚗 Fahrzeug' },
  { id: 'settings', label: '⚙️ Einstellungen' },
]

export default function ProfilePage() {
  const { user, setUser, checklist, toggleCheckItem, routeSettings, setRouteSettings } = useStore()
  const [activeSection, setActiveSection] = useState('checklist')
  const [saved, setSaved] = useState(false)

  const textMain = '#f5f5f5'
  const textMuted = 'rgba(255,255,255,0.4)'
  const border = 'rgba(255,255,255,0.09)'
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: textMain,
    padding: '11px 14px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  }

  const totalItems = CHECKLIST_CATEGORIES.flatMap(c => c.items).length
  const checkedItems = CHECKLIST_CATEGORIES.flatMap(c => c.items.map((_, i) => `${c.id}_${i}`)).filter(id => checklist[id]).length
  const progress = Math.round((checkedItems / totalItems) * 100)

  async function handleLogout() {
    await signOut(auth)
    setUser(null)
  }

  function handleSaveVehicle() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-container" style={{ background: 'linear-gradient(135deg, #060610 0%, #0a0a18 50%, #060610 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '30%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(100,60,255,0.05) 0%, transparent 60%)' }} />
      </div>

      <div className="relative z-10 px-4 pt-6 pb-24">

        {/* Profile Header — pure glass, no colors */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 mb-4 text-center relative overflow-hidden" style={glass}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {user?.photoURL
              ? <img src={user.photoURL} className="w-full h-full object-cover" alt="avatar" />
              : <User size={26} style={{ color: 'rgba(255,255,255,0.4)' }} />}
          </div>

          <div className="font-black text-lg mb-0.5" style={{ color: textMain }}>
            {user?.displayName || 'Gast'}
          </div>
          <div className="text-sm mb-3" style={{ color: textMuted }}>
            {user?.email || 'Gast-Modus'}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Star size={11} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Free Plan</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 p-1 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(tab => (
            <motion.button key={tab.id} whileTap={{ scale: 0.97 }} onClick={() => setActiveSection(tab.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold"
              style={activeSection === tab.id ? {
                background: 'rgba(255,255,255,0.09)',
                color: textMain,
                border: '1px solid rgba(255,255,255,0.13)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              } : {
                background: 'transparent',
                color: textMuted,
                border: '1px solid transparent',
              }}>
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── CHECKLISTE ── */}
          {activeSection === 'checklist' && (
            <motion.div key="checklist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Progress */}
              <div className="rounded-2xl p-4 mb-4" style={glass}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm" style={{ color: textMain }}>Reise-Checkliste</span>
                  <span className="font-black text-sm" style={{ color: progress === 100 ? '#4ade80' : 'rgba(255,255,255,0.6)' }}>
                    {progress}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: progress === 100 ? 'linear-gradient(90deg, #4ade80, #22c55e)' : 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2))' }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
                </div>
                <div className="text-xs" style={{ color: textMuted }}>{checkedItems} von {totalItems} erledigt</div>
              </div>

              {CHECKLIST_CATEGORIES.map((cat, ci) => (
                <motion.div key={cat.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.04 }}
                  className="mb-3">
                  <div className="text-xs font-bold mb-2 flex items-center gap-2 tracking-widest px-1"
                    style={{ color: textMuted }}>
                    <span>{cat.icon}</span> {cat.label.toUpperCase()}
                  </div>
                  <div className="rounded-2xl overflow-hidden" style={glass}>
                    {cat.items.map((item, i) => {
                      const id = `${cat.id}_${i}`
                      const checked = !!checklist[id]
                      return (
                        <motion.button key={id} whileTap={{ scale: 0.99 }}
                          onClick={() => toggleCheckItem(id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left"
                          style={{ borderBottom: i < cat.items.length - 1 ? `1px solid ${border}` : 'none' }}>
                          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                            style={checked ? {
                              background: 'rgba(74,222,128,0.15)',
                              border: '1px solid rgba(74,222,128,0.35)',
                            } : {
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.14)',
                            }}>
                            {checked && <Check size={11} style={{ color: '#4ade80' }} strokeWidth={3} />}
                          </div>
                          <span className="text-sm leading-snug flex-1"
                            style={{ color: checked ? textMuted : textMain, textDecoration: checked ? 'line-through' : 'none' }}>
                            {item}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── FAHRZEUG ── */}
          {activeSection === 'vehicle' && (
            <motion.div key="vehicle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl p-4 mb-3" style={glass}>
                <div className="text-xs font-bold mb-4 tracking-widest" style={{ color: textMuted }}>FAHRZEUG-EINSTELLUNGEN</div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: textMuted }}>KRAFTSTOFFART</label>
                    <div className="flex gap-2">
                      {['diesel', 'benzin'].map(f => (
                        <button key={f} onClick={() => setRouteSettings({ fuel: f })}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize"
                          style={routeSettings.fuel === f ? {
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            color: textMain,
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                          } : {
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: textMuted,
                          }}>
                          {f === 'diesel' ? '⛽ Diesel' : '⛽ Benzin'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1.5 flex justify-between" style={{ color: textMuted }}>
                      <span>VERBRAUCH (L/100KM)</span>
                      <span style={{ color: textMain }}>{routeSettings.consumption} L</span>
                    </label>
                    <input type="range" min={4} max={20} step={0.5} value={routeSettings.consumption}
                      onChange={e => setRouteSettings({ consumption: +e.target.value })}
                      className="w-full" style={{ accentColor: 'rgba(255,255,255,0.5)' }} />
                    <div className="flex justify-between text-xs mt-1" style={{ color: textMuted }}>
                      <span>4 L</span><span>20 L</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1.5 flex justify-between" style={{ color: textMuted }}>
                      <span>TANKGRÖSSE (LITER)</span>
                    </label>
                    <input type="number" min={30} max={120} step={5}
                      defaultValue={60}
                      style={inputStyle}
                      placeholder="z.B. 60 Liter" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: textMuted }}>FAHRZEUG (OPTIONAL)</label>
                    <input type="text" placeholder="z.B. VW Golf TDI 2019" style={inputStyle} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1.5 flex justify-between" style={{ color: textMuted }}>
                      <span>AKTUELLER KRAFTSTOFFPREIS</span>
                      <span style={{ color: textMain }}>{routeSettings.fuelPrice?.toFixed(2)} €/L</span>
                    </label>
                    <input type="range" min={1.0} max={2.5} step={0.05} value={routeSettings.fuelPrice}
                      onChange={e => setRouteSettings({ fuelPrice: +e.target.value })}
                      className="w-full" style={{ accentColor: 'rgba(255,255,255,0.5)' }} />
                    <div className="flex justify-between text-xs mt-1" style={{ color: textMuted }}>
                      <span>1,00 €</span><span>2,50 €</span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveVehicle}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: saved ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.08)',
                  border: saved ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,255,255,0.14)',
                  color: saved ? '#4ade80' : textMain,
                }}>
                {saved ? <><Check size={15} /> Gespeichert</> : <><Save size={15} /> Speichern</>}
              </motion.button>

              {/* Car tips */}
              <div className="mt-4 rounded-2xl p-4" style={glass}>
                <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: textMuted }}>TIPPS FÜR LANGE FAHRT</div>
                {[
                  { icon: '🔧', text: 'Kundendienst vor der Reise empfohlen bei über 10.000 km seit letzter Wartung' },
                  { icon: '🛞', text: 'Reifendruck bei kalten Reifen prüfen — Richtwert auf dem Fahrzeugtürpfosten' },
                  { icon: '⛽', text: 'Nie unter ¼ Tank fahren — Tankstellen in RS/BG können Lücken haben' },
                  { icon: '🌡️', text: 'Kühlwasser bei Sommerfahrten öfter kontrollieren' },
                ].map((tip, i) => (
                  <div key={i} className="flex gap-2.5 mb-2.5 last:mb-0">
                    <span className="text-base flex-shrink-0">{tip.icon}</span>
                    <span className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.55)' }}>{tip.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── EINSTELLUNGEN ── */}
          {activeSection === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-3">

              {[
                { icon: Map, label: 'Bevorzugte Route', sub: routeSettings.selectedRouteKey?.replace('_', ' ') || 'Österreich–Ungarn', color: '#4ade80' },
                { icon: Bell, label: 'Benachrichtigungen', sub: 'Grenzwarnungen, Community-Meldungen', color: '#60a5fa' },
                { icon: Shield, label: 'Datenschutz & AGB', sub: 'Daten & Berechtigungen verwalten', color: '#a78bfa' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.button key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-2xl p-4 flex items-center justify-between w-full text-left" style={glass}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Icon size={17} style={{ color: item.color }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: textMain }}>{item.label}</div>
                        <div className="text-xs mt-0.5 capitalize" style={{ color: textMuted }}>{item.sub}</div>
                      </div>
                    </div>
                    <ChevronRight size={15} style={{ color: textMuted }} />
                  </motion.button>
                )
              })}

              {/* Premium */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="rounded-3xl p-5 relative overflow-hidden" style={glass}>
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.25), transparent)' }} />
                <div className="text-xs font-bold mb-1 tracking-widest" style={{ color: 'rgba(251,191,36,0.7)' }}>⭐ PREMIUM</div>
                <div className="font-black text-base mb-0.5" style={{ color: textMain }}>Alles freischalten</div>
                <div className="text-xs mb-4" style={{ color: textMuted }}>KI Voice · Offline-Karten · PDF Export · Push-Warnungen</div>
                <motion.button whileTap={{ scale: 0.96 }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    background: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.2)',
                    color: 'rgba(251,191,36,0.8)',
                    boxShadow: 'inset 0 1px 0 rgba(251,191,36,0.08)',
                  }}>
                  Jetzt upgraden →
                </motion.button>
              </motion.div>

              {/* Logout */}
              {user && (
                <motion.button onClick={handleLogout} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
                  style={{
                    background: 'rgba(248,113,113,0.05)',
                    border: '1px solid rgba(248,113,113,0.12)',
                    color: '#f87171',
                  }}>
                  <LogOut size={15} /> Abmelden
                </motion.button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
