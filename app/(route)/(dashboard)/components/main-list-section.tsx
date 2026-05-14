"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ListCard from "@/components/ui/list-card";
import AdCard from "./ad-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import useHandleUnitClick from "@/hooks/use-handle-unit-click";
import { BsDatabaseX } from "react-icons/bs";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

// 데스크탑과 모바일 화면에서 각각 다른 설정을 위한 상수
const DESKTOP_COLUMNS = 6; // 데스크탑에서의 열 개수
const AD_FREQUENCY = {
  DESKTOP: 12, // 데스크탑에서 광고 표시 간격 (2행 마다 행의 시작에 배치: 6*2)
  MOBILE: 3 // 모바일에서 광고 표시 간격 (3개 아이템마다 배치)
};

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
  const LIMIT = isMobile ? 12 : 46;
  
  // searchParams 변경 감지를 위한 ref
  const prevSearchParamsRef = useRef<string>("");
  const isInitialLoadRef = useRef<boolean>(true);

  // 광고 정보
  const ads = [
    { 
      id: 'ad1', 
      desktopImageUrl: '/assets/images/ad_desk0.png', 
      mobileImageUrl: '/assets/images/ad_mob0.png', 
      link: 'https://example.com/ad1' 
    },
    { 
      id: 'ad2', 
      desktopImageUrl: '/assets/images/ad_desk1.png', 
      mobileImageUrl: '/assets/images/ad_mob1.png', 
      link: 'https://example.com/ad2' 
    }
  ];

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

  // 광고를 포함한 아이템 리스트 생성
  const getItemsWithAds = useCallback(() => {
    const result: any = [];
    let adIndex = 0;
    
    allUnits.forEach((unit, index) => {
      // 유닛 추가
      result.push({
        type: 'unit',
        data: unit,
        key: `unit-${unit.id}`
      });
      
      // 광고 추가 로직 (데스크탑과 모바일에 따라 다르게 처리)
      const frequency = isMobile ? AD_FREQUENCY.MOBILE : AD_FREQUENCY.DESKTOP;
      
      // 데스크탑에서는 두 행마다 행의 시작 부분에 광고 추가
      // 모바일에서는 단순히 N개 아이템마다 광고 추가
      if ((index + 1) % frequency === 0 && index > 0) {
        const currentAd = ads[adIndex % ads.length];
        result.push({
          type: 'ad',
          data: currentAd,
          key: `ad-${currentAd.id}-${index}`
        });
        adIndex++;
      }
    });
    
    return result;
  }, [allUnits, isMobile, ads]);

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
            이전
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

  const itemsWithAds = getItemsWithAds();

  return (
    <div className="min-h-screen p-4 px-20 3xl:px-12 xs:px-4">
      {error && (
        <div className="text-red-600 p-4 mb-4 bg-red-50 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* 결과 개수 표시 */}
      {total > 0 && !isLoading && (
        <div className="mb-4 text-sm text-gray-600 w-full flex justify-end">
          Total {total.toLocaleString()} results 
          {totalPages > 1 && (
            <span> - Page {currentPage} of {totalPages}</span>
          )}
        </div>
      )}

      {/* 로딩 중일 때 스켈레톤 표시 */}
      {isLoading ? (
        <div className="grid grid-cols-6 4xl:grid-cols-5 3xl:grid-cols-4 xs:grid-cols-2 2lg:grid-cols-3 tlg:grid-cols-2 gap-6 gap-y-10">
          {Array.from({ length: LIMIT > 24 ? 24 : LIMIT }).map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-6 4xl:grid-cols-5 3xl:grid-cols-4 xs:grid-cols-2 2lg:grid-cols-3 tlg:grid-cols-2 gap-6 gap-y-10">
            {itemsWithAds.map((item: any) => {
              if (item.type === 'unit') {
                const unit = item.data;
                return (
                  <ListCard
                    unitId={unit.id}
                    key={item.key}
                    title={unit.title}
                    price={unit.price}
                    area={unit.area}
                    location={unit.fullAddress}
                    imageUrl={unit.images ? (Array.isArray(unit.images) ? unit.images[0] : JSON.parse(unit.images)[0]) : ""}
                    postedDate={unit.postedDate}
                    bed={unit.bed}
                    bath={unit.bath}
                    sellType={unit.sellType}
                    isUrgent={unit.isUrgent}
                    isFavorited={unit.isFavorited}
                    featured={unit.featured}
                    onClick={() => handleUnitClick(unit)}
                  />
                );
              } else if (item.type === 'ad') {
                const ad = item.data;
                return (
                  <AdCard
                    key={item.key}
                    desktopImageUrl={ad.desktopImageUrl}
                    mobileImageUrl={ad.mobileImageUrl}
                    link={ad.link}
                  />
                );
              }
              return null;
            })}
          </div>

          {/* 페이지네이션 */}
          {renderPagination()}

          {units.length === 0 && !error && (
            <div className="min-h-screen flex flex-col items-center pt-20">
              <BsDatabaseX className="w-24 h-24 text-gray-400 mb-4" />
              <p className="text-xl text-gray-500">No units found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MainList;