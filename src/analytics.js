/* ════════════════════════════════════════
   VISITOR COUNTING — GoatCounter
   ════════════════════════════════════════
   Free, cookieless, no personal data stored, so no consent banner is needed.
   The site is static (GitHub Pages, no server), so counting happens in the
   browser and the dashboard lives at <code>.goatcounter.com.

   SETUP (one time):
     1. Sign up at https://www.goatcounter.com — pick a code, e.g. "atharvax".
     2. Put that code in GC_CODE below and push.
     3. For the footer counter: Settings → "Allow adding visitor counts to
        your website" must be on, otherwise /counter/TOTAL.json returns 403.

   Until GC_CODE is filled in, nothing loads and nothing is sent — the site
   behaves exactly as it does today. */
export const GC_CODE = "atharvax";

export const GC_HOST = GC_CODE ? `https://${GC_CODE}.goatcounter.com` : "";

/* Never count local development — the numbers are for real visitors. */
const isLocal = () =>
  ["localhost", "127.0.0.1", "::1", ""].includes(window.location.hostname);

export const analyticsOn = () => Boolean(GC_CODE) && !isLocal();

/* The rooms the hash router serves from the one document. Sub-routes
   (#/lab/<arch>, #/metrics/<key>) are folded into their room: the public
   counter endpoint has no wildcard, so a path can only be read back if it
   was recorded exactly — and four clean rows beat twenty near-duplicates in
   the dashboard anyway. */
export const ROOMS = [
  { key: "paper", label: "paper", hash: "" },
  { key: "lab", label: "lab", hash: "#/lab" },
  { key: "metrics", label: "metrics", hash: "#/metrics" },
  { key: "resume", label: "cv", hash: "#/resume" },
  { key: "orthovision", label: "orthovision", hash: "#/orthovision" },
];

const roomFor = hash => ROOMS.find(r => r.hash && hash.startsWith(r.hash)) || ROOMS[0];

/* The script is loaded with no_onload and each route change counted by hand
   — otherwise only the room a visitor first landed in would ever register. */
const pagePath = () => window.location.pathname + roomFor(window.location.hash).hash;

let script = null;
function loadScript() {
  if (script) return script;
  script = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `${GC_HOST}/count`;
    s.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return script;
}

/* Fire-and-forget: an ad blocker or an offline visitor must never surface as
   a broken page, so every failure path is swallowed. */
export function countPageview() {
  if (!analyticsOn()) return;
  const path = pagePath();
  loadScript()
    .then(() => window.goatcounter && window.goatcounter.count({ path }))
    .catch(() => {});
}

/* ── Reading the numbers back ──────────────────────────────────────────
   Everything below reads GoatCounter's public counter endpoint, which needs
   no API token. It reports VISITORS, not raw pageviews: the response also
   carries count_unique, but that is a duplicate of count kept for backwards
   compatibility. True hit counts live behind /api/v0/stats, which 401s
   without a token — and a static site has nowhere to keep one.

   The numbers refresh hourly (GoatCounter rebuilds the public view on the
   hour) and the endpoint sets a 4-hour cache, so treat them as a lagging
   total, not a live ticker. */

const toNum = v => Number(String(v).replace(/[^0-9]/g, "")) || 0;

/* One counter read. A path with nothing recorded yet answers 404 rather than
   zero, which is a normal state here — a room simply nobody has opened. */
async function counter(path, query = "") {
  const r = await fetch(`${GC_HOST}/counter/${encodeURIComponent(path)}.json${query}`);
  if (r.status === 404) return { n: 0, text: "0" };
  if (!r.ok) throw new Error(`GoatCounter counter: HTTP ${r.status}`);
  const d = await r.json();
  return { n: toNum(d.count), text: d.count };
}

const isoDay = d => d.toISOString().slice(0, 10);

/* Site total, the trailing 30 days, and a per-room breakdown, fetched
   together. "TOTAL" is GoatCounter's special all-site path (case-sensitive,
   no leading slash); the rooms are read at the same paths countPageview
   writes, so the two always agree. */
export async function fetchStats() {
  if (!GC_HOST) return null;
  const base = window.location.pathname;
  const now = new Date();
  const from = new Date(now.getTime() - 29 * 864e5);
  const window30 = `?start=${isoDay(from)}&end=${isoDay(now)}`;

  const [total, month, ...rooms] = await Promise.all([
    counter("TOTAL"),
    counter("TOTAL", window30),
    ...ROOMS.map(r => counter(base + r.hash)),
  ]);

  return {
    total,
    month,
    rooms: ROOMS.map((r, i) => ({ ...r, ...rooms[i] })),
  };
}
