"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Home, Building2, Store, Landmark, Briefcase, Warehouse,
  Search, MapPin, ChevronDown, ChevronRight, ChevronLeft,
  Heart, BedDouble, Bath, Square, ArrowRight, PhoneCall,
  Users, Award, ShieldCheck, Sparkles, Loader2, List, Map, Bell, User
} from "lucide-react";
import YouTubeSection from "./youtube-section";
import HeaderUserProfile from "@/components/ui/header-user-profile";
import HeaderGuestProfile from "@/components/ui/header-guest-profile";
import MobileFooterNav from "@/components/ui/mob-footer-nav";

export interface HomelandProperty {
  id: number;
  slug: string;
  title: string;
  location: string;
  price: string;
  period?: string;
  sellType: "rent" | "buy" | "sale";
  tag: string;
  tagColor: string;
  beds: number;
  baths: number;
  area: string;
  imgUrl: string;
}

interface HomelandLandingViewProps {
  initialProperties: HomelandProperty[];
  stats: {
    propertiesCount: number;
    clientsCount: number;
    condosCount: number;
  };
}

const EXAMPLE_AI_CHIPS = [
  "BGC studio for rent",
  "Serendra 2-bedroom for rent",
  "Makati property under ₱5M",
  "Makati studio under ₱30k",
];

// 20. 부동산 유형: Condominiums, Pre-sale Projects, Commercial, Office, House & Lot, Warehouse, Lots & Land
const PROPERTY_TYPES = [
  {
    id: "condo",
    title: "Condominiums",
    desc: "BGC & Makati luxury condos",
    icon: Building2,
    imgUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    url: "/list?type=condo",
  },
  {
    id: "presale",
    title: "Pre-sale Projects",
    desc: "Early investment opportunities",
    icon: Store,
    imgUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    url: "/list?activeTypes=preSale&sellType=presale",
  },
  {
    id: "commercial",
    title: "Commercial",
    desc: "High foot-traffic locations",
    icon: Landmark,
    imgUrl: "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=600&q=80",
    url: "/list?type=commercial",
  },
  {
    id: "office",
    title: "Office",
    desc: "Prime business & corporate spaces",
    icon: Briefcase,
    imgUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    url: "/list?type=office",
  },
  {
    id: "house",
    title: "House",
    desc: "Comfortable family homes",
    icon: Home,
    imgUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
    url: "/list?type=house",
  },
  {
    id: "warehouse",
    title: "Warehouse",
    desc: "Spacious storage & logistics hubs",
    icon: Warehouse,
    imgUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    url: "/list?type=warehouse",
  },
  {
    id: "lot",
    title: "Lots & Land",
    desc: "Prime residential & commercial plots",
    icon: MapPin,
    imgUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    url: "/list?type=lot",
  },
];

