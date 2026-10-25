import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  LayoutGrid,
  List,
  MessageSquare,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  AuthorType,
  ContentFormat,
  ContentSubmission,
  Finding,
  Severity,
  UserRole,
  WorkflowStatus,
} from "../types";
import { computeRoutingTier, recalculateScore } from "../data/seedData";

interface ApprovalBoardProps {
  submissions: ContentSubmission[];
  selectedSubmissionId: string;
  onSelectSubmission: (id: string) => void;
  onUpdateSubmission: (updated: ContentSubmission) => void;
  currentRole: UserRole;
  onOpenInStudio: (id: string) => void;
  onRecordRuleFriction: (sourceId: string, type: "reject" | "override") => void;
}

const WORKFLOW_COLUMNS: WorkflowStatus[] = [
  "Draft",
  "AI Reviewed",
  "In Review",
  "Changes Requested",
  "Approved",
  "Published",
];

const FORMAT_LABELS: Record<ContentFormat, string> = {
  social_post: "Social Post",
  blog_article: "Blog / Article",
  email_copy: "Email Copy",
  ad_copy: "Ad Copy",
  image_banner: "Image Banner",
};

const ROLE_NAMES: Record<UserRole, string> = {
  creator: "Maya Lin (Creator)",
  reviewer: "David Vance (Reviewer)",
  brand_manager: "Elena Rostova (Brand Manager)",
};

