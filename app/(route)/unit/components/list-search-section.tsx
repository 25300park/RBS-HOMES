"use client";

import { useRef, useEffect, useState } from "react";
import SearchInput from "@/components/ui/search-input";
import { useModalStore } from "@/store/use-modal-store";
import { usePathname, useRouter } from "next/navigation";

const ListSearchSection = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const path = usePathname();
  const [searchInputActive, setSearchInputActive] = useState(false);
  const [locationActive, setLocationActive] = useState(false);
  const { openModal } = useModalStore();

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

  const resetFilters = () => {
    router.push(`${path}`);
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
          <div
            onClick={() =>
              openModal("filter", { withSellType: true, withType: true })
            }
          >
            필터
          </div>
          <div onClick={resetFilters} className="cursor-pointer">
            Reset Filters
          </div>
        </section>
      </div>
    </>
  );
};

export default ListSearchSection;
