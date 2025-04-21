"use client";

import Link from "next/link";
import { Button } from "./button";
import FilterButton from "./filter-btn";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface MainFilterGroupProps {}

const MainFilterGroup = ({}: MainFilterGroupProps): React.ReactNode => {
  return (
    <div className="flex gap-2 justify-around w-full">
      <Link href={"/"} className="hidden md:block">
        <img
          src="/assets/images/RBS_symbol_60x60.png"
          alt="logo"
          className="w-10 mr-2"
        />
      </Link>
      <span className="md:hidden">
        <FilterButton />
      </span>
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
      newActiveTypes = activeTypes.filter((t) => t !== type);
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
      activeStyle = "bg-[#F18D3E] text-white border-[#F18D3E]";
    } else if (type === "sale") {
      activeStyle = "bg-[#3751A2] text-white border-[#3751A2]";
    } else if (type === "preSale") {
      activeStyle = "bg-[#585859] text-white border-[#585859]";
    }
  }

  return (
    <Button
      className={`py-5 space-x-1 relative w-[90px] text-xs ${activeStyle}`}
      variant={"outline"}
      onClick={handleClick}
    >
      <p>{typeString === "preSale" ? "PRE SALE" : typeString.toUpperCase()}</p>
    </Button>
  );
};
