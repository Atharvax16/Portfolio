import { useState, useEffect, useCallback } from "react";
import { P, PAPER, METRICS, METRIC_FAMILIES } from "./data.js";
import { MetricParts, SketchRankStability } from "./ui.jsx";

/* Type tokens — same as the paper, so the room reads as the same hand. */
const DISP = { fontFamily: "'Spectral',Georgia,serif" };
const BODY = { fontFamily: "'Source Serif 4',Georgia,serif" };
const MONO = { fontFamily: "'IBM Plex Mono',monospace" };

/* `figure` on a metric names its sketch; only the argument that needs drawing
   carries one, and the caption travels with it rather than living in App. */
const FIGURES = {
  rankStability: {
    render: () => <SketchRankStability />,
    ratio: "440 / 260",
    caption:
      "Score the same fundus twice — clean and degraded — flatten both saliency maps, and correlate their ranks. Spearman is Pearson on ranks, so it is invariant to any monotone transform of the heatmap: Grad-CAM's smooth non-negative blobs and IG's signed pixel-level noise become comparable, because the only surviving question is whether pixel A still outranks pixel B.",
  },
};

/* ── the hash route: #/metrics → first entry, #/metrics/<key> → that entry ──
   Hash routing (not history) so the built site works unchanged on GitHub
   Pages. The paper's own "#Metrics" anchor is a different string and is
   deliberately left alone. */
