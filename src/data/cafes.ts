// Sample cafés for the demo. The names, places and numbers are invented; the photos are from Unsplash.
// x and y are kilometres east and north of "you", so distance and the map work without a location.

export type Vibe = "calm" | "focus" | "social";
export type Light = "warm" | "bright" | "natural" | "dim";

export interface Cafe {
  id: string;
  name: string;
  area: string;
  image: string;
  vibe: Vibe;
  noise: number; // 0 silent .. 1 loud
  crowd: number; // 0 empty .. 1 packed
  light: Light;
  price: number; // a typical drink, in đồng
  rating: number;
  tags: string[];
  bestFor: string[];
  open: [number, number]; // hours, 24h clock; close may pass midnight (e.g. 26 = 2am)
  x: number;
  y: number;
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&q=70`;

export const CAFES: Cafe[] = [
  { id: "slow-room", name: "The Slow Room", area: "District 3", image: img("1501339847302-ac426a4a7cbb"), vibe: "calm", noise: 0.2, crowd: 0.3, light: "warm", price: 45000, rating: 4.7, tags: ["books", "acoustic music", "fast wifi", "power outlets"], bestFor: ["reading", "working", "alone"], open: [7, 22], x: -0.4, y: 0.5 },
  { id: "goc-sach", name: "Góc Sách", area: "District 1", image: img("1521017432531-fbd92d768814"), vibe: "calm", noise: 0.15, crowd: 0.25, light: "warm", price: 35000, rating: 4.6, tags: ["books", "hidden", "vintage"], bestFor: ["reading", "alone"], open: [8, 21], x: 0.9, y: -0.3 },
  { id: "green-hour", name: "Green Hour", area: "Bình Thạnh", image: img("1554118811-1e0d58224f24"), vibe: "social", noise: 0.55, crowd: 0.6, light: "natural", price: 55000, rating: 4.5, tags: ["plants", "outdoor", "specialty coffee", "pet friendly"], bestFor: ["friends", "dates"], open: [7, 23], x: 1.8, y: 1.6 },
  { id: "nang-mai", name: "Nắng Mai", area: "Phú Nhuận", image: img("1534040385115-33dcb3acba5b"), vibe: "focus", noise: 0.3, crowd: 0.35, light: "natural", price: 40000, rating: 4.4, tags: ["plants", "fast wifi", "power outlets", "breakfast"], bestFor: ["working", "alone"], open: [6, 18], x: -1.2, y: 2.1 },
  { id: "hem-14", name: "Hẻm Mười Bốn", area: "District 1", image: img("1559925393-8be0ec4767c8"), vibe: "calm", noise: 0.25, crowd: 0.2, light: "dim", price: 30000, rating: 4.5, tags: ["hidden", "vintage", "acoustic music"], bestFor: ["alone", "dates"], open: [9, 23], x: 0.6, y: -0.9 },
  { id: "may-lang", name: "Mây Lặng", area: "District 3", image: img("1445116572660-236099ec97a0"), vibe: "calm", noise: 0.1, crowd: 0.15, light: "warm", price: 60000, rating: 4.8, tags: ["tea", "books", "rooftop"], bestFor: ["reading", "alone"], open: [9, 22], x: -1.6, y: 0.2 },
  { id: "saigon-loft", name: "Saigon Loft", area: "District 1", image: img("1517502884422-41eaead166d4"), vibe: "focus", noise: 0.35, crowd: 0.45, light: "bright", price: 65000, rating: 4.5, tags: ["fast wifi", "power outlets", "specialty coffee", "big tables"], bestFor: ["working", "meetings"], open: [7, 22], x: 0.3, y: 0.2 },
  { id: "ben-tau", name: "Bến Tàu Coffee", area: "District 4", image: img("1525610553991-2bede1a236e2"), vibe: "social", noise: 0.65, crowd: 0.7, light: "natural", price: 45000, rating: 4.3, tags: ["outdoor", "river view", "late night"], bestFor: ["friends"], open: [7, 24], x: 1.4, y: -2.2 },
  { id: "paper-lantern", name: "Paper Lantern", area: "District 3", image: img("1511081692775-05d0f180a065"), vibe: "social", noise: 0.4, crowd: 0.4, light: "dim", price: 75000, rating: 4.6, tags: ["dessert", "acoustic music", "romantic"], bestFor: ["dates", "friends"], open: [10, 24], x: -0.9, y: -0.7 },
  { id: "lo-rang", name: "Lò Rang", area: "Thảo Điền", image: img("1453614512568-c4024d13c247"), vibe: "focus", noise: 0.45, crowd: 0.5, light: "bright", price: 70000, rating: 4.7, tags: ["specialty coffee", "fast wifi"], bestFor: ["working", "alone"], open: [7, 21], x: 3.1, y: 1.2 },
  { id: "cun", name: "Cún Café", area: "Bình Thạnh", image: img("1600093463592-8e36ae95ef56"), vibe: "social", noise: 0.6, crowd: 0.55, light: "natural", price: 50000, rating: 4.4, tags: ["pet friendly", "outdoor", "plants"], bestFor: ["friends"], open: [8, 21], x: 2.2, y: 0.4 },
  { id: "night-owl", name: "Night Owl", area: "District 1", image: img("1572116469696-31de0f17cc34"), vibe: "social", noise: 0.5, crowd: 0.45, light: "dim", price: 45000, rating: 4.3, tags: ["late night", "acoustic music", "power outlets"], bestFor: ["friends", "working"], open: [18, 26], x: 0.1, y: -1.4 },
  { id: "vuon-tra", name: "Vườn Trà", area: "Phú Nhuận", image: img("1509042239860-f550ce710b93"), vibe: "calm", noise: 0.2, crowd: 0.3, light: "natural", price: 50000, rating: 4.6, tags: ["tea", "plants", "outdoor", "vegan"], bestFor: ["reading", "dates"], open: [8, 22], x: -2.3, y: 1.4 },
  { id: "studio-9", name: "Studio 9", area: "District 3", image: img("1493857671505-72967e2e2760"), vibe: "focus", noise: 0.3, crowd: 0.4, light: "bright", price: 55000, rating: 4.5, tags: ["fast wifi", "power outlets", "quiet zone", "vegan"], bestFor: ["working"], open: [7, 22], x: -0.6, y: 1.3 },
  { id: "long-table", name: "The Long Table", area: "District 10", image: img("1517248135467-4c7edcad34c4"), vibe: "social", noise: 0.7, crowd: 0.8, light: "bright", price: 40000, rating: 4.2, tags: ["big tables", "fast wifi"], bestFor: ["friends", "group study"], open: [7, 23], x: -2.8, y: -1.1 },
  { id: "ca-phe-hat", name: "Cà phê Hạt", area: "District 1", image: img("1442512595331-e89e73853f31"), vibe: "calm", noise: 0.35, crowd: 0.4, light: "warm", price: 38000, rating: 4.5, tags: ["books", "specialty coffee", "power outlets"], bestFor: ["working", "reading"], open: [7, 22], x: 1.1, y: 0.7 },
];

export const byId = (id: string) => CAFES.find(c => c.id === id);
