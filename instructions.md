# Heat Ledger: setup, deploy, submit

Deadline: **Mon 2 Nov, 1:00 PM PT = Tue 3 Nov, 1:00 AM PKT**. Aim to submit by Mon evening PKT.

## 1. Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
`public/data/stations.geojson` is already built (33,405 stations, NOAA GHCN-Daily 2026 from `s3://noaa-ghcn-pds`, anonymous read). To refresh: `npm run data` (about 1 min).

## 2. Amazon Location key (zero-cost rules)
1. AWS Billing console > check the account shows **Free plan**. Free plan only exists for accounts created after 15 Jul 2025. If your account is older/paid, **skip this section**: the app falls back to OpenStreetMap tiles and costs nothing (Location search box is hidden). Do not upgrade to a paid plan.
2. Amazon Location Service console > **API keys** > Create. Region `eu-central-1`.
3. Allowed actions: `geo-maps:GetTile`, `geo-maps:GetStaticMap`, `geo-maps:GetStyleDescriptor`, `geo-maps:GetSprites`, `geo-maps:GetGlyphs`, `geo-places:SearchText`.
4. Referer restriction: `http://localhost:5173/*` and your Vercel domain `https://<name>.vercel.app/*`. Set expiry to about 14 days.
5. Put the key in `.env.local` as `VITE_LOCATION_API_KEY`, region as `VITE_LOCATION_REGION`.

## 3. Deploy (free)
1. Push to a public GitHub repo (the keys are not in git; `.env.local` is ignored).
2. Vercel > Import repo > framework Vite > add the two env vars > Deploy.
3. Add the Vercel domain to the key's referer list (step 2.4).

## 4. Submit on Builder Center
Fields to fill: dataset, how it's mapped, AWS service, live link, repo link, demo video (public, under 3 min).

Draft text:
- **Dataset:** NOAA GHCN-Daily, year 2026 to date, from the AWS Open Data Registry (`s3://noaa-ghcn-pds`). About 33k stations; I aggregated hottest day, average high, days of 35 °C+, coldest night, total rain, rainy days per station.
- **How it's mapped:** A Python pipeline reads the public S3 bucket anonymously, drops quality-flagged readings and writes one GeoJSON. A React + MapLibre app renders every station as a data-coloured circle, with a metric switcher, country filter, top-10 ranking that flies to the station, and a station card. Amazon Location Service provides the basemap style and place search (geocoding).
- **AWS services:** Amazon S3 (Open Data source), Amazon Location Service (Maps + Places).
- **Caveat to state:** values are raw station readings after NOAA quality flags; a few extreme outliers (e.g. Kalay-Khumb, 53.6 °C) may be sensor issues.

## 5. Demo video (under 3 min, public on YouTube)
Reply "script" and I will write it for your approval first (warm Tech Dastaan intro, ellipses style, UK English voiceover). Screen-record the live site: switch metrics, filter Pakistan, click a Top-10 entry, search a city.
