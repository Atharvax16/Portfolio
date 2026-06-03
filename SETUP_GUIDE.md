# 🚀 Atharva's Portfolio — Setup Guide

## Option 1: Quick Setup with Vite + React (Recommended)

### Step 1: Install Node.js
Download and install from: https://nodejs.org (LTS version)

### Step 2: Create the project
Open your terminal and run:

```bash
npm create vite@latest my-portfolio -- --template react
cd my-portfolio
npm install
```

### Step 3: Install Three.js
```bash
npm install three
```

### Step 4: Replace the main files

**Replace `src/App.jsx`** with the `portfolio.jsx` file content (the artifact I built for you).

**Replace `src/main.jsx`** with:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Replace `index.html`** with:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Atharva Kocharekar | Data Scientist & ML Engineer</title>
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Delete** these files (not needed):
- `src/App.css`
- `src/index.css`

### Step 5: Run it!
```bash
npm run dev
```
Open http://localhost:5173 in your browser. Done! 🎉

---

## Option 2: Deploy Live (Free)

### Using Vercel (Easiest):
1. Push your project to GitHub
2. Go to https://vercel.com
3. Sign in with GitHub
4. Click "Import Project" → select your repo
5. It auto-detects Vite and deploys
6. You get a free URL like: `atharva-portfolio.vercel.app`

### Using Netlify:
1. Go to https://netlify.com
2. Drag & drop your `dist` folder (after running `npm run build`)
3. Get a free URL instantly

### Using GitHub Pages:
1. Run `npm run build`
2. Push the `dist` folder to a `gh-pages` branch
3. Enable GitHub Pages in repo settings

---

## Folder Structure After Setup

```
my-portfolio/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── vite.svg
└── src/
    ├── main.jsx
    └── App.jsx        ← YOUR PORTFOLIO CODE GOES HERE
```

---

## Common Issues & Fixes

**"Module not found: three"**
→ Run: `npm install three`

**Blank white page**
→ Check browser console (F12) for errors
→ Make sure you deleted App.css and index.css imports

**3D brain not showing**
→ Make sure WebGL is enabled in your browser
→ Try Chrome or Firefox (latest)

**Fonts not loading**
→ Make sure you have internet connection (fonts load from Google Fonts CDN)

---

## To Edit Content Later

All your personal data is at the top of `App.jsx`:
- `BRAIN_REGIONS` — Skills mapped to brain areas
- `JOURNEY` — Your career timeline + mindset
- `SKILLS` — Skill bars and percentages  
- `PROJECTS` — Project cards with metrics
- `BLOGS` — Blog post previews
- Contact info — In the Contact section near the bottom

Just edit the text and save — Vite hot-reloads automatically!
