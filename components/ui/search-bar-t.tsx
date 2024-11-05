"use client";

import { useRef, useEffect, useState } from "react";
import { loadGoogleMapsAPI } from "@/lib/google";
import { IoSearch } from "react-icons/io5";
import { MdLocationOn } from "react-icons/md";
import { Button } from "./button";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchHistory {
  term: string;
  timestamp: number;
}

interface PopularCity {
  name: string;
  image: string;
}

const POPULAR_CITIES: PopularCity[] = [
  { name: "Manila", image: "/assets/images/cites/manila.png" },
  { name: "Cebu", image: "/assets/images/cites/Cebu.png" },
  { name: "Davao", image: "/assets/images/cites/Davao.png" },
  { name: "Boracay", image: "/assets/images/cites/Boracay.png" },
  { name: "Palawan", image: "/assets/images/cites/Palawan.png" },
  { name: "Bohol", image: "/assets/images/cites/Bohol.png" },
  { name: "Siargao", image: "/assets/images/cites/Siargao.png" },
  { name: "Tagaytay", image: "/assets/images/cites/Tagaytay.png" },
];

const GoogleSearchBar = ({
  navbarScrolled,
  isMobile,
  onExpandChange,
}: {
  navbarScrolled?: boolean;
  isMobile?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"location" | "recent">("recent");
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  // 최근 검색어 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOverlayClick = (event.target as Element).classList.contains(
        "overlay"
      );

      if (
        (containerRef.current &&
          !containerRef.current.contains(event.target as Node)) ||
        isOverlayClick
      ) {
        setIsExpanded(false);
        // 오버레이 클릭 시 navbarScrolled 상태를 true로 변경하도록 콜백
        onExpandChange?.(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };

    const handleScroll = () => {
      setIsExpanded(false);
      onExpandChange?.(false);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onExpandChange]);

  const handleFocus = () => {
    setIsExpanded(true);
    setActiveTab("recent");
    onExpandChange?.(true);
  };
  const handleSearch = (searchTerm: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("search", searchTerm);
    router.push(`/?${current.toString()}`);

    // 공백이 아닌 경우에만 최근 검색어에 저장
    if (searchTerm.trim()) {
      const newHistory = [
        { term: searchTerm, timestamp: Date.now() },
        ...searchHistory.filter((item) => item.term !== searchTerm),
      ].slice(0, 5);

      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }

    setIsExpanded(false);
    onExpandChange?.(false);
  };
  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-between bg-white rounded-full shadow-lg border p-1 h-[54px] w-full`}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search area in the Philippines"
          className={`w-[90%] pl-6 text-gray-700 placeholder-gray-400 focus:outline-none`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e.currentTarget.value);
            }
          }}
        />
        <Button
          variant={"default"}
          size={"icon"}
          onClick={() =>
            searchInputRef.current && handleSearch(searchInputRef.current.value)
          }
          className={`bg-orange-500 text-white rounded-full hover:bg-orange-600 mr-2`}
        >
          <IoSearch />
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 ease-in-out max-w-[800px] ${
        navbarScrolled && !isExpanded
          ? "fixed top-6 w-[450px] h-12 mt-0 transform -translate-y-2"
          : "w-full h-16 mt-4"
      } flex items-center justify-between bg-white rounded-full shadow-lg py-4 px-2 border`}
    >
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search area in the Philippines"
        className={`w-[90%] pl-6 ${
          navbarScrolled && !isExpanded ? "text-sm" : "text-lg"
        } text-gray-700 placeholder-gray-400 focus:outline-none`}
        onFocus={handleFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(e.currentTarget.value);
          }
        }}
      />
      <Button
        variant={"default"}
        size={"icon"}
        onClick={() =>
          searchInputRef.current && handleSearch(searchInputRef.current.value)
        }
        className={`bg-orange-500 text-white rounded-full hover:bg-orange-600 ${
          navbarScrolled && !isExpanded ? "w-8 h-8" : "w-12 h-12"
        }`}
      >
        <IoSearch
          className={`${
            navbarScrolled && !isExpanded ? "text-lg" : "text-2xl"
          }`}
        />
      </Button>

      {isExpanded && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 w-[800px] bg-white shadow-lg rounded-lg mt-2"
          style={{
            maxWidth: "calc(100vw - 40px)",
          }}
        >
          <div className="flex border-b">
            <button
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "location" ? "border-black" : "border-transparent"
              }`}
              onClick={() => setActiveTab("location")}
            >
              <MdLocationOn className="inline mr-2" />
              Popular Cities
            </button>
            <button
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "recent" ? "border-black" : "border-transparent"
              }`}
              onClick={() => setActiveTab("recent")}
            >
              <IoSearch className="inline mr-2" />
              Recent Searches
            </button>
          </div>

          <div className="p-4">
            {activeTab === "location" ? (
              <div className="grid grid-cols-3 gap-4">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleSearch(city.name)}
                    className="relative group overflow-hidden rounded-lg aspect-w-16 aspect-h-9"
                  >
                    <img
                      src={city.image}
                      alt={city.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white text-lg font-medium">
                        {city.name}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {searchHistory.length > 0 ? (
                  searchHistory.map(({ term }) => (
                    <Button
                      key={term}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleSearch(term)}
                    >
                      <IoSearch className="mr-2" />
                      {term}
                    </Button>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent searches
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSearchBar;
