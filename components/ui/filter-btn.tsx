"use client";

import { useModalStore } from "@/store/use-modal-store";
import { Button } from "./button";

export interface FilterButtonProps {
  withType: boolean;
  withSellType: boolean;
}

const FilterButton = ({
  withSellType = false,
  withType = false,
}: FilterButtonProps): React.ReactNode => {
  const { openModal } = useModalStore();

  const openModalHandler = () => {
     openModal("filter")
  }
  return <Button>필터 버튼</Button>;
};

export default FilterButton;
