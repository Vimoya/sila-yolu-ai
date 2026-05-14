# Sıla Yolu AI 🚗🇹🇷

**Dein smarter Reiseassistent für die Fahrt in die Türkei.**

Premium Mobile-First Webapp für Autofahrer aus ganz Europa.

---

## Quick Start

```bash
# Frontend
cd frontend
cp .env.example .env     # Firebase Keys eintragen
npm install
npm run dev              # http://localhost:5173

# Backend
cd backend
cp .env.example .env     # OpenAI, Stripe, Firebase Keys eintragen
npm install
npm run dev              # http://localhost:3000
```

---

## Features

- **Route berechnen** — Europa → Türkei, alle Startländer, mit Kosten
- **Live Grenze** — Kapıkule, Hamzabeyli, İpsala + Community Meldungen
- **Tankpreise** — Deutschland, Österreich, Community-Preise
- **KI Chat** — OpenAI-powered, Fallback offline
- **Voice Assistent** — Web Speech API, Deutsch/Türkisch
- **Community** — Realtime Chat (Firestore), 6 Räume
- **Checkliste** — Offline, persistent
- **Dark/Light Mode**
- **PWA-ready**

---

## Tech Stack

| Bereich | Tech |
|---------|------|
| Frontend | React + Vite + Tailwind CSS + framer-motion |
| Backend | Node.js + Express |
| Auth | Firebase Auth |
| DB | Firestore |
| Storage | Firebase Storage |
| KI | OpenAI API (gpt-4o-mini) |
| Voice | Web Speech API |
| Karten | OpenStreetMap (vorbereitet) |
| Payments | Stripe (vorbereitet) |
| Hosting | Railway |

---

## Railway Deployment

### Frontend
1. Neues Railway Projekt erstellen
2. GitHub Repo verbinden → `frontend/` Ordner
3. Env Variablen aus `.env.example` eintragen
4. Deploy

### Backend
1. Neuen Service im selben Railway Projekt
2. GitHub Repo → `backend/` Ordner
3. Env Variablen eintragen
4. Deploy
5. URL in Frontend `VITE_API_BASE_URL` eintragen

---

## Env Variablen

### Frontend (`frontend/.env`)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=https://your-backend.railway.app
```

### Backend (`backend/.env`)
```
PORT=3000
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
FIREBASE_PROJECT_ID=
TANKERKOENIG_API_KEY=
```

---

## Firebase Setup

1. Firebase Projekt erstellen
2. Authentication → Email/Password aktivieren
3. Firestore → Datenbank erstellen
4. Firebase Keys in Frontend `.env` eintragen

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{roomId}/msgs/{msgId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /borderReports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Affiliate Links

Konfiguration: `frontend/src/config/affiliateLinks.js`

- Österreich Vignette
- Ungarn Vignette
- Slowenien Vignette
- Türkei HGS
- Reiseversicherung
- Hotels (Booking.com)
