# Atharva Kocharekar — Portfolio

A research-portfolio website typeset like an academic preprint. Positions the
work around machine-learning research: robustness, explainability, diffusion-based
restoration, and generative-image forensics.

**Live:** https://atharvax16.github.io/Portfolio/

## Stack

- **React 19** + **Vite 6**
- Inline CSS-in-JS (no CSS framework)
- Fonts: Spectral (display) · Source Serif 4 (body) · IBM Plex Mono (utility)

## Run locally

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Project structure

```
src/
  main.jsx     # entry point
  App.jsx      # page layout (title block, numbered sections, nav)
  data.js      # palette, paper front-matter, and all content arrays
  ui.jsx       # shared components (Rv, Radar, ResearchModal, PhotoGallery, …)
public/
  images/      # portrait, gallery photos, and research figures/plots
```

**Editing content:** everything lives in `src/data.js` — projects, the reading
log, research focus areas, methods, and the journey timeline. Projects flagged
`placeholder: true` carry TODO fields shown as a draft banner in the case-study modal.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the app
and publishes `dist/` to GitHub Pages via GitHub Actions. One-time setup:
**Settings → Pages → Source = GitHub Actions**.
