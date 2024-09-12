'use client';

import { useRef, useEffect, useState } from "react";
import MainBanner from "./main-banner";
import MainSearchBar from "@/components/ui/search-bar";

const BannerGroup = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);  // MainBanner와 MainSearchBar를 감싸는 전체 div
  const [searchInputActive, setSearchInputActive] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        // 검색창 외부 클릭 시 검색창 닫기
        setSearchInputActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div ref={wrapperRef} className="relative px-1">
        <MainSearchBar
          searchInputActive={searchInputActive}
          setSearchInputActive={setSearchInputActive}
        />
        <MainBanner onBannerClick={() => setSearchInputActive(false)}/>
      </div>
    </>
  );
};

export default BannerGroup;
