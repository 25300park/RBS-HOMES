"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMapsAPI } from "@/lib/google"; // 기존 함수 재사용
import { useMediaQuery } from "@/hooks/use-media-query";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ latitude, longitude }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // 지도 초기화
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        // 기존 loadGoogleMapsAPI 함수 사용
        const google = await loadGoogleMapsAPI();
        
        // 지도 옵션
        const mapOptions: google.maps.MapOptions = {
          center: { lat: latitude, lng: longitude },
          zoom: isMobile ? 16 : 17, // 더 가까이 줌인 (디테일 페이지용)
          minZoom: 12, // 최소 줌 레벨 제한 (너무 멀리 줌아웃 방지)
          maxZoom: 20, // 최대 줌 레벨
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: !isMobile,
          gestureHandling: 'cooperative', // Ctrl + 스크롤 필요
          disableDefaultUI: false,
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#000000" }, { weight: 1 }]
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#c9c9c9" }]
            },
            {
              featureType: "landscape",
              elementType: "geometry.fill",
              stylers: [{ color: "#f5f5f5" }]
            },
            {
              featureType: "road",
              elementType: "geometry.fill",
              stylers: [{ color: "#ffffff" }]
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#e5e5e5" }]
            },
            {
              featureType: "all",
              elementType: "labels.text",
              stylers: [{ weight: 0.9 }]
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#303030" }]
            }
          ]
        };

        // 지도 생성
        mapInstance.current = new google.maps.Map(mapRef.current, mapOptions);

        // 마커 생성
        markerInstance.current = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstance.current,
          title: "Location",
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ff0000"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
          }
        });

        // 정보창 생성
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: Arial, sans-serif;">
              <strong>Location</strong><br>
              <span style="color: #666;">Lat: ${latitude.toFixed(6)}</span><br>
              <span style="color: #666;">Lng: ${longitude.toFixed(6)}</span>
            </div>
          `
        });

        // 마커 클릭 이벤트
        markerInstance.current.addListener("click", () => {
          infoWindow.open(mapInstance.current!, markerInstance.current!);
        });

        setIsLoaded(true);

      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to initialize map");
      }
    };

    initializeMap();
  }, [latitude, longitude, isMobile]);

  // 좌표 업데이트 시 지도 중심과 마커 위치 변경
  useEffect(() => {
    if (!mapInstance.current || !markerInstance.current || !isLoaded) return;

    const newPosition = { lat: latitude, lng: longitude };
    
    // 지도 중심 이동
    mapInstance.current.setCenter(newPosition);
    
    // 마커 위치 변경
    markerInstance.current.setPosition(newPosition);

    // 정보창 내용 업데이트
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; font-family: Arial, sans-serif;">
          <strong>Location</strong><br>
          <span style="color: #666;">Lat: ${latitude.toFixed(6)}</span><br>
          <span style="color: #666;">Lng: ${longitude.toFixed(6)}</span>
        </div>
      `
    });

    // 기존 리스너 제거 후 새로 추가
    google.maps.event.clearListeners(markerInstance.current, 'click');
    markerInstance.current.addListener("click", () => {
      infoWindow.open(mapInstance.current!, markerInstance.current!);
    });
  }, [latitude, longitude, isLoaded]);

  if (error) {
    return (
      <div className="py-12 space-y-6 border-t md:py-6 md:mx-6">
        <h3 className="text-xl font-medium text-gray-800">Location</h3>
        <div className={`relative w-full bg-gray-100 flex items-center justify-center ${
          isMobile ? 'aspect-[2/1]' : 'aspect-[4/1]'
        }`}>
          <div className="text-center text-gray-500">
            <p className="text-sm">Failed to load map</p>
            <p className="text-xs mt-1">Please check your internet connection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 space-y-6 border-t md:py-6 md:mx-6">
      <h3 className="text-xl font-medium text-gray-800">Location</h3>
      <div className={`relative w-full overflow-hidden shadow-lg rounded-lg ${
        isMobile ? 'aspect-[2/1]' : 'aspect-[4/1]'
      }`}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-2"></div>
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        )}
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '200px' }}
        />
        {isLoaded && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
            Hold Ctrl + scroll to zoom
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;