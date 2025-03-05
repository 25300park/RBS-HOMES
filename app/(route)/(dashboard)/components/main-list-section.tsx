"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useObserver } from "@/hooks/use-observer";
import ListCard from "@/components/ui/list-card";
import AdCard from "./ad-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import useHandleUnitClick from "@/hooks/use-handle-unit-click";
import { BsDatabaseX } from "react-icons/bs";
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
  fullAdress: string;
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
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [featuredUnits, setFeaturedUnits] = useState<any>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialLoadCompleted = useRef<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const handleUnitClick = useHandleUnitClick();
  const LIMIT = isMobile ? 4 : 12;

  // 광고 정보
  const ads = [
    { 
      id: 'ad1', 
      desktopImageUrl: '/assets/images/ad_desk.jpg', 
      mobileImageUrl: '/assets/images/ad_mob.jpg', 
      link: 'https://example.com/ad1' 
    },
    { 
      id: 'ad2', 
      desktopImageUrl: '/assets/images/ad_desk.jpg', 
      mobileImageUrl: '/assets/images/ad_mob.jpg', 
      link: 'https://example.com/ad2' 
    }
  ];

  useEffect(() => {
    getFeaturedUnits().then(units => {
      setFeaturedUnits(units);
    });
  }, []);

  // 데이터 fetch 함수
  const fetchData = async (pageNum: number, append: boolean = false) => {
    if (isFetching) return;

    try {
      setIsFetching(true);
      setError(null);

      // 이전 요청 중단
      if (initialLoadCompleted.current) {
        abortControllerRef.current?.abort();
      }

      abortControllerRef.current = new AbortController();

      // 쿼리 파라미터 생성
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
        setUnits((prev) => (append ? [...prev, ...data.units] : data.units));
        setTotal(data.total);
        setHasMore(
          data.units.length === LIMIT &&
            data.total >
              (append ? units.length + data.units.length : data.units.length)
        );
      } else {
        setHasMore(false);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setError(error.message);
        console.error("Failed to fetch units:", error);
      }
    } finally {
      setIsFetching(false);
      setIsInitialLoading(false);
      if (!initialLoadCompleted.current) {
        initialLoadCompleted.current = true;
      }
    }
  };

  // searchParams 변경 시 첫 페이지로 초기화하여 데이터 로드
  useEffect(() => {
    if (initialLoadCompleted.current) {
      setPage(1);
      setUnits([]);
      setHasMore(true);
      fetchData(1, false);
    }
  }, [searchParams]);

  // 첫 렌더링 시 데이터 로드
  useEffect(() => {
    fetchData(1, false);
  }, []);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (page > 1) {
      fetchData(page, true);
    }
  }, [page]);

  // Cleanup
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const loadMoreUnits = () => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  };

  const allUnits = [...featuredUnits, ...units];

  // 광고를 포함한 아이템 리스트 생성
  const getItemsWithAds = () => {
    const result: any = [];
    let adIndex = 0;
    
    allUnits.forEach((unit, index) => {
      // 유닛 추가
      result.push({
        type: 'unit',
        data: unit,
        key: `unit-${unit.id}`,
        isLast: index === allUnits.length - 1
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
  };

  const itemsWithAds = getItemsWithAds();
  const { lastElementRef } = useObserver(loadMoreUnits, hasMore, isFetching);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen p-4 px-20 3xl:px-12 xs:px-4">
        <div className="grid grid-cols-6 4xl:grid-cols-5 3xl:grid-cols-4 xs:grid-cols-1 2lg:grid-cols-3 tlg:grid-cols-2 gap-6 gap-y-10">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 px-20 3xl:px-12 xs:px-4">
      {error && (
        <div className="text-red-600 p-4 mb-4 bg-red-50 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-6 4xl:grid-cols-5 3xl:grid-cols-4 xs:grid-cols-1 2lg:grid-cols-3 tlg:grid-cols-2 gap-6 gap-y-10">
        {itemsWithAds.map((item: any) => {
          if (item.type === 'unit') {
            const unit = item.data;
            return (
              <ListCard
                unitId={unit.id}
                ref={item.isLast ? lastElementRef : null}
                key={item.key}
                title={unit.title}
                price={unit.price}
                area={unit.area}
                location={unit.fullAdress}
                imageUrl={unit.images ? JSON.parse(unit.images)[0] : ""}
                postedDate={unit.postedDate}
                bed={unit.bed}
                bath={unit.bath}
                sellType={unit.sellType}
                isUrgent={unit.isUrgent}
                isFavorited={unit.isFavorited}
                featured={unit.featured}
                onClick={() => handleUnitClick(unit.id)}
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

      {isFetching && !isInitialLoading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      )}

      {!hasMore && units.length > 0 && !isFetching && (
        <div className="text-center py-20 text-gray-600">No more results</div>
      )}

      {units.length === 0 && !isFetching && !error && (
        <div className="min-h-screen flex flex-col items-center pt-20">
          <BsDatabaseX className="w-24 h-24 text-gray-400 mb-4" />
          <p className="text-xl text-gray-500">No units found</p>
        </div>
      )}
    </div>
  );
};

export default MainList;