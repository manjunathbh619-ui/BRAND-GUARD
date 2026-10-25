import { ContentSubmission, KnowledgeItem, Finding, RoutingTier } from "../types";

export const DEMO_BANNER_IMAGE_PATH =
  "/src/assets/images/ad_banner_offbrand_1792853488557.jpg";

export const INITIAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: "BG-101",
    category: "Brand Guidelines",
    title: "Voice & Tone Principles",
    version: "v3.2",
    lastUpdated: "2026-09-14",
    tags: ["tone", "voice", "hyperbole", "headlines", "calm", "authority"],
    rejectionCount: 4,
    overrideCount: 3,
    content:
      "Nimbus Cloud communicates with calm, empirical engineering authority. Do NOT use sensationalist hyperbole, fear-mongering, multiple exclamation marks, or aggressive sales urgency (e.g., 'ACT NOW!', 'UNLEASH THE POWER', 'CRUSH YOUR COMPETITORS'). Lead with verifiable technical outcomes and architectural clarity.",
  },
  {
    id: "BG-102",
    category: "Brand Guidelines",
    title: "Terminology & Preferred Lexicon",
    version: "v2.4",
    lastUpdated: "2026-10-02",
    tags: ["terminology", "users", "customers", "clients", "nimbuscloud", "banned"],
    rejectionCount: 6,
    overrideCount: 5,
    content:
      "Always refer to people using our platform as 'customers', 'developers', or 'engineering teams' — NEVER 'users' or 'clients'. Always write the company and product name as two words with a space: 'Nimbus Cloud' (NEVER camelCase 'NimbusCloud' or 'the Nimbus tool'). Banned buzzwords: 'blazingly fast', 'synergy', 'paradigm shift', 'AI-magic', 'game-changer'.",
  },
  {
    id: "BG-103",
    category: "Brand Guidelines",
    title: "Accessibility & Inclusive Copy Standards",
    version: "v1.9",
    lastUpdated: "2026-08-20",
    tags: ["accessibility", "alt text", "all-caps", "contrast", "readability", "emojis"],
    rejectionCount: 1,
    overrideCount: 0,
    content:
      "All visual assets and banners MUST include descriptive alt text of at least 8 words describing both visual layout and embedded copy. Never set multi-word phrases or body sentences in ALL-CAPS (impairs screen readers and dyslexic comprehension). Never convey critical meaning through emojis alone. Keep marketing readability between Grade 8 and Grade 10.",
  },
  {
    id: "FC-201",
    category: "Approved Facts & Claims",
    title: "Multi-Region Uptime & SLA Guarantee",
    version: "v4.0",
    lastUpdated: "2026-07-10",
    expiryDate: "2027-12-31",
    tags: ["sla", "uptime", "99.99%", "100%", "reliability", "legal"],
    rejectionCount: 1,
    overrideCount: 0,
    content:
      "Approved legal claim: 'Nimbus Cloud delivers a 99.99% uptime SLA backed by contractual financial service credits across multi-region active-active deployments.' Strictly prohibited: claiming '100% uptime', 'zero downtime guaranteed', or 'unbreakable infrastructure'. (Legal-sensitive claim).",
  },
  {
    id: "FC-202",
    category: "Approved Facts & Claims",
    title: "Security Posture & Compliance Certifications",
    version: "v3.1",
    lastUpdated: "2026-08-05",
    expiryDate: "2027-06-30",
    tags: ["security", "soc2", "iso27001", "hipaa", "100% secure", "unhackable", "legal"],
    rejectionCount: 0,
    overrideCount: 1,
    content:
      "Approved legal claim: 'Certified SOC 2 Type II, ISO/IEC 27001, and HIPAA compliant with hardware-enforced AES-256 encryption at rest and TLS 1.3 in transit.' Never claim '100% secure', 'unhackable', 'immune to breaches', or 'military-grade invincibility'. (Legal-sensitive claim).",
  },
  {
    id: "FC-203",
    category: "Approved Facts & Claims",
    title: "Legacy Seat Pricing & Trial Terms (FY25 — EXPIRED)",
    version: "v1.8",
    lastUpdated: "2025-04-01",
    expiryDate: "2026-03-31",
    tags: ["pricing", "$29", "$79", "30-day trial", "outdated", "expired", "starter"],
    rejectionCount: 3,
    overrideCount: 2,
    content:
      "OUTDATED / EXPIRED AS OF 2026-03-31: Legacy Starter plan at $29/seat/month, Legacy Pro plan at $79/seat/month, and 30-day free trial offer are retired. Do NOT cite $29/seat, $79/seat, or a 30-day free trial in any 2026 content. Refer to FC-204 for current FY26/27 pricing.",
  },
  {
    id: "FC-204",
    category: "Approved Facts & Claims",
    title: "Current FY26/27 Pricing & Trial Structure",
    version: "v2.0",
    lastUpdated: "2026-04-01",
    expiryDate: "2027-09-30",
    tags: ["pricing", "$49", "vcpu", "14-day trial", "team tier", "enterprise"],
    rejectionCount: 1,
    overrideCount: 0,
    content:
      "Approved current pricing: Team tier starts at $49/seat/month; Enterprise compute uses usage-based metering at $0.04 per vCPU-hour with annual volume commitments. Standard self-serve free trial is 14 days with $300 in compute credits.",
  },
  {
    id: "FC-205",
    category: "Approved Facts & Claims",
    title: "Cold-Start Latency & Performance Benchmarks",
    version: "v2.2",
    lastUpdated: "2026-06-18",
    expiryDate: "2027-04-15",
    tags: ["performance", "latency", "62%", "fastest", "#1", "benchmark"],
    rejectionCount: 2,
    overrideCount: 1,
    content:
      "Approved benchmark claim: 'Reduces p99 container cold-start latency by up to 62% compared to standard Kubernetes node autoscalers, verified by the Q2 2026 CloudBench audit (n=1,200 production workloads).' Never claim '#1 fastest cloud on the planet' or '10x faster than AWS' without specific benchmark citation.",
  },
  {
    id: "FC-206",
    category: "Approved Facts & Claims",
    title: "Verified Customer Scale & Global Footprint",
    version: "v1.5",
    lastUpdated: "2026-09-01",
    expiryDate: "2027-03-31",
    tags: ["customers", "4,800+", "regions", "scale", "adoption"],
    rejectionCount: 0,
    overrideCount: 0,
    content:
      "Approved adoption metric: 'Trusted by 4,800+ engineering organizations across 28 global cloud regions.' Do not inflate to '10,000+ enterprises' or 'millions of users'.",
  },
  {
    id: "AA-301",
    category: "Approved Assets",
    title: "Brand Colour Palette & WCAG Contrast System",
    version: "v2.5",
    lastUpdated: "2026-08-12",
    tags: ["colors", "palette", "hex", "contrast", "magenta", "yellow", "visual"],
    rejectionCount: 2,
    overrideCount: 1,
    content:
      "Approved Brand Hex Palette: Nimbus Deep Navy (#0F172A), Horizon Cobalt (#1D4ED8), Signal Teal (#0D9488), Cloud Slate (#F8FAFC), Pure White (#FFFFFF). Strictly prohibited off-palette hues: Neon Magenta (#FF00FF / #FF007F), Electric Yellow (#FFE600), and hot pink gradients. All text over background imagery must maintain >= 4.5:1 WCAG AA contrast ratio.",
  },
  {
    id: "AA-302",
    category: "Approved Assets",
    title: "Logo Proportions, Clear Space & Iconography",
    version: "v3.0",
    lastUpdated: "2026-07-22",
    tags: ["logo", "icon", "stretch", "clear space", "visual", "banner"],
    rejectionCount: 0,
    overrideCount: 0,
    content:
      "The Nimbus Cloud mark must preserve its locked 1:1 geometric aspect ratio with minimum clear space of 25% around the mark. Never stretch horizontally, warp, apply neon outlines, or crowd the logo with dense clip-art server icons.",
  },
  {
    id: "AA-303",
    category: "Approved Assets",
    title: "Promotional Banner Layout & Copy Density",
    version: "v2.1",
    lastUpdated: "2026-09-09",
    tags: ["banner", "layout", "text-heavy", "visual", "ad"],
    rejectionCount: 3,
    overrideCount: 2,
    content:
      "Visual ad banners must follow a clean focal hierarchy: maximum 1 concise headline (up to 8 words in sentence case) and 1 primary CTA. Avoid text-heavy layouts (>20% canvas covered by copy), stacked all-caps bullet lists inside images, or repeated 'LIMITED TIME OFFER' stamps.",
  },
  {
    id: "CD-401",
    category: "Confidential Documents",
    title: "Project Stratos — Unannounced Serverless GPU Engine",
    version: "v0.9",
    lastUpdated: "2026-10-15",
    restricted: true,
    tags: ["project stratos", "hypergpu", "apexbio", "confidential", "embargo", "nda"],
    rejectionCount: 0,
    overrideCount: 0,
    content:
      "STRICTLY CONFIDENTIAL / EMBARGOED UNTIL NOV 18, 2026: Internal codename 'Project Stratos' (commercial candidate name 'Nimbus HyperGPU') and private design-partner trials with 'ApexBio Genomics' are under strict mutual NDA. Any external mention of Project Stratos, HyperGPU, or ApexBio Genomics prior to embargo lift is a critical legal & confidentiality violation.",
  },
  {
    id: "CD-402",
    category: "Confidential Documents",
    title: "Q4 M&A Pipeline & Internal Gross Margin Memo",
    version: "v1.1",
    lastUpdated: "2026-10-10",
    restricted: true,
    tags: ["kubepulse", "acquisition", "78.4%", "margin", "confidential"],
    rejectionCount: 0,
    overrideCount: 0,
    content:
      "STRICTLY CONFIDENTIAL: Pending acquisition target 'KubePulse Telemetry' and internal non-GAAP gross margin figures (78.4%) are restricted to executive committee review and must never appear in marketing, blog, or social copy.",
  },
];

