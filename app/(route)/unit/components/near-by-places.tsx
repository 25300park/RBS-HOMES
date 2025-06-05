'use client'

import React, { useState } from "react";
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
  FaChevronDown,
  FaSpinner,
} from "react-icons/fa";
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
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ latitude, longitude }) => {
  const [places, setPlaces] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [showPlaces, setShowPlaces] = useState(false);

  // 주변시설 정보를 가져오는 함수
  const fetchNearbyPlaces = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/nearby`, {
        params: {
          latitude,
          longitude,
          radius: 1000,
        },
      });
      setPlaces(response.data);
      setShowPlaces(true);
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // 블러 처리를 위한 더미 데이터
  const dummyCategories = Object.keys(categoryLabels);
  const dummyPlaces = Array(3).fill(null).map((_, index) => ({
    id: index,
    name: "Sample Place Name",
    distance: "0.5",
    rating: 4.5,
    reviews: 128
  }));

  return (
    <div className="py-6 space-y-4 md:px-6">
      <h3 className="text-xl font-medium text-gray-800">Nearby Places</h3>
      
      <div className="relative">
        {/* 실제 컨텐츠 또는 블러 처리된 더미 컨텐츠 */}
        <div className={`grid grid-cols-2 gap-x-12 md:grid-cols-1 transition-all duration-300 ${
          !showPlaces ? 'blur-sm pointer-events-none' : ''
        }`}>
          {showPlaces ? (
            // 실제 데이터 표시
            Object.keys(places).map((category) => {
              const filteredPlaces = places[category]?.slice(0, 3);

              if (!filteredPlaces || filteredPlaces.length === 0) return null;

              return (
                <div key={category} className="my-3 border-b md:pb-3">
                  <h4 className="text-lg mb-3 flex items-center">
                    {categoryIcons[category]}
                    <span className="ml-2">{categoryLabels[category]}</span>
                  </h4>
                  <ul>
                    {filteredPlaces.map((place: any) => {
                      const distance = calculateDistance(
                        latitude, 
                        longitude, 
                        place.geometry.location.lat, 
                        place.geometry.location.lng
                      ).toFixed(2);

                      return (
                        <li key={place.place_id} className="flex justify-between mb-3">
                          <div>
                            <p className="text-sm text-gray-800 font-medium">
                              {place.name}{" "}
                              <span className="text-gray-500 text-xs">({distance} km)</span>
                            </p>
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
            })
          ) : (
            // 더미 데이터 표시 (블러 처리됨)
            dummyCategories.map((category) => (
              <div key={category} className="my-3 border-b md:pb-3">
                <h4 className="text-lg mb-3 flex items-center">
                  {categoryIcons[category]}
                  <span className="ml-2">{categoryLabels[category]}</span>
                </h4>
                <ul>
                  {dummyPlaces.map((place, index) => (
                    <li key={index} className="flex justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-800 font-medium">
                          {place.name}{" "}
                          <span className="text-gray-500 text-xs">({place.distance} km)</span>
                        </p>
                      </div>
                      <div className="flex items-center">
                        {renderStars(place.rating)}
                        <span className="text-xs ml-4 text-gray-500 w-20 text-right">
                          {place.reviews} reviews
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* 가운데 버튼 오버레이 */}
        {!showPlaces && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
            <button
              onClick={fetchNearbyPlaces}
              disabled={loading}
              className="flex items-center space-x-3 px-6 py-3 bg-white border-2 border-orange-600 text-orange-600 rounded-xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg backdrop-blur-sm"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-lg" />
                  <span className="font-medium">Loading...</span>
                </>
              ) : (
                <>
                  <span className="font-medium">Show Nearby Places</span>
                  <FaChevronDown className="text-sm" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyPlaces;