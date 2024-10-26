"use client";

import { useEffect, useState, useRef } from "react";
import { useMapStore } from "@/store/use-map-store";
import { useModalStore } from "@/store/use-modal-store";
import SideUnitCard from "./side-unit-card";
import { useRouter } from "next/navigation";
import { useObserver } from "@/hooks/use-observer";
import { useLoading } from "@/hooks/use-loading";
import { LodaingUi } from "@/components/ui/loading-ui";
import { IoIosArrowDown } from "react-icons/io";
import { Map } from "lucide-react";

export interface MobileMapSideBarProps {
  type?: "rent" | "sale";
}

type SheetPosition = 'minimized' | 'half' | 'full';

const MobileMapSideBar = ({ type }: MobileMapSideBarProps) => {
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModalStore();
  const {
    visibleUnits,
    isSidebarOpen,
    setHoverUnitId,
    isLoading: mapLoading,
  } = useMapStore();

  const { isLoading, startLoading, stopLoading } = useLoading();
  const [loadedUnits, setLoadedUnits] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>('minimized');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [contentScrollTop, setContentScrollTop] = useState(0);

  const pageSize = 20;
  const hasMore = loadedUnits.length < visibleUnits.length;
  const [sortOrder, setSortOrder] = useState<"low" | "high">("low");

  const DRAG_THRESHOLD = 50;

  const snapToPosition = (position: SheetPosition) => {
    if (!sheetRef.current) return;

    let translateY = '0%';
    switch (position) {
      case 'minimized':
        translateY = 'calc(100% - 60px)';
        break;
      case 'half':
        translateY = '55%';  // 약간 더 높게 설정하여 45vh 정도 보이도록
        break;
      case 'full':
        translateY = '0%';
        break;
    }

    sheetRef.current.style.transform = `translateY(${translateY})`;
    setSheetPosition(position);

    // 축소할 때 스크롤 위치 초기화
    if (position === 'minimized' && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsDragging(true);

    if (contentRef.current) {
      setContentScrollTop(contentRef.current.scrollTop);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentTouch = e.touches[0].clientY;
    setCurrentY(currentTouch);
    const deltaY = currentTouch - startY;

    if (contentRef.current && contentRef.current.scrollTop <= 0) {
      switch (sheetPosition) {
        case 'full':
          if (deltaY > 0 && deltaY <= window.innerHeight * 0.6) {
            e.preventDefault();
            if (sheetRef.current) {
              const movePercent = (deltaY / window.innerHeight) * 100;
              sheetRef.current.style.transform = `translateY(${movePercent}%)`;
            }
          }
          break;

        case 'half':
          e.preventDefault();
          if (sheetRef.current) {
            const baseOffset = 55; // 기본 half 위치
            const movePercent = baseOffset + (deltaY / window.innerHeight) * 100;
            const clampedPercent = Math.max(0, Math.min(95, movePercent));
            sheetRef.current.style.transform = `translateY(${clampedPercent}%)`;
          }
          break;

        case 'minimized':
          if (deltaY < 0) {
            e.preventDefault();
            if (sheetRef.current) {
              const baseOffset = 100;
              const movePercent = Math.max(
                55,
                baseOffset - (Math.abs(deltaY) / window.innerHeight) * 100
              );
              sheetRef.current.style.transform = `translateY(calc(${movePercent}% - 60px))`;
            }
          }
          break;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;

    switch (sheetPosition) {
      case 'full':
        if (contentRef.current?.scrollTop === 0 && deltaY > DRAG_THRESHOLD) {
          snapToPosition('half');
        } else {
          snapToPosition('full');
        }
        break;

      case 'half':
        if (deltaY > DRAG_THRESHOLD) {
          snapToPosition('minimized');
        } else if (deltaY < -DRAG_THRESHOLD) {
          snapToPosition('full');
        } else {
          snapToPosition('half');
        }
        break;

      case 'minimized':
        if (deltaY < -DRAG_THRESHOLD) {
          snapToPosition('half');
        } else {
          snapToPosition('minimized');
        }
        break;
    }
  };

  const handleHeaderClick = () => {
    if (sheetPosition === 'minimized') {
      snapToPosition('full');
    }
  };

  const handleContentScroll = () => {
    if (!contentRef.current) return;
    setContentScrollTop(contentRef.current.scrollTop);
  };

  // Data loading and sorting logic
  const loadMoreUnits = () => {
    if (sheetPosition === 'minimized') return;

    startLoading();
    const sortedUnits = sortUnits(visibleUnits);
    const nextPageUnits = sortedUnits.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
    setTimeout(() => {
      setLoadedUnits((prev) => [...prev, ...nextPageUnits]);
      setPage((prev) => prev + 1);
      stopLoading();
    }, 1000);
  };

  const sortUnits = (units: any[]) => {
    return units.sort((a, b) => {
      return sortOrder === "low" ? a.price - b.price : b.price - a.price;
    });
  };

  const { lastElementRef } = useObserver(loadMoreUnits, hasMore, isLoading);

  useEffect(() => {
    const sortedUnits = sortUnits(visibleUnits);
    setLoadedUnits(sortedUnits.slice(0, pageSize));
    setPage(2);
  }, [visibleUnits, sortOrder]);

  const handleUnitClick = (unitId: number) => {
    router.push("/unit/detail/" + unitId);
  };

  return (
    <div 
      className="hidden md:block fixed inset-0 pointer-events-none"
      style={{ overscrollBehavior: 'none' }}
    >
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg pointer-events-auto overscroll-none"
        style={{
          height: "95vh",
          transform: "translateY(calc(100% - 60px))",
          touchAction: "pan-x",
          overscrollBehavior: 'none',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' // 더 느린 애니메이션과 부드러운 이징
        }}
      >
        {/* Handle bar */}
        <div
          ref={handleRef}
          className="w-full h-16 select-none touch-none bg-white rounded-t-3xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleHeaderClick}
        >
          <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="w-16 h-1 bg-gray-300 rounded-full mb-2"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {visibleUnits.length} units found
              </span>
              <IoIosArrowDown
                className={`transform transition-transform duration-500 ${
                  sheetPosition === 'full' ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div
          ref={contentRef}
          className="px-4 overflow-y-auto h-[calc(100%-4rem)]"
          style={{ 
            overscrollBehavior: 'contain',
            touchAction: 'pan-x pan-y'
          }}
          onScroll={handleContentScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Sort Dropdown */}
          <div className="mb-4 sticky top-0 bg-white z-10 pt-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "low" | "high")}
              className="p-2 border rounded-md w-full bg-white"
            >
              <option value="low">낮은 금액순</option>
              <option value="high">높은 금액순</option>
            </select>
          </div>

          {/* Units List */}
          {mapLoading ? (
            <div className="p-4">
              <LodaingUi />
            </div>
          ) : (
            <div className="space-y-4 pb-20">
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
                  location={`${card.address2},${card.address3},${card.address4}`}
                  imageUrl={card.images[0]}
                  postedDate={"2 days ago"}
                  isVip={true}
                  bed={card.bed as number}
                  bath={card.bath as number}
                />
              ))}
              <div ref={lastElementRef} />
              {isLoading && (
                <div className="flex justify-center p-4">
                  <div className="loader" />
                  <span>Loading more units...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Toggle Button - 전체화면일 때만 표시 */}
        {sheetPosition === 'full' && (
          <button
            onClick={() => snapToPosition('minimized')}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <Map size={20} />
            <span>View Map</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileMapSideBar;