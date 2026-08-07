"use client";

import { Search } from "lucide-react";

export const EXAMPLE_CHIPS = [
  "BGC studio for rent",
  "Serendra 2-bedroom for rent",
  "Makati property under ₱5M",
  "Makati studio under ₱30k",
];

export interface AiSearchBoxProps {
  query: string;
  isSearching: boolean;
  onQueryChange: (q: string) => void;
  onSearch: (q: string) => void;
}

/**
 * 자연어 AI 검색창 + 예시 칩
 *
 * 상태(query, isSearching)와 핸들러(onQueryChange, onSearch)는 부모가 관리.
 * hero.tsx: router.push  →  /list?... 이동
 * header.tsx(/list): router.replace  →  동일 페이지에서 파라미터 교체
 */
export default function AiSearchBox({
  query,
  isSearching,
  onQueryChange,
  onSearch,
}: AiSearchBoxProps) {
  return (
    <div>
      <div className="relative bg-white rounded-2xl shadow-lg border">
        <div className="flex items-center">
          {isSearching ? (
            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-orange-400/40 border-t-orange-500 rounded-full animate-spin pointer-events-none" />
          ) : (
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          )}
          <input
            type="text"
            placeholder="e.g. BGC 2-bedroom for rent, budget under ₱50k"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
            disabled={isSearching}
            className="w-full pl-14 pr-28 py-4 text-base border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-transparent disabled:opacity-60"
          />
          <button
            onClick={() => onSearch(query)}
            disabled={isSearching}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-full transition-all"
          >
            <Search className="w-4 h-4" />
            AI Search
          </button>
        </div>
      </div>

      {/* 예시 검색어 칩 */}
      <div className="flex flex-wrap gap-2 mt-3">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => { onQueryChange(chip); onSearch(chip); }}
            disabled={isSearching}
            className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-orange-400 hover:text-orange-600 transition-colors disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
