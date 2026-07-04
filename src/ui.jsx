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
   INSIGHTS VIEWER — step through real figures + the observation each carries
   ════════════════════════════════════════ */
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
