
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
        "overflow-hidden backdrop-blur-sm font-medium tracking-wide",
        isActive 
          ? "bg-accent/30 text-accent-foreground border border-accent/50" 
          : "bg-muted/40 text-primary border border-muted/60",
        isHovered && !isActive && "bg-muted/70",
        "hover:scale-105 active:scale-95 shadow-md"
      )}
    >
      {/* Background animation */}
      {(isHovered || isActive) && (
        <span 
          className={cn(
            "absolute inset-0 opacity-40",
            isActive 
              ? "bg-gradient-to-r from-accent/20 via-accent/50 to-accent/20" 
              : "bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10",
            "animate-shimmer"
          )} 
        />
      )}
      <span className={isActive ? "text-white font-semibold" : "text-foreground"}>
        {filter.label}
      </span>
    </button>
  );
};
