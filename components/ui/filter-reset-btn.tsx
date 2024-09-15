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
  return <Button onClick={ resetFilters }>Filter Clear</Button>
};

export default FilterResetButton;