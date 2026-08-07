'use client'

import React, { useState } from 'react';
import { List, MapPin, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const EXAMPLE_CHIPS = [
  "BGC studio for rent",
  "Serendra 2-bedroom for rent",
  "Makati property under ₱5M",
  "Makati studio under ₱30k",
];

// ─── AI Search Box (외부 컴포넌트로 분리 — 부모 리렌더 시 remount 방지) ───
interface AiSearchBoxProps {
  query: string;
  isSearching: boolean;
  onQueryChange: (q: string) => void;
  onSearch: (q: string) => void;
}

const AiSearchBox = ({ query, isSearching, onQueryChange, onSearch }: AiSearchBoxProps) => (
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
          AI 검색
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

// ─── View as List / View on Map 공유 버튼 (링크) ───
const ViewButtons = () => (
  <>
    <Link
      href="/list"
      className="bg-white border border-gray-200 rounded-xl p-4 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <List className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-left">
            <h4 className="text-base font-semibold text-gray-800">View as List</h4>
            <p className="text-sm text-gray-500">Browse all properties</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-100 group-hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors">
          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
        </div>
      </div>
    </Link>

    <Link
      href="/map"
      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl p-4 transition-all duration-300 group shadow-lg hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <MapPin className="w-5 h-5 text-white animate-bounce" />
          </div>
          <div className="text-left">
            <h4 className="text-base font-semibold text-white">View on Map</h4>
            <p className="text-sm text-orange-100">Explore locations</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <ArrowRight className="w-4 h-4 text-white" />
        </div>
      </div>
    </Link>
  </>
);

// ─── HeroSection ───
const HeroSection = () => {
  const router = useRouter();
  const [aiQuery, setAiQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleAiSearch = async (query: string) => {
    const q = query.trim();
    if (!q || isSearching) return;
    setIsSearching(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const { redirectUrl } = await res.json();
      router.push(redirectUrl ?? "/list");
    } catch {
      router.push("/list");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* ─── Desktop ─── */}
      <div className="heading-home-section-desktop">
        <div className="bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* AI 검색창 */}
            <div className="mb-8 max-w-2xl mx-auto">
              <AiSearchBox
                query={aiQuery}
                isSearching={isSearching}
                onQueryChange={setAiQuery}
                onSearch={handleAiSearch}
              />
            </div>

            {/* View as List / View on Map */}
            <div className="grid gap-4 grid-cols-2 max-w-2xl mx-auto">
              <ViewButtons />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile ─── */}
      <div className="heading-home-section-mobile">
        <div className="max-w-6xl mx-auto p-3">
          {/* AI 검색창 */}
          <div className="mb-4">
            <AiSearchBox
              query={aiQuery}
              isSearching={isSearching}
              onQueryChange={setAiQuery}
              onSearch={handleAiSearch}
            />
          </div>

          {/* View as List / View on Map */}
          <div className="grid gap-3">
            <ViewButtons />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
