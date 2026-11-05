import type { Ranked } from "@/engine/rank";

const VIBE_COLOR = { calm: "#6B4BFF", focus: "#22A7F0", social: "#FF5FA2" } as const;

interface Props { results: Ranked[]; selected: string | null; onSelect: (id: string) => void; distMax: number }

/** A stylised map: you in the middle, each café a bubble sized by how well it matches you. */
export function BubbleMap({ results, selected, onSelect, distMax }: Props) {
  const W = 960, H = 340, k = 64; // 64 px per km
  const top = results.slice(0, 12);
  const best = top.length ? Math.max(...top.map(r => r.score)) : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={`Map of ${top.length} matching cafés around you`}>
      <defs>
        <pattern id="blocks" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <rect width="44" height="44" fill="#EAF7EE" /><rect x="5" y="5" width="34" height="34" rx="6" fill="#DDF1E3" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#blocks)" />
      <path d={`M-20 ${H * 0.62} C ${W * 0.3} ${H * 0.5}, ${W * 0.6} ${H * 0.86}, ${W + 20} ${H * 0.72}`} stroke="#BFE6FF" strokeWidth="34" fill="none" />
      <path d={`M${W * 0.36} -10 L ${W * 0.42} ${H + 10}`} stroke="#fff" strokeWidth="12" />
      <path d={`M-10 ${H * 0.34} L ${W + 10} ${H * 0.28}`} stroke="#fff" strokeWidth="10" />
      <circle cx={W / 2} cy={H / 2} r={Math.min(distMax, 5) * k} fill="rgba(107,75,255,.06)" stroke="rgba(107,75,255,.35)" strokeDasharray="4 6" />
      {top.slice().reverse().map(r => {
        const x = W / 2 + r.cafe.x * k, y = H / 2 - r.cafe.y * k, rad = 11 + 15 * (r.score / best), on = r.cafe.id === selected;
        return (
          <g key={r.cafe.id} transform={`translate(${x},${y})`} className="cursor-pointer" onClick={() => onSelect(r.cafe.id)} role="button" aria-label={`${r.cafe.name}, ${Math.round(r.score * 100)}% match`} tabIndex={0}
             onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(r.cafe.id) } }}>
            <circle r={rad + (on ? 6 : 0)} fill={VIBE_COLOR[r.cafe.vibe]} stroke="#fff" strokeWidth={on ? 5 : 3} style={{ transition: "r .3s" }} />
            <text textAnchor="middle" dy="4" fontSize="12" fontWeight="700" fill="#fff" fontFamily="Fredoka, sans-serif">{Math.round(r.score * 100)}</text>
            {on && <text textAnchor="middle" y={-rad - 12} fontSize="13" fontWeight="700" fill="#17142B" fontFamily="Fredoka, sans-serif" paintOrder="stroke" stroke="#fff" strokeWidth="4">{r.cafe.name}</text>}
          </g>
        );
      })}
      <g transform={`translate(${W / 2},${H / 2})`}>
        <circle r="22" fill="rgba(92,200,255,.25)" /><circle r="9" fill="#5CC8FF" stroke="#fff" strokeWidth="3" />
      </g>
      
    </svg>
  );
}
