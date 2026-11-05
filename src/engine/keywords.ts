// What you ask for: the same four kinds of keyword the engine's LLM prompt asks for
// (places, moods, intent, preferences), found with a small bilingual lexicon so the app
// works without an API key. Each keyword points at the labels that satisfy it, or at a place.

export interface Facet {
  label: string;                 // what the person sees, e.g. "quiet"
  kind: "place" | "mood" | "intent" | "preference";
  keys?: string[];               // labels that satisfy it (any one is enough)
  want?: 1 | -1;                 // -1: the label must be absent, e.g. "independent" wants no "chain"
  area?: string;                 // a place, matched by distance
}

const B = "(?<![\\p{L}\\p{N}])", E = "(?![\\p{L}\\p{N}])";
const w = (alts: string) => new RegExp(`${B}(?:${alts})${E}`, "iu");

const L: [RegExp, Facet][] = [
  [w("quiet|calm|peaceful|silent|lonely|alone|relax|relaxing|cozy|cosy|yên tĩnh|một mình|thư giãn|yên bình"), { label: "quiet", kind: "mood", keys: ["quiet"] }],
  [w("lively|buzzing|busy|loud|vibrant|sôi động|nhộn nhịp|đông vui"), { label: "lively", kind: "mood", keys: ["lively"] }],
  [w("work|working|remote|remotely|laptop|study|studying|focus|deadline|làm việc|học bài|học"), { label: "work-friendly", kind: "intent", keys: ["work"] }],
  [w("friends?|chat|group|hang ?out|bạn bè|nhóm|tụ tập"), { label: "with friends", kind: "intent", keys: ["friends", "lively"] }],
  [w("date|romantic|couple|hẹn hò|lãng mạn"), { label: "a date", kind: "intent", keys: ["date", "view", "live music"] }],
  [w("books?|read|reading|library|sách|đọc"), { label: "books", kind: "preference", keys: ["books"] }],
  [w("acoustic|live music|music|jazz|guitar|nhạc|nhạc sống"), { label: "live music", kind: "preference", keys: ["live music"] }],
  [w("hidden|secret|alley|tucked|hẻm|kiệt"), { label: "hidden", kind: "place", keys: ["hidden"] }],
  [w("cheap|budget|student|affordable|giá rẻ|rẻ|bình dân"), { label: "cheap", kind: "preference", keys: ["cheap"] }],
  [w("outdoors?|outside|terrace|ngoài trời|vỉa hè"), { label: "outdoor seats", kind: "place", keys: ["outdoor"] }],
  [w("garden|plants?|green|greenery|sân vườn|vườn|cây xanh"), { label: "garden", kind: "place", keys: ["garden"] }],
  [w("view|rooftop|skyline|sân thượng|ngắm"), { label: "a view", kind: "place", keys: ["view"] }],
  [w("retro|vintage|old saigon|nostalgic|xưa|hoài cổ|bao cấp"), { label: "old Saigon", kind: "mood", keys: ["retro"] }],
  [w("pets?|dogs?|cats?|chó|mèo|thú cưng"), { label: "pets welcome", kind: "preference", keys: ["pets"] }],
  [w("vegan|vegetarian|plant-based|chay"), { label: "vegan", kind: "preference", keys: ["vegan"] }],
  [w("late|night|midnight|khuya|đêm"), { label: "open late", kind: "preference", keys: ["late"] }],
  [w("early|breakfast|sáng sớm"), { label: "opens early", kind: "preference", keys: ["early"] }],
  [w("wi-?fi|internet|mạng"), { label: "Wi-Fi", kind: "preference", keys: ["wifi"] }],
  [w("outlets?|sockets?|plugs?|charg(?:e|ing)|ổ cắm|sạc"), { label: "outlets", kind: "preference", keys: ["outlets"] }],
  [w("air-?con|aircon|air conditioning|máy lạnh|điều hoà|điều hòa|mát"), { label: "air-con", kind: "preference", keys: ["aircon"] }],
  [w("specialty|pour[- ]?over|espresso|roast|roastery|barista|single origin|rang xay"), { label: "specialty coffee", kind: "preference", keys: ["specialty"] }],
  [w("vietnamese coffee|phin|sữa đá|cà phê muối|salt coffee|egg coffee|cà phê trứng|cà phê vợt"), { label: "Vietnamese coffee", kind: "preference", keys: ["vn coffee"] }],
  [w("bubble tea|boba|milk tea|trà sữa"), { label: "bubble tea", kind: "preference", keys: ["bubble tea"] }],
  [/(?<![\p{L}])(?:tea|trà)(?![\p{L}]|\s+sữa)/iu, { label: "tea", kind: "preference", keys: ["tea", "bubble tea"] }],
  [w("dessert|cake|sweet|ice cream|bánh|kem"), { label: "desserts", kind: "preference", keys: ["dessert"] }],
  [w("food|eat|hungry|brunch|lunch|bánh mì|đồ ăn|ăn"), { label: "food", kind: "preference", keys: ["food"] }],
  [w("independent|local|not a chain|không phải chuỗi|quán nhỏ"), { label: "independent", kind: "preference", keys: ["chain"], want: -1 }],
  [w("smoke-free|no smoking|non-smoking|không khói thuốc"), { label: "smoke-free", kind: "preference", keys: ["smokefree"] }],
];

// Old district names, which people still use to say where a place is, with approximate centres.
export const AREAS: Record<string, [number, number]> = {
  "District 1": [10.7756, 106.7004], "District 3": [10.7843, 106.6844], "District 4": [10.7593, 106.7046],
  "District 5": [10.754, 106.6633], "District 7": [10.7295, 106.719], "District 10": [10.7722, 106.668],
  "Phú Nhuận": [10.7995, 106.6791], "Bình Thạnh": [10.8058, 106.707], "Tân Bình": [10.802, 106.653],
  "Gò Vấp": [10.8386, 106.665], "Thảo Điền": [10.8045, 106.738],
};
const PLACES: [RegExp, string][] = [
  ...[1, 3, 4, 5, 7, 10].map(n => [new RegExp(`(?<![\\p{L}\\p{N}])(?:district|quận|q\\.?|d)\\s*${n}(?![\\p{N}])`, "iu"), `District ${n}`] as [RegExp, string]),
  [/phú nhuận|phu nhuan/i, "Phú Nhuận"], [/bình thạnh|binh thanh/i, "Bình Thạnh"], [/tân bình|tan binh/i, "Tân Bình"],
  [/gò vấp|go vap/i, "Gò Vấp"], [/thảo điền|thao dien/i, "Thảo Điền"],
];

export function extractFacets(text: string): Facet[] {
  const out: Facet[] = [];
  for (const [re, f] of L) if (re.test(text) && !out.some(o => o.label === f.label)) out.push(f);
  for (const [re, area] of PLACES) if (re.test(text) && !out.some(o => o.area === area)) out.push({ label: area, kind: "place", area });
  return out;
}

export const facetFor = (label: string): Facet | undefined => L.map(x => x[1]).find(f => f.label === label) ?? (AREAS[label] ? { label, kind: "place", area: label } : undefined);
export const ALL_FACETS = L.map(x => x[1]);
