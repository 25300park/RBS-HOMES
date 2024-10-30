import React, { useEffect, useRef, useCallback } from "react";
import {
  SuperClusterAlgorithm,
  MarkerClusterer,
} from "@googlemaps/markerclusterer";
import { useMapStore } from "@/store/use-map-store";
import { generateMarkerSVG, generateClusterSVG } from "@/lib/svg-gen";

interface MarkerManagerProps {
  map: google.maps.Map;
  units: any[];
}

interface Unit {
  latitude: number;
  longitude: number;
  title: string;
  price: number;
  id: number;
  [key: string]: any;
}

interface ExtendedMarker extends google.maps.Marker {
  unitData?: Unit;
}

export const MarkerManager = React.memo(({ map, units }: MarkerManagerProps) => {
  const {
    setVisibleUnits,
    setLoading,
    setVisibleUnitCount,
    toggleSidebar,
    hoverUnitId,
  } = useMapStore();

  const activeMarkerRef = useRef<ExtendedMarker | null>(null);
  const activeClusterRef = useRef<{
    marker: google.maps.Marker | null;
    size: number;
    count: number;
  } | null>(null);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  const markerMap = useRef<Map<number, ExtendedMarker>>(new Map());
  const clusterMap = useRef<Map<string, any>>(new Map());
  const idleListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  const deactivateCurrent = useCallback(() => {
    if (activeMarkerRef.current) {
      activeMarkerRef.current.setIcon({
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          generateMarkerSVG(false)
        )}`,
        scaledSize: new google.maps.Size(40, 40),
      });
      activeMarkerRef.current = null;
    }

    if (activeClusterRef.current) {
      const { marker, size, count } = activeClusterRef.current;
      if (marker) {
        marker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateClusterSVG(count, size, false)
          )}`,
          scaledSize: new google.maps.Size(size, size),
        });
      }
      activeClusterRef.current = null;
    }
  }, []);

  const handleMarkerClick = useCallback((marker: ExtendedMarker, unit: Unit) => {
    deactivateCurrent();
    activeMarkerRef.current = marker;
    toggleSidebar(true);
    marker.setIcon({
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        generateMarkerSVG(true)
      )}`,
      scaledSize: new google.maps.Size(40, 40),
    });
    setVisibleUnits([unit]);
    setLoading(false);
  }, [deactivateCurrent, setVisibleUnits, setLoading, toggleSidebar]);

  const createMarker = useCallback((unit: Unit): ExtendedMarker => {
    const lat = parseFloat(unit.latitude.toString());
    const lng = parseFloat(unit.longitude.toString());

    const marker = new google.maps.Marker({
      position: { lat, lng },
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          generateMarkerSVG(false)
        )}`,
        scaledSize: new google.maps.Size(40, 40),
      },
    }) as ExtendedMarker;

    marker.unitData = unit;
    markerMap.current.set(unit.id, marker);

    marker.addListener("click", () => handleMarkerClick(marker, unit));

    marker.addListener("mouseover", () => {
      if (marker !== activeMarkerRef.current) {
        marker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateMarkerSVG(true)
          )}`,
          scaledSize: new google.maps.Size(40, 40),
        });
      }
    });

    marker.addListener("mouseout", () => {
      if (marker !== activeMarkerRef.current) {
        marker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateMarkerSVG(false)
          )}`,
          scaledSize: new google.maps.Size(40, 40),
        });
      }
    });

    return marker;
  }, [handleMarkerClick]);

  const updateVisibleUnits = useCallback(() => {
    const currentBounds = map.getBounds();
    if (!currentBounds) return;

    const newVisibleUnits = units.filter((unit) =>
      currentBounds.contains(
        new google.maps.LatLng(unit.latitude, unit.longitude)
      )
    );
    setVisibleUnits(newVisibleUnits);
    setVisibleUnitCount(newVisibleUnits.length);
  }, [map, units, setVisibleUnits, setVisibleUnitCount]);

  // 마커 생성 및 클러스터링 설정
  useEffect(() => {
    if (!map || !units.length) return;

    // 기존 리소스 정리
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
    }
    if (idleListenerRef.current) {
      google.maps.event.removeListener(idleListenerRef.current);
    }
    markerMap.current.clear();
    clusterMap.current.clear();

    // 새로운 마커 생성
    const markers = units.map(createMarker);

    markerClustererRef.current = new MarkerClusterer({
      markers,
      map,
      algorithm: new SuperClusterAlgorithm({ maxZoom: 20, radius: 350 }),
      renderer: {
        render: ({ count, position, markers }) => {
          const uniqueUnits = new Set(
            markers?.map((marker: any) => marker.unitData?.id).filter(Boolean)
          );
          const actualCount = uniqueUnits.size;
          const size = Math.min(80, 40 + actualCount * 0.5);
          
          const clusterMarker = new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                generateClusterSVG(actualCount, size, false)
              )}`,
              scaledSize: new google.maps.Size(size, size),
            },
          });

          const clusterId = position.toString();
          clusterMap.current.set(clusterId, {
            clusterMarker,
            markers,
            actualCount,
          });

          clusterMarker.addListener("click", () => {
            toggleSidebar(true);
            const clusteredMarkers = markers as ExtendedMarker[];
            const uniqueUnits = new Map<number, Unit>();
            
            clusteredMarkers.forEach((marker) => {
              if (marker.unitData) {
                uniqueUnits.set(marker.unitData.id, marker.unitData);
              }
            });

            setLoading(true);
            const visibleUnits = Array.from(uniqueUnits.values());
            setVisibleUnits(visibleUnits);
            setLoading(false);
          });

          return clusterMarker;
        },
      },
    });

    // Idle 이벤트 리스너 설정
    idleListenerRef.current = google.maps.event.addListener(map, "idle", updateVisibleUnits);

    // 초기 visible units 설정
    updateVisibleUnits();

    return () => {
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
        markerClustererRef.current = null;
      }
      if (idleListenerRef.current) {
        google.maps.event.removeListener(idleListenerRef.current);
      }
      markerMap.current.clear();
      clusterMap.current.clear();
    };
  }, [map, units, createMarker, updateVisibleUnits, setLoading, setVisibleUnits, toggleSidebar]);

  // 호버 효과 처리
  useEffect(() => {
    if (!hoverUnitId) return;

    // 마커 호버 효과
    const marker = markerMap.current.get(hoverUnitId);
    if (marker && marker !== activeMarkerRef.current) {
      marker.setIcon({
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          generateMarkerSVG(true)
        )}`,
        scaledSize: new google.maps.Size(40, 40),
      });
    }

    // 다른 마커들 리셋
    markerMap.current.forEach((m, id) => {
      if (id !== hoverUnitId && m !== activeMarkerRef.current) {
        m.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateMarkerSVG(false)
          )}`,
          scaledSize: new google.maps.Size(40, 40),
        });
      }
    });

  }, [hoverUnitId]);

  return null;
});

MarkerManager.displayName = "MarkerManager";