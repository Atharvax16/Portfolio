import { useState, useEffect, Fragment } from "react";
import { P, PAPER } from "./data.js";
import { Callout, Table, Fig, Sec, arw } from "./orthovision.jsx";

/* ════════════════════════════════════════
   ORAL OCT — a trustworthy measurement layer, at its own address
   ════════════════════════════════════════
   Unlike OrthoVision this is a proposal, not a build. Part I is the revised
   research question (oral epithelial thickness, a Bayesian head for the
   three-state output, physics-informed learning, conformal intervals);
   Part II is the earlier caries design (SketchDEJ), kept as the hard-tissue
   companion. The Bayesian head has its own bench at #/lab/bnn.
   Route: #/dentaloct. */

const DISP = { fontFamily: "'Spectral',Georgia,serif" };
const BODY = { fontFamily: "'Source Serif 4',Georgia,serif" };
const MONO = { fontFamily: "'IBM Plex Mono',monospace" };
const SK = { fontFamily: "'IBM Plex Mono',monospace" };

const SECTIONS = [
  { id: "question", n: "01", t: "The question", note: "measurement, not diagnosis", part: "I" },
  { id: "open", n: "02", t: "Taken vs open", note: "the combination is the contribution", part: "I" },
  { id: "arch", n: "03", t: "The architecture", note: "measure · abstain · calibrate", part: "I" },
  { id: "bayes", n: "04", t: "The Bayesian head", note: "why it fits H1", part: "I" },
  { id: "hyp", n: "05", t: "Hypotheses", note: "H1–H4, each falsifiable", part: "I" },
  { id: "scope", n: "06", t: "Scope & risks", note: "what the first paper won't claim", part: "I" },
  { id: "gap", n: "07", t: "Why dental OCT", note: "the gap next to a crowded field", part: "II" },
  { id: "decision", n: "08", t: "One decision", note: "has it crossed the DEJ?", part: "II" },
  { id: "pipeline", n: "09", t: "The pipeline", note: "scan → rule → or abstain", part: "II" },
  { id: "curves", n: "10", t: "Curves, not masks", note: "what the head predicts", part: "II" },
  { id: "sketch", n: "11", t: "Sketch labels", note: "label by drawing three lines", part: "II" },
  { id: "conformal", n: "12", t: "Honest uncertainty", note: "intervals on the decision variable", part: "II" },
  { id: "transfer", n: "13", t: "Borrowing retina", note: "SSL transfer + a physics channel", part: "II" },
  { id: "rules", n: "14", t: "Measurement → suggestion", note: "the rule layer", part: "II" },
  { id: "experiments", n: "15", t: "Proving it", note: "one ablation per claim", part: "II" },
  { id: "plan", n: "16", t: "Build order", note: "starting without dental data", part: "II" },
  { id: "risks", n: "17", t: "Where it breaks", note: "the honest list", part: "II" },
];
const PARTS = { I: "Part I · oral soft tissue", II: "Part II · caries (SketchDEJ)" };

/* ── diagram 1: the whole pipeline ───────────────────────────────────── */
const KIND = {
  plain: { fill: P.paper2, stroke: P.line },
  method: { fill: P.accentSoft, stroke: P.accent },
  sketch: { fill: "rgba(154,123,31,0.10)", stroke: P.yellow },
  stop: { fill: "rgba(155,59,59,0.08)", stroke: P.red },
  soft: { fill: "none", stroke: P.line, dash: "5 5" },
};

function Box({ x, y, w = 164, h = 78, t, a, b, kind = "plain" }) {
  const k = KIND[kind];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={k.fill} stroke={k.stroke} strokeWidth="1.4" strokeDasharray={k.dash || "none"} />
      <text x={x + 14} y={y + 27} style={SK} fontSize="14" fontWeight="600" fill={P.ink}>{t}</text>
      {a && <text x={x + 14} y={y + 49} style={SK} fontSize="11.5" fill={P.sub}>{a}</text>}
      {b && <text x={x + 14} y={y + 64} style={SK} fontSize="11.5" fill={P.sub}>{b}</text>}
    </g>
  );
}

/* polyline with an arrowhead on its last segment only */
const route = (pts, col, dash) => {
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const [x1, y1] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1];
  return (
    <g>
      <path d={d} fill="none" stroke={col} strokeWidth="1.2" strokeDasharray={dash ? "4 3" : "none"} />
      {arw(x1, y1, x2, y2, col, dash)}
    </g>
  );
};

