// Labels, and the evidence for every one of them.
//
// A café is labelled from four kinds of source, each with its own confidence:
//   tag      an OpenStreetMap tag a mapper set, e.g. internet_access=wlan         0.90
//   hours    its opening_hours, e.g. closes after 22:30 → "open late"            0.95
//   text     a sentence someone wrote about it (Wikivoyage, OSM description)     0.70
//   chain    a sentence about the chain it belongs to                            0.50
//   name     a word in its name, e.g. "Cà Phê Sân Vườn" → garden                 0.45
//   derived  two labels that imply a third, e.g. Wi-Fi + air-con → good for work 0.35
//   notes    Dong Anh's notes, written after reading its reviews                 0.80
//   you      a note you wrote in this browser                                    0.85
// Text is read sentence by sentence, in English and Vietnamese, with negation:
// "not too loud" counts against "lively", "không ồn" against "lively" too.
// Several sources combine like independent witnesses: 1 − Π(1 − confidence).

import { parseHours, latestClose, earliestOpen, type Week } from "./hours";

export type Src = "tag" | "hours" | "text" | "chain" | "name" | "derived" | "notes" | "you";
export interface Evidence { key: string; v: 1 | -1; src: Src; conf: number; quote?: string; hit?: [number, number]; detail?: string; about?: string }
export interface Label { key: string; score: number; ev: Evidence[] }
export interface Note { text: string; at: number }
export interface RawCafe { id: string; name: string; lat: number; lon: number; area: string | null; areaKm: number; tags: Record<string, string>; texts: { src: string; text: string; about?: string }[] }
export interface Cafe extends RawCafe { week: Week | null; labels: Record<string, Label>; notes: { by: "notes" | "you"; text: string; at: number }[] }

export const CONF: Record<Src, number> = { tag: 0.9, hours: 0.95, text: 0.7, chain: 0.5, name: 0.45, derived: 0.35, notes: 0.8, you: 0.85 };
export const SRC_NAME: Record<Src, string> = { tag: "OpenStreetMap", hours: "Opening hours", text: "Description", chain: "About the chain", name: "Its name", derived: "Implied", notes: "Dong Anh's notes", you: "Your note" };

const B = "(?<![\\p{L}\\p{N}])", E = "(?![\\p{L}\\p{N}])";
const w = (alts: string) => new RegExp(`${B}(?:${alts})${E}`, "giu");

interface Def { key: string; title: string; neg?: string; group: "feel" | "practical" | "drinks" | "people"; text?: RegExp; against?: RegExp; name?: RegExp }
const QUIET = "quiet|calm|peaceful|tranquil|silent|serene|relax(?:ing|ed)?|yên tĩnh|yên bình|tĩnh lặng|thư giãn|nhẹ nhàng";
const LOUD = "loud|louder|noisy|blasting|techno|ồn|ồn ào|náo nhiệt|ầm ĩ";
const CHEAP = "cheap|affordable|budget|inexpensive|good value|reasonabl[ey](?: priced)?|reasonable prices|decent prices|rẻ|giá rẻ|bình dân|giá hợp lý";
const PRICEY = "pricey|expensive|overpriced|upscale|đắt|mắc|sang trọng";

