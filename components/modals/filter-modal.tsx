"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "../ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getUnitCount, getUnitCountOwner } from "@/lib/action";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/hooks/use-loading";
import SelectionBox from "@/components/ui/select-box";
import {
  sellTypeOption,
  typeOption,
  furnitureOptions,
  petPolicyOption,
} from "@/lib/config/unit-options";
import { amenitiesData } from "@/lib/config/amenities";
import Image from "next/image";

// 추가: 상태 옵션 정의
const statusOptions = [
  { value: "0,3", label: "Available Only" },
  { value: "0,1,3", label: "Include Completed" },
  { value: "1", label: "Completed Only" },
];

interface Filters {
  type: string;
  activeTypes: string; // Changed from sellType to activeTypes
  bed: string;
  bath: string;
  parking: string;
  priceMin: string;
  priceMax: string;
  areaMin: string;
  areaMax: string;
  city: string;
  furniture: string;
  pet: string;
  status: string; // 추가: status 필드
  amenities: string; // 추가: amenities 필드
}

interface FilterModalProps {
  onClose: () => void;
  modalProps?: {
    withSellType: boolean;
    withType: boolean;
    activeTypes?: string; // Changed from sellType to activeTypes
  };
}

// 초기 필터 상태
const initialFilters: Filters = {
  type: "none",
  activeTypes: "rent", // Changed default value
  bed: "0",
  bath: "0",
  parking: "0",
  priceMin: "0",
  priceMax: "1000000",
  areaMin: "0",
  areaMax: "500",
  city: "All Cities",
  furniture: "none",
  pet: "none",
  status: "0,3", // 추가: 기본 상태 값 (진행 중 + 협상 중)
  amenities: "Gym,Pool,24/7 Security,Garden", // 추가: 기본 어메니티 값
};

