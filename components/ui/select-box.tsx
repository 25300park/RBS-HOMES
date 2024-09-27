import React, { ElementType } from "react";
import { cn } from "@/lib/utils";

interface SelectionBoxProps {
  options: Array<{
    label: string;
    value: string;
    icon?: ElementType; // 수정된 부분
  }>;
  selectedValue: string;
  onSelect: (value: string) => void;
  className?: string;
  boxClassName?: string;
  textClassName?: string;
}

const SelectionBox: React.FC<SelectionBoxProps> = ({
  options,
  selectedValue,
  onSelect,
  className = "",
  boxClassName = "",
  textClassName = "",
}) => {
  return (
    <div className={`flex space-x-4 ${className}`}>
      {options.map((option) => (
        <div
          key={option.value}
          className={cn(
            `flex flex-col items-center justify-center w-24 h-24 p-4 border rounded-md cursor-pointer transition-all
            ${
              selectedValue === option.value
                ? "bg-orange-400 text-white border-orange-400"
                : "border-gray-300"
            }`,
            boxClassName
          )}
          onClick={() => onSelect(option.value)}
        >
          {option.icon && (
            <div className="text-2xl mb-2">
              {React.createElement(option.icon)} {/* 아이콘 생성 */}
            </div>
          )}
          <span className={cn(`text-sm font-medium`, textClassName)}>
            {option.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SelectionBox;
