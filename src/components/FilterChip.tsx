
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
          ? "bg-primary text-primary-foreground border-primary/20" 
          : "bg-secondary text-secondary-foreground border-secondary/50",
        isHovered && !isActive && "bg-secondary/70",
        "hover:scale-105 active:scale-95"
      )}
    >
      {/* Background animation */}
      {(isHovered || isActive) && (
        <span 
          className={cn(
            "absolute inset-0 opacity-20 bg-gradient-to-r",
            isActive ? "from-white/0 via-white/30 to-white/0" : "",
            "animate-shimmer"
          )} 
        />
      )}
      {filter.label}
    </button>
  );
};
