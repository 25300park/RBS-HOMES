"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { saveToLocalStorage } from "@/lib/utils";

export default function AiEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/extract-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "AI 추출 실패");
      }
      const extracted = await res.json();

      const STEP1_KEYS = ["title", "ownerName", "price", "saleType", "unitType", "ownerEmail", "ownerMobile"];
      const STEP2_KEYS = ["area", "floor", "bed", "bath", "parking", "furniture", "interiored", "petPolicy", "yearCompletion", "outstandingPayment", "amenity"];

      // step1 저장 — null 제거, price toLocaleString 포맷
      const step1: Record<string, string | number> = {};
      for (const key of STEP1_KEYS) {
        const val = extracted[key];
        if (val === null || val === undefined) continue;
        if (key === "price" && typeof val === "string") {
          const raw = val.replace(/[^0-9]/g, "");
          if (raw) step1[key] = Number(raw).toLocaleString();
        } else {
          step1[key] = val;
        }
      }
      saveToLocalStorage("step1", step1);

      // step2 저장 — null 제거, 빈 amenity 제외, outstandingPayment toLocaleString 포맷
      const step2: Record<string, string | number | string[]> = {};
      for (const key of STEP2_KEYS) {
        const val = extracted[key];
        if (val === null || val === undefined) continue;
        if (key === "amenity") {
          if (Array.isArray(val) && val.length > 0) step2[key] = val;
        } else if (key === "outstandingPayment" && typeof val === "string") {
          const raw = val.replace(/[^0-9]/g, "");
          if (raw) step2[key] = Number(raw).toLocaleString();
        } else {
          step2[key] = val;
        }
      }
      if (Object.keys(step2).length > 0) saveToLocalStorage("step2", step2);
      router.push("/account/unit/registration/step-one");
    } catch (err) {
      toast({
        title: "오류",
        description: err instanceof Error ? err.message : "AI 추출 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[640px] mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">AI로 매물 정보 입력</h1>
        <Link
          href="/account/unit/registration/step-one"
          className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          직접 입력하기 →
        </Link>
      </div>

      <p className="text-sm text-gray-500">
        매물에 대해 자유롭게 설명하면 AI가 자동으로 필드를 채워드립니다.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="매물에 대해 자유롭게 설명해주세요. 예: BGC에 있는 콘도인데 이름은 Sunshine Tower, 소유주는 김철수, 월세로 5만페소 받고 싶어요."
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={isLoading || !text.trim()}
        className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
      >
        {isLoading ? <Spinner className="h-4 w-4 border-2" /> : null}
        {isLoading ? "AI 분석 중..." : "AI로 채우기"}
      </button>
    </div>
  );
}
