"use client";

import Link from "next/link";
import { useModalStore } from "@/store/use-modal-store";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import HeaderUserProfile from "./ui/header-user-profile";
import MainAmenityList from "./ui/main-amenity-list";
import AiSearchBox from "./ui/ai-search-box";
import { Bookmark, User } from "lucide-react";

const Header = () => {
  const { data: session, status } = useSession();
  const { openModal } = useModalStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  // AI 검색 상태 (/list 전용)
  const [aiQuery, setAiQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // /list 페이지 AI 검색 핸들러 — router.replace로 기존 필터 전부 초기화 후 AI 결과 적용
  const handleAiSearchOnList = async (query: string) => {
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
      router.replace(redirectUrl ?? "/list");
    } catch {
      router.replace("/list");
    } finally {
      setIsSearching(false);
    }
  };

  const isListPage = pathname === "/list";
  const isMapPage = pathname.startsWith("/map");
  const showFilters = isListPage || isMapPage;

  // 메인 랜딩 페이지(/), 대시보드(/dashboard/*), 계정/스케줄/프로필/매물관리(/account/*)에서는 자체 헤더를 사용하므로 구버전 전역 헤더 완전 숨김
  if (!pathname || pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/account") || pathname.includes("/account")) {
    return null;
  }

  if (!mounted || status === "loading") {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100 py-3">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="h-11 bg-white border border-zinc-200 rounded-2xl shadow-sm animate-pulse" />
          </div>
        </div>
        <div className="h-[68px]" />
      </>
    );
  }

  return (
    <>
      {/* Modern Global Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">

          {/* 1. Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img src="/assets/images/rbs-logo.png" alt="RBS Homes" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>

          {/* 2. Centered Navigation Box */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/60 shadow-2xs">
            {[
              { label: "Home", href: "/" },
              { label: "For Rent", href: "/list?sellType=rent&activeTypes=rent" },
              { label: "For Sale", href: "/list?sellType=sale&activeTypes=sale" },
              { label: "Owner", href: "/sell" },
              { label: "Tenant", href: "/dashboard/tenant" },
            ].map(({ label, href }) => {
              const isActive =
                (label === "For Rent" && pathname === "/list" && pathname.includes("rent")) ||
                (label === "For Sale" && pathname === "/list" && pathname.includes("sale"));

              return (
                <Link
                  key={label}
                  href={href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white text-blue-600 shadow-2xs font-extrabold"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-white/60"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Quick Actions & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/account/unit/favorites"
              className="p-2 rounded-xl text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Bookmarks"
            >
              <Bookmark className="w-5 h-5" />
            </Link>

            <Link
              href="/account/unit/registration/step-one"
              className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/20 active:scale-98 transition-all"
            >
              Post Property
            </Link>

            {session ? (
              <HeaderUserProfile session={session} />
            ) : (
              <button
                onClick={() => openModal("login")}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                <User className="w-3.5 h-3.5" />
                Login
              </button>
            )}
          </div>

        </div>
      </header>

      {/* AI 검색창 — list 페이지 전용 */}
      {isListPage && (
        <div className="relative z-30 w-full bg-white border-b border-zinc-100 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <AiSearchBox
              query={aiQuery}
              isSearching={isSearching}
              onQueryChange={setAiQuery}
              onSearch={handleAiSearchOnList}
            />
          </div>
        </div>
      )}

      {/* Filter / Amenity bar — list and map pages */}
      {showFilters && (
        <div className="relative z-20 w-full bg-white border-b border-zinc-100/80 shadow-2xs">
          <div className="w-full py-1 px-2 sm:px-6">
            <MainAmenityList />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
