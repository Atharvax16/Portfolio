import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

/* ════════════════════════════════════════
   PALETTE
   ════════════════════════════════════════ */
const P = {
  bg:"#07070E", bgAlt:"#0D0D18", text:"#EAE8E2", muted:"#7A7A90",
  accent:"#FF6B4A", accent2:"#FFB347", glow:"rgba(255,107,74,0.18)",
  card:"rgba(16,16,28,0.85)", border:"rgba(255,107,74,0.1)",
  green:"#4ADE80", red:"#F87171", yellow:"#FBBF24",
  grad:"linear-gradient(135deg,#FF6B4A,#FFB347)",
};

const SECS = ["Home","About","Projects","Skills","Journey","Blog","Contact"];

const BRAIN_REGIONS = [
  { name:"Frontal Lobe", pos:[0,1.5,1.1], skills:["NLP / LLMs","Deep Learning","Problem Solving"], desc:"Higher-order thinking & language models", color:"#FF6B4A" },
  { name:"Parietal Lobe", pos:[0,1.7,-0.5], skills:["Data Visualization","Spatial Analysis","Power BI"], desc:"Sensory data & visual analytics", color:"#FFB347" },
  { name:"Temporal Lobe", pos:[1.7,0.3,0.3], skills:["Pattern Recognition","NLP","Sequential Data"], desc:"Language & sequential patterns", color:"#4ADE80" },
  { name:"Occipital Lobe", pos:[0,0.7,-1.5], skills:["Computer Vision","CNN","Image Classification"], desc:"Visual processing & recognition", color:"#60A5FA" },
  { name:"Cerebellum", pos:[0,-0.7,-1.1], skills:["Reinforcement Learning","Model Tuning","Optimization"], desc:"Precision & model coordination", color:"#C084FC" },
  { name:"Brain Stem", pos:[0,-1.3,0], skills:["Python","SQL","Core Fundamentals"], desc:"Foundation everything runs on", color:"#F472B6" },
];

const JOURNEY = [
  { year:"2021", title:"The Spark", place:"TEC Mumbai", text:"Started B.E. in AI & Data Science. Fell in love with why data tells stories.", mindset:"Learn everything. Question everything.", icon:"🔥", color:"#F472B6" },
  { year:"2023", title:"First Build", place:"Mira Advance Eng.", text:"Built Python systems with real impact. 2x speed, 30% fewer data errors.", mindset:"Ship it. Break it. Fix it better.", icon:"⚒️", color:"#FFB347" },
  { year:"2024", title:"Going Deeper", place:"Bharat Intern", text:"ML pipelines, CNNs, spam classifiers. 91% accuracy on first production model.", mindset:"Accuracy is vanity. Recall is sanity.", icon:"🧪", color:"#4ADE80" },
  { year:"2025", title:"The Big Leap", place:"Dublin, Ireland", text:"Moved continents for MSc AI at DCU. Won AWS Hackathon. Shortlisted top 5 of 80 teams for Federated Learning research on Diabetic Retinopathy using XAI GradCAM.", mindset:"Comfort zone is where dreams go to die.", icon:"✈️", color:"#60A5FA" },
  { year:"2026", title:"What's Next", place:"The Future", text:"AWS Cert. Research paper. MSc graduation. Ready to make impact at scale.", mindset:"Understand the problem before jumping to a solution.", icon:"🚀", color:"#FF6B4A" },
];

const SKILLS = [
  {n:"Python",lv:90,c:"lang"},{n:"SQL",lv:82,c:"lang"},{n:"R",lv:65,c:"lang"},
  {n:"TensorFlow",lv:85,c:"ml"},{n:"PyTorch",lv:80,c:"ml"},{n:"Scikit-learn",lv:88,c:"ml"},
  {n:"NLP / LLMs",lv:82,c:"ml"},{n:"Deep Learning",lv:85,c:"ml"},
  {n:"Power BI",lv:78,c:"data"},{n:"Pandas / NumPy",lv:92,c:"data"},{n:"Data Viz",lv:80,c:"data"},
  {n:"AWS",lv:72,c:"cloud"},{n:"Docker",lv:68,c:"cloud"},{n:"FastAPI",lv:75,c:"cloud"},
];

const PROJECTS = [
  {title:"CPU Anomaly Detection",badge:"🏆 Hackathon Winner",desc:"End-to-end pipeline on AWS SageMaker with Lambda + SNS alerting. 98% accuracy.",tech:["AWS","Random Forest","Lambda"],metrics:{accuracy:98,precision:79,recall:78,f1:78},color:"#FF6B4A",hasCase:true},
  {title:"Credit Card Fraud Analysis",badge:"📊 1.29M+ Txns",desc:"K-Fold target encoding, time-based features, class weighting. Recall-first approach.",tech:["Scikit-learn","Pandas","Feature Eng."],metrics:{accuracy:95,precision:87,recall:91,f1:89},color:"#FFB347",hasCase:false},
  {title:"CodeQwen: LLM Code Engine",badge:"🤖 Full-Stack AI",desc:"CodeQwen 7B with real-time streaming, multi-language conversion, FastAPI backend.",tech:["HuggingFace","FastAPI","Gradio"],metrics:null,color:"#4ADE80",hasCase:false},
];

