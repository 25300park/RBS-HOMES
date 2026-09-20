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
    <div className="flex items-center px-2 sm:px-6 relative w-full">
      {showLeftArrow && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-1 sm:left-2 z-10 p-1.5 rounded-full bg-white/90 shadow-md hover:bg-zinc-100 transition-all border border-zinc-200 backdrop-blur-md bottom-3.5"
        >
          <MdOutlineArrowBack className="text-base text-zinc-700" />
        </button>
      )}

      <div className="relative w-full flex items-center">
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        )}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}

        <div
          ref={sliderRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar justify-center"
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
                className="flex flex-col justify-center items-center min-w-[76px] sm:min-w-[68px] h-full cursor-pointer group py-1"
                onClick={() => handleAmenityClick(amenity.label)}
              >
                <div
                  className={`relative ${
                    isSelected ? "scale-125" : ""
                  } w-[19px] h-[19px] transition-transform transform-gpu group-active:scale-90 duration-300`}
                >
                  <Image
                    src={imageSrc}
                    alt={amenity.label}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      if (isSelected) {
                        (e.target as HTMLImageElement).src = amenity.imagePath;
                      }
                    }}
                  />
                </div>
                <span
                  className={`text-[11px] sm:text-[10px] font-bold w-fit pb-1.5 text-center pt-1.5 border-b-2 transition-all ${
                    isSelected
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-zinc-600 group-hover:border-zinc-300"
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
          className="absolute right-1 sm:right-2 z-10 p-1.5 rounded-full bg-white/90 shadow-md hover:bg-zinc-100 transition-all border border-zinc-200 backdrop-blur-md bottom-3.5"
        >
          <MdOutlineArrowForward className="text-base text-zinc-700" />
        </button>
      )}
    </div>
  );
};

export default MainAmenityList;
