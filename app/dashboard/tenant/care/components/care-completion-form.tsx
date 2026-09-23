"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Check } from "lucide-react";
import { useImageCompression } from "@/hooks/use-image-compression";

interface CareCompletionFormProps {
  careId: number;
}

export default function CareCompletionForm({ careId }: CareCompletionFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { compressImage } = useImageCompression();

  const [completionNote, setCompletionNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionNote.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      let completionProofUrl: string | null = null;

      if (file) {
        const compressedFile = await compressImage(file);
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("careRequestId", String(careId));
        const uploadRes = await fetch("/api/image-upload/care-completion", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Failed to upload completion proof.");
        const data = await uploadRes.json();
        completionProofUrl = data.imageUrl;
      }

      const patchRes = await fetch(`/api/pms/care/${careId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PENDING_STAFF_REVIEW",
          completionNote: completionNote.trim(),
          ...(completionProofUrl ? { completionProofUrl } : {}),
        }),
      });

      if (!patchRes.ok) {
        const data = await patchRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to submit completion report.");
      }

      setSubmitted(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
        <Check className="w-3.5 h-3.5" />
        Completion report submitted — awaiting staff review
      </span>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={completionNote}
        onChange={(e) => setCompletionNote(e.target.value)}
        disabled={submitting}
        placeholder="Describe what was completed (required)..."
        rows={2}
        className="w-full text-xs p-2 rounded-lg border border-zinc-200 outline-none focus:border-blue-500 transition-colors disabled:bg-zinc-50 disabled:text-zinc-400"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-60 text-zinc-700 rounded-lg text-xs font-medium transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          {file ? file.name : "Attach photo (optional)"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          type="submit"
          disabled={submitting || !completionNote.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition-colors ml-auto"
        >
          {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
          {submitting ? "Submitting..." : "Submit Completion Report"}
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
