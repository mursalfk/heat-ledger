// src/config/themes.js
// ramps.heat: cool -> hot, ramps.wet: dry -> wet. Resampled to each metric's thresholds.
export const THEMES = [
  {
    id: "phosphor", label: "Phosphor", scheme: "dark",
    ramps: {
      heat: ["#1f6f8a", "#39ff88", "#e8ff5a", "#ffb000", "#ff5a2e", "#ff2e63"],
      wet: ["#6b7a3a", "#39c88a", "#2de2c8", "#3a9bff", "#1f5fff"],
    },
  },
  {
    id: "daylight", label: "Daylight", scheme: "light",
    ramps: {
      heat: ["#2f6fb5", "#7fc4d8", "#ffb347", "#ff5a1f", "#a3200d"],
      wet: ["#e8c97a", "#7fc8a9", "#2a9d8f", "#2f5fb3", "#1b2a7a"],
    },
  },
];
