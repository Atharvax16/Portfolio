import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

/* ════════════════════════════════════════
   PALETTE
   ════════════════════════════════════════ */
const P = {
  bg: "#07070E", bgAlt: "#0D0D18", text: "#EAE8E2", muted: "#7A7A90",
  accent: "#FF6B4A", accent2: "#FFB347", glow: "rgba(255,107,74,0.18)",
  card: "rgba(16,16,28,0.85)", border: "rgba(255,107,74,0.1)",
  green: "#4ADE80", red: "#F87171", yellow: "#FBBF24",
  blue: "#60A5FA", purple: "#C084FC", pink: "#F472B6",
  grad: "linear-gradient(135deg,#FF6B4A,#FFB347)",
};

const SECS = ["Home", "About", "Projects", "Skills", "Journey", "Gallery", "Contact"];

/* ════════════════════════════════════════
   DATA
   ════════════════════════════════════════ */
const BRAIN_REGIONS = [
  { name: "Frontal Lobe", pos: [0, 1.5, 1.1], skills: ["NLP / LLMs", "Deep Learning", "Problem Solving"], desc: "Higher-order thinking & language models", color: "#FF6B4A" },
  { name: "Parietal Lobe", pos: [0, 1.7, -0.5], skills: ["Data Visualization", "Spatial Analysis", "Power BI"], desc: "Sensory data & visual analytics", color: "#FFB347" },
  { name: "Temporal Lobe", pos: [1.7, 0.3, 0.3], skills: ["Pattern Recognition", "NLP", "Sequential Data"], desc: "Language & sequential patterns", color: "#4ADE80" },
  { name: "Occipital Lobe", pos: [0, 0.7, -1.5], skills: ["Computer Vision", "CNN", "Image Classification"], desc: "Visual processing & recognition", color: "#60A5FA" },
  { name: "Cerebellum", pos: [0, -0.7, -1.1], skills: ["Reinforcement Learning", "Model Tuning", "Optimization"], desc: "Precision & model coordination", color: "#C084FC" },
  { name: "Brain Stem", pos: [0, -1.3, 0], skills: ["Python", "SQL", "Core Fundamentals"], desc: "Foundation everything runs on", color: "#F472B6" },
];

const JOURNEY = [
  { year: "2021", title: "The Spark", place: "TEC Mumbai", text: "Started B.E. in AI & Data Science. Fell in love with why data tells stories.", mindset: "Learn everything. Question everything.", icon: "🔥", color: "#F472B6" },
  { year: "2023", title: "First Impact", place: "Data Science Intern", text: "Built production-grade ML pipelines. Learned that clean data > clever models.", mindset: "Ship things. Break things. Fix things.", icon: "🚀", color: "#FFB347" },
  { year: "2024", title: "Going Global", place: "Dublin, Ireland", text: "MSc in Artificial Intelligence at DCU. Exposed to cutting-edge research and global hackathons.", mindset: "Think bigger. Compete harder.", icon: "🌍", color: "#4ADE80" },
  { year: "2025", title: "Hackathon Season", place: "AWS / MotivaLogic / AdvanceHealth", text: "Won MotivaLogic Hackathon (AWS-sponsored), ranked 3rd of 70 teams at Ireland's first MedTech Hackathon at Trinity College Dublin. Built real solutions under pressure.", mindset: "Build under pressure. Deliver under fire.", icon: "🏆", color: "#60A5FA" },
  { year: "2026", title: "What's Next", place: "The World", text: "Seeking DS/ML roles where I can solve real problems. Looking for teams that value clarity, curiosity, and impact.", mindset: "Stay hungry. Stay honest.", icon: "✨", color: "#FF6B4A" },
];

const SKILLS = [
  { n: "Python", lv: 92, c: "lang" }, { n: "SQL", lv: 85, c: "lang" }, { n: "R", lv: 70, c: "lang" }, { n: "JavaScript", lv: 68, c: "lang" },
  { n: "TensorFlow / Keras", lv: 88, c: "ml" }, { n: "PyTorch", lv: 82, c: "ml" }, { n: "Scikit-Learn", lv: 90, c: "ml" }, { n: "Hugging Face", lv: 75, c: "ml" },
  { n: "Power BI", lv: 80, c: "data" }, { n: "Pandas / NumPy", lv: 92, c: "data" }, { n: "Tableau", lv: 72, c: "data" },
  { n: "AWS (SageMaker)", lv: 78, c: "cloud" }, { n: "Docker", lv: 65, c: "cloud" },
];

/* Each project doubles as a mini research paper: it powers both the card
   and the case-study modal (Abstract / Method / Results).
   Projects flagged `placeholder: true` contain TODO fields — replace the
   TODO text/numbers with your real details and the draft banner disappears. */
