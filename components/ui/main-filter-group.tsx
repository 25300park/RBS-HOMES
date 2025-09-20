"use client";

import Link from "next/link";
import { Button } from "./button";
import FilterButton from "./filter-btn";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface MainFilterGroupProps {}

const MainFilterGroup = ({}: MainFilterGroupProps): React.ReactNode => {
  return (
    
      <div className="flex gap-2 justify-around w-full max-w-[350px]">

          <div className="header-menu-desktop">
            <Link className="mr-16" href="/">
              <img src="/assets/images/rbs-logo.png" alt="logo" />
            </Link>
          </div>

          <div className="header-menu-mobile">
            <Link href={"/"} className="hidden md:block">
              <img
                src="/assets/images/RBS_symbol_60x60.png"
                alt="logo"
                className="w-10 mr-2"
              />
            </Link>
          </div>
          
          <SellTypeButton type="rent" />
          <SellTypeButton type="sale" />
          <SellTypeButton type="preSale" />

          <span className="md:hidden">
            <FilterButton />
          </span>

          <span className="hidden md:block fixed top-[90px] left-2">
            <FilterButton />
          </span>

      </div>
    
  );
};

export default MainFilterGroup;

const SellTypeButton = ({ type }: { type: "rent" | "sale" | "preSale" }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  let typeString;
  if (type === "rent") typeString = "rent";
  else if (type === "sale") typeString = "buy";
  else typeString = "preSale";

  const [activeType, setActiveType] = useState<string>("rent");

  useEffect(() => {
    const activeParam = searchParams.get("activeTypes"); // activeTypes에서 activeType으로 변경
  
    if (activeParam !== null) {
      setActiveType(activeParam);
    } else {
      // 기본값: rent 활성화
      setActiveType("rent");
    }
  }, [searchParams]);

  const isActive = activeType === type;

  const handleClick = () => {
    // 이미 활성화된 버튼을 클릭한 경우 아무것도 하지 않음 (항상 하나는 선택되어 있어야 함)
    if (isActive) {
      return;
    }

    // 새로운 타입으로 변경
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("activeTypes", type); 
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Style based on type when active
  let activeStyle = "";
  if (isActive) {
    if (type === "rent") {
      activeStyle = "bg-[#F18D3E] text-white border-[#F18D3E]";
    } else if (type === "sale") {
      activeStyle = "bg-[#3751A2] text-white border-[#3751A2]";
    } else if (type === "preSale") {
      activeStyle = "bg-[#585859] text-white border-[#585859]";
    }
  }

  return (
    <Button
      className={`py-5 space-x-1 relative w-[90px] text-xs ${activeStyle} ${
        isActive ? '' : 'hover:bg-gray-100'
      }`}
      variant={"outline"}
      onClick={handleClick}
    >
      <p>{typeString === "preSale" ? "PRE SALE" : typeString.toUpperCase()}</p>
    </Button>
  );
};