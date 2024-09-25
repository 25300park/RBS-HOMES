// import React, { useEffect, useState } from 'react';
// import { SuperClusterAlgorithm, MarkerClusterer } from '@googlemaps/markerclusterer';
// import { useMapStore } from '@/store/use-map-store';
// import { generateMarkerSVG, generateClusterSVG } from '@/lib/svg-gen';
// import { useDebouncedCallback } from "use-debounce";

// interface MarkerManagerProps {
//   map: google.maps.Map;
//   units: Unit[];
// }

// interface Unit {
//   latitude: number;
//   longitude: number;
//   title: string;
//   price: number;
//   [key: string]: any;
// }

// export const MarkerManager = ({ map, units }: MarkerManagerProps) => {
//   const { setVisibleUnits, setLoading, setVisibleUnitCount, isSidebarOpen } = useMapStore();
//   const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

//   const debouncedUpdate = useDebouncedCallback(
//     async (map: google.maps.Map, units: Unit[]) => {
//       setLoading(true);
//       const mapBounds = map.getBounds();
//       if (mapBounds) {
//         const visibleUnits = units.filter((unit) =>
//           mapBounds.contains(new google.maps.LatLng(unit.latitude, unit.longitude))
//         );
//         await new Promise((resolve) => setTimeout(resolve, 500));
//         setVisibleUnits(visibleUnits);
//         setVisibleUnitCount(visibleUnits.length);
//       }
//       setLoading(false);
//     },
//     500
//   );

//   useEffect(() => {
//     const markers = units.map((unit) => {
//       const markerId = `${unit.latitude}-${unit.longitude}`;
//       const isSelected = activeMarkerId === markerId;
//       const markerSVG = generateMarkerSVG(isSelected);
//       const marker = new google.maps.Marker({
//         position: { lat: unit.latitude, lng: unit.longitude },
//         icon: {
//           url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSVG)}`,
//           scaledSize: new google.maps.Size(40, 40),
//         },
//       });

//       marker.addListener('click', () => {
//         setLoading(true);
//         setActiveMarkerId(markerId);
//         const updatedMarkerSVG = generateMarkerSVG(true);
//         marker.setIcon({
//           url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(updatedMarkerSVG)}`,
//           scaledSize: new google.maps.Size(40, 40),
//         });
//         setTimeout(() => {

//           setVisibleUnits([unit]);
//           setLoading(false);
//           // 마커 색상 업데이트

//         }, 500);
//       });

//       marker.addListener('mouseover', () => {
//         const hoverMarkerSVG = generateMarkerSVG(true);
//         marker.setIcon({
//           url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(hoverMarkerSVG)}`,
//           scaledSize: new google.maps.Size(40, 40),
//         });
//       });

//       marker.addListener('mouseout', () => {
//         const isStillSelected = activeMarkerId === markerId;
//         const defaultMarkerSVG = generateMarkerSVG(isStillSelected);
//         marker.setIcon({
//           url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultMarkerSVG)}`,
//           scaledSize: new google.maps.Size(40, 40),
//         });
//       });

//       return marker;
//     });

//     const markerClusterer = new MarkerClusterer({
//       markers,
//       map,
//       algorithm: new SuperClusterAlgorithm({ maxZoom: 20, radius: 500 }),
//       renderer: {
//         render: ({ count, position }) => {
//           const clusterId = `${position.lat()}-${position.lng()}`;
//           const isSelected = activeMarkerId === clusterId;
//           const size = Math.min(80, 40 + count * 0.5);
//           const clusterSVG = generateClusterSVG(count, size, isSelected);

//           const clusterMarker = new google.maps.Marker({
//             position,
//             icon: {
//               url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(clusterSVG)}`,
//               scaledSize: new google.maps.Size(size, size),
//             },
//           });

//           clusterMarker.addListener('mouseover', () => {
//             const hoverClusterSVG = generateClusterSVG(count, size, true);
//             clusterMarker.setIcon({
//               url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(hoverClusterSVG)}`,
//               scaledSize: new google.maps.Size(size, size),
//             });
//           });

//           clusterMarker.addListener('mouseout', () => {
//             const isStillSelected = activeMarkerId === clusterId;
//             const defaultClusterSVG = generateClusterSVG(count, size, isStillSelected);
//             clusterMarker.setIcon({
//               url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultClusterSVG)}`,
//               scaledSize: new google.maps.Size(size, size),
//             });
//           });

//           return clusterMarker;
//         },
//       },
//       onClusterClick: (_, cluster) => {
//         const clusteredMarkers = cluster.markers as any;
//         const clusteredUnits = clusteredMarkers.map((marker: any) => {
//           return units.find(
//             (unit) =>
//               unit.latitude === marker.getPosition()?.lat() &&
//               unit.longitude === marker.getPosition()?.lng()
//           );
//         }).filter((unit: any): unit is Unit => !!unit);
//         const clusterId = `${cluster.position.lat()}-${cluster.position.lng()}`;
//         setLoading(true);
//         setActiveMarkerId(clusterId);
//         const updatedClusterSVG = generateClusterSVG(clusteredUnits.length, Math.min(80, 40 + clusteredUnits.length * 0.5), true);
//         cluster.marker.setIcon({
//           url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(updatedClusterSVG)}`,
//           scaledSize: new google.maps.Size(Math.min(80, 40 + clusteredUnits.length * 0.5), Math.min(80, 40 + clusteredUnits.length * 0.5)),
//         });
//         setTimeout(() => {
//           setVisibleUnits(clusteredUnits);
//           setLoading(false);
//         }, 500);
//       },
//     });

//     google.maps.event.addListener(map, 'idle', () => {
//       debouncedUpdate(map, units);
//     });

//     // 지도 클릭 시 활성화 상태 초기화
//     google.maps.event.addListener(map, 'click', () => {
//       setActiveMarkerId(null);
//       markers.forEach(marker => {
//         const defaultMarkerSVG = generateMarkerSVG(false);
//         marker.setIcon({
//           url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultMarkerSVG)}`,
//           scaledSize: new google.maps.Size(40, 40),
//         });
//       });
//     });

//     return () => {
//       markerClusterer.clearMarkers();
//     };
//   }, [map, units, setVisibleUnits, setLoading, debouncedUpdate, activeMarkerId]);

//   return null;
// };