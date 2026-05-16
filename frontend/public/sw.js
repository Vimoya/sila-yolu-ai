const CACHE = 'sila-assets-v20260516-5'

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// Network-first für index.html, cache-first für Assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Nur same-origin und GET
  if (e.request.method !== 'GET' || url.origin !== location.origin) return

  // API-Calls nie cachen
  if (url.pathname.startsWith('/api/')) return

  // index.html → immer vom Netz, Fallback Cache
  if (url.pathname === '/' || url.pathname === '/index.html' || !url.pathname.includes('.')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      }).catch(() => caches.match('/index.html'))
    )
    return
  }

  // Assets (/assets/**) → cache-first, Vite hash sorgt für Invalidierung
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request)
      if (cached) return cached
      const res = await fetch(e.request)
      cache.put(e.request, res.clone())
      return res
    })
  )
})

// Alten Cache beim Update löschen
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})
