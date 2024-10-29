"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { loadGoogleMapsAPI } from "@/lib/google";
import { MarkerManager } from "./marker-manager";
import { useMapStore } from "@/store/use-map-store";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { useMediaQuery } from "@/hooks/use-media-query";

interface MapProps {
  units: any[];
  type?: "rent" | "sale";
  owner?: boolean;
}

export const MapComponent = React.memo(({ units, type, owner }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const {
    setLoading,
    isSidebarOpen,
    sheetPosition,
    setMapInstance,
  } = useMapStore();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleMapResize = useCallback(() => {
    if (!map) return;
    
    // Store current state
    const center = map.getCenter();
    const zoom = map.getZoom();

    // Trigger resize and restore state
    setTimeout(() => {
      google.maps.event.trigger(map, 'resize');
      if (center && zoom) {
        map.setCenter(center);
        map.setZoom(zoom);
      }
    }, 100);
  }, [map]);

  // Sheet position change effect
  useEffect(() => {
    if (isMobile && map) {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(handleMapResize, 300);
    }
  }, [sheetPosition, map, isMobile, handleMapResize]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(handleMapResize, 300);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleMapResize]);

  const initializeMap = useCallback(async () => {
    try {
      const google = await loadGoogleMapsAPI();
      if (!mapRef.current) return;

      const bounds = new google.maps.LatLngBounds(
        { lat: 4.215, lng: 114.57 },
        { lat: 21.18, lng: 127.59 }
      );

      const mapStyle = [
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
        }
      ];

      const initializedMap = new google.maps.Map(mapRef.current, {
        center: { lat: 14.5877, lng: 121.0563 },
        zoom: 13,
        minZoom: 5,
        maxZoom: 20,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        zoomControl: true,
        styles: mapStyle,
        restriction: {
          latLngBounds: bounds,
          strictBounds: true,
        },
      });

      // Wait for the map to be fully loaded
      google.maps.event.addListenerOnce(initializedMap, 'idle', () => {
        setMap(initializedMap);
        setMapInstance(initializedMap);
        setLoading(false);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setLoading(false);
    }
  }, [setLoading, setMapInstance]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  const containerStyle = React.useMemo(() => {
    const baseStyle = "relative w-full transition-all duration-500 ease-in-out";
    
    if (!isMobile) {
      return `${baseStyle} ${isSidebarOpen ? "w-[calc(100%-400px)]" : "w-full"} h-full`;
    }

    // sheetPosition에 따른 높이 설정
    switch (sheetPosition) {
      case "full":
        return `${baseStyle} h-[40vh]`;
      case "half":
        return `${baseStyle} h-[50vh]`;
      case "minimized":
        return `${baseStyle} h-screen`;
      default:
        return `${baseStyle} h-screen`;
    }
  }, [isMobile, isSidebarOpen, sheetPosition]);

  const SearchInput = React.memo(() => (
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
  ));



  return (
    <div  className={containerStyle}>
      <SearchInput />
      <div
        ref={mapRef}
        className="absolute w-full h-full"
        style={{ outline: "none" }}
        tabIndex={-1}
      />
      {map && <MarkerManager map={map} units={units} />}
    </div>
  );
});

MapComponent.displayName = 'MapComponent';