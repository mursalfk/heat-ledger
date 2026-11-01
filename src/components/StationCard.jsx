// src/components/StationCard.jsx
import { formatDate, formatValue } from "../utils/format.js";
import "./StationCard.scss";

const ROWS = [
  ["Hottest day", "tmax", "°C", "tmaxDate"],
  ["Average high", "tmean", "°C"],
  ["Days ≥ 35 °C", "hot35", "days"],
  ["Coldest night", "tmin", "°C", "tminDate"],
  ["Rainfall", "prcp", "mm"],
  ["Rainy days", "wetDays", "days"],
];

export default function StationCard({ feature, onClose }) {
  const p = feature.properties;
  return (
    <section className="card">
      <button className="card__x" onClick={onClose} aria-label="Close">×</button>
      <h3>{p.name}</h3>
      <p>{p.country} · {p.id}</p>
      <dl>
        {ROWS.filter(([, k]) => p[k] !== undefined).map(([label, k, unit, dk]) => (
          <div key={k}>
            <dt>{label}</dt>
            <dd>{formatValue(p[k], unit)}{dk && p[dk] ? <small> on {formatDate(p[dk])}</small> : null}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
