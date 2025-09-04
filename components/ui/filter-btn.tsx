"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useModalStore } from "@/store/use-modal-store";
import { FaSliders } from "react-icons/fa6";
import { Button } from "./button";
import FilterResetButton from "@/components/ui/filter-reset-btn";

// 필터 설정을 위한 인터페이스
interface Filters {
  type: string;
  // sellType: string;
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

export interface FilterButtonProps {
  withType?: boolean;
  withSellType?: boolean;
  sellType?: string;
  isActive?: boolean;
  withClear?: boolean;
}

const FilterButton = ({
  withSellType = false,
  withType = false,
  sellType,
  isActive = false,
  withClear = false,
}: FilterButtonProps) => {
  const { openModal } = useModalStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [activeFilters, setActiveFilters] = useState<
    { key: string; value: string }[]
  >([]);

  const defaultFilters: Filters = {
    type: "none",
    // sellType: "none",
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

  const validFilterKeys = Object.keys(defaultFilters); // 기본 필터 키 목록

  useEffect(() => {
    // 활성화된 필터 카운트 계산 및 필터 리스트 업데이트
    const filters = Array.from(searchParams.entries())
      .filter(
        ([key, value]) =>
          validFilterKeys.includes(key) && // 필터에 해당하는 키만 포함
          value !== defaultFilters[key as keyof Filters] // 디폴트 필터와 다른 값만 카운팅
      )
      .map(([key, value]) => ({ key, value }));

    setActiveFilterCount(filters.length);
    setActiveFilters(filters); // 활성화된 필터 리스트 저장
  }, [searchParams]);

  // 필터 제거 핸들러
  const removeFilter = (filterKey: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(
      filterKey,
      defaultFilters[filterKey as keyof Filters] || ""
    );

    router.push(`?${newSearchParams.toString()}`);
  };

  const openModalHandler = () => {
    openModal("filter", { withSellType, withType, sellType });
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full gap-4">
        <div className="filter-button-pc">
          <Button
            onClick={openModalHandler}
            className={`${
              activeFilterCount > 0 ? "border-orange-400 " : "border"
            } py-5 space-x-2 relative px-2`}
            variant={"outline"}
          >
            <FaSliders
              className={`${
                activeFilterCount > 0 ? "text-orange-400 " : "text-[#A9A9A9]"
              }  `}
            />
            <p className="text-xs">Filters</p>
            {activeFilterCount > 0 && (
              <span className="absolute -right-2 -top-1 bg-orange-400 text-white w-4 h-4 rounded-full text-[8px] border border-white flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
        <div className="filter-button-mobile">
          
        </div>
        {withClear && <FilterResetButton />}
      </div>
      {(activeFilterCount > 0 && withClear) && (
        <div className="pt-4 w-full border-t">
          {isActive && activeFilters.length > 0 && (
            <div>
              <h4 className="mb-4">Active filter list</h4>
              <div className="grid grid-cols-2 gap-2">
                {activeFilters.map(({ key, value }) => (
                  <div
                    key={key}
                    className="flex items-center rounded-sm border px-3 py-2 justify-between relative"
                  >
                    <span className="text-[10px] text-gray-400">
                      {key.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">{value}</span>
                    <button
                      onClick={() => removeFilter(key)}
                      className="absolute -right-2 -top-1 bg-orange-400 text-white w-4 h-4 rounded-full text-[8px] border border-white flex items-center justify-center"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterButton;