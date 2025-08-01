import React from "react";
import ThumbSlider from "@/components/ui/thumb-slider";
import AdminInfo from "./admin-info";
import PropertyInfo from "./property-info";
import PreSalePropertyInfo from "./presale-property-info";
import StaticMap from "@/components/ui/static-map";
import NearbyPlaces from "./near-by-places";
import ImageGallery from "@/components/ui/image-gallery";
import { IoMdShare } from "react-icons/io";
import FavoriteButton from "@/components/favorite-button";
import GalleryConverter from "./gallery-converter";
import { ShareBtn } from "@/components/ui/share-btn";
import AreaBannerSwiper from "./area-banner-swiper";
import MoreBtn from "@/components/ui/more-btn";
import InteractiveMap from "@/components/ui/interactive-map";
import Image from "next/image";

interface DetailWrapProps {
  property: any;
}

const DetailWrap: React.FC<DetailWrapProps> = ({ property }) => {
  const city = property.address2?.split(",")[0]?.trim();
  const address = property.address3;
  const isPreSale = property.sellType === "presale";

  // 프리세일일 경우 PreSalePropertyInfo만 렌더링
  if (isPreSale) {
    const images = property.images ? JSON.parse(property.images) : [];
    const mainImage = images[0];

    return (
      <div className="container mx-auto py-4 md:py-0">
        <div className="flex-1 space-y-4 md:space-y-0">
          {/* 타이틀과 버튼들 - 기존 위치 유지 */}
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
              <div>
                <MoreBtn />
              </div>
            </div>
          </div>

          {/* 메인 이미지 - 크게, 라운디드 없이 */}
          {mainImage && (
            <div className="w-full">
              <div className="relative w-full h-[800px] overflow-hidden">
                <Image
                  src={mainImage}
                  alt="Main project image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          
          <PreSalePropertyInfo property={property} />
        </div>
      </div>
    );
  }

  // 일반 매물일 경우 기존 구조 그대로
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
            <div>
              <MoreBtn />
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

        <PropertyInfo property={property} />

        <InteractiveMap
          latitude={property.latitude}
          longitude={property.longitude}
        />
        <AreaBannerSwiper unitCity={city} unitAddress={address} />
        <NearbyPlaces
          latitude={property.latitude}
          longitude={property.longitude}
        />
      </div>
    </div>
  );
};

export default DetailWrap;