const PROJECTS = [
  {
    id: "catas",
    title: "CATAS — Compliance & Treasury Agents",
    badge: "Multi-Agent · Lyzr Hackathon",
    year: "2025",
    role: "Architect · agent design",
    color: "#C084FC",
    short: "A dual-agent system automating treasury reconciliation and compliance, grounding LLM reasoning in deterministic ML.",
    tech: ["Python", "Lyzr", "Isolation Forest", "Prophet", "Logistic Regression"],
    keywords: ["multi-agent systems", "LLM grounding", "anomaly detection", "RegTech"],
    abstract: "CATAS (Compliance And Treasury Agentic Solutions) is a Python-orchestrated dual-agent framework built for the Lyzr Architect Hackathon to dissolve the reconciliation bottleneck, the audit-trail gap, and the treasury–compliance silo. Rather than trusting an LLM to reason unaided, each agent grounds its decisions in deterministic offline ML: a Treasury agent (Isolation Forest anomaly detection + Prophet time-series forecasting) and a Compliance agent (logistic-regression EU-sanction filtering + immutable audit-log generation).",
    architecture: "User → orchestrator → Agent 1 Treasury (Isolation Forest + Prophet) ‖ Agent 2 Compliance (LogReg sanctions + immutable audit log) → grounded LLM response",
    method: [
      { p: "Problem", i: "🏦", d: "Treasury and compliance live in silos — manual reconciliation is slow and audit trails are incomplete." },
      { p: "Design", i: "🧩", d: "A dual-agent architecture: one agent owns treasury ops, the other owns compliance, coordinated by a Python orchestrator." },
      { p: "Ground", i: "⚓", d: "Deterministic offline ML (.pkl models) grounds the LLM so outputs stay auditable, not hallucinated." },
      { p: "Treasury", i: "📈", d: "Isolation Forest flags anomalous cash movements; Prophet forecasts treasury positions." },
      { p: "Comply", i: "⚖️", d: "Logistic regression screens EU sanctions and every action is written to an immutable audit log." },
    ],
    metrics: null,
    findings: [
      { label: "Agents", value: "2", note: "Treasury + Compliance, orchestrated" },
      { label: "ML grounding", value: "3 models", note: "Isolation Forest · Prophet · LogReg" },
      { label: "Audit", value: "immutable", note: "every action logged" },
    ],
    plots: [],
    links: { github: "https://github.com/Atharvax16/CATAS---Compilance-and-Treasury-Agentic-Solution" },
  },
  {
    id: "cyberattack",
    title: "CPU-Based Cyberattack Detection",
    badge: "AWS Hackathon Winner",
    year: "2025",
    role: "Lead · modeling & deployment",
    color: "#FF6B4A",
    short: "Detecting cyberattacks & fraud from CPU-usage telemetry, with a real-time alerting pipeline on AWS.",
    tech: ["Python", "AWS SageMaker", "Random Forest", "Lambda", "SNS"],
    keywords: ["anomaly detection", "telemetry", "MLOps", "real-time alerting"],
    abstract: "We frame intrusion and fraud detection as an anomaly-classification problem over host CPU-usage logs. A Random Forest classifier trained on labelled temporal signatures flags attack patterns in streaming telemetry, deployed end-to-end on AWS SageMaker with a Lambda + SNS path for near real-time alerting. The system is deliberately tuned toward recall — a missed attack is treated as far costlier than a false alarm.",
    architecture: "CPU logs → feature extraction (rolling stats, temporal deltas) → Random Forest on SageMaker endpoint → Lambda threshold gate → SNS alert",
    method: [
      { p: "Define", i: "🎯", d: "Stakeholders wanted fewer false negatives — missing an attack costs more than a false alarm." },
      { p: "Explore", i: "🔍", d: "Cross-checked multi-source CPU telemetry and found temporal anomaly signatures preceding attacks." },
      { p: "Model", i: "⚙️", d: "Random Forest beat Isolation Forest at 98% accuracy on labelled patterns." },
      { p: "Evaluate", i: "📊", d: "Tuned the precision/recall trade-off toward recall to minimise missed attacks." },
      { p: "Deploy", i: "🚀", d: "SageMaker endpoint + Lambda + SNS — a production-ready real-time pipeline." },
    ],
    metrics: { Accuracy: 98, Precision: 79, Recall: 78, F1: 78 },
    findings: [
      { label: "Accuracy", value: "98%", note: "held-out test set" },
      { label: "Recall", value: "78%", note: "optimised over precision by design" },
      { label: "Alerting", value: "real-time", note: "Lambda + SNS path" },
    ],
    plots: [{ src: "/images/plots/anomaly-cpu-usage.png", caption: "Synthetic CPU usage with injected anomaly spikes" }],
    links: { github: "https://github.com/Atharvax16/Cyberattack-Detection-using-CPU-Usage-Logs-Alert-System" },
  },
  {
    id: "retinopathy-fl",
    title: "Federated Diabetic Retinopathy",
    badge: "3rd / 70 Teams",
    year: "2025",
    role: "ML & explainability",
    color: "#4ADE80",
    short: "Privacy-preserving deep learning for retinal screening, with Grad-CAM explainability.",
    tech: ["PyTorch", "ResNet-50", "Grad-CAM", "Federated Learning"],
    keywords: ["federated learning", "medical imaging", "explainable AI", "privacy"],
    abstract: "Built at Trinity College Dublin's AdvanceHealth MedTech Hackathon, this system grades diabetic retinopathy from retinal fundus images without centralising patient data. A federated-averaging scheme keeps images on-device while training a shared ResNet-50, and Grad-CAM produces clinician-facing saliency maps for every prediction — addressing both the privacy and the trust barriers to clinical ML.",
    architecture: "Local ResNet-50 training per client → FedAvg aggregation → global model → Grad-CAM saliency overlay",
    method: [
      { p: "Problem", i: "🏥", d: "Hospitals can't pool retinal images for privacy reasons, yet each site alone has too little data." },
      { p: "Approach", i: "🔐", d: "Federated averaging trains a shared model while raw images never leave the client." },
      { p: "Backbone", i: "🧠", d: "ResNet-50 fine-tuned for diabetic-retinopathy grading." },
      { p: "Explain", i: "🔬", d: "Grad-CAM overlays reveal which retinal regions drove each grade." },
      { p: "Result", i: "🥉", d: "Placed 3rd of 70 teams; clinicians especially valued the saliency maps." },
    ],
    metrics: { Privacy: 95, Accuracy: 91, Interpret: 88, Scale: 80 },
    findings: [
      { label: "Accuracy", value: "~91%", note: "TODO: verify on held-out set" },
      { label: "Privacy", value: "on-device", note: "FedAvg — no central image store" },
      { label: "Rank", value: "3rd / 70", note: "AdvanceHealth MedTech Hackathon" },
    ],
    plots: [
      { src: "/images/plots/gradcam-retinopathy.png", caption: "Grad-CAM explainability — retinal fundus image" },
      { src: "/images/plots/fl-training-curves.png", caption: "Loss & validation accuracy over epochs" },
    ],
    links: { github: "https://github.com/Atharvax16/Federated-Learning-for-Diabetic-Retinopathy-using-XAI" },
  },
  {
    id: "cc-fraud",
    title: "Credit-Card Fraud Analysis",
    badge: "Analytics",
    year: "2024",
    role: "Solo",
    color: "#60A5FA",
    short: "Recall-first fraud detection on 1.29M+ highly imbalanced transactions.",
    tech: ["Python", "Scikit-Learn", "Pandas", "Feature Engineering"],
    keywords: ["imbalanced learning", "feature engineering", "data leakage", "target encoding"],
    abstract: "An analysis of 1.29M+ real-world credit-card transactions on a severely imbalanced dataset. K-Fold target encoding with smoothing, time-based behavioural features, and the deliberate removal of leakage-prone location signals produce a model evaluated on recall and F1 — rather than the misleading accuracy that imbalance inflates.",
    architecture: "Raw transactions → leakage audit → K-Fold target encoding (smoothed) → temporal behavioural features → classifier → recall / F1 evaluation",
    method: [
      { p: "Audit", i: "🕵️", d: "Removed location signals that leaked the label and inflated naive accuracy." },
      { p: "Encode", i: "🔢", d: "K-Fold target encoding with smoothing to handle high-cardinality categoricals without overfitting." },
      { p: "Feature", i: "⏱️", d: "Engineered time-based behavioural features per cardholder." },
      { p: "Evaluate", i: "📊", d: "Reported recall & F1 — accuracy is meaningless at this class imbalance." },
    ],
    metrics: { Recall: 88, F1: 85, Features: 92, Scale: 95 },
    findings: [
      { label: "Recall", value: "~88%", note: "TODO: verify" },
      { label: "Scale", value: "1.29M+", note: "transactions, highly imbalanced" },
      { label: "Metric", value: "F1 > Acc", note: "evaluation by design" },
    ],
    plots: [],
    links: { github: "https://github.com/Atharvax16/Credit-Card-Fraud-Analysis" },
  },
  {
    id: "venueflow",
    title: "VenueFlow — AI Wedding Coordinator",
    badge: "Build with Gemini XPRIZE",
    year: "2025",
    role: "Full-stack · agent design",
    color: "#F472B6",
    short: "An agentic AI wedding coordinator that sources vendors, drafts timelines, and tracks budgets — for couples and planners.",
    tech: ["FastAPI", "Gemini (google-genai)", "React 18 + TS", "SQLModel", "Tailwind v4"],
    keywords: ["agentic AI", "Gemini", "professional services", "full-stack"],
    abstract: "VenueFlow is an AI Wedding Coordinator built for the Build with Gemini XPRIZE (Professional Services Access). It replaces the manual work of a human planner with a layer of Gemini-powered agents — vendor sourcing, timeline drafting, budget tracking, contract review, and day-of run-of-show — sold directly to couples and to independent planners scaling their client load. Every autonomous action is written to an AgentDecisionLog, making the system's operations fully auditable as AI-native.",
    architecture: "React 18 + TS frontend → FastAPI + SQLModel API → Gemini agent layer (intake_planner → venue_matcher / supplier_matcher → quote_extractor) → AgentDecisionLog",
    method: [
      { p: "Wedge", i: "🎯", d: "Pivoted from 'AI receptionist for venues' to a couples + planners coordinator — a less-contested, higher-value wedge." },
      { p: "Intake", i: "📝", d: "intake_planner agent turns a couple's brief into a structured wedding plan." },
      { p: "Match", i: "🤝", d: "venue_matcher & supplier_matcher agents source and rank vendors against the brief." },
      { p: "Extract", i: "📄", d: "quote_extractor parses supplier quotes and contracts into structured, comparable data." },
      { p: "Audit", i: "🧾", d: "Every agent decision lands in AgentDecisionLog — the proof artifact for AI-native operations." },
    ],
    metrics: null,
    findings: [
      { label: "Agents", value: "4", note: "intake · venue · supplier · quote" },
      { label: "Pricing", value: "€299–999", note: "per wedding; €199–499/mo for planners" },
      { label: "Ops", value: "auditable", note: "AgentDecisionLog on every action" },
    ],
    plots: [
      { src: "/images/plots/venueflow/02-intake.png", caption: "Couple intake — the brief that seeds the agents" },
      { src: "/images/plots/venueflow/03-building.png", caption: "Agents assembling the wedding plan in real time" },
      { src: "/images/plots/venueflow/04-dashboard.png", caption: "The couple's wedding dashboard" },
      { src: "/images/plots/venueflow/05-dashboard-shortlist.png", caption: "Vendor shortlist produced by the matcher agents" },
      { src: "/images/plots/venueflow/p3-client-dashboard.png", caption: "Planner view — managing multiple client weddings" },
    ],
    links: {},
  },
  {
    id: "dr-xai-thesis",
    title: "Robust & Explainable AI for Diabetic Retinopathy",
    badge: "MSc Thesis · Diffusion + XAI",
    year: "2025",
    role: "Thesis · sole author",
    color: "#2DD4BF",
    short: "A 5-phase pipeline benchmarking robustness, diffusion-based restoration, and explanation faithfulness for DR screening.",
    tech: ["PyTorch + timm", "Cold Diffusion / DDPM", "SwinIR + GAN", "Captum (IG)", "ViT / ConvNeXt"],
    keywords: ["diffusion models", "explainable AI", "robustness", "medical imaging"],
    abstract: "My MSc dissertation asks two coupled questions for diabetic-retinopathy screening: how robust are modern classifiers to the degradations real fundus photos collect (motion blur, exposure error, sensor noise), and can generative restoration recover the diagnostic signal in a way we can actually trust? The answer is a five-phase pipeline — synthetic degradation, three DR graders (ResNet-50 / EfficientNet / ViT), a quantitative XAI benchmark (Integrated Gradients, SHAP, attention-rollout, Grad-CAM), several diffusion / GAN restorers, and a quality-aware router — with a pathology-preserving DDPM as the central contribution: a restorer constrained not to hallucinate lesions it cannot justify.",
    architecture: "Pristine APTOS → synthetic degradation (blur/exposure/noise × 3) → DR graders → XAI faithfulness/stability → diffusion restoration (Cold Diffusion · DDPM · SwinIR+GAN) → quality-aware router",
    method: [
      { p: "Phase 1 · Data", i: "🗂️", d: "Built a clean APTOS set plus 26,370 synthetic degraded fundus images — deterministic blur/exposure/noise operators later reused as the diffusion forward process." },
      { p: "Phase 2 · Graders", i: "🧠", d: "Trained three backbones (ResNet-50, EfficientNet, ViT) with ordinal focal loss; headline metric is quadratic-weighted kappa, then stress-tested under degradation." },
      { p: "Phase 3 · XAI", i: "🔬", d: "Scored four explanation methods quantitatively — insertion/deletion AUC for faithfulness and Spearman stability under degradation, not just pretty heatmaps." },
      { p: "Phase 4 · Restore", i: "🌀", d: "Compared Cold Diffusion, a conditional DDPM, SwinIR+GAN and a pathology-preserving DDPM on how well they recover the classifier's accuracy — the main contribution." },
      { p: "Phase 5 · Trust", i: "🧭", d: "A quality-aware ensemble routes each image: whether to enhance, which grader to trust, and which explanation to return." },
    ],
    metrics: null,
    findings: [
      { label: "Degraded set", value: "26,370", note: "synthetic blur/exposure/noise images" },
      { label: "Graders", value: "3", note: "ResNet-50 · EfficientNet · ViT" },
      { label: "Restorers", value: "7", note: "Cold Diffusion · DDPM · SwinIR+GAN · …" },
      { label: "XAI", value: "4 methods", note: "IG · SHAP · attn-rollout · Grad-CAM" },
    ],
    plots: [
      { src: "/images/plots/thesis/ddpm_forward_backward.png", caption: "Conditional DDPM — forward noising & reverse denoising of a fundus image" },
      { src: "/images/plots/thesis/cold_diffusion_forward_backward.png", caption: "Cold Diffusion — deterministic forward / backward restoration" },
      { src: "/images/plots/thesis/cold_diffusion_roundtrip_noise.png", caption: "Cold Diffusion round-trip recovery under sensor noise" },
      { src: "/images/plots/thesis/fidelity_vs_accuracy.png", caption: "Restoration fidelity vs. downstream classifier accuracy" },
      { src: "/images/plots/thesis/insertion_auc_vs_noise.png", caption: "XAI faithfulness (insertion AUC) vs. noise severity" },
      { src: "/images/plots/thesis/accuracy_vs_degradation_noise.png", caption: "Classifier robustness vs. degradation severity" },
      { src: "/images/plots/thesis/trust_score_distribution.png", caption: "Quality-aware router — trust-score distribution" },
    ],
    links: { github: "https://github.com/Atharvax16/Comparative-Study-for-Diabetic-Retinopathy-Detection-and-Interpretability-methods" },
  },
  {
    id: "research-companion",
    title: "Research Growth Companion",
    badge: "Multi-Agent · 6 Agents",
    year: "2025",
    role: "Solo · agent design",
    color: "#818CF8",
    short: "A six-agent assistant that keeps ML researchers current on papers, conferences, benchmarks, and careers.",
    tech: ["Lyzr", "gpt-4o-mini", "Python", "arXiv / Semantic Scholar"],
    keywords: ["multi-agent systems", "LLM orchestration", "research tooling"],
    abstract: "Research Growth Companion is a multi-agent AI research assistant built on the Lyzr platform. An orchestrator reads the user's intent and routes to one of five specialists — Paper Scout, Event Tracker, Benchmark Analyst, Career Advisor, and a Personalizer that learns the user's interests — then merges their outputs into a single personalized research update spanning new papers, deadlines, leaderboards, and roles.",
    architecture: "User → orchestrator (intent routing) → Paper Scout · Event Tracker · Benchmark Analyst · Career Advisor · Personalizer → Lyzr Agent API (gpt-4o-mini) → merged response",
    method: [
      { p: "Route", i: "🧭", d: "The orchestrator classifies intent and delegates to the right specialist(s), then merges their outputs." },
      { p: "Discover", i: "📚", d: "Paper Scout pulls and summarizes recent work from arXiv, Semantic Scholar, and top venues (NeurIPS, ICML, ICLR, ACL, CVPR)." },
      { p: "Track", i: "📅", d: "Event Tracker watches conferences, CFPs, and submission deadlines." },
      { p: "Compare", i: "📊", d: "Benchmark Analyst compares models on MMLU, HumanEval, MATH, GSM8K and tracks leaderboards." },
      { p: "Personalize", i: "🎯", d: "The Personalizer learns the user's interests and refines every agent's results over time." },
    ],
    metrics: null,
    findings: [
      { label: "Agents", value: "6", note: "orchestrator + 5 specialists" },
      { label: "Sources", value: "arXiv +", note: "Semantic Scholar, top venues" },
      { label: "LLM", value: "gpt-4o-mini", note: "via Lyzr Agent API" },
    ],
    plots: [],
    links: { github: "https://github.com/Atharvax16/Research-Growth-Companion---A-Multi-Agent-Research-Assistant" },
  },
  {
    id: "gait-parkinsons",
    title: "Parkinson's — Gait, Voice & Tapping",
    badge: "Multimodal Biomedical ML",
    year: "2025",
    role: "Solo",
    color: "#FFB347",
    placeholder: true,
    short: "Multimodal Parkinson's screening fusing gait, voice, and finger-tapping signals.",
    tech: ["Python", "Scikit-Learn", "Signal Processing", "Time-Series"],
    keywords: ["gait analysis", "multimodal", "biomedical ML", "time-series"],
    abstract: "A multimodal approach to Parkinson's screening that fuses three motor biomarkers — gait dynamics, sustained-phonation voice features, and finger-tapping cadence — into a single predictive pipeline. Each modality captures a complementary facet of motor impairment, so combining them aims to make detection more robust than any single signal alone.",
    architecture: "Gait / voice / tapping signals → per-modality feature extraction → fusion → classifier → Parkinson's likelihood",
    method: [
      { p: "Data", i: "🚶", d: "Three motor modalities: gait timing, voice (sustained phonation), and finger-tapping." },
      { p: "Features", i: "🎛️", d: "Per-modality features — stride/cadence, voice jitter/shimmer, tap-interval variability." },
      { p: "Fuse", i: "🔗", d: "Combine modalities so weakness in one signal is covered by the others." },
      { p: "Classify", i: "🧠", d: "Train a classifier to separate Parkinson's vs. control. TODO: confirm final model & scores." },
    ],
    metrics: null,
    findings: [
      { label: "Modalities", value: "3", note: "gait · voice · tapping" },
      { label: "Accuracy", value: "TODO", note: "add your real score" },
    ],
    plots: [],
    links: { github: "https://github.com/Atharvax16/Parkinson-Detection-using-GAIT-Voice-Tapping-Analysis" },
  },
];

