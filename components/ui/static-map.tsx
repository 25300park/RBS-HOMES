'use client'

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl"; // MapTiler 라이브러리

interface StaticMapProps {
  latitude: number;  // 위도
  longitude: number; // 경도
}

const StaticMap: React.FC<StaticMapProps> = ({ latitude, longitude }) => {
  const mapContainer = useRef(null); // ref로 맵 컨테이너 관리


  useEffect(() => {
    if (!mapContainer.current) return; // mapContainer가 null이면 실행하지 않음

    console.log("Latitude:", latitude, "Longitude:", longitude); // 좌표값 출력

    // 맵 인스턴스 생성
    const map = new maplibregl.Map({
      container: mapContainer.current, // 맵을 표시할 div 참조
      style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
      center: [longitude, latitude], // [경도, 위도]
      zoom: 15,
      interactive: false, // 줌, 드래그 비활성화
      attributionControl: false, // 맵 하단의 저작권 표기 등 제거
    });

    // 맵이 완전히 로드되었을 때 마커 추가
    map.on('load', () => {
      new maplibregl.Marker()
        .setLngLat([longitude, latitude]) // [경도, 위도]
        .addTo(map);
    });

    return () => {
      map.remove(); // 컴포넌트 unmount 시 맵 제거
    };
  }, [longitude, latitude]); // 의존성 배열에 longitude, latitude 추가

  return <div ref={mapContainer} className="w-full h-96 rounded-md shadow-lg" />;
};

export default StaticMap;
