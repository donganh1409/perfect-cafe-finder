
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
        "relative inline-flex items-center py-1.5 px-3.5 rounded-lg text-sm transition-all duration-300",
        "overflow-hidden backdrop-blur-sm",
        isActive 
          ? "bg-accent/20 text-accent border border-accent/30" 
          : "bg-muted/30 text-primary border border-muted/50",
        isHovered && !isActive && "bg-muted/50",
        "hover:scale-105 active:scale-95 shadow-sm"
      )}
    >
      {/* Background animation */}
      {(isHovered || isActive) && (
        <span 
          className={cn(
            "absolute inset-0 opacity-30",
            isActive 
              ? "bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0" 
              : "bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0",
            "animate-shimmer"
          )} 
        />
      )}
      {filter.label}
    </button>
  );
};
