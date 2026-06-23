/* ════════════════════════════════════════
   PALETTE — "Preprint": ink on lab paper
   A typeset-paper aesthetic. Warm-grey paper, near-black ink,
   one scholarly ink-blue accent, a faint highlighter.
   (Legacy dark-theme keys kept as aliases so shared components
    that read P.bg / P.text / P.card / P.border don't break.)
   ════════════════════════════════════════ */
export const P = {
  paper: "#FAFAF7", paper2: "#FFFFFF", ink: "#16181D", sub: "#585C64",
  faint: "#ECEBE5", line: "#D4D3CB",
  accent: "#2B4C8C", accentSoft: "rgba(43,76,140,0.10)",
  highlight: "rgba(232,194,76,0.40)",
  green: "#3F7A57", red: "#9B3B3B", yellow: "#9A7B1F",
  // legacy aliases (shared components):
  bg: "#FAFAF7", bgAlt: "#F1F0EA", text: "#16181D", muted: "#585C64",
  border: "#D4D3CB", card: "#FFFFFF", glow: "rgba(43,76,140,0.10)",
  accent2: "#2B4C8C", grad: "linear-gradient(90deg,#2B4C8C,#3D63A8)",
};

/* The paper's front matter. */
export const PAPER = {
  author: "Atharva Kocharekar",
  affiliation: "MSc Artificial Intelligence, Dublin City University",
  stamp: "portfolio · v2 · [cs.LG] · 23 Jun 2026",
  date: "Dublin, Ireland · June 2026",
  title: "Robust & Explainable Machine Learning for High-Stakes Vision",
  keywords: ["robustness", "explainability (XAI)", "diffusion models", "generative-image forensics", "multi-agent ML"],
  email: "atharvakocharekar0@gmail.com",
};

/* Nav + scroll-tracked sections (paper running order).
   The gallery "Appendix" is intentionally NOT here — it stays out of nav. */
export const SECS = ["Abstract", "Research", "Work", "Findings", "Reading", "Foundations", "Methods", "About", "Contact"];

/* ════════════════════════════════════════
   RESEARCH FOCUS — the threads that define the work
   ════════════════════════════════════════ */
export const RESEARCH_AREAS = [
  {
    title: "Robust & Explainable Medical Imaging",
    thesis: "Towards a Robust and Explainable Pipeline for Diabetic Retinopathy Classification through Quality-Aware GenAI Image Restoration",
    blurb: "My MSc thesis. I stress-test diabetic-retinopathy classifiers under the degradations real fundus photos collect — motion blur, exposure error, sensor noise — and then try to repair the damage with GenAI / diffusion-based restoration, all paired with a quantitative XAI benchmark. The uncomfortable finding: restoration makes the images look clean to the eye, yet the classifier's accuracy keeps fading. The restorer smooths away the very pathology signal the grader relies on — looks restored, reads wrong.",
    tags: ["robustness", "XAI", "diffusion", "medical imaging"],
  },
  {
    title: "Generative-Image Forensics",
    blurb: "Telling authentic photographs apart from diffusion- and GAN-generated images — and finding which signals (frequency artifacts, intermediate transformer features) actually carry the evidence.",
    tags: ["AI-image detection", "CLIP", "representation learning"],
  },
  {
    title: "Foundations, From Scratch",
    blurb: "Reproducing the building blocks — RNNs and BPTT, transformers, GANs — in raw NumPy. Reading the original papers, then rebuilding them to understand the mechanics rather than calling an API.",
    tags: ["transformers", "RNNs", "GANs", "NumPy"],
  },
  {
    title: "Multi-Agent & Applied ML",
    blurb: "Grounding LLM agents in deterministic ML so their decisions stay auditable — across treasury, compliance, and research-tracking tooling.",
    tags: ["multi-agent", "LLM grounding", "RegTech"],
  },
];

/* ════════════════════════════════════════
   READING LOG — the `til` paper journal
   `year` is each paper's publication year (a fact about the paper),
   not a claim about when it was read.
   ════════════════════════════════════════ */
