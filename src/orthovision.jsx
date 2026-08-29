import { useState, useEffect } from "react";
import { P, PAPER } from "./data.js";

/* ════════════════════════════════════════
   ORTHOVISION — the case study, at its own address
   ════════════════════════════════════════
   The paper's §2 track entry says what this thread is *for*; this room is the
   build itself, written the way the project actually went: what the data made
   us do, what we got clever about, what turned out to be broken, and where the
   number landed. Route: #/orthovision. */

const DISP = { fontFamily: "'Spectral',Georgia,serif" };
const BODY = { fontFamily: "'Source Serif 4',Georgia,serif" };
const MONO = { fontFamily: "'IBM Plex Mono',monospace" };
const SK = { font: "'IBM Plex Mono',monospace" };

const SECTIONS = [
  { id: "problem", n: "01", t: "The problem", note: "twelve findings, one number" },
  { id: "supervision", n: "02", t: "58 labels", note: "why this isn't a vision problem" },
  { id: "anatomy", n: "03", t: "What a study is", note: "study · series · slice" },
  { id: "phase1", n: "04", t: "570 GB → 11.9 GB", note: "the conversion, and four silent killers" },
  { id: "labels", n: "05", t: "The clever part", note: "calibrated soft labels" },
  { id: "model", n: "06", t: "The model", note: "18 slots, twelve heads" },
  { id: "bugs", n: "07", t: "What was wrong", note: "two anatomy bugs" },
  { id: "backbones", n: "08", t: "The bake-off", note: "why the worse model won" },
  { id: "input", n: "09", t: "Looking at the input", note: "three problems, none of them the net" },
  { id: "standing", n: "10", t: "Where it stands", note: "the honest scoreboard" },
  { id: "research", n: "11", t: "Research angles", note: "what this is placed to answer" },
];

/* ── shared bits ─────────────────────────────────────────────────────── */

