import { create } from "zustand";
import * as maptilersdk from "@maptiler/sdk";

interface MapState {
  visibleUnits: any[];
  visibleUnitCount: number;
  selectedUnit: any | null;
  isSidebarOpen: boolean;
  map: any | null;
  popup: any | null;
  isLoading: boolean; // 로딩 상태 추가
  hoverUnitId?: number | null;

  setVisibleUnitCount: (count: number) => void;
  setVisibleUnits: (units: any[]) => void;
  selectUnit: (unit: any) => void;
  toggleSidebar: (isOpen: boolean) => void;
  setMapCenterAndZoom: (coordinates: [number, number], zoom: number) => void;
  setMapInstance: (mapInstance: any) => void;
  clearSelectedUnit: () => void;
  showPopup: (unit: any) => void;
  clearPopup: () => void;
  setLoading: (loading: boolean) => void; // 로딩 상태 변경 함수
  setHoverUnitId: (unitId: number | null) => void; // 로딩 상태 변경 함수
}

export const useMapStore = create<MapState>((set) => ({
  visibleUnits: [],
  visibleUnitCount: 0,
  selectedUnit: null,
  isSidebarOpen: true,
  map: null,
  popup: null,
  isLoading: false, // 초기값 false
  hoverUnitId: null,

  setVisibleUnits: (units) => {
    set({ visibleUnits: units });
  },
  setVisibleUnitCount: (count) => set({ visibleUnitCount: count }),
  selectUnit: (unit) => set({ selectedUnit: unit }),
  toggleSidebar: (isOpen) => set({ isSidebarOpen: isOpen }),
  setMapInstance: (mapInstance) => set({ map: mapInstance }),
  clearSelectedUnit: () => set({ selectedUnit: null }),
  setMapCenterAndZoom: (coordinates, zoom) =>
    set((state) => {
      if (state.map) {
        state.map.easeTo({ center: coordinates, zoom });
      }
      return state;
    }),
  setHoverUnitId: (unitId) => set({ hoverUnitId: unitId }),
  // 팝업 띄우기
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
            <img src="${unit.images[0]}" alt="${
              unit.title
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
              <div style="font-size: 14px; color: #333; font-weight: bold; margin-bottom: 5px;">${unit.price.toLocaleString()} $</div>
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

  setLoading: (loading: boolean) => set({ isLoading: loading }), // 로딩 상태 변경 함수
}));