export const TIL_REPO = "https://github.com/Atharvax16/til";
export const READING_LOG = [
  {
    paper: "Attention Is All You Need",
    authors: "Vaswani et al.",
    year: "2017",
    area: "Transformers",
    takeaway: "Q/K/V as content-based routing — the entire architecture falls out of scaled dot-product attention plus positional encodings.",
    link: "https://github.com/Atharvax16/til/tree/main/papers/Attention",
    hasNotebook: true,
    sketch: "attention",
  },
  {
    paper: "Generative Adversarial Nets",
    authors: "Goodfellow et al.",
    year: "2014",
    area: "Generative",
    takeaway: "Why the non-saturating generator loss rescues early training — verified by comparing Adam vs SGD gradient flow in a notebook.",
    link: "https://github.com/Atharvax16/til/tree/main/papers/Generative_Adversarial_Nets",
    hasNotebook: true,
  },
  {
    paper: "MPNN → SchNet → DimeNet → NequIP",
    authors: "GNNs for quantum chemistry",
    year: "2017–21",
    area: "Graph / Sci-ML",
    takeaway: "The arc from message passing to E(3)-equivariant networks — each step bakes in a physical symmetry the previous one ignored.",
    link: "https://github.com/Atharvax16/til/tree/main/papers/Quantum_chemistry",
    hasNotebook: false,
  },
];

/* ════════════════════════════════════════
   FROM SCRATCH — fundamentals, hand-built
   ════════════════════════════════════════ */
export const FROM_SCRATCH = [
  {
    title: "RNN + BPTT in NumPy",
    blurb: "Backpropagation through time implemented by hand, to watch the gradient flow across timesteps.",
    tags: ["NumPy", "BPTT"],
    link: "https://github.com/Atharvax16/Recurrent-Neural-Network-using-Numpy-from-Scratch",
  },
  {
    title: "Feed-Forward Neural Language Model",
    blurb: "A Bengio-style neural language model built from the ground up — embeddings, hidden layer, softmax.",
    tags: ["language modeling", "NumPy"],
    link: "https://github.com/Atharvax16/FeedForward-Neural-Network-for-language-Modelling-from-Scratch",
  },
  {
    title: "Vanilla RNN & the Vanishing Gradient",
    blurb: "Demonstrating why long-range dependencies collapse in a plain RNN — and what fixes them.",
    tags: ["RNN", "optimization"],
    link: "https://github.com/Atharvax16/Vanilla-RNN-vanishing-gradient-problem-and-it-solutions",
  },
];

/* ════════════════════════════════════════
   METHODS & TOOLS — grouped, no arbitrary percentages
   ════════════════════════════════════════ */
export const METHODS = [
  { group: "Modeling & Deep Learning", items: ["PyTorch", "timm", "TensorFlow / Keras", "scikit-learn", "HF Transformers"] },
  { group: "Generative & Diffusion", items: ["DDPM", "Cold Diffusion", "GANs", "SwinIR"] },
  { group: "Explainability (XAI)", items: ["Integrated Gradients", "SHAP", "Grad-CAM", "Attention Rollout"] },
  { group: "Representation & Forensics", items: ["CLIP", "DINOv2", "FFT / ELA", "XGBoost"] },
  { group: "Foundations (from scratch)", items: ["NumPy", "BPTT / RNNs", "Neural LMs", "Optimization"] },
  { group: "Infra & MLOps", items: ["AWS SageMaker", "Lambda / SNS", "Docker", "FastAPI"] },
];

/* ════════════════════════════════════════
   JOURNEY — milestones, research-leaning
   ════════════════════════════════════════ */
