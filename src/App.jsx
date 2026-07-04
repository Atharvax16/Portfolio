import { useState, useEffect } from "react";
import {
  P, SECS, PAPER, RESEARCH_AREAS, READING_LOG, TIL_REPO, FROM_SCRATCH,
  METHODS, JOURNEY, ORDERED_PROJECTS, INSIGHTS, ARCHITECTURES,
} from "./data.js";
import { Rv, Radar, PhotoGallery, MatrixOverlay, ResearchModal, SketchFidelityAccuracy, SketchResearcherFrontier, SketchMolecule, SketchAttention, SketchFFT, SketchSpectral, InsightsViewer, VitWalkthrough, CnnWalkthrough, DetectionParadigms } from "./ui.jsx";

/* Type tokens */
const DISP = { fontFamily: "'Spectral',Georgia,serif" };
const BODY = { fontFamily: "'Source Serif 4',Georgia,serif" };
const MONO = { fontFamily: "'IBM Plex Mono',monospace" };

/* Numbered, margin-anchored section wrapper (the paper's column grid). */
function Section({ id, num, note, children }) {
  return (
    <section id={id} className="sec">
      <div className="pg">
        <div className="mg">
          {num ? <div className="secnum">{num}</div> : null}
          {note}
        </div>
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    </section>
  );
}

function SecTitle({ children }) {
  return (
    <h2 style={{ ...DISP, fontWeight: 600, fontSize: "clamp(1.4rem,3vw,1.7rem)", color: P.ink, letterSpacing: "-0.01em", borderBottom: `2px solid ${P.ink}`, paddingBottom: 7, marginBottom: "1.3rem" }}>
      {children}
    </h2>
  );
}

