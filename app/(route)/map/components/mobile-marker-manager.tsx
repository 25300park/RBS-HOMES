import React, { useRef, useCallback } from "react";
import {
  SuperClusterAlgorithm,
  MarkerClusterer,
} from "@googlemaps/markerclusterer";
import { useMapStore } from "@/store/use-map-store";
import { generateMarkerSVG, generateClusterSVG } from "@/lib/svg-gen";

interface MobileMarkerManagerProps {
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

export const MobileMarkerManager = React.memo(({ map, units }: MobileMarkerManagerProps) => {
  const {
    setVisibleUnits,
    setLoading,
    setVisibleUnitCount,
    setSheetPosition,
  } = useMapStore();

  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const activeMarkerRef = useRef<ExtendedMarker | null>(null);
  const activeClusterRef = useRef<{
    marker: google.maps.Marker | null;
    size: number;
    count: number;
  } | null>(null);
  const isClusterClickRef = useRef(false);

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

  const handleBoundsChanged = useCallback(() => {
    if (isClusterClickRef.current) {
      isClusterClickRef.current = false;
      return;
    }

    if (boundsUpdateTimeoutRef.current) {
      clearTimeout(boundsUpdateTimeoutRef.current);
    }

    boundsUpdateTimeoutRef.current = setTimeout(() => {
      const currentBounds = map.getBounds();
      if (currentBounds) {
        const newVisibleUnits = units.filter((unit) =>
          unit.latitude != null && unit.longitude != null && // ✅ null 좌표 필터
          currentBounds.contains(
            new google.maps.LatLng(unit.latitude, unit.longitude)
          )
        );
        setVisibleUnits(newVisibleUnits);
        setVisibleUnitCount(newVisibleUnits.length);
      }
    }, 300);
  }, [map, units, setVisibleUnits, setVisibleUnitCount]);

  React.useEffect(() => {
    // Initial bounds check
    const currentBounds = map.getBounds();
    if (currentBounds) {
      const initialVisibleUnits = units.filter((unit) =>
        unit.latitude != null && unit.longitude != null && // ✅ null 좌표 필터
        currentBounds.contains(
          new google.maps.LatLng(unit.latitude, unit.longitude)
        )
      );
      setVisibleUnits(initialVisibleUnits);
      setVisibleUnitCount(initialVisibleUnits.length);
    }

    const createMarkers = () => {
      return units
        .filter((unit) => unit.latitude != null && unit.longitude != null) // ✅ null 좌표 마커 제외
        .map((unit) => {
        const marker = new google.maps.Marker({
          position: { 
            lat: parseFloat(unit.latitude.toString()), 
            lng: parseFloat(unit.longitude.toString()) 
          },
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              generateMarkerSVG(false)
            )}`,
            scaledSize: new google.maps.Size(40, 40),
          },
        }) as ExtendedMarker;

        marker.unitData = unit;
        
        marker.addListener("click", () => {
          isClusterClickRef.current = true;
          deactivateCurrent();
          activeMarkerRef.current = marker;
          
          marker.setIcon({
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              generateMarkerSVG(true)
            )}`,
            scaledSize: new google.maps.Size(40, 40),
          });

          setSheetPosition("half");
          setVisibleUnits([unit]);
          setVisibleUnitCount(1);
          setLoading(false);
        });

        return marker;
      });
    };

    const markers = createMarkers();
    const clusterer = new MarkerClusterer({
      markers,
      map,
      algorithm: new SuperClusterAlgorithm({ maxZoom: 20, radius: 350 }),
      renderer: {
        render: ({ count, position }) => {
          const size = Math.min(80, 40 + count * 0.5);
          const clusterMarker = new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                generateClusterSVG(count, size, false)
              )}`,
              scaledSize: new google.maps.Size(size, size),
            },
          });

          clusterMarker.addListener("click", () => {
            deactivateCurrent();
            activeClusterRef.current = {
              marker: clusterMarker,
              size,
              count,
            };

            clusterMarker.setIcon({
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                generateClusterSVG(count, size, true)
              )}`,
              scaledSize: new google.maps.Size(size, size),
            });
          });

          return clusterMarker;
        },
      },
      onClusterClick: (_, cluster) => {
        isClusterClickRef.current = true;
        const clusteredMarkers = cluster.markers as ExtendedMarker[];
        const uniqueUnits = new Map<number, Unit>();
        clusteredMarkers.forEach((marker) => {
          if (marker.unitData) {
            uniqueUnits.set(marker.unitData.id, marker.unitData);
          }
        });

        setSheetPosition("half");
        const visibleUnits = Array.from(uniqueUnits.values());
        setVisibleUnits(visibleUnits);
        setVisibleUnitCount(visibleUnits.length);
        setLoading(false);
      },
    });

    const boundsListener = map.addListener("bounds_changed", handleBoundsChanged);

    return () => {
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current);
      }
      clusterer.clearMarkers();
      google.maps.event.removeListener(boundsListener);
    };
  }, [map, units, setVisibleUnits, setLoading, setVisibleUnitCount, setSheetPosition, deactivateCurrent, handleBoundsChanged]);

  return null;
});

MobileMarkerManager.displayName = "MobileMarkerManager";