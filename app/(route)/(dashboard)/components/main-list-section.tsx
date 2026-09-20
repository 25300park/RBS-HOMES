"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ListCard from "@/components/ui/list-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import useHandleUnitClick from "@/hooks/use-handle-unit-click";
import { BsDatabaseX } from "react-icons/bs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseImages } from "@/lib/utils";
import { getFeaturedUnits } from "../action";

interface Unit {
  id: number;
  title: string;
  price: number;
  address3: string;
  outstandingPayment: number;
  area: number;
  location: string;
  images: any;
  postedDate: string;
  isUrgent?: boolean;
  sellType: string;
  bed: number;
  bath: number;
  fullAddress: string;
  isFavorited: boolean;
}

interface FetchResponse {
  units: Unit[];
  total: number;
}

const MainList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [featuredUnits, setFeaturedUnits] = useState<any>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const handleUnitClick = useHandleUnitClick();
  const LIMIT = 48;
  
  // searchParams 변경 감지를 위한 ref
  const prevSearchParamsRef = useRef<string>("");
  const isInitialLoadRef = useRef<boolean>(true);

  // 최상단으로 스크롤하는 함수
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  // 데이터 fetch 함수
  const fetchData = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError(null);

    try {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", pageNum.toString());
      params.set("limit", LIMIT.toString());

      const response = await fetch(`/api/units?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error occurred. (${response.status})`);
      }

      const data = (await response.json()) as FetchResponse;

      if (data?.units) {
        setUnits(data.units);
        setTotal(data.total);
      } else {
        setUnits([]);
        setTotal(0);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setError(error.message);
        console.error("Failed to fetch units:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, LIMIT]);

  // Featured units 로드
  useEffect(() => {
    getFeaturedUnits().then(units => {
      setFeaturedUnits(units);
    });
  }, []);

  // URL searchParams 변경 감지 및 처리
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const pageParam = params.get("page");
    const pageNumber = pageParam ? parseInt(pageParam) : 1;
    
    // 페이지 파라미터를 제외한 필터 파라미터들
    params.delete("page");
    const currentFilters = params.toString();
    
    // 초기 로드가 아닌 경우에만 필터 변경 감지
    if (!isInitialLoadRef.current) {
      // 필터가 변경되었고 페이지가 1이 아닌 경우
      if (prevSearchParamsRef.current !== currentFilters && pageNumber !== 1) {
        console.log("Filter changed, redirecting to page 1");
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", "1");
        router.replace(`?${newParams.toString()}`);
        return;
      }
    }
    
    // 페이지 상태 업데이트
    setCurrentPage(pageNumber);
    prevSearchParamsRef.current = currentFilters;
    isInitialLoadRef.current = false;
    
    // 페이지 변경 시 최상단으로 스크롤
    if (pageNumber !== currentPage) {
      scrollToTop();
    }
    
  }, [searchParams, router, currentPage, scrollToTop]);

  // currentPage 변경 시 데이터 로드
  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const totalPages = Math.ceil(total / LIMIT);
  
  // 첫 페이지에서만 featured units 포함
  const allUnits = currentPage === 1 ? [...featuredUnits, ...units] : units;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // 모바일에서는 더보기 버튼 스타일
    if (isMobile) {
      return (
        <div className="flex justify-center items-center space-x-4 py-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      );
    }

    // 데스크탑에서는 전체 페이지네이션
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); 
           i <= Math.min(totalPages - 1, currentPage + delta); 
           i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    return (
      <div className="flex justify-center items-center space-x-2 py-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        <div className="flex space-x-1">
          {visiblePages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...' || isLoading}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                page === currentPage
                  ? 'text-white bg-orange-500 border border-orange-500'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  const items = allUnits;
  const currentType = searchParams.get("type");
  const currentSellType = searchParams.get("sellType") || searchParams.get("activeTypes") || "rent";
  const isPreSale = currentSellType?.toLowerCase().includes("presale");

  const TYPE_NAMES: Record<string, string> = {
    condo: "Condominiums",
    house: "House",
    commercial: "Commercial Properties",
    office: "Office Spaces",
    warehouse: "Warehouses & Logistics",
    building: "Commercial Buildings",
    lot: "Lots & Land",
  };

  const isRent = currentSellType?.toLowerCase().includes("rent") || currentSellType?.toLowerCase().includes("lease");
  const isSale = currentSellType?.toLowerCase() === "sale" || currentSellType?.toLowerCase() === "buy";

  let filterHeading = "Properties For Rent";
  let filterDescription = "Showing all verified properties available for long-term lease in the Philippines.";
  let badgeLabel = "For Rent";

  if (isPreSale) {
    filterHeading = currentType 
      ? `${TYPE_NAMES[currentType] || currentType} Pre-sale Projects` 
      : "Pre-sale Projects";
    filterDescription = "Showing verified off-plan developments and pre-sale properties for early investment.";
    badgeLabel = "Pre-Sale";
  } else if (isSale) {
    filterHeading = currentType 
      ? `${TYPE_NAMES[currentType] || currentType} For Sale` 
      : "Properties For Sale";
    filterDescription = currentType 
      ? `Showing verified ${TYPE_NAMES[currentType]?.toLowerCase() || currentType} available for purchase and ownership.`
      : "Showing all verified properties available for purchase and investment in the Philippines.";
    badgeLabel = "For Sale";
  } else if (isRent) {
    filterHeading = currentType 
      ? `${TYPE_NAMES[currentType] || currentType} For Rent` 
      : "Properties For Rent";
    filterDescription = currentType 
      ? `Showing verified ${TYPE_NAMES[currentType]?.toLowerCase() || currentType} available for rent and lease.`
      : "Showing all verified residential and commercial properties available for long-term rent.";
    badgeLabel = "For Rent";
  } else if (currentType) {
    filterHeading = TYPE_NAMES[currentType] || `${currentType.toUpperCase()} Properties`;
    filterDescription = `Showing all verified ${filterHeading.toLowerCase()} available for rent or purchase.`;
    badgeLabel = "Category";
  }

  const handleSellTypeChange = (typeVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sellType", typeVal);
    params.set("activeTypes", typeVal);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const PROPERTY_TYPES = [
    { label: "All Types", key: "all", icon: "✨" },
    { label: "Condominium", key: "condo", icon: "🏢" },
    { label: "House", key: "house", icon: "🏡" },
    { label: "Commercial", key: "commercial", icon: "🏪" },
    { label: "Office", key: "office", icon: "💼" },
    { label: "Warehouse", key: "warehouse", icon: "🏭" },
    { label: "Lot & Land", key: "lot", icon: "🏗️" },
  ];

  const handlePropertyTypeChange = (typeKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (typeKey === "all") {
      params.delete("type");
    } else {
      params.set("type", typeKey);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const hasSpecificFilter = Boolean(
    currentType ||
    isPreSale ||
    isSale ||
    searchParams.get("amenities") ||
    searchParams.get("city") ||
    searchParams.get("bed") ||
    searchParams.get("bath") ||
    searchParams.get("priceMin") ||
    searchParams.get("priceMax")
  );

  return (
    <div className="min-h-screen p-4 px-4 sm:px-8 lg:px-16">
      {error && (
        <div className="text-red-600 p-4 mb-4 bg-red-50 rounded-lg text-center font-medium text-sm">
          {error}
        </div>
      )}

      {/* Active Category / Transaction Header Banner (#64) */}
      <div className="mb-4 sm:mb-5 p-5 sm:p-4 bg-gradient-to-r from-blue-50/90 to-slate-50 border border-blue-200/80 rounded-2xl flex flex-row items-center sm:flex-col justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
              Listing Filter
            </span>
            <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {badgeLabel}
            </span>
          </div>
          <h1 className="text-2xl sm:text-xl font-black text-zinc-900 tracking-tight mt-1">
            {filterHeading}
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            {filterDescription}
          </p>
        </div>

        {hasSpecificFilter && (
          <button
            onClick={() => router.push("/list")}
            className="self-start sm:self-auto bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 border border-zinc-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Property Type Quick Filter Bar (#66) */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none" style={{ scrollbarWidth: "none" }}>
        {PROPERTY_TYPES.map((pt) => {
          const isSelected = (!currentType && pt.key === "all") || (currentType?.toLowerCase() === pt.key.toLowerCase());
          return (
            <button
              key={pt.key}
              onClick={() => handlePropertyTypeChange(pt.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 active:scale-95 ${
                isSelected
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 border border-blue-600"
                  : "bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 border border-zinc-200/80 shadow-2xs"
              }`}
            >
              <span>{pt.icon}</span>
              <span>{pt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Unified 2-Column Control Bar (#60, #61) */}
      <div className="mb-6 bg-white border border-zinc-200/80 rounded-2xl p-3 sm:p-4 flex flex-row items-center md:flex-col justify-between gap-4 shadow-2xs">
        
        {/* Left Column: Transaction Type Tabs (Rent, Buy, Pre-sale) & Property Count */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rent, Buy, Pre-sale Switcher */}
          <div className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/60">
            {[
              { label: "Rent", key: "rent" },
              { label: "Buy", key: "sale" },
              { label: "Pre-sale", key: "preSale" },
            ]
              .filter(({ key }) => {
                // Show Pre-sale only when property type is condo (or when no specific non-condo type is selected)
                if (key === "preSale") {
                  return !currentType || currentType.toLowerCase() === "condo";
                }
                return true;
              })
              .map(({ label, key }) => {
                const isSelected = 
                  currentSellType?.toLowerCase() === key.toLowerCase() ||
                  (key === "sale" && currentSellType?.toLowerCase() === "buy");

                return (
                  <button
                    key={key}
                    onClick={() => handleSellTypeChange(key)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-white/60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
          </div>

          {/* Result count */}
          <span className="text-sm sm:text-xs font-bold text-zinc-500">
            {isLoading ? (
              "Loading properties..."
            ) : (
              <>
                <strong className="text-zinc-900 font-extrabold">{total.toLocaleString()}</strong> properties
                {totalPages > 1 && ` · Page ${currentPage}/${totalPages}`}
              </>
            )}
          </span>
        </div>

        {/* Right Column: View Mode Switcher (View as List vs View on Map) */}
        <div className="flex items-center gap-1.5 self-end md:self-auto bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/60 shrink-0">
          <button
            onClick={() => router.push("/list")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black bg-white text-blue-600 shadow-2xs border border-zinc-200/60"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            View as List
          </button>
          <button
            onClick={() => {
              const currentQuery = searchParams.toString();
              router.push(currentQuery ? `/map?${currentQuery}` : "/map");
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-white/60 transition-all"
          >
            🗺️ View on Map
          </button>
        </div>
      </div>

      {/* Grid: Desktop 4 cols, Mobile 2 cols (matches homepage Handpicked Properties grid) */}
      {isLoading ? (
        <div className="grid grid-cols-4 lg:grid-cols-2 gap-4 sm:gap-6 gap-y-8 sm:gap-y-10">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-4 sm:gap-6 gap-y-8 sm:gap-y-10">
            {items.map((unit: any) => (
              <ListCard
                unitId={unit.id}
                key={`unit-${unit.id}`}
                title={unit.title}
                price={unit.price}
                area={unit.area}
                location={unit.fullAddress}
                imageUrl={parseImages(unit.images)[0] || ""}
                postedDate={unit.postedDate}
                bed={unit.bed}
                bath={unit.bath}
                sellType={unit.sellType}
                isUrgent={unit.isUrgent}
                isFavorited={unit.isFavorited}
                featured={unit.featured}
                priority={items.indexOf(unit) < 6}
                onClick={() => handleUnitClick(unit)}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {renderPagination()}

          {units.length === 0 && !error && (
            <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 text-center">
              <BsDatabaseX className="w-16 h-16 text-zinc-300 mb-3" />
              <h3 className="text-base font-extrabold text-zinc-700">No properties found</h3>
              <p className="text-xs text-zinc-400 mt-1">Try resetting filters or searching another area</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MainList;