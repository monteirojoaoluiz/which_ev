import { describe, expect, it } from 'bun:test'
import type { ElectricVehicle } from '../data/evs'
import { filterByPriceBand, getPriceBand, rankVehicles } from './recommendations'

const TEST_DATA: ElectricVehicle[] = [
  {
    id: 'a',
    name: 'A',
    imageUrl: 'https://example.com/a.jpg',
    priceEur: 30_000,
    rangeKm: 360,
    oneStopRangeKm: 640,
    cargoLiters: 520,
    fastChargeKw: 120,
    driveType: 'FWD',
    sourceUrl: 'https://example.com/a',
  },
  {
    id: 'b',
    name: 'B',
    imageUrl: 'https://example.com/b.jpg',
    priceEur: 35_000,
    rangeKm: 430,
    oneStopRangeKm: 760,
    cargoLiters: 500,
    fastChargeKw: 180,
    driveType: 'RWD',
    sourceUrl: 'https://example.com/b',
  },
  {
    id: 'c',
    name: 'C',
    imageUrl: 'https://example.com/c.jpg',
    priceEur: 40_000,
    rangeKm: 450,
    oneStopRangeKm: 790,
    cargoLiters: 430,
    fastChargeKw: 160,
    driveType: 'AWD',
    sourceUrl: 'https://example.com/c',
  },
  {
    id: 'd',
    name: 'D',
    imageUrl: 'https://example.com/d.jpg',
    priceEur: 46_000,
    rangeKm: 500,
    oneStopRangeKm: 840,
    cargoLiters: 650,
    fastChargeKw: 150,
    driveType: 'AWD',
    sourceUrl: 'https://example.com/d',
  },
]

describe('pricing window', () => {
  it('returns +/- €5,000 around the target', () => {
    const band = getPriceBand(35_000)

    expect(band.priceFloor).toBe(30_000)
    expect(band.priceCeiling).toBe(40_000)
  })

  it('includes both floor and ceiling values', () => {
    const filtered = filterByPriceBand(TEST_DATA, 35_000)

    expect(filtered.map((vehicle) => vehicle.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('rankVehicles', () => {
  it('returns metric leaders and top-three list', () => {
    const ranked = rankVehicles(TEST_DATA, 35_000)

    expect(ranked.eligibleVehicles).toHaveLength(3)
    expect(ranked.topThree).toHaveLength(3)
    expect(ranked.metricLeaders.valueLeader?.vehicle.id).toBe('b')
    expect(ranked.metricLeaders.cargoRangeLeader?.vehicle.id).toBe('b')
    expect(ranked.metricLeaders.roadTripLeader?.vehicle.id).toBe('b')

    for (const entry of ranked.topThree) {
      expect(entry.metrics.cargoRangeScore).toBeGreaterThanOrEqual(0)
      expect(entry.metrics.cargoRangeScore).toBeLessThanOrEqual(100)
      expect(entry.metrics.roadTripBalanceScore).toBeGreaterThanOrEqual(0)
      expect(entry.metrics.roadTripBalanceScore).toBeLessThanOrEqual(100)
      expect(entry.metrics.overallScore).toBeGreaterThanOrEqual(0)
      expect(entry.metrics.overallScore).toBeLessThanOrEqual(100)
    }
  })

  it('returns empty results when no vehicles match the price band', () => {
    const ranked = rankVehicles(TEST_DATA, 10_000)

    expect(ranked.eligibleVehicles).toHaveLength(0)
    expect(ranked.topThree).toHaveLength(0)
    expect(ranked.metricLeaders.valueLeader).toBeNull()
    expect(ranked.metricLeaders.cargoRangeLeader).toBeNull()
    expect(ranked.metricLeaders.roadTripLeader).toBeNull()
  })
})