const GALLERY_PHOTOS = [
  { src: "/images/hackathon-medtech-team.jpeg", caption: "3rd Place at AdvanceHealth MedTech Hackathon — Trinity College Dublin", category: "hackathon", span: "wide" },
  { src: "/images/hackathon-medtech-solo.jpeg", caption: "Ireland's First MedTech Student-Led Ideathon — Day 2", category: "hackathon", span: "tall" },
  { src: "/images/aws-cloudhight-event.jpeg", caption: "CloudHight AIOps Summit — Sponsored by AWS", category: "tech", span: "tall" },
  { src: "/images/motivalogic-hackathon.jpeg", caption: "MotivaLogic Hackathon Winner — Cloud, DevOps & AI (AWS Sponsored)", category: "hackathon", span: "tall" },
  { src: "/images/hackathon-selfie.jpeg", caption: "The hackathon squad — late nights, big ideas", category: "hackathon" },
  { src: "/images/team-project.jpeg", caption: "Team project presentation day", category: "tech" },
  { src: "/images/hackathon-venue-crowd.jpeg", caption: "Design Thinking session — Day 2 vibes", category: "hackathon", span: "wide" },
  { src: "/images/hackathon-demo-day.jpeg", caption: "Demo Day running order — 5 min to change everything", category: "hackathon" },
  { src: "/images/lstm-notes.jpeg", caption: "LSTM notes — because some things need pen and paper", category: "behind" },
  { src: "/images/portrait-sunglasses.jpeg", caption: "Dublin sun hits different when it actually shows up", category: "life", span: "tall" },
  { src: "/images/dublin-casual.jpeg", caption: "Exploring Dublin — the city that became home", category: "life", span: "tall" },
];

