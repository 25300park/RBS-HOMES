"use client";

import Link from "next/link";
import { Button } from "./button";
import FilterButton from "./filter-btn";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface MainFilterGroupProps {}

const MainFilterGroup = ({}: MainFilterGroupProps): React.ReactNode => {
  return (
    <div className="flex gap-2">
      <Link href={"/"} className="hidden md:block">
        <img
          src="/assets/images/RBS_symbol_60x60.png"
          alt="logo"
          className="w-10 mr-2"
        />
      </Link>

      <FilterButton />
      <SellTypeButton type="rent" />
      <SellTypeButton type="sale" />
      <SellTypeButton type="preSale" />
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

  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  
  useEffect(() => {
    const activeParam = searchParams.get("activeTypes");
    if (activeParam) {
      setActiveTypes(activeParam.split(","));
    } else {
      setActiveTypes(["rent", "sale", "preSale"]);
    }
  }, [searchParams]);

  const isActive = activeTypes.includes(type);

  const handleClick = () => {
    let newActiveTypes: string[];
    
    if (isActive) {
      newActiveTypes = activeTypes.filter(t => t !== type);
    } else {
      newActiveTypes = [...activeTypes, type];
    }
    
    // Update URL
    const newParams = new URLSearchParams(searchParams.toString());
    if (newActiveTypes.length === 0) {
      newActiveTypes = ["rent", "sale", "preSale"];
    }
    newParams.set("activeTypes", newActiveTypes.join(","));
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Style based on type when active
  let activeStyle = "";
  if (isActive) {
    if (type === "rent") {
      activeStyle = "bg-orange-400 text-white border-orange-400";
    } else if (type === "sale") {
      activeStyle = "bg-indigo-800 text-white border-indigo-800";
    } else if (type === "preSale") {
      activeStyle = "bg-gray-500 text-white border-gray-500";
    }
  }

  return (
    <Button
      className={`py-5 space-x-1 relative w-[90px] text-xs bg-indigo ${activeStyle}`}
      variant={"outline"}
      onClick={handleClick}
    >
      <p>{typeString === "preSale" ? "PRE SALE" : typeString.toUpperCase()}</p>
    </Button>
  );
};