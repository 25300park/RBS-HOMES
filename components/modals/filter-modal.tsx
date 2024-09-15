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
import { getUnitCount } from "@/lib/action";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/hooks/use-loading"; // 로딩 훅
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
  modalProps?: { withSellType: boolean; withType: boolean; sellType?: string;  };
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
    const count = await getUnitCount(convertFiltersToRecord(debouncedFilters));
    setUnitCount(count);
    stopLoading(); // 로딩 종료
  };

  useEffect(() => {
    fetchUnitCount();
  }, [debouncedFilters]);

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Filter</h2>
        <p className="text-gray-600">
          Narrow down the search results by selecting filters.
        </p>
      </div>

      {/* 로딩 중일 때 로딩 인디케이터 표시 */}

      <form className="grid gap-4 py-4">
        {modalProps?.withSellType && (
          <div className="">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sell Type
            </label>
            <Select
              name="sellType"
              value={filters.sellType}
              onValueChange={(e) => updateFilter("sellType", e)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sellTypeOption.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {modalProps?.withType && (
          <div className="">
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
          </div>
        )}
        {/* Bed and Bath Selection */}
        <div className="grid grid-cols-1 gap-4">
          {/* Beds */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Beds</span>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="w-8 h-8 flex justify-center items-center border rounded-full"
                onClick={() => adjustCount("bed", false)}
              >
                -
              </button>
              <span className="text-sm w-40 text-center">
                {parseInt(filters.bed) === 0
                  ? "No Preference"
                  : `${filters.bed}+`}
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
            <span className="text-sm">Baths</span>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="w-8 h-8 flex justify-center items-center border rounded-full"
                onClick={() => adjustCount("bath", false)}
              >
                -
              </button>
              <span className="text-sm w-40 text-center">
                {parseInt(filters.bath) === 0
                  ? "No Preference"
                  : `${filters.bath}+`}
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
            <span className="text-sm">Parking</span>
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
                  ? "No Preference"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <span>{filters.priceMin}</span>
            <span>{filters.priceMax}</span>
          </div>
        </div>
        {/* Area Range Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <Button type="button" className="w-full" onClick={applyFilters}>
          Apply Filters ({isLoading ? "Loading" : unitCount} units available)
        </Button>
      </form>

      <Button
        onClick={onClose}
        className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-300 hover:text-gray-500"
      >
        Close
      </Button>
    </div>
  );
};

export default FilterModal;
