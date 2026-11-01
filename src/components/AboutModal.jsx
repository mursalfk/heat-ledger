// src/components/AboutModal.jsx
import { useEffect, useRef } from "react";
import "./AboutModal.scss";

const LINKS = [
  { label: "Portfolio", href: "https://mursalfk.vercel.app" },
  { label: "GitHub", href: "https://github.com/mursalfk" },
];

export default function AboutModal({ onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="about" onClick={onClose}>
      <section className="about__box" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} className="about__x" onClick={onClose} aria-label="Close">×</button>

        <h2 id="about-title">Heat Ledger <span>2026</span></h2>
        <p className="about__lead">Where 2026 broke weather records, on one map. Every dot is a real station; pick a metric and see where the year ran hottest, coldest or wettest.</p>

        <h3>Data</h3>
        <p>NOAA GHCN-Daily for 2026, read anonymously from the AWS Open Data bucket <code>s3://noaa-ghcn-pds</code>. Readings flagged by NOAA quality control are dropped, then each station is summarised: hottest day, average high, days at 35 °C or more, coldest night, rainfall and rainy days. Stations with fewer than 100 days of data are left out. Values are year to date.</p>

        <h3>How it's built</h3>
        <p>A Python script turns the S3 data into one GeoJSON file. A React app draws it with MapLibre on an Amazon Location Service basemap, with place search from Amazon Location Places.</p>

        <h3>Caveat</h3>
        <p>These are raw station readings. A few extremes may be sensor faults that slipped past quality control.</p>

        <div className="about__me">
          <span>Built by</span>
          <b>Mursal Furqan Kumbhar</b>
          <small>AI Systems Architect and Full-Stack Engineer · AWS Community Builder · Pakistan</small>
          <div className="about__links">
            {LINKS.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}
          </div>
          <small>Made for the AWS Builder Center Weekend Challenge: Map it.</small>
        </div>
      </section>
    </div>
  );
}