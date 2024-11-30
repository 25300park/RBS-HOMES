import Image from "next/image";
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
    let newSelectedAmenities = [...selectedAmenities];

    if (selectedAmenities.includes(amenity)) {
      newSelectedAmenities = newSelectedAmenities.filter(
        (item) => item !== amenity
      );
    } else {
      newSelectedAmenities.push(amenity);
    }

    if (newSelectedAmenities.length === 0) {
      newParams.delete("amenities");
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
          className="absolute left-12 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 
                    transition-all border backdrop-blur-3xl bottom-6 md:left-4"
        >
          <MdOutlineArrowBack className="text-xl" />
        </button>
      )}

      <div className="relative w-full flex items-center">
        {showLeftArrow && (
          <div
            className="absolute left-0 top-0 bottom-0 w-32 md:w-16 
                        bg-gradient-to-r from-white to-transparent pointer-events-none"
          />
        )}
        {showRightArrow && (
          <div
            className="absolute right-0 top-0 bottom-0 w-32 md:w-16 
                        bg-gradient-to-l from-white to-transparent pointer-events-none"
          />
        )}

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
                          h-full cursor-pointer group`}
                onClick={() => handleAmenityClick(amenity.label)}
              >
                <div
                  className="relative w-6 h-6 transition-transform transform-gpu
                               group-hover:scale-105 group-active:scale-90 duration-300"
                >
                  <Image
                    src={amenity.imagePath}
                    alt={amenity.label}
                    fill
                    className="object-contain"
                  />
                </div>
                <span
                  className={`text-xs w-fit pb-3 text-center pt-2 border-b-2
                            ${
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
