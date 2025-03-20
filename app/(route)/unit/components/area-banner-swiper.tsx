// components/area-banner-swiper.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import { getAreaBanners } from "../action";

interface AreaBannerSwiperProps {
  unitCity?: string;
  unitAddress?: string;
}

const AreaBannerSwiper: React.FC<AreaBannerSwiperProps> = ({ unitCity, unitAddress }) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      if (!unitCity && !unitAddress) {
        setIsLoading(false);
        return;
      }
      
      try {
        const result = await getAreaBanners(unitCity, unitAddress);
        if (result.status === 200) {
          setBanners(result.banners || []);
        }
      } catch (error) {
        console.error("Failed to fetch area banners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [unitCity, unitAddress]);

  // 로딩 중이거나 배너가 없으면 아무것도 표시하지 않음
  if (isLoading || !banners || banners.length === 0) return null;

  return (
    <div className="mt-8 mb-8 bg-white rounded-lg overflow-hidden shadow-md">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={banners.length > 1}
        className="area-banner-swiper"
      >
        {banners.map((banner, index) => {
          // 이미지 데이터 처리 - 이미 객체인 경우와 문자열인 경우 모두 처리
          let images;
          try {
            // 문자열인 경우 파싱
            images = typeof banner.images === 'string' 
              ? JSON.parse(banner.images) 
              : banner.images;
          } catch (e) {
            console.error("Error parsing images:", e);
            return null; // 파싱 실패 시 건너뛰기
          }
          
          // 이미지 배열이 아니면 배열로 변환
          if (!Array.isArray(images)) {
            images = [images].filter(Boolean);
          }
          
          if (!images || images.length === 0) return null;
          
          return images.map((image: any, imgIndex: number) => (
            <SwiperSlide key={`${index}-${imgIndex}`}>
              <div className="relative w-full h-64 md:h-80">
                <img
                  src={image.url}
                  alt={banner.title || "Banner image"}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex flex-col justify-end p-6">
                  <h3 className="text-white text-2xl font-bold">{banner.title}</h3>
                  {banner.description && (
                    <p className="text-white/80 mt-2 line-clamp-2">
                      {banner.description}
                    </p>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ));
        })}
      </Swiper>
    </div>
  );
};

export default AreaBannerSwiper;