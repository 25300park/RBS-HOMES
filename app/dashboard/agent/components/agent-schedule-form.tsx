"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Calendar, Clock } from "lucide-react";

interface AgentScheduleFormProps {
  units: { id: number; title: string }[];
  pendingTourCountByUnit?: Record<number, number>;
}

// Generate 30-minute time intervals from 07:00 AM to 09:00 PM
const TIME_SLOTS: { value: string; label: string }[] = [];
for (let hour = 7; hour <= 21; hour++) {
  for (const minute of ["00", "30"]) {
    if (hour === 21 && minute === "30") break;
    const hourStr = hour.toString().padStart(2, "0");
    const val = `${hourStr}:${minute}`;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const label = `${displayHour.toString().padStart(2, "0")}:${minute} ${period}`;
    TIME_SLOTS.push({ value: val, label });
  }
}

export default function AgentScheduleForm({ units, pendingTourCountByUnit = {} }: AgentScheduleFormProps) {
  const router = useRouter();
  const todayStr = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [unitId, setUnitId] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedDate || !selectedTime) {
      setError("Please enter a title, date, and 30-minute time slot.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const combinedDateTime = `${selectedDate}T${selectedTime}:00`;

    try {
      const res = await fetch("/api/pms/agent-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date: combinedDateTime,
          unitId: unitId ? Number(unitId) : undefined,
          memo: memo.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to add schedule.");

      setTitle("");
      setMemo("");
      setUnitId("");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-sm space-y-3.5">
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <Plus className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-extrabold text-zinc-900">Add New Schedule</h4>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1">Title <span className="text-rose-500">*</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Property viewing with client"
          className="w-full bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-1 gap-2.5">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">Date <span className="text-rose-500">*</span></label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">Time (30m Slot) <span className="text-rose-500">*</span></label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1">
          Related Listing <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          className="w-full bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">None</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.title}
            </option>
          ))}
        </select>
        {unitId && (pendingTourCountByUnit[Number(unitId)] ?? 0) > 0 && (
          <p className="mt-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
            ⚠️ There are {pendingTourCountByUnit[Number(unitId)]} pending tour requests for this unit in Tour Queue.
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1">
          Memo <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          placeholder="Notes..."
          className="w-full bg-[#f8fafc] border border-zinc-200/90 rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
      >
        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        <span>Save Schedule</span>
      </button>
    </form>
  );
}
