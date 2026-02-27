import { describe, expect, it } from 'bun:test'
import type { ElectricVehicle } from '../data/evs'
import { filterByPriceBand, getPriceBand, rankVehicles } from './recommendations'

const TEST_DATA: ElectricVehicle[] = [
  {
    id: 'a',
    name: 'A',
    msrpUsd: 30_000,
    rangeMiles: 220,
    oneStopRangeMiles: 420,
    cargoCuFt: 30,
    chargeMilesIn15Min: 100,
    driveType: 'FWD',
  },
  {
    id: 'b',
    name: 'B',
    msrpUsd: 35_000,
    rangeMiles: 260,
    oneStopRangeMiles: 520,
    cargoCuFt: 25,
    chargeMilesIn15Min: 130,
    driveType: 'RWD',
  },
  {
    id: 'c',
    name: 'C',
    msrpUsd: 40_000,
    rangeMiles: 280,
    oneStopRangeMiles: 560,
    cargoCuFt: 20,
    chargeMilesIn15Min: 120,
    driveType: 'AWD',
  },
  {
    id: 'd',
    name: 'D',
    msrpUsd: 46_000,
    rangeMiles: 300,
    oneStopRangeMiles: 600,
    cargoCuFt: 35,
    chargeMilesIn15Min: 110,
    driveType: 'AWD',
  },
]

describe('pricing window', () => {
  it('returns +/- $5,000 around the target', () => {
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
