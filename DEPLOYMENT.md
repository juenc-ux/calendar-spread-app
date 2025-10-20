# 🚀 Vercel Deployment Guide

## ✅ Was ist bereits fertig:

- ✅ `vercel.json` - Konfiguration
- ✅ `api/earnings.js` - Serverless Function (umgeht CORS)
- ✅ `src/App.jsx` - Nutzt die Serverless API

## 📦 Deployment-Schritte:

### Option 1: Vercel Web UI (EINFACHSTE Methode! ⭐)

1. **Gehe zu [vercel.com](https://vercel.com)**
2. **Klicke "Add New..." → "Project"**
3. **Importiere dein GitHub Repository**
4. **Klicke "Deploy"**

**FERTIG!** 🎉 Vercel erkennt automatisch:
- React App
- Serverless Functions im `/api` Ordner
- Build-Konfiguration

### Option 2: Vercel CLI

```bash
# 1. Login
vercel login

# 2. Deploy
vercel

# 3. Für Production
vercel --prod
```

## 🔧 Was Vercel automatisch macht:

1. **Build**: `npm run build`
2. **Deploy**: Static Files nach CDN
3. **API Routes**: `/api/earnings` als Serverless Function
4. **CORS**: Kein Problem mehr! Server-Side Fetch 🎯

## 🌐 Nach dem Deployment:

Die App wird unter einer URL wie:
```
https://dein-projekt.vercel.app
```

verfügbar sein.

Die Earnings-Funktion funktioniert automatisch unter:
```
https://dein-projekt.vercel.app/api/earnings?symbol=TSLA
```

## 💡 Lokales Testen (Optional):

```bash
npm start
# Die App läuft auf http://localhost:3000
# Die API läuft auf http://localhost:3000/api/earnings
```

**WICHTIG**: Lokal muss `/api/earnings` durch einen Proxy gehen (siehe `package.json` → `"proxy": "http://localhost:3001"`). Auf Vercel funktioniert es automatisch!

## 🎯 Nächste Schritte:

1. Committe alle Änderungen:
   ```bash
   git add .
   git commit -m "Add earnings feature with Vercel serverless function"
   git push
   ```

2. Gehe zu vercel.com und deploye!

Das war's! 🎉