export const DEFS: Def[] = [
  { key: "quiet", title: "Quiet", group: "feel", text: w(QUIET), against: w(LOUD) },
  { key: "lively", title: "Lively", group: "feel", text: w(`${LOUD}|lively|busy|buzzing|crowded|jammed|packed|energetic|trendy|vibrant|see and be seen|đông|đông đúc|nhộn nhịp|sôi động`), against: w(QUIET) },
  { key: "hidden", title: "Hidden", group: "feel", text: w("hidden|hidden away|hideaway|tucked away|hard to find|tricky to find|secret|alley|hẻm|kiệt|khó tìm|ẩn mình"), name: w("hẻm|hidden|secret|alley|kiệt|hideout|hideaway") },
  { key: "books", title: "Books", group: "feel", text: w("books?|library|read|reading|comics?|comic books|magazines?|sách|đọc sách|thư viện|truyện"), name: w("sách|books?|library|libro|thư viện|đọc") },
  { key: "live music", title: "Live music", group: "feel", text: w("acoustic|live music|house band|band|guitar|jazz|piano|chamber music|nhạc sống|hát live"), name: w("acoustic|nhạc sống|guitar|piano|jazz") },
  { key: "garden", title: "Garden", group: "feel", text: w("garden|gardens|greenery|plants|koi|hammocks?|sân vườn|vườn|cây xanh|chòi|võng"), name: w("sân vườn|vườn|garden|cá koi|võng|chòi") },
  { key: "view", title: "A view", group: "feel", text: w("(?:great|nice|beautiful|amazing|lovely|good) views?|views? (?:of|over) the (?:city|river|street|park)|rooftop|sky ?bar|balcony|sân thượng|ban công|view đẹp|tầng thượng"), name: w("rooftop|sân thượng|tầng thượng|view|sky") },
  { key: "retro", title: "Old Saigon", group: "feel", text: w("retro|vintage|old saigon|nostalgic|reminiscent|colonial|french tradition|in the past|xưa|hoài cổ|cổ điển|bao cấp"), name: w("xưa|retro|vintage|hoài cổ|bao cấp") },
  { key: "wifi", title: "Wi-Fi", group: "practical", text: w("wi-?fi|internet|wlan") },
  { key: "outlets", title: "Outlets", group: "practical", text: w("(?:power )?outlets?|sockets?|plugs?|charging|ổ cắm|sạc") },
  { key: "aircon", title: "Air-con", group: "practical", text: w("air-?con|air-?conditioning|air-?conditioned|aircon|máy lạnh|điều hoà|điều hòa") },
  { key: "outdoor", title: "Outdoor seats", group: "practical", text: w("outdoors?|outdoor terrace|terrace|open-air|patio|sidewalk|pavement|ngoài trời|vỉa hè") },
  { key: "pets", title: "Pets welcome", group: "practical", text: w("pets?|dogs?|cats?|chó|mèo|thú cưng"), name: w("mèo|cats?|dogs?|chó|pets?|thú cưng") },
  { key: "late", title: "Open late", group: "practical", text: w("open late|late night|late-night|midnight|24/7|24h|khuya|thâu đêm|xuyên đêm"), name: w("24h|24/7") },
  { key: "early", title: "Opens early", group: "practical", text: w("opens early|open early|breakfast|sáng sớm") },
  { key: "work", title: "Good for work", group: "practical", text: w("work|working|laptops?|study|studying|remote work|meetings?|làm việc|học bài|học nhóm") },
  { key: "smokefree", title: "Smoke-free", group: "practical" },
  { key: "stepfree", title: "Step-free", group: "practical" },
  { key: "tea", title: "Tea", group: "drinks", text: w("tea|teas|trà|chè"), name: w("trà|tea|chè") },
  { key: "bubble tea", title: "Bubble tea", group: "drinks", text: w("bubble tea|boba|milk tea|trà sữa"), name: w("trà sữa|milk ?tea|boba") },
  { key: "specialty", title: "Specialty coffee", group: "drinks", text: w("specialty|speciality|espresso|pour[- ]?over|roasters?|roastery|barista|espresso master|arabica|single origin|rang xay|pha máy|cà phê máy"), name: w("roast|roasters?|roastery|rang|specialty|espresso|brew|brewing") },
  { key: "vn coffee", title: "Vietnamese coffee", group: "drinks", text: w("cà phê sữa đá|cafe sua da|ca phe sua da|sữa đá|phin|robusta|vietnamese coffee|vietnamese drinks|cà phê vợt|cà phê muối|salt coffee|egg coffee|cà phê trứng|weasel coffee|cà phê chồn"), name: w("phin|vợt|muối|trứng|bệt|cóc") },
  { key: "dessert", title: "Desserts", group: "drinks", text: w("desserts?|cakes?|pastry|pastries|ice cream|bánh ngọt|kem|bakery"), name: w("kem|bánh|cake|cakes|dessert|bakery|patisserie|gelato") },
  { key: "food", title: "Food", group: "drinks", text: w("food|foods|meals?|banh mi|bánh mì|eggs|rice dishes|brunch|sandwich(?:es)?|đồ ăn|món ăn") },
  { key: "vegan", title: "Vegan", group: "drinks", text: w("vegan|vegetarian|plant-based|chay"), name: w("chay|vegan") },
  { key: "cheap", title: "Cheap", neg: "Pricey", group: "people", text: w(CHEAP), against: w(PRICEY) },
  { key: "friends", title: "With friends", group: "people", text: w("friends|groups?|hang ?out|students?|student-aged|bạn bè|nhóm|tụ tập|sinh viên") },
  { key: "date", title: "Date spot", group: "people", text: w("date|dates|romantic|couples?|hẹn hò|cặp đôi|tình nhân|lãng mạn") },
  { key: "chain", title: "Chain", neg: "Independent", group: "people", text: w("chain|ubiquitous|branches|chuỗi") },
];
export const DEF = Object.fromEntries(DEFS.map(d => [d.key, d])) as Record<string, Def>;
export const LABEL_KEYS = DEFS.map(d => d.key);
export const labelTitle = (key: string, score = 1) => (score < 0 && DEF[key]?.neg) || (score < 0 ? `Not ${DEF[key]?.title.toLowerCase()}` : DEF[key]?.title ?? key);

