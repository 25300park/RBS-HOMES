"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useObserver } from "@/hooks/use-observer";

const MainList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // SearchParams는 컴포넌트 내에서 처리
  const [units, setUnits] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const limit = 10;

  // 데이터 로드 함수
  const fetchData = useCallback(async (page: number, append: boolean = false) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    setIsFetching(true);
    try {
      const response = await fetch(`/api/units?${params.toString()}`);
      const data = await response.json();

      if (data?.units?.length) {
        setUnits((prev) => (append ? [...prev, ...data.units] : data.units)); // 데이터 추가 또는 덮어쓰기
        setTotal(data.total);
        setHasMore(data.units.length > 0 && units.length + data.units.length < data.total); // 더 로드할 데이터가 있는지 확인
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch units", error);
    } finally {
      setIsFetching(false);
    }
  }, [searchParams, units.length]);

  // 페이지가 바뀔 때마다 호출
  useEffect(() => {
    if (page === 1) {
      fetchData(page, false); // 첫 페이지일 때는 데이터를 덮어쓰기
    } else {
      fetchData(page, true); // 이후 페이지는 데이터를 추가
    }
  }, [page, searchParams]);

  // 필터가 변경될 때마다 페이지를 1로 초기화하고 데이터 새로 가져옴
  useEffect(() => {
    setPage(1); // 페이지를 1로 초기화
    fetchData(1, false); // 필터 변경 시 첫 페이지부터 새로 로드
  }, [searchParams]);

  const loadMoreUnits = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1); // 다음 페이지로 이동
  }, [hasMore, isFetching]);

  const { lastElementRef } = useObserver(loadMoreUnits, hasMore, isFetching); // 무한스크롤 트리거

  return (
    <div>
      <div className="unit-list">
        {units.map((unit: any, index: number) => (
          <div
            key={`${unit.id}-${index}`}
            ref={units.length === index + 1 ? lastElementRef : null} // 마지막 요소에 ref를 설정하여 감지
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
