import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const SOURCE_URL = 'https://ev-database.org/nl/'
const OUTPUT_PATH = resolve(process.cwd(), 'src/data/evs.ts')

type DriveType = 'FWD' | 'RWD' | 'AWD' | 'Unknown'

interface ScrapedVehicle {
  id: string
  name: string
  priceEur: number
  rangeKm: number
  oneStopRangeKm: number
  cargoLiters: number
  fastChargeKw: number
  driveType: DriveType
  sourceUrl: string
}

const parseWholeNumber = (input: string): number => {
  const digitsOnly = input.replace(/[^\d]/g, '')
  return Number.parseInt(digitsOnly, 10)
}

const parseDecimalNumber = (input: string): number => {
  const normalized = input.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
  return Number.parseFloat(normalized)
}

const getMatch = (block: string, pattern: RegExp): string | null => {
  const match = block.match(pattern)
  return match ? match[1].trim() : null
}

const detectDriveType = (block: string): DriveType => {
  if (block.includes('Voorwiel aangedreven')) {
    return 'FWD'
  }

  if (block.includes('Achterwiel aangedreven')) {
    return 'RWD'
  }

  if (block.includes('Vierwiel aangedreven')) {
    return 'AWD'
  }

  return 'Unknown'
}

const parseVehicles = (html: string): ScrapedVehicle[] => {
  const listBlocks = html.split('<div class="list-item" data-jplist-item>').slice(1)
  const parsed: ScrapedVehicle[] = []

  for (const block of listBlocks) {
    const availability = getMatch(block, /<div class="availability\s+(\w+)"/)

    if (availability !== 'current') {
      continue
    }

    const id = getMatch(block, /<span class="id hidden">(\d+)<\/span>/)
    const name = getMatch(
      block,
      /class="title">[\s\S]*?<span class="hidden">([^<]+)<\/span><\/a>/,
    )
    const hrefPath = getMatch(block, /<a href="(\/nl\/auto\/\d+\/[^"]+)" class="title">/)
    const priceText = getMatch(block, /<span class="pricefilter hidden">([^<]+)<\/span>/)
    const rangeText = getMatch(block, /<span class="erange_real">([^<]+)<\/span>/)
    const oneStopText = getMatch(block, /<span class="long_distance_total_sort hidden">([^<]+)<\/span>/)
    const cargoText = getMatch(block, /<span class="cargosort hidden">([^<]+)<\/span>/)
    const fastChargeText = getMatch(block, /<span class="fastcharge_speed hidden">([^<]+)<\/span>/)

    if (!id || !name || !hrefPath || !priceText || !rangeText || !oneStopText || !cargoText || !fastChargeText) {
      continue
    }

    const priceEur = parseWholeNumber(priceText)
    const rangeKm = parseWholeNumber(rangeText)
    const oneStopRangeKm = parseWholeNumber(oneStopText)
    const cargoLiters = parseWholeNumber(cargoText)
    const fastChargeKw = parseDecimalNumber(fastChargeText)

    if (
      Number.isNaN(priceEur) ||
      Number.isNaN(rangeKm) ||
      Number.isNaN(oneStopRangeKm) ||
      Number.isNaN(cargoLiters) ||
      Number.isNaN(fastChargeKw)
    ) {
      continue
    }

    parsed.push({
      id,
      name,
      priceEur,
      rangeKm,
      oneStopRangeKm,
      cargoLiters,
      fastChargeKw,
      driveType: detectDriveType(block),
      sourceUrl: `https://ev-database.org${hrefPath}`,
    })
  }

  const deduped = new Map<string, ScrapedVehicle>()

  for (const vehicle of parsed) {
    deduped.set(vehicle.id, vehicle)
  }

  return [...deduped.values()].sort((first, second) => first.priceEur - second.priceEur)
}

const toTsFile = (vehicles: ScrapedVehicle[]): string => {
  const generatedAt = new Date().toISOString()

  return `export type DriveType = 'FWD' | 'RWD' | 'AWD' | 'Unknown'\n\nexport interface ElectricVehicle {\n  id: string\n  name: string\n  priceEur: number\n  rangeKm: number\n  oneStopRangeKm: number\n  cargoLiters: number\n  fastChargeKw: number\n  driveType: DriveType\n  sourceUrl: string\n}\n\n// Data source: ${SOURCE_URL}\n// Locale: Netherlands (nl), current availability only\n// Generated at: ${generatedAt}\nexport const EV_DATABASE: ElectricVehicle[] = ${JSON.stringify(vehicles, null, 2)}\n`
}

const response = await fetch(SOURCE_URL)

if (!response.ok) {
  throw new Error(`Failed to fetch source: ${response.status} ${response.statusText}`)
}

const html = await response.text()
const vehicles = parseVehicles(html)

if (vehicles.length === 0) {
  throw new Error('No vehicles parsed from source')
}

await writeFile(OUTPUT_PATH, toTsFile(vehicles), 'utf8')

console.log(`Saved ${vehicles.length} current Netherlands vehicles to ${OUTPUT_PATH}`)
