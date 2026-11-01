// src/utils/format.js
export const formatDate = (yyyymmdd) =>
  yyyymmdd
    ? new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}T00:00:00Z`)
        .toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })
    : "";

export const formatValue = (v, unit) =>
  v === undefined || v === null ? "—" : `${Number.isInteger(v) ? v : v.toFixed(1)} ${unit}`;
