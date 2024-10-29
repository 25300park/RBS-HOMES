"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useObserver } from "@/hooks/use-observer";
import ListCard from "@/components/ui/list-card";
import { Skeleton } from "@/components/ui/skeleton";

interface Unit {
  id: string;
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
}

interface FetchResponse {
  units: Unit[];
  total: number;
}

const LIMIT = 12;

const MainList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialLoadCompleted = useRef<boolean>(false);

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

  const { lastElementRef } = useObserver(loadMoreUnits, hasMore, isFetching);

  const handleUnitClick = useCallback(
    (unitId: string) => {
      router.push(`/unit/detail/${unitId}`);
    },
    [router]
  );

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
        {units.map((unit, index) => (
          <ListCard
            ref={index === units.length - 1 ? lastElementRef : null}
            key={unit.id}
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
            onClick={() => handleUnitClick(unit.id)}
          />
        ))}
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
        <div className="min-h-screen p-4 px-20 3xl:px-12 xs:px-4">
          <div className="grid grid-cols-6 4xl:grid-cols-5 3xl:grid-cols-4 xs:grid-cols-1 2lg:grid-cols-3 tlg:grid-cols-2 gap-6 gap-y-10">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainList;
