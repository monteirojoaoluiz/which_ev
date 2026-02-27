import './style.css'
import { EV_DATABASE } from './data/evs'
import { rankVehicles, type Recommendation } from './lib/recommendations'

const PRICE_MIN = 25_000
const PRICE_MAX = 60_000
const PRICE_STEP = 500
const DEFAULT_PRICE = 35_000

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root not found')
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const decimal = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const renderVehicleCard = (recommendation: Recommendation, rank: number): string => {
  const { vehicle, metrics } = recommendation

  return `
    <article class="vehicle-card">
      <header class="vehicle-card__header">
        <p class="vehicle-card__rank">#${rank + 1}</p>
        <h3>${vehicle.name}</h3>
      </header>
      <dl>
        <div>
          <dt>MSRP</dt>
          <dd>${money.format(vehicle.msrpUsd)}</dd>
        </div>
        <div>
          <dt>One-stop range</dt>
          <dd>${vehicle.oneStopRangeMiles} mi</dd>
        </div>
        <div>
          <dt>Cargo</dt>
          <dd>${decimal.format(vehicle.cargoCuFt)} cu ft</dd>
        </div>
        <div>
          <dt>Charge (15m)</dt>
          <dd>+${vehicle.chargeMilesIn15Min} mi</dd>
        </div>
      </dl>
      <div class="vehicle-card__scores">
        <p>Cost per one-stop mile: <strong>${money.format(metrics.costPerOneStopMile)}</strong></p>
        <p>Cargo + range score: <strong>${decimal.format(metrics.cargoRangeScore)}</strong></p>
        <p>Road-trip balance score: <strong>${decimal.format(metrics.roadTripBalanceScore)}</strong></p>
        <p>Overall score: <strong>${decimal.format(metrics.overallScore)}</strong></p>
      </div>
    </article>
  `
}

app.innerHTML = `
  <main class="page-shell">
    <section class="hero">
      <p class="hero__eyebrow">EV shortlist engine</p>
      <h1>Pick a price, get the best 3 EVs in that window.</h1>
      <p>
        Drag the slider to choose your target MSRP. We automatically search
        <strong>$5,000 below and $5,000 above</strong>, then rank by value, utility,
        and road-trip balance.
      </p>
    </section>

    <section class="controls">
      <label for="price-range" class="controls__label">Target MSRP</label>
      <div class="controls__numbers">
        <p id="target-price" class="target-price"></p>
        <p id="price-window" class="price-window"></p>
      </div>
      <input
        id="price-range"
        name="price-range"
        type="range"
        min="${PRICE_MIN}"
        max="${PRICE_MAX}"
        step="${PRICE_STEP}"
        value="${DEFAULT_PRICE}"
      />
      <p id="match-count" class="match-count"></p>
    </section>

    <section class="leaders" aria-live="polite">
      <article>
        <h2>Metric 1: Value</h2>
        <p>Lowest cost per one-stop mile.</p>
        <p id="leader-value" class="leaders__name"></p>
      </article>
      <article>
        <h2>Metric 2: Utility</h2>
        <p>Blend of cargo space and one-stop range.</p>
        <p id="leader-cargo-range" class="leaders__name"></p>
      </article>
      <article>
        <h2>Metric 3: Road Trip</h2>
        <p>Blend of one-stop range, charge speed, and price value.</p>
        <p id="leader-road-trip" class="leaders__name"></p>
      </article>
    </section>

    <section>
      <h2 class="top-three-heading">Top 3 in your band</h2>
      <div id="vehicle-results" class="vehicle-grid"></div>
    </section>
  </main>
`

const priceRangeInput = document.querySelector<HTMLInputElement>('#price-range')
const targetPriceEl = document.querySelector<HTMLParagraphElement>('#target-price')
const priceWindowEl = document.querySelector<HTMLParagraphElement>('#price-window')
const matchCountEl = document.querySelector<HTMLParagraphElement>('#match-count')
const valueLeaderEl = document.querySelector<HTMLParagraphElement>('#leader-value')
const cargoRangeLeaderEl = document.querySelector<HTMLParagraphElement>('#leader-cargo-range')
const roadTripLeaderEl = document.querySelector<HTMLParagraphElement>('#leader-road-trip')
const resultsEl = document.querySelector<HTMLDivElement>('#vehicle-results')

if (
  !priceRangeInput ||
  !targetPriceEl ||
  !priceWindowEl ||
  !matchCountEl ||
  !valueLeaderEl ||
  !cargoRangeLeaderEl ||
  !roadTripLeaderEl ||
  !resultsEl
) {
  throw new Error('Missing one or more required DOM nodes')
}

const updateView = (): void => {
  const selectedPrice = Number(priceRangeInput.value)
  const results = rankVehicles(EV_DATABASE, selectedPrice)

  targetPriceEl.textContent = money.format(selectedPrice)
  priceWindowEl.textContent = `${money.format(results.priceFloor)} to ${money.format(results.priceCeiling)}`
  matchCountEl.textContent = `${results.eligibleVehicles.length} vehicles in range`

  valueLeaderEl.textContent = results.metricLeaders.valueLeader
    ? `${results.metricLeaders.valueLeader.vehicle.name} · ${money.format(results.metricLeaders.valueLeader.metrics.costPerOneStopMile)}/mi`
    : 'No match in this band'

  cargoRangeLeaderEl.textContent = results.metricLeaders.cargoRangeLeader
    ? `${results.metricLeaders.cargoRangeLeader.vehicle.name} · ${decimal.format(results.metricLeaders.cargoRangeLeader.metrics.cargoRangeScore)} score`
    : 'No match in this band'

  roadTripLeaderEl.textContent = results.metricLeaders.roadTripLeader
    ? `${results.metricLeaders.roadTripLeader.vehicle.name} · ${decimal.format(results.metricLeaders.roadTripLeader.metrics.roadTripBalanceScore)} score`
    : 'No match in this band'

  if (results.topThree.length === 0) {
    resultsEl.innerHTML = `
      <article class="vehicle-card vehicle-card--empty">
        <h3>No vehicles in this price window</h3>
        <p>Try a higher or lower target MSRP to expand the shortlist.</p>
      </article>
    `
    return
  }

  resultsEl.innerHTML = results.topThree
    .map((recommendation, index) => renderVehicleCard(recommendation, index))
    .join('')
}

priceRangeInput.addEventListener('input', updateView)

updateView()
