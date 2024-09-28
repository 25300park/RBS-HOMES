import React from "react";
import ThumbSlider from "@/components/ui/thumb-slider";
import AdminInfo from "./admin-info";
import PropertyInfo from "./property-info";
import StaticMap from "@/components/ui/static-map";
import NearbyPlaces from "./near-by-places";

interface DetailWrapProps {
  property: any;
}

const DetailWrap: React.FC<DetailWrapProps> = ({ property }) => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex space-x-8">
        {/* Left Section - Property Info and Slider */}
        <div className="flex-1 space-y-8">
          <div className="w-[900px]">
            <ThumbSlider imageUrls={JSON.parse(property.images)} /> {/* 이미지 슬라이더 */}
          </div>
          <PropertyInfo property={property} /> {/* 유닛의 상세 정보 */}
          <StaticMap
            latitude={property.latitude}
            longitude={property.longitude}
          />
          {/* 유닛 위치 지도 */}
          <NearbyPlaces
            latitude={property.latitude}
            longitude={property.longitude}
          />
        </div>

        {/* Right Section - Admin Info (Sticky) */}
        <div className="w-full">
          <AdminInfo admin={property.admin} />
        </div>
      </div>
    </div>
  );
};

export default DetailWrap;
