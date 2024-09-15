'use client';

import React from "react";

interface StaticMapProps {
  latitude: number;
  longitude: number;
}

const StaticMap: React.FC<StaticMapProps> = ({ latitude, longitude }) => {
  // Google Static Map URL에 마커 추가
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&markers=color:red|${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_KEY}`;

  return (
    <div>
      <img
        src={mapUrl}
        alt="Static Map with Marker"
        className="w-full h-96 rounded-md shadow-lg"
      />
    </div>
  );
};

export default StaticMap;
