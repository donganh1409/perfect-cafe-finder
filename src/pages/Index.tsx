import { useEffect, useMemo, useState } from "react";
import { Github, LocateFixed, MapPinned, Search, Sparkles, X, RotateCcw, Download } from "lucide-react";
import { buildCafes, SOURCE, RAW, type UserNotes } from "@/data";
import { SAMPLE_HISTORY } from "@/data/sample";
import { AREAS, extractFacets, facetFor, type Facet } from "@/engine/keywords";
import { labelCafe } from "@/engine/labels";
import { DEFAULT_ORIGIN, dna, km, NO_FILTERS, rank, type Filters, type Origin, type Sort, type Visit } from "@/engine/rank";
import { RealMap } from "@/components/finder/RealMap";
import { CafeCard } from "@/components/finder/CafeCard";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "I'm feeling a bit lonely, just want a quiet, hidden cafe with old books and some acoustic music around District 1",
  "somewhere with wifi and air-con to work on my laptop near District 1",
  "a garden café with tea in Phú Nhuận",
  "open late with friends, outdoor seats",
  "quán yên tĩnh có wifi ở quận 3",
];
const VIBES = [{ k: "", label: "Any" }, { k: "quiet", label: "Calm" }, { k: "work-friendly", label: "Focus" }, { k: "lively", label: "Social" }];
const KIND_CLASS: Record<Facet["kind"], string> = { mood: "bg-cf-violet text-white", intent: "bg-cf-sky text-cf-ink", place: "bg-cf-lime text-cf-ink", preference: "bg-cf-yellow text-cf-ink" };
const SHOWN = 6;
const DATE = new Date(SOURCE.date + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d } catch { return d } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } };

