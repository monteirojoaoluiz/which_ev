# which_ev agent notes

## Runtime/tooling
- Use `bun` for project scripts and package management.
- `uv` and `brew` are available in this environment.

## Product behavior
- A single price slider sets the target EV price.
- Filtering uses a fixed `+/- €5,000` band around that target.
- Output is the top 3 EVs inside the filtered band.
- Display units are metric (`km`, `L`, `kW`) and currency is `EUR`.
- UI copy is English.

## Data source
- Primary source: `https://ev-database.org/nl/` (Netherlands locale).
- Only vehicles with `availability current` are included in the local dataset.
- Dataset file: `src/data/evs.ts`.
- Refresh command: `bun run sync:evdb-nl`.

## EV data shape
Each EV record includes:
- `id`: string (EV Database id)
- `name`: string
- `priceEur`: number
- `rangeKm`: number
- `oneStopRangeKm`: number
- `cargoLiters`: number
- `fastChargeKw`: number
- `driveType`: `FWD` | `RWD` | `AWD` | `Unknown`
- `sourceUrl`: string

## Ranking formulas
1. Metric 1 (Value): `costPerOneStopKm = priceEur / oneStopRangeKm` (lower is better).
2. Metric 2 (Utility): weighted blend of normalized one-stop range and normalized cargo liters.
3. Metric 3 (Road Trip): weighted blend of normalized one-stop range, normalized fast-charge kW, and inverse-normalized price.
4. Overall score for top 3: weighted blend of Metric 1 value signal, Metric 2, and Metric 3.

## Deployment and automation
- Static hosting target: GitHub Pages from `gh-pages` branch.
- Vite config uses `base: './'` to support project URLs.
- Deploy workflow: `.github/workflows/deploy-pages.yml`.
  - Triggers on `main` pushes and manual dispatch.
  - Builds with Bun and publishes `dist/` to `gh-pages`.
  - Uses Bun install retries with `npm install` fallback for runner network resilience.
- Weekly data refresh workflow: `.github/workflows/weekly-evdb-nl-refresh.yml`.
  - Runs every Friday at `15:00 UTC` (`cron: 0 15 * * 5`) plus manual dispatch.
  - Syncs EV data, runs tests/build, commits `src/data/evs.ts` if changed, and pushes to `main`.
  - Uses Bun install retries with `npm install` fallback for runner network resilience.

## Current source map
- `scripts/sync-evdb-nl.ts`: scrape/transform script for EV Database NL source.
- `src/data/evs.ts`: generated Netherlands EV dataset.
- `src/lib/recommendations.ts`: price-band filter + scoring/ranking logic.
- `src/main.ts`: slider UI and rendering logic.
- `src/style.css`: visual styling.
- `src/lib/recommendations.test.ts`: ranking and filter tests.
