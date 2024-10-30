// MainList 컴포넌트
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useObserver } from "@/hooks/use-observer";

interface MainListProps {
  units: any[];
  total: number;
  searchParams: Record<string, string | number>;
}

const MainList: React.FC<MainListProps> = ({
  units: initialUnits,
  total,
  searchParams,
}) => {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [units, setUnits] = useState<any[]>(initialUnits || []);
  const [hasMore, setHasMore] = useState<boolean>(initialUnits.length > 0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  const currentPage = parseInt(currentSearchParams.get("page") || "1");
  // 초기 로드
  useEffect(() => {
    if (isFirstLoad) {
      setUnits(initialUnits);
      setIsInitialized(true);
      setIsFirstLoad(false);
      setHasMore(initialUnits.length > 0);
    }
  }, [initialUnits, isFirstLoad]);

  // 필터 변경 시 데이터 처리
  useEffect(() => {
    if (initialUnits.length === 0 && currentPage === 1) {
      setUnits([]);  // 빈 배열일 경우 상태 갱신
      setHasMore(false);
    } else if (currentPage === 1) {
      setUnits(initialUnits);
    } else {
      setUnits(prev => {
        const uniqueUnits = [...prev];
        initialUnits.forEach(newUnit => {
          if (!uniqueUnits.some(unit => unit.id === newUnit.id)) {
            uniqueUnits.push(newUnit);
          }
        });
        return uniqueUnits;
      });
    }
    setHasMore(initialUnits.length > 0 && units.length < total);
    setIsFetching(false);
  }, [initialUnits, currentPage, searchParams]);

  const loadMoreUnits = useCallback(() => {
    if (!hasMore || isFetching || units.length >= total || !isInitialized) {
      return;
    }

    setIsFetching(true);
    const nextPage = currentPage + 1;
    const updatedParams = new URLSearchParams(currentSearchParams.toString());
    updatedParams.set("page", nextPage.toString());
    router.replace(`?${updatedParams.toString()}`, { scroll: false });
  }, [hasMore, isFetching, units.length, total, currentPage, currentSearchParams, router, isInitialized]);

  const { lastElementRef } = useObserver(loadMoreUnits, hasMore, isFetching);

  return (
    <div>
      <div className="unit-list">
        {units.map((unit: any, index: number) => (
          <div
            key={`${unit.id}-${index}`}
            ref={units.length === index + 1 ? lastElementRef : null}
            onClick={() => router.push(`/unit/detail/${unit.id}`)}
            className="cursor-pointer"
          >
            <div className="h-44">{unit.id}</div>
          </div>
        ))}
      </div>
      {isFetching && <div className="text-center py-4">Loading more units...</div>}
      {!hasMore && units.length > 0 && (
        <div className="text-center py-4">No more units to load</div>
      )}
      {units.length === 0 && !isFetching && (
        <div className="text-center py-4">No units found</div>
      )}
    </div>
  );
};

export default MainList;
