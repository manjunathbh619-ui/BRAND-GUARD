import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Edit3,
  FilePlus,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { KnowledgeCategory, KnowledgeItem, UserRole } from "../types";

interface KnowledgeBaseViewProps {
  knowledgeBase: KnowledgeItem[];
  onAddKnowledgeItem: (item: KnowledgeItem) => void;
  onUpdateKnowledgeItem: (item: KnowledgeItem) => void;
  currentRole: UserRole;
}

const CATEGORIES: KnowledgeCategory[] = [
  "Brand Guidelines",
  "Approved Facts & Claims",
  "Approved Assets",
  "Confidential Documents",
];

function incrementVersion(ver: string): string {
  const match = ver.match(/^v?(\d+)\.(\d+)$/i);
  if (!match) return "v1.1";
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10) + 1;
  return `v${major}.${minor}`;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  knowledgeBase,
  onAddKnowledgeItem,
  onUpdateKnowledgeItem,
  currentRole,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    KnowledgeCategory | "All"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // New / Edit Form state
  const [formCategory, setFormCategory] =
    useState<KnowledgeCategory>("Brand Guidelines");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formExpiry, setFormExpiry] = useState("");
  const [formRestricted, setFormRestricted] = useState(false);

  const filteredItems = knowledgeBase.filter((item) => {
    if (selectedCategory !== "All" && item.category !== selectedCategory) {
      return false;
    }
    if (
      searchQuery.trim() &&
      !`${item.id} ${item.title} ${item.tags.join(" ")} ${
        currentRole === "creator" && item.restricted ? "" : item.content
      }`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItemId(null);
    setFormCategory(
      selectedCategory === "All" ? "Brand Guidelines" : selectedCategory
    );
    setFormTitle("");
    setFormContent("");
    setFormTags("");
    setFormExpiry("");
    setFormRestricted(selectedCategory === "Confidential Documents");
    setIsAdding(true);
  };

  const handleOpenEdit = (item: KnowledgeItem) => {
    setIsAdding(false);
    setEditingItemId(item.id);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormTags(item.tags.join(", "));
    setFormExpiry(item.expiryDate || "");
    setFormRestricted(Boolean(item.restricted));
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const prefix =
      formCategory === "Brand Guidelines"
        ? "BG"
        : formCategory === "Approved Facts & Claims"
        ? "FC"
        : formCategory === "Approved Assets"
        ? "AA"
        : "CD";

    const newItem: KnowledgeItem = {
      id: `${prefix}-${Math.floor(500 + Math.random() * 499)}`,
      category: formCategory,
      title: formTitle.trim(),
      version: "v1.0",
      lastUpdated: "2026-10-24",
      expiryDate: formExpiry.trim() || undefined,
      restricted:
        formCategory === "Confidential Documents" ? true : formRestricted,
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      content: formContent.trim(),
      rejectionCount: 0,
      overrideCount: 0,
    };

    onAddKnowledgeItem(newItem);
    setIsAdding(false);
  };

  const handleSaveEdit = (item: KnowledgeItem) => {
    const updated: KnowledgeItem = {
      ...item,
      category: formCategory,
      title: formTitle.trim() || item.title,
      content: formContent.trim() || item.content,
      version: incrementVersion(item.version),
      lastUpdated: "2026-10-24",
      expiryDate: formExpiry.trim() || undefined,
      restricted:
        formCategory === "Confidential Documents" ? true : formRestricted,
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    onUpdateKnowledgeItem(updated);
    setEditingItemId(null);
  };

  const handleFileUploadPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setFormTitle(file.name.replace(/\.[^.]+$/, ""));
      setFormContent(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Trust, Safety & Privacy Governance Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Lock className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <div className="font-semibold text-slate-900">
              Confidential Document Protection & Zero-Leakage Guarantee
            </div>
            <p className="text-slate-600 leading-relaxed">
              Sources flagged <span className="font-semibold text-[#DC2626]">Restricted</span> are used strictly for pre-publication compliance checking and are never shown in AI rewrite suggestions or exported.{" "}
              {currentRole === "creator" ? (
                <span className="font-semibold text-amber-800">
                  Active Role is Creator: Restricted document contents are redacted below (Creators only see compliance findings).
                </span>
              ) : (
                <span className="font-semibold text-[#16A34A]">
                  Active Role ({currentRole === "brand_manager" ? "Brand Manager" : "Reviewer"}) has clearance to view and manage restricted documents.
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 rounded-md inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>Add Source Material</span>
        </button>
      </div>

      {/* Category Filter Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-md">
          {(["All", ...CATEGORIES] as const).map((cat) => {
            const count =
              cat === "All"
                ? knowledgeBase.length
                : knowledgeBase.filter((k) => k.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}{" "}
                <span className="font-mono tabular-nums text-[11px] text-slate-400">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guidelines, facts, hex codes..."
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>
      </div>

      {/* Add New Source Modal / Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveNew}
          className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Upload or Paste Approved Brand Source Material
            </h3>
            <label className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer">
              Upload .txt / .md File
              <input
                type="file"
                accept=".txt,.md,.json"
                onChange={handleFileUploadPaste}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => {
                  const val = e.target.value as KnowledgeCategory;
                  setFormCategory(val);
                  if (val === "Confidential Documents") setFormRestricted(true);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rule / Document Title *
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Q4 Cloud Benchmark Claims"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiry Date (Optional, for Facts & Claims)
              </label>
              <input
                type="date"
                value={formExpiry}
                onChange={(e) => setFormExpiry(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Retrieval Keywords / Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g., pricing, sla, security, logo"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 pt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  formCategory === "Confidential Documents" || formRestricted
                }
                onChange={(e) => setFormRestricted(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>
                Flag as Restricted / Confidential (Hidden from Creators & AI suggestions)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Approved Source Content / Rule Specification *
            </label>
            <textarea
              rows={4}
              required
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Paste the exact approved rule, product specification, legal claim, or restricted policy..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-blue-800 rounded-md cursor-pointer"
            >
              Save to Knowledge Base (v1.0)
            </button>
          </div>
        </form>
      )}

      {/* Knowledge Base Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isExpired =
            Boolean(item.expiryDate) && item.expiryDate! < "2026-10-24";
          const isRedactedForCreator =
            Boolean(item.restricted) && currentRole === "creator";
          const isEditingThis = editingItemId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Unboxed Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800">
                      {item.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700">
                      {item.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-600">
                      {item.version}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500">
                      Updated {item.lastUpdated}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.restricted && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#DC2626]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Restricted</span>
                      </span>
                    )}
                    {isExpired && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#DC2626]">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Expired ({item.expiryDate})</span>
                      </span>
                    )}
                    {!isExpired && item.expiryDate && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A] font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>Valid thru {item.expiryDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {item.title}
                </h3>

                {isEditingThis ? (
                  <div className="space-y-3 pt-2">
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded"
                    />
                    <textarea
                      rows={4}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] rounded cursor-pointer"
                      >
                        Save & Bump to {incrementVersion(item.version)}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingItemId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isRedactedForCreator ? (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-md text-xs text-amber-950 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>
                        Restricted Confidential Document — Redacted for Creator Role
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Creators cannot view raw confidential source text. BrandGuard checks submissions against this source automatically and surfaces redacted findings if a match occurs. Switch role to{" "}
                      <span className="font-semibold">Reviewer</span> or{" "}
                      <span className="font-semibold">Brand Manager</span> in the top toolbar to view or edit.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-md border border-slate-200">
                    {item.content}
                  </p>
                )}

                {/* Visual Swatch Preview for AA-301 Brand Colour Palette */}
                {item.id === "AA-301" && !isEditingThis && (
                  <div className="pt-2 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-600">
                      Approved Swatches vs. Prohibited Off-Brand Swatches:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded border border-slate-200 bg-[#0F172A] text-white">
                        #0F172A Navy
                      </div>
                      <div className="p-2 rounded border border-slate-200 bg-[#1D4ED8] text-white">
                        #1D4ED8 Cobalt
                      </div>
                      <div className="p-2 rounded border border-slate-200 bg-[#0D9488] text-white">
                        #0D9488 Teal
                      </div>
                      <div className="p-2 rounded border border-slate-200 bg-[#F8FAFC] text-slate-900">
                        #F8FAFC Slate
                      </div>
                      <div className="p-2 rounded border border-red-300 bg-[#FF00FF] text-white line-through">
                        #FF00FF Banned
                      </div>
                      <div className="p-2 rounded border border-red-300 bg-[#FFE600] text-slate-900 line-through">
                        #FFE600 Banned
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="text-slate-500 truncate">
                  Keywords: {item.tags.join(" · ")}
                </div>

                {!isRedactedForCreator && !isEditingThis && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="text-xs font-semibold text-[#1D4ED8] hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Rule</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
