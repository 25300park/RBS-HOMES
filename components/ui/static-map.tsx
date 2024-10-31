"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface StaticMapProps {
  latitude: number;
  longitude: number;
}

const StaticMap: React.FC<StaticMapProps> = ({ latitude, longitude }) => {
  const [mapUrl, setMapUrl] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const mapOptions = {
      center: `${latitude},${longitude}`,
      zoom: 14,
      size: isMobile ? "800x400" : "1200x300", // 모바일에서는 더 큰 비율로
      scale: 2,
      format: "png",
      language: "en",
      markers: `color:red|label:•|${latitude},${longitude}`,
      style: [
        "feature:all|element:labels.text.fill|color:0x000000|weight:1",
        "feature:water|element:geometry|color:0xc9c9c9",
        "feature:landscape|element:geometry.fill|color:0xf5f5f5",
        "feature:road|element:geometry.fill|color:0xffffff",
        "feature:road|element:geometry.stroke|color:0xe5e5e5",
        "feature:all|element:labels.text|weight:0.9",
        "feature:all|element:labels.text.fill|color:0x303030"
      ].join("&style="),
    };

    const params = new URLSearchParams();
    Object.entries(mapOptions).forEach(([key, value]) => {
      params.append(key, value as string);
    });

    params.append("key", process.env.NEXT_PUBLIC_GOOGLE_KEY || "");

    const finalUrl = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
    setMapUrl(finalUrl);
  }, [latitude, longitude, isMobile]);

  return (
    <div className="py-12 space-y-6 border-t md:py-6 md:mx-6">
      <h3 className="text-xl font-medium text-gray-800">Location</h3>
      <div className={`relative w-full overflow-hidden shadow-lg ${
        isMobile ? 'aspect-[2/1]' : 'aspect-[4/1]'
      }`}>
        {mapUrl && (
          <img
            src={mapUrl}
            alt="Map Location"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              console.error('Failed to load map image');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StaticMap;