function DiagPipeline() {
  const lane = (x, y, s) => <text x={x} y={y} style={SK} fontSize="11" letterSpacing="1" fill={P.sub}>{s}</text>;
  return (
    <svg viewBox="0 0 1000 600" width="100%" height="100%" role="img" style={{ display: "block" }}
      aria-label="SketchDEJ pipeline: offline self-supervised pretraining and sketch supervision feed a per-scan pipeline from quality gate, surface flattening, encoder and ordered curve head, through 3D fusion, measurements, conformal intervals and a rule layer, to a clinician report or an abstention.">
      {lane(20, 26, "OFFLINE · TRAINING TIME")}
      <Box x={214} y={40} w={358} h={72} t="Unlabelled OCT corpus" a="public retinal SD/SS-OCT + raw dental scans" />
      <Box x={602} y={40} h={72} t="SSL pretraining" a="I-JEPA / MAE" kind="method" />
      <Box x={796} y={40} w={184} h={72} t="Sketch labels" a="S / L / D polylines," b="micro-CT depth (ex vivo)" kind="sketch" />
      {arw(572, 76, 600, 76, P.ink)}
      {arw(684, 112, 684, 188, P.sub, true)}
      <text x={692} y={152} style={SK} fontSize="11" fill={P.sub}>weights</text>
      {arw(878, 112, 878, 188, P.yellow, true)}
      <text x={886} y={152} style={SK} fontSize="11" fill={P.yellow}>loss</text>

      {lane(20, 176, "INFERENCE · PER SCAN")}
      <Box x={20} y={190} t="Intraoral scan" a="SS-OCT, ~1300 nm" b="+ CP channel (opt.)" />
      <Box x={214} y={190} t="Quality gate" a="SNR, motion," b="saliva, anatomy" />
      <Box x={408} y={190} t="Surface flatten" a="align A-scans to" b="enamel surface" />
      <Box x={602} y={190} t="Encoder" a="ViT, 2.5D context" b="(±k B-scans)" kind="method" />
      <Box x={796} y={190} w={184} t="Ordered curve head" a="p(depth) per A-scan" b="S ≤ L,  S < D" kind="method" />
      {arw(184, 229, 212, 229, P.ink)}
      {arw(378, 229, 406, 229, P.ink)}
      {arw(572, 229, 600, 229, P.ink)}
      {arw(766, 229, 794, 229, P.ink)}
      {arw(878, 268, 878, 338, P.ink)}
      {route([[296, 268], [296, 298], [102, 298], [102, 270]], P.red, true)}
      <text x={112} y={318} style={SK} fontSize="11" fill={P.red}>reject → “rescan: low signal”</text>

      <Box x={796} y={340} w={184} t="3D curve fusion" a="surfaces across" b="B-scans, smoothness" />
      <Box x={602} y={340} t="Measurements" a="depth µm, r, ΔR," b="volume, cavitation" />
      <Box x={408} y={340} t="Conformal" a="intervals on r and" b="on depth, in µm" kind="method" />
      <Box x={214} y={340} t="Rule layer" a="clinician-owned" b="thresholds" />
      <Box x={20} y={340} t="Clinician report" a="overlay, numbers," b="vs. baseline visit" />
      {arw(796, 379, 768, 379, P.ink)}
      {arw(602, 379, 574, 379, P.ink)}
      {arw(408, 379, 380, 379, P.ink)}
      {arw(214, 379, 186, 379, P.ink)}

      {lane(620, 476, "SAFETY · EXPLANATION")}
      <Box x={20} y={490} t="Similar cases" a="nearest annotated" b="scans (embeddings)" kind="soft" />
      <Box x={214} y={490} t="Abstain & defer" a="interval straddles" b="a threshold, or OOD" kind="stop" />
      <Box x={408} y={490} t="OOD score" a="feature density vs." b="training bank" />
      {arw(102, 490, 102, 420, P.sub, true)}
      {arw(296, 418, 296, 488, P.red, true)}
      {arw(408, 529, 380, 529, P.red, true)}
      {route([[640, 268], [640, 304], [587, 304], [587, 452], [490, 452], [490, 488]], P.sub, true)}
    </svg>
  );
}

/* ── diagram 2: one flattened B-scan and what the head outputs ───────── */
function DiagBscan() {
  const L = "M150 60 C170 120 220 170 290 214 C340 230 390 226 430 196 C470 150 490 100 500 60";
  const D = "M0 196 C180 200 300 208 400 204 C480 200 560 196 640 190";
  const lab = { ...SK, fontSize: 12 };
  return (
    <svg viewBox="0 0 1000 330" width="100%" height="100%" role="img" style={{ display: "block" }}
      aria-label="Schematic flattened dental B-scan with enamel surface S, lesion front L and DEJ D, a highlighted A-scan column, and that column's predicted depth distributions.">
      <rect x={0} y={0} width={640} height={330} fill="#0B0F14" />
      <path d={`M0 60 H640 V190 C560 196 480 200 400 204 C300 208 180 200 0 196 Z`} fill="#1A2029" />
      <path d={`${D} V330 H0 Z`} fill="#4A525C" />
      <path d={`${L} Z`} fill="#E9C46A" opacity="0.5" />
      <path d="M0 60 H640" stroke="#F4F6F8" strokeWidth="2.5" fill="none" />
      <path d={L} stroke="#F5B301" strokeWidth="2.5" strokeDasharray="7 4" fill="none" />
      <path d={D} stroke="#39D0BF" strokeWidth="2.5" fill="none" />
      <rect x={316} y={30} width={22} height={290} fill="#FFFFFF" fillOpacity="0.08" stroke="#FFFFFF" strokeOpacity="0.5" />
      <text x={12} y={48} style={lab} fill="#E6EBF0">S · enamel surface</text>
      <text x={200} y={100} style={lab} fill="#F5B301">L · lesion front</text>
      <text x={520} y={132} style={lab} fill="#E6EBF0">sound enamel</text>
      <text x={520} y={178} style={lab} fill="#39D0BF">D · DEJ</text>
      <text x={12} y={262} style={lab} fill="#E6EBF0">dentin</text>
      <text x={344} y={316} style={lab} fill="#E6EBF0">A-scan j</text>

      <text x={690} y={34} style={SK} fontSize="13" fontWeight="600" fill={P.ink}>column j: p(depth)</text>
      <line x1={700} y1={50} x2={700} y2={300} stroke={P.sub} strokeWidth="1" />
      <text x={688} y={64} textAnchor="end" style={SK} fontSize="11.5" fill={P.sub}>0</text>
      <text x={688} y={300} textAnchor="end" style={SK} fontSize="11.5" fill={P.sub}>z</text>
      <path d="M700 52 C712 52 745 58 760 60 C745 62 712 68 700 68 Z" fill={P.ink} opacity="0.8" />
      <path d="M700 188 C710 194 736 202 752 206 C736 210 710 216 700 222 Z" fill={P.green} />
      <path d="M700 196 C716 200 750 212 770 220 C750 230 716 244 700 252 Z" fill={P.yellow} opacity="0.85" />
      <text x={772} y={64} style={SK} fontSize="11.5" fill={P.sub}>S: sharp, easy</text>
      <text x={760} y={198} style={SK} fontSize="11.5" fill={P.green}>D</text>
      <text x={780} y={230} style={SK} fontSize="11.5" fill={P.yellow}>L: wide → less sure</text>
      <text x={690} y={280} style={SK} fontSize="12" fill={P.ink}>r = (L − S) / (D − S)</text>
      <text x={690} y={300} style={SK} fontSize="11.5" fill={P.sub}>here r ≈ 1.1 → crossed the DEJ</text>
    </svg>
  );
}