function Callout({ kind, title, children }) {
  const col = kind === "wrong" ? P.red : kind === "clever" ? P.green : P.accent;
  const bg = kind === "wrong" ? "rgba(155,59,59,0.06)" : kind === "clever" ? "rgba(63,122,87,0.06)" : P.accentSoft;
  return (
    <div style={{ borderLeft: `3px solid ${col}`, background: bg, padding: "0.75rem 0.95rem", margin: "1.1rem 0" }}>
      <div style={{ ...MONO, fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.11em", color: col, marginBottom: 5 }}>{title}</div>
      <div style={{ ...BODY, fontSize: "0.92rem", lineHeight: 1.7, color: P.ink, textWrap: "pretty" }}>{children}</div>
    </div>
  );
}

function Table({ head, rows, align }) {
  return (
    <div style={{ overflowX: "auto", margin: "1.1rem 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 380 }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ ...MONO, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.09em", color: P.sub,
                textAlign: align && align[i] === "r" ? "right" : "left", padding: "0 0.7rem 5px 0", borderBottom: `1.5px solid ${P.ink}`, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} style={{ ...(j === 0 ? BODY : MONO), fontSize: j === 0 ? "0.88rem" : "0.78rem",
                  color: typeof c === "object" && c !== null && c.col ? c.col : P.ink,
                  fontWeight: typeof c === "object" && c !== null && c.b ? 600 : 400,
                  textAlign: align && align[j] === "r" ? "right" : "left",
                  padding: "6px 0.7rem 6px 0", borderBottom: `1px solid ${P.line}`, verticalAlign: "top" }}>
                  {typeof c === "object" && c !== null ? c.v : c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Fig({ ratio, caption, children }) {
  return (
    <figure style={{ margin: "1.3rem 0", border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: "#fff" }}>
      <div style={{ aspectRatio: ratio || "600 / 300" }}>{children}</div>
      {caption && (
        <figcaption style={{ ...MONO, fontSize: "0.64rem", lineHeight: 1.6, color: P.sub, padding: "0.6rem 0.8rem", borderTop: `1px solid ${P.faint}`, background: P.faint }}>{caption}</figcaption>
      )}
    </figure>
  );
}

/* arrowhead helper shared by the diagrams */
const arw = (x1, y1, x2, y2, col, dash) => {
  const a = Math.atan2(y2 - y1, x2 - x1), w = 3.6, len = 6.5;
  return (
    <g stroke={col || P.accent} strokeWidth="1.2" fill="none">
      <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash ? "4 3" : "none"} />
      <path d={`M${x2 - len * Math.cos(a) - w * Math.sin(a)} ${y2 - len * Math.sin(a) + w * Math.cos(a)} L${x2} ${y2} L${x2 - len * Math.cos(a) + w * Math.sin(a)} ${y2 - len * Math.sin(a) - w * Math.cos(a)}`} />
    </g>
  );
};
const slab = (x, y, w, h, col, fill) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={fill || P.paper2} stroke={col || P.line} strokeWidth={col ? 1.2 : 0.7} />
    {Array.from({ length: 3 }).map((_, i) => (
      <line key={i} x1={x} y1={y + ((i + 1) * h) / 4} x2={x + w} y2={y + ((i + 1) * h) / 4} stroke={P.line} strokeWidth="0.35" />
    ))}
  </g>
);

/* ── 1. what one study contains ──────────────────────────────────────── */
function DiagStudy() {
  const SER = [
    { n: "sagittal PD fat-sat", k: 30, p: "SAG", fs: true },
    { n: "sagittal PD", k: 28, p: "SAG", fs: false },
    { n: "coronal T1", k: 26, p: "COR", fs: false },
    { n: "coronal PD fat-sat", k: 30, p: "COR", fs: true },
    { n: "axial PD fat-sat", k: 32, p: "AX", fs: true },
  ];
  return (
    <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label="One study contains several series; each series is a stack of slices" style={{ display: "block" }}>
      <rect x={24} y={126} width={96} height={44} fill={P.accentSoft} stroke={P.accent} strokeWidth="1.3" />
      <text x={72} y={146} textAnchor="middle" style={SK} fontSize="10.5" fill={P.accent}>STUDY</text>
      <text x={72} y={160} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>one patient, one visit</text>
      <text x={72} y={188} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>5.53 series on average</text>

      {SER.map((s, i) => {
        const y = 30 + i * 49;
        return (
          <g key={s.n}>
            <path d={`M120 148 C 150 148, 150 ${y + 17}, 176 ${y + 17}`} fill="none" stroke={P.line} strokeWidth="1" />
            <rect x={178} y={y} width={132} height={34} fill={s.fs ? "rgba(43,76,140,0.07)" : P.paper2} stroke={s.fs ? P.accent : P.line} strokeWidth="1" />
            <text x={186} y={y + 14} style={SK} fontSize="8.4" fill={P.ink}>{s.n}</text>
            <text x={186} y={y + 26} style={SK} fontSize="7.2" fill={P.sub}>{s.k} slices · {s.p}{s.fs ? " · fat-sat" : ""}</text>
            {Array.from({ length: 7 }).map((_, j) => slab(322 + j * 13, y + 4, 11, 26, null))}
            {i === 0 && <text x={388} y={y - 6} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>a stack of slices — this is where the 3D lives</text>}
          </g>
        );
      })}

      <line x1={432} y1={22} x2={432} y2={278} stroke={P.line} strokeWidth="0.8" />
      <text x={446} y={44} style={SK} fontSize="8.6" fill={P.ink}>two axes describe a series</text>
      <text x={446} y={66} style={SK} fontSize="8" fill={P.accent}>plane</text>
      <text x={446} y={79} style={SK} fontSize="7.4" fill={P.sub}>sagittal — side-on, ACL</text>
      <text x={446} y={90} style={SK} fontSize="7.4" fill={P.sub}>coronal — face-on, MCL</text>
      <text x={446} y={101} style={SK} fontSize="7.4" fill={P.sub}>axial — top-down, kneecap</text>
      <text x={446} y={126} style={SK} fontSize="8" fill={P.accent}>sequence</text>
      <text x={446} y={139} style={SK} fontSize="7.4" fill={P.sub}>fat-sat — fluid glows white:</text>
      <text x={446} y={150} style={SK} fontSize="7.4" fill={P.sub}>effusion, contusion, fracture</text>
      <text x={446} y={164} style={SK} fontSize="7.4" fill={P.sub}>plain — structure survives:</text>
      <text x={446} y={175} style={SK} fontSize="7.4" fill={P.sub}>meniscus, cartilage, OA</text>
      <rect x={446} y={192} width={140} height={74} fill="rgba(155,59,59,0.06)" stroke={P.red} strokeWidth="1" />
      <text x={454} y={208} style={SK} fontSize="7.6" fill={P.red}>a radiologist reads both.</text>
      <text x={454} y={222} style={SK} fontSize="7.4" fill={P.sub}>we kept only the fat-sat one</text>
      <text x={454} y={233} style={SK} fontSize="7.4" fill={P.sub}>and deleted the other — the</text>
      <text x={454} y={244} style={SK} fontSize="7.4" fill={P.sub}>single biggest problem in the</text>
      <text x={454} y={255} style={SK} fontSize="7.4" fill={P.sub}>project. §09.</text>
    </svg>
  );
}

/* ── 2. the 2.5D triplet, and the 18 slots it builds ─────────────────── */
function DiagTriplet() {
  const CH = [{ c: "#B4443F", n: "R", s: "z − 2" }, { c: "#3F7A57", n: "G", s: "z" }, { c: "#2B4C8C", n: "B", s: "z + 2" }];
  return (
    <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label="Three adjacent slices are stacked as RGB channels to make one triplet; eighteen triplets make one study" style={{ display: "block" }}>
      <text x={16} y={22} style={SK} fontSize="8.6" fill={P.sub} letterSpacing="0.09em">THE TRIPLET — DEPTH WITHOUT LOSING IMAGENET</text>

      {CH.map((c, i) => (
        <g key={c.n}>
          {slab(24, 44 + i * 62, 74, 52, c.c)}
          <text x={61} y={110 + i * 62} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>slice {c.s}</text>
          {arw(102, 70 + i * 62, 138, 118 + (i - 1) * 12, c.c)}
          <text x={120} y={64 + i * 62} textAnchor="middle" style={SK} fontSize="8.4" fill={c.c}>{c.n}</text>
        </g>
      ))}

      <rect x={142} y={92} width={72} height={72} fill={P.paper2} stroke={P.ink} strokeWidth="1.3" />
      {CH.map((c, i) => <rect key={c.n} x={146 + i * 22} y={96} width={20} height={64} fill={c.c} opacity="0.5" />)}
      <text x={178} y={180} textAnchor="middle" style={SK} fontSize="8.4" fill={P.ink}>one triplet</text>
      <text x={178} y={192} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>(3, 224, 224)</text>
      <text x={178} y={214} textAnchor="middle" style={SK} fontSize="7.2" fill={P.green}>pretrained weights still fit</text>

      <line x1={238} y1={22} x2={238} y2={278} stroke={P.line} strokeWidth="0.8" />
      <text x={252} y={22} style={SK} fontSize="8.6" fill={P.sub} letterSpacing="0.09em">18 SLOTS PER STUDY</text>
      {["sagittal", "coronal", "axial"].map((pl, r) => (
        <g key={pl}>
          <text x={252} y={62 + r * 72} style={SK} fontSize="8.2" fill={P.accent}>{pl}</text>
          {Array.from({ length: 6 }).map((_, c) => (
            <g key={c}>
              <rect x={252 + c * 40} y={70 + r * 72} width={32} height={34} fill={P.accentSoft} stroke={P.accent} strokeWidth="0.9" />
              <text x={268 + c * 40} y={91 + r * 72} textAnchor="middle" style={SK} fontSize="8" fill={P.accent}>{r * 6 + c + 1}</text>
            </g>
          ))}
          <text x={252} y={118 + r * 72} style={SK} fontSize="7.2" fill={P.sub}>6 positions through the central 80% of the stack</text>
        </g>
      ))}
      <text x={500} y={286} textAnchor="end" style={SK} fontSize="7.6" fill={P.sub}>2.71 MB per study · 11.9 GB total</text>
    </svg>
  );
}

/* ── 3. six states → a calibrated probability ────────────────────────── */
function DiagSoftLabels() {
  const ST = [
    { k: "llm_pos", r: "any", l: "present", p: 0.93, c: P.green },
    { k: "llm_neg", r: "any", l: "absent", p: 0.04, c: P.red },
    { k: "nm_rule1", r: "fired", l: "not mentioned", p: 0.35, c: P.yellow },
    { k: "nm_rule0", r: "silent", l: "not mentioned", p: 0.09, c: P.sub },
    { k: "rule1", r: "fired", l: "—", p: 0.52, c: P.yellow },
    { k: "rule0", r: "silent", l: "—", p: 0.06, c: P.sub },
  ];
  return (
    <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label="Each label cell falls into one of six states; the gold studies convert each state into a probability used as the training target" style={{ display: "block" }}>
      <text x={16} y={20} style={SK} fontSize="8.4" fill={P.sub}>what the two labelers said</text>
      <text x={252} y={20} style={SK} fontSize="8.4" fill={P.sub}>ask the 58 gold studies</text>
      <text x={430} y={20} style={SK} fontSize="8.4" fill={P.sub}>train on this number</text>

      <text x={16} y={40} style={SK} fontSize="7.4" fill={P.sub}>state</text>
      <text x={104} y={40} style={SK} fontSize="7.4" fill={P.sub}>regex</text>
      <text x={158} y={40} style={SK} fontSize="7.4" fill={P.sub}>LLM</text>
      <line x1={16} y1={45} x2={228} y2={45} stroke={P.ink} strokeWidth="1" />

      {ST.map((s, i) => {
        const y = 62 + i * 34;
        return (
          <g key={s.k}>
            <text x={16} y={y} style={SK} fontSize="8.4" fill={P.ink}>{s.k}</text>
            <text x={104} y={y} style={SK} fontSize="7.8" fill={P.sub}>{s.r}</text>
            <text x={158} y={y} style={SK} fontSize="7.8" fill={P.sub}>{s.l}</text>
            <line x1={16} y1={y + 8} x2={228} y2={y + 8} stroke={P.line} strokeWidth="0.5" />
            {arw(232, y - 4, 258, y - 4, P.line)}
            <rect x={262} y={y - 15} width={116} height={15} fill={P.faint} stroke={P.line} strokeWidth="0.5" />
            <rect x={262} y={y - 15} width={116 * s.p} height={15} fill={s.c} opacity="0.55" />
            <text x={266} y={y - 4} style={SK} fontSize="7.4" fill={P.ink}>{Math.round(s.p * 100)}% were truly positive</text>
            {arw(382, y - 4, 408, y - 4, P.line)}
            <text x={414} y={y - 3} style={SK} fontSize="11" fill={s.c}>{s.p.toFixed(2)}</text>
          </g>
        );
      })}

      <line x1={466} y1={30} x2={466} y2={278} stroke={P.line} strokeWidth="0.8" />
      <text x={478} y={54} style={SK} fontSize="8.2" fill={P.accent}>shrinkage</text>
      <text x={478} y={68} style={SK} fontSize="7.2" fill={P.sub}>58 × 12 × 6 leaves</text>
      <text x={478} y={78} style={SK} fontSize="7.2" fill={P.sub}>single digits per bucket,</text>
      <text x={478} y={88} style={SK} fontSize="7.2" fill={P.sub}>so 2-of-3 would read</text>
      <text x={478} y={98} style={SK} fontSize="7.2" fill={P.sub}>0.667 straight from noise.</text>
      <text x={478} y={112} style={SK} fontSize="7.2" fill={P.sub}>each estimate is pulled</text>
      <text x={478} y={122} style={SK} fontSize="7.2" fill={P.sub}>toward the pooled rate,</text>
      <text x={478} y={132} style={SK} fontSize="7.2" fill={P.sub}>weighted by its own n.</text>
      <text x={478} y={146} style={SK} fontSize="8" fill={P.ink}>k = 25</text>

      <text x={478} y={178} style={SK} fontSize="8.2" fill={P.accent}>fold safety</text>
      <text x={478} y={192} style={SK} fontSize="7.2" fill={P.sub}>the 58 are both the only</text>
      <text x={478} y={202} style={SK} fontSize="7.2" fill={P.sub}>calibration data and the</text>
      <text x={478} y={212} style={SK} fontSize="7.2" fill={P.sub}>only honest test set, so</text>
      <text x={478} y={222} style={SK} fontSize="7.2" fill={P.sub}>calibration is refitted</text>
      <text x={478} y={232} style={SK} fontSize="7.2" fill={P.sub}>inside every fold.</text>
      <text x={478} y={250} style={SK} fontSize="7.4" fill={P.red}>skip it and the score</text>
      <text x={478} y={260} style={SK} fontSize="7.4" fill={P.red}>inflates 0.05–0.10,</text>
      <text x={478} y={270} style={SK} fontSize="7.4" fill={P.red}>invisibly.</text>
    </svg>
  );
}

/* ── 4. the model ────────────────────────────────────────────────────── */
function DiagModel() {
  return (
    <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label="Eighteen triplets go through one ResNet-34, gain sequence and depth embeddings, then twelve separate attention heads pool them into twelve probabilities" style={{ display: "block" }}>
      {Array.from({ length: 6 }).map((_, i) => slab(20 + i * 5, 108 + i * 5, 56, 52, i === 5 ? P.accent : null))}
      <text x={52} y={200} textAnchor="middle" style={SK} fontSize="8.2" fill={P.ink}>18 triplets</text>
      <text x={52} y={212} textAnchor="middle" style={SK} fontSize="7.2" fill={P.sub}>3 planes × 6 depths</text>

      {arw(108, 140, 132, 140)}
      <rect x={134} y={112} width={68} height={56} fill={P.paper2} stroke={P.ink} strokeWidth="1.3" />
      <text x={168} y={136} textAnchor="middle" style={SK} fontSize="9.6" fill={P.ink}>ResNet-34</text>
      <text x={168} y={149} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>shared · 21.3 M</text>
      <text x={168} y={182} textAnchor="middle" style={SK} fontSize="7.2" fill={P.green}>beat ConvNeXt and DINOv2 · §08</text>

      {arw(206, 140, 230, 140)}
      {Array.from({ length: 4 }).map((_, i) => (
        <rect key={i} x={234} y={116 + i * 13} width={44} height={10} fill={`rgba(43,76,140,${0.25 + i * 0.16})`} stroke={P.line} strokeWidth="0.4" />
      ))}
      <text x={256} y={184} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>18 × 512</text>

      <rect x={230} y={214} width={116} height={44} fill={P.accentSoft} stroke={P.accent} strokeWidth="1" strokeDasharray="4 3" />
      <text x={288} y={230} textAnchor="middle" style={SK} fontSize="7.6" fill={P.accent}>+ which sequence</text>
      <text x={288} y={243} textAnchor="middle" style={SK} fontSize="7.6" fill={P.accent}>+ which depth position</text>
      <text x={288} y={254} textAnchor="middle" style={SK} fontSize="6.8" fill={P.red}>the second one was missing — §07</text>
      {arw(288, 212, 288, 178, P.accent, true)}

      {arw(282, 140, 306, 140)}
      <rect x={310} y={64} width={96} height={152} fill={P.paper2} stroke={P.accent} strokeWidth="1.3" />
      <text x={358} y={84} textAnchor="middle" style={SK} fontSize="9" fill={P.accent}>attention</text>
      <text x={358} y={96} textAnchor="middle" style={SK} fontSize="7.4" fill={P.sub}>12 separate heads</text>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={318 + (i % 6) * 14} y={110 + Math.floor(i / 6) * 18} width={11} height={13}
          fill={i < 3 ? "rgba(155,59,59,0.35)" : P.accentSoft} stroke={i < 3 ? P.red : P.accent} strokeWidth="0.7" />
      ))}
      <text x={358} y={162} textAnchor="middle" style={SK} fontSize="7.2" fill={P.sub}>one head per finding —</text>
      <text x={358} y={173} textAnchor="middle" style={SK} fontSize="7.2" fill={P.sub}>the ACL is mid-sagittal,</text>
      <text x={358} y={184} textAnchor="middle" style={SK} fontSize="7.2" fill={P.sub}>the MCL is coronal</text>
      <text x={358} y={200} textAnchor="middle" style={SK} fontSize="7" fill={P.red}>three of them collapsed · §09</text>

      {arw(410, 140, 434, 140)}
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i}>
          <rect x={438} y={40 + i * 18} width={82} height={13} fill={P.faint} stroke={P.line} strokeWidth="0.4" />
          <rect x={438} y={40 + i * 18} width={82 * [0.94, 0.72, 0.85, 0.84, 0.94, 0.73, 0.79, 0.89, 0.67, 0.86, 0.83, 0.88][i]} height={13} fill={P.accent} opacity="0.5" />
        </g>
      ))}
      <text x={528} y={50} style={SK} fontSize="7.4" fill={P.sub}>twelve</text>
      <text x={528} y={61} style={SK} fontSize="7.4" fill={P.sub}>probabilities,</text>
      <text x={528} y={72} style={SK} fontSize="7.4" fill={P.sub}>scored as</text>
      <text x={528} y={83} style={SK} fontSize="7.4" fill={P.sub}>macro AUC</text>
      <text x={528} y={266} style={SK} fontSize="7.4" fill={P.ink}>5 folds,</text>
      <text x={528} y={277} style={SK} fontSize="7.4" fill={P.ink}>averaged</text>
    </svg>
  );
}

