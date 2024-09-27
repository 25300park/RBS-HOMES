'use client'

import { useRouter, usePathname } from "next/navigation";
import { Button } from "./button";
export interface FilterResetButtonProps {
  
};

const FilterResetButton = ({  }: FilterResetButtonProps): React.ReactNode => {
  const router = useRouter()
  const path = usePathname()

  const resetFilters = () => {
    router.push(`${path}`);
  };
  return <Button onClick={ resetFilters } className="py-5 border-2 border-gray-50 text-gray-400" variant={"ghost"}>Clear all</Button>
};

export default FilterResetButton;