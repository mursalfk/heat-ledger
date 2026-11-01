// src/components/Legend.jsx
import { METRICS, stopsFor } from "../config/metrics.js";
import "./Legend.scss";

export default function Legend({ metric, theme }) {
  const stops = stopsFor(metric, theme);
  const gradient = `linear-gradient(90deg, ${stops.map(([, c]) => c).join(", ")})`;
  return (
    <div className="legend">
      <div className="legend__bar" style={{ background: gradient }} />
      <div className="legend__ticks">
        <span>{stops[0][0]}</span>
        <span>{METRICS[metric].short}</span>
        <span>{stops[stops.length - 1][0]}+</span>
      </div>
    </div>
  );
}
