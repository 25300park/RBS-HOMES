'use client'

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaShoppingCart,
  FaHospital,
  FaSchool,
  FaTree,
  FaUtensils,
  FaLandmark,
  FaPills,
  FaTheaterMasks,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa"; // 아이콘 임포트
import { MdOutlineLocalPharmacy } from "react-icons/md";

interface NearbyPlacesProps {
  latitude: number;
  longitude: number;
}

// 카테고리별 아이콘 정의
const categoryIcons: Record<string, React.JSX.Element> = {
  restaurant: <FaUtensils className="text-lg" />,
  hospital: <FaHospital className="text-lg" />,
  pharmacy: <MdOutlineLocalPharmacy className="text-lg" />,
  school: <FaSchool className="text-lg" />,
  park: <FaTree className="text-lg" />,
  museum: <FaTheaterMasks className="text-lg" />,
};

// 카테고리별 라벨 정의
const categoryLabels: Record<string, string> = {
  restaurant: "Restaurants",
  hospital: "Hospitals",
  pharmacy: "Pharmacies",
  school: "Schools",
  park: "Parks",
  museum: "Cultural Spaces",
};

// Haversine 공식을 사용하여 두 지점 간의 거리를 계산하는 함수
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // 지구 반경 (킬로미터)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 두 지점 간 거리 (킬로미터)
};

const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ latitude, longitude }) => {
  const [places, setPlaces] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      try {
        const response = await axios.get(`/api/nearby`, {
          params: {
            latitude,
            longitude,
            radius: 1000, // 반경 1km
          },
        });
        setPlaces(response.data); // API에서 반환된 데이터를 상태로 저장
        setLoading(false);
      } catch (error) {
        console.error("Error fetching nearby places:", error);
        setLoading(false);
      }
    };

    fetchNearbyPlaces();
  }, [latitude, longitude]);

  // 로딩 상태 처리
  if (loading) {
    return <div>Loading nearby places...</div>;
  }

  // 별점 표시 컴포넌트
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStars = rating - fullStars >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return (
      <div className="flex space-x-1">
        {Array(fullStars)
          .fill(0)
          .map((_, idx) => (
            <FaStar key={idx} className="text-yellow-500 text-base" />
          ))}
        {halfStars === 1 && <FaStarHalfAlt className="text-yellow-500 text-base" />}
        {Array(emptyStars)
          .fill(0)
          .map((_, idx) => (
            <FaRegStar key={idx + fullStars} className="text-yellow-500 text-base" />
          ))}
      </div>
    );
  };

  return (
    <div className="py-6 space-y-4">
      <h3 className="text-xl font-medium text-gray-800">Nearby Places</h3>
      <div className="grid grid-cols-2 gap-x-12">
        {/* 카테고리별로 최대 3개의 장소만 표시 */}
        {Object.keys(places).map((category) => {
          const filteredPlaces = places[category]?.slice(0, 3); // 각 카테고리에서 최대 3개의 항목만 표시

          if (!filteredPlaces || filteredPlaces.length === 0) return null;

          return (
            <div key={category} className="my-3 border-b">
              <h4 className="text-lg  mb-3 flex items-center">
                {categoryIcons[category]}
                <span className="ml-2">{categoryLabels[category]}</span>
              </h4>
              <ul>
                {filteredPlaces.map((place: any) => {
                  // 각 장소의 거리 계산
                  const distance = calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng).toFixed(2);

                  return (
                    <li key={place.place_id} className="flex justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-800 font-medium">
                          {place.name}{" "}
                          <span className="text-gray-500 text-xs">({distance} km)</span>
                        </p>
                        {/* <p className="text-gray-600 text-xs">{place.vicinity}</p> */}
                      </div>
                      <div className="flex items-center">
                        {place.rating && renderStars(place.rating)}
                        <span className="text-xs ml-4 text-gray-500 w-20 text-right">
                          {place.user_ratings_total ?? 0} reviews
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NearbyPlaces;
