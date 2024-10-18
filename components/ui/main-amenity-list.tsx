import { useRef, useState, useEffect } from "react";
import { MdOutlineArrowBack, MdOutlineArrowForward } from "react-icons/md";
import { useSearchParams, useRouter, usePathname } from "next/navigation"; // URL 검색 파라미터 관리 훅
import { amenitiesData } from "@/lib/config/amenities";

const MainAmenityList = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 선택된 어메니티 필터 가져오기
  const selectedAmenity = searchParams.get("amenity") || "";

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -500,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 500,
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
    const handleResize = () => {
      updateArrowsVisibility();
    };

    updateArrowsVisibility(); // 초기 업데이트
    window.addEventListener("resize", handleResize); // 창 크기 변경 시 화살표 업데이트

    if (sliderRef.current) {
      sliderRef.current.addEventListener("scroll", updateArrowsVisibility);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (sliderRef.current) {
        sliderRef.current.removeEventListener("scroll", updateArrowsVisibility);
      }
    };
  }, []);

  // 어메니티 클릭 이벤트 핸들러 (한 가지 필터만 유지)
  const handleAmenityClick = (amenity: string) => {
    // 현재 선택된 어메니티가 이미 선택된 경우 필터 제거
    const newParams = new URLSearchParams(searchParams.toString());
    if (amenity === selectedAmenity) {
      newParams.delete("amenity"); // 선택된 어메니티를 다시 클릭하면 필터 해제
    } else {
      newParams.set("amenity", amenity); // 새로운 어메니티 필터 적용
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="relative flex items-center px-10 border-b pt-4 w-full">
      {/* 왼쪽 화살표 */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-12 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-all border backdrop-blur-3xl  bottom-6"
        >
          <MdOutlineArrowBack className="text-xl" />
        </button>
      )}

      {/* 슬라이더 */}
      <div className="relative w-full flex items-center">
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        )}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        )}

        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {amenitiesData.map((amenity, i) => (
            <div
              key={i}
              className={`flex flex-col justify-center items-center min-w-[100px] h-full cursor-pointer group group-active:scale-90 duration-500 transition-all
                ${selectedAmenity === amenity.label ? "" : ""}`} // 선택된 어메니티 강조
              onClick={() => handleAmenityClick(amenity.label)} // 클릭 시 어메니티 필터 적용
            >
              <span className="text-gray-600 text-2xl group group-active:text-[22px] duration-500 transition-all">
                {<amenity.icon />}
              </span>
              <span
                className={`${
                  selectedAmenity === amenity.label
                    ? "border-black"
                    : "border-transparent"
                } text-xs w-fit border-b-2 pb-3 text-center pt-2 group group-active:scale-90 duration-300 transition-all`}
              >
                {amenity.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽 화살표 */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-12 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-all border backdrop-blur-3xl bottom-6"
        >
          <MdOutlineArrowForward className="text-xl" />
        </button>
      )}
    </div>
  );
};

export default MainAmenityList;
