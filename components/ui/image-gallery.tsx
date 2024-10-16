"use client";

import React, { useState } from "react";
import { Drawer, DrawerClose, DrawerContent } from "@/components/ui/drawer";
import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from "react-icons/io";
import { useSwipeable } from "react-swipeable"; // react-swipeable 라이브러리 사용
import { ShareBtn } from "./share-btn";

interface ImageGalleryProps {
  images: string[]; // 이미지 URL 배열을 props로 받음
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [isFirstDrawerOpen, setIsFirstDrawerOpen] = useState(false); // 첫 번째 드로어 열림 상태
  const [isSecondDrawerOpen, setIsSecondDrawerOpen] = useState(false); // 두 번째 드로어 열림 상태
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  ); // 선택된 이미지 인덱스

  // 이미지 클릭 시 두 번째 드로어 열기
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsSecondDrawerOpen(true); // 두 번째 드로어 열기
  };

  // 이전 이미지로 이동
  const handlePrevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  // 다음 이미지로 이동
  const handleNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  // Swipe 핸들러
  const handlers = useSwipeable({
    onSwipedLeft: handleNextImage, // 왼쪽으로 스와이프 시 다음 이미지로 이동
    onSwipedRight: handlePrevImage, // 오른쪽으로 스와이프 시 이전 이미지로 이동

    trackMouse: false,
  });

  return (
    <>
      {/* 첫 번째 드로어 */}
      <Drawer open={isFirstDrawerOpen} onOpenChange={setIsFirstDrawerOpen}>
        <div className="grid grid-cols-4 gap-2 relative">
          {/* 메인 이미지 */}
          <div
            className="col-span-2 row-span-2"
            onClick={() => setIsFirstDrawerOpen(true)}
          >
            <img
              src={images[0]}
              alt="Main"
              className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-85"
              style={{ aspectRatio: "4/3" }} // 메인 이미지 비율
            />
          </div>

          {/* 사이드 이미지들 */}
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className="relative"
              onClick={() => setIsFirstDrawerOpen(true)}
            >
              <img
                src={image}
                alt={`Side ${index + 1}`}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-85"
                style={{ aspectRatio: "1/1" }} // 사이드 이미지 비율
              />
            </div>
          ))}

          {/* "Show all photos" 버튼 */}
          <button
            className="absolute right-5 bottom-5 bg-white px-4 py-2 rounded-lg shadow-md text-sm font-semibold flex items-center"
            onClick={() => setIsFirstDrawerOpen(true)}
          >
            Show all photos
          </button>
        </div>

        {/* 첫 번째 DrawerContent에 전체 이미지 표시 */}
        <DrawerContent className="h-screen">
          <DrawerClose className="absolute top-4 left-4 hover:bg-[#4a4a4a]">
            <IoIosArrowBack
              size={30}
              className="text-gray-700 cursor-pointer"
            />
          </DrawerClose>
          <div className="grid grid-cols-3 gap-4 p-4 overflow-y-auto">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Gallery ${index}`}
                className="w-full max-h-[600px] object-cover rounded-lg cursor-pointer"
                onClick={() => handleImageClick(index)} // 클릭 시 두 번째 드로어 열기
              />
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* 두 번째 드로어 (이미지 확대용) */}
      <Drawer open={isSecondDrawerOpen} onOpenChange={setIsSecondDrawerOpen}>
        <DrawerContent
          {...handlers}
          className="h-screen flex items-center justify-center bg-black rounded-none border-none"
          hiddenBar
        >
          <div className="fixed top-10 text-white w-full flex justify-between items-center px-20">
            <DrawerClose className="flex items-center text-sm gap-2">
              <IoMdClose size={20} className="text-white cursor-pointer" />
              Close
            </DrawerClose>

            {/* 이미지 인덱스 표시 */}
            {selectedImageIndex !== null && (
              <div>
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
            <div><ShareBtn /></div>
          </div>

          <div className="flex items-center justify-center w-full relative">
            <button
              onClick={handlePrevImage}
              className="absolute left-0 text-white text-4xl p-4 cursor-pointer"
              disabled={selectedImageIndex === 0}
            >
              <IoIosArrowBack />
            </button>
            {selectedImageIndex !== null && (
              <img
                src={images[selectedImageIndex]}
                alt="Full preview"
                className="w-full h-auto max-w-[90vw] max-h-[calc(100vh-200px)] object-contain sm:max-w-[100vw] sm:max-h-[calc(100vh-100px)]"
              />
            )}
            <button
              onClick={handleNextImage}
              className="absolute right-0 text-white text-4xl p-4 cursor-pointer"
              disabled={selectedImageIndex === images.length - 1}
            >
              <IoIosArrowForward />
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ImageGallery;
