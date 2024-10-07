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
    <div className="absolute top-1/2 z-40 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 h-[100px] max-w-[1000px] px-8 flex flex-col justify-start items-start bg-white p-4 blur-card rounded-b-lg shadow-lg z-10">
      {/* Tab UI */}
      <div className="flex mb-4 absolute top-[-40px] left-0 border-b-0 w-full">
        <button
          className={`px-8 py-2 rounded-t-lg rounded-b-none w-full ${
            activeTab === "buy" ? "blur-card text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("buy")}
        >
          BUY
        </button>
        <button
          className={`px-8 py-2 rounded-t-lg rounded-b-none w-full ${
            activeTab === "rent" ? "blur-card text-white" : "bg-[#ffffffd8] text-gray-400"
          }`}
          onClick={() => setActiveTab("rent")}
        >
          RENT
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
