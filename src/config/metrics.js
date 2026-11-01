// src/config/metrics.js
// `at` = value thresholds. Colours come from the active theme's ramp (see themes.js).
export const METRICS = {
  tmax: { label: "Hottest day", short: "Peak °C", unit: "°C", dir: "desc", dateKey: "tmaxDate", kind: "heat",
    at: [-10, 10, 25, 35, 42, 50], blurb: "Highest daily maximum temperature recorded in 2026." },
  tmean: { label: "Average high", short: "Mean °C", unit: "°C", dir: "desc", kind: "heat",
    at: [-20, 0, 15, 25, 32, 38], blurb: "Average of every daily maximum so far this year." },
  hot35: { label: "Days 35°C+", short: "Days ≥35°C", unit: "days", dir: "desc", kind: "heat",
    at: [0, 1, 20, 60, 120, 200], blurb: "How many days the daily high reached 35 °C or more." },
  tmin: { label: "Coldest night", short: "Low °C", unit: "°C", dir: "asc", dateKey: "tminDate", kind: "heat",
    at: [-60, -35, -15, 0, 15, 30], blurb: "Lowest daily minimum temperature recorded in 2026." },
  prcp: { label: "Rainfall", short: "mm", unit: "mm", dir: "desc", kind: "wet",
    at: [0, 100, 500, 1500, 3500], blurb: "Total precipitation measured so far in 2026." },
  wetDays: { label: "Rainy days", short: "Days ≥1 mm", unit: "days", dir: "desc", kind: "wet",
    at: [0, 30, 90, 160, 250], blurb: "Days with at least 1 mm of precipitation." },
};

export const METRIC_KEYS = Object.keys(METRICS);

const sample = (ramp, n) => Array.from({ length: n }, (_, i) => ramp[Math.round((i * (ramp.length - 1)) / (n - 1))]);

// [[threshold, colour], ...] for a metric under a theme.
export const stopsFor = (key, theme) => {
  const m = METRICS[key];
  const cols = sample(theme.ramps[m.kind], m.at.length);
  return m.at.map((v, i) => [v, cols[i]]);
};

export const colorExpression = (key, theme) => [
  "interpolate", ["linear"], ["to-number", ["get", key]],
  ...stopsFor(key, theme).flat(),
];
