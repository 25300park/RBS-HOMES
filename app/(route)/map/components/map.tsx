"use client";

import React, { useEffect, useRef } from "react";
import { loadGoogleMapsAPI } from "@/lib/google";
import {
  MarkerClusterer,
  SuperClusterAlgorithm,
} from "@googlemaps/markerclusterer";
import { useMapStore } from "@/store/use-map-store";
import { useDebouncedCallback } from "use-debounce";

// 유닛 타입 정의
interface Unit {
  latitude: number;
  longitude: number;
  title: string;
  price: number;
  [key: string]: any;
}

// SVG 생성 함수
const generateClusterSVG = (count: number, size: number) => {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#fb923c" />
      <text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="white" font-size="16" font-weight="bold">
        ${count}
      </text>
    </svg>
  `;
};

const generateMarkerSVG = () => {
  return `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#fb923c" />
      <text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="white" font-size="16" font-weight="bold">
        1
      </text>
    </svg>
  `;
};

interface MapProps {
  units: Unit[];
}

export default function Map({ units }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { setVisibleUnits, setLoading, setVisibleUnitCount, isSidebarOpen } =
    useMapStore();

  // 디바운스된 유닛 업데이트 함수 (500ms 디바운스 적용)
  const debouncedUpdate = useDebouncedCallback(
    async (map: google.maps.Map, units: Unit[]) => {
      setLoading(true); // 로딩 시작
      const mapBounds = map.getBounds();
      if (mapBounds) {
        const visibleUnits = units.filter((unit) =>
          mapBounds.contains(
            new google.maps.LatLng(unit.latitude, unit.longitude)
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms 지연 (로딩 상태 유지)
        setVisibleUnits(visibleUnits);
        setVisibleUnitCount(visibleUnits.length);
      }
      setLoading(false); // 로딩 종료
    },
    500
  );

  useEffect(() => {
    loadGoogleMapsAPI().then((google) => {
      const bounds = new google.maps.LatLngBounds(
        { lat: 4.215, lng: 114.57 },
        { lat: 21.18, lng: 127.59 }
      );

      const map = new google.maps.Map(mapRef.current as HTMLDivElement, {
        center: { lat: 14.5377, lng: 121.0563 },
        zoom: 13,
        minZoom: 5,
        maxZoom: 20,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        zoomControl: true,
        restriction: {
          latLngBounds: bounds,
          strictBounds: true,
        },
      });

      const markers = units.map((unit) => {
        const markerSVG = generateMarkerSVG();
        const marker = new google.maps.Marker({
          position: { lat: unit.latitude, lng: unit.longitude },
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              markerSVG
            )}`,
            scaledSize: new google.maps.Size(40, 40),
          },
        });

        marker.addListener("click", () => {
          setLoading(true);
          setTimeout(() => {
            setVisibleUnits([unit]);
            setLoading(false);
          }, 500); // 500ms 지연 (로딩 상태 유지)
        });

        return marker;
      });

      const markerClusterer = new MarkerClusterer({
        markers,
        map,
        algorithm: new SuperClusterAlgorithm({ maxZoom: 20, radius: 500 }),
        renderer: {
          render: ({ count, position }) => {
            const size = Math.min(80, 40 + count * 0.5);
            const clusterSVG = generateClusterSVG(count, size);
            return new google.maps.Marker({
              position,
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                  clusterSVG
                )}`,
                scaledSize: new google.maps.Size(size, size),
              },
            });
          },
        },
        onClusterClick: (_, cluster) => {
          const clusteredMarkers = cluster.markers as any;
          const clusteredUnits = clusteredMarkers.map((marker: any) => {
            return units.find(
              (unit) =>
                unit.latitude === marker.getPosition()?.lat() &&
                unit.longitude === marker.getPosition()?.lng()
            );
          });

          setLoading(true);
          setTimeout(() => {
            setVisibleUnits(
              clusteredUnits.filter((unit: any): unit is Unit => !!unit)
            );
            setLoading(false);
          }, 500); // 500ms 지연 (로딩 상태 유지)
        },
      });

      google.maps.event.addListener(map, "idle", () => {
        debouncedUpdate(map, units);
      });
    });
  }, [units, setVisibleUnits, debouncedUpdate, setLoading]);

  return (
    <div
      className={`relative ${
        isSidebarOpen ? "w-[calc(100%-400px)]" : "w-full"
      } h-[calc(100vh-5rem)]`}
    >
      <div ref={mapRef} className="absolute w-full h-full" />
    </div>
  );
}