/* One reading-log reference — `n` is the stable citation number (1-based). */
function RefItem({ r, n }) {
  return (
    <div id={`ref-${n}`} className="ref" style={{ display: "grid", gridTemplateColumns: "2rem 1fr", gap: "0.4rem" }}>
      <div style={{ ...MONO, fontSize: "0.8rem", color: P.accent }}>[{n}]</div>
      <div>
        <div style={{ ...BODY, fontSize: "0.95rem", color: P.ink, lineHeight: 1.6 }}>
          {r.authors}. <i>{r.paper}</i>. {r.year}.
          {r.hasNotebook && <span style={{ ...MONO, fontSize: "0.58rem", color: P.accent, border: `1px solid ${P.accent}55`, padding: "0 6px", marginLeft: 8, verticalAlign: "middle" }}>+ notebook</span>}
        </div>
        <p style={{ ...BODY, fontSize: "0.86rem", color: P.sub, lineHeight: 1.7, margin: "5px 0 6px", textWrap: "pretty" }}>{r.takeaway}</p>
        <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>notes — {r.area} ↗</a>
        {r.sketch === "attention" && (
          <figure style={{ margin: "0.7rem 0 0", maxWidth: 360, border: `1px solid ${P.line}`, background: P.paper2 }}>
            <SketchAttention />
          </figure>
        )}
        {r.sketch === "fft" && (
          <figure style={{ margin: "0.7rem 0 0", maxWidth: 420, border: `1px solid ${P.line}`, background: P.paper2 }}>
            <div style={{ aspectRatio: "420 / 230" }}><SketchFFT /></div>
          </figure>
        )}
        {r.sketch === "spectral" && (
          <figure style={{ margin: "0.7rem 0 0", maxWidth: 440, border: `1px solid ${P.line}`, background: P.paper2 }}>
            <div style={{ aspectRatio: "440 / 238" }}><SketchSpectral /></div>
          </figure>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState(0);
  const [matrix, setMatrix] = useState(false);
  const [eggC, setEggC] = useState(0);
  const [openProject, setOpenProject] = useState(null);
  const [showForensics, setShowForensics] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { const idx = SECS.indexOf(e.target.id); if (idx !== -1) setActive(idx); } });
    }, { rootMargin: "-45% 0px -45% 0px" });
    SECS.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const goTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const logoClick = () => { const n = eggC + 1; setEggC(n); if (n >= 5) { setMatrix(true); setEggC(0); } };

  const link = { ...MONO, color: P.accent, textDecoration: "underline", textUnderlineOffset: 3, textDecorationThickness: "1px" };
  const chip = { ...MONO, fontSize: "0.64rem", color: P.sub, border: `1px solid ${P.line}`, borderRadius: 2, padding: "2px 8px" };
  const noteTxt = { ...BODY, fontSize: "0.74rem", color: P.sub, lineHeight: 1.55, fontStyle: "italic" };

  /* Reading log splits into the fixed foundational trio (kept inline) and the
     growing generative-image-forensics thread (tucked behind a toggle). `n` is
     the stable 1-based citation number the Abstract's <Cite> links point at. */
  const readingNumbered = READING_LOG.map((r, i) => ({ ...r, n: i + 1 }));
  const foundationalReading = readingNumbered.filter((r) => r.area !== "Image Forensics");
  const forensicsReading = readingNumbered.filter((r) => r.area === "Image Forensics");

  const Cite = ({ n }) => (
    <a href={`#ref-${n}`} style={{ ...MONO, fontSize: "0.78em", color: P.accent, textDecoration: "none" }}>[{n}]</a>
  );

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth;scroll-padding-top:74px}
        body{background:#F4F0E0;color:#16181D;font-family:'Source Serif 4',Georgia,serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        ::selection{background:rgba(232,194,76,0.55)}
        :focus-visible{outline:2px solid #2B4C8C;outline-offset:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .scr::-webkit-scrollbar{width:8px}.scr::-webkit-scrollbar-thumb{background:#C9C8BF;border-radius:0}.scr::-webkit-scrollbar-track{background:transparent}
        .sec{padding:3.4rem 0}
        .pg{display:grid;grid-template-columns:150px minmax(0,640px);gap:2rem;max-width:824px;margin:0 auto;padding:0 1.4rem;align-items:start}
        .pg .mg{text-align:right;position:sticky;top:88px}
        .secnum{font-family:'Spectral',Georgia,serif;font-size:2.2rem;font-weight:600;color:#2B4C8C;line-height:1;margin-bottom:0.6rem}
        .vstamp{position:fixed;left:7px;top:50%;transform:translateY(-50%);writing-mode:vertical-rl;rotate:180deg;font-family:'IBM Plex Mono',monospace;font-size:0.6rem;letter-spacing:0.22em;color:#9C9B90;z-index:40}
        .worklist{display:grid;grid-template-columns:repeat(auto-fit,minmax(285px,1fr));gap:1rem}
        .ref{scroll-margin-top:84px}
        a.body-link{color:#2B4C8C;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
        @media(max-width:860px){
          .pg{grid-template-columns:1fr;gap:0.5rem}
          .pg .mg{text-align:left;position:static;display:flex;align-items:baseline;gap:0.7rem;flex-wrap:wrap}
          .secnum{font-size:1.3rem;margin-bottom:0}
          .vstamp{display:none}
        }
        @media(min-width:861px) and (max-width:1170px){.vstamp{display:none}}
        @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
      `}</style>

      {matrix && <MatrixOverlay onClose={() => setMatrix(false)} />}
      {openProject && <ResearchModal project={openProject} onClose={() => setOpenProject(null)} />}

      <div style={{ width: "100%", minHeight: "100vh", background: P.paper, color: P.ink, position: "relative" }}>

        <div className="vstamp">{PAPER.stamp}</div>

        {/* RUNNING HEAD */}
        <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0.6rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(244,240,224,0.85)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${P.line}` }}>
          <button onClick={logoClick} style={{ ...MONO, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: P.ink, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>A. Kocharekar</button>
          <nav style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            {SECS.map((sec, i) => (
              <button key={sec} onClick={() => goTo(sec)} style={{ padding: "3px 8px", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.7rem", ...MONO, color: active === i ? P.accent : P.sub, borderBottom: `1.5px solid ${active === i ? P.accent : "transparent"}`, transition: "all 0.2s" }}>{sec}</button>
            ))}
          </nav>
        </header>

        {/* ═══ TITLE BLOCK / ABSTRACT ═══ */}
        <section id="Abstract" className="sec" style={{ padding: "6rem 0 3.4rem" }}>
          <div className="pg">
            <div className="mg">
              <Rv>
                <div style={{ ...MONO, fontSize: "0.6rem", letterSpacing: "0.16em", color: P.accent, marginBottom: 4 }}>PREPRINT</div>
                <div style={{ ...MONO, fontSize: "0.58rem", color: P.sub, lineHeight: 1.6, marginBottom: "1rem" }}>{PAPER.stamp}</div>
                <div style={{ borderTop: `1px solid ${P.line}`, paddingTop: "0.8rem" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.green }} />
                    <span style={{ ...MONO, fontSize: "0.58rem", color: P.sub }}>available</span>
                  </div>
                  <p style={{ ...noteTxt, marginBottom: "0.7rem" }}>Open to ML / applied-research roles &amp; collaborations.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                    <a href="https://github.com/Atharvax16" target="_blank" rel="noopener noreferrer" style={{ ...MONO, fontSize: "0.64rem", color: P.accent }}>GitHub ↗</a>
                    <a href={`mailto:${PAPER.email}`} style={{ ...MONO, fontSize: "0.64rem", color: P.accent }}>Email ↗</a>
                  </div>
                </div>
              </Rv>
            </div>

            <div style={{ minWidth: 0 }}>
              <Rv>
                <h1 style={{ ...DISP, fontWeight: 600, fontSize: "clamp(1.9rem,5vw,3rem)", lineHeight: 1.08, letterSpacing: "-0.02em", color: P.ink, marginBottom: "1.1rem", textWrap: "balance" }}>{PAPER.title}</h1>
              </Rv>
              <Rv delay={0.06}>
                <div style={{ ...DISP, fontSize: "1.15rem", color: P.ink, marginBottom: 4 }}>{PAPER.author}</div>
                <div style={{ ...MONO, fontSize: "0.7rem", color: P.sub, lineHeight: 1.7 }}>
                  {PAPER.affiliation}<br />
                  <a href={`mailto:${PAPER.email}`} className="body-link">{PAPER.email}</a> · {PAPER.date}
                </div>
              </Rv>
              <Rv delay={0.12}>
                <div style={{ borderTop: `1px solid ${P.line}`, borderBottom: `1px solid ${P.line}`, padding: "1.1rem 0", margin: "1.4rem 0" }}>
                  <p style={{ ...BODY, fontSize: "1rem", lineHeight: 1.78, color: P.ink, textAlign: "justify", hyphens: "auto", textWrap: "pretty" }}>
                    <b style={{ ...DISP }}>Abstract.</b> This portfolio documents my work toward machine learning that can be trusted where the stakes are real — models that stay accurate on messy inputs and can explain themselves when it counts. My MSc thesis examines how diabetic-retinopathy classifiers degrade under blur, exposure error, and sensor noise, and whether diffusion-based restoration can recover the diagnostic signal <i>without hallucinating pathology</i>. In parallel I read and reproduce the field's foundational results — attention <Cite n={1} />, adversarial generation <Cite n={2} />, and equivariant graph networks <Cite n={3} /> — and extend them across generative-image forensics, federated medical imaging, and multi-agent systems grounded in deterministic ML.
                  </p>
                  <p style={{ ...MONO, fontSize: "0.66rem", color: P.sub, marginTop: "0.9rem", lineHeight: 1.7 }}>
                    <span style={{ color: P.ink }}>Keywords —</span> {PAPER.keywords.join(" · ")}
                  </p>
                </div>
              </Rv>
              <Rv delay={0.18}>
                <figure style={{ margin: 0 }}>
                  <div style={{ border: `1px solid ${P.line}`, background: P.paper2, aspectRatio: "5 / 3" }}>
                    <SketchFidelityAccuracy />
                  </div>
                  <figcaption style={{ ...MONO, fontSize: "0.66rem", color: P.sub, marginTop: 8, lineHeight: 1.55 }}>
                    <b style={{ color: P.ink }}>Figure 1.</b> The thesis in one sketch — as restoration is pushed harder a fundus image <i>looks</i> cleaner, yet the diagnostic signal the classifier relies on quietly erodes. The two curves cross: the central tension between visual fidelity and downstream accuracy.
                  </figcaption>
                </figure>
              </Rv>
            </div>
          </div>
        </section>

        {/* ═══ 1 · RESEARCH ═══ */}
        <Section id="Research" num="1">
          <SecTitle>Research</SecTitle>
          <Rv><p style={{ ...BODY, fontSize: "0.95rem", lineHeight: 1.75, color: P.sub, marginBottom: "1.5rem", maxWidth: 600 }}>Four threads, one habit: read the source paper, reproduce it, then probe where it breaks.</p></Rv>
          {RESEARCH_AREAS.map((a, i) => (
            <Rv key={a.title} delay={i * 0.05}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ ...DISP, fontWeight: 600, fontSize: "1.05rem", color: P.ink, marginBottom: 5 }}>
                  <span style={{ ...MONO, fontSize: "0.8rem", color: P.accent, marginRight: 8 }}>1.{i + 1}</span>{a.title}
                </h3>
                {a.thesis && (
                  <div style={{ borderLeft: `2px solid ${P.accent}`, paddingLeft: "0.75rem", margin: "0 0 8px" }}>
                    <div style={{ ...MONO, fontSize: "0.56rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>MSc thesis</div>
                    <div style={{ ...DISP, fontSize: "0.92rem", fontStyle: "italic", color: P.ink, lineHeight: 1.4 }}>“{a.thesis}”</div>
                  </div>
                )}
                <p style={{ ...BODY, fontSize: "0.92rem", lineHeight: 1.72, color: P.ink, marginBottom: 8, textWrap: "pretty" }}>{a.blurb}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{a.tags.map(t => <span key={t} style={chip}>{t}</span>)}</div>
              </div>
            </Rv>
          ))}
        </Section>

        {/* ═══ 2 · SELECTED WORK ═══ */}
        <Section id="Work" num="2">
          <SecTitle>Selected Work</SecTitle>
          <Rv><p style={{ ...BODY, fontSize: "0.95rem", lineHeight: 1.75, color: P.sub, marginBottom: "1.4rem", maxWidth: 600 }}>Each entry opens as a short case study — abstract, method, results.</p></Rv>
          <div className="worklist">
            {ORDERED_PROJECTS.map((p, i) => (
              <Rv key={p.id} delay={i * 0.04}>
                <article
                  onClick={() => setOpenProject(p)}
                  role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter") setOpenProject(p); }}
                  style={{ background: P.paper2, border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, padding: "1rem 1.1rem 0.9rem", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 26px rgba(22,24,29,0.13)"; e.currentTarget.style.borderTopColor = P.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderTopColor = P.ink; }}
                >
                  <div style={{ ...MONO, fontSize: "0.58rem", color: P.sub, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.badge}</div>
                  <h3 style={{ ...DISP, fontWeight: 600, fontSize: "1.05rem", color: P.ink, lineHeight: 1.2, marginBottom: 7 }}>{p.title}</h3>
                  <p style={{ ...BODY, fontSize: "0.86rem", lineHeight: 1.65, color: P.sub, marginBottom: 10, flex: 1 }}>{p.short}</p>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 11 }}>{p.tech.slice(0, 4).map((t, j) => <span key={j} style={chip}>{t}</span>)}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${P.faint}`, paddingTop: 8 }}>
                    <span style={{ ...MONO, fontSize: "0.6rem", color: P.sub }}>{[p.year, p.role].filter(Boolean).join(" · ")}</span>
                    <span style={{ ...MONO, fontSize: "0.66rem", color: P.accent }}>Read case study →</span>
                  </div>
                </article>
              </Rv>
            ))}
          </div>
        </Section>

        {/* ═══ 3 · FINDINGS (interactive figure explorer) ═══ */}
        <Section id="Findings" num="3" note={<p style={noteTxt}>For the visiting researcher — step through the figures and the observation each one carries.</p>}>
          <SecTitle>Findings &amp; Figures</SecTitle>
          <Rv><p style={{ ...BODY, fontSize: "0.95rem", lineHeight: 1.75, color: P.sub, marginBottom: "1.4rem", maxWidth: 600 }}>Real plots from the work, annotated. Click through, or pick a thumbnail — from the thesis's fidelity-vs-accuracy crossing to the non-saturating GAN trick.</p></Rv>
          <Rv delay={0.06}><InsightsViewer items={INSIGHTS} /></Rv>
        </Section>

        {/* ═══ 4 · ARCHITECTURES (interactive walkthroughs) ═══ */}
        <Section id="Architectures" num="4" note={<p style={noteTxt}>Learning in public — each architecture I study, rebuilt as an interactive sketch. Step through it; turn the knobs.</p>}>
          <SecTitle>Architectures, Visualised</SecTitle>
          <Rv><p style={{ ...BODY, fontSize: "0.95rem", lineHeight: 1.75, color: P.sub, marginBottom: "1.4rem", maxWidth: 600 }}>How a model actually <i>sees</i> — each idea I study, rebuilt as an interactive sketch you can step through. Start with the Vision Transformer: how one image becomes the sequence of tokens a transformer can attend over. Toggle the patch size and walk the pipeline end to end.</p></Rv>
          <Rv delay={0.06}>
            <div style={{ ...MONO, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Vision Transformer · patchify → embedding</div>
            <VitWalkthrough />
          </Rv>
          <Rv delay={0.08}>
            <div style={{ borderTop: `1px solid ${P.line}`, margin: "1.8rem 0 1.2rem", paddingTop: "1.4rem" }}>
              <p style={{ ...BODY, fontSize: "0.95rem", lineHeight: 1.75, color: P.sub, marginBottom: "1.2rem", maxWidth: 600 }}>Then the <b style={DISP}>CNN</b> — the workhorse I keep circling back to brush up on. Convolution, activation and pooling funnel an image down into features; then a transposed convolution climbs back up by <i>inserting zeros</i> between samples — and that's the exact step the <b style={DISP}>Watch Your Up-Convolution</b> paper turns into an AI-image detector. Step down the encoder, then back up.</p>
              <div style={{ ...MONO, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Convolutional Neural Network · convolve → pool → receptive field → transpose ↑</div>
              <CnnWalkthrough />
            </div>
          </Rv>
          <Rv delay={0.1}>
            <div style={{ borderTop: `1px solid ${P.line}`, margin: "1.8rem 0 1.2rem", paddingTop: "1.4rem" }}>
              <p style={{ ...BODY, fontSize: "0.95rem", lineHeight: 1.75, color: P.sub, marginBottom: "1.2rem", maxWidth: 600 }}>And the question behind my <b style={DISP}>generative-image forensics</b> work: an AI image and a real photo can look identical, yet differ in their <i>statistics</i>. Reading round the literature, I rebuilt six detection paradigms as one sketch — each a different lens on that hidden difference. Step through them.</p>
              <div style={{ ...MONO, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Detecting AI images · six lenses on a fake</div>
              <DetectionParadigms />
            </div>
          </Rv>
          <Rv delay={0.14}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: "1.5rem", borderTop: `1px solid ${P.line}`, paddingTop: "1rem" }}>
              <span style={{ ...MONO, fontSize: "0.62rem", color: P.sub }}>next in the series:</span>
              {ARCHITECTURES.filter(a => a.status !== "live").map(a => (
                <span key={a.key} style={{ ...MONO, fontSize: "0.66rem", color: P.sub, border: `1px dashed ${P.line}`, padding: "4px 10px", background: P.paper2 }}>{a.name} · {a.note} <span style={{ color: P.accent }}>soon</span></span>
              ))}
            </div>
          </Rv>
        </Section>

        {/* ═══ 5 · READING & REPRODUCTIONS (references) ═══ */}
        <Section id="Reading" num="5" note={<p style={noteTxt}>The <a href={TIL_REPO} target="_blank" rel="noopener noreferrer" className="body-link">til</a> journal — papers read in my own words, with notebooks where the idea needs to be felt.</p>}>
          <SecTitle>Reading &amp; Reproductions</SecTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {foundationalReading.map((r, i) => (
              <Rv key={r.paper} delay={i * 0.05}>
                <RefItem r={r} n={r.n} />
              </Rv>
            ))}
          </div>
          <Rv delay={0.14}>
            <figure style={{ margin: "1.6rem 0 0", display: "flex", gap: "1.2rem", alignItems: "center", flexWrap: "wrap", borderTop: `2px solid ${P.ink}`, paddingTop: "1.2rem" }}>
              <div style={{ width: 320, maxWidth: "100%", flexShrink: 0, border: `1px solid ${P.line}`, background: P.paper2 }}>
                <SketchMolecule />
              </div>
              <figcaption style={{ flex: 1, minWidth: 200 }}>
                <p style={{ ...BODY, fontSize: "0.9rem", color: P.ink, lineHeight: 1.72, textWrap: "pretty" }}>
                  What the quantum-chemistry arc <Cite n={3} /> taught me: a molecule's energy isn't a function of <i>which</i> atoms but of their <span style={{ background: P.highlight, padding: "0 2px" }}>geometry</span> — bond length <i>r</i>, bond angle <i>θ</i>, dihedral <i>φ</i>. Rotate the molecule and the energy must not change; bend it and it must. That single physical constraint is what each step from MPNN to NequIP bakes deeper into the network as equivariance.
                </p>
                <div style={{ ...MONO, fontSize: "0.6rem", color: P.sub, marginTop: 8 }}>Geometry as energy — why equivariance matters</div>
              </figcaption>
            </figure>
          </Rv>

          {/* Generative-image forensics — the active thesis thread, kept behind a toggle
              so the front page stays short as the reading list grows. */}
          <Rv delay={0.16}>
            <div style={{ marginTop: "1.8rem", borderTop: `2px solid ${P.ink}`, paddingTop: "1.1rem" }}>
              <button
                onClick={() => setShowForensics((v) => !v)}
                aria-expanded={showForensics}
                aria-controls="forensics-reading"
                style={{ width: "100%", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
              >
                <span>
                  <span style={{ ...DISP, fontWeight: 600, fontSize: "1.05rem", color: P.ink }}>Generative-Image Forensics</span>
                  <span style={{ ...BODY, fontSize: "0.82rem", color: P.sub, marginLeft: 10 }}>the active thesis thread · {forensicsReading.length} papers</span>
                </span>
                <span style={{ ...MONO, fontSize: "0.7rem", color: P.accent, flexShrink: 0, whiteSpace: "nowrap" }}>{showForensics ? "hide ▴" : "read list ▾"}</span>
              </button>
              {showForensics && (
                <div id="forensics-reading" style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginTop: "1.2rem", animation: "fadeUp 0.4s ease both" }}>
                  {forensicsReading.map((r) => (
                    <RefItem key={r.paper} r={r} n={r.n} />
                  ))}
                </div>
              )}
            </div>
          </Rv>

          <Rv delay={0.18}>
            <a href={TIL_REPO} target="_blank" rel="noopener noreferrer" style={{ ...MONO, fontSize: "0.7rem", color: P.ink, textDecoration: "none", border: `1px solid ${P.line}`, padding: "8px 14px", display: "inline-block", marginTop: "1.4rem", background: P.paper2 }}>Full journal on GitHub ↗</a>
          </Rv>
        </Section>

        {/* ═══ 6 · FOUNDATIONS ═══ */}
        <Section id="Foundations" num="6" note={<p style={noteTxt}>Not to reinvent the framework — to understand the mechanics it hides.</p>}>
          <SecTitle>Foundations, From Scratch</SecTitle>
          <div>
            {FROM_SCRATCH.map((f, i) => (
              <Rv key={f.title} delay={i * 0.05}>
                <a href={f.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ borderTop: `1px solid ${P.line}`, padding: "1rem 0", display: "flex", gap: "1rem", alignItems: "flex-start" }}
                    onMouseEnter={e => { e.currentTarget.style.background = P.accentSoft; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{f.title}</h3>
                      <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, marginBottom: 7 }}>{f.blurb}</p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{f.tags.map(t => <span key={t} style={chip}>{t}</span>)}</div>
                    </div>
                    <span style={{ ...MONO, fontSize: "0.66rem", color: P.accent, flexShrink: 0, paddingTop: 4 }}>code ↗</span>
                  </div>
                </a>
              </Rv>
            ))}
          </div>
        </Section>

        {/* ═══ 6 · METHODS ═══ */}
        <Section id="Methods" num="7">
          <SecTitle>Methods &amp; Tools</SecTitle>
          <div>
            {METHODS.map((m, i) => (
              <Rv key={m.group} delay={i * 0.04}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(120px,160px) 1fr", gap: "1rem", borderTop: `1px solid ${P.line}`, padding: "0.7rem 0", alignItems: "baseline" }}>
                  <div style={{ ...MONO, fontSize: "0.66rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.group}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{m.items.map(it => <span key={it} style={{ ...MONO, fontSize: "0.74rem", color: P.ink }}>{it}<span style={{ color: P.line }}> ·</span></span>)}</div>
                </div>
              </Rv>
            ))}
          </div>
          <Rv delay={0.2}>
            <figure style={{ margin: "1.6rem 0 0", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", borderTop: `2px solid ${P.ink}`, paddingTop: "1rem" }}>
              <div style={{ width: 96, height: 96, flexShrink: 0, border: `1px solid ${P.line}`, background: P.paper2, padding: 4 }}>
                <img src="images/lstm-notes.jpeg" alt="Working notes on LSTM gates" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <figcaption style={{ flex: 1, minWidth: 200 }}>
                <p style={{ ...BODY, fontSize: "0.88rem", color: P.ink, lineHeight: 1.7 }}>
                  I still derive the math by hand — forget gates, input gates, cell states — before trusting any <span style={MONO}>model.fit()</span>. The tools sit downstream of understanding.
                </p>
                <div style={{ ...MONO, fontSize: "0.6rem", color: P.sub, marginTop: 6 }}>Working notes — LSTM gates</div>
              </figcaption>
            </figure>
          </Rv>
        </Section>

        {/* ═══ 7 · ABOUT ═══ */}
        <Section id="About" num="8">
          <SecTitle>About</SecTitle>
          <Rv>
            <div style={{ display: "flex", gap: "1.3rem", alignItems: "flex-start", marginBottom: "1.4rem", flexWrap: "wrap" }}>
              <div style={{ width: 110, flexShrink: 0, border: `1px solid ${P.line}`, background: P.paper2, padding: 4 }}>
                <img src="images/portrait-sunglasses.jpeg" alt="Atharva Kocharekar" style={{ width: "100%", display: "block", filter: "grayscale(0.15)" }} />
              </div>
              <p style={{ ...BODY, fontSize: "0.95rem", lineHeight: 1.78, color: P.ink, flex: 1, minWidth: 220, textWrap: "pretty" }}>
                From Mumbai to Dublin, I've chased one question across the work — <span style={{ background: P.highlight, padding: "0 2px" }}>why does this model work, and when does it stop?</span> I don't just train models, I interrogate them: stress-test their robustness, audit their explanations, and rebuild their foundations from scratch.
              </p>
            </div>
          </Rv>

          <Rv delay={0.04}>
            <figure style={{ margin: "0 0 1.8rem", display: "flex", gap: "1.2rem", alignItems: "center", flexWrap: "wrap", borderTop: `2px solid ${P.ink}`, paddingTop: "1.2rem" }}>
              <div style={{ width: 280, maxWidth: "100%", flexShrink: 0, border: `1px solid ${P.line}`, background: P.paper2 }}>
                <SketchResearcherFrontier />
              </div>
              <figcaption style={{ flex: 1, minWidth: 200 }}>
                <p style={{ ...BODY, fontSize: "0.9rem", color: P.ink, lineHeight: 1.72, textWrap: "pretty" }}>
                  A field grows outward in rings — every paper, method, and solved problem pushes the boundary a little further. A good researcher walks all the way out to that frontier and then <span style={{ background: P.highlight, padding: "0 2px" }}>dents the edge</span> with something new. I'm near the centre still: early, working from first principles, with the long climb ahead — and a dent I intend to leave.
                </p>
                <div style={{ ...MONO, fontSize: "0.6rem", color: P.sub, marginTop: 8 }}>Where I sit on the research frontier</div>
              </figcaption>
            </figure>
          </Rv>

          <Rv delay={0.06}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem", marginBottom: "1.8rem" }}>
              {[
                { t: "Education", d: "MSc AI — Dublin City University\nB.E. AI & DS — TEC Mumbai" },
                { t: "Selected awards", d: "MotivaLogic Hackathon Winner (AWS)\n3rd / 70 — AdvanceHealth MedTech\nIntl. Research Conference" },
              ].map((c) => (
                <div key={c.t} style={{ borderTop: `2px solid ${P.ink}`, paddingTop: 8 }}>
                  <div style={{ ...MONO, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{c.t}</div>
                  <p style={{ ...BODY, fontSize: "0.88rem", color: P.ink, lineHeight: 1.7, whiteSpace: "pre-line" }}>{c.d}</p>
                </div>
              ))}
            </div>
          </Rv>

          <Rv delay={0.1}><div style={{ ...MONO, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.9rem" }}>Timeline</div></Rv>
          {JOURNEY.map((j, i) => (
            <Rv key={j.year} delay={i * 0.05}>
              <div style={{ display: "grid", gridTemplateColumns: "3.2rem 1fr", gap: "0.8rem", borderTop: `1px solid ${P.line}`, padding: "0.7rem 0" }}>
                <div style={{ ...MONO, fontSize: "0.78rem", color: P.accent }}>{j.year}</div>
                <div>
                  <div style={{ ...DISP, fontWeight: 600, fontSize: "0.95rem", color: P.ink }}>{j.title} <span style={{ ...MONO, fontSize: "0.62rem", color: P.sub, fontWeight: 400 }}>— {j.place}</span></div>
                  <p style={{ ...BODY, fontSize: "0.86rem", color: P.sub, lineHeight: 1.68, margin: "3px 0" }}>{j.text}</p>
                  <div style={{ ...BODY, fontSize: "0.8rem", color: P.ink, fontStyle: "italic", opacity: 0.85 }}>“{j.mindset}”</div>
                </div>
              </div>
            </Rv>
          ))}
        </Section>

        {/* ═══ APPENDIX · BEYOND THE LAB (not in nav) ═══ */}
        <Section id="Beyond" num="A">
          <SecTitle>Appendix — Beyond the Lab</SecTitle>
          <Rv><p style={{ ...BODY, fontSize: "0.92rem", lineHeight: 1.72, color: P.sub, marginBottom: "1.2rem", maxWidth: 600 }}>Hackathons, tech events, and a city that became home.</p></Rv>
          <Rv delay={0.06}><PhotoGallery /></Rv>
        </Section>

        {/* ═══ CONTACT ═══ */}
        <Section id="Contact" note={<p style={noteTxt}>Replies within a day or two.</p>}>
          <SecTitle>Correspondence</SecTitle>
          <Rv><p style={{ ...BODY, fontSize: "0.95rem", lineHeight: 1.76, color: P.ink, marginBottom: "1.4rem", maxWidth: 600 }}>Open to ML / applied-research roles and collaborations — especially in robustness, explainability, and generative-image forensics.</p></Rv>
          <div>
            {[
              { l: "Email", v: PAPER.email, h: `mailto:${PAPER.email}` },
              { l: "LinkedIn", v: "atharva-kocharekar", h: "https://linkedin.com/in/atharva-kocharekar-3512b4224" },
              { l: "GitHub", v: "github.com/Atharvax16", h: "https://github.com/Atharvax16" },
              { l: "Phone", v: "+353 89 960 7779", h: "tel:+353899607779" },
            ].map((c, i) => (
              <Rv key={c.l} delay={i * 0.04}>
                <a href={c.h} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "grid", gridTemplateColumns: "5.5rem 1fr", gap: "0.8rem", borderTop: `1px solid ${P.line}`, padding: "0.65rem 0", alignItems: "baseline" }}
                  onMouseEnter={e => { e.currentTarget.style.background = P.accentSoft; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <span style={{ ...MONO, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.l}</span>
                  <span style={{ ...MONO, fontSize: "0.84rem", color: P.accent }}>{c.v}</span>
                </a>
              </Rv>
            ))}
          </div>
          <Rv delay={0.2}>
            <button style={{ marginTop: "1.6rem", padding: "9px 20px", border: `1px solid ${P.ink}`, background: P.ink, color: P.paper, ...MONO, fontSize: "0.74rem", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = P.accent; e.currentTarget.style.borderColor = P.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = P.ink; e.currentTarget.style.borderColor = P.ink; }}>
              Download résumé (PDF)
            </button>
          </Rv>
          <Rv delay={0.26}>
            <footer style={{ marginTop: "2.2rem", paddingTop: "1rem", borderTop: `2px solid ${P.ink}` }}>
              <p style={{ ...MONO, fontSize: "0.62rem", color: P.sub }}>{PAPER.author} · {PAPER.stamp}</p>
              <p style={{ ...MONO, fontSize: "0.56rem", color: P.sub, opacity: 0.55, marginTop: 4 }}>Running head × 5 reveals the appendix.</p>
            </footer>
          </Rv>
        </Section>

      </div>
    </>
  );
}
