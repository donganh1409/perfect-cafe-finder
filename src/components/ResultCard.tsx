
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Spot, Badge, MatchReason } from "@/types";
import { MapPin, Phone, Globe, Star } from "lucide-react";

interface BadgeProps {
  badge: Badge;
}

const BadgeComponent = ({ badge }: BadgeProps) => {
  const colorMap = {
    blue: "bg-spot-100 text-spot-700 border-spot-200",
    green: "bg-green-50 text-green-700 border-green-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100"
  };

  return (
    <span 
      className={cn(
        "inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full",
        "border", colorMap[badge.type]
      )}
    >
      {badge.text}
    </span>
  );
};

interface ReasonItemProps {
  reason: MatchReason;
  index: number;
}

const ReasonItem = ({ reason, index }: ReasonItemProps) => (
  <div 
    className={cn(
      "flex items-start py-1.5 animate-slideRightAndFade"
    )}
    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
  >
    <div className="flex-shrink-0 mt-1 mr-2.5 text-primary">
      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/10">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
    <div>
      <span className="font-medium text-foreground">{reason.highlight}</span>
      <span className="ml-1 text-muted-foreground">{reason.description}</span>
    </div>
  </div>
);

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ActionButton = ({ icon, label, onClick }: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

interface ResultCardProps {
  spot: Spot;
  index: number;
}

export const ResultCard = ({ spot, index }: ResultCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className={cn(
        "bg-card rounded-2xl p-4 md:p-5 shadow-sm border border-border/80",
        "hover:shadow-md hover:border-border transition-all duration-300",
        "animate-fadeIn"
      )}
      style={{ animationDelay: `${0.2 + index * 0.1}s` }}
    >
      <div className="flex justify-between items-start mb-2.5">
        <h3 className="text-xl font-semibold text-card-foreground">{spot.name}</h3>
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-amber-700 text-sm">{spot.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Image with loading state */}
      <div className="relative overflow-hidden rounded-xl h-48 mb-3">
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse",
            imageLoaded ? "opacity-0" : "opacity-100",
            "transition-opacity duration-300"
          )}
        />
        <img
          src={spot.image}
          alt={spot.name}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700",
            imageLoaded ? "scale-100" : "scale-105",
            "hover:scale-110 transition-all duration-700"
          )}
        />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {spot.badges.map((badge, i) => (
          <BadgeComponent key={i} badge={badge} />
        ))}
      </div>

      {/* Match reasons */}
      <div className="p-3.5 rounded-xl bg-spot-50 border border-spot-100 mb-4">
        <h4 className="text-sm font-medium text-spot-800 mb-1">Why this matches your search:</h4>
        {spot.matchReasons.map((reason, i) => (
          <ReasonItem key={reason.key} reason={reason} index={i} />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <ActionButton 
          icon={<MapPin className="w-4 h-4" />} 
          label="Directions" 
          onClick={() => window.open(`https://maps.google.com/?q=${spot.location.coordinates.lat},${spot.location.coordinates.lng}`)} 
        />
        
        {spot.contact.phone && (
          <ActionButton 
            icon={<Phone className="w-4 h-4" />} 
            label="Call" 
            onClick={() => window.open(`tel:${spot.contact.phone}`)} 
          />
        )}
        
        {spot.contact.website && (
          <ActionButton 
            icon={<Globe className="w-4 h-4" />} 
            label="Website" 
            onClick={() => window.open(spot.contact.website, '_blank')} 
          />
        )}
      </div>
    </div>
  );
};
