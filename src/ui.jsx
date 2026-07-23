import { useState, useEffect, useRef } from "react";
import { P, GALLERY_PHOTOS, ARCHITECTURES, LIVE_ARCHITECTURES } from "./data.js";

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
   LAB GATEWAY — the door on the paper's §5.
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
    math: "✓ 8 claims reproduced · ~ 3 inside the noise · ✗ 2 did not — see results.md",
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
          ["learned DPR > frozen DPR (paper 43.5 vs 37.8)", "24.0 ± 4.4  vs  22.9 ± 4.3 EM", "mid"],
          ["EM shape differs between the variants (Fig 3)", "tok peaks k=5, seq peaks k=1", "mid"],
          ["learned DPR > BM25 (paper 43.5 vs 29.7)", "24.0 ± 4.4  vs  44.8 ± 5.1 EM", "bad"],
          ["RAG-Sequence ≥ RAG-Token on short factoids", "0.0 ± 0.0  vs  22.9 ± 6.1 EM", "bad"],
        ];
        const col = { ok: P.green, mid: P.yellow, bad: P.red };
        const mark = { ok: "✓", mid: "~", bad: "✗" };
        return (
          <g>
            <text x={300} y={20} textAnchor="middle" style={SK} fontSize="11" fill={P.sub}>13 claims from the paper, checked against my own measurements</text>
            {rows.map((r, i) => (
              <g key={i} transform={`translate(0 ${32 + i * 20})`}>
                <rect x={24} y={0} width={552} height={18} fill={i % 2 ? P.faint : "transparent"} fillOpacity="0.6" />
                <text x={34} y={13} style={SK} fontSize="11" fill={col[r[2]]}>{mark[r[2]]}</text>
                <text x={52} y={13} style={SK} fontSize="9.5" fill={P.ink}>{r[0]}</text>
                <text x={568} y={13} textAnchor="end" style={SK} fontSize="9.5" fill={col[r[2]]}>{r[1]}</text>
              </g>
            ))}
            <line x1={24} y1={258} x2={576} y2={258} stroke={P.line} strokeWidth="0.8" />
            <text x={24} y={274} style={SK} fontSize="9.5" fill={P.red}>BM25 winning is the interesting one: DPR was fine-tuned on NaturalQuestions,</text>
            <text x={24} y={288} style={SK} fontSize="9.5" fill={P.sub}>my questions are SQuAD, and word overlap is strong when the haystack is only 15k.</text>
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
