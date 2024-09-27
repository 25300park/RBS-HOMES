import React from "react";
import {
  FaBed,
  FaBath,
  FaParking,
  FaRulerCombined,
  FaDog,
  FaCouch,
  FaCalendarAlt,
  FaHouseUser,
} from "react-icons/fa"; // FontAwesome 아이콘 사용
import { MdPlace } from "react-icons/md";

interface PropertyInfoProps {
  property: {
    title: string;
    area: number;
    bed: number;
    bath: number;
    parking?: number;
    price?: number;
    address2: string;
    address3: string;
    address4: string;
    note?: string;
    furniture?: string;
    interiored?: string;
    petPolicy?: string;
    amenity?: string;
    yearCompletion?: string;
  };
}

const PropertyInfo: React.FC<PropertyInfoProps> = ({ property }) => {
  return (
    <div className="my-6">
      {/* 상단 헤더 정보 */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold text-gray-900">{property.title}</h1>
        <p className="text-lg text-gray-600">
          {property.address2}, {property.address3}, {property.address4}
        </p>
        <p className="text-2xl font-semibold text-orange-400 mt-2">
          ${property.price?.toLocaleString()}
        </p>
      </div>

      {/* memo */}
      {property.note && (
        <div className="col-span-2 mt-4 text-gray-600 border-b mb-8 pb-8">
          설명란
          <p className="italic">{property.note}</p>
        </div>
      )}


      {/* 부동산 주요 정보 */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Property Information
      </h3>
      <div className="grid grid-cols-2 gap-6">
        {/* 면적 */}
        <div className="flex items-center space-x-2">
          <FaRulerCombined className="text-orange-400" />
          <p className="text-lg text-gray-700">
            <strong>Area:</strong> {property.area} sqm
          </p>
        </div>

        {/* 침실 */}
        <div className="flex items-center space-x-2">
          <FaBed className="text-orange-400" />
          <p className="text-lg text-gray-700">
            <strong>Bedrooms:</strong> {property.bed}
          </p>
        </div>

        {/* 욕실 */}
        <div className="flex items-center space-x-2">
          <FaBath className="text-orange-400" />
          <p className="text-lg text-gray-700">
            <strong>Bathrooms:</strong> {property.bath}
          </p>
        </div>

        {/* 주차 공간 */}
        {property.parking !== undefined && (
          <div className="flex items-center space-x-2">
            <FaParking className="text-orange-400" />
            <p className="text-lg text-gray-700">
              <strong>Parking Spaces:</strong> {property.parking}
            </p>
          </div>
        )}

        {/* 위치 */}
        <div className="flex items-center space-x-1 col-span-2 ">
          <MdPlace className="text-orange-400 text-xl relative right-1" />
          <strong>Location:</strong> {property.address2}, {property.address3},
          {property.address4}
        </div>

        {/* 완공 연도 */}
        {property.yearCompletion && (
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-orange-400" />
            <p className="text-lg text-gray-700">
              <strong>Year of Completion:</strong> {property.yearCompletion}
            </p>
          </div>
        )}

        {/* 메모 */}
      </div>

      {/* 추가 정보 */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">
        Additional Details
      </h3>
      <div className="grid grid-cols-2 gap-6">
        {/* 가구 정보 */}
        {property.furniture && (
          <div className="flex items-center space-x-2">
            <FaCouch className="text-orange-400" />
            <p className="text-lg text-gray-700">
              <strong>Furniture:</strong> {property.furniture}
            </p>
          </div>
        )}

        {/* 내부 인테리어 */}
        {property.interiored && (
          <div className="flex items-center space-x-2">
            <FaRulerCombined className="text-orange-400" />
            <p className="text-lg text-gray-700">
              <strong>Interior Style:</strong> {property.interiored}
            </p>
          </div>
        )}

        {/* 애완동물 정책 */}
        {property.petPolicy && (
          <div className="flex items-center space-x-2">
            <FaDog className="text-orange-400" />
            <p className="text-lg text-gray-700">
              <strong>Pet Policy:</strong> {property.petPolicy}
            </p>
          </div>
        )}

        {/* 편의시설 */}
        {property.amenity && (
          <div className="flex items-center space-x-2 col-span-2">
            <FaHouseUser className="text-orange-400" />
            <p className="text-lg text-gray-700">
              <strong>Amenities:</strong> {property.amenity}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyInfo;
