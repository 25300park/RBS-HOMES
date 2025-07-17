"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { MdOutlineArrowBack, MdOutlineArrowForward } from "react-icons/md";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { amenitiesData } from "@/lib/config/amenities";

// 기본 어메니티 정의
const DEFAULT_AMENITIES:any = [];

const MainAmenityList = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 중요: 사용자가 명시적으로 빈 어메니티를 설정했는지 추적하는 상태 변수
  const [hasExplicitlyEmptySelection, setHasExplicitlyEmptySelection] =
    useState(false);

  // URL에서 어메니티 파라미터 확인
  const amenitiesParam = searchParams.get("amenities");

  // 빈 어메니티 파라미터가 명시적으로 설정되었는지 확인
  useEffect(() => {
    if (amenitiesParam !== null) {
      if (amenitiesParam.trim() === "") {
        setHasExplicitlyEmptySelection(true);
      } else {
        setHasExplicitlyEmptySelection(false);
      }
    } else {
      setHasExplicitlyEmptySelection(false);
    }
  }, [amenitiesParam]);

  // 파라미터가 있고 빈 문자열이 아닌 경우에만 배열로 분할
  const urlAmenities =
    amenitiesParam !== null && amenitiesParam.trim() !== ""
      ? amenitiesParam.split(",")
      : [];

  // 사용자가 명시적으로 빈 선택을 했으면 빈 배열을, 그렇지 않으면 기본값 또는 URL 값을 사용
  const selectedAmenities =
    amenitiesParam === ""
      ? [] // 명시적으로 빈 파라미터가 있으면 빈 배열 사용
      : urlAmenities.length > 0
      ? urlAmenities
      : DEFAULT_AMENITIES;

  const handleScroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -500 : 500;
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const updateArrowsVisibility = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    updateArrowsVisibility();

    const handleResize = () => updateArrowsVisibility();
    window.addEventListener("resize", handleResize);
    slider?.addEventListener("scroll", updateArrowsVisibility);

    return () => {
      window.removeEventListener("resize", handleResize);
      slider?.removeEventListener("scroll", updateArrowsVisibility);
    };
  }, []);

  const handleAmenityClick = (amenity: string) => {
    const newParams = new URLSearchParams(searchParams.toString());

    let newSelectedAmenities: any;

    // 빈 파라미터가 명시적으로 있는 경우 빈 배열에서 시작
    if (amenitiesParam === "") {
      newSelectedAmenities = [];
    }
    // URL에 어메니티 파라미터가 있는 경우 해당 값 사용
    else if (urlAmenities.length > 0) {
      newSelectedAmenities = [...urlAmenities];
    }
    // 그 외의 경우 기본값 사용
    else {
      newSelectedAmenities = [...DEFAULT_AMENITIES];
    }

    // 어메니티 추가/제거 로직
    if (newSelectedAmenities.includes(amenity)) {
      newSelectedAmenities = newSelectedAmenities.filter(
        (item: any) => item !== amenity
      );
    } else {
      newSelectedAmenities.push(amenity);
    }

    // 새 어메니티 목록이 비어있는 경우, 빈 값을 설정하여 명시적으로 빈 선택 표시
    if (newSelectedAmenities.length === 0) {
      newParams.set("amenities", "");
    } else {
      newParams.set("amenities", newSelectedAmenities.join(","));
    }

    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="flex items-center px-10 md:px-4 md:pt-0 relative w-[84%] md:hidden 4xl:w-[80%] 2xl:w-[70%] xl:w-[65%] md:w-full">
      {showLeftArrow && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-12 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-all border backdrop-blur-3xl bottom-6 md:left-4"
        >
          <MdOutlineArrowBack className="text-xl" />
        </button>
      )}

      <div className="relative w-full flex items-center">
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-32 md:w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        )}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}

        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar md:gap-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {amenitiesData.map((amenity, index) => {
            const isSelected = selectedAmenities.includes(amenity.label);
            const imageSrc = isSelected
              ? amenity.imagePath.replace(".png", "_on.png")
              : amenity.imagePath;

            return (
              <div
                key={index}
                className="flex flex-col justify-center items-center min-w-[100px] md:min-w-[85px] h-full cursor-pointer group"
                onClick={() => handleAmenityClick(amenity.label)}
              >
                <div
                  className={`relative ${
                    isSelected ? "scale-150" : ""
                  } w-6 h-6 transition-transform transform-gpu group-active:scale-90 duration-300`}
                >
                  <Image
                    src={imageSrc}
                    alt={amenity.label}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      // 활성화 이미지 로드 실패 시 기본 이미지로 대체
                      if (isSelected) {
                        (e.target as HTMLImageElement).src = amenity.imagePath;
                      }
                    }}
                  />
                </div>
                <span
                  className={`text-xs w-fit pb-3 text-center pt-2 border-b-2 ${
                    isSelected
                      ? "border-black"
                      : "border-transparent group-hover:border-gray-200"
                  }`}
                >
                  {amenity.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showRightArrow && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-12 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-all border backdrop-blur-3xl bottom-6 md:right-4"
        >
          <MdOutlineArrowForward className="text-xl" />
        </button>
      )}
    </div>
  );
};

export default MainAmenityList;
