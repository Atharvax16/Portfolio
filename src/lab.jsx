import { useState, useEffect, useCallback, Fragment } from "react";
import { P, PAPER, ARCHITECTURES, ARCH_FAMILIES, LIVE_ARCHITECTURES } from "./data.js";
import {
  VitWalkthrough, CnnWalkthrough, DetectionParadigms, Dinov2Walkthrough, SteerVitWalkthrough,
  RagWalkthrough, MemoryBankWalkthrough,
} from "./ui.jsx";

/* Type tokens — same as the paper, so the Lab reads as the same hand. */
const DISP = { fontFamily: "'Spectral',Georgia,serif" };
const BODY = { fontFamily: "'Source Serif 4',Georgia,serif" };
const MONO = { fontFamily: "'IBM Plex Mono',monospace" };

/* status "live" entries name their export here; the Lab renders it by key. */
const SKETCHES = {
  VitWalkthrough, CnnWalkthrough, DetectionParadigms, Dinov2Walkthrough, SteerVitWalkthrough,
  RagWalkthrough, MemoryBankWalkthrough,
};

/* Intro copy in data.js is written with *italic* and **bold** markers so the
   prose stays readable as plain text there. This unwraps it into elements —
   deliberately tiny: two delimiters, no nesting, no links. */
function RichText({ children }) {
  const parts = String(children).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((t, i) => {
        if (t.startsWith("**") && t.endsWith("**")) return <b key={i} style={DISP}>{t.slice(2, -2)}</b>;
        if (t.startsWith("*") && t.endsWith("*")) return <i key={i}>{t.slice(1, -1)}</i>;
        return <Fragment key={i}>{t}</Fragment>;
      })}
    </>
  );
}

/* ── the hash route: #/lab → first live entry, #/lab/<key> → that entry ──
   Hash routing (not history) so the built site works unchanged on GitHub
   Pages, where there's no server to rewrite deep paths. */