/* ── 5. the laterality bug ───────────────────────────────────────────── */
function DiagLaterality() {
  return (
    <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label="Flipping works for coronal and axial but is wrong for sagittal, where medial to lateral is the slice ordering" style={{ display: "block" }}>
      <text x={150} y={22} textAnchor="middle" style={SK} fontSize="9" fill={P.green}>CORONAL / AXIAL — flip is right</text>
      <text x={440} y={22} textAnchor="middle" style={SK} fontSize="9" fill={P.red}>SAGITTAL — flip is wrong</text>
      <line x1={300} y1={10} x2={300} y2={290} stroke={P.line} strokeWidth="0.8" />

      {/* coronal: medial↔lateral lives inside the image */}
      {slab(40, 44, 96, 84, P.ink)}
      <text x={88} y={140} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>right knee, face-on</text>
      <text x={48} y={64} style={SK} fontSize="7.4" fill={P.accent}>med</text>
      <text x={112} y={64} style={SK} fontSize="7.4" fill={P.accent}>lat</text>
      {arw(146, 86, 178, 86, P.green)}
      <text x={162} y={78} textAnchor="middle" style={SK} fontSize="7.4" fill={P.green}>flip</text>
      {slab(184, 44, 96, 84, P.green)}
      <text x={192} y={64} style={SK} fontSize="7.4" fill={P.accent}>lat</text>
      <text x={256} y={64} style={SK} fontSize="7.4" fill={P.accent}>med</text>
      <text x={232} y={140} textAnchor="middle" style={SK} fontSize="7.6" fill={P.green}>now it looks left</text>
      <text x={150} y={168} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>medial ↔ lateral is one of the two</text>
      <text x={150} y={180} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>in-image directions, so a mirror fixes it</text>

      {/* sagittal: the axis is the stack, not the image */}
      {slab(324, 44, 84, 84, P.ink)}
      <text x={366} y={140} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>side-on view</text>
      <text x={330} y={64} style={SK} fontSize="7.4" fill={P.sub}>front</text>
      <text x={382} y={64} style={SK} fontSize="7.4" fill={P.sub}>back</text>
      {arw(414, 86, 440, 86, P.red)}
      <text x={427} y={78} textAnchor="middle" style={SK} fontSize="7.4" fill={P.red}>flip</text>
      {slab(446, 44, 84, 84, P.red)}
      <text x={452} y={64} style={SK} fontSize="7.4" fill={P.sub}>back</text>
      <text x={502} y={64} style={SK} fontSize="7.4" fill={P.sub}>front</text>
      <text x={488} y={140} textAnchor="middle" style={SK} fontSize="7.4" fill={P.red}>swapped front and back —</text>
      <text x={488} y={151} textAnchor="middle" style={SK} fontSize="7.4" fill={P.red}>mirrored the ACL's geometry</text>
      <text x={440} y={172} textAnchor="middle" style={SK} fontSize="7.6" fill={P.sub}>and did nothing at all to medial ↔ lateral</text>

      {/* the fix */}
      <rect x={324} y={188} width={252} height={104} fill="rgba(63,122,87,0.06)" stroke={P.green} strokeWidth="1" />
      <text x={334} y={206} style={SK} fontSize="8.2" fill={P.green}>the fix — medial↔lateral IS the slice order</text>
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i}>
          {slab(336 + i * 24, 216, 20, 30, null)}
          <text x={346 + i * 24} y={256} textAnchor="middle" style={SK} fontSize="6.6" fill={P.sub}>{i + 1}</text>
        </g>
      ))}
      <text x={334} y={272} style={SK} fontSize="7.4" fill={P.sub}>for a right knee, reverse the sagittal stack. DICOM's +x</text>
      <text x={334} y={282} style={SK} fontSize="7.4" fill={P.sub}>always points to the patient's left, whichever knee it is.</text>
      {arw(336, 210, 508, 210, P.green)}
    </svg>
  );
}