const CASE_STEPS = [
  {p:"Problem",i:"🎯",d:"Detect cyberattacks from CPU logs without false-positive overload."},
  {p:"Explore",i:"🔍",d:"Cross-checked multi-source data. Found temporal anomaly signatures."},
  {p:"Model",i:"⚙️",d:"RF beat Isolation Forest at 98% accuracy with labeled patterns."},
  {p:"Evaluate",i:"📊",d:"Tuned precision/recall — missed attacks cost more than false alarms."},
  {p:"Deploy",i:"🚀",d:"SageMaker + Lambda + SNS. Production-ready pipeline."},
];

const BLOGS = [
  {title:"Why Random Forest Over XGBoost for Anomaly Detection",time:"5 min",tags:["ML","AWS"],excerpt:"Interpretability and stakeholder trust beat marginal accuracy in security-critical systems.",color:"#FF6B4A"},
  {title:"The Biggest Mistake in Fraud Detection: Trusting Accuracy",time:"4 min",tags:["Metrics","Fraud"],excerpt:"99.8% accuracy means nothing when the model predicts 'not fraud' for everything.",color:"#FFB347"},
  {title:"From Notebook to Production: ML on AWS",time:"6 min",tags:["MLOps","AWS"],excerpt:"Your Jupyter notebook is not a product. Real lessons from deploying anomaly detection.",color:"#4ADE80"},
];

const SPAM_KW=["free","win","congratulations","prize","click","urgent","claim","gift","selected","$","!!!","1-800","compromised","immediately","verify"];
const DEMO_MSGS=["Congratulations! You've won a $1000 gift card!!!","Hey, still on for coffee at 3?","URGENT: Bank account compromised. Verify now.","Thanks for the report, reviewing today.","FREE iPhone! Text WIN to 80085!","Can you grab milk on your way home?"];
function classify(t){const l=t.toLowerCase();let s=0,f=[];SPAM_KW.forEach(k=>{if(l.includes(k)){s++;f.push(k)}});if((t.replace(/[^A-Z]/g,"").length/Math.max(t.length,1))>0.3){s++;f.push("CAPS")}const c=Math.min(s/3.5,1);return{pred:c>0.35?"spam":"ham",conf:Math.round(c*100),feats:f.slice(0,4)}}

/* ════════════════════════════════════════
   3D BRAIN — Three.js r128 compatible
   ════════════════════════════════════════ */
