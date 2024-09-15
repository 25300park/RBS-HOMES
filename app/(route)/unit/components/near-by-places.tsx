'use client'

import React, { useEffect, useState } from "react";
import axios from "axios";

interface NearbyPlacesProps {
  latitude: number;
  longitude: number;
}

const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ latitude, longitude }) => {
  const [places, setPlaces] = useState<any[]>([]);

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_KEY; 
      const radius = 1000; // 반경 1km
      const type = "restaurant"; // 예시로 주변 식당을 가져옴
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;

      try {
        const response = await axios.get(url);
        console.log(response)
        setPlaces(response.data.results);
      } catch (error) {
        console.error("Error fetching nearby places:", error);
      }
    };

    fetchNearbyPlaces();
  }, [latitude, longitude]);

  return (
    <div>
      <h3>Nearby Places</h3>
      <ul>
        {places.map((place) => (
          <li key={place.place_id}>
            {place.name} - {place.vicinity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NearbyPlaces;
