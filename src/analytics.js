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

/* The hash router serves four rooms from one document, so the script is
   loaded with no_onload and each route change is counted by hand — otherwise
   only the first room a visitor lands in would ever register. */
const pagePath = () =>
  window.location.pathname + window.location.search + window.location.hash;

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

/* Site-wide visitor total for the footer line. "TOTAL" is GoatCounter's
   special path for the whole site (case-sensitive, no leading slash), and
   the count comes back already formatted, e.g. {"count":"1,284"}. The
   response also carries count_unique, but it is a duplicate of count kept
   for backwards compatibility — there is only one number to show.

   A genuine zero comes back as the string "0", which is truthy — so it is
   turned into null here rather than left to render a footer that brags
   about having had no visitors. */
export async function fetchVisitorCount() {
  if (!GC_HOST) return null;
  const r = await fetch(`${GC_HOST}/counter/TOTAL.json`);
  if (!r.ok) throw new Error(`GoatCounter counter: HTTP ${r.status}`);
  const d = await r.json();
  return Number(String(d.count).replace(/[^0-9]/g, "")) > 0 ? d.count : null;
}
