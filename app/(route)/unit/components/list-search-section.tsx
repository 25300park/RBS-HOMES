"use client";

import { useRef, useEffect, useState } from "react";
import SearchInput from "@/components/ui/search-input";
import FilterButton from "@/components/ui/filter-btn";
import FilterResetButton from "@/components/ui/filter-reset-btn";

const ListSearchSection = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [searchInputActive, setSearchInputActive] = useState(false);
  const [locationActive, setLocationActive] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        // 검색창 외부 클릭 시 검색창 닫기
        setSearchInputActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleFocus = () => {
    setSearchInputActive(true);
    setLocationActive(false);
  };

  // location div 클릭 이벤트
  const handleLocationClick = () => {
    setSearchInputActive(true);
    setLocationActive(true);
  };

  return (
    <>
      <div className="relative my-6 w-full">
        <section ref={wrapperRef} className="absolute w-full  z-20">
          <SearchInput
            searchInputActive={searchInputActive}
            handleLocationClick={handleLocationClick}
            handleFocus={handleFocus}
            locationActive={locationActive}
          />
        </section>
        <section className="pt-16">
          <FilterButton withSellType withType />
          <FilterResetButton />
          <div>맵전환 버튼</div>
          <div>전체 디자인 수정</div>
        </section>
      </div>
    </>
  );
};

export default ListSearchSection;
