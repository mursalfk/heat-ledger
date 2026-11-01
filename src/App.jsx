// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import useStations from "./hooks/useStations.js";
import MapView from "./components/MapView.jsx";
import MetricSwitcher from "./components/MetricSwitcher.jsx";
import CountryFilter from "./components/CountryFilter.jsx";
import SearchBox from "./components/SearchBox.jsx";
import TopList from "./components/TopList.jsx";
import StationCard from "./components/StationCard.jsx";
import Legend from "./components/Legend.jsx";
import ThemeSwitcher from "./components/ThemeSwitcher.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import AboutModal from "./components/AboutModal.jsx";
import StatTiles from "./components/StatTiles.jsx";
import Histogram from "./components/Histogram.jsx";
import { THEMES } from "./config/themes.js";
import { METRICS } from "./config/metrics.js";
import { formatValue } from "./utils/format.js";
import { hasLocationKey } from "./utils/location.js";
import "./App.scss";

export default function App() {
  const { data, error, progress } = useStations();
  const [metric, setMetric] = useState("tmax");
  const [country, setCountry] = useState("");
  const [selected, setSelected] = useState(null);
  const [target, setTarget] = useState(null);
  const [theme, setTheme] = useState("phosphor");
  const [basemap, setBasemap] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [booting, setBooting] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [basemapError, setBasemapError] = useState("");
  const themeDef = THEMES.find((t) => t.id === theme);
  const scheme = themeDef.scheme;
  const source = hasLocationKey && !basemapError ? "Amazon Location" : "OpenStreetMap";

  // Safety net: never trap the user behind the loader if the first frame event doesn't arrive.
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => setRendered(true), 8000);
    return () => clearTimeout(t);
  }, [data]);

  const countries = useMemo(() => {
    if (!data) return [];
    const m = new Map();
    data.features.forEach(({ properties: p }) => m.set(p.cc, p.country));
    return [...m].map(([cc, name]) => ({ cc, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const ranked = useMemo(() => {
    if (!data) return [];
    const dir = METRICS[metric].dir === "asc" ? 1 : -1;
    return data.features
      .filter((f) => f.properties[metric] !== undefined && (!country || f.properties.cc === country))
      .sort((a, b) => dir * (a.properties[metric] - b.properties[metric]))
      .slice(0, 10);
  }, [data, metric, country]);

  const values = useMemo(() => {
    if (!data) return [];
    return data.features
      .filter((f) => f.properties[metric] !== undefined && (!country || f.properties.cc === country))
      .map((f) => f.properties[metric]);
  }, [data, metric, country]);

  const tiles = useMemo(() => {
    const m = METRICS[metric];
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : undefined;
    const top = ranked[0]?.properties;
    return [
      { label: "Nodes", value: values.length.toLocaleString(), sub: country ? "in country" : "worldwide" },
      { label: m.dir === "asc" ? "Lowest" : "Peak", value: top ? formatValue(top[metric], "").trim() : "—", sub: top ? top.name : "", hot: true },
      { label: "Median", value: median === undefined ? "—" : formatValue(median, "").trim(), sub: m.unit },
    ];
  }, [values, ranked, metric, country]);

  const focus = (feature, zoom = 7) => {
    const [lng, lat] = feature.geometry.coordinates;
    setSelected(feature);
    setTarget({ lng, lat, zoom, t: Date.now() });
  };

  return (
    <div className="app" data-theme={theme}>
      {booting && (
        <LoadingScreen progress={progress} count={data ? data.features.length : 0} basemap={basemap}
          source={source} rendered={rendered} error={error} onGone={() => setBooting(false)} />
      )}

      <main className="app__map">
        {error && <div className="app__error">LINK FAILED // {error.message}</div>}
        <MapView key={theme} scheme={scheme} theme={themeDef} data={data} metric={metric} country={country} selected={selected} target={target}
          onBasemap={() => setBasemap(true)} onBasemapError={setBasemapError} onReady={() => setRendered(true)} onSelect={(f) => setSelected(f)} />
        <Legend metric={metric} theme={themeDef} />
      </main>

      <aside className="app__dash">
        <header className="app__head">
          <div className="app__row">
            <h1>HEAT LEDGER <span>2026</span></h1>
            <button className="app__about" onClick={() => setAboutOpen(true)}>About</button>
          </div>
          <div className="app__row">
            <p>{data ? `${data.features.length.toLocaleString()} nodes online` : "acquiring nodes…"}</p>
            <ThemeSwitcher value={theme} onChange={setTheme} />
          </div>
        </header>

        <StatTiles tiles={tiles} />
        <MetricSwitcher value={metric} onChange={setMetric} />
        <div className="app__filters">
          <CountryFilter value={country} options={countries} onChange={(cc) => { setCountry(cc); setSelected(null); }} />
          <SearchBox onPick={(p) => setTarget({ ...p, zoom: 6, t: Date.now() })} enabled={hasLocationKey} />
        </div>
        {selected && <StationCard feature={selected} onClose={() => setSelected(null)} />}
        <Histogram metric={metric} values={values} theme={themeDef} />
        <TopList metric={metric} items={ranked} onPick={focus} country={country} />

        <footer className="app__foot">
          DATA // NOAA GHCN-DAILY via AWS Open Data (S3)<br />
          BASEMAP // {hasLocationKey && !basemapError ? "Amazon Location Service" : basemapError ? `OpenStreetMap (Amazon Location failed: ${basemapError})` : "OpenStreetMap (add a Location API key)"}<br />
          BUILT BY // <a href="https://mursalfk.vercel.app" target="_blank" rel="noopener noreferrer">MURSAL FURQAN KUMBHAR</a>
        </footer>
      </aside>
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
  );
}