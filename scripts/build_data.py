"""Build src/data/cafes.json from OpenStreetMap and Wikivoyage.

Real cafés come from an OpenStreetMap extract of Ho Chi Minh City (BBBike, ODbL).
Text that describes them comes from OSM `description` tags and the Wikivoyage
Ho Chi Minh City guide (CC BY-SA). Labels are NOT computed here: the app labels
every café in the browser, from these tags and texts, so the labeller has one
implementation (src/engine/labels.ts) and every label can show its evidence.

    pip install osmium
    curl -O https://download.bbbike.org/osm/bbbike/Saigon/Saigon.osm.pbf
    curl -o wikivoyage.txt "https://en.wikivoyage.org/w/index.php?title=Ho_Chi_Minh_City&action=raw"
    python scripts/build_data.py Saigon.osm.pbf wikivoyage.txt src/data/cafes.json
"""
import json, math, re, sys, unicodedata
import osmium

KEEP = {  # the OSM tags the labeller reads
    'cuisine', 'internet_access', 'internet_access:fee', 'outdoor_seating', 'indoor_seating', 'air_conditioning',
    'opening_hours', 'smoking', 'wheelchair', 'pets_allowed', 'dog', 'diet:vegan', 'diet:vegetarian', 'brand',
    'takeaway', 'website', 'addr:street', 'addr:housenumber', 'addr:district', 'name:en', 'level', 'check_date',
}
# Approximate centres of the old districts, which people still use to say where a place is.
AREAS = [
    ('District 1', 10.7756, 106.7004), ('District 3', 10.7843, 106.6844), ('District 4', 10.7593, 106.7046),
    ('District 5', 10.7540, 106.6633), ('District 10', 10.7722, 106.6680), ('Phú Nhuận', 10.7995, 106.6791),
    ('Bình Thạnh', 10.8058, 106.7070), ('Tân Bình', 10.8020, 106.6530), ('Gò Vấp', 10.8386, 106.6650),
    ('Thảo Điền', 10.8045, 106.7380), ('District 7', 10.7295, 106.7190),
]
# Wikivoyage listings that describe a chain apply to its branches; single places must match name and street.
CHAINS = {'highlands coffee': 'Highlands Coffee', 'trung nguyen': 'Trung Nguyên'}

def km(a, b, c, d):
    r = math.radians; x = (r(d) - r(b)) * math.cos(r((a + c) / 2)); y = r(c) - r(a); return 6371 * math.hypot(x, y)

def plain(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').replace('đ', 'd')
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

def core(s):
    return re.sub(r'\b(cafe|caffe|coffee|ca phe|the|and|house)\b', ' ', plain(s)).split()

class Cafes(osmium.SimpleHandler):
    def __init__(self): super().__init__(); self.rows = []
    def add(self, ref, lat, lon, tags):
        t = {k: v for k, v in tags}
        if t.get('amenity') != 'cafe' or not t.get('name'): return
        if re.search(r'(?i)\bclosed\b', t.get('description', '')) or any(k.startswith(('disused:', 'was:')) for k in t): return
        self.rows.append((ref, lat, lon, t))
    def node(self, n):
        if n.tags.get('amenity') == 'cafe' and n.location.valid(): self.add('node/%d' % n.id, n.location.lat, n.location.lon, n.tags)
    def way(self, w):
        if w.tags.get('amenity') != 'cafe': return
        pts = [(p.lat, p.lon) for p in w.nodes if p.location.valid()]
        if pts: self.add('way/%d' % w.id, sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts), w.tags)

def wikivoyage(raw):
    out = []
    for m in re.finditer(r'\{\{\s*drink\s*\|', raw, re.I):
        i = m.end(); depth = 1; j = i
        while j < len(raw) and depth:
            if raw.startswith('{{', j): depth += 1; j += 2
            elif raw.startswith('}}', j): depth -= 1; j += 2
            else: j += 1
        f, cur, d = {}, '', 0
        for ch in raw[i:j - 2] + '|':
            d += ch in '{[' ; d -= ch in '}]'
            if ch == '|' and d == 0:
                if '=' in cur: k, v = cur.split('=', 1); f[k.strip().lower()] = v.strip()
                cur = ''
            else: cur += ch
        text = re.sub(r"'''?|\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r'\1', f.get('content', '')).strip()
        if f.get('name') and text: out.append({'name': f['name'], 'address': f.get('address', ''), 'text': text})
    return out

def main(pbf, wv_path, out_path):
    h = Cafes(); h.apply_file(pbf, locations=True)
    listings = wikivoyage(open(wv_path).read())
    cafes = []
    for ref, lat, lon, t in h.rows:
        name = t['name'].split(';')[0].strip()
        near = min(AREAS, key=lambda a: km(lat, lon, a[1], a[2])); dist = km(lat, lon, near[1], near[2])
        texts = []
        if t.get('description'): texts.append({'src': 'osm', 'text': t['description'][:400]})
        for w in listings:
            wn = plain(w['name']); cn = plain(name)
            chain = next((v for k, v in CHAINS.items() if k in wn and k in cn), None)
            same = core(w['name']) and core(w['name']) == core(name)
            street = plain(t.get('addr:street', ''))
            if chain or (same and street and street.split()[-1] in plain(w['address'])):
                texts.append({'src': 'wikivoyage', 'text': w['text'][:600], 'about': chain or name})
        cafes.append({
            'id': ref, 'name': name, 'lat': round(lat, 6), 'lon': round(lon, 6),
            'area': near[0] if dist <= 2.2 else None, 'areaKm': round(dist, 2),
            'tags': {k: v for k, v in t.items() if k in KEEP}, 'texts': texts,
        })
    cafes.sort(key=lambda c: (c['area'] is None, c['areaKm']))
    json.dump({'source': {'osm': 'BBBike extract of OpenStreetMap, Saigon', 'date': sys.argv[4] if len(sys.argv) > 4 else None},
               'cafes': cafes}, open(out_path, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(len(cafes), 'cafés,', sum(1 for c in cafes if c['texts']), 'with text,', sum(1 for c in cafes if c['area']), 'near a named area')

if __name__ == '__main__':
    main(*sys.argv[1:4])
