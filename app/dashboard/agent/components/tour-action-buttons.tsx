"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";

interface TourActionButtonsProps {
  scheduleId: number;
}

export default function TourActionButtons({ scheduleId }: TourActionButtonsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    setPending(action);
    try {
      const res = await fetch("/api/pms/tour-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, action }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Request failed" }));
        alert(error ?? "Request failed");
        return;
      }
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={pending !== null}
        onClick={() => handleAction("approve")}
        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending === "approve" ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Check className="w-3 h-3" />
        )}
        Approve
      </button>
      <button
        disabled={pending !== null}
        onClick={() => handleAction("reject")}
        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending === "reject" ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <X className="w-3 h-3" />
        )}
        Reject
      </button>
    </div>
  );
}
