import { create } from 'zustand';
import * as maptilersdk from "@maptiler/sdk";

interface MapState {
  visibleUnits: any[];
  selectedUnit: any | null;
  isSidebarOpen: boolean;
  map: any | null;
  popup: any | null;

  setVisibleUnits: (units: any[]) => void;
  selectUnit: (unit: any) => void;
  toggleSidebar: (isOpen: boolean) => void;
  setMapCenterAndZoom: (coordinates: [number, number], zoom: number) => void;
  setMapInstance: (mapInstance: any) => void;
  clearSelectedUnit: () => void; // 선택 해제
  showPopup: (unit: any) => void; // 팝업 띄우기
  clearPopup: () => void;         // 팝업 제거
}

export const useMapStore = create<MapState>((set) => ({
  visibleUnits: [],
  selectedUnit: null,
  isSidebarOpen: true,
  map: null,  // Map 인스턴스 저장
  popup: null, // 팝업 상태 저장

  setVisibleUnits: (units) => set({ visibleUnits: units }),
  selectUnit: (unit) => set({ selectedUnit: unit }),
  toggleSidebar: (isOpen) => set({ isSidebarOpen: isOpen }),
  setMapInstance: (mapInstance) => set({ map: mapInstance }),
  clearSelectedUnit: () => set({ selectedUnit: null }), // 선택 해제
  setMapCenterAndZoom: (coordinates, zoom) =>
    set((state) => {
      if (state.map) {
        state.map.easeTo({ center: coordinates, zoom });
      }
      return state;
    }),

  // 팝업 띄우기
showPopup: (unit) => set((state) => {
  if (state.map && unit) {
    if (state.popup) state.popup.remove(); // 기존 팝업 제거
    
    const popup = new maptilersdk.Popup({
      offset: 25, // 팝업의 오프셋을 추가
      closeButton: false, // 닫기 버튼 제거
      closeOnClick: false, // 팝업 외부 클릭 시 팝업 닫기 설정을 비활성화
    })
      .setLngLat([unit.longitude, unit.latitude])
      .setHTML(`
        <div>
          <img src="${unit.images[0]}" alt="${unit.title}" style="width: 100%; min-width: 400px; height: 150px; object-fit: cover;" />
          <div style="padding: 10px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${unit.address2,+" "+unit.address3 +" "+ unit.address4 + " " + unit.address1}</h3>
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">
              ${unit.description ? unit.description : 'no memo'}
            </div>
            <div style="font-size: 14px; color: #333; font-weight: bold; margin-bottom: 5px;">
              ${unit.priceRent.toLocaleString()} $
            </div>
          </div>
        </div>
      `)
      .addTo(state.map);

    return { popup };
  }
  return {};
}),


  // 팝업 제거
  clearPopup: () => set((state) => {
    if (state.popup) {
      state.popup.remove();
    }
    return { popup: null };
  }),
}));
