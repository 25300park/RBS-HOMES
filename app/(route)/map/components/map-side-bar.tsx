"use client";

import { useEffect, useState } from "react";
import { useMapStore } from "@/store/use-map-store";
import { useModalStore } from "@/store/use-modal-store";
import SideUnitCard from "./side-unit-card";
import { useRouter } from "next/navigation";
import FilterButton from "@/components/ui/filter-btn";
import FilterResetButton from "@/components/ui/filter-reset-btn";
import { useObserver } from "@/hooks/use-observer";
import { useLoading } from "@/hooks/use-loading";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"; // 화살표 아이콘

export interface MapSideBarProps {
  type?: "rent" | "sale";
}

const MapSideBar = ({ type }: MapSideBarProps) => {
  const router = useRouter();
  const { openModal } = useModalStore();
  const {
    visibleUnits,
    isSidebarOpen,
    toggleSidebar,
    setMapCenterAndZoom,
    setHoverUnitId,
    isLoading: mapLoading,
  } = useMapStore();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [loadedUnits, setLoadedUnits] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const hasMore = loadedUnits.length < visibleUnits.length;

  // 정렬 상태 관리
  const [sortOrder, setSortOrder] = useState<"low" | "high">("low");

  // 페이지 단위로 데이터 로드
  const loadMoreUnits = () => {
    startLoading();
    const sortedUnits = sortUnits(visibleUnits);
    const nextPageUnits = sortedUnits.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
    setTimeout(() => {
      // 임의의 지연 시간 추가
      setLoadedUnits((prev) => [...prev, ...nextPageUnits]);
      setPage((prev) => prev + 1);
      stopLoading();
    }, 1000);
  };

  // 정렬 함수
  const sortUnits = (units: any[]) => {
    return units.sort((a, b) => {
      if (sortOrder === "low") {
        return a.price - b.price; // 낮은 금액순
      } else {
        return b.price - a.price; // 높은 금액순
      }
    });
  };

  // useObserver 훅을 사용하여 마지막 요소를 감시
  const { lastElementRef } = useObserver(loadMoreUnits, hasMore, isLoading);

  // visibleUnits가 변경되거나 정렬 순서가 변경될 때마다 초기화
  useEffect(() => {
    const sortedUnits = sortUnits(visibleUnits);
    setLoadedUnits(sortedUnits.slice(0, pageSize));
    setPage(2);
  }, [visibleUnits, sortOrder]);

  const handleUnitClick = (unitId: number) => {
    router.push("/unit/detail/" + unitId);
  };

  return (
    <aside
      className={`fixed top-20 right-0 h-full bg-white border-l transition-all duration-300 ${
        isSidebarOpen ? "w-[400px]" : "w-0"
      }`}
    >
      <div
        className={`relative h-[calc(100%-80px)] overflow-y-scroll ${
          isSidebarOpen ? "block" : "hidden"
        }`}
      >
        {/* 금액 정렬 선택 드롭다운 */}
        <div className="p-4">
          <label htmlFor="sortOrder" className="block mb-2 text-sm font-medium">
            정렬 기준:
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "low" | "high")}
            className="p-2 border rounded-md w-full"
          >
            <option value="low">낮은 금액순</option>
            <option value="high">높은 금액순</option>
          </select>
        </div>

        {/* 기존 로딩 상태 처리 */}
        {mapLoading ? (
          <div className="p-4">Loading map data...</div>
        ) : (
          <>
            {/* 총 유닛 개수 표시 */}
            <div className="p-4">Total Units: {visibleUnits.length}</div>
            <div className="grid grid-cols-1">
              {loadedUnits.map((card: any, index: number) => (
                <SideUnitCard
                  onMouseEnter={() => setHoverUnitId(card.id)}
                  onMouseLeave={() => setHoverUnitId(null)}
                  onClick={() => handleUnitClick(card.id)}
                  key={index}
                  title={card.title}
                  price={Number(card.price)}
                  sellType={card.sellType}
                  area={card.area}
                  location={`${card.address2 as string},${
                    card.address3 as string
                  },${card.address4 as string}`}
                  imageUrl={"/assets/images/cardtest.png"}
                  postedDate={"2 days ago"}
                  isVip={true}
                  bed={card.bed as number}
                  bath={card.bath as number}
                />
              ))}
            </div>
            {/* 마지막 항목에 ref를 부착하여 감시 */}
            <div ref={lastElementRef} />
            {/* 무한 스크롤 로딩 상태 처리 */}
            {isLoading && (
              <div className="flex justify-center p-4">
                <div className="loader" />
                <span>Loading more units...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* 사이드바 열고 닫기 버튼 */}

      {isSidebarOpen ? (
        <button
          onClick={() => toggleSidebar(!isSidebarOpen)}
          className="absolute top-[26px] -left-12 bg-white border rounded-md p-2 shadow-lg transform -translate-y-1/2"
        >
          <IoIosArrowForward size={24} />
        </button>
      ) : (
        <button
          onClick={() => toggleSidebar(!isSidebarOpen)}
          className="absolute top-[8px] w-40 -left-44 bg-white p-2 rounded-md border flex items-center gap-4 shadow-lg"
        >
          <IoIosArrowBack size={24} />
          <p>Show list</p>
        </button>
      )}
    </aside>
  );
};

export default MapSideBar;
