"use client";

import React, { useRef, useEffect, useState } from "react";
import { loadGoogleMapsAPI } from "@/lib/google";
import { MarkerManager } from "./marker-manager";
import { useMapStore } from "@/store/use-map-store";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import FilterButton from "@/components/ui/filter-btn";
import { useMediaQuery } from "@/hooks/use-media-query";

interface MapProps {
  units: any[];
  type?: "rent" | "sale";
  owner?: boolean;
}

export const MapComponent = ({ units, type, owner }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCenterRef = useRef<google.maps.LatLng | null>(null);
  const lastZoomRef = useRef<number | null>(null);

  const {
    setLoading,
    isSidebarOpen,
    sheetPosition,
    map: mapInstance,
    setMapInstance,
  } = useMapStore();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const updateMapSize = () => {
    if (!map) return;
  
    const center = map.getCenter();
    const zoom = map.getZoom();
    
    if (center && zoom) {
      lastCenterRef.current = center;
      lastZoomRef.current = zoom;
    }
  
    requestAnimationFrame(() => {
      google.maps.event.trigger(map, 'resize');
      
      if (lastCenterRef.current && lastZoomRef.current) {
        map.setCenter(lastCenterRef.current);
        map.setZoom(lastZoomRef.current);
      }
    });
  };
  
  useEffect(() => {
    if (isMobile && map) {
      const timeoutId = setTimeout(updateMapSize, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [sheetPosition, map, isMobile]);
  
  
  useEffect(() => {
    const handleResize = () => {
      if (map) {
        updateMapSize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [map]);

  // Google Maps 초기화
  useEffect(() => {
    loadGoogleMapsAPI().then((google) => {
      const bounds = new google.maps.LatLngBounds(
        { lat: 4.215, lng: 114.57 },
        { lat: 21.18, lng: 127.59 }
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

      setMap(initializedMap);
      setMapInstance(initializedMap);
      setLoading(false);
    });
  }, [setLoading, setMapInstance]);

  // 컨테이너 스타일 계산
  const containerStyle = React.useMemo(() => {
    if (!isMobile) {
      return `relative w-full ${
        isSidebarOpen ? "w-[calc(100%-400px)]" : "w-full"
      } h-full`;
    }

    switch (sheetPosition) {
      case "full":
        return "relative w-full h-[60px] transition-height duration-300 ease-in-out";
      case "half":
        return "relative w-full h-[calc(100vh-(100vh-55%))] transition-height duration-300 ease-in-out";
      case "minimized":
      default:
        return "relative w-full h-[calc(100vh-60px)] transition-height duration-300 ease-in-out";
    }
  }, [isMobile, isSidebarOpen, sheetPosition]);

  return (
    <div
      className={containerStyle}
      style={{
        transitionProperty: "height",
        willChange: "height",
      }}
    >
      <div className="absolute top-8 left-6 z-10 p-4 bg-white shadow-md border md:hidden">
        <div className="flex items-center mb-2">
          <Input
            ref={autocompleteRef}
            type="text"
            placeholder="Search area in the Philippines"
            className="h-8 w-72 px-3 py-5 rounded-none rounded-l-sm focus:outline-none focus-visible:ring-0"
          />
          <button className="bg-orange-400 h-8 px-5 py-5 border border-orange-400 rounded-r-sm flex items-center justify-center">
            <FaSearch className="text-white" />
          </button>
        </div>
        <div className="flex gap-2">
          <FilterButton sellType={type} isActive withSellType={owner} />
        </div>
      </div>

      <div
        ref={mapRef}
        className="absolute w-full h-full"
        style={{ outline: "none" }}
        tabIndex={-1}
      />
      {map && <MarkerManager map={map} units={units} />}
    </div>
  );
};