const CHAINS = /highlands|phúc long|phuc long|starbucks|the coffee house|katinat|cộng cà phê|cong caphe|trung nguyên|trung nguyen|gong ?cha|ông bầu|passio|phê la|koi th[eé]|chagee|mixue|tocotoco|royaltea|bobapop|milano coffee|napoli coffee|laha|circle k/i;
const NEGATION = /(?<![\p{L}])(?:not|no|never|isn't|wasn't|aren't|don't|doesn't|without|hardly|không|chẳng|chả|chưa|đừng|ko)(?![\p{L}])(?:\s+[\p{L}'-]+){0,2}\s*$/iu;

/** Read one text: every label it supports or argues against, with the sentence as evidence. */
export function readText(text: string, src: Src, about?: string, origin?: string): Evidence[] {
  const out: Evidence[] = [];
  const sentences = text.split(/(?<=[.!?…])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  for (const s of sentences) {
    for (const d of DEFS) {
      for (const [re, sign] of [[d.text, 1], [d.against, -1]] as const) {
        if (!re) continue;
        re.lastIndex = 0; let m: RegExpExecArray | null;
        while ((m = re.exec(s))) {
          const neg = NEGATION.test(s.slice(Math.max(0, m.index - 40), m.index));
          const v = (neg ? -sign : sign) as 1 | -1;
          if (!out.some(e => e.key === d.key && e.quote === s && e.v === v)) out.push({ key: d.key, v, src, conf: CONF[src], quote: s, hit: [m.index, m.index + m[0].length], about, detail: origin });
          break;
        }
      }
    }
  }
  return out;
}

function fromTags(t: Record<string, string>, name: string): Evidence[] {
  const out: Evidence[] = [], add = (key: string, v: 1 | -1, detail: string) => out.push({ key, v, src: "tag", conf: CONF.tag, detail });
  const yesNo = (k: string, key: string) => { if (/^(yes|only|limited)$/.test(t[k] ?? "")) add(key, 1, `${k}=${t[k]}`); else if (t[k] === "no") add(key, -1, `${k}=no`) };
  if (/^(wlan|yes|wifi|wired|terminal)$/.test(t.internet_access ?? "")) add("wifi", 1, `internet_access=${t.internet_access}`); else if (t.internet_access === "no") add("wifi", -1, "internet_access=no");
  yesNo("outdoor_seating", "outdoor"); yesNo("air_conditioning", "aircon"); yesNo("pets_allowed", "pets"); yesNo("dog", "pets");
  yesNo("diet:vegan", "vegan"); yesNo("diet:vegetarian", "vegan"); yesNo("wheelchair", "stepfree");
  if (t.smoking === "no" || t.smoking === "outside") add("smokefree", 1, `smoking=${t.smoking}`); else if (/^(yes|isolated|separated)$/.test(t.smoking ?? "")) add("smokefree", -1, `smoking=${t.smoking}`);
  const cuisine = (t.cuisine ?? "").split(";");
  if (cuisine.includes("bubble_tea")) add("bubble tea", 1, "cuisine=bubble_tea");
  if (cuisine.includes("tea")) add("tea", 1, "cuisine=tea");
  if (cuisine.some(c => /ice_cream|cake|dessert|pastry|bakery|frozen_yogurt/.test(c))) add("dessert", 1, `cuisine=${t.cuisine}`);
  if (cuisine.some(c => /sandwich|breakfast|vietnamese|burger|pizza|noodle|brunch/.test(c))) add("food", 1, `cuisine=${t.cuisine}`);
  if (t.brand) add("chain", 1, `brand=${t.brand}`); else if (CHAINS.test(name)) out.push({ key: "chain", v: 1, src: "name", conf: 0.8, detail: "a known chain" });
  return out;
}

function fromHours(week: Week | null, raw?: string): Evidence[] {
  if (!week) return [];
  const out: Evidence[] = [];
  if (latestClose(week) >= 22 * 60 + 30) out.push({ key: "late", v: 1, src: "hours", conf: CONF.hours, detail: raw });
  else out.push({ key: "late", v: -1, src: "hours", conf: CONF.hours, detail: raw });
  if (earliestOpen(week) <= 6 * 60 + 30) out.push({ key: "early", v: 1, src: "hours", conf: CONF.hours, detail: raw });
  return out;
}

function fromName(name: string): Evidence[] {
  const out: Evidence[] = [];
  for (const d of DEFS) if (d.name) { d.name.lastIndex = 0; const m = d.name.exec(name); if (m) out.push({ key: d.key, v: 1, src: "name", conf: CONF.name, quote: name, hit: [m.index, m.index + m[0].length] }) }
  return out;
}

/** Combine evidence per label: agreeing sources reinforce, disagreeing ones cancel. */
export function combine(ev: Evidence[]): Record<string, Label> {
  const out: Record<string, Label> = {};
  for (const key of new Set(ev.map(e => e.key))) {
    const mine = ev.filter(e => e.key === key);
    const p = 1 - mine.filter(e => e.v > 0).reduce((a, e) => a * (1 - e.conf), 1);
    const n = 1 - mine.filter(e => e.v < 0).reduce((a, e) => a * (1 - e.conf), 1);
    out[key] = { key, score: Math.max(-1, Math.min(1, p - n)), ev: mine.sort((a, b) => b.conf - a.conf) };
  }
  return out;
}

export function labelCafe(raw: RawCafe, notes: { by: "notes" | "you"; text: string; at: number }[] = []): Cafe {
  const week = parseHours(raw.tags.opening_hours);
  const ev = [
    ...fromTags(raw.tags, raw.name), ...fromHours(week, raw.tags.opening_hours), ...fromName(raw.name),
    ...raw.texts.flatMap(t => readText(t.text, t.about && t.about !== raw.name ? "chain" : "text", t.about, t.src === "wikivoyage" ? "Wikivoyage" : "OpenStreetMap description")),
    ...notes.flatMap(n => readText(n.text, n.by, undefined, n.by === "you" ? "Your note" : "Dong Anh's notes")),
  ];
  let labels = combine(ev);
  const has = (k: string) => (labels[k]?.score ?? 0) > 0.3;
  if (!labels.work && has("wifi") && (has("aircon") || has("outlets"))) {
    ev.push({ key: "work", v: 1, src: "derived", conf: CONF.derived, detail: has("aircon") ? "Wi-Fi and air-con" : "Wi-Fi and outlets" });
    labels = combine(ev);
  }
  return { ...raw, week, labels, notes };
}
