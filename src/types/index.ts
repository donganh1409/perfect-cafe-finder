
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
}
