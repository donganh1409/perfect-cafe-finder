
export interface FilterOption {
  id: string;
  label: string;
}

export interface Badge {
  text: string;
  type: 'blue' | 'green' | 'orange';
}

export interface MatchReason {
  key: string;
  highlight: string;
  description: string;
}

export interface Spot {
  id: string;
  name: string;
  rating: number;
  image: string;
  badges: Badge[];
  matchReasons: MatchReason[];
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone?: string;
    website?: string;
  };
  style?: string; // Japanese, European, Modern, etc.
  distance?: number; // Distance in miles
  vibes?: string; // Energetic, Calm, Social, etc.
  crowdedness?: string; // Quiet, Moderate, Busy, Very Busy
  noiseLevel?: string; // Silent, Low, Moderate, High
  lightingType?: string; // Bright, Dim, Natural, Ambient
  priceRange?: string; // $, $$, $$$, $$$$
  bestFor?: string[]; // ["Working", "Socializing", "Reading", "Dates"]
}

export interface LocationOption {
  id: string;
  label: string;
  value?: string;
}

export interface DistanceFilterOption extends FilterOption {
  value: number;
}