/* ── Part I diagram: the oral-epithelium measurement layer ───────────── */
function DiagMeasure() {
  const lane = (x, y, s) => <text x={x} y={y} style={SK} fontSize="11" letterSpacing="1" fill={P.sub}>{s}</text>;
  const tag = (x, y, s) => <text x={x} y={y} textAnchor="end" style={SK} fontSize="11" fontWeight="600" fill={P.accent}>{s}</text>;
  return (
    <svg viewBox="0 0 1000 520" width="100%" height="100%" role="img" style={{ display: "block" }}
      aria-label="Oral OCT measurement architecture: unlabelled scans train a physics decoder; each scan passes a quality gate, a condition-aware encoder and a Bayesian boundary head whose uncertainty splits into epistemic and aleatoric parts, giving measured, uncertain or cannot-measure per A-scan, thickness in micrometres and a conformal interval.">
      {lane(20, 26, "TRAINING · LABELS ARE SCARCE")}
      <Box x={20} y={40} w={200} h={72} t="Unlabelled oral OCT" a="every patient, no traces" kind="sketch" />
      <Box x={250} y={40} w={230} h={72} t="Physics decoder" a="redraw A-scan from S, ESB," b="μ per layer + small correction" kind="sketch" />
      <Box x={510} y={40} w={200} h={72} t="Reconstruction loss" a="‖Î − I‖, no labels" kind="sketch" />
      <Box x={740} y={40} w={240} h={72} t="Few labelled patients" a="surface + ESB traces," b="patient-level split" />
      {tag(476, 58, "H2")}
      {arw(220, 76, 248, 76, P.yellow)}
      {arw(480, 76, 508, 76, P.yellow)}
      {arw(690, 112, 690, 188, P.yellow, true)}
      {route([[650, 190], [650, 150], [365, 150], [365, 114]], P.yellow, true)}
      <text x={380} y={142} style={SK} fontSize="10.5" fill={P.yellow}>predicted layers</text>
      {route([[860, 112], [860, 150], [760, 150], [760, 188]], P.sub, true)}

      {lane(20, 176, "INFERENCE · PER SCAN")}
      <Box x={20} y={190} w={150} t="OCT volume" a="in vivo, one" b="device + protocol" />
      <Box x={195} y={190} w={170} t="Quality gate" a="motion · shadow ·" b="contact · focus" />
      <Box x={390} y={190} w={190} t="Encoder" a="+ scan conditions:" b="depth, focus, signal" kind="method" />
      <Box x={605} y={190} w={190} t="Bayesian head" a="MC dropout, T passes" b="→ μ, σₐ for S and ESB" kind="method" />
      <Box x={820} y={190} w={160} t="Split σ" a="σₑ: spread of μ" b="σₐ: from the head" kind="method" />
      {tag(576, 208, "H1")}
      {tag(791, 208, "H1")}
      {arw(170, 229, 193, 229, P.ink)}
      {arw(365, 229, 388, 229, P.ink)}
      {arw(580, 229, 603, 229, P.ink)}
      {arw(795, 229, 818, 229, P.ink)}
      {arw(900, 268, 900, 338, P.ink)}

      <Box x={820} y={340} w={160} t="Three states" a="per A-scan: measured" b="uncertain · cannot" kind="stop" />
      <Box x={605} y={340} w={190} t="Thickness, µm" a="Δz optical ÷ n (1.38)" b="site-tagged" />
      <Box x={390} y={340} w={190} t="Conformal interval" a="μ ± q̂σ, calibrated" b="on unseen patients" kind="method" />
      <Box x={195} y={340} w={170} t="Measurement map" a="µm ± interval, and" b="reasons where not" />
      <Box x={20} y={340} w={150} t="Future CDSS" a="links to findings," b="silent mode first" kind="soft" />
      {tag(576, 358, "H3")}
      {arw(820, 379, 797, 379, P.ink)}
      {arw(605, 379, 582, 379, P.ink)}
      {arw(390, 379, 367, 379, P.ink)}
      {arw(195, 379, 172, 379, P.sub, true)}
      {arw(280, 268, 280, 338, P.red, true)}
      <text x={288} y={306} style={SK} fontSize="10.5" fill={P.red}>reject, with the reason</text>

      <text x={820} y={444} style={SK} fontSize="11" fill={P.red}>σₐ &gt; τₐ → cannot measure</text>
      <text x={820} y={462} style={SK} fontSize="11" fill={P.yellow}>σₑ &gt; τₑ → uncertain</text>
      <text x={820} y={480} style={SK} fontSize="11" fill={P.green}>else → measured</text>
      <text x={20} y={470} style={SK} fontSize="11" fill={P.sub}>train · calibrate · test patients never overlap; the model is frozen before calibration</text>
    </svg>
  );
}

/* ── the page ────────────────────────────────────────────────────────── */

