// src/components/TopList.jsx
import { METRICS } from "../config/metrics.js";
import { formatDate, formatValue } from "../utils/format.js";
import "./TopList.scss";

export default function TopList({ metric, items, onPick, country }) {
  const m = METRICS[metric];
  const top = items.length ? Math.abs(items[0].properties[metric]) || 1 : 1;
  return (
    <section className="top">
      <h2>{m.dir === "asc" ? "Lowest" : "Highest"} 10 {country ? "in country" : "worldwide"}</h2>
      <ol>
        {items.map(({ properties: p, ...f }, i) => (
          <li key={p.id}>
            <button onClick={() => onPick({ ...f, properties: p })}>
              <i>{String(i + 1).padStart(2, "0")}</i>
              <b>{p.name}</b>
              <em>{formatValue(p[metric], m.unit)}</em>
              <small>{p.country}{m.dateKey && p[m.dateKey] ? ` · ${formatDate(p[m.dateKey])}` : ""}</small>
              <u style={{ width: `${Math.min(100, (Math.abs(p[metric]) / top) * 100)}%` }} />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
