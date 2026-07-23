"use client";

import { useState } from "react";
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

export default function ContractDraftDetail({ draft, viewerRole }: Props) {
  const router = useRouter();
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [editContent, setEditContent] = useState(draft.content);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

      {/* Content */}
      <div className="border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-500 mb-2">Contract Content</p>
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {draft.content}
        </p>
      </div>

      {/* Terminal state messages */}
      {draft.status === "APPROVED" && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          Both parties have agreed. Please proceed with in-person signing, then upload the
          notarized document. (Upload feature coming soon.)
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
