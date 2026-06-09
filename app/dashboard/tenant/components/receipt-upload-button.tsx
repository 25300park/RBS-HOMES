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
      // 1. Cloudflare R2에 이미지 업로드
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/image-upload/profile", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("이미지 업로드에 실패했습니다.");
      const { imageUrl } = await uploadRes.json();

      // 2. 납부 스케줄에 영수증 URL 기록 → AWAITING_APPROVAL
      const patchRes = await fetch(`/api/pms/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptImageUrl: imageUrl }),
      });
      if (!patchRes.ok) throw new Error("납부 정보 업데이트에 실패했습니다.");

      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
        영수증 제출 완료 — 확인 중입니다
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
        {uploading ? "업로드 중..." : "영수증 업로드"}
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
