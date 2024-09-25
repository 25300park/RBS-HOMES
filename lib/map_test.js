import { useMapStore } from '@/store/use-map-store';

// 부동산 프로젝트에 맞춘 클러스터링과 마커 추가 함수
export function addMarkersAndClusters(map, units) {
  const geojson = {
    type: "FeatureCollection",
    features: units.map((unit) => ({
      type: "Feature",
      properties: {
        price: unit.price, // 매물 가격
        bedrooms: unit.bedrooms, // 방 개수
        bathrooms: unit.bathrooms, // 욕실 개수
        ...unit,
      },
      geometry: {
        type: "Point",
        coordinates: [unit.longitude, unit.latitude],
      },
    })),
  };

  // 부동산 매물 데이터를 소스로 추가
  map.addSource("units", {
    type: "geojson",
    data: geojson,
    cluster: true,
    clusterMaxZoom: 20, // 클러스터가 해제되는 줌 레벨
    clusterRadius: 80,  // 클러스터 반경 (부동산 프로젝트에 맞게 조정)
  });

  // 클러스터 레이어 추가 (매물 수에 따라 색상 변경)
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "units",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#FF5733",  // 기본 클러스터 색상
        100, "#F5B319", // 매물이 100개 이상일 때 색상
        300, "#E14F1C", // 매물이 300개 이상일 때 색상
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    },
  });

  // 클러스터 내 매물 수 표시
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "units",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 14,
    },
    paint: {
      "text-color": "#FFFFFF",
    },
  });

  // 클러스터 해제된 개별 마커 추가
  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "units",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",  // 개별 마커 색상
      "circle-radius": 10,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  });

  // 개별 마커에 매물 가격 표시
  // map.addLayer({
  //   id: "unclustered-point-price",
  //   type: "symbol",
  //   source: "units",
  //   filter: ["!", ["has", "point_count"]],
  //   layout: {
  //     "text-field": ["concat", "$", ["to-string", ["get", "price"]]],  // 가격 표시
  //     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
  //     "text-size": 12,
  //     "text-offset": [0, 1.5], // 마커 위에 텍스트 표시
  //     "text-anchor": "top",
  //   },
  //   paint: {
  //     "text-color": "#000000",
  //     "text-halo-color": "#FFFFFF",
  //     "text-halo-width": 2,
  //   },
  // });

  // 클러스터 클릭 시 확대
  map.on("click", "clusters", async (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    if (features.length) {
      const clusterId = features[0].properties.cluster_id;
      const zoom = await map.getSource("units").getClusterExpansionZoom(clusterId);
      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom,
      });
    }
  });

  // 개별 마커 클릭 시 팝업 또는 사이드바 열기
  map.on("click", "unclustered-point", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const unit = e.features[0].properties;
    const { showPopup, selectUnit, toggleSidebar } = useMapStore.getState();
    selectUnit(unit); // 선택된 매물 상태 업데이트
    showPopup(unit); // 팝업 띄우기
    toggleSidebar(true); // 사이드바 열기
  });

  // 바깥 클릭 시 선택 해제
  map.on("click", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["unclustered-point"],
    });
    if (!features.length) {
      const { clearSelectedUnit, clearPopup } = useMapStore.getState();
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

  map.on("mouseenter", "unclustered-point", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "unclustered-point", () => {
    map.getCanvas().style.cursor = "";
  });
}


// #fb923c 0, #f5b319 100%);

  // map.addSource('bgc-area', {
  //   'type': 'geojson',
  //   'data': bgcPolygon
  // });

  // map.addLayer({
  //   'id': 'bgc-boundary',
  //   'type': 'fill',
  //   'source': 'bgc-area',
  //   'layout': {},
  //   'paint': {
  //     'fill-color': '#088',
  //     'fill-opacity': 0.5
  //   }
  // });

  // map.addLayer({
  //   'id': 'bgc-boundary-line',
  //   'type': 'line',
  //   'source': 'bgc-area',
  //   'layout': {},
  //   'paint': {
  //     'line-color': '#000',
  //     'line-width': 2
  //   }
  // });
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
  
