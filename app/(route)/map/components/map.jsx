'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { addMarkersAndClusters } from '@/lib/map';
import { useDebouncedCallback } from 'use-debounce';
import { useMapStore } from '@/store/use-map-store';

export default function Map({ units }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const center = { lng: 121.774, lat: 12.8797 }; // 필리핀 중심 좌표
  const zoom = 6;
  const { setMapInstance, setVisibleUnits } = useMapStore();
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const bounds = [
    [114.57, 4.215],  // 남서쪽
    [127.59, 21.18],  // 북동쪽
  ];

  // 디바운스된 유닛 업데이트 함수
  const updateVisibleUnits = useDebouncedCallback(() => {
    if (map.current) {
      const features = map.current.queryRenderedFeatures({ layers: ['unclustered-point'] });
      const visibleUnits = features.map((f) => f.properties);
      setVisibleUnits(visibleUnits);
    }
  }, 300);

  maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  // 맵 생성 로직
  useEffect(() => {
    if (!map.current) {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [center.lng, center.lat],
        zoom: zoom,
        minZoom: 5,
        maxZoom: 19,
        maxBounds: bounds,
      });

      map.current.on('style.load', () => {
        if (units && units.length > 0) {
          addMarkersAndClusters(map.current, units); // 마커와 클러스터 추가
        }
      });

      map.current.on('moveend', updateVisibleUnits); // 지도 이동 후 유닛 업데이트
      setMapInstance(map.current);
    }
  }, [center.lng, center.lat, zoom, updateVisibleUnits, bounds, setMapInstance]);

  // 데이터가 변경될 때마다 마커와 클러스터 업데이트 + 스토어 초기화
  useEffect(() => {
    const updateMapData = async () => {
      setIsLoading(true); // 데이터 변경 시 로딩 시작

      // 스토어의 visibleUnits 초기화
      setVisibleUnits([]); // 스토어에 저장된 유닛 데이터 초기화

      // 'units' 소스가 이미 존재하는지 확인하고, 존재하면 삭제
      if (map.current.getSource('units')) {
        map.current.removeLayer('clusters');
        map.current.removeLayer('cluster-count');
        map.current.removeLayer('unclustered-point');
        map.current.removeSource('units');
      }

      if (units && units.length > 0) {
        // 마커 및 클러스터 추가
        if (map.current.isStyleLoaded()) {
          addMarkersAndClusters(map.current, units);
        } else {
          map.current.once('style.load', () => {
            addMarkersAndClusters(map.current, units);
          });
        }
      }
      updateVisibleUnits()
      setIsLoading(false); // 로딩 종료
    };

    updateMapData();
  }, [units, setVisibleUnits]); // 스토어의 setVisibleUnits를 의존성에 추가

  return (
    <div className="relative w-full h-[calc(100vh-5rem)]">
      {/* 로딩 표시 */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 bg-white z-50 p-2 flex justify-center">
          <span>Loading...</span>
        </div>
      )}
      <div ref={mapContainer} className="absolute w-full h-full" />
    </div>
  );
}
