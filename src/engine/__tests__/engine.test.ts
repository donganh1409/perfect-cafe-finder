import { describe, expect, it } from "vitest";
import { extractFacets } from "../keywords";
import { dna, rank, SAMPLE_HISTORY, type Filters } from "../rank";

const OPEN: Filters = { noiseMax: 1, crowdMax: 1, priceMax: 100000, distMax: 10, openNow: false, workReady: false, pets: false, outdoor: false };

describe("keywords", () => {
  it("reads the example sentence from the engine's prompt", () => {
    const f = extractFacets("I'm feeling a bit lonely, just want a quiet, hidden cafe with old books and some acoustic music around District 1").map(x => x.label);
    expect(f).toEqual(expect.arrayContaining(["quiet", "books", "acoustic music", "hidden", "District 1"]));
  });
  it("understands Vietnamese", () => {
    const f = extractFacets("quán yên tĩnh có sách, giá rẻ ở quận 3").map(x => x.label);
    expect(f).toEqual(expect.arrayContaining(["quiet", "books", "cheap", "District 3"]));
  });
  it("does not read 'd10' as District 1", () => {
    expect(extractFacets("near d10").map(x => x.label)).toEqual(["District 10"]);
  });
});

describe("ranking", () => {
  it("puts the hidden bookshop in District 1 first for that sentence", () => {
    const r = rank(extractFacets("a quiet, hidden cafe with old books around District 1"), [], OPEN, "match");
    expect(r[0].cafe.id).toBe("goc-sach");
    expect(r[0].reasons.some(x => x.kind === "query")).toBe(true);
  });
  it("uses taste when there is no query, and explains it", () => {
    const r = rank([], SAMPLE_HISTORY, OPEN, "match");
    expect(r[0].cafe.vibe).toBe("calm");
    expect(r.find(x => !SAMPLE_HISTORY.some(v => v.id === x.cafe.id))!.reasons[0].kind).toBe("taste");
    expect(r[0].weights.query).toBe(0);
  });
  it("applies filters as hard limits", () => {
    const r = rank([], [], { ...OPEN, noiseMax: 0.3, priceMax: 50000 }, "match");
    expect(r.every(x => x.cafe.noise <= 0.3 && x.cafe.price <= 50000)).toBe(true);
  });
  it("sorts by noise when asked", () => {
    const r = rank([], [], OPEN, "quiet");
    expect(r.map(x => x.cafe.noise)).toEqual([...r.map(x => x.cafe.noise)].sort((a, b) => a - b));
  });
  it("learns a taste for books and quiet from the sample history", () => {
    const names = dna(SAMPLE_HISTORY).map(x => x.name);
    expect(names).toEqual(expect.arrayContaining(["books", "quiet"]));
  });
  it("only names a trait the café really has", () => {
    // a calm-loving history must not call a social café "calm", nor a focus café "lively"
    const r = rank([], SAMPLE_HISTORY, OPEN, "match");
    const trait = (id: string) => r.find(x => x.cafe.id === id)!.reasons.find(x => x.kind === "trait")?.text ?? "";
    expect(trait("studio-9")).not.toMatch(/Lively/);
    expect(trait("cun")).not.toMatch(/calm|focus/i);
  });
  it("lets what you ask for now beat habit", () => {
    // the sample history is all calm rooms; asking for friends and pets should still bring social cafés first
    const r = rank(extractFacets("a cheap place to hang out with friends outdoors, pets welcome"), SAMPLE_HISTORY, OPEN, "match");
    expect(r.slice(0, 3).every(x => x.cafe.vibe === "social")).toBe(true);
  });
  it("hears 'outdoors' as outdoor", () => {
    expect(extractFacets("sit outdoors").map(x => x.label)).toEqual(["outdoor"]);
  });
});
