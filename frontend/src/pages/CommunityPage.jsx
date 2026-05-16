import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { IconFlag, IconCamera, IconPin, IconHeart, IconChat } from '../components/Icons'

const API = import.meta.env.VITE_API_BASE_URL || ''

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(28px) saturate(140%)',
  WebkitBackdropFilter: 'blur(28px) saturate(140%)',
  borderRadius: 22,
}

function Tag({ children, color = 'var(--turkis)', style: s }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '5px 9px', borderRadius: 999,
      background: `${color}22`, color,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
      textTransform: 'uppercase', border: `1px solid ${color}33`, ...s,
    }}>{children}</span>
  )
}

function Avatar({ name = '?', color = 'var(--turkis)', size = 36 }) {
  const initials = (name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, rgba(255,255,255,0.06))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#0A0C10', fontWeight: 800, fontSize: size * 0.38,
      border: `1px solid ${color}55`, fontFamily: 'var(--font-display)',
    }}>{initials}</div>
  )
}

function Post({ post, onLike }) {
  const { id, author, avatarColor, tag, tagColor, country, car, time, text, likes, liked, comments } = post
  return (
    <div style={{ ...glass, padding: '16px 16px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Avatar name={author} color={avatarColor || 'var(--turkis)'}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{author}</span>
            <Tag color={tagColor || 'var(--turkis)'} style={{ fontSize: 10, padding: '3px 7px' }}>{tag}</Tag>
          </div>
          <div style={{ display: 'flex', gap: 6, color: 'var(--fg-3)', fontSize: 11, flexWrap: 'wrap' }}>
            {country && <span>{country}</span>}
            {car && <><span>·</span><span>{car}</span></>}
            {time && <><span>·</span><span>{time}</span></>}
          </div>
        </div>
      </div>
      <p style={{ color: 'var(--fg-2)', fontSize: 14, lineHeight: 1.55, margin: '0 0 14px' }}>{text}</p>
      <div style={{ display: 'flex', gap: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
        <button onClick={() => onLike(id)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: liked ? '#E854A8' : 'var(--fg-3)', fontSize: 13, fontWeight: 600,
          fontFamily: 'var(--font-body)',
        }}>
          <IconHeart size={15}/> {likes}
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--fg-3)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
        }}>
          <IconChat size={15}/> {comments}
        </button>
      </div>
    </div>
  )
}

const ROOMS = [
  { id: 'Allgemein', label: 'Allgemein' },
  { id: 'Grenze',    label: '🛂 Grenze' },
  { id: 'Tanktipp',  label: '⛽ Tanktipps' },
  { id: 'Hotels',    label: '🏨 Hotels' },
  { id: 'Warnung',   label: '⚠️ Warnungen' },
]

const TAG_OPTS = ['Tipp', 'Grenze', 'Tanktipp', 'Hotel', 'Warnung']
const TAG_COLORS = { Grenze: '#FF8A3D', Tanktipp: '#38E58A', Hotel: '#4DA8FF', Warnung: '#E854A8', Tipp: '#F5B544' }
const AVATAR_COLORS = ['#38E58A','#FF8A3D','#4DA8FF','#F5B544','#E854A8','#B388FF']

