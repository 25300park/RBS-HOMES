import React, { useEffect, useRef } from "react";
import {
  SuperClusterAlgorithm,
  MarkerClusterer,
} from "@googlemaps/markerclusterer";
import { useMapStore } from "@/store/use-map-store";
import { generateMarkerSVG, generateClusterSVG } from "@/lib/svg-gen";
import { useDebouncedCallback } from "use-debounce";
import { useMediaQuery } from "@/hooks/use-media-query";

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

export const MarkerManager = ({ map, units }: MarkerManagerProps) => {
  const {
    setVisibleUnits,
    setLoading,
    setVisibleUnitCount,
    toggleSidebar,
    hoverUnitId,
    sheetPosition
  } = useMapStore();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const activeClusterRef = useRef<{
    marker: google.maps.Marker | null;
    size: number;
    count: number;
  } | null>(null);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  const markerMap = useRef<Map<number, google.maps.Marker>>(new Map());
  const visibleClustersRef = useRef<Map<string, { count: number, position: google.maps.LatLng }>>(new Map());

  const getVisibleBounds = () => {
    const bounds = map.getBounds();
    if (!bounds || !isMobile) return bounds;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    let visibleHeight;
    switch(sheetPosition) {
      case 'full':
        return null
      case 'half':
        visibleHeight = window.innerHeight * 0.45;
        break;
      case 'minimized':
      default:
        visibleHeight = window.innerHeight - 60;
        break;
    }

    const pixelsPerLat = (ne.lat() - sw.lat()) / window.innerHeight;
    const visibleLat = visibleHeight * pixelsPerLat;
    
    return new google.maps.LatLngBounds(
      new google.maps.LatLng(ne.lat() - visibleLat, sw.lng()),
      new google.maps.LatLng(ne.lat(), ne.lng())
    );
  };

  const debouncedUpdate = useDebouncedCallback(
    async (map: google.maps.Map, units: Unit[]) => {
      if (isMobile && sheetPosition === 'full') {
        return;
      }

      setLoading(true);
      const visibleBounds = getVisibleBounds();
      
      if (visibleBounds) {
        let totalCount = 0;
        const visibleUnits = units.filter((unit) => {
          const unitLatLng = new google.maps.LatLng(unit.latitude, unit.longitude);
          if (visibleBounds.contains(unitLatLng)) {
            totalCount++;
            return true;
          }
          return false;
        });

        // 보이는 영역의 클러스터 카운트 추가
        visibleClustersRef.current.forEach(({ count, position }) => {
          if (visibleBounds.contains(position)) {
            totalCount += count - 1; // 클러스터 내의 개별 마커는 이미 카운트되었으므로 -1
          }
        });

        await new Promise((resolve) => setTimeout(resolve, 300));
        setVisibleUnits(visibleUnits);
        setVisibleUnitCount(totalCount);
      }
      setLoading(false);
    },
    300
  );

  const deactivateCurrent = () => {
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
  };

  useEffect(() => {
    const createMarkers = () => {
      return units.map((unit) => {
        const lat = parseFloat(unit.latitude);
        const lng = parseFloat(unit.longitude);
        
        const marker = new google.maps.Marker({
          position: { lat, lng },
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              generateMarkerSVG(false)
            )}`,
            scaledSize: new google.maps.Size(40, 40),
          },
        });

        markerMap.current.set(unit.id, marker);

        marker.addListener("click", () => {
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
        });

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
      });
    };

    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
      visibleClustersRef.current.clear();
    }

    const markers = createMarkers();

    markerClustererRef.current = new MarkerClusterer({
      markers,
      map,
      algorithm: new SuperClusterAlgorithm({ maxZoom: 20, radius: 500 }),
      renderer: {
        render: ({ count, position, markers }) => {
          const size = Math.min(80, 40 + count * 0.5);
          const clusterSVG = generateClusterSVG(count, size, false);

          // 클러스터 정보 저장
          visibleClustersRef.current.set(position.toString(), {
            count,
            position
          });

          const clusterMarker = new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                clusterSVG
              )}`,
              scaledSize: new google.maps.Size(size, size),
            },
          });

          clusterMarker.addListener("click", () => {
            deactivateCurrent();
            activeClusterRef.current = { marker: clusterMarker, size, count };
            toggleSidebar(true);
          
            // 타입 명시적 처리
            const clusteredUnits = (markers as google.maps.Marker[]).map((marker) => {
              const lat = marker.getPosition()?.lat();
              const lng = marker.getPosition()?.lng();
              if (lat === undefined || lng === undefined) return null;
              
              return units.find(
                (unit) => unit.latitude === lat && unit.longitude === lng
              );
            }).filter((unit): unit is Unit => unit !== null);
          
            setLoading(true);
            setTimeout(() => {
              setVisibleUnits(clusteredUnits);
              setLoading(false);
            }, 500);
          
            clusterMarker.setIcon({
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                generateClusterSVG(count, size, true)
              )}`,
              scaledSize: new google.maps.Size(size, size),
            });
          });

          clusterMarker.addListener("mouseover", () => {
            if (activeClusterRef.current?.marker !== clusterMarker) {
              clusterMarker.setIcon({
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                  generateClusterSVG(count, size, true)
                )}`,
                scaledSize: new google.maps.Size(size, size),
              });
            }
          });

          clusterMarker.addListener("mouseout", () => {
            if (activeClusterRef.current?.marker !== clusterMarker) {
              clusterMarker.setIcon({
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                  generateClusterSVG(count, size, false)
                )}`,
                scaledSize: new google.maps.Size(size, size),
              });
            }
          });

          return clusterMarker;
        },
      },
    });

    const initialBounds = getVisibleBounds();
    if (initialBounds) {
      const visibleUnits = units.filter((unit) =>
        initialBounds.contains(
          new google.maps.LatLng(unit.latitude, unit.longitude)
        )
      );
      setVisibleUnits(visibleUnits);
    }

    google.maps.event.addListener(map, "idle", () => {
      debouncedUpdate(map, units);
    });

    return () => {
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
        markerClustererRef.current = null;
      }
      visibleClustersRef.current.clear();
    };
  }, [map, units, setVisibleUnits, setLoading, debouncedUpdate]);

  useEffect(() => {
    markerMap.current.forEach((marker, unitId) => {
      if (unitId === hoverUnitId) {
        marker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateMarkerSVG(true)
          )}`,
          scaledSize: new google.maps.Size(40, 40),
        });
      } else {
        marker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateMarkerSVG(false)
          )}`,
          scaledSize: new google.maps.Size(40, 40),
        });
      }
    });
  }, [hoverUnitId]);

  return null;
};