/* ════════════════════════════════════════
   3D NEURAL NETWORK — Three.js
   ════════════════════════════════════════ */
function NeuralNetwork3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let destroyed = false;
    const w = el.clientWidth || 500;
    const h = el.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 14);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch { return; }
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Neural network layers
    const layers = [
      { nodes: 4, x: -5, color: 0xFF6B4A, label: "Input" },
      { nodes: 6, x: -1.8, color: 0xFFB347, label: "Hidden 1" },
      { nodes: 8, x: 1.8, color: 0x4ADE80, label: "Hidden 2" },
      { nodes: 3, x: 5, color: 0x60A5FA, label: "Output" },
    ];

    const allNodes = [];
    const nodeMeshes = [];

    // Create nodes
    layers.forEach((layer) => {
      const layerNodes = [];
      const spacing = 1.4;
      const startY = -((layer.nodes - 1) * spacing) / 2;
      for (let i = 0; i < layer.nodes; i++) {
        const geo = new THREE.SphereGeometry(0.22, 16, 16);
        const mat = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: 0.85,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(layer.x, startY + i * spacing, 0);
        group.add(mesh);
        nodeMeshes.push(mesh);

        // Glow sphere
        const glowGeo = new THREE.SphereGeometry(0.38, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: 0.08,
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        glowMesh.position.copy(mesh.position);
        group.add(glowMesh);

        layerNodes.push({ mesh, glowMesh, glowMat, mat, pos: mesh.position.clone() });
      }
      allNodes.push(layerNodes);
    });

    // Create connections between layers
    const connections = [];
    for (let l = 0; l < allNodes.length - 1; l++) {
      const fromLayer = allNodes[l];
      const toLayer = allNodes[l + 1];
      fromLayer.forEach((from) => {
        toLayer.forEach((to) => {
          const points = [from.pos, to.pos];
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          const mat = new THREE.LineBasicMaterial({
            color: 0xFF6B4A,
            transparent: true,
            opacity: 0.06,
          });
          const line = new THREE.Line(geo, mat);
          group.add(line);
          connections.push({ line, mat, from: from.pos, to: to.pos });
        });
      });
    }

    // Signal particles that travel along connections
    const signals = [];
    const signalGeo = new THREE.SphereGeometry(0.08, 8, 8);
    for (let i = 0; i < 20; i++) {
      const conn = connections[Math.floor(Math.random() * connections.length)];
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFF6B4A,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(signalGeo, mat);
      mesh.visible = false;
      group.add(mesh);
      signals.push({
        mesh,
        mat,
        conn,
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.008,
        active: Math.random() > 0.6,
        delay: Math.random() * 200,
      });
    }

    // Floating particles around the network
    const particleCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pArr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pArr[i * 3] = (Math.random() - 0.5) * 16;
      pArr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pArr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pArr, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xFF6B4A, size: 0.03, transparent: true, opacity: 0.25 });
    group.add(new THREE.Points(pGeo, pMat));

    // Interaction
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let velX = 0, velY = 0;
    const onDown = (e) => { isDragging = true; const pt = e.touches ? e.touches[0] : e; prevX = pt.clientX; prevY = pt.clientY; };
    const onMove = (e) => { if (!isDragging) return; const pt = e.touches ? e.touches[0] : e; velY = (pt.clientX - prevX) * 0.004; velX = (pt.clientY - prevY) * 0.004; prevX = pt.clientX; prevY = pt.clientY; };
    const onUp = () => { isDragging = false; };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("mouseleave", onUp);
    el.addEventListener("touchstart", onDown, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onUp);

    let frame = 0;
    const animate = () => {
      if (destroyed) return;
      frame++;
      const t = frame * 0.006;

      if (!isDragging) {
        group.rotation.y += 0.0015;
        velX *= 0.96; velY *= 0.96;
      }
      group.rotation.x += velX;
      group.rotation.y += velY;

      // Pulse nodes
      allNodes.forEach((layer, li) => {
        layer.forEach((node, ni) => {
          const pulse = 1 + 0.15 * Math.sin(t * 2 + li + ni * 0.5);
          node.mesh.scale.setScalar(pulse);
          node.glowMat.opacity = 0.06 + 0.06 * Math.sin(t * 1.5 + li * 2);
        });
      });

      // Animate signals
      signals.forEach((sig) => {
        if (!sig.active) {
          sig.delay--;
          if (sig.delay <= 0) {
            sig.active = true;
            sig.t = 0;
            sig.conn = connections[Math.floor(Math.random() * connections.length)];
          }
          return;
        }
        sig.t += sig.speed;
        if (sig.t >= 1) {
          sig.active = false;
          sig.mesh.visible = false;
          sig.delay = 30 + Math.random() * 120;
          return;
        }
        sig.mesh.visible = true;
        sig.mesh.position.lerpVectors(sig.conn.from, sig.conn.to, sig.t);
        sig.mat.opacity = Math.sin(sig.t * Math.PI) * 0.9;
        // Briefly brighten the connection
        sig.conn.mat.opacity = 0.06 + Math.sin(sig.t * Math.PI) * 0.15;
      });

      // Float particles
      const positions = pGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(t + i) * 0.002;
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const nw = el.clientWidth || 500, nh = el.clientHeight || 500;
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
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />;
}

