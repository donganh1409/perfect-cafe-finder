// The personalised ranking over real cafés.
//
//   score = 0.50 · words + 0.35 · taste · words + 0.15 · nearness
//
// - words: for each keyword, how sure we are the café has it. A label with evidence counts
//   0.55 + 0.45 · confidence; evidence against it counts 0; and when nobody has said either
//   way it counts 0.25, because unknown is not the same as no. A place keyword counts by
//   distance from that area's centre.
// - taste: cosine similarity between the café's labels and the labels of the cafés you visit,
//   both measured against the average café. Multiplied by the word match: what you ask for now
//   beats habit. With no words, taste counts in full.
// - nearness: exp(−distance / 1.5 km) from where you are.
// Parts you have not given yet drop out and the rest share their weight.

import { LABEL_KEYS, labelTitle, type Cafe, type Evidence } from "./labels";
import { AREAS, type Facet } from "./keywords";
import { isOpen, hoursText } from "./hours";

export interface Visit { id: string; count: number; love?: boolean }
export interface Filters { distMax: number; openNow: boolean; wifi: boolean; outdoor: boolean; pets: boolean; aircon: boolean; independent: boolean }
export type Sort = "match" | "near" | "evidence";
export interface Origin { lat: number; lon: number; label: string }
export interface Reason { kind: "taste" | "query" | "trait" | "where" | "unknown"; text: string; strong?: string; ev?: Evidence }
export interface Ranked {
  cafe: Cafe; score: number; parts: { query: number; taste: number; near: number }; weights: { query: number; taste: number; near: number };
  distance: number; open: boolean | null; hours: string | null; hits: string[]; unknown: string[]; reasons: Reason[];
}

export const DEFAULT_ORIGIN: Origin = { lat: 10.7798, lon: 106.699, label: "Notre-Dame Cathedral, District 1" };
export const NO_FILTERS: Filters = { distMax: 3, openNow: false, wifi: false, outdoor: false, pets: false, aircon: false, independent: false };

export function km(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = Math.PI / 180, x = (lon2 - lon1) * r * Math.cos(((lat1 + lat2) / 2) * r), y = (lat2 - lat1) * r;
  return 6371 * Math.hypot(x, y);
}
export const walkMin = (d: number) => Math.max(1, Math.round(((d * 1.3) / 4.8) * 60)); // streets are ~30% longer than a straight line
export const fmtKm = (d: number) => (d < 0.995 ? `${Math.max(10, Math.round(d * 100) * 10)} m` : `${d.toFixed(1)} km`);

const vec = (c: Cafe) => LABEL_KEYS.map(k => c.labels[k]?.score ?? 0);
const cos = (a: number[], b: number[]) => { let d = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2 } return na && nb ? d / Math.sqrt(na * nb) : 0 };

// every label measured in standard deviations from the average café, so a rare label (books) weighs more than a common one (Wi-Fi)
const STATS = new WeakMap<Cafe[], { mean: number[]; std: number[] }>();
function stats(cafes: Cafe[]) {
  let s = STATS.get(cafes);
  if (!s) {
    const n = cafes.length || 1, mean = LABEL_KEYS.map(() => 0), sq = LABEL_KEYS.map(() => 0);
    for (const c of cafes) vec(c).forEach((v, i) => (mean[i] += v / n));
    for (const c of cafes) vec(c).forEach((v, i) => (sq[i] += (v - mean[i]) ** 2 / n));
    s = { mean, std: sq.map(v => Math.max(0.1, Math.sqrt(v))) }; STATS.set(cafes, s);
  }
  return s;
}
const centred = (v: number[], s: { mean: number[]; std: number[] }) => v.map((x, i) => (x - s.mean[i]) / s.std[i]);

export function tasteVector(cafes: Cafe[], visits: Visit[]) {
  const s = stats(cafes); let w = 0; const acc = LABEL_KEYS.map(() => 0);
  for (const v of visits) { const c = cafes.find(x => x.id === v.id); if (!c) continue; const k = v.count * (v.love ? 2 : 1); w += k; vec(c).forEach((f, i) => (acc[i] += f * k)) }
  return w ? centred(acc.map(a => a / w), s) : null;
}

/** Your café DNA: the labels your places lean towards, compared with the average café. */
export function dna(cafes: Cafe[], visits: Visit[]) {
  const t = tasteVector(cafes, visits); if (!t) return [];
  return LABEL_KEYS.map((key, i) => ({ key, lean: t[i] })).filter(x => Math.abs(x.lean) > 0.6).sort((a, b) => Math.abs(b.lean) - Math.abs(a.lean)).slice(0, 6)
    .map(x => ({ ...x, title: labelTitle(x.key, x.lean) }));
}

