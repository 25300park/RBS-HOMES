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
        title: unit.title,
        id: unit.id,
        address1: unit.address1,
        address2: unit.address2,
        address3: unit.address3,
        address4: unit.address4,
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
    clusterMaxZoom: 20, // 클러스터가 해제되지 않도록 높은 줌 설정
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

  // 클러스터 클릭 시 해당 클러스터의 매물 목록을 사이드바에 표시
  map.on("click", "clusters", async (e) => {
    console.log("clusters clicked", e)
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
  
    if (features.length) {
      const clusterId = features[0].properties.cluster_id; // 클러스터 ID 가져오기
      const source = map.getSource("units");
  
      // 클러스터 안의 개별 매물 정보 가져오기
      source.getClusterLeaves(clusterId, 1000, 0, (err, leaves) => {
        if (err) return;
  
        // 클러스터 내의 개별 매물 정보를 visibleUnits로 저장
        const { setVisibleUnits } = useMapStore.getState();
        const unitsInCluster = leaves.map(leaf => leaf.properties); // 클러스터 안의 매물들
  
        // 클러스터 안의 매물들을 visibleUnits에 업데이트
        setVisibleUnits(unitsInCluster);
      });
    }
  });
  

  // 마우스 포인터를 클러스터 위에 올릴 때 포인터 모양 변경
  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });
}