export default function CommunityPage() {
  const { user } = useStore()
  const [activeRoom, setActiveRoom] = useState('Allgemein')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [composer, setComposer] = useState('')
  const [composerTag, setComposerTag] = useState('Tipp')
  const [sending, setSending] = useState(false)
  const [showComposer, setShowComposer] = useState(false)
  const userId = useRef(user?.uid || `anon_${Math.random().toString(36).slice(2)}`)
  const likedIds = useRef(new Set())

  async function loadPosts(room) {
    try {
      const r = await fetch(`${API}/api/community/posts?room=${encodeURIComponent(room)}`)
      const d = await r.json()
      if (d?.posts) setPosts(d.posts.map(p => ({ ...p, liked: likedIds.current.has(p.id) })))
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    loadPosts(activeRoom)
  }, [activeRoom])

  async function handleLike(id) {
    const already = likedIds.current.has(id)
    if (already) likedIds.current.delete(id)
    else likedIds.current.add(id)
    setPosts(ps => ps.map(p => p.id === id ? { ...p, likes: p.likes + (already ? -1 : 1), liked: !already } : p))
    try {
      await fetch(`${API}/api/community/posts/${id}/like`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.current }),
      })
    } catch {}
  }

  async function handleSend() {
    if (!composer.trim()) return
    setSending(true)
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    try {
      const r = await fetch(`${API}/api/community/posts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: user?.displayName || user?.email?.split('@')[0] || 'Reisender',
          text: composer.trim(),
          room: activeRoom === 'Allgemein' ? 'Allgemein' : activeRoom,
          tag: composerTag,
          avatarColor,
          country: '🇩🇪 → 🇹🇷',
        }),
      })
      const d = await r.json()
      if (d?.post) {
        setPosts(ps => [{ ...d.post, liked: false }, ...ps])
        setComposer('')
        setShowComposer(false)
      }
    } catch {}
    setSending(false)
  }

  return (
    <div style={{ minHeight: '100%', padding: '0 16px', paddingBottom: 110, position: 'relative' }}>

      {/* Aurora */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(40% 25% at 15% 6%, rgba(232,84,168,0.12), transparent 60%),
          radial-gradient(35% 20% at 85% 20%, rgba(245,181,68,0.10), transparent 60%)
        `,
      }}/>

      {/* Header */}
      <div style={{ position: 'relative', paddingTop: 52, paddingBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'var(--fg-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Topluluk · Community</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: -0.6 }}>
            Reisende <span style={{ color: '#E854A8' }}>heute</span>
          </div>
        </div>
        <button
          onClick={() => setShowComposer(v => !v)}
          style={{
            marginTop: 10, padding: '8px 16px', borderRadius: 14,
            background: showComposer ? 'rgba(232,84,168,0.2)' : 'rgba(245,181,68,0.15)',
            border: showComposer ? '1px solid rgba(232,84,168,0.4)' : '1px solid rgba(245,181,68,0.35)',
            color: showComposer ? '#E854A8' : 'var(--turkis)',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
          {showComposer ? '✕ Schließen' : '+ Beitrag'}
        </button>
      </div>

      {/* Room tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {ROOMS.map(r => (
          <button key={r.id} onClick={() => setActiveRoom(r.id)} style={{
            flexShrink: 0, padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
            background: activeRoom === r.id ? 'rgba(245,181,68,0.15)' : 'rgba(255,255,255,0.04)',
            color: activeRoom === r.id ? 'var(--turkis)' : 'var(--fg-3)',
            border: activeRoom === r.id ? '1px solid rgba(245,181,68,0.35)' : '1px solid rgba(255,255,255,0.08)',
            fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
          }}>{r.label}</button>
        ))}
      </div>

      {/* Composer */}
      {showComposer && (
        <div style={{ ...glass, padding: '16px', marginBottom: 16 }}>
          {/* Tag wählen */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {TAG_OPTS.map(t => (
              <button key={t} onClick={() => setComposerTag(t)} style={{
                padding: '5px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: composerTag === t ? `${TAG_COLORS[t]}22` : 'rgba(255,255,255,0.04)',
                color: composerTag === t ? TAG_COLORS[t] : 'var(--fg-3)',
                border: composerTag === t ? `1px solid ${TAG_COLORS[t]}44` : '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'var(--font-body)',
              }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Avatar name={user?.displayName || 'Du'} size={34} color={TAG_COLORS[composerTag] || 'var(--turkis)'}/>
            <div style={{ flex: 1 }}>
              <textarea
                value={composer}
                onChange={e => setComposer(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Teile einen Tipp, Grenzinfo oder Hotel-Empfehlung..."
                rows={3}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14, padding: '10px 12px', color: 'var(--fg)', fontSize: 14,
                  outline: 'none', resize: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !composer.trim()}
                style={{
                  marginTop: 8, width: '100%', padding: '11px 0', borderRadius: 14, border: 'none',
                  background: sending || !composer.trim() ? 'rgba(245,181,68,0.3)' : 'linear-gradient(180deg, #FFCC5C, #D49628)',
                  color: sending || !composer.trim() ? 'rgba(31,20,2,0.5)' : '#1F1402',
                  fontWeight: 800, fontSize: 14, cursor: sending || !composer.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                }}>
                {sending ? 'Wird gesendet…' : 'Veröffentlichen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned border alert — nur im Grenze-Tab oder Allgemein */}
      {(activeRoom === 'Allgemein' || activeRoom === 'Grenze') && (
        <div style={{
          marginBottom: 14, borderRadius: 22, padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(255,138,61,0.12), rgba(232,84,168,0.08))',
          border: '1px solid rgba(255,138,61,0.3)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <IconFlag size={18} style={{ color: 'var(--orange)' }}/>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)', boxShadow: '0 0 8px var(--orange)', display: 'inline-block' }}/>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--orange)', letterSpacing: 0.5 }}>LIVE · Grenzinfo</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Horgoš (HU/RS)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span className="sy-pump" style={{ fontSize: 22, color: 'var(--orange)' }}>~2h40</span>
            <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>Wartezeit · Community-Meldung</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag color="var(--orange)">14 Meldungen</Tag>
            <Tag color="var(--fg-3)">Zuletzt vor 8 Min.</Tag>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 130, borderRadius: 22, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }}/>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 14, padding: '40px 0' }}>
          Noch keine Beiträge — sei der Erste!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {posts.map(p => <Post key={p.id} post={p} onLike={handleLike}/>)}
        </div>
      )}
    </div>
  )
}
