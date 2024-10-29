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
    sheetPosition,
    setSheetPosition
  } = useMapStore();

  const { isLoading, startLoading, stopLoading } = useLoading();
  const [loadedUnits, setLoadedUnits] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [touchStartY, setTouchStartY] = useState(0);
  const [lastSwipeTime, setLastSwipeTime] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  const pageSize = 20;
  const hasMore = loadedUnits.length < visibleUnits.length;
  const [sortOrder, setSortOrder] = useState<"low" | "high">("low");

  const TRANSITION_DURATION = 700;
  const SWIPE_COOLDOWN = 800;    
  const SWIPE_THRESHOLD = 10;      
  const isTransitioning = useRef(false);
  
  const snapToPosition = (position: 'minimized' | 'half' | 'full') => {
    if (!sheetRef.current || isTransitioning.current) return;
  
    isTransitioning.current = true;
    let translateY = '0%';
      
    switch (position) {
      case 'minimized':
        translateY = 'calc(100% - 60px)';
        break;
      case 'half':
        translateY = '55%';
        break;
      case 'full':
        translateY = '0%';
        break;
    }
  
    sheetRef.current.style.transform = `translateY(${translateY})`;
    setSheetPosition(position);
  
    setTimeout(() => {
      isTransitioning.current = false;
      if (position === 'minimized' && contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }, TRANSITION_DURATION);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    if (contentRef.current) {
      setIsAtTop(contentRef.current.scrollTop <= 1);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastSwipeTime < SWIPE_COOLDOWN) {
      return;
    }

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;

    if (isAtTop && deltaY > SWIPE_THRESHOLD) {
      e.preventDefault();
      
      switch (sheetPosition) {
        case 'full':
          snapToPosition('half');
          setLastSwipeTime(now);
          break;
        case 'half':
          snapToPosition('minimized');
          setLastSwipeTime(now);
          break;
      }
    }
    else if (deltaY < -SWIPE_THRESHOLD) {
      switch (sheetPosition) {
        case 'minimized':
          snapToPosition('half');
          setLastSwipeTime(now);
          break;
        case 'half':
          snapToPosition('full');
          setLastSwipeTime(now);
          break;
      }
    }
  };

  const handleHeaderClick = () => {
    if (sheetPosition === 'minimized') {
      snapToPosition('full');
    }
  };

  const handleContentScroll = () => {
    if (contentRef.current) {
      setIsAtTop(contentRef.current.scrollTop <= 1);
    }
  };

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

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      setIsAtTop(true);
    }
  }, []);

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
          touchAction: "pan-x pan-y",
          overscrollBehavior: 'none',
          transition: `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
        }}
      >
        <div
          ref={handleRef}
          className="w-full h-16 select-none touch-none bg-white rounded-t-3xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
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
        >
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