export function computeRoutingTier(
  score: number,
  findings: Finding[]
): RoutingTier {
  const activeFindings = findings.filter(
    (f) => f.actionStatus !== "accepted" && f.actionStatus !== "edited"
  );
  const hasLegalOrConfidential = activeFindings.some(
    (f) => f.isLegalSensitive || f.category === "Confidential Leakage"
  );
  const hasCritical = activeFindings.some((f) => f.severity === "critical");

  if (hasLegalOrConfidential) {
    return "Brand Manager Escalation";
  }
  if (score >= 90 && !hasCritical) {
    return "Light-Touch Review";
  }
  return "Full Review";
}

export function recalculateScore(findings: Finding[]): number {
  let deductions = 0;
  for (const f of findings) {
    if (f.actionStatus === "accepted" || f.actionStatus === "edited" || f.actionStatus === "overridden") {
      continue;
    }
    if (f.severity === "critical") deductions += 20;
    else if (f.severity === "major") deductions += 12;
    else deductions += 5;
  }
  return Math.max(12, Math.min(100, 100 - deductions));
}

export function retrieveRelevantGuidelines(
  submission: {
    title: string;
    format: string;
    contentText: string;
    altText?: string;
    imageUrl?: string;
  },
  knowledgeBase: KnowledgeItem[]
): KnowledgeItem[] {
  const combinedText = `${submission.title} ${submission.contentText} ${
    submission.altText || ""
  }`.toLowerCase();

  const scored = knowledgeBase.map((item) => {
    let score = 1; // Include core baseline rules
    for (const tag of item.tags) {
      if (combinedText.includes(tag.toLowerCase())) {
        score += 4;
      }
    }
    if (item.restricted) {
      score += 3; // Always check confidential leakage rules
    }
    if (
      (submission.format === "image_banner" || submission.imageUrl) &&
      (item.category === "Approved Assets" || item.id === "BG-103")
    ) {
      score += 5;
    }
    if (item.category === "Brand Guidelines") {
      score += 2;
    }
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}

export const DEMO_SCENARIO_SUBMISSIONS: ContentSubmission[] = [
  {
    id: "DEMO-01",
    title: "Q4 LinkedIn Launch Post — Cloud Compute Teaser",
    format: "social_post",
    channel: "LinkedIn",
    targetAudience: "CTOs, VPs of Infrastructure & Platform Leads",
    authorType: "AI-Generated",
    team: "Growth Marketing",
    intendedPurpose:
      "Generate excitement for our high-speed container compute performance and drive enterprise teams to start a free trial.",
    originalText: `BLAZINGLY FAST INFRASTRUCTURE IS HERE! 🚀🚀🚀

NimbusCloud is officially the #1 fastest cloud on the planet! Over 2 million users already rely on our 100% secure and unhackable platform with 100% uptime guaranteed.

Wait until you see what we built with Project Stratos for ApexBio Genomics — start your free trial today!`,
    currentText: `BLAZINGLY FAST INFRASTRUCTURE IS HERE! 🚀🚀🚀

NimbusCloud is officially the #1 fastest cloud on the planet! Over 2 million users already rely on our 100% secure and unhackable platform with 100% uptime guaranteed.

Wait until you see what we built with Project Stratos for ApexBio Genomics — start your free trial today!`,
    altText: "",
    status: "AI Reviewed",
    routingTier: "Brand Manager Escalation",
    initialScore: 18,
    currentScore: 18,
    summary:
      "Critical brand governance blocks detected: contains an embargoed confidential NDA leak (Project Stratos / ApexBio Genomics), three legally prohibited absolutes (#1 fastest, 100% secure, 100% uptime), unverified user stats, and banned terminology.",
    needsHumanReview: true,
    escalationReason:
      "Escalated to Brand Manager: Contains confidential embargoed codename (CD-401) and legal-sensitive SLA/security absolutes (FC-201, FC-202).",
    retrievedSourceIds: [
      "CD-401",
      "BG-101",
      "BG-102",
      "BG-103",
      "FC-201",
      "FC-202",
      "FC-205",
      "FC-206",
    ],
    isDemoScenario: true,
    createdAt: "2026-10-24T07:15:00Z",
    updatedAt: "2026-10-24T07:20:00Z",
    findings: [
      {
        id: "F-101",
        category: "Confidential Leakage",
        severity: "critical",
        flaggedTextOrRegion:
          "Wait until you see what we built with Project Stratos for ApexBio Genomics — start your free trial today!",
        explanation:
          "Mentions an embargoed internal product codename and a design partner protected under strict mutual NDA prior to the November 18, 2026 announcement.",
        sourceId: "CD-401",
        sourceName: "Project Stratos — Unannounced Serverless GPU Engine",
        sourceVersion: "v0.9",
        quotedRule:
          "STRICTLY CONFIDENTIAL / EMBARGOED UNTIL NOV 18, 2026: Internal codename and private design-partner trials are under strict mutual NDA. Any external mention prior to embargo lift is a critical legal & confidentiality violation.",
        confidence: 99,
        suggestedRewrite:
          "Explore our latest multi-region container architecture and start your 14-day free trial with $300 in compute credits today.",
        isLegalSensitive: true,
        isUnverifiedClaim: false,
        actionStatus: "pending",
      },
      {
        id: "F-102",
        category: "Tone & Voice",
        severity: "major",
        flaggedTextOrRegion: "BLAZINGLY FAST INFRASTRUCTURE IS HERE! 🚀🚀🚀",
        explanation:
          "Uses all-caps multi-word shouting (violating screen-reader accessibility), the banned buzzword 'blazingly fast', and repetitive emojis instead of calm, empirical engineering authority.",
        sourceId: "BG-101",
        sourceName: "Voice & Tone Principles",
        sourceVersion: "v3.2",
        quotedRule:
          "Nimbus Cloud communicates with calm, empirical engineering authority. Do NOT use sensationalist hyperbole, multiple exclamation marks, or all-caps shouting. Banned buzzwords include 'blazingly fast'.",
        confidence: 96,
        suggestedRewrite:
          "Engineered for predictable, low-latency container orchestration at scale.",
        isLegalSensitive: false,
        isUnverifiedClaim: false,
        actionStatus: "pending",
      },
      {
        id: "F-103",
        category: "Unsupported Claim",
        severity: "critical",
        flaggedTextOrRegion:
          "NimbusCloud is officially the #1 fastest cloud on the planet!",
        explanation:
          "Uses camelCase 'NimbusCloud' (banned format) and makes an unsubstantiated superlative claim ('#1 fastest cloud on the planet') instead of citing the verified Q2 2026 CloudBench latency benchmark.",
        sourceId: "FC-205",
        sourceName: "Cold-Start Latency & Performance Benchmarks",
        sourceVersion: "v2.2",
        quotedRule:
          "Approved benchmark claim: 'Reduces p99 container cold-start latency by up to 62% compared to standard Kubernetes node autoscalers, verified by the Q2 2026 CloudBench audit (n=1,200 production workloads).' Never claim '#1 fastest cloud on the planet'.",
        confidence: 98,
        suggestedRewrite:
          "Nimbus Cloud reduces p99 container cold-start latency by up to 62%, verified by the Q2 2026 CloudBench audit.",
        isLegalSensitive: true,
        isUnverifiedClaim: false,
        actionStatus: "pending",
      },
      {
        id: "F-104",
        category: "Unsupported Claim",
        severity: "critical",
        flaggedTextOrRegion:
          "Over 2 million users already rely on our 100% secure and unhackable platform with 100% uptime guaranteed.",
        explanation:
          "Combines an unverified customer count ('2 million users'), the banned term 'users', and two legally prohibited security/SLA absolutes ('100% secure and unhackable' and '100% uptime guaranteed').",
        sourceId: "FC-201",
        sourceName: "Multi-Region Uptime & SLA Guarantee",
        sourceVersion: "v4.0",
        quotedRule:
          "Unverified – needs evidence ('2 million users' contradicts FC-206: 'Trusted by 4,800+ engineering organizations'). Furthermore, FC-201 & FC-202 strictly prohibit claiming '100% uptime', '100% secure', or 'unhackable'.",
        confidence: 97,
        suggestedRewrite:
          "More than 4,800 engineering organizations rely on our SOC 2 Type II and ISO 27001 certified platform, backed by a contractual 99.99% multi-region uptime SLA.",
        isLegalSensitive: true,
        isUnverifiedClaim: true,
        actionStatus: "pending",
      },
    ],
    auditTrail: [
      {
        id: "AE-101",
        timestamp: "2026-10-24T07:15:00Z",
        actorRole: "creator",
        actorName: "Maya Lin (Creator)",
        action: "Created Submission",
        details:
          "Drafted LinkedIn launch post (tagged AI-Generated) with intended purpose to drive free trial signups.",
      },
      {
        id: "AE-102",
        timestamp: "2026-10-24T07:20:00Z",
        actorRole: "creator",
        actorName: "BrandGuard Gemini Engine",
        action: "Completed AI Brand Review",
        details:
          "Flagged 4 issues (3 critical, 1 major) across 8 retrieved Knowledge Base sources. Initial Compliance Score: 18/100.",
      },
    ],
    comments: [
      {
        id: "CM-101",
        timestamp: "2026-10-24T07:22:00Z",
        authorRole: "reviewer",
        authorName: "David Vance (Reviewer)",
        text: "Please accept the AI rewrites for the Project Stratos NDA leak and the 99.99% SLA wording before submitting for final sign-off.",
      },
    ],
  },
  {
    id: "DEMO-02",
    title: "Why Migrating to NimbusCloud Saves Engineering Teams 73% in 2026",
    format: "blog_article",
    channel: "Company Engineering Blog",
    targetAudience: "DevOps Architects & FinOps Directors",
    authorType: "Agency",
    team: "Content & Editorial",
    intendedPurpose:
      "Explain transparent cloud cost predictability and invite technical evaluators to test Nimbus Cloud with our self-serve trial.",
    originalText: `Modern DevOps users are tired of unpredictable cloud bills. When clients switch their workloads to NimbusCloud, our AI-magic autoscaler cuts total engineering payroll by 73% within the first week.

Pricing is simple and built for every team: our Starter plan is just $29/seat/month and our Pro plan is $79/seat/month. Every new account includes a full 30-day free trial so your users can test multi-region failover with zero downtime guaranteed.`,
    currentText: `Modern DevOps users are tired of unpredictable cloud bills. When clients switch their workloads to NimbusCloud, our AI-magic autoscaler cuts total engineering payroll by 73% within the first week.

Pricing is simple and built for every team: our Starter plan is just $29/seat/month and our Pro plan is $79/seat/month. Every new account includes a full 30-day free trial so your users can test multi-region failover with zero downtime guaranteed.`,
    altText: "",
    status: "AI Reviewed",
    routingTier: "Brand Manager Escalation",
    initialScore: 34,
    currentScore: 34,
    summary:
      "Contains expired FY25 pricing and trial terms ($29/$79 plans and 30-day trial expired March 2026), an unverified 73% payroll reduction claim, banned terms ('users', 'clients', 'NimbusCloud', 'AI-magic'), and a prohibited 'zero downtime' guarantee.",
    needsHumanReview: true,
    escalationReason:
      "Escalated: Contains unverified financial savings claim, expired pricing figures (FC-203), and legal-sensitive zero-downtime guarantee (FC-201).",
    retrievedSourceIds: [
      "FC-203",
      "FC-204",
      "BG-102",
      "FC-201",
      "FC-205",
      "BG-101",
    ],
    isDemoScenario: true,
    createdAt: "2026-10-24T06:40:00Z",
    updatedAt: "2026-10-24T06:45:00Z",
    findings: [
      {
        id: "F-201",
        category: "Terminology",
        severity: "major",
        flaggedTextOrRegion: "Modern DevOps users are tired of unpredictable cloud bills.",
        explanation:
          "Uses the non-preferred term 'users' instead of 'engineering teams' or 'customers'.",
        sourceId: "BG-102",
        sourceName: "Terminology & Preferred Lexicon",
        sourceVersion: "v2.4",
        quotedRule:
          "Always refer to people using our platform as 'customers', 'developers', or 'engineering teams' — NEVER 'users' or 'clients'.",
        confidence: 98,
        suggestedRewrite:
          "Modern DevOps engineering teams are tired of unpredictable cloud bills.",
        isLegalSensitive: false,
        isUnverifiedClaim: false,
        actionStatus: "pending",
      },
      {
        id: "F-202",
        category: "Unsupported Claim",
        severity: "critical",
        flaggedTextOrRegion:
          "When clients switch their workloads to NimbusCloud, our AI-magic autoscaler cuts total engineering payroll by 73% within the first week.",
        explanation:
          "Contains an unverified statistical claim ('cuts total engineering payroll by 73%') with no supporting evidence in the Knowledge Base, plus banned terms ('clients', 'NimbusCloud', 'AI-magic').",
        sourceId: "FC-205",
        sourceName: "Cold-Start Latency & Performance Benchmarks",
        sourceVersion: "v2.2",
        quotedRule:
          "Unverified – needs evidence: No approved source supports a '73% payroll reduction' claim. Also violates BG-102 ('clients', 'NimbusCloud', 'AI-magic'). Use verified CloudBench performance and FC-204 usage metering facts instead.",
        confidence: 95,
        suggestedRewrite:
          "When customers migrate their workloads to Nimbus Cloud, our automated container autoscaler reduces p99 cold-start latency by up to 62% and aligns compute spend directly with actual vCPU usage.",
        isLegalSensitive: true,
        isUnverifiedClaim: true,
        actionStatus: "pending",
      },
      {
        id: "F-203",
        category: "Outdated Information",
        severity: "critical",
        flaggedTextOrRegion:
          "Pricing is simple and built for every team: our Starter plan is just $29/seat/month and our Pro plan is $79/seat/month.",
        explanation:
          "Cites legacy FY25 pricing ($29/seat Starter and $79/seat Pro) which officially expired on 2026-03-31.",
        sourceId: "FC-203",
        sourceName: "Legacy Seat Pricing & Trial Terms (FY25 — EXPIRED)",
        sourceVersion: "v1.8",
        quotedRule:
          "OUTDATED / EXPIRED AS OF 2026-03-31: Legacy Starter plan at $29/seat/month, Legacy Pro plan at $79/seat/month, and 30-day free trial offer are retired. Approved FY26/27 pricing (FC-204 v2.0): Team tier starts at $49/seat/month; Enterprise compute is $0.04/vCPU-hour.",
        confidence: 99,
        suggestedRewrite:
          "Pricing is transparent and predictable: our Team tier starts at $49/seat/month, while Enterprise workloads scale with usage-based metering at $0.04 per vCPU-hour.",
        isLegalSensitive: true,
        isUnverifiedClaim: false,
        actionStatus: "pending",
      },
      {
        id: "F-204",
        category: "Outdated Information",
        severity: "major",
        flaggedTextOrRegion:
          "Every new account includes a full 30-day free trial so your users can test multi-region failover with zero downtime guaranteed.",
        explanation:
          "Cites the retired 30-day trial (now 14 days with $300 credits per FC-204), uses the banned word 'users', and claims 'zero downtime guaranteed' (prohibited by FC-201).",
        sourceId: "FC-204",
        sourceName: "Current FY26/27 Pricing & Trial Structure",
        sourceVersion: "v2.0",
        quotedRule:
          "Standard self-serve free trial is 14 days with $300 in compute credits (FC-204 v2.0). Strictly prohibited: claiming '100% uptime' or 'zero downtime guaranteed' (FC-201 v4.0).",
        confidence: 97,
        suggestedRewrite:
          "Every new account includes a 14-day free trial with $300 in compute credits so your engineering team can test multi-region failover backed by our 99.99% uptime SLA.",
        isLegalSensitive: true,
        isUnverifiedClaim: false,
        actionStatus: "pending",
      },
    ],
    auditTrail: [
      {
        id: "AE-201",
        timestamp: "2026-10-24T06:40:00Z",
        actorRole: "creator",
        actorName: "NorthStar Agency (Creator)",
        action: "Created Submission",
        details: "Submitted blog draft on FinOps migration savings.",
      },
      {
        id: "AE-202",
        timestamp: "2026-10-24T06:45:00Z",
        actorRole: "creator",
        actorName: "BrandGuard Gemini Engine",
        action: "Completed AI Brand Review",
        details:
          "Detected 4 issues including expired FY25 pricing (FC-203) and an unverified 73% payroll claim. Initial Score: 34/100.",
      },
    ],
    comments: [],
  },
  {
    id: "DEMO-03",
    title: "Q4 Paid Social Display Banner — Cloud Campaign",
    format: "image_banner",
    channel: "LinkedIn & Programmatic Display",
    targetAudience: "Enterprise IT Decision Makers",
    authorType: "Employee",
    team: "Brand & Creative",
    intendedPurpose:
      "Capture visual attention in paid social feeds and highlight our enterprise cloud infrastructure reliability.",
    originalText: `UNLEASH THE POWER OF CLOUD WITH OUR ADVANCED PLATFORM!
LIMITED TIME OFFER — JOIN NOW FOR 100% SECURE DATA STORAGE FOR ALL USERS!`,
    currentText: `UNLEASH THE POWER OF CLOUD WITH OUR ADVANCED PLATFORM!
LIMITED TIME OFFER — JOIN NOW FOR 100% SECURE DATA STORAGE FOR ALL USERS!`,
    altText: "",
    imageUrl: DEMO_BANNER_IMAGE_PATH,
    status: "AI Reviewed",
    routingTier: "Brand Manager Escalation",
    initialScore: 22,
    currentScore: 22,
    summary:
      "Gemini Vision & Copy Audit: Banner image uses prohibited neon magenta (#FF00FF) and electric yellow (#FFE600) palette, horizontally stretches the cloud emblem, fails WCAG AA contrast on light yellow headline text, crowds >50% of the canvas with all-caps text, and omits image alt text.",
    needsHumanReview: true,
    escalationReason:
      "Visual palette, logo geometry, and accessibility contrast violations require creative revision and Brand Manager sign-off.",
    retrievedSourceIds: [
      "AA-301",
      "AA-302",
      "AA-303",
      "BG-103",
      "BG-101",
      "BG-102",
      "FC-202",
    ],
    isDemoScenario: true,
    createdAt: "2026-10-24T06:10:00Z",
    updatedAt: "2026-10-24T06:15:00Z",
    findings: [
      {
        id: "F-301",
        category: "Visual Consistency",
        severity: "critical",
        flaggedTextOrRegion:
          "[Visual Region: Full Banner Canvas — Neon Magenta (#FF00FF) & Electric Yellow (#FFE600) Background]",
        explanation:
          "Banner uses high-saturation fluorescent neon magenta and electric yellow geometric shapes, which are explicitly banned in the Nimbus Cloud colour system.",
        sourceId: "AA-301",
        sourceName: "Brand Colour Palette & WCAG Contrast System",
        sourceVersion: "v2.5",
        quotedRule:
          "Approved Brand Hex Palette: Nimbus Deep Navy (#0F172A), Horizon Cobalt (#1D4ED8), Signal Teal (#0D9488), Cloud Slate (#F8FAFC). Strictly prohibited off-palette hues: Neon Magenta (#FF00FF / #FF007F) and Electric Yellow (#FFE600).",
        confidence: 99,
        suggestedRewrite:
          "[Visual Fix Applied]: Replace background canvas with Nimbus Deep Navy (#0F172A) and Horizon Cobalt (#1D4ED8) accent geometry with Crisp White (#FFFFFF) typography.",
        isLegalSensitive: false,
        isUnverifiedClaim: false,
        actionStatus: "pending",
      },
      {
        id: "F-302",
        category: "Visual Consistency",
        severity: "major",
        flaggedTextOrRegion:
          "[Visual Region: Top-Right Corner — Horizontally Stretched Cloud Mark & Multi-Icon Clutter]",
        explanation:
          "The cloud emblem in the upper-right quadrant is horizontally stretched out of its locked 1:1 aspect ratio and surrounded by dense neon server icons violating the 25% clear-space rule.",
        sourceId: "AA-302",
        sourceName: "Logo Proportions, Clear Space & Iconography",
        sourceVersion: "v3.0",
        quotedRule:
          "The Nimbus Cloud mark must preserve its locked 1:1 geometric aspect ratio with minimum clear space of 25% around the mark. Never stretch horizontally, warp, apply neon outlines, or crowd the logo.",
        confidence: 94,
        suggestedRewrite:
          "[Visual Fix Applied]: Restore 1:1 locked aspect ratio for the Nimbus Cloud emblem in top-left with 25% clear space and remove surrounding clip-art server icons.",
        isLegalSensitive: false,
        isUnverifiedClaim: false,
        actionStatus: "pending",
      },
      {
        id: "F-303",
        category: "Accessibility",
        severity: "critical",
        flaggedTextOrRegion:
          "[Visual Region: Center Copy Block & Missing Alt Text — Low-Contrast Yellow Text on Lavender/Pink]",
        explanation:
          "Light yellow all-caps text over a pale pink/lavender center fill yields an estimated ~1.6:1 contrast ratio (failing WCAG AA 4.5:1 minimum), and the image submission has no alt text provided.",
        sourceId: "BG-103",
        sourceName: "Accessibility & Inclusive Copy Standards",
        sourceVersion: "v1.9",
        quotedRule:
          "All visual assets and banners MUST include descriptive alt text of at least 8 words describing both visual layout and embedded copy. All text over background imagery must maintain >= 4.5:1 WCAG AA contrast ratio.",
        confidence: 97,
        suggestedRewrite:
          "Alt Text Added: 'Nimbus Cloud enterprise infrastructure banner showing multi-region SOC 2 compliant container architecture and 99.99% uptime SLA.'",
        isLegalSensitive: false,
        isUnverifiedClaim: false,
        actionStatus: "pending",
      },
      {
        id: "F-304",
        category: "Tone & Voice",
        severity: "major",
        flaggedTextOrRegion: `UNLEASH THE POWER OF CLOUD WITH OUR ADVANCED PLATFORM!
LIMITED TIME OFFER — JOIN NOW FOR 100% SECURE DATA STORAGE FOR ALL USERS!`,
        explanation:
          "Caption and banner copy use all-caps shouting, aggressive sales urgency ('UNLEASH THE POWER', 'LIMITED TIME OFFER'), the prohibited absolute '100% SECURE', and the banned term 'users'.",
        sourceId: "BG-101",
        sourceName: "Voice & Tone Principles",
        sourceVersion: "v3.2",
        quotedRule:
          "Do NOT use sensationalist hyperbole or aggressive sales urgency ('UNLEASH THE POWER', 'LIMITED TIME OFFER'). Never claim '100% secure' (FC-202) or refer to customers as 'users' (BG-102).",
        confidence: 98,
        suggestedRewrite: `Scale multi-region container workloads with predictable latency on Nimbus Cloud.
Explore our SOC 2 Type II certified platform built for enterprise engineering teams.`,
        isLegalSensitive: true,
        isUnverifiedClaim: false,
        actionStatus: "pending",
      },
    ],
    auditTrail: [
      {
        id: "AE-301",
        timestamp: "2026-10-24T06:10:00Z",
        actorRole: "creator",
        actorName: "Maya Lin (Creator)",
        action: "Uploaded Visual Asset & Caption",
        details: "Uploaded 16:9 programmatic display banner with companion ad copy.",
      },
      {
        id: "AE-302",
        timestamp: "2026-10-24T06:15:00Z",
        actorRole: "creator",
        actorName: "BrandGuard Gemini Vision Engine",
        action: "Completed Multimodal Vision & Copy Audit",
        details:
          "Flagged off-palette neon hues (#FF00FF/#FFE600), logo aspect-ratio distortion, WCAG contrast failure, missing alt text, and caption claims. Score: 22/100.",
      },
    ],
    comments: [],
  },
  {
    id: "SUB-104",
    title: "Q4 Enterprise Customer Newsletter — Multi-Region Failover Guide",
    format: "email_copy",
    channel: "Customer Lifecycle Email",
    targetAudience: "Existing Enterprise Platform Engineers",
    authorType: "Employee",
    team: "Product Marketing",
    intendedPurpose:
      "Educate existing enterprise customers on configuring active-active multi-region failover under our 99.99% SLA.",
    originalText: `Hello Engineering Teams,

As your organization prepares for peak Q4 traffic, Nimbus Cloud makes it straightforward to validate active-active failover across 28 global cloud regions. Our architecture reduces p99 container cold-start latency by up to 62% (verified by the Q2 2026 CloudBench audit) while maintaining our contractual 99.99% uptime SLA.

Read the step-by-step runbook in the documentation portal to test regional evacuations with your users.`,
    currentText: `Hello Engineering Teams,

As your organization prepares for peak Q4 traffic, Nimbus Cloud makes it straightforward to validate active-active failover across 28 global cloud regions. Our architecture reduces p99 container cold-start latency by up to 62% (verified by the Q2 2026 CloudBench audit) while maintaining our contractual 99.99% uptime SLA.

Read the step-by-step runbook in the documentation portal to test regional evacuations with your engineering teams.`,
    altText: "",
    status: "In Review",
    routingTier: "Light-Touch Review",
    initialScore: 88,
    currentScore: 100,
    summary:
      "Strong technical alignment with approved SLA and benchmark facts. One minor terminology issue ('users') was accepted and resolved by the creator.",
    needsHumanReview: false,
    escalationReason:
      "Score >= 90 with zero critical or legal issues: routed to Light-Touch Review.",
    retrievedSourceIds: ["BG-102", "FC-201", "FC-205", "FC-206"],
    isDemoScenario: false,
    createdAt: "2026-10-23T14:20:00Z",
    updatedAt: "2026-10-23T15:05:00Z",
    findings: [
      {
        id: "F-401",
        category: "Terminology",
        severity: "minor",
        flaggedTextOrRegion:
          "Read the step-by-step runbook in the documentation portal to test regional evacuations with your users.",
        explanation:
          "Uses 'users' instead of 'engineering teams' or 'customers'.",
        sourceId: "BG-102",
        sourceName: "Terminology & Preferred Lexicon",
        sourceVersion: "v2.4",
        quotedRule:
          "Always refer to people using our platform as 'customers', 'developers', or 'engineering teams' — NEVER 'users' or 'clients'.",
        confidence: 99,
        suggestedRewrite:
          "Read the step-by-step runbook in the documentation portal to test regional evacuations with your engineering teams.",
        isLegalSensitive: false,
        isUnverifiedClaim: false,
        actionStatus: "accepted",
        appliedText:
          "Read the step-by-step runbook in the documentation portal to test regional evacuations with your engineering teams.",
      },
    ],
    auditTrail: [
      {
        id: "AE-401",
        timestamp: "2026-10-23T14:20:00Z",
        actorRole: "creator",
        actorName: "Maya Lin (Creator)",
        action: "Created & Ran AI Review",
        details: "Initial score 88/100 with 1 minor terminology finding.",
      },
      {
        id: "AE-402",
        timestamp: "2026-10-23T15:00:00Z",
        actorRole: "creator",
        actorName: "Maya Lin (Creator)",
        action: "Accepted AI Suggestion (F-401)",
        details: "Replaced 'users' with 'engineering teams'. Compliance score updated to 100/100.",
      },
      {
        id: "AE-403",
        timestamp: "2026-10-23T15:05:00Z",
        actorRole: "creator",
        actorName: "Maya Lin (Creator)",
        action: "Submitted for Approval",
        details: "Auto-routed to Light-Touch Review (Score 100/100, 0 critical findings).",
      },
    ],
    comments: [
      {
        id: "CM-401",
        timestamp: "2026-10-23T15:12:00Z",
        authorRole: "creator",
        authorName: "Maya Lin (Creator)",
        text: "Accepted the terminology fix. Ready for quick light-touch approval.",
      },
    ],
  },
  {
    id: "SUB-105",
    title: "Google Search Ad Copy — SOC 2 Compliant Kubernetes",
    format: "ad_copy",
    channel: "Google Search Ads",
    targetAudience: "CISOs & Cloud Security Architects",
    authorType: "Employee",
    team: "Demand Gen",
    intendedPurpose:
      "Drive high-intent search clicks from security-conscious cloud infrastructure buyers.",
    originalText: `Nimbus Cloud — SOC 2 Type II & ISO 27001 Certified Cloud.
Deploy workloads across 28 global regions with AES-256 encryption and a 99.99% uptime SLA. Start a 14-day free trial with $300 in compute credits.`,
    currentText: `Nimbus Cloud — SOC 2 Type II & ISO 27001 Certified Cloud.
Deploy workloads across 28 global regions with AES-256 encryption and a 99.99% uptime SLA. Start a 14-day free trial with $300 in compute credits.`,
    altText: "",
    status: "Approved",
    routingTier: "Light-Touch Review",
    initialScore: 96,
    currentScore: 96,
    summary:
      "Fully aligned with FC-201, FC-202, FC-204, and FC-206. All security, SLA, and trial terms match current FY26/27 approved facts.",
    needsHumanReview: false,
    escalationReason: "No escalations required.",
    retrievedSourceIds: ["FC-201", "FC-202", "FC-204", "FC-206"],
    isDemoScenario: false,
    createdAt: "2026-10-21T09:00:00Z",
    updatedAt: "2026-10-21T11:30:00Z",
    approvedAt: "2026-10-21T11:30:00Z",
    approvalDurationHours: 2.5,
    findings: [],
    auditTrail: [
      {
        id: "AE-501",
        timestamp: "2026-10-21T09:00:00Z",
        actorRole: "creator",
        actorName: "Marcus Thorne (Creator)",
        action: "Created & Ran AI Review",
        details: "Scored 96/100 on first pass.",
      },
      {
        id: "AE-502",
        timestamp: "2026-10-21T11:30:00Z",
        actorRole: "reviewer",
        actorName: "David Vance (Reviewer)",
        action: "Approved for Publication",
        details: "Verified SOC 2 Type II and 14-day trial wording. AI-assisted, human-approved.",
      },
    ],
    comments: [],
  },
  {
    id: "SUB-106",
    title: "Partner Co-Marketing Brief — Healthcare Genomics Cloud",
    format: "blog_article",
    channel: "Partner Landing Page",
    targetAudience: "Bioinformatics & Clinical IT Leaders",
    authorType: "Agency",
    team: "Partner Marketing",
    intendedPurpose:
      "Highlight HIPAA-compliant high-throughput compute for life sciences teams.",
    originalText: `Healthcare clients require deterministic performance for genomic sequencing pipelines. Nimbus Cloud provides HIPAA-compliant compute with AES-256 encryption at rest so your end-users can process clinical datasets securely.`,
    currentText: `Healthcare customers require deterministic performance for genomic sequencing pipelines. Nimbus Cloud provides HIPAA-compliant compute with AES-256 encryption at rest so your end-users can process clinical datasets securely.`,
    altText: "",
    status: "Changes Requested",
    routingTier: "Full Review",
    initialScore: 76,
    currentScore: 88,
    summary:
      "Creator accepted replacing 'clients' with 'customers', but rejected replacing 'end-users' citing standard clinical bioinformatics terminology.",
    needsHumanReview: true,
    escalationReason:
      "Creator rejected finding F-602 on BG-102 ('end-users' in clinical context); requires reviewer adjudication.",
    retrievedSourceIds: ["BG-102", "FC-202"],
    isDemoScenario: false,
    createdAt: "2026-10-22T10:00:00Z",
    updatedAt: "2026-10-22T16:20:00Z",
    findings: [
      {
        id: "F-601",
        category: "Terminology",
        severity: "major",
        flaggedTextOrRegion:
          "Healthcare clients require deterministic performance for genomic sequencing pipelines.",
        explanation:
          "Uses banned term 'clients' instead of 'customers' or 'organizations'.",
        sourceId: "BG-102",
        sourceName: "Terminology & Preferred Lexicon",
        sourceVersion: "v2.4",
        quotedRule:
          "Always refer to people using our platform as 'customers', 'developers', or 'engineering teams' — NEVER 'users' or 'clients'.",
        confidence: 97,
        suggestedRewrite:
          "Healthcare customers require deterministic performance for genomic sequencing pipelines.",
        isLegalSensitive: false,
        isUnverifiedClaim: false,
        actionStatus: "accepted",
        appliedText:
          "Healthcare customers require deterministic performance for genomic sequencing pipelines.",
      },
      {
        id: "F-602",
        category: "Terminology",
        severity: "minor",
        flaggedTextOrRegion:
          "Nimbus Cloud provides HIPAA-compliant compute with AES-256 encryption at rest so your end-users can process clinical datasets securely.",
        explanation:
          "Uses 'end-users', which triggers the BG-102 restriction on 'users'.",
        sourceId: "BG-102",
        sourceName: "Terminology & Preferred Lexicon",
        sourceVersion: "v2.4",
        quotedRule:
          "Always refer to people using our platform as 'customers', 'developers', or 'engineering teams' — NEVER 'users' or 'clients'.",
        confidence: 81,
        suggestedRewrite:
          "Nimbus Cloud provides HIPAA-compliant compute with AES-256 encryption at rest so your research teams can process clinical datasets securely.",
        isLegalSensitive: false,
        isUnverifiedClaim: false,
        actionStatus: "rejected",
        rejectionReason:
          "In B2B2C healthcare compliance docs, we need to distinguish our customer (the hospital) from their downstream clinical end-users.",
      },
    ],
    auditTrail: [
      {
        id: "AE-601",
        timestamp: "2026-10-22T10:00:00Z",
        actorRole: "creator",
        actorName: "NorthStar Agency (Creator)",
        action: "Created & Ran AI Review",
        details: "Initial score 76/100.",
      },
      {
        id: "AE-602",
        timestamp: "2026-10-22T10:30:00Z",
        actorRole: "creator",
        actorName: "NorthStar Agency (Creator)",
        action: "Rejected Finding F-602 with Reason",
        details:
          "Reason: 'In B2B2C healthcare compliance docs, we need to distinguish our customer (the hospital) from their downstream clinical end-users.'",
      },
      {
        id: "AE-603",
        timestamp: "2026-10-22T16:20:00Z",
        actorRole: "reviewer",
        actorName: "David Vance (Reviewer)",
        action: "Requested Changes",
        details:
          "Asked creator to use 'clinical researchers' instead of 'end-users' while escalating BG-102 clarity to Brand Manager.",
      },
    ],
    comments: [
      {
        id: "CM-601",
        timestamp: "2026-10-22T16:20:00Z",
        authorRole: "reviewer",
        authorName: "David Vance (Reviewer)",
        text: "Good point on hospital vs downstream researchers — let's use 'clinical researchers' here, and I've flagged BG-102 for the Brand Manager to clarify B2B2C terminology.",
      },
    ],
  },
];
