import { useReveal } from "./ui.jsx";

/* ════════════════════════════════════════
   ORAL OCT — the volumetric pipeline, drawn as a sketchbook page
   ════════════════════════════════════════
   Nine numbered panels, read left→right / top→bottom, joined by sketched
   arrows: loaf analogy → scan geometry → pixels → surface → registration →
   flattening → BM → thickness → the clinician card. A concept explainer only:
   every number in it is made up to make the arithmetic visible.

   Colours run through CSS variables scoped to .ooct, so the sketch has a dark
   variant ready for the day the paper gets a site-wide toggle — set
   data-theme="dark" on <html>. Three tissue colours are fixed everywhere:
   teal = epithelium, dark ink line = basement membrane, coral = lamina propria.
   Strokes share the site's roughening filter idea; labels stay un-roughened
   for legibility (handwritten Caveat for notes, Plex Mono for numbers). */

const V = {
  ink: "var(--oo-ink)", sub: "var(--oo-sub)", line: "var(--oo-line)", card: "var(--oo-card)",
  epi: "var(--oo-epi)", epiT: "var(--oo-epi-ink)", bm: "var(--oo-bm)",
  lp: "var(--oo-lp)", lpT: "var(--oo-lp-ink)", flag: "var(--oo-flag)", acc: "var(--oo-accent)",
};
const HAND = { fontFamily: "'Caveat','Segoe Print','Comic Sans MS',cursive" };
const MONO = { fontFamily: "'IBM Plex Mono',monospace" };
const BODY = { fontFamily: "'Source Serif 4',Georgia,serif" };

/* draw-on strokes: pathLength=1 lets one dash cover any shape */
const d = { pathLength: 1, className: "d" };
const f = { className: "f" };

const r1 = (n) => Math.round(n * 10) / 10;

