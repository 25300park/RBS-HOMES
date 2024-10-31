import React from "react";
import {
  FaBed,
  FaBath,
  FaParking,
  FaRulerCombined,
  FaDog,
  FaCouch,
  FaCalendarAlt,
} from "react-icons/fa"; // FontAwesome 아이콘 사용
import { MdPlace } from "react-icons/md";
import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";
import { getRelativeTime } from "@/lib/utils";
import { amenitiesData } from "@/lib/config/amenities"; // 어메니티 데이터 임포트

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
    yearCompletion?: string;
    admin: any;
    lastUpdate: any;
    sellType: string;
    amenity: string;
  };
}

const PropertyInfo: React.FC<PropertyInfoProps> = ({ property }) => {
  return (
    <div className="my-6 space-y-8 xl:px-2 md:space-y-0">
      {/* 상단 헤더 정보 */}
      <section className="">
        <div className="flex w-full items-center justify-between md:flex-col  md:items-start md:p-4 md:space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 hidden md:block">
            {property.title}
          </h2>
          <div className="flex items-center">
            {/* <MdPlace className="mr-2 text-2xl text-gray-600 " /> */}

            <div className="flex flex-col">
              <p className="text-gray-800 mt-1 text-xl md:text-sm">
                {property.address2}, {property.address3}, {property.address4}
              </p>
              <p>
                {property.area} sqm ·{" "}
                {property.bed === 0 ? "studio" : `${property.bed} rooms`} ·{" "}
                {property.bath} baths
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400 md: mt-2">
            last updated at {getRelativeTime(property.lastUpdate)}
          </div>
        </div>
      </section>

      <section className="flex h-full justify-between gap-10 md:px-4">
        <div className="flex flex-col max-w-[65%] md:w-full md:max-w-full">
          <div className="flex items-center py-8 border-y">
            <Avatar className="w-12 h-12 rounded-full mr-3">
              <AvatarImage
                src={property.admin.image}
                alt="User profile"
                className="w-full h-full object-cover"
              />
              <AvatarFallback>
                <FaRegUser className="text-xl" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Hosted by {property.admin.name}</p>
              <p className="text-sm text-gray-500">
                {property.admin.email
                  .split("@")
                  .map((part: any, index: number) =>
                    index === 0 ? part.slice(0, -4) + "****" : "@" + part
                  )
                  .join("")}
              </p>
            </div>
            {/* 잘로/ 라이센스/ 회사/ 페이스북 정보 */}
          </div>

          {/* 메모 */}
          <div className="border-b border-gray-200 py-8 text-gray-700 space-y-4">
            <h3 className="text-xl font-medium text-gray-800">Description</h3>
            <p className="text-base">{property.note}</p>
          </div>

          {/* 부동산 주요 정보 */}
          <div className="py-12 space-y-4 border-b md:py-6">
            <h3 className="text-xl font-medium text-gray-800">
              Property Information
            </h3>
            <div className="grid grid-cols-3 text-gray-800 gap-6 md:grid-cols-2 md:gap-3">
              {/* 면적 */}
              <div className="flex flex-col gap-6 p-4 border rounded-lg">
                <FaRulerCombined className="mr-2 text-lg" />
                <div>
                  <p className="text-gray-500 mb-1">Area</p>
                  <p>{property.area} sqm</p>
                </div>
              </div>

              {/* 침실 */}
              <div className="flex flex-col gap-6 p-4 border rounded-lg">
                <FaBed className="mr-2 text-lg" />
                <div>
                  <p className="text-gray-500 mb-1">Bedrooms</p>
                  <p>
                    {property.bed === 0 ? "studio" : `${property.bed} rooms`}
                  </p>
                </div>
              </div>

              {/* 욕실 */}
              <div className="flex flex-col gap-6 p-4 border rounded-lg">
                <FaBath className="mr-2 text-lg" />
                <div>
                  <p className="text-gray-500 mb-1">Bathrooms</p>
                  <p>{property.bath} rooms</p>
                </div>
              </div>

              {/* 주차 공간 */}
              {property.parking !== undefined && (
                <div className="flex flex-col gap-6 p-4 border rounded-lg">
                  <FaParking className="mr-2 text-lg" />
                  <div>
                    <p className="text-gray-500 mb-1">Parking Spaces</p>
                    <p>{property.parking} spaces</p>
                  </div>
                </div>
              )}

              {/* 완공 연도 */}
              {property.yearCompletion && (
                <div className="flex flex-col gap-6 p-4 border rounded-lg">
                  <FaCalendarAlt className="mr-2 text-lg" />
                  <div>
                    <p className="text-gray-500 mb-1">Year of Completion</p>
                    <p>{property.yearCompletion} year</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className=" space-y-4 md:py-6 py-12 border-b">
            <h3 className="text-xl font-medium text-gray-800">
              Property Details
            </h3>
            <div className="grid grid-cols-3 gap-6  md:gap-2 md:grid-cols-1">
              {/* 가구 정보 */}
              {property.furniture && (
                <div className="flex flex-col gap-6 p-4 border rounded-lg">
                  <FaCouch className="mr-2 text-lg" />
                  <div>
                    <p className="text-gray-500 mb-1">Furniture</p>
                    <p>{property.furniture}</p>
                  </div>
                </div>
              )}

              {/* 내부 인테리어 */}
              {property.interiored && (
                <div className="flex flex-col gap-6 p-4 border rounded-lg">
                  <FaRulerCombined className="mr-2 text-lg" />
                  <div>
                    <p className="text-gray-500 mb-1">Interior Style</p>
                    <p>{property.interiored}</p>
                  </div>
                </div>
              )}

              {/* 애완동물 정책 */}
              {property.petPolicy && (
                <div className="flex flex-col gap-6 p-4 border rounded-lg">
                  <FaDog className="mr-2 text-lg" />
                  <div>
                    <p className="text-gray-500 mb-1">Pet Policy</p>
                    <p>{property.petPolicy}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 어메니티 정보 */}
          <div className="py-12 space-y-4">
            <h3 className="text-xl font-medium text-gray-800">Amenity List</h3>
            <div className="grid grid-cols-2 gap-6">
              {JSON.parse(property.amenity).map((amenity: any) => {
                const amenityData = amenitiesData.find(
                  (item) => item.label === amenity
                );
                return (
                  amenityData && (
                    <div key={amenity} className="flex  items-center gap-4">
                      <amenityData.icon className="text-2xl text-gray-600" />
                      <p>{amenityData.label}</p>
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>

        {/* sticky */}
        <div className="w-[500px] border sticky h-[200px] top-24 self-start p-4 shadow-lg rounded-lg flex flex-col justify-between md:hidden">
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            ₱
            {Number(property.price)?.toLocaleString("en-US", {
              minimumFractionDigits: 0,
            })}
            <span className="ml-2 font-light text-lg">
              for {property.sellType}
            </span>
          </p>
          스케줄 관련 체크
          <button className="w-full bg-orange-400 text-white py-3 rounded-lg hover:bg-orange-500">
            Reserve
          </button>
        </div>
      </section>
    </div>
  );
};

export default PropertyInfo;
