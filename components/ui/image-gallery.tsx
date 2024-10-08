import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
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

const ImageGallery = ({ images, onViewAllClick }: ImageGalleryProps) => {
  const mainImage = images[0]; // 첫 번째 이미지를 메인 이미지로 설정
  const sideImages = images.slice(1, 5); // 나머지 이미지를 사이드 이미지로 설정 (최대 4개)

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {/* 메인 이미지 */}
        <div className="col-span-2 row-span-2">
          <Drawer>
            <DrawerTrigger asChild>
              <img
                src={mainImage}
                alt="Main"
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                style={{ aspectRatio: "4/3" }} // 이미지 비율을 4:3으로 설정
              />
            </DrawerTrigger>

            <DrawerContent className="h-screen">
              {/* 화살표 아이콘으로 닫기 버튼 */}
              <DrawerClose className="absolute top-4 left-4">
                <IoIosArrowBack size={30} className="text-gray-700 cursor-pointer" />
              </DrawerClose>

              <DrawerHeader>
                <DrawerTitle>Image Gallery</DrawerTitle>
                <DrawerDescription>View all images below.</DrawerDescription>
              </DrawerHeader>

              {/* 이미지 갤러리 그리드 */}
              <div className="grid grid-cols-3 gap-4 p-4 overflow-y-auto">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Gallery ${index}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* 사이드 이미지들 */}
        {sideImages.map((image, index) => (
          <div key={index} className="relative">
            <Drawer>
              <DrawerTrigger asChild>
                <img
                  src={image}
                  alt={`Side ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg cursor-pointer"
                  style={{ aspectRatio: "1/1" }} // 사이드 이미지 비율을 1:1로 설정
                />
              </DrawerTrigger>

              <DrawerContent className="h-screen">
                {/* 화살표 아이콘으로 닫기 버튼 */}
                <DrawerClose className="absolute top-4 left-4">
                  <IoIosArrowBack size={30} className="text-gray-700 cursor-pointer" />
                </DrawerClose>

                <DrawerHeader>
                  <DrawerTitle>Image Gallery</DrawerTitle>
                  <DrawerDescription>View all images below.</DrawerDescription>
                </DrawerHeader>

                {/* 이미지 갤러리 그리드 */}
                <div className="grid grid-cols-3 gap-4 p-4 overflow-y-auto">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Gallery ${index}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        ))}

        {/* 마지막 이미지에 "Show all photos" 버튼 추가 */}
        {images.length > 5 && (
          <div className="relative">
            <button
              onClick={onViewAllClick}
              className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm font-semibold flex items-center"
            >
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
          </div>
        )}

        {/* 이미지가 4개 미만일 경우 빈 칸 처리 */}
        {sideImages.length < 4 &&
          [...Array(4 - sideImages.length)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-lg"
              style={{ aspectRatio: "1/1" }} // 빈칸도 1:1 비율 유지
            ></div>
          ))}
      </div>
    </div>
  );
};

export default ImageGallery;
