/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  ContentSubmission,
  KnowledgeItem,
  UserRole,
} from "./types";
import {
  DEMO_SCENARIO_SUBMISSIONS,
  INITIAL_KNOWLEDGE_BASE,
} from "./data/seedData";
import { ReviewStudio } from "./components/ReviewStudio";
import { ApprovalBoard } from "./components/ApprovalBoard";
import { KnowledgeBaseView } from "./components/KnowledgeBaseView";
import { InsightsDashboard } from "./components/InsightsDashboard";

type ActiveTab = "studio" | "workflow" | "knowledge" | "insights";

const STORAGE_KEY_SUBMISSIONS = "brandguard_submissions_v1";
const STORAGE_KEY_KB = "brandguard_kb_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("studio");
  const [currentRole, setCurrentRole] = useState<UserRole>("creator");
  const [demoToast, setDemoToast] = useState<string | null>(null);

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KB);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore localStorage error
    }
    return INITIAL_KNOWLEDGE_BASE;
  });

  const [submissions, setSubmissions] = useState<ContentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore localStorage error
    }
    return DEMO_SCENARIO_SUBMISSIONS;
  });

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(
    () => DEMO_SCENARIO_SUBMISSIONS[0].id
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_KB, JSON.stringify(knowledgeBase));
    } catch {
      // ignore storage quota errors
    }
  }, [knowledgeBase]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
    } catch {
      // ignore storage quota errors
    }
  }, [submissions]);

  const handleLoadDemoScenario = () => {
    setKnowledgeBase(INITIAL_KNOWLEDGE_BASE);
    setSubmissions(DEMO_SCENARIO_SUBMISSIONS);
    setSelectedSubmissionId(DEMO_SCENARIO_SUBMISSIONS[0].id);
    setCurrentRole("creator");
    setActiveTab("studio");
    setDemoToast(
      "Loaded 3 Nimbus Cloud demo scenarios (Social Post with NDA leak & superlatives, Blog with expired FY25 pricing, and Off-Brand Display Banner)."
    );
    setTimeout(() => setDemoToast(null), 5000);
  };

  const handleUpdateSubmission = (updated: ContentSubmission) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleCreateSubmission = (created: ContentSubmission) => {
    setSubmissions((prev) => [created, ...prev]);
    setSelectedSubmissionId(created.id);
  };

  const handleAddKnowledgeItem = (item: KnowledgeItem) => {
    setKnowledgeBase((prev) => [item, ...prev]);
  };

  const handleUpdateKnowledgeItem = (updated: KnowledgeItem) => {
    setKnowledgeBase((prev) =>
      prev.map((k) => (k.id === updated.id ? updated : k))
    );
  };

  const handleRecordRuleFriction = (
    sourceId: string,
    type: "reject" | "override"
  ) => {
    setKnowledgeBase((prev) =>
      prev.map((k) => {
        if (k.id !== sourceId) return k;
        return {
          ...k,
          rejectionCount:
            type === "reject"
              ? (k.rejectionCount || 0) + 1
              : k.rejectionCount || 0,
          overrideCount:
            type === "override"
              ? (k.overrideCount || 0) + 1
              : k.overrideCount || 0,
        };
      })
    );
  };

  const pendingReviewsCount = submissions.filter(
    (s) => s.status === "In Review" || s.status === "AI Reviewed"
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#studio"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("studio");
          }}
          className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
        >
          BrandGuard
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto"
        >
          <a
            href="#studio"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("studio");
            }}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === "studio"
                ? "text-[#1D4ED8] border-[#1D4ED8] font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Review Studio
          </a>

          <a
            href="#workflow"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("workflow");
            }}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === "workflow"
                ? "text-[#1D4ED8] border-[#1D4ED8] font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Approval Board ({pendingReviewsCount})
          </a>

          <a
            href="#knowledge"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("knowledge");
            }}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === "knowledge"
                ? "text-[#1D4ED8] border-[#1D4ED8] font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Knowledge Base ({knowledgeBase.length})
          </a>

          <a
            href="#insights"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("insights");
            }}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === "insights"
                ? "text-[#1D4ED8] border-[#1D4ED8] font-semibold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Brand Insights
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleLoadDemoScenario}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Demo Scenario</span>
          </button>
        </div>
      </header>

      {/* Workspace Context & Role Switcher Bar (Below <header>) */}
      <div className="bg-slate-900 text-slate-100 px-6 py-2.5 border-b border-slate-800">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Interactive Guided Demo Walkthrough Strip */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-300">
              Guided Demo Flow:
            </span>
            <button
              type="button"
              onClick={handleLoadDemoScenario}
              className="text-slate-300 hover:text-white underline-offset-4 hover:underline cursor-pointer whitespace-nowrap"
            >
              01. Load 3 Demo Items
            </button>
            <span aria-hidden="true" className="text-slate-600">
              →
            </span>
            <button
              type="button"
              onClick={() => {
                setCurrentRole("creator");
                setActiveTab("studio");
              }}
              className={`cursor-pointer whitespace-nowrap ${
                activeTab === "studio" && currentRole === "creator"
                  ? "text-blue-400 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              02. Creator: Review & Accept Fixes
            </button>
            <span aria-hidden="true" className="text-slate-600">
              →
            </span>
            <button
              type="button"
              onClick={() => {
                setCurrentRole("reviewer");
                setActiveTab("workflow");
              }}
              className={`cursor-pointer whitespace-nowrap ${
                activeTab === "workflow" && currentRole === "reviewer"
                  ? "text-blue-400 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              03. Reviewer: Approve / Override
            </button>
            <span aria-hidden="true" className="text-slate-600">
              →
            </span>
            <button
              type="button"
              onClick={() => {
                setCurrentRole("brand_manager");
                setActiveTab("insights");
              }}
              className={`cursor-pointer whitespace-nowrap ${
                activeTab === "insights" && currentRole === "brand_manager"
                  ? "text-blue-400 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              04. Brand Manager: Insights & Rules
            </button>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 inline-flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Active Role:</span>
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-md">
              <button
                type="button"
                onClick={() => setCurrentRole("creator")}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  currentRole === "creator"
                    ? "bg-[#1D4ED8] text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                1. Creator
              </button>
              <button
                type="button"
                onClick={() => setCurrentRole("reviewer")}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  currentRole === "reviewer"
                    ? "bg-[#1D4ED8] text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                2. Reviewer
              </button>
              <button
                type="button"
                onClick={() => setCurrentRole("brand_manager")}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  currentRole === "brand_manager"
                    ? "bg-[#1D4ED8] text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                3. Brand Manager
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Scenario Toast Notification */}
      {demoToast && (
        <div className="bg-emerald-900 text-white px-6 py-2.5 text-xs">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{demoToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setDemoToast(null)}
              className="text-emerald-200 hover:text-white font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6">
        {activeTab === "studio" && (
          <ReviewStudio
            submissions={submissions}
            selectedSubmissionId={selectedSubmissionId}
            onSelectSubmission={setSelectedSubmissionId}
            onUpdateSubmission={handleUpdateSubmission}
            onCreateSubmission={handleCreateSubmission}
            knowledgeBase={knowledgeBase}
            currentRole={currentRole}
            onNavigateToBoard={() => {
              setCurrentRole("reviewer");
              setActiveTab("workflow");
            }}
            onRecordRuleFriction={handleRecordRuleFriction}
          />
        )}

        {activeTab === "workflow" && (
          <ApprovalBoard
            submissions={submissions}
            selectedSubmissionId={selectedSubmissionId}
            onSelectSubmission={setSelectedSubmissionId}
            onUpdateSubmission={handleUpdateSubmission}
            currentRole={currentRole}
            onOpenInStudio={(id) => {
              setSelectedSubmissionId(id);
              setActiveTab("studio");
            }}
            onRecordRuleFriction={handleRecordRuleFriction}
          />
        )}

        {activeTab === "knowledge" && (
          <KnowledgeBaseView
            knowledgeBase={knowledgeBase}
            onAddKnowledgeItem={handleAddKnowledgeItem}
            onUpdateKnowledgeItem={handleUpdateKnowledgeItem}
            currentRole={currentRole}
          />
        )}

        {activeTab === "insights" && (
          <InsightsDashboard
            submissions={submissions}
            knowledgeBase={knowledgeBase}
            onUpdateKnowledgeItem={handleUpdateKnowledgeItem}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-12">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
            <span className="font-semibold text-slate-800">
              BrandGuard Governance Platform
            </span>
            <span aria-hidden="true">·</span>
            <span>Nimbus Cloud Brand Workspace</span>
          </div>
          <div>
            Automation finds and explains issues; humans make the final decision.
          </div>
        </div>
      </footer>
    </div>
  );
}
