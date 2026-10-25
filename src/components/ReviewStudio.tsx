import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  Lock,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  XCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  AuthorType,
  ContentFormat,
  ContentSubmission,
  Finding,
  KnowledgeItem,
  Severity,
  UserRole,
} from "../types";
import {
  computeRoutingTier,
  DEMO_BANNER_IMAGE_PATH,
  recalculateScore,
  retrieveRelevantGuidelines,
} from "../data/seedData";

interface ReviewStudioProps {
  submissions: ContentSubmission[];
  selectedSubmissionId: string;
  onSelectSubmission: (id: string) => void;
  onUpdateSubmission: (updated: ContentSubmission) => void;
  onCreateSubmission: (newSub: ContentSubmission) => void;
  knowledgeBase: KnowledgeItem[];
  currentRole: UserRole;
  onNavigateToBoard: () => void;
  onRecordRuleFriction: (sourceId: string, type: "reject" | "override") => void;
}

const FORMAT_LABELS: Record<ContentFormat, string> = {
  social_post: "Social Post",
  blog_article: "Blog / Article",
  email_copy: "Email Copy",
  ad_copy: "Ad Copy",
  image_banner: "Image Banner + Caption",
};

const ROLE_NAMES: Record<UserRole, string> = {
  creator: "Maya Lin (Creator)",
  reviewer: "David Vance (Reviewer)",
  brand_manager: "Elena Rostova (Brand Manager)",
};

