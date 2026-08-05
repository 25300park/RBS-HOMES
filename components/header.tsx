"use client";

import Link from "next/link";
import { useModalStore } from "@/store/use-modal-store";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import HeaderUserProfile from "./ui/header-user-profile";
import MainSearchBar from "./ui/main-search-bar";
import MainAmenityList from "./ui/main-amenity-list";
import MainFilterGroup from "./ui/main-filter-group";
import { ChevronDown, Bookmark, Bell, User, Search } from "lucide-react";

const navItems = [
  { label: "Buy",      href: "/map?activeTypes=sale" },
  { label: "Rent",     href: "/list" },
  { label: "Pre-sale", href: "/map?activeTypes=preSale" },
  { label: "Sell",     href: "#" },
  { label: "Rent Out", href: "#" },
];

const Header = () => {
  const { data: session, status } = useSession();
  const { openModal } = useModalStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLandingPage = pathname === "/";

  useEffect(() => { setMounted(true); }, []);

  // 랜딩페이지 전용 스크롤 리스너 (임계값 50px — 기존 로직 그대로)
  useEffect(() => {
    if (!isLandingPage) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // 초기값 동기화
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLandingPage]);

  const isListPage = pathname === "/list";
  const isMapPage = pathname.startsWith("/map");
  const showFilters = isListPage || isMapPage;

  const navActive = (label: string) => {
    if (label === "Rent") return isListPage;
    if (label === "Buy") return isMapPage && pathname.includes("sale");
    if (label === "Pre-sale") return isMapPage && pathname.includes("preSale");
    return false;
  };

  if (!mounted || status === "loading") {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100 py-3">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="h-11 bg-white border border-zinc-200 rounded-2xl shadow-sm animate-pulse" />
          </div>
        </div>
        <div className={isLandingPage ? "h-[88px]" : "h-[68px]"} />
      </>
    );
  }

  return (
    <>
      {/* Fixed pill header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100 transition-all duration-300">
        <div className={`max-w-[1280px] mx-auto px-4 transition-all duration-300 ${
          isLandingPage && !scrolled ? "py-5" : "py-3"
        }`}>
          <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-2xl px-5 py-2.5 shadow-sm">

            {/* 1. Logo */}
            <Link href="/" className="shrink-0">
              <img src="/assets/images/rbs-logo.png" alt="RBS Homes" className="h-7 w-auto" />
            </Link>

            <div className="hidden md:block w-px h-5 bg-zinc-200 mx-1" />

            {/* 2. Nav — desktop only */}
            <nav className="hidden md:flex items-center flex-1">
              {navItems.map(({ label, href }) => {
                const active = navActive(label);
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`relative flex items-center gap-0.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      active ? "text-[#0E5246]" : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {label}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#0E5246] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Search pill — desktop only */}
            <div className="hidden md:flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 rounded-full px-4 py-2 w-52 lg:w-64 cursor-pointer transition-colors shrink-0">
              <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-sm text-zinc-400 select-none">Search property...</span>
            </div>

            {/* Mobile spacer */}
            <div className="flex-1 md:hidden" />

            {/* 4. Icons + Login/Profile */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/account/unit/favorites"
                className="hidden md:flex p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                aria-label="Bookmarks"
              >
                <Bookmark className="w-5 h-5" />
              </Link>

              <button
                className="relative hidden md:flex p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              </button>

              {session ? (
                <HeaderUserProfile session={session} />
              ) : (
                <button
                  onClick={() => openModal("login")}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Login
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Spacer — 88px(랜딩 스크롤 전) / 68px(그 외 또는 스크롤 후) */}
      <div className={`transition-all duration-300 ${
        isLandingPage && !scrolled ? "h-[88px]" : "h-[68px]"
      }`} />

      {/* Overlay when search expands on /list */}
      {searchExpanded && (
        <div
          onClick={() => setSearchExpanded(false)}
          className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      {/* Search bar — list page only */}
      {isListPage && (
        <div className="relative z-30 w-full bg-white border-b border-zinc-100">
          <MainSearchBar onExpandChange={setSearchExpanded} />
        </div>
      )}

      {/* Filter / Amenity bar — list and map pages */}
      {showFilters && (
        <div className="relative z-20 w-full bg-white border-b border-zinc-100">
          <div className="flex flex-col md:flex-row w-full pt-4 px-6 md:px-20 gap-4 pb-2">
            <MainFilterGroup />
            <MainAmenityList />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
