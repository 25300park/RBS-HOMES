"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  unitId: number;
  loiId: number;
  unitTitle: string;
}

export default function ContractDraftForm({ unitId, loiId, unitTitle }: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contract-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, loiId, content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to submit. Please try again.");
        return;
      }

      const draft = await res.json();
      router.push(`/contract-draft/${draft.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 매물 (읽기 전용) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
        <input
          type="text"
          readOnly
          value={unitTitle}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
        />
      </div>

      {/* 계약서 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contract Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={14}
          placeholder="Write the contract draft content here…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

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
          disabled={isSubmitting || !content.trim()}
          className="px-5 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:bg-orange-200 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Submitting…" : "Submit for Landlord Review"}
        </button>
      </div>
    </form>
  );
}