export function currentMetricKey() {
  const m = window.location.hash.match(/^#\/metrics\/([\w-]+)/);
  const hit = m && METRICS.find((x) => x.key === m[1]);
  return hit ? hit.key : METRICS[0].key;
}

export default function Instruments() {
  const [key, setKey] = useState(currentMetricKey);
  const [railOpen, setRailOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setKey(currentMetricKey());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((k) => {
    window.location.hash = `#/metrics/${k}`;
    setRailOpen(false);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const idx = METRICS.findIndex((m) => m.key === key);
  const met = METRICS[idx] || METRICS[0];
  const prev = METRICS[idx - 1];
  const next = METRICS[idx + 1];

  /* ←/→ walk the shelf, Esc returns to the paper. Unlike the Lab's benches
     nothing in here owns the arrow keys, but the same focus guard is kept so
     the two rooms behave identically. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const a = document.activeElement;
      const inMain = a && a !== document.body && a.closest?.(".ir-main");
      if (inMain && e.key !== "Escape") return;
      if (e.key === "ArrowRight" && next) { e.preventDefault(); go(next.key); }
      else if (e.key === "ArrowLeft" && prev) { e.preventDefault(); go(prev.key); }
      else if (e.key === "Escape") { window.location.hash = "#Metrics"; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go]);

  /* Restore the paper's <title> on the way out, and land at the top —
     arriving from the paper carries that page's scroll offset over. */
  useEffect(() => {
    const paperTitle = document.title;
    window.scrollTo(0, 0);
    return () => { document.title = paperTitle; };
  }, []);

  useEffect(() => {
    document.title = `${met.name} · Instrument Room — ${PAPER.author}`;
  }, [met]);

  const families = METRIC_FAMILIES
    .map((f) => ({ family: f, items: METRICS.filter((m) => m.family === f) }))
    .filter((g) => g.items.length);

  const absent = METRICS.filter((m) => m.absent).length;
  const fig = met.figure ? FIGURES[met.figure] : null;

  return (
    <>
      <style>{`
        .ir{--rail:236px}
        .ir-grid{display:grid;grid-template-columns:var(--rail) minmax(0,1fr);align-items:start;
          max-width:1180px;margin:0 auto;padding:0 1.4rem}
        .ir-rail{position:sticky;top:0;max-height:100vh;overflow-y:auto;padding:1.6rem 1.2rem 3rem 0;
          border-right:1px solid ${P.line}}
        .ir-main{padding:1.6rem 0 4rem 2rem;min-width:0}
        .ir-item{display:block;width:100%;text-align:left;background:transparent;border:none;
          padding:5px 8px;cursor:pointer;border-left:2px solid transparent;transition:background .15s,border-color .15s}
        .ir-item:hover{background:${P.faint}}
        .ir-item[aria-current="true"]{border-left-color:${P.accent};background:${P.accentSoft}}
        .ir-railtoggle{display:none}
        @media(max-width:900px){
          .ir-grid{grid-template-columns:1fr;padding:0 1rem}
          .ir-rail{position:static;max-height:none;border-right:none;border-bottom:1px solid ${P.line};
            padding:0 0 1rem;margin-bottom:1.2rem}
          .ir-main{padding:0 0 3rem}
          .ir-railtoggle{display:block}
          .ir-rail[data-open="false"]{display:none}
        }
        @media(prefers-reduced-motion:reduce){.ir *{transition:none!important;animation:none!important}}
      `}</style>

      <div className="ir" style={{ minHeight: "100vh", background: P.paper, color: P.ink }}>

        {/* RUNNING HEAD — deliberately not the portfolio's nav. You've left the paper. */}
        <header style={{ borderBottom: `2px solid ${P.ink}`, background: P.paper2 }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0.7rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...MONO, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: P.ink }}>Instrument Room</span>
              <span style={{ ...MONO, fontSize: "0.58rem", color: P.sub }}>
                {METRICS.length} metrics · <span style={{ color: P.red }}>{absent} deliberately not reported</span>
              </span>
            </div>
            <a href="#Metrics" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>← back to the paper</a>
          </div>
        </header>

        <div className="ir-grid">

          {/* ── INDEX RAIL ── */}
          <div>
            <button
              className="ir-railtoggle"
              onClick={() => setRailOpen((v) => !v)}
              aria-expanded={railOpen}
              style={{ ...MONO, fontSize: "0.66rem", color: P.ink, background: P.paper2, border: `1px solid ${P.line}`, padding: "7px 11px", cursor: "pointer", width: "100%", textAlign: "left", margin: "1rem 0 0.6rem" }}
            >
              {railOpen ? "▾" : "▸"} index — {met.short}
            </button>

            <nav className="ir-rail" data-open={railOpen} aria-label="Metrics">
              {families.map((g) => (
                <div key={g.family} style={{ marginBottom: "1.15rem" }}>
                  <div style={{ ...MONO, fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.13em", color: P.sub, marginBottom: 5, paddingLeft: 8 }}>{g.family}</div>
                  {g.items.map((m) => {
                    const on = m.key === met.key;
                    return (
                      <button key={m.key} className="ir-item" onClick={() => go(m.key)} aria-current={on} title={m.headline}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ ...MONO, fontSize: "0.72rem", color: on ? P.accent : m.absent ? P.red : P.ink, lineHeight: 1.35 }}>{m.short}</span>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: m.absent ? "transparent" : P.green, border: m.absent ? `1px solid ${P.red}` : "none" }} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
              <div style={{ ...MONO, fontSize: "0.54rem", color: P.sub, lineHeight: 1.7, borderTop: `1px solid ${P.line}`, paddingTop: 9, marginTop: 4, paddingLeft: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: P.green }} /> measured</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 10 }}><span style={{ width: 6, height: 6, borderRadius: "50%", border: `1px solid ${P.red}` }} /> not measured</span>
                <div style={{ marginTop: 7 }}>← → to walk the shelf · esc to leave</div>
              </div>
            </nav>
          </div>

          {/* ── THE INSTRUMENT ── */}
          <main className="ir-main">
            <div style={{ ...MONO, fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.13em", color: P.sub, marginBottom: 7 }}>
              {met.family} · {String(idx + 1).padStart(2, "0")} / {String(METRICS.length).padStart(2, "0")}
            </div>
            <h1 style={{ ...DISP, fontWeight: 600, fontSize: "clamp(1.6rem,4vw,2.3rem)", lineHeight: 1.1, letterSpacing: "-0.02em", color: P.ink, marginBottom: 8 }}>
              {met.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: "1rem" }}>
              <span style={{ ...MONO, fontSize: "0.7rem", color: met.absent ? P.red : P.accent, border: `1px solid ${met.absent ? `${P.red}66` : `${P.accent}44`}`, borderStyle: met.absent ? "dashed" : "solid", padding: "4px 9px" }}>{met.symbol}</span>
            </div>
            <p style={{ ...BODY, fontSize: "1rem", fontStyle: "italic", lineHeight: 1.7, color: met.absent ? P.red : P.sub, maxWidth: 620, marginBottom: "1.6rem", textWrap: "pretty" }}>
              {met.headline}
            </p>

            {fig && (
              <figure style={{ margin: "0 0 1.8rem", maxWidth: 640 }}>
                <div style={{ border: `1px solid ${P.line}`, background: P.paper2, aspectRatio: fig.ratio }}>
                  {fig.render()}
                </div>
                <figcaption style={{ ...MONO, fontSize: "0.66rem", color: P.sub, marginTop: 8, lineHeight: 1.6 }}>
                  <b style={{ color: P.ink }}>The instrument.</b> {fig.caption}
                </figcaption>
              </figure>
            )}

            <MetricParts m={met} />

            {/* ── walk the shelf ── */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "2.4rem", paddingTop: "1rem", borderTop: `2px solid ${P.ink}` }}>
              {prev ? (
                <button onClick={() => go(prev.key)} style={{ ...MONO, fontSize: "0.68rem", color: P.accent, background: "transparent", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                  ← {prev.short}
                  <div style={{ ...MONO, fontSize: "0.56rem", color: P.sub, marginTop: 3 }}>{prev.family}</div>
                </button>
              ) : <span />}
              {next ? (
                <button onClick={() => go(next.key)} style={{ ...MONO, fontSize: "0.68rem", color: P.accent, background: "transparent", border: "none", cursor: "pointer", padding: 0, textAlign: "right" }}>
                  {next.short} →
                  <div style={{ ...MONO, fontSize: "0.56rem", color: P.sub, marginTop: 3 }}>{next.family}</div>
                </button>
              ) : <span />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
