// src/components/ThemeSwitcher.jsx
import { THEMES } from "../config/themes.js";
import "./ThemeSwitcher.scss";

export default function ThemeSwitcher({ value, onChange }) {
  return (
    <div className="themes" role="radiogroup" aria-label="Theme">
      {THEMES.map((t) => (
        <button key={t.id} role="radio" aria-checked={t.id === value} className={`themes__btn${t.id === value ? " is-on" : ""}`} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
