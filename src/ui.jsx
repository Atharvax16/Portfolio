import { useState, useEffect, useRef } from "react";
import { P, GALLERY_PHOTOS, ARCHITECTURES, LIVE_ARCHITECTURES, METRICS, METRIC_FAMILIES } from "./data.js";

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
   HAND-DRAWN INK SKETCHES
   A shared roughening filter (feTurbulence + displacement) gives clean
   SVG paths a wobbly, pen-on-paper feel. Strokes are ink-blue marginalia.
   ════════════════════════════════════════ */
const SK = { font: "'IBM Plex Mono',monospace" };

/* Drop into a <defs>; reference the filter by id to wobble a <g>. */
function RoughDefs({ id, scale = 1.6, freq = 0.016, seed = 7 }) {
  return (
    <filter id={id} x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="2" seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

function SketchFrame({ caption, children, ratio = "5 / 3" }) {
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ border: `1px solid ${P.line}`, background: P.paper2, aspectRatio: ratio, display: "block" }}>
        {children}
      </div>
      {caption && (
        <figcaption style={{ ...SK, fontSize: "0.66rem", color: P.sub, marginTop: 8, lineHeight: 1.55 }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* The central thesis tension: restoration quality climbs while the
   classifier's accuracy slips — "looks restored, reads wrong". */
export function SketchFidelityAccuracy() {
  return (
    <svg viewBox="0 0 400 240" width="100%" height="100%" role="img"
      aria-label="Sketch: restoration quality rises while classifier accuracy falls, crossing in the middle"
      style={{ display: "block" }}>
      <defs><RoughDefs id="rgh-fa" scale={1.7} /></defs>
      <g filter="url(#rgh-fa)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* axes */}
        <path d="M48 24 L48 198 L372 198" stroke={P.sub} strokeWidth="1.4" />
        {/* quality rising */}
        <path d="M58 184 C 150 176, 210 120, 364 52" stroke={P.accent} strokeWidth="2.4" />
        {/* accuracy falling */}
        <path d="M58 64 C 170 78, 240 150, 364 188" stroke={P.red} strokeWidth="2.4" />
        {/* crossing mark */}
        <circle cx="205" cy="128" r="7" stroke={P.ink} strokeWidth="1.3" />
        <path d="M199 122 L211 134 M211 122 L199 134" stroke={P.ink} strokeWidth="1.1" />
      </g>
      {/* labels (left un-roughened for legibility) */}
      <text x="366" y="44" textAnchor="end" style={SK} fontSize="11" fill={P.accent}>restoration quality ↑</text>
      <text x="366" y="206" textAnchor="end" style={SK} fontSize="11" fill={P.red}>classifier accuracy ↓</text>
      <text x="210" y="232" textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>restoration strength →</text>
      <text x="224" y="120" style={SK} fontSize="10" fontStyle="italic" fill={P.ink}>the crossing</text>
      <text x="58" y="44" style={SK} fontSize="10.5" fontStyle="italic" fill={P.sub}>“looks restored,</text>
      <text x="58" y="58" style={SK} fontSize="10.5" fontStyle="italic" fill={P.sub}>reads wrong”</text>
    </svg>
  );
}

/* Where a researcher sits: rings of known work growing outward, a gap at
   the frontier, and you near the centre — early, with the long climb ahead. */
export function SketchResearcherFrontier() {
  return (
    <svg viewBox="0 0 360 300" width="100%" height="100%" role="img"
      aria-label="Sketch: concentric rings of knowledge with a frontier gap and 'you are here' near the centre"
      style={{ display: "block" }}>
      <defs><RoughDefs id="rgh-rf" scale={1.5} seed={11} /></defs>
      <g filter="url(#rgh-rf)" fill="none" strokeLinecap="round">
        {/* inner rings — accumulated knowledge */}
        <circle cx="155" cy="158" r="26" stroke={P.faint} strokeWidth="1.2" />
        <circle cx="155" cy="158" r="58" stroke={P.line} strokeWidth="1.2" />
        <circle cx="155" cy="158" r="92" stroke={P.line} strokeWidth="1.2" />
        {/* frontier ring with a gap at the top */}
        <path d="M198 39.6 A 126 126 0 1 1 112 39.6" stroke={P.ink} strokeWidth="1.8" />
        {/* the dent being pushed past the frontier */}
        <path d="M112 39.6 Q 155 8, 198 39.6" stroke={P.accent} strokeWidth="2.4" />
        {/* the long climb */}
        <path d="M155 150 L155 46" stroke={P.accent} strokeWidth="1.3" strokeDasharray="5 5" />
        <path d="M150 56 L155 44 L160 56" stroke={P.accent} strokeWidth="1.3" />
        {/* you */}
        <circle cx="155" cy="158" r="4.5" fill={P.accent} stroke="none" />
      </g>
      {/* labels */}
      <text x="216" y="26" style={SK} fontSize="10.5" fill={P.accent}>your dent — someday</text>
      <text x="168" y="166" style={SK} fontSize="10.5" fill={P.ink}>you are here</text>
      <text x="168" y="178" style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>early, first principles</text>
      <text x="155" y="296" textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>frontier of the field</text>
      <text x="60" y="112" style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>knowledge</text>
      <text x="60" y="124" style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>grows outward</text>
    </svg>
  );
}

/* Why geometry is physics: a molecule's energy decomposes into bond
   length, bond angle, and dihedral — orientation is real, so the network
   that scores it must be equivariant. (MPNN → SchNet → DimeNet → NequIP.) */
export function SketchMolecule() {
  const atom = (x, y, k) => (
    <g key={k}>
      <circle cx={x} cy={y} r="9.5" fill={P.paper2} stroke={P.ink} strokeWidth="1.6" />
    </g>
  );
  return (
    <svg viewBox="0 0 400 230" width="100%" height="100%" role="img"
      aria-label="Sketch: a four-atom molecule annotated with bond length r, angle theta, and dihedral phi"
      style={{ display: "block" }}>
      <defs><RoughDefs id="rgh-mol" scale={1.3} seed={3} /></defs>
      <g filter="url(#rgh-mol)" fill="none" strokeLinecap="round">
        {/* bonds */}
        <path d="M70 150 L150 92" stroke={P.ink} strokeWidth="2" />
        <path d="M150 92 L230 150" stroke={P.ink} strokeWidth="2" />
        <path d="M230 150 L310 92" stroke={P.ink} strokeWidth="2" />
        {/* out-of-plane bond — direction is physical */}
        <path d="M310 92 L350 138" stroke={P.sub} strokeWidth="1.6" strokeDasharray="4 4" />
        {/* angle arc at the middle atom */}
        <path d="M167.6 105.2 A 22 22 0 0 1 132.4 105.2" stroke={P.accent} strokeWidth="1.6" />
        {/* dihedral / direction arrow */}
        <path d="M256 118 A 16 16 0 0 1 284 110" stroke={P.red} strokeWidth="1.6" />
        <path d="M284 110 L278 106 M284 110 L282 117" stroke={P.red} strokeWidth="1.4" />
        {/* atoms */}
        {atom(70, 150, "a")}
        {atom(150, 92, "b")}
        {atom(230, 150, "c")}
        {atom(310, 92, "d")}
      </g>
      {/* labels */}
      <text x="100" y="132" style={SK} fontSize="11" fill={P.ink}>r</text>
      <text x="150" y="128" textAnchor="middle" style={SK} fontSize="11" fill={P.accent}>θ</text>
      <text x="272" y="100" style={SK} fontSize="11" fill={P.red}>φ</text>
      <text x="344" y="156" style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>orientation</text>
      <text x="200" y="208" textAnchor="middle" style={{ fontFamily: "'IBM Plex Mono',monospace" }} fontSize="13" fill={P.ink}>
        E = Σ Eᵣ(r) + Σ E_θ(θ) + Σ E_φ(φ)
      </text>
      <text x="200" y="224" textAnchor="middle" style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>distance · angle · dihedral — direction matters</text>
    </svg>
  );
}

/* Attention is just linear algebra: a row of softmax weights times the
   value matrix yields one output vector. softmax(QKᵀ/√d) · V. */
export function SketchAttention() {
  const W = [
    [0.72, 0.10, 0.10, 0.08],
    [0.18, 0.60, 0.12, 0.10],
    [0.10, 0.20, 0.50, 0.20],
    [0.08, 0.10, 0.20, 0.62],
  ];
  const cell = 22, ax = 44, ay = 34, vx = 178, ox = 266, oy = 34;
  return (
    <svg viewBox="0 0 400 200" width="100%" height="100%" role="img"
      aria-label="Sketch: an attention weight matrix times a value matrix equals the output"
      style={{ display: "block" }}>
      <defs><RoughDefs id="rgh-att" scale={1.1} seed={5} /></defs>
      <g filter="url(#rgh-att)" strokeLinecap="round">
        {/* attention weight matrix */}
        {W.map((row, i) => row.map((w, j) => (
          <rect key={`a${i}${j}`} x={ax + j * cell} y={ay + i * cell} width={cell} height={cell}
            fill={P.accent} fillOpacity={w} stroke={P.line} strokeWidth="0.8" />
        )))}
        {/* value matrix V */}
        {[0, 1, 2, 3].map(i => [0, 1].map(j => (
          <rect key={`v${i}${j}`} x={vx + j * cell} y={ay + i * cell} width={cell} height={cell}
            fill={P.paper2} stroke={P.ink} strokeWidth="1.1" />
        )))}
        {/* output */}
        {[0, 1, 2, 3].map(i => [0, 1].map(j => (
          <rect key={`o${i}${j}`} x={ox + j * cell} y={oy + i * cell} width={cell} height={cell}
            fill={P.accentSoft} stroke={P.ink} strokeWidth="1.1" />
        )))}
      </g>
      {/* operators + labels (un-roughened) */}
      <text x="156" y="80" textAnchor="middle" style={SK} fontSize="16" fill={P.ink}>×</text>
      <text x="246" y="80" textAnchor="middle" style={SK} fontSize="16" fill={P.ink}>=</text>
      <text x="88" y="144" textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>softmax(QKᵀ/√d)</text>
      <text x="200" y="144" textAnchor="middle" style={SK} fontSize="11" fill={P.ink}>V</text>
      <text x="288" y="144" textAnchor="middle" style={SK} fontSize="9.5" fill={P.sub}>attention(Q,K,V)</text>
      <text x="200" y="20" textAnchor="middle" style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>each query: a weighted average of values · rows sum to 1</text>
    </svg>
  );
}

/* The non-saturating trick: when the generator is losing (D ≈ 0), the
   saturating loss log(1−D) gives almost no gradient, while −log(D) still
   pushes hard. Gradient-to-G vs the discriminator's belief. */
export function SketchSaturating() {
  return (
    <svg viewBox="0 0 400 230" width="100%" height="100%" role="img"
      aria-label="Sketch: gradient to the generator vs discriminator confidence, saturating vs non-saturating loss"
      style={{ display: "block" }}>
      <defs><RoughDefs id="rgh-sat" scale={1.4} seed={9} /></defs>
      <g filter="url(#rgh-sat)" fill="none" strokeLinecap="round">
        <path d="M50 24 L50 188 L368 188" stroke={P.sub} strokeWidth="1.4" />
        {/* non-saturating −log(D): strong when D is small */}
        <path d="M60 46 C 150 70, 250 150, 360 176" stroke={P.accent} strokeWidth="2.4" />
        {/* saturating log(1−D): vanishes when D is small */}
        <path d="M60 180 C 180 176, 270 120, 360 56" stroke={P.red} strokeWidth="2.4" strokeDasharray="6 5" />
        {/* the danger zone: generator losing */}
        <path d="M50 24 L110 24 L110 188 L50 188 Z" stroke="none" fill={P.red} fillOpacity="0.05" />
      </g>
      <text x="58" y="38" style={SK} fontSize="10" fill={P.accent}>−log D(G)  (non-saturating)</text>
      <text x="360" y="48" textAnchor="end" style={SK} fontSize="10" fill={P.red}>log(1−D)  (saturating)</text>
      <text x="80" y="206" textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.red}>G losing</text>
      <text x="210" y="222" textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>D(G(z)) — discriminator believes it's real →</text>
      <text x="40" y="40" style={SK} fontSize="10" fill={P.sub} transform="rotate(-90 40 40)" textAnchor="end">∇ to G →</text>
    </svg>
  );
}

/* FFT as a frequency un-mixer. The 2D spectrum sorts an image by scale:
   low frequencies (broad shapes) land in the centre, high frequencies
   (fine texture, edges) at the rim. Radially average it and a real photo
   falls off smoothly; many generators — through their up-sampling stacks —
   leave structured, excess energy in the high-frequency tail. That tail is
   the tell. */
export function SketchFFT() {
  const px = 30, py = 52, ps = 116, pc = px + ps / 2, pcy = py + ps / 2;
  const gx0 = 206, gx1 = 404, gy0 = 56, gy1 = 196;
  const X = t => gx0 + t * (gx1 - gx0);                                   // low → high freq
  const Yr = t => gy1 - (gy1 - gy0) * Math.exp(-3.1 * t);                 // real: smooth decay
  const Yf = t => gy1 - (gy1 - gy0) * (Math.exp(-3.1 * t) + 0.34 * Math.pow(t, 2.4)); // fake: + high-freq tail
  const N = 26;
  const curve = (Y) => Array.from({ length: N + 1 }, (_, i) => { const t = i / N; return `${i ? "L" : "M"}${X(t).toFixed(1)} ${Math.min(gy1, Y(t)).toFixed(1)}`; }).join(" ");
  const ycy = (gy0 + gy1) / 2;
  return (
    <svg viewBox="0 0 420 230" width="100%" height="100%" role="img"
      aria-label="Sketch: the 2D FFT puts low frequencies at the centre and high at the edges; a real image's radial spectrum falls off smoothly while a generated image keeps an excess high-frequency tail"
      style={{ display: "block" }}>
      <defs>
        <RoughDefs id="rgh-fft" scale={1.2} seed={13} />
        <radialGradient id="fft-mag" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.accent} stopOpacity="0.9" />
          <stop offset="0.18" stopColor={P.accent} stopOpacity="0.45" />
          <stop offset="0.55" stopColor={P.accent} stopOpacity="0.12" />
          <stop offset="1" stopColor={P.accent} stopOpacity="0.02" />
        </radialGradient>
      </defs>

      {/* ── left: 2D |FFT| magnitude — low centre, high edges ── */}
      <text x={pc} y={py - 8} textAnchor="middle" style={SK} fontSize="10.5" fill={P.ink}>|FFT| magnitude</text>
      <rect x={px} y={py} width={ps} height={ps} fill="#fff" stroke={P.ink} strokeWidth="1.3" />
      <rect x={px} y={py} width={ps} height={ps} fill="url(#fft-mag)" />
      <g filter="url(#rgh-fft)" fill="none">
        {[16, 30, 46].map(r => <circle key={r} cx={pc} cy={pcy} r={r} stroke={P.sub} strokeOpacity="0.3" strokeWidth="0.9" />)}
      </g>
      <circle cx={pc} cy={pcy} r="3.2" fill={P.accent} />
      <text x={pc} y={pcy - 7} textAnchor="middle" style={SK} fontSize="9" fill={P.accent}>low</text>
      <line x1={px + ps - 8} y1={py + 8} x2={px + ps - 22} y2={py + 22} stroke={P.red} strokeWidth="1" />
      <text x={px + ps - 4} y={py + 15} textAnchor="end" style={SK} fontSize="9" fill={P.red}>high</text>
      <text x={pc} y={py + ps + 16} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.sub}>centre = low · edges = high</text>

      {/* feed-in arrow → radial average */}
      <text x={172} y={pcy - 8} textAnchor="middle" style={SK} fontSize="8.5" fill={P.accent}>radial avg</text>
      <path d="M150 110 L194 110" stroke={P.accent} strokeWidth="1.4" fill="none" />
      <path d="M186 104 L196 110 L186 116" stroke={P.accent} strokeWidth="1.4" fill="none" />

      {/* ── right: radial spectrum — real vs fake ── */}
      <g filter="url(#rgh-fft)" fill="none" strokeLinecap="round">
        <path d={`M${gx0} ${gy0} L${gx0} ${gy1} L${gx1} ${gy1}`} stroke={P.sub} strokeWidth="1.3" />
        <path d={curve(Yr)} stroke={P.accent} strokeWidth="2.3" />
        <path d={curve(Yf)} stroke={P.red} strokeWidth="2.3" strokeDasharray="6 5" />
      </g>
      {/* high-freq divergence band */}
      <rect x={X(0.62)} y={gy0} width={gx1 - X(0.62)} height={gy1 - gy0} fill={P.red} fillOpacity="0.05" />
      <line x1={X(0.62)} y1={gy0} x2={X(0.62)} y2={gy1} stroke={P.sub} strokeWidth="0.8" strokeDasharray="3 3" />
      {/* legend */}
      <line x1={296} y1={70} x2={316} y2={70} stroke={P.accent} strokeWidth="2.3" />
      <text x={320} y={73} style={SK} fontSize="9" fill={P.accent}>real</text>
      <line x1={296} y1={86} x2={316} y2={86} stroke={P.red} strokeWidth="2.3" strokeDasharray="6 5" />
      <text x={320} y={89} style={SK} fontSize="9" fill={P.red}>fake</text>
      {/* annotations */}
      <text x={(X(0.62) + gx1) / 2} y={gy1 + 14} textAnchor="middle" style={SK} fontSize="8.5" fontStyle="italic" fill={P.red}>the tell</text>
      <text x={(gx0 + gx1) / 2} y={gy1 + 26} textAnchor="middle" style={SK} fontSize="9.5" fill={P.sub}>radial frequency →</text>
      <text x={gx0 - 8} y={ycy} style={SK} fontSize="9.5" fill={P.sub} transform={`rotate(-90 ${gx0 - 8} ${ycy})`} textAnchor="middle">log |F|</text>
    </svg>
  );
}

/* Why up-convolution breaks the spectrum, and how to fix it (Durall 2020).
   Transposed conv / up-sampling stuffs zeros between samples; the learned
   filter never perfectly low-passes them, so a high-frequency copy of the
   spectrum survives — the artifact. A spectral-regularization loss adds a
   term that matches the generator's azimuthal power spectrum to real data,
   pulling the curve back down — which also erases the detector's tell. */
export function SketchSpectral() {
  // left: zero-insertion stems
  const yA = 88, yB = 176;
  const inA = [[44, 30], [72, 46], [100, 22]];
  const up = [[36, 30], [54, 0], [72, 46], [90, 0], [108, 22], [126, 0]];
  // right: azimuthal power spectrum
  const gx0 = 214, gx1 = 418, gy0 = 58, gy1 = 188;
  const X = t => gx0 + t * (gx1 - gx0);
  const Yr = t => gy1 - (gy1 - gy0) * Math.exp(-3.0 * t);                          // real
  const Yg = t => gy1 - (gy1 - gy0) * (Math.exp(-3.0 * t) + 0.32 * Math.pow(t, 2.4)); // GAN, no reg
  const N = 24;
  const curve = (Y) => Array.from({ length: N + 1 }, (_, i) => { const t = i / N; return `${i ? "L" : "M"}${X(t).toFixed(1)} ${Math.min(gy1, Y(t)).toFixed(1)}`; }).join(" ");
  const at = 0.85;
  return (
    <svg viewBox="0 0 440 238" width="100%" height="100%" role="img"
      aria-label="Sketch: up-convolution inserts zeros that leave a high-frequency copy in the spectrum; a spectral-regularization loss matches the azimuthal power spectrum to real data and removes the artifact"
      style={{ display: "block" }}>
      <defs><RoughDefs id="rgh-spec" scale={1.2} seed={17} /></defs>

      {/* ── left: up-conv inserts zeros ── */}
      <text x={92} y={44} textAnchor="middle" style={SK} fontSize="10.5" fill={P.ink}>up-convolution</text>
      <g filter="url(#rgh-spec)" strokeLinecap="round">
        <line x1={28} y1={yA} x2={140} y2={yA} stroke={P.line} strokeWidth="1" />
        {inA.map(([x, h], i) => <g key={`i${i}`}><line x1={x} y1={yA} x2={x} y2={yA - h} stroke={P.accent} strokeWidth="2" /><circle cx={x} cy={yA - h} r="3.4" fill={P.accent} /></g>)}
        <line x1={28} y1={yB} x2={140} y2={yB} stroke={P.line} strokeWidth="1" />
        {up.map(([x, h], i) => h > 0
          ? <g key={`u${i}`}><line x1={x} y1={yB} x2={x} y2={yB - h} stroke={P.accent} strokeWidth="2" /><circle cx={x} cy={yB - h} r="3.2" fill={P.accent} /></g>
          : <circle key={`u${i}`} cx={x} cy={yB} r="3" fill="none" stroke={P.red} strokeWidth="1.3" />)}
      </g>
      <text x={128} y={yA - 2} style={SK} fontSize="9" fill={P.sub}>input</text>
      <text x={92} y={128} textAnchor="middle" style={SK} fontSize="9" fill={P.accent}>insert zeros ↓</text>
      <text x={94} y={yB + 4} style={SK} fontSize="8.5" fill={P.red}>0</text>
      <text x={92} y={212} textAnchor="middle" style={SK} fontSize="8.5" fontStyle="italic" fill={P.sub}>zeros → high-freq copy survives</text>

      {/* ── right: azimuthal power spectrum + spectral-reg ── */}
      <g filter="url(#rgh-spec)" fill="none" strokeLinecap="round">
        <path d={`M${gx0} ${gy0} L${gx0} ${gy1} L${gx1} ${gy1}`} stroke={P.sub} strokeWidth="1.3" />
        <path d={curve(Yr)} stroke={P.accent} strokeWidth="2.3" />
        <path d={curve(Yg)} stroke={P.red} strokeWidth="2.3" strokeDasharray="6 5" />
      </g>
      {/* the reg loss pulls the GAN curve down onto the real curve */}
      <path d={`M${X(at)} ${Yg(at) + 4} L${X(at)} ${Yr(at) - 5}`} stroke={P.green} strokeWidth="1.6" />
      <path d={`M${X(at) - 4} ${Yr(at) - 11} L${X(at)} ${Yr(at) - 4} L${X(at) + 4} ${Yr(at) - 11}`} stroke={P.green} strokeWidth="1.6" fill="none" />
      <circle cx={X(at)} cy={Yr(at)} r="3.2" fill={P.green} />
      <text x={X(at) + 7} y={(Yg(at) + Yr(at)) / 2} style={SK} fontSize="9" fill={P.green}>+ reg</text>
      {/* legend */}
      <line x1={300} y1={70} x2={320} y2={70} stroke={P.accent} strokeWidth="2.3" />
      <text x={324} y={73} style={SK} fontSize="9" fill={P.accent}>real</text>
      <line x1={300} y1={86} x2={320} y2={86} stroke={P.red} strokeWidth="2.3" strokeDasharray="6 5" />
      <text x={324} y={89} style={SK} fontSize="9" fill={P.red}>GAN</text>
      {/* axes + loss */}
      <text x={(gx0 + gx1) / 2} y={gy1 + 14} textAnchor="middle" style={SK} fontSize="9.5" fill={P.sub}>radial frequency →</text>
      <text x={gx0 - 8} y={(gy0 + gy1) / 2} style={SK} fontSize="9.5" fill={P.sub} transform={`rotate(-90 ${gx0 - 8} ${(gy0 + gy1) / 2})`} textAnchor="middle">log power</text>
      <text x={(gx0 + gx1) / 2} y={gy1 + 32} textAnchor="middle" style={{ fontFamily: "'IBM Plex Mono',monospace" }} fontSize="9.5" fill={P.ink}>L = L_adv + λ‖AS(G) − AS(real)‖</text>
      <text x={(gx0 + gx1) / 2} y={gy1 + 46} textAnchor="middle" style={SK} fontSize="8.5" fontStyle="italic" fill={P.sub}>match the statistic → the tell disappears</text>
    </svg>
  );
}

/* DCT vs DFT on the same image (Frank 2020). The DFT magnitude smears the
   up-sampling artifact into a ring and throws phase away; the DCT's real,
   energy-compacting basis lays coefficients on a grid, so the generator's
   up-sampling stack surfaces as a regular high-frequency lattice — a tell a
   linear model can read straight off. Same culprit as Durall, sharper lens. */
export function SketchDCT() {
  const lx = 28, ly = 52, s = 150;                 // left: DFT magnitude panel
  const rx = 252, ry = 52;                          // right: DCT coefficient panel
  const lcx = lx + s / 2, lcy = ly + s / 2;
  const dn = 8, dcell = s / dn;

  // DCT coefficients: energy compacts toward the DC (top-left) corner.
  const cells = [];
  for (let r = 0; r < dn; r++) for (let c = 0; c < dn; c++) {
    const f = (r + c) / (2 * (dn - 1));
    const e = Math.exp(-3.4 * f);
    cells.push(<rect key={`d${r}-${c}`} x={rx + c * dcell} y={ry + r * dcell} width={dcell} height={dcell} fill={P.accent} fillOpacity={(0.9 * e).toFixed(3)} stroke={P.line} strokeWidth="0.4" />);
  }
  // the up-sampling artifact — a regular lattice of high-frequency coefficients
  const art = [];
  for (let r = 1; r < dn; r += 2) for (let c = 1; c < dn; c += 2) {
    art.push(<rect key={`a${r}-${c}`} x={rx + c * dcell + dcell * 0.2} y={ry + r * dcell + dcell * 0.2} width={dcell * 0.6} height={dcell * 0.6} fill={P.red} fillOpacity={0.45 + 0.35 * ((r + c) / (2 * (dn - 1)))} stroke="none" />);
  }

  return (
    <svg viewBox="0 0 440 248" width="100%" height="100%" role="img"
      aria-label="Sketch: on the same image the DFT smears the up-sampling artifact into a ring while the DCT lays it out as a regular high-frequency coefficient lattice"
      style={{ display: "block" }}>
      <defs><RoughDefs id="rgh-dct" scale={1.1} seed={29} /></defs>

      {/* ── left: DFT magnitude ── */}
      <text x={lcx} y={ly - 14} textAnchor="middle" style={SK} fontSize="10.5" fill={P.ink}>DFT — magnitude</text>
      <g filter="url(#rgh-dct)">
        <rect x={lx} y={ly} width={s} height={s} fill={P.faint} stroke={P.ink} strokeWidth="1.3" />
        {[52, 40, 28, 16].map((rr, i) => <circle key={`ring${i}`} cx={lcx} cy={lcy} r={rr} fill="none" stroke={P.accent} strokeOpacity={0.14 + 0.06 * i} strokeWidth="2" />)}
        <circle cx={lcx} cy={lcy} r="5" fill={P.accent} />
        {[[-1, -1], [1, 1], [1, -1], [-1, 1]].map(([dx, dy], i) => <circle key={`peak${i}`} cx={lcx + dx * 46} cy={lcy + dy * 46} r="3" fill={P.red} fillOpacity="0.5" />)}
      </g>
      <text x={lcx} y={ly + s + 18} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.sub}>smeared ring · phase thrown away</text>

      {/* ── middle: same image, two transforms ── */}
      <text x={(lx + s + rx) / 2} y={lcy - 6} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>same</text>
      <text x={(lx + s + rx) / 2} y={lcy + 5} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>image</text>
      <path d={`M${lx + s + 4} ${lcy + 20} L${rx - 6} ${lcy + 20}`} stroke={P.accent} strokeWidth="1.2" fill="none" />
      <path d={`M${rx - 14} ${lcy + 15} L${rx - 4} ${lcy + 20} L${rx - 14} ${lcy + 25}`} stroke={P.accent} strokeWidth="1.2" fill="none" />

      {/* ── right: DCT coefficients ── */}
      <text x={rx + s / 2} y={ry - 14} textAnchor="middle" style={SK} fontSize="10.5" fill={P.ink}>DCT — coefficients</text>
      <g filter="url(#rgh-dct)">
        {cells}
        {art}
        <rect x={rx + dcell * 4} y={ry + dcell * 4} width={dcell * 4} height={dcell * 4} fill="none" stroke={P.red} strokeWidth="1" strokeDasharray="3 2" />
        <rect x={rx} y={ry} width={s} height={s} fill="none" stroke={P.ink} strokeWidth="1.3" />
      </g>
      <text x={rx + dcell * 0.5} y={ry + dcell * 0.5 + 3} textAnchor="middle" style={SK} fontSize="7" fill={P.paper2}>DC</text>
      <text x={rx + s / 2} y={ry + s + 18} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.sub}>energy compacts ↖ · red lattice = the tell</text>

      {/* ── bottom: the takeaway line ── */}
      <text x={220} y={ry + s + 38} textAnchor="middle" style={{ fontFamily: "'IBM Plex Mono',monospace" }} fontSize="9.5" fill={P.ink}>real, energy-compacting basis → up-sampling grid stands out</text>
    </svg>
  );
}

/* ════════════════════════════════════════
   LAB GATEWAY — the door on the paper's §7.
   The walkthroughs used to sit inline here and ran to most of a screen each.
   They live in the Lab (#/lab) now; what stays behind is a display case that
   rotates through what's inside, so the section reads as an invitation
   rather than a wall. Each name deep-links straight to its own bench.
   ════════════════════════════════════════ */
const GLYPHS = {
  /* One 40×40 mark per architecture — the idea at a glance, in the same
     hand as the sketches inside. */
  vit: (c) => (
    <g stroke={c} strokeWidth="1.3" fill="none">
      <rect x="6" y="6" width="28" height="28" />
      <line x1="15.3" y1="6" x2="15.3" y2="34" /><line x1="24.6" y1="6" x2="24.6" y2="34" />
      <line x1="6" y1="15.3" x2="34" y2="15.3" /><line x1="6" y1="24.6" x2="34" y2="24.6" />
      <rect x="24.6" y="6" width="9.4" height="9.3" fill={c} fillOpacity="0.3" stroke="none" />
    </g>
  ),
  cnn: (c) => (
    <g stroke={c} strokeWidth="1.3" fill="none">
      <rect x="4" y="8" width="22" height="22" />
      <rect x="9" y="13" width="8" height="8" fill={c} fillOpacity="0.28" />
      <path d="M27 19 L33 19" /><path d="M30 16 L33 19 L30 22" />
      <rect x="30" y="14" width="6" height="10" fillOpacity="0" />
    </g>
  ),
  dinov2: (c) => (
    <g stroke={c} strokeWidth="1.3" fill="none">
      <circle cx="12" cy="14" r="7" /><circle cx="28" cy="26" r="7" fill={c} fillOpacity="0.22" />
      <path d="M18 18 Q24 20 23 21" strokeDasharray="2.5 2.5" />
      <path d="M21 22 L23 21 L22.5 18.6" />
    </g>
  ),
  steervit: (c) => (
    <g stroke={c} strokeWidth="1.3" fill="none">
      <rect x="13" y="6" width="14" height="8" /><rect x="13" y="16" width="14" height="8" fill={c} fillOpacity="0.25" />
      <rect x="13" y="26" width="14" height="8" />
      <path d="M4 20 L11 20" /><path d="M8 17 L11 20 L8 23" />
    </g>
  ),
  rag: (c) => (
    /* an index of passages, one of them pulled into the generator */
    <g stroke={c} strokeWidth="1.3" fill="none">
      <rect x="4" y="7" width="13" height="5" />
      <rect x="4" y="14.5" width="13" height="5" fill={c} fillOpacity="0.3" />
      <rect x="4" y="22" width="13" height="5" />
      <rect x="4" y="29.5" width="13" height="5" />
      <path d="M17 17 Q24 17 24 20" />
      <path d="M21.5 14.6 L24.4 17.2 L21 18.4" />
      <rect x="24" y="20" width="12" height="12" fill={c} fillOpacity="0.12" />
    </g>
  ),
  detection: (c) => (
    <g stroke={c} strokeWidth="1.3" fill="none">
      <path d="M4 26 Q9 14 13 22 T22 20 T33 25" />
      <circle cx="24" cy="14" r="7.5" fill={c} fillOpacity="0.12" />
      <path d="M29.4 19.4 L35 25" strokeWidth="1.8" />
    </g>
  ),
  moviechat: (c) => (
    /* a filmstrip collapsing: many frames in, a few wide slots out */
    <g stroke={c} strokeWidth="1.3" fill="none">
      <rect x="4" y="9" width="15" height="22" />
      <line x1="8.7" y1="9" x2="8.7" y2="31" /><line x1="13.4" y1="9" x2="13.4" y2="31" />
      <path d="M20 20 L26 20" /><path d="M23 17 L26 20 L23 23" />
      <rect x="27" y="9" width="9" height="22" fill={c} fillOpacity="0.28" />
    </g>
  ),
  memorybank: (c) => (
    /* the Ebbinghaus forgetting curve — retention decaying, a recall dot on it */
    <g stroke={c} strokeWidth="1.3" fill="none">
      <path d="M6 6 L6 33" /><path d="M6 33 L35 33" />
      <path d="M7 9 Q13 29 34 31" />
      <circle cx="13" cy="20" r="2.6" fill={c} fillOpacity="0.3" stroke="none" />
      <path d="M13 20 L13 33" strokeWidth="0.9" strokeDasharray="2 2" />
    </g>
  ),
};

function ArchGlyph({ k, color, size = 40 }) {
  const draw = GLYPHS[k];
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <defs><RoughDefs id={`rgh-g-${k}`} scale={0.7} seed={11} /></defs>
      <g filter={`url(#rgh-g-${k})`}>{draw ? draw(color) : null}</g>
    </svg>
  );
}

export function LabGateway() {
  const live = LIVE_ARCHITECTURES;
  const planned = ARCHITECTURES.filter((a) => a.status === "planned");
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);

  /* The case rotates on its own so a passing eye catches movement — but it
     holds still on hover (you're reading it) and for reduced-motion users. */
  useEffect(() => {
    if (hover) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % live.length), 3200);
    return () => clearInterval(t);
  }, [hover, live.length]);

  const cur = live[i];

  return (
    <>
      <style>{`
        .gate{display:block;width:100%;text-align:left;cursor:pointer;background:${P.paper2};
          border:1px solid ${P.line};border-top:2px solid ${P.ink};padding:0;
          transition:transform .18s ease,box-shadow .18s ease}
        .gate:hover{transform:translateY(-2px);box-shadow:4px 4px 0 ${P.line}}
        .gate:hover .gate-cta{gap:12px}
        .gate-cta{display:inline-flex;align-items:center;gap:7px;transition:gap .18s ease}
        .gate-names{display:flex;flex-wrap:wrap;gap:5px}
        .gate-name{background:transparent;border:1px solid ${P.line};cursor:pointer;
          padding:3px 9px;transition:border-color .15s,color .15s,background .15s}
        .gate-name:hover{border-color:${P.accent};color:${P.accent};background:${P.accentSoft}}
        @keyframes gatePulse{0%,100%{opacity:.35}50%{opacity:1}}
        .gate-live{animation:gatePulse 2.4s ease-in-out infinite}
        @media(prefers-reduced-motion:reduce){.gate,.gate-cta,.gate-live{transition:none;animation:none}}
      `}</style>

      <div
        className="gate"
        role="link"
        tabIndex={0}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => { window.location.hash = `#/lab/${cur.key}`; }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.location.hash = `#/lab/${cur.key}`; } }}
        aria-label={`Enter the Architecture Lab — ${live.length} interactive walkthroughs`}
      >
        {/* the case window — one architecture at a time */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.1rem 1.2rem", borderBottom: `1px solid ${P.faint}`, minHeight: 96 }}>
          <ArchGlyph k={cur.key} color={P.accent} size={46} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ ...MONO, fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.13em", color: P.sub, marginBottom: 3 }}>{cur.family}</div>
            <div style={{ ...DISP, fontWeight: 600, fontSize: "1.12rem", color: P.ink, lineHeight: 1.2 }}>{cur.name}</div>
            <div style={{ ...MONO, fontSize: "0.63rem", color: P.accent, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cur.steps}</div>
          </div>
          {/* which slide of the case we're on */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
            {live.map((a, j) => (
              <span key={a.key} style={{ width: 5, height: 5, borderRadius: "50%", background: j === i ? P.accent : P.line }} />
            ))}
          </div>
        </div>

        <div style={{ padding: "0.85rem 1.2rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ ...MONO, fontSize: "0.62rem", color: P.sub, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className="gate-live" style={{ width: 6, height: 6, borderRadius: "50%", background: P.green }} />
            {live.length} interactive walkthroughs · {planned.length} on the bench
          </span>
          <span className="gate-cta" style={{ ...MONO, fontSize: "0.76rem", color: P.accent, borderBottom: `1.5px solid ${P.accent}`, paddingBottom: 1 }}>
            Enter the Lab <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>

      {/* jump straight to any bench, without waiting for the case to come round */}
      <div style={{ marginTop: "0.9rem" }}>
        <div className="gate-names">
          {live.map((a, j) => (
            <button
              key={a.key}
              className="gate-name"
              onMouseEnter={() => { setHover(true); setI(j); }}
              onMouseLeave={() => setHover(false)}
              onClick={() => { window.location.hash = `#/lab/${a.key}`; }}
              style={{ ...MONO, fontSize: "0.66rem", color: j === i ? P.accent : P.sub, borderColor: j === i ? P.accent : P.line }}
            >
              {a.short}
            </button>
          ))}
        </div>
        <div style={{ ...MONO, fontSize: "0.6rem", color: P.sub, marginTop: 9, lineHeight: 1.7 }}>
          <span style={{ color: P.ink }}>on the bench —</span> {planned.map((a) => a.short).join(" · ")}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   ARCHITECTURES LAB — interactive, hand-drawn walkthroughs (learning in public)
   First panel: the Vision Transformer's patchify → patch-embedding pipeline.
   Toggle the patch size and step through image → patchify → flatten →
   linear projection → +[CLS]/positional, watching the token maths update.
   ════════════════════════════════════════ */
const VIT_STEPS = [
  { key: "image", label: "image" },
  { key: "patchify", label: "patchify" },
  { key: "flatten", label: "flatten" },
  { key: "embed", label: "project" },
  { key: "sequence", label: "+CLS / pos" },
];

export function VitWalkthrough() {
  const [patch, setPatch] = useState(16);
  const [step, setStep] = useState(0);

  const IMG = 224, D = 768;
  const grid = IMG / patch;        // 16 | 14 | 7
  const N = grid * grid;           // patches
  const dim = patch * patch * 3;   // flattened patch length
  const stepKey = VIT_STEPS[step].key;

  // left-hand "image" geometry
  const ox = 36, oy = 60, size = 196;
  const cell = size / grid;
  const hc = Math.floor(0.70 * grid), hr = Math.floor(0.26 * grid); // highlighted patch (over the sun)
  const hill = `M${ox} ${oy + size * 0.66} Q ${ox + size * 0.28} ${oy + size * 0.52}, ${ox + size * 0.5} ${oy + size * 0.62} T ${ox + size} ${oy + size * 0.6} L ${ox + size} ${oy + size} L ${ox} ${oy + size} Z`;

  const copy = {
    image: {
      title: "It starts with an ordinary image",
      body: "A ViT can't read pixels directly — self-attention works over a sequence of tokens. So the first job is to turn one H×W×C image into a list of vectors.",
      math: `input · ${IMG} × ${IMG} × 3`,
    },
    patchify: {
      title: "Patchify — slice it into a grid",
      body: `The image is cut into non-overlapping ${patch}×${patch} squares. A ${IMG}px image gives a ${grid}×${grid} grid — ${N} patches. Halve the patch size and the token count quadruples: more detail, more compute.`,
      math: `(${IMG} / ${patch})² = ${grid}² = ${N} patches`,
    },
    flatten: {
      title: "Flatten each patch into a vector",
      body: `Each patch is a little ${patch}×${patch}×3 tensor. Read its pixels out row by row and it becomes one long vector — like unrolling a tile into a strip.`,
      math: `${patch} × ${patch} × 3 = ${dim} values / patch`,
    },
    embed: {
      title: "Project to the model width",
      body: `A single shared linear layer maps every ${dim}-long patch vector to a fixed width (here D = ${D}). This learned projection is the “patch embedding” — the same matrix W is applied to every patch.`,
      math: `Linear : ℝ^${dim} → ℝ^${D}`,
    },
    sequence: {
      title: "Add a [CLS] token and positions",
      body: `A learnable [CLS] token is prepended — its final state becomes the image's representation — and a positional embedding is added to every token so order survives. The result is exactly what a plain transformer encoder eats.`,
      math: `(${N} + 1) × ${D}  →  Transformer encoder`,
    },
  };
  const sc = copy[stepKey];

  const tog = (on) => ({ ...SK, fontSize: "0.72rem", padding: "2px 10px", cursor: "pointer", border: `1px solid ${on ? P.accent : P.line}`, background: on ? P.accentSoft : P.paper2, color: on ? P.accent : P.sub });
  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };

  const right = (() => {
    switch (stepKey) {
      case "image":
        return (
          <g>
            <line x1={ox + size} y1={oy + size * 0.32} x2={362} y2={oy + size * 0.32} stroke={P.sub} strokeWidth="1" strokeDasharray="3 3" />
            <text x={370} y={oy + size * 0.30} style={SK} fontSize="12" fill={P.ink}>the raw input</text>
            <text x={370} y={oy + size * 0.30 + 20} style={SK} fontSize="11" fill={P.sub}>H × W × C</text>
            <text x={370} y={oy + size * 0.30 + 38} style={SK} fontSize="14" fill={P.accent}>224 × 224 × 3</text>
            <text x={370} y={oy + size * 0.30 + 64} style={SK} fontSize="10" fontStyle="italic" fill={P.sub}>a transformer wants tokens,</text>
            <text x={370} y={oy + size * 0.30 + 78} style={SK} fontSize="10" fontStyle="italic" fill={P.sub}>not a grid of pixels →</text>
          </g>
        );
      case "patchify": {
        const px = ox + (hc + 0.5) * cell, py = oy + (hr + 0.5) * cell;
        return (
          <g>
            <line x1={px} y1={py} x2={372} y2={110} stroke={P.accent} strokeWidth="1" strokeDasharray="3 3" />
            <text x={372} y={86} style={SK} fontSize="12" fill={P.ink}>cut into a grid of</text>
            <text x={372} y={102} style={SK} fontSize="12" fill={P.ink}>non-overlapping patches</text>
            <text x={372} y={146} style={SK} fontSize="30" fill={P.accent}>{N}</text>
            <text x={372} y={166} style={SK} fontSize="12" fill={P.sub}>patches  ({grid} × {grid})</text>
            <text x={372} y={192} style={SK} fontSize="11" fill={P.ink}>each patch · {patch}×{patch}×3</text>
            <text x={372} y={210} style={SK} fontSize="10" fontStyle="italic" fill={P.sub}>smaller patch → more tokens</text>
          </g>
        );
      }
      case "flatten": {
        const ex = 300, ey = 64, es = 72, n = 4, c = es / n;
        const cols = ["#E8C24C", "#9CB8DE", "#3F7A57", "#C9A24B"];
        const pix = [];
        for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) pix.push(<rect key={`p${r}-${k}`} x={ex + k * c} y={ey + r * c} width={c} height={c} fill={cols[(r + k) % cols.length]} fillOpacity="0.55" stroke={P.line} strokeWidth="0.5" />);
        const sx = 300, sy = 178, sw = 17, m = 12;
        const strip = [];
        for (let k = 0; k < m; k++) { const ell = k >= m - 2; strip.push(<rect key={`s${k}`} x={sx + k * sw} y={sy} width={sw - 2} height={22} fill={ell ? "none" : P.accentSoft} stroke={ell ? "none" : P.line} strokeWidth="0.8" />); }
        return (
          <g>
            {pix}
            <rect x={ex} y={ey} width={es} height={es} fill="none" stroke={P.ink} strokeWidth="1.2" />
            <text x={ex + es / 2} y={ey - 8} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>one {patch}×{patch} patch</text>
            <path d={`M${ex + es / 2} ${ey + es + 4} L${ex + es / 2} ${sy - 8}`} stroke={P.accent} strokeWidth="1.2" fill="none" />
            <path d={`M${ex + es / 2 - 4} ${sy - 14} L${ex + es / 2} ${sy - 6} L${ex + es / 2 + 4} ${sy - 14}`} stroke={P.accent} strokeWidth="1.2" fill="none" />
            {strip}
            <text x={sx + (m - 2) * sw + 2} y={sy + 16} style={SK} fontSize="15" fill={P.sub}>…</text>
            <text x={sx} y={sy + 42} style={SK} fontSize="11" fill={P.ink}>flatten row-by-row → ℝ^{dim}</text>
            <text x={sx} y={sy + 58} style={SK} fontSize="10" fontStyle="italic" fill={P.sub}>{patch}×{patch}×3 = {dim} numbers</text>
          </g>
        );
      }
      case "embed": {
        const colX = 312, colY = 60, cw = 22, rowH = 15, cells = 8, colH = cells * rowH, outX = 482;
        const inCells = [], outCells = [];
        for (let k = 0; k < cells; k++) {
          inCells.push(<rect key={`i${k}`} x={colX} y={colY + k * rowH} width={cw} height={rowH - 2} fill={P.accentSoft} stroke={P.line} strokeWidth="0.8" />);
          outCells.push(<rect key={`o${k}`} x={outX} y={colY + k * rowH} width={cw} height={rowH - 2} fill={P.accent} fillOpacity={0.22 + 0.07 * k} stroke={P.ink} strokeWidth="0.8" />);
        }
        const wx = 372, ww = 86;
        return (
          <g>
            {inCells}
            <text x={colX + cw / 2} y={colY - 8} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>ℝ^{dim}</text>
            <text x={colX + cw + 16} y={colY + colH / 2 + 4} textAnchor="middle" style={SK} fontSize="16" fill={P.ink}>×</text>
            <rect x={wx} y={colY} width={ww} height={colH} fill={P.faint} stroke={P.ink} strokeWidth="1.1" />
            <text x={wx + ww / 2} y={colY + colH / 2 - 3} textAnchor="middle" style={SK} fontSize="13" fill={P.ink}>W</text>
            <text x={wx + ww / 2} y={colY + colH / 2 + 13} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>{dim}×{D}</text>
            <text x={wx + ww + 12} y={colY + colH / 2 + 4} textAnchor="middle" style={SK} fontSize="16" fill={P.ink}>=</text>
            {outCells}
            <text x={outX + cw / 2} y={colY - 8} textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>ℝ^{D}</text>
            <text x={300} y={colY + colH + 26} style={SK} fontSize="11" fill={P.ink}>the shared “patch embedding”</text>
            <text x={300} y={colY + colH + 42} style={SK} fontSize="10" fontStyle="italic" fill={P.sub}>same W for every patch</text>
          </g>
        );
      }
      case "sequence": {
        const ty = 108, bw = 30, bh = 30, gap = 8, sx = 292;
        const toks = ["[CLS]", "p₁", "p₂", "p₃", "…", "p_N"];
        return (
          <g>
            <text x={sx} y={ty - 16} style={SK} fontSize="11" fill={P.ink}>prepend [CLS] · add positional embeddings</text>
            {toks.map((t, k) => {
              const x = sx + k * (bw + gap), isCls = k === 0, isEll = t === "…";
              return (
                <g key={k}>
                  {!isEll && <rect x={x} y={ty} width={bw} height={bh} fill={isCls ? P.accent : P.accentSoft} stroke={isCls ? P.accent : P.line} strokeWidth="1" />}
                  <text x={x + bw / 2} y={ty + bh / 2 + 3} textAnchor="middle" style={SK} fontSize={isCls ? 7.5 : 10} fill={isCls ? P.paper2 : P.ink}>{t}</text>
                  {!isEll && <text x={x + bw / 2} y={ty + bh + 14} textAnchor="middle" style={SK} fontSize="11" fill={P.green}>+</text>}
                  {!isEll && <rect x={x + bw / 2 - 7} y={ty + bh + 20} width={14} height={9} fill={P.green} fillOpacity="0.18" stroke={P.green} strokeWidth="0.7" />}
                </g>
              );
            })}
            <text x={sx} y={ty + bh + 52} style={SK} fontSize="9" fill={P.green}>positional · 0 … N</text>
            <text x={sx} y={ty + bh + 76} style={SK} fontSize="12" fill={P.accent}>→ {N + 1} tokens, each ℝ^{D}</text>
            <text x={sx} y={ty + bh + 92} style={SK} fontSize="10" fontStyle="italic" fill={P.sub}>now it's just a transformer over a sequence</text>
          </g>
        );
      }
      default: return null;
    }
  })();

  const showGrid = step >= 1;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>patch size</span>
          <div style={{ display: "flex", gap: 4 }}>
            {[14, 16, 32].map(ps => <button key={ps} onClick={() => setPatch(ps)} aria-pressed={patch === ps} style={tog(patch === ps)}>{ps}</button>)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / 5</span>
          <button onClick={() => setStep((step + 4) % 5)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % 5)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`Vision Transformer patch embedding — step ${step + 1}, ${VIT_STEPS[step].label}`} style={{ display: "block" }}>
              <defs>
                <RoughDefs id="rgh-vit" scale={1.1} seed={21} />
                <clipPath id="vit-clip"><rect x={ox} y={oy} width={size} height={size} /></clipPath>
              </defs>
              <g filter="url(#rgh-vit)">
                <g clipPath="url(#vit-clip)">
                  <rect x={ox} y={oy} width={size} height={size} fill={P.accentSoft} />
                  <path d={hill} fill={P.green} fillOpacity="0.28" stroke="none" />
                  <circle cx={ox + size * 0.70} cy={oy + size * 0.26} r={size * 0.085} fill="#E8C24C" stroke="none" />
                </g>
                <rect x={ox} y={oy} width={size} height={size} fill="none" stroke={P.ink} strokeWidth="1.4" />
                {showGrid && (
                  <g stroke={P.ink} strokeWidth="0.6" strokeOpacity="0.5">
                    {Array.from({ length: grid - 1 }).map((_, i) => <line key={`v${i}`} x1={ox + (i + 1) * cell} y1={oy} x2={ox + (i + 1) * cell} y2={oy + size} />)}
                    {Array.from({ length: grid - 1 }).map((_, i) => <line key={`h${i}`} x1={ox} y1={oy + (i + 1) * cell} x2={ox + size} y2={oy + (i + 1) * cell} />)}
                  </g>
                )}
                {showGrid && <rect x={ox + hc * cell} y={oy + hr * cell} width={cell} height={cell} fill={P.accent} fillOpacity="0.22" stroke={P.accent} strokeWidth="1.8" />}
              </g>
              <text x={ox + size / 2} y={oy - 14} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>input image</text>
              {right}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {VIT_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   CNN WALKTHROUGH — the convolutional workhorse, brushed up in public.
   Steps through the encoder path (convolve → activate → pool → stacked
   receptive field) and then the way back up (transposed convolution),
   where inserting zeros leaves the high-frequency artifact that Durall's
   "Watch Your Up-Convolution" turns into an AI-image detector. Toggle the
   kernel size and watch the feature-map arithmetic update.
   ════════════════════════════════════════ */
const CNN_STEPS = [
  { key: "input", label: "image" },
  { key: "conv", label: "convolve" },
  { key: "relu", label: "activate" },
  { key: "pool", label: "pool" },
  { key: "stack", label: "receptive field" },
  { key: "up", label: "transpose ↑" },
];

export function CnnWalkthrough() {
  const [k, setK] = useState(3);
  const [step, setStep] = useState(0);

  const IN = 32;
  const convOut = IN - k + 1;              // valid conv, stride 1, no pad
  const poolOut = Math.floor(convOut / 2); // 2×2 max pool, stride 2
  const stepKey = CNN_STEPS[step].key;

  // input scene geometry (reused by the "image" step)
  const ox = 44, oy = 68, size = 176;
  const hill = `M${ox} ${oy + size * 0.66} Q ${ox + size * 0.28} ${oy + size * 0.52}, ${ox + size * 0.5} ${oy + size * 0.62} T ${ox + size} ${oy + size * 0.6} L ${ox + size} ${oy + size} L ${ox} ${oy + size} Z`;

  const copy = {
    input: {
      title: "It starts with a grid of pixels",
      body: "A CNN keeps the image as a 2-D grid — it never flattens it the way a transformer does. Spatial neighbours stay neighbours, so the network can learn local patterns: edges, corners, textures.",
      math: `input · ${IN} × ${IN} × 3`,
    },
    conv: {
      title: "Convolution — slide a small kernel",
      body: `A ${k}×${k} kernel slides across the image; at each position it multiplies its weights against the pixels underneath and sums to a single number. The same kernel — shared weights — sweeps the whole image, producing a feature map that lights up wherever its pattern appears.`,
      math: `(${IN} − ${k} + 1)² = ${convOut} × ${convOut} feature map · stride 1, no pad`,
    },
    relu: {
      title: "Activate — keep only what fires",
      body: "A ReLU zeroes every negative response and passes the positives through. Without this nonlinearity a stack of convolutions would collapse into one big linear filter — no depth, no hierarchy of features.",
      math: `ReLU(x) = max(0, x)`,
    },
    pool: {
      title: "Pool — keep what, forget a little where",
      body: `Max-pooling takes the strongest response in each 2×2 block, halving the spatial size to ${poolOut}×${poolOut}. The network keeps what it saw and blurs exactly where — buying a little translation-tolerance and cutting the compute for the next layer.`,
      math: `${convOut}×${convOut} —max 2×2→ ${poolOut}×${poolOut}`,
    },
    stack: {
      title: "Stack the blocks — the receptive field grows",
      body: "Repeat convolve → activate → pool. Each block shrinks the map and grows the channel count, so one deep neuron ends up looking back at a large patch of the original image — its receptive field. Early layers see edges; deep layers see whole objects. Space down, semantics up: that funnel is the encoder.",
      math: `3 → 64 → 128 channels · 32 → 16 → 8 spatial`,
    },
    up: {
      title: "Transposed conv — climbing back up (watch the zeros)",
      body: "Decoders, segmentation heads and GAN generators run it in reverse: a small map back to full resolution. A transposed convolution does this by inserting zeros between samples, then convolving. The learned filter never perfectly smooths those zeros, so a periodic high-frequency copy of the spectrum survives — the exact artifact Durall's “Watch Your Up-Convolution” fingerprints to catch AI images.",
      math: `insert zeros (stride) → conv → upsampled · leaves a high-freq tell`,
    },
  };
  const sc = copy[stepKey];

  const tog = (on) => ({ ...SK, fontSize: "0.72rem", padding: "2px 10px", cursor: "pointer", border: `1px solid ${on ? P.accent : P.line}`, background: on ? P.accentSoft : P.paper2, color: on ? P.accent : P.sub });
  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };

  const gridLines = (x, y, s, n, key) => (
    <g stroke={P.ink} strokeWidth="0.5" strokeOpacity="0.35">
      {Array.from({ length: n - 1 }).map((_, i) => <line key={`${key}v${i}`} x1={x + (i + 1) * s / n} y1={y} x2={x + (i + 1) * s / n} y2={y + s} />)}
      {Array.from({ length: n - 1 }).map((_, i) => <line key={`${key}h${i}`} x1={x} y1={y + (i + 1) * s / n} x2={x + s} y2={y + (i + 1) * s / n} />)}
    </g>
  );

  const right = (() => {
    switch (stepKey) {
      case "input":
        return (
          <g>
            <g filter="url(#rgh-cnn)">
              <g clipPath="url(#cnn-clip)">
                <rect x={ox} y={oy} width={size} height={size} fill={P.accentSoft} />
                <path d={hill} fill={P.green} fillOpacity="0.28" stroke="none" />
                <circle cx={ox + size * 0.70} cy={oy + size * 0.26} r={size * 0.09} fill="#E8C24C" stroke="none" />
              </g>
              <rect x={ox} y={oy} width={size} height={size} fill="none" stroke={P.ink} strokeWidth="1.4" />
              {gridLines(ox, oy, size, 8, "in")}
            </g>
            <text x={ox + size / 2} y={oy - 14} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>input image</text>
            <line x1={ox + size} y1={oy + size * 0.3} x2={360} y2={oy + size * 0.3} stroke={P.sub} strokeWidth="1" strokeDasharray="3 3" />
            <text x={370} y={oy + size * 0.3 - 4} style={SK} fontSize="12" fill={P.ink}>a grid of pixels —</text>
            <text x={370} y={oy + size * 0.3 + 12} style={SK} fontSize="12" fill={P.ink}>kept 2-D, never flattened</text>
            <text x={370} y={oy + size * 0.3 + 36} style={SK} fontSize="11" fill={P.sub}>H × W × C</text>
            <text x={370} y={oy + size * 0.3 + 54} style={SK} fontSize="14" fill={P.accent}>{IN} × {IN} × 3</text>
            <text x={370} y={oy + size * 0.3 + 78} style={SK} fontSize="10" fontStyle="italic" fill={P.sub}>neighbours stay neighbours →</text>
          </g>
        );
      case "conv": {
        const gx = 40, gy = 74, gs = 150, gn = 8, gc = gs / gn, hx = 4, hy = 2;
        const fx = 396, fy = 86, fs = 132, fn = 6, fc = fs / fn;
        return (
          <g>
            <g filter="url(#rgh-cnn)">
              <rect x={gx} y={gy} width={gs} height={gs} fill={P.accentSoft} stroke={P.ink} strokeWidth="1.3" />
              {gridLines(gx, gy, gs, gn, "cv")}
              <rect x={gx + hx * gc} y={gy + hy * gc} width={k * gc} height={k * gc} fill={P.accent} fillOpacity="0.22" stroke={P.accent} strokeWidth="1.8" />
            </g>
            <text x={gx + gs / 2} y={gy - 10} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>input · {IN}×{IN}</text>
            <text x={gx + (hx + k / 2) * gc} y={gy + hy * gc - 5} textAnchor="middle" style={SK} fontSize="9" fill={P.accent}>{k}×{k} kernel</text>
            <path d={`M${gx + gs + 8} ${gy + gs / 2} L${fx - 12} ${fy + fc * 1.5}`} stroke={P.accent} strokeWidth="1.3" fill="none" strokeDasharray="4 3" />
            <path d={`M${fx - 20} ${fy + fc * 1.5 - 5} L${fx - 10} ${fy + fc * 1.5} L${fx - 20} ${fy + fc * 1.5 + 5}`} stroke={P.accent} strokeWidth="1.3" fill="none" />
            <text x={(gx + gs + fx) / 2 + 4} y={gy + gs / 2 - 10} textAnchor="middle" style={{ fontFamily: "'IBM Plex Mono',monospace" }} fontSize="10" fill={P.sub}>Σ w·x</text>
            <g filter="url(#rgh-cnn)">
              <rect x={fx} y={fy} width={fs} height={fs} fill={P.paper2} stroke={P.ink} strokeWidth="1.3" />
              {gridLines(fx, fy, fs, fn, "fm")}
              <rect x={fx + fc} y={fy + fc} width={fc} height={fc} fill={P.accent} fillOpacity="0.85" stroke={P.ink} strokeWidth="0.8" />
            </g>
            <text x={fx + fs / 2} y={fy - 10} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>feature map · {convOut}×{convOut}</text>
            <text x={fx + fs / 2} y={fy + fs + 16} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.sub}>one window → one number</text>
          </g>
        );
      }
      case "relu": {
        const pre = [-3, 2, -1, 5, 0, 4, -6, 1, 3];
        const bs = 34, gap = 5, cols = 3, ay = 92, ax = 56, cx = 236;
        const block = (x0, post) => pre.map((v, i) => {
          const r = Math.floor(i / cols), c = i % cols;
          const x = x0 + c * (bs + gap), y = ay + r * (bs + gap);
          const neg = v < 0;
          const fill = post ? (v <= 0 ? P.faint : P.accentSoft) : (neg ? "rgba(155,59,59,0.14)" : P.accentSoft);
          const col = !post && neg ? P.red : (post && v <= 0 ? P.sub : P.ink);
          return (
            <g key={`${post ? "p" : "q"}${i}`}>
              <rect x={x} y={y} width={bs} height={bs} fill={fill} stroke={P.line} strokeWidth="0.8" />
              <text x={x + bs / 2} y={y + bs / 2 + 4} textAnchor="middle" style={SK} fontSize="11" fill={col}>{post ? Math.max(0, v) : v}</text>
            </g>
          );
        });
        const w = cols * (bs + gap) - gap, midY = ay + (3 * (bs + gap) - gap) / 2;
        return (
          <g>
            <text x={ax + w / 2} y={ay - 10} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>pre-activation</text>
            {block(ax, false)}
            <path d={`M${ax + w + 6} ${midY} L${cx - 8} ${midY}`} stroke={P.accent} strokeWidth="1.3" fill="none" />
            <path d={`M${cx - 16} ${midY - 5} L${cx - 6} ${midY} L${cx - 16} ${midY + 5}`} stroke={P.accent} strokeWidth="1.3" fill="none" />
            <text x={(ax + w + cx) / 2} y={midY - 8} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>ReLU</text>
            <text x={cx + w / 2} y={ay - 10} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>after ReLU</text>
            {block(cx, true)}
            <g filter="url(#rgh-cnn)" fill="none" strokeLinecap="round">
              <path d={`M420 76 L420 176 L556 176`} stroke={P.sub} strokeWidth="1.2" />
              <path d={`M420 176 L488 176 L544 96`} stroke={P.accent} strokeWidth="2.2" />
            </g>
            <text x={432} y={92} style={SK} fontSize="9" fill={P.sub}>max(0, x)</text>
            <text x={470} y={192} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>negatives → 0</text>
          </g>
        );
      }
      case "pool": {
        const m4 = [[1, 3, 2, 4], [0, 5, 1, 2], [6, 2, 3, 1], [0, 1, 4, 2]];
        const gx = 56, gy = 78, gs = 148, gc = gs / 4;
        const quadCol = [P.accent, P.green, P.red, P.yellow];
        const cells = [];
        m4.forEach((row, r) => row.forEach((v, c) => {
          cells.push(
            <g key={`m${r}-${c}`}>
              <rect x={gx + c * gc} y={gy + r * gc} width={gc} height={gc} fill={P.accentSoft} stroke={P.line} strokeWidth="0.7" />
              <text x={gx + (c + 0.5) * gc} y={gy + (r + 0.5) * gc + 4} textAnchor="middle" style={SK} fontSize="12" fill={P.ink}>{v}</text>
            </g>
          );
        }));
        const quads = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([qr, qc], i) => (
          <rect key={`q${i}`} x={gx + qc * 2 * gc} y={gy + qr * 2 * gc} width={2 * gc} height={2 * gc} fill="none" stroke={quadCol[i]} strokeWidth="1.8" />
        ));
        const maxes = [[5, 4], [6, 4]];
        const ox2 = 392, oy2 = 100, oc = 46;
        const outCells = [];
        maxes.forEach((row, r) => row.forEach((v, c) => {
          const idx = r * 2 + c;
          outCells.push(
            <g key={`o${r}-${c}`}>
              <rect x={ox2 + c * oc} y={oy2 + r * oc} width={oc} height={oc} fill={P.accentSoft} stroke={quadCol[idx]} strokeWidth="1.8" />
              <text x={ox2 + (c + 0.5) * oc} y={oy2 + (r + 0.5) * oc + 5} textAnchor="middle" style={SK} fontSize="15" fill={P.ink}>{v}</text>
            </g>
          );
        }));
        return (
          <g>
            <text x={gx + gs / 2} y={gy - 10} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>{convOut}×{convOut} · take the max of each 2×2</text>
            {cells}{quads}
            <path d={`M${gx + gs + 8} ${gy + gs / 2} L${ox2 - 10} ${oy2 + oc}`} stroke={P.accent} strokeWidth="1.3" fill="none" strokeDasharray="4 3" />
            <path d={`M${ox2 - 18} ${oy2 + oc - 5} L${ox2 - 8} ${oy2 + oc} L${ox2 - 18} ${oy2 + oc + 5}`} stroke={P.accent} strokeWidth="1.3" fill="none" />
            {outCells}
            <text x={ox2 + oc} y={oy2 - 10} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>pooled · {poolOut}×{poolOut}</text>
            <text x={ox2 + oc} y={oy2 + 2 * oc + 18} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.sub}>half the size, the peaks kept</text>
          </g>
        );
      }
      case "stack": {
        const blocks = [
          { x: 70, s: 116, ch: "3", lbl: "32×32" },
          { x: 250, s: 78, ch: "64", lbl: "16×16" },
          { x: 400, s: 50, ch: "128", lbl: "8×8" },
        ];
        const baseY = 210;
        const faces = blocks.map((b, i) => {
          const y = baseY - b.s, depth = Math.min(5, 1 + i * 2), off = 5;
          const shadow = [];
          for (let d = depth; d >= 1; d--) shadow.push(<rect key={`s${i}-${d}`} x={b.x + d * off} y={y - d * off} width={b.s} height={b.s} fill={P.paper2} stroke={P.line} strokeWidth="0.8" />);
          return (
            <g key={`b${i}`} filter="url(#rgh-cnn)">
              {shadow}
              <rect x={b.x} y={y} width={b.s} height={b.s} fill={P.accentSoft} stroke={P.ink} strokeWidth="1.3" />
              <text x={b.x + b.s / 2} y={baseY + 16} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>{b.lbl}</text>
              <text x={b.x + b.s / 2} y={baseY + 30} textAnchor="middle" style={SK} fontSize="9" fill={P.accent}>{b.ch} ch</text>
            </g>
          );
        });
        // receptive-field cone: a cell in the deepest block back to a patch on the first
        const dcx = 400 + 25, dcy = baseY - 25;
        return (
          <g>
            {faces}
            <path d={`M${70} ${baseY - 116} h116`} stroke="none" />
            {blocks.slice(0, 2).map((b, i) => (
              <g key={`ar${i}`}>
                <path d={`M${b.x + b.s + 6} ${baseY - b.s / 2} L${blocks[i + 1].x - 8} ${baseY - blocks[i + 1].s / 2}`} stroke={P.sub} strokeWidth="1.2" fill="none" strokeDasharray="4 3" />
                <text x={(b.x + b.s + blocks[i + 1].x) / 2} y={baseY - Math.max(b.s, blocks[i + 1].s) / 2 - 6} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>conv+pool</text>
              </g>
            ))}
            <g stroke={P.accent} strokeWidth="1" fill="none" strokeDasharray="3 3">
              <path d={`M${dcx} ${dcy} L96 74`} />
              <path d={`M${dcx} ${dcy} L152 130`} />
            </g>
            <rect x={90} y={70} width={54} height={54} fill={P.accent} fillOpacity="0.12" stroke={P.accent} strokeWidth="1.4" />
            <circle cx={dcx} cy={dcy} r="3.5" fill={P.accent} />
            <text x={118} y={64} textAnchor="middle" style={SK} fontSize="9" fill={P.accent}>receptive field</text>
            <text x={300} y={54} textAnchor="middle" style={SK} fontSize="10.5" fill={P.ink}>space ↓ · channels ↑ — the encoder funnel</text>
          </g>
        );
      }
      case "up": {
        const yIn = 78, yUp = 150, x0 = 52, dx = 26;
        const heights = [30, 46, 24, 40];
        const inStems = heights.map((h, i) => {
          const x = x0 + i * 2 * dx;
          return <g key={`in${i}`}><line x1={x} y1={yIn} x2={x} y2={yIn - h} stroke={P.accent} strokeWidth="2" /><circle cx={x} cy={yIn - h} r="3.4" fill={P.accent} /></g>;
        });
        const upStems = [];
        for (let i = 0; i < 8; i++) {
          const x = x0 + i * dx;
          if (i % 2 === 0) { const h = heights[i / 2]; upStems.push(<g key={`u${i}`}><line x1={x} y1={yUp} x2={x} y2={yUp - h} stroke={P.accent} strokeWidth="2" /><circle cx={x} cy={yUp - h} r="3.2" fill={P.accent} /></g>); }
          else { upStems.push(<circle key={`u${i}`} cx={x} cy={yUp} r="3" fill="none" stroke={P.red} strokeWidth="1.3" />); }
        }
        const fx = 372, fy = 74, fs = 118, fn = 8, fc = fs / fn;
        const checker = [];
        for (let r = 0; r < fn; r++) for (let c = 0; c < fn; c++) if ((r + c) % 2 === 0) checker.push(<rect key={`ck${r}-${c}`} x={fx + c * fc} y={fy + r * fc} width={fc} height={fc} fill={P.red} fillOpacity="0.16" />);
        return (
          <g>
            <line x1={x0 - 12} y1={yIn} x2={x0 + 6 * dx + 8} y2={yIn} stroke={P.line} strokeWidth="1" />
            {inStems}
            <text x={x0 + 3 * dx} y={yIn - 58} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>low-res feature map</text>
            <text x={x0 + 6 * dx + 14} y={yIn + 4} style={SK} fontSize="9" fill={P.sub}>input</text>
            <line x1={x0 - 12} y1={yUp} x2={x0 + 7 * dx + 8} y2={yUp} stroke={P.line} strokeWidth="1" />
            {upStems}
            <text x={x0 + 3.5 * dx} y={yUp + 22} textAnchor="middle" style={SK} fontSize="9" fill={P.red}>0 = inserted zeros</text>
            <text x={x0 + 3.5 * dx} y={yUp + 36} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.sub}>stuff zeros between samples, then convolve</text>
            <path d={`M${x0 + 3 * dx} ${yIn + 6} L${x0 + 3.5 * dx} ${yUp - 52}`} stroke={P.accent} strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
            <g filter="url(#rgh-cnn)">
              <rect x={fx} y={fy} width={fs} height={fs} fill={P.paper2} stroke={P.ink} strokeWidth="1.3" />
              {checker}
              {gridLines(fx, fy, fs, fn, "up")}
            </g>
            <text x={fx + fs / 2} y={fy - 10} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>upsampled output</text>
            <text x={fx + fs / 2} y={fy + fs + 16} textAnchor="middle" style={SK} fontSize="9" fill={P.red}>periodic high-freq copy — the tell</text>
            <text x={fx + fs / 2} y={fy + fs + 30} textAnchor="middle" style={SK} fontSize="8.5" fontStyle="italic" fill={P.sub}>Durall · Watch Your Up-Convolution</text>
          </g>
        );
      }
      default: return null;
    }
  })();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>kernel</span>
          <div style={{ display: "flex", gap: 4 }}>
            {[3, 5].map(ks => <button key={ks} onClick={() => setK(ks)} aria-pressed={k === ks} style={tog(k === ks)}>{ks}×{ks}</button>)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {CNN_STEPS.length}</span>
          <button onClick={() => setStep((step + CNN_STEPS.length - 1) % CNN_STEPS.length)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % CNN_STEPS.length)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`Convolutional neural network — step ${step + 1}, ${CNN_STEPS[step].label}`} style={{ display: "block" }}>
              <defs>
                <RoughDefs id="rgh-cnn" scale={1.1} seed={31} />
                <clipPath id="cnn-clip"><rect x={ox} y={oy} width={size} height={size} /></clipPath>
              </defs>
              {right}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {CNN_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   DETECTION PARADIGMS — six lenses on a fake (learning in public)
   Companion to detection_paradigms.ipynb: the same hidden statistical
   difference between a real photo and an AI image, made visible six ways.
   Step through spatial → frequency → fingerprint → patch → training-free → VLM.
   ════════════════════════════════════════ */
const PARADIGMS = [
  {
    key: "spatial", label: "spatial",
    title: "Spatial — the pixels are already enough",
    body: "Hand a classifier the raw pixels. Generated images come out subtly smoother, so simple per-patch statistics — brightness, local contrast, and above all the gradient (edge sharpness) — already separate the classes. A RandomForest on twelve such features lands ≈ 0.91, and the sharpness features carry the most weight.",
    math: "feats = {mean, std, ∇x, ∇y} × RGB  →  RandomForest ≈ 0.91",
  },
  {
    key: "frequency", label: "frequency",
    title: "Frequency — a tell-tale grid in the Fourier picture",
    body: "Rewrite the image as a sum of waves with an FFT. A generator's up-sampling step stamps a regular, periodic pattern into that frequency view — a bright grid of dots a real photo never shows. Collapse the 2-D spectrum into a radial curve and the fake sits higher at high frequencies.",
    math: "F = |FFT(gray)|²  →  radial power spectrum",
  },
  {
    key: "fingerprint", label: "fingerprint",
    title: "Fingerprint — average the leftover noise",
    body: "Like a camera sensor, each generator leaves a faint, consistent noise signature. Take the noise residual (image minus its blur) of many images and average them: real scene content cancels to grey, while the generator's repeated pattern survives — and lights up as structure in its FFT.",
    math: "fp = mean_i ( xᵢ − blur(xᵢ) )",
  },
  {
    key: "patch", label: "patch",
    title: "Patch — find where the fake-ness is",
    body: "One score per image hides partial edits. Slide a window across the image and score every tile by its high-frequency energy instead. On a stitched image — real left, fake right — the heatmap lights up the manipulated half, localising the edit rather than just flagging it.",
    math: "score(tile) = high-freq energy  →  heatmap",
  },
  {
    key: "trainfree", label: "training-free",
    title: "Training-free — measure how well it rebuilds",
    body: "No labels, no detector to train. Push the image through a model that tries to reconstruct it; real and generated images rebuild with different error. A toy PCA autoencoder fit on real texture already splits the two error distributions apart — the mechanism behind DIRE and AEROBLADE.",
    math: "err = ‖ x − decode(encode(x)) ‖²",
  },
  {
    key: "vlm", label: "VLM",
    title: "Multimodal — ask a model why it's fake",
    body: "Every method above returns a number. A vision-language model returns a verdict plus its reasons — “the hand has six fingers,” “the background text is garbled” — catching semantic mistakes that frequency math misses. Forced into a JSON schema, that verdict drops straight into the ensemble.",
    math: "{ verdict, confidence, evidence[], reasoning }",
  },
];

export function DetectionParadigms() {
  const [step, setStep] = useState(0);
  const pk = PARADIGMS[step].key;
  const sc = PARADIGMS[step];

  // shared little "photograph" motif (hill + sun), real or smoothed-fake
  const Photo = ({ x, y, s, fake, id }) => (
    <g>
      <clipPath id={`dp-${id}`}><rect x={x} y={y} width={s} height={s} /></clipPath>
      <g clipPath={`url(#dp-${id})`}>
        <rect x={x} y={y} width={s} height={s} fill={P.accentSoft} />
        <path d={`M${x} ${y + s * 0.66} Q ${x + s * 0.28} ${y + s * 0.52}, ${x + s * 0.5} ${y + s * 0.62} T ${x + s} ${y + s * 0.6} L ${x + s} ${y + s} L ${x} ${y + s} Z`} fill={P.green} fillOpacity={fake ? 0.18 : 0.3} />
        <circle cx={x + s * 0.7} cy={y + s * 0.28} r={s * 0.1} fill="#E8C24C" />
        {fake && <rect x={x} y={y} width={s} height={s} fill={P.paper2} fillOpacity="0.3" />}
      </g>
      <rect x={x} y={y} width={s} height={s} fill="none" stroke={P.ink} strokeWidth="1.4" />
    </g>
  );

  const rings = (cx, cy) => [52, 40, 28, 16].map((r, i) => (
    <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={P.sub} strokeOpacity={0.12 + i * 0.13} strokeWidth="1" />
  ));

  const body = (() => {
    switch (pk) {
      case "spatial":
        return (
          <g>
            <Photo x={66} y={78} s={104} id="sp-r" />
            <Photo x={196} y={78} s={104} fake id="sp-f" />
            <text x={118} y={70} textAnchor="middle" style={SK} fontSize="11" fill={P.ink}>real</text>
            <text x={248} y={70} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>fake · smoother</text>
            {/* gradient comparison bars */}
            <line x1={372} y1={222} x2={566} y2={222} stroke={P.sub} strokeWidth="1.2" />
            <rect x={404} y={104} width={36} height={118} fill={P.accent} fillOpacity="0.7" stroke={P.ink} strokeWidth="0.8" />
            <rect x={494} y={168} width={36} height={54} fill={P.red} fillOpacity="0.5" stroke={P.ink} strokeWidth="0.8" />
            <text x={422} y={236} textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>∇ real</text>
            <text x={512} y={236} textAnchor="middle" style={SK} fontSize="10" fill={P.red}>∇ fake</text>
            <text x={470} y={92} textAnchor="middle" style={SK} fontSize="11" fill={P.ink}>edge sharpness</text>
            <text x={470} y={258} textAnchor="middle" style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>the feature that matters most</text>
          </g>
        );
      case "frequency":
        return (
          <g>
            <rect x={64} y={70} width={150} height={150} fill="#fff" stroke={P.ink} strokeWidth="1.3" />
            {rings(139, 145)}
            <circle cx={139} cy={145} r="4" fill={P.accent} />
            <text x={139} y={238} textAnchor="middle" style={SK} fontSize="11" fill={P.ink}>real · smooth</text>
            <rect x={250} y={70} width={150} height={150} fill="#fff" stroke={P.ink} strokeWidth="1.3" />
            {rings(325, 145)}
            {[-2, -1, 0, 1, 2].map(gx => [-2, -1, 0, 1, 2].map(gy => (
              (gx === 0 && gy === 0) ? null :
                <circle key={`${gx}${gy}`} cx={325 + gx * 26} cy={145 + gy * 26} r="3" fill={P.accent} fillOpacity="0.85" />
            )))}
            <circle cx={325} cy={145} r="4" fill={P.accent} />
            <text x={325} y={238} textAnchor="middle" style={SK} fontSize="11" fill={P.accent}>fake · periodic grid</text>
            <text x={482} y={120} style={SK} fontSize="11" fill={P.ink}>up-sampling</text>
            <text x={482} y={138} style={SK} fontSize="11" fill={P.ink}>stamps a grid</text>
            <text x={482} y={170} style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>real photos</text>
            <text x={482} y={184} style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>never show it</text>
          </g>
        );
      case "fingerprint": {
        // a small deterministic speckle field
        const spk = (ox, oy, n, seed) => {
          const out = [];
          let v = seed;
          for (let i = 0; i < n; i++) {
            v = (v * 9301 + 49297) % 233280;
            const rx = ox + (v / 233280) * 80;
            v = (v * 9301 + 49297) % 233280;
            const ry = oy + (v / 233280) * 80;
            out.push(<circle key={i} cx={rx} cy={ry} r="1.2" fill={P.sub} fillOpacity="0.6" />);
          }
          return out;
        };
        return (
          <g>
            {/* fanned residual tiles */}
            {[0, 1, 2].map(k => (
              <g key={k} transform={`translate(${58 + k * 14} ${96 - k * 10})`}>
                <rect x={0} y={0} width={88} height={88} fill="#fff" stroke={P.line} strokeWidth="1" />
                {k === 2 && spk(4, 4, 36, 7)}
              </g>
            ))}
            <text x={120} y={224} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>noise residuals · many</text>
            {/* arrow */}
            <path d="M196 118 L246 118" stroke={P.accent} strokeWidth="1.4" fill="none" />
            <path d="M238 112 L248 118 L238 124" stroke={P.accent} strokeWidth="1.4" fill="none" />
            <text x={221} y="108" textAnchor="middle" style={SK} fontSize="9" fill={P.accent}>avg</text>
            {/* averaged fingerprint with surviving structure */}
            <rect x={262} y={74} width={120} height={120} fill="#f3f1ea" stroke={P.ink} strokeWidth="1.3" />
            {[0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => (
              <circle key={`${r}${c}`} cx={282 + c * 27} cy={94 + r * 27} r="3.2" fill={P.accent} fillOpacity="0.7" />
            )))}
            <text x={322} y={210} textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>fingerprint survives</text>
            <text x={470} y={120} style={SK} fontSize="11" fill={P.ink}>scene cancels,</text>
            <text x={470} y={138} style={SK} fontSize="11" fill={P.ink}>pattern remains</text>
            <text x={470} y={168} style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>the generator's</text>
            <text x={470} y={182} style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>signature</text>
          </g>
        );
      }
      case "patch": {
        const tx = 96, ty = 60, s = 150, cell = s / 5;
        const cells = [];
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
          const hot = c >= 3, mid = c === 2;
          const fill = hot ? P.red : P.accent;
          const op = hot ? 0.16 + (c - 3) * 0.16 : mid ? 0.06 : 0.04;
          cells.push(<rect key={`${r}${c}`} x={tx + c * cell} y={ty + r * cell} width={cell} height={cell} fill={fill} fillOpacity={op} stroke={P.line} strokeWidth="0.4" />);
        }
        return (
          <g>
            <Photo x={tx} y={ty} s={s} id="pa-r" />
            {/* right half: smoothed/blocky fake overlay */}
            <rect x={tx + s / 2} y={ty} width={s / 2} height={s} fill={P.paper2} fillOpacity="0.32" />
            {cells}
            <line x1={tx + s / 2} y1={ty} x2={tx + s / 2} y2={ty + s} stroke={P.ink} strokeWidth="1.2" strokeDasharray="4 3" />
            <rect x={tx} y={ty} width={s} height={s} fill="none" stroke={P.ink} strokeWidth="1.4" />
            <text x={tx + s * 0.25} y={ty - 10} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>real</text>
            <text x={tx + s * 0.75} y={ty - 10} textAnchor="middle" style={SK} fontSize="10.5" fill={P.red}>fake</text>
            {/* colour key */}
            <text x={300} y={96} style={SK} fontSize="11" fill={P.ink}>score every tile,</text>
            <text x={300} y={114} style={SK} fontSize="11" fill={P.ink}>not the whole image</text>
            <rect x={300} y={140} width={120} height={12} fill="url(#dp-heat)" stroke={P.line} strokeWidth="0.6" />
            <defs>
              <linearGradient id="dp-heat" x1="0" x2="1">
                <stop offset="0" stopColor={P.accent} stopOpacity="0.15" />
                <stop offset="1" stopColor={P.red} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <text x={300} y={168} style={SK} fontSize="9.5" fill={P.sub}>cool</text>
            <text x={420} y={168} textAnchor="end" style={SK} fontSize="9.5" fill={P.red}>hot</text>
            <text x={300} y={196} style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>localises the edit</text>
          </g>
        );
      }
      case "trainfree": {
        const base = 214, x0 = 96, bw = 20;
        const realH = [8, 22, 46, 64, 46, 22, 8];
        const fakeH = [8, 20, 42, 58, 42, 20, 8];
        return (
          <g>
            <line x1={70} y1={base} x2={556} y2={base} stroke={P.sub} strokeWidth="1.2" />
            <line x1={70} y1={70} x2={70} y2={base} stroke={P.sub} strokeWidth="1.2" />
            {realH.map((h, i) => <rect key={`r${i}`} x={x0 + i * bw} y={base - h} width={bw - 2} height={h} fill={P.accent} fillOpacity="0.45" stroke={P.accent} strokeWidth="0.6" />)}
            {fakeH.map((h, i) => <rect key={`f${i}`} x={x0 + 232 + i * bw} y={base - h} width={bw - 2} height={h} fill={P.red} fillOpacity="0.4" stroke={P.red} strokeWidth="0.6" />)}
            <line x1={332} y1={70} x2={332} y2={base} stroke={P.ink} strokeWidth="1" strokeDasharray="5 4" />
            <text x={x0 + 60} y={96} textAnchor="middle" style={SK} fontSize="11" fill={P.accent}>real · low error</text>
            <text x={x0 + 292} y={96} textAnchor="middle" style={SK} fontSize="11" fill={P.red}>fake · high error</text>
            <text x={332} y={64} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.ink}>split</text>
            <text x={310} y={236} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>reconstruction error  →</text>
            <text x={48} y={140} style={SK} fontSize="10" fill={P.sub} transform="rotate(-90 48 140)" textAnchor="middle">count</text>
          </g>
        );
      }
      case "vlm":
        return (
          <g>
            <Photo x={70} y={84} s={120} id="vl-r" />
            <text x={130} y={76} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>the image</text>
            {/* magnifier hint */}
            <circle cx={150} cy={138} r="20" fill="none" stroke={P.ink} strokeWidth="1.6" strokeOpacity="0.5" />
            <line x1={164} y1={152} x2={178} y2={166} stroke={P.ink} strokeWidth="1.8" strokeOpacity="0.5" />
            <path d="M198 144 L236 144" stroke={P.accent} strokeWidth="1.4" fill="none" />
            <path d="M228 138 L238 144 L228 150" stroke={P.accent} strokeWidth="1.4" fill="none" />
            {/* JSON verdict card */}
            <rect x={250} y={70} width={296} height={150} rx="3" fill="#fff" stroke={P.ink} strokeWidth="1.3" />
            <text x={266} y={94} style={SK} fontSize="11" fill={P.sub}>{"{"}</text>
            <text x={278} y={114} style={SK} fontSize="11" fill={P.ink}>verdict: <tspan fill={P.red}>"ai_generated"</tspan>,</text>
            <text x={278} y={134} style={SK} fontSize="11" fill={P.ink}>confidence: <tspan fill={P.accent}>0.88</tspan>,</text>
            <text x={278} y={154} style={SK} fontSize="11" fill={P.ink}>evidence: [</text>
            <text x={292} y={172} style={SK} fontSize="10" fill={P.sub}>"six fingers",</text>
            <text x={292} y={188} style={SK} fontSize="10" fill={P.sub}>"garbled text" ]</text>
            <text x={266} y={208} style={SK} fontSize="11" fill={P.sub}>{"}"}</text>
            <text x={398} y={236} textAnchor="middle" style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>a verdict — plus its reasons</text>
          </g>
        );
      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>one hidden difference · six lenses</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>lens {step + 1} / 6</span>
          <button onClick={() => setStep((step + 5) % 6)} aria-label="Previous paradigm" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % 6)} aria-label="Next paradigm" style={navBtn}>→</button>
        </div>
      </div>

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`AI-image detection paradigm ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>lens {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {PARADIGMS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   DINOv2 + ML HEAD — self-supervised representation learning, then a
   lightweight classifier on the frozen embedding. The route the
   generative-image-forensics work actually leaned on (report §4.7).
   ════════════════════════════════════════ */
const DINOV2_STEPS = [
  {
    key: "views", label: "two views",
    title: "One image, two eyes — and no labels",
    body: "Self-supervised means no labels and no captions. Take a single image and make two random augmentations: one large global crop and one small local crop, each colour-jittered. The entire training signal is just “these two are the same scene.” Millions of images, zero annotation.",
    math: "x → { global crop, local crop }  ·  no labels, no text",
  },
  {
    key: "student", label: "student ↔ teacher",
    title: "A student copying a slow teacher",
    body: "Two networks share the same ViT architecture. The student sees the local crop; the teacher sees the global one. The teacher is never trained by gradients — its weights are an exponential moving average of the student's, so it drifts slowly and stays a step ahead, giving the student a stable target to chase.",
    math: "θ_teacher ← m·θ_teacher + (1−m)·θ_student",
  },
  {
    key: "distill", label: "self-distill",
    title: "Match my output to yours — don't collapse",
    body: "Self-distillation: soften both outputs with softmax and push the student's distribution onto the teacher's. Left alone, the network could cheat by mapping everything to one vector — so the teacher's output is centered then sharpened, which forbids that collapse. To satisfy the target across every crop, the network is forced to encode real structure.",
    math: "min  H( sharpen·center(teacher) ,  student )",
  },
  {
    key: "embed", label: "frozen embedding",
    title: "Freeze it — now it's a feature extractor",
    body: "After pre-training the backbone is frozen. One forward pass turns any image into a fixed 1,024-dim embedding (dinov2_vitl14), L2-normalised. Because it never saw a word of text, its features are structural rather than language-aligned — a genuinely complementary view to a CLIP embedding.",
    math: "x → frozen DINOv2 → z ∈ ℝ¹⁰²⁴  (L2-norm)",
  },
  {
    key: "head", label: "ML head",
    title: "A small ML head does the deciding",
    body: "The heavy network stays frozen; a lightweight learner classifies the embedding. Two heads on the same features: XGBoost (gradient-boosted trees) reached F1 0.786, but a small MLP reached 0.835. The MLP winning is the tell — DINOv2's forensic signal is non-linear, so trees split it less cleanly than a learned non-linear transform does.",
    math: "z → { XGBoost 0.786 | MLP 0.835 } → P(AI)  ·  signal is non-linear",
  },
];

export function Dinov2Walkthrough() {
  const [step, setStep] = useState(0);
  const dk = DINOV2_STEPS[step].key;
  const sc = DINOV2_STEPS[step];

  const Photo = ({ x, y, s, jitter }) => (
    <g>
      <clipPath id={`dv-${x}-${y}`}><rect x={x} y={y} width={s} height={s} /></clipPath>
      <g clipPath={`url(#dv-${x}-${y})`}>
        <rect x={x} y={y} width={s} height={s} fill={P.accentSoft} />
        <path d={`M${x} ${y + s * 0.66} Q ${x + s * 0.28} ${y + s * 0.52}, ${x + s * 0.5} ${y + s * 0.62} T ${x + s} ${y + s * 0.6} L ${x + s} ${y + s} L ${x} ${y + s} Z`} fill={P.green} fillOpacity="0.3" />
        <circle cx={x + s * 0.7} cy={y + s * 0.28} r={s * 0.1} fill="#E8C24C" />
        {jitter && <rect x={x} y={y} width={s} height={s} fill={P.accent} fillOpacity="0.1" />}
      </g>
      <rect x={x} y={y} width={s} height={s} fill="none" stroke={P.ink} strokeWidth="1.4" />
    </g>
  );

  // a little stacked-layer "network" glyph
  const net = (x, y, w, h, label, frozen) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={frozen ? "rgba(43,76,140,0.06)" : P.paper2} stroke={P.ink} strokeWidth="1.3" />
      {[0.28, 0.5, 0.72].map((f, i) => <line key={i} x1={x + 6} y1={y + h * f} x2={x + w - 6} y2={y + h * f} stroke={P.sub} strokeWidth="0.8" strokeOpacity="0.5" />)}
      <text x={x + w / 2} y={y + h + 13} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>{label}</text>
      {frozen && <text x={x + w - 9} y={y + 13} textAnchor="middle" fontSize="11" fill={P.accent}>❄</text>}
    </g>
  );

  // a 1024-dim embedding strip
  const vec = (x, y, n, cw, h, active) => (
    <g>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={x + i * cw} y={y} width={cw - 1.5} height={h}
          fill={active ? (i % 3 === 0 ? P.accent : i % 3 === 1 ? P.accentSoft : P.faint) : P.faint}
          stroke={P.line} strokeWidth="0.5" />
      ))}
      <rect x={x} y={y} width={n * cw - 1.5} height={h} fill="none" stroke={P.ink} strokeWidth="1.2" />
    </g>
  );

  const arrow = (x1, y1, x2, y2, dash) => (
    <g stroke={P.accent} strokeWidth="1.3" fill="none">
      <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
      <path d={`M${x2 - 8} ${y2 - 4} L${x2} ${y2} L${x2 - 8} ${y2 + 4}`} />
    </g>
  );

  const body = (() => {
    switch (dk) {
      case "views":
        return (
          <g>
            <Photo x={54} y={104} s={104} />
            <text x={106} y={96} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>one image · no label</text>
            {arrow(166, 130, 322, 100)}
            {arrow(166, 156, 356, 232)}
            <Photo x={330} y={54} s={116} jitter />
            <text x={388} y={44} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>global crop</text>
            <Photo x={364} y={214} s={66} jitter />
            <text x={397} y={206} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>local crop</text>
            <text x={520} y={150} textAnchor="middle" style={SK} fontSize="10" fontStyle="italic" fill={P.accent}>same scene?</text>
          </g>
        );
      case "student":
        return (
          <g>
            <Photo x={40} y={44} s={70} jitter />
            <text x={75} y={36} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>global</text>
            <Photo x={48} y={196} s={56} jitter />
            <text x={76} y={190} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>local</text>
            {arrow(114, 79, 196, 79)}
            {arrow(108, 224, 196, 224)}
            {net(200, 40, 96, 80, "teacher (EMA)", true)}
            {net(200, 188, 96, 80, "student (trained)", false)}
            {/* EMA copy arrow student → teacher */}
            <path d={`M248 188 Q 340 154, 340 120 Q 340 96, 300 88`} stroke={P.sub} strokeWidth="1.2" fill="none" strokeDasharray="4 3" />
            <path d={`M308 92 L299 87 L305 96`} stroke={P.sub} strokeWidth="1.2" fill="none" />
            <text x={372} y={150} style={SK} fontSize="9" fill={P.sub}>EMA — slow copy</text>
            <text x={372} y={165} style={SK} fontSize="9" fill={P.sub}>of the student</text>
            <text x={340} y={250} style={SK} fontSize="9" fontStyle="italic" fill={P.accent}>no gradients →</text>
          </g>
        );
      case "distill": {
        const bars = (x, vals, col) => vals.map((v, i) => (
          <rect key={i} x={x + i * 15} y={150 - v} width={11} height={v} fill={col} stroke={P.ink} strokeWidth="0.6" />
        ));
        return (
          <g>
            <text x={118} y={44} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>teacher · centered + sharpened</text>
            {bars(66, [16, 64, 20, 10, 30], P.accentSoft)}
            <line x1={60} y1={150} x2={168} y2={150} stroke={P.ink} strokeWidth="1" />
            <text x={472} y={44} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>student · pushed to match</text>
            {bars(420, [24, 48, 30, 18, 26], P.faint)}
            <line x1={414} y1={150} x2={522} y2={150} stroke={P.ink} strokeWidth="1" />
            {arrow(340, 118, 250, 118, true)}
            {arrow(260, 150, 350, 150, true)}
            <text x={300} y={104} textAnchor="middle" style={SK} fontSize="11" fill={P.accent}>cross-entropy</text>
            <text x={300} y={176} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.sub}>collapse forbidden</text>
            <text x={300} y={248} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>→ forced to encode real structure</text>
          </g>
        );
      }
      case "embed":
        return (
          <g>
            <Photo x={44} y={100} s={96} />
            {arrow(148, 148, 214, 148)}
            {net(220, 96, 104, 104, "frozen DINOv2 ViT", true)}
            {arrow(330, 148, 392, 148)}
            {vec(398, 128, 12, 13, 40, true)}
            <text x={476} y={120} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>1,024-dim z</text>
            <text x={476} y={186} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.accent}>structural, not</text>
            <text x={476} y={200} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.accent}>language-aligned</text>
          </g>
        );
      case "head": {
        // little decision-tree glyph
        const tree = (
          <g stroke={P.ink} strokeWidth="1.1" fill="none">
            <line x1={430} y1={70} x2={408} y2={100} /><line x1={430} y1={70} x2={452} y2={100} />
            <line x1={408} y1={100} x2={396} y2={126} /><line x1={408} y1={100} x2={420} y2={126} />
            <line x1={452} y1={100} x2={440} y2={126} /><line x1={452} y1={100} x2={464} y2={126} />
            {[[430, 70], [408, 100], [452, 100], [396, 126], [420, 126], [440, 126], [464, 126]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4" fill={P.paper2} />
            ))}
          </g>
        );
        // 2-layer MLP glyph
        const L = (n, x, y0, gap) => Array.from({ length: n }, (_, i) => ({ x, y: y0 + i * gap }));
        const a = L(3, 400, 196, 22), b = L(4, 448, 185, 18), c = L(1, 496, 217, 0);
        return (
          <g>
            {vec(40, 128, 12, 12, 44, true)}
            <text x={112} y={120} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>frozen z (1,024-d)</text>
            {arrow(190, 150, 250, 96, false)}
            {arrow(190, 150, 250, 214, false)}
            {/* XGBoost branch */}
            <rect x={344} y={54} width={150} height={92} fill={P.paper2} stroke={P.line} strokeWidth="1" />
            {tree}
            <text x={419} y={162} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>XGBoost — trees</text>
            <text x={419} y={44} textAnchor="middle" style={SK} fontSize="12" fill={P.sub}>F1 0.786</text>
            {/* MLP branch */}
            <rect x={344} y={172} width={190} height={94} fill={P.paper2} stroke={P.accent} strokeWidth="1.4" />
            <g stroke={P.line} strokeWidth="0.7">
              {a.map((p, i) => b.map((q, j) => <line key={`ab${i}${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />))}
              {b.map((q, j) => <line key={`bc${j}`} x1={q.x} y1={q.y} x2={c[0].x} y2={c[0].y} />)}
            </g>
            {[...a, ...b, ...c].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.4" fill={P.accent} />)}
            <text x={439} y={286} textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>MLP — non-linear</text>
            <text x={556} y={221} textAnchor="middle" style={SK} fontSize="13" fill={P.accent}>0.835</text>
            <text x={556} y={205} textAnchor="middle" fontSize="11" fill={P.accent}>★</text>
          </g>
        );
      }
      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };
  const N = DINOV2_STEPS.length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>no labels → frozen embedding → ML head</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {N}</span>
          <button onClick={() => setStep((step + N - 1) % N)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % N)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`DINOv2 walkthrough step ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {DINOV2_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   STEERVIT — text steering a frozen backbone by cross-attention.
   The question it answers: a frozen embedding commits to whatever is most
   salient, so how do you ask it for the *unusual* item in a crowded scene?
   Numbers in the last two steps are from my own small-scale reproduction
   (RefCOCOg, 4.5k images, 3k steps) — including the check that failed.
   ════════════════════════════════════════ */
const STEER_PROMPTS = [
  { key: "chip", label: "“the chipped one”", target: 27, note: "a defect, not a category" },
  { key: "flip", label: "“the upside-down one”", target: 52, note: "an orientation, not an object" },
  { key: "odd", label: "“anything that doesn’t belong”", target: 14, note: "no class name at all" },
];

const STEERVIT_STEPS = [
  {
    key: "blindspot", label: "the blind spot",
    title: "A frozen backbone answers a question you didn't ask",
    body: "DINOv2 encodes an image once, and that vector commits to whatever the network finds salient — usually the big, central, obvious thing. Show it a shelf of sixty near-identical cups and ask for the one with a chipped rim, and there is no handle to pull. The information may survive somewhere in the patch tokens, but nothing in the interface lets you request it.",
    math: "x → frozen ViT → z    ·  no place to put a question",
  },
  {
    key: "late", label: "late fusion",
    title: "CLIP fuses too late to help",
    body: "The obvious fix is to bring in text — but CLIP compares a finished image vector against a finished text vector. The fusion happens after the visual encoder has already decided what to keep. Re-weighting features that were computed without the prompt can only re-rank what survived; it cannot go back and encode the detail the backbone discarded.",
    math: "sim( f_img(x), f_txt(t) )    ·  scoring, not steering",
  },
  {
    key: "cross", label: "cross-attention",
    title: "Push the text in early — inside the blocks",
    body: "SteerViT's move is to inject the prompt into the ViT's own layers. Patch tokens become the queries; the adapted text tokens become keys and values. Every patch gets to ask “which word am I evidence for?” while the representation is still being built — so the prompt shapes what gets encoded, not merely what gets selected afterwards.",
    math: "z ← z + CrossAttn( Q=z_patches, K,V = H_text )   · blocks 1,3,5,7,9,11",
  },
  {
    key: "gate", label: "the gate",
    title: "A gate that starts at exactly zero",
    body: "Each injection site carries one learnable scalar α, initialised at 0 — and tanh(0) = 0, so at init the wrapped model is bit-identical to plain frozen DINOv2 no matter what text you feed it. Steering is something the model has to earn. At inference a scale ω rides on top, giving you a dial from “untouched backbone” to “fully steered” without retraining.",
    math: "z ← z + tanh(α_l · ω) · CrossAttn(z, H_t)    ·  α=0 ⇒ identity",
  },
  {
    key: "steer", label: "steer it",
    title: "Now the prompt picks the needle",
    body: "This is what the gate buys: the same frozen weights, the same image, and the attention lands somewhere else because the sentence changed. Note what the prompts are asking for — a defect, an orientation, an oddity. None of them name an object class, so no fixed-vocabulary detector could serve them. Pick a prompt below and watch the heatmap move.",
    math: "in my repro: patch IoU 0.129 (no text) → 0.294 (correct prompt)",
  },
  {
    key: "check", label: "the honest check",
    title: "The check that decides whether any of it is real",
    body: "A steered heatmap that looks right proves nothing — the model may simply have memorised where objects tend to sit. So you feed a prompt describing a different image entirely: localisation must collapse toward baseline. In my reproduction it didn't. 62.5% of the steering gain survived a mismatched prompt, against a 30% pass bar. At 4.5k images and 3k steps (the paper trains 20–50k) this is the image talking, not the text — and it's the one number worth reporting.",
    math: "collapse_ratio = (wrong − base) / (correct − base) = 0.625    · FAIL (bar ≤ 0.30)",
  },
];

export function SteerVitWalkthrough() {
  const [step, setStep] = useState(0);
  const [prompt, setPrompt] = useState(0);
  const sk = STEERVIT_STEPS[step].key;
  const sc = STEERVIT_STEPS[step];
  const P_ = STEER_PROMPTS[prompt];

  /* A "massive collection": 12 x 5 shelf of near-identical items.
     Deterministic jitter so the sketch stays stable across renders. */
  const COLS = 12, ROWS = 5, GX = 34, GY = 46, CW = 39, CH = 40;
  const jit = (i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;

  const Item = ({ i, lit, dim }) => {
    const cx = GX + (i % COLS) * CW + CW / 2;
    const cy = GY + Math.floor(i / COLS) * CH + CH / 2;
    const r = 10 + jit(i) * 1.6;
    const chipped = i === STEER_PROMPTS[0].target;
    const flipped = i === STEER_PROMPTS[1].target;
    const odd = i === STEER_PROMPTS[2].target;
    const op = dim ? 0.28 : 1;
    return (
      <g opacity={op}>
        {lit && <rect x={cx - CW / 2 + 2} y={cy - CH / 2 + 2} width={CW - 4} height={CH - 4} fill={P.accent} fillOpacity="0.16" stroke={P.accent} strokeWidth="1.3" />}
        <g transform={flipped ? `rotate(180 ${cx} ${cy})` : undefined}>
          {/* cup: body + handle */}
          <path d={`M${cx - r} ${cy - r * 0.7} L${cx - r * 0.72} ${cy + r * 0.8} Q ${cx} ${cy + r * 1.05}, ${cx + r * 0.72} ${cy + r * 0.8} L${cx + r} ${cy - r * 0.7} Z`}
            fill={odd ? P.green : P.paper2} fillOpacity={odd ? 0.34 : 1} stroke={P.ink} strokeWidth="1.1" />
          <path d={`M${cx + r * 0.92} ${cy - r * 0.3} q ${r * 0.5} ${r * 0.2}, 0 ${r * 0.62}`} fill="none" stroke={P.ink} strokeWidth="1" />
          {chipped
            ? <path d={`M${cx - r} ${cy - r * 0.7} l ${r * 0.5} 0 l ${r * 0.26} ${-r * 0.34} l ${r * 0.3} ${r * 0.34} L${cx + r} ${cy - r * 0.7}`} fill="none" stroke={P.ink} strokeWidth="1.1" />
            : <line x1={cx - r} y1={cy - r * 0.7} x2={cx + r} y2={cy - r * 0.7} stroke={P.ink} strokeWidth="1.1" />}
        </g>
      </g>
    );
  };

  const shelf = (litIdx, dimRest) => (
    <g>
      {Array.from({ length: COLS * ROWS }).map((_, i) => (
        <Item key={i} i={i} lit={litIdx != null && i === litIdx} dim={dimRest && litIdx !== i} />
      ))}
    </g>
  );

  const arrow = (x1, y1, x2, y2, dash, col) => (
    <g stroke={col || P.accent} strokeWidth="1.3" fill="none">
      <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
      <path d={`M${x2 - 8} ${y2 - 4} L${x2} ${y2} L${x2 - 8} ${y2 + 4}`} />
    </g>
  );

  const chip = (x, y, w, label, col) => (
    <g>
      <rect x={x} y={y} width={w} height={22} fill={P.paper2} stroke={col || P.ink} strokeWidth="1.2" />
      <text x={x + w / 2} y={y + 15} textAnchor="middle" style={SK} fontSize="10.5" fill={col || P.ink}>{label}</text>
    </g>
  );

  const body = (() => {
    switch (sk) {
      case "blindspot":
        return (
          <g>
            <text x={300} y={26} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>sixty near-identical items · one frozen vector</text>
            {shelf(null, false)}
            {arrow(300, 254, 300, 274)}
            <text x={300} y={292} textAnchor="middle" style={SK} fontSize="11" fontStyle="italic" fill={P.red}>“which one is chipped?” — nowhere to put the question</text>
          </g>
        );
      case "late":
        return (
          <g>
            {shelf(null, true)}
            <g opacity="0.5">{chip(60, 250, 150, "f_img(x)  →  z", P.ink)}</g>
            {chip(250, 250, 150, "f_txt(t)  →  t", P.accent)}
            <text x={452} y={266} style={SK} fontSize="12" fill={P.sub}>cos(z, t)</text>
            <path d="M212 261 L246 261" stroke={P.sub} strokeWidth="1.2" strokeDasharray="3 3" />
            <path d="M404 261 L440 261" stroke={P.sub} strokeWidth="1.2" strokeDasharray="3 3" />
            <text x={300} y={228} textAnchor="middle" style={SK} fontSize="11" fontStyle="italic" fill={P.red}>the image was already encoded before the text arrived</text>
          </g>
        );
      case "cross":
        return (
          <g>
            {/* stack of blocks with injection sites */}
            {Array.from({ length: 12 }).map((_, i) => {
              const inject = [1, 3, 5, 7, 9, 11].includes(i);
              const y = 40 + i * 19;
              return (
                <g key={i}>
                  <rect x={150} y={y} width={210} height={15} fill={inject ? P.accentSoft : "rgba(43,76,140,0.04)"} stroke={inject ? P.accent : P.line} strokeWidth={inject ? 1.2 : 0.9} />
                  <text x={160} y={y + 11} style={SK} fontSize="8.5" fill={P.sub}>block {i}</text>
                  {inject && <path d={`M470 ${y + 7} L366 ${y + 7}`} stroke={P.accent} strokeWidth="1.1" fill="none" />}
                  {inject && <path d={`M374 ${y + 3} L366 ${y + 7} L374 ${y + 11}`} stroke={P.accent} strokeWidth="1.1" fill="none" />}
                </g>
              );
            })}
            <text x={255} y={30} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>frozen DINOv2 · ❄</text>
            <rect x={476} y={92} width={104} height={64} fill={P.paper2} stroke={P.ink} strokeWidth="1.3" />
            <text x={528} y={116} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>text tokens</text>
            <text x={528} y={132} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>RoBERTa ❄</text>
            <text x={528} y={147} textAnchor="middle" style={SK} fontSize="9" fill={P.accent}>+ adapter (trained)</text>
            <text x={528} y={176} textAnchor="middle" style={SK} fontSize="9.5" fill={P.sub}>K, V</text>
            <text x={410} y={176} textAnchor="middle" style={SK} fontSize="9.5" fill={P.sub}>Q = patches</text>
            <text x={300} y={288} textAnchor="middle" style={SK} fontSize="10.5" fontStyle="italic" fill={P.accent}>the prompt is in the room while the features are being built</text>
            <text x={70} y={140} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>image</text>
            {arrow(70, 152, 70, 186)}
            <path d="M70 186 L70 200 L150 200" stroke={P.accent} strokeWidth="1.3" fill="none" />
          </g>
        );
      case "gate":
        return (
          <g>
            {/* the residual add with a gate dial */}
            <text x={300} y={30} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>one scalar per injection site · six sites</text>
            <rect x={60} y={110} width={90} height={54} fill="rgba(43,76,140,0.06)" stroke={P.ink} strokeWidth="1.3" />
            <text x={105} y={142} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>z (patches)</text>
            <path d="M150 137 L232 137" stroke={P.ink} strokeWidth="1.3" fill="none" />
            <circle cx={252} cy={137} r={15} fill={P.paper2} stroke={P.ink} strokeWidth="1.3" />
            <text x={252} y={142} textAnchor="middle" style={SK} fontSize="14" fill={P.ink}>+</text>
            <path d="M267 137 L372 137" stroke={P.ink} strokeWidth="1.3" fill="none" />
            <path d="M364 133 L372 137 L364 141" stroke={P.ink} strokeWidth="1.3" fill="none" />
            <text x={412} y={142} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>z (steered)</text>
            {/* branch */}
            <path d="M195 137 L195 224 L300 224" stroke={P.sub} strokeWidth="1.1" fill="none" strokeDasharray="4 3" />
            {chip(300, 213, 108, "CrossAttn(z, H_t)", P.sub)}
            <path d="M408 224 L470 224 L470 168" stroke={P.sub} strokeWidth="1.1" fill="none" strokeDasharray="4 3" />
            {chip(416, 146, 108, "× tanh(α·ω)", P.accent)}
            <path d="M470 146 L470 137 L390 137" stroke={P.accent} strokeWidth="1.3" fill="none" />
            <path d="M398 133 L390 137 L398 141" stroke={P.accent} strokeWidth="1.3" fill="none" />
            {/* dial */}
            <text x={110} y={214} style={SK} fontSize="10" fill={P.sub}>ω = 0</text>
            <text x={110} y={232} style={SK} fontSize="10" fill={P.sub}>ω = 1</text>
            <text x={158} y={214} style={SK} fontSize="10" fill={P.ink}>IoU 0.129 · exactly frozen DINOv2</text>
            <text x={158} y={232} style={SK} fontSize="10" fill={P.accent}>IoU 0.294 · fully steered</text>
            <text x={300} y={276} textAnchor="middle" style={SK} fontSize="10.5" fontStyle="italic" fill={P.sub}>α starts at 0, so the model begins as the untouched backbone and earns its steering</text>
          </g>
        );
      case "steer":
        return (
          <g>
            {shelf(P_.target, true)}
            <rect x={92} y={252} width={416} height={26} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.2" />
            <text x={300} y={269} textAnchor="middle" style={SK} fontSize="12" fill={P.accent}>{P_.label}</text>
            <text x={300} y={292} textAnchor="middle" style={SK} fontSize="10" fontStyle="italic" fill={P.sub}>{P_.note} — same weights, same image, different answer</text>
            <text x={300} y={26} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>the prompt reaches into the encoder and lights one patch</text>
          </g>
        );
      case "check":
        return (
          <g>
            <text x={300} y={26} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>same image · a prompt describing a different scene entirely</text>
            {/* two bars: what should happen vs what did */}
            <text x={64} y={86} style={SK} fontSize="10.5" fill={P.sub}>expected</text>
            <rect x={150} y={72} width={330} height={20} fill="none" stroke={P.line} strokeWidth="1" />
            <rect x={150} y={72} width={99} height={20} fill={P.green} fillOpacity="0.35" stroke={P.green} strokeWidth="1.2" />
            <text x={262} y={87} style={SK} fontSize="10" fill={P.green}>≤ 0.30 · steering collapses → it was reading the text</text>

            <text x={64} y={140} style={SK} fontSize="10.5" fill={P.sub}>measured</text>
            <rect x={150} y={126} width={330} height={20} fill="none" stroke={P.line} strokeWidth="1" />
            <rect x={150} y={126} width={206} height={20} fill={P.red} fillOpacity="0.3" stroke={P.red} strokeWidth="1.2" />
            <text x={368} y={141} style={SK} fontSize="10" fill={P.red}>0.625 · the gain survives → it was reading the image</text>

            {/* the two heatmaps, too similar */}
            <text x={188} y={186} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>correct prompt</text>
            <text x={412} y={186} textAnchor="middle" style={SK} fontSize="10" fill={P.sub}>wrong prompt</text>
            {[0, 1].map((h) => (
              <g key={h} transform={`translate(${h === 0 ? 128 : 352} 196)`}>
                {Array.from({ length: 36 }).map((_, i) => {
                  const c = i % 6, r = Math.floor(i / 6);
                  const on = [14, 15, 20, 21].includes(i);
                  const near = [8, 9, 13, 16, 19, 22, 26, 27].includes(i);
                  return <rect key={i} x={c * 20} y={r * 12} width={19} height={11}
                    fill={on ? P.red : near ? P.red : P.faint}
                    fillOpacity={on ? (h === 0 ? 0.75 : 0.6) : near ? (h === 0 ? 0.3 : 0.26) : 1}
                    stroke={P.line} strokeWidth="0.4" />;
                })}
              </g>
            ))}
            <text x={300} y={288} textAnchor="middle" style={SK} fontSize="10.5" fontStyle="italic" fill={P.ink}>they should look nothing alike — that they do is the result</text>
          </g>
        );
      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };
  const N = STEERVIT_STEPS.length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>frozen backbone · text steers it · the check that failed</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {N}</span>
          <button onClick={() => setStep((step + N - 1) % N)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % N)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      {sk === "steer" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub }}>ask for:</span>
          {STEER_PROMPTS.map((q, j) => (
            <button key={q.key} onClick={() => setPrompt(j)} style={{ ...SK, fontSize: "0.7rem", padding: "2px 10px", cursor: "pointer", border: `1px solid ${j === prompt ? P.accent : P.line}`, background: j === prompt ? P.accentSoft : P.paper2, color: j === prompt ? P.accent : P.sub }}>{q.label}</button>
          ))}
        </div>
      )}

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`SteerViT walkthrough step ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {STEERVIT_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   RAG — Lewis et al. 2020, rebuilt on a laptop (RAG_repro.ipynb).
   Every number below is measured in that notebook, not quoted from the paper:
   15,077-passage index, 96 SQuAD-dev questions asked open-domain, k=5.
   ════════════════════════════════════════ */

/* The demo retrieval, verbatim from §2 of the notebook. Kept as-is including
   the fact that it is *bad* — a 15k index has nothing about Hemingway, and the
   near-flat scores are the honest picture of what a tiny corpus does. */
const RAG_TOPK = [
  { score: 59.26, trust: 0.297, title: "John Kerry", text: "Kerry's commanding officer, Lieutenant Commander George Elliott…", says: "2018" },
  { score: 59.18, trust: 0.275, title: "Queen (band)", text: "who had been nominated for Oscars for his screenplays The Queen…", says: "—" },
  { score: 58.64, trust: 0.159, title: "The Blitz", text: "In recent years a large number of wartime recordings relating to…", says: "julius caesar" },
  { score: 58.60, trust: 0.153, title: "Queen (band)", text: "The band, now revitalised by the response to Live Aid – a \"shot…", says: "—" },
  { score: 58.32, trust: 0.116, title: "Queen (band)", text: "Queen contributed music directly to the films Flash Gordon (1980)…", says: "2018" },
];

/* §7 sweep. em/recall are RAG-Token over the full n=96 eval set. */
const RAG_KSWEEP = [
  { k: 1, em: 13.5, se: 3.5, rec: 26.0 },
  { k: 2, em: 19.8, se: 4.1, rec: 36.5 },
  { k: 5, em: 24.0, se: 4.4, rec: 50.0 },
  { k: 10, em: 21.9, se: 4.2, rec: 61.5 },
  { k: 20, em: 20.8, se: 4.1, rec: 70.8 },
];

/* §8, Fig 3 centre — answer-recall@k for three retrievers over the same n=96
   questions. No generator runs here at all: retrieve, then check whether a gold
   answer string appears in the retrieved text. That is why all three could be
   swept at every k while the EM sweep in §7 had to be rationed. */
const RAG_RECALL_CURVES = [
  { name: "learned DPR (RAG-Token)", col: P.accent, rec: [26.0, 36.5, 50.0, 61.5, 70.8] },
  { name: "frozen DPR — never fine-tuned", col: P.green, rec: [24.0, 38.5, 57.3, 65.6, 76.0] },
  { name: "BM25 word overlap", col: P.yellow, rec: [67.7, 75.0, 81.2, 86.5, 89.6] },
];

/* §8 — the ablation itself, at k=5, all four feeding the same generator weights.
   `paper` is Table 6 (NQ dev EM over the full 21M index); random has no row there. */
const RAG_ABLATION = [
  { label: "DPR ✎", full: "learned DPR", em: 24.0, se: 4.4, f1: 30.8, rec: 50.0, paper: 43.5, col: P.accent },
  { label: "DPR ❄", full: "frozen DPR", em: 22.9, se: 4.3, f1: 32.7, rec: 57.3, paper: 37.8, col: P.green },
  { label: "BM25", full: "BM25", em: 44.8, se: 5.1, f1: 55.7, rec: 81.2, paper: 29.7, col: P.yellow },
  { label: "random", full: "random passages", em: 2.1, se: 1.5, f1: 7.0, rec: 1.0, paper: null, col: P.line },
];

/* §9 — the same 96 questions split by whether the answer string was retrieved
   at all. It falls exactly 48/48, which is coincidence, not design. */
const RAG_EVIDENCE = {
  with: { n: 48, em: 45.8 },
  without: { n: 48, em: 2.1 },
  paper: 11.8,
  example: { q: "Which country was the last to receive the disease?", pred: "russia" },
};

/* §11 — 25 steps of end-to-end training on 8 questions, answer strings only. */
const RAG_TRUST_CURVE = [
  [0, 0.097], [5, 0.245], [10, 0.305], [15, 0.341], [20, 0.321], [25, 0.354],
];

const RAG_STEPS = [
  {
    key: "store", label: "the store",
    title: "Knowledge that lives outside the weights",
    body: "The paper's move is to stop cramming facts into parameters and keep them as literal text you can point at and edit. Wikipedia is cut into disjoint 100-word chunks, and each chunk is pushed once through a frozen BERT tower into a single 768-d vector. The paper does this for 21M passages; I did it for 15,077 and cached the result as a 46 MB array. The vectors are a catalogue, not the knowledge — d(z) tells you where the passage is, and the text itself is fetched afterwards.",
    math: "d(z) = BERT_d(z) ∈ R^768   ·   D = 15,077 × 768   ·   46 MB on disk",
  },
  {
    key: "retrieve", label: "retrieve",
    title: "One dot product is the whole retriever",
    body: "A second BERT tower encodes the question into the same 768-d space, and relevance is nothing but d(z)ᵀq(x). At 21M passages you need FAISS/HNSW to approximate the top-k; at 15k the exact thing is a 1×768 by 768×15077 matmul, sub-millisecond, which removes approximation error as a confound. Then softmax over the top-k turns unbounded reals into p_η(z|x) — the “trust” each passage gets. Look at the raw scores: 59.3 down to 58.3, nearly flat. Nobody assessed these passages; trust is vector-closeness pushed through exp.",
    math: "p_η(z|x) = softmax( d(z)ᵀ q(x) )   ·   exact MIPS, no FAISS needed at 15k",
  },
  {
    key: "prompt", label: "the prompt",
    title: "The passage is glued on as a string",
    body: "No fusion module, no cross-attention trick — §2.2 says “we simply concatenate.” The retrieved text is pasted in front of the question with the checkpoint's own separators and handed to BART's encoder, and p_θ(y|x,z) is just ordinary autoregressive probability. That is why passage quality shows up as the size of a number: when the passage names the answer, copying it is cheap; when it is irrelevant, BART's mass spreads out and the probability collapses. Each of the five documents answers on its own here, and none of them knows about Hemingway.",
    math: "{title} / {passage text} // {question}   →   BART   →   p_θ(y | x, z)",
  },
  {
    key: "marginalise", label: "marginalise",
    title: "Two ways to sum over what you retrieved",
    body: "The retrieved document is a latent variable, so it gets summed out — and where you put that sum is the only difference between the paper's two models. RAG-Sequence commits to one document for the whole answer and blends finished answers (Σ outside the product). RAG-Token re-decides at every token, which lets it braid facts from two passages into one sentence (Σ inside). I implemented both from scratch in log-space; Eq (2) matches the `transformers` reference to |Δ| = 0.0e+00.",
    math: "Eq(1)  log Σ_z p(z|x)·Π_i p(y_i|·)  =  −51.02        Eq(2)  log Π_i Σ_z p(z|x)·p(y_i|·)  =  −55.45",
  },
  {
    key: "sweep", label: "how many docs",
    title: "Recall keeps climbing; accuracy does not",
    body: "Retrieving more documents strictly helps the retriever — answer-recall@k rises monotonically 26 → 71 as k goes 1 → 20. Exact-match does not follow it. The softmax is peaky, so a 20th document arrives carrying almost no weight while still adding noise for the generator to sift; EM peaks at k=5 and then drifts down. Worth reading the error bars before believing the shape: at n=96 every point carries ±4 EM, and the paper's own k effect is only 2–4 EM. Recall reproduces cleanly; the EM curve is under-powered here and I report it as untested rather than reproduced.",
    math: "answer-recall@k  26 → 36 → 50 → 61 → 71   ·   EM peaks at k=5, inside the noise",
  },
  {
    key: "retrievers", label: "which retriever",
    title: "The ablation that went the other way",
    body: "The paper's Table 6 swaps the retriever and keeps everything else: learned DPR 43.5 EM, the same DPR never fine-tuned 37.8, BM25 word-overlap 29.7. I ran all three into the same generator weights and the ordering inverted — BM25 won outright, 44.8 EM to DPR's 24.0, and it isn't close on the retrieval side either: 81.2% recall@5 against 50.0%. Freezing the query tower cost nothing measurable (22.9 vs 24.0, well inside the error bars), so I can't show fine-tuning helped at all. The reading I'll defend: SQuAD questions are written while looking at the paragraph they're about, so they share rare words with it, and a 15,077-passage haystack almost never makes you disambiguate between two documents using the same words. Learned retrieval buys generalisation over 21M passages; at 1/1400th of that, word counting is enough. It is the ablation that most needs the paper's own scale to be tested.",
    math: "recall@5 — BM25 81.2 · frozen DPR 57.3 · learned DPR 50.0   —   paper's order: learned > frozen > BM25",
  },
  {
    key: "evidence", label: "no evidence",
    title: "Right when the answer was never retrieved",
    body: "§4.1's sharpest claim: RAG is right 11.8% of the time on questions where the answer appears in no retrieved document — where an extractive reader scores 0 by construction, because it can only copy a span that is present. Splitting my 96 questions by whether a gold string appears anywhere in the top-5 gives an even 48/48. With evidence: 45.8 EM. Without: 2.1 — one question, a rephrasing that landed on “russia” with no passage naming it. Non-zero is the structural point and it holds, but 2.1 against 11.8 is far below, and a single hit at n=48 is one question from zero. The more useful number is the split itself: the generator converts roughly half of what the retriever finds, so at this scale retrieval, not generation, is what binds.",
    math: "EM 45.8 (answer retrieved, n=48)   vs   2.1 (answer never retrieved, n=48)   ·   paper 11.8%",
  },
  {
    key: "gradient", label: "the leak",
    title: "The answer label trains the retriever",
    body: "This is the claim that makes RAG a model rather than a pipeline. p_η(z|x) is a factor in the output probability, so grading the answer sends gradient straight through the trust score and into the query encoder — no one ever labels a passage as relevant. I trained 25 steps on eight questions, supervising nothing but the answer strings, and watched trust in the passage that actually contains the answer climb from 0.097 to 0.354. Only the query tower moves; the document tower and the index stay frozen, which is exactly why this is affordable.",
    math: "‖∂ loss / ∂(query encoder)‖ = 6.6e+01   ·   gold-passage trust 0.097 → 0.354",
  },
  {
    key: "swap", label: "hot-swap",
    title: "Edit the world without retraining",
    body: "Because the memory is text, you can replace it. I built two three-passage indices — one saying the world of 2016, one saying 2020 — and swapped the array between queries with the model untouched. The answers change. Nothing was fine-tuned, no weight moved, no gradient was computed; the only thing that differs between these two columns is a 3×768 float array. A parametric model would need retraining to learn that a head of state changed.",
    math: "same θ, same η — swap D   ·   “barack obama” → “donald trump”",
  },
  {
    key: "verdict", label: "the verdict",
    title: "What actually held up at 1/1400th scale",
    body: "The mechanism reproduces: retrieval beats closed-book by 23 EM, the hand-written marginalisation matches the reference exactly, the gradient reaches the retriever, recall is monotone in k, hot-swapping works. One result went the other way and is worth more than the ones that agreed — BM25 beat the learned DPR retriever, 44.8 to 24.0 EM, the reverse of the paper's 43.5 vs 29.7. That is a corpus-size artifact, not a refutation: DPR's query tower was fine-tuned on NaturalQuestions, my questions are SQuAD, and word overlap is unusually strong when the haystack is 15k passages. RAG-Sequence scoring 0.0 is a decoding-config bug in my repro, and I've left it in the table rather than hiding it.",
    math: "✓ 8 reproduced · ~ 2 inside the noise · ✗ 2 did not — see results.md",
  },
];

export function RagWalkthrough() {
  const [step, setStep] = useState(0);
  const [variant, setVariant] = useState("token");   // marginalisation step
  const [ki, setKi] = useState(2);                   // sweep step — defaults to k=5
  const sc = RAG_STEPS[step];
  const sk = sc.key;

  const arrow = (x1, y1, x2, y2, col, dash) => (
    <g stroke={col || P.accent} strokeWidth="1.3" fill="none">
      <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
      <path d={`M${x2 - 7} ${y2 - 4} L${x2} ${y2} L${x2 - 7} ${y2 + 4}`} />
    </g>
  );

  const box = (x, y, w, h, label, sub, col, soft) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={soft ? P.accentSoft : P.paper2} stroke={col || P.ink} strokeWidth="1.2" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 1 : h / 2 + 4)} textAnchor="middle" style={SK} fontSize="10" fill={col || P.ink}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>{sub}</text>}
    </g>
  );

  /* A 768-d vector, drawn as a strip of cells with deterministic "values". */
  const vec = (x, y, n, seed, col, w = 5, h = 13) => (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const v = ((Math.sin((i + seed) * 12.9898) * 43758.5453) % 1 + 1) % 1;
        return <rect key={i} x={x + i * w} y={y} width={w - 0.8} height={h}
          fill={col} fillOpacity={0.12 + v * 0.72} stroke={P.line} strokeWidth="0.3" />;
      })}
    </g>
  );

  const body = (() => {
    switch (sk) {
      case "store":
        return (
          <g>
            <text x={300} y={24} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>non-parametric memory — text you can point at, and edit</text>
            {/* passage cards */}
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${28 + i * 5} ${52 + i * 9})`} opacity={1 - i * 0.22}>
                <rect x={0} y={0} width={132} height={74} fill={P.paper2} stroke={P.ink} strokeWidth="1.1" />
                <text x={7} y={15} style={SK} fontSize="8.5" fill={P.accent}>Super Bowl 50</text>
                <line x1={7} y1={20} x2={125} y2={20} stroke={P.line} strokeWidth="0.8" />
                {[0, 1, 2, 3, 4].map((r) => (
                  <line key={r} x1={7} y1={30 + r * 9} x2={r === 4 ? 86 : 125} y2={30 + r * 9} stroke={P.sub} strokeWidth="2.6" strokeOpacity="0.2" />
                ))}
              </g>
            ))}
            <text x={94} y={164} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>disjoint 100-word chunks</text>
            <text x={94} y={179} textAnchor="middle" style={SK} fontSize="9.5" fill={P.ink}>15,077 passages</text>
            <text x={94} y={193} textAnchor="middle" style={SK} fontSize="8.5" fill={P.red}>(paper: 21,000,000)</text>

            {arrow(172, 88, 218, 88)}
            {box(220, 68, 96, 42, "BERT_d  ❄", "frozen, encoded once", P.ink)}
            <text x={268} y={128} textAnchor="middle" style={SK} fontSize="8.5" fontStyle="italic" fill={P.sub}>never re-encoded during training</text>
            {arrow(320, 88, 366, 88)}

            {/* the index matrix */}
            <text x={368} y={44} style={SK} fontSize="9" fill={P.sub}>d(z) ∈ R⁷⁶⁸, one row per passage</text>
            {Array.from({ length: 9 }).map((_, r) => vec(368, 54 + r * 15, 32, r * 17 + 3, P.accent, 5.6, 12))}
            <rect x={366} y={52} width={182} height={137} fill="none" stroke={P.accent} strokeWidth="1.3" />
            <text x={457} y={204} textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>D  ·  15,077 × 768  ·  46 MB</text>

            <text x={300} y={236} textAnchor="middle" style={SK} fontSize="10.5" fill={P.ink}>the vectors are the catalogue — the text is what the generator will actually read</text>
            <text x={300} y={258} textAnchor="middle" style={SK} fontSize="10" fontStyle="italic" fill={P.green}>swap this file and the model's world knowledge changes · see step 7</text>
            <text x={300} y={282} textAnchor="middle" style={SK} fontSize="9.5" fill={P.sub}>SQuAD paragraphs are Wikipedia prose · 3,077 answerable + 12,000 distractors</text>
          </g>
        );

      case "retrieve":
        return (
          <g>
            <text x={16} y={26} style={SK} fontSize="9.5" fill={P.sub}>x =</text>
            <rect x={42} y={14} width={214} height={20} fill={P.faint} stroke={P.line} strokeWidth="1" />
            <text x={149} y={28} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>“who wrote a farewell to arms”</text>
            {arrow(149, 36, 149, 52)}
            {box(88, 54, 122, 34, "BERT_q  ✎ trainable", null, P.accent)}
            <text x={149} y={104} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>q(x) ∈ R⁷⁶⁸</text>
            {vec(50, 110, 34, 91, P.accent, 5.8, 14)}

            <rect x={252} y={106} width={128} height={22} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.2" />
            <text x={316} y={121} textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>D · q(x)  →  top-5</text>
            <path d="M232 124 L248 118" stroke={P.accent} strokeWidth="1.2" fill="none" />
            <text x={466} y={26} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>D — the index, 15,077 rows</text>
            {vec(392, 34, 26, 5, P.ink, 5.6, 11)}
            <text x={466} y={64} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>exact MIPS: one 1×768 @ 768×15,077</text>
            <text x={466} y={78} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>matmul — sub-millisecond, no FAISS</text>
            <path d="M466 86 L400 106" stroke={P.line} strokeWidth="1.1" fill="none" strokeDasharray="3 3" />

            {/* the ranked list, with score and softmax bar */}
            <text x={22} y={158} style={SK} fontSize="8.5" fill={P.sub}>rank</text>
            <text x={58} y={158} style={SK} fontSize="8.5" fill={P.sub}>d(z)ᵀq(x)</text>
            <text x={124} y={158} style={SK} fontSize="8.5" fill={P.sub}>p_η(z|x)</text>
            <text x={266} y={158} style={SK} fontSize="8.5" fill={P.sub}>passage</text>
            {RAG_TOPK.map((d, i) => (
              <g key={i} transform={`translate(0 ${166 + i * 19})`}>
                <text x={26} y={11} style={SK} fontSize="9.5" fill={P.sub}>#{i + 1}</text>
                <text x={86} y={11} textAnchor="end" style={SK} fontSize="9.5" fill={P.ink}>{d.score.toFixed(2)}</text>
                <rect x={124} y={2} width={132} height={12} fill="none" stroke={P.line} strokeWidth="0.7" />
                <rect x={124} y={2} width={132 * (d.trust / 0.32)} height={12} fill={P.accent} fillOpacity="0.32" stroke={P.accent} strokeWidth="0.9" />
                <text x={130} y={11.5} style={SK} fontSize="8.5" fill={P.accent}>{d.trust.toFixed(3)}</text>
                <text x={266} y={11} style={SK} fontSize="9" fill={P.sub}>[{d.title}] {d.text.slice(0, 34)}…</text>
              </g>
            ))}
            <text x={300} y={288} textAnchor="middle" style={SK} fontSize="10" fontStyle="italic" fill={P.red}>59.26 vs 58.32 — nearly flat. Nothing in a 15k index is about Hemingway.</text>
          </g>
        );

      case "prompt":
        return (
          <g>
            <text x={300} y={22} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>“we simply concatenate the retrieved content with the input” — §2.2</text>
            {/* the template */}
            <rect x={40} y={38} width={520} height={30} fill={P.paper2} stroke={P.ink} strokeWidth="1.2" />
            <rect x={44} y={42} width={124} height={22} fill={P.green} fillOpacity="0.14" stroke={P.green} strokeWidth="0.9" />
            <text x={106} y={57} textAnchor="middle" style={SK} fontSize="9.5" fill={P.green}>John Kerry</text>
            <text x={176} y={57} style={SK} fontSize="11" fill={P.sub}>/</text>
            <rect x={190} y={42} width={228} height={22} fill={P.accent} fillOpacity="0.10" stroke={P.accent} strokeWidth="0.9" />
            <text x={304} y={57} textAnchor="middle" style={SK} fontSize="9.5" fill={P.accent}>Kerry's commanding officer, Lt Cdr…</text>
            <text x={426} y={57} style={SK} fontSize="11" fill={P.sub}>//</text>
            <rect x={444} y={42} width={112} height={22} fill={P.faint} stroke={P.line} strokeWidth="0.9" />
            <text x={500} y={57} textAnchor="middle" style={SK} fontSize="9.5" fill={P.ink}>who wrote a…</text>
            <text x={106} y={82} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>title</text>
            <text x={304} y={82} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>retrieved passage z</text>
            <text x={500} y={82} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>question x</text>

            {arrow(300, 90, 300, 108)}
            {box(214, 110, 172, 30, "BART encoder–decoder", null, P.ink)}
            <text x={300} y={158} textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>p_θ(y | x, z)  —  ordinary autoregressive probability</text>

            {/* each doc answers alone */}
            <text x={24} y={186} style={SK} fontSize="8.5" fill={P.sub}>doc</text>
            <text x={62} y={186} style={SK} fontSize="8.5" fill={P.sub}>p_η(z|x)</text>
            <text x={152} y={186} style={SK} fontSize="8.5" fill={P.sub}>what BART says from that passage alone</text>
            {RAG_TOPK.map((d, i) => (
              <g key={i} transform={`translate(0 ${192 + i * 17})`}>
                <text x={28} y={11} style={SK} fontSize="9.5" fill={P.sub}>{i + 1}</text>
                <rect x={62} y={2} width={72} height={11} fill="none" stroke={P.line} strokeWidth="0.7" />
                <rect x={62} y={2} width={72 * (d.trust / 0.32)} height={11} fill={P.accent} fillOpacity="0.3" />
                <text x={140} y={11} style={SK} fontSize="8.5" fill={P.sub}>{d.trust.toFixed(3)}</text>
                <text x={190} y={11} style={SK} fontSize="9.5" fill={d.says === "—" ? P.line : P.red}>{d.says === "—" ? "(empty)" : d.says}</text>
                <text x={300} y={11} style={SK} fontSize="8.5" fill={P.sub}>[{d.title}]</text>
              </g>
            ))}
            <text x={300} y={292} textAnchor="middle" style={SK} fontSize="10" fontStyle="italic" fill={P.sub}>irrelevant passage ⇒ BART's mass spreads out ⇒ small p_θ — that is what makes the sum work</text>
          </g>
        );

      case "marginalise": {
        const tok = variant === "token";
        return (
          <g>
            <text x={300} y={22} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>
              the retrieved document is a latent variable — sum it out
            </text>
            {/* k chains of tokens */}
            {RAG_TOPK.map((d, i) => (
              <g key={i} transform={`translate(70 ${44 + i * 30})`}>
                <text x={-46} y={14} style={SK} fontSize="9" fill={P.sub}>z{i + 1}</text>
                <rect x={-26} y={4} width={20} height={13} fill={P.accent} fillOpacity={d.trust * 2.4} stroke={P.accent} strokeWidth="0.8" />
                {[0, 1, 2, 3].map((t) => (
                  <g key={t}>
                    <rect x={8 + t * 54} y={2} width={42} height={17} fill={P.paper2} stroke={tok ? P.accent : P.line} strokeWidth={tok ? 1.1 : 0.9} />
                    <text x={29 + t * 54} y={14.5} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>p(y{t + 1}|z{i + 1})</text>
                    {tok && <path d={`M${29 + t * 54} 21 L${29 + t * 54} ${(4 - i) * 30 + 34}`} stroke={P.accent} strokeWidth="0.7" strokeOpacity="0.35" strokeDasharray="2 3" fill="none" />}
                  </g>
                ))}
                {!tok && (
                  <>
                    <path d="M216 10.5 L232 10.5" stroke={P.accent} strokeWidth="1" fill="none" strokeDasharray="3 2" />
                    <rect x={236} y={2} width={80} height={17} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.1" />
                    <text x={276} y={14.5} textAnchor="middle" style={SK} fontSize="8" fill={P.accent}>Π_i → one answer</text>
                    <path d="M316 10.5 L334 10.5" stroke={P.accent} strokeWidth="1" fill="none" />
                    <path d="M328 6.5 L334 10.5 L328 14.5" stroke={P.accent} strokeWidth="1" fill="none" />
                  </>
                )}
              </g>
            ))}
            {/* where the sum happens */}
            {tok ? (
              <g>
                <rect x={70} y={198} width={230} height={22} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.3" />
                <text x={185} y={213} textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>Σ_z at every token — then multiply</text>
                <text x={318} y={213} style={SK} fontSize="10" fill={P.ink}>= −55.45</text>
              </g>
            ) : (
              <g>
                <rect x={410} y={44} width={124} height={176} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.3" />
                <text x={472} y={126} textAnchor="middle" style={SK} fontSize="10.5" fill={P.accent}>Σ_z over the</text>
                <text x={472} y={142} textAnchor="middle" style={SK} fontSize="10.5" fill={P.accent}>5 finished answers</text>
                <text x={472} y={238} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>= −51.02</text>
              </g>
            )}
            <text x={300} y={252} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>
              {tok
                ? "Eq (2)   log Π_i Σ_z p_η(z|x) · p_θ(y_i | x, z, y_<i)     — Σ INSIDE the Π"
                : "Eq (1)   log Σ_z p_η(z|x) · Π_i p_θ(y_i | x, z, y_<i)     — Σ OUTSIDE the Π"}
            </text>
            <text x={300} y={272} textAnchor="middle" style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>
              {tok
                ? "re-picks a document at every token — can braid two passages into one sentence"
                : "one document carries the whole answer — blend the finished candidates"}
            </text>
            <text x={300} y={291} textAnchor="middle" style={SK} fontSize="9.5" fill={P.green}>written from scratch in log-space · matches `transformers` to |Δ| = 0.0e+00</text>
          </g>
        );
      }

      case "sweep": {
        const cur = RAG_KSWEEP[ki];
        /* One shared 0–80% scale for both series — they are both percentages, and
           putting them on separate axes would fake a crossover that isn't there. */
        const X = (i) => 96 + i * 96, Y = (v) => 214 - v * 1.95;
        return (
          <g>
            <text x={300} y={22} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>retrieve more documents · n = 96 questions, RAG-Token · both axes are %</text>
            {/* axes */}
            <line x1={80} y1={214} x2={532} y2={214} stroke={P.ink} strokeWidth="1.1" />
            <line x1={80} y1={52} x2={80} y2={214} stroke={P.ink} strokeWidth="1.1" />
            {[0, 20, 40, 60, 80].map((g) => (
              <g key={g}>
                <line x1={80} y1={Y(g)} x2={532} y2={Y(g)} stroke={P.line} strokeWidth="0.6" strokeDasharray="2 4" />
                <text x={74} y={Y(g) + 3} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>{g}</text>
              </g>
            ))}
            {/* recall line */}
            <path d={`M${RAG_KSWEEP.map((d, i) => `${X(i)} ${Y(d.rec)}`).join(" L")}`} fill="none" stroke={P.green} strokeWidth="1.6" />
            {RAG_KSWEEP.map((d, i) => <circle key={i} cx={X(i)} cy={Y(d.rec)} r={i === ki ? 5 : 3} fill={P.green} />)}
            {/* EM line with error bars */}
            <path d={`M${RAG_KSWEEP.map((d, i) => `${X(i)} ${Y(d.em)}`).join(" L")}`} fill="none" stroke={P.accent} strokeWidth="1.6" />
            {RAG_KSWEEP.map((d, i) => (
              <g key={i}>
                <line x1={X(i)} y1={Y(d.em - d.se)} x2={X(i)} y2={Y(d.em + d.se)} stroke={P.accent} strokeWidth="1" />
                <line x1={X(i) - 4} y1={Y(d.em + d.se)} x2={X(i) + 4} y2={Y(d.em + d.se)} stroke={P.accent} strokeWidth="1" />
                <line x1={X(i) - 4} y1={Y(d.em - d.se)} x2={X(i) + 4} y2={Y(d.em - d.se)} stroke={P.accent} strokeWidth="1" />
                <circle cx={X(i)} cy={Y(d.em)} r={i === ki ? 5 : 3} fill={P.accent} />
                <text x={X(i)} y={230} textAnchor="middle" style={SK} fontSize="9.5" fill={i === ki ? P.ink : P.sub}>k={d.k}</text>
              </g>
            ))}
            <text x={352} y={Y(74)} style={SK} fontSize="9.5" fill={P.green}>answer-recall@k — the retriever alone</text>
            <text x={92} y={Y(4)} style={SK} fontSize="9.5" fill={P.accent}>exact match — end to end, ±1 SE</text>
            {/* callout for the selected k */}
            <rect x={352} y={244} width={180} height={44} fill={P.paper2} stroke={P.accent} strokeWidth="1.2" />
            <text x={362} y={260} style={SK} fontSize="9.5" fill={P.accent}>k = {cur.k}</text>
            <text x={362} y={274} style={SK} fontSize="9" fill={P.ink}>EM {cur.em.toFixed(1)} ± {cur.se.toFixed(1)}  ·  recall {cur.rec.toFixed(1)}</text>
            <text x={80} y={260} style={SK} fontSize="9.5" fill={P.sub}>recall is monotone — more documents always help the retriever.</text>
            <text x={80} y={276} style={SK} fontSize="9.5" fill={P.red}>EM is not: every point carries ±4, and the paper's effect is 2–4 EM.</text>
            <text x={80} y={290} style={SK} fontSize="9" fontStyle="italic" fill={P.sub}>so the shape is reported as untested at this n, not as reproduced.</text>
          </g>
        );
      }

      case "retrievers": {
        /* Left: Fig 3 centre, recall@k for three retrievers — retrieval only.
           Right: EM at k=5, mine beside the paper's Table 6, same axis so the
           inverted ordering is visible rather than described. */
        const RX = (i) => 76 + i * 54, RY = (v) => 200 - v * 1.56;
        const BY = (v) => 200 - v * 3.1;
        return (
          <g>
            <text x={300} y={20} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>same generator in every row · only the retriever changes</text>

            {/* ── recall@k, three retrievers ── */}
            <text x={62} y={38} style={SK} fontSize="9" fill={P.ink}>answer-recall@k — no generator involved</text>
            <line x1={62} y1={200} x2={306} y2={200} stroke={P.ink} strokeWidth="1.1" />
            <line x1={62} y1={44} x2={62} y2={200} stroke={P.ink} strokeWidth="1.1" />
            {[0, 25, 50, 75, 100].map((g) => (
              <g key={g}>
                <line x1={62} y1={RY(g)} x2={306} y2={RY(g)} stroke={P.line} strokeWidth="0.6" strokeDasharray="2 4" />
                <text x={57} y={RY(g) + 3} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>{g}</text>
              </g>
            ))}
            {RAG_RECALL_CURVES.map((c) => (
              <g key={c.name}>
                <path d={`M${c.rec.map((v, i) => `${RX(i)} ${RY(v)}`).join(" L")}`} fill="none" stroke={c.col} strokeWidth="1.7" />
                {c.rec.map((v, i) => <circle key={i} cx={RX(i)} cy={RY(v)} r="2.8" fill={c.col} />)}
              </g>
            ))}
            {RAG_KSWEEP.map((d, i) => (
              <text key={d.k} x={RX(i)} y={212} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>k={d.k}</text>
            ))}
            {RAG_RECALL_CURVES.map((c, i) => (
              <g key={c.name} transform={`translate(64 ${228 + i * 14})`}>
                <line x1={0} y1={-3} x2={14} y2={-3} stroke={c.col} strokeWidth="1.7" />
                <circle cx={7} cy={-3} r="2.8" fill={c.col} />
                <text x={20} y={0} style={SK} fontSize="8.5" fill={P.sub}>{c.name}</text>
              </g>
            ))}

            {/* ── EM at k=5, mine vs the paper ── */}
            <text x={350} y={38} style={SK} fontSize="9" fill={P.ink}>exact match at k=5 · mine vs paper Table 6</text>
            <line x1={350} y1={200} x2={586} y2={200} stroke={P.ink} strokeWidth="1.1" />
            <line x1={350} y1={44} x2={350} y2={200} stroke={P.ink} strokeWidth="1.1" />
            {[0, 20, 40].map((g) => (
              <g key={g}>
                <line x1={350} y1={BY(g)} x2={586} y2={BY(g)} stroke={P.line} strokeWidth="0.6" strokeDasharray="2 4" />
                <text x={345} y={BY(g) + 3} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>{g}</text>
              </g>
            ))}
            {RAG_ABLATION.map((r, i) => {
              const gx = 360 + i * 57;
              return (
                <g key={r.label}>
                  <rect x={gx} y={BY(r.em)} width={20} height={200 - BY(r.em)} fill={P.accent} fillOpacity="0.85" />
                  <text x={gx + 10} y={BY(r.em) - 4} textAnchor="middle" style={SK} fontSize="8" fill={P.accent}>{r.em.toFixed(1)}</text>
                  {r.paper !== null ? (
                    <>
                      <rect x={gx + 22} y={BY(r.paper)} width={20} height={200 - BY(r.paper)} fill={P.sub} fillOpacity="0.28" stroke={P.sub} strokeWidth="0.7" />
                      <text x={gx + 32} y={BY(r.paper) - 4} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>{r.paper.toFixed(1)}</text>
                    </>
                  ) : (
                    <text x={gx + 32} y={196} textAnchor="middle" style={SK} fontSize="8" fill={P.line}>n/a</text>
                  )}
                  <text x={gx + 21} y={212} textAnchor="middle" style={SK} fontSize="8.5" fill={P.ink}>{r.label}</text>
                </g>
              );
            })}
            <g transform="translate(352 226)">
              <rect x={0} y={-7} width={11} height={9} fill={P.accent} fillOpacity="0.85" />
              <text x={16} y={1} style={SK} fontSize="8.5" fill={P.sub}>mine — SQuAD-dev, 15k index</text>
              <rect x={0} y={7} width={11} height={9} fill={P.sub} fillOpacity="0.28" stroke={P.sub} strokeWidth="0.7" />
              <text x={16} y={15} style={SK} fontSize="8.5" fill={P.sub}>paper — NQ dev, 21M index</text>
            </g>

            <line x1={24} y1={262} x2={576} y2={262} stroke={P.line} strokeWidth="0.8" />
            <text x={300} y={277} textAnchor="middle" style={SK} fontSize="10" fill={P.red}>the ordering inverts: BM25 44.8 &gt; learned DPR 24.0 ≈ frozen DPR 22.9</text>
            <text x={300} y={292} textAnchor="middle" style={SK} fontSize="9.5" fontStyle="italic" fill={P.sub}>SQuAD questions share rare words with their paragraph, and 15k passages rarely force a disambiguation</text>
          </g>
        );
      }

      case "evidence": {
        const EY = (v) => 230 - v * 3.4;
        const cols = [
          { x: 36, d: RAG_EVIDENCE.with, filled: true, cap: "answer IS somewhere in the top-5", col: P.accent },
          { x: 320, d: RAG_EVIDENCE.without, filled: false, cap: "answer is in NO retrieved document", col: P.red },
        ];
        return (
          <g>
            <text x={300} y={18} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>the same 96 questions, split by whether the evidence was ever retrieved</text>

            {cols.map((c) => (
              <g key={c.x}>
                {/* one square per question */}
                {Array.from({ length: c.d.n }).map((_, i) => (
                  <rect key={i} x={c.x + i * 5.5} y={32} width={4.4} height={11}
                    fill={c.filled ? c.col : "none"} fillOpacity={c.filled ? 0.7 : 0}
                    stroke={c.col} strokeWidth="0.7" />
                ))}
                <text x={c.x} y={57} style={SK} fontSize="9" fill={P.ink}>{c.cap} — {c.d.n} questions</text>

                {/* EM for that half */}
                <rect x={c.x + 96} y={EY(c.d.em)} width={72} height={230 - EY(c.d.em)} fill={c.col} fillOpacity="0.8" />
                <text x={c.x + 132} y={EY(c.d.em) - 6} textAnchor="middle" style={SK} fontSize="11" fill={c.col}>EM {c.d.em.toFixed(1)}</text>
              </g>
            ))}

            {/* shared axis */}
            <line x1={36} y1={230} x2={584} y2={230} stroke={P.ink} strokeWidth="1.1" />
            {[0, 20, 40].map((g) => (
              <g key={g}>
                <line x1={36} y1={EY(g)} x2={584} y2={EY(g)} stroke={P.line} strokeWidth="0.6" strokeDasharray="2 4" />
                <text x={31} y={EY(g) + 3} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>{g}</text>
              </g>
            ))}

            {/* the paper's number, on the right-hand half */}
            <line x1={396} y1={EY(RAG_EVIDENCE.paper)} x2={584} y2={EY(RAG_EVIDENCE.paper)} stroke={P.sub} strokeWidth="1.2" strokeDasharray="5 3" />
            <text x={584} y={EY(RAG_EVIDENCE.paper) - 5} textAnchor="end" style={SK} fontSize="8.5" fill={P.sub}>paper: {RAG_EVIDENCE.paper}% on NQ</text>
            <text x={492} y={244} textAnchor="middle" style={SK} fontSize="8.5" fill={P.line}>an extractive reader sits on this line — 0 by construction</text>

            <text x={24} y={264} style={SK} fontSize="9.5" fill={P.ink}>the one that was right with nothing retrieved:</text>
            <text x={24} y={278} style={SK} fontSize="9" fontStyle="italic" fill={P.sub}>“{RAG_EVIDENCE.example.q}” → “{RAG_EVIDENCE.example.pred}”</text>
            <text x={24} y={293} style={SK} fontSize="9.5" fill={P.red}>non-zero, as the paper claims — but 1 question in 48, not 11.8%</text>
          </g>
        );
      }

      case "gradient": {
        const GX0 = 330, GY0 = 250, GW = 200, GH = 88;
        const tx = (s) => GX0 + (s / 25) * GW, ty = (v) => GY0 - (v / 0.4) * GH;
        return (
          <g>
            <text x={300} y={22} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>the label is on the answer · the credit leaks backwards onto the passage</text>
            {/* forward chain */}
            {box(24, 48, 84, 34, "BERT_q  ✎", "trainable", P.accent)}
            {arrow(108, 65, 138, 65)}
            {box(140, 48, 76, 34, "p_η(z|x)", "trust", P.accent)}
            {arrow(216, 65, 246, 65)}
            {box(248, 48, 60, 34, "z₁…z_k", null, P.ink)}
            {arrow(308, 65, 338, 65)}
            {box(340, 48, 68, 34, "BART", "p_θ(y|x,z)", P.ink)}
            {arrow(408, 65, 438, 65)}
            <rect x={440} y={48} width={104} height={34} fill={P.faint} stroke={P.ink} strokeWidth="1.2" />
            <text x={492} y={62} textAnchor="middle" style={SK} fontSize="9.5" fill={P.ink}>loss on y only</text>
            <text x={492} y={75} textAnchor="middle" style={SK} fontSize="8.5" fill={P.red}>“Ernest Hemingway”</text>
            {/* backward path */}
            <path d="M492 88 L492 108 L66 108 L66 86" stroke={P.red} strokeWidth="1.4" fill="none" strokeDasharray="5 3" />
            <path d="M62 94 L66 86 L70 94" stroke={P.red} strokeWidth="1.4" fill="none" />
            <text x={280} y={122} textAnchor="middle" style={SK} fontSize="9.5" fill={P.red}>∂loss/∂η ≠ 0 — because p_η is a factor in p(y|x)</text>
            <text x={280} y={136} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.sub}>no passage was ever labelled relevant</text>
            <line x1={24} y1={150} x2={576} y2={150} stroke={P.line} strokeWidth="0.8" />
            <text x={24} y={172} style={SK} fontSize="10" fill={P.ink}>‖∂ loss / ∂(query encoder)‖ = 6.6e+01</text>
            <text x={24} y={192} style={SK} fontSize="9.5" fill={P.sub}>25 steps · 8 questions · answer</text>
            <text x={24} y={205} style={SK} fontSize="9.5" fill={P.sub}>strings are the only supervision</text>
            <text x={24} y={228} style={SK} fontSize="9.5" fill={P.green}>❄ document tower and index</text>
            <text x={24} y={241} style={SK} fontSize="9.5" fill={P.green}>stay frozen — that is what makes</text>
            <text x={24} y={254} style={SK} fontSize="9.5" fill={P.green}>this affordable (REALM re-indexed)</text>
            {/* trust curve */}
            <line x1={GX0} y1={GY0} x2={GX0 + GW} y2={GY0} stroke={P.ink} strokeWidth="1" />
            <line x1={GX0} y1={GY0 - GH} x2={GX0} y2={GY0} stroke={P.ink} strokeWidth="1" />
            <text x={GX0 - 6} y={ty(0.4) + 3} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>0.40</text>
            <text x={GX0 - 6} y={GY0 + 3} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>0</text>
            <path d={`M${RAG_TRUST_CURVE.map(([s, v]) => `${tx(s)} ${ty(v)}`).join(" L")}`} fill="none" stroke={P.accent} strokeWidth="1.8" />
            {RAG_TRUST_CURVE.map(([s, v], i) => <circle key={i} cx={tx(s)} cy={ty(v)} r="3" fill={P.accent} />)}
            <text x={tx(0) + 6} y={ty(0.097) + 14} style={SK} fontSize="9" fill={P.sub}>0.097</text>
            <text x={tx(25) - 6} y={ty(0.354) - 8} textAnchor="end" style={SK} fontSize="9" fill={P.accent}>0.354</text>
            <text x={GX0 + GW / 2} y={GY0 + 14} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>training step  0 → 25</text>
            <text x={GX0 + GW / 2} y={GY0 + 30} textAnchor="middle" style={SK} fontSize="9.5" fill={P.ink}>trust in the passage that holds the answer</text>
            <text x={GX0 + GW / 2} y={GY0 + 44} textAnchor="middle" style={SK} fontSize="9" fontStyle="italic" fill={P.accent}>it rose without anyone saying which passage was right</text>
          </g>
        );
      }

      case "swap":
        return (
          <g>
            <text x={300} y={24} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>same weights in both columns · the only difference is a 3 × 768 array</text>
            {[0, 1].map((c) => {
              const x = c === 0 ? 40 : 320;
              const yr = c === 0 ? "2016 index" : "2020 index";
              const ans = c === 0
                ? ["barack obama", "theresa may", "angela merkel"]
                : ["donald trump", "boris johnson", "angela merkel"];
              return (
                <g key={c}>
                  <rect x={x} y={44} width={240} height={196} fill={P.paper2} stroke={c === 0 ? P.line : P.accent} strokeWidth="1.3" />
                  <rect x={x} y={44} width={240} height={22} fill={c === 0 ? P.faint : P.accentSoft} />
                  <text x={x + 120} y={59} textAnchor="middle" style={SK} fontSize="10" fill={c === 0 ? P.sub : P.accent}>{yr}</text>
                  {vec(x + 16, 76, 34, c * 40 + 7, c === 0 ? P.sub : P.accent, 6, 12)}
                  <text x={x + 120} y={104} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>D — 3 passages of text</text>
                  {["US President?", "UK Prime Minister?", "German Chancellor?"].map((q, i) => (
                    <g key={i} transform={`translate(${x + 16} ${122 + i * 38})`}>
                      <text x={0} y={10} style={SK} fontSize="8.5" fill={P.sub}>{q}</text>
                      <rect x={0} y={16} width={208} height={18} fill={i === 2 ? P.faint : (c === 0 ? P.faint : P.accentSoft)} stroke={i === 2 ? P.line : (c === 0 ? P.line : P.accent)} strokeWidth="0.9" />
                      <text x={8} y={29} style={SK} fontSize="9.5" fill={i === 2 ? P.sub : (c === 0 ? P.ink : P.accent)}>{ans[i]}</text>
                      {i !== 2 && c === 1 && <text x={150} y={29} style={SK} fontSize="8" fill={P.green}>changed</text>}
                    </g>
                  ))}
                </g>
              );
            })}
            {arrow(284, 142, 314, 142)}
            <text x={299} y={132} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>swap</text>
            <text x={300} y={262} textAnchor="middle" style={SK} fontSize="10.5" fill={P.ink}>no fine-tuning · no gradient · no weight moved</text>
            <text x={300} y={283} textAnchor="middle" style={SK} fontSize="10" fontStyle="italic" fill={P.green}>a parametric model would need retraining to learn that a head of state changed</text>
          </g>
        );

      case "verdict": {
        const rows = [
          ["Eq (1) & (2) from scratch match `transformers`", "|Δ| = 0.0e+00", "ok"],
          ["retrieval beats closed book (same generator)", "1.0 ± 1.0  →  24.0 ± 4.4 EM", "ok"],
          ["retrieval beats *random* passages", "2.1 ± 1.5  →  24.0 ± 4.4 EM", "ok"],
          ["answer-recall@k rises monotonically with k", "26 → 36 → 50 → 61 → 71", "ok"],
          ["answer-only loss moves the retriever", "‖g‖ = 6.6e+01 · trust 0.097 → 0.354", "ok"],
          ["index hot-swap changes knowledge, no retraining", "2016 → 2020, weights untouched", "ok"],
          ["retriever has not collapsed (Appendix H)", "427 distinct docs / 480 slots", "ok"],
          ["right even with no evidence retrieved (extractive: 0%)", "2.1% of 48 · paper 11.8%", "ok"],
          ["learned DPR > frozen DPR (paper 43.5 vs 37.8)", "24.0 ± 4.4  vs  22.9 ± 4.3 EM", "mid"],
          ["EM shape differs between the variants (Fig 3)", "tok peaks k=5, seq peaks k=1", "mid"],
          ["learned DPR > BM25 (paper 43.5 vs 29.7)", "24.0 ± 4.4  vs  44.8 ± 5.1 EM", "bad"],
          ["RAG-Sequence ≥ RAG-Token on short factoids", "0.0 ± 0.0  vs  22.9 ± 6.1 EM", "bad"],
        ];
        const col = { ok: P.green, mid: P.yellow, bad: P.red };
        const mark = { ok: "✓", mid: "~", bad: "✗" };
        return (
          <g>
            <text x={300} y={18} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>{rows.length} claims from the paper, checked against my own measurements</text>
            {rows.map((r, i) => (
              <g key={i} transform={`translate(0 ${28 + i * 18})`}>
                <rect x={24} y={0} width={552} height={16} fill={i % 2 ? P.faint : "transparent"} fillOpacity="0.6" />
                <text x={34} y={12} style={SK} fontSize="10.5" fill={col[r[2]]}>{mark[r[2]]}</text>
                <text x={52} y={12} style={SK} fontSize="9.5" fill={P.ink}>{r[0]}</text>
                <text x={568} y={12} textAnchor="end" style={SK} fontSize="9.5" fill={col[r[2]]}>{r[1]}</text>
              </g>
            ))}
            <line x1={24} y1={252} x2={576} y2={252} stroke={P.line} strokeWidth="0.8" />
            <text x={24} y={268} style={SK} fontSize="9.5" fill={P.red}>BM25 winning is the interesting one: DPR was fine-tuned on NaturalQuestions,</text>
            <text x={24} y={283} style={SK} fontSize="9.5" fill={P.sub}>my questions are SQuAD, and word overlap is strong when the haystack is only 15k.</text>
          </g>
        );
      }
      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };
  const N = RAG_STEPS.length;
  const pill = (on) => ({ ...SK, fontSize: "0.7rem", padding: "2px 10px", cursor: "pointer", border: `1px solid ${on ? P.accent : P.line}`, background: on ? P.accentSoft : P.paper2, color: on ? P.accent : P.sub });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>rebuilt on a laptop · 15,077 passages · every number measured</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {N}</span>
          <button onClick={() => setStep((step + N - 1) % N)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % N)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      {sk === "marginalise" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub }}>variant:</span>
          <button onClick={() => setVariant("token")} style={pill(variant === "token")}>RAG-Token — Eq (2)</button>
          <button onClick={() => setVariant("sequence")} style={pill(variant === "sequence")}>RAG-Sequence — Eq (1)</button>
        </div>
      )}

      {sk === "sweep" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub }}>documents retrieved:</span>
          {RAG_KSWEEP.map((d, j) => (
            <button key={d.k} onClick={() => setKi(j)} style={pill(j === ki)}>k = {d.k}</button>
          ))}
        </div>
      )}

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`RAG walkthrough step ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {RAG_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MEMORYBANK — the memory that forgets.
   NTM and RAG blend memories, MemGPT pages them; none of them ever let one
   go. MemoryBank's novelty is a forgetting policy borrowed from psychology —
   the Ebbinghaus curve — so the whole sketch builds to an interactive R = e^(−t/S).
   ════════════════════════════════════════ */
const MB_STEPS = [
  {
    key: "store",
    label: "three-tier storage",
    title: "Memory kept at three levels of abstraction",
    body: "Before anything can be recalled it has to be stored — and MemoryBank stores more than a flat transcript. Every turn is written verbatim with a timestamp; those turns are distilled into a daily event summary and then a global one (a hierarchy — the way you keep the gist of a day, not every sentence); and a running user portrait is re-summarised from the whole history. Retrieval and forgetting both act on these pieces.",
    math: "M = { timestamped dialogue · event summary: daily → global · user portrait }",
  },
  {
    key: "retrieve",
    label: "dense retrieval",
    title: "Recall is nearest-neighbour search",
    body: "The mechanism here is deliberately ordinary — the same dual-tower dense retrieval RAG uses. Every memory piece m is pre-encoded once into a vector hₘ and indexed with FAISS. The current conversation is encoded into a query h_c, and the closest memories are pulled back into the prompt. Nothing novel yet; the novelty is what happens to a memory between recalls.",
    math: "h_c = E(context) ·  recall = argmaxₘ  h_cᵀ hₘ   (FAISS index)",
  },
  {
    key: "forget",
    label: "the forgetting curve",
    title: "The novelty — memory that decays, and firms up when used",
    body: "This is what sets MemoryBank apart from everything else on this shelf. It borrows Ebbinghaus' forgetting curve: a memory's retention R falls off exponentially with the time t since it was last touched, governed by a strength S. Each time a memory is recalled, S goes up by one and t resets to zero — so a memory you keep using flattens its own decay and persists, while one you never revisit slides under the threshold and is let go. Forgetting stops being an accident of a full context window and becomes a deliberate, human-like policy. Drag the clock forward, then hit recall, and watch it happen.",
    math: "R = e^(−t / S)      on recall:  S ← S + 1,  t ← 0",
  },
];

export function MemoryBankWalkthrough() {
  const [step, setStep] = useState(0);
  const [S, setS] = useState(1);      // memory strength — bumped on each recall
  const [t, setT] = useState(6);      // days elapsed since last recall
  const sc = MB_STEPS[step];
  const sk = sc.key;

  const arrow = (x1, y1, x2, y2, col, dash) => (
    <g stroke={col || P.accent} strokeWidth="1.3" fill="none">
      <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
      <path d={`M${x2 - 7} ${y2 - 4} L${x2} ${y2} L${x2 - 7} ${y2 + 4}`} />
    </g>
  );
  const box = (x, y, w, h, label, sub, col) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={P.paper2} stroke={col || P.ink} strokeWidth="1.2" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 1 : h / 2 + 4)} textAnchor="middle" style={SK} fontSize="10" fill={col || P.ink}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>{sub}</text>}
    </g>
  );
  const vec = (x, y, n, seed, col, w = 5, h = 13) => (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const v = ((Math.sin((i + seed) * 12.9898) * 43758.5453) % 1 + 1) % 1;
        return <rect key={i} x={x + i * w} y={y} width={w - 0.8} height={h} fill={col} fillOpacity={0.12 + v * 0.72} stroke={P.line} strokeWidth="0.3" />;
      })}
    </g>
  );

  /* forgetting-curve plot transforms */
  const PX0 = 92, PX1 = 560, PY0 = 250, PY1 = 44, TMAX = 15;
  const X = (tt) => PX0 + (tt / TMAX) * (PX1 - PX0);
  const Y = (R) => PY0 - R * (PY0 - PY1);
  const curveOf = (s) => Array.from({ length: 61 }, (_, i) => { const tt = (i / 60) * TMAX; return `${X(tt)} ${Y(Math.exp(-tt / s))}`; }).join(" L");
  const Rnow = Math.exp(-t / S);
  const THR = 0.3;

  const body = (() => {
    switch (sk) {
      case "store":
        return (
          <g>
            <text x={300} y={20} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>past interactions, kept at three levels of abstraction</text>
            {[
              { y: 40, t: "raw dialogue · timestamped", a: "04-28  “tomorrow is my GF's birthday”", b: "04-29  “she likes art books and parks”" },
              { y: 112, t: "event summary · daily → global", a: "gift & book ideas · a visit to the park", b: "condensed nightly, then rolled up" },
              { y: 184, t: "user portrait", a: "open-minded, curious,", b: "receptive to advice" },
            ].map((r, i) => (
              <g key={i}>
                <rect x={26} y={r.y} width={232} height={60} fill={P.paper2} stroke={P.ink} strokeWidth="1.1" />
                <rect x={26} y={r.y} width={232} height={18} fill={P.accentSoft} />
                <text x={34} y={r.y + 13} style={SK} fontSize="9.3" fill={P.accent}>{r.t}</text>
                <text x={34} y={r.y + 34} style={SK} fontSize="8.6" fill={P.ink}>{r.a}</text>
                <text x={34} y={r.y + 50} style={SK} fontSize="8.6" fill={P.sub}>{r.b}</text>
                {arrow(262, r.y + 30, 422, 140, P.line, true)}
              </g>
            ))}
            <rect x={426} y={52} width={148} height={188} fill={P.paper2} stroke={P.accent} strokeWidth="1.3" />
            <rect x={426} y={52} width={148} height={22} fill={P.accentSoft} />
            <text x={500} y={67} textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>Memory Storage  M</text>
            {Array.from({ length: 7 }).map((_, r) => (
              <g key={r}>{Array.from({ length: 14 }).map((_, c2) => {
                const v = ((Math.sin((r * 14 + c2 + 3) * 12.9898) * 43758.5453) % 1 + 1) % 1;
                return <rect key={c2} x={440 + c2 * 8.4} y={86 + r * 20} width={7.4} height={13} fill={P.accent} fillOpacity={0.12 + v * 0.6} stroke={P.line} strokeWidth="0.3" />;
              })}</g>
            ))}
            <text x={500} y={232} textAnchor="middle" style={SK} fontSize="8.3" fill={P.sub}>each piece pre-encoded to a vector</text>
          </g>
        );

      case "retrieve":
        return (
          <g>
            <text x={300} y={20} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>“do you remember the gifts she likes?”  —  recall = nearest neighbour</text>
            <rect x={28} y={48} width={196} height={22} fill={P.faint} stroke={P.line} strokeWidth="1" />
            <text x={126} y={63} textAnchor="middle" style={SK} fontSize="9.3" fill={P.ink}>current context  c</text>
            {arrow(126, 72, 126, 92)}
            {box(70, 94, 112, 30, "E( · )", "query encoder", P.accent)}
            {arrow(126, 124, 126, 148)}
            <text x={126} y={142} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>h_c</text>
            {vec(72, 150, 20, 9, P.accent, 5.5, 13)}
            <text x={430} y={40} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>M — every memory piece, pre-encoded, in FAISS</text>
            {Array.from({ length: 8 }).map((_, r) => (
              <g key={r}>
                {vec(322, 50 + r * 22, 30, r * 13 + 2, r === 3 ? P.accent : P.ink, 6, 14)}
                {r === 3 && <rect x={320} y={48 + r * 22} width={186} height={18} fill="none" stroke={P.accent} strokeWidth="1.4" />}
              </g>
            ))}
            <path d="M196 168 Q290 182 318 130" stroke={P.accent} strokeWidth="1.2" fill="none" strokeDasharray="4 3" />
            <text x={214} y={206} style={SK} fontSize="9" fill={P.accent}>h_cᵀhₘ  →  top match</text>
            <text x={512} y={131} textAnchor="middle" style={SK} fontSize="8.6" fill={P.accent}>recalled</text>
            <text x={300} y={280} textAnchor="middle" style={SK} fontSize="10" fontStyle="italic" fill={P.sub}>a dual-tower dense retriever — the same mechanism RAG uses (DPR). The novelty is next.</text>
          </g>
        );

      case "forget": {
        const ghosts = [1, 2, 4].filter((s) => s !== S);
        return (
          <g>
            <line x1={PX0} y1={PY1} x2={PX0} y2={PY0} stroke={P.ink} strokeWidth="1.1" />
            <line x1={PX0} y1={PY0} x2={PX1} y2={PY0} stroke={P.ink} strokeWidth="1.1" />
            {[0, 0.25, 0.5, 0.75, 1].map((r) => (
              <g key={r}>
                <line x1={PX0} y1={Y(r)} x2={PX1} y2={Y(r)} stroke={P.line} strokeWidth="0.5" strokeDasharray="2 4" />
                <text x={PX0 - 6} y={Y(r) + 3} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>{r.toFixed(2)}</text>
              </g>
            ))}
            {[0, 5, 10, 15].map((tt) => (
              <text key={tt} x={X(tt)} y={PY0 + 14} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>{tt}</text>
            ))}
            <text x={(PX0 + PX1) / 2} y={PY0 + 28} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>days since last recall  ·  t</text>
            <text x={PX0 - 34} y={PY1 - 6} style={SK} fontSize="8.5" fill={P.sub}>retention R</text>

            <line x1={PX0} y1={Y(THR)} x2={PX1} y2={Y(THR)} stroke={P.red} strokeWidth="1" strokeDasharray="5 3" />
            <text x={PX1 - 4} y={Y(THR) - 4} textAnchor="end" style={SK} fontSize="8.3" fill={P.red}>below here, the memory is let go</text>

            {ghosts.map((s) => (
              <path key={s} d={`M${curveOf(s)}`} fill="none" stroke={P.sub} strokeWidth="1" strokeOpacity="0.26" />
            ))}
            <path d={`M${curveOf(S)}`} fill="none" stroke={P.accent} strokeWidth="2" />
            <text x={X(TMAX) - 2} y={Y(Math.exp(-TMAX / S)) - 5} textAnchor="end" style={SK} fontSize="9" fill={P.accent}>S = {S}</text>

            <line x1={X(t)} y1={Y(Rnow)} x2={X(t)} y2={PY0} stroke={P.accent} strokeWidth="0.9" strokeDasharray="3 3" />
            <circle cx={X(t)} cy={Y(Rnow)} r="5" fill={Rnow < THR ? P.red : P.accent} />
            <text x={X(t) + (t > 12 ? -8 : 8)} y={Y(Rnow) - 6} textAnchor={t > 12 ? "end" : "start"} style={SK} fontSize="9.5" fill={Rnow < THR ? P.red : P.accent}>R = {Rnow.toFixed(2)}</text>
            <text x={PX0 + 6} y={PY1 + 4} style={SK} fontSize="9" fontStyle="italic" fill={Rnow < THR ? P.red : P.green}>{Rnow < THR ? "forgotten — unused too long" : "retained"}</text>
          </g>
        );
      }

      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };
  const N = MB_STEPS.length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>MemoryBank · Zhong et al. 2023 · a 140-year-old forgetting curve, put to work in an LLM</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {N}</span>
          <button onClick={() => setStep((step + N - 1) % N)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % N)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      {sk === "forget" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub }}>let time pass:</span>
          <input type="range" min={0} max={15} step={1} value={t} onChange={(e) => setT(+e.target.value)} aria-label="days since last recall" style={{ accentColor: P.accent, width: 150 }} />
          <span style={{ ...SK, fontSize: "0.66rem", color: P.ink, minWidth: 48 }}>t = {t} d</span>
          <button onClick={() => { setS((s) => Math.min(s + 1, 8)); setT(0); }} style={{ ...SK, fontSize: "0.68rem", padding: "3px 11px", cursor: "pointer", border: `1px solid ${P.accent}`, background: P.accentSoft, color: P.accent }}>recall now · S+1, t→0</button>
          <button onClick={() => { setS(1); setT(6); }} style={{ ...SK, fontSize: "0.68rem", padding: "3px 11px", cursor: "pointer", border: `1px solid ${P.line}`, background: P.paper2, color: P.sub }}>reset</button>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.ink }}>strength S = {S} · R = {Rnow.toFixed(2)}</span>
        </div>
      )}

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`MemoryBank walkthrough step ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {MB_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MOVIECHAT — Song et al. 2023, rebuilt in MovieChat_repro.ipynb.
   The shelf's other memories decide *what to keep*; this one is the first
   that has to decide what to keep from a stream it can't afford to hold at
   all. Every number in steps 5–6 is measured in that notebook on an M5, not
   quoted from the paper.
   ════════════════════════════════════════ */

/* §6 sweep — stored-token memory, exact byte accounting, verified against
   real allocated tensor bytes at every N. */
const MC_SCALING = [
  { n: 100, dense: 57.7, comp: 3.12, mc: 0.375, kept: 12 },
  { n: 167, dense: 96.4, comp: 5.22, mc: 0.562, kept: 18 },
  { n: 278, dense: 160.4, comp: 8.69, mc: 0.938, kept: 30 },
  { n: 464, dense: 267.8, comp: 14.50, mc: 1.562, kept: 50 },
  { n: 774, dense: 446.7, comp: 24.19, mc: 2.562, kept: 82 },
  { n: 1292, dense: 745.7, comp: 40.38, mc: 4.250, kept: 136 },
  { n: 2154, dense: 1243.2, comp: 67.31, mc: 7.125, kept: 228 },
  { n: 3594, dense: 2074.3, comp: 112.31, mc: 8.000, kept: 256 },
  { n: 5995, dense: 3460.0, comp: 187.34, mc: 8.000, kept: 256 },
  { n: 10000, dense: 5771.5, comp: 312.50, mc: 8.000, kept: 256 },
];

/* A 24-frame clip with three scenes — the toy version of §7's 320-frame,
   8-scene test. Each frame carries one scalar standing in for its token
   block; adjacent similarity is a falling exponential in the gap, so it
   sits near 0.95 inside a scene and near 0.05 across a cut, the same shape
   the real encoder produced (0.986 vs 0.701). */
const MC_CUTS = [10, 16];
const MC_FRAMES = Array.from({ length: 24 }, (_, i) => {
  const scene = i < MC_CUTS[0] ? 0 : i < MC_CUTS[1] ? 1 : 2;
  const jit = ((Math.sin((i + 1) * 12.9898) * 43758.5453) % 1 + 1) % 1;
  return { i, scene, v: [0.18, 1.0, 1.86][scene] + (jit - 0.5) * 0.07 };
});
const MC_SIM = (a, b) => Math.exp(-Math.abs(a - b) / 0.32);
const MC_ADJ = MC_FRAMES.slice(0, -1).map((f, i) => MC_SIM(f.v, MC_FRAMES[i + 1].v));

/* Algorithm 1, verbatim: while too many frames, find the most-similar
   adjacent pair and replace it with their size-weighted average. */
function mcConsolidate(target) {
  let g = MC_FRAMES.map((f) => ({ v: f.v, n: 1, scenes: [f.scene] }));
  while (g.length > target) {
    let at = 0, best = -1;
    for (let i = 0; i < g.length - 1; i++) {
      const s = MC_SIM(g[i].v, g[i + 1].v);
      if (s > best) { best = s; at = i; }
    }
    const a = g[at], b = g[at + 1];
    g.splice(at, 2, {
      v: (a.v * a.n + b.v * b.n) / (a.n + b.n),
      n: a.n + b.n,
      scenes: [...new Set([...a.scenes, ...b.scenes])],
    });
  }
  return g;
}

const MC_STEPS = [
  {
    key: "encode", label: "one frame at a time",
    title: "The encoder is deliberately blind to time",
    body: "The first surprise is what MovieChat doesn't use. No video backbone — no ViViT, no Video-Swin. Every frame goes through a plain image encoder alone: ViT-G/14 cuts a 224×224 frame into 14-pixel patches (16 across, 16 down = 256 patches), and BLIP-2's Q-former squeezes those 256 down to a fixed 32 tokens. Two different sixteens live here and they are unrelated — 16 patches per side is spatial, inside one frame; the sliding window of 16 frames is temporal, and it is only the scoop size. Each of those 16 frames is still encoded on its own, so the encoder never learns that frame 5 followed frame 4. That is the architectural bet: the encoder owns space, and memory owns time.",
    math: "frame → ViT-G/14 → 256 patches → Q-former → 32 tokens   ·   window = 16 frames/slide, each encoded alone",
  },
  {
    key: "short", label: "short-term FIFO",
    title: "A tray that holds 18 frames and no more",
    body: "Short-term memory is the least clever part and it needs to be. It is a fixed FIFO of 18 frames × 32 tokens, stored dense and uncompressed — nothing is merged, averaged or thrown away while a frame sits here. The window slides, 16 new frames arrive, the tray overflows, and the oldest frames fall out the far end. Falling out is not deletion: it is the trigger for consolidation. Everything expensive in this architecture happens at the moment a frame leaves the tray, which is why the buffer itself can stay stupid.",
    math: "S = FIFO(K = 18 frames × 32 tokens, dense)   ·   overflow → consolidate, never discard",
  },
  {
    key: "merge", label: "consolidation",
    title: "Dense tokens → sparse memory: merge the pair that looks most alike",
    body: "This is the paper. Consecutive video frames are nearly identical — thirty frames of someone standing still is thirty copies of one picture — so the evicted frames are compressed by merging, not sampling. Compute the frame-to-frame similarity (Eq. 3: the mean over tokens of the per-token cosine), greedily merge the most-similar adjacent pair with a size-weighted average so a slot standing for forty frames isn't outvoted by a fresh one, and repeat until the count hits the target. Parameter-free and training-free — there is nothing to learn. Drag the target down and watch what it eats: the flat stretches inside a scene collapse first, and the cuts survive to the very end, because a cut is exactly where the similarity is lowest.",
    math: "while |S| > R_L:  m = argmaxᵢ sim(xᵢ, xᵢ₊₁);  xₘ ← (nₘxₘ + nₘ₊₁xₘ₊₁)/(nₘ + nₘ₊₁)",
  },
  {
    key: "modes", label: "two read paths",
    title: "Ask about the film, or ask about one moment in it",
    body: "One memory, read two ways. In global mode the question is about the whole video, so the video representation is long-term memory — the sparse, merged summary and nothing else. In breakpoint mode the question is about a specific instant t, where the merged summary has by construction thrown away the local detail you're asking about — so long-term memory, the dense short-term tray and the current frame feature are concatenated. No fusion module: §3.3 concatenates and it works. Either way the result passes through the Q-former and a projection into the LLM, which never sees a frame — only tokens that memory decided were worth keeping.",
    math: "global:  V = L        breakpoint:  V = [L ; S ; xₜ]        →  Q-former → projection → LLM",
  },
  {
    key: "scaling", label: "the flat line",
    title: "The line that stops climbing",
    body: "I rebuilt the memory manager and swept it against two baselines on the same frame stream. The second baseline is the one that matters: it keeps every frame but at MovieChat's own 32×256 footprint, so the flat line gets credited to the memory manager rather than to the token bottleneck. Both effects are real and they are shown apart. MovieChat saturates at 8.00 MB / 256 frames by ~3,600 frames and then does not move — 721× under the dense pipeline at 10k frames, and the gap widens with every frame after. The hard bound is arithmetic, not empirical: K + L_cap = 18 + 256 = 274 frames = 8.56 MB, whatever you feed it. Dense hits a 24 GB budget at 42,582 frames, about 24 minutes of 30 fps video. MovieChat cannot reach it.",
    math: "MovieChat ≤ (K + L_cap) × 32 × 256 × 4 B = 8.56 MB   ·   dense crosses 24 GB at 42,582 frames",
  },
  {
    key: "verdict", label: "the verdict",
    title: "What held up, and where I deviated",
    body: "Compression is worthless if it merges across a cut, so §7 tested that with a real pretrained ViT-B/16 over 320 frames and 8 scenes: 20× compression, and 0 of the 16 retained slots mix frames from more than one scene, with all 8 scenes still represented. The check I trust most is the one the algorithm can't see — raw-pixel SSIM, never touched by the merge rule, agrees on where the cuts are, and the embeddings separate scenes about twice as sharply as pixels do (0.285 vs 0.134), which is why merging in token space works at all. Two deviations, both deliberate: I cap long-term memory where the paper instead stretches its positional encodings, since capping is what makes the bound provable, and my default clears the short-term tray after consolidation rather than re-initialising it with the merged feature (a flag restores the paper's behaviour — it moves the cadence, not the bound). The Q-former stand-in reproduces BLIP-2's shape, not its semantics, and is untrained.",
    math: "320 → 16 frames (20.0×)  ·  0/16 slots straddle a cut  ·  8/8 scenes kept  ·  cosine sep 0.285 vs SSIM 0.134",
  },
];

export function MovieChatWalkthrough() {
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState(24);   // consolidation target R_L
  const [mode, setMode] = useState("global"); // read path
  const [ni, setNi] = useState(9);            // scaling sweep index
  const sc = MC_STEPS[step];
  const sk = sc.key;

  const arrow = (x1, y1, x2, y2, col, dash) => (
    <g stroke={col || P.accent} strokeWidth="1.3" fill="none">
      <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
      <path d={`M${x2 - 7} ${y2 - 4} L${x2} ${y2} L${x2 - 7} ${y2 + 4}`} />
    </g>
  );
  const box = (x, y, w, h, label, sub, col, soft) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={soft ? P.accentSoft : P.paper2} stroke={col || P.ink} strokeWidth="1.2" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 1 : h / 2 + 4)} textAnchor="middle" style={SK} fontSize="10" fill={col || P.ink}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>{sub}</text>}
    </g>
  );
  const vec = (x, y, n, seed, col, w = 5, h = 13) => (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const v = ((Math.sin((i + seed) * 12.9898) * 43758.5453) % 1 + 1) % 1;
        return <rect key={i} x={x + i * w} y={y} width={w - 0.8} height={h} fill={col} fillOpacity={0.12 + v * 0.72} stroke={P.line} strokeWidth="0.3" />;
      })}
    </g>
  );

  const SCENE_COL = [P.accent, P.green, P.yellow];
  const groups = mcConsolidate(target);
  const straddling = groups.filter((g) => g.scenes.length > 1).length;

  /* log–log transforms for the scaling plot */
  const GX0 = 74, GX1 = 566, GY0 = 248, GY1 = 42;
  const LX = (n) => GX0 + ((Math.log10(n) - 2) / 3) * (GX1 - GX0);
  const LY = (mb) => GY0 - ((Math.log10(mb) + 0.6) / 5.4) * (GY0 - GY1);
  const row = MC_SCALING[ni];
  const ratio = row.dense / row.mc;

  const body = (() => {
    switch (sk) {
      case "encode":
        return (
          <g>
            <text x={300} y={18} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>a plain image encoder, run on one frame at a time</text>

            {/* the window: a stack of frames, only the front one being encoded */}
            {[3, 2, 1].map((d) => (
              <rect key={d} x={26 + d * 4} y={54 - d * 4} width={92} height={92} fill={P.paper2} stroke={P.line} strokeWidth="1" />
            ))}
            <rect x={26} y={54} width={92} height={92} fill={P.paper2} stroke={P.ink} strokeWidth="1.3" />
            {Array.from({ length: 15 }).map((_, i) => (
              <g key={i} stroke={P.line} strokeWidth="0.5">
                <line x1={26 + (i + 1) * 5.75} y1={54} x2={26 + (i + 1) * 5.75} y2={146} />
                <line x1={26} y1={54 + (i + 1) * 5.75} x2={118} y2={54 + (i + 1) * 5.75} />
              </g>
            ))}
            <rect x={26 + 5.75 * 6} y={54 + 5.75 * 7} width={5.75} height={5.75} fill={P.accent} fillOpacity="0.4" stroke="none" />
            <text x={72} y={166} textAnchor="middle" style={SK} fontSize="9" fill={P.ink}>224 × 224 px</text>
            <text x={72} y={179} textAnchor="middle" style={SK} fontSize="8.4" fill={P.sub}>16 × 16 patches of 14 px</text>
            <text x={72} y={36} textAnchor="middle" style={SK} fontSize="8.6" fill={P.sub}>window: 16 frames/slide</text>

            {arrow(124, 100, 156, 100)}
            {box(158, 78, 84, 44, "ViT-G/14", "EVA-CLIP  ❄", P.ink)}
            {arrow(244, 100, 272, 100)}

            <text x={330} y={72} textAnchor="middle" style={SK} fontSize="8.6" fill={P.sub}>256 patch tokens</text>
            {Array.from({ length: 8 }).map((_, r) => vec(276, 80 + r * 8, 16, r * 7 + 1, P.ink, 6.8, 6.6))}
            {arrow(392, 100, 420, 100)}
            {box(422, 78, 84, 44, "Q-former", "BLIP-2", P.accent)}
            {arrow(508, 100, 532, 100)}
            <text x={556} y={72} textAnchor="middle" style={SK} fontSize="8.6" fill={P.accent}>32 tokens</text>
            {Array.from({ length: 8 }).map((_, r) => vec(538, 80 + r * 8, 4, r * 5 + 4, P.accent, 8.6, 6.6))}

            <line x1={26} y1={206} x2={574} y2={206} stroke={P.line} strokeWidth="0.8" />
            <text x={26} y={228} style={SK} fontSize="9.6" fill={P.ink}>the encoder never sees two frames at once — it cannot know that frame 5 followed frame 4.</text>
            <text x={26} y={246} style={SK} fontSize="9.6" fill={P.accent}>space is the encoder's job.  time is memory's job.  that division is the whole architecture.</text>
            <text x={26} y={272} style={SK} fontSize="8.8" fontStyle="italic" fill={P.sub}>the two sixteens are unrelated: 16 patches per side is spatial (inside one frame); 16 frames per window is temporal (just the scoop size).</text>
          </g>
        );

      case "short":
        return (
          <g>
            <text x={300} y={18} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>short-term memory — dense, uncompressed, and fixed at 18 frames</text>

            {/* new frames arrive at the right end of the queue */}
            <text x={506} y={38} textAnchor="middle" style={SK} fontSize="9" fill={P.accent}>16 new frames per slide</text>
            {Array.from({ length: 4 }).map((_, i) => (
              <rect key={i} x={478 + i * 15} y={46} width={13} height={22} fill={P.accent} fillOpacity={0.16 + i * 0.11} stroke={P.line} strokeWidth="0.4" />
            ))}
            {arrow(506, 70, 506, 84, P.accent)}

            <rect x={110} y={86} width={432} height={34} fill={P.paper2} stroke={P.ink} strokeWidth="1.3" />
            {Array.from({ length: 18 }).map((_, i) => (
              <rect key={i} x={114 + i * 23.8} y={90} width={21} height={26} fill={P.ink} fillOpacity={i === 17 ? 0.34 : 0.13} stroke={P.line} strokeWidth="0.4" />
            ))}
            <text x={216} y={137} style={SK} fontSize="9.2" fill={P.ink}>S — FIFO, K = 18 frames × 32 tokens, stored in full detail</text>

            {/* the oldest frame leaves at the left end — and that is the trigger */}
            <text x={120} y={139} textAnchor="end" style={SK} fontSize="9" fill={P.red}>oldest out</text>
            <path d="M130 122 L130 152" stroke={P.red} strokeWidth="1.3" fill="none" />
            <path d="M123 145 L130 152 L137 145" stroke={P.red} strokeWidth="1.3" fill="none" />

            {box(54, 156, 152, 40, "consolidate", "merge, then file away", P.red)}
            {arrow(210, 176, 244, 176)}
            <rect x={248} y={150} width={306} height={52} fill={P.paper2} stroke={P.accent} strokeWidth="1.3" />
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={i} x={254 + i * 29.6} y={156} width={26} height={40} fill={P.accent} fillOpacity={0.1 + (i % 3) * 0.13} stroke={P.line} strokeWidth="0.4" />
            ))}
            <text x={401} y={218} textAnchor="middle" style={SK} fontSize="9.2" fill={P.accent}>L — long-term memory, sparse, capped at 256 frames</text>

            <text x={300} y={252} textAnchor="middle" style={SK} fontSize="9.6" fill={P.ink}>nothing is compressed while it sits in the tray. falling out of it is not deletion —</text>
            <text x={300} y={270} textAnchor="middle" style={SK} fontSize="9.6" fill={P.ink}>it is the trigger for the only expensive step in the system.</text>
          </g>
        );

      case "merge": {
        const W = 528, X0 = 40, cw = W / 24;
        let acc = 0;
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>24 frames · 3 scenes · cuts at 10 and 16</text>

            {/* the incoming frames */}
            {MC_FRAMES.map((f) => (
              <rect key={f.i} x={X0 + f.i * cw} y={26} width={cw - 1} height={24}
                fill={SCENE_COL[f.scene]} fillOpacity="0.34" stroke={P.line} strokeWidth="0.4" />
            ))}
            {MC_CUTS.map((c) => (
              <g key={c}>
                <line x1={X0 + c * cw - 0.5} y1={24} x2={X0 + c * cw - 0.5} y2={132} stroke={P.red} strokeWidth="1.1" strokeDasharray="4 3" />
                <text x={X0 + c * cw + 3} y={62} style={SK} fontSize="8" fill={P.red}>cut</text>
              </g>
            ))}

            {/* adjacent-frame similarity — what the merge rule actually reads */}
            <line x1={X0} y1={126} x2={X0 + W} y2={126} stroke={P.line} strokeWidth="0.7" />
            <path d={`M${MC_ADJ.map((s, i) => `${X0 + (i + 1) * cw} ${126 - s * 52}`).join(" L")}`}
              fill="none" stroke={P.accent} strokeWidth="1.6" />
            {MC_ADJ.map((s, i) => (
              <circle key={i} cx={X0 + (i + 1) * cw} cy={126 - s * 52} r="1.9" fill={s < 0.4 ? P.red : P.accent} />
            ))}
            <text x={X0 - 4} y={78} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>sim</text>
            <text x={X0 + 4} y={68} style={SK} fontSize="8.4" fill={P.accent}>adjacent-frame cosine — Eq. 3</text>
            <text x={X0 + W} y={140} textAnchor="end" style={SK} fontSize="8.2" fill={P.red}>the dips are the cuts — merged last, if ever</text>

            {arrow(300, 146, 300, 168)}
            <text x={308} y={162} style={SK} fontSize="8.8" fill={P.sub}>greedy merge, size-weighted</text>

            {/* what memory now holds */}
            {groups.map((g, i) => {
              const w = (g.n / 24) * W, x = X0 + acc;
              acc += w;
              const col = g.scenes.length > 1 ? P.red : SCENE_COL[g.scenes[0]];
              return (
                <g key={i}>
                  <rect x={x} y={176} width={Math.max(w - 1.4, 1)} height={30} fill={col} fillOpacity="0.34" stroke={col} strokeWidth={g.scenes.length > 1 ? 1.4 : 0.6} />
                  {w > 15 && <text x={x + w / 2} y={196} textAnchor="middle" style={SK} fontSize="8.4" fill={P.ink}>×{g.n}</text>}
                </g>
              );
            })}
            <text x={X0} y={224} style={SK} fontSize="9.4" fill={P.ink}>{24} frames in  →  <tspan fill={P.accent}>{groups.length} slots</tspan> held  ·  {(24 / groups.length).toFixed(1)}× compression</text>
            <text x={X0 + W} y={224} textAnchor="end" style={SK} fontSize="9.4" fill={straddling ? P.red : P.green}>
              {straddling} of {groups.length} slots straddle a cut
            </text>

            <text x={300} y={252} textAnchor="middle" style={SK} fontSize="9.6" fill={P.sub}>a slot's width is how many frames it now stands for. long still stretches collapse into one token;</text>
            <text x={300} y={270} textAnchor="middle" style={SK} fontSize="9.6" fill={P.sub}>the moments either side of a cut stay apart, because that is where similarity is lowest.</text>
          </g>
        );
      }

      case "modes": {
        const G = mode === "global";
        const on = (live) => (live ? 1 : 0.22);
        return (
          <g>
            <text x={300} y={18} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>
              {G ? "global mode — “what happens in this film?”" : "breakpoint mode — “what is going on at t = 47:12?”"}
            </text>

            {/* long-term — always in play */}
            <g opacity={1}>
              <rect x={26} y={44} width={214} height={54} fill={P.paper2} stroke={P.accent} strokeWidth="1.3" />
              {Array.from({ length: 12 }).map((_, i) => (
                <rect key={i} x={31 + i * 17.6} y={49} width={15} height={44} fill={P.accent} fillOpacity={0.1 + (i % 4) * 0.11} stroke={P.line} strokeWidth="0.3" />
              ))}
              <text x={133} y={112} textAnchor="middle" style={SK} fontSize="9.2" fill={P.accent}>L — long-term, merged, ≤ 256 frames</text>
            </g>

            {/* short-term — breakpoint only */}
            <g opacity={on(!G)}>
              <rect x={26} y={130} width={214} height={44} fill={P.paper2} stroke={P.ink} strokeWidth="1.2" />
              {Array.from({ length: 18 }).map((_, i) => (
                <rect key={i} x={30 + i * 11.7} y={135} width={9.5} height={34} fill={P.ink} fillOpacity="0.15" stroke={P.line} strokeWidth="0.3" />
              ))}
              <text x={133} y={188} textAnchor="middle" style={SK} fontSize="9.2" fill={P.ink}>S — short-term, dense, 18 frames</text>
            </g>

            {/* current frame — breakpoint only */}
            <g opacity={on(!G)}>
              <rect x={26} y={204} width={54} height={40} fill={P.paper2} stroke={P.ink} strokeWidth="1.2" />
              <rect x={32} y={210} width={42} height={28} fill={P.ink} fillOpacity="0.16" />
              <text x={94} y={228} style={SK} fontSize="9.2" fill={P.ink}>xₜ — the frame at the breakpoint</text>
            </g>

            {arrow(244, 71, 288, 132, P.accent)}
            {!G && arrow(244, 152, 288, 146, P.ink)}
            {!G && arrow(244, 224, 288, 160, P.ink)}

            {box(290, 128, 74, 44, G ? "V = L" : "concat", G ? "long-term only" : "[L ; S ; xₜ]", P.accent, true)}
            {arrow(366, 150, 396, 150)}
            {box(398, 128, 72, 44, "Q-former", "+ projection", P.ink)}
            {arrow(472, 150, 500, 150)}
            {box(502, 122, 72, 56, "LLM", "LLaMA / Vicuna", P.ink)}
            <text x={538} y={192} textAnchor="middle" style={SK} fontSize="8.6" fill={P.sub}>never sees a frame —</text>
            <text x={538} y={204} textAnchor="middle" style={SK} fontSize="8.6" fill={P.sub}>only what memory kept</text>

            <text x={300} y={272} textAnchor="middle" style={SK} fontSize="9.6" fontStyle="italic" fill={P.sub}>
              {G
                ? "the merged summary is the whole video representation — detail nobody asked about was the point of merging."
                : "the merged summary has thrown away exactly the local detail this question needs, so the dense tray is concatenated back on."}
            </text>
          </g>
        );
      }

      case "scaling": {
        const series = [
          { key: "dense", col: P.red, name: "naive dense — 197×768/frame", slope: 57.71484375 / 100 },
          { key: "comp", col: P.yellow, name: "naive compressed — 32×256/frame", slope: 3.125 / 100 },
        ];
        return (
          <g>
            {/* frame */}
            <line x1={GX0} y1={GY1} x2={GX0} y2={GY0} stroke={P.ink} strokeWidth="1.1" />
            <line x1={GX0} y1={GY0} x2={GX1} y2={GY0} stroke={P.ink} strokeWidth="1.1" />
            {[1, 10, 100, 1000, 10000].map((mb) => (
              <g key={mb}>
                <line x1={GX0} y1={LY(mb)} x2={GX1} y2={LY(mb)} stroke={P.line} strokeWidth="0.5" strokeDasharray="2 4" />
                <text x={GX0 - 5} y={LY(mb) + 3} textAnchor="end" style={SK} fontSize="7.6" fill={P.sub}>{mb.toLocaleString()} MB</text>
              </g>
            ))}
            {[100, 1000, 10000, 100000].map((n) => (
              <text key={n} x={LX(n)} y={GY0 + 13} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>
                {n >= 1000 ? `${n / 1000}k` : n}
              </text>
            ))}
            <text x={(GX0 + GX1) / 2} y={GY0 + 27} textAnchor="middle" style={SK} fontSize="8.4" fill={P.sub}>frames of video  (log)</text>
            <text x={GX0 - 46} y={GY1 - 6} style={SK} fontSize="8.4" fill={P.sub}>stored token memory (log)</text>

            {/* the 24 GB budget */}
            <line x1={GX0} y1={LY(24576)} x2={GX1} y2={LY(24576)} stroke={P.red} strokeWidth="1" strokeDasharray="5 3" />
            <text x={GX0 + 4} y={LY(24576) - 5} style={SK} fontSize="8" fill={P.red}>24 GB VRAM budget</text>

            {/* the two growing lines: measured solid, extrapolated dashed */}
            {series.map((s) => (
              <g key={s.key}>
                <path d={`M${MC_SCALING.map((r) => `${LX(r.n)} ${LY(r[s.key])}`).join(" L")}`} fill="none" stroke={s.col} strokeWidth="2" />
                <path d={`M${LX(10000)} ${LY(s.slope * 10000)} L${LX(100000)} ${LY(s.slope * 100000)}`} fill="none" stroke={s.col} strokeWidth="1.4" strokeDasharray="4 3" />
              </g>
            ))}
            <circle cx={LX(42582)} cy={LY(24576)} r="4.4" fill="none" stroke={P.red} strokeWidth="1.5" />
            <text x={LX(42582) + 8} y={LY(24576) + 16} style={SK} fontSize="8.2" fill={P.red}>42,582 frames ≈ 24 min</text>

            {/* MovieChat */}
            <path d={`M${MC_SCALING.map((r) => `${LX(r.n)} ${LY(r.mc)}`).join(" L")}`} fill="none" stroke={P.accent} strokeWidth="2.4" />
            <path d={`M${LX(10000)} ${LY(8)} L${LX(100000)} ${LY(8)}`} fill="none" stroke={P.accent} strokeWidth="1.6" strokeDasharray="4 3" />
            <text x={GX1 - 2} y={LY(8) - 7} textAnchor="end" style={SK} fontSize="8.4" fill={P.accent}>MovieChat — 8.00 MB, 256 frames, and it stops</text>

            {/* labels on the growing lines */}
            <text x={LX(1292)} y={LY(745.7) - 7} style={SK} fontSize="8.2" fill={P.red}>naive dense</text>
            <text x={LX(1292)} y={LY(40.38) - 7} style={SK} fontSize="8.2" fill={P.yellow}>naive compressed</text>

            {/* the reading head */}
            <line x1={LX(row.n)} y1={GY1} x2={LX(row.n)} y2={GY0} stroke={P.ink} strokeWidth="0.8" strokeDasharray="3 3" />
            <circle cx={LX(row.n)} cy={LY(row.dense)} r="3.4" fill={P.red} />
            <circle cx={LX(row.n)} cy={LY(row.comp)} r="3.4" fill={P.yellow} />
            <circle cx={LX(row.n)} cy={LY(row.mc)} r="3.8" fill={P.accent} />
            <text x={LX(row.n) + (ni > 6 ? -7 : 7)} y={LY(row.mc) + 16} textAnchor={ni > 6 ? "end" : "start"} style={SK} fontSize="8.6" fill={P.accent}>
              {row.mc.toFixed(2)} MB · {row.kept} frames kept
            </text>

            <text x={GX0} y={GY1 - 16} style={SK} fontSize="8.4" fontStyle="italic" fill={P.sub}>solid = measured (100 → 10,000 frames) · dashed = the same relation extended, verified linear to the byte</text>
          </g>
        );
      }

      case "verdict": {
        const rows = [
          { ok: "y", t: "320 frames → 16 retained slots", d: "20.0× compression, 10.00 MB → 0.50 MB, real pretrained ViT-B/16" },
          { ok: "y", t: "0 of 16 slots mix two scenes", d: "and 8 of 8 scenes are still represented — it compresses without erasing" },
          { ok: "y", t: "byte accounting = allocated tensors", d: "at every N; naive dense linear to the byte, max deviation 0 B" },
          { ok: "y", t: "SSIM agrees, and it never saw the algorithm", d: "cosine separates scenes 0.285 vs raw-pixel SSIM's 0.134 — token space separates twice as sharply" },
          { ok: "~", t: "long-term is capped, not re-encoded", d: "the paper stretches positional encodings n → n²; capping is what makes the bound provable" },
          { ok: "~", t: "short-term cleared, not re-initialised", d: "paper §3.3 seeds S with the merged feature; a flag restores it — cadence changes, the bound does not" },
        ];
        return (
          <g>
            <text x={300} y={20} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>MovieChat_repro.ipynb — every number measured on an M5, none quoted</text>
            {rows.map((r, i) => {
              const y = 46 + i * 36, col = r.ok === "y" ? P.green : P.yellow;
              return (
                <g key={i}>
                  <text x={30} y={y + 11} style={SK} fontSize="13" fill={col}>{r.ok === "y" ? "✓" : "~"}</text>
                  <text x={52} y={y + 10} style={SK} fontSize="10" fill={P.ink}>{r.t}</text>
                  <text x={52} y={y + 24} style={SK} fontSize="8.6" fill={P.sub}>{r.d}</text>
                  <line x1={30} y1={y + 30} x2={570} y2={y + 30} stroke={P.line} strokeWidth="0.5" />
                </g>
              );
            })}
            <text x={300} y={276} textAnchor="middle" style={SK} fontSize="9.8" fontStyle="italic" fill={P.accent}>long video was never blocked on a bigger context window. it was blocked on nobody throwing away the redundant frames.</text>
          </g>
        );
      }

      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };
  const pill = (on) => ({ ...SK, fontSize: "0.68rem", padding: "3px 11px", cursor: "pointer", border: `1px solid ${on ? P.accent : P.line}`, background: on ? P.accentSoft : P.paper2, color: on ? P.accent : P.sub });
  const N = MC_STEPS.length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>MovieChat · Song et al. 2023 · rebuilt on a laptop — 10,000 frames, 8 MB, flat</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {N}</span>
          <button onClick={() => setStep((step + N - 1) % N)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % N)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      {sk === "merge" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub }}>merge down to R_L =</span>
          {/* reversed: the handle's position is the number of slots kept — drag
              left to demand a smaller memory. Floored at 3, the scene count:
              below that something has to merge across a cut. */}
          <input type="range" min={0} max={21} step={1} value={24 - target} onChange={(e) => setTarget(24 - +e.target.value)} aria-label="consolidation target" style={{ accentColor: P.accent, width: 150, direction: "rtl" }} />
          <span style={{ ...SK, fontSize: "0.66rem", color: P.ink, minWidth: 74 }}>{groups.length} slots</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: straddling ? P.red : P.green }}>{straddling} straddle a cut</span>
          <button onClick={() => setTarget(24)} style={{ ...SK, fontSize: "0.68rem", padding: "3px 11px", cursor: "pointer", border: `1px solid ${P.line}`, background: P.paper2, color: P.sub }}>reset</button>
        </div>
      )}

      {sk === "modes" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub }}>read path:</span>
          <button onClick={() => setMode("global")} style={pill(mode === "global")}>global — the whole film</button>
          <button onClick={() => setMode("breakpoint")} style={pill(mode === "breakpoint")}>breakpoint — one moment</button>
        </div>
      )}

      {sk === "scaling" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub }}>video length:</span>
          <input type="range" min={0} max={MC_SCALING.length - 1} step={1} value={ni} onChange={(e) => setNi(+e.target.value)} aria-label="number of frames" style={{ accentColor: P.accent, width: 150 }} />
          <span style={{ ...SK, fontSize: "0.66rem", color: P.ink, minWidth: 96 }}>{row.n.toLocaleString()} frames</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.red }}>dense {row.dense.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.accent }}>MovieChat {row.mc.toFixed(2)} MB</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.ink }}>= {Math.round(ratio)}× less</span>
        </div>
      )}

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`MovieChat walkthrough step ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {MC_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   JEPA WALKTHROUGH — predict in latent space, and the trapdoor that opens
   underneath when you do. Steps 2 and 5 share one `regime` toggle, so the
   batch you break in the collapse step is the same batch VICReg then scores.

   The three batches below are fixed 8×6 embedding matrices, not decoration:
     · healthy — columns Gram-Schmidt'd then scaled, so σⱼ = 1 and the
       off-diagonal covariance is 0 to rounding. Both guardrails read clean.
     · dim     — d₂ is a near-copy of d₁, d₃ is shrunk, d₅/d₆ are pinned flat.
     · full    — every row identical: the cheat that drives the loss to zero.
   Every statistic on screen is computed from these at render time, so the
   numbers can't drift away from the grid they're printed next to.
   ════════════════════════════════════════ */
const JEPA_BATCH = {
  healthy: [
    [-0.43, 1.87, 0.66, -0.64, 0.53, 0.71],
    [-0.40, -0.62, -0.49, -0.81, 1.44, -1.58],
    [1.01, 1.13, -0.08, 1.22, 0.01, -0.98],
    [-1.29, -0.67, 1.72, 0.37, -0.77, -0.36],
    [0.38, -0.64, -0.08, -0.71, 0.76, 1.47],
    [-1.26, -0.08, -1.67, 1.08, -0.34, 0.62],
    [1.35, -0.97, 0.51, 0.86, 0.20, 0.48],
    [0.65, -0.02, -0.58, -1.38, -1.82, -0.35],
  ],
  dim: [
    [-0.43, -0.40, 0.20, -0.64, 0.20, -0.10],
    [-0.40, -0.37, -0.15, -0.81, 0.20, -0.10],
    [1.01, 1.00, -0.02, 1.22, 0.20, -0.10],
    [-1.29, -1.23, 0.52, 0.37, 0.20, -0.10],
    [0.38, 0.39, -0.02, -0.71, 0.20, -0.10],
    [-1.26, -1.20, -0.50, 1.08, 0.20, -0.10],
    [1.35, 1.33, 0.15, 0.86, 0.20, -0.10],
    [0.65, 0.65, -0.17, -1.38, 0.20, -0.10],
  ],
  full: Array.from({ length: 8 }, () => [0.5, 0.5, 0.5, 0.5, 0.5, 0.5]),
};

const JEPA_REGIMES = [
  { key: "healthy", label: "healthy", blurb: "every direction carries variance, nothing is redundant" },
  { key: "dim", label: "dimensional collapse", blurb: "d₂ duplicates d₁ · d₅, d₆ are flat — 6 dims, 2 real directions" },
  { key: "full", label: "complete collapse", blurb: "one constant vector for every input · loss = 0" },
];

/* Column statistics of Z. σ uses the unbiased estimator so it matches the
   diagonal of the covariance matrix drawn beside it. */
function jepaStats(Z) {
  const N = Z.length, D = Z[0].length;
  const mu = Array.from({ length: D }, (_, j) => Z.reduce((s, r) => s + r[j], 0) / N);
  const cov = Array.from({ length: D }, (_, a) =>
    Array.from({ length: D }, (_, b) =>
      Z.reduce((s, r) => s + (r[a] - mu[a]) * (r[b] - mu[b]), 0) / (N - 1)));
  const sd = cov.map((row, j) => Math.sqrt(Math.max(0, row[j])));
  const varPen = sd.reduce((s, v) => s + Math.max(0, 1 - v), 0) / D;
  let covPen = 0, maxCorr = 0, anyPair = false;
  for (let a = 0; a < D; a++) for (let b = 0; b < D; b++) {
    if (a === b) continue;
    covPen += cov[a][b] ** 2;
    if (sd[a] > 1e-6 && sd[b] > 1e-6) { anyPair = true; maxCorr = Math.max(maxCorr, Math.abs(cov[a][b] / (sd[a] * sd[b]))); }
  }
  covPen /= D;
  return { N, D, mu, cov, sd, varPen, covPen, maxCorr, anyPair, live: sd.filter((v) => v >= 0.5).length };
}

const JEPA_STEPS = [
  {
    key: "latent",
    label: "predict in latent space",
    title: "Don't reconstruct the pixels — predict the representation",
    body: "Mask a handful of blocks out of an image. A context encoder sees what's left; a predictor is handed the positions of the missing blocks and has to guess what a target encoder would say about them. The comparison happens entirely in embedding space, so the model is never asked to reproduce carpet grain or sensor noise — detail that costs capacity and teaches nothing. That's the whole premise, and it's also the trapdoor: the target is a representation the network itself produces, which means the network gets a vote on how hard its own exam is.",
    math: "min₍θ,φ₎ ‖ g_φ( f_θ(x_ctx), pos_y ) − sg[ f_θ̄(x_y) ] ‖²",
  },
  {
    key: "collapse",
    label: "the degenerate solution",
    title: "The cheapest way to be predictable is to say nothing",
    body: "Nothing in that loss says the representation has to be informative — only that it has to be guessable. So the optimizer finds the shortcut: emit the same vector regardless of input. Every prediction is exact, the loss sits at zero, and the encoder has learned precisely nothing. That's complete collapse. The subtler cousin is dimensional collapse — the vectors aren't constant, but they pile into a low-dimensional subspace: some dims pinned flat, others just duplicates of a neighbour. You have a 6-dim embedding using two real directions. Flip between the three regimes and watch the statistics rather than the loss, because the loss gets better as the representation gets worse.",
    math: "f(x) = c  ∀x   ⇒   loss → 0,  information → 0",
  },
  {
    key: "ema",
    label: "EMA · stop-grad",
    title: "What JEPA actually does: make the target a moving goalpost",
    body: "JEPA never adds a repulsion term. It kills collapse architecturally, with three asymmetries. A stop-gradient on the target branch means the optimizer cannot pull both encoders toward the same constant at once — it only ever gets to move one of them. The target encoder's weights are an exponential moving average of the context encoder's, so the target lags behind by a time constant of roughly 1/(1−τ) steps — around 250 at τ = 0.996. And a predictor head sits on the context side only, breaking the last bit of symmetry between the branches. This is the BYOL/SimSiam lineage: no negatives, no batch statistics, collapse handled by the shape of the thing rather than by the loss. Drag τ and watch the goalpost stop moving.",
    math: "θ̄ ← τ·θ̄ + (1−τ)·θ   ·   sg[·] on the target   ·   predictor on the context side only",
  },
  {
    key: "duality",
    label: "the two axes",
    title: "Sample-contrastive and dimension-contrastive are the same matrix, read two ways",
    body: "Lay the batch out as Z, N samples by D dimensions. There are exactly two ways to contrast it. Multiply one way and you get Z Zᵀ — an N×N table of sample-against-sample similarity. That's SimCLR and MoCo: push different images apart, so a collapsed batch makes every negative pair maximally similar and the loss punishes it. It works, but the table only says something once N is large, hence big batches or a memory bank. Multiply the other way and you get Zᵀ Z — a D×D covariance between feature dimensions. That's VICReg and Barlow Twins, and D is fixed by your architecture, so the cost doesn't scale with batch size. Garrido et al. made the duality precise in 2022: two families contrasting over opposite axes of one matrix.",
    math: "Z Zᵀ → N×N  ·  the sample axis, cost grows with N      |      Zᵀ Z → D×D  ·  the feature axis, D fixed by the architecture",
  },
  {
    key: "vicreg",
    label: "VICReg",
    title: "Two guardrails on the statistics, and neither one is redundant",
    body: "VICReg keeps the plain MSE as its invariance term and bolts on two regularisers computed straight off that D×D matrix. Variance: for each dimension, hinge its standard deviation above 1 — a flat dimension has σ = 0 and takes the full penalty, which is what makes this the direct anti-collapse term. Covariance: drive the off-diagonals to zero, so the model can't fake variance by copying one informative dimension into several. Watch what happens when you switch regimes, because it's the whole argument for keeping both: complete collapse scores 0.00 on the covariance term — constant columns are perfectly uncorrelated — and is caught only by variance. Dimensional collapse's duplicated pair passes the variance hinge at σ ≈ 1.00 and is caught only by covariance. Barlow Twins does the same job with one object, driving the cross-correlation between branches toward the identity.",
    math: "L = λ · inv(Z, Z′)  +  μ · Σⱼ max(0, 1 − σⱼ)  +  ν · Σ over i≠j of C_ij²",
  },
];

export function JepaWalkthrough() {
  const [step, setStep] = useState(0);
  const [regime, setRegime] = useState("healthy");
  const [tauI, setTauI] = useState(4);
  const sc = JEPA_STEPS[step];
  const sk = sc.key;

  const Z = JEPA_BATCH[regime];
  const st = jepaStats(Z);
  const H = jepaStats(JEPA_BATCH.healthy);

  const TAUS = [0.9, 0.95, 0.98, 0.99, 0.996, 0.999];
  const tau = TAUS[tauI];

  const arrow = (x1, y1, x2, y2, col, dash) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const w = 4.2, len = 7.5;
    return (
      <g stroke={col || P.accent} strokeWidth="1.3" fill="none">
        <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
        <path d={`M${x2 - len * Math.cos(a) - w * Math.sin(a)} ${y2 - len * Math.sin(a) + w * Math.cos(a)} L${x2} ${y2} L${x2 - len * Math.cos(a) + w * Math.sin(a)} ${y2 - len * Math.sin(a) - w * Math.cos(a)}`} />
      </g>
    );
  };
  const box = (x, y, w, h, label, sub, col) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={P.paper2} stroke={col || P.ink} strokeWidth="1.2" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 1 : h / 2 + 4)} textAnchor="middle" style={SK} fontSize="10.5" fill={col || P.ink}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>{sub}</text>}
    </g>
  );
  /* signed heat cell — blue for positive, red for negative, opacity by magnitude */
  const heat = (v, mx) => ({ fill: v >= 0 ? P.accent : P.red, fillOpacity: Math.min(0.82, 0.06 + (Math.abs(v) / (mx || 1)) * 0.7) });
  /* rounding can leave −0, which prints as an ugly "-0.00" in a grid of cells */
  const fx = (v) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);
  const grid = (Z2, x0, y0, cw, ch, mx, opts = {}) => (
    <g>
      {Z2.map((row, i) => row.map((v, j) => (
        <rect key={`${i}-${j}`} x={x0 + j * cw} y={y0 + i * ch} width={cw - 0.7} height={ch - 0.7}
          {...heat(v, mx)} stroke={P.line} strokeWidth="0.3" />
      )))}
      {opts.values && Z2.map((row, i) => row.map((v, j) => (
        <text key={`t${i}-${j}`} x={x0 + (j + 0.5) * cw - 0.35} y={y0 + (i + 0.5) * ch + 2.6} textAnchor="middle"
          style={SK} fontSize={opts.fs || 7} fill={Math.abs(v) / (mx || 1) > 0.62 ? "#fff" : P.ink}>{fx(v)}</text>
      )))}
    </g>
  );

  /* target blocks held out of the context view — 3 contiguous blocks on a 6×6 grid */
  const TARGETS = new Set(["1,1", "1,2", "2,1", "2,2", "0,4", "1,4", "4,2", "4,3", "5,2", "5,3"]);

  const body = (() => {
    switch (sk) {
      case "latent": {
        const cell = 11.5;
        const patchGrid = (ox, oy, mode) => (
          <g>
            {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 6 }).map((_, c) => {
              const isT = TARGETS.has(`${r},${c}`);
              const show = mode === "ctx" ? !isT : isT;
              return (
                <rect key={`${r}-${c}`} x={ox + c * cell} y={oy + r * cell} width={cell - 0.8} height={cell - 0.8}
                  fill={show ? (mode === "ctx" ? P.accent : P.red) : P.paper2}
                  fillOpacity={show ? 0.16 + ((r * 6 + c) % 5) * 0.1 : 1}
                  stroke={show ? (mode === "ctx" ? P.accent : P.red) : P.line}
                  strokeWidth={show ? 0.8 : 0.5} strokeDasharray={show ? "none" : "1.5 1.5"} />
              );
            }))}
          </g>
        );
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>one image · a few blocks held out — the prediction is made in embedding space, never in pixels</text>

            {patchGrid(26, 54, "ctx")}
            <text x={60} y={48} textAnchor="middle" style={SK} fontSize="8.5" fill={P.accent}>context  x_ctx</text>
            {arrow(98, 88, 122, 88)}
            {box(124, 70, 84, 38, "f_θ", "context encoder", P.accent)}
            {arrow(208, 88, 240, 88)}
            {box(242, 70, 86, 38, "g_φ", "predictor", P.accent)}
            <text x={285} y={122} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>+ position tokens for y</text>
            {arrow(328, 88, 362, 88)}
            {grid([[0.9, -0.4, 1.3, 0.2, -1.1, 0.6]], 366, 79, 11, 18, 1.4)}
            <text x={399} y={71} textAnchor="middle" style={SK} fontSize="8.5" fill={P.accent}>ŝ_y  predicted</text>

            {patchGrid(26, 172, "tgt")}
            <text x={60} y={166} textAnchor="middle" style={SK} fontSize="8.5" fill={P.red}>targets  x_y</text>
            {arrow(98, 206, 122, 206)}
            {box(124, 188, 84, 38, "f_θ̄", "target encoder", P.red)}
            {arrow(208, 206, 362, 206, P.red)}
            {grid([[0.8, -0.5, 1.2, 0.3, -1.0, 0.7]], 366, 197, 11, 18, 1.4)}
            <text x={399} y={237} textAnchor="middle" style={SK} fontSize="8.5" fill={P.red}>s_y  target</text>

            {/* stop-gradient marker on the target branch */}
            <circle cx={285} cy={206} r="8.5" fill={P.paper2} stroke={P.red} strokeWidth="1.3" />
            <path d="M280 201 L290 211 M290 201 L280 211" stroke={P.red} strokeWidth="1.3" />
            <text x={285} y={230} textAnchor="middle" style={SK} fontSize="8" fill={P.red}>sg[·] — no gradient</text>

            {/* EMA coupling */}
            {arrow(166, 108, 166, 186, P.sub, true)}
            <text x={172} y={150} style={SK} fontSize="7.8" fill={P.sub}>EMA</text>

            {arrow(432, 92, 468, 128)}
            {arrow(432, 202, 468, 166, P.red)}
            <rect x={470} y={126} width={108} height={42} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.3" />
            <text x={524} y={144} textAnchor="middle" style={SK} fontSize="10.5" fill={P.accent}>‖ ŝ_y − s_y ‖²</text>
            <text x={524} y={158} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>prediction loss</text>
            <text x={300} y={268} textAnchor="middle" style={SK} fontSize="8.8" fontStyle="italic" fill={P.sub}>the thing being predicted is the network's own output — which is exactly the problem in step 2</text>
          </g>
        );
      }

      case "collapse": {
        const mx = 2;
        const x0 = 132, y0 = 62, cw = 30, ch = 20;
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>the batch as a matrix  Z  —  8 images down, 6 embedding dims across</text>
            {[0, 1, 2, 3, 4, 5].map((j) => (
              <text key={j} x={x0 + (j + 0.5) * cw} y={56} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>d{j + 1}</text>
            ))}
            {Z.map((_, i) => (
              <text key={i} x={x0 - 6} y={y0 + (i + 0.5) * ch + 3} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>x{"₁₂₃₄₅₆₇₈"[i]}</text>
            ))}
            {grid(Z, x0, y0, cw, ch, mx, { values: true, fs: 7.4 })}

            <text x={x0 - 6} y={y0 + 8 * ch + 16} textAnchor="end" style={SK} fontSize="8" fill={P.ink}>σⱼ</text>
            {st.sd.map((s, j) => (
              <text key={j} x={x0 + (j + 0.5) * cw} y={y0 + 8 * ch + 16} textAnchor="middle" style={SK} fontSize="8.4"
                fill={s < 0.5 ? P.red : P.green}>{s.toFixed(2)}</text>
            ))}
            <text x={x0 + 3 * cw} y={y0 + 8 * ch + 32} textAnchor="middle" style={SK} fontSize="7.8" fontStyle="italic" fill={P.sub}>standard deviation of each dimension across the batch</text>

            <rect x={344} y={54} width={234} height={172} fill={P.paper2} stroke={P.line} strokeWidth="1.1" />
            <rect x={344} y={54} width={234} height={20} fill={P.faint} />
            <text x={354} y={68} style={SK} fontSize="9" fill={P.ink}>what the optimizer sees</text>
            {[
              { l: "prediction loss", v: regime === "full" ? "0.00  ← solved" : "> 0  — must actually predict", c: regime === "full" ? P.red : P.green },
              { l: "dims with σ ≥ 0.5", v: `${st.live} of ${st.D}`, c: st.live === st.D ? P.green : P.red },
              { l: "max |corr| between dims", v: st.anyPair ? st.maxCorr.toFixed(2) : "—  (no live dims)", c: st.anyPair && st.maxCorr > 0.9 ? P.red : st.anyPair ? P.green : P.red },
            ].map((r, i) => (
              <g key={i}>
                <text x={354} y={94 + i * 24} style={SK} fontSize="8.6" fill={P.sub}>{r.l}</text>
                <text x={568} y={94 + i * 24} textAnchor="end" style={SK} fontSize="9.2" fill={r.c}>{r.v}</text>
              </g>
            ))}
            <line x1={354} y1={158} x2={568} y2={158} stroke={P.line} strokeWidth="0.8" />
            <text x={354} y={176} style={SK} fontSize="8.8" fill={regime === "healthy" ? P.green : P.red}>
              {regime === "healthy" ? "usable representation" : regime === "dim" ? "dimensional collapse" : "complete collapse"}
            </text>
            <foreignObject x={354} y={182} width={214} height={40}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={{ ...SK, fontSize: "8.4px", lineHeight: 1.45, color: P.sub }}>
                {JEPA_REGIMES.find((r) => r.key === regime).blurb}
              </div>
            </foreignObject>
            <text x={461} y={244} textAnchor="middle" style={SK} fontSize="8.6" fontStyle="italic" fill={P.sub}>the loss improves as the representation gets worse</text>
          </g>
        );
      }

      case "ema": {
        /* a scalar weight wandering during training, and the EMA copy trailing it */
        const NS = 600, PX0 = 300, PX1 = 582, PY0 = 244, PY1 = 66;
        const th = (t) => 0.5 + 0.30 * Math.sin(t / 95) + 0.10 * Math.sin(t / 23) + 0.055 * Math.sin(t / 6.5);
        const X = (t) => PX0 + (t / NS) * (PX1 - PX0);
        const Y = (v) => PY0 - v * (PY0 - PY1);
        let bar = th(0);
        const pOnline = [], pEma = [];
        for (let t = 0; t <= NS; t++) {
          bar = tau * bar + (1 - tau) * th(t);
          if (t % 3 === 0) { pOnline.push(`${X(t)} ${Y(th(t))}`); pEma.push(`${X(t)} ${Y(bar)}`); }
        }
        const tc = Math.round(1 / (1 - tau));
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>three asymmetries, no negatives — the target can never be optimised toward the shortcut</text>

            {box(24, 74, 84, 34, "f_θ", "context", P.accent)}
            {arrow(66, 108, 66, 132)}
            {box(24, 134, 84, 34, "g_φ", "predictor", P.accent)}
            {box(152, 74, 96, 34, "f_θ̄", "target · EMA", P.red)}
            {arrow(108, 91, 150, 91, P.sub, true)}
            <text x={129} y={85} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>EMA</text>
            {arrow(66, 168, 100, 200)}
            {arrow(200, 108, 156, 200, P.red)}
            <rect x={78} y={202} width={112} height={30} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.2" />
            <text x={134} y={221} textAnchor="middle" style={SK} fontSize="10" fill={P.accent}>‖ ŝ − s ‖²</text>
            <circle cx={178} cy={154} r="8" fill={P.paper2} stroke={P.red} strokeWidth="1.3" />
            <path d="M173.5 149.5 L182.5 158.5 M182.5 149.5 L173.5 158.5" stroke={P.red} strokeWidth="1.3" />
            <text x={196} y={152} style={SK} fontSize="7.8" fill={P.red}>gradients</text>
            <text x={196} y={162} style={SK} fontSize="7.8" fill={P.red}>stop here</text>
            <text x={134} y={252} textAnchor="middle" style={SK} fontSize="8" fontStyle="italic" fill={P.sub}>predictor on one side only</text>

            {/* the goalpost plot */}
            <line x1={PX0} y1={PY1} x2={PX0} y2={PY0} stroke={P.ink} strokeWidth="1.1" />
            <line x1={PX0} y1={PY0} x2={PX1} y2={PY0} stroke={P.ink} strokeWidth="1.1" />
            {[0, 200, 400, 600].map((t) => (
              <text key={t} x={X(t)} y={PY0 + 13} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>{t}</text>
            ))}
            <text x={(PX0 + PX1) / 2} y={PY0 + 26} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>training steps</text>
            <text x={PX0 - 2} y={PY1 - 20} style={SK} fontSize="8" fill={P.sub}>a single weight, during training</text>
            <path d={`M${pOnline.join(" L")}`} fill="none" stroke={P.accent} strokeWidth="1" strokeOpacity="0.5" />
            <path d={`M${pEma.join(" L")}`} fill="none" stroke={P.red} strokeWidth="2" />
            <text x={PX1} y={PY1 - 8} textAnchor="end" style={SK} fontSize="8.4" fill={P.accent}>θ  context (trained)</text>
            <text x={PX1} y={PY1 + 3} textAnchor="end" style={SK} fontSize="8.4" fill={P.red}>θ̄  target (EMA, τ = {tau})</text>
            <text x={PX0 + 6} y={PY0 - 8} style={SK} fontSize="8.4" fill={P.ink}>time constant ≈ 1/(1−τ) = {tc} steps</text>
          </g>
        );
      }

      case "duality": {
        const Zh = JEPA_BATCH.healthy;
        const N = 8, D = 6;
        const gram = Array.from({ length: N }, (_, a) =>
          Array.from({ length: N }, (_, b) => Zh[a].reduce((s, v, j) => s + v * Zh[b][j], 0) / D));
        const gmx = Math.max(...gram.flat().map(Math.abs));
        const cmx = Math.max(...H.cov.flat().map(Math.abs));
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>one embedding matrix, two ways to multiply it — and that is the whole difference between the families</text>

            <text x={300} y={82} textAnchor="middle" style={SK} fontSize="9" fill={P.ink}>Z  ·  N × D</text>
            {grid(Zh, 264, 90, 12, 13, 2)}
            <text x={300} y={220} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>N = 8 samples</text>
            <text x={300} y={231} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>D = 6 dims</text>

            {arrow(258, 142, 178, 142)}
            <text x={218} y={135} textAnchor="middle" style={SK} fontSize="8" fill={P.accent}>Z Zᵀ</text>
            {arrow(342, 142, 428, 142)}
            <text x={385} y={135} textAnchor="middle" style={SK} fontSize="8" fill={P.accent}>Zᵀ Z</text>

            {grid(gram, 78, 96, 11.5, 11.5, gmx)}
            <text x={124} y={90} textAnchor="middle" style={SK} fontSize="9" fill={P.ink}>N × N  ·  sample axis</text>
            <text x={124} y={200} textAnchor="middle" style={SK} fontSize="8.4" fill={P.accent}>sample-contrastive</text>
            <text x={124} y={211} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>SimCLR · MoCo</text>
            <text x={124} y={226} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>push different images apart</text>
            <text x={124} y={238} textAnchor="middle" style={SK} fontSize="7.8" fill={P.red}>needs large N → big batch</text>
            <text x={124} y={249} textAnchor="middle" style={SK} fontSize="7.8" fill={P.red}>or a memory bank</text>

            {grid(H.cov, 450, 96, 15.5, 15.5, cmx)}
            <text x={496} y={90} textAnchor="middle" style={SK} fontSize="9" fill={P.ink}>D × D  ·  feature axis</text>
            <text x={496} y={200} textAnchor="middle" style={SK} fontSize="8.4" fill={P.accent}>dimension-contrastive</text>
            <text x={496} y={211} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>VICReg · Barlow Twins</text>
            <text x={496} y={226} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>decorrelate the dimensions</text>
            <text x={496} y={238} textAnchor="middle" style={SK} fontSize="7.8" fill={P.green}>D is fixed by the architecture</text>
            <text x={496} y={249} textAnchor="middle" style={SK} fontSize="7.8" fill={P.green}>— batch size stays free</text>

            <text x={300} y={266} textAnchor="middle" style={SK} fontSize="8.6" fontStyle="italic" fill={P.sub}>the duality — Garrido et al. 2022: opposite axes of the same object</text>
          </g>
        );
      }

      case "vicreg": {
        const bx = 46, bw = 28, bg = 38, base = 176, unit = 88;
        const cx0 = 350, cy0 = 62, cs = 26;
        const cmx = Math.max(0.001, ...st.cov.flat().map(Math.abs));
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>invariance pulls the branches together — variance and covariance stop it winning by collapsing</text>

            {/* variance hinge */}
            <text x={bx} y={44} style={SK} fontSize="9" fill={P.ink}>variance  ·  hinge σⱼ above 1</text>
            <line x1={bx - 6} y1={base} x2={bx + 6 * bg} y2={base} stroke={P.ink} strokeWidth="1" />
            <line x1={bx - 6} y1={base - unit} x2={bx + 6 * bg} y2={base - unit} stroke={P.green} strokeWidth="1" strokeDasharray="4 3" />
            <text x={bx + 6 * bg + 2} y={base - unit + 3} style={SK} fontSize="7.6" fill={P.green}>σ = 1</text>
            {st.sd.map((s, j) => {
              const h = Math.max(0.6, s * unit), pen = Math.max(0, 1 - s);
              return (
                <g key={j}>
                  {pen > 0.01 && <rect x={bx + j * bg} y={base - unit} width={bw} height={unit - h} fill={P.red} fillOpacity="0.14" stroke={P.red} strokeWidth="0.6" strokeDasharray="2 2" />}
                  <rect x={bx + j * bg} y={base - h} width={bw} height={h} fill={pen > 0.01 ? P.red : P.green} fillOpacity="0.6" stroke={pen > 0.01 ? P.red : P.green} strokeWidth="0.9" />
                  <text x={bx + j * bg + bw / 2} y={base + 12} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>d{j + 1}</text>
                  <text x={bx + j * bg + bw / 2} y={base + 23} textAnchor="middle" style={SK} fontSize="7.4" fill={pen > 0.01 ? P.red : P.green}>{s.toFixed(2)}</text>
                  {pen > 0.01 && <text x={bx + j * bg + bw / 2} y={base - unit - 5} textAnchor="middle" style={SK} fontSize="7.4" fill={P.red}>+{pen.toFixed(2)}</text>}
                </g>
              );
            })}
            <text x={bx} y={base + 40} style={SK} fontSize="8" fill={P.sub}>the shaded gap is the penalty: max(0, 1 − σⱼ)</text>

            {/* covariance matrix */}
            <text x={cx0} y={44} style={SK} fontSize="9" fill={P.ink}>covariance  ·  drive the off-diagonals to 0</text>
            {st.cov.map((row, a) => row.map((v, b) => (
              <g key={`${a}-${b}`}>
                <rect x={cx0 + b * cs} y={cy0 + a * cs} width={cs - 0.8} height={cs - 0.8}
                  fill={a === b ? P.faint : P.red} fillOpacity={a === b ? 1 : Math.min(0.8, (Math.abs(v) / cmx) * 0.8)}
                  stroke={a === b ? P.line : P.red} strokeWidth={a === b ? 0.4 : 0.5} strokeOpacity={a === b ? 1 : 0.35} />
                <text x={cx0 + (b + 0.5) * cs - 0.4} y={cy0 + (a + 0.5) * cs + 2.6} textAnchor="middle" style={SK} fontSize="7"
                  fill={a === b ? P.sub : Math.abs(v) / cmx > 0.55 ? "#fff" : P.ink}>{fx(v)}</text>
              </g>
            )))}
            <text x={cx0 + 3 * cs} y={cy0 + 6 * cs + 12} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>diagonal is variance (greyed) — only the off-diagonals are penalised</text>

            {/* the two scores */}
            <line x1={bx} y1={238} x2={554} y2={238} stroke={P.line} strokeWidth="0.8" />
            <text x={bx} y={256} style={SK} fontSize="8.6" fill={P.sub}>variance term  ·  mean of max(0, 1 − σⱼ)</text>
            <text x={274} y={256} textAnchor="end" style={SK} fontSize="9.6" fill={st.varPen > 0.01 ? P.red : P.green}>{st.varPen.toFixed(2)}</text>
            <text x={330} y={256} style={SK} fontSize="8.6" fill={P.sub}>covariance term  ·  off-diagonals, squared</text>
            <text x={554} y={256} textAnchor="end" style={SK} fontSize="9.6" fill={st.covPen > 0.01 ? P.red : P.green}>{st.covPen.toFixed(2)}</text>
            <text x={bx} y={273} style={SK} fontSize="8.4" fontStyle="italic" fill={regime === "healthy" ? P.green : P.red}>
              {regime === "healthy"
                ? "both terms satisfied — the invariance term is free to do its job"
                : regime === "full"
                  ? "the variance term catches this one alone: constant columns are perfectly uncorrelated, so covariance reads 0.00"
                  : "d₁ and d₂ both sit at σ ≈ 1.00, so variance is nearly satisfied there — only covariance sees they are one direction twice"}
            </text>
          </g>
        );
      }

      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };
  const N = JEPA_STEPS.length;
  const showRegime = sk === "collapse" || sk === "vicreg";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>I-JEPA · Assran et al. 2023 · and the three ways the field fights collapse</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {N}</span>
          <button onClick={() => setStep((step + N - 1) % N)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % N)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      {showRegime && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub }}>the batch:</span>
          {JEPA_REGIMES.map((r) => (
            <button key={r.key} onClick={() => setRegime(r.key)} aria-pressed={regime === r.key}
              style={{ ...SK, fontSize: "0.68rem", padding: "3px 11px", cursor: "pointer", border: `1px solid ${regime === r.key ? P.accent : P.line}`, background: regime === r.key ? P.accentSoft : P.paper2, color: regime === r.key ? P.accent : P.sub }}>
              {r.label}
            </button>
          ))}
        </div>
      )}

      {sk === "ema" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub }}>decay τ:</span>
          <input type="range" min={0} max={TAUS.length - 1} step={1} value={tauI} onChange={(e) => setTauI(+e.target.value)} aria-label="EMA decay rate tau" style={{ accentColor: P.accent, width: 150 }} />
          <span style={{ ...SK, fontSize: "0.66rem", color: P.ink, minWidth: 78 }}>τ = {tau}</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>
            {tau < 0.97 ? "too fast — the target tracks the context encoder, and the asymmetry weakens" : tau > 0.997 ? "too slow — the target is nearly frozen and the signal goes stale" : "≈ the operating range: a target that lags, but still moves"}
          </span>
        </div>
      )}

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 285" }}>
            <svg viewBox="0 0 600 285" width="100%" height="100%" role="img" aria-label={`JEPA walkthrough step ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {JEPA_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   INSIGHTS VIEWER — step through real figures + the observation each carries
   ════════════════════════════════════════ */
/* The instrument behind the metrics section: the same image scored twice,
   flattened, ranked, and correlated. Draws the argument rather than the
   result — magnitude is thrown away, only the ordering is compared. */
export function SketchRankStability() {
  const pts = [
    [215, 197], [228, 175], [240, 178], [252, 157], [265, 158], [278, 134],
    [290, 138], [302, 116], [315, 118], [328, 95], [340, 97], [352, 76],
    [365, 78], [378, 57], [390, 55],
  ];
  return (
    <svg viewBox="0 0 440 260" width="100%" height="100%" role="img"
      aria-label="Sketch: a saliency map computed on a clean and a degraded fundus image, flattened and rank-correlated"
      style={{ display: "block" }}>
      <defs><RoughDefs id="rgh-rk" scale={1.4} seed={19} /></defs>

      <g filter="url(#rgh-rk)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* the same fundus, twice — clean above, degraded below */}
        <circle cx="58" cy="66" r="30" stroke={P.sub} strokeWidth="1.3" />
        <circle cx="48" cy="56" r="5" stroke={P.accent} strokeWidth="1.6" fill={P.accentSoft} />
        <circle cx="68" cy="74" r="4" stroke={P.accent} strokeWidth="1.3" />
        <circle cx="55" cy="80" r="3" stroke={P.accent} strokeWidth="1.1" />

        <circle cx="58" cy="176" r="30" stroke={P.sub} strokeWidth="1.3" strokeDasharray="4 3" />
        <circle cx="50" cy="167" r="5.5" stroke={P.accent} strokeWidth="1.6" fill={P.accentSoft} />
        <circle cx="70" cy="182" r="4" stroke={P.accent} strokeWidth="1.3" />
        <circle cx="44" cy="190" r="3.5" stroke={P.accent} strokeWidth="1.1" />

        {/* both maps converge on one operation */}
        <path d="M90 74 C 120 82, 136 102, 147 114" stroke={P.sub} strokeWidth="1.2" />
        <path d="M90 170 C 120 162, 136 134, 147 120" stroke={P.sub} strokeWidth="1.2" />
        <path d="M152 117 L188 117" stroke={P.ink} strokeWidth="1.4" />
        <path d="M182 113 L188 117 L182 121" stroke={P.ink} strokeWidth="1.4" />

        {/* rank-vs-rank plot */}
        <path d="M200 40 L200 205 L400 205" stroke={P.sub} strokeWidth="1.4" />
        <path d="M205 200 L395 48" stroke={P.line} strokeWidth="1.2" strokeDasharray="4 4" />
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill={P.accent} stroke="none" />)}
      </g>

      {/* labels left un-roughened for legibility */}
      <text x="20" y="30" style={SK} fontSize="9.5" fill={P.ink}>clean</text>
      <text x="20" y="140" style={SK} fontSize="9.5" fill={P.ink}>degraded</text>
      <text x="150" y="104" textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>flatten · rank</text>
      <text x="150" y="139" textAnchor="middle" style={SK} fontSize="8.4" fontStyle="italic" fill={P.sub}>magnitude discarded</text>

      <text x="200" y="32" style={SK} fontSize="8.6" fill={P.sub}>rank · degraded ↑</text>
      <text x="300" y="224" textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>importance rank · clean →</text>

      <text x="214" y="60" style={SK} fontSize="10" fill={P.accent}>ρ → 1</text>
      <text x="214" y="73" style={SK} fontSize="8.4" fill={P.sub}>same order,</text>
      <text x="214" y="84" style={SK} fontSize="8.4" fill={P.sub}>same structures</text>

      <text x="398" y="170" textAnchor="end" style={SK} fontSize="10" fill={P.red}>ρ → 0</text>
      <text x="398" y="182" textAnchor="end" style={SK} fontSize="8.4" fill={P.sub}>attention moved</text>
      <text x="398" y="193" textAnchor="end" style={SK} fontSize="8.4" fill={P.sub}>elsewhere</text>

      <text x="20" y="248" style={SK} fontSize="8.4" fontStyle="italic" fill={P.sub}>FOV-masked first — the black surround is one enormous tie, and ties inflate ρ.</text>
    </svg>
  );
}

/* ════════════════════════════════════════
   METRICS APPENDIX — the instruments, opened one at a time.
   The counterpart to the Lab: ARCHITECTURES answers "how does this work",
   METRICS answers "how do I know this number means anything". Every entry
   opens onto the same five parts, and the last of them is always the blind
   spot — a metric shown without one reads as a claim.
   ════════════════════════════════════════ */
export const METRIC_PARTS = [
  { k: "captures", label: "What it captures" },
  { k: "why", label: "Why this one, not the obvious alternative" },
  { k: "showed", label: "What it showed" },
  { k: "deployed", label: "Why it matters outside the notebook" },
  { k: "limit", label: "What it does not say", warn: true },
];

/* The five-part body of one instrument. Lives in the Instrument Room
   (#/metrics/<key>); `onProject` is optional and only wired on the paper. */
export function MetricParts({ m, onProject }) {
  return (
    <>
      <style>{`
        .mx-part{border-top:1px solid ${P.faint};padding:0.8rem 0 0}
        .mx-part+.mx-part{margin-top:0.6rem}
        .mx-plabel{font-family:'IBM Plex Mono',monospace;font-size:0.56rem;text-transform:uppercase;
          letter-spacing:0.1em;color:${P.sub};margin-bottom:5px}
        .mx-ptext{font-family:'Source Serif 4',Georgia,serif;font-size:0.94rem;line-height:1.78;
          color:${P.ink};max-width:640px;text-wrap:pretty}
        .mx-part[data-warn="true"]{border-left:2px solid ${P.red}55;padding-left:0.8rem}
        .mx-part[data-warn="true"] .mx-plabel{color:${P.red}}
        .mx-where{background:transparent;border:1px solid ${P.line};padding:2px 8px;
          font-family:'IBM Plex Mono',monospace;font-size:0.62rem;color:${P.sub};transition:all .15s}
        .mx-where[data-link="true"]{cursor:pointer}
        .mx-where[data-link="true"]:hover{border-color:${P.accent};color:${P.accent};background:${P.accentSoft}}
      `}</style>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: "1.1rem" }}>
        {/* an entry that was never scored cannot be "scored in" anything —
            it belongs to a project, and the label has to say so */}
        <span style={{ ...MONO, fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.1em", color: m.absent ? P.red : P.sub }}>
          {m.absent ? "would belong to" : "scored in"}
        </span>
        {m.where.map((w, j) => (
          <button key={w} className="mx-where" data-link={!!onProject} disabled={!onProject}
            onClick={() => onProject?.(m.projects?.[j] ?? m.projects?.[0])}>
            {w}{onProject ? " →" : ""}
          </button>
        ))}
      </div>

      {METRIC_PARTS.map((part) => (
        <div key={part.k} className="mx-part" data-warn={!!part.warn}>
          <div className="mx-plabel">{part.label}</div>
          <p className="mx-ptext">{m[part.k]}</p>
        </div>
      ))}
    </>
  );
}

/* ════════════════════════════════════════
   METRICS GATEWAY — the door on the paper's §6.
   Same shape as LabGateway, and for the same reason: ten instruments written
   out in full ran to several screens and swallowed the paper. The entries
   live in the Instrument Room (#/metrics) now; what stays here is a case that
   rotates through them. The notation *is* the glyph, so the symbol badge
   carries the display where the Lab uses a hand-drawn mark.
   ════════════════════════════════════════ */
export function MetricsGateway() {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (hover) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % METRICS.length), 3400);
    return () => clearInterval(t);
  }, [hover]);

  const cur = METRICS[i];
  const famCount = METRIC_FAMILIES.filter((f) => METRICS.some((m) => m.family === f)).length;
  const absent = METRICS.filter((m) => m.absent).length;

  return (
    <>
      <style>{`
        .mgate{display:block;width:100%;text-align:left;cursor:pointer;background:${P.paper2};
          border:1px solid ${P.line};border-top:2px solid ${P.ink};padding:0;
          transition:transform .18s ease,box-shadow .18s ease}
        .mgate:hover{transform:translateY(-2px);box-shadow:4px 4px 0 ${P.line}}
        .mgate:hover .mgate-cta{gap:12px}
        .mgate-cta{display:inline-flex;align-items:center;gap:7px;transition:gap .18s ease}
        .mgate-sym{font-family:'IBM Plex Mono',monospace;font-size:0.74rem;color:${P.accent};
          border:1px solid ${P.accent}44;padding:6px 10px;white-space:nowrap;flex-shrink:0}
        .mgate[data-absent="true"] .mgate-sym{border-style:dashed;color:${P.red};border-color:${P.red}66}
        .mgate-names{display:flex;flex-wrap:wrap;gap:5px}
        .mgate-name{background:transparent;border:1px solid ${P.line};cursor:pointer;
          padding:3px 9px;transition:border-color .15s,color .15s,background .15s}
        .mgate-name:hover{border-color:${P.accent};color:${P.accent};background:${P.accentSoft}}
        @media(max-width:560px){.mgate-sym{display:none}}
        @media(prefers-reduced-motion:reduce){.mgate,.mgate-cta{transition:none}}
      `}</style>

      <div
        className="mgate"
        role="link"
        tabIndex={0}
        data-absent={!!cur.absent}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => { window.location.hash = `#/metrics/${cur.key}`; }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.location.hash = `#/metrics/${cur.key}`; } }}
        aria-label={`Enter the Instrument Room — ${METRICS.length} metrics written out in full`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.1rem 1.2rem", borderBottom: `1px solid ${P.faint}`, minHeight: 96 }}>
          <span className="mgate-sym">{cur.symbol}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ ...MONO, fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.13em", color: P.sub, marginBottom: 3 }}>{cur.family}</div>
            <div style={{ ...DISP, fontWeight: 600, fontSize: "1.12rem", color: P.ink, lineHeight: 1.2 }}>{cur.name}</div>
            <div style={{ ...BODY, fontSize: "0.85rem", color: cur.absent ? P.red : P.sub, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cur.headline}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
            {METRICS.map((m, j) => (
              <span key={m.key} style={{ width: 5, height: 5, borderRadius: "50%", background: j === i ? P.accent : P.line }} />
            ))}
          </div>
        </div>

        <div style={{ padding: "0.85rem 1.2rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ ...MONO, fontSize: "0.62rem", color: P.sub }}>
            {METRICS.length} instruments · {famCount} families · <span style={{ color: P.red }}>{absent} deliberately not reported</span>
          </span>
          <span className="mgate-cta" style={{ ...MONO, fontSize: "0.76rem", color: P.accent, borderBottom: `1.5px solid ${P.accent}`, paddingBottom: 1 }}>
            Enter the Instrument Room <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>

      <div style={{ marginTop: "0.9rem" }}>
        <div className="mgate-names">
          {METRICS.map((m, j) => (
            <button
              key={m.key}
              className="mgate-name"
              onMouseEnter={() => { setHover(true); setI(j); }}
              onMouseLeave={() => setHover(false)}
              onClick={() => { window.location.hash = `#/metrics/${m.key}`; }}
              style={{ ...MONO, fontSize: "0.66rem", color: j === i ? P.accent : P.sub, borderColor: j === i ? P.accent : P.line }}
            >
              {m.short}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function InsightsViewer({ items }) {
  const [i, setI] = useState(0);
  const it = items[i];
  const go = (d) => setI((i + d + items.length) % items.length);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {it.tag} · figure {i + 1} / {items.length}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => go(-1)} aria-label="Previous figure" style={{ ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" }}>←</button>
          <button onClick={() => go(1)} aria-label="Next figure" style={{ ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" }}>→</button>
        </div>
      </div>

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff", minHeight: 60 }}>
          {it.sketch === "saturating"
            ? <div style={{ aspectRatio: "400 / 230" }}><SketchSaturating /></div>
            : <img key={it.src} src={it.src} alt={it.title} style={{ width: "100%", display: "block", animation: "fadeUp 0.3s ease" }} />}
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{it.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty" }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>Insight</span>
            {it.insight}
          </p>
        </div>
      </div>

      {/* thumbnail rail */}
      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {items.map((m, j) => (
          <button key={j} onClick={() => setI(j)} aria-label={m.title} title={m.title}
            style={{ width: 58, height: 40, overflow: "hidden", padding: 0, cursor: "pointer", background: "#fff",
              border: `1px solid ${j === i ? P.accent : P.line}`, outline: j === i ? `1px solid ${P.accent}` : "none" }}>
            {m.sketch === "saturating"
              ? <div style={{ ...SK, fontSize: "0.5rem", color: P.sub, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>GAN ∇</div>
              : <img src={m.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: j === i ? 1 : 0.55 }} />}
          </button>
        ))}
      </div>
    </div>
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
    { key: "milestone", label: "Milestones" },
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
      ctx.fillStyle = "rgba(244,240,224,0.06)";
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
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: P.ink, ...MONO, fontSize: "1rem", textAlign: "center", background: "rgba(244,240,224,0.85)", padding: "1.4rem 2.4rem", border: `1px solid ${P.line}` }}>
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

/* ════════════════════════════════════════
   MRNET WALKTHROUGH — the slice → series → study ladder, and the single
   operation that does all the work on the bottom rung.

   The paper (Bien et al., PLOS Medicine 2018) is the direct ancestor of the
   2026 RSNA knee-MRI task, so this bench is aimed at one question: what
   exactly happens when ~30 slices become one vector, and what does that
   choice quietly decide about which findings the model can still see.

   Two design rules, both load-bearing:

   · Every number printed is computed at render time from MRN_GRID and
     MRN_PROFILES below — no figure is hand-typed next to a grid it might
     drift away from.
   · MRN_PROFILES.focal and .sustained are built to share an identical
     maximum (0.85) while differing 2.4× in mean. That collision is the whole
     argument of step 3, so it lives in the data rather than in a caption.
   ════════════════════════════════════════ */

/* Post-backbone activations for one series: 10 slices × 8 features.
   Hand-set so the column maxima land on four *different* slices — the
   scatter is the lesson of step 2, not an accident of random numbers. */
const MRN_GRID = [
  [0.12, 0.08, 0.20, 0.11, 0.09, 0.72, 0.14, 0.10],
  [0.15, 0.10, 0.24, 0.13, 0.11, 0.88, 0.17, 0.12],
  [0.18, 0.14, 0.31, 0.15, 0.12, 0.79, 0.21, 0.15],
  [0.22, 0.35, 0.36, 0.18, 0.14, 0.44, 0.28, 0.19],
  [0.26, 0.91, 0.39, 0.22, 0.17, 0.21, 0.33, 0.24],
  [0.24, 0.84, 0.41, 0.26, 0.19, 0.18, 0.36, 0.27],
  [0.21, 0.29, 0.44, 0.31, 0.23, 0.16, 0.41, 0.31],
  [0.19, 0.16, 0.47, 0.38, 0.29, 0.14, 0.55, 0.36],
  [0.16, 0.12, 0.43, 0.52, 0.37, 0.12, 0.68, 0.44],
  [0.13, 0.09, 0.35, 0.61, 0.86, 0.10, 0.74, 0.58],
];
/* The two features given a clinical reading in the caption. Deliberately
   only two — the rest are unnamed because in a real network they are. */
const MRN_FEAT_NOTE = { 1: "edge disruption — the tear", 5: "fluid signal — effusion" };

const mrnCol = (j) => MRN_GRID.map((r) => r[j]);
const mrnArgmax = (j) => {
  const c = mrnCol(j), v = Math.max(...c);
  return { v, at: c.indexOf(v) };
};

/* Three activation profiles down one feature's slice axis.
   focal and sustained share max = 0.85 by construction. */
const MRN_PROFILES = [
  { key: "focal", label: "focal tear", blurb: "two bright slices, quiet everywhere else",
    x: [0.05, 0.06, 0.07, 0.09, 0.85, 0.78, 0.10, 0.07, 0.05, 0.04] },
  { key: "sustained", label: "same peak, sustained", blurb: "identical maximum, six slices wide",
    x: [0.05, 0.06, 0.85, 0.83, 0.80, 0.79, 0.81, 0.77, 0.07, 0.05] },
  { key: "diffuse", label: "diffuse effusion", blurb: "lit right across the stack, never spikes",
    x: [0.38, 0.42, 0.44, 0.41, 0.45, 0.43, 0.46, 0.42, 0.40, 0.39] },
];

/* softmax(x/T) weights, and the weighted sum they produce.
   T → 0 recovers max; T → ∞ recovers mean. That is the entire point of the
   temperature knob in step 3, so it is computed rather than claimed. */
function mrnAttend(x, T) {
  const s = x.map((v) => v / T), m = Math.max(...s);
  const e = s.map((v) => Math.exp(v - m)), Z = e.reduce((a, b) => a + b, 0);
  const w = e.map((v) => v / Z);
  return { w, pooled: w.reduce((a, wi, i) => a + wi * x[i], 0) };
}

/* Reported AUCs. Internal validation is single-site (Stanford, GE scanners);
   the external pair is the Croatian set, before and after retraining. */
const MRN_AUC = [
  { task: "Abnormality", auc: 0.937 },
  { task: "ACL tear", auc: 0.965 },
  { task: "Meniscus tear", auc: 0.847 },
];
const MRN_SHIFT = [
  { label: "internal", sub: "Stanford · GE", v: 0.965, col: "green" },
  { label: "external", sub: "Croatia · Siemens", v: 0.824, col: "red" },
  { label: "after retraining", sub: "on the new site", v: 0.911, col: "accent" },
];

const MRN_STEPS = [
  {
    key: "ladder", label: "the ladder",
    title: "Slice, series, study — and the same verb twice",
    body: "Get the vocabulary airtight first, because almost every confusion downstream starts here. A slice is one cross-section. A series is a full stack of slices sharing one angle and one setting — sagittal T2 is a series, coronal T1 is a different one — so within a series, angle and setting are locked; only the position along the knee changes. A study is one knee exam: several series bundled. The correction worth internalising is that \"various angles\" belongs at the study level, never the slice level. MRNet then climbs this ladder in two moves, and both moves are the same verb — collapse a group into one summary. Slices collapse into a series verdict by max-pooling; series collapse into an exam verdict by a learned weighted vote. Once that lands, \"three series\" can never again misread as \"three knees\": they are three camera angles on one joint.",
    math: "slice → (max-pool) → series → (logistic regression) → study   ·   RSNA: 24,371 series ÷ 4,407 studies ≈ 5.5 series per knee",
  },
  {
    key: "pool", label: "max across slices",
    title: "The slice axis disappears; the feature axis survives",
    body: "Here is the operation everything rests on. Run every slice through the backbone alone and you get a grid — slices down, features across. Max-pooling runs down each column independently: for every feature, keep its single highest value anywhere in the stack. Ten slices by eight features becomes eight numbers, and the slice axis is gone. The subtlety that makes it work is that different features are free to peak on different slices, and that is desirable rather than sloppy. Click any column below. Feature 1 peaks where the tear is; feature 5 peaks on a completely different slice, where fluid is brightest. The pooled vector therefore says \"strong edge disruption somewhere\" and \"strong fluid signal somewhere\" at the same time — carrying two findings that never once co-occurred on a single slice. Max-pooling never keeps a slice. It keeps values, and forgets where each one came from.",
    math: "vⱼ = maxᵢ Xᵢⱼ   for each feature j independently   ·   (10 × 8) → (8),  argmax recorded nowhere",
  },
  {
    key: "rule", label: "max is an opinion",
    title: "\"The finding is the peak slice\" is an assumption, not a law",
    body: "Max-pooling encodes a specific bet: whatever matters shows up as a spike. For focal findings — an ACL tear, a meniscal tear, a fracture — that is exactly right, and it is why a 2-slice signal survives instead of being diluted by 28 quiet ones. For diffuse findings it fails, and the failure is silent. Compare the first two profiles: their maxima are identical to three decimals, so max returns the same number for both, even though one carries roughly two and a half times the total evidence. Max has no notion of how many slices lit up, only of how bright the brightest was. Averaging fails in the mirror image — it dilutes the focal spike into the quiet slices around it. Attention pooling is the modern repair: learn a weight per slice and take a weighted sum, concentrating on two slices for a tear or spreading across twenty for an effusion. Drag the temperature and watch it sweep the whole range between the two failure modes.",
    math: "max = maxᵢ xᵢ    mean = (1/n) Σ xᵢ    attention = Σᵢ wᵢxᵢ,  w = softmax(x / T)   ·   T→0 ⇒ max,  T→∞ ⇒ mean",
  },
  {
    key: "fuse", label: "series → exam",
    title: "Nine small models and a readable weighted vote",
    body: "The second rung. MRNet trains a separate small CNN per series and per task — three series times three tasks is nine networks — then combines the three per-series probabilities with plain logistic regression: a learned weighted average, one weight per series. The choice of something so simple is deliberate. It trains in seconds, and more importantly its weights are readable: inspecting them showed axial mattering most for meniscus and coronal most for ACL, which is what a radiologist would have told you in advance. That agreement is a sanity check a large fusion network would have bought at the price of telling you nothing about why. The wrinkle for OrthoVision is structural: MRNet had exactly three clean series per knee, so a fixed three-weight combiner fitted perfectly. RSNA data is ragged — 5.5 series per study on average, some knees with four, some with fourteen, some missing a plane entirely. A fixed-width vote has nowhere to put the fourteenth series, which is an argument for attention-style pooling at the series rung too, not only at the slice rung.",
    math: "p_task = σ( Σ_series β_s · p_s )   ·   MRNet: |series| = 3, fixed   ·   RSNA: |series| ∈ [3, 14], ragged",
  },
  {
    key: "shift", label: "the number to quote",
    title: "It looked near-perfect at home, then met a different scanner",
    body: "The result that should shape the whole strategy. Trained and validated at one hospital on GE scanners, MRNet read ACL tears at 0.965 AUC. Pointed at a Croatian set — Siemens hardware, T1 where Stanford had T2, different labelling conventions — the same weights fell to 0.824 with no retraining, and only climbed back to 0.911 after being retrained on the new site's data. Nothing about the model changed; the machine did. That is domain shift, and the reason it matters here is arithmetic: MRNet was validated across one institution, while the RSNA test set spans sixteen across five continents. Any leaderboard score measured on data resembling the training distribution will overstate performance on unseen sites. Note also the ranking that holds across all three tasks — meniscus is the weakest at 0.847, and meniscal tears really are the hardest of the three. Expect that ordering to survive into OrthoVision.",
    math: "ACL AUC:  0.965 internal  →  0.824 external  →  0.911 after site-specific retraining   ·   1 institution → 16",
  },
];

export function MRNetWalkthrough() {
  const [step, setStep] = useState(0);
  const [featSel, setFeatSel] = useState(1);
  const [prof, setProf] = useState("focal");
  const [tempI, setTempI] = useState(3);
  const sc = MRN_STEPS[step];
  const sk = sc.key;

  const arrow = (x1, y1, x2, y2, col, dash) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const w = 4, len = 7;
    return (
      <g stroke={col || P.accent} strokeWidth="1.3" fill="none">
        <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
        <path d={`M${x2 - len * Math.cos(a) - w * Math.sin(a)} ${y2 - len * Math.sin(a) + w * Math.cos(a)} L${x2} ${y2} L${x2 - len * Math.cos(a) + w * Math.sin(a)} ${y2 - len * Math.sin(a) - w * Math.cos(a)}`} />
      </g>
    );
  };
  const box = (x, y, w, h, label, sub, col, soft) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={soft ? P.accentSoft : P.paper2} stroke={col || P.ink} strokeWidth="1.2" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 1 : h / 2 + 4)} textAnchor="middle" style={SK} fontSize="10" fill={col || P.ink}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" style={SK} fontSize="8.2" fill={P.sub}>{sub}</text>}
    </g>
  );
  /* one slice stack, drawn as n offset rectangles */
  const stack = (x, y, n, w, h, col, off = 2.6) => (
    <g>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={x + (n - 1 - i) * off} y={y + (n - 1 - i) * off} width={w} height={h}
          fill={i === n - 1 ? P.paper2 : P.faint} stroke={i === n - 1 ? col : P.line} strokeWidth={i === n - 1 ? 1.2 : 0.6} />
      ))}
    </g>
  );

  const TEMPS = [0.02, 0.05, 0.12, 0.3, 0.8, 3.0, 20];
  const T = TEMPS[tempI];
  const pf = MRN_PROFILES.find((p) => p.key === prof) || MRN_PROFILES[0];
  const pMax = Math.max(...pf.x);
  const pMean = pf.x.reduce((a, b) => a + b, 0) / pf.x.length;
  const att = mrnAttend(pf.x, T);

  const body = (() => {
    switch (sk) {
      case "ladder": {
        const SER = [
          { n: "sagittal T2", c: P.accent },
          { n: "coronal T1", c: P.green },
          { n: "axial PD", c: P.yellow },
        ];
        return (
          <g>
            <text x={300} y={17} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>every rung does the same thing — collapse a group into one summary</text>

            {/* rung 1 — a single slice */}
            <text x={68} y={44} textAnchor="middle" style={SK} fontSize="8.6" fill={P.sub} letterSpacing="0.1em">SLICE</text>
            <rect x={40} y={54} width={56} height={56} fill={P.paper2} stroke={P.ink} strokeWidth="1.3" />
            {Array.from({ length: 7 }).map((_, i) => (
              <g key={i} stroke={P.line} strokeWidth="0.4">
                <line x1={40 + (i + 1) * 7} y1={54} x2={40 + (i + 1) * 7} y2={110} />
                <line x1={40} y1={54 + (i + 1) * 7} x2={96} y2={54 + (i + 1) * 7} />
              </g>
            ))}
            <text x={68} y={126} textAnchor="middle" style={SK} fontSize="8.2" fill={P.ink}>one cross-section</text>
            <text x={68} y={138} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>no label of its own</text>

            {arrow(104, 82, 138, 82)}
            <text x={121} y={74} textAnchor="middle" style={SK} fontSize="7.6" fill={P.accent}>×30</text>

            {/* rung 2 — a series */}
            <text x={196} y={44} textAnchor="middle" style={SK} fontSize="8.6" fill={P.sub} letterSpacing="0.1em">SERIES</text>
            {stack(146, 54, 5, 76, 56, P.accent)}
            <text x={196} y={132} textAnchor="middle" style={SK} fontSize="8.2" fill={P.ink}>one angle, one setting</text>
            <text x={196} y={144} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>both locked inside a series</text>

            {arrow(240, 82, 276, 82)}
            <text x={258} y={74} textAnchor="middle" style={SK} fontSize="7.6" fill={P.accent}>×5.5</text>

            {/* rung 3 — a study */}
            <text x={352} y={44} textAnchor="middle" style={SK} fontSize="8.6" fill={P.sub} letterSpacing="0.1em">STUDY</text>
            <rect x={286} y={50} width={134} height={92} fill="none" stroke={P.ink} strokeWidth="1.1" strokeDasharray="4 3" />
            {SER.map((s, i) => (
              <g key={s.n}>
                {stack(296, 58 + i * 28, 3, 44, 20, s.c, 1.8)}
                <text x={350} y={72 + i * 28} style={SK} fontSize="8" fill={s.c}>{s.n}</text>
              </g>
            ))}
            <text x={352} y={156} textAnchor="middle" style={SK} fontSize="8.2" fill={P.ink}>one knee exam</text>
            <text x={352} y={168} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>angle varies BETWEEN series</text>

            {arrow(426, 96, 458, 96)}
            {box(462, 74, 106, 44, "one verdict", "per finding", P.ink, true)}
            <text x={515} y={132} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>labels attach here</text>

            <line x1={40} y1={196} x2={568} y2={196} stroke={P.line} strokeWidth="0.8" />
            <text x={40} y={216} style={SK} fontSize="9.4" fill={P.ink}>the two collapses:  slices → series by <tspan fill={P.accent}>max-pooling</tspan>,  series → study by a <tspan fill={P.accent}>learned weighted vote</tspan>.</text>
            <text x={40} y={236} style={SK} fontSize="9.2" fill={P.sub}>“various angles” is a property of the <tspan fill={P.ink}>study</tspan>, never of a slice. inside one series, angle and setting never change.</text>
            <text x={40} y={262} style={SK} fontSize="9.2" fill={P.red}>because the label lives at study level, you cannot train slice-by-slice — a lone slice has no label to learn from.</text>
            <text x={40} y={280} style={SK} fontSize="8.6" fontStyle="italic" fill={P.sub}>which is also why the split must be made on StudyInstanceUID: share a knee across the split and the model recognises it rather than reads it.</text>
          </g>
        );
      }

      case "pool": {
        const GX = 96, GY = 48, CW = 46, CH = 13.6, NC = 8, NR = 10;
        const sel = mrnArgmax(featSel);
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>one series after the backbone — click a feature column</text>

            {/* column headers */}
            {Array.from({ length: NC }).map((_, j) => (
              <text key={j} x={GX + j * CW + CW / 2} y={GY - 6} textAnchor="middle" style={SK} fontSize="8.4"
                fill={j === featSel ? P.accent : P.sub}>f{j}</text>
            ))}
            {/* row labels */}
            {Array.from({ length: NR }).map((_, i) => (
              <text key={i} x={GX - 7} y={GY + i * CH + 10} textAnchor="end" style={SK} fontSize="7.8"
                fill={i === sel.at ? P.accent : P.sub}>slice_{i}</text>
            ))}

            {/* the grid itself */}
            {MRN_GRID.map((row, i) => row.map((v, j) => {
              const win = j === featSel && i === sel.at;
              return (
                <rect key={`${i}-${j}`} x={GX + j * CW} y={GY + i * CH} width={CW - 1} height={CH - 1}
                  fill={j === featSel ? P.accent : P.ink} fillOpacity={0.05 + v * 0.72}
                  stroke={win ? P.red : P.line} strokeWidth={win ? 1.6 : 0.3}
                  style={{ cursor: "pointer" }} onClick={() => setFeatSel(j)} />
              );
            }))}

            {/* the collapse */}
            {Array.from({ length: NC }).map((_, j) => (
              <g key={j} opacity={j === featSel ? 1 : 0.32}>
                {arrow(GX + j * CW + CW / 2, GY + NR * CH + 2, GX + j * CW + CW / 2, GY + NR * CH + 20,
                  j === featSel ? P.accent : P.line)}
              </g>
            ))}

            {/* the pooled vector */}
            {Array.from({ length: NC }).map((_, j) => {
              const m = mrnArgmax(j);
              return (
                <g key={j}>
                  <rect x={GX + j * CW} y={GY + NR * CH + 22} width={CW - 1} height={20}
                    fill={j === featSel ? P.accent : P.ink} fillOpacity={0.06 + m.v * 0.7}
                    stroke={j === featSel ? P.accent : P.ink} strokeWidth={j === featSel ? 1.5 : 0.7} />
                  <text x={GX + j * CW + CW / 2} y={GY + NR * CH + 36} textAnchor="middle" style={SK} fontSize="8"
                    fill={m.v > 0.55 ? "#fff" : P.ink}>{m.v.toFixed(2)}</text>
                  <text x={GX + j * CW + CW / 2} y={GY + NR * CH + 54} textAnchor="middle" style={SK} fontSize="7"
                    fill={j === featSel ? P.red : P.sub}>s{m.at}</text>
                </g>
              );
            })}
            <text x={GX - 7} y={GY + NR * CH + 36} textAnchor="end" style={SK} fontSize="8" fill={P.ink}>pooled</text>
            <text x={GX - 7} y={GY + NR * CH + 54} textAnchor="end" style={SK} fontSize="7" fill={P.sub}>won by</text>

            <text x={GX + NC * CW + 8} y={GY + 42} style={SK} fontSize="8.4" fill={P.accent}>f{featSel} → {sel.v.toFixed(2)}</text>
            <text x={GX + NC * CW + 8} y={GY + 56} style={SK} fontSize="8" fill={P.red}>peaks on slice_{sel.at}</text>
            {MRN_FEAT_NOTE[featSel] && (
              <text x={GX + NC * CW + 8} y={GY + 72} style={SK} fontSize="7.6" fill={P.sub}>{MRN_FEAT_NOTE[featSel]}</text>
            )}

            <text x={40} y={280} style={SK} fontSize="9.2" fill={P.ink}>
              the winners sit on slices <tspan fill={P.accent}>{[...new Set(Array.from({ length: NC }, (_, j) => mrnArgmax(j).at))].sort((a, b) => a - b).join(", ")}</tspan> — different features, different slices, and that is the point.
            </text>
          </g>
        );
      }

      case "rule": {
        const X0 = 52, BW = 25, GAP = 7, BASE = 188, HMAX = 118;
        const sx = (i) => X0 + i * (BW + GAP);
        const wMax = Math.max(...att.w);
        const RX = 392, RW = 168;
        const rows = [
          { k: "max", v: pMax, c: P.red, note: "peak only" },
          { k: "mean", v: pMean, c: P.sub, note: "every slice equally" },
          { k: "attention", v: att.pooled, c: P.accent, note: `softmax(x / ${T})` },
        ];
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>one feature's activation down the slice axis — {pf.blurb}</text>

            {/* the profile */}
            {pf.x.map((v, i) => (
              <g key={i}>
                <rect x={sx(i)} y={BASE - v * HMAX} width={BW} height={v * HMAX}
                  fill={P.ink} fillOpacity={0.16 + v * 0.5} stroke={P.line} strokeWidth="0.4" />
                <text x={sx(i) + BW / 2} y={BASE + 11} textAnchor="middle" style={SK} fontSize="7" fill={P.sub}>{i}</text>
              </g>
            ))}
            <line x1={X0 - 4} y1={BASE} x2={sx(9) + BW + 4} y2={BASE} stroke={P.ink} strokeWidth="0.9" />
            <text x={X0 - 8} y={BASE - HMAX + 4} textAnchor="end" style={SK} fontSize="7.4" fill={P.sub}>1.0</text>
            <text x={X0 - 8} y={BASE + 3} textAnchor="end" style={SK} fontSize="7.4" fill={P.sub}>0</text>

            {/* where attention is putting its mass */}
            <path d={`M${pf.x.map((_, i) => `${sx(i) + BW / 2} ${BASE - 6 - (att.w[i] / wMax) * 26}`).join(" L")}`}
              fill="none" stroke={P.accent} strokeWidth="1.5" strokeDasharray="3 2" />
            {pf.x.map((_, i) => (
              <circle key={i} cx={sx(i) + BW / 2} cy={BASE - 6 - (att.w[i] / wMax) * 26} r="1.9" fill={P.accent} />
            ))}
            {/* legend for the dashed overlay — parked top-left, clear of the
                readout panel on the right */}
            <line x1={X0} y1={41} x2={X0 + 18} y2={41} stroke={P.accent} strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx={X0 + 9} cy={41} r="1.9" fill={P.accent} />
            <text x={X0 + 24} y={44} style={SK} fontSize="7.6" fill={P.accent}>attention weight per slice</text>

            {/* the three readouts */}
            <line x1={RX - 14} y1={34} x2={RX - 14} y2={196} stroke={P.line} strokeWidth="0.8" />
            {rows.map((r, i) => (
              <g key={r.k}>
                <text x={RX} y={48 + i * 52} style={SK} fontSize="9" fill={r.c}>{r.k}</text>
                <text x={RX + RW} y={48 + i * 52} textAnchor="end" style={SK} fontSize="11" fill={P.ink}>{r.v.toFixed(3)}</text>
                <rect x={RX} y={54 + i * 52} width={RW} height={9} fill={P.faint} stroke="none" />
                <rect x={RX} y={54 + i * 52} width={RW * r.v} height={9} fill={r.c} fillOpacity="0.55" stroke="none" />
                <text x={RX} y={76 + i * 52} style={SK} fontSize="7.4" fill={P.sub}>{r.note}</text>
              </g>
            ))}

            <line x1={40} y1={212} x2={568} y2={212} stroke={P.line} strokeWidth="0.8" />
            <text x={40} y={232} style={SK} fontSize="9.2" fill={P.ink}>
              max = <tspan fill={P.red}>{pMax.toFixed(2)}</tspan> · mean = <tspan fill={P.sub}>{pMean.toFixed(3)}</tspan> · attention at T={T} = <tspan fill={P.accent}>{att.pooled.toFixed(3)}</tspan>
            </text>
            <text x={40} y={252} style={SK} fontSize="9" fill={P.sub}>
              {prof === "focal" && "a two-slice finding survives intact — this is the case max-pooling was designed for."}
              {prof === "sustained" && "same max as the focal profile, 2.4× the mean. max returns an identical number for a very different volume."}
              {prof === "diffuse" && "nothing ever spikes, so max reports 0.46 and the fact that all ten slices lit up is thrown away."}
            </text>
            <text x={40} y={272} style={SK} fontSize="8.6" fontStyle="italic" fill={P.accent}>
              {T <= 0.05 ? "T is tiny — attention has collapsed onto the argmax. this IS max-pooling."
                : T >= 3 ? "T is large — the weights have flattened. this IS mean-pooling."
                  : "between the two extremes: weight concentrated, but not all on one slice."}
            </text>
          </g>
        );
      }

      case "fuse": {
        const SER = [
          { n: "sagittal T2", p: 0.71, c: P.accent, y: 52 },
          { n: "coronal T1", p: 0.88, c: P.green, y: 104 },
          { n: "axial PD", p: 0.34, c: P.yellow, y: 156 },
        ];
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>three views of ONE knee — not three knees</text>

            {SER.map((s) => (
              <g key={s.n}>
                {stack(34, s.y, 3, 74, 34, s.c, 2)}
                <text x={71} y={s.y + 21} textAnchor="middle" style={SK} fontSize="8" fill={s.c}>{s.n}</text>
                {arrow(114, s.y + 17, 140, s.y + 17, P.line)}
                {box(142, s.y - 1, 92, 36, "CNN", "+ max-pool", P.ink)}
                {arrow(238, s.y + 17, 264, s.y + 17, P.line)}
                <text x={286} y={s.y + 21} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>{s.p.toFixed(2)}</text>
                {arrow(306, s.y + 17, 356, 122, P.line)}
              </g>
            ))}

            {box(358, 96, 118, 52, "logistic", "regression", P.accent, true)}
            {arrow(480, 122, 508, 122)}
            <text x={548} y={118} textAnchor="middle" style={SK} fontSize="13" fill={P.ink}>0.79</text>
            <text x={548} y={134} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>ACL tear</text>

            <text x={417} y={166} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>one weight per series</text>
            <text x={417} y={177} textAnchor="middle" style={SK} fontSize="7.8" fill={P.accent}>and they are readable</text>

            <text x={34} y={206} style={SK} fontSize="8.8" fill={P.sub}>3 series × 3 tasks = <tspan fill={P.ink}>9 small CNNs</tspan>, then a vote that trains in seconds</text>

            <line x1={34} y1={218} x2={568} y2={218} stroke={P.line} strokeWidth="0.8" />
            <text x={34} y={236} style={SK} fontSize="9.2" fill={P.ink}>inspecting the learned weights: <tspan fill={P.accent}>axial mattered most for meniscus, coronal for ACL</tspan> — matching radiologist intuition.</text>
            <text x={34} y={254} style={SK} fontSize="9" fill={P.sub}>a big fusion network would score the same and tell you nothing about why. that readability is the reason to keep it dumb.</text>
            <text x={34} y={274} style={SK} fontSize="9" fill={P.red}>the wrinkle for RSNA: MRNet always had exactly 3 series. real data is ragged — 3 to 14 per knee, and planes missing.</text>
            <text x={34} y={288} style={SK} fontSize="9" fill={P.red}>a fixed 3-weight vote has nowhere to put the 14th — an argument for attention at the series rung too, not just the slice rung.</text>
          </g>
        );
      }

      case "shift": {
        /* bars kept inside x < 420 so the internal-AUC table at x = 448 has
           clear air — at the original widths the third bar ran under it */
        const BX = 76, BW = 84, GAP = 44, BASE = 196, Y0 = 0.75, HMAX = 132;
        const hOf = (v) => ((v - Y0) / (1 - Y0)) * HMAX;
        const COL = { green: P.green, red: P.red, accent: P.accent };
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>ACL tear — the same weights, three settings</text>

            {/* truncated axis, called out rather than hidden */}
            <line x1={BX - 26} y1={BASE} x2={424} y2={BASE} stroke={P.ink} strokeWidth="0.9" />
            {[0.80, 0.85, 0.90, 0.95, 1.0].map((t) => (
              <g key={t}>
                <line x1={BX - 26} y1={BASE - hOf(t)} x2={424} y2={BASE - hOf(t)} stroke={P.line} strokeWidth="0.4" strokeDasharray="2 3" />
                <text x={BX - 30} y={BASE - hOf(t) + 3} textAnchor="end" style={SK} fontSize="7.2" fill={P.sub}>{t.toFixed(2)}</text>
              </g>
            ))}
            <text x={BX - 30} y={BASE + 3} textAnchor="end" style={SK} fontSize="7.2" fill={P.red}>0.75</text>

            {MRN_SHIFT.map((s, i) => {
              const x = BX + i * (BW + GAP);
              return (
                <g key={s.label}>
                  <rect x={x} y={BASE - hOf(s.v)} width={BW} height={hOf(s.v)} fill={COL[s.col]} fillOpacity="0.3" stroke={COL[s.col]} strokeWidth="1.3" />
                  <text x={x + BW / 2} y={BASE - hOf(s.v) - 8} textAnchor="middle" style={SK} fontSize="12" fill={COL[s.col]}>{s.v.toFixed(3)}</text>
                  <text x={x + BW / 2} y={BASE + 14} textAnchor="middle" style={SK} fontSize="8.6" fill={P.ink}>{s.label}</text>
                  <text x={x + BW / 2} y={BASE + 25} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>{s.sub}</text>
                </g>
              );
            })}

            {/* the drop */}
            {arrow(BX + BW + 6, BASE - hOf(0.965) - 2, BX + BW + GAP - 6, BASE - hOf(0.824) - 2, P.red)}
            <text x={BX + BW + GAP / 2} y={BASE - hOf(0.9) - 26} textAnchor="middle" style={SK} fontSize="9.6" fill={P.red}>−0.141</text>
            <text x={BX + BW + GAP / 2} y={BASE - hOf(0.9) - 15} textAnchor="middle" style={SK} fontSize="7.4" fill={P.red}>no retraining</text>

            <line x1={440} y1={44} x2={440} y2={186} stroke={P.line} strokeWidth="0.8" />
            <text x={452} y={54} style={SK} fontSize="8" fill={P.sub} letterSpacing="0.08em">INTERNAL — ALL THREE TASKS</text>
            {MRN_AUC.map((a, i) => (
              <g key={a.task}>
                <text x={452} y={72 + i * 15} style={SK} fontSize="7.8" fill={a.auc < 0.9 ? P.red : P.ink}>{a.task}</text>
                <text x={568} y={72 + i * 15} textAnchor="end" style={SK} fontSize="7.8" fill={a.auc < 0.9 ? P.red : P.ink}>{a.auc.toFixed(3)}</text>
              </g>
            ))}
            <text x={452} y={136} style={SK} fontSize="7.2" fontStyle="italic" fill={P.sub}>meniscus is genuinely the</text>
            <text x={452} y={146} style={SK} fontSize="7.2" fontStyle="italic" fill={P.sub}>hardest of the three — expect</text>
            <text x={452} y={156} style={SK} fontSize="7.2" fontStyle="italic" fill={P.sub}>that ordering to survive</text>

            <line x1={34} y1={234} x2={568} y2={234} stroke={P.line} strokeWidth="0.8" />
            <text x={34} y={252} style={SK} fontSize="9.2" fill={P.ink}>y-axis starts at <tspan fill={P.red}>0.75</tspan>, not 0 — the drop is real, but a truncated axis always flatters it. read the numbers, not the bars.</text>
            <text x={34} y={272} style={SK} fontSize="9.2" fill={P.accent}>MRNet was validated across 1 institution. the RSNA test set spans 16, on 5 continents. a leaderboard score will overstate what holds elsewhere.</text>
          </g>
        );
      }

      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };
  const pill = (on) => ({ ...SK, fontSize: "0.68rem", padding: "3px 11px", cursor: "pointer", border: `1px solid ${on ? P.accent : P.line}`, background: on ? P.accentSoft : P.paper2, color: on ? P.accent : P.sub });
  const N = MRN_STEPS.length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>MRNet · Bien et al. 2018 · the ancestor of the RSNA knee task</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {N}</span>
          <button onClick={() => setStep((step + N - 1) % N)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % N)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      {sk === "pool" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub }}>inspect feature:</span>
          {MRN_GRID[0].map((_, j) => (
            <button key={j} onClick={() => setFeatSel(j)} style={pill(j === featSel)}>f{j}</button>
          ))}
        </div>
      )}

      {sk === "rule" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          {MRN_PROFILES.map((p) => (
            <button key={p.key} onClick={() => setProf(p.key)} style={pill(prof === p.key)}>{p.label}</button>
          ))}
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, marginLeft: 6 }}>T =</span>
          <input type="range" min={0} max={TEMPS.length - 1} step={1} value={tempI} onChange={(e) => setTempI(+e.target.value)} aria-label="attention temperature" style={{ accentColor: P.accent, width: 120 }} />
          <span style={{ ...SK, fontSize: "0.66rem", color: P.ink, minWidth: 40 }}>{T}</span>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.accent }}>{T <= 0.05 ? "→ max" : T >= 3 ? "→ mean" : "between"}</span>
        </div>
      )}

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`MRNet walkthrough step ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {MRN_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   AUTOENCODER WALKTHROUGH — the bottleneck, the rotation that costs nothing,
   and the four ways the field widened the layer back out again.

   The spine of this sketch is one fixed 10×6 dataset with two real factors
   buried in six measured dimensions. Everything on screen is computed from
   it at render time — the eigenspectrum, the reconstruction error at each k,
   the sweep in step 2, the denoising residuals in step 4. Nothing is quoted.

   The load-bearing demonstration is step 2. A linear AE's loss is invariant
   to any invertible map applied to the code, so rotating the top-2 basis
   leaves the error identical to six decimal places while the loadings swing
   from "a d3/d4 detector" to "a d1/d2 detector". That symmetry is exactly
   what sparsity breaks in step 3, and it's why the SAE came back for LLMs
   in step 6.
   ════════════════════════════════════════ */

/* Ten samples, six measured dims, two factors: d1≈d2, d3≈d4, d5/d6 ~ noise. */
const AE_X = [
  [2.10, 1.92, -1.48, -1.61, 0.42, -0.31],
  [-1.72, -1.55, 1.21, 1.34, -0.28, 0.19],
  [1.44, 1.31, -0.95, -1.02, -0.51, 0.44],
  [-0.62, -0.48, 1.88, 1.72, 0.33, -0.22],
  [0.95, 1.12, 1.55, 1.41, -0.39, 0.28],
  [-2.05, -1.88, -1.32, -1.19, 0.47, -0.36],
  [1.68, 1.49, 0.88, 0.96, 0.29, -0.18],
  [-1.21, -1.34, -1.71, -1.58, -0.44, 0.33],
  [0.38, 0.22, -1.92, -1.81, 0.51, -0.41],
  [-0.95, -0.81, 1.86, 1.78, -0.40, 0.24],
];

/* Jacobi eigendecomposition — the covariance is symmetric 6×6, so a few
   sweeps of plane rotations converge well below anything the screen shows. */
function aeJacobi(Ain, iters = 120) {
  const n = Ain.length;
  const A = Ain.map((r) => r.slice());
  const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let s = 0; s < iters; s++) {
    let p = 0, q = 1, off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      off += A[i][j] ** 2;
      if (Math.abs(A[i][j]) > Math.abs(A[p][q])) { p = i; q = j; }
    }
    if (Math.sqrt(off) < 1e-12) break;
    const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
    const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
    const c = 1 / Math.sqrt(t * t + 1), sn = t * c;
    for (let k = 0; k < n; k++) { const a = A[k][p], b = A[k][q]; A[k][p] = c * a - sn * b; A[k][q] = sn * a + c * b; }
    for (let k = 0; k < n; k++) { const a = A[p][k], b = A[q][k]; A[p][k] = c * a - sn * b; A[q][k] = sn * a + c * b; }
    for (let k = 0; k < n; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = c * a - sn * b; V[k][q] = sn * a + c * b; }
  }
  const ev = A.map((r, i) => r[i]);
  const ord = ev.map((_, i) => i).sort((a, b) => ev[b] - ev[a]);
  return { vals: ord.map((i) => ev[i]), vecs: ord.map((i) => V.map((r) => r[i])) };
}

/* One pass at module load: centre, covary, decompose. */
const AE_PCA = (() => {
  const N = AE_X.length, D = AE_X[0].length;
  const mu = Array.from({ length: D }, (_, j) => AE_X.reduce((s, r) => s + r[j], 0) / N);
  const Xc = AE_X.map((r) => r.map((v, j) => v - mu[j]));
  const cov = Array.from({ length: D }, (_, a) =>
    Array.from({ length: D }, (_, b) => Xc.reduce((s, r) => s + r[a] * r[b], 0) / (N - 1)));
  const { vals, vecs } = aeJacobi(cov);
  const tot = vals.reduce((a, b) => a + b, 0);
  return { N, D, mu, Xc, vals, vecs, tot };
})();

/* Reconstruction MSE from projecting onto an arbitrary orthonormal basis B.
   Taking B as an argument rather than a rank is the whole point of step 2. */
function aeMSE(B) {
  const { Xc, D, N } = AE_PCA;
  let se = 0;
  for (const r of Xc) {
    const z = B.map((b) => r.reduce((s, v, j) => s + v * b[j], 0));
    for (let j = 0; j < D; j++) {
      const rec = z.reduce((s, zi, i) => s + zi * B[i][j], 0);
      se += (r[j] - rec) ** 2;
    }
  }
  return se / (N * D);
}

/* Rotate the leading 2-plane by θ. Still orthonormal, still the same span. */
function aeRotBasis(deg) {
  const th = (deg * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
  const [e1, e2] = AE_PCA.vecs;
  return [e1.map((v, j) => c * v + s * e2[j]), e1.map((v, j) => -s * v + c * e2[j])];
}

/* Overcomplete dictionary: 10 atoms in 6 dims, packed by repulsion to a
   coherence of 0.363 against a Welch bound of 0.272 — incoherent enough that
   OMP recovers a 2-atom signal exactly. */
const AE_DICT = [
  [-0.900, -0.192, 0.128, 0.267, 0.175, 0.187],
  [-0.330, 0.089, -0.130, -0.041, -0.464, 0.806],
  [0.208, 0.608, -0.091, -0.378, 0.628, 0.204],
  [-0.296, 0.607, 0.031, 0.523, 0.438, -0.278],
  [-0.123, -0.354, 0.634, -0.259, 0.238, 0.578],
  [0.241, 0.009, -0.851, -0.301, 0.027, 0.354],
  [0.257, 0.434, 0.416, 0.467, 0.092, 0.589],
  [0.004, 0.333, 0.031, -0.238, -0.899, -0.150],
  [-0.678, 0.460, -0.005, -0.570, -0.031, -0.055],
  [-0.191, -0.102, -0.604, 0.718, 0.039, 0.268],
].map((v) => { const n = Math.hypot(...v); return v.map((x) => x / n); });

/* Names make the interpretability claim concrete: a unit that fires is a unit
   you can say something about. Which is the property the rotation destroys. */
const AE_ATOM_NAMES = ["edge ↖", "warm hue", "vertical", "round", "texture", "dark field", "corner", "high freq", "flat wash", "specular"];

/* Gauss-Jordan on the k×k Gram matrix — used to re-solve OMP's weights. */
function aeSolve(G, b) {
  const n = b.length, m = G.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
    [m[c], m[p]] = [m[p], m[c]];
    if (Math.abs(m[c][c]) < 1e-12) continue;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = m[r][c] / m[c][c];
      for (let k = c; k <= n; k++) m[r][k] -= f * m[c][k];
    }
  }
  return m.map((r, i) => (Math.abs(r[i]) < 1e-12 ? 0 : r[n] / r[i]));
}

/* Orthogonal matching pursuit: greedily pick the atom most aligned with the
   residual, then re-solve every weight on the chosen support. The re-solve is
   what makes it exact rather than merely close. */
function aeOMP(x, k) {
  const M = AE_DICT.length, S = [];
  let r = x.slice(), act = Array(M).fill(0);
  for (let s = 0; s < k; s++) {
    let best = -1, bv = 0;
    for (let m = 0; m < M; m++) {
      if (S.includes(m)) continue;
      const c = AE_DICT[m].reduce((t, v, j) => t + v * r[j], 0);
      if (Math.abs(c) > Math.abs(bv) + 1e-12) { bv = c; best = m; }
    }
    if (best < 0) break;
    S.push(best);
    const G = S.map((a) => S.map((b2) => AE_DICT[a].reduce((t, v, j) => t + v * AE_DICT[b2][j], 0)));
    const b = S.map((a) => AE_DICT[a].reduce((t, v, j) => t + v * x[j], 0));
    const w = aeSolve(G, b);
    act = Array(M).fill(0);
    S.forEach((a, i) => { act[a] = w[i]; });
    r = x.map((v, j) => v - S.reduce((t, a) => t + act[a] * AE_DICT[a][j], 0));
  }
  return { act, err: Math.hypot(...r) / Math.hypot(...x) };
}

/* The signal for step 3: two atoms fired, nothing else. A dense code has to
   spread this across all six units; a sparse overcomplete code can name it. */
const AE_SIGNAL = Array.from({ length: 6 }, (_, j) => 1.4 * AE_DICT[3][j] + 0.9 * AE_DICT[8][j]);

/* Fixed noise directions so the picture doesn't jitter on every render —
   the σ slider scales these rather than drawing fresh randomness. */
const AE_NOISE = (() => {
  let s = 20260813;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s / 0x7fffffff) * 2 - 1; };
  return Array.from({ length: AE_PCA.N }, () => Array.from({ length: AE_PCA.D }, rnd));
})();

/* Five features living in a 2-neuron plane, spread over a half-turn. Every
   neuron responds to every feature — which is the whole point. */
const AE_FEATS = Array.from({ length: 5 }, (_, i) => {
  const a = (Math.PI * i) / 5;
  return { v: [Math.cos(a), Math.sin(a)], name: ["curve", "serif", "plural", "past tense", "sarcasm"][i] };
});

const AE_STEPS = [
  {
    key: "bottleneck",
    label: "the bottleneck",
    title: "A narrow layer is a decision about what to throw away",
    body: "Squeeze six measured dimensions through k units and back out. Because the layer is too narrow to pass everything, training has to choose what survives — and for a linear autoencoder trained on squared error the answer is known exactly: the code spans the top-k principal subspace, and the error left over is the sum of the eigenvalues you dropped. This dataset has two real factors hiding in six columns, so the spectrum has an elbow you can see: k = 2 keeps 97.1% of the variance, and the third component is worth 2.8%. Drag k and watch the discarded tail — the bar chart is the eigenspectrum of the actual covariance, and the error underneath is measured by reconstructing all ten samples, not read off a formula.",
    math: "min ‖X − X W Wᵀ‖²_F   ⇒   span(W) = span(top-k eigenvectors)   ·   MSE = (1/D) Σ_{j>k} λⱼ",
  },
  {
    key: "rotation",
    label: "the rotation that costs nothing",
    title: "The subspace is pinned down. The axes inside it are not.",
    body: "Here is where the equivalence with PCA quietly breaks, and it is the reason a linear autoencoder is not an interpretable one. Apply any invertible map A to the code and undo it in the decoder — the reconstruction is bit-for-bit identical, so the loss cannot tell the two apart and has no preference between them. What the network learns is therefore a subspace, not a basis: the axes are whatever the optimiser happened to land on. Sweep θ and read the two numbers together. The error is frozen at 0.041428 through the whole sweep, while unit 1 travels from a clean d₃/d₄ detector to a clean d₁/d₂ detector. Same loss, same subspace, completely different story about what the unit means. PCA escapes this only by bolting on constraints the autoencoder never had — orthogonality, and an ordering by variance.",
    math: "W → W A ,  D → A⁻¹ D   ⇒   loss unchanged  ∀ invertible A   ·   the code is a subspace, not a basis",
  },
  {
    key: "sparse",
    label: "sparse · overcomplete",
    title: "Widen the layer past the input, then forbid most of it from firing",
    body: "The sparse autoencoder inverts the premise. The hidden layer is made *wider* than the input rather than narrower — ten units for six dimensions here — so capacity can no longer be what limits it. The constraint moves onto the activations instead: an L1 penalty, a KL term pulling the average firing rate toward something small, or a hard top-k. And this is what buys back what step 2 lost. A rotation of the code destroys sparsity, so the symmetry is broken and the axes are pinned to particular directions. Drag the budget: at two active units out of ten the code recovers the signal exactly, 0.0% error, and names it — round at 1.40, flat wash at 0.90. The dense six-unit code beside it reconstructs perfectly too, using every single unit, and no one of them means anything on its own.",
    math: "min ‖x − D a‖² + λ‖a‖₁   ·   dim(a) > dim(x)   ·   sparsity breaks the rotation symmetry",
  },
  {
    key: "denoise",
    label: "denoising",
    title: "Corrupt the input and copying stops being an answer",
    body: "A wide autoencoder has an embarrassing shortcut available: learn the identity. The denoising autoencoder closes it by corrupting the input and asking for the clean original back, so the model can only succeed by knowing which coordinates predict which — your instinct about co-occurrence, stated as a training objective. Geometrically the job is a projection: clean data lies on a low-dimensional surface, noise knocks a point off it in every direction at once, and the model learns to push it back. The plot is that, measured — height above the axis is the distance out of the two-factor plane, and projecting drives it to exactly zero. But the readout is worth reading past the headline, because a fixed plane is a crude manifold: the data's own third factor also lives off it, so the projection destroys real signal alongside the noise. That floor is why the total error falls by about a fifth rather than the 42% you would predict from the dimension count alone — and it is precisely the gap a learned, curved manifold closes. The reason this matters beyond autoencoders: the optimal denoiser is the score of the data distribution, which is the object diffusion models learn.",
    math: "x̃ = x + ε ,  ε ∼ N(0, σ²I)   ·   r*(x̃) = E[x | x̃] ≈ x̃ + σ² ∇ log p(x̃)",
  },
  {
    key: "mae",
    label: "masked",
    title: "Mask 75% of the patches — and the encoder gets cheaper, not just harder",
    body: "One correction worth making precisely, because it changes what the method is: the masked autoencoder hides *input patches*, not hidden units. Roughly three quarters of the image is deleted, the encoder is shown only what survives, and a deliberately lightweight decoder rebuilds raw pixels from those visible tokens plus a learned mask token at each hole. The high ratio is forced by redundancy — delete 15% of an image and interpolation from the neighbours solves it without any understanding, so the task has to be made genuinely hard before it teaches semantics. The asymmetry is the part that made it practical. Self-attention costs the square of the sequence length, and the encoder never sees the mask tokens, so at 75% masked it does 1/16 of the attention work of a full-image encoder. Drag the ratio and watch the cost curve fall away faster than the mask grows.",
    math: "encoder sees only the visible tokens · attention ∝ v²   ⇒   v = 25%  ⇒  1/16 the cost",
  },
  {
    key: "superposition",
    label: "why it came back",
    title: "Superposition: more features than neurons, so no neuron is a feature",
    body: "Your instinct that every neuron seems to have *something* in it has a name and a cause. A network represents far more distinct features than it has dimensions, so it packs them as separate directions that cannot all be orthogonal — five features into two neurons here. Read the plane along the neuron axes and every neuron responds to every feature: that is polysemanticity, and it is why staring at individual units never resolved into clean meanings. Read it along the feature directions instead and each one is clean again. That is exactly the step-3 machine pointed at a language model: train an overcomplete sparse dictionary on a frozen model's activations and recover the directions the neuron basis had scrambled. Note what changed in the process — the classical sparse AE is a representation learner, trained to be used, while this one is a post-hoc probe that never touches the model it explains.",
    math: "h ≈ Σⱼ aⱼ dⱼ ,  M ≫ D , ‖a‖₀ small   ·   trained on frozen activations · a probe, not a backbone",
  },
];

export function AutoencoderWalkthrough() {
  const [step, setStep] = useState(0);
  const [k, setK] = useState(2);
  const [theta, setTheta] = useState(0);
  const [budget, setBudget] = useState(2);
  const [sigI, setSigI] = useState(3);
  const [maskI, setMaskI] = useState(3);
  const [readBasis, setReadBasis] = useState("neuron");

  const sc = AE_STEPS[step];
  const sk = sc.key;
  const { vals, vecs, tot, D, N, Xc } = AE_PCA;

  const SIGMAS = [0, 0.15, 0.3, 0.5, 0.75, 1.0];
  const sigma = SIGMAS[sigI];
  const MASKS = [0, 0.25, 0.5, 0.75, 0.9];
  const maskR = MASKS[maskI];

  const arrow = (x1, y1, x2, y2, col, dash) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const w = 4.2, len = 7.5;
    return (
      <g stroke={col || P.accent} strokeWidth="1.3" fill="none">
        <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
        <path d={`M${x2 - len * Math.cos(a) - w * Math.sin(a)} ${y2 - len * Math.sin(a) + w * Math.cos(a)} L${x2} ${y2} L${x2 - len * Math.cos(a) + w * Math.sin(a)} ${y2 - len * Math.sin(a) - w * Math.cos(a)}`} />
      </g>
    );
  };
  const box = (x, y, w, h, label, sub, col) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={P.paper2} stroke={col || P.ink} strokeWidth="1.2" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 1 : h / 2 + 4)} textAnchor="middle" style={SK} fontSize="10.5" fill={col || P.ink}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>{sub}</text>}
    </g>
  );
  const fx = (v, d = 2) => (Math.abs(v) < 5 * Math.pow(10, -d - 1) ? 0 : v).toFixed(d);

  const body = (() => {
    switch (sk) {
      /* ── 1. the bottleneck ────────────────────────────────────────── */
      case "bottleneck": {
        const mse = aeMSE(vecs.slice(0, k));
        const kept = (100 * vals.slice(0, k).reduce((a, b) => a + b, 0)) / tot;
        const mx = vals[0];
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>six measured dimensions · two real factors · the layer decides which survive</text>

            {/* the funnel */}
            {Array.from({ length: D }).map((_, i) => (
              <rect key={`in${i}`} x={30} y={52 + i * 15} width={26} height={11} fill={P.accentSoft} stroke={P.accent} strokeWidth="0.7" />
            ))}
            <text x={43} y={46} textAnchor="middle" style={SK} fontSize="8" fill={P.accent}>x · 6</text>
            {arrow(60, 96, 84, 96)}
            {box(86, 78, 52, 36, "f_θ", "encoder", P.accent)}
            {arrow(140, 96, 164, 96)}

            {Array.from({ length: D }).map((_, i) => {
              const on = i < k;
              return (
                <rect key={`z${i}`} x={168} y={52 + i * 15} width={26} height={11}
                  fill={on ? P.accent : P.paper2} fillOpacity={on ? 0.72 : 1}
                  stroke={on ? P.accent : P.line} strokeWidth="0.7" strokeDasharray={on ? "none" : "2 2"} />
              );
            })}
            <text x={181} y={46} textAnchor="middle" style={SK} fontSize="8" fill={P.accent}>z · {k}</text>
            <text x={181} y={158} textAnchor="middle" style={SK} fontSize="7.5" fill={P.sub}>{D - k} discarded</text>

            {arrow(198, 96, 222, 96)}
            {box(224, 78, 52, 36, "g_φ", "decoder", P.accent)}
            {arrow(278, 96, 302, 96)}
            {Array.from({ length: D }).map((_, i) => (
              <rect key={`out${i}`} x={306} y={52 + i * 15} width={26} height={11} fill={P.paper2} stroke={P.sub} strokeWidth="0.7" />
            ))}
            <text x={319} y={46} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>x̂</text>

            {/* the eigenspectrum */}
            <text x={382} y={40} style={SK} fontSize="8.5" fill={P.ink}>eigenspectrum of the covariance</text>
            {vals.map((v, i) => {
              const h = Math.max(1.2, (v / mx) * 66);
              const on = i < k;
              return (
                <g key={`ev${i}`}>
                  <rect x={382 + i * 32} y={130 - h} width={22} height={h}
                    fill={on ? P.accent : P.red} fillOpacity={on ? 0.75 : 0.28}
                    stroke={on ? P.accent : P.red} strokeWidth="0.7" />
                  <text x={393 + i * 32} y={141} textAnchor="middle" style={SK} fontSize="7" fill={P.sub}>λ{i + 1}</text>
                  <text x={393 + i * 32} y={126 - h} textAnchor="middle" style={SK} fontSize="6.8" fill={on ? P.accent : P.red}>{fx((100 * v) / tot, 1)}%</text>
                </g>
              );
            })}
            <line x1={382} y1={130} x2={574} y2={130} stroke={P.line} strokeWidth="0.8" />
            <text x={382} y={156} style={SK} fontSize="7.5" fill={P.sub}>kept — blue · discarded — red</text>

            {/* readout */}
            <line x1={30} y1={176} x2={574} y2={176} stroke={P.line} strokeWidth="0.8" />
            <text x={30} y={196} style={SK} fontSize="9.5" fill={P.ink}>variance kept</text>
            <text x={30} y={214} style={SK} fontSize="15" fill={P.accent}>{fx(kept, 1)}%</text>
            <text x={168} y={196} style={SK} fontSize="9.5" fill={P.ink}>reconstruction MSE</text>
            <text x={168} y={214} style={SK} fontSize="15" fill={k <= 2 ? P.ink : P.green}>{fx(mse, 4)}</text>
            <text x={330} y={196} style={SK} fontSize="9.5" fill={P.ink}>discarded tail  Σ_{"{j>k}"} λⱼ</text>
            <text x={330} y={214} style={SK} fontSize="15" fill={P.red}>{fx(vals.slice(k).reduce((a, b) => a + b, 0), 4)}</text>

            <text x={30} y={240} style={SK} fontSize="9" fill={P.sub}>
              {k === 1 ? "one unit cannot hold two independent factors — the second is crushed into the first."
                : k === 2 ? "the elbow. two units, two factors, 97.1% of the variance — the rest is measurement noise."
                  : "past the elbow the extra units are buying noise: each adds under 3% and the error is already flat."}
            </text>
            <text x={30} y={256} style={SK} fontSize="9" fill={P.sub}>the MSE is measured by reconstructing all ten samples; the tail is the sum of the dropped</text>
            <text x={30} y={270} style={SK} fontSize="9" fill={P.sub}>eigenvalues. they agree because Baldi &amp; Hornik (1989) says they must.</text>
            <text x={30} y={288} style={SK} fontSize="8.5" fill={P.accent}>but this says nothing about which axes the network picks inside that subspace — step 2.</text>
          </g>
        );
      }

      /* ── 2. the rotation that costs nothing ───────────────────────── */
      case "rotation": {
        const B = aeRotBasis(theta);
        const mse = aeMSE(B);
        const base = aeMSE(vecs.slice(0, 2));
        const drift = Math.abs(mse - base);
        const cx = 132, cy = 108, R = 52;
        const th = (theta * Math.PI) / 180;
        /* project the samples into the fixed leading plane, then draw the
           rotating axes on top — the cloud never moves, the axes do. */
        const pts = Xc.map((r) => ({
          u: r.reduce((s, v, j) => s + v * vecs[0][j], 0),
          w: r.reduce((s, v, j) => s + v * vecs[1][j], 0),
        }));
        const sc2 = 15;
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>the same 2-plane, read along different axes — the loss cannot tell them apart</text>

            <circle cx={cx} cy={cy} r={R + 12} fill={P.faint} stroke={P.line} strokeWidth="0.6" />
            {pts.map((p, i) => (
              <circle key={i} cx={cx + p.u * sc2} cy={cy - p.w * sc2} r="2.6" fill={P.sub} fillOpacity="0.55" />
            ))}
            {/* the rotating basis */}
            <g stroke={P.accent} strokeWidth="1.6">
              <path d={`M${cx} ${cy} L${cx + R * Math.cos(th)} ${cy - R * Math.sin(th)}`} />
            </g>
            <g stroke={P.green} strokeWidth="1.4" strokeDasharray="3 2">
              <path d={`M${cx} ${cy} L${cx - R * Math.sin(th)} ${cy - R * Math.cos(th)}`} />
            </g>
            <text x={cx + (R + 12) * Math.cos(th)} y={cy - (R + 12) * Math.sin(th) + 3} textAnchor="middle" style={SK} fontSize="8" fill={P.accent}>u₁</text>
            <text x={cx - (R + 12) * Math.sin(th)} y={cy - (R + 12) * Math.cos(th) + 3} textAnchor="middle" style={SK} fontSize="8" fill={P.green}>u₂</text>
            <text x={cx} y={cy + R + 10} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>θ = {theta}°  ·  the cloud is fixed, the axes turn</text>

            {/* loadings of unit 1 */}
            <text x={232} y={44} style={SK} fontSize="8.5" fill={P.ink}>what unit 1 responds to — its loading on each input dim</text>
            {B[0].map((v, j) => {
              const h = v * 34;
              return (
                <g key={j}>
                  <rect x={238 + j * 30} y={h >= 0 ? 96 - h : 96} width={20} height={Math.abs(h)}
                    fill={v >= 0 ? P.accent : P.red} fillOpacity="0.62" stroke={v >= 0 ? P.accent : P.red} strokeWidth="0.7" />
                  <text x={248 + j * 30} y={h >= 0 ? 92 - h : 96 + Math.abs(h) + 9} textAnchor="middle" style={SK} fontSize="6.8" fill={P.sub}>{fx(v)}</text>
                  <text x={248 + j * 30} y={144} textAnchor="middle" style={SK} fontSize="7.5" fill={P.sub}>d{j + 1}</text>
                </g>
              );
            })}
            <line x1={232} y1={96} x2={424} y2={96} stroke={P.ink} strokeWidth="0.9" />
            <text x={432} y={72} style={SK} fontSize="8.5" fill={P.accent}>
              {theta < 22 ? "a d₃/d₄ detector" : theta < 68 ? "a mixture of both" : "a d₁/d₂ detector"}
            </text>
            <text x={432} y={88} style={SK} fontSize="7.5" fill={P.sub}>the meaning of the unit</text>
            <text x={432} y={102} style={SK} fontSize="7.5" fill={P.sub}>swings with θ …</text>

            {/* the frozen error */}
            <line x1={30} y1={176} x2={574} y2={176} stroke={P.line} strokeWidth="0.8" />
            <text x={30} y={196} style={SK} fontSize="9.5" fill={P.ink}>reconstruction MSE at θ = {theta}°</text>
            <text x={30} y={216} style={SK} fontSize="16" fill={P.ink}>{mse.toFixed(6)}</text>
            <text x={222} y={196} style={SK} fontSize="9.5" fill={P.ink}>drift from θ = 0</text>
            <text x={222} y={216} style={SK} fontSize="16" fill={P.green}>{drift < 1e-9 ? "0.000000" : drift.toExponential(1)}</text>
            <text x={370} y={196} style={SK} fontSize="9.5" fill={P.ink}>span(W)</text>
            <text x={370} y={216} style={SK} fontSize="13" fill={P.accent}>unchanged</text>

            <text x={30} y={242} style={SK} fontSize="9" fill={P.sub}>… and the error does not move a digit. the loss is invariant to any invertible map on the code, so it has no opinion about which axes you get.</text>
            <text x={30} y={260} style={SK} fontSize="9" fill={P.sub}>what training pins down is the <tspan fill={P.ink}>subspace</tspan>. the <tspan fill={P.ink}>basis</tspan> inside it is an accident of initialisation — which is precisely why a linear AE is not interpretable.</text>
            <text x={30} y={278} style={SK} fontSize="8.5" fill={P.accent}>PCA only escapes by adding constraints the AE never had: orthogonality, and an ordering by variance.</text>
          </g>
        );
      }

      /* ── 3. sparse · overcomplete ─────────────────────────────────── */
      case "sparse": {
        const { act, err } = aeOMP(AE_SIGNAL, budget);
        const fired = act.map((a, i) => ({ a, i })).filter((o) => Math.abs(o.a) > 1e-6);
        const mxA = Math.max(...act.map((a) => Math.abs(a)), 1);
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>10 units for 6 dimensions — wider than the input, and mostly silent</text>

            {/* dense code */}
            <text x={30} y={44} style={SK} fontSize="8.5" fill={P.sub}>the dense 6-unit code — the neuron basis</text>
            {AE_SIGNAL.map((v, j) => (
              <g key={j}>
                <rect x={30 + j * 30} y={54} width={22} height={22}
                  fill={v >= 0 ? P.accent : P.red} fillOpacity={0.14 + (Math.abs(v) / 1.3) * 0.62}
                  stroke={P.line} strokeWidth="0.5" />
                <text x={41 + j * 30} y={69} textAnchor="middle" style={SK} fontSize="7" fill={Math.abs(v) / 1.3 > 0.6 ? "#fff" : P.ink}>{fx(v)}</text>
              </g>
            ))}
            <text x={30} y={90} style={SK} fontSize="8" fill={P.red}>all 6 fire · none of them means anything alone</text>

            {/* sparse overcomplete code */}
            <text x={30} y={116} style={SK} fontSize="8.5" fill={P.sub}>the overcomplete 10-unit code — budget of {budget}</text>
            {act.map((v, i) => {
              const on = Math.abs(v) > 1e-6;
              const h = on ? Math.max(3, (Math.abs(v) / mxA) * 40) : 2;
              return (
                <g key={i}>
                  <rect x={30 + i * 30} y={170 - h} width={22} height={h}
                    fill={on ? P.accent : P.line} fillOpacity={on ? 0.78 : 0.5}
                    stroke={on ? P.accent : P.line} strokeWidth="0.7" />
                  {on && <text x={41 + i * 30} y={166 - h} textAnchor="middle" style={SK} fontSize="7" fill={P.accent}>{fx(v)}</text>}
                  <text x={41 + i * 30} y={180} textAnchor="middle" style={SK} fontSize="6.2" fill={on ? P.ink : P.sub}>u{i}</text>
                  {on && <text x={41 + i * 30} y={190} textAnchor="middle" style={SK} fontSize="6" fill={P.accent}>{AE_ATOM_NAMES[i]}</text>}
                </g>
              );
            })}
            <line x1={30} y1={170} x2={330} y2={170} stroke={P.line} strokeWidth="0.8" />

            {/* readout */}
            <line x1={30} y1={204} x2={574} y2={204} stroke={P.line} strokeWidth="0.8" />
            <text x={30} y={222} style={SK} fontSize="9.5" fill={P.ink}>units firing</text>
            <text x={30} y={240} style={SK} fontSize="15" fill={P.accent}>{fired.length} / 10</text>
            <text x={150} y={222} style={SK} fontSize="9.5" fill={P.ink}>reconstruction error</text>
            <text x={150} y={240} style={SK} fontSize="15" fill={err < 0.01 ? P.green : P.red}>{fx(100 * err, 1)}%</text>
            <text x={310} y={222} style={SK} fontSize="9.5" fill={P.ink}>what fired</text>
            <text x={310} y={240} style={SK} fontSize="10.5" fill={P.accent}>
              {fired.length ? fired.map((o) => `${AE_ATOM_NAMES[o.i]} ${fx(o.a)}`).join("  ·  ") : "—"}
            </text>

            <text x={30} y={264} style={SK} fontSize="9" fill={P.sub}>
              {budget === 1 ? "one unit is not enough — the signal is a mixture of two, and the residual says so."
                : budget === 2 ? "exactly right: 2 of 10 units, 0.0% error, and each one is nameable. the code is sparse, overcomplete and axis-aligned."
                  : "extra budget buys nothing — the remaining units sit at zero because the signal genuinely has two components."}
            </text>
            <text x={30} y={282} style={SK} fontSize="8.5" fill={P.accent}>and rotating this code would destroy its sparsity — which is exactly the symmetry step 2 could not break.</text>
          </g>
        );
      }

      /* ── 4. denoising ─────────────────────────────────────────────── */
      case "denoise": {
        const B = vecs.slice(0, 2);
        /* residual out of the 2-factor plane, before and after projection */
        const rows = Xc.map((r, i) => {
          const noisy = r.map((v, j) => v + sigma * AE_NOISE[i][j]);
          const off = (vv) => {
            const z = B.map((b) => vv.reduce((s, v, j) => s + v * b[j], 0));
            const rec = Array.from({ length: D }, (_, j) => z.reduce((s, zi, m) => s + zi * B[m][j], 0));
            return { rec, d: Math.hypot(...vv.map((v, j) => v - rec[j])) };
          };
          const on = off(noisy);
          return {
            u: noisy.reduce((s, v, j) => s + v * B[0][j], 0),
            offNoisy: on.d,
            offClean: off(r).d,
            errNoisy: Math.hypot(...noisy.map((v, j) => v - r[j])),
            errDen: Math.hypot(...on.rec.map((v, j) => v - r[j])),
          };
        });
        const mErrN = rows.reduce((s, o) => s + o.errNoisy, 0) / N;
        const mErrD = rows.reduce((s, o) => s + o.errDen, 0) / N;
        const gain = mErrN > 1e-9 ? (1 - mErrD / mErrN) * 100 : 0;
        const mOffN = rows.reduce((s, o) => s + o.offNoisy, 0) / N;
        /* the floor: the data's own third factor lives off this plane, so the
           projection destroys it along with the noise. worth printing. */
        const mOffC = rows.reduce((s, o) => s + o.offClean, 0) / N;
        const x0 = 40, y0 = 128, w = 500, yS = 34;
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>height above the line = distance out of the two-factor plane · the manifold is the line itself</text>

            <line x1={x0} y1={y0} x2={x0 + w} y2={y0} stroke={P.ink} strokeWidth="1.1" />
            <text x={x0 + w + 6} y={y0 + 3} style={SK} fontSize="7.5" fill={P.ink}>manifold</text>
            <text x={x0 - 6} y={y0 - 54} textAnchor="end" style={SK} fontSize="7" fill={P.sub}>off-plane</text>

            {rows.map((o, i) => {
              const px = x0 + w / 2 + o.u * 44;
              const py = y0 - o.offNoisy * yS;
              return (
                <g key={i}>
                  {sigma > 0 && <path d={`M${px} ${py} L${px} ${y0}`} stroke={P.accent} strokeWidth="0.7" strokeDasharray="2 2" />}
                  {sigma > 0 && <circle cx={px} cy={py} r="3" fill={P.red} fillOpacity="0.72" stroke={P.red} strokeWidth="0.6" />}
                  <circle cx={px} cy={y0} r="3.2" fill={P.accent} fillOpacity="0.8" stroke={P.accent} strokeWidth="0.6" />
                </g>
              );
            })}
            {sigma > 0 && (
              <>
                <circle cx={430} cy={54} r="3" fill={P.red} fillOpacity="0.72" />
                <text x={440} y={57} style={SK} fontSize="7.5" fill={P.red}>corrupted — knocked off the plane</text>
                <circle cx={430} cy={70} r="3.2" fill={P.accent} fillOpacity="0.8" />
                <text x={440} y={73} style={SK} fontSize="7.5" fill={P.accent}>denoised — projected back onto it</text>
              </>
            )}

            <line x1={30} y1={166} x2={574} y2={166} stroke={P.line} strokeWidth="0.8" />
            <text x={30} y={186} style={SK} fontSize="9.5" fill={P.ink}>σ</text>
            <text x={30} y={205} style={SK} fontSize="15" fill={P.ink}>{sigma.toFixed(2)}</text>
            <text x={92} y={186} style={SK} fontSize="9.5" fill={P.ink}>off-plane, corrupted</text>
            <text x={92} y={205} style={SK} fontSize="15" fill={P.red}>{fx(mOffN, 3)}</text>
            <text x={244} y={186} style={SK} fontSize="9.5" fill={P.ink}>off-plane, denoised</text>
            <text x={244} y={205} style={SK} fontSize="15" fill={P.green}>0.000</text>
            <text x={390} y={186} style={SK} fontSize="9.5" fill={P.ink}>total error vs clean</text>
            <text x={390} y={205} style={SK} fontSize="15" fill={P.accent}>
              {sigma === 0 ? "—" : `${fx(mErrN, 2)} → ${fx(mErrD, 2)}`}
            </text>

            <text x={30} y={230} style={SK} fontSize="9" fill={P.sub}>
              {sigma === 0 ? "at σ = 0 there is nothing to remove, and the identity function would score perfectly — which is the failure the corruption exists to prevent."
                : "the projection annihilates the off-plane component outright — exactly what the picture shows, and it is exact rather than approximate."}
            </text>
            <text x={30} y={246} style={SK} fontSize="9" fill={P.sub}>
              {sigma === 0 ? "the model can only learn by knowing which coordinates travel together — structure it picks up as a side effect of being asked to clean up."
                : `but it is not free: the data's own third factor sits off this plane at ${fx(mOffC, 3)} and is destroyed along with the noise. that floor is why the`}
            </text>
            <text x={30} y={262} style={SK} fontSize="9" fill={P.sub}>
              {sigma === 0 ? "" : `total error falls only ${fx(gain, 0)}% and not the 42% the dimension count alone would predict. a real DAE beats this because its manifold is curved and learned.`}
            </text>
            <text x={30} y={284} style={SK} fontSize="8.5" fill={P.accent}>and the optimal denoiser is ∇ log p(x), the score — the object diffusion models spend their whole training learning.</text>
          </g>
        );
      }

      /* ── 5. masked ────────────────────────────────────────────────── */
      case "mae": {
        const G = 8, total = G * G;
        const nMask = Math.round(maskR * total);
        /* deterministic mask: a fixed shuffle, cut at nMask */
        const order = (() => {
          let s = 7717;
          const idx = Array.from({ length: total }, (_, i) => i);
          for (let i = total - 1; i > 0; i--) {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            const j = s % (i + 1);
            [idx[i], idx[j]] = [idx[j], idx[i]];
          }
          return idx;
        })();
        const masked = new Set(order.slice(0, nMask));
        const v = 1 - maskR;
        const cost = v * v;
        const cell = 15;
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>input patches are deleted — not hidden units. the encoder never sees the holes.</text>

            {Array.from({ length: G }).map((_, r) => Array.from({ length: G }).map((_, c) => {
              const i = r * G + c, m = masked.has(i);
              return (
                <rect key={i} x={40 + c * cell} y={44 + r * cell} width={cell - 1.2} height={cell - 1.2}
                  fill={m ? P.paper2 : P.accent} fillOpacity={m ? 1 : 0.18 + ((r * 5 + c * 3) % 5) * 0.11}
                  stroke={m ? P.line : P.accent} strokeWidth={m ? 0.5 : 0.7}
                  strokeDasharray={m ? "1.5 1.5" : "none"} />
              );
            }))}
            <text x={100} y={38} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>{total} patches · {nMask} deleted</text>

            {arrow(170, 104, 196, 104)}
            {box(198, 84, 74, 40, "encoder", `sees ${total - nMask}`, P.accent)}
            {arrow(274, 104, 300, 104)}
            {box(302, 90, 62, 28, "decoder", "lightweight", P.sub)}
            {arrow(366, 104, 392, 104)}
            <text x={420} y={100} textAnchor="middle" style={SK} fontSize="9" fill={P.sub}>raw pixels</text>
            <text x={420} y={112} textAnchor="middle" style={SK} fontSize="7.5" fill={P.sub}>at the holes</text>

            {/* attention cost */}
            <text x={452} y={44} style={SK} fontSize="8.5" fill={P.ink}>encoder attention cost</text>
            <rect x={452} y={54} width={104} height={12} fill={P.faint} stroke={P.line} strokeWidth="0.5" />
            <rect x={452} y={54} width={104 * cost} height={12} fill={P.accent} fillOpacity="0.72" />
            <text x={452} y={80} style={SK} fontSize="12" fill={P.accent}>{cost < 0.999 ? `1 / ${fx(1 / cost, 1)}` : "1 / 1.0"}</text>
            <text x={452} y={94} style={SK} fontSize="7.5" fill={P.sub}>of a full-image encoder</text>

            <line x1={30} y1={160} x2={574} y2={160} stroke={P.line} strokeWidth="0.8" />
            <text x={30} y={180} style={SK} fontSize="9.5" fill={P.ink}>masking ratio</text>
            <text x={30} y={199} style={SK} fontSize="15" fill={P.ink}>{fx(100 * maskR, 0)}%</text>
            <text x={150} y={180} style={SK} fontSize="9.5" fill={P.ink}>visible tokens</text>
            <text x={150} y={199} style={SK} fontSize="15" fill={P.accent}>{total - nMask}</text>
            <text x={280} y={180} style={SK} fontSize="9.5" fill={P.ink}>attention ∝ v²</text>
            <text x={280} y={199} style={SK} fontSize="15" fill={P.green}>{fx(100 * cost, 1)}%</text>
            <text x={420} y={180} style={SK} fontSize="9.5" fill={P.ink}>the task</text>
            <text x={420} y={199} style={SK} fontSize="11" fill={maskR >= 0.7 ? P.accent : P.red}>
              {maskR < 0.3 ? "interpolation" : maskR < 0.7 ? "getting harder" : maskR > 0.85 ? "near-impossible" : "semantic"}
            </text>

            <text x={30} y={226} style={SK} fontSize="9" fill={P.sub}>
              {maskR < 0.3 ? "at this ratio a patch is surrounded by its own neighbours — smoothing solves the task and no understanding is required."
                : maskR > 0.85 ? "too far: with almost nothing visible even a good model has no evidence to reason from, and the signal degrades."
                  : "the operating range. enough is missing that the holes cannot be filled locally — the model has to know what the object is."}
            </text>
            <text x={30} y={244} style={SK} fontSize="9" fill={P.sub}>images are spatially redundant, so the ratio has to be extreme before the task stops being</text>
            <text x={30} y={258} style={SK} fontSize="9" fill={P.sub}>interpolation. language is dense — BERT masks 15% and that is already hard.</text>
            <text x={30} y={280} style={SK} fontSize="8.5" fill={P.accent}>the asymmetry is what made it cheap: self-attention is quadratic, and dropping 75% of the tokens cuts the encoder's work to a sixteenth.</text>
          </g>
        );
      }

      /* ── 6. why it came back ──────────────────────────────────────── */
      case "superposition": {
        const cx = 128, cy = 110, R = 62;
        const neuronRead = readBasis === "neuron";
        let mxCos = 0;
        for (let i = 0; i < AE_FEATS.length; i++) for (let j = i + 1; j < AE_FEATS.length; j++) {
          mxCos = Math.max(mxCos, Math.abs(AE_FEATS[i].v[0] * AE_FEATS[j].v[0] + AE_FEATS[i].v[1] * AE_FEATS[j].v[1]));
        }
        return (
          <g>
            <text x={300} y={16} textAnchor="middle" style={SK} fontSize="10.5" fill={P.sub}>5 features · 2 neurons — they cannot all be orthogonal, so they are packed at angles</text>

            <circle cx={cx} cy={cy} r={R} fill={P.faint} stroke={P.line} strokeWidth="0.6" />
            {/* the neuron axes */}
            <g stroke={neuronRead ? P.red : P.line} strokeWidth={neuronRead ? 1.5 : 0.9}>
              <path d={`M${cx - R - 8} ${cy} L${cx + R + 8} ${cy}`} />
              <path d={`M${cx} ${cy + R + 8} L${cx} ${cy - R - 8}`} />
            </g>
            <text x={cx + R + 12} y={cy + 15} style={SK} fontSize="7.5" fill={neuronRead ? P.red : P.sub}>n₁</text>
            {/* the features all live in the upper half-plane, so the bottom of
                the vertical axis is the only place this label doesn't collide */}
            <text x={cx + 6} y={cy + R + 18} style={SK} fontSize="7.5" fill={neuronRead ? P.red : P.sub}>n₂</text>
            {/* the feature directions */}
            {AE_FEATS.map((f, i) => (
              <g key={i}>
                <path d={`M${cx} ${cy} L${cx + f.v[0] * R} ${cy - f.v[1] * R}`}
                  stroke={neuronRead ? P.line : P.accent} strokeWidth={neuronRead ? 1 : 1.6} />
                <text x={cx + f.v[0] * (R + 16)} y={cy - f.v[1] * (R + 16) + 3} textAnchor="middle"
                  style={SK} fontSize="7" fill={neuronRead ? P.sub : P.accent}>{f.name}</text>
              </g>
            ))}

            {/* the readout bars */}
            <text x={250} y={44} style={SK} fontSize="8.5" fill={P.ink}>
              {neuronRead ? "what neuron n₁ responds to, feature by feature" : "what the dictionary unit for “curve” responds to"}
            </text>
            {AE_FEATS.map((f, i) => {
              const val = neuronRead ? f.v[0] : (i === 0 ? 1 : 0);
              const h = val * 40;
              return (
                <g key={i}>
                  <rect x={256 + i * 44} y={h >= 0 ? 104 - h : 104} width={30} height={Math.abs(h) < 1 ? 1 : Math.abs(h)}
                    fill={val >= 0 ? (neuronRead ? P.red : P.accent) : P.red}
                    fillOpacity={neuronRead ? 0.6 : 0.72} stroke={val >= 0 ? (neuronRead ? P.red : P.accent) : P.red} strokeWidth="0.7" />
                  <text x={271 + i * 44} y={h >= 0 ? 100 - h : 104 + Math.abs(h) + 9} textAnchor="middle" style={SK} fontSize="6.8" fill={P.sub}>{fx(val)}</text>
                  <text x={271 + i * 44} y={158} textAnchor="middle" style={SK} fontSize="6.4" fill={P.sub}>{f.name}</text>
                </g>
              );
            })}
            <line x1={250} y1={104} x2={470} y2={104} stroke={P.ink} strokeWidth="0.9" />
            <text x={250} y={176} style={SK} fontSize="8.5" fill={neuronRead ? P.red : P.green}>
              {neuronRead ? "every feature moves it — the neuron is polysemantic, and means nothing on its own"
                : "one feature, one unit — the dictionary recovers what the neuron basis had scrambled"}
            </text>

            <line x1={30} y1={192} x2={574} y2={192} stroke={P.line} strokeWidth="0.8" />
            <text x={30} y={210} style={SK} fontSize="9.5" fill={P.ink}>features</text>
            <text x={30} y={228} style={SK} fontSize="15" fill={P.accent}>5</text>
            <text x={110} y={210} style={SK} fontSize="9.5" fill={P.ink}>neurons</text>
            <text x={110} y={228} style={SK} fontSize="15" fill={P.red}>2</text>
            <text x={196} y={210} style={SK} fontSize="9.5" fill={P.ink}>max |cos| between features</text>
            <text x={196} y={228} style={SK} fontSize="15" fill={P.ink}>{fx(mxCos)}</text>
            <text x={396} y={210} style={SK} fontSize="9.5" fill={P.ink}>neurons with a clean meaning</text>
            <text x={396} y={228} style={SK} fontSize="15" fill={P.red}>0</text>

            <text x={30} y={250} style={SK} fontSize="9" fill={P.sub}>at D = 2 the packing is cramped, so the angles are wide. real models have thousands of dimensions,</text>
            <text x={30} y={264} style={SK} fontSize="9" fill={P.sub}>where exponentially many <tspan fill={P.ink}>near</tspan>-orthogonal directions fit — which is what makes the trick pay.</text>
            <text x={30} y={286} style={SK} fontSize="8.5" fill={P.accent}>every bench on this page reconstructs its input. the next one predicts the representation instead — and pays with a collapse problem reconstruction never had. → JEPA</text>
          </g>
        );
      }
      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };
  const Nst = AE_STEPS.length;
  const sliderRow = { display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" };
  const lbl = { ...SK, fontSize: "0.62rem", color: P.sub };
  const val = { ...SK, fontSize: "0.66rem", color: P.ink, minWidth: 66 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>Baldi &amp; Hornik 1989 · Vincent 2008 · He 2021 · and why the sparse one came back for LLMs</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {Nst}</span>
          <button onClick={() => setStep((step + Nst - 1) % Nst)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % Nst)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      {sk === "bottleneck" && (
        <div style={sliderRow}>
          <span style={lbl}>bottleneck width k:</span>
          <input type="range" min={1} max={6} step={1} value={k} onChange={(e) => setK(+e.target.value)} aria-label="Bottleneck width k" style={{ accentColor: P.accent, width: 150 }} />
          <span style={val}>k = {k}</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>
            {k === 1 ? "too narrow — two factors will not fit through one unit" : k === 2 ? "the elbow: 97.1% of the variance, 2 of 6 dimensions" : `${k} units — past the elbow, buying noise`}
          </span>
        </div>
      )}

      {sk === "rotation" && (
        <div style={sliderRow}>
          <span style={lbl}>rotate the basis θ:</span>
          <input type="range" min={0} max={90} step={1} value={theta} onChange={(e) => setTheta(+e.target.value)} aria-label="Basis rotation angle theta" style={{ accentColor: P.accent, width: 170 }} />
          <span style={val}>θ = {theta}°</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>the loss never moves — watch the loadings, not the error</span>
        </div>
      )}

      {sk === "sparse" && (
        <div style={sliderRow}>
          <span style={lbl}>units allowed to fire:</span>
          <input type="range" min={1} max={5} step={1} value={budget} onChange={(e) => setBudget(+e.target.value)} aria-label="Sparsity budget" style={{ accentColor: P.accent, width: 150 }} />
          <span style={val}>‖a‖₀ ≤ {budget}</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>
            {budget < 2 ? "under-budget — the signal has two components" : budget === 2 ? "exact recovery, and both units are nameable" : "the surplus units stay at zero"}
          </span>
        </div>
      )}

      {sk === "denoise" && (
        <div style={sliderRow}>
          <span style={lbl}>corruption σ:</span>
          <input type="range" min={0} max={SIGMAS.length - 1} step={1} value={sigI} onChange={(e) => setSigI(+e.target.value)} aria-label="Corruption sigma" style={{ accentColor: P.accent, width: 150 }} />
          <span style={val}>σ = {sigma.toFixed(2)}</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>
            {sigma === 0 ? "no corruption — the identity function wins, and nothing is learned" : "noise fills all six dims; the manifold occupies two"}
          </span>
        </div>
      )}

      {sk === "mae" && (
        <div style={sliderRow}>
          <span style={lbl}>masking ratio:</span>
          <input type="range" min={0} max={MASKS.length - 1} step={1} value={maskI} onChange={(e) => setMaskI(+e.target.value)} aria-label="Masking ratio" style={{ accentColor: P.accent, width: 150 }} />
          <span style={val}>{fx(100 * maskR, 0)}% masked</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>
            {maskR < 0.3 ? "solvable by interpolation" : maskR === 0.75 ? "the MAE operating point" : maskR > 0.85 ? "past useful" : "getting harder"}
          </span>
        </div>
      )}

      {sk === "superposition" && (
        <div style={sliderRow}>
          <span style={lbl}>read the activation along:</span>
          {[["neuron", "the neuron basis"], ["dict", "the sparse dictionary"]].map(([kk, label]) => (
            <button key={kk} onClick={() => setReadBasis(kk)} aria-pressed={readBasis === kk}
              style={{ ...SK, fontSize: "0.68rem", padding: "3px 11px", cursor: "pointer", border: `1px solid ${readBasis === kk ? P.accent : P.line}`, background: readBasis === kk ? P.accentSoft : P.paper2, color: readBasis === kk ? P.accent : P.sub }}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`Autoencoder walkthrough step ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {AE_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   ORTHODIFFUSION WALKTHROUGH — a denoiser used as a feature extractor,
   and the MAE comparison the paper asserts without ever running.

   The spine is the noise schedule itself. Every signal/noise number on
   screen is computed from the standard DDPM linear β schedule at render
   time — the paper fixes T = 1000 but never states its β, so the schedule
   is labelled as an assumption wherever it is drawn, and the numbers that
   come from the paper (macro-AUROC, the Extended Data peaks, the fusion
   ranking) are kept visually separate from the ones that come from it.

   The load-bearing observation is step 3. The default tap sits at t = 30,
   where the schedule has removed almost nothing: 98.8% of the variance is
   still the scan. The "denoising" backbone is being queried in a regime
   where there is essentially nothing to denoise, which is exactly why the
   features stay anchored to the image rather than to the prior.
   ════════════════════════════════════════ */

/* Linear β schedule, DDPM defaults: β from 1e-4 to 0.02 over T = 1000.
   ᾱ_t = Π(1 − β_i), computed once at module load. */
const OD_T = 1000;
const OD_ABAR = (() => {
  const out = new Float64Array(OD_T + 1);
  out[0] = 1;
  let a = 1;
  for (let i = 1; i <= OD_T; i++) {
    const b = 1e-4 + ((0.02 - 1e-4) * (i - 1)) / (OD_T - 1);
    a *= 1 - b;
    out[i] = a;
  }
  return out;
})();

/* The timesteps worth stopping on. 500 is the right ceiling: it is where the
   paper's own sweep ends, and by then the scan is 8% of the variance. */
const OD_TS = [0, 10, 30, 50, 100, 150, 200, 300, 500];

/* Fixed speckle, so dragging the slider scales one noise field rather than
   redrawing a fresh one every render. */
const OD_DOTS = (() => {
  let s = 20260215;
  const r = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  return Array.from({ length: 240 }, () => ({ x: r(), y: r(), v: r() }));
})();

/* Which of the 64 patches survive MAE's 75% mask — one fixed draw, so the
   picture is stable while the ratio slider moves. */
const OD_MASK_ORDER = (() => {
  let s = 776;
  const r = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  return Array.from({ length: 64 }, (_, i) => i).sort(() => r() - 0.5);
})();

/* A sagittal knee, abstracted to the four things the paper's labels care
   about: the femoral condyle, the tibial plateau, two meniscal wedges and
   the cruciate cord running between them. `abar` fades the anatomy out and
   the speckle in, together, exactly as the forward process does. */
function odKnee(ox, oy, w, h, abar, id, showGrid) {
  const sig = Math.sqrt(Math.max(0, abar));
  const nz = Math.sqrt(Math.max(0, 1 - abar));
  const X = (u) => ox + u * w;
  const Y = (v) => oy + v * h;
  const cid = `odc-${id}`;
  return (
    <g>
      <defs><clipPath id={cid}><rect x={ox} y={oy} width={w} height={h} /></clipPath></defs>
      <rect x={ox} y={oy} width={w} height={h} fill="#fff" stroke={P.line} strokeWidth="1" />
      <g clipPath={`url(#${cid})`}>
        <g stroke={P.ink} fill="none" strokeWidth="1.15" opacity={0.12 + 0.88 * sig}>
          <path d={`M${X(0.22)} ${Y(-0.02)} L${X(0.22)} ${Y(0.3)} C${X(0.22)} ${Y(0.5)} ${X(0.78)} ${Y(0.5)} ${X(0.78)} ${Y(0.3)} L${X(0.78)} ${Y(-0.02)}`} />
          <path d={`M${X(0.19)} ${Y(0.57)} L${X(0.81)} ${Y(0.57)} L${X(0.77)} ${Y(1.02)} L${X(0.25)} ${Y(1.02)}`} />
          <path d={`M${X(0.21)} ${Y(0.56)} L${X(0.38)} ${Y(0.56)} L${X(0.31)} ${Y(0.5)} Z`} fill={P.faint} />
          <path d={`M${X(0.62)} ${Y(0.56)} L${X(0.79)} ${Y(0.56)} L${X(0.7)} ${Y(0.5)} Z`} fill={P.faint} />
          <path d={`M${X(0.41)} ${Y(0.55)} L${X(0.59)} ${Y(0.27)}`} strokeWidth="1.6" />
        </g>
        <g fill={P.sub}>
          {OD_DOTS.map((d, i) => (
            <circle key={i} cx={X(d.x)} cy={Y(d.y)} r={0.8 + 1.1 * d.v} opacity={nz * (0.1 + 0.55 * d.v)} />
          ))}
        </g>
        {showGrid && (
          <g stroke={P.line} strokeWidth="0.5" opacity="0.9">
            {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={X((i + 1) / 8)} y1={oy} x2={X((i + 1) / 8)} y2={oy + h} />)}
            {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1={ox} y1={Y((i + 1) / 8)} x2={ox + w} y2={Y((i + 1) / 8)} />)}
          </g>
        )}
      </g>
    </g>
  );
}

const OD_STEPS = [
  {
    key: "pretext",
    label: "the pretext task",
    title: "The label is the noise you added yourself",
    body: "Fifteen thousand knee MRIs with nothing written about them, and a training signal has to come from somewhere. Diffusion's answer is to manufacture one: take a scan, draw a Gaussian ε, mix the two in a known ratio, and ask the network to name the ε you drew. The target is free — you generated it — so the whole loop runs on unlabelled data, and this is the sense in which the model is trained without annotation. It is not trained without training. Drag t and watch what the objective is actually asking for at each end. Down at t = 30, where this paper does its work, 98.8% of the variance is still the scan and the noise is a thin haze you can see straight through; the honest way to name ε there is to subtract what you can see. Push t past 300 and the scan is gone, so the only way to guess ε is to guess what the knee underneath must have been — which means knowing that cartilage is a smooth band, that the cruciate runs as a diagonal cord, that the meniscus is a wedge. Nobody put that anatomy in the weights. Across sixteen thousand scans it is simply the cheapest way to reduce the loss.",
    math: "x_t = √ᾱ_t · x₀ + √(1−ᾱ_t) · ε ,  ε ∼ N(0, I)   ·   L = ‖ε − ε_θ(x_t, t)‖²   ·   T = 1000",
  },
  {
    key: "tap",
    label: "the tap",
    title: "You never generate an image — you read the network mid-pass",
    body: "This is the step that dissolves the confusion, and the confusion is worth naming first: if the model's job is to turn noise into pictures, how do you get a *feature* out of it, and where is the architectural trick that produces one? There is no trick. Generation and feature extraction are two different taps on the same trained weights. Generation runs the reverse chain end to end, a thousand passes, each one nudging a volume toward something that looks like a knee. Extraction runs the U-Net exactly once, at one chosen timestep, and reads the activation tensor sitting in the bottleneck — a quantity the forward pass computes whether or not anyone looks at it — then throws the decoder's output away unread. No image is ever synthesised for a diagnosis, which matters more than it sounds: a system that read pathology off a reconstruction would inherit every hallucination the reconstruction makes. Toggle the two paths. Same weights, same forward pass, different thing taken from it.",
    math: "extract: h = mid₂( ε_θ , x_t , t )  → SAP pool → linear head   ·   generate: x_{t−1} ← x_t, ×1000",
  },
  {
    key: "skips",
    label: "the skips",
    title: "Downsampling destroys where. The skip is how the decoder gets it back.",
    body: "Worth stopping on, because it is the part of the U-Net that is easy to draw and easy to under-read. This paper's backbone takes a 16 × 256 × 256 volume down through four stride-2 stages to a bottleneck of 256 × 1 × 16 × 16 — the number they publish, and it is worth unpacking. As *elements* that is only a 16× squeeze, because the channel width climbs as the resolution falls. As *positions* it is brutal: a million voxels become 256 cells, so a single bottleneck cell is the only thing left speaking for a 16 × 16 × 16 block — **4,096 voxels each**. That vector knows a cruciate is present, and roughly where; it cannot know which voxel the edge of it was on, because that distinction was averaged away four stages ago. Now ask the decoder to climb back. Upsampling can invent a plausible continuation of what it is handed, but nothing in an 8× coarser summary tells it where a boundary actually sat — so a bottleneck-only decoder returns the right anatomy with the edges smoothed off. The skip connection is the fix and it is almost embarrassingly direct: at every rung, hand the decoder the encoder's own feature map at the *matching* resolution and concatenate. Deep-and-coarse supplies *what*; shallow-and-fine supplies *exactly where*; the decoder fuses them instead of guessing. For this architecture the skips are not a refinement, they are load-bearing — the output being asked for is ε, a per-voxel noise field that is pure high frequency, and reconstructing a million-voxel one from 256 spatial cells is not a hard problem but an impossible one. Segmentation says the same thing in a different accent: Dice is decided at boundaries. There is a sting in the tail, though, and it is the reason this step belongs next to the tap. A skip is also a path *around* the bottleneck. If your goal is a representation rather than a reconstruction, that path is a leak — detail can flow to the output without ever being encoded — which is exactly why the SimMIM arm in the next bench is built with skips deliberately off while the diffusion arm keeps them on. And note what it means for the feature: the tap at mid₂ is upstream of every skip, so the representation this whole paper rests on is the coarse one by construction. The fine detail lives only in the decoder path, and the decoder path is the part thrown away unread.",
    math: "skip: dec_ℓ ← [ up(dec_{ℓ+1})  ‖  enc_ℓ ]   ·   16×256×256 → 256×1×16×16 : 16× fewer elements, 4,096× coarser in space",
  },
  {
    key: "dial",
    label: "t is an abstraction dial",
    title: "The timestep chooses how much of the answer comes from the prior",
    body: "Because the corruption is a continuum rather than a switch, t becomes a knob on the representation itself. Low t leaves the fine texture intact, so the network is attending to edges and boundaries — what a segmentation head wants. Raise t and the detail is destroyed before the network ever sees it, so whatever survives in the bottleneck has to be global structure. The paper exploits this by tuning a per-task *timestep–block* pair on validation rather than fixing one layer, and the honest reading of its own sweep is that the knob is real but gentle: across t = 0 to 500 and three candidate blocks, the macro-AUROC moves about three points, peaking at 85.59 (coronal), 85.04 (sagittal) and 84.71 (axial) under linear probing. What the curve on the left adds is *why* the selected values are all small. At the default t = 30 the schedule has taken almost nothing away. The model is not reconstructing a knee from static; it is refining an image that is essentially all still there — which is the whole reason the features stay trustworthy. Turn the dial far enough right and the prior starts answering instead of the scan, and the reported AUROC does fall away. That trade is the same one my dissertation measured from the other side: push restoration hard enough and the image looks cleaner while the diagnostic content gets quietly repainted.",
    math: "inferred ∝ prior(anatomy) × likelihood(what survives in x_t)   ·   selected: mid₂, t = 30 — never above 200",
  },
  {
    key: "mae",
    label: "the MAE comparison",
    title: "Same forcing function, different corruption — and the comparison never gets run",
    body: "The reason this paper reads as familiar is that its mechanism is the masked autoencoder's, with one operator swapped. MAE deletes three quarters of the patches outright and asks for the missing pixels back; diffusion attenuates every voxel by √ᾱ and asks for the noise back. Both close the copying shortcut, both make the task solvable only by knowing what belongs where, and He's *Deconstructing Denoising Diffusion Models* is the paper that makes the equivalence explicit. The differences that matter are structural rather than philosophical. Masking is all-or-nothing per patch, so the encoder sees a quarter of the tokens and gets a sixteenth of the attention bill — MAE is drastically cheaper to pretrain. Noising is uniform and graded, so the difficulty is a continuous parameter you can tune per task, which is precisely what step 4 spends. Toggle the operator and read the two targets side by side. Then read the strip along the bottom, because it is the paper's real gap: the discussion argues diffusion beats masked autoencoding as a medical representation learner, and *no MAE baseline was ever run.* Every comparison here is against a supervised model trained from scratch — 3D-UNet, UNETR, 3D-ResNet-18. The claim is asserted, not measured.",
    math: "MAE: mask 75% of patches, predict pixels · cost ∝ v²   ·   diffusion: attenuate all, predict ε · difficulty = t",
  },
  {
    key: "planes",
    label: "three planes, two fusions",
    title: "The fusion that scores highest is the one that cannot tell you why",
    body: "A radiologist reads a knee across sagittal, coronal and axial, so the paper pretrains three separate 3D diffusion backbones, one per orientation, and fuses their embeddings downstream. The result of the fusion ablation is the interesting part, and to its credit the paper reports it plainly: plain channel-wise concatenation — no parameters, no learning, no story — produces the best macro-AUROC of everything they tried, ahead of linear projection, cross-attention, and their own Multi-plane Adaptive Expert module. MPAE comes second. What MPAE buys instead is attribution: a small gating network weighs the three per-plane classifiers per label and per patient, and those weights land where a clinician would put them — sagittal carrying the cruciate ligaments, coronal carrying the collaterals. Toggle the two and the trade is the whole point. Concatenation wins the number and cannot answer 'which plane earned this'; MPAE gives up a little accuracy to answer it. That is the same question MRNet answered one rung down with a three-weight logistic regression (§7) — except here the weights are per label and per patient rather than fitted once, because a fixed three-way vote has no way to say that *this* knee's evidence was axial.",
    math: "concat: [f_sag ‖ f_cor ‖ f_ax] → linear head   ·   MPAE: w = softmax(gate(z_sag, z_cor, z_ax)), per label, per patient",
  },
  {
    key: "gap",
    label: "what it never measures",
    title: "Every number here is a ranking. None of them is a trust.",
    body: "AUROC and Dice, across every table. Both are ranking metrics: they tell you the model orders positives above negatives, and they are silent on whether the probability it prints means anything, on whether it knows when a scan is unlike anything it trained on, and on what it does at the moment it is wrong. There is no calibration curve, no OOD detection, no uncertainty of any kind — so 'when does this silently fail' is not a question the paper's evaluation can be asked. The transfer story has the same shape: knee → ankle transfers better than knee → shoulder, which the paper reads as anatomical similarity and which is equally a statement that nothing on board would have flagged the shoulder as further away. The panel on the right is the experiment the missing MAE baseline argues for, and it has now been run: one convolutional encoder — same class, same config, parameter counts asserted identical — with diffusion, MAE and JEPA hung off it, the same budget each, read at the *same* bottleneck under the *same* frozen probe, so the comparison the paper asserted gets measured without the ViT-versus-UNet confound that wrecks the casual version. On PneumoniaMNIST over three seeds the paper's direction holds under the probe, 0.971 against 0.960 — but an *untrained* encoder scores 0.937, so the whole benefit of pretraining is three points, and fine-tuning every arm collapses that eleven-thousandth gap to two. The reproduced rise-and-fall timestep curve, and the rest of it, is the next bench along.",
    math: "held fixed: encoder · tap site · compute · probe   ·   varied: the objective, and t   ·   run: probe 0.971 / 0.960 / 0.937",
  },
];

export function OrthoDiffusionWalkthrough() {
  const [step, setStep] = useState(0);
  const [ti, setTi] = useState(2);           /* OD_TS[2] = 30, the paper's default */
  const [mode, setMode] = useState("extract");
  const [op, setOp] = useState("noise");
  const [fusion, setFusion] = useState("concat");
  const [skips, setSkips] = useState(true);

  const sc = OD_STEPS[step];
  const sk = sc.key;
  const t = OD_TS[ti];
  const abar = OD_ABAR[t];
  const sig = Math.sqrt(abar);

  const arrow = (x1, y1, x2, y2, col, dash, wdt) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const w = 4.2, len = 7.5;
    return (
      <g stroke={col || P.accent} strokeWidth={wdt || 1.3} fill="none">
        <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
        <path d={`M${x2 - len * Math.cos(a) - w * Math.sin(a)} ${y2 - len * Math.sin(a) + w * Math.cos(a)} L${x2} ${y2} L${x2 - len * Math.cos(a) + w * Math.sin(a)} ${y2 - len * Math.sin(a) - w * Math.cos(a)}`} />
      </g>
    );
  };
  const box = (x, y, w, h, label, sub, col, faded) => (
    <g opacity={faded ? 0.2 : 1}>
      <rect x={x} y={y} width={w} height={h} fill={P.paper2} stroke={col || P.ink} strokeWidth="1.2" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 1 : h / 2 + 4)} textAnchor="middle" style={SK} fontSize="10" fill={col || P.ink}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>{sub}</text>}
    </g>
  );

  const body = (() => {
    switch (sk) {
      /* ── 1. the pretext task ──────────────────────────────────────── */
      case "pretext": {
        const pct = (100 * abar).toFixed(1);
        const verdict =
          t === 0 ? "nothing added — there is no noise to name, and nothing is learned"
            : abar > 0.95 ? "the scan is almost untouched: subtract what you can see"
              : abar > 0.55 ? "detail is going; the guess starts leaning on what a knee looks like"
                : "the scan is gone — only a prior can answer, and a prior can only fabricate";
        const sw = 452 * abar;
        return (
          <g>
            {odKnee(38, 42, 104, 104, 1, "clean")}
            <text x={90} y={36} textAnchor="middle" style={SK} fontSize="9" fill={P.ink}>x₀ — one unlabelled scan</text>
            {arrow(150, 94, 194, 94)}
            <text x={172} y={86} textAnchor="middle" style={SK} fontSize="8" fill={P.accent}>+ ε</text>

            {odKnee(202, 42, 104, 104, abar, "noised")}
            <text x={254} y={36} textAnchor="middle" style={SK} fontSize="9" fill={P.ink}>x_t at t = {t}</text>

            {arrow(314, 94, 358, 94)}
            {box(366, 68, 152, 52, "ε_θ ( x_t , t )", "3D U-Net denoiser", P.ink)}
            {arrow(442, 124, 442, 148)}
            <text x={442} y={162} textAnchor="middle" style={SK} fontSize="9.5" fill={P.accent}>ε̂ — its guess at the noise</text>
            <text x={442} y={176} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>loss = ‖ε − ε̂‖², and ε was free</text>

            <text x={38} y={200} style={SK} fontSize="8.5" fill={P.sub}>what is left of the scan, by the schedule</text>
            <rect x={38} y={208} width={452} height={17} fill={P.faint} stroke={P.line} />
            <rect x={38} y={208} width={sw} height={17} fill={P.accentSoft} />
            <rect x={38} y={208} width={sw} height={17} fill="none" stroke={P.accent} strokeWidth="1.1" />
            <text x={44} y={220} style={SK} fontSize="9" fill={P.accent}>signal ᾱ = {pct}%</text>
            {abar < 0.86 && <text x={486} y={220} textAnchor="end" style={SK} fontSize="9" fill={P.sub}>noise {(100 - +pct).toFixed(1)}%</text>}
            <text x={38} y={243} style={SK} fontSize="9" fill={t === 0 || abar < 0.55 ? P.red : P.ink}>{verdict}</text>

            <text x={38} y={266} style={SK} fontSize="8.5" fill={P.sub}>15,948 unlabelled knee MRIs · 16 central slices at 256×256 · not one annotation anywhere in this loop</text>
            <text x={38} y={282} style={SK} fontSize="8" fill={P.sub}>ᾱ_t computed from the standard linear β schedule (1e-4 → 0.02, T = 1000) — the paper fixes T but does not state β.</text>
          </g>
        );
      }

      /* ── 2. the tap ───────────────────────────────────────────────── */
      case "tap": {
        const gen = mode === "generate";
        const enc = [[62, 58], [104, 96], [146, 134]];
        const dec = [[392, 134], [434, 96], [476, 58]];
        return (
          <g>
            <text x={30} y={30} style={SK} fontSize="9" fill={P.sub}>one 3D U-Net, trained once. two different things to take from it.</text>

            {enc.map(([x, y], i) => (
              <g key={`e${i}`}>{box(x, y, 46, 26, ["enc₁", "enc₂", "enc₃"][i], null, P.ink)}</g>
            ))}
            {box(196, 172, 44, 26, "mid₀", null, P.sub)}
            {box(244, 172, 44, 26, "mid₁", null, P.sub)}
            {box(292, 172, 44, 26, "mid₂", null, gen ? P.ink : P.accent)}
            {dec.map(([x, y], i) => (
              <g key={`d${i}`}>{box(x, y, 46, 26, ["dec₃", "dec₂", "dec₁"][i], null, P.ink, !gen)}</g>
            ))}

            {arrow(108, 84, 104, 92, P.ink)}
            {arrow(150, 122, 146, 130, P.ink)}
            {arrow(192, 160, 196, 168, P.ink)}
            <path d="M336 185 L392 185 L392 160" stroke={gen ? P.ink : P.line} strokeWidth="1.2" fill="none" opacity={gen ? 1 : 0.35} />
            {gen && arrow(438, 122, 434, 114, P.ink)}
            {gen && arrow(480, 84, 476, 76, P.ink)}

            <g stroke={P.line} strokeWidth="0.9" strokeDasharray="3 3" opacity={gen ? 0.9 : 0.3}>
              <line x1={108} y1={58} x2={476} y2={58} />
              <line x1={150} y1={96} x2={434} y2={96} />
              <line x1={192} y1={134} x2={392} y2={134} />
            </g>
            <text x={292} y={52} textAnchor="middle" style={SK} fontSize="7.5" fill={P.sub} opacity={gen ? 1 : 0.4}>skip connections</text>

            {gen ? (
              <g>
                {arrow(522, 58, 548, 58, P.ink)}
                <text x={562} y={62} textAnchor="middle" style={SK} fontSize="10" fill={P.ink}>x̂</text>
                <path d="M562 72 L562 228 L96 228" stroke={P.ink} strokeWidth="1" fill="none" strokeDasharray="4 3" />
                {arrow(110, 228, 88, 228, P.ink, false, 1)}
                {arrow(85, 224, 85, 80, P.ink, true, 1)}
                <text x={330} y={222} textAnchor="middle" style={SK} fontSize="8.5" fill={P.ink}>one pass&apos;s output is the next pass&apos;s input — × 1000</text>
                <text x={30} y={256} style={SK} fontSize="9.5" fill={P.ink}>generate — run the reverse chain end to end. every block matters, and an image comes out.</text>
                <text x={30} y={272} style={SK} fontSize="9" fill={P.sub}>this path is never used for a diagnosis. nothing in the clinical pipeline reads a pixel the model painted.</text>
              </g>
            ) : (
              <g>
                {arrow(314, 202, 314, 226, P.accent, false, 1.9)}
                {box(258, 230, 112, 26, "SAP pooling", null, P.accent)}
                {arrow(370, 243, 402, 243, P.accent)}
                <rect x={408} y={236} width={96} height={14} fill={P.accentSoft} stroke={P.accent} strokeWidth="1" />
                <text x={456} y={266} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>one embedding</text>
                {arrow(510, 243, 538, 243, P.accent)}
                <text x={556} y={246} textAnchor="middle" style={SK} fontSize="9" fill={P.accent}>head</text>
                <text x={30} y={274} style={SK} fontSize="9.5" fill={P.accent}>extract — one forward pass, read mid₂, discard the decoder unread.</text>
                <text x={30} y={289} style={SK} fontSize="9" fill={P.sub}>the activation exists whether or not anyone looks at it. that is the whole method.</text>
              </g>
            )}
            <text x={570} y={30} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>attention at 16×16 · default tap: mid₂ at t = 30</text>
          </g>
        );
      }

      /* ── 3. the skips ─────────────────────────────────────────────── */
      case "skips": {
        const on = skips;
        /* The paper's own ladder: base width 64, mults (1,1,2,2,4) over five
           resolution levels, so 256² halves four times to the published
           256 × 1 × 16 × 16 bottleneck. */
        const lv = [
          { r: "256²·16", c: 64, ex: 34, dx: 300 },
          { r: "128²·8", c: 64, ex: 60, dx: 274 },
          { r: "64²·4", c: 128, ex: 86, dx: 248 },
          { r: "32²·2", c: 128, ex: 112, dx: 222 },
        ];
        const ly = [52, 84, 116, 148];
        return (
          <g>
            <defs>
              <filter id="odblur" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="3.1" />
              </filter>
            </defs>
            <text x={30} y={28} style={SK} fontSize="9" fill={P.sub}>the published ladder — 16×256×256 down to a 256×1×16×16 bottleneck</text>

            {lv.map((l, i) => (
              <g key={l.r}>
                <rect x={l.ex} y={ly[i]} width={56} height={20} fill={P.paper2} stroke={P.ink} strokeWidth="1.1" />
                <text x={l.ex + 28} y={ly[i] + 14} textAnchor="middle" style={SK} fontSize="8" fill={P.ink}>{l.r}</text>
                <text x={l.ex - 4} y={ly[i] + 14} textAnchor="end" style={SK} fontSize="7" fill={P.sub}>{l.c}c</text>
                <rect x={l.dx} y={ly[i]} width={56} height={20} fill={P.paper2} stroke={on ? P.ink : P.line} strokeWidth="1.1" />
                <text x={l.dx + 28} y={ly[i] + 14} textAnchor="middle" style={SK} fontSize="8" fill={on ? P.ink : P.sub}>{l.r}</text>
                {i < 3 && arrow(l.ex + 28, ly[i] + 22, l.ex + 54, ly[i + 1] - 2, P.sub, false, 1)}
                {i < 3 && arrow(l.dx + 28, ly[i + 1] - 2, l.dx + 2, ly[i] + 22, P.sub, false, 1)}
                {on ? (
                  <g>
                    <path d={`M${l.ex + 58} ${ly[i] + 10} L${l.dx - 2} ${ly[i] + 10}`} stroke={P.accent} strokeWidth="1.3" fill="none" strokeDasharray="5 3" />
                    {arrow(l.dx - 14, ly[i] + 10, l.dx - 2, ly[i] + 10, P.accent, false, 1.3)}
                  </g>
                ) : (
                  <g opacity="0.5">
                    <path d={`M${l.ex + 58} ${ly[i] + 10} L${l.dx - 2} ${ly[i] + 10}`} stroke={P.line} strokeWidth="1" fill="none" strokeDasharray="2 4" />
                    <path d={`M${(l.ex + 56 + l.dx) / 2 - 4} ${ly[i] + 6} L${(l.ex + 56 + l.dx) / 2 + 4} ${ly[i] + 14} M${(l.ex + 56 + l.dx) / 2 + 4} ${ly[i] + 6} L${(l.ex + 56 + l.dx) / 2 - 4} ${ly[i] + 14}`} stroke={P.red} strokeWidth="1.3" />
                  </g>
                )}
              </g>
            ))}
            {on && <text x={196} y={48} textAnchor="middle" style={SK} fontSize="7.6" fill={P.accent}>concat at matching resolution</text>}

            <rect x={138} y={180} width={80} height={22} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.2" />
            <text x={178} y={195} textAnchor="middle" style={SK} fontSize="8.4" fill={P.accent}>256 × 1 × 16²</text>
            {arrow(138, 170, 152, 178, P.sub, false, 1)}
            {arrow(220, 186, 238, 171, P.sub, false, 1)}
            <text x={178} y={214} textAnchor="middle" style={SK} fontSize="7.6" fill={P.accent}>the tap — upstream of every skip</text>

            <rect x={392} y={44} width={116} height={116} fill="none" stroke={P.line} />
            <g filter={on ? undefined : "url(#odblur)"}>{odKnee(394, 46, 112, 112, 1, "skipout")}</g>
            <text x={450} y={176} textAnchor="middle" style={SK} fontSize="8.4" fill={on ? P.accent : P.red}>{on ? "boundaries land where they were" : "structure right, boundaries gone"}</text>
            <text x={450} y={190} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>schematic — what the decoder can return</text>

            <line x1={30} y1={228} x2={570} y2={228} stroke={P.line} strokeWidth="1" />
            <text x={30} y={244} style={SK} fontSize="8.5" fill={P.ink}>one bottleneck cell is all that is left speaking for a 16×16×16 block — <tspan fill={P.accent}>4,096 voxels each</tspan>. the target is ε, one number per voxel.</text>
            <text x={30} y={258} style={SK} fontSize="8.5" fill={P.ink}>a million-voxel noise field cannot come back out of 256 spatial cells. the skips are load-bearing, not a refinement.</text>
            <text x={30} y={276} style={SK} fontSize="8.2" fill={P.sub}>measured, next bench: the SimMIM arm is built with <tspan fill={P.ink}>decoder_skips: false</tspan> — and its reconstructions come back with the right lungs and mediastinum</text>
            <text x={30} y={288} style={SK} fontSize="8.2" fill={P.sub}>and the rib edges smoothed away. not a controlled skip ablation — the objectives differ too — but exactly the failure this predicts.</text>
          </g>
        );
      }

      /* ── 4. the abstraction dial ──────────────────────────────────── */
      case "dial": {
        const x0 = 62, x1 = 344, y0 = 232, y1 = 62;
        const px = (tt) => x0 + (tt / 500) * (x1 - x0);
        const py = (s) => y0 - s * (y0 - y1);
        const path = Array.from({ length: 101 }, (_, i) => {
          const tt = i * 5;
          return `${i ? "L" : "M"}${px(tt).toFixed(1)} ${py(Math.sqrt(OD_ABAR[tt])).toFixed(1)}`;
        }).join(" ");
        const cx = px(Math.min(t, 500)), cy = py(sig);
        return (
          <g>
            <text x={30} y={30} style={SK} fontSize="9" fill={P.ink}>how much of the scan survives to the tap — computed from the schedule</text>

            <rect x={x0} y={y1} width={px(200) - x0} height={y0 - y1} fill={P.accentSoft} />
            <text x={px(100)} y={y1 - 6} textAnchor="middle" style={SK} fontSize="8" fill={P.accent}>every selected timestep lives in here</text>

            <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={P.ink} strokeWidth="1.1" />
            <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={P.ink} strokeWidth="1.1" />
            {[0, 100, 200, 300, 400, 500].map((tt) => (
              <g key={tt}>
                <line x1={px(tt)} y1={y0} x2={px(tt)} y2={y0 + 4} stroke={P.ink} strokeWidth="0.9" />
                <text x={px(tt)} y={y0 + 15} textAnchor="middle" style={SK} fontSize="7.5" fill={P.sub}>{tt}</text>
              </g>
            ))}
            <text x={(x0 + x1) / 2} y={y0 + 30} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>diffusion timestep t</text>
            <text x={x0 - 6} y={y1 + 4} textAnchor="end" style={SK} fontSize="7.5" fill={P.sub}>1.0</text>
            <text x={x0 - 6} y={y0} textAnchor="end" style={SK} fontSize="7.5" fill={P.sub}>0</text>
            <text x={x0 - 40} y={(y0 + y1) / 2} textAnchor="middle" style={SK} fontSize="8" fill={P.sub} transform={`rotate(-90 ${x0 - 40} ${(y0 + y1) / 2})`}>√ᾱ_t — signal kept</text>

            <path d={path} stroke={P.ink} strokeWidth="1.6" fill="none" />
            <line x1={cx} y1={y0} x2={cx} y2={cy} stroke={P.accent} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={cx} cy={cy} r="4" fill={P.accent} />
            <text x={76} y={186} style={SK} fontSize="10" fill={P.accent}>t = {t} → √ᾱ = {sig.toFixed(3)}</text>
            <text x={76} y={200} style={SK} fontSize="8.4" fill={P.sub}>{(100 * abar).toFixed(1)}% of the variance is still the scan</text>

            <line x1={382} y1={54} x2={382} y2={264} stroke={P.line} strokeWidth="1" />
            <text x={398} y={68} style={SK} fontSize="8.5" fill={P.ink}>what the sweep is worth — reported</text>
            <text x={398} y={82} style={SK} fontSize="7.5" fill={P.sub}>macro-AUROC %, linear probe, Centers A+B+C</text>
            {[["coronal", 85.59], ["sagittal", 85.04], ["axial", 84.71]].map(([n, v], i) => (
              <g key={n}>
                <text x={398} y={107 + i * 22} style={SK} fontSize="9" fill={P.sub}>{n}</text>
                <rect x={452} y={98 + i * 22} width={(v - 84) * 45} height={11} fill={P.accentSoft} stroke={P.accent} strokeWidth="0.9" />
                <text x={572} y={107 + i * 22} textAnchor="end" style={SK} fontSize="9" fill={P.ink}>{v.toFixed(2)}</text>
              </g>
            ))}
            <text x={452} y={177} style={SK} fontSize="7.5" fill={P.sub}>bars measured from 84.0</text>
            <text x={398} y={196} style={SK} fontSize="8.5" fill={P.ink}>peaks over t ∈ [0, 500] × three blocks.</text>
            <text x={398} y={210} style={SK} fontSize="8.5" fill={P.ink}>the whole sweep moves it about 3 points —</text>
            <text x={398} y={224} style={SK} fontSize="8.5" fill={P.ink}>a real dial, and a gentle one.</text>
            <text x={398} y={246} style={SK} fontSize="8" fill={P.red}>the tap is at t = 30. there is almost nothing</text>
            <text x={398} y={258} style={SK} fontSize="8" fill={P.red}>there to denoise — which is why it is safe.</text>
          </g>
        );
      }

      /* ── 4. MAE vs diffusion ──────────────────────────────────────── */
      case "mae": {
        const masking = op === "mask";
        const keep = 16;
        const hidden = new Set(OD_MASK_ORDER.slice(keep));
        return (
          <g>
            <text x={30} y={28} style={SK} fontSize="9" fill={P.ink}>one image, two corruption operators, the same forcing function</text>

            {odKnee(38, 44, 152, 152, masking ? 1 : abar, "op", true)}
            {masking && (
              <g>
                {Array.from({ length: 64 }, (_, i) => {
                  if (!hidden.has(i)) return null;
                  const c = i % 8, r = Math.floor(i / 8);
                  return <rect key={i} x={38 + c * 19} y={44 + r * 19} width={19} height={19} fill="#fff" stroke={P.line} strokeWidth="0.6" />;
                })}
              </g>
            )}
            <text x={114} y={212} textAnchor="middle" style={SK} fontSize="8.5" fill={P.ink}>
              {masking ? "75% of the patches deleted outright" : `every voxel scaled by √ᾱ = ${sig.toFixed(3)}`}
            </text>
            <text x={114} y={226} textAnchor="middle" style={SK} fontSize="8.5" fill={P.sub}>
              {masking ? "the surviving quarter is pixel-exact" : "nothing is deleted; everything is dimmed"}
            </text>

            <line x1={212} y1={44} x2={212} y2={232} stroke={P.line} strokeWidth="1" />

            <text x={232} y={58} style={SK} fontSize="9.5" fill={P.accent}>{masking ? "masked autoencoder" : "denoising diffusion"}</text>
            {[
              masking
                ? ["encoder sees", "the visible 25% of tokens — mask tokens never enter it"]
                : ["encoder sees", "every voxel, attenuated — nothing is withheld"],
              masking
                ? ["target", "the raw pixels under the holes"]
                : ["target", "ε itself — equivalently ∇ₓ log p(x), the score"],
              masking
                ? ["difficulty", "one number, fixed at 75% — chosen so interpolation cannot solve it"]
                : ["difficulty", "continuous in t — the knob step 4 spends"],
              masking
                ? ["cost", "attention ∝ v² ⇒ a sixteenth of the full-image bill"]
                : ["cost", "full-resolution passes, three backbones, one per plane"],
            ].map(([k, v], i) => (
              <g key={k}>
                <text x={232} y={84 + i * 34} style={SK} fontSize="8" fill={P.sub}>{k}</text>
                <text x={232} y={97 + i * 34} style={SK} fontSize="8.8" fill={P.ink}>{v}</text>
              </g>
            ))}

            <rect x={30} y={246} width={540} height={40} fill={P.faint} stroke={P.red} strokeWidth="1" />
            <text x={42} y={262} style={SK} fontSize="8.8" fill={P.red}>the gap: the discussion argues diffusion beats masked autoencoding as a medical representation learner — and no MAE</text>
            <text x={42} y={276} style={SK} fontSize="8.8" fill={P.red}>baseline was ever run. every comparison is against a supervised model from scratch: 3D-UNet, UNETR, 3D-ResNet-18.</text>
          </g>
        );
      }

      /* ── 5. three planes, two fusions ─────────────────────────────── */
      case "planes": {
        const concat = fusion === "concat";
        const planes = [["sagittal", 56], ["coronal", 122], ["axial", 188]];
        return (
          <g>
            {planes.map(([n, y]) => (
              <g key={n}>
                {box(30, y, 74, 34, n, "3D diffusion", P.ink)}
                {arrow(108, y + 17, 138, y + 17, P.sub)}
                <rect x={142} y={y + 10} width={62} height={14} fill={P.accentSoft} stroke={P.accent} strokeWidth="0.9" />
              </g>
            ))}
            <text x={173} y={44} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>per-plane embedding</text>

            {concat ? (
              <g>
                {arrow(210, 73, 262, 118, P.accent)}
                {arrow(210, 139, 262, 139, P.accent)}
                {arrow(210, 205, 262, 160, P.accent)}
                <rect x={268} y={126} width={186} height={16} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.1" />
                <line x1={330} y1={126} x2={330} y2={142} stroke={P.accent} strokeWidth="0.9" />
                <line x1={392} y1={126} x2={392} y2={142} stroke={P.accent} strokeWidth="0.9" />
                <text x={361} y={120} textAnchor="middle" style={SK} fontSize="8.5" fill={P.accent}>channel-wise concatenation — no parameters</text>
                {arrow(458, 134, 490, 134, P.accent)}
                {box(496, 120, 74, 28, "linear head", null, P.ink)}
                <text x={268} y={176} style={SK} fontSize="9.5" fill={P.ink}>the highest macro-AUROC in the whole fusion ablation.</text>
                <text x={268} y={192} style={SK} fontSize="9" fill={P.red}>and it cannot say which plane earned the call.</text>
              </g>
            ) : (
              <g>
                {planes.map(([n, y]) => (
                  <g key={`c${n}`}>
                    {arrow(210, y + 17, 246, y + 17, P.sub)}
                    {box(250, y + 3, 56, 28, "clf", null, P.sub)}
                  </g>
                ))}
                <text x={278} y={44} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>per-plane logits</text>
                {box(324, 118, 62, 34, "gate", "per label", P.accent)}
                {planes.map(([n, y]) => <g key={`g${n}`}>{arrow(310, y + 17, 322, 132, P.sub, true)}</g>)}
                <path d="M390 128 C424 128 424 96 452 96" stroke={P.accent} strokeWidth="4" fill="none" opacity="0.5" />
                <path d="M390 140 C424 140 424 172 452 172" stroke={P.accent} strokeWidth="4" fill="none" opacity="0.5" />
                <text x={458} y={92} style={SK} fontSize="9" fill={P.ink}>cruciate (ACL, PCL)</text>
                <text x={458} y={104} style={SK} fontSize="8" fill={P.accent}>weight leans sagittal</text>
                <text x={458} y={176} style={SK} fontSize="9" fill={P.ink}>collateral (MCL, LCL)</text>
                <text x={458} y={188} style={SK} fontSize="8" fill={P.accent}>weight leans coronal</text>
                <text x={30} y={244} style={SK} fontSize="9.5" fill={P.ink}>second-best accuracy, and it tells you where the evidence came from — matching how the scan is read.</text>
                <text x={30} y={259} style={SK} fontSize="8.5" fill={P.sub}>directions as reported from the fusion-weight Sankey diagrams; the weights themselves are per patient, so no fixed number is drawn here.</text>
              </g>
            )}

            <line x1={30} y1={268} x2={570} y2={268} stroke={P.line} strokeWidth="1" />
            <text x={30} y={284} style={SK} fontSize="8.5" fill={P.sub}>8 knee labels, Centers A–G, MRI-only —</text>
            <text x={214} y={284} style={SK} fontSize="8.5" fill={P.ink}>ours fine-tuned <tspan fill={P.accent}>90.79</tspan> · linear probe <tspan fill={P.accent}>87.61</tspan> · 3D-ResNet-18 83.15 · 3D-UNet 82.63</text>
          </g>
        );
      }

      /* ── 6. what it never measures ────────────────────────────────── */
      case "gap": {
        return (
          <g>
            <text x={30} y={30} style={SK} fontSize="9.5" fill={P.ink}>what the evaluation can answer</text>
            {["AUROC — does it rank positives above negatives", "AP · Dice — the same question, dense", "robustness across 1.5T / 3T and nine centres", "label efficiency down to 10% of the labels"].map((s, i) => (
              <text key={i} x={30} y={52 + i * 17} style={SK} fontSize="8.6" fill={P.sub}>· {s}</text>
            ))}
            <text x={30} y={140} style={SK} fontSize="9.5" fill={P.red}>what it is silent on</text>
            {["calibration — is the printed probability a probability", "OOD — would it know an unfamiliar scan when it saw one", "uncertainty — anything at all to hedge with", "so: when does it fail quietly, and could you tell"].map((s, i) => (
              <text key={i} x={30} y={162 + i * 17} style={SK} fontSize="8.6" fill={P.red}>· {s}</text>
            ))}
            <text x={30} y={252} style={SK} fontSize="8.3" fill={P.sub}>knee → ankle transfers better than knee → shoulder. read one way that is</text>
            <text x={30} y={264} style={SK} fontSize="8.3" fill={P.sub}>anatomy; read another, nothing on board would have flagged the distance.</text>

            <line x1={308} y1={20} x2={308} y2={286} stroke={P.line} strokeWidth="1" />

            <text x={326} y={30} style={SK} fontSize="9.5" fill={P.accent}>the experiment that argues for itself</text>
            {box(326, 44, 88, 26, "diffusion", null, P.ink)}
            {box(326, 78, 88, 26, "MAE", null, P.ink)}
            {box(326, 112, 88, 26, "JEPA", null, P.sub)}
            {[57, 91, 125].map((y, i) => <g key={i}>{arrow(418, y, 448, 104, P.sub, i === 2)}</g>)}
            {box(452, 90, 112, 28, "one encoder", "same bottleneck tap", P.accent)}
            {arrow(508, 122, 508, 146, P.accent)}
            {box(452, 150, 112, 26, "frozen probe", null, P.accent)}
            <text x={326} y={162} style={SK} fontSize="8" fill={P.sub}>JEPA optional —</text>
            <text x={326} y={173} style={SK} fontSize="8" fill={P.sub}>the first two are the claim</text>

            <text x={326} y={200} style={SK} fontSize="8.6" fill={P.ink}>held fixed: backbone · tap site · compute · protocol</text>
            <text x={326} y={214} style={SK} fontSize="8.6" fill={P.ink}>varied: the objective — and, for diffusion, t</text>
            <rect x={326} y={224} width={244} height={62} fill={P.faint} stroke={P.accent} />
            <text x={336} y={239} style={SK} fontSize="8.5" fill={P.accent}>run. frozen probe, test AUROC, 3 seeds:</text>
            <text x={336} y={253} style={SK} fontSize="9" fill={P.ink}>diffusion <tspan fill={P.accent}>0.971</tspan> · MAE <tspan fill={P.accent}>0.960</tspan> · JEPA 0.928</text>
            <text x={336} y={266} style={SK} fontSize="8.5" fill={P.ink}>untrained encoder: <tspan fill={P.red}>0.937</tspan> — and fine-tuning</text>
            <text x={336} y={278} style={SK} fontSize="8.5" fill={P.ink}>closes the gap to 0.002. → the SSL comparison bench</text>
          </g>
        );
      }
      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };
  const Nst = OD_STEPS.length;
  const sliderRow = { display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" };
  const lbl = { ...SK, fontSize: "0.62rem", color: P.sub };
  const val = { ...SK, fontSize: "0.66rem", color: P.ink, minWidth: 66 };
  const toggle = (on) => ({ ...SK, fontSize: "0.68rem", padding: "3px 11px", cursor: "pointer", border: `1px solid ${on ? P.accent : P.line}`, background: on ? P.accentSoft : P.paper2, color: on ? P.accent : P.sub });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>Lan, Xu, Yuan et al. 2026 · arXiv:2602.20752 · a denoiser read as a backbone</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {Nst}</span>
          <button onClick={() => setStep((step + Nst - 1) % Nst)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % Nst)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      {(sk === "pretext" || sk === "dial" || (sk === "mae" && op === "noise")) && (
        <div style={sliderRow}>
          <span style={lbl}>diffusion timestep t:</span>
          <input type="range" min={0} max={OD_TS.length - 1} step={1} value={ti} onChange={(e) => setTi(+e.target.value)} aria-label="Diffusion timestep" style={{ accentColor: P.accent, width: 170 }} />
          <span style={val}>t = {t}</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>
            {t === 0 ? "no corruption — nothing to predict" : t === 30 ? "the paper's default tap" : t <= 200 ? "inside the operating window" : "past anything they selected"}
          </span>
        </div>
      )}

      {sk === "skips" && (
        <div style={sliderRow}>
          <span style={lbl}>the decoder gets:</span>
          {[[true, "the skips"], [false, "the bottleneck alone"]].map(([k, label]) => (
            <button key={String(k)} onClick={() => setSkips(k)} aria-pressed={skips === k} style={toggle(skips === k)}>{label}</button>
          ))}
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>{skips ? "what and exactly-where, fused at every rung" : "what, and a guess at where"}</span>
        </div>
      )}

      {sk === "tap" && (
        <div style={sliderRow}>
          <span style={lbl}>take from the same weights:</span>
          {[["extract", "extract a feature"], ["generate", "generate an image"]].map(([k, label]) => (
            <button key={k} onClick={() => setMode(k)} aria-pressed={mode === k} style={toggle(mode === k)}>{label}</button>
          ))}
        </div>
      )}

      {sk === "mae" && (
        <div style={sliderRow}>
          <span style={lbl}>corruption operator:</span>
          {[["mask", "delete 75% of patches"], ["noise", "attenuate everything by √ᾱ"]].map(([k, label]) => (
            <button key={k} onClick={() => setOp(k)} aria-pressed={op === k} style={toggle(op === k)}>{label}</button>
          ))}
        </div>
      )}

      {sk === "planes" && (
        <div style={sliderRow}>
          <span style={lbl}>fuse the three planes by:</span>
          {[["concat", "simple concatenation"], ["mpae", "MPAE gating"]].map(([k, label]) => (
            <button key={k} onClick={() => setFusion(k)} aria-pressed={fusion === k} style={toggle(fusion === k)}>{label}</button>
          ))}
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>{fusion === "concat" ? "best number, no attribution" : "second-best number, and it explains itself"}</span>
        </div>
      )}

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`OrthoDiffusion walkthrough step ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {OD_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SSL COMPARISON WALKTHROUGH — the baseline OrthoDiffusion never ran.

   One encoder, three self-supervised objectives, one extraction site, one
   probe recipe. Every number drawn here comes from results/results.csv of
   the notebook run (PneumoniaMNIST 64px, official splits, seeds [0,1,2],
   4000 pretraining steps at batch 128 for every arm) — nothing is quoted
   from a paper and nothing is illustrative.

   The three findings the sketch is built around:
     · under a frozen probe diffusion beats MAE, 0.971 vs 0.960 test AUROC;
     · JEPA at 0.928 lands *below* an untrained encoder at 0.937;
     · fine-tuning collapses the spread to about a point, which is why the
       probe ranking is not the ranking.
   ════════════════════════════════════════ */

/* Test AUROC, mean ± std over seeds [0, 1, 2]. `site` is the val-selected
   extraction point; probe = frozen encoder, ft = fine-tuned. */
const SSL_ARMS = [
  { arm: "diffusion", site: "t = 100 · mid2", probe: 0.971, ps: 0.002, ft: 0.977, fs: 0.004, col: "accent" },
  { arm: "MAE", site: "t = 0", probe: 0.960, ps: 0.002, ft: 0.975, fs: 0.002, col: "ink" },
  { arm: "JEPA", site: "t = 0", probe: 0.928, ps: 0.003, ft: 0.966, fs: 0.007, col: "red" },
  { arm: "random-init", site: "t = 0", probe: 0.937, ps: 0.011, ft: null, fs: null, col: "sub" },
  { arm: "supervised-100%", site: "—", probe: null, ps: null, ft: 0.969, fs: 0.004, col: "sub" },
  { arm: "supervised-10%", site: "—", probe: null, ps: null, ft: 0.952, fs: 0.003, col: "sub" },
];

/* The M5 sweep: diffusion linear probe at each extraction timestep, for both
   mid blocks. val is saturated; test is where the curve actually lives. */
const SSL_SWEEP = [
  { t: 10, v2: 0.993, e1: 0.970, e2: 0.968, s2: 0.002 },
  { t: 30, v2: 0.994, e1: 0.971, e2: 0.972, s2: 0.002 },
  { t: 50, v2: 0.994, e1: 0.971, e2: 0.972, s2: 0.001 },
  { t: 100, v2: 0.994, e1: 0.968, e2: 0.971, s2: 0.002 },
  { t: 150, v2: 0.994, e1: 0.965, e2: 0.968, s2: 0.004 },
  { t: 200, v2: 0.994, e1: 0.960, e2: 0.965, s2: 0.006 },
  { t: 300, v2: 0.993, e1: 0.952, e2: 0.957, s2: 0.007 },
  { t: 500, v2: 0.987, e1: 0.929, e2: 0.931, s2: 0.007 },
];

const SSL_STEPS = [
  {
    key: "trunk",
    label: "one trunk",
    title: "The comparison is only worth running if the backbone is byte-identical",
    body: "Almost every casual MAE-versus-diffusion claim is confounded, because the two objectives arrive attached to different backbones — a ViT for one, a U-Net for the other — and what gets measured is the architecture. So the first thing this build fixes is the trunk: a small convolutional U-Net encoder, 1→32 channels at 64², three downsamples to 256 channels at 8², two mid blocks, and every arm calls the same constructor with the same config. A milestone cell asserts it, and not just the parameter count — the full (name, shape) signature has to match, so a future edit that quietly gives one arm a wider stage fails loudly instead of producing a confounded table. One detail earns its keep. The sinusoidal timestep embedding, FiLM-injected into every residual block, is present in *all* arms, not only the diffusion one; MAE and JEPA simply pass t = 0. Carrying that dead weight is what keeps the counts identical at 4,058,656 — the alternative would have handed diffusion an extra 130k parameters and made the headline difference unreadable. Toggle the arm and watch what changes: not the trunk, only what is bolted onto it.",
    math: "build_encoder(CFG) — one class, one config, one (name, shape) signature   ·   4,058,656 params in every arm",
  },
  {
    key: "protocol",
    label: "one tap, one probe",
    title: "Everything downstream is shared too, including the noise",
    body: "The second confound to kill is the evaluation. Every arm's feature comes out of a single function: one forward pass, read the named block, global-average-pool — the same extraction site OrthoDiffusion uses, and the only thing that differs between arms is the timestep handed to the trunk. Diffusion gets a genuinely noised input at its selected t; everyone else gets the clean image at t = 0. Three guards make the result mean something. Pretraining runs inside a label-blind context where touching a labelled dataset *raises*, so 'self-supervised' is enforced in code rather than by good intentions. The noise used at feature-extraction time comes from a fixed generator, so the same image is corrupted identically in every arm, every seed and every sweep point — the curve in step 4 measures the representation, not which draw of noise got lucky. And the probe and fine-tune recipes are read from config with no per-arm branch, so there is nowhere to hand-tune one objective's hyperparameters. Best epoch is chosen on validation; the test split is touched once, at the end.",
    math: "extract(x, t, block, GAP) → standardise → linear head, 60 epochs   ·   select on val · test read once",
  },
  {
    key: "probe",
    label: "the probe result",
    title: "Diffusion wins the frozen probe — and JEPA lands under an untrained encoder",
    body: "This is the number OrthoDiffusion asserted and never measured, now measured: with the backbone and budget held fixed, the denoising objective produces a more linearly separable representation than masked reconstruction, 0.971 against 0.960 test AUROC, a gap of about eleven thousandths that sits well clear of the seed spread of ±0.002. So the paper's claim survives its first controlled test — at this scale, on this dataset, under this protocol. The bar that matters more is the grey one. An *untrained* encoder, identical in every respect except that it never saw a gradient, probes at 0.937. That is the control almost nobody runs, and it reframes both winners: diffusion's entire advantage over random initialisation is 0.034 AUROC, and MAE's is 0.023. A convolutional prior on 64×64 chest films is doing a great deal of the work before any objective is chosen. And then JEPA, at 0.928 ± 0.003, is *below* the random control — reproducibly, across three seeds. That is not a bug I can wave away, and the honest reading is the one from the literature: latent-prediction methods are not trained to make features linearly separable, and at 4000 steps with an EMA target the collapse pressure has had every opportunity and the anti-collapse machinery has barely started working.",
    math: "test AUROC, frozen encoder, mean ± std over seeds [0, 1, 2]   ·   random-init control = 0.937 ± 0.011",
  },
  {
    key: "sweep",
    label: "the timestep curve",
    title: "The rise-then-fall reproduces — and the fall is the half that is unambiguous",
    body: "Sweeping the extraction timestep with everything else nailed down gives the curve OrthoDiffusion reports and never explains, on a different dataset and a hundredth of the compute. Read it honestly in two halves. The rise is marginal: 0.970 at t = 10, peaking at 0.972 around t = 30–50, which is a couple of thousandths against a seed spread of one or two — real in that both blocks show it, too small to lean on. The fall is not marginal at all. Past t ≈ 100 the curve drops monotonically to 0.931 at t = 500, and the two reference lines say what that costs: diffusion's advantage over MAE survives only while t stays under roughly 200, and by t = 500 the features are no better than the untrained encoder's. Extracting at high noise does not buy abstraction, it buys erasure — which is the prior-versus-likelihood trade with a number on it, and the reason every timestep the paper selected is small. There is also a methodological gotcha worth keeping. Validation AUROC is saturated — 0.993 to 0.994 across the whole low-t range — so val cannot distinguish t = 30 from t = 100, and selection duly picked t = 100 while test peaked at t = 50. The selection rule is honest; the validation set is just too easy to exercise it.",
    math: "diffusion probe, block mid2, t swept over {10 … 500}   ·   val flat at 0.994 → selection is nearly arbitrary below t = 200",
  },
  {
    key: "finetune",
    label: "fine-tuning closes it",
    title: "The probe ranking is not the ranking",
    body: "Unfreeze the encoder, give every arm the identical fine-tune recipe on clean inputs, and the picture the probe painted mostly dissolves. Diffusion goes 0.971 → 0.977, MAE goes 0.960 → 0.975, and the eleven-thousandth gap becomes two — inside the seed noise. JEPA gains the most of anyone, 0.928 → 0.966, which is the clearest evidence that its problem was linear separability rather than a failure to learn anything: as an *initialisation* it was fine all along. This is exactly the split the literature describes — linear probing flatters objectives whose loss shapes a separable space, full fine-tuning does not — and it is why a paper that reports only one of the two protocols can support almost any conclusion it likes. The supervised bars are the last honest note. Trained from scratch on all the labels, the same encoder reaches 0.969, so every self-supervised arm's fine-tuned advantage over plain supervision is at most eight thousandths. Where pretraining does earn its keep is scarcity: supervised on 10% of the labels drops to 0.952, and all three pretrained arms beat that comfortably. That is the label-efficiency claim, and it is the one part of the story this run supports cleanly.",
    math: "same recipe, 15 epochs, only the initialisation differs   ·   supervised-100% = 0.969 · supervised-10% = 0.952",
  },
  {
    key: "limits",
    label: "what it settles",
    title: "It closes one gap and is honest about how small it is",
    body: "What this run does settle: the comparison OrthoDiffusion asserted is runnable, and run cleanly it comes out the way the paper claimed under a frozen probe — with the caveat that the paper's own protocol is fine-tuning, where the gap all but vanishes. The timestep curve is real and reproduces on completely different anatomy, which is decent evidence that it is a property of the objective rather than of knees. And the random-init control, which neither the paper nor most of the literature bothers to report, turns out to be the most informative bar on the chart. What it does not settle is most of everything else. One dataset, binary, and easy enough that every arm sits above 0.92 with the ceiling at 0.98 — differences at that altitude are fragile. Three seeds, 4000 steps, a 4M-parameter encoder, and a laptop: this is two to three orders of magnitude below the regime where scaling arguments about MAE start to apply. JEPA is under-trained rather than fairly represented at this budget. And the whole thing is a single 2D slice of a question the paper asks in 3D. It is a floor, not a benchmark — the same status the regex labeler holds in §2, and stated the same way.",
    math: "PneumoniaMNIST 64px · 3 seeds · 4000 steps @ batch 128 · 4.06M params · one binary task near ceiling",
  },
];

export function SslCompareWalkthrough() {
  const [step, setStep] = useState(0);
  const [arm, setArm] = useState("diffusion");
  const [swi, setSwi] = useState(2);
  const [proto, setProto] = useState("probe");

  const sc = SSL_STEPS[step];
  const sk = sc.key;
  const sw = SSL_SWEEP[swi];
  const COL = { accent: P.accent, ink: P.ink, red: P.red, sub: P.sub };

  const arrow = (x1, y1, x2, y2, col, dash, wdt) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const w = 4.2, len = 7.5;
    return (
      <g stroke={col || P.accent} strokeWidth={wdt || 1.3} fill="none">
        <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
        <path d={`M${x2 - len * Math.cos(a) - w * Math.sin(a)} ${y2 - len * Math.sin(a) + w * Math.cos(a)} L${x2} ${y2} L${x2 - len * Math.cos(a) + w * Math.sin(a)} ${y2 - len * Math.sin(a) - w * Math.cos(a)}`} />
      </g>
    );
  };
  const box = (x, y, w, h, label, sub, col, faded) => (
    <g opacity={faded ? 0.25 : 1}>
      <rect x={x} y={y} width={w} height={h} fill={P.paper2} stroke={col || P.ink} strokeWidth="1.2" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 1 : h / 2 + 4)} textAnchor="middle" style={SK} fontSize="9.5" fill={col || P.ink}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>{sub}</text>}
    </g>
  );

  const body = (() => {
    switch (sk) {
      /* ── 1. the shared trunk ──────────────────────────────────────── */
      case "trunk": {
        const stages = [
          ["stem", "1→32 @64²", 56],
          ["stage 0", "32 @64²", 56],
          ["stage 1", "64 @32²", 46],
          ["stage 2", "128 @16²", 36],
          ["stage 3", "256 @8²", 28],
        ];
        const heads = {
          diffusion: { bolt: "conv decoder + skips", loss: "L = ‖ε − ε_θ(x_t, t)‖²", note: "cosine schedule, T = 1000, ε-prediction — the trunk's t-embedding is finally used for real" },
          mae: { bolt: "light decoder, no skips", loss: "L = ‖x − x̂‖² on masked patches", note: "SimMIM-style: 8×8 patches, 60% masked — skips off on purpose, since a skip is a path around the bottleneck the representation is meant to hold" },
          jepa: { bolt: "EMA target copy + predictor", loss: "L = ‖pred(z_ctx) − sg z_tgt‖²", note: "target encoder is an EMA copy at 0.996 — same class, same config, no gradient" },
        };
        const h = heads[arm];
        let x = 34;
        return (
          <g>
            <text x={30} y={28} style={SK} fontSize="9" fill={P.sub}>the trunk — identical in all three arms, asserted by (name, shape) signature</text>
            {stages.map(([n, c, hh], i) => {
              const bx = x; x += 62;
              return (
                <g key={n}>
                  <rect x={bx} y={92 - hh / 2} width={50} height={hh} fill={P.paper2} stroke={P.ink} strokeWidth="1.1" />
                  <text x={bx + 25} y={95} textAnchor="middle" style={SK} fontSize="8" fill={P.ink}>{n}</text>
                  <text x={bx + 25} y={92 + hh / 2 + 12} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>{c}</text>
                  {i < stages.length - 1 && arrow(bx + 52, 92, bx + 60, 92, P.sub, false, 1)}
                </g>
              );
            })}
            {box(344, 78, 44, 28, "mid1", null, P.sub)}
            {box(394, 78, 52, 28, "mid2", null, P.accent)}
            {arrow(336, 92, 342, 92, P.sub, false, 1)}
            {arrow(390, 92, 392, 92, P.sub, false, 1)}
            <text x={420} y={122} textAnchor="middle" style={SK} fontSize="7.6" fill={P.accent}>bottleneck — the tap</text>

            <rect x={34} y={158} width={112} height={26} fill={P.faint} stroke={P.line} strokeWidth="1" />
            <text x={90} y={175} textAnchor="middle" style={SK} fontSize="8.4" fill={P.ink}>t → sinusoidal → MLP</text>
            <g stroke={P.line} strokeWidth="0.9" strokeDasharray="3 3">
              {[59, 121, 183, 245, 307, 366, 420].map((cx2, i) => <line key={i} x1={90} y1={158} x2={cx2} y2={124} />)}
            </g>
            <text x={156} y={175} style={SK} fontSize="8" fill={P.sub}>FiLM into every block — carried by <tspan fill={P.ink}>all</tspan> arms (t = 0 when unused), which is what keeps the counts identical</text>

            {arrow(446, 92, 478, 92, COL[arm === "diffusion" ? "accent" : arm === "mae" ? "ink" : "red"])}
            <rect x={482} y={70} width={92} height={44} fill={P.paper2} stroke={COL[arm === "diffusion" ? "accent" : arm === "mae" ? "ink" : "red"]} strokeWidth="1.2" />
            <text x={528} y={88} textAnchor="middle" style={SK} fontSize="8.4" fill={P.ink}>{h.bolt.split(" ")[0]}</text>
            <text x={528} y={101} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>{h.bolt.split(" ").slice(1).join(" ")}</text>

            <text x={30} y={212} style={SK} fontSize="9.5" fill={P.accent}>{h.loss}</text>
            <text x={30} y={228} style={SK} fontSize="8.4" fill={P.sub}>{h.note}</text>

            <line x1={30} y1={246} x2={570} y2={246} stroke={P.line} strokeWidth="1" />
            <text x={30} y={262} style={SK} fontSize="8.4" fill={P.ink}>4,058,656 parameters in every arm · AdamW 2e-4 · 200 warmup then cosine · grad clip 1.0</text>
            <text x={30} y={276} style={SK} fontSize="8.4" fill={P.ink}>4000 steps at batch 128 — the same budget for each, with no per-arm branch anywhere in the driver</text>
          </g>
        );
      }

      /* ── 2. the shared protocol ───────────────────────────────────── */
      case "protocol": {
        const ft = proto === "finetune";
        return (
          <g>
            <text x={30} y={28} style={SK} fontSize="9" fill={P.sub}>one extraction site, one recipe — the only per-arm quantity is t</text>

            {box(30, 62, 78, 34, "image", "64² , [−1,1]", P.ink)}
            {arrow(112, 79, 140, 79, P.sub)}
            {box(144, 62, 92, 34, arm === "diffusion" ? "q_sample(x, t)" : "clean, t = 0", arm === "diffusion" ? "fixed noise seed" : "no corruption", P.sub)}
            {arrow(240, 79, 268, 79, P.sub)}
            {box(272, 56, 104, 46, "shared trunk", ft ? "unfrozen · lr 1e-4" : "frozen ❄", ft ? P.red : P.accent)}
            {arrow(380, 79, 408, 79, P.sub)}
            {box(412, 62, 74, 34, "read mid2", "GAP", P.ink)}
            {arrow(490, 79, 516, 79, P.sub)}
            {box(520, 62, 56, 34, "head", ft ? "lr 1e-3" : "linear", ft ? P.red : P.accent)}

            <text x={272} y={124} style={SK} fontSize="8.6" fill={ft ? P.red : P.accent}>
              {ft ? "fine-tune: 15 epochs, every arm on clean inputs — only the initialisation differs" : "probe: 60 epochs, features standardised, encoder never updated"}
            </text>

            <line x1={30} y1={146} x2={570} y2={146} stroke={P.line} strokeWidth="1" />
            <text x={30} y={166} style={SK} fontSize="9.2" fill={P.ink}>the three guards that make the comparison mean something</text>
            {[
              ["label_blind()", "pretraining runs inside a context where touching a labelled dataset raises — 'self-supervised' enforced in code, not by convention"],
              ["fixed noise generator", "the same image gets the same corruption in every arm, every seed, every sweep point — the curve measures features, not noise luck"],
              ["no per-arm branch", "probe and fine-tune recipes come from config; there is nowhere to hand-tune one objective. best epoch on val, test read once"],
            ].map(([k, v], i) => (
              <g key={k}>
                <text x={30} y={190 + i * 32} style={SK} fontSize="8.6" fill={P.accent}>{k}</text>
                <text x={30} y={203 + i * 32} style={SK} fontSize="8.2" fill={P.sub}>{v}</text>
              </g>
            ))}
          </g>
        );
      }

      /* ── 3. the probe result ──────────────────────────────────────── */
      case "probe": {
        const lo = 0.90, hi = 0.985;
        const bx = 150, bw = 380;
        const px = (v) => bx + ((v - lo) / (hi - lo)) * bw;
        const rows = SSL_ARMS.filter((a) => a.probe != null);
        return (
          <g>
            <text x={30} y={26} style={SK} fontSize="9" fill={P.sub}>linear probe on the frozen encoder — test AUROC, mean ± std over 3 seeds</text>
            <line x1={px(0.937)} y1={44} x2={px(0.937)} y2={226} stroke={P.sub} strokeWidth="1" strokeDasharray="4 3" />
            <text x={px(0.937)} y={40} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>random-init control</text>

            {rows.map((a, i) => {
              const y = 58 + i * 42;
              const c = COL[a.col];
              return (
                <g key={a.arm}>
                  <text x={140} y={y + 13} textAnchor="end" style={SK} fontSize="9.4" fill={c}>{a.arm}</text>
                  <text x={140} y={y + 25} textAnchor="end" style={SK} fontSize="7.4" fill={P.sub}>{a.site}</text>
                  <rect x={bx} y={y} width={px(a.probe) - bx} height={18} fill={a.col === "sub" ? P.faint : P.accentSoft} stroke={c} strokeWidth="1.1" />
                  <line x1={px(a.probe - a.ps)} y1={y + 9} x2={px(a.probe + a.ps)} y2={y + 9} stroke={c} strokeWidth="1" />
                  <text x={px(a.probe) + 8} y={y + 13} style={SK} fontSize="9.4" fill={P.ink}>{a.probe.toFixed(3)}</text>
                  <text x={px(a.probe) + 46} y={y + 13} style={SK} fontSize="7.6" fill={P.sub}>± {a.ps.toFixed(3)}</text>
                </g>
              );
            })}

            {[0.90, 0.92, 0.94, 0.96, 0.98].map((v) => (
              <g key={v}>
                <line x1={px(v)} y1={226} x2={px(v)} y2={230} stroke={P.ink} strokeWidth="0.9" />
                <text x={px(v)} y={240} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>{v.toFixed(2)}</text>
              </g>
            ))}
            <line x1={bx} y1={226} x2={px(hi)} y2={226} stroke={P.ink} strokeWidth="1" />

            <text x={30} y={266} style={SK} fontSize="8.6" fill={P.ink}>diffusion − MAE = <tspan fill={P.accent}>+0.011</tspan>, the claim the paper never tested · diffusion − random = only <tspan fill={P.accent}>+0.034</tspan></text>
            <text x={30} y={282} style={SK} fontSize="8.6" fill={P.red}>JEPA sits below the untrained encoder — reproducibly, across all three seeds.</text>
          </g>
        );
      }

      /* ── 4. the timestep sweep ────────────────────────────────────── */
      case "sweep": {
        const x0 = 66, x1 = 470, y0 = 224, y1 = 54;
        const lo = 0.925, hi = 0.976;
        const px = (t) => x0 + (t / 500) * (x1 - x0);
        const py = (v) => y0 - ((v - lo) / (hi - lo)) * (y0 - y1);
        const line = (key) => SSL_SWEEP.map((d, i) => `${i ? "L" : "M"}${px(d.t).toFixed(1)} ${py(d[key]).toFixed(1)}`).join(" ");
        return (
          <g>
            <text x={30} y={26} style={SK} fontSize="9" fill={P.sub}>diffusion linear probe, test AUROC vs the timestep the feature is read at</text>

            <line x1={x0} y1={py(0.960)} x2={x1} y2={py(0.960)} stroke={P.ink} strokeWidth="1" strokeDasharray="5 3" />
            <text x={x0 + 6} y={py(0.960) - 5} style={SK} fontSize="7.8" fill={P.ink}>MAE 0.960</text>
            <line x1={x0} y1={py(0.937)} x2={x1} y2={py(0.937)} stroke={P.sub} strokeWidth="1" strokeDasharray="2 3" />
            <text x={x0 + 6} y={py(0.937) - 5} style={SK} fontSize="7.8" fill={P.sub}>random-init 0.937</text>

            <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={P.ink} strokeWidth="1.1" />
            <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={P.ink} strokeWidth="1.1" />
            {[0, 100, 200, 300, 400, 500].map((t) => (
              <g key={t}>
                <line x1={px(t)} y1={y0} x2={px(t)} y2={y0 + 4} stroke={P.ink} strokeWidth="0.9" />
                <text x={px(t)} y={y0 + 15} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>{t}</text>
              </g>
            ))}
            {[0.93, 0.95, 0.97].map((v) => (
              <g key={v}>
                <line x1={x0 - 4} y1={py(v)} x2={x0} y2={py(v)} stroke={P.ink} strokeWidth="0.9" />
                <text x={x0 - 7} y={py(v) + 3} textAnchor="end" style={SK} fontSize="7.4" fill={P.sub}>{v.toFixed(2)}</text>
              </g>
            ))}
            <text x={x1} y={y0 + 28} textAnchor="end" style={SK} fontSize="8" fill={P.sub}>extraction timestep t</text>

            <path d={line("e1")} stroke={P.sub} strokeWidth="1.2" fill="none" strokeDasharray="3 2" />
            <path d={line("e2")} stroke={P.accent} strokeWidth="1.8" fill="none" />
            {SSL_SWEEP.map((d) => <circle key={d.t} cx={px(d.t)} cy={py(d.e2)} r="2.6" fill={P.accent} />)}
            <text x={px(210)} y={py(0.958) + 13} style={SK} fontSize="7.6" fill={P.sub}>mid1</text>
            <text x={px(210)} y={py(0.966) - 7} style={SK} fontSize="7.6" fill={P.accent}>mid2</text>

            <line x1={px(sw.t)} y1={y0} x2={px(sw.t)} y2={py(sw.e2)} stroke={P.accent} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={px(sw.t)} cy={py(sw.e2)} r="4.5" fill="none" stroke={P.accent} strokeWidth="1.6" />

            <rect x={492} y={54} width={92} height={92} fill={P.faint} stroke={P.line} />
            <text x={500} y={70} style={SK} fontSize="8" fill={P.sub}>at t = {sw.t}</text>
            <text x={500} y={88} style={SK} fontSize="12" fill={P.ink}>{sw.e2.toFixed(3)}</text>
            <text x={500} y={101} style={SK} fontSize="7.4" fill={P.sub}>± {sw.s2.toFixed(3)} test</text>
            <text x={500} y={120} style={SK} fontSize="8" fill={P.sub}>val {sw.v2.toFixed(3)}</text>
            <text x={500} y={136} style={SK} fontSize="7.6" fill={sw.e2 >= 0.960 ? P.accent : P.red}>{sw.e2 >= 0.960 ? "still beats MAE" : sw.e2 > 0.937 ? "below MAE" : "no better than random"}</text>

            <text x={30} y={266} style={SK} fontSize="8.5" fill={P.ink}>the rise is marginal — 0.970 at t = 10, 0.972 at t = 30–50, against a seed spread of 0.001–0.002. the fall is not:</text>
            <text x={30} y={279} style={SK} fontSize="8.5" fill={P.ink}>the advantage over MAE is gone by t ≈ 200, and by t = 500 the features match an encoder that never trained.</text>
            <text x={30} y={293} style={SK} fontSize="8" fill={P.red}>the gotcha: val is saturated at 0.994 across the low-t range, so selection picked t = 100 while test peaked at t = 50.</text>
          </g>
        );
      }

      /* ── 5. fine-tuning ───────────────────────────────────────────── */
      case "finetune": {
        const lo = 0.92, hi = 0.985;
        const x0 = 150, x1 = 520;
        const px = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
        const rows = SSL_ARMS.filter((a) => a.probe != null && a.ft != null);
        return (
          <g>
            <text x={30} y={26} style={SK} fontSize="9" fill={P.sub}>frozen probe → fine-tuned, same recipe for every arm. test AUROC.</text>
            {rows.map((a, i) => {
              const y = 60 + i * 46;
              const c = COL[a.col];
              return (
                <g key={a.arm}>
                  <text x={140} y={y + 4} textAnchor="end" style={SK} fontSize="9.6" fill={c}>{a.arm}</text>
                  <circle cx={px(a.probe)} cy={y} r="4" fill={P.paper2} stroke={c} strokeWidth="1.4" />
                  <text x={px(a.probe)} y={y - 10} textAnchor="middle" style={SK} fontSize="8" fill={P.sub}>{a.probe.toFixed(3)}</text>
                  {arrow(px(a.probe) + 6, y, px(a.ft) - 2, y, c, false, 1.4)}
                  <circle cx={px(a.ft)} cy={y} r="4.5" fill={c} />
                  <text x={px(a.ft) + 10} y={y + 4} style={SK} fontSize="9.4" fill={P.ink}>{a.ft.toFixed(3)}</text>
                  <text x={px(a.ft) + 48} y={y + 4} style={SK} fontSize="7.6" fill={P.sub}>± {a.fs.toFixed(3)}</text>
                </g>
              );
            })}

            <line x1={px(0.969)} y1={44} x2={px(0.969)} y2={216} stroke={P.ink} strokeWidth="1" strokeDasharray="5 3" />
            <text x={px(0.969) + 6} y={40} style={SK} fontSize="7.8" fill={P.ink}>supervised-100% 0.969</text>
            <line x1={px(0.952)} y1={44} x2={px(0.952)} y2={216} stroke={P.sub} strokeWidth="1" strokeDasharray="2 3" />
            <text x={px(0.952)} y={230} textAnchor="middle" style={SK} fontSize="7.8" fill={P.sub}>supervised-10% 0.952</text>

            <text x={30} y={256} style={SK} fontSize="8.6" fill={P.ink}>the probe gap of <tspan fill={P.accent}>0.011</tspan> becomes <tspan fill={P.accent}>0.002</tspan> — inside the seed noise. JEPA gains the most (+0.038): its problem</text>
            <text x={30} y={270} style={SK} fontSize="8.6" fill={P.ink}>was linear separability, not learning. as an initialisation it was fine all along.</text>
            <text x={30} y={288} style={SK} fontSize="8.2" fill={P.sub}>against plain supervision the fine-tuned gain is at most 0.008. against supervision at 10% labels, every arm wins clearly — that is where pretraining pays.</text>
          </g>
        );
      }

      /* ── 6. limits ────────────────────────────────────────────────── */
      case "limits": {
        return (
          <g>
            <text x={30} y={28} style={SK} fontSize="9.5" fill={P.accent}>what it settles</text>
            {[
              "the comparison OrthoDiffusion asserted is runnable, and runs its way — under a frozen probe",
              "the rise-then-fall timestep curve reproduces on entirely different anatomy",
              "a random-init encoder probes at 0.937 — the control that resizes every other bar",
              "label efficiency is the real win: all three arms clear supervised-10% comfortably",
            ].map((s, i) => (
              <text key={i} x={30} y={52 + i * 19} style={SK} fontSize="8.6" fill={P.ink}>· {s}</text>
            ))}

            <text x={30} y={152} style={SK} fontSize="9.5" fill={P.red}>what it does not</text>
            {[
              "one binary dataset, everything above 0.92 with a ceiling near 0.98 — fragile altitude",
              "3 seeds · 4000 steps · 4.06M params — orders of magnitude below where scaling claims live",
              "JEPA is under-trained at this budget, not fairly represented",
              "2D slices of a question the paper asks in 3D, on knees rather than chests",
            ].map((s, i) => (
              <text key={i} x={30} y={176 + i * 19} style={SK} fontSize="8.6" fill={P.red}>· {s}</text>
            ))}

            <rect x={30} y={256} width={540} height={30} fill={P.faint} stroke={P.line} />
            <text x={42} y={270} style={SK} fontSize="8.6" fill={P.ink}>a floor, not a benchmark — the same status the regex labeler holds in §2, and stated the same way. every number</text>
            <text x={42} y={282} style={SK} fontSize="8.6" fill={P.ink}>on this bench comes from results/results.csv; nothing here is quoted, and nothing is illustrative.</text>
          </g>
        );
      }
      default: return null;
    }
  })();

  const navBtn = { ...SK, fontSize: "0.8rem", padding: "2px 10px", border: `1px solid ${P.line}`, background: P.paper2, color: P.ink, cursor: "pointer" };
  const Nst = SSL_STEPS.length;
  const sliderRow = { display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" };
  const lbl = { ...SK, fontSize: "0.62rem", color: P.sub };
  const val = { ...SK, fontSize: "0.66rem", color: P.ink, minWidth: 66 };
  const toggle = (on) => ({ ...SK, fontSize: "0.68rem", padding: "3px 11px", cursor: "pointer", border: `1px solid ${on ? P.accent : P.line}`, background: on ? P.accentSoft : P.paper2, color: on ? P.accent : P.sub });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <span style={{ ...SK, fontSize: "0.6rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.08em" }}>my own run · PneumoniaMNIST · 3 seeds · every number measured</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...SK, fontSize: "0.62rem", color: P.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>step {step + 1} / {Nst}</span>
          <button onClick={() => setStep((step + Nst - 1) % Nst)} aria-label="Previous step" style={navBtn}>←</button>
          <button onClick={() => setStep((step + 1) % Nst)} aria-label="Next step" style={navBtn}>→</button>
        </div>
      </div>

      {(sk === "trunk" || sk === "protocol") && (
        <div style={sliderRow}>
          <span style={lbl}>arm:</span>
          {[["diffusion", "diffusion"], ["mae", "MAE"], ["jepa", "JEPA"]].map(([k, label]) => (
            <button key={k} onClick={() => setArm(k)} aria-pressed={arm === k} style={toggle(arm === k)}>{label}</button>
          ))}
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>the trunk never changes — only what is bolted onto it</span>
        </div>
      )}

      {sk === "protocol" && (
        <div style={sliderRow}>
          <span style={lbl}>protocol:</span>
          {[["probe", "frozen probe"], ["finetune", "fine-tune"]].map(([k, label]) => (
            <button key={k} onClick={() => setProto(k)} aria-pressed={proto === k} style={toggle(proto === k)}>{label}</button>
          ))}
        </div>
      )}

      {sk === "sweep" && (
        <div style={sliderRow}>
          <span style={lbl}>extraction timestep:</span>
          <input type="range" min={0} max={SSL_SWEEP.length - 1} step={1} value={swi} onChange={(e) => setSwi(+e.target.value)} aria-label="Extraction timestep" style={{ accentColor: P.accent, width: 170 }} />
          <span style={val}>t = {sw.t}</span>
          <span style={{ ...SK, fontSize: "0.66rem", color: P.sub }}>
            {sw.t <= 50 ? "the measured peak" : sw.t === 100 ? "what val selection chose" : sw.t <= 200 ? "still ahead of MAE" : "past the point where noise costs more than abstraction buys"}
          </span>
        </div>
      )}

      <div style={{ border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2 }}>
        <div style={{ background: "#fff" }}>
          <div style={{ aspectRatio: "600 / 300" }}>
            <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label={`SSL comparison walkthrough step ${step + 1}: ${sc.label}`} style={{ display: "block" }} strokeLinecap="round" strokeLinejoin="round">
              {body}
            </svg>
          </div>
        </div>
        <div style={{ padding: "0.9rem 1.1rem 1rem" }}>
          <div style={{ ...DISP, fontWeight: 600, fontSize: "1rem", color: P.ink, marginBottom: 4 }}>{sc.title}</div>
          <p style={{ ...BODY, fontSize: "0.88rem", color: P.sub, lineHeight: 1.65, textWrap: "pretty", margin: 0 }}>
            <span style={{ ...SK, fontSize: "0.6rem", color: P.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>step {step + 1}</span>
            {sc.body}
          </p>
          <div style={{ ...SK, fontSize: "0.66rem", color: P.ink, marginTop: 9, background: P.faint, padding: "6px 9px", display: "inline-block" }}>{sc.math}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {SSL_STEPS.map((s, j) => (
          <button key={s.key} onClick={() => setStep(j)} style={{ ...SK, fontSize: "0.62rem", padding: "4px 9px", cursor: "pointer", border: `1px solid ${j === step ? P.accent : P.line}`, background: j === step ? P.accentSoft : "#fff", color: j === step ? P.accent : P.sub }}>{j + 1}. {s.label}</button>
        ))}
      </div>
    </div>
  );
}
