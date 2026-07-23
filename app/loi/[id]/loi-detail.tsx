"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignaturePad from "@/components/signature/signature-pad";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  DRAFT:                 { text: "Draft",             cls: "bg-gray-100 text-gray-600" },
  UNDER_LANDLORD_REVIEW: { text: "Awaiting Landlord", cls: "bg-blue-100 text-blue-700" },
  COUNTER_OFFERED:       { text: "Counter Offered",   cls: "bg-orange-100 text-orange-700" },
  TENANT_APPROVED:       { text: "Tenant Approved",   cls: "bg-green-100 text-green-700" },
  SIGNED:                { text: "Signed",            cls: "bg-emerald-100 text-emerald-700" },
  REJECTED:              { text: "Rejected",          cls: "bg-red-100 text-red-600" },
};

interface LoiData {
  id: number;
  unitId: number;
  unit: { title: string };
  content: string;
  status: string;
  landlordSignature: string | null;
  tenantSignature: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface Props {
  loi: LoiData;
  viewerRole: "landlord" | "tenant";
}

export default function LoiDetail({ loi, viewerRole }: Props) {
  const router = useRouter();
  const [isCountering, setIsCountering] = useState(false);
  const [counterContent, setCounterContent] = useState(loi.content);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState("");

  const badge = STATUS_LABEL[loi.status] ?? { text: loi.status, cls: "bg-gray-100 text-gray-600" };

  const showActions =
    (loi.status === "UNDER_LANDLORD_REVIEW" && viewerRole === "landlord") ||
    (loi.status === "COUNTER_OFFERED" && viewerRole === "tenant");

  const mySignature =
    viewerRole === "landlord" ? loi.landlordSignature : loi.tenantSignature;
  const viewerHasSigned = Boolean(mySignature);

  const callAction = async (action: "approve" | "counter" | "reject") => {
    setIsLoading(true);
    setError("");
    try {
      const body: { action: string; content?: string } = { action };
      if (action === "counter") body.content = counterContent.trim();

      const res = await fetch(`/api/loi/${loi.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Action failed. Please try again.");
        return;
      }

      setIsCountering(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async (dataUrl: string) => {
    setIsSigning(true);
    setError("");
    try {
      const res = await fetch(`/api/loi/${loi.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureDataUrl: dataUrl }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "서명 제출에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{loi.unit.title}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Updated{" "}
            {new Date(loi.updatedAt).toLocaleDateString("en-PH", {
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
        <p className="text-sm font-medium text-gray-500 mb-2">LOI Content</p>
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {loi.content}
        </p>
      </div>

      {/* TENANT_APPROVED: 서명 단계 */}
      {loi.status === "TENANT_APPROVED" && (
        <div className="space-y-4">
          {viewerHasSigned ? (
            <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl space-y-3">
              <p className="text-sm text-green-700">
                You have signed. Waiting for the other party to sign.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mySignature!}
                alt="Your signature"
                className="h-16 object-contain border border-green-200 rounded bg-white p-1"
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-sm text-gray-700 font-medium">
                Please sign below to confirm this LOI.
              </p>
              {isSigning && (
                <p className="text-xs text-gray-400">Submitting signature…</p>
              )}
              <SignaturePad onSave={handleSign} />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}
        </div>
      )}

      {/* SIGNED: 양측 서명 표시 */}
      {loi.status === "SIGNED" && (
        <div className="border border-emerald-200 rounded-xl p-4 space-y-4">
          <p className="text-sm text-emerald-700 font-medium">
            This LOI has been signed by both parties.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Landlord Signature</p>
              {loi.landlordSignature ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={loi.landlordSignature}
                  alt="Landlord signature"
                  className="w-full max-h-24 object-contain border border-gray-200 rounded bg-white p-1"
                />
              ) : (
                <p className="text-xs text-gray-400">—</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tenant Signature</p>
              {loi.tenantSignature ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={loi.tenantSignature}
                  alt="Tenant signature"
                  className="w-full max-h-24 object-contain border border-gray-200 rounded bg-white p-1"
                />
              ) : (
                <p className="text-xs text-gray-400">—</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECTED */}
      {loi.status === "REJECTED" && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          This LOI was rejected.
        </div>
      )}

      {/* Action area (협상 단계) */}
      {showActions && (
        <div className="space-y-3">
          {isCountering ? (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Counter-Offer Content
              </label>
              <textarea
                value={counterContent}
                onChange={(e) => setCounterContent(e.target.value)}
                rows={10}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y disabled:bg-gray-50"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsCountering(false); setError(""); }}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => callAction("counter")}
                  disabled={isLoading || !counterContent.trim()}
                  className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:bg-orange-200 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Sending…" : "Send Counter-Offer"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => callAction("reject")}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "…" : "Reject"}
              </button>
              <button
                type="button"
                onClick={() => { setIsCountering(true); setCounterContent(loi.content); setError(""); }}
                disabled={isLoading}
                className="px-4 py-2 text-sm border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 transition-colors"
              >
                Counter
              </button>
              <button
                type="button"
                onClick={() => callAction("approve")}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:bg-green-200 disabled:cursor-not-allowed transition-colors"
              >
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
