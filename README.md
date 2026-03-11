# AI Radar Web v2.0

Real-time AI intelligence dashboard — web version of the AI Radar Chrome extension.

## ✨ Features

- **3 Themes** — Gen Z (glass/neon), Classic (editorial/minimal), Bold (brutalist)
- **Live feed** from 16+ AI sources via your existing GitHub Pages backend
- **Command palette** — ⌘K to search all articles instantly
- **Bookmarks** — save articles to localStorage with ★
- **Dedup engine** — same story from multiple sources merged automatically
- **Archive** — calendar browser for any past date
- **Skeleton loading** — shimmer placeholders while data loads
- **Toast notifications** — alerts when new items arrive
- **Auto-refresh** — polls every 5 minutes
- **TypeScript + Zod** — fully typed with schema validation

## 🚀 Deploy to Vercel (Free)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "AI Radar Web v2"
git remote add origin https://github.com/YOUR_USERNAME/ai-radar-web.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy** — done!

No environment variables needed. The app reads from your existing GitHub Pages backend.

## 🖥️ Local Development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## 🎨 Theme System

Three fully distinct aesthetics, switchable in the header:

| Theme | Fonts | Vibe |
|---|---|---|
| 🌐 Gen Z | Syne + JetBrains Mono | Dark glass, cyan/green neon |
| 📰 Classic | EB Garamond + DM Mono | Warm paper, editorial typography |
| ⚡ Bold | Bebas Neue + Barlow Condensed | Black/white, brutalist grid |

## 📁 Structure

```
src/
├── app/
│   ├── layout.tsx        — root layout, fonts, toaster
│   ├── globals.css       — CSS variables for all 3 themes
│   ├── page.tsx          — dashboard route
│   └── archive/page.tsx  — archive route
├── components/
│   ├── Dashboard.tsx     — main dashboard with all panels
│   ├── ArchivePage.tsx   — calendar archive browser
│   ├── NewsCard.tsx      — theme-aware news card + skeleton
│   ├── Header.tsx        — sticky header with theme switcher
│   ├── ThemeSwitcher.tsx — 3-button theme toggle
│   ├── RadarLogo.tsx     — SVG logo (adapts per theme)
│   ├── CommandPalette.tsx — ⌘K search overlay
│   ├── BookmarksPanel.tsx — slide-in saved articles panel
│   └── ThemeInitializer.tsx — reads localStorage on mount
├── lib/
│   ├── api.ts            — typed API client with Zod validation
│   ├── utils.ts          — helpers, dedup engine, bookmarks
│   └── store.ts          — Zustand global store
└── types/
    └── index.ts          — TypeScript types + Zod schemas
```

## Backend

This app reads from: `https://veltrix-projects.github.io/ai-radar-backend`

Same backend as the Chrome extension — no changes needed.
