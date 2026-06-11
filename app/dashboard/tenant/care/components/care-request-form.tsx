"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CareRequestFormProps {
  contractId: number;
}

const serviceTypeOptions = [
  { value: "AIRCON", label: "Air Conditioning" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "REPAIR", label: "Repair" },
  { value: "HANDYMAN", label: "Handyman" },
];

export default function CareRequestForm({ contractId }: CareRequestFormProps) {
  const router = useRouter();
  const [serviceType, setServiceType] = useState("AIRCON");
  const [preferredDate, setPreferredDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate) {
      setError("Please select a preferred date.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/pms/care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          serviceType,
          preferredDate,
          description: description || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit care request.");

      router.push("/dashboard/tenant");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "An error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#F8FAFC] mb-1.5">Service Type</label>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        >
          {serviceTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F8FAFC] mb-1.5">Preferred Date</label>
        <input
          type="datetime-local"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#F8FAFC] mb-1.5">
          Description <span className="text-[#94A3B8] font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe the issue or request..."
          className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
        />
      </div>

      {error && <p className="text-sm text-[#EF4444]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 min-h-[44px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit Request
      </button>
    </form>
  );
}
