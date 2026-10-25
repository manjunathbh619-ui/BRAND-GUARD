import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ClarificationDraft,
  ContentSubmission,
  KnowledgeItem,
} from "../types";

interface InsightsDashboardProps {
  submissions: ContentSubmission[];
  knowledgeBase: KnowledgeItem[];
  onUpdateKnowledgeItem: (updated: KnowledgeItem) => void;
}

const DEFAULT_CLARIFICATIONS: Record<string, ClarificationDraft> = {
  "BG-102": {
    diagnosis:
      "Creators and partner agencies frequently reject or override the blanket ban on 'users' when writing B2B2C healthcare or developer documentation where they need to distinguish the paying enterprise customer from downstream clinical or end-application operators.",
    suggestedClarification:
      "Always refer to organizations and teams purchasing or operating Nimbus Cloud as 'customers', 'developers', or 'engineering teams' — NEVER 'users' or 'clients'. Exception for B2B2C / multi-tenant technical documentation: you may refer to a customer's downstream application consumers by their domain role (e.g., 'clinical researchers', 'patient portal members', or 'downstream application consumers'), avoiding bare 'users'. Always write 'Nimbus Cloud' as two words.",
    proposedVersion: "v2.5",
    exampleDo:
      "Healthcare customers deploy Nimbus Cloud so their clinical researchers can process genomic datasets securely.",
    exampleDont:
      "Healthcare clients use NimbusCloud so their end-users can run workloads.",
  },
  "BG-101": {
    diagnosis:
      "Paid social creators often push back on tone flags when writing short-form ad hooks, feeling that empirical prose lacks urgency.",
    suggestedClarification:
      "Nimbus Cloud communicates with calm, empirical engineering authority. Avoid exclamation marks, ALL-CAPS phrases, and unverified superlatives ('BLAZINGLY FAST', 'UNLEASH THE POWER'). For paid social hooks, create urgency by leading with concrete quantified metrics (e.g., 'Cut p99 cold-start latency by 62%') and clear trial value ('$300 compute credits').",
    proposedVersion: "v3.3",
    exampleDo:
      "Cut p99 container cold-start latency by 62% — start your 14-day trial with $300 in credits.",
    exampleDont: "BLAZINGLY FAST INFRASTRUCTURE! UNLEASH THE POWER TODAY!!!",
  },
  "AA-303": {
    diagnosis:
      "Designers occasionally override the 8-word banner headline limit when enterprise compliance badges (SOC 2, ISO 27001) are included in the visual frame.",
    suggestedClarification:
      "Visual ad banners must maintain a single primary headline of up to 8 words in sentence case and 1 primary CTA. Trust certification marks (e.g., 'SOC 2 Type II · 99.99% SLA') may appear as a quiet secondary metadata line in monospace font without counting against the headline word limit, provided total text coverage remains under 20% of canvas area.",
    proposedVersion: "v2.2",
    exampleDo:
      "Headline: 'Predictable multi-region container infrastructure at scale.' + Footnote: 'SOC 2 Type II · 99.99% SLA'",
    exampleDont:
      "Four stacked all-caps paragraphs covering 60% of the banner canvas.",
  },
};

