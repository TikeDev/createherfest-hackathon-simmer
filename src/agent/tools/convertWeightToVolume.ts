import { lookupDensity } from '@/lib/densityTable'
import type { UnitEntry } from '@/types/recipe'

export interface ConvertWeightToVolumeArgs {
  ingredientName: string
  quantity: number
  unit: string // Expected: "g", "grams", "oz", "ounces", "lb", "pounds"
}

const weightToGrams: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  oz: 28.35,
  ounce: 28.35,
  ounces: 28.35,
  lb: 453.59,
  lbs: 453.59,
  pound: 453.59,
  pounds: 453.59,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
}

function cupsToReadable(cups: number): string {
  if (cups >= 1) {
    const rounded = Math.round(cups * 4) / 4
    return `${rounded} cup${rounded !== 1 ? 's' : ''}`
  }
  const tablespoons = cups * 16
  if (tablespoons >= 1) {
    const rounded = Math.round(tablespoons * 2) / 2
    return `${rounded} tablespoon${rounded !== 1 ? 's' : ''}`
  }
  const teaspoons = cups * 48
  const rounded = Math.round(teaspoons * 2) / 2
  return `${rounded} teaspoon${rounded !== 1 ? 's' : ''}`
}

export function convertWeightToVolume(args: ConvertWeightToVolumeArgs): UnitEntry {
  const { ingredientName, quantity, unit } = args
  const original = `${quantity} ${unit}`
  const unitKey = unit.toLowerCase().trim()
  const gramsConversion = weightToGrams[unitKey]

  if (gramsConversion === undefined) {
    return {
      original,
      confidenceLevel: 'unknown',
      explanation: `Unit "${unit}" not recognized for weight-to-volume conversion.`,
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

  const totalGrams = quantity * gramsConversion
  const cups = totalGrams / density.gramsPerCup
  const mlEquivalent = Math.round(cups * 240)

  return {
    original,
    mlEquivalent,
    densitySource: density.source,
    confidenceLevel: density.confidence,
    explanation: `≈ ${cupsToReadable(cups)} (no scale needed)`,
  }
}
