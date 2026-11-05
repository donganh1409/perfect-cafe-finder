import { useEffect, useMemo, useState } from "react";
import { Github, MapPin, Search, Sparkles, X, RotateCcw } from "lucide-react";
import { CAFES, byId } from "@/data/cafes";
import { extractFacets, facetFor, type Facet } from "@/engine/keywords";
import { dna, rank, SAMPLE_HISTORY, type Filters, type Sort, type Visit } from "@/engine/rank";
import { BubbleMap } from "@/components/finder/BubbleMap";
import { CafeCard } from "@/components/finder/CafeCard";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "I'm feeling a bit lonely, just want a quiet, hidden cafe with old books and some acoustic music around District 1",
  "somewhere bright to work on my laptop with fast wifi and outlets",
  "a cheap place to hang out with friends outdoors, pets welcome",
  "quán yên tĩnh có sách ở quận 3",
];
const SHOWN = 6;
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const DEFAULT_FILTERS: Filters = { noiseMax: 1, crowdMax: 1, priceMax: 80000, distMax: 4, openNow: false, workReady: false, pets: false, outdoor: false };
const VIBES = [{ k: "", label: "Any" }, { k: "quiet", label: "Calm" }, { k: "work-friendly", label: "Focus" }, { k: "with friends", label: "Social" }];
const KIND_CLASS: Record<Facet["kind"], string> = { mood: "bg-cf-violet text-white", intent: "bg-cf-sky text-cf-ink", place: "bg-cf-lime text-cf-ink", preference: "bg-cf-yellow text-cf-ink" };
const TRAIT_LABEL: Record<string, string> = { calm: "Calm rooms", focus: "Made for focus", social: "Lively places", quiet: "Quiet", uncrowded: "Not crowded", "warm light": "Warm light", bright: "Bright", dim: "Soft, low light", affordable: "Affordable" };

const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : d } catch { return d } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } };

