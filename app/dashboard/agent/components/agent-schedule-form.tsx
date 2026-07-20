"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

interface AgentScheduleFormProps {
  units: { id: number; title: string }[];
  pendingTourCountByUnit?: Record<number, number>;
}

export default function AgentScheduleForm({ units, pendingTourCountByUnit = {} }: AgentScheduleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [unitId, setUnitId] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      setError("Please enter a title and date.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/pms/agent-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          unitId: unitId || undefined,
          memo: memo || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to add schedule.");

      setTitle("");
      setDate("");
      setUnitId("");
      setMemo("");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 space-y-3">
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Property viewing with client"
          className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Date</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Related Listing <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.title}
              </option>
            ))}
          </select>
          {unitId && (pendingTourCountByUnit[Number(unitId)] ?? 0) > 0 && (
            <p className="mt-1.5 text-xs text-amber-400">
              이 매물에 대기 중인 투어 요청이 {pendingTourCountByUnit[Number(unitId)]}건 있습니다. TOUR REQUESTS에서 먼저 확인해보세요.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Memo <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          placeholder="Notes..."
          className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 min-h-[44px] bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Add Schedule
      </button>
    </form>
  );
}
