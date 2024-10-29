import { useRef, useState, useEffect } from "react";
import { MdOutlineArrowBack, MdOutlineArrowForward } from "react-icons/md";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { amenitiesData } from "@/lib/config/amenities";

const MainAmenityList = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedAmenities = searchParams.get("amenities")?.split(",") || [];

  // 스크롤 핸들
  const handleScroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -500 : 500;
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Update arrow visibility based on scroll position
  const updateArrowsVisibility = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      console.log(scrollLeft, scrollWidth, clientWidth);
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  // 스크롤이벤추가
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

  // 어메니티 선택
  const handleAmenityClick = (amenity: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    let newSelectedAmenities = [...selectedAmenities];
    
    if (selectedAmenities.includes(amenity)) {
      newSelectedAmenities = newSelectedAmenities.filter(item => item !== amenity);
    } else {
      newSelectedAmenities.push(amenity);
    }

    // Update URL params
    if (newSelectedAmenities.length === 0) {
      newParams.delete("amenities");
    } else {
      newParams.set("amenities", newSelectedAmenities.join(","));
    }

    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className=" flex items-center px-10  md:px-4 md:pt-0 relative w-[84%] 4xl:w-[80%] 2xl:w-[70%] xl:w-[65%] md:w-full">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-12 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 
                    transition-all border backdrop-blur-3xl bottom-6 md:left-4"
        >
          <MdOutlineArrowBack className="text-xl" />
        </button>
      )}

      {/* Slider Container */}
      <div className="relative w-full flex items-center">
        {/* Gradient Overlays */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-32 md:w-16 
                        bg-gradient-to-r from-white to-transparent pointer-events-none" />
        )}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-16 
                        bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}

        {/* Amenities List */}
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar md:gap-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {amenitiesData.map((amenity, index) => {
            const isSelected = selectedAmenities.includes(amenity.label);
            
            return (
              <div
                key={index}
                className={`flex flex-col justify-center items-center min-w-[100px] md:min-w-[85px] 
                          h-full cursor-pointer group transition-all duration-200`}
                onClick={() => handleAmenityClick(amenity.label)}
              >
                <span className="text-gray-600 text-2xl group-active:text-[22px] 
                              transition-all duration-200">
                  {<amenity.icon />}
                </span>
                <span
                  className={`text-xs w-fit pb-3 text-center pt-2 border-b-2
                            transition-all duration-300 group-active:scale-90 
                            group-hover:border-gray-200
                            ${isSelected ? "border-black" : "border-transparent"}`}
                >
                  {amenity.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-12 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 
                    transition-all border backdrop-blur-3xl bottom-6 md:right-4"
        >
          <MdOutlineArrowForward className="text-xl" />
        </button>
      )}
    </div>
  );
};

export default MainAmenityList;