function facetMatch(c: Cafe, f: Facet): { m: number; hit: boolean; unknown: boolean; ev?: Evidence; text?: string } {
  if (f.area) {
    const [la, lo] = AREAS[f.area], d = km(c.lat, c.lon, la, lo);
    return { m: d <= 1.2 ? 1 : Math.max(0, 1 - (d - 1.2) / 1.8), hit: d <= 1.5, unknown: false, text: `${fmtKm(d)} from the centre of ${f.area}` };
  }
  let best: { s: number; ev?: Evidence } | null = null;
  for (const k of f.keys ?? []) {
    const l = c.labels[k]; if (!l) continue;
    const s = (f.want ?? 1) * l.score;
    if (!best || s > best.s) best = { s, ev: l.ev.find(e => e.v * (f.want ?? 1) > 0) ?? l.ev[0] };
  }
  if (!best) return f.want === -1 ? { m: 0.6, hit: false, unknown: true } : { m: 0.25, hit: false, unknown: true };
  if (best.s > 0) return { m: 0.55 + 0.45 * best.s, hit: true, unknown: false, ev: best.ev };
  return { m: 0, hit: false, unknown: false, ev: best.ev };
}

function passes(c: Cafe, f: Filters, d: number) {
  const yes = (k: string) => (c.labels[k]?.score ?? 0) > 0.3;
  if (d > f.distMax) return false;
  if (f.openNow && isOpen(c.week) !== true) return false;
  if (f.wifi && !yes("wifi")) return false;
  if (f.outdoor && !yes("outdoor")) return false;
  if (f.pets && !yes("pets")) return false;
  if (f.aircon && !yes("aircon")) return false;
  if (f.independent && yes("chain")) return false;
  return true;
}

export function rank(cafes: Cafe[], facets: Facet[], visits: Visit[], filters: Filters, sort: Sort, origin: Origin = DEFAULT_ORIGIN): Ranked[] {
  const s = stats(cafes), taste = tasteVector(cafes, visits);
  // naming a place moves "where you want to be" there: distance and nearness are measured from it
  const place = facets.find(f => f.area);
  if (place) origin = { lat: AREAS[place.area!][0], lon: AREAS[place.area!][1], label: `the centre of ${place.area}` };
  const visited = visits.map(v => ({ v, c: cafes.find(x => x.id === v.id)! })).filter(x => x.c);
  const most = visited.slice().sort((a, b) => b.v.count * (b.v.love ? 2 : 1) - a.v.count * (a.v.love ? 2 : 1))[0];
  const visitedVecs = visited.map(x => ({ x, f: centred(vec(x.c), s) }));
  let wq = facets.length ? 0.5 : 0, wt = taste ? 0.35 : 0, wd = 0.15; const sum = wq + wt + wd; wq /= sum; wt /= sum; wd /= sum;
  const out: Ranked[] = [];
  for (const c of cafes) {
    const d = km(origin.lat, origin.lon, c.lat, c.lon); if (!passes(c, filters, d)) continue;
    const ms = facets.map(f => ({ f, ...facetMatch(c, f) }));
    const q = ms.length ? ms.reduce((a, x) => a + x.m, 0) / ms.length : 0;
    const fc = centred(vec(c), s), fit = facets.length ? q : 1;
    const t = taste ? ((cos(fc, taste) + 1) / 2) * fit : 0, near = Math.exp(-d / 1.5);
    const reasons: Reason[] = [];
    if (visits.some(v => v.id === c.id)) reasons.push({ kind: "taste", strong: "One of your places,", text: "you have been here before" });
    else if (visitedVecs.length) {
      const like = visitedVecs.filter(y => y.x.c.id !== c.id).map(y => ({ y, s: cos(fc, y.f) })).sort((a, b) => b.s - a.s)[0];
      if (like && like.s > 0.35) reasons.push({ kind: "taste", strong: `Feels like ${like.y.x.c.name},`, text: like.y.x === most ? "where you go most" : "one of your places" });
    }
    for (const x of ms.filter(x => x.hit && !x.f.area).slice(0, 3)) reasons.push({ kind: "query", strong: `“${x.f.label}”`, text: x.text ?? "", ev: x.ev });
    const unknown = ms.filter(x => x.unknown).map(x => x.f.label);
    if (unknown.length) reasons.push({ kind: "unknown", text: `Not known yet: ${unknown.join(", ")}` });
    const open = isOpen(c.week), hours = hoursText(c.week);
    reasons.push({ kind: "where", text: `${fmtKm(d)}${place ? ` from ${place.area}` : ""} · ${walkMin(d)} min walk${hours ? ` · ${hours}` : ""}` });
    out.push({
      cafe: c, score: wq * q + wt * t + wd * near, parts: { query: q, taste: t, near }, weights: { query: wq, taste: wt, near: wd },
      distance: d, open, hours, hits: ms.filter(x => x.hit).map(x => x.f.label), unknown, reasons,
    });
  }
  const known = (r: Ranked) => Object.keys(r.cafe.labels).length;
  const by: Record<Sort, (a: Ranked, b: Ranked) => number> = {
    match: (a, b) => b.score - a.score || known(b) - known(a) || a.distance - b.distance,
    near: (a, b) => a.distance - b.distance,
    evidence: (a, b) => known(b) - known(a) || b.score - a.score,
  };
  return out.sort(by[sort]);
}
