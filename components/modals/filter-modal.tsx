"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModalStore } from "@/store/use-modal-store";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const FilterModal = ({ onClose }: { onClose: () => void }) => {
  const { modalType } = useModalStore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 필터 상태 관리
  const [filters, setFilters] = useState({
    bed: searchParams.get("bed") || "",
    bath: searchParams.get("bath") || "",
    parking: searchParams.get("parking") === "true" || false,
    priceMin: searchParams.get("priceMin") || "",
    priceMax: searchParams.get("priceMax") || "",
    city: searchParams.get("city") || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const applyFilters = () => {
    const query = new URLSearchParams();
    if (filters.bed) query.append("bed", filters.bed);
    if (filters.bath) query.append("bath", filters.bath);
    if (filters.parking) query.append("parking", filters.parking.toString());
    if (filters.priceMin) query.append("priceMin", filters.priceMin);
    if (filters.priceMax) query.append("priceMax", filters.priceMax);
    if (filters.city) query.append("city", filters.city);

    router.push(`${pathname}?${query.toString()}`);
    onClose();
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">필터 </h2>
        {/* <p className="text-gray-600">필터를 선택하여 검색 결과를 좁혀보세요.</p> */}
      </div>

      {/* 필터 폼 */}
      <form className="grid gap-4 py-4">
        <Input
          name="bed"
          type="number"
          placeholder="침실 수"
          value={filters.bed}
          onChange={handleInputChange}
          className="mb-4 w-full"
        />
        <Input
          name="bath"
          type="number"
          placeholder="욕실 수"
          value={filters.bath}
          onChange={handleInputChange}
          className="mb-4 w-full"
        />
        <label className="flex items-center mb-4">
          <input
            name="parking"
            type="checkbox"
            checked={filters.parking}
            onChange={handleInputChange}
            className="mr-2"
          />
          주차 가능
        </label>
        <Input
          name="city"
          type="text"
          placeholder="도시"
          value={filters.city}
          onChange={handleInputChange}
          className="mb-4 w-full"
        />
        <Input
          name="priceMin"
          type="number"
          placeholder="최소 가격"
          value={filters.priceMin}
          onChange={handleInputChange}
          className="mb-4 w-full"
        />
        <Input
          name="priceMax"
          type="number"
          placeholder="최대 가격"
          value={filters.priceMax}
          onChange={handleInputChange}
          className="mb-4 w-full"
        />

        <Button type="button" className="w-full" onClick={applyFilters}>
          필터 적용
        </Button>
      </form>

      {/* 모달 닫기 버튼 */}
      <Button
        onClick={onClose}
        className="mt-6 w-full bg-gray-100 hover:bg-gray-200"
      >
        닫기
      </Button>
    </>
  );
};

export default FilterModal;