function Brain3D({ onRegionClick, activeRegionRef }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let destroyed = false;
    const w = el.clientWidth || 400;
    const h = el.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 6);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) {
      return;
    }
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Build brain shape
    const brainGeo = new THREE.SphereGeometry(2, 36, 28);
    const pos = brainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      const nx = x / len, ny = y / len, nz = z / len;
      let sc = 1;
      sc += 0.15 * Math.sin(nx * 5 + ny * 3);
      sc += 0.1 * Math.cos(ny * 4 + nz * 6);
      sc += 0.08 * Math.sin(nz * 7 + nx * 2);
      if (ny < -0.3) sc *= 0.85;
      sc *= 1 + 0.1 * nz;
      sc -= 0.05 * Math.exp(-nx * nx * 20) * (ny > 0 ? 1 : 0);
      pos.setXYZ(i, x * sc, y * sc, z * sc);
    }
    brainGeo.computeVertexNormals();

    const wireMat = new THREE.MeshBasicMaterial({ color: 0xFF6B4A, wireframe: true, transparent: true, opacity: 0.1 });
    group.add(new THREE.Mesh(brainGeo, wireMat));

    // Particles on surface
    const pCount = 1500;
    const pGeo = new THREE.BufferGeometry();
    const pArr = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      let r = 2;
      const nx2 = Math.sin(ph) * Math.cos(th), ny2 = Math.cos(ph), nz2 = Math.sin(ph) * Math.sin(th);
      r += 0.15 * Math.sin(nx2 * 5 + ny2 * 3) + 0.1 * Math.cos(ny2 * 4 + nz2 * 6);
      if (ny2 < -0.3) r *= 0.85;
      r *= 1 + 0.1 * nz2;
      pArr[i * 3] = nx2 * r; pArr[i * 3 + 1] = ny2 * r; pArr[i * 3 + 2] = nz2 * r;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pArr, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xFF6B4A, size: 0.03, transparent: true, opacity: 0.45 });
    group.add(new THREE.Points(pGeo, pMat));

    // Inner glow sphere
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xFF6B4A, transparent: true, opacity: 0.025 });
    group.add(new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16), innerMat));

    // Hotspots
    const hotspots = [];
    BRAIN_REGIONS.forEach((reg, idx) => {
      const geo = new THREE.SphereGeometry(0.2, 12, 12);
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(reg.color), transparent: true, opacity: 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(reg.pos[0], reg.pos[1], reg.pos[2]);
      mesh.userData = { regionIdx: idx };
      group.add(mesh);
      hotspots.push({ mesh, mat });

      // Outer glow sphere
      const gGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const gMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(reg.color), transparent: true, opacity: 0.12 });
      const gMesh = new THREE.Mesh(gGeo, gMat);
      gMesh.position.set(reg.pos[0], reg.pos[1], reg.pos[2]);
      group.add(gMesh);
    });

    // Interaction state
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let velX = 0, velY = 0;

    const onDown = (e) => {
      isDragging = true;
      const pt = e.touches ? e.touches[0] : e;
      prevX = pt.clientX; prevY = pt.clientY;
    };
    const onMove = (e) => {
      if (!isDragging) return;
      const pt = e.touches ? e.touches[0] : e;
      velY = (pt.clientX - prevX) * 0.005;
      velX = (pt.clientY - prevY) * 0.005;
      prevX = pt.clientX; prevY = pt.clientY;
    };
    const onUp = () => { isDragging = false; };

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    const onClick = (e) => {
      const rect = el.getBoundingClientRect();
      const pt = e.changedTouches ? e.changedTouches[0] : e;
      mouseVec.x = ((pt.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((pt.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const meshes = hotspots.map(h => h.mesh);
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length > 0) {
        onRegionClick(hits[0].object.userData.regionIdx);
      }
    };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("mouseleave", onUp);
    el.addEventListener("touchstart", onDown, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onUp);
    el.addEventListener("click", onClick);

    let frame = 0;
    const animate = () => {
      if (destroyed) return;
      frame++;
      const t = frame * 0.008;

      if (!isDragging) {
        group.rotation.y += 0.002;
        velX *= 0.95; velY *= 0.95;
      }
      group.rotation.x += velX;
      group.rotation.y += velY;

      // Pulse hotspots
      const ar = activeRegionRef.current;
      hotspots.forEach((h, i) => {
        const sc = 1 + 0.15 * Math.sin(t * 2 + i);
        h.mesh.scale.setScalar(ar === i ? 1.5 : sc);
        h.mat.opacity = ar === i ? 1 : 0.55 + 0.2 * Math.sin(t * 2 + i);
      });

      pMat.opacity = 0.35 + 0.12 * Math.sin(t);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const nw = el.clientWidth || 400, nh = el.clientHeight || 400;
      camera.aspect = nw / nh; camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      destroyed = true;
      window.removeEventListener("resize", onResize);
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("mouseleave", onUp);
      el.removeEventListener("touchstart", onDown);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onUp);
      el.removeEventListener("click", onClick);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />;
}

/* ════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════ */
function useTypewriter(strings) {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = strings[idx];
    const timer = setTimeout(() => {
      if (!del) {
        setText(cur.slice(0, ci + 1));
        if (ci + 1 === cur.length) setTimeout(() => setDel(true), 1600);
        else setCi(ci + 1);
      } else {
        setText(cur.slice(0, ci));
        if (ci === 0) { setDel(false); setIdx((idx + 1) % strings.length); }
        else setCi(ci - 1);
      }
    }, del ? 35 : 70);
    return () => clearTimeout(timer);
  }, [ci, del, idx]);
  return text;
}

function useReveal(th = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: th });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}

function Rv({ children, delay = 0, dir = "up" }) {
  const [ref, v] = useReveal();
  const tr = { up: "translateY(30px)", left: "translateX(30px)", right: "translateX(-30px)" };
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : (tr[dir] || tr.up), transition: `all 0.65s cubic-bezier(0.4,0,0.2,1) ${delay}s` }}>
      {children}
    </div>
  );
}

function Radar({ m }) {
  if (!m) return null;
  const k = Object.keys(m), v = Object.values(m), cx = 50, cy = 50, r = 38;
  const st = (2 * Math.PI) / k.length;
  const pt = (i, val) => {
    const a = st * i - Math.PI / 2;
    return { x: cx + (val / 100) * r * Math.cos(a), y: cy + (val / 100) * r * Math.sin(a) };
  };
  const pts = v.map((val, i) => pt(i, val));
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      {[25, 50, 75, 100].map(l => <polygon key={l} points={k.map((_, i) => { const p = pt(i, l); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke={P.border} strokeWidth="0.5" />)}
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill="rgba(255,107,74,0.2)" stroke={P.accent} strokeWidth="1.5" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={P.accent} />)}
      {k.map((label, i) => { const p = pt(i, 128); return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill={P.muted} fontFamily="monospace">{label}</text>; })}
    </svg>
  );
}

