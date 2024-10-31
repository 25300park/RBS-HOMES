"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { loadGoogleMapsAPI } from "@/lib/google";
import { MarkerManager } from "./marker-manager";
import { useMapStore } from "@/store/use-map-store";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDebouncedCallback } from "use-debounce";
import { MobileMarkerManager } from "./mobile-marker-manager";

interface MapProps {
  units: any[];
  type?: "rent" | "sale";
  owner?: boolean;
  searchKey: string;
}

const BOUNDS = {
  south: { lat: 4.215, lng: 114.57 },
  north: { lat: 21.18, lng: 127.59 },
};

const MAP_STYLE = [
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.school",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "poi.park",
    stylers: [{ visibility: "on" }],
  },
];

const LoadingIndicator = React.memo(({ isLoading }: { isLoading: boolean }) =>
  isLoading ? (
    <div className="absolute left-1/2 transform -translate-x-1/2 top-20 md:top-28 z-50 transition-all duration-500 ease-in-out">
      <div className="bg-white p-4 shadow-2xl rounded-full">
        <div className="dot-loader" />
      </div>
    </div>
  ) : null
);

const SearchInput = React.memo(
  ({
    autocompleteRef,
  }: {
    autocompleteRef: React.RefObject<HTMLInputElement>;
  }) => (
    <div className="absolute top-8 left-6 z-10 p-4 bg-white shadow-md border md:hidden">
      <div className="flex items-center">
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
    </div>
  )
);

export const MapComponent = React.memo(({ units, searchKey }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const markerManagerRef = useRef<string>(`marker-manager-${searchKey}`);
  const previousUnitsRef = useRef<any[]>([]);
  const mapInitializedRef = useRef(false);
  const unitsUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const {
    setLoading,
    isSidebarOpen,
    sheetPosition,
    setMapInstance,
    setVisibleUnits,
    setVisibleUnitCount,
    isLoading,
  } = useMapStore();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [shouldRenderMarkers, setShouldRenderMarkers] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const containerStyle = React.useMemo(() => {
    const baseStyle = "relative transition-all duration-500 ease-in-out w-full md:h-[100dvh] h-full";

    if (!isMobile) {
      return `${baseStyle} h-full md:h-[100dvh] ${
        isSidebarOpen ? "w-[calc(100%-400px)]" : "w-full"
      }`;
    }

    // switch (sheetPosition) {
    //   case "full":
    //     return `${baseStyle} h-[60vh]`;
    //   case "half":
    //     return `${baseStyle} h-[60vh]`;
    //   default:
    //     return `${baseStyle} h-screen`;
    // }
  }, [isMobile, isSidebarOpen, sheetPosition]);

  const initializeMap = useCallback(async () => {
    if (mapInitializedRef.current || !mapRef.current) return;

    try {
      const google = await loadGoogleMapsAPI();
      const bounds = new google.maps.LatLngBounds(BOUNDS.south, BOUNDS.north);

      const initializedMap = new google.maps.Map(mapRef.current, {
        center: { lat: 14.5877, lng: 121.0563 },
        zoom: 13,
        minZoom: 5,
        maxZoom: 20,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        zoomControl: true,
        styles: MAP_STYLE,
        restriction: {
          latLngBounds: bounds,
          strictBounds: true,
        },
      });

      google.maps.event.addListenerOnce(initializedMap, "idle", () => {
        mapInitializedRef.current = true;
        setMap(initializedMap);
        setMapInstance(initializedMap);
        setShouldRenderMarkers(true);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setLoading(false);
    }
  }, [setLoading, setMapInstance]);

  const handleUnitsUpdate = useCallback(
    (newUnits: any[]) => {
      if (!map || !mapInitializedRef.current) return;

      if (unitsUpdateTimeoutRef.current) {
        clearTimeout(unitsUpdateTimeoutRef.current);
      }

      setLoading(true);
      setShouldRenderMarkers(false);

      unitsUpdateTimeoutRef.current = setTimeout(() => {
        markerManagerRef.current = `marker-manager-${searchKey}-${Date.now()}`;
        setShouldRenderMarkers(true);
        setVisibleUnitCount(newUnits.length);
        setLoading(false);
      }, 100);
    },
    [map, searchKey, setLoading, setVisibleUnitCount]
  );

  useEffect(() => {
    initializeMap();

    return () => {
      if (unitsUpdateTimeoutRef.current) {
        clearTimeout(unitsUpdateTimeoutRef.current);
      }
      mapInitializedRef.current = false;
      setVisibleUnits([]);
      setVisibleUnitCount(0);
    };
  }, [initializeMap, setVisibleUnits, setVisibleUnitCount]);

  useEffect(() => {
    const hasUnitsChanged =
      JSON.stringify(units) !== JSON.stringify(previousUnitsRef.current);
    if (!hasUnitsChanged) return;

    previousUnitsRef.current = units;
    handleUnitsUpdate(units);
  }, [units, handleUnitsUpdate]);

  return (
    <div className={containerStyle}>
      <LoadingIndicator isLoading={isLoading} />
      <SearchInput autocompleteRef={autocompleteRef} />
      <div
        ref={mapRef}
       className="absolute w-full h-[100dvh]"
        style={{ outline: "none" }}
        tabIndex={-1}
      />
      {map &&
        shouldRenderMarkers &&
        units.length > 0 &&
        (isMobile ? (
          <MobileMarkerManager
            key={markerManagerRef.current}
            map={map}
            units={units}
          />
        ) : (
          <MarkerManager
            key={markerManagerRef.current}
            map={map}
            units={units}
          />
        ))}
    </div>
  );
});

MapComponent.displayName = "MapComponent";
LoadingIndicator.displayName = "LoadingIndicator";
SearchInput.displayName = "SearchInput";