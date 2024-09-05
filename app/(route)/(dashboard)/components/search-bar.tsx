"use client";

import React, { useState } from "react";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/autoplay";
export default function Banner() {
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const onSwiper = (swiper: any) => {
    setSwiperInstance(swiper);
    setActiveIndex(swiper.realIndex); // 초기 활성 슬라이드 인덱스 설정
    swiper.on("slideChange", () => setActiveIndex(swiper.realIndex)); // 슬라이드 변경 시 인덱스 업데이트
  };

  // 특정 슬라이드로 이동 및 자동 재생 시작
  const goToSlide = (index: any) => {
    if (swiperInstance) {
      swiperInstance.slideTo(index); // 슬라이드 이동
    }
  };

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        spaceBetween={10}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 7000,
          disableOnInteraction: false, // 사용자 상호작용 후에도 자동 재생 계속
        }}
        pagination={{
          clickable: true,
        }}
        onSwiper={onSwiper}
        // onSlideChange={() => console.log("slide change")}
        className="min-h-[330px] desk"
      >
        <SwiperSlide className="relative w-full min-h-[330px]">11</SwiperSlide>
        <SwiperSlide className="relative w-full min-h-[330px]">22</SwiperSlide>
        <SwiperSlide className="relative w-full min-h-[330px]">33</SwiperSlide>
        <SwiperSlide className="relative w-full min-h-[330px]">44</SwiperSlide>
      </Swiper>
    </div>
  );
}
