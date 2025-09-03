"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { loadGoogleMapsAPI } from "@/lib/google";
import { MarkerManager } from "./marker-manager";
import { useMapStore } from "@/store/use-map-store";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { useMediaQuery } from "@/hooks/use-media-query";
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
    map,
  }: {
    autocompleteRef: React.RefObject<HTMLInputElement>;
    map: google.maps.Map | null;
  }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [inputValue, setInputValue] = useState("");

    // URL에서 search 파라미터 읽어서 자동 검색
    useEffect(() => {
      const searchQuery = searchParams.get('search');
      if (searchQuery && map && autocompleteRef.current) {
        setInputValue(searchQuery);
        autocompleteRef.current.value = searchQuery;
        
        // Google Places API로 검색 실행
        performSearch(searchQuery);
      }
    }, [searchParams, map]);

    const performSearch = async (query: string) => {
      if (!map || !query.trim()) return;

      try {
        const google = await loadGoogleMapsAPI();
        const service = new google.maps.places.PlacesService(map);

        // Text Search 요청
        const request = {
          query: `${query.trim()}, Philippines`,
          fields: ['place_id', 'geometry', 'name', 'formatted_address'],
        };

        service.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
            const place = results[0];
            
            if (place.geometry && place.geometry.location) {
              // 검색 결과 위치로 맵 이동
              if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
              } else {
                map.setCenter(place.geometry.location);
                map.setZoom(15);
              }
              
              console.log(`Moved to: ${place.name} - ${place.formatted_address}`);
            }
          } else {
            console.log('No results found for:', query);
          }
        });
      } catch (error) {
        console.error('Error performing search:', error);
      }
    };
    

    const handleSearch = () => {
      const query = autocompleteRef.current?.value.trim();
      if (query) {
        // URL에 search 파라미터 추가
        const params = new URLSearchParams(searchParams.toString());
        params.set('search', query);
        router.push(`?${params.toString()}`);
        
        // 검색 실행
        performSearch(query);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    };

    return (
      <div className="absolute bottom-8 left-6 z-10 p-4 bg-white shadow-md border md:hidden">
        <div className="flex items-center">
          <Input
            ref={autocompleteRef}
            type="text"
            placeholder="Search area in the Philippines"
            className="h-8 w-72 px-3 py-5 rounded-none rounded-l-sm focus:outline-none focus-visible:ring-0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            onClick={handleSearch}
            className="bg-orange-400 h-8 px-5 py-5 border border-orange-400 rounded-r-sm flex items-center justify-center hover:bg-orange-500 transition-colors"
          >
            <FaSearch className="text-white" />
          </button>
        </div>
      </div>
    );
  }
);

const SellTypeToggle = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('sellType') || 'rent';

  // 모든 URL 파라미터를 유지하면서 판매 유형만 변경
  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sellType', type);
    router.push(`?${params.toString()}`);
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
  
  // Store에서 맵 위치 상태 가져오기
  const {
    setLoading,
    isSidebarOpen,
    sheetPosition,
    setMapInstance,
    setVisibleUnits,
    setVisibleUnitCount,
    isLoading,
    mapCenter,
    mapZoom,
  } = useMapStore();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [shouldRenderMarkers, setShouldRenderMarkers] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // 맵 위치 저장 함수 - 언마운트 시에만 호출됨
  const saveMapPosition = useCallback(() => {
    if (!map) return;
    
    const center = map.getCenter();
    const zoom = map.getZoom();
    
    if (center && zoom) {
      const mapPosition = {
        center: { lat: center.lat(), lng: center.lng() },
        zoom: zoom
      };
      
      localStorage.setItem('mapPosition', JSON.stringify(mapPosition));
    }
  }, [map]);

  const containerStyle = React.useMemo(() => {
    const baseStyle =
      "relative transition-all duration-500 ease-in-out w-full md:h-[100dvh] h-full";

    if (!isMobile) {
      return `${baseStyle} h-full md:h-[100dvh] ${
        isSidebarOpen ? "w-[calc(100%-400px)]" : "w-full"
      }`;
    }
  }, [isMobile, isSidebarOpen, sheetPosition]);

  // 맵 초기화 함수 수정 - 저장된 위치 사용
  const initializeMap = useCallback(async () => {
    if (mapInitializedRef.current || !mapRef.current) return;
  
    try {
      const google = await loadGoogleMapsAPI();
      const bounds = new google.maps.LatLngBounds(BOUNDS.south, BOUNDS.north);
  
      const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768;
      
      const defaultCoordinates = isMobileDevice 
        ? { lat: 14.5430, lng: 121.0536 }
        : { lat: 14.5877, lng: 121.0563 };
      
      let savedPosition = null;
      try {
        const savedPositionStr = localStorage.getItem('mapPosition');
        if (savedPositionStr) {
          savedPosition = JSON.parse(savedPositionStr);
        }
      } catch (e) {
        console.error('Error reading saved map position:', e);
      }
      
      const centerPosition = savedPosition 
        ? { lat: savedPosition.center.lat, lng: savedPosition.center.lng }
        : (mapCenter 
          ? { lat: mapCenter.lat, lng: mapCenter.lng } 
          : defaultCoordinates);
          
      const zoomLevel = savedPosition 
        ? savedPosition.zoom
        : (mapZoom || (isMobileDevice ? 14 : 13));
      
      const initializedMap = new google.maps.Map(mapRef.current, {
        center: centerPosition,
        zoom: zoomLevel,
        minZoom: 5,
        maxZoom: 20,
        disableDefaultUI: false,
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
  }, [setLoading, setMapInstance, mapCenter, mapZoom]);

  const handleUnitsUpdate = useCallback(
    (newUnits: any[]) => {
      if (!map || !mapInitializedRef.current) return;
  
      if (unitsUpdateTimeoutRef.current) {
        clearTimeout(unitsUpdateTimeoutRef.current);
      }
  
      setLoading(true);
      setShouldRenderMarkers(false);
  
      unitsUpdateTimeoutRef.current = setTimeout(() => {
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
      
      if (map && mapInitializedRef.current) {
        saveMapPosition();
      }
      
      setVisibleUnits([]);
      setVisibleUnitCount(0);
    };
  }, [initializeMap, setVisibleUnits, setVisibleUnitCount, map, saveMapPosition]);

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
  
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
  
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }
  
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }
      });
    };
  
    initializeAutocomplete();
  }, [map]);

  return (
    <div className={containerStyle}>
      <DotLoader isLoading={isLoading} />
  {!owner&&    <SearchInput autocompleteRef={autocompleteRef} map={map} />}
      {/* {owner && <SellTypeToggle />} */}
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