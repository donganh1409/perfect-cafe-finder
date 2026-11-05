// On-device keyword extraction: the same four kinds of keyword the LLM prompt asks for
// (places, moods, intent, preferences), found with a small bilingual lexicon so the demo
// works without an API key. The Python engine does this step with an LLM.

import type { Light, Vibe } from "@/data/cafes";

export interface Facet {
  label: string; // what the person sees, e.g. "quiet"
  kind: "place" | "mood" | "intent" | "preference";
  vibe?: Vibe;
  noiseMax?: number;
  priceMax?: number;
  light?: Light[];
  tag?: string;
  bestFor?: string;
  area?: string;
}

const L: [RegExp, Facet][] = [
  [/\b(quiet|calm|peaceful|silent|lonely|alone|relax(?:ing)?|cozy|cosy)\b|yên tĩnh|một mình|thư giãn/i, { label: "quiet", kind: "mood", vibe: "calm", noiseMax: 0.35 }],
  [/\b(work(?:ing)?|remote(?:ly)?|laptop|study(?:ing)?|focus|deadline)\b|làm việc|học bài/i, { label: "work-friendly", kind: "intent", bestFor: "working" }],
  [/\b(friends?|chat|lively|busy|group|hang ?out)\b|bạn bè|nhóm/i, { label: "with friends", kind: "intent", vibe: "social" }],
  [/\b(date|romantic|couple)\b|hẹn hò/i, { label: "a date", kind: "intent", bestFor: "dates", light: ["dim", "warm"] }],
  [/\b(books?|read(?:ing)?|library)\b|sách|đọc/i, { label: "books", kind: "preference", tag: "books" }],
  [/\b(acoustic|music|jazz|guitar)\b|nhạc/i, { label: "acoustic music", kind: "preference", tag: "acoustic music" }],
  [/\b(hidden|secret|alley|tucked)\b|hẻm/i, { label: "hidden", kind: "place", tag: "hidden" }],
  [/\b(cheap|budget|student|affordable)\b|giá rẻ|(?:^|\s)rẻ(?=$|\s|[,.!?])/i, { label: "cheap", kind: "preference", priceMax: 40000 }],
  [/\b(outdoors?|outside|garden|terrace|rooftop|river)\b|ngoài trời|sân vườn/i, { label: "outdoor", kind: "place", tag: "outdoor" }],
  [/\b(plants?|green(?:ery)?)\b|cây xanh/i, { label: "plants", kind: "preference", tag: "plants" }],
  [/\b(pets?|dogs?|cats?)\b|chó|mèo/i, { label: "pet friendly", kind: "preference", tag: "pet friendly" }],
  [/\b(vegan|vegetarian|plant-based)\b|\bchay\b/i, { label: "vegan", kind: "preference", tag: "vegan" }],
  [/\b(late|night|midnight)\b|khuya/i, { label: "open late", kind: "preference", tag: "late night" }],
  [/\b(wi-?fi|internet)\b/i, { label: "fast wifi", kind: "preference", tag: "fast wifi" }],
  [/\b(outlets?|sockets?|plugs?|charg(?:e|ing))\b|ổ cắm/i, { label: "power outlets", kind: "preference", tag: "power outlets" }],
  [/\b(specialty|pour[- ]?over|espresso|roast(?:ery)?)\b/i, { label: "specialty coffee", kind: "preference", tag: "specialty coffee" }],
  [/\btea\b|(?:^|\s)trà(?=$|\s|[,.!?])/i, { label: "tea", kind: "preference", tag: "tea" }],
  [/\b(dessert|cake|sweet)\b|bánh/i, { label: "dessert", kind: "preference", tag: "dessert" }],
  [/\b(warm light|dim|candle|lamp)\b/i, { label: "warm light", kind: "mood", light: ["warm", "dim"] }],
  [/\b(bright|sunny|sunlight|natural light)\b|nhiều nắng/i, { label: "bright", kind: "mood", light: ["bright", "natural"] }],
  [/\b(district|quận|q\.?|d)\s*1\b/i, { label: "District 1", kind: "place", area: "District 1" }],
  [/\b(district|quận|q\.?|d)\s*3\b/i, { label: "District 3", kind: "place", area: "District 3" }],
  [/\b(district|quận|q\.?|d)\s*4\b/i, { label: "District 4", kind: "place", area: "District 4" }],
  [/\b(district|quận|q\.?|d)\s*10\b/i, { label: "District 10", kind: "place", area: "District 10" }],
  [/phú nhuận|phu nhuan/i, { label: "Phú Nhuận", kind: "place", area: "Phú Nhuận" }],
  [/bình thạnh|binh thanh/i, { label: "Bình Thạnh", kind: "place", area: "Bình Thạnh" }],
  [/thảo điền|thao dien/i, { label: "Thảo Điền", kind: "place", area: "Thảo Điền" }],
];

export function extractFacets(text: string): Facet[] {
  const out: Facet[] = [];
  for (const [re, f] of L) if (re.test(text) && !out.some(o => o.label === f.label)) out.push(f);
  return out;
}

export const facetFor = (label: string) => L.map(x => x[1]).find(f => f.label === label);
export const ALL_FACETS = L.map(x => x[1]);