/* Catmull-Rom through the points, as cubic Béziers */
function smooth(pts, move = true) {
  let s = `${move ? "M" : "L"}${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    s += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return s;
}
/* closed band between an upper and a lower curve */
const band = (top, bot) => `${smooth(top)} ${smooth([...bot].reverse(), false)} Z`;

function Tx({ x, y, s = 16, c = V.ink, a, w, mono, children, ...rest }) {
  return (
    <text x={x} y={y} fontSize={s} fill={c} textAnchor={a} fontWeight={w ?? (mono ? 400 : 600)} style={mono ? MONO : HAND} {...rest}>
      {children}
    </text>
  );
}

function Rough({ children }) {
  return <g filter="url(#oo-rough)" fill="none" strokeLinecap="round" strokeLinejoin="round">{children}</g>;
}

function Arrow({ x1, y1, x2, y2, c = V.ink, w = 1.6 }) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = 8, W = 4.5;
  const h1 = [x2 - L * Math.cos(a) - W * Math.sin(a), y2 - L * Math.sin(a) + W * Math.cos(a)];
  const h2 = [x2 - L * Math.cos(a) + W * Math.sin(a), y2 - L * Math.sin(a) - W * Math.cos(a)];
  return (
    <>
      <path {...d} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={c} strokeWidth={w} />
      <path {...d} d={`M${r1(h1[0])} ${r1(h1[1])} L${x2} ${y2} L${r1(h2[0])} ${r1(h2[1])}`} stroke={c} strokeWidth={w} />
    </>
  );
}

/* Shared filter + hatch, referenced by id from every panel. */
function Defs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <filter id="oo-rough" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <pattern id="oo-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--oo-sub)" strokeWidth="1.3" />
        </pattern>
      </defs>
    </svg>
  );
}

/* ── 1 · the loaf ───────────────────────────────────────────────────── */
function P1() {
  const outer = "M30 110 C30 60 80 40 130 40 C180 40 230 60 230 110";
  const inner = "M30 134 C30 86 80 64 130 64 C180 64 230 86 230 134";
  return (
    <>
      <path {...f} d="M30 212 L30 110 C30 60 80 40 130 40 C180 40 230 60 230 110 L230 212 Z" fill={V.lp} fillOpacity="0.2" />
      <path {...f} d={`${outer} L230 134 C230 86 180 64 130 64 C80 64 30 86 30 134 Z`} fill={V.epi} fillOpacity="0.28" />
      <Rough>
        <path {...d} d="M30 110 L30 212 L230 212 L230 110" stroke={V.ink} strokeWidth="1.5" />
        <path {...d} d={outer} stroke={V.epi} strokeWidth="2.6" />
        <path {...d} d={inner} stroke={V.bm} strokeWidth="3" />
        {[[80, 160, 7, 4], [140, 182, 9, 5], [192, 152, 6, 4], [108, 138, 5, 3], [172, 196, 7, 4], [58, 190, 5, 3]].map(([x, y, rx, ry]) => (
          <ellipse key={x} {...d} cx={x} cy={y} rx={rx} ry={ry} stroke={V.lp} strokeWidth="1.3" />
        ))}
        <path {...d} d="M14 215 L246 215" stroke={V.sub} strokeWidth="1.2" />
        <Arrow x1={130} y1={6} x2={130} y2={32} c={V.acc} />
        <path {...d} d="M246 57 L204 56" stroke={V.sub} strokeWidth="1" />
        <path {...d} d="M246 109 L216 102" stroke={V.sub} strokeWidth="1" />
        <path {...d} d="M246 169 L200 168" stroke={V.sub} strokeWidth="1" />
      </Rough>
      <Tx x={140} y={22} s={15} c={V.acc}>OCT light, from above</Tx>
      <Tx x={250} y={54} s={19} c={V.epiT}>crust</Tx>
      <Tx x={250} y={72} s={16} c={V.epiT}>= epithelium</Tx>
      <Tx x={250} y={106} s={19}>butter line</Tx>
      <Tx x={250} y={124} s={16}>= BM</Tx>
      <Tx x={250} y={166} s={19} c={V.lpT}>soft bread</Tx>
      <Tx x={250} y={184} s={16} c={V.lpT}>= lamina propria</Tx>
      <Tx x={20} y={236} s={15} c={V.sub}>the cheek lining, sliced like a loaf</Tx>
    </>
  );
}

/* ── 2 · A-scan → B-scan → volume ──────────────────────────────────── */
function Slice({ x, y, w, h, surf = 14, epi = 30, skewers = 0 }) {
  return (
    <g>
      <rect {...f} x={x} y={y} width={w} height={h} fill={V.card} />
      <rect {...f} x={x} y={y + surf} width={w} height={epi} fill={V.epi} fillOpacity="0.28" />
      <rect {...f} x={x} y={y + surf + epi} width={w} height={h - surf - epi} fill={V.lp} fillOpacity="0.2" />
      <Rough>
        {Array.from({ length: skewers }, (_, i) => (
          <path key={i} d={`M${x + 7 + i * 14} ${y + 2} L${x + 7 + i * 14} ${y + h - 2}`} stroke={V.sub} strokeWidth="0.8" strokeDasharray="2 3" className="f" />
        ))}
        <path {...d} d={`M${x} ${y + surf} L${x + w} ${y + surf}`} stroke={V.epi} strokeWidth="2" />
        <path {...d} d={`M${x} ${y + surf + epi} L${x + w} ${y + surf + epi}`} stroke={V.bm} strokeWidth="2.2" />
        <rect {...d} x={x} y={y} width={w} height={h} stroke={V.ink} strokeWidth="1.3" />
      </Rough>
    </g>
  );
}

function P2() {
  return (
    <>
      <Rough>
        <circle {...d} cx={42} cy={42} r={3.5} stroke={V.ink} strokeWidth="1.4" />
        <path d="M42 46 L42 62" stroke={V.sub} strokeWidth="1.4" strokeDasharray="3 3" className="f" />
        <path {...d} d="M42 62 L42 92" stroke={V.epi} strokeWidth="5" />
        <path {...d} d="M34 92 L50 92" stroke={V.bm} strokeWidth="2.4" />
        <path {...d} d="M42 93 L42 178" stroke={V.lp} strokeWidth="5" />
        <Arrow x1={64} y1={115} x2={90} y2={115} />
        <Arrow x1={204} y1={115} x2={226} y2={115} />
      </Rough>
      <Slice x={100} y={48} w={98} h={130} skewers={7} />
      {[3, 2, 1, 0].map((k) => (
        <Slice key={k} x={234 + 12 * k} y={70 - 10 * k} w={80} h={108} surf={12} epi={24} />
      ))}
      <Tx x={42} y={30} s={14} c={V.sub} a="middle">1 skewer</Tx>
      <Tx x={149} y={36} s={14} c={V.sub} a="middle">a row of skewers</Tx>
      <Tx x={292} y={28} s={14} c={V.sub} a="middle">a stack of slices</Tx>
      <Tx x={42} y={202} s={19} a="middle">A-scan</Tx>
      <Tx x={149} y={202} s={19} a="middle">B-scan</Tx>
      <Tx x={292} y={202} s={19} a="middle">volume</Tx>
      <Tx x={42} y={222} s={10.5} mono a="middle" c={V.acc}>(depth,)</Tx>
      <Tx x={149} y={222} s={10.5} mono a="middle" c={V.acc}>(depth, width)</Tx>
      <Tx x={292} y={222} s={9.5} mono a="middle" c={V.acc}>(slices, depth, width)</Tx>
      <Tx x={20} y={244} s={14} c={V.sub}>depth runs down every skewer ↓</Tx>
    </>
  );
}

/* ── 3 · inside one B-scan: pixels and one column's profile ───────── */
const I3 = [0.05, 0.06, 0.97, 0.42, 0.37, 0.2, 0.88, 0.72, 0.58, 0.44];
function P3() {
  const x0 = 34, y0 = 46, cw = 14, rh = 15, hc = 3;
  const rc = (r) => y0 + r * rh + rh / 2;
  const jit = (r, c) => (((c * 37 + r * 17) % 7) - 3) * 0.022;
  const prof = I3.map((v, r) => [162 + v * 96, rc(r)]);
  return (
    <>
      {I3.map((v, r) => Array.from({ length: 7 }, (_, c) => {
        const g = Math.round(18 + Math.min(1, Math.max(0, v + jit(r, c))) * 226);
        return <rect key={`${r}-${c}`} {...f} x={x0 + c * cw} y={y0 + r * rh} width={cw - 1} height={rh - 1} fill={`rgb(${g},${g},${g})`} />;
      }))}
      <rect {...f} x={140} y={y0 + 2 * rh} width={6} height={4 * rh} fill={V.epi} />
      <rect {...f} x={140} y={y0 + 6 * rh} width={6} height={4 * rh} fill={V.lp} />
      <Rough>
        <rect {...d} x={x0 + hc * cw - 1.5} y={y0 - 2} width={cw + 2} height={10 * rh + 3} stroke={V.acc} strokeWidth="2" />
        <path {...d} d={`M136 ${y0 + 6 * rh} L150 ${y0 + 6 * rh}`} stroke={V.bm} strokeWidth="2.4" />
        <path {...d} d={`M162 ${y0} L162 ${y0 + 10 * rh}`} stroke={V.sub} strokeWidth="1.2" />
        <path {...d} d={`M162 ${y0 + 6 * rh} L258 ${y0 + 6 * rh}`} stroke={V.bm} strokeWidth="1" strokeOpacity="0.5" />
        <path {...d} d={smooth(prof)} stroke={V.acc} strokeWidth="2" />
      </Rough>
      <Tx x={x0} y={38} s={14} c={V.sub}>cols = across cheek →</Tx>
      <Tx x={166} y={38} s={14} c={V.acc}>col 3, going down</Tx>
      <Tx x={30} y={y0 + 11} s={9} mono a="end" c={V.sub}>0</Tx>
      <Tx x={30} y={y0 + 9 * rh + 11} s={9} mono a="end" c={V.sub}>9</Tx>
      <Tx x={14} y={121} s={14} c={V.sub} a="middle" transform="rotate(-90 14 121)">rows = depth ↓</Tx>
      <Tx x={x0 + hc * cw + 7} y={210} s={9} mono a="middle" c={V.acc}>col 3</Tx>
      <Tx x={164} y={210} s={13} c={V.sub}>brightness →</Tx>
      <Tx x={264} y={65} s={14} c={V.sub}>air (dark)</Tx>
      <Tx x={264} y={88} s={14}>surface: bright</Tx>
      <Tx x={264} y={116} s={15} c={V.epiT}>epithelium</Tx>
      <Tx x={264} y={140} s={14}>BM: dark→bright</Tx>
      <Tx x={264} y={166} s={15} c={V.lpT}>lamina propria</Tx>
      <Tx x={264} y={182} s={13} c={V.sub}>fades with depth</Tx>
      <Tx x={14} y={230} s={15} c={V.sub}>intensity = brightness — what the scanner gives</Tx>
      <Tx x={14} y={248} s={16}>what we compute = <tspan fill={V.acc}>ROW NUMBERS</tspan></Tx>
    </>
  );
}

/* ── 4 · finding the surface ──────────────────────────────────────── */
const XS4 = [56, 118, 180, 242, 304], SURF = [55, 52, 50, 52, 55];
function P4() {
  const ys = SURF.map((r) => 62 + (r - 50) * 6);
  const top = [[24, 103], ...XS4.map((x, i) => [x, ys[i]]), [336, 103]];
  const bm = top.map(([x, y]) => [x, y + 26]);
  const bot = top.map(([x]) => [x, 170]);
  return (
    <>
      <path {...f} d={band(top, bm)} fill={V.epi} fillOpacity="0.28" />
      <path {...f} d={band(bm, bot)} fill={V.lp} fillOpacity="0.2" />
      <Rough>
        {XS4.map((x) => <path key={x} d={`M${x} 36 L${x} 168`} stroke={V.sub} strokeWidth="0.9" strokeDasharray="3 3" className="f" />)}
        <path {...d} d={smooth(top)} stroke={V.epi} strokeWidth="2.4" />
        <path {...d} d={smooth(bm)} stroke={V.bm} strokeWidth="2.2" />
        <rect {...d} x={24} y={34} width={312} height={136} stroke={V.ink} strokeWidth="1.3" />
        {XS4.map((x, i) => <circle key={x} {...d} cx={x} cy={ys[i]} r={3.6} stroke={V.acc} strokeWidth="2" />)}
        <path {...d} d="M290 198 L308 198 L311 182 L334 183" stroke={V.acc} strokeWidth="1.8" />
      </Rough>
      {XS4.map((x, i) => <Tx key={x} x={x} y={ys[i] - 9} s={10.5} mono a="middle" w={600}>{SURF[i]}</Tx>)}
      <Tx x={34} y={52} s={14} c={V.sub}>air</Tx>
      <Tx x={24} y={196} s={15}>per column: the biggest upward jump</Tx>
      <Tx x={24} y={218} s={11} mono c={V.acc}>surface = [55, 52, 50, 52, 55]</Tx>
      <Tx x={24} y={238} s={15} c={V.sub}>a dome — the cheek is curved</Tx>
    </>
  );
}

/* ── 5 · registration ─────────────────────────────────────────────── */
function Strip({ x, surf }) {
  const top = 40, h = 100, w = 34;
  return (
    <g>
      <rect {...f} x={x} y={surf} width={w} height={24} fill={V.epi} fillOpacity="0.28" />
      <rect {...f} x={x} y={surf + 24} width={w} height={top + h - surf - 24} fill={V.lp} fillOpacity="0.2" />
      <Rough>
        <path {...d} d={`M${x} ${surf} L${x + w} ${surf}`} stroke={V.epi} strokeWidth="2.2" />
        <path {...d} d={`M${x} ${surf + 24} L${x + w} ${surf + 24}`} stroke={V.bm} strokeWidth="2.2" />
        <rect {...d} x={x} y={top} width={w} height={h} stroke={V.ink} strokeWidth="1.2" />
      </Rough>
    </g>
  );
}
function MiniTable({ x, rows }) {
  return (
    <g>
      <Tx x={x + 4} y={176} s={9.5} mono c={V.sub}>slice</Tx>
      <Tx x={x + 50} y={176} s={9.5} mono c={V.sub}>surface row</Tx>
      <Rough><path {...d} d={`M${x} 182 L${x + 126} 182`} stroke={V.sub} strokeWidth="1" /></Rough>
      {rows.map(([s, v, hl], i) => (
        <g key={s}>
          <Tx x={x + 12} y={198 + i * 17} s={11} mono>{s}</Tx>
          <Tx x={x + 50} y={198 + i * 17} s={11} mono c={hl || V.ink} w={hl ? 600 : 400}>{v}</Tx>
        </g>
      ))}
    </g>
  );
}
function P5() {
  const before = [60, 78, 60], after = [60, 60, 60];
  return (
    <>
      {[18, 62, 106].map((x, i) => <Strip key={x} x={x} surf={before[i]} />)}
      {[214, 258, 302].map((x, i) => <Strip key={x} x={x} surf={after[i]} />)}
      <Rough>
        <path d="M12 60 L146 60" stroke={V.sub} strokeWidth="1" strokeDasharray="4 3" className="f" />
        <path d="M208 60 L342 60" stroke={V.sub} strokeWidth="1" strokeDasharray="4 3" className="f" />
        <Arrow x1={150} y1={92} x2={204} y2={92} />
      </Rough>
      <Tx x={79} y={26} s={18} a="middle">before</Tx>
      <Tx x={275} y={26} s={18} a="middle">after</Tx>
      <Tx x={79} y={72} s={9.5} mono a="middle" c={V.flag} w={600}>+15↓</Tx>
      <Tx x={177} y={80} s={14} a="middle">shift slice 2</Tx>
      <Tx x={177} y={112} s={14} a="middle">up 15 rows</Tx>
      {[["s1", 35], ["s2", 79], ["s3", 123], ["s1", 231], ["s2", 275], ["s3", 319]].map(([s, x], i) => (
        <Tx key={i} x={x} y={154} s={9.5} mono a="middle" c={V.sub}>{s}</Tx>
      ))}
      <MiniTable x={16} rows={[["1", "50"], ["2", "65", V.flag], ["3", "50"]]} />
      <MiniTable x={212} rows={[["1", "50"], ["2", "50  (−15)", V.acc], ["3", "50"]]} />
    </>
  );
}

/* ── 6 · flattening ───────────────────────────────────────────────── */
const SHIFT = [-5, -2, 0, -2, -5], THICK = [100, 101, 101, 99, 100];
function Frame6({ x0, flat }) {
  const xs = [31, 61, 91, 121, 151].map((x) => x + x0);
  const sy = SURF.map((r, i) => 70 + (flat ? r + SHIFT[i] - 50 : r - 50) * 5);
  const by = sy.map((y, i) => y + 70 + (THICK[i] - 100) * 2);
  const pad = (ys) => [[x0, ys[0] + (flat ? 0 : 8)], ...xs.map((x, i) => [x, ys[i]]), [x0 + 150, ys[4] + (flat ? 0 : 8)]];
  const top = pad(sy), bm = pad(by), bot = top.map(([x]) => [x, 190]);
  return (
    <g>
      <path {...f} d={band(top, bm)} fill={V.epi} fillOpacity="0.28" />
      <path {...f} d={band(bm, bot)} fill={V.lp} fillOpacity="0.2" />
      <Rough>
        <path {...d} d={smooth(top)} stroke={V.epi} strokeWidth="2.4" />
        <path {...d} d={smooth(bm)} stroke={V.bm} strokeWidth="2.2" />
        <rect {...d} x={x0} y={40} width={150} height={150} stroke={V.ink} strokeWidth="1.3" />
        {!flat && <path d={`M${x0 + 2} 70 L${x0 + 148} 70`} stroke={V.acc} strokeWidth="1" strokeDasharray="4 3" className="f" />}
        {!flat && xs.map((x, i) => SHIFT[i] !== 0 && <Arrow key={x} x1={x} y1={sy[i] - 2} x2={x} y2={72} c={V.acc} w={1.5} />)}
      </Rough>
    </g>
  );
}
function P6() {
  return (
    <>
      <Frame6 x0={16} flat={false} />
      <Frame6 x0={194} flat />
      <Rough><Arrow x1={170} y1={115} x2={190} y2={115} /></Rough>
      <Tx x={16} y={18} s={17}>before</Tx>
      <Tx x={194} y={18} s={17}>after — flat</Tx>
      {[31, 61, 91, 121, 151].map((x, i) => (
        <Tx key={x} x={x + 16} y={34} s={10} mono a="middle" c={V.acc} w={600}>{SHIFT[i] === 0 ? "0" : `−${-SHIFT[i]}`}</Tx>
      ))}
      <Tx x={344} y={34} s={10} mono a="end" c={V.acc}>surface → row 50</Tx>
      <Tx x={16} y={212} s={15}>each column slides as a whole → flat surface,</Tx>
      <Tx x={16} y={230} s={15}>near-flat BM.  <tspan fill={V.epiT}>thickness unchanged ✓</tspan></Tx>
    </>
  );
}

/* ── 7 · finding the BM ───────────────────────────────────────────── */
const XS7 = [34, 70, 106, 142, 178];
function Strip7({ top, picks, naive }) {
  const surf = top + 10, bm = top + 40, h = 82;
  /* deterministic speckle, plus one bright clump deep in column 3 */
  const dots = Array.from({ length: 46 }, (_, i) => [20 + ((i * 53) % 172), bm + 6 + ((i * 29) % (h - 48)), 1 + (i % 3) * 0.6]);
  const pts = XS7.map((x, i) => [x, picks[i]]);
  return (
    <g>
      <rect {...f} x={16} y={surf} width={180} height={bm - surf} fill={V.epi} fillOpacity="0.28" />
      <rect {...f} x={16} y={bm} width={180} height={top + h - bm} fill={V.lp} fillOpacity="0.2" />
      {dots.map(([x, y, r], i) => <circle key={i} {...f} cx={x} cy={y} r={r} fill={V.ink} fillOpacity="0.32" />)}
      <ellipse {...f} cx={106} cy={top + 70} rx={14} ry={5} fill={V.ink} fillOpacity="0.5" />
      <Rough>
        <path {...d} d={`M16 ${surf} L196 ${surf}`} stroke={V.epi} strokeWidth="2" />
        <rect {...d} x={16} y={top} width={180} height={h} stroke={V.ink} strokeWidth="1.2" />
        {naive ? (
          <>
            <path d={pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ")} stroke={V.flag} strokeWidth="1.6" strokeDasharray="4 3" className="f" />
            {pts.map(([x, y]) => <path key={x} {...d} d={`M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}`} stroke={V.flag} strokeWidth="2" />)}
          </>
        ) : (
          <>
            <path {...d} d={smooth([[16, picks[0]], ...pts, [196, picks[4]]])} stroke={V.bm} strokeWidth="2.6" />
            {pts.map(([x, y]) => <circle key={x} {...d} cx={x} cy={y} r={2.8} stroke={V.bm} strokeWidth="1.8" />)}
          </>
        )}
      </Rough>
    </g>
  );
}
function P7() {
  const yA = (r) => 70 + (r === 187 ? 30 : (r - 150) * 1.4);
  const yB = (r) => 172 + (r - 150) * 1.4;
  return (
    <>
      <Strip7 top={30} naive picks={[150, 151, 187, 149, 150].map(yA)} />
      <Strip7 top={132} picks={[150, 151, 151, 149, 150].map(yB)} />
      <Tx x={206} y={48} s={17}>naive, per column</Tx>
      <Tx x={206} y={68} s={10.5} mono>150 151 <tspan fill={V.flag} fontWeight="600">187</tspan> 149 150</Tx>
      <Tx x={206} y={88} s={15} c={V.flag}>fooled by speckle ✗</Tx>
      <Tx x={206} y={106} s={13} c={V.sub}>one column at a time</Tx>
      <Tx x={206} y={150} s={17}>context-aware ✓</Tx>
      <Tx x={206} y={170} s={10.5} mono>150 151 151 149 150</Tx>
      <Tx x={206} y={190} s={14} c={V.sub}>graph search: small steps</Tx>
      <Tx x={206} y={208} s={14} c={V.sub}>or a 2.5D U-Net</Tx>
      <Tx x={16} y={236} s={14} c={V.sub}>neighbours vote: the BM can't jump 36 rows in one step</Tx>
    </>
  );
}

/* ── 8 · thickness map ────────────────────────────────────────────── */
const T8 = [
  [298, 301, 300, 299, 297],
  [302, 300, 345, 303, 299],
  [299, null, 304, 301, 300],
  [297, 299, 301, 300, 298],
];
function P8() {
  const x0 = 56, y0 = 96, cw = 48, ch = 28;
  return (
    <>
      {T8.map((row, r) => row.map((v, c) => (
        <rect key={`${r}-${c}`} {...f} x={x0 + c * cw} y={y0 + r * ch} width={cw} height={ch}
          fill={v == null ? "url(#oo-hatch)" : V.epi} fillOpacity={v == null ? 1 : v > 320 ? 0.55 : 0.14} />
      )))}
      <Rough>
        <rect {...d} x={x0} y={y0} width={5 * cw} height={4 * ch} stroke={V.ink} strokeWidth="1.3" />
        {[1, 2, 3, 4].map((c) => <path key={`c${c}`} d={`M${x0 + c * cw} ${y0} L${x0 + c * cw} ${y0 + 4 * ch}`} stroke={V.line} strokeWidth="1" className="f" />)}
        {[1, 2, 3].map((r) => <path key={`r${r}`} d={`M${x0} ${y0 + r * ch} L${x0 + 5 * cw} ${y0 + r * ch}`} stroke={V.line} strokeWidth="1" className="f" />)}
        <ellipse {...d} cx={x0 + 2.5 * cw} cy={y0 + 1.5 * ch} rx={32} ry={19} stroke={V.flag} strokeWidth="2" />
      </Rough>
      {T8.map((row, r) => row.map((v, c) => (
        <Tx key={`t${r}-${c}`} x={x0 + c * cw + cw / 2} y={y0 + r * ch + 18} s={v == null ? 9.5 : 11} mono a="middle"
          c={v == null ? V.ink : V.ink} w={v > 320 || v == null ? 600 : 400}>{v == null ? "no BM" : v}</Tx>
      )))}
      <Tx x={16} y={24} s={10.5} mono>thickness = (BM − surface) × Δz ÷ n</Tx>
      <Tx x={16} y={44} s={15} c={V.sub}>Δz = axial pixel size · n ≈ 1.4, tissue's refractive index</Tx>
      <Tx x={16} y={66} s={10.5} mono c={V.acc}>e.g. (150 − 50) × 4.2 µm ÷ 1.4 = 300 µm</Tx>
      <Tx x={x0} y={89} s={14} c={V.sub}>column →</Tx>
      <Tx x={14} y={89} s={14} c={V.sub}>slice ↓</Tx>
      {[0, 1, 2, 3].map((r) => <Tx key={r} x={x0 - 8} y={y0 + r * ch + 18} s={9.5} mono a="end" c={V.sub}>s{r + 1}</Tx>)}
      <Tx x={x0 + 5 * cw + 6} y={y0 + 18} s={11} mono c={V.sub}>µm</Tx>
      <Tx x={16} y={230} s={15} c={V.flag}>◯ 345 µm — thickened</Tx>
      <Tx x={180} y={230} s={15}>▨ no BM → no number</Tx>
    </>
  );
}

/* ── 9 · the clinician card ───────────────────────────────────────── */
const MISSING = new Set(["5-1", "6-1", "6-2", "7-1", "7-2"]);
function HeatMap() {
  const x0 = 16, y0 = 30, cw = 26, ch = 22;
  const t = (r, c) => 300 + 48 * Math.exp(-(((c - 6.5) ** 2) / 3 + ((r - 2.5) ** 2) / 2)) + (((r * 7 + c * 13) % 9) - 4);
  return (
    <svg viewBox="0 0 360 252" width="100%" role="img" aria-labelledby="oo9-t oo9-d" style={{ display: "block" }}>
      <title id="oo9-t">Illustrative epithelial thickness heat-map</title>
      <desc id="oo9-d">An 8 by 10 grid of slices by columns shaded teal by epithelial thickness. A thicker region near the upper right is circled in red with a suggested biopsy site marked at its centre. A small block at the lower left is hatched: the basement membrane was not found there, so no thickness is shown.</desc>
      {Array.from({ length: 8 }, (_, r) => Array.from({ length: 10 }, (_, c) => {
        const miss = MISSING.has(`${r}-${c}`);
        const a = 0.08 + Math.min(1, Math.max(0, (t(r, c) - 290) / 60)) * 0.8;
        return <rect key={`${r}-${c}`} {...f} x={x0 + c * cw} y={y0 + r * ch} width={cw - 1} height={ch - 1} fill={miss ? "url(#oo-hatch)" : V.epi} fillOpacity={miss ? 1 : a} />;
      }))}
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} {...f} x={16 + i * 15} y={218} width={14} height={14} fill={V.epi} fillOpacity={0.08 + i * 0.16} />)}
      <rect {...f} x={170} y={218} width={14} height={14} fill="url(#oo-hatch)" />
      <Rough>
        <rect {...d} x={x0 - 1} y={y0 - 1} width={10 * cw + 1} height={8 * ch + 1} stroke={V.ink} strokeWidth="1.3" />
        <ellipse {...d} cx={198} cy={96} rx={54} ry={40} stroke={V.flag} strokeWidth="2.2" />
        <circle {...d} cx={198} cy={96} r={7} stroke={V.ink} strokeWidth="1.8" />
        <path {...d} d="M186 96 L210 96 M198 84 L198 108" stroke={V.ink} strokeWidth="1.5" />
        <path {...d} d="M284 92 L208 95" stroke={V.sub} strokeWidth="1" />
      </Rough>
      <Tx x={16} y={20} s={15}>epithelial thickness, slice × column</Tx>
      <Tx x={288} y={90} s={15} c={V.flag}>suggested</Tx>
      <Tx x={288} y={106} s={15} c={V.flag}>biopsy site</Tx>
      <Tx x={16} y={248} s={9.5} mono c={V.sub}>thin</Tx>
      <Tx x={106} y={248} s={9.5} mono a="end" c={V.sub}>thick</Tx>
      <Tx x={190} y={230} s={15}>BM not found</Tx>
    </svg>
  );
}

function P9Card() {
  const row = { display: "grid", gridTemplateColumns: "5.6rem 1fr", gap: "0.7rem", alignItems: "baseline", borderTop: "1px dashed var(--oo-line)", padding: "0.5rem 0" };
  const k = { ...MONO, fontSize: "0.6rem", color: "var(--oo-sub)", textTransform: "uppercase", letterSpacing: "0.08em" };
  const v = { ...BODY, fontSize: "0.88rem", color: "var(--oo-ink)", lineHeight: 1.5 };
  return (
    <div className="oo-cdss">
      <div className="oo-cdss-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ ...HAND, fontWeight: 700, fontSize: "1.35rem", color: "var(--oo-ink)" }}>Decision support — clinician view</span>
          <span style={{ ...MONO, fontSize: "0.56rem", color: "var(--oo-sub)", border: "1px solid var(--oo-line)", padding: "1px 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>illustrative mock-up</span>
        </div>
        <div style={row}>
          <span style={k}>Risk level</span>
          <span style={v}><b style={{ color: "var(--oo-flag)" }}>Elevated</b> — refer for review</span>
        </div>
        <div style={row}>
          <span style={k}>Confidence</span>
          <span style={{ ...v, display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden="true" style={{ display: "inline-flex", gap: 3 }}>
              {[1, 1, 1, 0, 0].map((on, i) => <span key={i} style={{ width: 14, height: 9, border: "1.4px solid var(--oo-ink)", borderRadius: "3px 1px 4px 1px", background: on ? "var(--oo-accent)" : "transparent" }} />)}
            </span>
            moderate, where the BM is traceable
          </span>
        </div>
        <div style={row}>
          <span style={k}>Uncertainty</span>
          <span style={v}>high in one patch — BM not found, shown <i>hatched</i>, never filled in</span>
        </div>
        <div style={row}>
          <span style={k}>Biopsy site</span>
          <span style={v}>centre of the circled region: thickest epithelium on the map</span>
        </div>
        <p className="oo-say" style={{ ...HAND }}>
          Where the model can't find the BM, it says so.
        </p>
        <p style={{ ...BODY, fontSize: "0.82rem", color: "var(--oo-sub)", lineHeight: 1.55 }}>
          Uncertainty is reported as a signal — a reason to rescan or look closer — not smoothed away. The clinician decides.
        </p>
      </div>
      <div style={{ minWidth: 0 }}><HeatMap /></div>
    </div>
  );
}

/* ── the panels, in reading order ─────────────────────────────────── */
const PANELS = [
  {
    t: "The loaf", Body: P1, h: 250,
    desc: "A loaf of bread cut open as an analogy for the buccal mucosa: a teal crust on top labelled epithelium, a dark butter line beneath it labelled basement membrane, and soft coral bread with holes below labelled lamina propria. An arrow shows OCT light entering from above.",
    cap: "The inner cheek is layered like a loaf. The crust is the epithelium, the thin butter line is the basement membrane (BM) and the soft bread is the lamina propria. Early oral cancer changes show up as a thicker crust and a broken butter line.",
  },
  {
    t: "A-scan → B-scan → volume", Body: P2, h: 252,
    desc: "Three sketches left to right. One vertical skewer through the layers is an A-scan with shape (depth,). A row of skewers forms a 2D B-scan slice with shape (depth, width). A stack of slices forms the 3D volume with shape (slices, depth, width).",
    cap: "One beam of light gives a single depth line (an A-scan). Sweeping it across the cheek gives a cross-sectional slice (a B-scan). Stepping the slice along gives the volume.",
  },
  {
    t: "Inside one B-scan", Body: P3, h: 254,
    desc: "A grid of grey pixels, rows are depth with row 0 at the top in air, columns are positions across the cheek. Column 3 is highlighted and its brightness profile is plotted beside it: dark air, a very bright surface, a darker epithelium band, a dark-to-bright step at the basement membrane, then bright lamina propria fading with depth.",
    cap: "A B-scan is a grid of brightness values. Read one column top to bottom and the layers show up in its profile. The values are the input. What the pipeline outputs are row numbers: which row each boundary sits on.",
  },
  {
    t: "Find the surface", Body: P4, h: 244,
    desc: "A schematic B-scan with a dome-shaped tissue surface. Five columns are marked with the row where brightness jumps most sharply upward: 55, 52, 50, 52, 55.",
    cap: "In each column, the surface is where brightness jumps up the most, going from dark air into tissue. That gives one row per column. They form a dome, because the cheek is curved.",
  },
  {
    t: "Register the slices", Body: P5, h: 246,
    desc: "Before: three slices, slice 2's surface sits 15 rows lower than slices 1 and 3 (row 65 versus 50) because the patient moved. After: slice 2 is shifted up 15 rows and all three surfaces sit on row 50. Small tables list the surface row per slice before and after.",
    cap: "The patient moves between slices, so slice 2 sits 15 rows lower than its neighbours. Shift it back so all the slices line up in the volume.",
  },
  {
    t: "Flatten", Body: P6, h: 240,
    desc: "Before: a dome-shaped surface and basement membrane, with per-column shifts of minus 5, minus 2, 0, minus 2, minus 5 drawn as upward arrows to a target row. After: the surface is flat on row 50 and the basement membrane is nearly flat.",
    cap: "Shift each column so its surface lands on the same target row (−5, −2, 0, −2, −5). The surface goes flat and the BM goes almost flat. A whole column moves together, so thickness doesn't change.",
  },
  {
    t: "Find the BM", Body: P7, h: 244,
    desc: "Two flattened scans with speckle. Top, naive per-column detection picks rows 150, 151, 187, 149, 150: column 3 is fooled by a bright speckle clump deep in the tissue. Bottom, a context-aware method such as graph search with small allowed steps or a 2.5D U-Net gives a smooth line, 150, 151, 151, 149, 150.",
    cap: "The BM edge is faint and speckle is loud. If each column is judged on its own, one of them grabs a clump 36 rows too deep. Methods that use the neighbours, like graph search with small allowed steps or a 2.5D U-Net, keep the line smooth.",
  },
  {
    t: "Thickness map", Body: P8, h: 240,
    desc: "The formula thickness equals BM row minus surface row, times axial pixel size, divided by refractive index of about 1.4; for example (150 minus 50) times 4.2 micrometres divided by 1.4 is 300 micrometres. A 4 by 5 grid of slices by columns in micrometres, mostly around 300, with one circled cell at 345 marked thickened and one hatched cell marked no BM.",
    cap: "Subtract the rows, then convert to µm using the pixel size and the tissue's refractive index (~1.4). Most of the map comes out around 300 µm, with one thickened cell. Where no BM was found, the cell says so instead of showing a number.",
  },
];

function Arrows({ i, last }) {
  if (last) return null;
  return (
    <>
      {i % 2 === 0 && (
        <svg className="oo-arw oo-arw-r" viewBox="0 0 48 30" aria-hidden="true">
          <g filter="url(#oo-rough)" fill="none" stroke="var(--oo-sub)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 16 C18 12 28 18 40 15" /><path d="M33 9 L41 15 L33 21" />
          </g>
        </svg>
      )}
      {i % 2 === 1 && (
        <svg className="oo-arw oo-arw-ret" viewBox="0 0 414 44" preserveAspectRatio="none" aria-hidden="true">
          <g filter="url(#oo-rough)" fill="none" stroke="var(--oo-sub)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path vectorEffect="non-scaling-stroke" d="M407 3 C404 22 330 20 207 21 C90 22 12 20 8 40" />
            <path vectorEffect="non-scaling-stroke" d="M2 31 L8 41 L15 33" />
          </g>
        </svg>
      )}
      <svg className="oo-arw oo-arw-d" viewBox="0 0 30 40" aria-hidden="true">
        <g filter="url(#oo-rough)" fill="none" stroke="var(--oo-sub)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 4 C12 14 18 24 15 34" /><path d="M9 28 L15 35 L21 28" />
        </g>
      </svg>
    </>
  );
}

function Badge({ n }) {
  return <span className="oo-badge" aria-hidden="true">{n}</span>;
}

function Panel({ i, p }) {
  const [ref, on] = useReveal(0.3);
  const anim = typeof window !== "undefined" && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const id = `oo${i + 1}`;
  return (
    <figure ref={ref} className={`oo-cell ${i % 2 ? "oo-even" : "oo-odd"}`}>
      <figcaption className="oo-head"><Badge n={i + 1} /><span className="oo-title">{p.t}</span></figcaption>
      <svg viewBox={`0 0 360 ${p.h}`} width="100%" role="img" aria-labelledby={`${id}-t ${id}-d`}
        className={`oo-svg${anim ? " oo-anim" : ""}${on ? " on" : ""}`}>
        <title id={`${id}-t`}>{`Panel ${i + 1}: ${p.t}`}</title>
        <desc id={`${id}-d`}>{p.desc}</desc>
        <p.Body />
      </svg>
      <p className="oo-cap">{p.cap}</p>
      <Arrows i={i} />
    </figure>
  );
}

function FinalPanel() {
  const [ref, on] = useReveal(0.25);
  const anim = typeof window !== "undefined" && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  return (
    <figure ref={ref} className={`oo-cell oo-wide${anim ? " oo-anim" : ""}${on ? " on" : ""}`}>
      <figcaption className="oo-head"><Badge n={9} /><span className="oo-title">What the clinician sees</span></figcaption>
      <P9Card />
      <p className="oo-cap">
        The output is a card a clinician can read, not a mask. It gives a risk level, how confident the model is, a thickness map
        with the suspicious region circled, and a suggested biopsy site. Patches where the BM couldn't be found are shown
        as unknown instead of being filled in.
      </p>
    </figure>
  );
}

const CSS = `
.ooct{--oo-ink:#16181D;--oo-sub:#585C64;--oo-line:#D4D3CB;--oo-card:#FFFFFF;--oo-accent:#2B4C8C;--oo-flag:#9B3B3B;
  --oo-epi:#2E8B84;--oo-epi-ink:#1E6B65;--oo-bm:#16181D;--oo-lp:#D9735A;--oo-lp-ink:#A8482F;--oo-say:rgba(232,194,76,0.40)}
:root[data-theme="dark"] .ooct{--oo-ink:#E8E6DE;--oo-sub:#A3A6AD;--oo-line:#3A3E46;--oo-card:#1C1F25;--oo-accent:#8FB0EE;--oo-flag:#E58585;
  --oo-epi:#4FB3AA;--oo-epi-ink:#72CDC4;--oo-bm:#F1EFE7;--oo-lp:#E58B72;--oo-lp-ink:#F2A58F;--oo-say:rgba(232,194,76,0.22)}
.oo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:48px;row-gap:46px;margin:0 0 0 calc(-150px - 2rem);width:calc(100% + 150px + 2rem)}
.oo-cell{position:relative;margin:0;background:var(--oo-card);border:1px solid var(--oo-line);border-top:2px solid var(--oo-ink);padding:0.8rem 0.9rem 0.9rem;min-width:0}
.oo-wide{grid-column:1/-1}
.oo-head{display:flex;align-items:center;gap:0.55rem;margin-bottom:0.45rem}
.oo-badge{flex-shrink:0;display:inline-grid;place-items:center;width:1.75rem;height:1.75rem;border:1.6px solid var(--oo-ink);border-radius:52% 46% 55% 44% / 48% 55% 45% 52%;font-family:'Caveat',cursive;font-weight:700;font-size:1.2rem;line-height:1;color:var(--oo-ink)}
.oo-title{font-family:'Caveat',cursive;font-weight:700;font-size:1.4rem;line-height:1.1;color:var(--oo-ink)}
.oo-svg{display:block;overflow:visible}
.oo-cap{font-family:'Source Serif 4',Georgia,serif;font-size:0.84rem;line-height:1.6;color:var(--oo-sub);margin-top:0.5rem;text-wrap:pretty}
.oo-arw{position:absolute;pointer-events:none;overflow:visible}
.oo-arw-r{left:100%;top:50%;width:48px;height:30px;transform:translateY(-50%)}
.oo-arw-ret{top:100%;right:50%;width:calc(100% + 48px);height:46px}
.oo-arw-d{display:none}
.oo-cdss{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1.4rem;align-items:center}
.oo-cdss-card{border:1.6px solid var(--oo-ink);border-radius:14px 3px 12px 4px / 4px 12px 3px 14px;padding:0.8rem 1rem 0.9rem;transform:rotate(-0.4deg)}
.oo-say{font-weight:700;font-size:1.45rem;line-height:1.15;color:var(--oo-ink);margin:0.6rem 0 0.35rem;background:linear-gradient(transparent 55%,var(--oo-say) 55%);display:inline}
.oo-say + p{margin-top:0.5rem}
.oo-take{font-family:'IBM Plex Mono',monospace;font-size:0.8rem;line-height:1.7;color:var(--oo-ink);border-top:2px solid var(--oo-ink);padding-top:0.9rem;margin-top:2.2rem;margin-left:calc(-150px - 2rem);width:calc(100% + 150px + 2rem);text-align:center}
.oo-take b{font-family:'Caveat',cursive;font-size:1.25rem;font-weight:700}
.oo-anim .d{stroke-dasharray:1 1;stroke-dashoffset:1}
.oo-anim .f,.oo-anim text{opacity:0}
.oo-anim.on .d{stroke-dashoffset:0;transition:stroke-dashoffset 1.3s cubic-bezier(.45,.05,.35,1)}
.oo-anim.on .f,.oo-anim.on text{opacity:1;transition:opacity .6s ease .45s}
@media(max-width:860px){
  .oo-grid{grid-template-columns:minmax(0,1fr);row-gap:44px}
  .oo-grid,.oo-take{margin-left:0;width:100%}
  .oo-arw-r,.oo-arw-ret{display:none}
  .oo-arw-d{display:block;top:100%;left:50%;width:30px;height:44px;transform:translateX(-50%)}
  .oo-cdss{grid-template-columns:minmax(0,1fr)}
  .oo-cdss-card{transform:none}
  .oo-cell{padding:0.7rem 0.75rem 0.8rem}
}
@media(prefers-reduced-motion:reduce){
  .oo-anim .d{stroke-dashoffset:0!important;transition:none!important}
  .oo-anim .f,.oo-anim text{opacity:1!important;transition:none!important}
}
`;

/* §3a's figure: the nine-panel sketch plus the one-line takeaway. */
export function OralOCTPipeline() {
  return (
    <div className="ooct">
      <style>{CSS}</style>
      <Defs />
      <div className="oo-grid">
        {PANELS.map((p, i) => <Panel key={p.t} i={i} p={p} />)}
        <FinalPanel />
      </div>
      <p className="oo-take">
        <b>Find surface → align slices → flatten → find BM → subtract → map → flag.</b>
      </p>
    </div>
  );
}
