// src/utils/location.js
// Amazon Location Service (Maps + Places v2) helpers. Falls back to OpenStreetMap tiles without an API key.
const KEY = (import.meta.env.VITE_LOCATION_API_KEY || "").trim().replace(/^["']|["']$/g, "");
const REGION = import.meta.env.VITE_LOCATION_REGION || "eu-central-1";

export const hasLocationKey = Boolean(KEY);

const OSM_PAINT = {
  light: { "raster-saturation": -0.35, "raster-brightness-min": 0.1 },
  dark: { "raster-brightness-max": 0.4, "raster-saturation": -0.6 },
};

// scheme: "light" | "dark". forceOsm skips Amazon Location (used when its style request fails).
export const getMapStyle = (scheme, forceOsm = false) =>
  hasLocationKey && !forceOsm
    ? `https://maps.geo.${REGION}.amazonaws.com/v2/styles/Standard/descriptor?color-scheme=${scheme === "dark" ? "Dark" : "Light"}&key=${KEY}`
    : {
        version: 8,
        sources: { osm: { type: "raster", tileSize: 256, attribution: "© OpenStreetMap contributors", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"] } },
        layers: [{ id: "osm", type: "raster", source: "osm", paint: OSM_PAINT[scheme] }],
      };

export async function geocode(text) {
  if (!hasLocationKey || !text.trim()) return [];
  const res = await fetch(`https://places.geo.${REGION}.amazonaws.com/v2/search-text?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ QueryText: text, MaxResults: 5 }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.ResultItems || []).map((r) => ({
    title: r.Title,
    lng: r.Position[0],
    lat: r.Position[1],
  }));
}