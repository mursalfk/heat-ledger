// src/components/MapView.jsx
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { getMapStyle, hasLocationKey } from "../utils/location.js";
import { colorExpression } from "../config/metrics.js";
import "./MapView.scss";

const SRC = "stations";

export default function MapView({ data, metric, country, selected, target, scheme, theme, onSelect, onBasemap, onBasemapError, onReady }) {
  const box = useRef(null);
  const mapRef = useRef(null);
  const ready = useRef(false);
  const latest = useRef({});
  latest.current = { data, metric, country, onSelect, onBasemap, onBasemapError, onReady, theme };
  const fired = useRef(false);
  const fellBack = useRef(false);

  const reportFirstFrame = (map) => {
    if (fired.current) return;
    fired.current = true;
    map.once("idle", () => latest.current.onReady?.());
  };

  const applyFilter = () => {
    const map = mapRef.current;
    const { metric: m, country: c } = latest.current;
    if (!map || !ready.current) return;
    const filter = ["all", ["has", m], ...(c ? [["==", ["get", "cc"], c]] : [])];
    map.setFilter("stations", filter);
    map.setPaintProperty("stations", "circle-color", colorExpression(m, latest.current.theme));
  };

  useEffect(() => {
    const map = new maplibregl.Map({ container: box.current, style: getMapStyle(scheme), center: [30, 28], zoom: 1.6, attributionControl: { compact: true } });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.getCanvas().style.outline = "none";

    const init = () => {
      if (map.getSource(SRC)) return;
      map.addSource(SRC, { type: "geojson", data: latest.current.data || { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "stations", type: "circle", source: SRC,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 1.6, 4, 3.2, 8, 7, 12, 11],
          "circle-opacity": 0.85, "circle-stroke-width": 0.5, "circle-stroke-color": scheme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)",
        },
      });
      map.addLayer({
        id: "selected", type: "circle", source: SRC, filter: ["==", ["get", "id"], ""],
        paint: { "circle-radius": 11, "circle-color": "rgba(0,0,0,0)", "circle-stroke-width": 2.5, "circle-stroke-color": scheme === "dark" ? "#ffffff" : "#1d2a3a" },
      });
      ready.current = true;
      applyFilter();
      latest.current.onBasemap?.();
      if (latest.current.data) reportFirstFrame(map);
    };
    map.on("style.load", init);

    // If Amazon Location rejects the style or tile requests (bad key, permissions, referer), fall back to OpenStreetMap and say why.
    map.on("error", (e) => {
      if (!hasLocationKey || fellBack.current) return;
      const status = e?.error?.status;
      if (ready.current && status !== 401 && status !== 403) return; // ignore unrelated tile hiccups
      fellBack.current = true;
      console.warn("Amazon Location style failed", e?.error);
      latest.current.onBasemapError?.(status ? `HTTP ${status}` : e?.error?.message || "request failed");
      map.setStyle(getMapStyle(scheme, true), { diff: false });
    });

    map.on("click", "stations", (e) => latest.current.onSelect(e.features[0]));
    map.on("mouseenter", "stations", () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", "stations", () => (map.getCanvas().style.cursor = ""));

    return () => { ready.current = false; map.remove(); };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map && ready.current && data) { map.getSource(SRC).setData(data); reportFirstFrame(map); }
    applyFilter();
  }, [data]);

  useEffect(applyFilter, [metric, country]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && ready.current) map.setFilter("selected", ["==", ["get", "id"], selected ? selected.properties.id : ""]);
  }, [selected]);

  useEffect(() => {
    if (target && mapRef.current) mapRef.current.flyTo({ center: [target.lng, target.lat], zoom: target.zoom, essential: true });
  }, [target]);

  // Fit the map to a country when it is chosen.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data || !country) return;
    const pts = data.features.filter((f) => f.properties.cc === country).map((f) => f.geometry.coordinates);
    if (!pts.length) return;
    const b = pts.reduce((bb, p) => bb.extend(p), new maplibregl.LngLatBounds(pts[0], pts[0]));
    map.fitBounds(b, { padding: 60, maxZoom: 7, duration: 900 });
  }, [country]);

  return <div ref={box} className="map-view" />;
}