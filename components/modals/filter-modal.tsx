"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "../ui/slider"; // Custom Slider component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import CityImgCard from "../ui/city-img-card";
import { getUnitCount, getUnitCountOwner } from "@/lib/action";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/hooks/use-loading"; // 로딩 훅
import SelectionBox from "@/components/ui/select-box";

import {
  cities,
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
  modalProps?: { withSellType: boolean; withType: boolean; sellType?: string };
}

const FilterModal = ({ onClose, modalProps }: FilterModalProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [unitCount, setUnitCount] = useState(0);
  const { isLoading, startLoading, stopLoading } = useLoading(); // 로딩 상태

  // 필터 상태 관리
  const [filters, setFilters] = useState<Filters>({
    type: searchParams.get("type") || "none",
    sellType: searchParams.get("sellType") || "none",
    bed: searchParams.get("bed") || "0",
    bath: searchParams.get("bath") || "0",
    parking: searchParams.get("parking") || "0",
    priceMin: searchParams.get("priceMin") || "0",
    priceMax: searchParams.get("priceMax") || "1000000",
    areaMin: searchParams.get("areaMin") || "0",
    areaMax: searchParams.get("areaMax") || "500",
    city: searchParams.get("city") || "All Cities",
    furniture: searchParams.get("furniture") || "none",
    pet: searchParams.get("pet") || "none",
  });

  const debouncedFilters = useDebounce(filters, 800); // 500ms 디바운스

  const updateFilter = (field: keyof Filters, value: string | number) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value.toString(),
    }));
  };

  const convertFiltersToRecord = (filters: Filters): Record<string, string> => {
    return {
      type: filters.type,
      sellType: filters.sellType,
      bed: filters.bed,
      bath: filters.bath,
      parking: filters.parking,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      areaMin: filters.areaMin,
      areaMax: filters.areaMax,
      city: filters.city,
      furniture: filters.furniture,
      pet: filters.pet,
    };
  };

  const applyFilters = () => {
    const query = new URLSearchParams(
      convertFiltersToRecord(filters)
    ).toString();
    router.push(`${pathname}?${query}`);
    onClose();
  };

  const adjustCount = (field: keyof Filters, increment: boolean) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: increment
        ? (parseInt(prevFilters[field]) || 0) + 1
        : Math.max(0, (parseInt(prevFilters[field]) || 0) - 1),
    }));
  };

  const fetchUnitCount = async () => {
    startLoading(); // 로딩 시작
    const count = modalProps?.withSellType
      ? await getUnitCountOwner(convertFiltersToRecord(debouncedFilters))
      : await getUnitCount(
          convertFiltersToRecord(debouncedFilters),
          modalProps?.sellType
        );
    setUnitCount(count);
    stopLoading(); // 로딩 종료
  };

  useEffect(() => {
    fetchUnitCount();
  }, [debouncedFilters]);

  return (
    <div className="px-2 md:p-6 md:pb-10">
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Filter</h2>
        <p className="text-gray-400 text-xs">
          Narrow down the search results by selecting filters.
        </p>
      </div>

      {/* 로딩 중일 때 로딩 인디케이터 표시 */}

      <form className="grid gap-4 pt-4">
        {modalProps?.withSellType && (
          <div className="">
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
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Property Type
          </label>
          <SelectionBox
            className="justify-between space-x-0 flex "
            boxClassName="w-[73px] text-xs h-[75px]"
            options={typeOption.slice(0, 5)} // 아이콘이 있는 옵션을 전달
            selectedValue={filters.type}
            onSelect={(e) => updateFilter("type", e)} // 통합된 핸들러 사용
            textClassName="text-xs"
          />
        </div>
        {/* <div className="">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <Select
            name="type"
            value={filters.type}
            onValueChange={(e) => updateFilter("type", e)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOption.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}
        {/* Bed and Bath Selection */}
        <div className="grid grid-cols-1 gap-4">
          {/* Beds */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Beds</span>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="w-8 h-8 flex justify-center items-center border rounded-full"
                onClick={() => adjustCount("bed", false)}
              >
                -
              </button>
              <span className="text-sm w-40 text-center">
                {parseInt(filters.bed) === 0 ? "Any" : `${filters.bed}+`}
              </span>
              <button
                type="button"
                className="w-8 h-8 flex justify-center items-center border rounded-full"
                onClick={() => adjustCount("bed", true)}
              >
                +
              </button>
            </div>
          </div>

          {/* Baths */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Baths</span>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="w-8 h-8 flex justify-center items-center border rounded-full"
                onClick={() => adjustCount("bath", false)}
              >
                -
              </button>
              <span className="text-sm w-40 text-center">
                {parseInt(filters.bath) === 0 ? "Any" : `${filters.bath}+`}
              </span>
              <button
                type="button"
                className="w-8 h-8 flex justify-center items-center border rounded-full"
                onClick={() => adjustCount("bath", true)}
              >
                +
              </button>
            </div>
          </div>

          {/* Parking */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Parking</span>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="w-8 h-8 flex justify-center items-center border rounded-full"
                onClick={() => adjustCount("parking", false)}
              >
                -
              </button>
              <span className="text-sm w-40 text-center">
                {parseInt(filters.parking) === 0
                  ? "Any"
                  : `${filters.parking}+`}
              </span>
              <button
                type="button"
                className="w-8 h-8 flex justify-center items-center border rounded-full"
                onClick={() => adjustCount("parking", true)}
              >
                +
              </button>
            </div>
          </div>
        </div>
        {/* Price Range Filter */}
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
        {/* Area Range Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-500 mb-1">
            Area Range
          </label>
          <Slider
            className="w-full bg-orange-300!"
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
        {/* City Selection Filter */}
        {/* <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Select City</h3>
            <div className="grid grid-cols-3 gap-4">
              {cities.map((city) => (
                <CityImgCard
                  key={city.name}
                  city={city}
                  onClick={() => updateFilter("city", city.name)}
                  isActive={filters.city === city.name}
                />
              ))}
            </div>
          </div> */}
        {/* Furniture Selection Filter */}
        <div className="">
          <label className="block text-sm font-medium text-zinc-500 mb-2">
            Furniture
          </label>
          <Select
            name="furniture"
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
        {/* Pet Policy Filter */}
        <div className="">
          <label className="block text-sm font-medium text-zinc-500 mb-2">
            Pet Policy
          </label>
          <Select
            name="pet"
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
        <div className="flex flex-row-reverse justify-between mt-8">
          <Button
            type="button"
            className=" py-6 bg-orange-400 hover:bg-orange-500"
            onClick={applyFilters}
          >
            Apply Filters ({isLoading ? "Loading" : unitCount} units available)
          </Button>
          <Button
            onClick={onClose}
            className="mt-0   hover:bg-gray-100 text-gray-800 bg-white border-none  py-6"
          >
            Clear all
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FilterModal;
