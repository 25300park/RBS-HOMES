"use client";

import { useMapStore } from "@/store/use-map-store";
import { useModalStore } from "@/store/use-modal-store";
import SideUnitCard from "./side-unit-card";
import { useRouter } from "next/navigation";

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
  } = useMapStore();

  // const handleUnitClick = (unit: any) => {
  //   selectUnit(unit); // 선택된 유닛 상태 설정
  //   setMapCenterAndZoom([unit.longitude, unit.latitude], 17); // 맵 이동 및 줌 인
  //   showPopup(unit); // 팝업 띄우기
  //   toggleSidebar(true); // 사이드바 열기/닫기
  // };

  const handleUnitClick = (unitId: number) => {
    router.push("/unit/" + unitId);
  };

  return (
    <div
      className={` ${isSidebarOpen ? "block" : "hidden"} `}
    >
      <button onClick={() => openModal("filter")}> 필터 </button>
      <button onClick={() => toggleSidebar(!isSidebarOpen)}>
        {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      </button>
      <div className="">
        <div className="grid grid-cols-2 gap-6 px-6 ">
          {visibleUnits.map((card: any, index: number) => (
            <SideUnitCard
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
      </div>
    </div>
  );
};

export default MapSideBar;
