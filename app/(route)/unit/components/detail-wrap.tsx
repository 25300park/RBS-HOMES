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
import { ShareBtn } from "@/components/ui/share-btn";
import AreaBannerSwiper from "./area-banner-swiper";

interface DetailWrapProps {
  property: any;
}

const DetailWrap: React.FC<DetailWrapProps> = ({ property }) => {
  const city = property.address2?.split(",")[0]?.trim();
  const address = property.address3;
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
              <ShareBtn withDetail />
            </div>
            <div>
              <FavoriteButton
                unitId={property.id}
                initialIsFavorited={property.isFavorited}
                withDetail
              />
            </div>
          </div>
        </div>
        <div className="w-full ">
          <GalleryConverter
            images={JSON.parse(property.images)}
            isFavorited={property.isFavorited}
            unitId={property.id}
          />
        </div>
        <PropertyInfo property={property} /> {/* 유닛의 상세 정보 */}
        <StaticMap
          latitude={property.latitude}
          longitude={property.longitude}
        />
        <AreaBannerSwiper unitCity={city} unitAddress={address} />
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
