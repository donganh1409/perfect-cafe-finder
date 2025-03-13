
import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FilterChip } from "@/components/FilterChip";
import { ResultCard } from "@/components/ResultCard";
import { FeedbackSection } from "@/components/FeedbackSection";
import { cn } from "@/lib/utils";
import { defaultFilters, distanceOptions, locationOptions, mockSpots, defaultSearchQuery } from "@/data/mockData";
import { MapPin, Search, MapPinIcon, ChevronDown } from "lucide-react";
import { FilterOption, Spot, LocationOption, DistanceFilterOption } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery);
  const [activeFilters, setActiveFilters] = useState<string[]>(["open-now"]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState<DistanceFilterOption>(distanceOptions[1]); // Default to 2 miles
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(locationOptions[0]); // Default to current location
  const [customLocation, setCustomLocation] = useState<string>("");
  const [showCustomLocation, setShowCustomLocation] = useState(false);

  // Simulate loading data
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      // Filter spots based on selected distance
      const filteredSpots = mockSpots.filter(spot => {
        if (!spot.distance) return true;
        return spot.distance <= selectedDistance.value;
      });
      
      setSpots(filteredSpots.slice(0, 10)); // Limit to 10 spots for display
      setHasSearched(true);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters, selectedDistance, selectedLocation]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would trigger an API call with the new query
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId) 
        : [...prev, filterId]
    );
  };

  const handleDistanceChange = (value: string) => {
    const option = distanceOptions.find(opt => opt.id === value);
    if (option) {
      setSelectedDistance(option);
    }
  };

  const handleLocationChange = (value: string) => {
    const option = locationOptions.find(opt => opt.id === value);
    if (option) {
      setSelectedLocation(option);
      setShowCustomLocation(value === "custom");
    }
  };

  const handleFeedback = (isPositive: boolean, comment?: string) => {
    // In a real app, this would send feedback to the backend
    console.log("Feedback received:", { isPositive, comment });
  };

  const getLocationDisplay = () => {
    if (selectedLocation.id === "custom" && customLocation) {
      return customLocation;
    }
    if (selectedLocation.id === "current-location") {
      return "Near You";
    }
    return selectedLocation.label;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-6 bg-gradient-to-br from-spot-600 to-spot-800 text-white">
        <div className="container max-w-screen-lg mx-auto px-4">
          <div className="text-center mb-8 animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">PerfectSpot</h1>
            <p className="text-white/80">Find exactly what you're looking for</p>
          </div>
          
          {/* Search Container */}
          <div 
            className={cn(
              "max-w-2xl mx-auto p-5 rounded-2xl backdrop-blur-md",
              "bg-white/10 shadow-lg border border-white/20",
              "animate-fadeIn delay-1"
            )}
          >
            <SearchBar 
              initialValue={searchQuery} 
              onSearch={handleSearch}
              className="mb-4"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Distance Selector */}
              <div>
                <Select
                  value={selectedDistance.id}
                  onValueChange={handleDistanceChange}
                >
                  <SelectTrigger className="bg-white/90 border-white/20">
                    <SelectValue placeholder="Select distance" />
                  </SelectTrigger>
                  <SelectContent>
                    {distanceOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Selector */}
              <div>
                <Select 
                  value={selectedLocation.id}
                  onValueChange={handleLocationChange}
                >
                  <SelectTrigger className="bg-white/90 border-white/20">
                    <SelectValue placeholder="Choose location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Location Input */}
            {showCustomLocation && (
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Enter a location..."
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="bg-white/90 border-white/20"
                />
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {defaultFilters.map((filter) => (
                <FilterChip
                  key={filter.id}
                  filter={filter}
                  isActive={activeFilters.includes(filter.id)}
                  onClick={toggleFilter}
                />
              ))}
            </div>
            
            <button 
              onClick={() => handleSearch(searchQuery)}
              className={cn(
                "w-full h-12 flex items-center justify-center gap-2",
                "bg-white text-spot-800 rounded-xl font-medium",
                "hover:bg-white/90 active:scale-[0.98] transition-all duration-200"
              )}
            >
              <Search className="w-4 h-4" />
              <span>Find Perfect Spots</span>
            </button>
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="container max-w-screen-lg mx-auto px-4 py-8">
        {hasSearched && (
          <div className="mb-6 animate-fadeIn delay-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Best Matches <span className="text-muted-foreground">({spots.length})</span>
              </h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{getLocationDisplay()}</span>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          // Loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-card p-4 shadow-sm border border-border animate-pulse h-[460px]">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/4 mb-4 ml-auto"></div>
                <div className="h-48 bg-muted rounded-xl mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-muted rounded-full w-24"></div>
                  <div className="h-6 bg-muted rounded-full w-32"></div>
                </div>
                <div className="h-32 bg-muted rounded-xl mb-4"></div>
                <div className="flex justify-between pt-2">
                  <div className="h-8 bg-muted rounded w-1/4"></div>
                  <div className="h-8 bg-muted rounded w-1/4"></div>
                  <div className="h-8 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Results grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {spots.map((spot, index) => (
                <ResultCard key={spot.id} spot={spot} index={index} />
              ))}
            </div>

            {/* Feedback section */}
            <FeedbackSection onFeedback={handleFeedback} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 bg-muted/30 border-t border-border mt-12">
        <div className="container max-w-screen-lg mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2023 PerfectSpot. Find the perfect place that matches your needs.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
