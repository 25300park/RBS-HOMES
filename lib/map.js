import * as maptilersdk from "@maptiler/sdk";
import { useMapStore } from "@/store/use-map-store";

export function addMarkersAndClusters(map, units) {
  const geojson = {
    type: "FeatureCollection",
    features: units.map((unit) => ({
      type: "Feature",
      properties: {
        ...unit,
      },
      geometry: {
        type: "Point",
        coordinates: [unit.longitude, unit.latitude],
      },
    })),
  };

  map.addSource("units", {
    type: "geojson",
    data: geojson,
    cluster: true,
    clusterMaxZoom: 17,
    clusterRadius: 70,
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "units",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#FF5733",
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "units",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 16,
    },
    paint: {
      "text-color": "#FFFFFF",
    },
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "units",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 10,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });
  // map.addLayer({
  //   id: "unclustered-point",
  //   type: "symbol",
  //   source: "units",
  //   filter: ["!", ["has", "point_count"]],
  //   layout: {
  //     "text-field": ["concat", "₩", ["to-string", ["get", "priceRent"]]], // 텍스트 표시
  //     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
  //     "text-size": 14,
  //     "text-offset": [0, 1.5], // 마커 위에 텍스트 표시
  //     "text-anchor": "top",
  //     "text-padding": 10, // 텍스트 주변의 여백
  //   },
  //   paint: {
  //     "text-color": "#000000", // 텍스트 색상
  //     "text-halo-color": "#FFFFFF", // 텍스트 테두리
  //     "text-halo-width": 1, // 테두리 두께
  //     "text-opacity": 1, // 텍스트 불투명도
  //     "text-halo-blur": 1, // 테두리 흐림 효과
  
  //     // 배경 둥글게 만들기 위한 효과
  //     "text-translate": [0, -10], // 텍스트를 약간 위로 올림
  //     "text-halo-color": "#FFFFFF", // 흰색 배경
  //     "text-halo-width": 5, // 배경 두께
  //   },
  // });
  
  // map.on("mouseenter", "unclustered-point", () => {
  //   map.getCanvas().style.cursor = "pointer"; // 커서를 포인터로 변경
  //   map.setPaintProperty("unclustered-point", "text-halo-color", "#000000"); // 호버 시 배경색 변경
  //   map.setPaintProperty("unclustered-point", "text-halo-width", 7); // 호버 시 배경 두께 증가
  // });
  
  // map.on("mouseleave", "unclustered-point", () => {
  //   map.getCanvas().style.cursor = ""; // 커서를 기본으로 돌림
  //   map.setPaintProperty("unclustered-point", "text-halo-color", "#FFFFFF"); // 배경색 복구
  //   map.setPaintProperty("unclustered-point", "text-halo-width", 5); // 배경 두께 복구
  // });
  

  // 마커 클릭 시 팝업 띄우기 및 사이드바 선택 상태 업데이트
  map.on("click", "unclustered-point", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const unit = e.features[0].properties;

    const { showPopup, selectUnit, toggleSidebar } = useMapStore.getState(); // 스토어에서 팝업과 선택 상태 관리
    selectUnit(unit); // 선택된 유닛 상태 업데이트
    showPopup(unit); // 팝업 띄우기
    toggleSidebar(true)
  });

  map.on("click", "clusters", async (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    if (features.length) {
      const clusterId = features[0].properties.cluster_id;
      const zoom = await map
        .getSource("units")
        .getClusterExpansionZoom(clusterId);
      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom,
      });
    }
  });

  // 바깥을 클릭할 때 선택된 마커 해제
  map.on("click", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["unclustered-point"],
    });

    if (!features.length) {
      const { clearSelectedUnit, clearPopup } = useMapStore.getState(); // 팝업 제거 및 선택 해제
      clearPopup(); // 팝업 제거
      clearSelectedUnit(); // 선택 해제
    }
  });

  // 마우스 포인터를 클러스터나 마커 위에 올릴 때 포인터 모양 변경
  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });
}
