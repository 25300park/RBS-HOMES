"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from "react-icons/io";
import { useSwipeable } from "react-swipeable";
import { ShareBtn } from "./share-btn";
import { Heart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import FavoriteButton from "../favorite-button";

interface MobileImageGalleryProps {
  images: string[];
  isFavorited: boolean;
  unitId: number;
  isPreview?: boolean;
}

const MobileImageGallery = ({
  images,
  isFavorited = false,
  unitId,
  isPreview,
}: MobileImageGalleryProps) => {
  const [isFirstDrawerOpen, setIsFirstDrawerOpen] = useState(false);
  const [isSecondDrawerOpen, setIsSecondDrawerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  // 캐러셀 네비게이션 함수
  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // 드로어 내 이미지 네비게이션
  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };
  const handleBack = () => {
    // 브라우저의 히스토리 길이 체크
    if (window.history.length > 2) {
      router.back();
    } else {
      // 히스토리가 없으면 기본 경로로 이동
      router.push("/?sellType=rent");
    }
  };

  // 스와이프 핸들러
  const carouselHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    trackMouse: false,
  });

  const fullscreenHandlers = useSwipeable({
    onSwipedLeft: handleNextImage,
    onSwipedRight: handlePrevImage,
    trackMouse: false,
  });

  // 이미지 클릭 핸들러
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsSecondDrawerOpen(true);
  };

  return (
    <>
      {/* 메인 캐러셀 */}
      <div
        className="relative w-full h-[280px] hidden md:block"
        {...carouselHandlers}
      >
        {/* 상단 버튼들 */}
        {!isPreview && (
          <>
            <div className="absolute top-4 left-4 z-20 flex gap-2 items-center">
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md"
              >
                <ArrowLeft size={16} />
              </button>
            </div>
            <div className="absolute top-4 right-4 z-20 flex gap-2 items-center">
              <ShareBtn rounded />
              <FavoriteButton
                rounded
                initialIsFavorited={isFavorited}
                unitId={unitId}
              />
            </div>
          </>
        )}

        {/* 이미지 캐러셀 */}
        <div
          className="relative w-full h-full overflow-hidden"
          onClick={() => {
            setIsFirstDrawerOpen(true);
            setSelectedImageIndex(currentIndex);
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="absolute w-full h-full transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`,
              }}
            >
              <img
                src={image}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* 이미지 인덱스 표시 */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* 첫 번째 드로어 - 그리드 뷰 */}
      <Drawer open={isFirstDrawerOpen} onOpenChange={setIsFirstDrawerOpen}>
        <DrawerContent className="h-[100dvh] rounded-none">
          <div className="fixed top-4 w-full flex justify-between items-center px-6 bg-white border-b pb-4 z-20">
            <DrawerClose className="hover:bg-gray-100 rounded-full p-2">
              <IoIosArrowBack size={24} className="text-gray-700" />
            </DrawerClose>
            <ShareBtn />
          </div>

          <div className="overflow-y-auto pt-20 pb-8">
            <div className="grid grid-cols-2 gap-2 px-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square"
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* 두 번째 드로어 - 전체화면 뷰 */}
      <Drawer open={isSecondDrawerOpen} onOpenChange={setIsSecondDrawerOpen}>
        <DrawerContent
          {...fullscreenHandlers}
          className="h-[100dvh] flex items-center justify-center bg-black rounded-none border-black"
          hiddenBar
        >
          <div className="fixed top-6 text-white w-full flex justify-between items-center px-6">
            <DrawerClose className="flex items-center text-sm gap-2 hover:bg-white/20 p-2 rounded-lg">
              <IoMdClose size={20} />
              Close
            </DrawerClose>
            <div className="text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
            <ShareBtn darkmode />
          </div>

          <div className="flex items-center justify-center w-full relative">
            {/* <button
              onClick={handlePrevImage}
              className="absolute left-2 text-white text-4xl p-4 cursor-pointer"
              disabled={selectedImageIndex === 0}
            >
              <IoIosArrowBack />
            </button> */}

            <img
              src={images[selectedImageIndex]}
              alt={`Full preview ${selectedImageIndex + 1}`}
              className="w-full h-auto max-h-[calc(100vh-120px)] object-contain px-4 mt-12"
            />

            {/* <button
              onClick={handleNextImage}
              className="absolute right-2 text-white text-4xl p-4 cursor-pointer"
              disabled={selectedImageIndex === images.length - 1}
            >
              <IoIosArrowForward />
            </button> */}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileImageGallery;
