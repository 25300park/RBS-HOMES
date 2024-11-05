"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoSearch, IoClose } from "react-icons/io5";
import { MdLocationOn } from "react-icons/md";
import { Button } from "./button";

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

const MobileSearchBar = ({
  onExpandChange,
}: {
  onExpandChange?: (expanded: boolean) => void;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"location" | "recent">("recent");
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [searchValue, setSearchValue] = useState<string>(() => {
    return searchParams.get("search") || "";
  });

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      document.body.style.overflow = "unset";
      setIsVisible(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSearch = (searchTerm: string) => {
    setSearchValue(searchTerm);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("search", searchTerm);
    router.push(`/?${current.toString()}`);

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

  return (
    <div className="relative w-full">
      <div
        className="flex items-center justify-between bg-white rounded-full shadow-md border p-1 h-[54px] w-full active:scale-[0.99] transition-transform"
        onClick={() => {
          setIsExpanded(true);
          setActiveTab("recent");
          onExpandChange?.(true);
        }}
      >
        <div className="flex items-center w-full pl-6">
          <IoSearch className="text-gray-400 mr-2" />
          <span
            className={`${searchValue ? "text-gray-700" : "text-gray-400"}`}
          >
            {searchValue || "Search area in the Philippines"}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div
          className={`fixed inset-0 bg-white z-40 flex flex-col transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* 상단 헤더 */}
          <div
            className={`transition-transform duration-300 ${
              isVisible ? "translate-y-0" : "-translate-y-4"
            }`}
          >
            <div className="flex items-center px-4 h-14 border-b bg-white">
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onExpandChange?.(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            <div className="p-4 bg-white border-b">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search area in the Philippines"
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(searchValue);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex border-b bg-white">
              <button
                className={`flex-1 px-4 py-3.5 text-sm font-medium relative ${
                  activeTab === "location" ? "text-gray-900" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("location")}
              >
                <div className="flex items-center justify-center gap-2">
                  <MdLocationOn className="text-xl" />
                  <span>Popular Cities</span>
                </div>
                {activeTab === "location" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </button>
              <button
                className={`flex-1 px-4 py-3.5 text-sm font-medium relative ${
                  activeTab === "recent" ? "text-gray-900" : "text-gray-500"
                }`}
                onClick={() => setActiveTab("recent")}
              >
                <div className="flex items-center justify-center gap-2">
                  <IoSearch className="text-xl" />
                  <span>Recent Searches</span>
                </div>
                {activeTab === "recent" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </button>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div
            className={`flex-1 overflow-y-auto transition-transform duration-300 ${
              isVisible ? "translate-y-0" : "translate-y-4"
            }`}
          >
            <div className="p-4 pb-24">
              {activeTab === "location" ? (
                <div className="grid grid-cols-2 gap-3">
                  {POPULAR_CITIES.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleSearch(city.name)}
                      className="relative aspect-[4/3] overflow-hidden rounded-2xl group active:scale-[0.98] transition-transform"
                    >
                      <img
                        src={city.image}
                        alt={city.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white text-sm font-semibold">
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
                      <button
                        key={term}
                        className="w-full flex items-center px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors"
                        onClick={() => handleSearch(term)}
                      >
                        <IoSearch className="text-gray-400 mr-3 text-lg" />
                        <span className="text-gray-700">{term}</span>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <IoSearch className="text-4xl mb-3" />
                      <p>No recent searches</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 하단 검색 버튼 */}
          <div
            className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="p-4 bg-white border-t">
              <Button
                variant="default"
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-xl font-medium shadow-lg shadow-orange-500/25 transition-all"
                onClick={() => handleSearch(searchValue)}
              >
                <IoSearch className="mr-2 text-xl" />
                Search
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DesktopSearchBar = ({
  navbarScrolled,
  onExpandChange,
}: {
  navbarScrolled?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"location" | "recent">("recent");
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [searchValue, setSearchValue] = useState<string>(() => {
    return searchParams.get("search") || "";
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
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

  const handleSearch = (searchTerm: string) => {
    setSearchValue(searchTerm);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("search", searchTerm);
    router.push(`/?${current.toString()}`);

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
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search area in the Philippines"
        className={`w-[90%] pl-6 ${
          navbarScrolled && !isExpanded ? "text-sm" : "text-lg"
        } text-gray-700 placeholder-gray-400 focus:outline-none`}
        onFocus={() => {
          setIsExpanded(true);
          setActiveTab("recent");
          onExpandChange?.(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(searchValue);
          }
        }}
      />
      <Button
        variant={"default"}
        size={"icon"}
        onClick={() => handleSearch(searchValue)}
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

const MainSearchBar = ({
  navbarScrolled,
  isMobile,
  onExpandChange,
}: {
  navbarScrolled?: boolean;
  isMobile?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}) => {
  return isMobile ? (
    <MobileSearchBar onExpandChange={onExpandChange} />
  ) : (
    <DesktopSearchBar
      navbarScrolled={navbarScrolled}
      onExpandChange={onExpandChange}
    />
  );
};

export default MainSearchBar;
