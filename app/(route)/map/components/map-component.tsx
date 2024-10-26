"use client";

import React, { useRef, useEffect, useState } from "react";
import { loadGoogleMapsAPI } from "@/lib/google";
import { MarkerManager } from "./marker-manager"; // MarkerManager 컴포넌트
import { useMapStore } from "@/store/use-map-store";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import FilterButton from "@/components/ui/filter-btn";

interface MapProps {
  units: any[];
  type?: "rent" | "sale";
  owner? : boolean;
}

export const MapComponent = ({ units, type,owner }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null); // 검색 인풋 Ref
  const { setLoading, isSidebarOpen } = useMapStore();
  const [map, setMap] = useState<google.maps.Map | null>(null); // map 상태 관리

  useEffect(() => {
    loadGoogleMapsAPI().then((google) => {
      const bounds = new google.maps.LatLngBounds(
        { lat: 4.215, lng: 114.57 }, // 필리핀 경계
        { lat: 21.18, lng: 127.59 } // 필리핀 경계
      );

      const mapStyle = [
        {
          featureType: "poi.business", // 상가 정보 삭제
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit", // 교통 정보 삭제
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi", // 모든 POI
          elementType: "labels", // 레이블을 숨김
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.business", // 상가 정보 숨김
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.school", // 학교 정보 숨김
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "poi.government", // 정부 관련 POI 숨김
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.place_of_worship", // 종교 관련 POI 숨김
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.park", // 공원 정보만 표시
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "transit", // 교통 정보 숨김
          stylers: [{ visibility: "off" }],
        },
      ];

      const initializedMap = new google.maps.Map(
        mapRef.current as HTMLDivElement,
        {
          center: { lat: 14.5877, lng: 121.0563 },
          zoom: 13,
          minZoom: 5,
          maxZoom: 20,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          zoomControl: true,
          styles: mapStyle,
          restriction: {
            latLngBounds: bounds,
            strictBounds: true,
          },
        }
      );

      setMap(initializedMap); // 맵 객체를 상태에 저장
      setLoading(false); // 맵 로드 완료 후 로딩 상태 종료
    });
  }, [setLoading]);

  useEffect(() => {
    if (map && autocompleteRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        autocompleteRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "ph" }, // 필리핀 내 지역 제한
        }
      );

      // 선택된 장소로 지도 중심 이동
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          map.setCenter(place.geometry.location); // 지도 중심을 선택된 장소로 이동
        }
      });
    }
  }, [map]);
  return (
    <div
      className={`relative w-full ${
        isSidebarOpen ? "w-[calc(100%-400px)]" : "w-full"
      } h-[calc(100vh-10rem)]`}
    >
      <div className="absolute top-8 left-6 z-10 p-4 bg-white shadow-md border md:hidden">
        <div className="flex items-center mb-2">
          {/* 검색 인풋 필드 */}
          <Input
            ref={autocompleteRef}
            type="text"
            placeholder="Search area in the Philippines"
            className="h-8 w-72 px-3 py-5  rounded-none rounded-l-sm  focus:outline-none focus-visible:ring-0"
          />
          <button className="bg-orange-400 h-8 px-5 py-5 border border-orange-400 rounded-r-sm flex items-center justify-center">
            <FaSearch className="text-white" />
          </button>
        </div>
        <div className="flex gap-2 ">
          <FilterButton sellType={type} isActive withSellType={owner}/>
        </div>
      </div>

      <div
        ref={mapRef}
        className="absolute w-full h-full"
        style={{ outline: "none" }} // 파란색 테두리 제거
        tabIndex={-1} // 구글맵 클릭 시 파란색 테두리 제거를 위한 설정
      />
      {/* map이 초기화 된 후에 MarkerManager를 렌더링 */}
      {map && <MarkerManager map={map} units={units} />}
    </div>
  );
};