export default function DentalOCT() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const paperTitle = document.title;
    window.scrollTo(0, 0);
    document.title = `Oral OCT — ${PAPER.author}`;
    return () => { document.title = paperTitle; };
  }, []);

  /* Esc leaves, same as every other room. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") window.location.hash = "#Research";
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
  const Idea = ({ i, t, children }) => (
    <div style={{ borderTop: `1px solid ${P.line}`, padding: "0.8rem 0" }}>
      <div style={{ ...DISP, fontWeight: 600, fontSize: "0.98rem", color: P.ink, marginBottom: 4 }}>
        <span style={{ ...MONO, fontSize: "0.62rem", color: P.accent, marginRight: 8 }}>{i}</span>{t}
      </div>
      <p style={{ ...BODY, fontSize: "0.9rem", lineHeight: 1.7, color: P.sub, margin: 0, textWrap: "pretty" }}>{children}</p>
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
        code{font-family:'IBM Plex Mono',monospace;font-size:.86em}
        .ov-grid{display:grid;grid-template-columns:216px minmax(0,1fr);gap:2.4rem;align-items:start;
          max-width:1180px;margin:0 auto;padding:0 1.4rem}
        .ov-rail{position:sticky;top:0;max-height:100vh;overflow-y:auto;padding:1.7rem 0 3rem}
        .ov-railitem{display:block;width:100%;text-align:left;background:transparent;border:none;cursor:pointer;
          padding:5px 0 5px 10px;border-left:2px solid ${P.line};transition:border-color .15s,color .15s}
        .ov-railitem:hover{border-left-color:${P.accent}}
        .ov-main{padding:1.7rem 0 5rem;max-width:760px}
        .ov-sec{scroll-margin-top:16px;padding-bottom:2.6rem}
        .dx-wide{overflow-x:auto}
        .dx-wide>figure{min-width:600px}
        @media(max-width:900px){
          .ov-grid{grid-template-columns:1fr;gap:0;padding:0 1rem}
          .ov-rail{position:static;max-height:none;padding:1rem 0 0;
            display:flex;gap:.4rem;overflow-x:auto;border-bottom:1px solid ${P.line}}
          .ov-railitem{border-left:none;border-bottom:2px solid ${P.line};padding:5px 8px;white-space:nowrap}
        }
        @media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
      `}</style>

      <div style={{ minHeight: "100vh", background: P.paper, color: P.ink }}>

        <header style={{ borderBottom: `2px solid ${P.ink}`, background: P.paper2, position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0.7rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...MONO, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: P.ink }}>Oral OCT</span>
              <span style={{ ...MONO, fontSize: "0.58rem", color: P.sub }}>trustworthy measurement · Bayesian uncertainty · proposal</span>
            </div>
            <a href="#Research" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>← back to the paper</a>
          </div>
        </header>

        <div className="ov-grid">

          <nav className="ov-rail" aria-label="Sections">
            {SECTIONS.map((s, i) => {
              const on = active === s.id;
              const partHead = i === 0 || SECTIONS[i - 1].part !== s.part;
              return (
                <Fragment key={s.id}>
                {partHead && <div style={{ ...MONO, fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: P.accent, padding: i ? "0.9rem 0 0.3rem 10px" : "0 0 0.3rem 10px" }}>{PARTS[s.part]}</div>}
                <a href="#/dentaloct" className="ov-railitem"
                  onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                  style={{ borderLeftColor: on ? P.accent : P.line, textDecoration: "none" }}>
                  <div style={{ ...MONO, fontSize: "0.54rem", color: P.sub, letterSpacing: "0.1em" }}>{s.n}</div>
                  <div style={{ ...MONO, fontSize: "0.7rem", color: on ? P.accent : P.ink, lineHeight: 1.3 }}>{s.t}</div>
                  <div style={{ ...MONO, fontSize: "0.54rem", color: P.sub, lineHeight: 1.35, marginTop: 1 }}>{s.note}</div>
                </a>
                </Fragment>
              );
            })}
            <div style={{ ...MONO, fontSize: "0.54rem", color: P.sub, marginTop: "1.4rem", paddingLeft: 10, lineHeight: 1.6 }}>esc to leave</div>
          </nav>

          <main className="ov-main">

            <div style={{ ...MONO, fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: P.sub, marginBottom: 10 }}>Research question · revised 25 Sep 2026 · not yet built</div>
            <h1 style={{ ...DISP, fontWeight: 600, fontSize: "clamp(1.9rem,4.6vw,2.9rem)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "0.9rem" }}>
              Measuring the mouth, and knowing when not to
            </h1>
            <p style={{ ...BODY, fontSize: "1.16rem", lineHeight: 1.6, color: P.sub, marginBottom: "1.6rem", maxWidth: 620, textWrap: "pretty" }}>
              A measurement layer for oral soft tissue in OCT: it finds the epithelial–stromal
              boundary, reports epithelial thickness in micrometres with an interval that holds,
              says “cannot measure” when the boundary isn't in the image, and learns from very
              few labelled patients. It's the first building block of a future CDSS.
            </p>

            <div style={{ display: "flex", gap: "1.6rem", flexWrap: "wrap", marginBottom: "2.2rem" }}>
              <Stat v="100–660 µm" l="normal epithelium, floor of mouth → cheek" />
              <Stat v="n ≈ 1.38" l="optical depth → true depth" />
              <Stat v="3" l="answers: measured · uncertain · cannot" col={P.accent} />
              <Stat v="90%" l="target coverage on unseen patients" col={P.green} />
            </div>

            {/* ══ PART I — the revised research question ══════════════════ */}

            {/* 01 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[0]}>
              <Lead>
                With only a small, access-restricted set of in vivo oral OCT scans, can we build a
                system that <b>measures epithelial thickness accurately</b>, <b>refuses to measure</b> when
                the boundary can't be seen, and gives an <b>uncertainty range that is reliable</b>,
                while needing far fewer hand-labelled patients than a standard model?
              </Lead>
              <H>
                The lining of the mouth is layered. The epithelium, a sheet of cells, sits on the
                lamina propria, collagen-rich connective tissue. The line between them is the
                epithelial–stromal boundary (ESB). Disease changes both: the epithelium thickens or
                thins, and the ESB blurs or disappears. In OCT the epithelium reads dark and the
                lamina propria bright, so the boundary is visible in the top 1–2 mm, without cutting
                and without radiation.
              </H>
              <H>
                This is deliberately a question about <i>measurement</i>, not diagnosis. It can be
                answered with labelled OCT volumes alone, without a large set of biopsy-confirmed
                cancers. A future CDSS sits on top of it.
              </H>
              <Callout kind="note" title="why a number needs context">
                Normal epithelial thickness varies a lot by site: about 100 µm on the floor of the
                mouth and about 660 µm on the cheek (Di Stasio et al., 2019). “Thick” and “thin” only
                mean something relative to the site, so the system reports site-tagged micrometres,
                never a bare label.
              </Callout>
            </Sec>

            {/* 02 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[1]}>
              <H>
                Most of the individual pieces already exist, so the claims have to be scoped honestly.
              </H>
              <Table
                head={["already done", "by"]}
                rows={[
                  ["Deep-learning pipeline: field-of-view check, artefacts, surface and ESB, epithelial depth maps", "Hill et al., 2024"],
                  ["Shape, ESB visibility and attenuation as dysplasia / cancer markers", "Malone et al., 2024"],
                  ["Semi-supervised oral OCT segmentation, incl. labels transferred from skin", "Liao et al., 2025"],
                  ["Normal thickness by oral site", "Di Stasio et al., 2019"],
                  ["Physics-aware deep learning in other OCT (attenuation, simulated physics)", "QOCT-Net 2023 · PhysioSpeck-Net 2026"],
                  ["Bayesian (MC-dropout) uncertainty for oral-cancer images, with referral", "Song et al., 2021"],
                ]}
              />
              <Callout kind="wrong" title="claims this work must not make">
                “First oral OCT segmentation.” “First epithelial thickness measurement.” “First
                attenuation analysis.” “First low-label method” or “first skin-to-oral transfer.”
                “No oral OCT dataset exists”: no openly downloadable labelled set was found, which
                is a statement about access, not proof.
              </Callout>
              <H>
                What we did not find anywhere is the combination: an explicit <b>“cannot measure”</b> output,
                a quality gate that says <b>why</b> a scan was rejected, thickness in <b>physical units</b> with
                the conversion stated, <b>physics-informed learning</b> from unlabelled scans tested at small
                label budgets, <b>conformal intervals</b> checked on unseen patients, and strict
                <b> patient-level splits</b>. The novelty is the combination, done rigorously. That
                has to be re-checked against the literature before submission.
              </H>
            </Sec>

            {/* 03 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[2]}>
              <H>
                Three ideas carry the design, one per hypothesis. A <b>Bayesian boundary head</b> whose
                uncertainty splits into two kinds gives the three-state output (H1). A <b>physics
                decoder</b> that redraws each A-scan from the predicted layers lets every unlabelled
                scan train the model (H2). A <b>conformal layer</b> turns the Bayesian spread into an
                interval with a stated coverage (H3).
              </H>
              <div className="dx-wide">
                <Fig ratio="1000 / 520" caption="Blue boxes are the method; ochre is what trains without labels; red is how the system declines. Scan conditions (boundary depth, distance from focus, local signal, artefact flags) go into the encoder, which is H1's “quality-aware” half; the three-state output is the other half.">
                  <DiagMeasure />
                </Fig>
              </div>
              <Callout kind="clever" title="the physics decoder, in one line">
                The head describes the tissue as a surface, an ESB and a signal-decay rate per layer.
                A simple single-scattering OCT model turns that description back into an A-scan, and
                the loss compares it with the real one. No label is needed, so every unlabelled
                patient contributes. A small learned correction absorbs what the simple physics
                gets wrong.
              </Callout>
              <H>
                Signal decay depends on the device, the focus and the image processing as well as the
                tissue. So it's reported as a signal-decay measure specific to this system and
                protocol, computed only where the signal is good enough, never as a pure tissue
                property.
              </H>
            </Sec>

            {/* 04 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[3]}>
              <Lead>
                A normal network trained to find the ESB always returns a depth, including under a
                shadow where there's nothing to find. A Bayesian network returns a distribution
                over depths, and the shape of that distribution says <i>why</i> it might be wrong.
              </Lead>
              <H>
                <b>What it is.</b> A Bayesian neural network keeps a distribution over its weights
                instead of one best set, and predicts by averaging over every network that
                distribution allows. The exact version is intractable at deep-learning scale, so the
                practical route is <b>Monte Carlo dropout</b>: leave dropout switched on at test time,
                run the same scan T times, and treat the passes as samples. The mean is the
                estimate and the spread is the uncertainty, at no extra training cost.
              </H>
              <H>
                <b>Evidence it helps in the mouth.</b> Song et al. (2021) did exactly this on 2,350
                intraoral photos: VGG19, two dropout layers at 0.5, 50 passes per image. The
                Bayesian model was no more accurate outright (85.6% vs 85.1%), but ranking cases by
                uncertainty and referring the top 10% lifted accuracy on the rest to about 90%.
                Uncertainty was also higher on photos from an unfamiliar camera. That's the
                behaviour a “cannot measure” state needs.
              </H>
              <H>
                <b>What's different here.</b> Song et al. classify; this system measures. For a
                measurement the head predicts, for every A-scan, a boundary depth μ and its own noise
                σₐ (a heteroscedastic head, after Kendall &amp; Gal 2017). MC dropout adds the spread
                of μ across passes. The two pieces answer different questions:
              </H>
              <Table
                head={["uncertainty", "comes from", "shrinks with more labels?", "output"]}
                rows={[
                  [{ v: "aleatoric σₐ", b: true }, "the image: shadow, blur, saliva, poor contact", { v: "no", col: P.red }, { v: "cannot measure — no number", col: P.red, b: true }],
                  [{ v: "epistemic σₑ", b: true }, "the model: an unfamiliar site, shape or device", { v: "yes", col: P.green }, { v: "uncertain — flag for review", col: P.yellow, b: true }],
                  [{ v: "both low", b: true }, "a visible boundary the model knows", "—", { v: "measured — µm ± conformal interval", col: P.green, b: true }],
                ]}
              />
              <Callout kind="clever" title="why this is the piece that fits H1">
                H1 asks for three outputs: measured, uncertain and cannot measure. A single
                confidence score can't tell “the boundary isn't there” from “I haven't seen enough
                boundaries like this”, and those need opposite responses: stop, or collect more
                data. The epistemic/aleatoric split gives each state its own mechanism. It also
                makes a falsifiable prediction: adding labelled patients should shrink the
                “uncertain” columns and leave the “cannot measure” columns where they are.
              </Callout>
              <Callout kind="wrong" title="what Bayes does not buy on its own">
                MC-dropout variances are miscalibrated and move with the dropout rate you picked. So
                σ is used as a <i>scale</i>, not a promise. The conformal layer calibrates it on held-out
                patients: μ ± q̂σ, where q̂ is the 90% quantile of |y − μ|/σ. That keeps the intervals
                adaptive and gives them a coverage statement.
              </Callout>
              <a href="#/lab/bnn" style={{ display: "block", textDecoration: "none", border: `1px solid ${P.line}`, borderTop: `2px solid ${P.ink}`, background: P.paper2, padding: "0.9rem 1.05rem", margin: "1.2rem 0 0" }}>
                <div style={{ ...MONO, fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.13em", color: P.sub, marginBottom: 6 }}>the sketch, in the Lab</div>
                <div style={{ ...DISP, fontWeight: 600, fontSize: "1.08rem", color: P.ink, marginBottom: 5 }}>Bayesian deep learning, step by step</div>
                <p style={{ ...BODY, fontSize: "0.9rem", lineHeight: 1.65, color: P.sub, margin: 0 }}>
                  Seven interactive steps: run MC-dropout passes yourself, refer the uncertain cases,
                  shade a shadow over the ESB, add labelled patients, and watch which uncertainty
                  moves. <span style={{ ...MONO, fontSize: "0.7rem", color: P.accent }}>open the bench →</span>
                </p>
              </a>
            </Sec>

            {/* 05 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[4]}>
              <H>
                Every comparison uses the same patients, the same network size and the same training
                rules; only the thing being tested changes.
              </H>
              <Table
                head={["", "we expect", "falsified if"]}
                rows={[
                  [{ v: "H1 · quality-aware", b: true }, "Scan conditions + a three-state output place the ESB more accurately and make fewer false measurements on difficult scans (deep, faint, shadowed, blurred), with no loss on ordinary ones", "not better on difficult scans, or worse on ordinary ones"],
                  [{ v: "H1 · Bayesian test", col: P.accent, b: true }, "Aleatoric σ separates the scans experts marked “ESB not visible” (AUROC); epistemic σ falls with label budget while aleatoric σ stays flat", "cannot-measure calls don't track expert “not visible” flags, or both uncertainties move together"],
                  [{ v: "H2 · few labels", b: true }, "The physics decoder beats both supervised-only and a strong semi-supervised baseline at 5, 10 and 20 labelled patients, repeated over random patient draws", "no clear gain over both at the small budgets"],
                  [{ v: "H3 · trust", b: true }, "Conformal 90% intervals contain the expert thickness for about 90% of unseen patients, and are narrow enough to be useful by a limit fixed in advance", "coverage clearly below 90%, or intervals too wide"],
                  [{ v: "H4 · transfer (optional)", b: true }, "Pretraining on another tissue's OCT beats scratch; oesophagus vs skin vs retina vs ImageNet vs oral-only SSL is measured, not assumed", "no pretrained source beats scratch at small budgets"],
                ]}
              />
              <H>
                Label budgets are counted in <b>patients, not images</b>. Training, calibration and
                test sets never share a patient. The model is frozen before calibration, and
                calibration patients are never used for anything else.
              </H>
            </Sec>

            {/* 06 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[5]}>
              <Table
                head={["the first paper will show", "it will not claim"]}
                rows={[
                  ["How accurately it finds the surface and ESB and measures thickness, on our device and protocol", "that it detects or rules out cancer or dysplasia"],
                  ["How reliably it says “cannot measure”, and why", "that it decides whether a biopsy is needed"],
                  ["Whether physics-informed learning reduces the labels needed", "that it replaces histopathology"],
                  ["Whether its intervals hold on unseen patients", "that it works on any device"],
                  ["How repeatable measurements are between scans", "that its confidence is guaranteed per patient"],
                ]}
              />
              {[
                ["No device or in vivo scans", "Everything depends on it. Healthy volunteers are the fastest start."],
                ["Only display-processed images", "The physics decoder needs raw or minimally processed signal. Without it, the physics claims stay modest."],
                ["Too few patients", "A pilot of roughly 10–15 patients checks feasibility before the main study."],
                ["One annotator", "Two independent experts on a shared subset, so human difficulty is measured, not assumed."],
                ["Probe pressure on soft tissue", "It changes thickness. Record contact and standardise the protocol."],
                ["Someone publishes the same combination", "Re-check the literature right before submission."],
              ].map(([t, b], i) => <Idea key={i} i={i + 1} t={t}>{b}</Idea>)}
            </Sec>

            {/* ══ PART II — the earlier hard-tissue design ════════════════ */}
            <div style={{ borderTop: `2px solid ${P.ink}`, borderBottom: `1px solid ${P.line}`, padding: "0.9rem 0", margin: "0.4rem 0 2.2rem" }}>
              <div style={{ ...MONO, fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: P.accent, marginBottom: 6 }}>Part II · companion design</div>
              <div style={{ ...DISP, fontWeight: 600, fontSize: "1.3rem", marginBottom: 6 }}>SketchDEJ: the same principles on enamel</div>
              <p style={{ ...BODY, fontSize: "0.95rem", lineHeight: 1.7, color: P.sub, margin: 0 }}>
                Before the question moved to soft tissue, the first design targeted caries: where
                the lesion front sits relative to the dentin–enamel junction. It shares the
                measure-then-abstain-then-calibrate shape, and it's kept here as the hard-tissue
                extension.
              </p>
            </div>

            {/* 07 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[6]}>
              <Lead>
                Retinal OCT is one of the most crowded corners of medical imaging: cross-sectional
                classification and layer segmentation are near-saturated, and new work competes on
                marginal gains. The same physics pointed at a tooth is almost untouched.
              </Lead>
              <H>
                At ~1300 nm enamel is highly transparent, so OCT sees through the full enamel
                thickness to the dentin–enamel junction (DEJ) at 10–15 µm resolution, without
                radiation. That is exactly the first ~2 mm where early caries, restoration margins,
                cracks and mucosal epithelium live — and where bitewing X-rays miss early,
                subsurface lesions. Handheld intraoral OCT scanners are now reaching the market, so
                clinical-scale data is coming.
              </H>
              <Table
                head={["", "retinal OCT", "dental OCT"]}
                rows={[
                  ["Public datasets", "Kermany, OCTDL, RETOUCH, Duke, OLIVES…", { v: "none", col: P.red, b: true }],
                  ["Typical study", "thousands of patients, multi-vendor", "tens–hundreds of extracted teeth, one device"],
                  ["Dominant AI task", "classification, layer & fluid segmentation", "B-scan caries classification (~95% ex vivo)"],
                  ["Quantitative outputs", "fluid volume, layer thickness", { v: "mostly labels, not measurements", col: P.red }],
                ]}
              />
              <Callout kind="clever" title="the opening">
                Almost every dental-OCT AI paper is a small, ex vivo, single-device classifier. What
                is missing is exactly what a clinic needs: a measurement, an uncertainty on it, and a
                suggestion tied to how dentists actually decide.
              </Callout>
            </Sec>

            {/* 08 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[7]}>
              <Lead>
                Modern caries management is minimally invasive: arrest early lesions with fluoride or
                sealants, drill only when you must. The line between those two is mostly one fact —
                <b> has the lesion crossed the dentin–enamel junction?</b>
              </Lead>
              <H>
                A classifier that says “dentin caries: 0.87” answers the question indirectly and
                can't tell you how close the call was. OCT, unlike an X-ray, shows the three things
                needed to answer it directly: the enamel surface, the bright front of
                demineralised enamel, and the DEJ as a boundary line. So the proposal is organised
                around one number:
              </H>
              <div style={{ ...MONO, fontSize: "1rem", color: P.ink, background: P.paper2, border: `1px solid ${P.line}`, padding: "0.8rem 1rem", margin: "0.4rem 0 1.1rem" }}>
                r = (L − S) / (D − S)
                <span style={{ fontSize: "0.72rem", color: P.sub, display: "block", marginTop: 6 }}>
                  S = enamel surface · L = lesion front · D = DEJ · r &gt; 1 means the lesion has reached dentin
                </span>
              </div>
              <Callout kind="note" title="thesis">
                Predict the geometry the decision rests on, make it trainable from quick sketches of
                that geometry, and put the uncertainty on that one number — not on pixels.
              </Callout>
            </Sec>

            {/* 09 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[8]}>
              <H>
                It is a hybrid CDSS: deep learning extracts measurements, and a transparent rule
                layer turns them into clinical language. Most real-world failures happen in the
                layers around the model, so half the boxes exist to stop the system from answering.
              </H>
              <div className="dx-wide">
                <Fig ratio="1000 / 600" caption="Blue boxes carry the method ideas, ochre is where sketch supervision enters, red paths are the ways the system refuses to answer. The rule layer is plain code a dentist can read.">
                  <DiagPipeline />
                </Fig>
              </div>
            </Sec>

            {/* 10 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[9]}>
              <H>
                For every A-scan column the head outputs a probability distribution over depth for
                three boundaries, plus a logit for whether a lesion exists in that column at all.
                The ordering is built into the output: <code>L = S + softplus(·)</code>,
                <code> D = S + softplus(·)</code>, so the curves can never cross in anatomically
                impossible ways. A pixel mask gives no such guarantee.
              </H>
              <div className="dx-wide">
                <Fig ratio="1000 / 330" caption="Schematic, not real data. The spread of each column's distribution is a free, per-location uncertainty. Across the volume, max(r) and the lesion's footprint on the surface become the measurements the rules read.">
                  <DiagBscan />
                </Fig>
              </div>
              <H>
                Retinal layer segmentation already works this way — boundary regression with
                topology guarantees. Dental OCT caries work still uses classifiers or masks. The DEJ
                is a boundary, so model it as one; depth and <code>r</code> then fall out of the
                curves with no post-processing of blobs.
              </H>
            </Sec>

            {/* 11 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[10]}>
              <Lead>
                The field's real bottleneck is labels, so the label format is designed to be as
                cheap as the model allows.
              </Lead>
              <H>
                Annotators trace S, L and D as polylines on a subset of B-scans — say one in eight —
                instead of painting pixel masks. The loss is a per-column depth likelihood on traced
                columns, plus a smoothness prior across slices; the 3D fusion step fills in what was
                never traced. On extracted teeth, micro-CT supplies true lesion depth to calibrate
                against.
              </H>
              <Callout kind="clever" title="why sketches fit">
                The label is the same object the model predicts. Nothing is lost translating a mask
                into a depth, and a dentist can trace three lines in the time it takes to paint
                half a mask — which is what makes building the field's first real dataset plausible.
              </Callout>
            </Sec>

            {/* 12 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[11]}>
              <H>
                Split-conformal prediction puts an interval on <code>r</code> and on lesion depth in
                micrometres, calibrated against micro-CT or adjudicated sketches. A suggestion is only
                shown when the whole interval sits on one side of a clinical threshold. When it
                straddles <code>r = 1</code>, the output is “borderline — clinician review”.
              </H>
              <Callout kind="note" title="the thread from my OMIA work">
                The DR restoration paper found that pixel fidelity and diagnostic usefulness come
                apart. The same instinct applies here: a heatmap of pixel uncertainty tells a dentist
                nothing, while a coverage-guaranteed interval on “has it crossed the DEJ?” is the
                exact thing they would want to know.
              </Callout>
              <H>
                Conformal coverage assumes the test scans look like the calibration scans, which
                breaks under a new device or in vivo. That is why an out-of-distribution score sits
                beside it — feature density against the training bank — and either one can trigger
                abstention.
              </H>
            </Sec>

            {/* 13 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[12]}>
              <H>
                Dental OCT has no unlabelled corpus worth the name; retinal OCT has hundreds of
                thousands of B-scans with the same interferometric physics and speckle statistics.
                The encoder is pretrained self-supervised (I-JEPA or MAE) on public retinal OCT plus
                whatever raw dental scans exist, then fine-tuned.
              </H>
              <H>
                Whether that transfer helps is genuinely open — 840 vs 1300 nm, retina vs enamel — so
                the result is worth reporting either way. Next to the learned path sits one channel
                that isn't learned at all: integrated reflectivity ΔR, computed from the
                cross-polarised OCT signal between S and L, a classical measure of mineral loss.
              </H>
              <Callout kind="clever" title="a number the model can't make up">
                ΔR is computed, not predicted. If the learned depth and the physics disagree, that
                disagreement is itself a warning sign worth surfacing.
              </Callout>
            </Sec>

            {/* 14 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[13]}>
              <H>
                The thresholds below show the mechanism. They are placeholders: the real ones get set
                with a clinical partner and mapped to a recognised caries-management framework
                before anyone relies on them.
              </H>
              <Table
                head={["condition — whole interval must satisfy", "reading", "suggestion"]}
                rows={[
                  ["no lesion columns", "sound surface", { v: "routine recall", col: P.green }],
                  ["0 < r ≤ 0.5, surface intact", "outer-enamel lesion", { v: "fluoride / remineralise, re-scan", col: P.green }],
                  ["0.5 < r ≤ 1, surface intact", "inner-enamel lesion", { v: "sealant or resin infiltration", col: P.green }],
                  ["r > 1, surface intact", "dentin, non-cavitated", { v: "flag: micro-invasive vs operative", col: P.yellow }],
                  ["S curve broken over the lesion", "cavitated", { v: "flag: restorative consult", col: P.yellow }],
                  ["interval spans a threshold · OOD · QC fail", "not reliable", { v: "abstain — clinician review", col: P.red, b: true }],
                ]}
              />
              <div style={{ ...MONO, fontSize: "0.74rem", lineHeight: 1.7, color: P.ink, background: P.paper2, border: `1px solid ${P.line}`, padding: "0.75rem 0.95rem" }}>
                <span style={{ color: P.sub }}>example output (illustrative) ·</span> tooth 36 occlusal · max depth 1.10 mm [0.98, 1.21] · r = 1.12 [1.03, 1.22] · surface intact · ΔR ↑ vs baseline → dentin involvement, discuss micro-invasive options. Clinician to confirm.
              </div>
            </Sec>

            {/* 15 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[14]}>
              <Table
                head={["claim", "comparison", "metric"]}
                rows={[
                  [{ v: "curves beat masks", b: true }, "nnU-Net masks → depth vs. ordered curve head", "depth MAE (µm) vs micro-CT · DEJ-crossing accuracy"],
                  [{ v: "sketches are enough", b: true }, "dense masks vs 1-in-8 polylines, matched annotator-minutes", "depth MAE per labelling hour"],
                  [{ v: "retina transfers", b: true }, "ImageNet vs retinal SSL vs retinal + dental SSL", "label-efficiency curve, 10 → 100%"],
                  [{ v: "abstention is honest", b: true }, "no UQ vs ensemble vs conformal on r", "coverage · risk–coverage · % deferred"],
                  [{ v: "it survives shift", b: true }, "ex vivo / device A → in vivo / device B", "OOD AUROC · coverage under shift"],
                  [{ v: "it helps decisions", b: true }, "treat-all / treat-none / CDSS; small reader study", "net benefit · agreement with an expert panel"],
                ]}
              />
              <H>
                Reporting follows CLAIM and TRIPOD+AI from the start, data is split by tooth and never
                by B-scan, and the external test comes from a different device or site.
              </H>
            </Sec>

            {/* 16 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[15]}>
              {[
                ["Prototype on public retinal data — now", "The curve head and the conformal layer don't care which tissue they're looking at. Duke SD-OCT ships layer-boundary annotations in exactly this output format, so ordered-curve regression with conformal depth intervals can be built and debugged before a single dental scan exists."],
                ["Find a dental partner and write the intended use", "One decision (monitor vs restore on reachable surfaces), one device, ethics approval for extracted teeth."],
                ["Build the ex vivo dataset", "Extracted teeth → SS-OCT (plus cross-polarised if available) → micro-CT for true depth. A small polyline annotation tool. Split by tooth."],
                ["Train and run the ablations", "The six claims above. This plus a small external test and a dataset release is a MICCAI / OMIA-shaped first paper."],
                ["Small in vivo set from a second setting", "Measure the shift, test the abstention. Always framed as assistive, never autonomous."],
              ].map(([t, b], i) => <Idea key={i} i={i + 1} t={t}>{b}</Idea>)}
            </Sec>

            {/* 17 ─────────────────────────────────────────────────────── */}
            <Sec s={SECTIONS[16]}>
              <Callout kind="wrong" title="no data, no project">
                There is no public dental-OCT dataset. Step 1 is the only part that can happen
                without a clinical and imaging partner.
              </Callout>
              {[
                ["The DEJ can disappear", "Deep, strongly scattering lesions can hide the DEJ at the edge of OCT's ~2 mm depth. Each column needs an “unresolvable” outcome that widens the interval instead of guessing."],
                ["Retinal transfer might not help", "Wavelength and tissue differ a lot. That is a result to report, not a failure."],
                ["The probe can't reach everything", "Posterior and proximal surfaces are hard to image with current intraoral probes, so the first scope is surfaces the probe actually reaches."],
                ["Ex vivo isn't in vivo", "Saliva, motion, soft tissue and probe angle are a real domain shift. Ex vivo numbers are never presented as clinical performance."],
              ].map(([t, b], i) => <Idea key={i} i={i + 1} t={t}>{b}</Idea>)}
            </Sec>

            <footer style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: `2px solid ${P.ink}` }}>
              <p style={{ ...MONO, fontSize: "0.62rem", color: P.sub }}>{PAPER.author} · oral OCT research proposal · September 2026</p>
              <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", marginTop: 10 }}>
                <a href="#Research" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>← back to the paper</a>
                <a href="#/lab/bnn" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>Bayesian DL, in the Lab →</a>
                <a href="#/orthovision" style={{ ...MONO, fontSize: "0.66rem", color: P.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>OrthoVision, the other case study →</a>
              </div>
            </footer>

          </main>
        </div>
      </div>
    </>
  );
}
