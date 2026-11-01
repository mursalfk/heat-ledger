// src/components/MetricSwitcher.jsx
import { METRICS, METRIC_KEYS } from "../config/metrics.js";
import "./MetricSwitcher.scss";

export default function MetricSwitcher({ value, onChange }) {
  return (
    <section className="metrics">
      <h2>Colour the map by</h2>
      <div className="metrics__grid">
        {METRIC_KEYS.map((k) => (
          <button key={k} className={`metrics__btn${k === value ? " is-on" : ""}`} onClick={() => onChange(k)}>
            {METRICS[k].label}
          </button>
        ))}
      </div>
      <p className="metrics__blurb">{METRICS[value].blurb}</p>
    </section>
  );
}
