import React from "react";
import ThumbSlider from "@/components/ui/thumb-slider";
import AdminInfo from "./admin-info";
import PropertyInfo from "./property-info";
import StaticMap from "@/components/ui/static-map";
import NearbyPlaces from "./near-by-places";
import ImageGallery from "@/components/ui/image-gallery";
import { IoMdShare } from "react-icons/io";
import FavoriteButton from "@/components/favorite-button";
import GalleryConverter from "./gallery-converter";

interface DetailWrapProps {
  property: any;
}

const DetailWrap: React.FC<DetailWrapProps> = ({ property }) => {
  return (
    <div className="container mx-auto py-4 md:py-0 ">
      {/* Left Section - Property Info and Slider */}
      <div className="flex-1 space-y-4 md:space-y-0">
        <div className="flex items-center justify-between w-full md:hidden">
          <h2 className="text-2xl font-semibold text-gray-900">
            {property.title}
          </h2>
          <div className="flex gap-4 text-sm items-center">
            <div>
              <p className="underline">Share</p>
            </div>
            <div>
              <p className="underline">Save</p>
            </div>
          </div>
        </div>
        <div className="w-full ">
          {/* <ThumbSlider imageUrls={JSON.parse(property.images)} />  */}
          {/* <ImageGallery images={JSON.parse(property.images)} /> */}
          <GalleryConverter images={JSON.parse(property.images)} />
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
      {/* <div className="w-full">
          <AdminInfo admin={property.admin} />
        </div> */}
    </div>
  );
};

export default DetailWrap;
