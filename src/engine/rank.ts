// The personalised ranking: what you asked for, what your visits say about you, and how far it is.
//
//   score = wq * query match + wt * taste match * query match + wd * nearness
//
// - query match: the share of your keywords a café satisfies
// - taste match: cosine similarity between the café and your visits, both measured
//   against the average café, so it rewards what makes your favourites different.
//   It is multiplied by the query match: what you ask for now beats habit, and taste
//   breaks ties among the cafés that fit your words. With no words, taste counts in full.
// - nearness: exp(-distance / 2 km)
// The weights drop the parts you have not given yet (no keywords, no visits) and the rest share their weight.

import { CAFES, type Cafe } from "@/data/cafes";
import type { Facet } from "./keywords";

export interface Visit { id: string; count: number; love?: boolean }
export interface Filters { noiseMax: number; crowdMax: number; priceMax: number; distMax: number; openNow: boolean; workReady: boolean; pets: boolean; outdoor: boolean }
export type Sort = "match" | "near" | "quiet" | "cheap";
export interface Reason { kind: "taste" | "query" | "trait" | "where"; text: string; strong?: string }
export interface Ranked { cafe: Cafe; score: number; parts: { query: number; taste: number; near: number }; weights: { query: number; taste: number; near: number }; distance: number; openNow: boolean; reasons: Reason[] }

export const TAGS = ["books", "acoustic music", "plants", "outdoor", "hidden", "fast wifi", "power outlets", "specialty coffee", "pet friendly", "vegan", "late night", "tea", "dessert", "big tables", "vintage"];
const FEATURE_NAMES = ["calm", "focus", "social", "quiet", "uncrowded", "warm light", "bright", "dim", "affordable", ...TAGS];

export function features(c: Cafe): number[] {
  return [
    c.vibe === "calm" ? 1 : 0, c.vibe === "focus" ? 1 : 0, c.vibe === "social" ? 1 : 0,
    1 - c.noise, 1 - c.crowd,
    c.light === "warm" ? 1 : 0, c.light === "bright" || c.light === "natural" ? 1 : 0, c.light === "dim" ? 1 : 0,
    Math.max(0, Math.min(1, 1 - (c.price - 30000) / 50000)),
    ...TAGS.map(t => (c.tags.includes(t) ? 1 : 0)),
  ];
}

// every feature is measured in standard deviations from the average café, so a 0..1 slider like "quiet" weighs as much as a yes/no tag
const MEAN = (() => { const s = FEATURE_NAMES.map(() => 0); for (const c of CAFES) features(c).forEach((v, i) => (s[i] += v / CAFES.length)); return s })();
const STD = (() => { const s = FEATURE_NAMES.map(() => 0); for (const c of CAFES) features(c).forEach((v, i) => (s[i] += (v - MEAN[i]) ** 2 / CAFES.length)); return s.map(v => Math.max(0.15, Math.sqrt(v))) })();
const centred = (v: number[]) => v.map((x, i) => (x - MEAN[i]) / STD[i]);
const cos = (a: number[], b: number[]) => { let d = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] } return na && nb ? d / Math.sqrt(na * nb) : 0 };

export const distance = (c: Cafe) => Math.hypot(c.x, c.y);
export const walkMin = (km: number) => Math.max(1, Math.round((km * 1.25 / 4.8) * 60)); // streets are ~25% longer than a straight line
export function isOpen(c: Cafe, at = new Date()) { const h = at.getHours() + at.getMinutes() / 60; const [o, cl] = c.open; return cl > 24 ? h >= o || h < cl - 24 : h >= o && h < cl }
export const fmtHour = (h: number) => `${String(h % 24).padStart(2, "0")}:00`;

/** Your taste: the visit-weighted average of the cafés you went to (a loved café counts double), centred. */
export function tasteVector(visits: Visit[]) {
  let w = 0; const acc = FEATURE_NAMES.map(() => 0);
  for (const v of visits) { const c = CAFES.find(x => x.id === v.id); if (!c) continue; const k = v.count * (v.love ? 2 : 1); w += k; features(c).forEach((f, i) => (acc[i] += f * k)) }
  return w ? centred(acc.map(a => a / w)) : null;
}

/** Your café DNA: the traits your visits lean towards most, compared with the average café. */
export function dna(visits: Visit[]) {
  const t = tasteVector(visits); if (!t) return [];
  return FEATURE_NAMES.map((name, i) => ({ name, lean: t[i] })).filter(x => x.lean > 0.25).sort((a, b) => b.lean - a.lean).slice(0, 6);
}

function queryMatch(c: Cafe, facets: Facet[]) {
  if (!facets.length) return { score: 0, hits: [] as string[] };
  const hits: string[] = []; let s = 0;
  for (const f of facets) {
    let m = 1;
    if (f.vibe) m = Math.min(m, c.vibe === f.vibe ? 1 : f.vibe === "calm" && c.vibe === "focus" ? 0.5 : 0);
    if (f.noiseMax !== undefined) m = Math.min(m, c.noise <= f.noiseMax ? 1 : Math.max(0, 1 - (c.noise - f.noiseMax) * 3));
    if (f.priceMax !== undefined) m = Math.min(m, c.price <= f.priceMax ? 1 : 0.2);
    if (f.light) m = Math.min(m, f.light.includes(c.light) ? 1 : 0);
    if (f.tag) m = Math.min(m, c.tags.includes(f.tag) || (f.tag === "outdoor" && c.tags.includes("rooftop")) ? 1 : 0);
    if (f.bestFor) m = Math.min(m, c.bestFor.includes(f.bestFor) ? 1 : 0);
    if (f.area) m = Math.min(m, c.area === f.area ? 1 : 0);
    s += m; if (m >= 0.99) hits.push(f.label);
  }
  return { score: s / facets.length, hits };
}

