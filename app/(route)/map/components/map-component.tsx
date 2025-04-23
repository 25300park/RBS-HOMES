"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { loadGoogleMapsAPI } from "@/lib/google";
import { MarkerManager } from "./marker-manager";
import { useMapStore } from "@/store/use-map-store";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDebouncedCallback } from "use-debounce";
import DotLoader from "@/components/ui/dot-loader";
import { MobileMarkerManager } from "./mobile-marker-manager";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

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

const SellTypeToggle = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('sellType') || 'rent';

  const handleTypeChange = (type: string) => {
    router.push(`?sellType=${type}`);
  };

  return (
    <div className="absolute top-8 right-6 z-10 p-2 bg-white shadow-md border rounded-lg flex gap-2">
      <button
        onClick={() => handleTypeChange('rent')}
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-colors',
          currentType === 'rent'
            ? 'bg-orange-400 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        rent
      </button>
      <button
        onClick={() => handleTypeChange('sale')}
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-colors',
          currentType === 'sale'
            ? 'bg-orange-400 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        buy
      </button>
    </div>
  );
};

export const MapComponent = React.memo(({ units, searchKey, owner }: MapProps) => {
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
    const baseStyle =
      "relative transition-all duration-500 ease-in-out w-full md:h-[100dvh] h-full";

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
  
      // 단순히 window 객체를 통해 기기 타입 확인 (클라이언트 사이드에서만 실행됨)
      const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768;
      
      // 좌표 설정
      const coordinates = isMobileDevice 
        ? { lat: 14.5430, lng: 121.0536 } // 모바일용 BGC 좌표
        : { lat: 14.5877, lng: 121.0563 }; // 데스크톱용 마닐라 좌표
      
      // console.log("Device detected:", isMobileDevice ? "Mobile" : "Desktop", "Using coordinates:", coordinates);
  
      const initializedMap = new google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: isMobileDevice ? 14 : 13,
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
        // 마커 매니저만 새로 생성
        markerManagerRef.current = `marker-manager-${Date.now()}`;
        setShouldRenderMarkers(true);
        setVisibleUnitCount(newUnits.length);
        setLoading(false);
      }, 100);
    },
    [map, setLoading, setVisibleUnitCount]
  );
  useEffect(() => {
    if (!mapInitializedRef.current) {
      initializeMap();
    }
  
    return () => {
      if (unitsUpdateTimeoutRef.current) {
        clearTimeout(unitsUpdateTimeoutRef.current);
      }
      // 맵 인스턴스는 제거하지 않고 유지
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

  useEffect(() => {
    const initializeAutocomplete = async () => {
      await loadGoogleMapsAPI(); 
  
      if (!autocompleteRef.current || !map) return;
  
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        {
          componentRestrictions: { country: "PH" },
          language: "en",
        }
      );
  
      // place_changed 이벤트 리스너 추가
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
  
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }
  
        // 장소의 viewport가 있다면 그것을 사용하고, 없다면 위치를 중심으로 줌
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }
      });
    };
  
    initializeAutocomplete();
  }, [map]); // map을 의존성 배열에 추가

  return (
    <div className={containerStyle}>
      <DotLoader isLoading={isLoading} />
      <SearchInput autocompleteRef={autocompleteRef} />
      {owner && <SellTypeToggle />}
      <div
        ref={mapRef}
        className="absolute w-full h-full"
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
SearchInput.displayName = "SearchInput";
