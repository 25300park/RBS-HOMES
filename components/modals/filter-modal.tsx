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

interface Filters {
  type: string;
  sellType: string;
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
}

interface FilterModalProps {
  onClose: () => void;
  modalProps?: {
    withSellType: boolean;
    withType: boolean;
    sellType?: string;
  };
}

// 초기 필터 상태
const initialFilters: Filters = {
  type: "none",
  sellType: "none",
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
    sellType: searchParams.get("sellType") || initialFilters.sellType,
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
  }));
  const debouncedFilters = useDebounce(filters, 800);

  // 필터 업데이트 함수
  const updateFilter = (field: keyof Filters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value.toString(),
    }));
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
    
    const currentSellType = searchParams.get("sellType");
    if (currentSellType) {
      newFilters.sellType = currentSellType;
    }
    
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
          if (
            ["type", "sellType", "furniture", "pet"].includes(key) &&
            value === "none"
          ) {
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

          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>
      );
      const sellType = modalProps?.sellType || filters.sellType;
      const count = await getUnitCount(
        filterRecord,
        sellType !== "none" ? sellType : undefined
      );
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
    <div className="px-2 md:p-6 md:pb-10 md:h-[85vh] md:overflow-y-auto md:w-fit md:mx-auto">
      {/* 헤더 섹션 */}
      <div className="text-left mb-6 md:sticky md:-top-3 md:bg-white md:z-10 md:pb-4 md:shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Filter</h2>
        <p className="text-gray-400 text-xs">
          Narrow down the search results by selecting filters.
        </p>
      </div>
  
      {/* 폼 섹션 */}
      <form className="grid gap-4 pt-4 md:pt-0" onSubmit={(e) => e.preventDefault()}>
        {/* Sell Type Selection */}
        {modalProps?.withSellType && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Sell Type
            </label>
            <SelectionBox
              className="justify-between space-x-0 flex gap-2"
              boxClassName="w-full h-12"
              options={sellTypeOption}
              selectedValue={filters.sellType}
              onSelect={(e) => updateFilter("sellType", e)}
            />
          </div>
        )}
  
        {/* Property Type Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Property Type
          </label>
          <SelectionBox
            className="justify-between space-x-0 flex"
            boxClassName="w-[73px] text-xs h-[75px]"
            options={typeOption.slice(0, 5)}
            selectedValue={filters.type}
            onSelect={(e) => updateFilter("type", e)}
            textClassName="text-xs"
          />
        </div>
  
        {/* Numeric Selectors */}
        <div className="grid grid-cols-1 gap-4">
          {[
            { label: "Beds", field: "bed" },
            { label: "Baths", field: "bath" },
            { label: "Parking", field: "parking" },
          ].map((item) => (
            <div key={item.field} className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">{item.label}</span>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className="w-8 h-8 flex justify-center items-center border rounded-full"
                  onClick={() => adjustCount(item.field as keyof Filters, false)}
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
                  onClick={() => adjustCount(item.field as keyof Filters, true)}
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
  
        {/* Action Buttons */}
        <div className="flex flex-row-reverse justify-between mt-8 md:sticky md:bottom-0 md:bg-white md:py-4 md:-mx-6 md:px-6">
          <Button
            type="button"
            className="py-6 bg-orange-400 hover:bg-orange-500"
            onClick={applyFilters}
          >
            Apply Filters ({isLoading ? "Loading..." : `${unitCount} units available`})
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