function passes(c: Cafe, f: Filters, d: number) {
  if (c.noise > f.noiseMax + 1e-9 || c.crowd > f.crowdMax + 1e-9 || c.price > f.priceMax || d > f.distMax) return false;
  if (f.openNow && !isOpen(c)) return false;
  if (f.workReady && !(c.tags.includes("fast wifi") && c.tags.includes("power outlets"))) return false;
  if (f.pets && !c.tags.includes("pet friendly")) return false;
  if (f.outdoor && !(c.tags.includes("outdoor") || c.tags.includes("rooftop"))) return false;
  return true;
}

const TRAIT_TEXT: Record<string, (c: Cafe) => string> = {
  quiet: c => `Quiet, ${Math.round(c.noise * 10)}/10 on noise`, uncrowded: () => "Rarely crowded", "warm light": () => "Warm light", bright: () => "Bright and airy", dim: () => "Low, soft light",
  affordable: c => `${Math.round(c.price / 1000)}k ₫ a drink`, calm: () => "A calm room", focus: () => "Made for focus", social: () => "Lively",
};

export function rank(facets: Facet[], visits: Visit[], filters: Filters, sort: Sort): Ranked[] {
  const taste = tasteVector(visits);
  const visited = visits.map(v => ({ v, c: CAFES.find(x => x.id === v.id)! })).filter(x => x.c);
  const most = visited.slice().sort((a, b) => b.v.count * (b.v.love ? 2 : 1) - a.v.count * (a.v.love ? 2 : 1))[0];
  let wq = facets.length ? 0.5 : 0, wt = taste ? 0.35 : 0, wd = 0.15; const sum = wq + wt + wd; wq /= sum; wt /= sum; wd /= sum;
  const out: Ranked[] = [];
  for (const c of CAFES) {
    const d = distance(c); if (!passes(c, filters, d)) continue;
    const q = queryMatch(c, facets), fc = centred(features(c));
    const fit = facets.length ? q.score : 1, t = taste ? ((cos(fc, taste) + 1) / 2) * fit : 0, near = Math.exp(-d / 2);
    const reasons: Reason[] = [];
    if (taste && visited.length) {
      const like = visited.filter(x => x.c.id !== c.id).map(x => ({ x, s: cos(fc, centred(features(x.c))) })).sort((a, b) => b.s - a.s)[0];
      if (visits.some(v => v.id === c.id)) reasons.push({ kind: "taste", text: "you have been here before", strong: "One of your places," });
      else if (like && like.s > 0.35) reasons.push({ kind: "taste", text: like.x === most ? "where you go most" : "which you go to", strong: `Feels like ${like.x.c.name},` });
    }
    if (q.hits.length) reasons.push({ kind: "query", text: q.hits.map(h => `“${h}”`).join(", "), strong: "Matches" });
    if (taste) {
      // both must lean the same, positive way: two "not lively" signs multiply to a positive number but are not a shared trait
      const top = fc.map((v, i) => ({ i, s: v > 0 && taste[i] > 0 ? v * taste[i] : 0 })).filter(x => x.s > 0 && TRAIT_TEXT[FEATURE_NAMES[x.i]]).sort((a, b) => b.s - a.s)[0];
      if (top) reasons.push({ kind: "trait", text: TRAIT_TEXT[FEATURE_NAMES[top.i]](c) });
    }
    const open = isOpen(c);
    reasons.push({ kind: "where", text: `${d < 1 ? (d * 1000).toFixed(0) + " m" : d.toFixed(1) + " km"} · ${walkMin(d)} min walk · ${open ? "open until " + fmtHour(c.open[1]) : "opens " + fmtHour(c.open[0])}` });
    out.push({ cafe: c, score: wq * q.score + wt * t + wd * near, parts: { query: q.score, taste: t, near }, weights: { query: wq, taste: wt, near: wd }, distance: d, openNow: open, reasons: reasons.slice(0, 3).concat(reasons.slice(-1)).filter((r, i, a) => a.indexOf(r) === i) });
  }
  const by: Record<Sort, (a: Ranked, b: Ranked) => number> = {
    match: (a, b) => b.score - a.score, near: (a, b) => a.distance - b.distance, quiet: (a, b) => a.cafe.noise - b.cafe.noise, cheap: (a, b) => a.cafe.price - b.cafe.price,
  };
  return out.sort(by[sort]);
}

export const SAMPLE_HISTORY: Visit[] = [
  { id: "slow-room", count: 6, love: true }, { id: "may-lang", count: 3 }, { id: "vuon-tra", count: 2 }, { id: "studio-9", count: 1 },
];
