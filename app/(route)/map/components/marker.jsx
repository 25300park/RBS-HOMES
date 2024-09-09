
// function addMarkersAndClusters(map, units) {
//   const geojson = {
//     type: 'FeatureCollection',
//     features: units.map((unit) => ({
//       type: 'Feature',
//       properties: {
//         id: unit.id,
//         title: unit.title,
//         description: unit.description,
//         image: unit.image,
//       },
//       geometry: {
//         type: 'Point',
//         coordinates: [unit.longitude, unit.latitude],
//       },
//     })),
//   };

//   // 유닛 마커 소스 추가
//   map.addSource('units', {
//     type: 'geojson',
//     data: geojson,
//     cluster: true,
//     clusterMaxZoom: 14, // 클러스터링이 멈추는 줌 레벨
//     clusterRadius: 50, // 클러스터 반경
//   });

//   // 클러스터 점 표시
//   map.addLayer({
//     id: 'clusters',
//     type: 'circle',
//     source: 'units',
//     filter: ['has', 'point_count'],
//     paint: {
//       'circle-color': '#FF5733',
//       'circle-radius': [
//         'step',
//         ['get', 'point_count'],
//         20,
//         100,
//         30,
//         750,
//         40,
//       ],
//     },
//   });

//   // 클러스터 수 표시
//   map.addLayer({
//     id: 'cluster-count',
//     type: 'symbol',
//     source: 'units',
//     filter: ['has', 'point_count'],
//     layout: {
//       'text-field': '{point_count_abbreviated}',
//       'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
//       'text-size': 14,
//     },
//     paint: {
//       'text-color': '#FFFFFF',
//     },
//   });

//   // 개별 유닛 표시
//   map.addLayer({
//     id: 'unclustered-point',
//     type: 'circle',
//     source: 'units',
//     filter: ['!', ['has', 'point_count']],
//     paint: {
//       'circle-color': '#11b4da',
//       'circle-radius': 10,
//       'circle-stroke-width': 1,
//       'circle-stroke-color': '#fff',
//     },
//   });

//   // 유닛 팝업 설정
//   map.on('click', 'unclustered-point', (e) => {
//     const coordinates = e.features[0].geometry.coordinates.slice();
//     const { title, description, image } = e.features[0].properties;

//     new maptilersdk.Popup({ offset: 25 })
//       .setLngLat(coordinates)
//       .setHTML(`
//         <div class="p-4 bg-white rounded-lg shadow-md w-64">
//           <img src="${image}" alt="${title}" class="w-full h-32 object-cover rounded-lg mb-2" />
//           <h3 class="text-lg font-bold mb-2">${title}</h3>
//           <p class="text-sm text-gray-500 mb-2">${description}</p>
//         </div>
//       `)
//       .addTo(map);
//   });

//   // 클러스터 클릭 시 확대 및 마커 보이기
//   map.on('click', 'clusters', (e) => {
//     const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
//     const clusterId = features[0].properties.cluster_id;
//     map.getSource('units').getClusterExpansionZoom(clusterId, (err, zoom) => {
//       if (err) return;

//       map.easeTo({
//         center: features[0].geometry.coordinates,
//         zoom: zoom,
//       });
//     });
//   });

//   // 마우스 포인터를 클러스터나 마커 위에 올릴 때 포인터 모양으로 변경
//   map.on('mouseenter', 'clusters', () => {
//     map.getCanvas().style.cursor = 'pointer';
//   });

//   map.on('mouseleave', 'clusters', () => {
//     map.getCanvas().style.cursor = '';
//   });
// }
// export default addMarkersAndClusters