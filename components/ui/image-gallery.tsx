"use client";

import React, { useState } from "react";
import { Drawer, DrawerClose, DrawerContent } from "@/components/ui/drawer";
import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from "react-icons/io";
import { useSwipeable } from "react-swipeable";
import { ShareBtn } from "./share-btn";

interface ImageGalleryProps {
  images: string[];
  isPreview?: boolean;
}

// 기본 이미지 경로 상수 정의
const DEFAULT_IMAGE = "/assets/images/cities/BGC.png";

const ImageGallery = ({ images = [], isPreview }: ImageGalleryProps) => {
  // 이미지가 없는 경우 기본 이미지 사용
  const imageList = images && images.length > 0 ? images : [DEFAULT_IMAGE];
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // 이미지 로드 오류 상태 관리
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  // 이미지 오류 처리 함수
  const handleImageError = (index: number) => {
    setFailedImages(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // 안전한 이미지 URL 가져오기
  const getSafeImageUrl = (index: number) => {
    if (failedImages[index] || !imageList[index]) {
      return DEFAULT_IMAGE;
    }
    return imageList[index];
  };

  // 이전 이미지로 이동
  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  // 다음 이미지로 이동
  const handleNextImage = () => {
    if (selectedImageIndex < imageList.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  // Swipe 핸들러
  const handlers = useSwipeable({
    onSwipedLeft: handleNextImage,
    onSwipedRight: handlePrevImage,
    trackMouse: false,
  });

  return (
    <>
      {/* 메인 그리드 */}
      <div className="grid grid-cols-4 gap-2 relative">
        {/* 메인 이미지 */}
        <div
          className="col-span-2 row-span-2"
          onClick={() => setIsDrawerOpen(true)}
        >
          <img
            src={getSafeImageUrl(0)}
            alt="Main"
            className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-85"
            style={{ aspectRatio: "4/3" }}
            onError={() => handleImageError(0)}
          />
        </div>

        {/* 사이드 이미지들 */}
        {imageList.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className="relative"
            onClick={() => {
              setSelectedImageIndex(index + 1);
              setIsDrawerOpen(true);
            }}
          >
            <img
              src={getSafeImageUrl(index + 1)}
              alt={`Side ${index + 1}`}
              className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-85"
              style={{ aspectRatio: "1/1" }}
              onError={() => handleImageError(index + 1)}
            />
          </div>
        ))}

        {/* "Show all photos" 버튼 */}
        <button
          className="absolute right-5 bottom-5 bg-white px-4 py-2 rounded-lg shadow-md text-sm font-semibold flex items-center"
          onClick={() => setIsDrawerOpen(true)}
        >
          Show all photos
        </button>
      </div>

      {/* 단일 드로어 */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent
          {...handlers}
          className="h-screen rounded-none border-none bg-black"
        >
          <div className="fixed top-10 text-white w-full flex justify-between items-center px-10 z-10">
            <DrawerClose className="flex items-center text-sm gap-2 hover:bg-[#4a4a4a] p-2 px-3 rounded-lg">
              <IoMdClose size={20} className="text-white cursor-pointer" />
              Close
            </DrawerClose>

            {/* 이미지 인덱스 표시 */}
            <div>
              {selectedImageIndex + 1} / {imageList.length}
            </div>

            {!isPreview && (
              <div>
                <ShareBtn darkmode />
              </div>
            )}
          </div>

          <div className="flex h-full pt-24 pb-10 px-5">
            {/* 메인 이미지 영역 - 최대 사이즈로 수정 */}
            <div className="flex-1 relative flex items-center justify-center">
              <button
                onClick={handlePrevImage}
                className="absolute left-4 text-white text-4xl p-4 cursor-pointer z-10 bg-black/20 rounded-full hover:bg-black/40"
                disabled={selectedImageIndex === 0}
              >
                <IoIosArrowBack />
              </button>
              
              {/* 이미지를 최대 사이즈로 표시하기 위한 컨테이너 */}
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={getSafeImageUrl(selectedImageIndex)}
                  alt="Full preview"
                  className="max-w-[calc(100vw-350px)] max-h-[calc(100vh-150px)] object-contain"
                  onError={() => handleImageError(selectedImageIndex)}
                />
              </div>
              
              <button
                onClick={handleNextImage}
                className="absolute right-4 text-white text-4xl p-4 cursor-pointer z-10 bg-black/20 rounded-full hover:bg-black/40"
                disabled={selectedImageIndex === imageList.length - 1}
              >
                <IoIosArrowForward />
              </button>
            </div>
            
            {/* 사이드바 썸네일 영역 */}
            <div className="w-64 ml-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 p-2">
                {imageList.map((image, index) => (
                  <div 
                    key={index}
                    className={`cursor-pointer ${
                      selectedImageIndex === index ? "ring-2 ring-white" : ""
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={getSafeImageUrl(index)}
                      alt={`Thumbnail ${index}`}
                      className="w-full h-full object-cover"
                      style={{ aspectRatio: "1/1" }}
                      onError={() => handleImageError(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ImageGallery;