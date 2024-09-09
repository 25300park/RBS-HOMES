'use client'

import { useMapStore } from "@/store/use-map-store";
import { useModalStore } from "@/store/use-modal-store";

export interface MapSideBarProps {}

const MapSideBar = ({}: MapSideBarProps) => {
  const { openModal } = useModalStore()
  const { visibleUnits, selectedUnit, isSidebarOpen, toggleSidebar, selectUnit, setMapCenterAndZoom, showPopup } = useMapStore();

  const handleUnitClick = (unit: any) => {
    selectUnit(unit);  // 선택된 유닛 상태 설정
    setMapCenterAndZoom([unit.longitude, unit.latitude], 17); // 맵 이동 및 줌 인
    showPopup(unit);  // 팝업 띄우기
    toggleSidebar(true); // 사이드바 열기/닫기
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? "block" : "hidden"}`}>
      <button onClick={()=> openModal("filter")}> 필터 </button>
      <button onClick={() => toggleSidebar(!isSidebarOpen)}>
        {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      </button>
      {visibleUnits?.map((unit) => (
        <div
          key={unit.id}
          className={`unit ${unit.id === selectedUnit?.id ? "bg-gray-500" : ""}`}
          onClick={() => handleUnitClick(unit)} // 클릭 시 맵 이동 및 유닛 선택
        >
          <h3>{unit.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default MapSideBar;