export const JOURNEY = [
  { year: "2021", title: "The Spark", place: "TEC Mumbai", text: "Started B.E. in AI & Data Science. Fell for the question behind the model — why does this work?", mindset: "Learn everything. Question everything.", icon: "◆", color: "#F472B6" },
  { year: "2023", title: "First Impact", place: "Data Science Intern", text: "Built production-grade ML pipelines. Learned that clean data beats clever models.", mindset: "Ship things. Break things. Fix things.", icon: "▲", color: "#5BE0C9" },
  { year: "2024", title: "Going Global", place: "Dublin, Ireland", text: "MSc in Artificial Intelligence at DCU. Began an MSc thesis on robust, explainable diabetic-retinopathy screening.", mindset: "Read the source. Reproduce it.", icon: "●", color: "#4ADE80" },
  { year: "2025", title: "Research Mode", place: "Thesis · Image Forensics", text: "Diffusion-based restoration and a quantitative XAI benchmark for the thesis; a separate study on detecting AI-generated images. Reading and reproducing foundational papers in parallel.", mindset: "Build from first principles.", icon: "■", color: "#60A5FA" },
  { year: "2026", title: "What's Next", place: "ML Research", text: "Pursuing ML / applied-research roles and collaborations — robustness, explainability, and generative-image forensics.", mindset: "Read deeply. Build from scratch.", icon: "✦", color: "#6AA9FF" },
];

/* ════════════════════════════════════════
   PROJECTS — each doubles as a mini paper (Abstract / Method / Results).
   Projects flagged `placeholder: true` carry TODO fields.
   ════════════════════════════════════════ */
