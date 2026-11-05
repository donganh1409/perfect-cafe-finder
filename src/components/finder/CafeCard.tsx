import { useMemo, useState } from "react";
import { Heart, Plus, Check, ChevronDown, MessageSquarePlus, ExternalLink, Trash2 } from "lucide-react";
import { DEF, labelTitle, readText, SRC_NAME, type Evidence, type Label } from "@/engine/labels";
import type { Ranked } from "@/engine/rank";
import { cn } from "@/lib/utils";

interface Props {
  r: Ranked; rankNo: number; visits: number; loved: boolean; selected: boolean;
  onVisit: () => void; onLove: () => void; onSelect: () => void;
  onNote: (text: string) => void; onDeleteNote: (at: number) => void;
}

const GROUP: Record<string, string> = { feel: "bg-cf-violet/10 text-cf-violet", practical: "bg-cf-sky/15 text-[#0B6FA4]", drinks: "bg-cf-yellow/30 text-[#7A5B00]", people: "bg-cf-pink/15 text-[#B8246A]" };

/** A sentence with the words that made the label highlighted, and who said it. */
export function Quote({ ev, short }: { ev: Evidence; short?: boolean }) {
  if (!ev.quote) return <span className="text-cf-muted">{SRC_NAME[ev.src]}{ev.detail ? `: ${ev.detail}` : ""}</span>;
  let q = ev.quote, [a, b] = ev.hit ?? [0, 0];
  if (short && q.length > 120) { const s = Math.max(0, a - 50), e = Math.min(q.length, b + 60); q = (s ? "…" : "") + q.slice(s, e) + (e < ev.quote.length ? "…" : ""); const shift = (s ? 1 : 0) - s; a += shift; b += shift }
  const who = ev.src === "name" ? "its name" : ev.about && ev.src === "chain" ? `${ev.detail ?? SRC_NAME[ev.src]}, about ${ev.about}` : ev.detail ?? SRC_NAME[ev.src];
  return <span><span className="italic">“{q.slice(0, a)}<mark className="rounded bg-cf-lime px-0.5 not-italic text-cf-ink">{q.slice(a, b)}</mark>{q.slice(b)}”</span> <span className="whitespace-nowrap text-cf-muted">— {who}</span></span>;
}

function Chip({ l, open, onClick }: { l: Label; open: boolean; onClick: () => void }) {
  const neg = l.score < 0, d = DEF[l.key];
  const mark = { tag: "OSM", hours: "hours", text: "quote", chain: "chain", name: "name", derived: "implied", notes: "DA", you: "you" }[l.ev[0].src];
  return (
    <button type="button" onClick={onClick} aria-expanded={open} title={`${labelTitle(l.key, l.score)}: ${Math.round(Math.abs(l.score) * 100)}% sure, from ${SRC_NAME[l.ev[0].src].toLowerCase()}`}
      className={cn("inline-flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-2 text-[12.5px] font-semibold transition", neg ? "bg-[#F2F1F5] text-cf-muted line-through decoration-1" : GROUP[d?.group ?? "feel"], open && "ring-2 ring-cf-ink")}>
      {labelTitle(l.key, l.score)}
      <span className="rounded-full bg-white/80 px-1.5 text-[10px] font-bold uppercase tracking-wide no-underline" style={{ textDecoration: "none" }}>{mark}</span>
    </button>
  );
}

