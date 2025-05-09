import { create } from "zustand";
import * as maptilersdk from "@maptiler/sdk";

type SheetPosition = 'minimized' | 'half' | 'full';

interface MapState {
  visibleUnits: any[];
  visibleUnitCount: number;
  selectedUnit: any | null;
  isSidebarOpen: boolean;
  map: any | null;
  popup: any | null;
  isLoading: boolean;
  hoverUnitId?: number | null;
  sheetPosition: SheetPosition;
  
  // 맵 위치 저장을 위한 새로운 상태 추가
  mapCenter: { lat: number; lng: number } | null;
  mapZoom: number | null;
  
  // 기존 액션
  setSheetPosition: (position: SheetPosition) => void;
  setVisibleUnitCount: (count: number) => void;
  setVisibleUnits: (units: any[]) => void;
  selectUnit: (unit: any) => void;
  toggleSidebar: (isOpen: boolean) => void;
  setMapCenterAndZoom: (coordinates: [number, number], zoom: number) => void;
  setMapInstance: (mapInstance: any) => void;
  clearSelectedUnit: () => void;
  showPopup: (unit: any) => void;
  clearPopup: () => void;
  setLoading: (loading: boolean) => void;
  setHoverUnitId: (unitId: number | null) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  visibleUnits: [],
  visibleUnitCount: 0,
  selectedUnit: null,
  isSidebarOpen: true,
  map: null,
  popup: null,
  isLoading: false,
  hoverUnitId: null,
  sheetPosition: 'half',
  
  // 맵 위치 저장을 위한 새로운 상태 초기값 추가
  mapCenter: null,
  mapZoom: null,

  // 액션
  setSheetPosition: (position) => set({ sheetPosition: position }),
  setVisibleUnits: (units) => {
    set({ visibleUnits: units });
  },
  setVisibleUnitCount: (count) => set({ visibleUnitCount: count }),
  selectUnit: (unit) => set({ selectedUnit: unit }),
  toggleSidebar: (isOpen) => set({ isSidebarOpen: isOpen }),
  setMapInstance: (mapInstance) => set({ map: mapInstance }),
  clearSelectedUnit: () => set({ selectedUnit: null }),
  
  // setMapCenterAndZoom 함수 수정 - mapCenter와 mapZoom 업데이트 추가
  setMapCenterAndZoom: (coordinates, zoom) =>
    set((state) => {
      if (state.map) {
        state.map.easeTo({ center: coordinates, zoom });
        // mapCenter와 mapZoom도 업데이트 (스토어에만 저장, 로컬 스토리지는 아님)
        return {
          mapCenter: { lng: coordinates[0], lat: coordinates[1] },
          mapZoom: zoom
        };
      }
      return state;
    }),
    
  setHoverUnitId: (unitId) => set({ hoverUnitId: unitId }),
  showPopup: (unit) =>
    set((state) => {
      if (state.map && unit) {
        if (state.popup) state.popup.remove();
        const popup = new maptilersdk.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
        })
          .setLngLat([unit.longitude, unit.latitude])
          .setHTML(
            `
          <div>
            <img src="${unit.images && unit.images[0] ? unit.images[0] : '/images/placeholder.jpg'}" alt="${
              unit.title || "Property"
            }" style="width: 100%; min-width: 400px; height: 150px; object-fit: cover;" />
            <div style="padding: 10px;">
              <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${
                unit.address2 +
                " " +
                unit.address3 +
                " " +
                unit.address4 +
                " " +
                unit.address1
              }</h3>
              <div style="font-size: 14px; color: #666; margin-bottom: 5px;">${
                unit.description ? unit.description : "no memo"
              }</div>
              <div style="font-size: 14px; color: #333; font-weight: bold; margin-bottom: 5px;">${unit.price ? unit.price.toLocaleString() : "0"} $</div>
            </div>
          </div>
        `
          )
          .addTo(state.map);

        return { popup };
      }
      return {};
    }),

  clearPopup: () =>
    set((state) => {
      if (state.popup) {
        state.popup.remove();
      }
      return { popup: null };
    }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));