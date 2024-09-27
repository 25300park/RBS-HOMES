import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500",
        className
      )}
    ></div>
  );
};

export default Spinner;
