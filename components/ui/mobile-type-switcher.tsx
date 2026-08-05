"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";

const typeNavItems = [
  { label: "Rent",     key: "rent" },
  { label: "Buy",      key: "sale" },
  { label: "Pre-sale", key: "preSale" },
];

const activeColors: Record<string, string> = {
  rent:    "bg-[#F18D3E] text-white border-[#F18D3E]",
  sale:    "bg-[#3751A2] text-white border-[#3751A2]",
  preSale: "bg-[#585859] text-white border-[#585859]",
};

interface MobileTypeSwitcherProps {
  /** URL 파라미터 키 — map: "activeTypes", list: "activeTypes" (get-filtered-units가 activeTypes만 읽음) */
  paramKey: "activeTypes" | "sellType";
  /** 각 버튼에 매핑되는 실제 파라미터 값 */
  values: { rent: string; sale: string; preSale: string };
}

/**
 * 거래유형 전환 바 — 모바일 전용 (hidden md:flex)
 *
 * 이 프로젝트 breakpoint: md: { max: "767px" } → md: = 모바일
 * hidden  = 데스크탑에서 display:none
 * md:flex = 모바일(≤767px)에서 display:flex
 * → 모바일에서만 표시, 데스크탑에서는 헤더 Nav가 담당
 *
 * router.push로 현재 pathname을 유지하면서 파라미터만 교체.
 * 페이지 이동 없음.
 */
export default function MobileTypeSwitcher({
  paramKey,
  values,
}: MobileTypeSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentValue = searchParams.get(paramKey);

  const setType = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border-b border-zinc-100">
      {typeNavItems.map(({ label, key }) => {
        const value = values[key as keyof typeof values];
        const isActive = currentValue === value;
        return (
          <button
            key={key}
            onClick={() => setType(value)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              isActive
                ? activeColors[key]
                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
