"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  DRAFT:                 { text: "Draft",              cls: "bg-gray-100 text-gray-600" },
  UNDER_LANDLORD_REVIEW: { text: "Awaiting Landlord",  cls: "bg-blue-100 text-blue-700" },
  SENT_TO_TENANT:        { text: "Sent to Tenant",     cls: "bg-yellow-100 text-yellow-700" },
  REVISION_REQUESTED:    { text: "Revision Requested", cls: "bg-orange-100 text-orange-700" },
  APPROVED:              { text: "Approved",           cls: "bg-green-100 text-green-700" },
  FINALIZED:             { text: "Finalized",          cls: "bg-emerald-100 text-emerald-700" },
  REJECTED:              { text: "Rejected",           cls: "bg-red-100 text-red-600" },
};

interface DraftData {
  id: number;
  unit: { title: string; adminId: number };
  content: string;
  status: string;
  updatedAt: Date | string;
}

interface Props {
  draft: DraftData;
  viewerRole: "landlord" | "tenant";
}

type ActionMode = "approve_edit" | "request_revision" | "resubmit" | null;

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ContractDraftDetail({ draft, viewerRole }: Props) {
  const router = useRouter();
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [editContent, setEditContent] = useState(draft.content);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Upload form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Tenant assignment state
  const [tenantMode, setTenantMode] = useState<"search" | "new">("search");
  const [tenantEmailQuery, setTenantEmailQuery] = useState("");
  const [tenantSearchLoading, setTenantSearchLoading] = useState(false);
  const [tenantSearchError, setTenantSearchError] = useState("");
  const [tenantSearched, setTenantSearched] = useState(false);
  const [foundTenant, setFoundTenant] = useState<{ id: number; email: string; name: string | null } | null>(null);
  const [newTenantEmail, setNewTenantEmail] = useState("");
  const [newTenantCreated, setNewTenantCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  const hasTenant =
    (tenantMode === "search" && foundTenant !== null) ||
    (tenantMode === "new" && newTenantEmail.trim() !== "" && isValidEmail(newTenantEmail.trim()));

  const canUpload =
    uploadFile !== null && startDate !== "" && endDate !== "" && monthlyRent !== "" && hasTenant;

  const handleTenantSearch = async () => {
    const email = tenantEmailQuery.trim();
    if (!email) return;

    setTenantSearchLoading(true);
    setTenantSearchError("");
    setFoundTenant(null);
    setTenantSearched(false);

    try {
      const res = await fetch(
        `/api/contract-draft/${draft.id}/tenant-search?email=${encodeURIComponent(email)}`
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setTenantSearchError(data.error ?? "Search failed. Please try again.");
        return;
      }

      setFoundTenant(data.user ?? null);
      setTenantSearched(true);
    } catch {
      setTenantSearchError("Network error. Please try again.");
    } finally {
      setTenantSearchLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpload || !uploadFile) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("startDate", startDate);
      fd.append("endDate", endDate);
      fd.append("monthlyRent", monthlyRent);
      if (tenantMode === "search" && foundTenant) {
        fd.append("tenantId", String(foundTenant.id));
      } else if (tenantMode === "new") {
        fd.append("newTenantEmail", newTenantEmail.trim());
      }

      const res = await fetch(`/api/contract-draft/${draft.id}/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed. Please try again.");
        return;
      }

      if (data.newTenant) {
        setNewTenantCreated(data.newTenant);
      }

      router.refresh();
    } catch {
      setUploadError("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const badge = STATUS_LABEL[draft.status] ?? { text: draft.status, cls: "bg-gray-100 text-gray-600" };

  const showLandlordActions =
    (draft.status === "UNDER_LANDLORD_REVIEW" || draft.status === "REVISION_REQUESTED") &&
    viewerRole === "landlord";
  const showTenantActions =
    draft.status === "SENT_TO_TENANT" && viewerRole === "tenant";

  const callAction = async (
    action: "approve" | "request_revision" | "resubmit" | "reject",
    content?: string
  ) => {
    setIsLoading(true);
    setError("");
    try {
      const body: { action: string; content?: string } = { action };
      if (content !== undefined) body.content = content;

      const res = await fetch(`/api/contract-draft/${draft.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Action failed. Please try again.");
        return;
      }

      setActionMode(null);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelMode = () => { setActionMode(null); setEditContent(draft.content); setError(""); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{draft.unit.title}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Updated{" "}
            {new Date(draft.updatedAt).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      {/* 신규 Tenant 생성 성공 시 임시 비밀번호 안내 */}
      {newTenantCreated && (
        <div className="border-2 border-orange-400 bg-orange-50 rounded-xl p-4 space-y-1">
          <p className="text-sm font-extrabold text-amber-700">
            ⚠️ This password will not be shown again. Please copy it now before leaving this page.
          </p>
          <p className="text-sm font-bold text-orange-800 pt-1">Tenant account created</p>
          <p className="text-sm text-orange-800">Email: {newTenantCreated.email}</p>
          <p className="text-sm text-orange-800">
            Temporary Password: <span className="font-mono font-bold">{newTenantCreated.tempPassword}</span>
          </p>
          <p className="text-xs text-orange-700 mt-1">
            Please share these credentials with the tenant directly.
          </p>
        </div>
      )}

      {/* Content */}
      <div className="border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-500 mb-2">Contract Content</p>
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {draft.content}
        </p>
      </div>

      {/* APPROVED: 공증 PDF 업로드 폼 */}
      {draft.status === "APPROVED" && (
        <div className="border border-green-200 rounded-xl p-4 space-y-4">
          <p className="text-sm text-green-700">
            Both parties have agreed. Please proceed with in-person signing and notarization,
            then upload the notarized PDF below.
          </p>
          <form onSubmit={handleUpload} className="space-y-4">
            {/* PDF 파일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notarized PDF
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                disabled={isUploading}
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 disabled:opacity-50"
              />
            </div>

            {/* 날짜 + 임대료 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isUploading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isUploading}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Rent (₱)</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  disabled={isUploading}
                  min="0"
                  placeholder="e.g. 25000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Tenant 지정 */}
            <div className="border border-gray-200 rounded-lg p-3 space-y-3">
              <p className="text-sm font-medium text-gray-700">Tenant</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTenantMode("search")}
                  disabled={isUploading}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-50 ${
                    tenantMode === "search"
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Find Existing Tenant
                </button>
                <button
                  type="button"
                  onClick={() => setTenantMode("new")}
                  disabled={isUploading}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-50 ${
                    tenantMode === "new"
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Create New Tenant
                </button>
              </div>

              {tenantMode === "search" ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={tenantEmailQuery}
                      onChange={(e) => {
                        setTenantEmailQuery(e.target.value);
                        setFoundTenant(null);
                        setTenantSearched(false);
                      }}
                      disabled={isUploading}
                      placeholder="tenant@example.com"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={handleTenantSearch}
                      disabled={isUploading || tenantSearchLoading || !tenantEmailQuery.trim()}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {tenantSearchLoading ? "Searching…" : "Search"}
                    </button>
                  </div>

                  {tenantSearchError && <p className="text-xs text-red-600">{tenantSearchError}</p>}

                  {tenantSearched && !foundTenant && (
                    <p className="text-xs text-gray-500">
                      No account found for this email. Use &quot;Create New Tenant&quot; instead.
                    </p>
                  )}

                  {foundTenant && (
                    <div className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm text-green-800">
                        {foundTenant.name ?? "(no name)"} — {foundTenant.email}
                      </span>
                      <span className="text-xs text-green-600 font-medium">Selected</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="email"
                    value={newTenantEmail}
                    onChange={(e) => setNewTenantEmail(e.target.value)}
                    disabled={isUploading}
                    placeholder="new-tenant@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-50"
                  />
                  {newTenantEmail.trim() !== "" && !isValidEmail(newTenantEmail.trim()) && (
                    <p className="text-xs text-red-600">Please enter a valid email address</p>
                  )}
                </div>
              )}
            </div>

            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!canUpload || isUploading}
                className="px-5 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:bg-orange-200 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? "Uploading…" : "Upload & Finalize"}
              </button>
            </div>
          </form>
        </div>
      )}
      {draft.status === "FINALIZED" && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          The notarized contract has been uploaded.
        </div>
      )}
      {draft.status === "REJECTED" && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          This contract negotiation was rejected.
        </div>
      )}

      {/* Landlord actions: UNDER_LANDLORD_REVIEW (Approve/Reject) */}
      {showLandlordActions && draft.status === "UNDER_LANDLORD_REVIEW" && (
        <div className="space-y-3">
          {actionMode === "approve_edit" ? (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Edit content before approving (optional)
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y disabled:bg-gray-50"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={cancelMode} disabled={isLoading}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  Cancel
                </button>
                <button type="button"
                  onClick={() => callAction("approve", editContent.trim() !== draft.content ? editContent.trim() : undefined)}
                  disabled={isLoading || !editContent.trim()}
                  className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:bg-green-200 disabled:cursor-not-allowed transition-colors">
                  {isLoading ? "Sending…" : "Approve & Send to Tenant"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2 justify-end">
              <button type="button" onClick={() => callAction("reject")} disabled={isLoading}
                className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
                {isLoading ? "…" : "Reject"}
              </button>
              <button type="button" onClick={() => { setActionMode("approve_edit"); setEditContent(draft.content); setError(""); }} disabled={isLoading}
                className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:bg-green-200 disabled:cursor-not-allowed transition-colors">
                Approve
              </button>
            </div>
          )}
          {error && <p className="text-sm text-red-600 text-right">{error}</p>}
        </div>
      )}

      {/* Landlord actions: REVISION_REQUESTED (Resubmit/Reject) */}
      {showLandlordActions && draft.status === "REVISION_REQUESTED" && (
        <div className="space-y-3">
          {actionMode === "resubmit" ? (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Revised Contract Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y disabled:bg-gray-50"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={cancelMode} disabled={isLoading}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={() => callAction("resubmit", editContent.trim())}
                  disabled={isLoading || !editContent.trim()}
                  className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:bg-orange-200 disabled:cursor-not-allowed transition-colors">
                  {isLoading ? "Sending…" : "Resubmit to Tenant"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2 justify-end">
              <button type="button" onClick={() => callAction("reject")} disabled={isLoading}
                className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
                {isLoading ? "…" : "Reject"}
              </button>
              <button type="button" onClick={() => { setActionMode("resubmit"); setEditContent(draft.content); setError(""); }} disabled={isLoading}
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:bg-orange-200 disabled:cursor-not-allowed transition-colors">
                Resubmit
              </button>
            </div>
          )}
          {error && <p className="text-sm text-red-600 text-right">{error}</p>}
        </div>
      )}

      {/* Tenant actions: SENT_TO_TENANT (Approve / Request Revision / Reject) */}
      {showTenantActions && (
        <div className="space-y-3">
          {actionMode === "request_revision" ? (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Revision Request (describe what needs to change)
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y disabled:bg-gray-50"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={cancelMode} disabled={isLoading}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={() => callAction("request_revision", editContent.trim())}
                  disabled={isLoading || !editContent.trim()}
                  className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:bg-orange-200 disabled:cursor-not-allowed transition-colors">
                  {isLoading ? "Sending…" : "Send Revision Request"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2 justify-end">
              <button type="button" onClick={() => callAction("reject")} disabled={isLoading}
                className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
                {isLoading ? "…" : "Reject"}
              </button>
              <button type="button" onClick={() => { setActionMode("request_revision"); setEditContent(""); setError(""); }} disabled={isLoading}
                className="px-4 py-2 text-sm border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 transition-colors">
                Request Revision
              </button>
              <button type="button" onClick={() => callAction("approve")} disabled={isLoading}
                className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:bg-green-200 disabled:cursor-not-allowed transition-colors">
                {isLoading ? "…" : "Approve"}
              </button>
            </div>
          )}
          {error && <p className="text-sm text-red-600 text-right">{error}</p>}
        </div>
      )}
    </div>
  );
}
