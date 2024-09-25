// Cluster SVG를 생성하는 함수
export const generateClusterSVG = (count: number, size: number, isSelected = false) => {
  const fillColor = isSelected ? "#ffffff" : "#fb923c"; // 선택된 클러스터는 흰색 배경
  const borderColor = isSelected ? "#fb923c" : "none"; // 선택된 클러스터는 주황색 테두리
  const textColor = isSelected ? "#fb923c" : "#ffffff"; // 선택된 클러스터는 주황색 글씨

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" fill="${fillColor}" stroke="${borderColor}" stroke-width="1" />
      <text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="${textColor}" font-size="14" font-weight="bold">
        ${count}
      </text>
    </svg>
  `;
};

// Marker SVG를 생성하는 함수
export const generateMarkerSVG = (isSelected = false) => {
  const fillColor = isSelected ? "#ffffff" : "#fb923c"; // 선택된 마커는 흰색 배경
  const borderColor = isSelected ? "#fb923c" : "none"; // 선택된 마커는 주황색 테두리
  const textColor = isSelected ? "#fb923c" : "#ffffff"; // 선택된 마커는 주황색 글씨

  return `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" fill="${fillColor}" stroke="${borderColor}" stroke-width="1" />
      <text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="${textColor}" font-size="14" font-weight="bold">
        1
      </text>
    </svg>
  `;
};
