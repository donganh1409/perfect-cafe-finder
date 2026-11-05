import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Cafe } from "@/engine/labels";
import type { Origin, Ranked } from "@/engine/rank";

interface Props {
  cafes: Cafe[]; results: Ranked[]; selected: string | null; origin: Origin; picking: boolean;
  onSelect: (id: string) => void; onPick: (lat: number, lon: number) => void;
}

const TOP = 12;
const colour = (r: Ranked) => {
  const s = (k: string) => r.cafe.labels[k]?.score ?? 0;
  if (Math.max(s("quiet"), s("books"), s("garden")) > 0.3) return "#6B4BFF";
  if (Math.max(s("lively"), s("friends"), s("live music")) > 0.3) return "#FF5FA2";
  if (Math.max(s("work"), s("wifi")) > 0.3) return "#22A7F0";
  return "#17142B";
};

/** A real map of Saigon (OpenStreetMap data and tiles): every café a dot, your best matches numbered. */
export function RealMap({ cafes, results, selected, origin, picking, onSelect, onPick }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layers = useRef<{ dots?: L.LayerGroup; top?: L.LayerGroup; me?: L.Marker; byId: Map<string, L.Marker> }>({ byId: new Map() });
  const cb = useRef({ onSelect, onPick, picking }); cb.current = { onSelect, onPick, picking };
  const fitRef = useRef<L.LatLngBounds | null>(null);

  useEffect(() => {
    if (!box.current || map.current) return;
    const m = L.map(box.current, { zoomControl: false, preferCanvas: true, attributionControl: true }).setView([origin.lat, origin.lon], 14);
    L.control.zoom({ position: "bottomright" }).addTo(m);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, className: "cf-tiles",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(m);
    m.attributionControl.setPrefix(false);
    m.on("click", e => { if (cb.current.picking) cb.current.onPick(e.latlng.lat, e.latlng.lng) });
    map.current = m;
    // the map may be created while hidden (phones start on the list); refit whenever it gets a real size
    let was = 0;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width; if (!w) return;
      m.invalidateSize();
      if (!was && fitRef.current) m.fitBounds(fitRef.current, { padding: [36, 36], maxZoom: 16 });
      was = w;
    });
    ro.observe(box.current);
    return () => { ro.disconnect(); m.remove(); map.current = null };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // every café, as a small dot
  useEffect(() => {
    const m = map.current; if (!m) return;
    layers.current.dots?.remove();
    const renderer = L.canvas({ padding: 0.3 });
    const g = L.layerGroup(cafes.map(c => L.circleMarker([c.lat, c.lon], { renderer, radius: 3.5, weight: 1, color: "#fff", opacity: 0.9, fillColor: "#4B4766", fillOpacity: 0.7 })
      .bindTooltip(c.name, { direction: "top", offset: [0, -4] }).on("click", () => cb.current.onSelect(c.id))));
    g.addTo(m); layers.current.dots = g;
  }, [cafes]);

  // the best matches, numbered, and a view that fits them
  useEffect(() => {
    const m = map.current; if (!m) return;
    layers.current.top?.remove(); layers.current.byId.clear();
    const top = results.slice(0, TOP), best = top[0]?.score || 1;
    const g = L.layerGroup();
    top.slice().reverse().forEach(r => {
      const i = top.indexOf(r) + 1, z = Math.round(26 + 14 * (r.score / best));
      const icon = L.divIcon({ className: "cf-pin-wrap", iconSize: [z, z], iconAnchor: [z / 2, z / 2], html: `<span class="cf-mpin" style="--z:${z}px;--c:${colour(r)}">${i}</span>` });
      const mk = L.marker([r.cafe.lat, r.cafe.lon], { icon, riseOnHover: true, keyboard: true, title: `${i}. ${r.cafe.name}`, alt: `${i}. ${r.cafe.name}, ${Math.round(r.score * 100)}% match` })
        .bindTooltip(`<b>${i}. ${escapeHtml(r.cafe.name)}</b> · ${Math.round(r.score * 100)}%`, { direction: "top", offset: [0, -z / 2] })
        .on("click", () => cb.current.onSelect(r.cafe.id));
      mk.addTo(g); layers.current.byId.set(r.cafe.id, mk);
    });
    g.addTo(m); layers.current.top = g;
    const pts: L.LatLngTuple[] = [[origin.lat, origin.lon], ...top.slice(0, 8).map(r => [r.cafe.lat, r.cafe.lon] as L.LatLngTuple)];
    if (pts.length > 1) { fitRef.current = L.latLngBounds(pts); if (box.current?.offsetWidth) m.fitBounds(fitRef.current, { padding: [36, 36], maxZoom: 16, animate: true }) }
  }, [results]); // eslint-disable-line react-hooks/exhaustive-deps

  // where you are
  useEffect(() => {
    const m = map.current; if (!m) return;
    layers.current.me?.remove();
    const icon = L.divIcon({ className: "cf-pin-wrap", iconSize: [22, 22], iconAnchor: [11, 11], html: '<span class="cf-me"></span>' });
    layers.current.me = L.marker([origin.lat, origin.lon], { icon, interactive: false, keyboard: false, zIndexOffset: -100 }).addTo(m);
  }, [origin]);

  // the selected café
  useEffect(() => {
    const m = map.current; if (!m || !selected) return;
    const mk = layers.current.byId.get(selected);
    const c = cafes.find(x => x.id === selected);
    if (mk) { mk.openTooltip(); m.panTo(mk.getLatLng(), { animate: true }) }
    else if (c) { m.setView([c.lat, c.lon], Math.max(m.getZoom(), 16), { animate: true }) }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { box.current?.classList.toggle("cf-picking", picking) }, [picking]);

  return <div ref={box} className="h-full w-full" role="application" aria-label="Map of cafés in Ho Chi Minh City. Numbered pins are your best matches." />;
}

function escapeHtml(s: string) { return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!) }
