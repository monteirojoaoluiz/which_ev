import type { ElectricVehicle } from '../data/evs'

export const PRICE_WINDOW_USD = 5_000

export interface VehicleMetrics {
  costPerOneStopMile: number
  cargoRangeScore: number
  roadTripBalanceScore: number
  overallScore: number
}

export interface Recommendation {
  vehicle: ElectricVehicle
  metrics: VehicleMetrics
}

export interface RankedResults {
  priceFloor: number
  priceCeiling: number
  eligibleVehicles: ElectricVehicle[]
  topThree: Recommendation[]
  metricLeaders: {
    valueLeader: Recommendation | null
    cargoRangeLeader: Recommendation | null
    roadTripLeader: Recommendation | null
  }
}

const normalize = (value: number, min: number, max: number): number => {
  if (max === min) {
    return 1
  }

  return (value - min) / (max - min)
}

const normalizeInverse = (value: number, min: number, max: number): number => {
  if (max === min) {
    return 1
  }

  return (max - value) / (max - min)
}

const clampPct = (value: number): number => Math.max(0, Math.min(100, value * 100))

export const getPriceBand = (targetPrice: number): { priceFloor: number; priceCeiling: number } => ({
  priceFloor: Math.max(0, targetPrice - PRICE_WINDOW_USD),
  priceCeiling: targetPrice + PRICE_WINDOW_USD,
})

export const filterByPriceBand = (
  vehicles: ElectricVehicle[],
  targetPrice: number,
): ElectricVehicle[] => {
  const { priceFloor, priceCeiling } = getPriceBand(targetPrice)

  return vehicles.filter(
    (vehicle) => vehicle.msrpUsd >= priceFloor && vehicle.msrpUsd <= priceCeiling,
  )
}

export const rankVehicles = (
  vehicles: ElectricVehicle[],
  targetPrice: number,
): RankedResults => {
  const { priceFloor, priceCeiling } = getPriceBand(targetPrice)
  const eligibleVehicles = filterByPriceBand(vehicles, targetPrice)

  if (eligibleVehicles.length === 0) {
    return {
      priceFloor,
      priceCeiling,
      eligibleVehicles,
      topThree: [],
      metricLeaders: {
        valueLeader: null,
        cargoRangeLeader: null,
        roadTripLeader: null,
      },
    }
  }

  const costPerRangeValues = eligibleVehicles.map((vehicle) =>
    vehicle.msrpUsd / vehicle.oneStopRangeMiles,
  )
  const cargoValues = eligibleVehicles.map((vehicle) => vehicle.cargoCuFt)
  const oneStopRangeValues = eligibleVehicles.map((vehicle) => vehicle.oneStopRangeMiles)
  const chargeSpeedValues = eligibleVehicles.map((vehicle) => vehicle.chargeMilesIn15Min)
  const priceValues = eligibleVehicles.map((vehicle) => vehicle.msrpUsd)

  const costMin = Math.min(...costPerRangeValues)
  const costMax = Math.max(...costPerRangeValues)
  const cargoMin = Math.min(...cargoValues)
  const cargoMax = Math.max(...cargoValues)
  const oneStopRangeMin = Math.min(...oneStopRangeValues)
  const oneStopRangeMax = Math.max(...oneStopRangeValues)
  const chargeSpeedMin = Math.min(...chargeSpeedValues)
  const chargeSpeedMax = Math.max(...chargeSpeedValues)
  const priceMin = Math.min(...priceValues)
  const priceMax = Math.max(...priceValues)

  const scoredVehicles = eligibleVehicles.map((vehicle): Recommendation => {
    const costPerOneStopMile = vehicle.msrpUsd / vehicle.oneStopRangeMiles
    const normalizedCost = normalizeInverse(costPerOneStopMile, costMin, costMax)
    const normalizedCargo = normalize(vehicle.cargoCuFt, cargoMin, cargoMax)
    const normalizedRange = normalize(vehicle.oneStopRangeMiles, oneStopRangeMin, oneStopRangeMax)
    const normalizedChargeSpeed = normalize(
      vehicle.chargeMilesIn15Min,
      chargeSpeedMin,
      chargeSpeedMax,
    )
    const normalizedPriceValue = normalizeInverse(vehicle.msrpUsd, priceMin, priceMax)

    const cargoRangeScore =
      (normalizedRange * 0.55 + normalizedCargo * 0.45)
    const roadTripBalanceScore =
      normalizedRange * 0.45 + normalizedChargeSpeed * 0.35 + normalizedPriceValue * 0.2

    const overallScore =
      normalizedCost * 0.5 + cargoRangeScore * 0.3 + roadTripBalanceScore * 0.2

    return {
      vehicle,
      metrics: {
        costPerOneStopMile,
        cargoRangeScore: clampPct(cargoRangeScore),
        roadTripBalanceScore: clampPct(roadTripBalanceScore),
        overallScore: clampPct(overallScore),
      },
    }
  })

  const topThree = [...scoredVehicles]
    .sort((first, second) => second.metrics.overallScore - first.metrics.overallScore)
    .slice(0, 3)

  const valueLeader = [...scoredVehicles].sort(
    (first, second) => first.metrics.costPerOneStopMile - second.metrics.costPerOneStopMile,
  )[0]

  const cargoRangeLeader = [...scoredVehicles].sort(
    (first, second) => second.metrics.cargoRangeScore - first.metrics.cargoRangeScore,
  )[0]

  const roadTripLeader = [...scoredVehicles].sort(
    (first, second) => second.metrics.roadTripBalanceScore - first.metrics.roadTripBalanceScore,
  )[0]

  return {
    priceFloor,
    priceCeiling,
    eligibleVehicles,
    topThree,
    metricLeaders: {
      valueLeader,
      cargoRangeLeader,
      roadTripLeader,
    },
  }
}
