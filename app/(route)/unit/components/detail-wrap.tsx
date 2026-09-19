'use client'

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
import PresaleMainImg from "./presale-main-img";
import { parseImages } from "@/lib/utils";

interface DetailWrapProps {
  property: any;
  unitId: any;
}

const DetailWrap: React.FC<DetailWrapProps> = ({ property, unitId }) => {
  const city = property.address2?.split(",")[0]?.trim();
  const address = property.address3;
  const isPreSale = property.sellType === "presale";

  // 프리세일일 경우 PreSalePropertyInfo만 렌더링
  if (isPreSale) {
    const images = parseImages(property.images);
    const mainImage = images[0];

    return (
      <div className="w-full space-y-4 pt-1 sm:pt-4">
        {/* Top Action Bar (Visible on all devices - Share, Save, More) */}
        <div className="flex items-center justify-between w-full bg-white px-4 sm:px-6 py-3.5 sm:py-4 rounded-none border-y border-zinc-200 border-x-0 shadow-none">
          <h2 className="text-sm sm:text-base font-black text-zinc-900 truncate flex-1 pr-4">
            {property.title}
          </h2>
          <div className="flex gap-2.5 sm:gap-3 items-center shrink-0">
            <ShareBtn withDetail />
            <FavoriteButton
              unitId={property.id}
              initialIsFavorited={property.isFavorited}
              withDetail
            />
            <MoreBtn unitId={unitId} adminId={property.adminId}/>
          </div>
        </div>

        {mainImage && (
          <div className="w-full rounded-3xl overflow-hidden shadow-sm">
            <PresaleMainImg
              isFavorited={property.isFavorited}
              unitId={property.id}
              mainImage={mainImage}
            />
          </div>
        )}

        <PreSalePropertyInfo property={property} />
        
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-3">
          <h3 className="text-lg font-black text-zinc-900">Location & Vicinity</h3>
          <InteractiveMap
            latitude={property.latitude}
            longitude={property.longitude}
          />
        </div>
      </div>
    );
  }

  // 일반 매물일 경우
  return (
    <div className="w-full space-y-4 pt-1 sm:pt-4">
      {/* Top Action Bar (Visible on all devices - Share, Save, More) */}
      <div className="flex items-center justify-between w-full bg-white px-4 sm:px-6 py-3.5 sm:py-4 rounded-none border-y border-zinc-200 border-x-0 shadow-none">
        <h2 className="text-sm sm:text-base font-black text-zinc-900 truncate flex-1 pr-4">
          {property.title}
        </h2>
        <div className="flex gap-2.5 sm:gap-3 items-center shrink-0">
          <ShareBtn withDetail />
          <FavoriteButton
            unitId={property.id}
            initialIsFavorited={property.isFavorited}
            withDetail
          />
          <MoreBtn unitId={unitId} adminId={property.adminId}/>
        </div>
      </div>

      {/* Main Image Gallery (#55 - r=6px) */}
      <div className="w-full rounded-[6px] overflow-hidden shadow-none">
        <GalleryConverter
          images={parseImages(property.images)}
          isFavorited={property.isFavorited}
          unitId={property.id}
        />
      </div>

      <PropertyInfo property={property} />

      {/* Location Map Section (#49) */}
      <div className="bg-white rounded-none p-6 sm:p-8 border-y border-zinc-200 border-x-0 shadow-none space-y-4">
        <h3 className="text-lg font-black text-zinc-900">Location Map</h3>
        <InteractiveMap
          latitude={property.latitude}
          longitude={property.longitude}
        />
      </div>

      <AreaBannerSwiper unitCity={city} unitAddress={address} />

      {/* Neighborhood & Nearby Places Section (#50) */}
      <div className="bg-white rounded-none p-6 sm:p-8 border-y border-zinc-200 border-x-0 shadow-none space-y-4 border-t-0">
        <h3 className="text-lg font-black text-zinc-900">Neighborhood & Nearby Places</h3>
        <NearbyPlaces
          latitude={property.latitude}
          longitude={property.longitude}
        />
      </div>
    </div>
  );
};

export default DetailWrap;
