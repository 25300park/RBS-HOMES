"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ConfirmCareCompletionButtonProps {
  careId: number;
}

export default function ConfirmCareCompletionButton({ careId }: ConfirmCareCompletionButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/pms/care/${careId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (!res.ok) throw new Error("Failed to confirm completion.");

      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "An error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={submitting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#10B981]/90 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition-colors"
      >
        {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
        Confirm Completion
      </button>
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}
