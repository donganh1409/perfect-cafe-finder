
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FilterOption } from "@/types";

interface FilterChipProps {
  filter: FilterOption;
  isActive?: boolean;
  onClick: (id: string) => void;
}

export const FilterChip = ({
  filter,
  isActive = false,
  onClick
}: FilterChipProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onClick(filter.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative inline-flex items-center py-1.5 px-3.5 rounded-full text-sm transition-all duration-300",
        "overflow-hidden border",
        isActive 
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-300/30" 
          : "bg-white/70 text-indigo-700 border-indigo-200/50",
        isHovered && !isActive && "bg-indigo-50/80",
        "hover:scale-105 active:scale-95 shadow-sm"
      )}
    >
      {/* Background animation */}
      {(isHovered || isActive) && (
        <span 
          className={cn(
            "absolute inset-0 opacity-20",
            isActive 
              ? "bg-gradient-to-r from-white/0 via-white/30 to-white/0" 
              : "bg-gradient-to-r from-indigo-200/0 via-indigo-200/30 to-indigo-200/0",
            "animate-shimmer"
          )} 
        />
      )}
      {filter.label}
    </button>
  );
};
