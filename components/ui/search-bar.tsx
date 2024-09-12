"use client";

import { Input } from "@/components/ui/input";
import SearchInput from "@/components/ui/search-input";
import { useState } from "react";

export interface MainSearchBarProps {
  searchInputActive: boolean;
  setSearchInputActive: (active: boolean) => void;
}

const MainSearchBar = ({
  searchInputActive,
  setSearchInputActive,
}: MainSearchBarProps): React.ReactNode => {
  const [activeTab, setActiveTab] = useState<"rent" | "buy">("buy");
  const [locationActive, setLocationActive] = useState(false); // Location 클릭 상태

  // location div 또는 Input 포커스 이벤트
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
    <div className="absolute z-10 flex flex-col justify-start items-start w-2/3 max-w-[1000px] h-[120px] top-32 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-card p-4 bg-white rounded-b-lg rounded-r-lg shadow-lg">
      {/* Tab UI */}
      <div className="flex space-x-1 mb-4 absolute top-[-40px] left-0 border-b-0">
        <button
          className={`px-8 py-2 rounded-t-lg rounded-b-none ${
            activeTab === "buy" ? "blur-card text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("buy")}
        >
          Buy
        </button>
        <button
          className={`px-8 py-2 rounded-t-lg rounded-b-none ${
            activeTab === "rent" ? "blur-card text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("rent")}
        >
          Rent
        </button>
      </div>

      {/* Search Input */}
      <SearchInput
        searchInputActive={searchInputActive}
        handleLocationClick={handleLocationClick}
        activeTab={activeTab}
        handleFocus={handleFocus}
        locationActive={locationActive}
      />
    </div>
  );
};

export default MainSearchBar;
