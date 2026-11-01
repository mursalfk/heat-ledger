# pipeline/build_data.py
# Aggregates NOAA GHCN-Daily (AWS Open Data, s3://noaa-ghcn-pds, anonymous read) into one station-level GeoJSON.
# Usage: python3 pipeline/build_data.py [YEAR]
import csv, gzip, json, sys, urllib.request, os, collections

YEAR = sys.argv[1] if len(sys.argv) > 1 else "2026"
BASE = "https://noaa-ghcn-pds.s3.amazonaws.com"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "data", "stations.geojson")


def fetch(name, url):
    path = os.path.join(HERE, name)
    if not os.path.exists(path):
        print("downloading", url)
        urllib.request.urlretrieve(url, path)
    return path


stations_p = fetch("ghcnd-stations.txt", f"{BASE}/ghcnd-stations.txt")
countries_p = fetch("ghcnd-countries.txt", f"{BASE}/ghcnd-countries.txt")
data_p = fetch(f"{YEAR}.csv.gz", f"{BASE}/csv.gz/by_year/{YEAR}.csv.gz")

countries = {}
with open(countries_p, encoding="utf-8") as f:
    for line in f:
        countries[line[:2]] = line[3:].strip()

stations = {}
with open(stations_p, encoding="utf-8") as f:
    for line in f:
        sid = line[0:11]
        stations[sid] = (float(line[12:20]), float(line[21:30]), line[41:71].strip().title())

agg = collections.defaultdict(lambda: {
    "nx": 0, "sx": 0.0, "mx": -999.0, "mxd": "", "mn": 999.0, "mnd": "",
    "hot": 0, "pr": 0.0, "wet": 0, "np": 0,
})

with gzip.open(data_p, "rt", encoding="utf-8") as f:
    for row in csv.reader(f):
        sid, date, el, val = row[0], row[1], row[2], row[3]
        if el not in ("TMAX", "TMIN", "PRCP") or (len(row) > 5 and row[5]):
            continue  # skip other elements and any row with a quality-control flag
        if sid not in stations:
            continue
        v = int(val) / 10.0
        a = agg[sid]
        if el == "TMAX":
            a["nx"] += 1
            a["sx"] += v
            a["hot"] += v >= 35
            if v > a["mx"]:
                a["mx"], a["mxd"] = v, date
        elif el == "TMIN":
            if v < a["mn"]:
                a["mn"], a["mnd"] = v, date
        else:
            a["np"] += 1
            a["pr"] += v
            a["wet"] += v >= 1.0

features = []
for sid, a in agg.items():
    if a["nx"] < 100 and a["np"] < 100:
        continue
    lat, lon, name = stations[sid]
    p = {"id": sid, "name": name, "cc": sid[:2], "country": countries.get(sid[:2], sid[:2])}
    if a["nx"] >= 100:
        p.update(tmax=round(a["mx"], 1), tmaxDate=a["mxd"], tmean=round(a["sx"] / a["nx"], 1), hot35=a["hot"])
    if a["mn"] < 999 and a["nx"] >= 100:
        p.update(tmin=round(a["mn"], 1), tminDate=a["mnd"])
    if a["np"] >= 100:
        p.update(prcp=round(a["pr"], 1), wetDays=a["wet"])
    features.append({"type": "Feature",
                     "geometry": {"type": "Point", "coordinates": [round(lon, 3), round(lat, 3)]},
                     "properties": p})

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump({"type": "FeatureCollection", "year": YEAR, "features": features}, f, separators=(",", ":"))
print(len(features), "stations ->", os.path.abspath(OUT), round(os.path.getsize(OUT) / 1e6, 2), "MB")
