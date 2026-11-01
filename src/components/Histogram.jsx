// src/components/Histogram.jsx
import { METRICS, stopsFor } from "../config/metrics.js";
import "./Histogram.scss";

const BINS = 28;

// Distribution of the current metric across the stations in view, coloured with the same ramp as the map.
export default function Histogram({ metric, values, theme }) {
  const m = METRICS[metric];
  const stops = stopsFor(metric, theme);
  const lo = m.at[0], hi = m.at[m.at.length - 1];
  const bins = Array(BINS).fill(0);
  values.forEach((v) => { bins[Math.min(BINS - 1, Math.max(0, Math.floor(((v - lo) / (hi - lo)) * BINS)))]++; });
  const max = Math.max(1, ...bins);
  const colorAt = (v) => [...stops].reverse().find(([t]) => v >= t)?.[1] ?? stops[0][1];

  return (
    <section className="hist">
      <h2>Distribution</h2>
      <div className="hist__bars" role="img" aria-label={`Distribution of ${m.label}`}>
        {bins.map((n, i) => (
          <i key={i} title={`${n} stations`} style={{ height: `${(n / max) * 100}%`, background: colorAt(lo + ((i + 0.5) / BINS) * (hi - lo)) }} />
        ))}
      </div>
      <div className="hist__axis"><span>{lo}</span><span>{m.unit}</span><span>{hi}+</span></div>
    </section>
  );
}
