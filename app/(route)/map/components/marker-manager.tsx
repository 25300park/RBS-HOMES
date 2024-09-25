import React, { useEffect, useRef } from "react";
import {
  SuperClusterAlgorithm,
  MarkerClusterer,
} from "@googlemaps/markerclusterer";
import { useMapStore } from "@/store/use-map-store";
import { generateMarkerSVG, generateClusterSVG } from "@/lib/svg-gen";
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
  const { setVisibleUnits, setLoading, setVisibleUnitCount } = useMapStore();
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const activeClusterRef = useRef<{
    marker: google.maps.Marker | null;
    size: number;
    count: number;
  } | null>(null);

  const debouncedUpdate = useDebouncedCallback(
    async (map: google.maps.Map, units: Unit[]) => {
      setLoading(true);
      const mapBounds = map.getBounds();
      if (mapBounds) {
        const visibleUnits = units.filter((unit) =>
          mapBounds.contains(
            new google.maps.LatLng(unit.latitude, unit.longitude)
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        setVisibleUnits(visibleUnits);
        setVisibleUnitCount(visibleUnits.length);
      }
      setLoading(false);
    },
    500
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
    const markers = units.map((unit) => {
      const marker = new google.maps.Marker({
        position: { lat: unit.latitude, lng: unit.longitude },
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateMarkerSVG(false)
          )}`,
          scaledSize: new google.maps.Size(40, 40),
        },
      });

      marker.addListener("click", () => {
        deactivateCurrent(); // 기존 마커 및 클러스터 비활성화
        activeMarkerRef.current = marker;

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

    const markerClusterer = new MarkerClusterer({
      markers,
      map,
      algorithm: new SuperClusterAlgorithm({ maxZoom: 20, radius: 500 }),
      renderer: {
        render: ({ count, position }) => {
          const size = Math.min(80, 40 + count * 0.5);
          const clusterSVG = generateClusterSVG(count, size, false);

          const clusterMarker = new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                clusterSVG
              )}`,
              scaledSize: new google.maps.Size(size, size),
            },
          });

          // 클러스터 클릭 시 활성화
          clusterMarker.addListener("click", () => {
            deactivateCurrent(); // 기존 마커 및 클러스터 비활성화
            activeClusterRef.current = { marker: clusterMarker, size, count };

            clusterMarker.setIcon({
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                generateClusterSVG(count, size, true)
              )}`,
              scaledSize: new google.maps.Size(size, size),
            });
          });

          // 클러스터 hover 시 스타일 변경
          clusterMarker.addListener("mouseover", () => {
            if (activeClusterRef.current?.marker !== clusterMarker) {
              const hoverClusterSVG = generateClusterSVG(count, size, true);
              clusterMarker.setIcon({
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                  hoverClusterSVG
                )}`,
                scaledSize: new google.maps.Size(size, size),
              });
            }
          });

          clusterMarker.addListener("mouseout", () => {
            if (activeClusterRef.current?.marker !== clusterMarker) {
              const defaultClusterSVG = generateClusterSVG(count, size, false);
              clusterMarker.setIcon({
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                  defaultClusterSVG
                )}`,
                scaledSize: new google.maps.Size(size, size),
              });
            }
          });

          return clusterMarker;
        },
      },
      onClusterClick: (_, cluster) => {
        // 클러스터 내부의 마커 처리
        const clusteredMarkers = cluster.markers as any;
        const clusteredUnits = clusteredMarkers.map((marker: any) => {
          return units.find(
            (unit) =>
              unit.latitude === marker.getPosition()?.lat() &&
              unit.longitude === marker.getPosition()?.lng()
          );
        });

        // 클러스터 내부 마커들의 데이터 표시
        setLoading(true);
        setTimeout(() => {
          setVisibleUnits(
            clusteredUnits.filter((unit: any): unit is Unit => !!unit)
          );
          setLoading(false);
        }, 500);
      },
    });

    google.maps.event.addListener(map, "idle", () => {
      debouncedUpdate(map, units);
    });
  }, [map, units, setVisibleUnits, setLoading, debouncedUpdate]);

  return null;
};
