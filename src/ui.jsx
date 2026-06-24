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
