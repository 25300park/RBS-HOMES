"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";

interface ReceiptUploadButtonProps {
  paymentId: number;
}

export default function ReceiptUploadButton({ paymentId }: ReceiptUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Upload image to Cloudflare R2
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/image-upload/profile", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload image.");
      const { imageUrl } = await uploadRes.json();

      // 2. Record receipt URL on payment schedule → AWAITING_APPROVAL
      const patchRes = await fetch(`/api/pms/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptImageUrl: imageUrl }),
      });
      if (!patchRes.ok) throw new Error("Failed to update payment information.");

      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "An error occurred.");
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
        Receipt submitted — pending approval
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {uploading ? "Uploading..." : "Upload Receipt"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
