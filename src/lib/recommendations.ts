import type { ElectricVehicle } from '../data/evs'

export const PRICE_WINDOW_EUR = 5_000

export interface VehicleMetrics {
  costPerOneStopKm: number
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
  priceFloor: Math.max(0, targetPrice - PRICE_WINDOW_EUR),
  priceCeiling: targetPrice + PRICE_WINDOW_EUR,
})

export const filterByPriceBand = (
  vehicles: ElectricVehicle[],
  targetPrice: number,
): ElectricVehicle[] => {
  const { priceFloor, priceCeiling } = getPriceBand(targetPrice)

  return vehicles.filter(
    (vehicle) => vehicle.priceEur >= priceFloor && vehicle.priceEur <= priceCeiling,
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
    vehicle.priceEur / vehicle.oneStopRangeKm,
  )
  const cargoValues = eligibleVehicles.map((vehicle) => vehicle.cargoLiters)
  const oneStopRangeValues = eligibleVehicles.map((vehicle) => vehicle.oneStopRangeKm)
  const chargeSpeedValues = eligibleVehicles.map((vehicle) => vehicle.fastChargeKw)
  const priceValues = eligibleVehicles.map((vehicle) => vehicle.priceEur)

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
    const costPerOneStopKm = vehicle.priceEur / vehicle.oneStopRangeKm
    const normalizedCost = normalizeInverse(costPerOneStopKm, costMin, costMax)
    const normalizedCargo = normalize(vehicle.cargoLiters, cargoMin, cargoMax)
    const normalizedRange = normalize(vehicle.oneStopRangeKm, oneStopRangeMin, oneStopRangeMax)
    const normalizedChargeSpeed = normalize(vehicle.fastChargeKw, chargeSpeedMin, chargeSpeedMax)
    const normalizedPriceValue = normalizeInverse(vehicle.priceEur, priceMin, priceMax)

    const cargoRangeScore = normalizedRange * 0.55 + normalizedCargo * 0.45
    const roadTripBalanceScore =
      normalizedRange * 0.45 + normalizedChargeSpeed * 0.35 + normalizedPriceValue * 0.2

    const overallScore = normalizedCost * 0.5 + cargoRangeScore * 0.3 + roadTripBalanceScore * 0.2

    return {
      vehicle,
      metrics: {
        costPerOneStopKm,
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
    (first, second) => first.metrics.costPerOneStopKm - second.metrics.costPerOneStopKm,
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
