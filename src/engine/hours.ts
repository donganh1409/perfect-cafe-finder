// OpenStreetMap opening_hours, the common forms: "24/7", "07:00-22:00", "Mo-Su 06:00-01:00",
// "Mo-Fr 07:00-21:00; Sa,Su 08:00-22:00", "Mo-Su 07:30-14:00,16:00-22:00", "Su off".
// Anything else (public holidays, months, sunrise…) returns null: hours unknown, never guessed.
// Times are Saigon time, so a visitor abroad sees what is open in the city now.

export type Week = [number, number][][]; // per day (0 = Monday), list of [open, close] in minutes; close may pass 1440

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function parseHours(raw?: string): Week | null {
  if (!raw) return null;
  const s = raw.trim();
  if (s === "24/7") return DAYS.map(() => [[0, 1440]]);
  const week: Week = DAYS.map(() => []);
  for (const rule of s.split(";").map(r => r.trim()).filter(Boolean)) {
    const m = rule.match(/^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:\s*,\s*(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)?\s*(.*)$/);
    if (!m) return null;
    const days = m[1] ? expandDays(m[1]) : DAYS.map((_, i) => i);
    const times = m[2].trim();
    if (times === "off" || times === "closed") { days.forEach(d => (week[d] = [])); continue }
    const spans: [number, number][] = [];
    for (const t of times.split(",").map(x => x.trim())) {
      const r = t.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
      if (!r) return null;
      const o = +r[1] * 60 + +r[2]; let c = +r[3] * 60 + +r[4];
      if (c <= o) c += 1440; // past midnight
      spans.push([o, c]);
    }
    days.forEach(d => (week[d] = spans));
  }
  return week;
}

function expandDays(spec: string): number[] {
  const out: number[] = [];
  for (const part of spec.split(",").map(p => p.trim())) {
    const [a, b] = part.split("-").map(p => DAYS.indexOf(p.trim()));
    if (b === undefined) out.push(a);
    else for (let i = a; ; i = (i + 1) % 7) { out.push(i); if (i === b) break }
  }
  return out;
}

/** Day (0 = Monday) and minute of the day in Saigon. */
export function saigonNow(at = new Date()) {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(at);
  const get = (t: string) => p.find(x => x.type === t)?.value ?? "";
  return { day: DAYS.indexOf(get("weekday").slice(0, 2)), min: +get("hour") * 60 + +get("minute") };
}

/** true / false, or null when the hours are unknown. */
export function isOpen(week: Week | null, at = new Date()): boolean | null {
  if (!week) return null;
  const { day, min } = saigonNow(at);
  const today = week[day].some(([o, c]) => min >= o && min < c);
  const yesterday = week[(day + 6) % 7].some(([, c]) => c > 1440 && min < c - 1440);
  return today || yesterday;
}

export const fmt = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** "open until 22:00", "opens 07:00", "open 24 hours", or null. */
export function hoursText(week: Week | null, at = new Date()): string | null {
  if (!week) return null;
  if (week.every(d => d.length === 1 && d[0][0] === 0 && d[0][1] >= 1440)) return "open 24 hours";
  const { day, min } = saigonNow(at);
  const now = week[day].find(([o, c]) => min >= o && min < c) ?? week[(day + 6) % 7].filter(([, c]) => c > 1440 && min < c - 1440).map(([o, c]) => [o - 1440, c - 1440] as [number, number])[0];
  if (now) return `open until ${fmt(now[1])}`;
  const later = week[day].find(([o]) => o > min);
  if (later) return `opens ${fmt(later[0])}`;
  for (let i = 1; i <= 7; i++) { const d = week[(day + i) % 7]; if (d.length) return `opens ${i === 1 ? "tomorrow" : DAYS[(day + i) % 7]} ${fmt(d[0][0])}` }
  return "closed";
}

export const latestClose = (w: Week) => Math.max(0, ...w.flat().map(([, c]) => c));
export const earliestOpen = (w: Week) => Math.min(1440, ...w.flat().map(([o]) => o));
