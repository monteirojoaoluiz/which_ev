# which_ev agent notes

## Runtime/tooling
- Use `bun` for project scripts and package management.
- `uv` and `brew` are available in this environment.

## Product behavior
- A single MSRP slider sets the target price.
- Filtering uses a fixed `+/- $5,000` band around that target.
- Output is the top 3 EVs inside the filtered band.

## EV data shape
Each EV record should include:
- `id`: string
- `name`: string
- `msrpUsd`: number
- `rangeMiles`: number
- `oneStopRangeMiles`: number (trip distance with one charging stop)
- `cargoCuFt`: number
- `chargeMilesIn15Min`: number
- `driveType`: `FWD` | `RWD` | `AWD`

## Ranking formulas
1. Metric 1 (Value): `costPerOneStopMile = msrpUsd / oneStopRangeMiles` (lower is better).
2. Metric 2 (Utility): weighted blend of normalized one-stop range and normalized cargo.
3. Metric 3 (Road Trip): weighted blend of normalized one-stop range, normalized charge speed, and inverse-normalized price.
4. Overall score for top 3: weighted blend of Metric 1 value signal, Metric 2, and Metric 3.

## Deployment
- Static hosting target: GitHub Pages.
- Vite config uses `base: './'` to support Pages project URLs.
- CI workflow file: `.github/workflows/deploy-pages.yml`.
- Pages deploys from `main` via GitHub Actions (build artifact from `dist/`).

## Current source map
- `src/data/evs.ts`: EV seed dataset + type definition.
- `src/lib/recommendations.ts`: price-band filter + scoring/ranking logic.
- `src/main.ts`: slider UI and rendering logic.
- `src/style.css`: visual styling.
- `src/lib/recommendations.test.ts`: ranking and filter tests.
