"use client";

import React, { useState, useEffect } from "react";

interface StaticMapProps {
  latitude: number;
  longitude: number;
}

const StaticMap: React.FC<StaticMapProps> = ({ latitude, longitude }) => {

  // Google Static Map URL에 마커 추가
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=1200x300&markers=color:red|${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_KEY}`;


  return (
    <div className="py-12 space-y-6 border-t">
      <h3 className="text-xl font-medium text-gray-800">Where you’ll be</h3>
      <img
        src={mapUrl}
        alt="Static Map with Marker"
        className="w-full h-96 rounded-md shadow-lg"
      />
    </div>
  );
};

export default StaticMap;
