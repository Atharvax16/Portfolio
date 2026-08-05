import { useEffect } from "react";
import { P, PAPER, RESUME } from "./data.js";

/* Type tokens — same as the paper, so the résumé reads as the same hand. */
const DISP = { fontFamily: "'Spectral',Georgia,serif" };
const BODY = { fontFamily: "'Source Serif 4',Georgia,serif" };
const MONO = { fontFamily: "'IBM Plex Mono',monospace" };

/* ── the hash route: #/resume ──
   Hash routing (not history) so the built site works unchanged on GitHub
   Pages. The pretty URL — /resume/ — is a static shim in public/resume/
   that redirects here, so one link both opens the CV and lands the reader
   inside the portfolio. */
export default function Resume() {
  /* Restore the paper's own <title> on the way out, and start at the top:
     arriving from the paper carries that page's scroll offset over. */
  useEffect(() => {
    const paperTitle = document.title;
    window.scrollTo(0, 0);
    document.title = `Résumé — ${PAPER.author}`;
    return () => { document.title = paperTitle; };
  }, []);

  /* Esc leaves, same as the Lab and the Instrument Room. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") window.location.hash = "#Contact";
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const btn = {
    ...MONO, fontSize: "0.7rem", textDecoration: "none", display: "inline-block",
    padding: "8px 15px", border: `1px solid ${P.ink}`, background: P.ink, color: P.paper,
  };
  const btnGhost = { ...btn, background: "transparent", color: P.ink };

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:${P.paper};color:${P.ink};font-family:'Source Serif 4',Georgia,serif;
          -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        ::selection{background:${P.highlight}}
        :focus-visible{outline:2px solid ${P.accent};outline-offset:2px}
        .cv-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:2rem;align-items:start;
          max-width:1180px;margin:0 auto;padding:1.6rem 1.4rem 4rem}
        .cv-rail{position:sticky;top:1.6rem}
        .cv-frame{width:100%;height:min(1180px,140vh);border:1px solid ${P.line};background:${P.paper2};display:block}
        .cv-fallback{display:none}
        .cv-row{display:grid;grid-template-columns:5.2rem 1fr;gap:0.7rem;border-top:1px solid ${P.line};
          padding:0.5rem 0;align-items:baseline;text-decoration:none}
        .cv-row:hover{background:${P.accentSoft}}
        .cv-tour{display:block;width:100%;text-align:left;background:transparent;cursor:pointer;
          border:none;border-top:1px solid ${P.line};padding:0.6rem 0.4rem;transition:background .15s}
        .cv-tour:hover{background:${P.accentSoft}}
        .cv-tour:hover .cv-tour-where{color:${P.accent}}
        @media(max-width:960px){
          .cv-grid{grid-template-columns:1fr;padding:1.1rem 1rem 3rem}
          .cv-rail{position:static;order:-1}
          /* Mobile browsers render an embedded PDF as a dead one-page preview
             (or nothing at all), so hand the file to the OS viewer instead. */
          .cv-frame{display:none}
          .cv-fallback{display:block}
        }
        @media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
      `}</style>

      <div style={{ minHeight: "100vh", background: P.paper, color: P.ink }}>

        {/* RUNNING HEAD — you've left the paper, but the door back is right here. */}
        <header style={{ borderBottom: `2px solid ${P.ink}`, background: P.paper2 }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0.7rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...MONO, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: P.ink }}>Résumé / CV</span>
              <span style={{ ...MONO, fontSize: "0.58rem", color: P.sub }}>{RESUME.pages} pages · updated {RESUME.updated}</span>
            </div>
            <a href="#Abstract" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>← read the portfolio</a>
          </div>
        </header>

        <div className="cv-grid">

          {/* ── THE DOCUMENT ── */}
          <main style={{ minWidth: 0 }}>
            <div style={{ ...MONO, fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.13em", color: P.sub, marginBottom: 7 }}>
              Curriculum vitæ
            </div>
            <h1 style={{ ...DISP, fontWeight: 600, fontSize: "clamp(1.6rem,4vw,2.3rem)", lineHeight: 1.1, letterSpacing: "-0.02em", color: P.ink, marginBottom: 5 }}>
              {PAPER.author}
            </h1>
            <div style={{ ...MONO, fontSize: "0.68rem", color: P.accent, marginBottom: "0.9rem" }}>
              {RESUME.role} · {PAPER.affiliation}
            </div>
            <p style={{ ...BODY, fontSize: "0.95rem", lineHeight: 1.75, color: P.sub, maxWidth: 620, marginBottom: "1.2rem", textWrap: "pretty" }}>
              {RESUME.summary}
            </p>

            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
              <a href={RESUME.file} download={RESUME.download} style={btn}>Download PDF ↓</a>
              <a href={RESUME.file} target="_blank" rel="noopener noreferrer" style={btnGhost}>Open in new tab ↗</a>
            </div>

            {/* Desktop: the PDF itself, inline. The <object> children render only
                if the browser has no PDF viewer at all. */}
            <object className="cv-frame" data={RESUME.file} type="application/pdf" aria-label={`Résumé of ${PAPER.author}`}>
              <div style={{ padding: "1.4rem" }}>
                <p style={{ ...BODY, fontSize: "0.92rem", color: P.ink, lineHeight: 1.7, marginBottom: "0.9rem" }}>
                  This browser can't display the PDF inline.
                </p>
                <a href={RESUME.file} download={RESUME.download} style={btn}>Download the résumé ↓</a>
              </div>
            </object>

            {/* Mobile: a card that hands the file to the system viewer. */}
            <div className="cv-fallback" style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2, padding: "1.1rem 1.2rem" }}>
              <div style={{ ...MONO, fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.12em", color: P.sub, marginBottom: 6 }}>PDF · {RESUME.pages} pages</div>
              <p style={{ ...BODY, fontSize: "0.9rem", color: P.ink, lineHeight: 1.7, marginBottom: "0.9rem", textWrap: "pretty" }}>
                Phone browsers preview PDFs badly. Open it full-screen instead — or scroll on for the short version, which links into the portfolio.
              </p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <a href={RESUME.file} target="_blank" rel="noopener noreferrer" style={btn}>Open the résumé ↗</a>
                <a href={RESUME.file} download={RESUME.download} style={btnGhost}>Download ↓</a>
              </div>
            </div>
          </main>

          {/* ── THE RAIL — contact, then the second target: the portfolio ── */}
          <aside className="cv-rail">
            <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2, padding: "0.9rem 1rem 1rem", marginBottom: "1.2rem" }}>
              <div style={{ ...MONO, fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.12em", color: P.sub, marginBottom: 2 }}>Contact</div>
              {RESUME.contacts.map((c) => (
                <a key={c.l} className="cv-row" href={c.h} target={c.h.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  <span style={{ ...MONO, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.l}</span>
                  <span style={{ ...MONO, fontSize: "0.72rem", color: P.accent, overflowWrap: "anywhere" }}>{c.v}</span>
                </a>
              ))}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: "0.9rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.green }} />
                <span style={{ ...MONO, fontSize: "0.58rem", color: P.sub }}>open to ML / applied-research roles</span>
              </div>
            </div>

            <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2, padding: "0.9rem 1rem 1rem" }}>
              <div style={{ ...MONO, fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.12em", color: P.sub, marginBottom: 4 }}>The long version</div>
              <p style={{ ...BODY, fontSize: "0.85rem", color: P.sub, lineHeight: 1.65, marginBottom: "0.5rem", textWrap: "pretty" }}>
                Every line on the CV has a page behind it — the write-up, the figure, or the sketch it came from.
              </p>
              {RESUME.tour.map((t) => (
                <button key={t.to} className="cv-tour" onClick={() => { window.location.hash = t.to; }}>
                  <div style={{ ...BODY, fontSize: "0.87rem", color: P.ink, lineHeight: 1.5, marginBottom: 3, textWrap: "pretty" }}>{t.line}</div>
                  <div className="cv-tour-where" style={{ ...MONO, fontSize: "0.6rem", color: P.sub, transition: "color .15s" }}>{t.where} →</div>
                </button>
              ))}
              <div style={{ ...MONO, fontSize: "0.54rem", color: P.sub, borderTop: `1px solid ${P.line}`, paddingTop: 9, marginTop: 8 }}>
                esc to leave
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