function SkillBar({ skill, delay }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.74rem", width: 115, flexShrink: 0, color: P.text }}>{skill.n}</span>
      <div style={{ flex: 1, height: 5, background: P.bgAlt, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, background: P.grad, width: v ? `${skill.lv}%` : "0%", transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}s` }} />
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.66rem", color: P.accent, width: 32, textAlign: "right" }}>{skill.lv}%</span>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════ */
export default function App() {
  const [active, setActive] = useState(0);
  const [matrix, setMatrix] = useState(false);
  const [eggC, setEggC] = useState(0);
  const [brainRegion, setBrainRegion] = useState(null);
  const brainRegionRef = useRef(null);
  const [caseStudy, setCaseStudy] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoIn, setDemoIn] = useState("");
  const [demoRes, setDemoRes] = useState(null);
  const [demoIdx, setDemoIdx] = useState(0);
  const containerRef = useRef(null);
  const scrollLock = useRef(false);
  const typed = useTypewriter(["Data Scientist.", "ML Engineer.", "Problem Solver.", "Hackathon Winner.", "AI Researcher."]);

  const handleBrainClick = (idx) => {
    const next = brainRegion === idx ? null : idx;
    setBrainRegion(next);
    brainRegionRef.current = next;
  };

  // Snap scroll via wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wh = (e) => {
      if (scrollLock.current) return;
      e.preventDefault();
      const d = e.deltaY > 0 ? 1 : -1;
      const n = Math.max(0, Math.min(SECS.length - 1, active + d));
      if (n !== active) {
        scrollLock.current = true;
        setActive(n);
        setTimeout(() => { scrollLock.current = false; }, 850);
      }
    };
    el.addEventListener("wheel", wh, { passive: false });
    return () => el.removeEventListener("wheel", wh);
  }, [active]);

  // Touch
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    let sy = 0;
    const ts = (e) => { sy = e.touches[0].clientY; };
    const te = (e) => {
      if (scrollLock.current) return;
      const d = sy - e.changedTouches[0].clientY;
      if (Math.abs(d) > 50) {
        const dir = d > 0 ? 1 : -1;
        const n = Math.max(0, Math.min(SECS.length - 1, active + dir));
        if (n !== active) { scrollLock.current = true; setActive(n); setTimeout(() => { scrollLock.current = false; }, 850); }
      }
    };
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchend", te, { passive: true });
    return () => { el.removeEventListener("touchstart", ts); el.removeEventListener("touchend", te); };
  }, [active]);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (scrollLock.current) return;
      let n = active;
      if (e.key === "ArrowDown") n = Math.min(SECS.length - 1, active + 1);
      else if (e.key === "ArrowUp") n = Math.max(0, active - 1);
      if (n !== active) { scrollLock.current = true; setActive(n); setTimeout(() => { scrollLock.current = false; }, 850); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [active]);

  const goTo = (i) => { if (!scrollLock.current) { scrollLock.current = true; setActive(i); setTimeout(() => { scrollLock.current = false; }, 850); } };
  const logoClick = () => { const n = eggC + 1; setEggC(n); if (n >= 5) { setMatrix(true); setEggC(0); } };
  const runClass = (t) => setDemoRes(classify(t || demoIn));
  const tryEx = () => { const m = DEMO_MSGS[demoIdx % DEMO_MSGS.length]; setDemoIn(m); setDemoRes(classify(m)); setDemoIdx(demoIdx + 1); };

  const st = {
    tag: { display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: "0.66rem", fontWeight: 600, background: P.glow, color: P.accent, fontFamily: "monospace", letterSpacing: "0.03em" },
    card: { background: P.card, borderRadius: 14, border: `1px solid ${P.border}`, padding: "1.4rem", backdropFilter: "blur(12px)", transition: "all 0.3s" },
    hd: { fontFamily: "'Playfair Display',serif", fontWeight: 700 },
    mn: { fontFamily: "'IBM Plex Mono',monospace" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}html,body{overflow:hidden;height:100%}
        ::selection{background:rgba(255,107,74,0.3);color:#FF6B4A}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes glow{0%,100%{box-shadow:0 0 6px rgba(255,107,74,0.3)}50%{box-shadow:0 0 20px rgba(255,107,74,0.5)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .scr::-webkit-scrollbar{width:3px}.scr::-webkit-scrollbar-thumb{background:rgba(255,107,74,0.2);border-radius:2px}.scr::-webkit-scrollbar-track{background:transparent}
      `}</style>

      {matrix && <MatrixOverlay onClose={() => setMatrix(false)} />}

      <div ref={containerRef} style={{ width: "100vw", height: "100vh", background: P.bg, color: P.text, fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" }}>

        {/* NAV DOTS */}
        <div style={{ position: "fixed", right: 14, top: "50%", transform: "translateY(-50%)", zIndex: 100, display: "flex", flexDirection: "column", gap: 10 }}>
          {SECS.map((sec, i) => (
            <div key={i} onClick={() => goTo(i)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexDirection: "row-reverse" }}>
              <div style={{ width: active === i ? 10 : 5, height: active === i ? 10 : 5, borderRadius: "50%", transition: "all 0.4s", background: active === i ? P.accent : "rgba(255,255,255,0.15)", boxShadow: active === i ? `0 0 10px ${P.glow}` : "none" }} />
              <span style={{ ...st.mn, fontSize: "0.58rem", color: active === i ? P.accent : "transparent", transition: "all 0.4s", whiteSpace: "nowrap" }}>{sec}</span>
            </div>
          ))}
        </div>

        {/* TOP BAR */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0.65rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(7,7,14,0.65)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${P.border}` }}>
          <div onClick={logoClick} style={{ ...st.mn, fontWeight: 700, fontSize: "1rem", cursor: "pointer", background: P.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{"<AK />"}</div>
          <div style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            {SECS.map((sec, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ padding: "4px 9px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: "0.7rem", fontFamily: "'DM Sans'", fontWeight: active === i ? 600 : 400, background: active === i ? P.glow : "transparent", color: active === i ? P.accent : P.muted, transition: "all 0.3s" }}>{sec}</button>
            ))}
          </div>
        </div>

        {/* SECTIONS */}
        <div style={{ transform: `translateY(-${active * 100}vh)`, transition: "transform 0.8s cubic-bezier(0.76,0,0.24,1)", height: `${SECS.length * 100}vh` }}>

          {/* HOME */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", padding: "0 2rem" }}>
            <div style={{ display: "flex", width: "100%", maxWidth: 1050, margin: "0 auto", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", paddingTop: "3rem" }}>
              <div style={{ flex: "1 1 340px", minWidth: 280 }}>
                <Rv>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 12px", borderRadius: 20, background: P.glow, border: `1px solid ${P.border}`, marginBottom: "1rem" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: P.green, animation: "pulse 2s infinite" }} />
                    <span style={{ ...st.mn, fontSize: "0.66rem", color: P.accent, fontWeight: 600 }}>Open to Work — DS / ML</span>
                  </div>
                </Rv>
                <Rv delay={0.08}><p style={{ ...st.mn, fontSize: "0.76rem", color: P.muted, marginBottom: 5 }}>Hey there, I'm</p></Rv>
                <Rv delay={0.12}><h1 style={{ ...st.hd, fontSize: "clamp(1.9rem,4.2vw,3.2rem)", lineHeight: 1.08, marginBottom: 8 }}>Atharva<br /><span style={{ color: P.accent }}>Kocharekar</span></h1></Rv>
                <Rv delay={0.2}><div style={{ ...st.mn, fontSize: "clamp(0.82rem,1.4vw,1rem)", marginBottom: "1rem", height: "1.4rem" }}><span style={{ color: P.accent }}>{">"}</span> {typed}<span style={{ animation: "pulse 1s infinite", color: P.accent }}>|</span></div></Rv>
                <Rv delay={0.25}><p style={{ color: P.muted, fontSize: "0.82rem", lineHeight: 1.85, maxWidth: 440, marginBottom: "0.5rem" }}>A Data Scientist who's always tried to be <span style={{ color: P.accent }}>statistically correct</span> — focusing not just on building models, but on understanding <em>why</em> they behave the way they do. The real value of analytics lies in making complex findings <span style={{ color: P.accent }}>clear and actionable</span> for the people who need them most.</p></Rv>
                <Rv delay={0.35}><p style={{ ...st.mn, fontSize: "0.72rem", color: P.muted, opacity: 0.7 }}>MSc AI @ Dublin City University • Someone who understands the problem before jumping to a solution.</p></Rv>
              </div>
              <div style={{ flex: "1 1 340px", minWidth: 280, height: "min(52vh,440px)", position: "relative" }}>
                <Brain3D onRegionClick={handleBrainClick} activeRegionRef={brainRegionRef} />
                {brainRegion !== null && (
                  <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: P.card, border: `1px solid ${BRAIN_REGIONS[brainRegion].color}40`, borderRadius: 12, padding: "10px 16px", backdropFilter: "blur(12px)", maxWidth: 300, width: "92%", animation: "fadeUp 0.3s ease", zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: BRAIN_REGIONS[brainRegion].color }} />
                      <span style={{ ...st.hd, fontSize: "0.82rem" }}>{BRAIN_REGIONS[brainRegion].name}</span>
                    </div>
                    <p style={{ color: P.muted, fontSize: "0.72rem", marginBottom: 5 }}>{BRAIN_REGIONS[brainRegion].desc}</p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {BRAIN_REGIONS[brainRegion].skills.map((sk, j) => <span key={j} style={{ ...st.tag, background: `${BRAIN_REGIONS[brainRegion].color}20`, color: BRAIN_REGIONS[brainRegion].color }}>{sk}</span>)}
                    </div>
                  </div>
                )}
                <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", ...st.mn, fontSize: "0.58rem", color: P.muted, opacity: 0.5 }}>drag to rotate • click glowing regions</div>
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 860, width: "100%", padding: "4.5rem 2rem 2rem" }}>
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// about</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: "1.4rem" }}>The <span style={{ color: P.accent }}>Story</span> So Far</h2></Rv>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))", gap: "0.8rem" }}>
                {[
                  { i: "🧠", t: "Who I Am", d: "DS & ML Engineer focused on why models behave — optimizing for useful insights." },
                  { i: "🎓", t: "Education", d: "MSc AI — DCU Ireland\nB.E. AI & DS — TEC Mumbai" },
                  { i: "💼", t: "Experience", d: "Student Ambassador\nData Science Engineer\nPython Developer" },
                  { i: "🏆", t: "Wins", d: "AWS Hackathon Winner (Dublin)\nShortlisted Top 5/80 — Federated Learning on Diabetic Retinopathy (XAI GradCAM)\nIntl. Research Conference" }
                ].map((c, i) => (
                  <Rv key={i} delay={i * 0.07}><div style={{ ...st.card, height: "100%" }}><div style={{ fontSize: "1.3rem", marginBottom: 5 }}>{c.i}</div><div style={{ ...st.hd, fontSize: "0.85rem", marginBottom: 4 }}>{c.t}</div><p style={{ color: P.muted, fontSize: "0.76rem", lineHeight: 1.7, whiteSpace: "pre-line" }}>{c.d}</p></div></Rv>
                ))}
              </div>
              <Rv delay={0.35}><div style={{ ...st.card, marginTop: "0.8rem", background: "rgba(8,8,14,0.9)", ...st.mn, fontSize: "0.68rem", lineHeight: 2, color: P.accent, padding: "0.8rem 1.1rem" }}>
                <span style={{ opacity: 0.35 }}>// config</span><br />
                {"{"} location: <span style={{ color: "#7EC8A0" }}>"Dublin"</span>, passion: <span style={{ color: "#7EC8A0" }}>"clarity over complexity"</span>, coffee: <span style={{ color: "#FFB347" }}>Infinity</span> {"}"}
              </div></Rv>
            </div>
          </section>

          {/* PROJECTS */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 860, width: "100%", padding: "4.5rem 2rem 2rem", overflowY: "auto", maxHeight: "100vh" }} className="scr">
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// projects</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: "1.1rem" }}>Featured <span style={{ color: P.accent }}>Work</span></h2></Rv>
              {PROJECTS.map((p, i) => (
                <Rv key={i} delay={i * 0.1}>
                  <div style={{ ...st.card, marginBottom: "0.8rem", borderLeft: `3px solid ${p.color}`, display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                        <span style={{ ...st.hd, fontSize: "0.92rem" }}>{p.title}</span>
                        <span style={{ ...st.tag, background: `${p.color}22`, color: p.color }}>{p.badge}</span>
                      </div>
                      <p style={{ color: P.muted, fontSize: "0.76rem", lineHeight: 1.7, marginBottom: 6 }}>{p.desc}</p>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: p.hasCase ? 7 : 0 }}>{p.tech.map((t, j) => <span key={j} style={st.tag}>{t}</span>)}</div>
                      {p.hasCase && <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => setCaseStudy(!caseStudy)} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${P.accent}`, background: caseStudy ? P.accent : "transparent", color: caseStudy ? "#fff" : P.accent, cursor: "pointer", fontSize: "0.68rem", fontWeight: 600, ...st.mn }}>{caseStudy ? "Hide" : "🧠 Case Study"}</button>
                        <button onClick={() => setShowDemo(!showDemo)} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${P.accent2}`, background: showDemo ? P.accent2 : "transparent", color: showDemo ? "#fff" : P.accent2, cursor: "pointer", fontSize: "0.68rem", fontWeight: 600, ...st.mn }}>{showDemo ? "Hide" : "⚡ Demo"}</button>
                      </div>}
                    </div>
                    {p.metrics && <Radar m={p.metrics} />}
                  </div>
                </Rv>
              ))}
              {caseStudy && <Rv><div style={{ ...st.card, borderTop: `2px solid ${P.accent}`, marginBottom: "0.8rem" }}>
                <div style={{ ...st.hd, fontSize: "0.88rem", marginBottom: "0.9rem" }}>🧠 <span style={{ color: P.accent }}>How I Think</span></div>
                <div style={{ paddingLeft: "1.2rem", position: "relative" }}>
                  <div style={{ position: "absolute", left: 4, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom,${P.accent},transparent)` }} />
                  {CASE_STEPS.map((s2, i) => <div key={i} style={{ marginBottom: "0.8rem", position: "relative" }}>
                    <div style={{ position: "absolute", left: "-1.2rem", top: 2, width: 11, height: 11, borderRadius: "50%", background: P.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.35rem" }}>{s2.i}</div>
                    <div style={{ ...st.hd, fontSize: "0.76rem", marginBottom: 2 }}>{s2.p}</div>
                    <p style={{ color: P.muted, fontSize: "0.72rem", lineHeight: 1.7 }}>{s2.d}</p>
                  </div>)}
                </div>
              </div></Rv>}
              {showDemo && <Rv><div style={{ ...st.card, borderTop: `2px solid ${P.accent2}`, marginBottom: "0.8rem" }}>
                <div style={{ ...st.hd, fontSize: "0.88rem", marginBottom: 3 }}>⚡ Spam Classifier <span style={{ color: P.accent2 }}>Demo</span></div>
                <p style={{ color: P.muted, fontSize: "0.7rem", marginBottom: "0.7rem" }}>Simplified TF-IDF + SVC simulation</p>
                <div style={{ display: "flex", gap: 5, marginBottom: "0.6rem", flexWrap: "wrap" }}>
                  <input value={demoIn} onChange={e => { setDemoIn(e.target.value); setDemoRes(null); }} placeholder="Type an SMS..." onKeyDown={e => e.key === "Enter" && runClass()} style={{ flex: 1, minWidth: 150, padding: "6px 10px", borderRadius: 7, border: `1px solid ${P.border}`, background: P.bgAlt, color: P.text, fontSize: "0.78rem", outline: "none", fontFamily: "'DM Sans'" }} />
                  <button onClick={() => runClass()} style={{ padding: "6px 13px", borderRadius: 7, border: "none", background: P.grad, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "0.76rem" }}>Classify</button>
                  <button onClick={tryEx} style={{ padding: "6px 13px", borderRadius: 7, border: `1px solid ${P.border}`, background: "transparent", color: P.text, cursor: "pointer", fontSize: "0.76rem" }}>Example</button>
                </div>
                {demoRes && <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", animation: "fadeUp 0.3s" }}>
                  <div style={{ ...st.card, flex: "0 0 90px", textAlign: "center", border: `2px solid ${demoRes.pred === "spam" ? P.red : P.green}30`, padding: "0.7rem" }}>
                    <div style={{ fontSize: "1.4rem" }}>{demoRes.pred === "spam" ? "🚫" : "✅"}</div>
                    <div style={{ ...st.mn, fontWeight: 700, color: demoRes.pred === "spam" ? P.red : P.green, textTransform: "uppercase", fontSize: "0.78rem" }}>{demoRes.pred}</div>
                    <div style={{ color: P.muted, fontSize: "0.62rem", ...st.mn }}>{demoRes.conf}%</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ ...st.mn, fontSize: "0.66rem", marginBottom: 4 }}>Features:</div>
                    {demoRes.feats.length ? <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{demoRes.feats.map((f, i) => <span key={i} style={{ ...st.tag, background: `${P.red}20`, color: P.red }}>{f}</span>)}</div> : <p style={{ color: P.muted, fontSize: "0.72rem" }}>No spam signals.</p>}
                    <div style={{ height: 4, background: P.bgAlt, borderRadius: 2, overflow: "hidden", marginTop: 7 }}><div style={{ height: "100%", width: `${demoRes.conf}%`, background: `linear-gradient(90deg,${P.green},${P.yellow},${P.red})`, borderRadius: 2, transition: "width 0.5s" }} /></div>
                  </div>
                </div>}
              </div></Rv>}
            </div>
          </section>

          {/* SKILLS */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 860, width: "100%", padding: "4.5rem 2rem 2rem", overflowY: "auto", maxHeight: "100vh" }} className="scr">
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// skills</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: "1.4rem" }}>Tech <span style={{ color: P.accent }}>Arsenal</span></h2></Rv>
              {[{ k: "lang", l: "💻 Languages" }, { k: "ml", l: "🤖 ML & AI" }, { k: "data", l: "📊 Data & BI" }, { k: "cloud", l: "☁️ Cloud" }].map((cat, ci) => (
                <Rv key={cat.k} delay={ci * 0.06}><div style={{ marginBottom: "1.3rem" }}>
                  <div style={{ ...st.hd, fontSize: "0.82rem", marginBottom: "0.6rem" }}>{cat.l}</div>
                  {SKILLS.filter(sk => sk.c === cat.k).map((sk, si) => <SkillBar key={si} skill={sk} delay={ci * 0.06 + si * 0.03} />)}
                </div></Rv>
              ))}
            </div>
          </section>

          {/* JOURNEY */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 720, width: "100%", padding: "4.5rem 2rem 2rem", overflowY: "auto", maxHeight: "100vh" }} className="scr">
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// journey</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: 4 }}>The <span style={{ color: P.accent }}>Path</span> I'm On</h2></Rv>
              <Rv delay={0.08}><p style={{ color: P.muted, fontSize: "0.8rem", marginBottom: "1.5rem" }}>Where I've been, where I'm going — and the mindset driving it all.</p></Rv>
              <div style={{ position: "relative", paddingLeft: "2.5rem" }}>
                <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom,${P.accent},${P.accent}10)` }} />
                {JOURNEY.map((j, i) => (
                  <Rv key={i} delay={i * 0.1} dir="left">
                    <div style={{ marginBottom: "1.2rem", position: "relative" }}>
                      <div style={{ position: "absolute", left: "-2.5rem", top: 4, width: 22, height: 22, borderRadius: "50%", background: i === JOURNEY.length - 1 ? P.accent : P.card, border: `2px solid ${j.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", zIndex: 1, animation: i === JOURNEY.length - 1 ? "glow 2s infinite" : "none" }}>{j.icon}</div>
                      <div style={{ ...st.card, borderLeft: `3px solid ${j.color}` }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ ...st.tag, background: `${j.color}20`, color: j.color }}>{j.year}</span>
                          <span style={{ ...st.hd, fontSize: "0.88rem" }}>{j.title}</span>
                          <span style={{ color: P.muted, fontSize: "0.68rem", ...st.mn }}>— {j.place}</span>
                        </div>
                        <p style={{ color: P.muted, fontSize: "0.76rem", lineHeight: 1.7, marginBottom: 5 }}>{j.text}</p>
                        <div style={{ ...st.mn, fontSize: "0.7rem", color: j.color, fontStyle: "italic", opacity: 0.85 }}>"{j.mindset}"</div>
                      </div>
                    </div>
                  </Rv>
                ))}
              </div>
            </div>
          </section>

          {/* BLOG */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 750, width: "100%", padding: "4.5rem 2rem 2rem" }}>
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// blog</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: "1.1rem" }}>Thoughts & <span style={{ color: P.accent }}>Writings</span></h2></Rv>
              {BLOGS.map((b, i) => (
                <Rv key={i} delay={i * 0.1}><div style={{ ...st.card, marginBottom: "0.7rem", borderLeft: `3px solid ${b.color}`, cursor: "pointer", transition: "transform 0.3s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(5px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center" }}><span style={{ ...st.mn, fontSize: "0.63rem", color: P.muted }}>{b.time}</span>{b.tags.map((t, j) => <span key={j} style={st.tag}>{t}</span>)}</div>
                  <div style={{ ...st.hd, fontSize: "0.88rem", marginBottom: 4 }}>{b.title}</div>
                  <p style={{ color: P.muted, fontSize: "0.76rem", lineHeight: 1.7 }}>{b.excerpt}</p>
                </div></Rv>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 620, width: "100%", padding: "4.5rem 2rem 2rem", textAlign: "center" }}>
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// contact</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: 4 }}>Let's <span style={{ color: P.accent }}>Connect</span></h2></Rv>
              <Rv delay={0.08}><p style={{ color: P.muted, fontSize: "0.82rem", marginBottom: "1.3rem" }}>Open to DS & ML roles. Let's build something impactful.</p></Rv>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))", gap: "0.6rem", textAlign: "left" }}>
                {[
                  { i: "📧", l: "Email", v: "atharvakocharekar0@gmail.com", h: "mailto:atharvakocharekar0@gmail.com" },
                  { i: "💼", l: "LinkedIn", v: "atharva-kocharekar", h: "https://linkedin.com/in/atharva-kocharekar-3512b4224" },
                  { i: "🐙", l: "GitHub", v: "Atharvax16", h: "https://github.com/Atharvax16" },
                  { i: "📱", l: "Phone", v: "+353 899607779", h: "tel:+353899607779" },
                ].map((c, i) => (
                  <Rv key={i} delay={i * 0.06}><a href={c.h} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}><div style={{ ...st.card, display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => { e.currentTarget.style.borderColor = P.accent; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.transform = "none"; }}>
                    <span style={{ fontSize: "1.1rem" }}>{c.i}</span><div><div style={{ ...st.mn, fontSize: "0.6rem", color: P.muted }}>{c.l}</div><div style={{ color: P.text, fontWeight: 500, fontSize: "0.78rem" }}>{c.v}</div></div>
                  </div></a></Rv>
                ))}
              </div>
              <Rv delay={0.3}><button style={{ marginTop: "1.5rem", padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer", background: P.grad, color: "#fff", fontWeight: 600, fontSize: "0.88rem", fontFamily: "'DM Sans'", boxShadow: `0 4px 20px ${P.glow}`, transition: "transform 0.2s" }} onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "none"}>📄 Download Resume</button></Rv>
              <Rv delay={0.35}><div style={{ marginTop: "1.8rem", paddingTop: "0.9rem", borderTop: `1px solid ${P.border}` }}>
                <p style={{ ...st.mn, fontSize: "0.65rem", color: P.muted }}>Built by <span style={{ color: P.accent }}>Atharva Kocharekar</span> • 2026</p>
                <p style={{ ...st.mn, fontSize: "0.55rem", color: P.muted, opacity: 0.4, marginTop: 3 }}>Logo × 5 = 🔮</p>
              </div></Rv>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   MATRIX EASTER EGG
   ════════════════════════════════════════ */
function MatrixOverlay({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const ch = "01アイウ∂∆∑πΩMLAI";
    const fs = 14;
    const cols = Math.floor(c.width / fs);
    const dr = Array(cols).fill(1);
    const draw = () => {
      ctx.fillStyle = "rgba(7,7,14,0.05)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#FF6B4A";
      ctx.font = fs + "px monospace";
      for (let i = 0; i < dr.length; i++) {
        ctx.globalAlpha = Math.random() * 0.5 + 0.3;
        ctx.fillText(ch[Math.floor(Math.random() * ch.length)], i * fs, dr[i] * fs);
        if (dr[i] * fs > c.height && Math.random() > 0.975) dr[i] = 0;
        dr[i]++;
      }
      ctx.globalAlpha = 1;
    };
    const iv = setInterval(draw, 40);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, cursor: "pointer" }} onClick={onClose}>
      <canvas ref={ref} style={{ display: "block" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: P.accent, fontFamily: "'IBM Plex Mono',monospace", fontSize: "1.2rem", textAlign: "center", background: "rgba(7,7,14,0.75)", padding: "1.5rem 2.5rem", borderRadius: 12, backdropFilter: "blur(8px)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🔮</div>
        Easter Egg Found!
        <div style={{ fontSize: "0.75rem", marginTop: 5, opacity: 0.6 }}>Click anywhere to exit</div>
      </div>
    </div>
  );
}
