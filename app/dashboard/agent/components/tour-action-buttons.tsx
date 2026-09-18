"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";

interface TourActionButtonsProps {
  scheduleId: number;
  compact?: boolean;
}

export default function TourActionButtons({ scheduleId, compact = false }: TourActionButtonsProps) {
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
    <div className={`flex items-center gap-2 ${compact ? "w-full" : ""}`}>
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => handleAction("approve")}
        className={`flex items-center justify-center gap-1.5 font-extrabold text-xs px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 ${
          compact ? "flex-1 py-2" : ""
        }`}
        title="Confirm and schedule tour"
      >
        {pending === "approve" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        )}
        <span>Approve</span>
      </button>

      <button
        type="button"
        disabled={pending !== null}
        onClick={() => handleAction("reject")}
        className={`flex items-center justify-center gap-1.5 font-extrabold text-xs px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-rose-50 text-zinc-700 hover:text-rose-700 border border-zinc-200 hover:border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 ${
          compact ? "flex-1 py-2" : ""
        }`}
        title="Decline request"
      >
        {pending === "reject" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        )}
        <span>Decline</span>
      </button>
    </div>
  );
}
