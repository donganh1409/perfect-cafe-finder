import type { Visit } from "@/engine/rank";

// A sample history of real cafés, for a visitor who wants to see taste at work without
// entering their own: a book café, an acoustic café, an old-Saigon café and a roastery.
export const SAMPLE_HISTORY: Visit[] = [
  { id: "node/12504148358", count: 5, love: true }, // Tĩnh Books and Coffee
  { id: "node/714567078", count: 3 },               // Cà Phê Acoustic
  { id: "way/376483150", count: 2 },                // Cà phê Cõi Xưa
  { id: "node/14197431167", count: 1 },             // Every Half Coffee Roasters, Võ Thị Sáu
];