/* ── 6. plane ablation ───────────────────────────────────────────────── */
function ChartPlanes() {
  const ROWS = [
    { n: "everything", v: 0.865, base: true },
    { n: "sagittal only", v: 0.701, bad: true },
    { n: "coronal only", v: 0.792 },
    { n: "axial only", v: 0.795 },
    { n: "delete sagittal", v: 0.851, note: "−0.014 · barely hurts", bad: true },
    { n: "delete coronal", v: 0.834, note: "−0.031" },
    { n: "delete axial", v: 0.816, note: "−0.049" },
  ];
  const x0 = 150, w = 300, lo = 0.65, hi = 0.9;
  const px = (v) => x0 + ((v - lo) / (hi - lo)) * w;
  return (
    <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label="Masking whole planes: deleting sagittal costs almost nothing, which is the fingerprint of the sagittal-specific bugs" style={{ display: "block" }}>
      <text x={16} y={22} style={SK} fontSize="8.6" fill={P.sub}>macro AUC with whole planes masked out, measured on all 4,407 studies</text>
      {[0.65, 0.7, 0.75, 0.8, 0.85, 0.9].map((t) => (
        <g key={t}>
          <line x1={px(t)} y1={44} x2={px(t)} y2={252} stroke={P.faint} strokeWidth="0.8" />
          <text x={px(t)} y={266} textAnchor="middle" style={SK} fontSize="7.2" fill={P.sub}>{t.toFixed(2)}</text>
        </g>
      ))}
      <line x1={px(0.865)} y1={44} x2={px(0.865)} y2={252} stroke={P.accent} strokeWidth="1" strokeDasharray="4 3" />
      {ROWS.map((r, i) => {
        const y = 56 + i * 28;
        const col = r.base ? P.accent : r.bad ? P.red : P.sub;
        return (
          <g key={r.n}>
            <text x={142} y={y + 11} textAnchor="end" style={SK} fontSize="8.4" fill={col}>{r.n}</text>
            <rect x={x0} y={y} width={Math.max(1, px(r.v) - x0)} height={15} fill={col} opacity={r.base ? 0.5 : 0.34} />
            <text x={px(r.v) + 6} y={y + 11} style={SK} fontSize="8.4" fill={col}
              stroke="#fff" strokeWidth="3" paintOrder="stroke">{r.v.toFixed(3)}</text>
            {r.note && <text x={px(r.v) + 44} y={y + 11} style={SK} fontSize="7.2" fill={col}
              stroke="#fff" strokeWidth="3" paintOrder="stroke">{r.note}</text>}
          </g>
        );
      })}
      <text x={16} y={288} style={SK} fontSize="7.6" fill={P.red}>sagittal is the plane a knee is primarily read in — and it is our least useful one</text>
    </svg>
  );
}

