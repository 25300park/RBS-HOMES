import React, { useEffect, useRef } from "react";
import {
  SuperClusterAlgorithm,
  MarkerClusterer,
} from "@googlemaps/markerclusterer";
import { useMapStore } from "@/store/use-map-store";
import { generateMarkerSVG, generateClusterSVG } from "@/lib/svg-gen";
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
    sheetPosition,
    setSheetPosition,
  } = useMapStore();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const activeMarkerRef = useRef<ExtendedMarker | null>(null);
  const activeClusterRef = useRef<{
    marker: google.maps.Marker | null;
    size: number;
    count: number;
  } | null>(null);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  const markerMap = useRef<Map<number, ExtendedMarker>>(new Map());
  const clusterMap = useRef<Map<string, any>>(new Map());
  const prevSheetPosition = useRef(sheetPosition);

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
      return units
        .filter((unit) => unit.latitude != null && unit.longitude != null) // ✅ null 좌표 마커 제외
        .map((unit) => {
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

        marker.addListener("click", () => {
          deactivateCurrent();
          activeMarkerRef.current = marker;
          
          if (isMobile && sheetPosition === "minimized") {
            setSheetPosition("half");
          } else {
            toggleSidebar(true);
          }

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
    }

    const markers = createMarkers();

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
          const clusterSVG = generateClusterSVG(actualCount, size, false);

          const clusterMarker = new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                clusterSVG
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
            deactivateCurrent();
            activeClusterRef.current = {
              marker: clusterMarker,
              size,
              count: actualCount,
            };

            clusterMarker.setIcon({
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                generateClusterSVG(actualCount, size, true)
              )}`,
              scaledSize: new google.maps.Size(size, size),
            });
          });

          clusterMarker.addListener("mouseover", () => {
            if (activeClusterRef.current?.marker !== clusterMarker) {
              clusterMarker.setIcon({
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                  generateClusterSVG(actualCount, size, true)
                )}`,
                scaledSize: new google.maps.Size(size, size),
              });
            }
          });

          clusterMarker.addListener("mouseout", () => {
            if (activeClusterRef.current?.marker !== clusterMarker) {
              clusterMarker.setIcon({
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                  generateClusterSVG(actualCount, size, false)
                )}`,
                scaledSize: new google.maps.Size(size, size),
              });
            }
          });

          return clusterMarker;
        },
      },
      onClusterClick: (_, cluster) => {
        if (isMobile && sheetPosition === "minimized") {
          setSheetPosition("half");
        } else {
          toggleSidebar(true);
        }

        const clusteredMarkers = cluster.markers as ExtendedMarker[];
        const uniqueUnits = new Map<number, Unit>();
        clusteredMarkers.forEach((marker) => {
          if (marker.unitData) {
            uniqueUnits.set(marker.unitData.id, marker.unitData);
          }
        });

        setLoading(true);
        setTimeout(() => {
          const visibleUnits = Array.from(uniqueUnits.values());
          setVisibleUnits(visibleUnits);
          setLoading(false);
        }, 300);
      },
    });

    const mapBounds = map.getBounds();
    if (mapBounds) {
      const visibleUnits = units.filter((unit) =>
        unit.latitude != null && unit.longitude != null && // ✅ null 좌표 필터
        mapBounds.contains(
          new google.maps.LatLng(unit.latitude, unit.longitude)
        )
      );
      setVisibleUnits(visibleUnits);
    }

    const handleIdle = () => {
      if (prevSheetPosition.current !== sheetPosition) {
        prevSheetPosition.current = sheetPosition;
        return;
      }

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
    };

    const idleListener = google.maps.event.addListener(map, "idle", handleIdle);

    return () => {
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
        markerClustererRef.current = null;
      }
      google.maps.event.removeListener(idleListener);
      markerMap.current.clear();
      clusterMap.current.clear();
    };
  }, [
    map,
    units,
    setVisibleUnits,
    setLoading,
    setVisibleUnitCount,
    toggleSidebar,
    isMobile,
    sheetPosition,
    setSheetPosition,
  ]);

  useEffect(() => {
    markerMap.current.forEach((marker, unitId) => {
      if (unitId === hoverUnitId) {
        marker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateMarkerSVG(true)
          )}`,
          scaledSize: new google.maps.Size(40, 40),
        });
      } else if (marker !== activeMarkerRef.current) {
        marker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateMarkerSVG(false)
          )}`,
          scaledSize: new google.maps.Size(40, 40),
        });
      }
    });

    clusterMap.current.forEach(({ clusterMarker, markers, actualCount }) => {
      const containsHoveredUnit = markers.some(
        (marker: ExtendedMarker) => marker.unitData?.id === hoverUnitId
      );

      const size = Math.min(80, 40 + actualCount * 0.5);

      if (containsHoveredUnit) {
        clusterMarker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateClusterSVG(actualCount, size, true)
          )}`,
          scaledSize: new google.maps.Size(size, size),
        });
      } else if (clusterMarker !== activeClusterRef.current?.marker) {
        clusterMarker.setIcon({
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            generateClusterSVG(actualCount, size, false)
          )}`,
          scaledSize: new google.maps.Size(size, size),
        });
      }
    });
  }, [hoverUnitId]);

  return null;
});

MarkerManager.displayName = "MarkerManager";