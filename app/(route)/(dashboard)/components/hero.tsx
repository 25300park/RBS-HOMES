'use client'

import React, { useState } from 'react';
import { List, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AiSearchBox from '@/components/ui/ai-search-box';

// ─── View as List / View on Map 버튼 ───
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
      // 랜딩 → /list 이동 (히스토리 추가)
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
            <div className="mb-8 max-w-2xl mx-auto">
              <AiSearchBox
                query={aiQuery}
                isSearching={isSearching}
                onQueryChange={setAiQuery}
                onSearch={handleAiSearch}
              />
            </div>
            <div className="grid gap-4 grid-cols-2 max-w-2xl mx-auto">
              <ViewButtons />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile ─── */}
      <div className="heading-home-section-mobile">
        <div className="max-w-6xl mx-auto p-3">
          <div className="mb-4">
            <AiSearchBox
              query={aiQuery}
              isSearching={isSearching}
              onQueryChange={setAiQuery}
              onSearch={handleAiSearch}
            />
          </div>
          <div className="grid gap-3">
            <ViewButtons />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