export const PROJECTS = [
  {
    id: "dr-xai-thesis",
    title: "Robust & Explainable AI for Diabetic Retinopathy",
    badge: "MSc Thesis · Diffusion + XAI",
    year: "2025",
    role: "Thesis · sole author",
    color: "#5BE0C9",
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
      { src: "images/plots/thesis/ddpm_forward_backward.png", caption: "Conditional DDPM — forward noising & reverse denoising of a fundus image" },
      { src: "images/plots/thesis/cold_diffusion_forward_backward.png", caption: "Cold Diffusion — deterministic forward / backward restoration" },
      { src: "images/plots/thesis/cold_diffusion_roundtrip_noise.png", caption: "Cold Diffusion round-trip recovery under sensor noise" },
      { src: "images/plots/thesis/fidelity_vs_accuracy.png", caption: "Restoration fidelity vs. downstream classifier accuracy" },
      { src: "images/plots/thesis/insertion_auc_vs_noise.png", caption: "XAI faithfulness (insertion AUC) vs. noise severity" },
      { src: "images/plots/thesis/accuracy_vs_degradation_noise.png", caption: "Classifier robustness vs. degradation severity" },
      { src: "images/plots/thesis/trust_score_distribution.png", caption: "Quality-aware router — trust-score distribution" },
    ],
    links: { github: "https://github.com/Atharvax16/Comparative-Study-for-Diabetic-Retinopathy-Detection-and-Interpretability-methods" },
  },
  {
    /* TODO (post-visit): add the Etsy framing ("invited to present to Etsy head office"),
       the public GitHub link, and the result figures (confusion matrix, t-SNE, FFT/ELA).
       Kept deliberately understated and un-named for now. */
    id: "gen-image-detection",
    title: "Generative-Image Detection",
    badge: "Image Forensics · Research",
    year: "2025",
    role: "Solo · research",
    color: "#6AA9FF",
    short: "Distinguishing authentic photographs from diffusion- and GAN-generated images using frequency artifacts and intermediate transformer features.",
    tech: ["PyTorch", "CLIP / DINOv2", "XGBoost", "Optuna"],
    keywords: ["image forensics", "AI-generated detection", "representation learning", "ensembling"],
    abstract: "A study in detecting synthetic imagery on a marketplace-style dataset of ~4,340 photographs split across authentic and AI-generated (diffusion + GAN) sources. The work pits hand-crafted forensic signals (FFT frequency analysis, JPEG/ELA compression artifacts) against learned representations from vision transformers — and finds that intermediate CLIP layers, not the final embedding, carry the strongest discriminative signal for synthetic content.",
    architecture: "Image → {FFT · ELA · CLIP(intermediate layers 18/20/22/23) · DINOv2} features → XGBoost heads → Optuna-weighted ensemble",
    method: [
      { p: "Frame", i: "🎯", d: "Binary authentic-vs-synthetic classification on a stratified marketplace-style image set (~4,340 images)." },
      { p: "Forensics", i: "🔍", d: "Frequency- and compression-based baselines: FFT+XGBoost (F1 0.60) and ELA+XGBoost (F1 0.65) capture statistical fingerprints of generation." },
      { p: "Represent", i: "🧠", d: "Fine-tuned DINOv2 / EfficientNet (F1 0.79–0.85); intermediate CLIP layers + XGBoost reach F1 0.92 — beating the final-layer embedding." },
      { p: "Fuse", i: "🧩", d: "A 6,018-dim feature fusion with 5-fold CV (0.87 ± 0.01), test-time augmentation, and pseudo-labeling of high-confidence predictions." },
      { p: "Ensemble", i: "📊", d: "An Optuna-optimised 4-model weighted ensemble lifts validation F1 to ≈ 0.94." },
    ],
    metrics: null,
    findings: [
      { label: "Best F1", value: "≈ 0.94", note: "Optuna-weighted 4-model ensemble (val)" },
      { label: "Key result", value: "mid > final", note: "intermediate CLIP layers beat the final embedding (0.92 vs 0.85)" },
      { label: "Dataset", value: "4,340", note: "authentic vs diffusion/GAN, stratified" },
    ],
    plots: [],
    links: {},
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
      { src: "images/plots/gradcam-retinopathy.png", caption: "Grad-CAM explainability — retinal fundus image" },
      { src: "images/plots/fl-training-curves.png", caption: "Loss & validation accuracy over epochs" },
    ],
    links: { github: "https://github.com/Atharvax16/Federated-Learning-for-Diabetic-Retinopathy-using-XAI" },
  },
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
      { src: "images/plots/venueflow/02-intake.png", caption: "Couple intake — the brief that seeds the agents" },
      { src: "images/plots/venueflow/03-building.png", caption: "Agents assembling the wedding plan in real time" },
      { src: "images/plots/venueflow/04-dashboard.png", caption: "The couple's wedding dashboard" },
      { src: "images/plots/venueflow/05-dashboard-shortlist.png", caption: "Vendor shortlist produced by the matcher agents" },
      { src: "images/plots/venueflow/p3-client-dashboard.png", caption: "Planner view — managing multiple client weddings" },
    ],
    links: {},
  },
  {
    id: "cyberattack",
    title: "CPU-Based Cyberattack Detection",
    badge: "AWS Hackathon Winner",
    year: "2025",
    role: "Lead · modeling & deployment",
    color: "#38BDF8",
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
    plots: [{ src: "images/plots/anomaly-cpu-usage.png", caption: "Synthetic CPU usage with injected anomaly spikes" }],
    links: { github: "https://github.com/Atharvax16/Cyberattack-Detection-using-CPU-Usage-Logs-Alert-System" },
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
    id: "gait-parkinsons",
    title: "Parkinson's — Gait, Voice & Tapping",
    badge: "Multimodal Biomedical ML",
    year: "2025",
    role: "Solo",
    color: "#94A3B8",
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

/* Research-forward display order. */
export const PROJECT_ORDER = ["dr-xai-thesis", "gen-image-detection", "retinopathy-fl", "catas", "research-companion", "venueflow", "cyberattack", "cc-fraud", "gait-parkinsons"];
export const ORDERED_PROJECTS = PROJECT_ORDER.map((id) => PROJECTS.find((p) => p.id === id)).filter(Boolean);

/* ════════════════════════════════════════
   INSIGHTS — real figures from the work, each with the observation it
   carries. The interactive panel a visiting researcher can step through.
   ════════════════════════════════════════ */
export const INSIGHTS = [
  {
    tag: "thesis", title: "Fidelity ≠ accuracy",
    src: "images/plots/thesis/fidelity_vs_accuracy.png",
    insight: "Push restoration harder and the image looks better to the eye — but the classifier's accuracy doesn't follow it up. The gap between the two curves is the whole thesis in one figure.",
  },
  {
    tag: "thesis", title: "Accuracy decays with noise",
    src: "images/plots/thesis/accuracy_vs_degradation_noise.png",
    insight: "Every grader's accuracy slides as sensor noise climbs. Robustness isn't a property you get for free — it has to be measured before it can be defended.",
  },
  {
    tag: "XAI", title: "Explanations destabilise first",
    src: "images/plots/thesis/insertion_auc_vs_noise.png",
    insight: "Insertion-AUC falls under degradation: the model's explanations grow less faithful exactly when the input gets hard — when you'd most want to trust them.",
  },
  {
    tag: "generative", title: "The non-saturating trick", sketch: "saturating",
    insight: "When the generator is losing (D ≈ 0), the original saturating loss gives almost no gradient — training stalls. Flipping to −log(D) keeps the signal strong. A one-line change that rescues early GAN training.",
  },
  {
    tag: "diffusion", title: "Cold-diffusion round trip",
    src: "images/plots/thesis/cold_diffusion_roundtrip_noise.png",
    insight: "Deterministic forward/backward recovers the look of a noisy fundus image — but the fine pathology is exactly what a restorer is tempted to smooth away.",
  },
  {
    tag: "routing", title: "Trust-score split",
    src: "images/plots/thesis/trust_score_distribution.png",
    insight: "The quality-aware router separates images worth enhancing from those it should leave alone — turning the fidelity-vs-accuracy trade-off into a per-image decision.",
  },
  {
    tag: "XAI", title: "Grad-CAM on the retina",
    src: "images/plots/gradcam-retinopathy.png",
    insight: "Saliency lands on the lesions clinicians actually inspect — the kind of explanation a doctor can sanity-check, not just a pretty heatmap.",
  },
  {
    tag: "anomaly", title: "Anomalies in CPU telemetry",
    src: "images/plots/anomaly-cpu-usage.png",
    insight: "Injected attack spikes stand clear of baseline load. With a recall-first detector, a few false alarms are a fair price for never missing the spike that matters.",
  },
];

export const GALLERY_PHOTOS = [
  { src: "images/hackathon-medtech-team.jpeg", caption: "3rd Place at AdvanceHealth MedTech Hackathon — Trinity College Dublin", category: "hackathon", span: "wide" },
  { src: "images/hackathon-medtech-solo.jpeg", caption: "Ireland's First MedTech Student-Led Ideathon — Day 2", category: "hackathon", span: "tall" },
  { src: "images/aws-cloudhight-event.jpeg", caption: "CloudHight AIOps Summit — Sponsored by AWS", category: "tech", span: "tall" },
  { src: "images/motivalogic-hackathon.jpeg", caption: "MotivaLogic Hackathon Winner — Cloud, DevOps & AI (AWS Sponsored)", category: "hackathon", span: "tall" },
  { src: "images/hackathon-selfie.jpeg", caption: "The hackathon squad — late nights, big ideas", category: "hackathon" },
  { src: "images/team-project.jpeg", caption: "Team project presentation day", category: "tech" },
  { src: "images/hackathon-venue-crowd.jpeg", caption: "Design Thinking session — Day 2 vibes", category: "hackathon", span: "wide" },
  { src: "images/hackathon-demo-day.jpeg", caption: "Demo Day running order — 5 min to change everything", category: "hackathon" },
  { src: "images/lstm-notes.jpeg", caption: "LSTM notes — because some things need pen and paper", category: "behind" },
  { src: "images/portrait-sunglasses.jpeg", caption: "Dublin sun hits different when it actually shows up", category: "life", span: "tall" },
  { src: "images/dublin-casual.jpeg", caption: "Exploring Dublin — the city that became home", category: "life", span: "tall" },
];
