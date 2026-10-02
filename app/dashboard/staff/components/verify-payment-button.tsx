"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

interface VerifyPaymentButtonProps {
  paymentId: number;
}

export default function VerifyPaymentButton({ paymentId }: VerifyPaymentButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/pms/payments/${paymentId}/verify`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to verify payment.");
      }

      setVerified(true);
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
        disabled={submitting || verified}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition-colors bg-blue-500 hover:bg-blue-600"
      >
        {submitting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : verified ? (
          <Check className="w-3 h-3" />
        ) : null}
        {verified ? "Verified" : "Mark as Paid"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
