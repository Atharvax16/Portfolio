# Conference & Deadline Planner

A static page (HTML + CSS + vanilla JS, no build step of its own), live at
**https://atharvax16.github.io/Portfolio/conferences/**.

| File | What it is |
| --- | --- |
| `conferences.json` | **All the data. This is the only file you normally edit.** |
| `index.html` | Page skeleton (header, sections). |
| `style.css` | Design. Colours are tokens at the top; dark mode is redefined once below them. |
| `app.js` | Rendering, filters, countdowns, .ics export. Labels for tiers/fields/types are at the top. |

## Editing a conference

Each entry in `conferences` looks like this:

```json
{
  "id": "midl-2027",                  // unique, lowercase; also the key for your saved notes
  "name": "MIDL 2027",
  "field": "medical",                 // medical | ml | cv
  "tier": "primary",                  // primary | stretch | long-shot | low-stakes
  "status": "official",               // official | estimate   (never "passed", see below)
  "location": "Porto, Portugal",
  "dates": { "start": "2027-07-14", "end": "2027-07-16" },   // or { "text": "July 2027" }
  "datesNote": "Doctoral symposium 13 July",                 // optional
  "pageLimit": "10 pages",                                    // optional
  "notes": "Free text shown in the detail panel",            // optional
  "url": "https://2027.midl.io/important-dates",
  "milestones": [
    { "type": "paper", "date": "2026-12-04", "tz": "AoE", "deadline": true, "note": "optional" },
    { "type": "rebuttal", "start": "2027-01-18", "date": "2027-01-24" },
    { "type": "notification", "date": "2027-02-12" }
  ]
}
```

(JSON has no comments. The `//` notes above are only for explanation, so don't copy them.)

- **Dates** are ISO `YYYY-MM-DD`.
- **`deadline: true`** puts a milestone in *Next up*, the timeline, the table and the .ics export.
  Milestones without it (reviews, notification, camera-ready…) only appear in the detail panel.
- **`type`**: `abstract`, `paper`, `registration`, `workshop`, `supplementary`, `reviews`,
  `rebuttal`, `notification`, `camera-ready`. Add `"label"` to override the display text.
- **`tz`**: deadlines count to 23:59 in the given zone:
  - `"AoE"`: Anywhere on Earth, UTC−12 (the latest possible).
  - `"US-Eastern"`: New York time, daylight saving handled automatically.
  - `"local"`: 23:59 in *your* browser's time zone. Use it when the venue doesn't state a zone (it's the safe choice).
- **Passed** is computed from the clock. Once a deadline's time is gone it greys out and hides
  (toggle the *Passed* filter to show it). You never need to mark it by hand.
- **Estimate → official:** when a venue announces dates, change `"status"` to `"official"` and fix
  the dates. A single milestone can also carry its own `"status"` to override the conference's.
- Update `"lastVerified"` at the top whenever you re-check the dates. The strategy card is the
  `"strategy"` list in the same file.

Your per-conference notes are stored in your browser's localStorage (key `cdp-note:<id>`),
so they stay on the device and browser you typed them in.

## Previewing locally

`fetch()` doesn't work over `file://`, so serve the folder:

```bash
cd public/conferences && python3 -m http.server 8000
# open http://localhost:8000
```

(or run `npm run dev` at the repo root and open `/conferences/`).

## Deploying

This folder sits in the portfolio's `public/`, which Vite copies verbatim into `dist/`.
The existing GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes on
every push to `master`, so deploying is just:

```bash
git add public/conferences && git commit -m "Update deadlines" && git push
```

The site updates a minute or two after the Actions run finishes.
