"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface ThumbSliderForRegisterProps {
  imageUrls: string[];
  onRemoveImage: (index: number) => void;
  onSetMainImage: (index: number) => void;
  mainIndex: number;
}

const ThumbSliderForRegister: React.FC<ThumbSliderForRegisterProps> = ({
  imageUrls,
  onRemoveImage,
  onSetMainImage,
  mainIndex,
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(mainIndex);

  // 메인 이미지로 설정 시 해당 이미지를 맨 앞으로 이동
  useEffect(() => {
    if (activeIndex !== mainIndex) {
      setActiveIndex(mainIndex);
    }
  }, [mainIndex]);

  return (
    <div className="w-full relative">
      {/* Main Image Swiper */}
      <Swiper
        spaceBetween={10}
        navigation={true}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mainSwiper"
        style={{ width: "100%", height: "400px", borderRadius: "16px" }}
      >
        {imageUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div className="relative">
              <img
                src={url}
                alt={`Main Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* 메인 이미지 설정 */}
              <button
                className="absolute bottom-2 left-2 bg-blue-500 text-white px-3 py-1 rounded z-10"
                onClick={() => onSetMainImage(index)}
              >
                Set as Main
              </button>
            </div>
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
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={5.5}
          freeMode={true}
          watchSlidesProgress={true}
          navigation={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="thumbSwiper mt-4"
          style={{ height: "150px" }}
        >
          {imageUrls.map((url, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-[150px]">
                <img
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-full h-full object-cover cursor-pointer ${
                    activeIndex === index ? "border-2 border-[#00BCD4]" : ""
                  }`}
                  style={{ borderRadius: "16px" }}
                />
                {/* 삭제 버튼 */}
                <button
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full z-10"
                  onClick={() => onRemoveImage(index)}
                >
                  &times;
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default ThumbSliderForRegister;
