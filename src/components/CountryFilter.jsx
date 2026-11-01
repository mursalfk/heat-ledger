// src/components/CountryFilter.jsx
import "./CountryFilter.scss";

export default function CountryFilter({ value, options, onChange }) {
  return (
    <label className="country">
      <span>Country</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Whole world</option>
        {options.map((o) => <option key={o.cc} value={o.cc}>{o.name}</option>)}
      </select>
    </label>
  );
}
