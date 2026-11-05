import { useState } from "react";
import { Heart, Plus, Check, ChevronDown } from "lucide-react";
import type { Ranked } from "@/engine/rank";
import { cn } from "@/lib/utils";

interface Props { r: Ranked; rankNo: number; visits: number; loved: boolean; selected: boolean; onVisit: () => void; onLove: () => void; onSelect: () => void }

const Meter = ({ label, value, color, text }: { label: string; value: number; color: string; text: string }) => (
  <div className="grid grid-cols-[4.2rem_1fr_3.6rem] items-center gap-2 text-[12.5px]">
    <span className="text-cf-muted">{label}</span>
    <span className="h-2 rounded-full bg-cf-soft overflow-hidden"><i className="block h-full rounded-full" style={{ width: `${Math.round(value * 100)}%`, background: color }} /></span>
    <span className="text-right font-medium">{text}</span>
  </div>
);

export function CafeCard({ r, rankNo, visits, loved, selected, onVisit, onLove, onSelect }: Props) {
  const [why, setWhy] = useState(false);
  const c = r.cafe, pct = Math.round(r.score * 100);
  const parts = [
    { k: "Your words", w: r.weights.query, v: r.parts.query, color: "#6B4BFF" },
    { k: "Your taste", w: r.weights.taste, v: r.parts.taste, color: "#FF5FA2" },
    { k: "Nearness", w: r.weights.near, v: r.parts.near, color: "#5CC8FF" },
  ].filter(p => p.w > 0);
  return (
    <article id={`cafe-${c.id}`} className={cn("cf-card group", selected && "ring-4 ring-cf-violet/40")} onClick={onSelect}>
      <div className="relative h-40 overflow-hidden rounded-[20px]">
        <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[12px] font-bold">#{rankNo}</span>
        <span className="absolute right-3 top-3 rounded-full bg-cf-ink px-3 py-1 font-display text-[15px] font-semibold text-white">{pct}% match</span>
        {!r.openNow && <span className="absolute left-3 bottom-3 rounded-full bg-white/95 px-3 py-1 text-[12px] font-semibold">Closed now</span>}
      </div>
      <div className="flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0">
          <h3 className="font-display text-[21px] font-semibold leading-tight">{c.name}</h3>
          <p className="text-[13px] text-cf-muted">{c.area} · {c.vibe} · ★ {c.rating.toFixed(1)}</p>
        </div>
        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
          <button type="button" onClick={onVisit} className="cf-icon" aria-label={`I have been to ${c.name}`} title="Been here">
            {visits ? <><Check className="h-4 w-4" /><b className="text-[12px]">{visits}</b></> : <Plus className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onLove} className={cn("cf-icon", loved && "bg-cf-pink text-white border-cf-pink")} aria-pressed={loved} aria-label={`Love ${c.name}`} title="Love it">
            <Heart className={cn("h-4 w-4", loved && "fill-current")} />
          </button>
        </div>
      </div>
      <ul className="mt-2 grid gap-1 text-[13.5px] leading-snug">
        {r.reasons.map((x, i) => (
          <li key={i} className="flex gap-2"><span className={cn("mt-1.5 h-2 w-2 flex-none rounded-full", { taste: "bg-cf-pink", query: "bg-cf-violet", trait: "bg-cf-lime", where: "bg-cf-sky" }[x.kind])} />
            <span>{x.strong && <b className="font-semibold">{x.strong} </b>}{x.text}</span></li>
        ))}
      </ul>
      <div className="mt-3 grid gap-1.5">
        <Meter label="Noise" value={c.noise} color="#6B4BFF" text={c.noise < .3 ? "quiet" : c.noise < .55 ? "medium" : "lively"} />
        <Meter label="Crowd" value={c.crowd} color="#FF5FA2" text={c.crowd < .35 ? "a few" : c.crowd < .6 ? "some" : "busy"} />
        <Meter label="Price" value={(c.price - 25000) / 55000} color="#FFC94D" text={`${Math.round(c.price / 1000)}k ₫`} />
      </div>
      <button type="button" onClick={e => { e.stopPropagation(); setWhy(!why) }} aria-expanded={why} className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-cf-violet">
        Why this score <ChevronDown className={cn("h-4 w-4 transition-transform", why && "rotate-180")} />
      </button>
      {why && (
        <div className="mt-2 grid gap-2 rounded-2xl bg-cf-soft p-3 text-[12.5px]" onClick={e => e.stopPropagation()}>
          <div className="flex h-3 overflow-hidden rounded-full bg-white">
            {parts.map(p => <i key={p.k} style={{ width: `${p.w * p.v * 100}%`, background: p.color }} />)}
          </div>
          {parts.map(p => (
            <p key={p.k} className="flex justify-between gap-2"><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />{p.k} × {Math.round(p.w * 100)}%</span><b>{Math.round(p.v * 100)}</b></p>
          ))}
          <p className="text-cf-muted">Score {pct} is the weighted sum. Taste counts only as far as the café fits your words, so what you ask for now beats habit. Parts you have not given yet drop out.</p>
        </div>
      )}
    </article>
  );
}
