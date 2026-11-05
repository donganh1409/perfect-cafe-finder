import { describe, expect, it } from "vitest";
import { extractFacets } from "../keywords";
import { combine, labelCafe, readText, type RawCafe } from "../labels";
import { parseHours, isOpen, hoursText } from "../hours";
import { rank, dna, fmtKm, NO_FILTERS } from "../rank";
import { buildCafes } from "@/data";
import { SAMPLE_HISTORY } from "@/data/sample";

const cafe = (id: string, over: Partial<RawCafe> = {}): RawCafe => ({ id, name: id, lat: 10.7798, lon: 106.699, area: "District 1", areaKm: 0.5, tags: {}, texts: [], ...over });
const score = (c: ReturnType<typeof labelCafe>, k: string) => c.labels[k]?.score ?? 0;
// Saturday 5 Sep 2026, 23:30 in Saigon (UTC+7)
const SAT_2330 = new Date("2026-09-05T16:30:00Z");

describe("reading what people say", () => {
  it("finds labels in English, with the sentence as evidence", () => {
    const ev = readText("As its name implies, this place is hidden away and a good place to read, or have a quiet conversation.", "text");
    expect(new Set(ev.filter(e => e.v > 0).map(e => e.key))).toEqual(new Set(["hidden", "books", "quiet"]));
    const q = ev.find(e => e.key === "quiet")!;
    expect(q.quote!.slice(q.hit![0], q.hit![1])).toBe("quiet");
  });
  it("reads Vietnamese, and turns negation around", () => {
    const c = labelCafe(cafe("vi", { texts: [{ src: "you", text: "Quán yên tĩnh, có wifi mạnh. Không ồn chút nào." }] }));
    expect(score(c, "quiet")).toBeGreaterThan(0.6);
    expect(score(c, "wifi")).toBeGreaterThan(0.6);
    expect(score(c, "lively")).toBeLessThan(0);
  });
  it("hears 'not too loud' as against lively", () => {
    const ev = readText("Piped music is nice, not too loud by day.", "text");
    expect(ev.find(e => e.key === "lively")?.v).toBe(-1);
  });
  it("does not take 'a view of local life' for a view", () => {
    expect(readText("It offers an interesting view of local life.", "text").some(e => e.key === "view")).toBe(false);
  });
  it("lets independent sources reinforce each other", () => {
    const l = combine([{ key: "quiet", v: 1, src: "text", conf: 0.7 }, { key: "quiet", v: 1, src: "name", conf: 0.45 }]);
    expect(l.quiet.score).toBeCloseTo(1 - 0.3 * 0.55, 6);
  });
  it("reads OpenStreetMap tags and names", () => {
    const c = labelCafe(cafe("t", { name: "Cà Phê Sân Vườn Phố Nhỏ", tags: { internet_access: "wlan", air_conditioning: "yes", brand: "Highlands Coffee" } }));
    expect(score(c, "wifi")).toBeCloseTo(0.9);
    expect(score(c, "garden")).toBeCloseTo(0.45);
    expect(score(c, "chain")).toBeGreaterThan(0.8);
    expect(c.labels.work?.ev[0].src).toBe("derived");
  });
  it("does not call a bubble-tea chain named Koi Thé a garden", () => {
    expect(score(labelCafe(cafe("k", { name: "Cà Phê Koi Thé" })), "garden")).toBe(0);
  });
  it("lets your own note add labels", () => {
    const c = labelCafe(cafe("n"), [{ by: "you", text: "Lots of old books and acoustic guitar at night.", at: 1 }]);
    expect(c.labels.books.ev[0].src).toBe("you");
    expect(score(c, "live music")).toBeGreaterThan(0.8);
  });
});

describe("opening hours, in Saigon time", () => {
  it("parses rules, day ranges and past-midnight closing", () => {
    const w = parseHours("Mo-Fr 07:00-21:00; Sa,Su 08:00-01:00")!;
    expect(w[0]).toEqual([[420, 1260]]);
    expect(w[5]).toEqual([[480, 1500]]);
    expect(isOpen(w, SAT_2330)).toBe(true);
    expect(hoursText(w, SAT_2330)).toBe("open until 01:00");
  });
  it("says unknown rather than guessing", () => {
    expect(parseHours("sunrise-sunset")).toBeNull();
    expect(isOpen(null)).toBeNull();
  });
  it("labels late and early from the hours", () => {
    const c = labelCafe(cafe("h", { tags: { opening_hours: "Mo-Su 06:00-23:00" } }));
    expect(score(c, "late")).toBeGreaterThan(0.9);
    expect(score(c, "early")).toBeGreaterThan(0.9);
  });
});

describe("what you ask for", () => {
  it("hears the engine's example sentence", () => {
    expect(extractFacets("I'm feeling a bit lonely, just want a quiet, hidden cafe with old books and some acoustic music around District 1").map(f => f.label))
      .toEqual(["quiet", "books", "live music", "hidden", "District 1"]);
  });
  it("keeps trà sữa apart from tea, and d10 apart from District 1", () => {
    expect(extractFacets("trà sữa gần d10").map(f => f.label)).toEqual(["bubble tea", "District 10"]);
  });
});

describe("ranking real cafés", () => {
  const cafes = buildCafes();
  it("loads the OpenStreetMap snapshot", () => {
    expect(cafes.length).toBeGreaterThan(1000);
    expect(SAMPLE_HISTORY.every(v => cafes.some(c => c.id === v.id))).toBe(true);
  });
  it("treats unknown as unknown, not as no", () => {
    const pool = [labelCafe(cafe("silent")), labelCafe(cafe("loud", { texts: [{ src: "osm", text: "Plays loud techno music." }] }))];
    const r = rank(pool, extractFacets("somewhere quiet"), [], NO_FILTERS, "match");
    expect(r.map(x => x.cafe.id)).toEqual(["silent", "loud"]);
    expect(r[0].unknown).toEqual(["quiet"]);
  });
  it("measures distance from the area you name", () => {
    const r = rank(cafes, extractFacets("a garden café in Phú Nhuận"), [], NO_FILTERS, "match");
    expect(r[0].cafe.area).toBe("Phú Nhuận");
    expect(r.slice(0, 5).some(x => x.hits.includes("garden"))).toBe(true);
  });
  it("lets what you ask for now beat habit", () => {
    const r = rank(cafes, extractFacets("open late with outdoor seats"), SAMPLE_HISTORY, NO_FILTERS, "match");
    expect(r.slice(0, 5).every(x => x.hits.includes("open late") && x.hits.includes("outdoor seats"))).toBe(true);
  });
  it("applies filters as hard limits", () => {
    const r = rank(cafes, [], [], { ...NO_FILTERS, wifi: true, independent: true, distMax: 2 }, "match");
    expect(r.length).toBeGreaterThan(5);
    expect(r.every(x => (x.cafe.labels.wifi?.score ?? 0) > 0.3 && (x.cafe.labels.chain?.score ?? 0) <= 0.3 && x.distance <= 2)).toBe(true);
  });
  it("learns a taste for books and live music from the sample history", () => {
    expect(dna(cafes, SAMPLE_HISTORY).map(x => x.key)).toEqual(expect.arrayContaining(["books", "live music"]));
  });
  it("writes distances people read easily", () => {
    expect([fmtKm(0.34), fmtKm(0.996), fmtKm(1.26)]).toEqual(["340 m", "1.0 km", "1.3 km"]);
  });
});