export function currentArchKey() {
  const m = window.location.hash.match(/^#\/lab\/([\w-]+)/);
  const hit = m && LIVE_ARCHITECTURES.find((a) => a.key === m[1]);
  return hit ? hit.key : LIVE_ARCHITECTURES[0].key;
}

export default function Lab() {
  const [key, setKey] = useState(currentArchKey);
  const [railOpen, setRailOpen] = useState(false);

  /* Keep state and the address bar in step, both directions, so back/forward
     and a pasted deep link behave the same. */
  useEffect(() => {
    const onHash = () => setKey(currentArchKey());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((k) => {
    window.location.hash = `#/lab/${k}`;
    setRailOpen(false);
    /* Drop focus off the rail button that was just clicked, so ←/→ keep
       walking the shelf instead of being swallowed by the focus guard. */
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const idx = LIVE_ARCHITECTURES.findIndex((a) => a.key === key);
  const arch = LIVE_ARCHITECTURES[idx] || LIVE_ARCHITECTURES[0];
  const prev = LIVE_ARCHITECTURES[idx - 1];
  const next = LIVE_ARCHITECTURES[idx + 1];

  /* ←/→ walk the shelf, Esc returns to the paper.
     Once focus is on a control inside the bench, the arrows belong to that
     walkthrough's own step buttons — hijacking them there would throw you
     into a different architecture mid-step. The shortcut only applies while
     focus is loose on the page or parked in the index rail. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const a = document.activeElement;
      const inBench = a && a !== document.body && a.closest?.(".lab-main");
      if (inBench && e.key !== "Escape") return;
      if (e.key === "ArrowRight" && next) { e.preventDefault(); go(next.key); }
      else if (e.key === "ArrowLeft" && prev) { e.preventDefault(); go(prev.key); }
      else if (e.key === "Escape") { window.location.hash = "#Architectures"; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go]);

  /* Restore the paper's own <title> on the way out — captured once on mount,
     so walking between benches doesn't overwrite it with a Lab title.
     Same effect handles arrival: coming from the paper carries that page's
     scroll offset over, which would drop you mid-sketch. */
  useEffect(() => {
    const paperTitle = document.title;
    window.scrollTo(0, 0);
    return () => { document.title = paperTitle; };
  }, []);

  useEffect(() => {
    document.title = `${arch.name} · Architecture Lab — ${PAPER.author}`;
  }, [arch]);

  const Sketch = SKETCHES[arch.component];
  const liveCount = LIVE_ARCHITECTURES.length;
  const plannedCount = ARCHITECTURES.length - liveCount;

  const families = ARCH_FAMILIES
    .map((f) => ({ family: f, items: ARCHITECTURES.filter((a) => a.family === f) }))
    .filter((g) => g.items.length);

  return (
    <>
      <style>{`
        .lab{--rail:236px}
        .lab-grid{display:grid;grid-template-columns:var(--rail) minmax(0,1fr);align-items:start;
          max-width:1180px;margin:0 auto;padding:0 1.4rem}
        .lab-rail{position:sticky;top:0;max-height:100vh;overflow-y:auto;padding:1.6rem 1.2rem 3rem 0;
          border-right:1px solid ${P.line}}
        .lab-main{padding:1.6rem 0 4rem 2rem;min-width:0}
        .lab-item{display:block;width:100%;text-align:left;background:transparent;border:none;
          padding:5px 8px;cursor:pointer;border-left:2px solid transparent;transition:background .15s,border-color .15s}
        .lab-item:hover{background:${P.faint}}
        .lab-item[aria-current="true"]{border-left-color:${P.accent};background:${P.accentSoft}}
        .lab-item[disabled]{cursor:default;opacity:0.5}
        .lab-item[disabled]:hover{background:transparent}
        .lab-railtoggle{display:none}
        @media(max-width:900px){
          .lab-grid{grid-template-columns:1fr;padding:0 1rem}
          .lab-rail{position:static;max-height:none;border-right:none;border-bottom:1px solid ${P.line};
            padding:0 0 1rem;margin-bottom:1.2rem}
          .lab-main{padding:0 0 3rem}
          .lab-railtoggle{display:block}
          .lab-rail[data-open="false"]{display:none}
        }
        @media(prefers-reduced-motion:reduce){.lab *{transition:none!important;animation:none!important}}
      `}</style>

      <div className="lab" style={{ minHeight: "100vh", background: P.paper, color: P.ink }}>

        {/* RUNNING HEAD — deliberately not the portfolio's nav. You've left the paper. */}
        <header style={{ borderBottom: `2px solid ${P.ink}`, background: P.paper2 }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0.7rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...MONO, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: P.ink }}>Architecture Lab</span>
              <span style={{ ...MONO, fontSize: "0.58rem", color: P.sub }}>{liveCount} built · {plannedCount} on the bench</span>
            </div>
            <a href="#Architectures" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>← back to the paper</a>
          </div>
        </header>

        <div className="lab-grid">

          {/* ── INDEX RAIL ── */}
          <div>
            <button
              className="lab-railtoggle"
              onClick={() => setRailOpen((v) => !v)}
              aria-expanded={railOpen}
              style={{ ...MONO, fontSize: "0.66rem", color: P.ink, background: P.paper2, border: `1px solid ${P.line}`, padding: "7px 11px", cursor: "pointer", width: "100%", textAlign: "left", margin: "1rem 0 0.6rem" }}
            >
              {railOpen ? "▾" : "▸"} index — {arch.short}
            </button>

            <nav className="lab-rail" data-open={railOpen} aria-label="Architectures">
              {families.map((g) => (
                <div key={g.family} style={{ marginBottom: "1.15rem" }}>
                  <div style={{ ...MONO, fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.13em", color: P.sub, marginBottom: 5, paddingLeft: 8 }}>{g.family}</div>
                  {g.items.map((a) => {
                    const live = a.status === "live";
                    const on = live && a.key === arch.key;
                    return (
                      <button
                        key={a.key}
                        className="lab-item"
                        onClick={live ? () => go(a.key) : undefined}
                        disabled={!live}
                        aria-current={on}
                        title={live ? a.note : `${a.note} — not built yet`}
                      >
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ ...MONO, fontSize: "0.72rem", color: on ? P.accent : live ? P.ink : P.sub, lineHeight: 1.35 }}>{a.short}</span>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: live ? P.green : "transparent", border: live ? "none" : `1px solid ${P.line}` }} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
              <div style={{ ...MONO, fontSize: "0.54rem", color: P.sub, lineHeight: 1.7, borderTop: `1px solid ${P.line}`, paddingTop: 9, marginTop: 4, paddingLeft: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: P.green }} /> built</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 10 }}><span style={{ width: 6, height: 6, borderRadius: "50%", border: `1px solid ${P.line}` }} /> on the bench</span>
                <div style={{ marginTop: 7 }}>← → to walk the shelf · esc to leave</div>
              </div>
            </nav>
          </div>

          {/* ── THE BENCH ── */}
          <main className="lab-main">
            <div style={{ ...MONO, fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.13em", color: P.sub, marginBottom: 7 }}>
              {arch.family} · {String(idx + 1).padStart(2, "0")} / {String(liveCount).padStart(2, "0")}
            </div>
            <h1 style={{ ...DISP, fontWeight: 600, fontSize: "clamp(1.6rem,4vw,2.3rem)", lineHeight: 1.1, letterSpacing: "-0.02em", color: P.ink, marginBottom: 6 }}>
              {arch.name}
            </h1>
            <div style={{ ...MONO, fontSize: "0.68rem", color: P.accent, marginBottom: "1.1rem" }}>{arch.steps}</div>

            <p style={{ ...BODY, fontSize: "0.97rem", lineHeight: 1.78, color: P.sub, maxWidth: 640, marginBottom: "1.5rem", textWrap: "pretty" }}>
              <RichText>{arch.intro}</RichText>
            </p>

            {Sketch ? <Sketch /> : null}

            {/* ── walk the shelf ── */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "2.4rem", paddingTop: "1rem", borderTop: `2px solid ${P.ink}` }}>
              {prev ? (
                <button onClick={() => go(prev.key)} style={{ ...MONO, fontSize: "0.68rem", color: P.accent, background: "transparent", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                  ← {prev.short}
                  <div style={{ ...MONO, fontSize: "0.56rem", color: P.sub, marginTop: 3 }}>{prev.note}</div>
                </button>
              ) : <span />}
              {next ? (
                <button onClick={() => go(next.key)} style={{ ...MONO, fontSize: "0.68rem", color: P.accent, background: "transparent", border: "none", cursor: "pointer", padding: 0, textAlign: "right" }}>
                  {next.short} →
                  <div style={{ ...MONO, fontSize: "0.56rem", color: P.sub, marginTop: 3 }}>{next.note}</div>
                </button>
              ) : <span />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
