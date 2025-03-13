
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export const SearchBar = ({
  initialValue = "",
  onSearch,
  className
}: SearchBarProps) => {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animate on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "relative w-full transition-all duration-300 ease-in-out",
        isFocused ? "scale-[1.01]" : "scale-100",
        className
      )}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What are you looking for? (e.g., 'quiet cafe with outdoor seating and good wifi')"
          className={cn(
            "w-full h-14 pl-12 pr-4 rounded-xl",
            "shadow-lg",
            "border-2 border-input focus:border-primary/50",
            "text-foreground bg-background/60 backdrop-blur-md",
            "placeholder:text-muted-foreground/80",
            "outline-none focus:ring-2 focus:ring-primary/30",
            "transition-all duration-300",
            "text-base md:text-lg font-medium"
          )}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search 
            className={cn(
              "w-5 h-5 transition-colors duration-300",
              isFocused ? "text-primary" : "text-muted-foreground"
            )} 
          />
        </div>
      </div>
    </form>
  );
};
