"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/effect-fade";

interface ThumbSliderProps {
  imageUrls: string[];
}

const ThumbSlider: React.FC<ThumbSliderProps> = ({ imageUrls }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0); // 현재 활성화된 인덱스

  return (
    <div className="w-full relative">
      {/* Main Image Swiper */}
      <Swiper
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)} // 슬라이드 변경 시 인덱스 업데이트
        modules={[FreeMode, Navigation, Thumbs]}
        className="mainSwiper"
        style={{ width: "100%", height: "400px", borderRadius: "16px" }} // 고정 크기 설정
      >
        {imageUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <img
              src={url}
              alt={`Main Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
        
        {/* 우측 하단에 이미지의 현재 인덱스와 총 이미지 수 표시 */}
        <div className="absolute bottom-2 right-2 bg-[#0e0e0e96] text-white px-2 py-1 rounded z-20 w-16 text-sm text-center">
          {activeIndex + 1} / {imageUrls.length}
        </div>
      </Swiper>

      {/* Thumbnail Navigation Swiper */}
      {imageUrls.length > 0 && (
        <Swiper
          onSwiper={setThumbsSwiper} // thumbsSwiper 설정
          spaceBetween={10}
          slidesPerView={5.5}
          freeMode={true}
          watchSlidesProgress={true}
          navigation={true} // 썸네일 슬라이더에 화살표 추가
          modules={[FreeMode, Navigation, Thumbs]}
          className="thumbSwiper mt-4"
          style={{ height: "150px" }} // 고정 크기 설정
        >
          {imageUrls.map((url, index) => (
            <SwiperSlide key={index}>
              <img
                src={url}
                alt={`Thumbnail ${index + 1}`}
                className={`w-full h-full object-cover cursor-pointer ${
                  activeIndex === index ? "border-2 border-[#00BCD4]" : ""
                }`}
                style={{
                  borderRadius: "16px",
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default ThumbSlider;
