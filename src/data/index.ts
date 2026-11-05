// Real cafés in Ho Chi Minh City, from OpenStreetMap (© OpenStreetMap contributors, ODbL),
// with descriptions from Wikivoyage (CC BY-SA). Built by scripts/build_data.py.
import raw from "./cafes.json";
import ownerNotes from "./notes.json";
import { labelCafe, type Cafe, type RawCafe } from "@/engine/labels";

export const SOURCE = raw.source as { osm: string; date: string };
export const RAW: RawCafe[] = (raw as { cafes: RawCafe[] }).cafes;
/** Dong Anh's notes, written after reading each café's reviews: { [osmId]: [{ text, at }] }. */
export const OWNER_NOTES = ownerNotes as Record<string, { text: string; at: number }[]>;

export type UserNotes = Record<string, { text: string; at: number }[]>;

export function buildCafes(user: UserNotes = {}): Cafe[] {
  return RAW.map(c => labelCafe(c, [
    ...(OWNER_NOTES[c.id] ?? []).map(n => ({ by: "notes" as const, ...n })),
    ...(user[c.id] ?? []).map(n => ({ by: "you" as const, ...n })),
  ]));
}
