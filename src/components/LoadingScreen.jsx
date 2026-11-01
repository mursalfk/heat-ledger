// src/components/LoadingScreen.jsx
import { useEffect, useState } from "react";
import "./LoadingScreen.scss";

const mb = (b) => (b / 1e6).toFixed(1);

// Every line reflects a real event: bytes received, JSON parsed, basemap style loaded, first frame painted.
export default function LoadingScreen({ progress, count, basemap, source, rendered, error, onGone }) {
  const [leaving, setLeaving] = useState(false);

  const linkFrac = progress.stage === "link" ? Math.min(0.99, progress.loaded / progress.total) : 1;
  const parsed = progress.stage === "done";
  const percent = Math.round(100 * (0.6 * linkFrac + 0.15 * (parsed ? 1 : 0) + 0.1 * (basemap ? 1 : 0) + 0.15 * (rendered ? 1 : 0)));

  useEffect(() => {
    if (!rendered) return;
    setLeaving(true);
    const t = setTimeout(onGone, 600);
    return () => clearTimeout(t);
  }, [rendered]);

  const state = (done, active) => (done ? "OK" : active ? ".." : "--");

  const rows = [
    ["01", "Dataset link", progress.stage === "link" ? `${mb(progress.loaded)} / ${mb(progress.total)} MB` : `${mb(progress.loaded)} MB`, state(progress.stage !== "link", progress.stage === "link")],
    ["02", "Parse stations", parsed ? `${count.toLocaleString()} nodes` : "waiting", state(parsed, progress.stage === "parse")],
    ["03", "Basemap", basemap ? source : "waiting", state(basemap, !basemap)],
    ["04", "First render", rendered ? "locked" : "waiting", state(rendered, parsed && basemap)],
  ];

  return (
    <div className={`boot${leaving ? " is-leaving" : ""}`} role="status" aria-live="polite">
      <div className="boot__core">
        <svg className="boot__reticle" viewBox="-130 -130 260 260" aria-hidden="true">
          <circle r="120" className="ring ring--a" />
          <circle r="96" className="ring ring--b" />
          <circle r="72" className="ring ring--c" />
          <g className="sweep"><line x1="0" y1="0" x2="120" y2="0" /></g>
          <path d="M-130 0H-112M112 0H130M0 -130V-112M0 112V130" className="cross" />
        </svg>
        <div className="boot__pct"><b>{percent}</b><span>%</span></div>
      </div>

      <h1 className="boot__title">HEAT LEDGER</h1>
      <p className="boot__sub">{error ? `LINK FAILED // ${error.message}` : "SYS.2026 // ACQUIRING WEATHER NODES"}</p>

      <ul className="boot__log">
        {rows.map(([n, label, value, st]) => (
          <li key={n} className={`st-${st === "OK" ? "ok" : st === ".." ? "run" : "idle"}`}>
            <i>{n}</i><span>{label}</span><em>{value}</em><b>[{st}]</b>
          </li>
        ))}
      </ul>

      <p className="boot__src">NOAA GHCN-DAILY // AWS OPEN DATA // s3://noaa-ghcn-pds</p>
    </div>
  );
}
