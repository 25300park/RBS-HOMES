"use client";

import { useMapStore } from "@/store/use-map-store";
import { useModalStore } from "@/store/use-modal-store";
import SideUnitCard from "./side-unit-card";
import { useRouter } from "next/navigation";
import FilterButton from "@/components/ui/filter-btn";
import FilterResetButton from "@/components/ui/filter-reset-btn";

export interface MapSideBarProps {}

const MapSideBar = ({}: MapSideBarProps) => {
  const router = useRouter();
  const { openModal } = useModalStore();
  const {
    visibleUnits,
    selectedUnit,
    isSidebarOpen,
    toggleSidebar,
    selectUnit,
    setMapCenterAndZoom,
    showPopup,
    // highlightMarker, // 마커 강조 함수
    // resetMarkerHighlight, // 마커 강조 해제 함수
  } = useMapStore();

  const handleUnitClick = (unitId: number) => {
    router.push("/unit/detail/" + unitId);
  };

  // const handleMouseEnter = (unit: any) => {
  //   highlightMarker(unit.id); // 마커 색상 변경
  // };

  // const handleMouseLeave = (unit: any) => {
  //   resetMarkerHighlight(unit.id); // 마커 색상 초기화
  // };

  return (
    <aside
      className={`${
        isSidebarOpen ? "block" : "hidden"
      } h-full overflow-y-scroll border-r w-full transition-all duration-300`}
    >
      <div className="h-full">
        <FilterButton />
        <FilterResetButton />
        <button onClick={() => toggleSidebar(!isSidebarOpen)}>
          {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        </button>
        <div className="grid grid-cols-3 gap-6 px-6 gap-y-12 ">
          {visibleUnits.map((card: any, index: number) => (
            <SideUnitCard
              onClick={() => handleUnitClick(card.id)}
              // onMouseEnter={() => handleMouseEnter(card)} // 마우스 호버 시 호출
              // onMouseLeave={() => handleMouseLeave(card)} // 마우스 호버 해제 시 호출
              key={index}
              title={card.title}
              price={Number(card.price)}
              sellType={card.sellType}
              area={card.area}
              location={`${card.address2 as string},${card.address3 as string},${card.address4 as string}`}
              imageUrl={"/assets/images/cardtest.png"}
              postedDate={"2 days ago"}
              isVip={true}
              bed={card.bed as number}
              bath={card.bath as number}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default MapSideBar;
