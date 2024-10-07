"use client";
import { Button } from "./button";
import { Input } from "./input";

export interface SearchInputProps {
  searchInputActive: boolean;
  handleLocationClick: () => void;
  handleFocus: () => void;
  activeTab?: string;
  locationActive?: boolean;
}

const SearchInput = ({
  searchInputActive = false,
  handleLocationClick,
  handleFocus,
  activeTab,
  locationActive,
}: SearchInputProps): React.ReactNode => {
  return (
    <form
      className={` z-30 relative ${
        searchInputActive ? "p-4 shadow-xl" : ""
      } w-full transition-all duration-300 bg-white rounded-lg`}
    >
      <div className=" border rounded-lg bg-[#f2f2f2] flex items-center relative">
        <div
          className="h-full w-[20%] px-6 border-r-2 cursor-pointer"
          onClick={handleLocationClick}
        >
          location
        </div>
        <Input
          type="text"
          placeholder={`Search for ${
            activeTab === "rent" ? "rental" : "buy"
          } properties`}
          className="w-full p-2 py-8 focus-visible:ring-0 border-none shadow-none text-md bg-[#f2f2f2]"
          onFocus={handleFocus}
        />
        <Button className="absolute right-3 w-24 bg-[#0eb8c5] hover:bg-[#0eb9c566]">
          Search
        </Button>
      </div>
      <div
        className={`${
          searchInputActive ? "block" : "hidden"
        } min-h-64 my-4 border-t p-4 h-full rounded-b-lg`}
      >
        {locationActive ? "지역검색정리 " : "단어검색정리 "}
      </div>
    </form>
  );
};

export default SearchInput;
