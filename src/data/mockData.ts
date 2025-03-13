
import { FilterOption, Spot, LocationOption, DistanceFilterOption } from "../types";

export const defaultFilters: FilterOption[] = [
  { id: "open-now", label: "Open Now" },
  { id: "moderate-price", label: "$$" },
  { id: "high-rated", label: "High Rated" }
];

export const distanceOptions: DistanceFilterOption[] = [
  { id: "within-1-mile", label: "Within 1 mile", value: 1 },
  { id: "within-2-miles", label: "Within 2 miles", value: 2 },
  { id: "within-3-miles", label: "Within 3 miles", value: 3 },
  { id: "within-5-miles", label: "Within 5 miles", value: 5 },
  { id: "within-10-miles", label: "Within 10 miles", value: 10 },
];

export const locationOptions: LocationOption[] = [
  { id: "current-location", label: "Use my current location" },
  { id: "downtown", label: "Downtown" },
  { id: "uptown", label: "Uptown" },
  { id: "midtown", label: "Midtown" },
  { id: "west-side", label: "West Side" },
  { id: "east-side", label: "East Side" },
  { id: "custom", label: "Other location..." }
];

export const mockSpots: Spot[] = [
  {
    id: "1",
    name: "The Quiet Corner",
    rating: 4.8,
    style: "Modern Minimalist",
    distance: 0.7,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    badges: [
      { text: "0.7 miles away", type: "blue" },
      { text: "Open until 8pm", type: "green" },
      { text: "$$", type: "orange" }
    ],
    matchReasons: [
      { 
        key: "quiet", 
        highlight: "Quiet atmosphere", 
        description: "mentioned in 18 recent reviews" 
      },
      { 
        key: "outdoor", 
        highlight: "Outdoor seating", 
        description: "with shade and heating lamps" 
      },
      { 
        key: "wifi", 
        highlight: "Fast WiFi", 
        description: "rated excellent by working professionals" 
      }
    ],
    location: {
      address: "123 Main St, Anytown, USA",
      coordinates: {
        lat: 37.7749,
        lng: -122.4194
      }
    },
    contact: {
      phone: "+1 (555) 123-4567",
      website: "https://example.com/quiet-corner"
    }
  },
  {
    id: "2",
    name: "Workspace Cafe",
    rating: 4.6,
    style: "Industrial Modern",
    distance: 1.2,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    badges: [
      { text: "1.2 miles away", type: "blue" },
      { text: "Open until 10pm", type: "green" },
      { text: "$$", type: "orange" }
    ],
    matchReasons: [
      { 
        key: "quiet", 
        highlight: "Designated quiet zones", 
        description: "for focused work" 
      },
      { 
        key: "outdoor", 
        highlight: "Spacious patio", 
        description: "with comfortable seating" 
      },
      { 
        key: "wifi", 
        highlight: "Free high-speed WiFi", 
        description: "and many power outlets" 
      }
    ],
    location: {
      address: "456 Oak St, Anytown, USA",
      coordinates: {
        lat: 37.7739,
        lng: -122.4312
      }
    },
    contact: {
      phone: "+1 (555) 987-6543",
      website: "https://example.com/workspace-cafe"
    }
  },
  {
    id: "3",
    name: "Garden Brews",
    rating: 4.5,
    style: "Bohemian Garden",
    distance: 0.4,
    image: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    badges: [
      { text: "0.4 miles away", type: "blue" },
      { text: "Open until 7pm", type: "green" },
      { text: "$$$", type: "orange" }
    ],
    matchReasons: [
      { 
        key: "quiet", 
        highlight: "Moderately quiet", 
        description: "with ambient music" 
      },
      { 
        key: "outdoor", 
        highlight: "Beautiful garden seating", 
        description: "with natural shade" 
      },
      { 
        key: "wifi", 
        highlight: "Reliable WiFi", 
        description: "though signal stronger indoors" 
      }
    ],
    location: {
      address: "789 Pine St, Anytown, USA",
      coordinates: {
        lat: 37.7831,
        lng: -122.4100
      }
    },
    contact: {
      phone: "+1 (555) 456-7890",
      website: "https://example.com/garden-brews"
    }
  },
  {
    id: "4",
    name: "Sakura Tea House",
    rating: 4.7,
    style: "Japanese Traditional",
    distance: 2.5,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    badges: [
      { text: "2.5 miles away", type: "blue" },
      { text: "Open until 9pm", type: "green" },
      { text: "$$$", type: "orange" }
    ],
    matchReasons: [
      { 
        key: "quiet", 
        highlight: "Serene atmosphere", 
        description: "traditional Japanese decor" 
      },
      { 
        key: "outdoor", 
        highlight: "Zen garden seating", 
        description: "with koi pond and bamboo" 
      },
      { 
        key: "wifi", 
        highlight: "Decent WiFi", 
        description: "perfect for light work" 
      }
    ],
    location: {
      address: "421 Cherry Blossom Way, Anytown, USA",
      coordinates: {
        lat: 37.7855,
        lng: -122.4310
      }
    },
    contact: {
      phone: "+1 (555) 789-0123",
      website: "https://example.com/sakura-tea"
    }
  },
  {
    id: "5",
    name: "Parisian Corner",
    rating: 4.9,
    style: "French Café",
    distance: 1.8,
    image: "https://images.unsplash.com/photo-1515215316771-2742baa337f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    badges: [
      { text: "1.8 miles away", type: "blue" },
      { text: "Open until 11pm", type: "green" },
      { text: "$$", type: "orange" }
    ],
    matchReasons: [
      { 
        key: "quiet", 
        highlight: "Elegant ambiance", 
        description: "with soft French music" 
      },
      { 
        key: "outdoor", 
        highlight: "Parisian-style terrace", 
        description: "with heat lamps for evenings" 
      },
      { 
        key: "wifi", 
        highlight: "Strong WiFi connection", 
        description: "with dedicated work tables" 
      }
    ],
    location: {
      address: "567 Boulevard Ave, Anytown, USA",
      coordinates: {
        lat: 37.7815,
        lng: -122.4250
      }
    },
    contact: {
      phone: "+1 (555) 234-5678",
      website: "https://example.com/parisian-corner"
    }
  },
  {
    id: "6",
    name: "Nordic Brew House",
    rating: 4.6,
    style: "Scandinavian",
    distance: 3.2,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    badges: [
      { text: "3.2 miles away", type: "blue" },
      { text: "Open until 8pm", type: "green" },
      { text: "$$", type: "orange" }
    ],
    matchReasons: [
      { 
        key: "quiet", 
        highlight: "Calm hygge atmosphere", 
        description: "perfect for concentration" 
      },
      { 
        key: "outdoor", 
        highlight: "Minimalist patio", 
        description: "with wood furnishings" 
      },
      { 
        key: "wifi", 
        highlight: "Ultra-fast fiber WiFi", 
        description: "and wireless charging stations" 
      }
    ],
    location: {
      address: "890 Fjord St, Anytown, USA",
      coordinates: {
        lat: 37.7910,
        lng: -122.4380
      }
    },
    contact: {
      phone: "+1 (555) 345-6789",
      website: "https://example.com/nordic-brew"
    }
  },
  {
    id: "7",
    name: "Coastal Beans",
    rating: 4.4,
    style: "Beach Casual",
    distance: 5.5,
    image: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    badges: [
      { text: "5.5 miles away", type: "blue" },
      { text: "Open until 7pm", type: "green" },
      { text: "$", type: "orange" }
    ],
    matchReasons: [
      { 
        key: "quiet", 
        highlight: "Laid-back vibe", 
        description: "with ocean sounds" 
      },
      { 
        key: "outdoor", 
        highlight: "Beachfront seating", 
        description: "with uninterrupted ocean views" 
      },
      { 
        key: "wifi", 
        highlight: "Good WiFi", 
        description: "with no time limits" 
      }
    ],
    location: {
      address: "123 Shore Dr, Anytown, USA",
      coordinates: {
        lat: 37.8023,
        lng: -122.4700
      }
    },
    contact: {
      phone: "+1 (555) 456-7890",
      website: "https://example.com/coastal-beans"
    }
  },
  {
    id: "8",
    name: "Tuscan Terrace",
    rating: 4.7,
    style: "Italian Villa",
    distance: 4.3,
    image: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    badges: [
      { text: "4.3 miles away", type: "blue" },
      { text: "Open until 10pm", type: "green" },
      { text: "$$$", type: "orange" }
    ],
    matchReasons: [
      { 
        key: "quiet", 
        highlight: "Relaxed Italian ambiance", 
        description: "with vineyard views" 
      },
      { 
        key: "outdoor", 
        highlight: "Tuscan-style courtyard", 
        description: "with olive trees and pergola" 
      },
      { 
        key: "wifi", 
        highlight: "Reliable WiFi", 
        description: "best in covered areas" 
      }
    ],
    location: {
      address: "456 Vineyard Rd, Anytown, USA",
      coordinates: {
        lat: 37.7920,
        lng: -122.4550
      }
    },
    contact: {
      phone: "+1 (555) 567-8901",
      website: "https://example.com/tuscan-terrace"
    }
  },
  {
    id: "9",
    name: "Urban Grind",
    rating: 4.5,
    style: "Urban Loft",
    distance: 0.9,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    badges: [
      { text: "0.9 miles away", type: "blue" },
      { text: "Open until 11pm", type: "green" },
      { text: "$$", type: "orange" }
    ],
    matchReasons: [
      { 
        key: "quiet", 
        highlight: "Quiet work zones", 
        description: "with noise-dampening design" 
      },
      { 
        key: "outdoor", 
        highlight: "Urban rooftop deck", 
        description: "with skyline views" 
      },
      { 
        key: "wifi", 
        highlight: "Enterprise-grade WiFi", 
        description: "with separate work network" 
      }
    ],
    location: {
      address: "789 Metro Ave, Anytown, USA",
      coordinates: {
        lat: 37.7800,
        lng: -122.4180
      }
    },
    contact: {
      phone: "+1 (555) 678-9012",
      website: "https://example.com/urban-grind"
    }
  },
  {
    id: "10",
    name: "Rustic Roast",
    rating: 4.3,
    style: "Country Farmhouse",
    distance: 7.2,
    image: "https://images.unsplash.com/photo-1497935586047-9395ee065474?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    badges: [
      { text: "7.2 miles away", type: "blue" },
      { text: "Open until 6pm", type: "green" },
      { text: "$$", type: "orange" }
    ],
    matchReasons: [
      { 
        key: "quiet", 
        highlight: "Peaceful country setting", 
        description: "away from city noise" 
      },
      { 
        key: "outdoor", 
        highlight: "Farm view seating", 
        description: "with covered barn area" 
      },
      { 
        key: "wifi", 
        highlight: "Surprisingly fast WiFi", 
        description: "recently upgraded" 
      }
    ],
    location: {
      address: "101 Country Lane, Anytown, USA",
      coordinates: {
        lat: 37.8100,
        lng: -122.5000
      }
    },
    contact: {
      phone: "+1 (555) 789-0123",
      website: "https://example.com/rustic-roast"
    }
  }
];

// Adding more spots to reach 50 would follow the same pattern with different styles and distances

export const defaultSearchQuery = "quiet cafe with outdoor seating and good wifi for working";
