// src/components/SearchBox.jsx
import { useState } from "react";
import { geocode } from "../utils/location.js";
import "./SearchBox.scss";

export default function SearchBox({ onPick, enabled }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNote("");
    const { results: found, error } = await geocode(q);
    setResults(found);
    setNote(error);
    setBusy(false);
  };

  if (!enabled) return null;

  return (
    <form className="search" onSubmit={submit}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Find a place (Amazon Location)…"
      />
      <button type="submit" disabled={busy}>
        {busy ? "…" : "Go"}
      </button>
      {note && <p className="search__note">{note}</p>}
      {results.length > 0 && (
        <ul className="search__list">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onPick(r);
                  setResults([]);
                }}
              >
                {r.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
