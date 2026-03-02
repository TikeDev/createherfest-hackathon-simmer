// Density table: grams per 1 cup (240ml) for common ingredients.
// Source: USDA and standard culinary references.
// Used for both volume→weight and weight→volume conversions.

export interface DensityEntry {
  gramsPerCup: number
  source: 'USDA' | 'culinary-standard' | 'estimated'
  confidence: 'high' | 'medium' | 'low'
}

export const densityTable: Record<string, DensityEntry> = {
  // Flours
  'all-purpose flour': { gramsPerCup: 120, source: 'USDA', confidence: 'high' },
  'bread flour': { gramsPerCup: 127, source: 'USDA', confidence: 'high' },
  'whole wheat flour': { gramsPerCup: 120, source: 'USDA', confidence: 'high' },
  'cake flour': { gramsPerCup: 100, source: 'culinary-standard', confidence: 'high' },
  'almond flour': { gramsPerCup: 96, source: 'culinary-standard', confidence: 'medium' },
  'oat flour': { gramsPerCup: 92, source: 'culinary-standard', confidence: 'medium' },
  'rice flour': { gramsPerCup: 158, source: 'USDA', confidence: 'high' },
  'cornstarch': { gramsPerCup: 128, source: 'USDA', confidence: 'high' },
  'cornmeal': { gramsPerCup: 138, source: 'USDA', confidence: 'high' },

  // Sugars & sweeteners
  'granulated sugar': { gramsPerCup: 200, source: 'USDA', confidence: 'high' },
  'powdered sugar': { gramsPerCup: 120, source: 'culinary-standard', confidence: 'high' },
  'brown sugar': { gramsPerCup: 220, source: 'USDA', confidence: 'high' },
  'honey': { gramsPerCup: 340, source: 'USDA', confidence: 'high' },
  'maple syrup': { gramsPerCup: 322, source: 'USDA', confidence: 'high' },
  'molasses': { gramsPerCup: 328, source: 'USDA', confidence: 'high' },

  // Fats & oils
  'butter': { gramsPerCup: 227, source: 'USDA', confidence: 'high' },
  'vegetable oil': { gramsPerCup: 218, source: 'USDA', confidence: 'high' },
  'olive oil': { gramsPerCup: 216, source: 'USDA', confidence: 'high' },
  'coconut oil': { gramsPerCup: 218, source: 'culinary-standard', confidence: 'medium' },

  // Dairy
  'milk': { gramsPerCup: 244, source: 'USDA', confidence: 'high' },
  'heavy cream': { gramsPerCup: 238, source: 'USDA', confidence: 'high' },
  'sour cream': { gramsPerCup: 230, source: 'USDA', confidence: 'high' },
  'yogurt': { gramsPerCup: 245, source: 'USDA', confidence: 'high' },
  'cream cheese': { gramsPerCup: 232, source: 'USDA', confidence: 'high' },

  // Grains & legumes
  'rolled oats': { gramsPerCup: 90, source: 'USDA', confidence: 'high' },
  'rice': { gramsPerCup: 185, source: 'USDA', confidence: 'high' },
  'quinoa': { gramsPerCup: 170, source: 'culinary-standard', confidence: 'medium' },
  'lentils': { gramsPerCup: 192, source: 'USDA', confidence: 'high' },
  'chickpeas': { gramsPerCup: 200, source: 'culinary-standard', confidence: 'medium' },

  // Nuts & seeds
  'walnuts': { gramsPerCup: 117, source: 'USDA', confidence: 'high' },
  'almonds': { gramsPerCup: 143, source: 'USDA', confidence: 'high' },
  'peanut butter': { gramsPerCup: 258, source: 'USDA', confidence: 'high' },
  'tahini': { gramsPerCup: 240, source: 'culinary-standard', confidence: 'medium' },
  'sesame seeds': { gramsPerCup: 144, source: 'USDA', confidence: 'high' },

  // Liquids
  'water': { gramsPerCup: 240, source: 'USDA', confidence: 'high' },
  'broth': { gramsPerCup: 240, source: 'culinary-standard', confidence: 'high' },
  'soy sauce': { gramsPerCup: 255, source: 'USDA', confidence: 'high' },
  'vinegar': { gramsPerCup: 240, source: 'culinary-standard', confidence: 'high' },
  'lemon juice': { gramsPerCup: 244, source: 'USDA', confidence: 'high' },

  // Cocoa & chocolate
  'cocoa powder': { gramsPerCup: 85, source: 'USDA', confidence: 'high' },
  'chocolate chips': { gramsPerCup: 170, source: 'culinary-standard', confidence: 'medium' },
}

// Volume conversions to cups (all values relative to 1 cup = 240ml)
export const volumeToCups: Record<string, number> = {
  cup: 1,
  cups: 1,
  tablespoon: 1 / 16,
  tablespoons: 1 / 16,
  tbsp: 1 / 16,
  teaspoon: 1 / 48,
  teaspoons: 1 / 48,
  tsp: 1 / 48,
  'fluid ounce': 1 / 8,
  'fluid ounces': 1 / 8,
  'fl oz': 1 / 8,
  pint: 2,
  pints: 2,
  quart: 4,
  quarts: 4,
  gallon: 16,
  gallons: 16,
  ml: 1 / 240,
  milliliter: 1 / 240,
  milliliters: 1 / 240,
  liter: 240 / 240, // 1L = ~4.17 cups but we store as cups factor
  liters: 1000 / 240,
}

export function lookupDensity(ingredientName: string): DensityEntry | null {
  const normalized = ingredientName.toLowerCase().trim()
  if (densityTable[normalized]) return densityTable[normalized]

  // Partial match fallback — try if any key is contained in the name
  for (const key of Object.keys(densityTable)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { ...densityTable[key], confidence: 'low' }
    }
  }

  return null
}