/* ── 7. head similarity ──────────────────────────────────────────────── */
function ChartHeads() {
  const PAIRS = [
    { a: "oa_medial ↔ oa_lateral", v: 0.899, bad: true },
    { a: "oa_lateral ↔ oa_patellofemoral", v: 0.876, bad: true },
    { a: "average across all pairs", v: 0.663 },
    { a: "meniscus_medial ↔ meniscus_lateral", v: 0.492, good: true },
  ];
  return (
    <svg viewBox="0 0 600 300" width="100%" height="100%" role="img" aria-label="Attention head overlap: the three osteoarthritis heads look in the same place while the two meniscus heads are properly differentiated" style={{ display: "block" }}>
      <text x={16} y={22} style={SK} fontSize="8.6" fill={P.sub}>where each head looks, compared — 1.0 means the two heads are reading the same slots</text>
      {PAIRS.map((p, i) => {
        const y = 48 + i * 42;
        const col = p.bad ? P.red : p.good ? P.green : P.sub;
        return (
          <g key={p.a}>
            <text x={16} y={y + 11} style={SK} fontSize="8.4" fill={col}>{p.a}</text>
            <rect x={330} y={y} width={180} height={16} fill={P.faint} stroke={P.line} strokeWidth="0.4" />
            <rect x={330} y={y} width={180 * p.v} height={16} fill={col} opacity="0.42" />
            <text x={518} y={y + 12} style={SK} fontSize="9.6" fill={col}>{p.v.toFixed(3)}</text>
            {p.bad && <text x={16} y={y + 24} style={SK} fontSize="7.2" fill={P.red}>should be different places</text>}
            {p.good && <text x={16} y={y + 24} style={SK} fontSize="7.2" fill={P.green}>healthy — genuinely different, and their scores agree</text>}
          </g>
        );
      })}
      <line x1={16} y1={228} x2={584} y2={228} stroke={P.line} strokeWidth="0.8" />
      <text x={16} y={248} style={SK} fontSize="8" fill={P.ink}>the three OA heads score 0.938 / 0.725 / 0.790 — one head that works, two riding along</text>
      <text x={16} y={266} style={SK} fontSize="8" fill={P.ink}>the two meniscus heads score 0.850 / 0.837 — differentiated, and close</text>
      <text x={16} y={286} style={SK} fontSize="7.6" fill={P.sub}>that contrast is the whole diagnosis</text>
    </svg>
  );
}

/* ── the page ────────────────────────────────────────────────────────── */