const Index = () => {
  const [text, setText] = useState<string>(() => load("cf.text", EXAMPLES[0]));
  const [facets, setFacets] = useState<Facet[]>(() => extractFacets(load("cf.text", EXAMPLES[0])));
  const [visits, setVisits] = useState<Visit[]>(() => load("cf.visits", SAMPLE_HISTORY));
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<Sort>("match");
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [all, setAll] = useState(false);

  useEffect(() => save("cf.visits", visits), [visits]);
  const results = useMemo(() => rank(facets, visits, filters, sort), [facets, visits, filters, sort]);
  const traits = useMemo(() => dna(visits), [visits]);
  const totalVisits = visits.reduce((s, v) => s + v.count, 0);

  const ask = (t: string) => { setText(t); save("cf.text", t); setFacets(extractFacets(t)); setSelected(null); setAll(false) };
  const dropFacet = (label: string) => setFacets(f => f.filter(x => x.label !== label));
  const setVibe = (label: string) => setFacets(f => { const rest = f.filter(x => !["quiet", "work-friendly", "with friends"].includes(x.label)); const add = label ? facetFor(label) : undefined; return add ? [add, ...rest] : rest });
  const vibeNow = VIBES.find(v => v.k && facets.some(f => f.label === v.k))?.k ?? "";
  const visit = (id: string) => setVisits(vs => vs.some(v => v.id === id) ? vs.map(v => v.id === id ? { ...v, count: v.count + 1 } : v) : [...vs, { id, count: 1 }]);
  const love = (id: string) => setVisits(vs => vs.some(v => v.id === id) ? vs.map(v => v.id === id ? { ...v, love: !v.love } : v) : [...vs, { id, count: 1, love: true }]);
  const forget = (id: string) => setVisits(vs => vs.filter(v => v.id !== id));
  const pick = (id: string) => { setSelected(id); setView("list"); if (results.findIndex(r => r.cafe.id === id) >= SHOWN) setAll(true); requestAnimationFrame(() => document.getElementById(`cafe-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" })) };
  const F = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-white text-cf-ink">
      <header className="sticky top-0 z-20 border-b border-cf-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 md:px-6">
          <a href="./" className="flex items-center gap-2 font-display text-[21px] font-semibold"><i className="cf-pin" aria-hidden="true" />Cafe Finder</a>
          <p className="hidden text-[14px] text-cf-muted md:block">Finds the café that feels like you, and says why.</p>
          <nav className="ml-auto flex items-center gap-2">
            <a href="#how" className="cf-btn-ghost hidden sm:inline-flex">How it works</a>
            <a href="https://github.com/donganh1409/perfect-cafe-finder" target="_blank" rel="noopener" className="cf-btn-ghost"><Github className="h-4 w-4" />Code</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-5 px-4 py-5 md:px-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="contents lg:grid lg:content-start lg:gap-4">
          <section className="cf-panel order-1 lg:order-none">
            <h2 className="cf-h">What are you in the mood for?</h2>
            <form onSubmit={e => { e.preventDefault(); ask(text) }} className="mt-3">
              <label htmlFor="ask" className="sr-only">Describe the café you want</label>
              <textarea id="ask" rows={3} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(text) } }}
                className="w-full resize-none rounded-2xl border border-cf-line bg-cf-soft px-4 py-3 text-[15px] leading-snug outline-none focus:border-cf-violet focus:bg-white" placeholder="Say it the way you'd say it to a friend" />
              <button type="submit" className="cf-btn mt-2 w-full"><Search className="h-4 w-4" />Find my café</button>
            </form>
            <p className="mt-3 text-[12px] font-semibold uppercase tracking-wide text-cf-muted">Heard</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5" aria-live="polite">
              {facets.length ? facets.map(f => (
                <span key={f.label} className={cn("inline-flex items-center gap-1 rounded-full py-1 pl-3 pr-1.5 text-[13px] font-semibold", KIND_CLASS[f.kind])}>
                  {f.label}<button type="button" onClick={() => dropFacet(f.label)} aria-label={`Remove ${f.label}`} className="rounded-full p-0.5 hover:bg-black/10"><X className="h-3.5 w-3.5" /></button>
                </span>
              )) : <span className="text-[13px] text-cf-muted">No keywords yet. Try one of these:</span>}
            </div>
            <p className="mt-2 flex flex-wrap gap-x-3 text-[11.5px] text-cf-muted">
              {(["place", "mood", "intent", "preference"] as const).map(k => <span key={k} className="inline-flex items-center gap-1"><i className={cn("h-2 w-2 rounded-full", KIND_CLASS[k].split(" ")[0])} />{k}</span>)}
            </p>
            <p className="mt-3 text-[12px] font-semibold uppercase tracking-wide text-cf-muted">Or try</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EXAMPLES.slice(1).map(e => <button key={e} type="button" onClick={() => ask(e)} className="rounded-full border border-cf-line px-3 py-1 text-left text-[12.5px] hover:border-cf-violet">{e.length > 42 ? e.slice(0, 40) + "…" : e}</button>)}
            </div>
          </section>

          <section className="cf-panel order-3 lg:order-none">
            <h2 className="cf-h">Tune it</h2>
            <div className="mt-3 grid grid-cols-4 gap-1 rounded-full bg-cf-soft p-1" role="radiogroup" aria-label="Vibe">
              {VIBES.map(v => <button key={v.label} type="button" role="radio" aria-checked={vibeNow === v.k} onClick={() => setVibe(v.k)} className={cn("rounded-full py-1.5 text-[13px] font-semibold", vibeNow === v.k && "bg-cf-ink text-white")}>{v.label}</button>)}
            </div>
            {([["noiseMax", "Noise, at most", v => v >= 1 ? "any" : `${Math.round(v * 10)}/10`, 0.2, 1, 0.05], ["crowdMax", "Crowd, at most", v => v >= 1 ? "any" : `${Math.round(v * 10)}/10`, 0.2, 1, 0.05], ["priceMax", "Price, up to", v => `${v / 1000}k ₫`, 30000, 80000, 5000], ["distMax", "Distance, within", v => `${v} km`, 0.5, 4, 0.5]] as const).map(([k, label, fmt, min, max, step]) => (
              <label key={k} className="mt-3 grid gap-1 text-[13px] font-semibold">
                <span className="flex justify-between">{label}<b className="font-medium text-cf-violet">{fmt(filters[k] as number)}</b></span>
                <input type="range" min={min} max={max} step={step} value={filters[k] as number} onChange={e => F(k, +e.target.value as never)} className="accent-cf-violet" />
              </label>
            ))}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {([["openNow", "Open now"], ["workReady", "Wi-Fi and outlets"], ["pets", "Pets welcome"], ["outdoor", "Outdoor seats"]] as const).map(([k, l]) => (
                <button key={k} type="button" aria-pressed={filters[k]} onClick={() => F(k, !filters[k])} className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-semibold", filters[k] ? "border-cf-ink bg-cf-ink text-white" : "border-cf-line")}>{l}</button>
              ))}
            </div>
            <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-cf-muted hover:text-cf-ink"><RotateCcw className="h-3.5 w-3.5" />Reset filters</button>
          </section>

          <section className="cf-panel order-4 lg:order-none" aria-labelledby="dna-h">
            <div className="flex items-center justify-between"><h2 id="dna-h" className="cf-h">Your café DNA</h2><span className="text-[12px] text-cf-muted">{totalVisits} visits</span></div>
            {visits.length ? (
              <>
                <p className="mt-1 text-[13px] text-cf-muted">What your visits have in common, compared with the average café.</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {traits.map((t, i) => <span key={t.name} className="rounded-full px-3 py-1 text-[13px] font-semibold" style={{ background: ["#6B4BFF", "#FF5FA2", "#C8F55A", "#FFD84D", "#5CC8FF", "#EDE8FF"][i], color: i < 2 ? "#fff" : "#17142B", fontSize: `${13 + Math.min(4, t.lean * 2)}px` }}>{TRAIT_LABEL[t.name] ?? cap(t.name)}</span>)}
                </div>
                <ul className="mt-3 grid gap-1.5">
                  {visits.map(v => { const c = byId(v.id); if (!c) return null; return (
                    <li key={v.id} className="flex items-center gap-2 rounded-xl bg-cf-soft px-3 py-2 text-[13.5px]">
                      <button type="button" className="min-w-0 flex-1 truncate text-left font-semibold" onClick={() => pick(v.id)}>{c.name}</button>
                      <span className="text-cf-muted">{v.count}×{v.love ? " ♥" : ""}</span>
                      <button type="button" onClick={() => forget(v.id)} aria-label={`Forget ${c.name}`} className="rounded-full p-1 hover:bg-white"><X className="h-3.5 w-3.5" /></button>
                    </li>) })}
                </ul>
                <div className="mt-2 flex gap-3 text-[12.5px] font-semibold text-cf-muted">
                  <button type="button" onClick={() => setVisits([])} className="hover:text-cf-ink">Start fresh</button>
                  <button type="button" onClick={() => setVisits(SAMPLE_HISTORY)} className="hover:text-cf-ink">Use the sample history</button>
                </div>
              </>
            ) : (
              <div className="mt-2 grid gap-2 text-[13.5px]">
                <p>No visits yet, so results ignore taste. Tap <b>+</b> on cafés you go to, or ♥ the ones you love, and watch the order change.</p>
                <button type="button" onClick={() => setVisits(SAMPLE_HISTORY)} className="cf-btn-ghost justify-center">Use the sample history</button>
              </div>
            )}
          </section>
        </aside>

        <section className="order-2 grid content-start gap-4 lg:order-none lg:col-start-2 lg:row-start-1" aria-label="Results">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-[22px] font-semibold">{results.length ? <>For you, now <span className="text-cf-muted">· {results.length} cafés</span></> : "Nothing fits every filter"}</p>
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-1 rounded-full bg-cf-soft p-1 lg:hidden">
                {(["list", "map"] as const).map(v => <button key={v} type="button" onClick={() => setView(v)} className={cn("rounded-full px-3 py-1 text-[13px] font-semibold capitalize", view === v && "bg-cf-ink text-white")}>{v}</button>)}
              </div>
              <label className="text-[13px] font-semibold"><span className="sr-only">Sort by</span>
                <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="rounded-full border border-cf-line bg-white px-3 py-1.5">
                  <option value="match">Best match</option><option value="near">Nearest</option><option value="quiet">Quietest</option><option value="cheap">Cheapest</option>
                </select>
              </label>
            </div>
          </div>
          <figure className={cn("grid gap-2", view === "list" && "hidden lg:grid")}>
            <div className="cf-map"><BubbleMap results={results} selected={selected} onSelect={pick} distMax={filters.distMax} /></div>
            <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[12.5px] text-cf-muted">
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-cf-sky ring-2 ring-white" />You</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-cf-violet" />Calm</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#22A7F0]" />Focus</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-cf-pink" />Social</span>
              <span>Bigger bubble, better match. Tap one to see it. Map and cafés are samples.</span>
            </figcaption>
          </figure>
          {results.length ? (
            <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", view === "map" && "hidden lg:grid")}>
              {(all ? results : results.slice(0, SHOWN)).map((r, i) => { const v = visits.find(x => x.id === r.cafe.id); return (
                <CafeCard key={r.cafe.id} r={r} rankNo={i + 1} visits={v?.count ?? 0} loved={!!v?.love} selected={selected === r.cafe.id} onVisit={() => visit(r.cafe.id)} onLove={() => love(r.cafe.id)} onSelect={() => setSelected(r.cafe.id)} />) })}
            </div>
          ) : null}
          {results.length > SHOWN && (
            <button type="button" onClick={() => setAll(!all)} className={cn("cf-btn-ghost justify-self-center", view === "map" && "hidden lg:inline-flex")}>{all ? "Show the top 6" : `Show all ${results.length} cafés`}</button>
          )}
          {results.length ? null : (
            <div className="cf-panel text-center"><p className="font-semibold">Loosen a filter to see more cafés.</p><button type="button" className="cf-btn mt-3" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button></div>
          )}
        </section>

        <section id="how" className="cf-panel order-5 lg:order-none lg:col-span-2">
          <h2 className="cf-h flex items-center gap-2"><Sparkles className="h-5 w-5 text-cf-violet" />How it decides</h2>
          <ol className="mt-3 grid gap-3 md:grid-cols-4">
            <li className="cf-step"><b>1 · Hear</b><span>Your sentence becomes keywords: places, moods, intent and preferences. Here a small bilingual lexicon does it on your device; the Python engine does it with an LLM.</span></li>
            <li className="cf-step"><b>2 · Learn</b><span>Your visits become a taste: every café is described by vibe, noise, crowd, light, price and tags, and your places are compared with the average café.</span></li>
            <li className="cf-step"><b>3 · Rank</b><span>Score = 50% your words + 35% your taste + 15% nearness. Taste counts as far as a café fits your words, so today’s request beats habit. Filters are hard limits.</span></li>
            <li className="cf-step"><b>4 · Say why</b><span>Every card names the café it feels like, the words it matches, a trait you share, and how far it is. Open “Why this score” to see the parts.</span></li>
          </ol>
          <p className="mt-3 text-[12.5px] text-cf-muted">Sample cafés: the names, places and numbers are invented for this demo; photos from Unsplash. Your visits are kept only in this browser. Engine: <a className="underline" href="https://github.com/SEATSCOUT-SOCIAL-APP-TEAM/AI-Engine-Prototype" target="_blank" rel="noopener">AI-Engine-Prototype</a>. Personalisation designed by Dong Anh Nguyen.</p>
        </section>
      </main>
    </div>
  );
};

export default Index;