export const ApprovalBoard: React.FC<ApprovalBoardProps> = ({
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  onUpdateSubmission,
  currentRole,
  onOpenInStudio,
  onRecordRuleFriction,
}) => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [newCommentText, setNewCommentText] = useState<string>("");
  const [decisionNote, setDecisionNote] = useState<string>("");
  const [overridingFindingId, setOverridingFindingId] = useState<string | null>(
    null
  );
  const [overrideCommentInput, setOverrideCommentInput] = useState<string>("");

  const activeItem =
    submissions.find((s) => s.id === selectedSubmissionId) || submissions[0];

  const filteredSubmissions = submissions.filter((sub) => {
    if (formatFilter !== "all" && sub.format !== formatFilter) return false;
    if (authorFilter !== "all" && sub.authorType !== authorFilter) return false;
    if (severityFilter !== "all") {
      const hasUnresolvedSeverity = sub.findings.some(
        (f) =>
          f.actionStatus !== "accepted" &&
          f.actionStatus !== "edited" &&
          f.actionStatus !== "overridden" &&
          f.severity === (severityFilter as Severity)
      );
      if (!hasUnresolvedSeverity) return false;
    }
    if (
      searchQuery.trim() &&
      !`${sub.title} ${sub.id} ${sub.channel} ${sub.team}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleApprove = (item: ContentSubmission) => {
    const note =
      decisionNote.trim() ||
      "Verified brand compliance and human sign-off completed.";
    const now = new Date().toISOString();
    const updated: ContentSubmission = {
      ...item,
      status: "Approved",
      approvedAt: now,
      approvalDurationHours: item.approvalDurationHours || 1.8,
      updatedAt: now,
      auditTrail: [
        ...item.auditTrail,
        {
          id: `AE-${Date.now()}`,
          timestamp: now,
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action: "Approved for Publication (AI-Assisted, Human-Approved)",
          details: note,
        },
      ],
      comments: decisionNote.trim()
        ? [
            ...item.comments,
            {
              id: `CM-${Date.now()}`,
              timestamp: now,
              authorRole: currentRole,
              authorName: ROLE_NAMES[currentRole],
              text: `[Approval Note]: ${decisionNote.trim()}`,
            },
          ]
        : item.comments,
    };
    onUpdateSubmission(updated);
    setDecisionNote("");
  };

  const handlePublish = (item: ContentSubmission) => {
    const now = new Date().toISOString();
    onUpdateSubmission({
      ...item,
      status: "Published",
      updatedAt: now,
      auditTrail: [
        ...item.auditTrail,
        {
          id: `AE-${Date.now()}`,
          timestamp: now,
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action: "Marked Published / Ready for Distribution",
          details: `Released to ${item.channel} with human-approved governance stamp.`,
        },
      ],
    });
  };

  const handleRequestChanges = (item: ContentSubmission) => {
    const note =
      decisionNote.trim() ||
      "Please address remaining flagged findings or provide supporting benchmark evidence before approval.";
    const now = new Date().toISOString();
    onUpdateSubmission({
      ...item,
      status: "Changes Requested",
      updatedAt: now,
      auditTrail: [
        ...item.auditTrail,
        {
          id: `AE-${Date.now()}`,
          timestamp: now,
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action: "Requested Changes from Creator",
          details: note,
        },
      ],
      comments: [
        ...item.comments,
        {
          id: `CM-${Date.now()}`,
          timestamp: now,
          authorRole: currentRole,
          authorName: ROLE_NAMES[currentRole],
          text: `[Changes Requested]: ${note}`,
        },
      ],
    });
    setDecisionNote("");
  };

  const handleOverrideInDrawer = (finding: Finding) => {
    if (!overrideCommentInput.trim() || !activeItem) return;
    const now = new Date().toISOString();
    const updatedFindings = activeItem.findings.map((f) =>
      f.id === finding.id
        ? {
            ...f,
            actionStatus: "overridden" as const,
            overrideComment: overrideCommentInput.trim(),
            overriddenBy: ROLE_NAMES[currentRole],
          }
        : f
    );

    const newScore = recalculateScore(updatedFindings);
    const newTier = computeRoutingTier(newScore, updatedFindings);
    onRecordRuleFriction(finding.sourceId, "override");

    onUpdateSubmission({
      ...activeItem,
      findings: updatedFindings,
      currentScore: newScore,
      routingTier: newTier,
      updatedAt: now,
      auditTrail: [
        ...activeItem.auditTrail,
        {
          id: `AE-${Date.now()}`,
          timestamp: now,
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action: `Overrode AI Finding (${finding.id} · ${finding.sourceId})`,
          details: `Override justification: "${overrideCommentInput.trim()}". Score updated to ${newScore}/100.`,
        },
      ],
    });
    setOverridingFindingId(null);
    setOverrideCommentInput("");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeItem) return;
    const now = new Date().toISOString();
    onUpdateSubmission({
      ...activeItem,
      updatedAt: now,
      comments: [
        ...activeItem.comments,
        {
          id: `CM-${Date.now()}`,
          timestamp: now,
          authorRole: currentRole,
          authorName: ROLE_NAMES[currentRole],
          text: newCommentText.trim(),
        },
      ],
      auditTrail: [
        ...activeItem.auditTrail,
        {
          id: `AE-${Date.now()}`,
          timestamp: now,
          actorRole: currentRole,
          actorName: ROLE_NAMES[currentRole],
          action: "Added Review Comment",
          details: `"${newCommentText.trim()}"`,
        },
      ],
    });
    setNewCommentText("");
  };

  return (
    <div className="space-y-6">
      {/* Filter & View Switcher Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, ID, channel..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            aria-label="Filter by format"
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
          >
            <option value="all">All Formats</option>
            <option value="social_post">Social Post</option>
            <option value="blog_article">Blog / Article</option>
            <option value="email_copy">Email Copy</option>
            <option value="ad_copy">Ad Copy</option>
            <option value="image_banner">Image Banner</option>
          </select>

          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            aria-label="Filter by author type"
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
          >
            <option value="all">All Author Sources</option>
            <option value="Employee">Employee</option>
            <option value="Agency">Agency</option>
            <option value="AI-Generated">AI-Generated</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            aria-label="Filter by active finding severity"
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
          >
            <option value="all">All Severities</option>
            <option value="critical">Has Unresolved Critical</option>
            <option value="major">Has Unresolved Major</option>
            <option value="minor">Has Unresolved Minor</option>
          </select>
        </div>

        {/* View Toggle: Kanban vs Table */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer ${
              viewMode === "kanban"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* Kanban or Table View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {WORKFLOW_COLUMNS.map((statusCol) => {
            const colItems = filteredSubmissions.filter(
              (s) => s.status === statusCol
            );
            return (
              <div
                key={statusCol}
                className="bg-slate-100/80 border border-slate-200 rounded-lg p-3 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800">
                    {statusCol}
                  </span>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {colItems.length}
                  </span>
                </div>

                {colItems.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-slate-400">
                    No items
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {colItems.map((item) => {
                      const isSelected = activeItem?.id === item.id;
                      const unresolvedCritical = item.findings.filter(
                        (f) =>
                          f.severity === "critical" &&
                          f.actionStatus !== "accepted" &&
                          f.actionStatus !== "edited" &&
                          f.actionStatus !== "overridden"
                      ).length;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectSubmission(item.id)}
                          className={`w-full text-left bg-white border rounded-md p-3 space-y-2 transition-colors cursor-pointer ${
                            isSelected
                              ? "border-[#1D4ED8] ring-1 ring-[#1D4ED8]"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-mono font-semibold text-slate-700">
                              {item.id}
                            </span>
                            <span className="font-mono tabular-nums font-semibold text-slate-800">
                              {item.currentScore !== undefined
                                ? `${item.currentScore}/100`
                                : "Unscored"}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-900 line-clamp-2">
                            {item.title}
                          </div>

                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1">
                            <span>{FORMAT_LABELS[item.format]}</span>
                            <span aria-hidden="true">·</span>
                            <span>{item.authorType}</span>
                          </div>

                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 truncate">
                              {item.routingTier}
                            </span>
                            {unresolvedCritical > 0 ? (
                              <span className="text-[#DC2626] font-semibold inline-flex items-center gap-0.5 shrink-0">
                                <ShieldAlert className="w-3 h-3" />
                                {unresolvedCritical} crit
                              </span>
                            ) : item.status === "Approved" ||
                              item.status === "Published" ? (
                              <span className="text-[#16A34A] font-semibold inline-flex items-center gap-0.5 shrink-0">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">ID</th>
                <th className="py-2.5 px-4">Title</th>
                <th className="py-2.5 px-4">Format · Author</th>
                <th className="py-2.5 px-4">Workflow Status</th>
                <th className="py-2.5 px-4">Auto-Routing Tier</th>
                <th className="py-2.5 px-4 text-right">Score</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSubmissions.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectSubmission(item.id)}
                  className={`hover:bg-slate-50 cursor-pointer ${
                    activeItem?.id === item.id ? "bg-blue-50/40" : ""
                  }`}
                >
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">
                    {item.id}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {item.title}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {FORMAT_LABELS[item.format]} · {item.authorType}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">
                    {item.status}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {item.routingTier}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold">
                    {item.currentScore ?? "—"}/100
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInStudio(item.id);
                      }}
                      className="text-[#1D4ED8] hover:underline font-semibold"
                    >
                      Open Studio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Content Governance Detail, Approval Controls, Comments & Audit Trail */}
      {activeItem && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono font-semibold text-slate-800">
                  {activeItem.id}
                </span>
                <span aria-hidden="true">·</span>
                <span>Status: {activeItem.status}</span>
                <span aria-hidden="true">·</span>
                <span>Routing: {activeItem.routingTier}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Compliance Score: {activeItem.currentScore ?? "—"}/100
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {activeItem.title}
                </h2>
                {(activeItem.status === "Approved" ||
                  activeItem.status === "Published") && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>AI-assisted, human-approved</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  Auto-Routing Policy:
                </span>{" "}
                Score ≥ 90 with zero critical issues routes to{" "}
                <span className="font-semibold">Light-Touch Review</span>; score &lt; 90 routes to{" "}
                <span className="font-semibold">Full Review</span>; legal-sensitive or confidential findings escalate to{" "}
                <span className="font-semibold">Brand Manager</span>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenInStudio(activeItem.id)}
              className="px-3.5 py-2 text-xs font-semibold text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Inspect in Review Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Governance Decision Bar (Reviewer & Brand Manager Controls) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-900">
                Human Governance Sign-Off Controls (Active Role:{" "}
                <span className="text-[#1D4ED8]">{ROLE_NAMES[currentRole]}</span>)
              </div>
              {activeItem.routingTier === "Brand Manager Escalation" &&
                currentRole !== "brand_manager" && (
                  <div className="text-xs text-[#D97706] font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      Escalated to Brand Manager (Switch role in toolbar for final escalation sign-off, or review below)
                    </span>
                  </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <input
                type="text"
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Add reviewer approval note or reason for requesting changes..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleApprove(activeItem)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#16A34A] hover:bg-emerald-700 rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Content</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRequestChanges(activeItem)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#D97706] hover:bg-amber-700 rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Request Changes</span>
                </button>

                {activeItem.status === "Approved" && (
                  <button
                    type="button"
                    onClick={() => handlePublish(activeItem)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Mark Published</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3-Column Governance Breakdown: Current Text & Findings Override | Comments | Full Audit Trail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Column 1: Current Copy & Finding Override List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-800">
                  Current Remediated Content
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                  {activeItem.currentText}
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-800">
                  Findings Status & Reviewer Override ({activeItem.findings.length})
                </div>
                {activeItem.findings.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Zero policy violations detected.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-200 space-y-2.5">
                    {activeItem.findings.map((f) => (
                      <div key={f.id} className="pt-2.5 first:pt-0 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">
                            {f.id} · {f.category} ({f.sourceId})
                          </span>
                          <span className="font-mono uppercase text-[11px] font-semibold text-slate-600">
                            {f.actionStatus}
                          </span>
                        </div>
                        <p className="text-slate-600">{f.explanation}</p>
                        {f.rejectionReason && (
                          <p className="text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                            <span className="font-semibold">
                              Creator Rejection Reason:{" "}
                            </span>
                            "{f.rejectionReason}"
                          </p>
                        )}
                        {f.overrideComment && (
                          <p className="text-slate-800 bg-slate-100 p-2 rounded">
                            <span className="font-semibold">
                              Override by {f.overriddenBy}:{" "}
                            </span>
                            "{f.overrideComment}"
                          </p>
                        )}

                        {f.actionStatus !== "accepted" &&
                          f.actionStatus !== "edited" &&
                          f.actionStatus !== "overridden" && (
                            <div>
                              {overridingFindingId === f.id ? (
                                <div className="mt-2 space-y-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                                  <input
                                    type="text"
                                    value={overrideCommentInput}
                                    onChange={(e) =>
                                      setOverrideCommentInput(e.target.value)
                                    }
                                    placeholder="Mandatory override comment..."
                                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOverrideInDrawer(f)}
                                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#1D4ED8] rounded cursor-pointer"
                                    >
                                      Confirm Override
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOverridingFindingId(null)
                                      }
                                      className="px-2.5 py-1 text-xs text-slate-600 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOverridingFindingId(f.id);
                                    setOverrideCommentInput("");
                                  }}
                                  className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
                                >
                                  Override Finding with Comment
                                </button>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Comment Thread */}
            <div className="lg:col-span-3 border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 border-b border-slate-200 pb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#1D4ED8]" />
                  <span>Review Comment Thread ({activeItem.comments.length})</span>
                </div>

                {activeItem.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">
                    No comments yet. Start a review discussion below.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {activeItem.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-800">
                            {c.authorName}
                          </span>
                          <span className="font-mono">
                            {new Date(c.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={`Comment as ${ROLE_NAMES[currentRole]}...`}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer"
                >
                  Post Comment
                </button>
              </form>
            </div>

            {/* Column 3: Full Audit Trail / Version History */}
            <div className="lg:col-span-4 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 border-b border-slate-200 pb-2">
                <History className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Immutable Audit Trail & Version History ({activeItem.auditTrail.length})</span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {activeItem.auditTrail
                  .slice()
                  .reverse()
                  .map((evt) => (
                    <div
                      key={evt.id}
                      className="pb-3 border-b border-slate-100 last:border-b-0 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-800">
                          {evt.actorName}
                        </span>
                        <span className="font-mono inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(evt.timestamp).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900">
                        {evt.action}
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {evt.details}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
