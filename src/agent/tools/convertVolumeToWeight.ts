import { lookupDensity, volumeToCups } from '@/lib/densityTable'
import type { UnitEntry } from '@/types/recipe'

export interface ConvertVolumeToWeightArgs {
  ingredientName: string
  quantity: number
  unit: string
}

export function convertVolumeToWeight(args: ConvertVolumeToWeightArgs): UnitEntry {
  const { ingredientName, quantity, unit } = args
  const original = `${quantity} ${unit}`
  const unitKey = unit.toLowerCase().trim()
  const cupsConversion = volumeToCups[unitKey]

  if (cupsConversion === undefined) {
    return {
      original,
      confidenceLevel: 'unknown',
      explanation: `Unit "${unit}" not recognized for volume-to-weight conversion.`,
    }
  }

  const density = lookupDensity(ingredientName)

  if (!density) {
    return {
      original,
      confidenceLevel: 'unknown',
      explanation: `No density data available for "${ingredientName}".`,
    }
  }

  const cups = quantity * cupsConversion
  const grams = Math.round(cups * density.gramsPerCup)

  return {
    original,
    grams,
    densitySource: density.source,
    confidenceLevel: density.confidence,
  }
}
