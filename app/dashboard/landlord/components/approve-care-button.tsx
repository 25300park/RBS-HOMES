"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

interface ApproveCareButtonProps {
  careId: number;
  targetStatus?: string;
  label?: string;
  doneLabel?: string;
  extraBody?: Record<string, unknown>;
  onSuccess?: () => void;
}

export default function ApproveCareButton({
  careId,
  targetStatus = "SCHEDULED",
  label = "Approve",
  doneLabel = "Approved",
  extraBody,
  onSuccess,
}: ApproveCareButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/pms/care/${careId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus, ...extraBody }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 && data.error === "already_approved") {
          throw new Error(
            `Already approved by ${data.approvedByRole === "LANDLORD" ? "the owner" : "the agent"}.`
          );
        }
        throw new Error(data.error ?? "Failed to update care request.");
      }

      setApproved(true);
      onSuccess?.();
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "An error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={submitting || approved}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition-colors"
      >
        {submitting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : approved ? (
          <Check className="w-3 h-3" />
        ) : null}
        {approved ? doneLabel : label}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
