"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UnitOption {
  id: number;
  title: string;
  adminId: number;
}

export default function LoiForm({ units }: { units: UnitOption[] }) {
  const router = useRouter();
  const [selectedUnitId, setSelectedUnitId] = useState<number | "">("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedUnit = units.find((u) => u.id === selectedUnitId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !content.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/loi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: selectedUnit.id,
          landlordId: selectedUnit.adminId,
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to submit LOI. Please try again.");
        return;
      }

      const loi = await res.json();
      router.push(`/loi/${loi.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 매물 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property
        </label>
        {units.length === 0 ? (
          <p className="text-sm text-gray-400">
            No properties assigned to you. Please contact an admin.
          </p>
        ) : (
          <select
            value={selectedUnitId}
            onChange={(e) =>
              setSelectedUnitId(e.target.value ? Number(e.target.value) : "")
            }
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">Select a property…</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 임대인 (자동 지정, 읽기 전용) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Landlord (auto-assigned from property owner)
        </label>
        <input
          type="text"
          readOnly
          value={selectedUnit ? `User ID: ${selectedUnit.adminId}` : "—"}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
        />
      </div>

      {/* LOI 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          LOI Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={10}
          placeholder="Write the Letter of Intent content here…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !selectedUnit || !content.trim()}
          className="px-5 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:bg-orange-200 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Sending…" : "Send LOI to Landlord"}
        </button>
      </div>
    </form>
  );
}