const FilterModal = ({ onClose, modalProps }: FilterModalProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [unitCount, setUnitCount] = useState(0);
  const { isLoading, startLoading, stopLoading } = useLoading();

  // 필터 상태 초기화 - URL 파라미터 존재하면 사용
  const [filters, setFilters] = useState<Filters>(() => ({
    type: searchParams.get("type") || initialFilters.type,
    activeTypes: searchParams.get("activeTypes") || initialFilters.activeTypes,
    bed: searchParams.get("bed") || initialFilters.bed,
    bath: searchParams.get("bath") || initialFilters.bath,
    parking: searchParams.get("parking") || initialFilters.parking,
    priceMin: searchParams.get("priceMin") || initialFilters.priceMin,
    priceMax: searchParams.get("priceMax") || initialFilters.priceMax,
    areaMin: searchParams.get("areaMin") || initialFilters.areaMin,
    areaMax: searchParams.get("areaMax") || initialFilters.areaMax,
    city: searchParams.get("city") || initialFilters.city,
    furniture: searchParams.get("furniture") || initialFilters.furniture,
    pet: searchParams.get("pet") || initialFilters.pet,
    status: searchParams.get("status") || initialFilters.status, // 추가: status 필드 초기화
    amenities: searchParams.get("amenities") || initialFilters.amenities, // 추가: amenities 필드 초기화
  }));
  const debouncedFilters = useDebounce(filters, 800);

  // 필터 업데이트 함수
  const updateFilter = (field: keyof Filters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value.toString(),
    }));
  };

  // 어메니티 처리를 위한 헬퍼 함수 추가
  const handleAmenityChange = (amenity: string) => {
    const currentAmenities = filters.amenities
      .split(",")
      .filter((a) => a.trim() !== "");
    let newAmenities: string[];

    if (currentAmenities.includes(amenity)) {
      // 이미 선택된 어메니티면 제거
      newAmenities = currentAmenities.filter((a) => a !== amenity);
    } else {
      // 선택되지 않은 어메니티면 추가
      newAmenities = [...currentAmenities, amenity];
    }

    // 빈 배열인 경우 빈 문자열로, 그렇지 않으면 쉼표로 구분된 문자열로 업데이트
    updateFilter(
      "amenities",
      newAmenities.length ? newAmenities.join(",") : ""
    );
  };

  // 숫자 필드 증감 함수
  const adjustCount = (field: keyof Filters, increment: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [field]: increment
        ? ((parseInt(prev[field]) || 0) + 1).toString()
        : Math.max(0, (parseInt(prev[field]) || 0) - 1).toString(),
    }));
  };

  // 필터 적용 함수
  const applyFilters = () => {
    const currentParams = new URLSearchParams(searchParams.toString());

    // 필터 값 검사 및 적용
    Object.entries(filters).forEach(([key, value]) => {
      if (value === initialFilters[key as keyof Filters]) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    });

    router.push(`${pathname}?${currentParams.toString()}`);
    onClose();
  };

  const clearFilters = () => {
    const newFilters = { ...initialFilters };

    // 현재 activeTypes 값 유지 (기존에는 sellType)
    const currentActiveTypes = searchParams.get("activeTypes");
    if (currentActiveTypes) {
      newFilters.activeTypes = currentActiveTypes;
    }

    // 아래 부분 추가: amenities를 초기값으로 재설정
    newFilters.amenities = initialFilters.amenities;

    setFilters(newFilters);
  };

  // 유닛 카운트 조회
  const fetchUnitCount = async () => {
    try {
      startLoading();
      const filterRecord = Object.entries(debouncedFilters).reduce(
        (acc, [key, value]) => {
          // 숫자형 필드는 0이면 제외
          if (["bed", "bath", "parking"].includes(key) && value === "0") {
            return acc;
          }

          // none 값은 제외
          if (["type", "furniture", "pet"].includes(key) && value === "none") {
            return acc;
          }

          // price와 area의 min/max가 초기값이면 제외
          if (key === "priceMin" && value === initialFilters.priceMin)
            return acc;
          if (key === "priceMax" && value === initialFilters.priceMax)
            return acc;
          if (key === "areaMin" && value === initialFilters.areaMin) return acc;
          if (key === "areaMax" && value === initialFilters.areaMax) return acc;

          // city가 All Cities면 제외
          if (key === "city" && value === "All Cities") return acc;

          // status가 기본값이면 제외
          if (key === "status" && value === initialFilters.status) return acc;

          // amenities가 기본값이면 제외 (추가된 부분)
          if (key === "amenities" && value === initialFilters.amenities)
            return acc;

          // amenities가 빈 문자열이면 제외 (추가된 부분)
          if (key === "amenities" && value === "") return acc;

          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>
      );

      // activeTypes 파라미터 사용 (기존에는 sellType)
      const activeTypes = modalProps?.activeTypes || filters.activeTypes;
      if (activeTypes && activeTypes !== "rent,sale,preSale") {
        filterRecord.activeTypes = activeTypes;
      }

      // 항상 status 전달
      filterRecord.status = filters.status;

      // 디버깅 로그 (개발 중에만 사용)
      console.log("Sending amenities:", filterRecord.amenities);

      // getUnitCount 함수 호출
      const count = await getUnitCount(filterRecord);
      setUnitCount(count);
    } catch (error) {
      console.error("Error fetching unit count:", error);
      setUnitCount(0);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchUnitCount();
  }, [debouncedFilters]);

  return (
    <div className=" md:h-[85vh] md:overflow-y-auto md:mx-auto">
      {/* 헤더 섹션 */}
      <div className="text-left mb-6 md:sticky md:top-0 md:bg-white md:z-10 md:pb-4 md:shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Filter</h2>
        <p className="text-gray-400 text-xs">
          Narrow down the search results by selecting filters.
        </p>
      </div>

      {/* 폼 섹션 */}
      <form
        className="grid gap-4 pt-4 md:pt-0"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* {modalProps?.withSellType && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Sell Type
            </label>
            <SelectionBox
              className="justify-between space-x-0 flex gap-2"
              boxClassName="w-full h-12"
              options={sellTypeOption}
              selectedValue={filters.activeTypes}
              onSelect={(e) => updateFilter("activeTypes", e)}
            />
          </div>
        )} */}

        <section className="max-h-[800px] overflow-scroll px-2 hide-scroll">
          {/* Property Type Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Property Type
            </label>
            <SelectionBox
              className="justify-between space-x-0 flex md:grid md:grid-cols-3 md:gap-4"
              boxClassName="w-[73px] text-xs h-[75px] md:w-full"
              options={typeOption.slice(0, 5)}
              selectedValue={filters.type}
              onSelect={(e) => updateFilter("type", e)}
              textClassName="text-xs"
            />
          </div>

          {/* Numeric Selectors */}
          <div className="grid grid-cols-1 gap-4 mt-6">
            {[
              { label: "Beds", field: "bed" },
              { label: "Baths", field: "bath" },
              { label: "Parking", field: "parking" },
            ].map((item) => (
              <div
                key={item.field}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-zinc-500">{item.label}</span>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    className="w-8 h-8 flex justify-center items-center border rounded-full"
                    onClick={() =>
                      adjustCount(item.field as keyof Filters, false)
                    }
                  >
                    -
                  </button>
                  <span className="text-sm w-40 text-center">
                    {parseInt(filters[item.field as keyof Filters]) === 0
                      ? "Any"
                      : `${filters[item.field as keyof Filters]}+`}
                  </span>
                  <button
                    type="button"
                    className="w-8 h-8 flex justify-center items-center border rounded-full"
                    onClick={() =>
                      adjustCount(item.field as keyof Filters, true)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Price Range Slider */}
          <div className="my-6">
            <label className="block text-sm font-medium text-zinc-500 mb-1">
              Price Range
            </label>
            <Slider
              className="w-full"
              value={[parseInt(filters.priceMin), parseInt(filters.priceMax)]}
              onValueChange={(values) => {
                updateFilter("priceMin", values[0]);
                updateFilter("priceMax", values[1]);
              }}
              min={0}
              max={1000000}
              step={10000}
            />
            <div className="flex justify-between text-sm mt-2">
              <span>{Number(filters.priceMin).toLocaleString()}</span>
              <span>{Number(filters.priceMax).toLocaleString()}</span>
            </div>
          </div>

          {/* Area Range Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-500 mb-1">
              Area Range
            </label>
            <Slider
              className="w-full"
              value={[parseInt(filters.areaMin), parseInt(filters.areaMax)]}
              onValueChange={(values) => {
                updateFilter("areaMin", values[0]);
                updateFilter("areaMax", values[1]);
              }}
              min={0}
              max={500}
              step={10}
            />
            <div className="flex justify-between text-sm mt-2">
              <span>{filters.areaMin}</span>
              <span>{filters.areaMax}</span>
            </div>
          </div>

          {/* Furniture Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-500 mb-2">
              Furniture
            </label>
            <Select
              value={filters.furniture}
              onValueChange={(e) => updateFilter("furniture", e)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {furnitureOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pet Policy Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-500 mb-2">
              Pet Policy
            </label>
            <Select
              value={filters.pet}
              onValueChange={(e) => updateFilter("pet", e)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {petPolicyOption.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Status Selection - 새로 추가된 부분 */}
          <div>
            <label className="block text-sm font-medium text-zinc-500 mb-2">
              Property Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(e) => updateFilter("status", e)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 어메니티 선택 UI - amenitiesData 사용 */}
          <div className="my-6">
            <label className="block text-sm font-medium text-zinc-500 mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesData.map((amenity) => {
                const isSelected = filters.amenities.includes(amenity.label);
                return (
                  <div
                    key={amenity.label}
                    className={`border rounded-md p-2 cursor-pointer ${
                      isSelected
                        ? "bg-orange-100 border-orange-400"
                        : "bg-white"
                    }`}
                    onClick={() => handleAmenityChange(amenity.label)}
                  >
                    <div className="flex items-center">
                      <div className="mr-2 w-6 h-6 relative">
                        <Image
                          src={amenity.imagePath}
                          alt={amenity.label}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                      <div
                        className={`w-4 h-4 mr-2 rounded-full border ${
                          isSelected
                            ? "bg-orange-400 border-orange-400"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="white"
                            className="w-4 h-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{amenity.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {/* Action Buttons */}
        <div className="flex flex-row-reverse justify-between md:sticky md:bottom-0 md:bg-white md:py-4 md:-mx-6 md:px-6 md:border-t">
          <Button
            type="button"
            className="py-6 bg-orange-400 hover:bg-orange-500"
            onClick={applyFilters}
          >
            Apply Filters (
            {isLoading ? "Loading..." : `${unitCount} units available`})
          </Button>
          <Button
            type="button"
            onClick={clearFilters}
            className="mt-0 hover:bg-gray-100 text-gray-800 bg-white border-none py-6"
          >
            Clear all
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FilterModal;
