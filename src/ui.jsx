import { useState, useEffect, useRef } from "react";
import { P, GALLERY_PHOTOS } from "./data.js";

/* Type tokens */
const DISP = { fontFamily: "'Spectral',Georgia,serif" };
const BODY = { fontFamily: "'Source Serif 4',Georgia,serif" };
const MONO = { fontFamily: "'IBM Plex Mono',monospace" };

/* ════════════════════════════════════════
   REVEAL-ON-SCROLL (respects reduced motion)
   ════════════════════════════════════════ */
export function useReveal(th = 0.14) {
  const ref = useRef(null);
  const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [v, setV] = useState(reduce);
  useEffect(() => {
    if (reduce) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: th });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}

export function Rv({ children, delay = 0 }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(14px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s` }}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════
   RADAR — ink/blue metric polygon
   ════════════════════════════════════════ */
export function Radar({ m }) {
  if (!m) return null;
  const k = Object.keys(m), v = Object.values(m), cx = 50, cy = 50, r = 36;
  const st2 = (2 * Math.PI) / k.length;
  const pt = (i, val) => { const a = st2 * i - Math.PI / 2; return { x: cx + (val / 100) * r * Math.cos(a), y: cy + (val / 100) * r * Math.sin(a) }; };
  const pts = v.map((val, i) => pt(i, val));
  return (
    <svg width="104" height="104" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      {[25, 50, 75, 100].map(l => <polygon key={l} points={k.map((_, i) => { const p = pt(i, l); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke={P.line} strokeWidth="0.4" />)}
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.3" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="1.8" fill={P.accent} />)}
      {k.map((label, i) => { const p = pt(i, 130); return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill={P.sub} fontFamily="'IBM Plex Mono',monospace">{label}</text>; })}
    </svg>
  );
}

/* ════════════════════════════════════════
   PHOTO GALLERY — figure plates
   ════════════════════════════════════════ */
export function PhotoGallery() {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const categories = [
    { key: "all", label: "All" },
    { key: "hackathon", label: "Hackathons" },
    { key: "tech", label: "Tech Events" },
    { key: "life", label: "Life" },
    { key: "behind", label: "Working Notes" },
  ];
  const filtered = filter === "all" ? GALLERY_PHOTOS : GALLERY_PHOTOS.filter(p => p.category === filter);

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: "1.2rem", flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat.key} onClick={() => setFilter(cat.key)} style={{
            padding: "4px 12px", borderRadius: 2, border: `1px solid ${filter === cat.key ? P.accent : P.line}`,
            background: filter === cat.key ? P.accentSoft : "transparent",
            color: filter === cat.key ? P.accent : P.sub, cursor: "pointer",
            fontSize: "0.7rem", ...MONO, transition: "all 0.2s",
          }}>{cat.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gridAutoRows: "172px", gap: "0.7rem" }}>
        {filtered.map((photo, i) => (
          <Rv key={photo.src} delay={i * 0.04}>
            <figure
              onClick={() => setLightbox(photo)}
              style={{
                position: "relative", overflow: "hidden", cursor: "pointer", margin: 0,
                gridRow: photo.span === "tall" ? "span 2" : "span 1",
                gridColumn: photo.span === "wide" ? "span 2" : "span 1",
                border: `1px solid ${P.line}`, background: P.paper2, padding: 5,
                transition: "transform 0.25s, box-shadow 0.25s", height: "100%",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 22px rgba(22,24,29,0.14)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <img src={photo.src} alt={photo.caption} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(0.12) contrast(1.02)" }} />
            </figure>
          </Rv>
        ))}
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: "fixed", inset: 0, zIndex: 9999, background: "rgba(22,24,29,0.92)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: "2rem", animation: "fadeUp 0.3s ease",
        }}>
          <figure style={{ maxWidth: "85vw", maxHeight: "85vh", position: "relative", margin: 0, background: P.paper2, padding: 10, border: `1px solid ${P.line}` }} onClick={e => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.caption} style={{ maxWidth: "100%", maxHeight: "74vh", objectFit: "contain", display: "block" }} />
            <figcaption style={{ marginTop: "0.7rem", color: P.sub, fontSize: "0.8rem", ...MONO, maxWidth: 640 }}>{lightbox.caption}</figcaption>
            <button onClick={() => setLightbox(null)} aria-label="Close" style={{
              position: "absolute", top: -14, right: -14, width: 30, height: 30, borderRadius: "50%",
              background: P.ink, border: "none", color: P.paper, fontSize: "1rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </figure>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════
   EASTER EGG — "ink rain"
   ════════════════════════════════════════ */
export function MatrixOverlay({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const ch = "01∂∆∑∇πΩ∫λμσ∈ℝ";
    const fs = 15;
    const cols = Math.floor(c.width / fs);
    const dr = Array(cols).fill(1);
    const draw = () => {
      ctx.fillStyle = "rgba(242,241,236,0.06)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#2B4C8C";
      ctx.font = `${fs}px 'IBM Plex Mono', monospace`;
      for (let i = 0; i < dr.length; i++) {
        ctx.globalAlpha = Math.random() * 0.5 + 0.25;
        ctx.fillText(ch[Math.floor(Math.random() * ch.length)], i * fs, dr[i] * fs);
        if (dr[i] * fs > c.height && Math.random() > 0.975) dr[i] = 0;
        dr[i]++;
      }
      ctx.globalAlpha = 1;
    };
    const iv = setInterval(draw, 42);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, cursor: "pointer", background: P.paper }} onClick={onClose}>
      <canvas ref={ref} style={{ display: "block" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: P.ink, ...MONO, fontSize: "1rem", textAlign: "center", background: "rgba(251,250,246,0.85)", padding: "1.4rem 2.4rem", border: `1px solid ${P.line}` }}>
        <div style={{ fontSize: "1.8rem", marginBottom: 8, color: P.accent }}>∎</div>
        You found the appendix.
        <div style={{ fontSize: "0.72rem", marginTop: 6, color: P.sub }}>Click anywhere to return</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   CASE-STUDY DETAIL — opens as a paper sheet
   ════════════════════════════════════════ */
export function ResearchModal({ project, onClose }) {
  const p = project;
  const [tab, setTab] = useState("abstract");
  const [plotIdx, setPlotIdx] = useState(0);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const tag = { display: "inline-block", padding: "2px 8px", borderRadius: 2, fontSize: "0.62rem", background: "transparent", color: P.sub, ...MONO, border: `1px solid ${P.line}` };
  const tabs = [{ k: "abstract", l: "Abstract" }, { k: "method", l: "Method" }, { k: "results", l: "Results" }];
  const meta = ["Case study", p.year && p.year !== "TODO" ? p.year : null, p.role && p.role !== "TODO" ? p.role : null].filter(Boolean).join(" · ");

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(22,24,29,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "4vh 1.2rem", animation: "fadeUp 0.25s ease" }}>
      <div onClick={e => e.stopPropagation()} className="scr" style={{ width: "min(720px,100%)", maxHeight: "92vh", overflowY: "auto", background: P.paper2, border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, padding: "1.8rem 2rem 2rem", boxShadow: "0 30px 80px rgba(22,24,29,0.3)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ ...MONO, fontSize: "0.6rem", color: P.sub, marginBottom: 8, letterSpacing: "0.12em", textTransform: "uppercase" }}>{meta}</div>
            <h2 style={{ ...DISP, fontWeight: 600, fontSize: "1.5rem", lineHeight: 1.15, color: P.ink }}>{p.title}</h2>
            <div style={{ ...MONO, fontSize: "0.66rem", color: P.accent, marginTop: 6 }}>{p.badge}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: "transparent", border: `1px solid ${P.line}`, color: P.ink, fontSize: "1.1rem", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {p.placeholder && (
          <div style={{ ...MONO, fontSize: "0.64rem", color: P.yellow, background: "rgba(154,123,31,0.08)", border: `1px solid ${P.yellow}55`, padding: "7px 11px", margin: "14px 0 2px", lineHeight: 1.6 }}>
            ⚠ Draft — placeholder content. Replace the TODO fields for <b>{p.title}</b> in <span style={{ color: P.accent }}>PROJECTS</span> (src/data.js).
          </div>
        )}

        {p.keywords && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "14px 0 16px" }}>
            {p.keywords.map((k, i) => <span key={i} style={tag}>{k}</span>)}
          </div>
        )}

        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${P.line}`, marginBottom: "1.2rem" }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: "8px 16px 9px", border: "none", background: "transparent", cursor: "pointer", ...MONO, fontSize: "0.72rem", color: tab === t.k ? P.ink : P.sub, borderBottom: `2px solid ${tab === t.k ? P.accent : "transparent"}`, marginBottom: -1, transition: "all 0.2s" }}>{t.l}</button>
          ))}
        </div>

        {tab === "abstract" && (
          <div style={{ animation: "fadeUp 0.25s ease" }}>
            <p style={{ ...BODY, color: P.ink, fontSize: "0.95rem", lineHeight: 1.75, marginBottom: "1.2rem", textWrap: "pretty" }}>{p.abstract}</p>
            {p.architecture && (
              <div style={{ borderLeft: `2px solid ${P.accent}`, paddingLeft: "0.9rem", marginBottom: "1.2rem" }}>
                <div style={{ ...MONO, fontSize: "0.56rem", color: P.sub, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Pipeline</div>
                <div style={{ ...MONO, fontSize: "0.74rem", color: P.accent, lineHeight: 1.7 }}>{p.architecture}</div>
              </div>
            )}
            <div style={{ ...MONO, fontSize: "0.58rem", color: P.sub, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.1em" }}>Stack</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{p.tech.map((t, i) => <span key={i} style={tag}>{t}</span>)}</div>
          </div>
        )}

        {tab === "method" && (
          <ol style={{ animation: "fadeUp 0.25s ease", listStyle: "none", counterReset: "step", padding: 0, margin: 0 }}>
            {p.method.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: "0.9rem", marginBottom: "1.1rem", alignItems: "baseline" }}>
                <span style={{ ...MONO, fontSize: "0.78rem", color: P.accent, flexShrink: 0, width: 22 }}>{i + 1}.</span>
                <div>
                  <div style={{ ...DISP, fontWeight: 600, fontSize: "0.95rem", color: P.ink, marginBottom: 2 }}>{s.p}</div>
                  <p style={{ ...BODY, color: P.sub, fontSize: "0.86rem", lineHeight: 1.7 }}>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {tab === "results" && (
          <div style={{ animation: "fadeUp 0.25s ease" }}>
            <div style={{ display: "flex", gap: "1.4rem", flexWrap: "wrap", alignItems: "center", marginBottom: p.plots.length ? "1.3rem" : 0 }}>
              {p.metrics && !p.placeholder && <Radar m={p.metrics} />}
              <div style={{ flex: 1, minWidth: 200, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "0.7rem" }}>
                {(p.findings || []).map((f, i) => (
                  <div key={i} style={{ borderTop: `2px solid ${P.ink}`, paddingTop: 6 }}>
                    <div style={{ ...DISP, fontWeight: 600, fontSize: "1.25rem", color: P.ink }}>{f.value}</div>
                    <div style={{ ...MONO, fontSize: "0.62rem", color: P.sub, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
                    {f.note && <div style={{ ...BODY, fontSize: "0.72rem", color: P.sub, marginTop: 4, lineHeight: 1.5 }}>{f.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            {p.plots && p.plots.length > 0 ? (
              <figure style={{ margin: 0 }}>
                <img src={p.plots[plotIdx].src} alt={p.plots[plotIdx].caption} style={{ width: "100%", border: `1px solid ${P.line}`, background: "#fff", display: "block" }} />
                <figcaption style={{ ...MONO, fontSize: "0.66rem", color: P.sub, margin: "8px 0 10px", lineHeight: 1.5 }}>
                  <b style={{ color: P.ink }}>Fig. {plotIdx + 1}.</b> {p.plots[plotIdx].caption}
                </figcaption>
                {p.plots.length > 1 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {p.plots.map((pl, i) => (
                      <button key={i} onClick={() => setPlotIdx(i)} style={{ width: 56, height: 38, overflow: "hidden", border: `1px solid ${i === plotIdx ? P.accent : P.line}`, padding: 0, cursor: "pointer", background: "#fff" }}>
                        <img src={pl.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: i === plotIdx ? 1 : 0.55 }} />
                      </button>
                    ))}
                  </div>
                )}
              </figure>
            ) : (
              <p style={{ ...MONO, fontSize: "0.7rem", color: P.sub, opacity: 0.8, marginTop: "0.4rem" }}>{p.placeholder ? "// TODO: add result figures to /public/images/plots/ and list them in this project's `plots` array." : "Result figures available on request."}</p>
            )}
          </div>
        )}

        {p.links && (p.links.github || p.links.demo || p.links.paper) && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: "1.6rem", paddingTop: "1rem", borderTop: `1px solid ${P.line}` }}>
            {p.links.github && <a href={p.links.github} target="_blank" rel="noopener noreferrer" style={{ ...MONO, fontSize: "0.72rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>GitHub ↗</a>}
            {p.links.demo && <a href={p.links.demo} target="_blank" rel="noopener noreferrer" style={{ ...MONO, fontSize: "0.72rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>Live demo ↗</a>}
            {p.links.paper && <a href={p.links.paper} target="_blank" rel="noopener noreferrer" style={{ ...MONO, fontSize: "0.72rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>Paper ↗</a>}
          </div>
        )}
      </div>
    </div>
  );
}
