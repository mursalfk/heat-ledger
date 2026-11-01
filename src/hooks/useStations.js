// src/hooks/useStations.js
import { useEffect, useState } from "react";

const APPROX_BYTES = 7_600_000; // used for the progress bar when the server sends no Content-Length

// Streams the GeoJSON so the loading screen can show real byte progress.
export default function useStations(url = `${import.meta.env.BASE_URL}data/stations.geojson`) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ stage: "link", loaded: 0, total: APPROX_BYTES, exact: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.statusText);
        const length = Number(res.headers.get("content-length")) || 0;
        const reader = res.body.getReader();
        const chunks = [];
        let loaded = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          if (alive) setProgress({ stage: "link", loaded, total: length || APPROX_BYTES, exact: Boolean(length) });
        }
        if (alive) setProgress((p) => ({ ...p, stage: "parse", total: loaded, loaded, exact: true }));
        await new Promise((r) => setTimeout(r, 0)); // let the UI paint the parse stage
        const text = await new Blob(chunks).text();
        const json = JSON.parse(text);
        if (alive) { setData(json); setProgress((p) => ({ ...p, stage: "done" })); }
      } catch (e) {
        if (alive) setError(e);
      }
    })();
    return () => { alive = false; };
  }, [url]);

  return { data, error, progress };
}