/* ════════════════════════════════════════
   3D BRAIN — Three.js
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
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { return; }
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

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

    const innerMat = new THREE.MeshBasicMaterial({ color: 0xFF6B4A, transparent: true, opacity: 0.025 });
    group.add(new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16), innerMat));

    const hotspots = [];
    BRAIN_REGIONS.forEach((reg, idx) => {
      const geo = new THREE.SphereGeometry(0.2, 12, 12);
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(reg.color), transparent: true, opacity: 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(reg.pos[0], reg.pos[1], reg.pos[2]);
      mesh.userData = { regionIdx: idx };
      group.add(mesh);
      hotspots.push({ mesh, mat });
      const gGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const gMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(reg.color), transparent: true, opacity: 0.12 });
      const gMesh = new THREE.Mesh(gGeo, gMat);
      gMesh.position.set(reg.pos[0], reg.pos[1], reg.pos[2]);
      group.add(gMesh);
    });

    let isDragging = false, prevX = 0, prevY = 0, velX = 0, velY = 0;
    const onDown = (e) => { isDragging = true; const pt = e.touches ? e.touches[0] : e; prevX = pt.clientX; prevY = pt.clientY; };
    const onMove = (e) => { if (!isDragging) return; const pt = e.touches ? e.touches[0] : e; velY = (pt.clientX - prevX) * 0.005; velX = (pt.clientY - prevY) * 0.005; prevX = pt.clientX; prevY = pt.clientY; };
    const onUp = () => { isDragging = false; };

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    const onClick = (e) => {
      const rect = el.getBoundingClientRect();
      const pt = e.changedTouches ? e.changedTouches[0] : e;
      mouseVec.x = ((pt.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((pt.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObjects(hotspots.map(h => h.mesh));
      if (hits.length > 0) onRegionClick(hits[0].object.userData.regionIdx);
    };

    el.addEventListener("mousedown", onDown); el.addEventListener("mousemove", onMove); el.addEventListener("mouseup", onUp); el.addEventListener("mouseleave", onUp);
    el.addEventListener("touchstart", onDown, { passive: true }); el.addEventListener("touchmove", onMove, { passive: true }); el.addEventListener("touchend", onUp);
    el.addEventListener("click", onClick);

    let frame = 0;
    const animate = () => {
      if (destroyed) return;
      frame++;
      const t = frame * 0.008;
      if (!isDragging) { group.rotation.y += 0.002; velX *= 0.95; velY *= 0.95; }
      group.rotation.x += velX; group.rotation.y += velY;
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

    const onResize = () => { const nw = el.clientWidth || 400, nh = el.clientHeight || 400; camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh); };
    window.addEventListener("resize", onResize);

    return () => {
      destroyed = true;
      window.removeEventListener("resize", onResize);
      el.removeEventListener("mousedown", onDown); el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseup", onUp); el.removeEventListener("mouseleave", onUp);
      el.removeEventListener("touchstart", onDown); el.removeEventListener("touchmove", onMove); el.removeEventListener("touchend", onUp); el.removeEventListener("click", onClick);
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
      if (!del) { setText(cur.slice(0, ci + 1)); if (ci + 1 === cur.length) setTimeout(() => setDel(true), 1600); else setCi(ci + 1); }
      else { setText(cur.slice(0, ci)); if (ci === 0) { setDel(false); setIdx((idx + 1) % strings.length); } else setCi(ci - 1); }
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
  const st2 = (2 * Math.PI) / k.length;
  const pt = (i, val) => { const a = st2 * i - Math.PI / 2; return { x: cx + (val / 100) * r * Math.cos(a), y: cy + (val / 100) * r * Math.sin(a) }; };
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
   PHOTO GALLERY COMPONENT
   ════════════════════════════════════════ */