const Index = () => {
  const [text, setText] = useState<string>(() => load("cf2.text", EXAMPLES[0]));
  const [facets, setFacets] = useState<Facet[]>(() => extractFacets(load("cf2.text", EXAMPLES[0])));
  const [visits, setVisits] = useState<Visit[]>(() => load("cf2.visits", SAMPLE_HISTORY));
  const [notes, setNotes] = useState<UserNotes>(() => load("cf2.notes", {}));
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sort, setSort] = useState<Sort>("match");
  const [origin, setOrigin] = useState<Origin>(() => load("cf2.origin", DEFAULT_ORIGIN));
  const [picking, setPicking] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [all, setAll] = useState(false);

  useEffect(() => save("cf2.visits", visits), [visits]);
  useEffect(() => save("cf2.notes", notes), [notes]);
  useEffect(() => save("cf2.origin", origin), [origin]);

  const base = useMemo(() => buildCafes(), []);
  const cafes = useMemo(() => base.map(c => (notes[c.id]?.length ? labelCafe(c, [...c.notes.filter(n => n.by === "notes"), ...notes[c.id].map(n => ({ by: "you" as const, ...n }))]) : c)), [base, notes]);
  const results = useMemo(() => rank(cafes, facets, visits, filters, sort, origin), [cafes, facets, visits, filters, sort, origin]);
  const traits = useMemo(() => dna(cafes, visits), [cafes, visits]);
  const labelled = useMemo(() => cafes.filter(c => Object.keys(c.labels).length).length, [cafes]);
  const described = useMemo(() => RAW.filter(c => c.texts.length).length, []);
  const noteCount = Object.values(notes).reduce((a, n) => a + n.length, 0);
  const place = facets.find(f => f.area);
  const mapOrigin = useMemo<Origin>(() => (place ? { lat: AREAS[place.area!][0], lon: AREAS[place.area!][1], label: `the centre of ${place.area}` } : origin), [place?.area, origin]); // eslint-disable-line react-hooks/exhaustive-deps
  const nameOf = (id: string) => cafes.find(c => c.id === id)?.name ?? id;

  const ask = (t: string) => { setText(t); save("cf2.text", t); setFacets(extractFacets(t)); setSelected(null); setAll(false) };
  const dropFacet = (label: string) => setFacets(f => f.filter(x => x.label !== label));
  const setVibe = (label: string) => setFacets(f => { const rest = f.filter(x => !VIBES.some(v => v.k && v.k === x.label)); const add = label ? facetFor(label) : undefined; return add ? [add, ...rest] : rest });
  const vibeNow = VIBES.find(v => v.k && facets.some(f => f.label === v.k))?.k ?? "";
  const visit = (id: string) => setVisits(vs => (vs.some(v => v.id === id) ? vs.map(v => (v.id === id ? { ...v, count: v.count + 1 } : v)) : [...vs, { id, count: 1 }]));
  const love = (id: string) => setVisits(vs => (vs.some(v => v.id === id) ? vs.map(v => (v.id === id ? { ...v, love: !v.love } : v)) : [...vs, { id, count: 1, love: true }]));
  const forget = (id: string) => setVisits(vs => vs.filter(v => v.id !== id));
  const addNote = (id: string, t: string) => setNotes(n => ({ ...n, [id]: [...(n[id] ?? []), { text: t, at: Date.now() }] }));
  const delNote = (id: string, at: number) => setNotes(n => { const left = (n[id] ?? []).filter(x => x.at !== at); const out = { ...n }; if (left.length) out[id] = left; else delete out[id]; return out });
  const pick = (id: string) => { setSelected(id); setView("list"); const i = results.findIndex(r => r.cafe.id === id); if (i >= SHOWN) setAll(true); requestAnimationFrame(() => document.getElementById(`cafe-${id.replace("/", "-")}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" })) };
  const F = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters(f => ({ ...f, [k]: v }));
  const locate = () => {
    if (!navigator.geolocation) { setGeoMsg("This browser cannot share a location."); return }
    setGeoMsg("Finding you…");
    navigator.geolocation.getCurrentPosition(p => {
      const d = km(p.coords.latitude, p.coords.longitude, DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lon);
      if (d > 40) { setGeoMsg(`You are about ${Math.round(d).toLocaleString("en")} km from Saigon, so distances stay measured from ${origin.label}. Tap “Pick on map” to choose a spot.`); return }
      setOrigin({ lat: p.coords.latitude, lon: p.coords.longitude, label: "where you are" }); setGeoMsg(place ? `Found you. While you ask for ${place.area}, distances are measured from its centre.` : "");
    }, () => setGeoMsg("Location was not shared. Tap “Pick on map” instead."), { enableHighAccuracy: false, timeout: 8000 });
  };
  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "cafe-finder-notes.json"; a.click(); URL.revokeObjectURL(a.href);
  };
  const shown = all ? results.slice(0, 60) : results.slice(0, SHOWN);

  return (
    <div className="min-h-screen bg-white text-cf-ink">
      <header className="sticky top-0 z-[1100] border-b border-cf-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:px-6">
          <a href="./" className="flex items-center gap-2 font-display text-[21px] font-semibold"><i className="cf-pin" aria-hidden="true" />Cafe Finder</a>
          <p className="hidden text-[14px] text-cf-muted lg:block">Real cafés in Saigon, labelled from what people say about them.</p>
          <nav className="ml-auto flex items-center gap-2">
            <a href="#how" className="cf-btn-ghost hidden sm:inline-flex">How it works</a>
            <a href="https://github.com/donganh1409/perfect-cafe-finder" target="_blank" rel="noopener" className="cf-btn-ghost"><Github className="h-4 w-4" />Code</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 md:px-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="contents lg:grid lg:content-start lg:gap-4">
          <section className="cf-panel order-1 lg:order-none">
            <h2 className="cf-h">What are you in the mood for?</h2>
            <form onSubmit={e => { e.preventDefault(); ask(text) }} className="mt-3">
              <label htmlFor="ask" className="sr-only">Describe the café you want</label>
              <textarea id="ask" rows={3} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(text) } }}
                className="w-full resize-none rounded-2xl border border-cf-line bg-cf-soft px-4 py-3 text-[15px] leading-snug outline-none focus:border-cf-violet focus:bg-white" placeholder="Say it the way you'd say it to a friend, in English or Vietnamese" />
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
              {EXAMPLES.filter(e => e !== text).slice(0, 4).map(e => <button key={e} type="button" onClick={() => ask(e)} className="rounded-full border border-cf-line px-3 py-1 text-left text-[12.5px] hover:border-cf-violet">{e.length > 44 ? e.slice(0, 42) + "…" : e}</button>)}
            </div>
          </section>

          <section className="cf-panel order-3 lg:order-none">
            <h2 className="cf-h">Tune it</h2>
            <div className="mt-3 grid grid-cols-4 gap-1 rounded-full bg-cf-soft p-1" role="radiogroup" aria-label="Vibe">
              {VIBES.map(v => <button key={v.label} type="button" role="radio" aria-checked={vibeNow === v.k} onClick={() => setVibe(v.k)} className={cn("rounded-full py-1.5 text-[13px] font-semibold", vibeNow === v.k && "bg-cf-ink text-white")}>{v.label}</button>)}
            </div>
            <label className="mt-4 grid gap-1 text-[13px] font-semibold">
              <span className="flex justify-between">Within<b className="font-medium text-cf-violet">{filters.distMax} km of {place ? place.area : origin.label === DEFAULT_ORIGIN.label ? "the cathedral" : origin.label}</b></span>
              <input type="range" min={0.5} max={8} step={0.5} value={filters.distMax} onChange={e => F("distMax", +e.target.value)} className="accent-cf-violet" />
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {([["openNow", "Open now"], ["wifi", "Wi-Fi"], ["aircon", "Air-con"], ["outdoor", "Outdoor seats"], ["pets", "Pets welcome"], ["independent", "Independent only"]] as const).map(([k, l]) => (
                <button key={k} type="button" aria-pressed={filters[k]} onClick={() => F(k, !filters[k])} className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-semibold", filters[k] ? "border-cf-ink bg-cf-ink text-white" : "border-cf-line")}>{l}</button>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-cf-muted">Filters keep only cafés where it is known. “Open now” uses opening hours from OpenStreetMap, in Saigon time.</p>
            <button type="button" onClick={() => setFilters(NO_FILTERS)} className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-cf-muted hover:text-cf-ink"><RotateCcw className="h-3.5 w-3.5" />Reset filters</button>
          </section>

          <section className="cf-panel order-4 lg:order-none" aria-labelledby="dna-h">
            <div className="flex items-center justify-between"><h2 id="dna-h" className="cf-h">Your café DNA</h2><span className="text-[12px] text-cf-muted">{visits.reduce((s, v) => s + v.count, 0)} visits</span></div>
            {visits.length ? (
              <>
                <p className="mt-1 text-[13px] text-cf-muted">What your places have in common, compared with the average café in Saigon.</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {traits.length ? traits.map((t, i) => <span key={t.key} className="rounded-full px-3 py-1 text-[13px] font-semibold" style={{ background: t.lean < 0 ? "#F2F1F5" : ["#6B4BFF", "#FF5FA2", "#C8F55A", "#FFD84D", "#5CC8FF", "#EDE8FF"][i], color: t.lean < 0 ? "#6D6A80" : i < 2 ? "#fff" : "#17142B" }}>{t.title}</span>)
                    : <span className="text-[13px] text-cf-muted">Not enough labels on your places yet.</span>}
                </div>
                <ul className="mt-3 grid gap-1.5">
                  {visits.map(v => (
                    <li key={v.id} className="flex items-center gap-2 rounded-xl bg-cf-soft px-3 py-2 text-[13.5px]">
                      <button type="button" className="min-w-0 flex-1 truncate text-left font-semibold" onClick={() => pick(v.id)}>{nameOf(v.id)}</button>
                      <span className="text-cf-muted">{v.count}×{v.love ? " ♥" : ""}</span>
                      <button type="button" onClick={() => forget(v.id)} aria-label={`Forget ${nameOf(v.id)}`} className="rounded-full p-1 hover:bg-white"><X className="h-3.5 w-3.5" /></button>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex flex-wrap gap-3 text-[12.5px] font-semibold text-cf-muted">
                  <button type="button" onClick={() => setVisits([])} className="hover:text-cf-ink">Start fresh</button>
                  <button type="button" onClick={() => setVisits(SAMPLE_HISTORY)} className="hover:text-cf-ink">Use the sample history</button>
                </div>
              </>
            ) : (
              <div className="mt-2 grid gap-2 text-[13.5px]">
                <p>No visits yet, so results ignore taste. Tap <b>+</b> on cafés you go to, or ♥ the ones you love.</p>
                <button type="button" onClick={() => setVisits(SAMPLE_HISTORY)} className="cf-btn-ghost justify-center">Use the sample history</button>
              </div>
            )}
          </section>

          <section className="cf-panel order-5 lg:order-none" aria-labelledby="data-h">
            <h2 id="data-h" className="cf-h">The data</h2>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
              <div className="rounded-2xl bg-cf-soft p-3"><dt className="text-cf-muted">Real cafés</dt><dd className="font-display text-[22px] font-semibold">{cafes.length.toLocaleString("en")}</dd></div>
              <div className="rounded-2xl bg-cf-soft p-3"><dt className="text-cf-muted">With labels</dt><dd className="font-display text-[22px] font-semibold">{labelled.toLocaleString("en")}</dd></div>
              <div className="rounded-2xl bg-cf-soft p-3"><dt className="text-cf-muted">Described in words</dt><dd className="font-display text-[22px] font-semibold">{described}</dd></div>
              <div className="rounded-2xl bg-cf-soft p-3"><dt className="text-cf-muted">Your notes</dt><dd className="font-display text-[22px] font-semibold">{noteCount}</dd></div>
            </dl>
            <p className="mt-3 text-[12.5px] leading-snug text-cf-muted">Cafés and their tags from OpenStreetMap, snapshot of {DATE}. Descriptions from Wikivoyage. Your notes stay in this browser{noteCount ? "" : "; add one with “Add a note” on any café"}.</p>
            {noteCount > 0 && <button type="button" onClick={exportNotes} className="cf-btn-ghost mt-2"><Download className="h-4 w-4" />Download my notes</button>}
          </section>
        </aside>

        <section className="order-2 grid content-start gap-4 lg:order-none lg:col-start-2 lg:row-start-1" aria-label="Results">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-[22px] font-semibold">{results.length ? <>For you, now <span className="text-cf-muted">· {results.length.toLocaleString("en")} cafés</span></> : "Nothing fits every filter"}</p>
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-1 rounded-full bg-cf-soft p-1 lg:hidden">
                {(["list", "map"] as const).map(v => <button key={v} type="button" onClick={() => setView(v)} className={cn("rounded-full px-3 py-1 text-[13px] font-semibold capitalize", view === v && "bg-cf-ink text-white")}>{v}</button>)}
              </div>
              <label className="text-[13px] font-semibold"><span className="sr-only">Sort by</span>
                <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="rounded-full border border-cf-line bg-white px-3 py-1.5">
                  <option value="match">Best match</option><option value="near">Nearest</option><option value="evidence">Best known</option>
                </select>
              </label>
            </div>
          </div>

          <figure className={cn("grid gap-2", view === "list" && "hidden lg:grid")}>
            <div className="cf-map"><RealMap cafes={cafes} results={results} selected={selected} origin={mapOrigin} picking={picking} onSelect={pick} onPick={(lat, lon) => { setOrigin({ lat, lon, label: "the spot you picked" }); setPicking(false); setGeoMsg(place ? `Saved. While you ask for ${place.area}, distances are measured from its centre.` : "") }} /></div>
            <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[12.5px] text-cf-muted">
              <span className="inline-flex items-center gap-1.5"><i className="cf-me-dot" />{place ? `Centre of ${place.area}` : `You: ${origin.label}`}</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-cf-violet" />Calm</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#22A7F0]" />Work</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-cf-pink" />Social</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#6D6A80]/50" />Other cafés</span>
              <span className="ml-auto flex gap-1.5">
                <button type="button" onClick={locate} className="cf-btn-ghost py-1.5"><LocateFixed className="h-4 w-4" />Use my location</button>
                <button type="button" onClick={() => setPicking(!picking)} aria-pressed={picking} className={cn("cf-btn-ghost py-1.5", picking && "border-cf-ink bg-cf-ink text-white")}><MapPinned className="h-4 w-4" />{picking ? "Tap the map" : "Pick on map"}</button>
              </span>
              {geoMsg && <span className="basis-full text-cf-ink" role="status">{geoMsg}</span>}
            </figcaption>
          </figure>

          {results.length ? (
            <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", view === "map" && "hidden lg:grid")}>
              {shown.map((r, i) => { const v = visits.find(x => x.id === r.cafe.id); return (
                <CafeCard key={r.cafe.id} r={r} rankNo={i + 1} visits={v?.count ?? 0} loved={!!v?.love} selected={selected === r.cafe.id}
                  onVisit={() => visit(r.cafe.id)} onLove={() => love(r.cafe.id)} onSelect={() => setSelected(r.cafe.id)}
                  onNote={t => addNote(r.cafe.id, t)} onDeleteNote={at => delNote(r.cafe.id, at)} />) })}
            </div>
          ) : (
            <div className="cf-panel text-center"><p className="font-semibold">Loosen a filter to see more cafés.</p><button type="button" className="cf-btn mt-3" onClick={() => setFilters(NO_FILTERS)}>Reset filters</button></div>
          )}
          {results.length > SHOWN && (
            <button type="button" onClick={() => setAll(!all)} className={cn("cf-btn-ghost justify-self-center", view === "map" && "hidden lg:inline-flex")}>{all ? `Show the top ${SHOWN}` : `Show the top ${Math.min(60, results.length)}`}</button>
          )}
        </section>

        <section id="how" className="cf-panel order-6 lg:order-none lg:col-span-2">
          <h2 className="cf-h flex items-center gap-2"><Sparkles className="h-5 w-5 text-cf-violet" />How it decides</h2>
          <ol className="mt-3 grid gap-3 md:grid-cols-5">
            <li className="cf-step"><b>1 · Collect</b><span>{cafes.length.toLocaleString("en")} real cafés from OpenStreetMap, with what mappers recorded: Wi-Fi, hours, outdoor seats, air-con.</span></li>
            <li className="cf-step"><b>2 · Read</b><span>What people say: descriptions from Wikivoyage and OpenStreetMap, notes written after reading reviews, and your notes.</span></li>
            <li className="cf-step"><b>3 · Label</b><span>A bilingual reader turns each sentence into labels, hears “not” and “không”, and keeps the sentence as evidence.</span></li>
            <li className="cf-step"><b>4 · Rank</b><span>50% your words, 35% your taste, 15% nearness. Unknown counts as unknown, not as no.</span></li>
            <li className="cf-step"><b>5 · Say why</b><span>Every label opens to its evidence. Every card says what is still unknown.</span></li>
          </ol>
          <p className="mt-3 text-[12.5px] text-cf-muted">Map data and tiles © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> (ODbL). Descriptions from <a className="underline" href="https://en.wikivoyage.org/wiki/Ho_Chi_Minh_City" target="_blank" rel="noopener">Wikivoyage</a> (CC BY-SA). Google reviews are linked, never copied: Google's terms do not allow storing them or showing them on another map. Personalisation designed by Dong Anh Nguyen.</p>
        </section>
      </main>
    </div>
  );
};

export default Index;
