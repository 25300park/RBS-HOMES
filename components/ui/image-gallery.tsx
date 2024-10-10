import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import React from "react";
import { IoIosArrowBack } from "react-icons/io"; // 화살표 아이콘 추가

interface ImageGalleryProps {
  images: string[]; // 이미지 URL 배열을 props로 받음
  onViewAllClick?: () => void; // 'View all photos' 클릭 시 호출될 함수
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const sideImages = images.slice(1, 5); // 나머지 이미지를 사이드 이미지로 설정 (최대 4개)

  return (
    <Drawer>
      <div className="grid grid-cols-4 gap-2 relative">
        {/* 메인 이미지 */}
        <DrawerTrigger asChild>
          <div className="col-span-2 row-span-2">
            <img
              src={images[0]}
              alt="Main"
              className="w-full h-full object-cover rounded-lg cursor-pointer"
              style={{ aspectRatio: "4/3" }} // 메인 이미지 비율
            />
          </div>
        </DrawerTrigger>

        {/* 사이드 이미지들 */}
        {sideImages.map((image, index) => (
          <DrawerTrigger asChild key={index}>
            <div className="relative">
              <img
                src={image}
                alt={`Side ${index + 1}`}
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                style={{ aspectRatio: "1/1" }} // 사이드 이미지 비율
              />
            </div>
          </DrawerTrigger>
        ))}

        {/* "Show all photos" 버튼 */}
        <DrawerTrigger asChild>
          <button className="absolute right-5 bottom-5 bg-white px-4 py-2 rounded-lg shadow-md text-sm font-semibold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            Show all photos
          </button>
        </DrawerTrigger>

        {/* 빈 공간 처리 */}
        {sideImages.length < 4 &&
          [...Array(4 - sideImages.length)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg"
              style={{ aspectRatio: "1/1" }}
            ></div>
          ))}
      </div>

      {/* DrawerContent에 전체 이미지 표시 */}
      <DrawerContent className="h-screen">
        <DrawerClose className="absolute top-4 left-4">
          <IoIosArrowBack size={30} className="text-gray-700 cursor-pointer" />
        </DrawerClose>
        <DrawerHeader>
          <DrawerTitle>Image Gallery</DrawerTitle>
        </DrawerHeader>
        <div className="grid grid-cols-3 gap-4 p-4 overflow-y-auto">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Gallery ${index}`}
              className="w-full max-h-[600px] object-cover rounded-lg"
            />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ImageGallery;
