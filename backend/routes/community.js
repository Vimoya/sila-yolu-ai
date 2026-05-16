import { Router } from 'express'

const router = Router()

// In-memory posts — resets on deploy, realistisch für MVP
const posts = [
  {
    id: 'p1', author: 'Mehmet K.', avatarColor: '#38E58A', tag: 'Tanktipp', tagColor: '#38E58A',
    room: 'Allgemein', country: '🇩🇪 → 🇹🇷', car: 'VW Passat',
    text: 'Dieselpreise in Bulgarien gerade super günstig! In Plovdiv nur 1,28€ — volltanken nicht vergessen bevor Kapıkule!',
    likes: 24, likedBy: [], comments: 7, createdAt: Date.now() - 12 * 60 * 1000,
  },
  {
    id: 'p2', author: 'Ayşe T.', avatarColor: '#FF8A3D', tag: 'Grenze', tagColor: '#FF8A3D',
    room: 'Grenze', country: '🇷🇸 → 🇧🇬', car: 'BMW X5',
    text: 'Horgoš-Grenze: Wartezeit ca. 1h 20min. LKW-Spur läuft schneller heute. Frühmorgens war es aber viel schlimmer.',
    likes: 41, likedBy: [], comments: 12, createdAt: Date.now() - 38 * 60 * 1000,
  },
  {
    id: 'p3', author: 'Yılmaz F.', avatarColor: '#4DA8FF', tag: 'Hotel', tagColor: '#4DA8FF',
    room: 'Hotels',  country: '🇩🇪', car: 'Mercedes E220d',
    text: 'Hotel Garni in Niš empfehlenswert — 35€ DZ, sauber, eigener Parkplatz, gutes Frühstück. Perfekt für die Übernachtung auf der Sıla-Route.',
    likes: 18, likedBy: [], comments: 4, createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: 'p4', author: 'Fatma S.', avatarColor: '#F5B544', tag: 'Tipp', tagColor: '#F5B544',
    room: 'Allgemein', country: '🇩🇪 → 🇹🇷', car: 'Skoda Octavia',
    text: 'Tipp für Familien: Rastplatz kurz vor Budapest auf der M1 hat saubere Toiletten und Spielbereich für Kinder. Sehr empfehlenswert für die Pause!',
    likes: 33, likedBy: [], comments: 9, createdAt: Date.now() - 4 * 60 * 60 * 1000,
  },
  {
    id: 'p5', author: 'Hasan D.', avatarColor: '#E854A8', tag: 'Warnung', tagColor: '#E854A8',
    room: 'Grenze', country: '🇧🇬 → 🇹🇷', car: 'Ford Transit',
    text: 'Kapıkule heute Nacht sehr voll — 3 Stunden gewartet. Tagsüber zwischen 10-14 Uhr soll es laut anderen Fahrern viel besser sein.',
    likes: 56, likedBy: [], comments: 21, createdAt: Date.now() - 6 * 60 * 60 * 1000,
  },
]

let nextId = 100

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return 'gerade eben'
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`
  return `vor ${Math.floor(diff / 86400)} Tagen`
}

function formatPost(p) {
  return { ...p, likedBy: undefined, time: timeAgo(p.createdAt) }
}

router.get('/posts', (req, res) => {
  const { room } = req.query
  let filtered = [...posts].sort((a, b) => b.createdAt - a.createdAt)
  if (room && room !== 'Allgemein') filtered = filtered.filter(p => p.room === room)
  res.json({ posts: filtered.map(formatPost) })
})

router.post('/posts', (req, res) => {
  const { author, text, room, country, car, tag, avatarColor } = req.body
  if (!text?.trim()) return res.status(400).json({ error: 'text required' })
  const tagMap = { Grenze: '#FF8A3D', Tanktipp: '#38E58A', Hotel: '#4DA8FF', Warnung: '#E854A8', Tipp: '#F5B544' }
  const post = {
    id: `p${nextId++}`,
    author: author || 'Reisender',
    avatarColor: avatarColor || '#F5B544',
    tag: tag || 'Tipp',
    tagColor: tagMap[tag] || '#F5B544',
    room: room || 'Allgemein',
    country: country || '🇩🇪 → 🇹🇷',
    car: car || '',
    text: text.trim(),
    likes: 0, likedBy: [], comments: 0,
    createdAt: Date.now(),
  }
  posts.unshift(post)
  if (posts.length > 200) posts.pop()
  res.json({ post: formatPost(post) })
})

router.post('/posts/:id/like', (req, res) => {
  const post = posts.find(p => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'not found' })
  const { userId } = req.body
  if (userId && post.likedBy.includes(userId)) {
    post.likedBy = post.likedBy.filter(u => u !== userId)
    post.likes = Math.max(0, post.likes - 1)
  } else {
    if (userId) post.likedBy.push(userId)
    post.likes++
  }
  res.json({ likes: post.likes, liked: userId ? post.likedBy.includes(userId) : true })
})

router.get('/rooms', (_, res) => {
  res.json({
    rooms: [
      { id: 'Allgemein', name: 'Allgemein', icon: '💬' },
      { id: 'Grenze', name: 'Grenze Live', icon: '🛂' },
      { id: 'Tanktipp', name: 'Tankstipps', icon: '⛽' },
      { id: 'Hotels', name: 'Hotels', icon: '🏨' },
      { id: 'Warnung', name: 'Warnungen', icon: '⚠️' },
    ],
  })
})

export default router
