// src/components/StatTiles.jsx
import "./StatTiles.scss";

export default function StatTiles({ tiles }) {
  return (
    <div className="tiles">
      {tiles.map((t) => (
        <div key={t.label} className={`tiles__tile${t.hot ? " is-hot" : ""}`}>
          <span>{t.label}</span>
          <b>{t.value}</b>
          {t.sub && <small>{t.sub}</small>}
        </div>
      ))}
    </div>
  );
}
