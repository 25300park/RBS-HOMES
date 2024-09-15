"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useModalStore } from "@/store/use-modal-store";
import { Button } from "./button";

// 필터 설정을 위한 인터페이스
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

// 필터 버튼 컴포넌트
export interface FilterButtonProps {
  withType?: boolean;
  withSellType?: boolean;
}

const FilterButton = ({ withSellType = false, withType = false }: FilterButtonProps) => {
  const { openModal } = useModalStore();
  const searchParams = useSearchParams();
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    const defaultFilters: Filters = {
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

    // searchParams.entries()로 반복 가능한 형식으로 변환
    const filterCount = Array.from(searchParams.entries()).reduce((count, [key, value]) => {
      if (value && value !== defaultFilters[key as keyof Filters]) {
        return count + 1;
      }
      return count;
    }, 0);

    setActiveFilterCount(filterCount);
  }, [searchParams]);

  const openModalHandler = () => {
    openModal("filter", { withSellType, withType });
  };

  return <Button onClick={openModalHandler}>필터 버튼 {activeFilterCount}</Button>;
};


export default FilterButton;