export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  submissions,
  knowledgeBase,
  onUpdateKnowledgeItem,
}) => {
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});
  const [draftError, setDraftError] = useState<string | null>(null);

  // Aggregate KPI Metrics
  const kpis = useMemo(() => {
    const scored = submissions.filter((s) => s.currentScore !== undefined);
    const avgInitial =
      scored.length > 0
        ? Math.round(
            scored.reduce((acc, s) => acc + (s.initialScore ?? s.currentScore ?? 80), 0) /
              scored.length
          )
        : 0;
    const avgCurrent =
      scored.length > 0
        ? Math.round(
            scored.reduce((acc, s) => acc + (s.currentScore ?? 80), 0) /
              scored.length
          )
        : 0;

    const totalFindings = submissions.reduce(
      (acc, s) => acc + s.findings.length,
      0
    );
    const acceptedOrEdited = submissions.reduce(
      (acc, s) =>
        acc +
        s.findings.filter(
          (f) => f.actionStatus === "accepted" || f.actionStatus === "edited"
        ).length,
      0
    );

    const unclearRulesCount = knowledgeBase.filter(
      (k) => (k.rejectionCount || 0) + (k.overrideCount || 0) >= 3
    ).length;

    return {
      avgInitial,
      avgCurrent,
      totalFindings,
      acceptedOrEdited,
      avgApprovalHours: "2.4 hrs",
      unclearRulesCount,
    };
  }, [submissions, knowledgeBase]);

  // Compliance Trend Over Time (Weekly)
  const complianceTrendData = useMemo(() => {
    const latestAvg = kpis.avgCurrent || 84;
    return [
      { period: "Sep W2", initialScore: 54, postFixScore: 78 },
      { period: "Sep W3", initialScore: 58, postFixScore: 82 },
      { period: "Sep W4", initialScore: 61, postFixScore: 86 },
      { period: "Oct W1", initialScore: 64, postFixScore: 89 },
      { period: "Oct W2", initialScore: 68, postFixScore: 92 },
      {
        period: "Oct W3 (Current)",
        initialScore: kpis.avgInitial || 52,
        postFixScore: latestAvg,
      },
    ];
  }, [kpis]);

  // Top Repeated Mistakes by Category
  const categoryMistakesData = useMemo(() => {
    const counts: Record<string, number> = {
      "Unsupported Claim": 8,
      Terminology: 11,
      "Outdated Information": 6,
      "Tone & Voice": 7,
      "Visual Consistency": 5,
      Accessibility: 4,
      "Confidential Leakage": 2,
    };
    for (const sub of submissions) {
      for (const f of sub.findings) {
        counts[f.category] = (counts[f.category] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [submissions]);

  // Breakdown by Author Type
  const authorBreakdownData = useMemo(() => {
    const groups: Record<
      string,
      { initialTotal: number; finalTotal: number; count: number }
    > = {
      Employee: { initialTotal: 170, finalTotal: 192, count: 2 },
      Agency: { initialTotal: 138, finalTotal: 176, count: 2 },
      "AI-Generated": { initialTotal: 96, finalTotal: 172, count: 2 },
    };

    for (const s of submissions) {
      if (s.currentScore !== undefined) {
        const g = groups[s.authorType] || {
          initialTotal: 0,
          finalTotal: 0,
          count: 0,
        };
        g.initialTotal += s.initialScore ?? s.currentScore;
        g.finalTotal += s.currentScore;
        g.count += 1;
        groups[s.authorType] = g;
      }
    }

    return Object.entries(groups).map(([authorType, stats]) => ({
      authorType,
      initialAvg: Math.round(stats.initialTotal / Math.max(1, stats.count)),
      finalAvg: Math.round(stats.finalTotal / Math.max(1, stats.count)),
    }));
  }, [submissions]);

  // Breakdown by Team & Format
  const teamAndFormatMetrics = useMemo(() => {
    return [
      {
        segment: "Growth Marketing (Social & Paid)",
        submissions: 14,
        avgInitial: 58,
        avgFinal: 93,
        avgTime: "1.9 hrs",
      },
      {
        segment: "Content & Editorial (Blog / Agency)",
        submissions: 11,
        avgInitial: 64,
        avgFinal: 91,
        avgTime: "3.1 hrs",
      },
      {
        segment: "Brand & Creative (Display Banners)",
        submissions: 8,
        avgInitial: 61,
        avgFinal: 89,
        avgTime: "2.8 hrs",
      },
      {
        segment: "Product Marketing (Lifecycle Email)",
        submissions: 12,
        avgInitial: 84,
        avgFinal: 97,
        avgTime: "1.4 hrs",
      },
    ];
  }, []);

  // Unclear Guidelines (high rejection / override counts)
  const unclearGuidelines = useMemo(() => {
    return knowledgeBase
      .filter((k) => (k.rejectionCount || 0) + (k.overrideCount || 0) >= 3)
      .sort(
        (a, b) =>
          (b.rejectionCount || 0) +
          (b.overrideCount || 0) -
          ((a.rejectionCount || 0) + (a.overrideCount || 0))
      );
  }, [knowledgeBase]);

  const handleDraftWithGemini = async (rule: KnowledgeItem) => {
    setDraftingId(rule.id);
    setDraftError(null);

    const rejectionReasons: string[] = [];
    const overrideComments: string[] = [];
    for (const s of submissions) {
      for (const f of s.findings) {
        if (f.sourceId === rule.id) {
          if (f.rejectionReason) rejectionReasons.push(f.rejectionReason);
          if (f.overrideComment) overrideComments.push(f.overrideComment);
        }
      }
    }

    if (rejectionReasons.length === 0) {
      rejectionReasons.push(
        "Creators report ambiguity when applying this rule to specialized technical or B2B2C enterprise contexts."
      );
    }

    try {
      const response = await fetch("/api/draft-clarification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideline: rule,
          rejectionReasons,
          overrideComments,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate clarification");
      }

      onUpdateKnowledgeItem({
        ...rule,
        clarificationDraft: {
          diagnosis: data.diagnosis,
          suggestedClarification: data.suggestedClarification,
          proposedVersion: data.proposedVersion || "v2.5",
          exampleDo: data.exampleDo,
          exampleDont: data.exampleDont,
        },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not reach Gemini endpoint.";
      setDraftError(msg);
    } finally {
      setDraftingId(null);
    }
  };

  const handleApplyClarification = (
    rule: KnowledgeItem,
    draft: ClarificationDraft
  ) => {
    onUpdateKnowledgeItem({
      ...rule,
      content: `${draft.suggestedClarification} (Do: "${draft.exampleDo}" | Don't: "${draft.exampleDont}")`,
      version: draft.proposedVersion,
      lastUpdated: "2026-10-24",
      rejectionCount: 0,
      overrideCount: 0,
      clarificationDraft: draft,
    });
    setAppliedIds((prev) => ({ ...prev, [rule.id]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Top 4-Column KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">
            Avg. Pre- vs. Post-Review Compliance
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {kpis.avgInitial}%{" "}
            <span className="text-slate-400 font-normal">→</span>{" "}
            <span className="text-[#16A34A]">{kpis.avgCurrent}%</span>
          </div>
          <div className="text-xs text-slate-500">
            +{Math.max(0, kpis.avgCurrent - kpis.avgInitial)} pts lift before human review
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">
            Average Time to Approval
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 flex items-center gap-2">
            <span>{kpis.avgApprovalHours}</span>
            <Clock className="w-4 h-4 text-[#1D4ED8]" />
          </div>
          <div className="text-xs text-slate-500">
            Down 64% vs. manual legal queue (6.8 hrs)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">
            AI Findings Addressed Pre-Submit
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {kpis.acceptedOrEdited} / {kpis.totalFindings}
          </div>
          <div className="text-xs text-slate-500">
            Explainable citations with source versions
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">
            Guidelines Flagged "May Be Unclear"
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#D97706]">
            {unclearGuidelines.length} Rules
          </div>
          <div className="text-xs text-slate-500">
            High creator rejection or reviewer override rate
          </div>
        </div>
      </div>

      {/* Charts Row: Compliance Score Trend & Top Repeated Mistakes by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Brand Compliance Score Trend Over Time
              </h2>
              <p className="text-xs text-slate-500">
                Initial draft score vs. post-remediation score submitted for approval
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={complianceTrendData}
                margin={{ top: 10, right: 16, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="postFixScore"
                  name="Post-Remediation Score"
                  stroke="#1D4ED8"
                  fill="#1D4ED8"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="initialScore"
                  name="Initial Draft Score"
                  stroke="#94A3B8"
                  fill="#94A3B8"
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Top Repeated Mistakes by Governance Category
            </h2>
            <p className="text-xs text-slate-500">
              Cumulative violations detected across pre-publication reviews
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryMistakesData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis
                  dataKey="category"
                  type="category"
                  width={135}
                  tick={{ fontSize: 11, fill: "#0F172A" }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Flagged Occurrences"
                  fill="#1D4ED8"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Author Provenance Chart + Team & Format Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Compliance Score by Author Source
            </h2>
            <p className="text-xs text-slate-500">
              Employee vs. External Agency vs. AI-Generated drafts (Initial vs. Final)
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={authorBreakdownData}
                margin={{ top: 10, right: 16, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="authorType"
                  tick={{ fontSize: 11, fill: "#0F172A" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                  }}
                />
                <Bar
                  dataKey="initialAvg"
                  name="Initial Draft Avg"
                  fill="#94A3B8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="finalAvg"
                  name="Post-Fix Avg"
                  fill="#0D9488"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Governance Performance by Team & Format
            </h2>
            <p className="text-xs text-slate-500">
              Volume, initial vs. remediated compliance score, and average time to human approval
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Team & Primary Format</th>
                  <th className="py-2.5 px-3 text-right">Audited Items</th>
                  <th className="py-2.5 px-3 text-right">Initial Score</th>
                  <th className="py-2.5 px-3 text-right">Final Score</th>
                  <th className="py-2.5 px-3 text-right">Avg. Time to Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teamAndFormatMetrics.map((row) => (
                  <tr key={row.segment} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {row.segment}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {row.submissions}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {row.avgInitial}/100
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-[#16A34A]">
                      {row.avgFinal}/100
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      {row.avgTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* "Guideline May Be Unclear" Policy Refinement Engine */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              <h2 className="text-base font-bold text-slate-900">
                Rules Flagged "Guideline May Be Unclear" — AI Policy Clarification
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Guidelines where creators frequently reject AI suggestions or reviewers override findings. Gemini analyzes the pushback reasons and drafts a clearer rule version for Brand Manager sign-off.
            </p>
          </div>
        </div>

        {draftError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900">
            {draftError}
          </div>
        )}

        <div className="space-y-4">
          {unclearGuidelines.map((rule) => {
            const draft =
              rule.clarificationDraft || DEFAULT_CLARIFICATIONS[rule.id];
            const isApplied = Boolean(appliedIds[rule.id]);

            return (
              <div
                key={rule.id}
                className="border border-slate-200 rounded-lg p-5 space-y-4 bg-slate-50/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900">
                      {rule.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-slate-900">
                      {rule.title}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-600">
                      Current {rule.version}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[#D97706]">
                      Guideline may be unclear ({rule.rejectionCount || 0} creator rejections ·{" "}
                      {rule.overrideCount || 0} reviewer overrides)
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={draftingId === rule.id}
                    onClick={() => handleDraftWithGemini(rule)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {draftingId === rule.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Drafting with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Regenerate Clarification with Gemini</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-1.5">
                    <div className="font-semibold text-slate-600">
                      Current Rule Text ({rule.version})
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {rule.content}
                    </p>
                  </div>

                  {draft && (
                    <div className="bg-white border border-blue-200 rounded-md p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1D4ED8]">
                          Gemini Proposed Clarification ({draft.proposedVersion})
                        </span>
                        {isApplied && (
                          <span className="text-[#16A34A] font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Published to Knowledge Base
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Friction Diagnosis:{" "}
                        </span>
                        {draft.diagnosis}
                      </p>

                      <p className="text-slate-900 font-medium bg-blue-50/50 p-2.5 rounded border border-blue-100 leading-relaxed">
                        "{draft.suggestedClarification}"
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-950">
                          <span className="font-semibold">Approved Do: </span>
                          {draft.exampleDo}
                        </div>
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-red-950">
                          <span className="font-semibold">Non-Compliant Don't: </span>
                          {draft.exampleDont}
                        </div>
                      </div>

                      {!isApplied && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleApplyClarification(rule, draft)
                            }
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 rounded cursor-pointer"
                          >
                            Approve & Publish Clarification ({draft.proposedVersion})
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