export const ReviewStudio: React.FC<ReviewStudioProps> = ({
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  onUpdateSubmission,
  onCreateSubmission,
  knowledgeBase,
  currentRole,
  onNavigateToBoard,
  onRecordRuleFriction,
}) => {
  const activeSubmission =
    submissions.find((s) => s.id === selectedSubmissionId) || submissions[0];

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFormat, setNewFormat] = useState<ContentFormat>("social_post");
  const [newChannel, setNewChannel] = useState("LinkedIn");
  const [newAudience, setNewAudience] = useState("Enterprise Engineering Leaders");
  const [newAuthorType, setNewAuthorType] = useState<AuthorType>("Employee");
  const [newTeam, setNewTeam] = useState("Product Marketing");
  const [newPurpose, setNewPurpose] = useState("");
  const [newContentText, setNewContentText] = useState("");
  const [newAltText, setNewAltText] = useState("");
  const [newImageUrl, setNewImageUrl] = useState<string | undefined>(undefined);

  const [isRunningReview, setIsRunningReview] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [focusedFindingId, setFocusedFindingId] = useState<string | null>(null);
  const [expandedExplainIds, setExpandedExplainIds] = useState<Record<string, boolean>>({
    "F-101": true,
  });
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);
  const [customRewriteText, setCustomRewriteText] = useState<string>("");
  const [rejectingFindingId, setRejectingFindingId] = useState<string | null>(null);
  const [rejectionInput, setRejectionInput] = useState<string>("");
  const [overridingFindingId, setOverridingFindingId] = useState<string | null>(null);
  const [overrideInput, setOverrideInput] = useState<string>("");
  const [findingFilter, setFindingFilter] = useState<"all" | "pending" | "resolved">("all");
  const [showVisualFixedPreview, setShowVisualFixedPreview] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const retrievedSources = useMemo(() => {
    if (!activeSubmission) return [];
    if (
      activeSubmission.retrievedSourceIds &&
      activeSubmission.retrievedSourceIds.length > 0
    ) {
      return knowledgeBase.filter((k) =>
        activeSubmission.retrievedSourceIds!.includes(k.id)
      );
    }
    return retrieveRelevantGuidelines(
      {
        title: activeSubmission.title,
        format: activeSubmission.format,
        contentText: activeSubmission.currentText,
        altText: activeSubmission.altText,
        imageUrl: activeSubmission.imageUrl,
      },
      knowledgeBase
    );
  }, [activeSubmission, knowledgeBase]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isNewForm: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (isNewForm) {
        setNewImageUrl(result);
      } else if (activeSubmission) {
        onUpdateSubmission({
          ...activeSubmission,
          imageUrl: result,
          updatedAt: new Date().toISOString(),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContentText.trim()) return;

    const created: ContentSubmission = {
      id: `SUB-${Math.floor(200 + Math.random() * 799)}`,
      title: newTitle.trim(),
      format: newFormat,
      channel: newChannel.trim() || "General",
      targetAudience: newAudience.trim() || "Enterprise Buyers",
      authorType: newAuthorType,
      team: newTeam.trim() || "Marketing",
      intendedPurpose:
        newPurpose.trim() ||
        "Communicate Nimbus Cloud value proposition clearly to prospective customers.",
      originalText: newContentText,
      currentText: newContentText,
      altText: newAltText,
      imageUrl:
        newFormat === "image_banner"
          ? newImageUrl || DEMO_BANNER_IMAGE_PATH
          : newImageUrl,
      status: "Draft",
      routingTier: "Full Review",
      findings: [],
      auditTrail: [
        {
          id: `AE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action: "Created Draft Submission",
          details: `Created ${FORMAT_LABELS[newFormat]} draft with intended purpose: "${
            newPurpose.trim() || "Communicate product value"
          }".`,
        },
      ],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateSubmission(created);
    setIsCreatingNew(false);
    setNewTitle("");
    setNewPurpose("");
    setNewContentText("");
    setNewAltText("");
    setNewImageUrl(undefined);
  };

  const handleRunBrandReview = async () => {
    if (!activeSubmission) return;
    setIsRunningReview(true);
    setApiError(null);

    const matchedGuidelines = retrieveRelevantGuidelines(
      {
        title: activeSubmission.title,
        format: activeSubmission.format,
        contentText: activeSubmission.currentText,
        altText: activeSubmission.altText,
        imageUrl: activeSubmission.imageUrl,
      },
      knowledgeBase
    );

    try {
      const response = await fetch("/api/brand-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeSubmission.title,
          format: FORMAT_LABELS[activeSubmission.format],
          channel: activeSubmission.channel,
          targetAudience: activeSubmission.targetAudience,
          authorType: activeSubmission.authorType,
          intendedPurpose: activeSubmission.intendedPurpose,
          contentText: activeSubmission.currentText,
          altText: activeSubmission.altText,
          imageUrl: activeSubmission.imageUrl,
          retrievedGuidelines: matchedGuidelines,
          currentDate: "2026-10-24",
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(
          data.error || `Server returned status ${response.status}`
        );
      }

      if (!Array.isArray(data.findings) || typeof data.overallScore !== "number") {
        throw new Error(
          "Received invalid JSON schema from AI review engine. Please retry."
        );
      }

      const normalizedFindings: Finding[] = data.findings.map(
        (f: Finding, idx: number) => ({
          id: f.id || `F-${Date.now()}-${idx + 1}`,
          category: f.category || "Tone & Voice",
          severity:
            f.severity === "critical" ||
            f.severity === "major" ||
            f.severity === "minor"
              ? f.severity
              : "major",
          flaggedTextOrRegion: f.flaggedTextOrRegion || "",
          explanation: f.explanation || "Violates approved brand guideline.",
          sourceId: f.sourceId || "BG-101",
          sourceName: f.sourceName || "Brand Guidelines",
          sourceVersion: f.sourceVersion || "v1.0",
          quotedRule: f.quotedRule || "Unverified – needs evidence",
          confidence:
            typeof f.confidence === "number"
              ? Math.min(100, Math.max(0, f.confidence))
              : 90,
          suggestedRewrite: f.suggestedRewrite || "",
          isLegalSensitive: Boolean(f.isLegalSensitive),
          isUnverifiedClaim: Boolean(f.isUnverifiedClaim),
          actionStatus: "pending",
        })
      );

      const score = Math.min(100, Math.max(0, Math.round(data.overallScore)));
      const tier = computeRoutingTier(score, normalizedFindings);

      const updated: ContentSubmission = {
        ...activeSubmission,
        status: "AI Reviewed",
        initialScore:
          activeSubmission.initialScore !== undefined
            ? activeSubmission.initialScore
            : score,
        currentScore: score,
        summary: data.summary,
        needsHumanReview: Boolean(data.needsHumanReview),
        escalationReason: data.escalationReason,
        routingTier: tier,
        retrievedSourceIds: matchedGuidelines.map((g) => g.id),
        findings: normalizedFindings,
        updatedAt: new Date().toISOString(),
        auditTrail: [
          ...activeSubmission.auditTrail,
          {
            id: `AE-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorRole: currentRole,
            actorName: "BrandGuard Gemini Engine",
            action: "Completed Live Gemini Brand Review",
            details: `Analyzed against ${matchedGuidelines.length} retrieved sources. Found ${normalizedFindings.length} issues. Compliance Score: ${score}/100.`,
          },
        ],
      };

      onUpdateSubmission(updated);
      if (normalizedFindings.length > 0) {
        setFocusedFindingId(normalizedFindings[0].id);
        setExpandedExplainIds((prev) => ({
          ...prev,
          [normalizedFindings[0].id]: true,
        }));
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Network or Gemini API error occurred.";
      setApiError(msg);
    } finally {
      setIsRunningReview(false);
    }
  };

  const applySuggestionToSubmission = (
    finding: Finding,
    replacementText: string,
    mode: "accepted" | "edited"
  ) => {
    let nextText = activeSubmission.currentText;
    let nextAltText = activeSubmission.altText;

    if (
      finding.flaggedTextOrRegion &&
      !finding.flaggedTextOrRegion.startsWith("[Visual Region:") &&
      nextText.includes(finding.flaggedTextOrRegion)
    ) {
      nextText = nextText.replace(finding.flaggedTextOrRegion, replacementText);
    } else if (
      finding.category === "Accessibility" &&
      replacementText.toLowerCase().startsWith("alt text added:")
    ) {
      nextAltText = replacementText
        .replace(/^alt text added:\s*/i, "")
        .replace(/^['"]|['"]$/g, "");
    } else if (finding.category === "Visual Consistency") {
      setShowVisualFixedPreview(true);
    }

    const updatedFindings = activeSubmission.findings.map((f) =>
      f.id === finding.id
        ? {
            ...f,
            actionStatus: mode,
            appliedText: replacementText,
          }
        : f
    );

    const newScore = recalculateScore(updatedFindings);
    const newTier = computeRoutingTier(newScore, updatedFindings);

    onUpdateSubmission({
      ...activeSubmission,
      currentText: nextText,
      altText: nextAltText,
      findings: updatedFindings,
      currentScore: newScore,
      routingTier: newTier,
      needsHumanReview: updatedFindings.some(
        (f) =>
          f.actionStatus !== "accepted" &&
          f.actionStatus !== "edited" &&
          f.actionStatus !== "overridden" &&
          (f.severity === "critical" || f.isLegalSensitive || f.confidence < 75)
      ),
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...activeSubmission.auditTrail,
        {
          id: `AE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action:
            mode === "accepted"
              ? `Accepted AI Fix (${finding.id} · ${finding.sourceId})`
              : `Edited & Applied Fix (${finding.id} · ${finding.sourceId})`,
          details: `Replaced flagged issue with: "${replacementText}". Score updated to ${newScore}/100.`,
        },
      ],
    });
    setEditingFindingId(null);
  };

  const handleAcceptAllPending = () => {
    let nextText = activeSubmission.currentText;
    let nextAltText = activeSubmission.altText;
    let count = 0;

    const updatedFindings = activeSubmission.findings.map((finding) => {
      if (finding.actionStatus !== "pending") return finding;
      count++;
      const replacement = finding.suggestedRewrite;
      if (
        finding.flaggedTextOrRegion &&
        !finding.flaggedTextOrRegion.startsWith("[Visual Region:") &&
        nextText.includes(finding.flaggedTextOrRegion)
      ) {
        nextText = nextText.replace(finding.flaggedTextOrRegion, replacement);
      } else if (
        finding.category === "Accessibility" &&
        replacement.toLowerCase().startsWith("alt text added:")
      ) {
        nextAltText = replacement
          .replace(/^alt text added:\s*/i, "")
          .replace(/^['"]|['"]$/g, "");
      } else if (finding.category === "Visual Consistency") {
        setShowVisualFixedPreview(true);
      }
      return {
        ...finding,
        actionStatus: "accepted" as const,
        appliedText: replacement,
      };
    });

    if (count === 0) return;

    const newScore = recalculateScore(updatedFindings);
    const newTier = computeRoutingTier(newScore, updatedFindings);

    onUpdateSubmission({
      ...activeSubmission,
      currentText: nextText,
      altText: nextAltText,
      findings: updatedFindings,
      currentScore: newScore,
      routingTier: newTier,
      needsHumanReview: false,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...activeSubmission.auditTrail,
        {
          id: `AE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action: `Accepted All ${count} AI Suggestions`,
          details: `Applied ${count} compliant rewrites preserving creator intent. Compliance Score rose to ${newScore}/100 (${newTier}).`,
        },
      ],
    });
  };

  const handleRejectFinding = (finding: Finding) => {
    if (!rejectionInput.trim()) return;
    const updatedFindings = activeSubmission.findings.map((f) =>
      f.id === finding.id
        ? {
            ...f,
            actionStatus: "rejected" as const,
            rejectionReason: rejectionInput.trim(),
          }
        : f
    );

    onRecordRuleFriction(finding.sourceId, "reject");

    onUpdateSubmission({
      ...activeSubmission,
      findings: updatedFindings,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...activeSubmission.auditTrail,
        {
          id: `AE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action: `Rejected AI Suggestion (${finding.id} · ${finding.sourceId})`,
          details: `Creator Reason: "${rejectionInput.trim()}"`,
        },
      ],
    });
    setRejectingFindingId(null);
    setRejectionInput("");
  };

  const handleOverrideFinding = (finding: Finding) => {
    if (!overrideInput.trim()) return;
    const updatedFindings = activeSubmission.findings.map((f) =>
      f.id === finding.id
        ? {
            ...f,
            actionStatus: "overridden" as const,
            overrideComment: overrideInput.trim(),
            overriddenBy: ROLE_NAMES[currentRole],
          }
        : f
    );

    const newScore = recalculateScore(updatedFindings);
    const newTier = computeRoutingTier(newScore, updatedFindings);
    onRecordRuleFriction(finding.sourceId, "override");

    onUpdateSubmission({
      ...activeSubmission,
      findings: updatedFindings,
      currentScore: newScore,
      routingTier: newTier,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...activeSubmission.auditTrail,
        {
          id: `AE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action: `Overrode Finding (${finding.id} · ${finding.sourceId})`,
          details: `Reviewer Override Comment: "${overrideInput.trim()}". Updated Score: ${newScore}/100.`,
        },
      ],
    });
    setOverridingFindingId(null);
    setOverrideInput("");
  };

  const handleSubmitForApproval = () => {
    const score = activeSubmission.currentScore ?? 100;
    const tier = computeRoutingTier(score, activeSubmission.findings);
    onUpdateSubmission({
      ...activeSubmission,
      status: "In Review",
      routingTier: tier,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...activeSubmission.auditTrail,
        {
          id: `AE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action: "Submitted for Approval",
          details: `Auto-routed to ${tier} (Compliance Score: ${score}/100).`,
        },
      ],
    });
    onNavigateToBoard();
  };

  // Render content text with clickable highlighted spans for pending/rejected findings
  const renderHighlightedContent = () => {
    const text = activeSubmission.currentText;
    const activeSpans = activeSubmission.findings.filter(
      (f) =>
        (f.actionStatus === "pending" || f.actionStatus === "rejected") &&
        f.flaggedTextOrRegion &&
        !f.flaggedTextOrRegion.startsWith("[Visual Region:") &&
        text.includes(f.flaggedTextOrRegion)
    );

    if (activeSpans.length === 0) {
      return (
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
          {text}
        </div>
      );
    }

    interface Segment {
      text: string;
      finding?: Finding;
    }

    let segments: Segment[] = [{ text }];

    for (const finding of activeSpans) {
      const target = finding.flaggedTextOrRegion;
      const nextSegments: Segment[] = [];
      for (const seg of segments) {
        if (seg.finding || !seg.text.includes(target)) {
          nextSegments.push(seg);
          continue;
        }
        const parts = seg.text.split(target);
        parts.forEach((part, idx) => {
          if (part) nextSegments.push({ text: part });
          if (idx < parts.length - 1) {
            nextSegments.push({ text: target, finding });
          }
        });
      }
      segments = nextSegments;
    }

    return (
      <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
        {segments.map((seg, i) => {
          if (!seg.finding) {
            return <span key={i}>{seg.text}</span>;
          }
          const f = seg.finding;
          const isFocused = focusedFindingId === f.id;
          const highlightClasses =
            f.severity === "critical"
              ? "bg-red-100/90 text-red-950 border-b-2 border-red-600 hover:bg-red-200/80"
              : f.severity === "major"
              ? "bg-amber-100/90 text-amber-950 border-b-2 border-amber-600 hover:bg-amber-200/80"
              : "bg-blue-100/90 text-blue-950 border-b-2 border-blue-600 hover:bg-blue-200/80";

          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setFocusedFindingId(f.id);
                setExpandedExplainIds((prev) => ({ ...prev, [f.id]: true }));
                const el = document.getElementById(`finding-card-${f.id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }}
              className={`inline text-left rounded-sm px-1 py-0.5 transition-colors cursor-pointer ${highlightClasses} ${
                isFocused ? "ring-2 ring-[#1D4ED8] ring-offset-1" : ""
              }`}
              title={`${f.severity.toUpperCase()} — ${f.category}: Click to inspect finding`}
            >
              {seg.text}
            </button>
          );
        })}
      </div>
    );
  };

  const filteredFindings = activeSubmission.findings.filter((f) => {
    if (findingFilter === "pending") return f.actionStatus === "pending";
    if (findingFilter === "resolved") return f.actionStatus !== "pending";
    return true;
  });

  const pendingCount = activeSubmission.findings.filter(
    (f) => f.actionStatus === "pending"
  ).length;

  const renderSeverityLabel = (severity: Severity) => {
    if (severity === "critical") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#DC2626]">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Critical</span>
        </span>
      );
    }
    if (severity === "major") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#D97706]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Major</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8]">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>Minor</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Submission Selector Strip + New Submission Toggle */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">
            Active Submissions:
          </span>
          {submissions.map((sub) => {
            const isSelected = !isCreatingNew && sub.id === activeSubmission.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  onSelectSubmission(sub.id);
                  setShowVisualFixedPreview(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? "bg-[#1D4ED8] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {sub.format === "image_banner" ? (
                  <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="truncate max-w-[210px]">{sub.title}</span>
                {sub.currentScore !== undefined && (
                  <span
                    className={`font-mono tabular-nums text-[11px] ${
                      isSelected ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    · {sub.currentScore}/100
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="px-3.5 py-2 text-xs font-semibold text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer self-start lg:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isCreatingNew ? "Cancel New Draft" : "New Content Submission"}</span>
        </button>
      </div>

      {/* New Content Submission Form */}
      {isCreatingNew && (
        <form
          onSubmit={handleCreateDraft}
          className="bg-white border border-slate-200 rounded-lg p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Submit Pre-Publication Content for Governance Audit
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Provide the content, format, author provenance, and your 1-line intended purpose so Gemini preserves your intent when suggesting fixes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Content Title *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Q4 Cloud Security Whitepaper Promo"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Format
              </label>
              <select
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value as ContentFormat)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="social_post">Social Post Text</option>
                <option value="blog_article">Blog / Article</option>
                <option value="email_copy">Email Copy</option>
                <option value="ad_copy">Ad Copy</option>
                <option value="image_banner">Image Upload (Banner / Poster) + Caption</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author Source Tag
              </label>
              <select
                value={newAuthorType}
                onChange={(e) => setNewAuthorType(e.target.value as AuthorType)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="Employee">Employee</option>
                <option value="Agency">External Agency</option>
                <option value="AI-Generated">AI-Generated Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Distribution Channel
              </label>
              <input
                type="text"
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                placeholder="LinkedIn, Blog, Paid Search..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={newAudience}
                onChange={(e) => setNewAudience(e.target.value)}
                placeholder="CTOs, Platform Engineers, CISOs..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Originating Team
              </label>
              <input
                type="text"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                placeholder="Growth Marketing, Demand Gen..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Intended Purpose (1 line — AI preserves this intent when suggesting rewrites) *
            </label>
            <input
              type="text"
              required
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value)}
              placeholder="e.g., Convince FinOps directors to try our 14-day trial by highlighting predictable cloud costs."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          {newFormat === "image_banner" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Banner / Poster Image (or leave default sample banner)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1D4ED8] file:text-white hover:file:bg-blue-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image Alt Text (Accessibility Check)
                </label>
                <input
                  type="text"
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  placeholder="Describe banner visual layout and embedded text..."
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Content Copy / Caption *
            </label>
            <textarea
              rows={5}
              required
              value={newContentText}
              onChange={(e) => setNewContentText(e.target.value)}
              placeholder="Paste your social post, blog article, email copy, or ad caption here..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 rounded-md cursor-pointer"
            >
              Create Submission & Open in Studio
            </button>
          </div>
        </form>
      )}

      {/* Main Active Submission Header & Metadata Bar */}
      {!isCreatingNew && activeSubmission && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono font-semibold text-slate-700">
                  {activeSubmission.id}
                </span>
                <span aria-hidden="true">·</span>
                <span>{FORMAT_LABELS[activeSubmission.format]}</span>
                <span aria-hidden="true">·</span>
                <span>Channel: {activeSubmission.channel}</span>
                <span aria-hidden="true">·</span>
                <span>Author: {activeSubmission.authorType}</span>
                <span aria-hidden="true">·</span>
                <span>Team: {activeSubmission.team}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-slate-800">
                  Status: {activeSubmission.status}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                {activeSubmission.title}
              </h1>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  Creator's Intended Purpose:
                </span>{" "}
                "{activeSubmission.intendedPurpose}"
              </p>
            </div>

            {/* Score & Primary Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {activeSubmission.currentScore !== undefined && (
                <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 border border-slate-200 rounded-md">
                  <div>
                    <div className="text-[11px] text-slate-500">
                      Compliance Score
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                      {activeSubmission.initialScore !== undefined &&
                        activeSubmission.initialScore !==
                          activeSubmission.currentScore && (
                          <span className="text-xs text-slate-400 line-through">
                            {activeSubmission.initialScore}
                          </span>
                        )}
                      <span
                        className={`text-lg font-bold ${
                          activeSubmission.currentScore >= 90
                            ? "text-[#16A34A]"
                            : activeSubmission.currentScore >= 70
                            ? "text-[#D97706]"
                            : "text-[#DC2626]"
                        }`}
                      >
                        {activeSubmission.currentScore}/100
                      </span>
                    </div>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div>
                    <div className="text-[11px] text-slate-500">
                      Workflow Routing
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      {activeSubmission.routingTier}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isRunningReview}
                onClick={handleRunBrandReview}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 disabled:opacity-60 rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                {isRunningReview ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Running Gemini Audit...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Brand Review (Gemini)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSubmitForApproval}
                className="px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit for Approval</span>
              </button>
            </div>
          </div>

          {/* API Error State with Retry Button */}
          {apiError && (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-2.5 text-xs text-red-900">
                <XCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">
                    AI Brand Review encountered an error:
                  </span>{" "}
                  {apiError}
                </div>
              </div>
              <button
                type="button"
                onClick={handleRunBrandReview}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#DC2626] hover:bg-red-700 rounded-md flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Review</span>
              </button>
            </div>
          )}

          {/* Executive Summary & Human Review Escalation Banner */}
          {activeSubmission.summary && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-900">
                    AI Audit Summary
                  </span>
                  <span aria-hidden="true" className="text-slate-400">
                    ·
                  </span>
                  <span className="text-slate-600">
                    Checked against {retrievedSources.length} retrieved Knowledge Base sources
                  </span>
                  {activeSubmission.needsHumanReview ? (
                    <>
                      <span aria-hidden="true" className="text-slate-400">
                        ·
                      </span>
                      <span className="font-semibold text-[#DC2626] inline-flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Needs Human Review ({activeSubmission.routingTier})
                      </span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true" className="text-slate-400">
                        ·
                      </span>
                      <span className="font-semibold text-[#16A34A] inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Eligible for Light-Touch Approval
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeSubmission.summary}
                </p>
              </div>

              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={handleAcceptAllPending}
                  className="px-3.5 py-2 text-xs font-semibold text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept All {pendingCount} Suggested Fixes</span>
                </button>
              )}
            </div>
          )}

          {/* Split Screen: Left Content + Diff | Right Explainable Findings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Content Canvas & Live Before/After Diff */}
            <div className="lg:col-span-6 space-y-5">
              {/* Visual Asset Canvas for Image Banner Submissions */}
              {(activeSubmission.format === "image_banner" ||
                activeSubmission.imageUrl) && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <ImageIcon className="w-4 h-4 text-[#1D4ED8]" />
                      <span>
                        {showVisualFixedPreview
                          ? "Remediated On-Brand Visual Preview (AA-301 / AA-302 Applied)"
                          : "Submitted Visual Banner Asset (Gemini Vision Audited)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setShowVisualFixedPreview(!showVisualFixedPreview)
                        }
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        {showVisualFixedPreview
                          ? "View Original Off-Brand Image"
                          : "Preview On-Brand Remediation"}
                      </button>
                      <label className="px-2.5 py-1 text-xs font-medium text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 rounded cursor-pointer inline-flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Replace Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="p-4">
                    {showVisualFixedPreview ? (
                      <div className="aspect-video w-full rounded-md bg-[#0F172A] text-white p-8 flex flex-col justify-between border border-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-md bg-[#1D4ED8] flex items-center justify-center font-mono font-bold text-sm">
                              NC
                            </div>
                            <span className="font-display font-bold text-base tracking-tight">
                              Nimbus Cloud
                            </span>
                          </div>
                          <span className="font-mono text-xs text-teal-400">
                            SOC 2 Type II · 99.99% SLA
                          </span>
                        </div>
                        <div className="max-w-md space-y-2">
                          <h3 className="text-xl font-bold leading-snug text-white">
                            Predictable multi-region container infrastructure at enterprise scale.
                          </h3>
                          <p className="text-xs text-slate-300">
                            Reduces p99 cold-start latency by up to 62%, verified by Q2 2026 CloudBench audit.
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                          <span className="px-3 py-1.5 bg-[#1D4ED8] text-white font-semibold rounded">
                            Start 14-Day Free Trial
                          </span>
                          <span className="text-slate-400 font-mono">
                            WCAG AA Contrast: 12.4:1 (Pass)
                          </span>
                        </div>
                      </div>
                    ) : !imageLoadFailed && activeSubmission.imageUrl ? (
                      <div className="relative">
                        <img
                          src={activeSubmission.imageUrl}
                          alt={
                            activeSubmission.altText ||
                            "Submitted promotional banner under brand governance review"
                          }
                          referrerPolicy="no-referrer"
                          onError={() => setImageLoadFailed(true)}
                          className="w-full aspect-video object-cover rounded-md border border-slate-200"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-md bg-slate-100 border border-slate-300 flex flex-col items-center justify-center p-6 text-center">
                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-xs font-semibold text-slate-700">
                          Promotional Display Banner Canvas
                        </p>
                      </div>
                    )}

                    {/* Alt Text Accessibility Field */}
                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Image Alt Text (BG-103):
                        </span>{" "}
                        {activeSubmission.altText ? (
                          <span className="text-slate-800">
                            "{activeSubmission.altText}"
                          </span>
                        ) : (
                          <span className="text-[#DC2626] font-semibold">
                            Missing alt text (Accessibility Violation)
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={activeSubmission.altText}
                        onChange={(e) =>
                          onUpdateSubmission({
                            ...activeSubmission,
                            altText: e.target.value,
                          })
                        }
                        placeholder="Enter descriptive alt text (8+ words)..."
                        className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Highlighted Content Editor / Viewer */}
              <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-800">
                    Content Canvas (Click any highlighted span to focus its finding)
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-red-200 border-b-2 border-red-600 inline-block" />
                      Critical
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-amber-200 border-b-2 border-amber-600 inline-block" />
                      Major
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-blue-200 border-b-2 border-blue-600 inline-block" />
                      Minor
                    </span>
                  </div>
                </div>

                <div className="p-5">{renderHighlightedContent()}</div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                  <details className="text-xs">
                    <summary className="font-semibold text-slate-700 cursor-pointer select-none">
                      Edit Raw Copy Directly
                    </summary>
                    <textarea
                      rows={5}
                      value={activeSubmission.currentText}
                      onChange={(e) =>
                        onUpdateSubmission({
                          ...activeSubmission,
                          currentText: e.target.value,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className="mt-2 w-full p-2.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                  </details>
                </div>
              </div>

              {/* Live Before vs. After Diff Panel */}
              <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-800">
                    Live "Before vs. After" Remediation Diff
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500">
                    {activeSubmission.originalText === activeSubmission.currentText
                      ? "No text modifications applied yet"
                      : `Score improved: ${activeSubmission.initialScore ?? "—"} → ${
                          activeSubmission.currentScore ?? "—"
                        }/100`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
                  <div className="p-4 space-y-1.5 bg-red-50/20">
                    <div className="font-semibold text-slate-600 flex items-center justify-between">
                      <span>Original Submitted Copy</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        Initial: {activeSubmission.initialScore ?? "—"}/100
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                      {activeSubmission.originalText}
                    </p>
                  </div>

                  <div className="p-4 space-y-1.5 bg-emerald-50/20">
                    <div className="font-semibold text-slate-800 flex items-center justify-between">
                      <span>Current Remediated Copy</span>
                      <span className="font-mono text-[11px] font-semibold text-[#16A34A]">
                        Current: {activeSubmission.currentScore ?? "—"}/100
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-900 leading-relaxed">
                      {activeSubmission.currentText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Retrieved RAG Sources Panel */}
              <div className="border border-slate-200 rounded-lg bg-white p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    Retrieved Knowledge Base Sources Checked ({retrievedSources.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    RAG Context Passed to Gemini
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {retrievedSources.map((src) => (
                    <div
                      key={src.id}
                      className="py-1.5 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-semibold text-slate-700 shrink-0">
                          {src.id}
                        </span>
                        <span className="text-slate-800 truncate">{src.title}</span>
                        {src.restricted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DC2626] shrink-0">
                            <Lock className="w-3 h-3" />
                            Restricted
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 shrink-0">
                        {src.version} · {src.lastUpdated}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Explainable AI Findings List */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3">
                <div className="text-xs font-semibold text-slate-900">
                  Explainable Findings ({activeSubmission.findings.length})
                </div>

                {/* Segmented Filter Control */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
                  {(["all", "pending", "resolved"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFindingFilter(tab)}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer capitalize ${
                        findingFilter === tab
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {filteredFindings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900">
                    No Findings in This View
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    {activeSubmission.findings.length === 0
                      ? "Click 'Run Brand Review (Gemini)' to audit this content against Nimbus Cloud guidelines, or submit directly for approval."
                      : "All findings matching your filter have been addressed."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFindings.map((finding) => {
                    const isFocused = focusedFindingId === finding.id;
                    const isExplainOpen = Boolean(expandedExplainIds[finding.id]);
                    const linkedKbItem = knowledgeBase.find(
                      (k) => k.id === finding.sourceId
                    );
                    const isRestrictedSource =
                      Boolean(linkedKbItem?.restricted) ||
                      finding.category === "Confidential Leakage";

                    return (
                      <div
                        id={`finding-card-${finding.id}`}
                        key={finding.id}
                        onClick={() => setFocusedFindingId(finding.id)}
                        className={`bg-white border rounded-lg p-4 transition-all space-y-3 ${
                          isFocused
                            ? "border-[#1D4ED8] ring-1 ring-[#1D4ED8]"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {/* Top Metadata Line (Zero-Pill Discipline) */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            {renderSeverityLabel(finding.severity)}
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>
                            <span className="font-semibold text-slate-800">
                              {finding.category}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>
                            <span className="font-mono tabular-nums text-slate-500">
                              {finding.confidence}% confidence
                            </span>
                            {finding.isUnverifiedClaim && (
                              <>
                                <span
                                  aria-hidden="true"
                                  className="text-slate-300"
                                >
                                  ·
                                </span>
                                <span className="font-semibold text-[#D97706]">
                                  Unverified – needs evidence
                                </span>
                              </>
                            )}
                            {finding.isLegalSensitive && (
                              <>
                                <span
                                  aria-hidden="true"
                                  className="text-slate-300"
                                >
                                  ·
                                </span>
                                <span className="font-semibold text-[#DC2626]">
                                  Legal-Sensitive
                                </span>
                              </>
                            )}
                          </div>

                          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            {finding.actionStatus === "pending"
                              ? "Needs Action"
                              : finding.actionStatus}
                          </span>
                        </div>

                        {/* Flagged Passage or Region */}
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                          <span className="text-slate-500 font-medium">
                            Flagged:{" "}
                          </span>
                          <span className="font-mono text-slate-900">
                            "{finding.flaggedTextOrRegion}"
                          </span>
                        </div>

                        {/* Plain-English Explanation */}
                        <p className="text-xs text-slate-700 leading-relaxed">
                          <span className="font-semibold text-slate-900">
                            Why this is a problem:{" "}
                          </span>
                          {finding.explanation}
                        </p>

                        {/* Cited Guideline + Expandable "Explain This" Panel */}
                        <div className="pt-1 border-t border-slate-100">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="text-slate-600 truncate">
                              <span className="font-medium text-slate-500">
                                Cited Source:{" "}
                              </span>
                              <span className="font-mono font-semibold text-slate-800">
                                {finding.sourceId}
                              </span>{" "}
                              · {finding.sourceName} ({finding.sourceVersion})
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedExplainIds((prev) => ({
                                  ...prev,
                                  [finding.id]: !prev[finding.id],
                                }));
                              }}
                              className="text-xs font-semibold text-[#1D4ED8] hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Explain this</span>
                              {isExplainOpen ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {isExplainOpen && (
                            <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs">
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span className="font-semibold text-slate-700">
                                  Source Verification Passage ({finding.sourceId} ·{" "}
                                  {finding.sourceVersion})
                                </span>
                                {isRestrictedSource && (
                                  <span className="inline-flex items-center gap-1 text-[#DC2626] font-semibold">
                                    <Lock className="w-3 h-3" />
                                    Restricted Document
                                  </span>
                                )}
                              </div>

                              {isRestrictedSource && currentRole === "creator" ? (
                                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-950 text-xs space-y-1">
                                  <div className="font-semibold flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-[#D97706]" />
                                    <span>
                                      Confidential Source Redacted for Creator Role
                                    </span>
                                  </div>
                                  <p className="text-[11px] leading-relaxed">
                                    This finding matched restricted source{" "}
                                    <span className="font-mono font-semibold">
                                      {finding.sourceId} ({finding.sourceName})
                                    </span>
                                    . Per BrandGuard privacy controls, restricted document contents are used strictly for automated checking and are hidden from Creators. Switch role to Reviewer or Brand Manager to inspect the raw confidential policy.
                                  </p>
                                </div>
                              ) : (
                                <blockquote className="text-xs text-slate-800 italic bg-white p-2.5 rounded border border-slate-200">
                                  "{finding.quotedRule}"
                                </blockquote>
                              )}

                              <div className="text-[11px] text-slate-600">
                                <span className="font-semibold text-slate-800">
                                  Intent Preservation Check:
                                </span>{" "}
                                Suggested rewrite retains your stated goal ("
                                {activeSubmission.intendedPurpose}") while removing the policy violation.
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Suggested Rewrite Box */}
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-md space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-emerald-950">
                              Suggested Compliant Fix (Preserves Intent)
                            </span>
                            {finding.actionStatus === "accepted" ||
                            finding.actionStatus === "edited" ? (
                              <span className="text-[#16A34A] font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Applied to Content
                              </span>
                            ) : null}
                          </div>

                          {editingFindingId === finding.id ? (
                            <div className="space-y-2">
                              <textarea
                                rows={3}
                                value={customRewriteText}
                                onChange={(e) =>
                                  setCustomRewriteText(e.target.value)
                                }
                                className="w-full p-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    applySuggestionToSubmission(
                                      finding,
                                      customRewriteText,
                                      "edited"
                                    )
                                  }
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 rounded cursor-pointer"
                                >
                                  Apply Custom Fix
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFindingId(null)}
                                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                              "{finding.appliedText || finding.suggestedRewrite}"
                            </p>
                          )}
                        </div>

                        {/* Rejection / Override Feedback Recorded */}
                        {finding.actionStatus === "rejected" &&
                          finding.rejectionReason && (
                            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950">
                              <span className="font-semibold">
                                Rejected by Creator:{" "}
                              </span>
                              "{finding.rejectionReason}"
                            </div>
                          )}

                        {finding.actionStatus === "overridden" &&
                          finding.overrideComment && (
                            <div className="p-2.5 bg-slate-100 border border-slate-300 rounded text-xs text-slate-800">
                              <span className="font-semibold">
                                Overridden by {finding.overriddenBy}:{" "}
                              </span>
                              "{finding.overrideComment}"
                            </div>
                          )}

                        {/* Inline Reject Reason Prompt */}
                        {rejectingFindingId === finding.id && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                            <label className="block text-xs font-semibold text-slate-700">
                              Why are you rejecting this AI suggestion? (Logged in audit trail & flags unclear rules)
                            </label>
                            <input
                              type="text"
                              value={rejectionInput}
                              onChange={(e) => setRejectionInput(e.target.value)}
                              placeholder="e.g., Technical context requires this specific term..."
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRejectFinding(finding)}
                                className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer"
                              >
                                Confirm Rejection
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingFindingId(null)}
                                className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Inline Reviewer Override Prompt */}
                        {overridingFindingId === finding.id && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                            <label className="block text-xs font-semibold text-slate-700">
                              Reviewer / Manager Override Justification (Required)
                            </label>
                            <input
                              type="text"
                              value={overrideInput}
                              onChange={(e) => setOverrideInput(e.target.value)}
                              placeholder="e.g., Approved exception for Q4 partner campaign..."
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOverrideFinding(finding)}
                                className="px-3 py-1 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 rounded cursor-pointer"
                              >
                                Confirm Override
                              </button>
                              <button
                                type="button"
                                onClick={() => setOverridingFindingId(null)}
                                className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {finding.actionStatus !== "accepted" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                applySuggestionToSubmission(
                                  finding,
                                  finding.suggestedRewrite,
                                  "accepted"
                                );
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#16A34A] hover:bg-emerald-700 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept Suggestion</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFindingId(finding.id);
                              setCustomRewriteText(
                                finding.appliedText || finding.suggestedRewrite
                              );
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Suggestion</span>
                          </button>

                          {finding.actionStatus !== "rejected" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRejectingFindingId(finding.id);
                                setRejectionInput("");
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject with Reason</span>
                            </button>
                          )}

                          {(currentRole === "reviewer" ||
                            currentRole === "brand_manager") &&
                            finding.actionStatus !== "overridden" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOverridingFindingId(finding.id);
                                  setOverrideInput("");
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>Override Finding</span>
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Submit for Approval Callout */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Ready for Human Sign-Off?
                  </span>{" "}
                  Route this item ({activeSubmission.currentScore ?? 100}/100) to the Approval Workflow Board.
                </div>
                <button
                  type="button"
                  onClick={handleSubmitForApproval}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 rounded-md inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Submit for Approval</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