export function CafeCard({ r, rankNo, visits, loved, selected, onVisit, onLove, onSelect, onNote, onDeleteNote }: Props) {
  const [why, setWhy] = useState(false), [open, setOpen] = useState<string | null>(null), [writing, setWriting] = useState(false), [draft, setDraft] = useState("");
  const c = r.cafe, pct = Math.round(r.score * 100);
  const labels = Object.values(c.labels).filter(l => Math.abs(l.score) > 0.2).sort((a, b) => Number(b.score > 0) - Number(a.score > 0) || Math.abs(b.score) - Math.abs(a.score));
  const preview = useMemo(() => (draft.trim() ? readText(draft, "you") : []), [draft]);
  const street = [c.tags["addr:housenumber"], c.tags["addr:street"]].filter(Boolean).join(" ");
  const google = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.name, street, "Hồ Chí Minh"].filter(Boolean).join(", "))}`;
  const parts = [
    { k: "Your words", w: r.weights.query, v: r.parts.query, color: "#6B4BFF" },
    { k: "Your taste", w: r.weights.taste, v: r.parts.taste, color: "#FF5FA2" },
    { k: "Nearness", w: r.weights.near, v: r.parts.near, color: "#5CC8FF" },
  ].filter(p => p.w > 0);
  const openL = open ? c.labels[open] : null;

  return (
    <article id={`cafe-${c.id.replace("/", "-")}`} className={cn("cf-card", selected && "ring-4 ring-cf-violet/40")} onClick={onSelect}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-full bg-cf-ink font-display text-[15px] font-semibold text-white">{rankNo}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[20px] font-semibold leading-tight">{c.name}</h3>
          <p className="mt-0.5 text-[13px] text-cf-muted">{[street || null, c.area ? `near ${c.area}` : null].filter(Boolean).join(" · ") || "Ho Chi Minh City"}</p>
        </div>
        <span className="flex-none rounded-full bg-cf-soft px-2.5 py-1 font-display text-[15px] font-semibold text-cf-violet">{pct}%</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12.5px]">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold", r.open === true ? "bg-[#E6F7EC] text-[#167A3E]" : r.open === false ? "bg-[#FDECEC] text-[#B42318]" : "bg-[#F2F1F5] text-cf-muted")}>
          <i className={cn("h-1.5 w-1.5 rounded-full", r.open === true ? "bg-[#22A55A]" : r.open === false ? "bg-[#E5484D]" : "bg-cf-muted")} />
          {r.open === true ? "Open now" : r.open === false ? "Closed now" : "Hours not known"}
        </span>
        {r.hours && <span className="text-cf-muted">{r.hours}, Saigon time</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" onClick={e => e.stopPropagation()}>
        {labels.length ? labels.slice(0, 9).map(l => <Chip key={l.key} l={l} open={open === l.key} onClick={() => setOpen(open === l.key ? null : l.key)} />)
          : <span className="text-[13px] text-cf-muted">No labels yet. Be the first to say what it is like.</span>}
      </div>
      {openL && (
        <div className="mt-2 grid gap-1.5 rounded-2xl bg-cf-soft p-3 text-[13px] leading-snug" onClick={e => e.stopPropagation()}>
          <p className="font-semibold">{labelTitle(openL.key, openL.score)} · {Math.round(Math.abs(openL.score) * 100)}% sure</p>
          {openL.ev.slice(0, 3).map((e, i) => <p key={i}><Quote ev={e} short /></p>)}
        </div>
      )}

      <ul className="mt-3 grid gap-1.5 text-[13.5px] leading-snug">
        {r.reasons.map((x, i) => (
          <li key={i} className="flex gap-2">
            <span className={cn("mt-1.5 h-2 w-2 flex-none rounded-full", { taste: "bg-cf-pink", query: "bg-cf-violet", trait: "bg-cf-lime", where: "bg-cf-sky", unknown: "bg-[#C9C6D6]" }[x.kind])} />
            <span className={cn(x.kind === "unknown" && "text-cf-muted")}>
              {x.strong && <b className="font-semibold">{x.strong} </b>}
              {x.kind === "query" && x.ev ? <Quote ev={x.ev} short /> : x.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-1.5" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onVisit} className="cf-icon" aria-label={`I have been to ${c.name}`} title="Been here">
          {visits ? <><Check className="h-4 w-4" /><b className="text-[12px]">{visits}</b></> : <Plus className="h-4 w-4" />}
        </button>
        <button type="button" onClick={onLove} className={cn("cf-icon", loved && "border-cf-pink bg-cf-pink text-white")} aria-pressed={loved} aria-label={`Love ${c.name}`} title="Love it">
          <Heart className={cn("h-4 w-4", loved && "fill-current")} />
        </button>
        <button type="button" onClick={() => setWriting(!writing)} aria-expanded={writing} className="cf-icon px-3 text-[12.5px] font-semibold"><MessageSquarePlus className="h-4 w-4" />Add a note</button>
        <a href={google} target="_blank" rel="noopener" className="cf-icon px-3 text-[12.5px] font-semibold" title="Read its reviews on Google Maps">Reviews<ExternalLink className="h-3.5 w-3.5" /></a>
        <a href={`https://www.openstreetmap.org/${c.id}`} target="_blank" rel="noopener" className="cf-icon px-3 text-[12.5px] font-semibold" title="See it on OpenStreetMap">OSM<ExternalLink className="h-3.5 w-3.5" /></a>
      </div>

      {writing && (
        <div className="mt-3 grid gap-2 rounded-2xl border border-cf-line p-3" onClick={e => e.stopPropagation()}>
          <label className="text-[13px] font-semibold" htmlFor={`note-${c.id}`}>What is it like? Write it in your own words, after a visit or after reading its reviews.</label>
          <textarea id={`note-${c.id}`} rows={3} value={draft} onChange={e => setDraft(e.target.value)} placeholder="e.g. Quiet upstairs, lots of old books, they play acoustic songs at night. Không có máy lạnh."
            className="w-full resize-y rounded-xl border border-cf-line bg-cf-soft px-3 py-2 text-[14px] outline-none focus:border-cf-violet focus:bg-white" />
          <p className="text-[12.5px] text-cf-muted" aria-live="polite">
            {preview.length ? <>It hears: {preview.map((e, i) => <b key={i} className={cn("mr-1 inline-block rounded-full px-2 py-0.5 text-[12px]", e.v > 0 ? "bg-cf-lime text-cf-ink" : "bg-[#F2F1F5] text-cf-muted line-through")}>{labelTitle(e.key, e.v)}</b>)}</> : "Labels it hears will appear here as you type."}
          </p>
          <div className="flex gap-2">
            <button type="button" className="cf-btn py-2" disabled={!draft.trim()} onClick={() => { onNote(draft.trim()); setDraft(""); setWriting(false) }}>Save note</button>
            <button type="button" className="cf-btn-ghost" onClick={() => { setDraft(""); setWriting(false) }}>Cancel</button>
          </div>
          <p className="text-[11.5px] text-cf-muted">Kept only in this browser. Please write your own words rather than copying other people's reviews.</p>
        </div>
      )}
      {c.notes.length > 0 && (
        <ul className="mt-3 grid gap-1.5 text-[13px]" onClick={e => e.stopPropagation()}>
          {c.notes.map(n => (
            <li key={n.by + n.at} className="flex items-start gap-2 rounded-xl bg-cf-soft px-3 py-2">
              <span className="flex-1"><b className="font-semibold">{n.by === "you" ? "Your note" : "Dong Anh's note"}:</b> {n.text}</span>
              {n.by === "you" && <button type="button" onClick={() => onDeleteNote(n.at)} aria-label="Delete this note" className="rounded-full p-1 hover:bg-white"><Trash2 className="h-3.5 w-3.5" /></button>}
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={e => { e.stopPropagation(); setWhy(!why) }} aria-expanded={why} className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-cf-violet">
        Why this score <ChevronDown className={cn("h-4 w-4 transition-transform", why && "rotate-180")} />
      </button>
      {why && (
        <div className="mt-2 grid gap-2 rounded-2xl bg-cf-soft p-3 text-[12.5px]" onClick={e => e.stopPropagation()}>
          <div className="flex h-3 overflow-hidden rounded-full bg-white">{parts.map(p => <i key={p.k} style={{ width: `${p.w * p.v * 100}%`, background: p.color }} />)}</div>
          {parts.map(p => <p key={p.k} className="flex justify-between gap-2"><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />{p.k} × {Math.round(p.w * 100)}%</span><b>{Math.round(p.v * 100)}</b></p>)}
          <p className="text-cf-muted">A keyword with evidence counts by how sure we are; evidence against it counts 0; nothing known counts 25. Taste counts only as far as the café fits your words.</p>
        </div>
      )}
    </article>
  );
}
