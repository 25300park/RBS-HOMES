"use client";

import { useRef, useEffect, useState } from "react";
import { loadGoogleMapsAPI } from "@/lib/google";
import { IoSearch } from "react-icons/io5";
import { Button } from "./button";
import { useRouter, useSearchParams } from "next/navigation";

const GoogleSearchBar = ({
  navbarScrolled,
  isMobile,
}: {
  navbarScrolled?: boolean;
  isMobile?: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    loadGoogleMapsAPI().then(() => {
      if (searchInputRef.current) {
        const autocompleteInstance = new google.maps.places.Autocomplete(
          searchInputRef.current,
          {
            types: ["(cities)"],
            componentRestrictions: { country: "ph" }, // 필리핀 내 지역 제한
          }
        );

        // 장소 선택 이벤트 리스너
        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace();
          if (place.formatted_address) {
            // 현재 URL 파라미터 유지하면서 검색어 추가
            const current = new URLSearchParams(
              Array.from(searchParams.entries())
            );
            current.set("search", place.formatted_address);

            // 검색 실행
            router.push(`/?${current.toString()}`);
          }
        });

        setAutocomplete(autocompleteInstance);
      }
    });
  }, [router, searchParams]);

  const handleSearch = () => {
    if (searchInputRef.current?.value) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set("search", searchInputRef.current.value);
      router.push(`/?${current.toString()}`);
    }
  };

  if (isMobile) {
    return (
      <div
        className={` flex items-center justify-between bg-white rounded-full shadow-lg border p-1 h-[54px] w-full`}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search area in the Philippines"
          className={`w-[90%] pl-6  text-gray-700 placeholder-gray-400 focus:outline-none`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button
          variant={"default"}
          size={"icon"}
          onClick={handleSearch}
          className={`bg-orange-500 text-white rounded-full hover:bg-orange-600 mr-2`}
        >
          <IoSearch  />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 ease-in-out max-w-[800px] ${
        navbarScrolled
          ? "fixed top-6 w-[450px] h-12 mt-0 transform -translate-y-2"
          : "w-full h-16 mt-4"
      } flex items-center justify-between bg-white rounded-full shadow-lg py-4 px-2 border`}
    >
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search area in the Philippines"
        className={`w-[90%] pl-6 ${
          navbarScrolled ? "text-sm" : "text-lg"
        } text-gray-700 placeholder-gray-400 focus:outline-none`}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <Button
        variant={"default"}
        size={"icon"}
        onClick={handleSearch}
        className={`bg-orange-500 text-white rounded-full hover:bg-orange-600 ${
          navbarScrolled ? "w-8 h-8" : "w-12 h-12"
        }`}
      >
        <IoSearch className={`${navbarScrolled ? "text-lg" : "text-2xl"}`} />
      </Button>
    </div>
  );
};

export default GoogleSearchBar;