export default function HomelandLandingView({ initialProperties, stats }: HomelandLandingViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"ai" | "rent" | "buy" | "presale">("ai");
  const [aiQuery, setAiQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);

  // 23. Interactive Favorites state
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Category Carousel scroll ref
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategory = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = 310;
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Standard filters
  const [locationInput, setLocationInput] = useState("");
  const [propertyType, setPropertyType] = useState("All Type");
  const [priceRange, setPriceRange] = useState("Any Price");

  // AI Search Handler
  const handleAiSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q || isAiSearching) return;
    setIsAiSearching(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const { redirectUrl } = await res.json();
      router.push(redirectUrl ?? `/list?q=${encodeURIComponent(q)}`);
    } catch {
      router.push(`/list?q=${encodeURIComponent(q)}`);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Standard Search Handler
  const handleStandardSearch = () => {
    let targetUrl = "/unit/rent";
    if (activeTab === "buy") targetUrl = "/unit/buy";
    if (activeTab === "presale") targetUrl = "/unit/buy?sellType=presale";

    const queryParams = new URLSearchParams();
    if (locationInput.trim()) queryParams.set("q", locationInput.trim());
    const fullUrl = queryParams.toString() 
      ? (targetUrl.includes("?") ? `${targetUrl}&${queryParams.toString()}` : `${targetUrl}?${queryParams.toString()}`)
      : targetUrl;
    router.push(fullUrl);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
      
      {/* ── 1. Top Global Navigation ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-16 sm:h-18 flex items-center justify-between">
          
          {/* Brand Logo - Only Official RBS Logo Image */}
          <Link href="/" className="flex items-center">
            <img
              src="/assets/images/rbs-logo.png"
              alt="RBS Homes"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          {/* Nav Links */}
          <nav className="flex lg:hidden items-center gap-7 text-sm font-semibold text-zinc-600">
            <Link href="/" className="text-blue-600 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full">
              Home
            </Link>
            <Link href="/list?sellType=rent&activeTypes=rent" className="hover:text-blue-600 transition-colors">
              For Rent
            </Link>
            <Link href="/list?sellType=sale&activeTypes=sale" className="hover:text-blue-600 transition-colors">
              For Sale
            </Link>
            <Link href="/dashboard/landlord" className="hover:text-blue-600 transition-colors">
              Owner
            </Link>
            <Link href="/dashboard/tenant" className="hover:text-blue-600 transition-colors">
              Tenant
            </Link>
            <Link href="/dashboard/agent/register" className="hover:text-blue-600 transition-colors">
              Post Property
            </Link>
          </nav>

          {/* 24. Right Actions: Profile & Notifications + Get In Touch */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notifications & Profile (RBS Auth Component) */}
            <div className="flex items-center">
              {session ? (
                <HeaderUserProfile session={session} />
              ) : (
                <HeaderGuestProfile />
              )}
            </div>

            <Link
              href="/account"
              className="hidden lg:flex bg-[#1e40af] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-blue-900/10 items-center gap-2 transition-all active:scale-98"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Get In Touch</span>
            </Link>
          </div>

        </div>
      </header>

      {/* ── 2. Hero Section (22. Adjusted padding and alignment to prevent overlapping with search console) ── */}
      <section className="relative pt-8 pb-20 lg:pt-10 lg:pb-24 overflow-hidden bg-gradient-to-b from-slate-50/60 via-white to-white border-b border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-zinc-900/10 border-4 border-white min-h-[420px] sm:min-h-[360px] flex items-center mb-6">
            {/* Background Hero Image */}
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Modern Luxury RBS Home"
              fill
              priority
              className="object-cover"
            />
            {/* Left-to-Right Dark Gradient Scrim for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />

            {/* Overlaid Text Content */}
            <div className="relative z-10 flex flex-col space-y-5 w-full max-w-xl px-6 sm:px-10 py-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/60 px-3.5 py-1.5 rounded-full mb-3">
                  <span className="text-amber-500 text-xs">✨</span>
                  <span className="text-xs font-bold text-amber-900 tracking-wide">
                    Find Your Perfect Space in Manila
                  </span>
                </div>

                <h1 className="text-4xl lg:text-3xl sm:text-2xl font-black text-white tracking-tight leading-[1.12] w-full">
                  Find Your Dream <span className="text-white">Home in BGC & Makati</span>
                </h1>

                <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-medium mt-3 w-full">
                  Explore premium condos, modern villas, and prime commercial spaces verified by RBS Homes.
                </p>
              </div>

              {/* 21, 22 & 18. Full-width 2-column Grid Buttons lifted cleanly above the search console */}
              <div className="w-full grid grid-cols-2 gap-3.5 pt-1">
                <Link
                  href="/list"
                  className="w-full bg-[#1d4ed8] hover:bg-blue-700 text-white font-bold text-sm px-4 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-98 text-center"
                >
                  <List className="w-4 h-4 shrink-0" />
                  <span className="truncate">View as List</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>

                <Link
                  href="/map"
                  className="w-full bg-white/90 hover:bg-white text-zinc-800 border border-white font-bold text-sm px-4 py-3.5 rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all hover:text-blue-600 active:scale-98 text-center"
                >
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">View on Map</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Floating Unified Search Console (22. Clean separation with no overlap) ── */}
          <div className="relative mt-2 lg:mt-4 z-20 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl shadow-zinc-200/60 border border-zinc-100 p-5 sm:p-6">
              
              {/* Top Tabs */}
              <div className="flex items-center gap-5 border-b border-zinc-100 pb-3.5 mb-4 overflow-x-auto custom-scrollbar">
                {[
                  { id: "ai", label: "AI Search", icon: Sparkles, isAi: true },
                  { id: "rent", label: "For Rent", icon: Users },
                  { id: "buy", label: "For Sale", icon: Home },
                  { id: "presale", label: "Pre-sale", icon: Building2 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 text-sm font-bold pb-2 transition-all relative shrink-0 ${
                        isActive
                          ? "text-blue-600 after:absolute after:bottom-[-15px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${tab.isAi ? (isActive ? "text-blue-600" : "text-amber-500") : ""}`} />
                      <span>{tab.label}</span>
                      {tab.isAi && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                          AI
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: AI Search Console */}
              {activeTab === "ai" ? (
                <div className="space-y-2.5">
                  <div className="relative flex items-center bg-zinc-50 border border-zinc-200/80 rounded-xl focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all p-1">
                    {isAiSearching ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin ml-4 shrink-0" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-amber-500 ml-4 shrink-0" />
                    )}
                    <input
                      type="text"
                      placeholder="e.g. BGC 2-bedroom for rent, budget under ₱50k, pet-friendly"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAiSearch(aiQuery)}
                      disabled={isAiSearching}
                      className="w-full pl-3 pr-4 py-3 bg-transparent text-sm font-bold text-zinc-900 outline-none placeholder:text-zinc-400 placeholder:font-normal"
                    />
                    <button
                      onClick={() => handleAiSearch(aiQuery)}
                      disabled={isAiSearching || !aiQuery.trim()}
                      className="bg-[#1d4ed8] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md shadow-blue-600/25 active:scale-95 transition-all shrink-0"
                    >
                      <Search className="w-4 h-4" />
                      <span>AI Search</span>
                    </button>
                  </div>

                  {/* AI Example Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-xs font-semibold text-zinc-400">Try:</span>
                    {EXAMPLE_AI_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => {
                          setAiQuery(chip);
                          handleAiSearch(chip);
                        }}
                        disabled={isAiSearching}
                        className="text-xs font-medium bg-zinc-50 hover:bg-blue-50 hover:text-blue-600 border border-zinc-200/80 hover:border-blue-200 text-zinc-600 px-3 py-1 rounded-full transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Tab 2, 3, 4: Standard Filter Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                  
                  {/* Location */}
                  <div className="lg:col-span-4 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 px-3.5 hover:bg-white hover:border-blue-400 transition-colors">
                    <span className="text-[11px] font-bold text-zinc-400 block mb-0.5">Location</span>
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="Search BGC, Makati, Condo name..."
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleStandardSearch()}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold text-zinc-800 outline-none placeholder:text-zinc-400"
                      />
                      <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div 
                    onClick={() => setPropertyType(propertyType === "All Type" ? "Condo" : propertyType === "Condo" ? "House" : "All Type")}
                    className="lg:col-span-3 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 px-3.5 hover:bg-white hover:border-blue-400 transition-colors cursor-pointer select-none"
                  >
                    <span className="text-[11px] font-bold text-zinc-400 block mb-0.5">Property Type</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-zinc-800">{propertyType}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div 
                    onClick={() => setPriceRange(priceRange === "Any Price" ? "₱30k - ₱80k" : priceRange === "₱30k - ₱80k" ? "₱80k+" : "Any Price")}
                    className="lg:col-span-3 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 px-3.5 hover:bg-white hover:border-blue-400 transition-colors cursor-pointer select-none"
                  >
                    <span className="text-[11px] font-bold text-zinc-400 block mb-0.5">Price Range</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-zinc-800 truncate">{priceRange}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="lg:col-span-2">
                    <button
                      onClick={handleStandardSearch}
                      className="w-full h-full min-h-[48px] bg-[#1d4ed8] hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 active:scale-95 transition-all font-bold text-sm"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ── 3. Choose By Property Type Section (16. Ultra Compact Padding py-2 sm:py-3.5) ── */}
      <section className="py-2 sm:py-3.5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest block mb-0.5">
                CHOOSE BY PROPERTY TYPE
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-950 tracking-tight">
                Find a Property That Fits <span className="text-blue-600">Your Lifestyle</span>
              </h2>
            </div>

            {/* Carousel Navigation Arrow Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/list"
                className="hidden sm:flex border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-bold text-xs px-3 py-1.5 rounded-xl items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollCategory("left")}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-blue-300 hover:text-blue-600 flex items-center justify-center text-zinc-600 shadow-sm transition-all active:scale-95"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCategory("right")}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-blue-300 hover:text-blue-600 flex items-center justify-center text-zinc-600 shadow-sm transition-all active:scale-95"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 20. 4 visible columns on desktop with smooth horizontal scroll */}
          <div 
            ref={categoryScrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto custom-scrollbar pb-1.5 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {PROPERTY_TYPES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(item.url)}
                  className="w-[240px] sm:w-[280px] lg:w-[calc(25%-15px)] shrink-0 snap-start group bg-white rounded-2xl p-2 border border-zinc-100 shadow-sm hover:shadow-lg hover:shadow-zinc-200/50 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative h-36 sm:h-48 rounded-xl overflow-hidden bg-zinc-100 mb-3">
                    <Image
                      src={item.imgUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* 17. Centered Floating White Icon Badge with enhanced bottom shadow */}
                    <div className="absolute -bottom-2.5 left-3 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] border-2 border-white flex items-center justify-center text-blue-600 z-20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>

                  <div className="px-2 pt-1 pb-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs sm:text-base font-extrabold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5 truncate">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-1 text-[11px] sm:text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 4. Handpicked Properties Just For You (41. Single Line Title) ── */}
      <section className="py-6 sm:py-10 bg-[#f8fafc]/80 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
                FEATURED PROPERTIES
              </span>
              {/* 41. Single Line Title with no awkward break */}
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-zinc-950 tracking-tight whitespace-nowrap">
                Handpicked Properties <span className="text-blue-600">Just For You</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/list"
                className="border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>View All ({stats.propertiesCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 30. 4 Columns on Desktop, 2 Columns on Mobile */}
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-3 sm:gap-5">
            {initialProperties.map((prop) => {
              const isFav = favoritedIds.has(prop.id);
              return (
                <div
                  key={prop.id}
                  onClick={() => router.push(`/properties/${prop.slug}`)}
                  className="bg-white rounded-2xl p-2 sm:p-2.5 border border-zinc-100 shadow-sm hover:shadow-lg hover:shadow-zinc-200/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative h-32 sm:h-48 rounded-xl overflow-hidden bg-zinc-100 mb-2.5">
                      <Image
                        src={prop.imgUrl}
                        alt={prop.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Status Tag */}
                      <div className={`absolute top-2 left-2 ${prop.tagColor} text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md`}>
                        {prop.tag}
                      </div>

                      {/* 23. Transparent Background Heart Button */}
                      <button
                        onClick={(e) => toggleFavorite(e, prop.id)}
                        className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xs flex items-center justify-center transition-all active:scale-90"
                        aria-label="Favorite"
                      >
                        <Heart 
                          className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 transition-colors drop-shadow-md ${
                            isFav 
                              ? "text-red-500 fill-red-500 stroke-red-500" 
                              : "text-white fill-transparent stroke-[2.2]"
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="px-1 pb-1">
                      <div className="text-sm sm:text-lg lg:text-xl font-black text-blue-600 mb-0.5 truncate">
                        {prop.price}{" "}
                        {prop.period && (
                          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-semibold">{prop.period}</span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                        {prop.title}
                      </h3>

                      <div className="flex items-center gap-1 text-zinc-400 text-[10px] sm:text-xs mt-0.5 mb-2">
                        <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{prop.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specs Bar */}
                  <div className="flex flex-nowrap items-center justify-start gap-2 sm:gap-1.5 text-zinc-500 text-xs sm:text-[10px] font-semibold border-t border-zinc-100 pt-1.5 sm:pt-2 px-1">
                    <div className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap shrink-0">
                      <BedDouble className="w-3 h-3 2lg:w-2.5 2lg:h-2.5 text-zinc-400 shrink-0" />
                      <span>{prop.beds} Beds</span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap shrink-0">
                      <Bath className="w-3 h-3 2lg:w-2.5 2lg:h-2.5 text-zinc-400 shrink-0" />
                      <span>{prop.baths} Bath</span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap shrink-0">
                      <Square className="w-3 h-3 2lg:w-2.5 2lg:h-2.5 text-zinc-400 shrink-0" />
                      <span>{prop.area}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 5. Featured Property Videos & View on Google Reviews ── */}
      <section className="py-14 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <YouTubeSection />
        </div>
      </section>

      {/* ── 6. Bottom Stats Counter Banner (Exact Live Database Counts, rounded-2xl) ── */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#1d4ed8] rounded-2xl p-7 sm:p-9 text-white shadow-xl shadow-blue-600/20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-blue-400/30">
              
              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight">{stats.clientsCount.toLocaleString()}</div>
                  <div className="text-xs text-blue-100 font-medium mt-0.5">Happy Clients</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight">{stats.propertiesCount.toLocaleString()}</div>
                  <div className="text-xs text-blue-100 font-medium mt-0.5">Properties Listed</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight">{stats.condosCount.toLocaleString()}</div>
                  <div className="text-xs text-blue-100 font-medium mt-0.5">Partner Condos</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight">100%</div>
                  <div className="text-xs text-blue-100 font-medium mt-0.5">Verified Listings</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 25. Mobile Bottom Navigation (Existing RBS-HOMES style) */}
      <MobileFooterNav />

    </div>
  );
}
