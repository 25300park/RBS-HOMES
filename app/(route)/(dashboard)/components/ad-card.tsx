import React from "react";
import Link from "next/link";

interface AdCardProps {
  desktopImageUrl: string;
  mobileImageUrl: string;
  link: string;
}

const AdCard: React.FC<AdCardProps> = ({
  desktopImageUrl,
  mobileImageUrl,
  link,
}) => {
  return (
    <div className="relative  transition-all duration-300 bg-white rounded-md col-span-2 xs:col-span-1">
      <div className="relative w-full pt-[60%] xs:pt-[97%] rounded-md overflow-hidden">
        {/* 배경 이미지 */}
        <img
          src={desktopImageUrl}
          alt="Advertisement"
          className="absolute top-0 left-0 w-full h-full transition-all duration-300 xs:hidden"
        />

        <img
          src={mobileImageUrl}
          alt="Advertisement"
          className="absolute top-0 left-0 w-full h-full  transition-all duration-300 hidden xs:block"
        />

        {/* 데스크탑 버전 클릭 영역 */}
        <div className="xs:hidden">
          {/* 1번 버튼 */}
          <div className="absolute bottom-[40%] right-[5%] w-[48%] max-w-[400px] cursor-pointer hover:opacity-80">
            <Link
              href="https://example.com/product1"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label="Advertisement product 1"
            >
              {/* <div className="bg-blue-500 opacity-30 w-full h-full absolute top-0 left-0"></div> */}
              <img
                src="/assets/images/kakao.png"
                alt="kakao id"
                className="w-full h-auto"
              />
            </Link>
          </div>

          {/* 2번 버튼 */}
          <div className="absolute bottom-[25%] right-[5%] w-[48%] max-w-[400px] cursor-pointer hover:opacity-80">
            <Link
              href="pf.kakao.com/_xewwjG"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label="Advertisement product 1"
            >
              {/* <div className="bg-blue-500 opacity-30 w-full h-full absolute top-0 left-0"></div> */}
              <img
                src="/assets/images/kakaoOpen.png"
                alt="kakao id"
                className="w-full h-auto"
              />
            </Link>
          </div>

          {/* 3번 버튼 */}
          <div className="absolute bottom-[10%] right-[5%] w-[48%] max-w-[400px] cursor-pointer hover:opacity-80">
            <Link
              href="tel:09543498042"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label="Advertisement product 1"
            >
              {/* <div className="bg-blue-500 opacity-30 w-full h-full absolute top-0 left-0"></div> */}
              <img
                src="/assets/images/phone.png"
                alt="kakao id"
                className="w-full h-auto"
              />
            </Link>
          </div>
        </div>

        {/* 모바일 버전 클릭 영역 */}
        <div className="hidden xs:block">
          {/* 첫 번째 클릭 영역 - 모바일 */}
          <div className="absolute bottom-[20%] w-[92%]">
            <Link
              href="https://example.com/product1"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label="Advertisement product 1"
            >
              {/* <div className="bg-blue-500 opacity-30 w-full h-full absolute top-0 left-0"></div> */}
              <img
                src="/assets/images/kakao.png"
                alt="kakao id"
                className="w-full h-auto"
              />
            </Link>
          </div>

          {/* 두 번째 클릭 영역 - 모바일 */}
          <div className="absolute bottom-[10%] w-[92%]">
            <Link
              href="https://example.com/product1"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label="Advertisement product 2"
            >
              {/* <div className="bg-green-500 opacity-30 w-full h-full absolute top-0 left-0"></div> */}
              <img
                src="/assets/images/kakaoOpen.png"
                alt="kakao id"
                className="w-full h-auto"
              />
            </Link>
          </div>

          {/* 세 번째 클릭 영역 - 모바일 */}
          <div className="absolute bottom-[0%] w-[92%]">
            <Link
              href="tel:09543498042"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label="Advertisement product 3"
            >
              {/* <div className="bg-blue-500 opacity-30 w-full h-full absolute top-0 left-0"></div> */}
              <img
                src="/assets/images/phone.png"
                alt="kakao id"
                className="w-full h-auto"
              />
            </Link>
          </div>
        </div>

        {/* 광고 표시 */}
        <span className="absolute bottom-2 right-2 text-xs bg-black bg-opacity-60 text-white px-2 py-1 rounded">
          Sponsored
        </span>
      </div>
    </div>
  );
};

export default AdCard;
