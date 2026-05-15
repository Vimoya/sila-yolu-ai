import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    // Sobald ein neuer SW wartet → sofort aktivieren, Seite neu laden
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          sw.postMessage({ type: 'SKIP_WAITING' })
          navigator.serviceWorker.addEventListener('controllerchange', () => location.reload())
        }
      })
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
