import { randomUUID } from '@/lib/uuid'
import type { Ingredient } from '@/types/recipe'

export interface ParsedIngredientArg {
  raw: string
  name: string
  quantity: number | null
  unit: string | null
  isNonstandard?: boolean
  nonstandardExplanation?: string
}

export interface ParseIngredientsArgs {
  ingredients: ParsedIngredientArg[]
}

export function parseIngredients(args: ParseIngredientsArgs): Ingredient[] {
  return args.ingredients.map((item) => {
    const unitEntry =
      item.unit
        ? [
            {
              original: item.quantity != null ? `${item.quantity} ${item.unit}` : item.unit,
              confidenceLevel: 'high' as const,
              explanation: item.isNonstandard ? item.nonstandardExplanation : undefined,
            },
          ]
        : []

    return {
      id: randomUUID(),
      raw: item.raw,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      units: unitEntry,
      substitutions: [],
      annotations: [],
    }
  })
}
