
import { FilterOption, Spot } from "../types";

export const defaultFilters: FilterOption[] = [
  { id: "open-now", label: "Open Now" },
  { id: "within-2-miles", label: "Within 2 miles" },
  { id: "moderate-price", label: "$$" },
  { id: "high-rated", label: "High Rated" }
];

export const mockSpots: Spot[] = [
  {
    id: "1",
    name: "The Quiet Corner",
    rating: 4.8,
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
  }
];

export const defaultSearchQuery = "quiet cafe with outdoor seating and good wifi for working";
