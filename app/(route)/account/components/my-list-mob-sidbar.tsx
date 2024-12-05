"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useMapStore } from "@/store/use-map-store";
import SideUnitCard from "../../map/components/side-unit-card";
import { useRouter } from "next/navigation";
import { useObserver } from "@/hooks/use-observer";
import { useLoading } from "@/hooks/use-loading";
import { LodaingUi } from "@/components/ui/loading-ui";
import { IoIosArrowDown } from "react-icons/io";
import { Map, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const TRANSITION_DURATION = 400;
const SWIPE_COOLDOWN = 700;
const SWIPE_THRESHOLD = 10;
const PAGE_SIZE = 20;

interface Unit {
  id: number;
  title: string;
  price: number;
  sellType: string;
  area: number;
  address2: string;
  address3: string;
  address4: string;
  images: string[];
  bed: number;
  bath: number;
  fullAdress:string;
}

interface MyListMobSideBarProps {
  type?: "rent" | "sale";
}

const MyListMobSideBar = React.memo(({ type }: MyListMobSideBarProps) => {
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef(0);
  const lastSwipeTimeRef = useRef(0);
  const isAtTopRef = useRef(true);
  const isTransitioning = useRef(false);

  const {
    visibleUnits,
    sheetPosition,
    setSheetPosition,
    setHoverUnitId,
    isLoading: mapLoading,
  } = useMapStore();

  const { isLoading, startLoading, stopLoading } = useLoading();
  const [loadedUnits, setLoadedUnits] = useState<Unit[]>([]);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"low" | "high">("low");

  const hasMore = useMemo(
    () => loadedUnits.length < visibleUnits.length,
    [loadedUnits.length, visibleUnits.length]
  );
  useEffect(() => {
    if (!sheetRef.current) return;

    const positions = {
      minimized: "calc(100% - 60px)",
      half: "55%",
      full: "0%",
    };

    sheetRef.current.style.transform = `translateY(${positions[sheetPosition]})`;
  }, [sheetPosition]);
  useEffect(() => {
    if (sheetRef.current && type) {
      sheetRef.current.style.transform = "translateY(calc(100% - 60px))";
      setSheetPosition("minimized");
    }
  }, [setSheetPosition, type]);

  useEffect(() => {
    if (sheetPosition === "full" && firstCardRef.current) {
      firstCardRef.current.style.marginTop = "32px";
    } else if (firstCardRef.current) {
      firstCardRef.current.style.marginTop = "0px";
    }
  }, [sheetPosition]);

  const snapToPosition = useCallback(
    (position: "minimized" | "half" | "full") => {
      if (!sheetRef.current || isTransitioning.current) return;

      isTransitioning.current = true;
      const translateY =
        position === "minimized"
          ? "calc(100% - 60px)"
          : position === "half"
          ? "55%"
          : "0%";

      sheetRef.current.style.transform = `translateY(${translateY})`;
      setSheetPosition(position);

      setTimeout(() => {
        isTransitioning.current = false;
        if (position === "minimized" && contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      }, TRANSITION_DURATION);
    },
    [setSheetPosition]
  );

  const handleHeaderClick = useCallback(() => {
    if (sheetPosition === "minimized") {
      snapToPosition("full");
    }
  }, [sheetPosition, snapToPosition]);

  const handleEdit = useCallback(
    (unitId: number, e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/account/unit/edit/${unitId}`);
    },
    [router]
  );

  const handleContentScroll = useCallback(() => {
    if (contentRef.current) {
      isAtTopRef.current = contentRef.current.scrollTop <= 1;
    }
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    const handle = handleRef.current;

    if (!content || !handle) return;

    const touchStartOptions = { passive: false };
    const touchMoveOptions = { passive: false };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      if (contentRef.current) {
        isAtTopRef.current = contentRef.current.scrollTop <= 1;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastSwipeTimeRef.current < SWIPE_COOLDOWN) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartYRef.current;

      if (isAtTopRef.current && deltaY > SWIPE_THRESHOLD) {
        e.preventDefault();
        if (sheetPosition === "full") {
          snapToPosition("half");
          lastSwipeTimeRef.current = now;
        } else if (sheetPosition === "half") {
          snapToPosition("minimized");
          lastSwipeTimeRef.current = now;
        }
      } else if (deltaY < -SWIPE_THRESHOLD) {
        if (sheetPosition === "minimized") {
          snapToPosition("half");
          lastSwipeTimeRef.current = now;
        } else if (sheetPosition === "half") {
          snapToPosition("full");
          lastSwipeTimeRef.current = now;
        }
      }
    };

    content.addEventListener("touchstart", handleTouchStart, touchStartOptions);
    content.addEventListener("touchmove", handleTouchMove, touchMoveOptions);
    handle.addEventListener("touchstart", handleTouchStart, touchStartOptions);
    handle.addEventListener("touchmove", handleTouchMove, touchMoveOptions);

    return () => {
      content.removeEventListener("touchstart", handleTouchStart);
      content.removeEventListener("touchmove", handleTouchMove);
      handle.removeEventListener("touchstart", handleTouchStart);
      handle.removeEventListener("touchmove", handleTouchMove);
    };
  }, [sheetPosition, snapToPosition]);

  const sortUnits = useCallback(
    (units: Unit[]) => {
      return [...units].sort((a, b) => {
        return sortOrder === "low" ? a.price - b.price : b.price - a.price;
      });
    },
    [sortOrder]
  );

  const loadMoreUnits = useCallback(() => {
    if (sheetPosition === "minimized") return;

    startLoading();
    const sortedUnits = sortUnits(visibleUnits);
    const nextPageUnits = sortedUnits.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

    setTimeout(() => {
      setLoadedUnits((prev) => [...prev, ...nextPageUnits]);
      setPage((prev) => prev + 1);
      stopLoading();
    }, 1000);
  }, [sheetPosition, page, visibleUnits, sortUnits, startLoading, stopLoading]);

  const handleUnitClick = useCallback(
    (unitId: number) => {
      router.push("/unit/detail/" + unitId);
    },
    [router]
  );

  const { lastElementRef } = useObserver(loadMoreUnits, hasMore, isLoading);

  useEffect(() => {
    const sortedUnits = sortUnits(visibleUnits);
    setLoadedUnits(sortedUnits.slice(0, PAGE_SIZE));
    setPage(2);
  }, [visibleUnits, sortUnits]);

  const SheetHeader = useMemo(
    () => (
      <div
        ref={handleRef}
        className="w-full h-16 select-none touch-none bg-white rounded-t-3xl"
        onClick={handleHeaderClick}
      >
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="w-16 h-1 bg-gray-300 rounded-full mb-2" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {visibleUnits.length} units found
            </span>
            <IoIosArrowDown
              className={`transform transition-transform duration-500 ${
                sheetPosition === "full" ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>
    ),
    [visibleUnits.length, sheetPosition, handleHeaderClick]
  );

  const ViewMapButton = useMemo(
    () =>
      sheetPosition === "full" && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            snapToPosition("minimized");
          }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black text-white text-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 pointer-events-auto"
        >
          <Map size={20} />
          <span>View Map</span>
        </button>
      ),
    [sheetPosition, snapToPosition]
  );

  const UnitCard = useCallback(
    ({ unit, index }: { unit: Unit; index: number }) => (
      <div className="relative" key={`${unit.id}-${unit.title}`}>
        <SideUnitCard
          ref={index === 0 ? firstCardRef : undefined}
          onMouseEnter={() => setHoverUnitId(unit.id)}
          onMouseLeave={() => setHoverUnitId(null)}
          onClick={() => handleUnitClick(unit.id)}
          title={unit.title}
          price={Number(unit.price)}
          sellType={unit.sellType}
          area={unit.area}
          location={`${unit.fullAdress}`}
          imageUrl={unit.images[0]}
          postedDate="2 days ago"
          isVip={true}
          bed={unit.bed}
          bath={unit.bath}
        />
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 flex items-center gap-1 z-10 bg-white"
          onClick={(e) => handleEdit(unit.id, e)}
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
      </div>
    ),
    [firstCardRef, setHoverUnitId, handleUnitClick, handleEdit]
  );

  return (
    <div className="md:block hidden fixed inset-0 pointer-events-none overscroll-contain">
      {ViewMapButton}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg pointer-events-auto overscroll-contain"
        style={{
          height: "calc(100dvh - 60px)",
          transform: "translateY(calc(100% - 60px))",
          touchAction: "pan-x pan-y",
          overscrollBehavior: "none",
          transition: `transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        {SheetHeader}
        <div
          ref={contentRef}
          className="px-4 overflow-y-auto h-[calc(100%-4rem)] overscroll-contain hide-scroll"
          style={{
            overscrollBehavior: "contain",
            touchAction: "pan-x pan-y",
          }}
          onScroll={handleContentScroll}
        >
          {mapLoading ? (
            <LodaingUi />
          ) : (
            <div className="space-y-4 pb-20">
              {loadedUnits.map((unit, index) => (
                <UnitCard key={unit.id} unit={unit} index={index} />
              ))}
              <div ref={lastElementRef} />
              {isLoading && (
                <div className="flex justify-center p-4">
                  <div className="loader" />
                  <span>Loading more units...</span>
                </div>
              )}
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
      </div>
    </div>
  );
});

MyListMobSideBar.displayName = "MyListMobSideBar";

export default MyListMobSideBar;
