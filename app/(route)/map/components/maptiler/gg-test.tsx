import React, { useEffect, useState } from 'react';
import { SuperClusterAlgorithm, MarkerClusterer } from '@googlemaps/markerclusterer';
import { useMapStore } from '@/store/use-map-store';
import { generateMarkerSVG, generateClusterSVG } from '@/lib/svg-gen';
import { useDebouncedCallback } from "use-debounce";


interface MarkerManagerProps {
  map: google.maps.Map;
  units: any[];
}
interface Unit {
  latitude: number;
  longitude: number;
  title: string;
  price: number;
  [key: string]: any;
}

export const MarkerManager = ({ map, units }: MarkerManagerProps) => {
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
    const markers = units.map((unit) => {
      let isSelected = false;
      const markerSVG = generateMarkerSVG(isSelected);
      const marker = new google.maps.Marker({
        position: { lat: unit.latitude, lng: unit.longitude },
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSVG)}`,
          scaledSize: new google.maps.Size(40, 40),
        },
        
      });
  
      marker.addListener('click', () => {
        setTimeout(() => {
      const markerSVG = generateMarkerSVG(isSelected);
          setVisibleUnits([unit]);
          setLoading(false);
        }, 500);
      });
  
      // 마커 hover 시 스타일 변경
      marker.addListener('mouseover', () => {
        isSelected = true;
        const hoverMarkerSVG = generateMarkerSVG(isSelected);
        marker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(hoverMarkerSVG)}`,
          scaledSize: new google.maps.Size(40, 40),
        });
      });
  
      marker.addListener('mouseout', () => {
        isSelected = false;
        const defaultMarkerSVG = generateMarkerSVG(isSelected);
        marker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultMarkerSVG)}`,
          scaledSize: new google.maps.Size(40, 40),
        });
      });
  
      return marker;
    });
  
    const markerClusterer = new MarkerClusterer({
      markers,
      map,
      algorithm: new SuperClusterAlgorithm({ maxZoom: 20, radius: 500 }),
      renderer: {
        render: ({ count, position }) => {
          let isSelected = false;
          const size = Math.min(80, 40 + count * 0.5);
          const clusterSVG = generateClusterSVG(count, size, isSelected);
  
          const clusterMarker = new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                clusterSVG
              )}`,
              scaledSize: new google.maps.Size(size, size),
            },
          });
  
          // 클러스터 hover 시 스타일 변경
          clusterMarker.addListener('mouseover', () => {
            isSelected = true;
            const hoverClusterSVG = generateClusterSVG(count, size, isSelected);
            clusterMarker.setIcon({
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(hoverClusterSVG)}`,
              scaledSize: new google.maps.Size(size, size),
            });
          });
  
          clusterMarker.addListener('mouseout', () => {
            isSelected = false;
            const defaultClusterSVG = generateClusterSVG(count, size, isSelected);
            clusterMarker.setIcon({
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultClusterSVG)}`,
              scaledSize: new google.maps.Size(size, size),
            });
          });
  
          return clusterMarker;
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
        }, 500);
      },
    });
  
    google.maps.event.addListener(map, 'idle', () => {
      debouncedUpdate(map, units);
    });
  }, [map, units, setVisibleUnits, setLoading, debouncedUpdate]);
  
  return null;
};
