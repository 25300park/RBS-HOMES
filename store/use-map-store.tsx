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
      const popup = new maptilersdk.Popup({ offset: 25 })
        .setLngLat([unit.longitude, unit.latitude])
        .setHTML(`
          <div>
            <img src="${unit.image}" alt="${unit.title}" class="w-full h-32 object-cover mb-2" />
            <h3 class="text-lg font-bold">${unit.title}</h3>
            <p class="text-sm text-gray-500 mb-2">${unit.description}</p>
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