export default function OrthoVision() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const paperTitle = document.title;
    window.scrollTo(0, 0);
    document.title = `OrthoVision — ${PAPER.author}`;
    return () => { document.title = paperTitle; };
  }, []);

  /* Esc leaves, same as the Lab, the Instrument Room and the CV. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") window.location.hash = "#Tracks";
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Light the rail entry for whichever section is nearest the top. */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-72px 0px -55% 0px" }
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const H = ({ children }) => (
    <p style={{ ...BODY, fontSize: "0.98rem", lineHeight: 1.78, color: P.ink, margin: "0 0 1rem", textWrap: "pretty" }}>{children}</p>
  );
  const Lead = ({ children }) => (
    <p style={{ ...BODY, fontSize: "1.06rem", lineHeight: 1.72, color: P.ink, margin: "0 0 1.1rem", textWrap: "pretty" }}>{children}</p>
  );
  const Stat = ({ v, l, col }) => (
    <div style={{ borderTop: `2px solid ${col || P.ink}`, paddingTop: 7, minWidth: 96 }}>
      <div style={{ ...DISP, fontSize: "1.5rem", fontWeight: 600, color: col || P.ink, lineHeight: 1 }}>{v}</div>
      <div style={{ ...MONO, fontSize: "0.58rem", color: P.sub, marginTop: 5, lineHeight: 1.45 }}>{l}</div>
    </div>
  );

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:${P.paper};color:${P.ink};font-family:'Source Serif 4',Georgia,serif;
          -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        ::selection{background:${P.highlight}}
        :focus-visible{outline:2px solid ${P.accent};outline-offset:2px}
        .ov-grid{display:grid;grid-template-columns:216px minmax(0,1fr);gap:2.4rem;align-items:start;
          max-width:1180px;margin:0 auto;padding:0 1.4rem}
        .ov-rail{position:sticky;top:0;max-height:100vh;overflow-y:auto;padding:1.7rem 0 3rem}
        .ov-railitem{display:block;width:100%;text-align:left;background:transparent;border:none;cursor:pointer;
          padding:5px 0 5px 10px;border-left:2px solid ${P.line};transition:border-color .15s,color .15s}
        .ov-railitem:hover{border-left-color:${P.accent}}
        .ov-main{padding:1.7rem 0 5rem;max-width:760px}
        .ov-sec{scroll-margin-top:16px;padding-bottom:2.6rem}
        @media(max-width:900px){
          .ov-grid{grid-template-columns:1fr;gap:0;padding:0 1rem}
          .ov-rail{position:static;max-height:none;padding:1rem 0 0;
            display:flex;gap:.4rem;overflow-x:auto;border-bottom:1px solid ${P.line}}
          .ov-railitem{border-left:none;border-bottom:2px solid ${P.line};padding:5px 8px;white-space:nowrap}
        }
        @media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
      `}</style>

      <div style={{ minHeight: "100vh", background: P.paper, color: P.ink }}>

        {/* RUNNING HEAD */}
        <header style={{ borderBottom: `2px solid ${P.ink}`, background: P.paper2, position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0.7rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...MONO, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: P.ink }}>OrthoVision</span>
              <span style={{ ...MONO, fontSize: "0.58rem", color: P.sub }}>RSNA knee MRI · weak supervision · case study</span>
            </div>
            <a href="#Tracks" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>← back to the paper</a>
          </div>
        </header>

        <div className="ov-grid">

          {/* RAIL */}
          <nav className="ov-rail" aria-label="Sections">
            {SECTIONS.map((s) => {
              const on = active === s.id;
              return (
                <a key={s.id} href={`#/orthovision`} className="ov-railitem"
                  onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                  style={{ borderLeftColor: on ? P.accent : P.line, textDecoration: "none" }}>
                  <div style={{ ...MONO, fontSize: "0.54rem", color: P.sub, letterSpacing: "0.1em" }}>{s.n}</div>
                  <div style={{ ...MONO, fontSize: "0.7rem", color: on ? P.accent : P.ink, lineHeight: 1.3 }}>{s.t}</div>
                  <div style={{ ...MONO, fontSize: "0.54rem", color: P.sub, lineHeight: 1.35, marginTop: 1 }}>{s.note}</div>
                </a>
              );
            })}
            <div style={{ ...MONO, fontSize: "0.54rem", color: P.sub, marginTop: "1.4rem", paddingLeft: 10, lineHeight: 1.6 }}>esc to leave</div>
          </nav>

          {/* BODY */}
          <main className="ov-main">

            <div style={{ ...MONO, fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: P.sub, marginBottom: 10 }}>Case study · active thread</div>
            <h1 style={{ ...DISP, fontWeight: 600, fontSize: "clamp(1.9rem,4.6vw,2.9rem)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "0.9rem" }}>
              OrthoVision
            </h1>
            <p style={{ ...BODY, fontSize: "1.16rem", lineHeight: 1.6, color: P.sub, marginBottom: "1.6rem", maxWidth: 620, textWrap: "pretty" }}>
              Twelve findings from a knee MRI, when 1.3% of the studies carry a real label and the
              rest carry a radiology report in nine languages. The build, the two bugs that cost
              the most, and the one piece worth keeping.
            </p>

            <div style={{ display: "flex", gap: "1.6rem", flexWrap: "wrap", marginBottom: "2.2rem" }}>
              <Stat v="4,407" l="studies" />
              <Stat v="58" l="with doctor-verified labels" col={P.red} />
              <Stat v="0.883" l="macro AUC, held out" col={P.accent} />
              <Stat v="0.846" l="model, vs 0.812 for its own teacher" col={P.green} />
            </div>

            {/* 01 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[0]}>
              <Lead>
                A hospital takes an MRI of someone's knee, a radiologist reads it and writes a report.
                The task is to have a computer read the same images and answer twelve yes/no questions —
                ACL tear, MCL injury, the two menisci, three compartments of osteoarthritis, effusion,
                synovitis, Baker's cyst, bone contusion, fracture.
              </Lead>
              <H>
                What comes out is a probability per finding, not a yes or no, and the score is
                macro-averaged AUC-ROC: for each finding on its own, how well do the probabilities
                <i> rank</i> affected knees above healthy ones — then average the twelve. Two
                consequences follow from that sentence and they shape everything downstream. Only the
                ordering matters, so the absolute numbers can be miscalibrated without penalty. And
                because each finding is averaged in with equal weight, being excellent at effusion
                cannot buy back being poor at lateral osteoarthritis. The rare, awkward findings
                count exactly as much as the common ones.
              </H>
            </Sec>

            {/* 02 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[1]}>
              <Lead>
                Here is the number that decided every choice in the project.
              </Lead>
              <Table
                head={["", "count"]} align={["l", "r"]}
                rows={[
                  ["Studies (patients)", "4,407"],
                  [{ v: "Studies with real, doctor-verified labels", b: true }, { v: "58", col: P.red, b: true }],
                  ["Studies with only a text report", "4,349"],
                  ["Reports not in English", "60.6%"],
                  ["Raw data", "569.76 GB · 819,078 files"],
                ]}
              />
              <H>
                Fifty-eight labelled studies times twelve findings is roughly <b>700 label cells</b>.
                A ResNet-34 has <b>21 million parameters</b>. You cannot fit 21 million parameters to
                700 numbers, and no amount of architecture shopping changes that arithmetic.
              </H>
              <Callout kind="clever" title="the framing that follows">
                This is not really a computer-vision problem. It is a <b>weak-supervision</b> problem.
                The question is not "which network" but "where do we get enough labels" — and the only
                possible answer is the 4,349 text reports nobody had turned into targets yet.
              </Callout>
            </Sec>

            {/* 03 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[2]}>
              <H>
                A <b>slice</b> is one 2D greyscale cross-section. A <b>series</b> is a stack of slices
                sweeping through the knee in one direction — this is where the 3D lives. A <b>study</b>
                is every series from one visit, 5.53 of them on average here. Each slice is a DICOM
                file: a picture plus a large header saying where it sits in space, which way it is
                oriented, which knee, and what the scanner was doing.
              </H>
              <Fig caption="One study, five series, and the two axes that describe each one. The plane decides which findings are even visible; the sequence decides which tissue is bright. Keeping only the fat-suppressed series — the blue ones — is the decision that comes back in §09.">
                <DiagStudy />
              </Fig>
              <H>
                The sequence axis is the one that is easy to underrate. MRI has no fixed units:
                brightness means "how this tissue responded to these settings", so the same knee looks
                entirely different under two sequences. Fluid-sensitive with fat suppression makes
                water glow white and deliberately darkens fat, which is what you want for anything
                <i> wet</i> — effusion, swelling, bone bruise, fracture. Without fat suppression, fat
                stays bright and you keep the contrast that shows <i>shape</i> — meniscus, cartilage,
                bone outline. A radiologist reads both.
              </H>
            </Sec>

            {/* 04 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[3]}>
              <H>
                570 GB and 819,078 files, against a ~20 GB working directory and a 9-hour session.
                You cannot load it and you cannot even convert all of it once. So the decision was to
                convert only what the model would actually look at: 3 series per study × 6 positions ×
                3 slices = <b>54 slices</b>, which is 11.9 GB and about 31 minutes, against ~54 GB and
                ~10 hours for everything. The cost is stated rather than hidden — the archive holds
                only what the current sampler reads, so changing the sampling means reconverting.
                A deliberate trade of future flexibility for a result now.
              </H>
              <Callout kind="wrong" title="four things that ruin a DICOM read, all silently">
                <b>Sort by geometry, not filename.</b> <code>InstanceNumber</code> and filename order
                are both unreliable across vendors. Take the cross product of the row and column
                direction cosines to get the slice normal, project each slice's position onto it, sort
                by that. Get it wrong and "three adjacent slices" are three unrelated cross-sections.
                <br /><br />
                <b>Invert <code>MONOCHROME1</code>.</b> Some scanners store images photographically
                inverted; miss it and half the dataset trains as a negative of the other half.
                <br /><br />
                <b>Normalise per series.</b> One scanner's 800 is another's 3000. Clip each series to
                its own 0.5th–99.5th percentile and rescale — per volume, so relative slice brightness
                survives.
                <br /><br />
                <b>Record which knee it is.</b> Left or right, from the header. §07 is what happens
                when you use that fact slightly too enthusiastically.
              </Callout>
              <H>
                Then the 3D problem. The knee is a volume, but ImageNet-pretrained networks want a
                3-channel 2D image. One slice at a time throws away depth — and a meniscal tear's
                whole signature is that it <i>persists across adjacent slices</i>, which is exactly
                what tells it apart from an artifact. A true 3D convolution models depth properly but
                forfeits ImageNet pretraining, which with 58 labels loses badly.
              </H>
              <Callout kind="clever" title="2.5D — the most important structural idea in the pipeline">
                Take three <i>adjacent</i> slices and stack them where red, green and blue would go.
                The first convolution learns to combine them, so you keep ImageNet pretraining
                <i> and</i> get depth context, for free.
              </Callout>
              <Fig caption="Six triplets per series, spread through the central 80% of the stack — the outer slices are mostly soft tissue and air. Three planes × six positions = 18 slots per study, 2.71 MB each, stored as one flat binary with an index of byte offsets.">
                <DiagTriplet />
              </Fig>
            </Sec>

            {/* 05 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[4]}>
              <Lead>
                This is the cleverest part of the project and the reason the model punches above its
                weight. It is also the only part with nothing equivalent in any public notebook.
              </Lead>
              <H>
                Only 58 studies have doctor labels, so the other 4,349 reports get read twice, by two
                different tools, and <i>both</i> answers are kept. A <b>regex labeler</b> pattern-matches
                across languages — <code>effusion</code>, <code>derrame</code>, <code>Erguss</code> — with
                a negation window so "no effusion" does not fire. It is free, auditable, runs on all
                4,407, and is right about 67% of the time. An <b>LLM</b> reads all of them, including
                the 60.6% that are not in English, and answers one of three things: <i>present</i>,
                <i> absent</i>, or <i>not mentioned</i>.
              </H>
              <Callout kind="clever" title="the third answer is the one that matters">
                A report that never mentions the ACL is <b>not</b> evidence the ACL is fine. Collapsing
                <i> not mentioned</i> into "no" would quietly poison a large fraction of the dataset.
              </Callout>
              <H>
                Now the real problem. The regex fires on <code>mcl</code> and is right 35% of the time.
                What do you train on? Train on <code>1.0</code> and the model faithfully learns to be
                wrong 65% of the time. Weight the loss by 0.35 and you have moved the minimum to the
                wrong place. Discard the cell and you have thrown away almost all your data.
              </H>
              <Callout kind="clever" title="train on the probability itself">
                That cell is not "a positive we are unsure about". It is a cell whose probability of
                being positive is 0.35 — so make the target literally <code>0.35</code>. Cross-entropy
                against a soft target is a <b>proper scoring rule</b>: its minimum sits exactly at the
                true probability. Train on 0.35 and the model learns the truth. Train on 1.0 and it
                learns the labeler's mistakes.
              </Callout>
              <Fig caption="Every (study, finding) cell lands in one of six states. For each state the 58 gold studies answer one question — when a cell looked like this, how often was it actually positive? — and that fraction becomes the training target.">
                <DiagSoftLabels />
              </Fig>
              <H>
                Two details keep it honest. <b>Shrinkage</b>: 58 studies × 12 findings × 6 states
                leaves single-digit counts per bucket, where 2-out-of-3 would hand you 0.667 straight
                from noise — so each estimate is pulled toward a rate pooled across all findings,
                weighted by how much data it actually has. Standard empirical-Bayes. And <b>fold
                safety</b>: the 58 gold studies are simultaneously the only calibration data and the
                only honest test set, so calibration is refitted inside every fold using only that
                fold's training gold. Skip that and the score inflates by 0.05–0.10 with nothing
                visible to warn you.
              </H>
              <Callout kind="clever" title="the result that justifies the machinery">
                The LLM, <i>reading the actual radiology report</i>, scores <b>0.812</b>.
                The model, which <i>never sees a report</i>, scores <b>0.846</b>.
                <br /><br />
                The student beats the teacher. Noise averages out over 4,407 studies, and the pixels
                carry things the text never wrote down.
              </Callout>
            </Sec>

            {/* 06 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[5]}>
              <Fig caption="18 triplets through one shared ResNet-34, each feature tagged with which sequence and which depth position it came from, then twelve separate attention heads pool the 18 slots into twelve probabilities.">
                <DiagModel />
              </Fig>
              <H>
                One label per <b>study</b>, eighteen images, and no idea which slot shows the tear —
                that is textbook multiple-instance learning, and attention is the answer to it. The
                model learns weights over the 18 slots and pools them: for this finding slot 7 matters
                and slot 12 does not. Nobody supplies that; it falls out of getting the study-level
                label right. <a href="#/lab/abmil" style={{ color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>The mechanism is rebuilt as an interactive sketch in the Lab →</a>
              </H>
              <H>
                <b>Twelve separate heads</b>, because the twelve findings live in different places —
                the ACL is on a mid-sagittal slice, the MCL on a coronal one, and a single shared
                pooling would have to compromise between them. The cost is one
                <code> Linear(128, 12)</code> instead of <code>Linear(128, 1)</code>. The bonus is that
                the attention weights are a free localiser: they say where the model looked without
                anyone drawing a box, and that is exactly what diagnosed the problems in §09.
              </H>
              <H>
                <b>Five folds</b>, averaged at the end. With 58 gold studies a single split carries
                about <b>±0.08</b> of noise — larger than most of the improvements worth chasing — so
                a one-split result cannot tell you whether a change helped. Gold studies are dealt out
                evenly first so no fold is left unevaluable.
              </H>
            </Sec>

            {/* 07 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[6]}>
              <Lead>
                Two bugs, both from knee anatomy rather than from code, and coupled tightly enough
                that fixing either one alone would have done nothing.
              </Lead>
              <H>
                Four of the twelve findings name a side — medial is toward the body's midline, lateral
                away from it. Left and right knees are mirror images, so unfixed, the model has to
                learn each side-specific finding <i>twice</i>, from 58 labels. The obvious fix is to
                flip right knees so every knee looks left. That is correct for coronal and axial,
                and wrong for sagittal.
              </H>
              <Fig caption="A sagittal image's two in-image directions are front↔back and up↔down. Medial↔lateral is not in the picture at all — it is the direction you travel as you move through the stack.">
                <DiagLaterality />
              </Fig>
              <Callout kind="wrong" title="bug 1 — the flip was doing damage, not nothing">
                Flipping a sagittal image horizontally swaps <b>front with back</b>, mirroring the
                ACL's geometry, and does <b>nothing whatsoever</b> to medial↔lateral. The
                medial↔lateral information in a sagittal series is the <i>slice ordering</i> — and
                because DICOM's <code>+x</code> axis always points to the patient's left regardless of
                which knee is in the scanner, that ordering runs medial→lateral for one knee and
                lateral→medial for the other, with nothing correcting it.
                <br /><br />
                <b>Fix:</b> for a right knee, reverse the sagittal slice order; flip only coronal
                and axial.
              </Callout>
              <Callout kind="wrong" title="bug 2 — the model could not tell depth positions apart">
                Each slot was told which <i>sequence</i> it came from but never <i>which of the six
                depth positions</i> it was, so the six slots of a plane were interchangeable to the
                attention. Combined with bug 1 this is fatal: in the sagittal plane medial↔lateral
                <i> is</i> the depth axis, so "the medial compartment" was not something the model
                could point at even in principle.
                <br /><br />
                <b>Fix:</b> a small learned embedding for the depth index, exactly like the existing
                one for sequence type.
              </Callout>
            </Sec>

            {/* 08 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[7]}>
              <H>
                A controlled A/B — same fold, same data, same recipe, one variable changed.
              </H>
              <Table
                head={["backbone", "params", "peak", "speed", "verdict"]} align={["l", "r", "r", "r", "l"]}
                rows={[
                  [{ v: "ResNet-34", b: true }, "21.3 M", { v: "0.8425", col: P.green, b: true }, "1.0×", { v: "winner", col: P.green }],
                  ["ConvNeXt-Tiny", "27.8 M", "0.8373", "2.2× slower", { v: "loses on both", col: P.sub }],
                  ["DINOv2 ViT-S/14", "~22 M", "0.8373", "2.0× slower", { v: "loses on both", col: P.sub }],
                ]}
              />
              <H>
                ConvNeXt-Tiny is a modern CNN with clearly better ImageNet accuracy; DINOv2 is a
                self-supervised ViT trained on 142 million images and genuinely excellent at transfer.
                Both lost to a 2015-era ResNet-34, for three reasons. We are <b>label-limited, not
                capacity-limited</b> — against ~700 real label cells, extra capacity buys overfitting,
                not signal. <b>ViTs need more data than CNNs</b>: a convolution has locality and
                translation equivariance built into the architecture, while a transformer has to learn
                both from data, and 4,407 studies cannot pay for it. And <b>cost is a real axis</b> —
                the efficiency prize trades roughly 0.01 AUC for 720 seconds of runtime, so something
                2× slower has to be meaningfully better. Neither was better at all.
              </H>
              <Callout kind="clever" title="the most useful negative result in the project">
                A modern CNN <i>and</i> a self-supervised ViT both lose to a 21M-parameter ResNet-34.
                <b> The bottleneck is not the encoder.</b> Once that is ruled out, attention moves to
                what the encoder is being <i>fed</i> — which is where all the real problems turned
                out to be.
              </Callout>
            </Sec>

            {/* 09 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[8]}>
              <H>
                Using cached features from the trained models — no GPU, four minutes on a laptop — you
                can mask out slots and watch what each contributes. Three separate problems fell out,
                all on the input side.
              </H>

              <h3 style={{ ...DISP, fontWeight: 600, fontSize: "1.05rem", margin: "1.5rem 0 0.5rem" }}>1 · We throw away half the exam</h3>
              <H>
                <code>Fluid_Sensitive</code> and <code>Fat_Suppression</code> are perfectly correlated
                in the training set, so the series-ranking rule became a coin with two identical
                sides: it always keeps the fat-suppressed series and always drops the plain one.
                <b> 10,361 of 24,371 series discarded</b>, and 4,260 studies lost a sagittal
                non-fat-sat series entirely.
              </H>
              <Table
                head={["what the finding needs", "our score", "vs. the text-only labeler"]} align={["l", "r", "l"]}
                rows={[
                  ["fat-sat — effusion, Baker's cyst, contusion, fracture", { v: "0.889", col: P.green }, { v: "we win by +0.18 to +0.25", col: P.green }],
                  ["plain — menisci, osteoarthritis", { v: "0.828", col: P.red }, { v: "the text beats us on lateral OA and PF OA", col: P.red }],
                  ["synovitis — needs contrast dye we do not have", "0.673", { v: "tie — a genuine ceiling", col: P.sub }],
                ]}
              />
              <H>
                Every finding we are good at is a <i>wet</i> finding, visible on the sequence we kept.
                The only findings a plain text report beats our images on are <i>structural</i> ones,
                read on the sequence we deleted. The table is the deletion, printed.
              </H>

              <h3 style={{ ...DISP, fontWeight: 600, fontSize: "1.05rem", margin: "1.7rem 0 0.5rem" }}>2 · The twelve heads are not looking in twelve places</h3>
              <Fig caption="Three osteoarthritis heads reading the same slots, while the two meniscus heads stay properly apart. The OA scores spread wildly — 0.938 / 0.725 / 0.790 — which is what one working head with two passengers looks like.">
                <ChartHeads />
              </Fig>

              <h3 style={{ ...DISP, fontWeight: 600, fontSize: "1.05rem", margin: "1.7rem 0 0.5rem" }}>3 · The most important plane is our weakest</h3>
              <Fig caption="Masking whole planes, measured across all 4,407 studies. Deleting sagittal — the plane a knee is primarily read in — costs 0.014, while deleting axial costs 0.049.">
                <ChartPlanes />
              </Fig>
              <Callout kind="wrong" title="the fingerprint">
                That sagittal is our <i>least</i> useful plane is not a fact about knees. It is the
                signature of §07's two bugs, both of which are sagittal-specific and neither of which
                touches coronal or axial. Three independent problems, all on the input side, none of
                them the network.
              </Callout>
            </Sec>

            {/* 10 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[9]}>
              <Table
                head={["", "macro AUC"]} align={["l", "r"]}
                rows={[
                  [{ v: "Our score", b: true }, { v: "0.883", b: true }],
                  ["Rank", "1280 of 2349"],
                  [{ v: "Public baseline notebook anyone can copy", col: P.red }, { v: "0.891", col: P.red, b: true }],
                  ["Best public notebook", "0.936"],
                  ["Leader", "0.952"],
                ]}
              />
              <H>
                Worth sitting with rather than explaining away: a public baseline that runs in six
                minutes beats this pipeline. It uses <b>six</b> sequence slots — the three we use plus
                the three plain-sequence ones we discard — and it normalises sagittal laterality by
                reversing the slice order, exactly as §07 describes. We derived both conclusions from
                our own data before reading it, which is reassuring about the method and humbling
                about the result.
              </H>
              <Callout kind="clever" title="what is genuinely ours">
                The calibrated soft-label machinery in §05. It is why the model beats its own teacher,
                0.846 against 0.812. Nothing in the public notebooks does that, and it is the part
                that transfers to any other weakly-labelled medical dataset.
              </Callout>
              <Table
                head={["state", "what"]} align={["l", "l"]}
                rows={[
                  [{ v: "implemented, awaiting test", col: P.accent }, "depth-position embedding · plane-aware laterality — neither needs the data reconverted"],
                  [{ v: "still to do", col: P.red }, "reconvert to include the plain sequences — the big one"],
                ]}
              />
            </Sec>

            {/* 11 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[10]}>
              <H>
                If this becomes research rather than a leaderboard chase, these are the questions the
                project is unusually well placed to answer — each one because the machinery to vary
                the interesting quantity already exists.
              </H>
              {[
                ["Does the student always beat the teacher?", "A clean case of a vision model trained on LLM-extracted noisy text labels outperforming the text labeler itself, 0.846 against 0.812, per finding. When does that hold and when does it break? §05 can vary the noise level deliberately."],
                ["Calibrated soft labels against everything else", "Compare with hard labels, confidence weighting, label smoothing and co-teaching, holding all else fixed. The six-state framework makes the noise structured and measurable rather than just “noisy”."],
                ["When does architecture stop mattering?", "A measured case of ConvNeXt and DINOv2 both losing to ResNet-34. Sweep the supervision budget and find the crossover — that curve would be genuinely useful."],
                ["Anatomical priors as an inductive bias", "§07 is a case where the correct symmetry operation differs per imaging plane. Generalising that — teaching a model plane-appropriate equivariance — is a real methods contribution."],
                ["Sequence selection as an ablation", "Once the reconversion lands, measure exactly what each MRI sequence contributes to each of the twelve findings. That table would be clinically interesting on its own."],
              ].map(([t, b], i) => (
                <div key={i} style={{ borderTop: `1px solid ${P.line}`, padding: "0.8rem 0" }}>
                  <div style={{ ...DISP, fontWeight: 600, fontSize: "0.98rem", color: P.ink, marginBottom: 4 }}>
                    <span style={{ ...MONO, fontSize: "0.62rem", color: P.accent, marginRight: 8 }}>{i + 1}</span>{t}
                  </div>
                  <p style={{ ...BODY, fontSize: "0.9rem", lineHeight: 1.7, color: P.sub, margin: 0, textWrap: "pretty" }}>{b}</p>
                </div>
              ))}
            </Sec>

            <footer style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: `2px solid ${P.ink}` }}>
              <p style={{ ...MONO, fontSize: "0.62rem", color: P.sub }}>{PAPER.author} · OrthoVision case study · {PAPER.stamp}</p>
              <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", marginTop: 10 }}>
                <a href="#Tracks" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>← the track in the paper</a>
                <a href="#/lab/abmil" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>attention-MIL, rebuilt in the Lab →</a>
                <a href="#/lab/mrnet" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>MRNet, the ancestor →</a>
              </div>
            </footer>

          </main>
        </div>
      </div>
    </>
  );
}

/* One numbered section, with the paper's margin-anchored heading. */
function Sec({ s, children }) {
  return (
    <section id={s.id} className="ov-sec">
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, borderBottom: `2px solid ${P.ink}`, paddingBottom: 7, marginBottom: "1.1rem" }}>
        <span style={{ ...MONO, fontSize: "0.68rem", color: P.accent }}>{s.n}</span>
        <h2 style={{ ...DISP, fontWeight: 600, fontSize: "clamp(1.3rem,2.8vw,1.6rem)", letterSpacing: "-0.01em", color: P.ink, flex: 1 }}>{s.t}</h2>
        <span style={{ ...MONO, fontSize: "0.58rem", color: P.sub }}>{s.note}</span>
      </div>
      {children}
    </section>
  );
}
