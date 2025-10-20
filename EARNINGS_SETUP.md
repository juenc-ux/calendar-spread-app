# Earnings API Setup

Die Earnings-Funktion nutzt eine **Serverless API**, um CORS-Probleme zu umgehen.

## 🚀 Lokales Development

### Option 1: Mit Vercel CLI (Empfohlen)

```bash
# Vercel CLI installieren (einmalig)
npm install -g vercel

# Lokalen Dev-Server starten (inkl. API-Funktionen)
vercel dev
```

Die App läuft dann auf **http://localhost:3000** mit funktionierender Earnings-API!

### Option 2: Standard React (ohne Earnings)

```bash
npm start
```

⚠️ Earnings-Feature funktioniert nicht lokal ohne Vercel CLI (CORS-Error)

## ☁️ Deployment auf Vercel

1. **Vercel Account erstellen** (kostenlos)
   - Gehe zu https://vercel.com/signup

2. **GitHub Repository verbinden**
   - Push dein Projekt zu GitHub
   - Auf Vercel: "New Project" → GitHub Repo auswählen

3. **Automatisches Deployment**
   - Vercel erkennt automatisch das React-Projekt
   - API-Funktionen werden automatisch deployed
   - Fertig! 🎉

## 📂 Dateistruktur

```
/calendar-spread-app
  /api
    earnings.js          ← Serverless Function (holt Earnings-Daten)
  /src
    App.jsx             ← React App (ruft /api/earnings auf)
  vercel.json           ← Vercel-Konfiguration
```

## 🔧 Wie es funktioniert

```
Frontend (React)  →  /api/earnings  →  Yahoo Finance
                   (Serverless)
                   (Kein CORS!)
```

- **Lokal**: Vercel CLI simuliert die Serverless Function
- **Deployed**: Vercel hostet Frontend + API zusammen
- **Beide**: Keine CORS-Probleme! ✅

## 🎯 Test

Nach dem Start mit `vercel dev`:
1. Öffne http://localhost:3000
2. Ticker eingeben (z.B. TSLA)
3. "Load" klicken
4. **Gelbe Earnings-Box** sollte erscheinen! 📊

