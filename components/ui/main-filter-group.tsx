"use client";

import Link from "next/link";
import { Button } from "./button";
import FilterButton from "./filter-btn";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

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
    </div>
  );
};

export default MainFilterGroup;

const SellTypeButton = ({ type }: { type: "rent" | "sale" }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const typeString = type === "rent" ? "rent" : "buy";

  const currentSellType = searchParams.get("sellType");
  const isSelected = currentSellType === type;

  const handleClick = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("sellType", type);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <Button
      className={`py-5 space-x-1 relative w-[80px] text-xs ${
        isSelected ? "border-orange-400" : ""
      }`}
      variant={"outline"}
      onClick={handleClick}
    >
      <img src={`/assets/icons/${typeString}.png`} alt={type} className="" />
      <p>{typeString.toUpperCase()}</p>
    </Button>
  );
};