function PhotoGallery() {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const categories = [
    { key: "all", label: "All" },
    { key: "hackathon", label: "Hackathons" },
    { key: "tech", label: "Tech Events" },
    { key: "life", label: "Life" },
    { key: "behind", label: "Behind the Scenes" },
  ];

  const filtered = filter === "all" ? GALLERY_PHOTOS : GALLERY_PHOTOS.filter(p => p.category === filter);

  const st = {
    mn: { fontFamily: "'IBM Plex Mono',monospace" },
    hd: { fontFamily: "'Playfair Display',serif", fontWeight: 700 },
  };

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: "1.2rem", flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat.key} onClick={() => setFilter(cat.key)} style={{
            padding: "5px 14px", borderRadius: 20, border: `1px solid ${filter === cat.key ? P.accent : P.border}`,
            background: filter === cat.key ? P.glow : "transparent",
            color: filter === cat.key ? P.accent : P.muted, cursor: "pointer",
            fontSize: "0.72rem", fontFamily: "'DM Sans'", fontWeight: 500, transition: "all 0.3s",
          }}>{cat.label}</button>
        ))}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gridAutoRows: "180px",
        gap: "0.6rem",
        maxHeight: "58vh",
        overflowY: "auto",
        paddingRight: 4,
      }} className="scr">
        {filtered.map((photo, i) => (
          <Rv key={photo.src} delay={i * 0.05}>
            <div
              onClick={() => setLightbox(photo)}
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                gridRow: photo.span === "tall" ? "span 2" : "span 1",
                gridColumn: photo.span === "wide" ? "span 2" : "span 1",
                border: `1px solid ${P.border}`,
                transition: "transform 0.3s, box-shadow 0.3s",
                height: "100%",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = `0 8px 32px ${P.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <img src={photo.src} alt={photo.caption} loading="lazy" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
              }} />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(transparent, rgba(7,7,14,0.92))",
                padding: "2rem 0.7rem 0.6rem",
              }}>
                <p style={{ color: P.text, fontSize: "0.68rem", lineHeight: 1.4, fontWeight: 500 }}>{photo.caption}</p>
              </div>
            </div>
          </Rv>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(7,7,14,0.95)", backdropFilter: "blur(20px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", padding: "2rem",
          animation: "fadeUp 0.3s ease",
        }}>
          <div style={{ maxWidth: "85vw", maxHeight: "85vh", position: "relative" }} onClick={e => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.caption} style={{
              maxWidth: "100%", maxHeight: "78vh", borderRadius: 16,
              border: `1px solid ${P.border}`, objectFit: "contain",
            }} />
            <p style={{
              textAlign: "center", marginTop: "0.8rem", color: P.text,
              fontSize: "0.85rem", ...st.mn,
            }}>{lightbox.caption}</p>
            <button onClick={() => setLightbox(null)} style={{
              position: "absolute", top: -12, right: -12,
              width: 32, height: 32, borderRadius: "50%",
              background: P.accent, border: "none", color: "#fff",
              fontSize: "1rem", cursor: "pointer", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>x</button>
          </div>
        </div>
      )}
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

/* ════════════════════════════════════════
   RESEARCH CASE-STUDY MODAL
   ════════════════════════════════════════ */
function ResearchModal({ project, onClose }) {
  const p = project;
  const [tab, setTab] = useState("abstract");
  const [plotIdx, setPlotIdx] = useState(0);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const st = {
    mn: { fontFamily: "'IBM Plex Mono',monospace" },
    hd: { fontFamily: "'Playfair Display',serif", fontWeight: 700 },
    tag: { display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: "0.64rem", fontWeight: 600, background: P.glow, color: P.accent, fontFamily: "monospace", letterSpacing: "0.03em" },
  };
  const tabs = [{ k: "abstract", l: "Abstract" }, { k: "method", l: "Method" }, { k: "results", l: "Results" }];
  const meta = ["Case Study", p.year && p.year !== "TODO" ? p.year : null, p.role && p.role !== "TODO" ? p.role : null].filter(Boolean).join(" · ");

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(5,5,11,0.86)", backdropFilter: "blur(18px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", animation: "fadeUp 0.3s ease" }}>
      <div onClick={e => e.stopPropagation()} className="scr" style={{ width: "min(760px,100%)", maxHeight: "86vh", overflowY: "auto", background: "linear-gradient(180deg,rgba(16,16,28,0.98),rgba(10,10,18,0.98))", border: `1px solid ${p.color}40`, borderTop: `3px solid ${p.color}`, borderRadius: 18, padding: "1.6rem 1.7rem 1.8rem", boxShadow: `0 30px 80px rgba(0,0,0,0.6),0 0 60px ${p.color}15` }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ ...st.mn, fontSize: "0.58rem", color: P.muted, marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>{meta}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: p.color, boxShadow: `0 0 12px ${p.color}`, flexShrink: 0 }} />
              <h2 style={{ ...st.hd, fontSize: "1.35rem", lineHeight: 1.15 }}>{p.title}</h2>
              <span style={{ ...st.tag, background: `${p.color}22`, color: p.color }}>{p.badge}</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: `1px solid ${P.border}`, color: P.text, fontSize: "1.1rem", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {p.placeholder && (
          <div style={{ ...st.mn, fontSize: "0.64rem", color: P.yellow, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, padding: "7px 11px", margin: "12px 0 2px", lineHeight: 1.6 }}>
            ⚠ Draft — placeholder content. Replace the <span style={{ color: P.accent }}>TODO</span> fields for <b>{p.title}</b> inside <span style={{ color: P.accent }}>PROJECTS</span> (src/App.jsx).
          </div>
        )}

        {p.keywords && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "12px 0 14px" }}>
            {p.keywords.map((k, i) => <span key={i} style={{ ...st.mn, fontSize: "0.62rem", color: P.muted, border: `1px solid ${P.border}`, borderRadius: 6, padding: "2px 8px" }}>{k}</span>)}
          </div>
        )}

        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${P.border}`, marginBottom: "1.1rem" }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: "8px 16px", border: "none", background: "transparent", cursor: "pointer", ...st.mn, fontSize: "0.74rem", fontWeight: 600, color: tab === t.k ? p.color : P.muted, borderBottom: `2px solid ${tab === t.k ? p.color : "transparent"}`, marginBottom: -1, transition: "all 0.25s" }}>{t.l}</button>
          ))}
        </div>

        {tab === "abstract" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <p style={{ color: P.text, fontSize: "0.84rem", lineHeight: 1.85, marginBottom: "1.1rem" }}>{p.abstract}</p>
            {p.architecture && (
              <div style={{ background: "rgba(8,8,14,0.9)", border: `1px solid ${P.border}`, borderRadius: 10, padding: "0.7rem 0.9rem", marginBottom: "1.1rem" }}>
                <div style={{ ...st.mn, fontSize: "0.56rem", color: P.muted, marginBottom: 5, opacity: 0.6 }}>// pipeline</div>
                <div style={{ ...st.mn, fontSize: "0.72rem", color: P.accent2, lineHeight: 1.7 }}>{p.architecture}</div>
              </div>
            )}
            <div style={{ ...st.mn, fontSize: "0.58rem", color: P.muted, marginBottom: 6, letterSpacing: "0.1em" }}>STACK</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{p.tech.map((t, i) => <span key={i} style={st.tag}>{t}</span>)}</div>
          </div>
        )}

        {tab === "method" && (
          <div style={{ animation: "fadeUp 0.3s ease", paddingLeft: "1.3rem", position: "relative" }}>
            <div style={{ position: "absolute", left: 4, top: 4, bottom: 8, width: 2, background: `linear-gradient(to bottom,${p.color},transparent)` }} />
            {p.method.map((s, i) => (
              <div key={i} style={{ marginBottom: "1rem", position: "relative" }}>
                <div style={{ position: "absolute", left: "-1.3rem", top: 0, width: 15, height: 15, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", boxShadow: `0 0 10px ${p.color}80` }}>{s.i}</div>
                <div style={{ ...st.hd, fontSize: "0.82rem", marginBottom: 3 }}>{s.p}</div>
                <p style={{ color: P.muted, fontSize: "0.76rem", lineHeight: 1.7 }}>{s.d}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "results" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", alignItems: "center", marginBottom: p.plots.length ? "1.1rem" : 0 }}>
              {p.metrics && !p.placeholder && <Radar m={p.metrics} />}
              <div style={{ flex: 1, minWidth: 200, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: "0.6rem" }}>
                {(p.findings || []).map((f, i) => (
                  <div key={i} style={{ background: P.bgAlt, border: `1px solid ${P.border}`, borderRadius: 10, padding: "0.7rem 0.8rem" }}>
                    <div style={{ ...st.hd, fontSize: "1.05rem", color: p.color }}>{f.value}</div>
                    <div style={{ ...st.mn, fontSize: "0.64rem", color: P.text, marginTop: 2 }}>{f.label}</div>
                    {f.note && <div style={{ ...st.mn, fontSize: "0.55rem", color: P.muted, marginTop: 3, lineHeight: 1.4 }}>{f.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            {p.plots && p.plots.length > 0 ? (
              <div>
                <img src={p.plots[plotIdx].src} alt={p.plots[plotIdx].caption} style={{ width: "100%", borderRadius: 12, border: `1px solid ${P.border}`, display: "block" }} />
                <div style={{ ...st.mn, fontSize: "0.64rem", color: P.muted, margin: "7px 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                  Fig {plotIdx + 1}. {p.plots[plotIdx].caption}
                </div>
                {p.plots.length > 1 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {p.plots.map((pl, i) => (
                      <button key={i} onClick={() => setPlotIdx(i)} style={{ width: 58, height: 40, borderRadius: 7, overflow: "hidden", border: `2px solid ${i === plotIdx ? p.color : P.border}`, padding: 0, cursor: "pointer", background: "none" }}>
                        <img src={pl.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: i === plotIdx ? 1 : 0.5 }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, opacity: 0.6, marginTop: "0.4rem" }}>{p.placeholder ? "// TODO: drop result plots into /public/images/plots/ and list them in this project's `plots` array." : "Result plots coming soon."}</p>
            )}
          </div>
        )}

        {p.links && (p.links.github || p.links.demo || p.links.paper) && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: "1.4rem", paddingTop: "1rem", borderTop: `1px solid ${P.border}` }}>
            {p.links.github && <a href={p.links.github} target="_blank" rel="noopener noreferrer" style={{ ...st.mn, fontSize: "0.7rem", fontWeight: 600, color: P.text, textDecoration: "none", border: `1px solid ${P.border}`, borderRadius: 8, padding: "6px 14px" }}>GitHub ↗</a>}
            {p.links.demo && <a href={p.links.demo} target="_blank" rel="noopener noreferrer" style={{ ...st.mn, fontSize: "0.7rem", fontWeight: 600, color: p.color, textDecoration: "none", border: `1px solid ${p.color}`, borderRadius: 8, padding: "6px 14px" }}>Live Demo ↗</a>}
            {p.links.paper && <a href={p.links.paper} target="_blank" rel="noopener noreferrer" style={{ ...st.mn, fontSize: "0.7rem", fontWeight: 600, color: P.accent2, textDecoration: "none", border: `1px solid ${P.accent2}`, borderRadius: 8, padding: "6px 14px" }}>Paper ↗</a>}
          </div>
        )}
      </div>
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
  const [openProject, setOpenProject] = useState(null);
  const [showNeural, setShowNeural] = useState(false);
  const containerRef = useRef(null);
  const scrollLock = useRef(false);
  const modalOpenRef = useRef(false);
  const typed = useTypewriter(["Data Scientist.", "ML Engineer.", "Problem Solver.", "Hackathon Winner.", "AI Researcher."]);

  const handleBrainClick = (idx) => {
    const next = brainRegion === idx ? null : idx;
    setBrainRegion(next);
    brainRegionRef.current = next;
  };

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const wh = (e) => {
      if (scrollLock.current) return;
      e.preventDefault();
      const d = e.deltaY > 0 ? 1 : -1;
      const n = Math.max(0, Math.min(SECS.length - 1, active + d));
      if (n !== active) { scrollLock.current = true; setActive(n); setTimeout(() => { scrollLock.current = false; }, 850); }
    };
    el.addEventListener("wheel", wh, { passive: false });
    return () => el.removeEventListener("wheel", wh);
  }, [active]);

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

  useEffect(() => { modalOpenRef.current = !!openProject; }, [openProject]);

  useEffect(() => {
    const h = (e) => {
      if (scrollLock.current || modalOpenRef.current) return;
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

  const st = {
    tag: { display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: "0.66rem", fontWeight: 600, background: P.glow, color: P.accent, fontFamily: "monospace", letterSpacing: "0.03em" },
    card: { background: P.card, borderRadius: 14, border: `1px solid ${P.border}`, padding: "1.4rem", backdropFilter: "blur(12px)", transition: "all 0.3s" },
    hd: { fontFamily: "'Playfair Display',serif", fontWeight: 700 },
    mn: { fontFamily: "'IBM Plex Mono',monospace" },
  };

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}html,body,#root{overflow:hidden;height:100%}
        ::selection{background:rgba(255,107,74,0.3);color:#FF6B4A}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes glow{0%,100%{box-shadow:0 0 6px rgba(255,107,74,0.3)}50%{box-shadow:0 0 20px rgba(255,107,74,0.5)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .scr::-webkit-scrollbar{width:3px}.scr::-webkit-scrollbar-thumb{background:rgba(255,107,74,0.2);border-radius:2px}.scr::-webkit-scrollbar-track{background:transparent}
        .photo-grid img{transition:transform 0.5s cubic-bezier(0.4,0,0.2,1)}
      `}</style>

      {matrix && <MatrixOverlay onClose={() => setMatrix(false)} />}
      {openProject && <ResearchModal project={openProject} onClose={() => setOpenProject(null)} />}

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

          {/* ═══ HOME ═══ */}
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
                <Rv delay={0.25}><p style={{ color: P.muted, fontSize: "0.82rem", lineHeight: 1.85, maxWidth: 440, marginBottom: "0.8rem" }}>
                  Not just another data scientist with a Jupyter notebook. I build <span style={{ color: P.accent }}>models that actually ship</span>, win hackathons on weekends, and explain complex findings so clearly that even non-tech stakeholders get it. The kind of person who <span style={{ color: P.accent2 }}>understands the problem before jumping to a solution</span>.
                </p></Rv>
                <Rv delay={0.32}>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
                    <button onClick={() => setShowNeural(!showNeural)} style={{
                      padding: "7px 16px", borderRadius: 8, border: `1px solid ${P.accent}`,
                      background: showNeural ? P.accent : "transparent",
                      color: showNeural ? "#fff" : P.accent, cursor: "pointer",
                      fontSize: "0.72rem", fontWeight: 600, ...st.mn, transition: "all 0.3s",
                    }}>
                      {showNeural ? "Show Brain" : "Show Neural Net"}
                    </button>
                    <button onClick={() => goTo(5)} style={{
                      padding: "7px 16px", borderRadius: 8, border: `1px solid ${P.accent2}`,
                      background: "transparent", color: P.accent2, cursor: "pointer",
                      fontSize: "0.72rem", fontWeight: 600, ...st.mn, transition: "all 0.3s",
                    }}>
                      See My Life
                    </button>
                  </div>
                </Rv>
                <Rv delay={0.38}><p style={{ ...st.mn, fontSize: "0.72rem", color: P.muted, opacity: 0.7 }}>MSc AI @ Dublin City University</p></Rv>
              </div>
              <div style={{ flex: "1 1 340px", minWidth: 280, height: "min(52vh,440px)", position: "relative" }}>
                {showNeural ? (
                  <>
                    <NeuralNetwork3D />
                    <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", ...st.mn, fontSize: "0.6rem", color: P.muted, background: P.card, padding: "6px 14px", borderRadius: 8, backdropFilter: "blur(12px)", border: `1px solid ${P.border}` }}>
                      4-layer neural network — drag to rotate — signals flowing between neurons
                    </div>
                  </>
                ) : (
                  <>
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
                    <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", ...st.mn, fontSize: "0.58rem", color: P.muted, opacity: 0.5 }}>drag to rotate . click glowing regions</div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ═══ ABOUT ═══ */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 900, width: "100%", padding: "4.5rem 2rem 2rem" }}>
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// about</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: "1.4rem" }}>The <span style={{ color: P.accent }}>Story</span> So Far</h2></Rv>

              {/* Photo + intro row */}
              <Rv delay={0.08}>
                <div style={{ ...st.card, display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap" }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                    border: `3px solid ${P.accent}`, boxShadow: `0 0 30px ${P.glow}`,
                  }}>
                    <img src="/images/portrait-sunglasses.jpeg" alt="Atharva" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ color: P.text, fontSize: "0.82rem", lineHeight: 1.8 }}>
                      From Mumbai to Dublin, I've chased the question <span style={{ color: P.accent }}>"why does this model work?"</span> across continents. I don't just train models — I interrogate them. When I'm not coding, you'll find me at hackathons, exploring Ireland, or pitching research at international conferences.
                    </p>
                  </div>
                </div>
              </Rv>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))", gap: "0.8rem" }}>
                {[
                  { i: "🧠", t: "Who I Am", d: "DS & ML Engineer focused on why models behave — optimizing for useful insights, not just accuracy." },
                  { i: "🎓", t: "Education", d: "MSc AI — DCU Ireland\nB.E. AI & DS — TEC Mumbai" },
                  { i: "💼", t: "Experience", d: "Student Ambassador — MotivaLogic\nData Science Engineer — Bharat Intern\nPython Developer — Mira Advance" },
                  { i: "🏆", t: "Wins", d: "MotivaLogic Hackathon Winner (AWS)\n3rd / 70 — AdvanceHealth MedTech\nTop 100 / 5000 — AI/ML Hackathon\nIntl. Research Conference" }
                ].map((c, i) => (
                  <Rv key={i} delay={0.12 + i * 0.07}><div style={{ ...st.card, height: "100%" }}><div style={{ fontSize: "1.3rem", marginBottom: 5 }}>{c.i}</div><div style={{ ...st.hd, fontSize: "0.85rem", marginBottom: 4 }}>{c.t}</div><p style={{ color: P.muted, fontSize: "0.76rem", lineHeight: 1.7, whiteSpace: "pre-line" }}>{c.d}</p></div></Rv>
                ))}
              </div>
              <Rv delay={0.45}><div style={{ ...st.card, marginTop: "0.8rem", background: "rgba(8,8,14,0.9)", ...st.mn, fontSize: "0.68rem", lineHeight: 2, color: P.accent, padding: "0.8rem 1.1rem" }}>
                <span style={{ opacity: 0.35 }}>// config</span><br />
                {"{"} location: <span style={{ color: "#7EC8A0" }}>"Dublin, Ireland"</span>, passion: <span style={{ color: "#7EC8A0" }}>"clarity over complexity"</span>, coffee: <span style={{ color: "#FFB347" }}>Infinity</span>, hackathons: <span style={{ color: "#60A5FA" }}>4</span> {"}"}
              </div></Rv>
            </div>
          </section>

          {/* ═══ PROJECTS ═══ */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 920, width: "100%", padding: "4.5rem 2rem 2rem", overflowY: "auto", maxHeight: "100vh" }} className="scr">
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// research &amp; projects</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: 4 }}>Selected <span style={{ color: P.accent }}>Work</span></h2></Rv>
              <Rv delay={0.08}><p style={{ color: P.muted, fontSize: "0.8rem", marginBottom: "1.3rem" }}>Click any project to open its case study — <span style={{ color: P.accent }}>abstract</span>, <span style={{ color: P.accent }}>method</span>, and <span style={{ color: P.accent }}>results</span>.</p></Rv>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))", gap: "0.8rem" }}>
                {PROJECTS.map((p, i) => (
                  <Rv key={p.id} delay={i * 0.07}>
                    <div
                      onClick={() => setOpenProject(p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === "Enter") setOpenProject(p); }}
                      style={{ ...st.card, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: `3px solid ${p.color}`, cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 30px ${p.color}20`; e.currentTarget.style.borderColor = `${p.color}55`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = P.border; }}
                    >
                      <div style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6, flexWrap: "wrap" }}>
                            <span style={{ ...st.hd, fontSize: "0.92rem" }}>{p.title}</span>
                            <span style={{ ...st.tag, background: `${p.color}22`, color: p.color }}>{p.badge}</span>
                          </div>
                          <p style={{ color: P.muted, fontSize: "0.76rem", lineHeight: 1.65, marginBottom: 8 }}>{p.short}</p>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>{p.tech.slice(0, 4).map((t, j) => <span key={j} style={st.tag}>{t}</span>)}</div>
                        </div>
                        {p.metrics && !p.placeholder && <Radar m={p.metrics} />}
                      </div>
                      <div style={{ ...st.mn, fontSize: "0.68rem", color: p.color, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                        Read case study →
                      </div>
                    </div>
                  </Rv>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ SKILLS ═══ */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 860, width: "100%", padding: "4.5rem 2rem 2rem", overflowY: "auto", maxHeight: "100vh" }} className="scr">
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// skills</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: "1.4rem" }}>Tech <span style={{ color: P.accent }}>Arsenal</span></h2></Rv>
              {[{ k: "lang", l: "Languages" }, { k: "ml", l: "ML & AI" }, { k: "data", l: "Data & BI" }, { k: "cloud", l: "Cloud" }].map((cat, ci) => (
                <Rv key={cat.k} delay={ci * 0.06}><div style={{ marginBottom: "1.3rem" }}>
                  <div style={{ ...st.hd, fontSize: "0.82rem", marginBottom: "0.6rem", color: P.accent }}>{cat.l}</div>
                  {SKILLS.filter(sk => sk.c === cat.k).map((sk, si) => <SkillBar key={si} skill={sk} delay={ci * 0.06 + si * 0.03} />)}
                </div></Rv>
              ))}
              {/* LSTM notes teaser */}
              <Rv delay={0.3}>
                <div style={{ ...st.card, display: "flex", gap: "1rem", alignItems: "center", marginTop: "0.5rem", flexWrap: "wrap" }}>
                  <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: `1px solid ${P.border}` }}>
                    <img src="/images/lstm-notes.jpeg" alt="LSTM handwritten notes" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ ...st.mn, fontSize: "0.72rem", color: P.accent, marginBottom: 3 }}>Behind the skills</p>
                    <p style={{ color: P.muted, fontSize: "0.76rem", lineHeight: 1.6 }}>
                      I still write equations by hand. Understanding the math behind forget gates, input gates, and cell states — not just calling <span style={{ ...st.mn, color: P.accent }}>model.fit()</span>.
                    </p>
                  </div>
                </div>
              </Rv>
            </div>
          </section>

          {/* ═══ JOURNEY ═══ */}
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

          {/* ═══ GALLERY — LIFE BEYOND CODE ═══ */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 900, width: "100%", padding: "4.5rem 2rem 2rem" }}>
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// gallery</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: 4 }}>Life <span style={{ color: P.accent }}>Beyond Code</span></h2></Rv>
              <Rv delay={0.08}><p style={{ color: P.muted, fontSize: "0.8rem", marginBottom: "1rem" }}>
                Because the best data scientists are also humans with stories. Hackathons, travels, and everything in between.
              </p></Rv>
              <Rv delay={0.12}>
                <PhotoGallery />
              </Rv>
            </div>
          </section>

          {/* ═══ CONTACT ═══ */}
          <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 620, width: "100%", padding: "4.5rem 2rem 2rem", textAlign: "center" }}>
              <Rv><p style={{ ...st.mn, fontSize: "0.68rem", color: P.muted, marginBottom: 4 }}>// contact</p></Rv>
              <Rv delay={0.04}><h2 style={{ ...st.hd, fontSize: "1.8rem", marginBottom: 4 }}>Let's <span style={{ color: P.accent }}>Connect</span></h2></Rv>
              <Rv delay={0.08}><p style={{ color: P.muted, fontSize: "0.82rem", marginBottom: "0.5rem" }}>Open to DS & ML roles. Let's build something impactful.</p></Rv>
              <Rv delay={0.12}>
                <div style={{ ...st.card, marginBottom: "1.2rem", background: "rgba(255,107,74,0.04)", border: `1px solid ${P.accent}30`, textAlign: "left", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: 60, height: 60, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                    <img src="/images/dublin-casual.jpeg" alt="Atharva" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ ...st.hd, fontSize: "0.88rem", marginBottom: 3 }}>Why hire me?</p>
                    <p style={{ color: P.muted, fontSize: "0.74rem", lineHeight: 1.7 }}>
                      I ship ML models to production, win hackathons under pressure, explain complex findings clearly, and bring genuine curiosity to every problem. I don't just fit models — I understand them.
                    </p>
                  </div>
                </div>
              </Rv>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))", gap: "0.6rem", textAlign: "left" }}>
                {[
                  { i: "📧", l: "Email", v: "atharvakocharekar0@gmail.com", h: "mailto:atharvakocharekar0@gmail.com" },
                  { i: "💼", l: "LinkedIn", v: "atharva-kocharekar", h: "https://linkedin.com/in/atharva-kocharekar-3512b4224" },
                  { i: "🐙", l: "GitHub", v: "Atharvax16", h: "https://github.com/Atharvax16" },
                  { i: "📱", l: "Phone", v: "+353 899607779", h: "tel:+353899607779" },
                ].map((c, i) => (
                  <Rv key={i} delay={0.16 + i * 0.06}><a href={c.h} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}><div style={{ ...st.card, display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => { e.currentTarget.style.borderColor = P.accent; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.transform = "none"; }}>
                    <span style={{ fontSize: "1.1rem" }}>{c.i}</span><div><div style={{ ...st.mn, fontSize: "0.6rem", color: P.muted }}>{c.l}</div><div style={{ color: P.text, fontWeight: 500, fontSize: "0.78rem" }}>{c.v}</div></div>
                  </div></a></Rv>
                ))}
              </div>
              <Rv delay={0.4}><button style={{ marginTop: "1.5rem", padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer", background: P.grad, color: "#fff", fontWeight: 600, fontSize: "0.88rem", fontFamily: "'DM Sans'", boxShadow: `0 4px 20px ${P.glow}`, transition: "transform 0.2s" }} onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "none"}>Download Resume</button></Rv>
              <Rv delay={0.45}><div style={{ marginTop: "1.8rem", paddingTop: "0.9rem", borderTop: `1px solid ${P.border}` }}>
                <p style={{ ...st.mn, fontSize: "0.65rem", color: P.muted }}>Built by <span style={{ color: P.accent }}>Atharva Kocharekar</span> — 2026</p>
                <p style={{ ...st.mn, fontSize: "0.55rem", color: P.muted, opacity: 0.4, marginTop: 3 }}>Logo x 5 = 🔮</p>
              </div></Rv>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
