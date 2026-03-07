import { useState } from 'react'
import type { Ingredient } from '@/types/recipe'
import { Button } from '@/components/ui/button'

type UnitMode = 'original' | 'metric' | 'volume'

interface IngredientListProps {
  ingredients: Ingredient[]
}

function formatUnit(ingredient: Ingredient, mode: UnitMode): string {
  if (mode === 'original' || ingredient.units.length === 0) {
    return ingredient.raw
  }

  // Find the appropriate unit entry based on mode
  if (mode === 'metric') {
    const gramsEntry = ingredient.units.find(entry => entry.grams != null)
    if (gramsEntry) {
      const confidence = gramsEntry.confidenceLevel !== 'high' ? ` (~)` : ''
      return `${gramsEntry.grams}g${confidence} ${ingredient.name}`
    }
  }

  if (mode === 'volume') {
    const volumeEntry = ingredient.units.find(entry => entry.mlEquivalent != null)
    if (volumeEntry) {
      const confidence = volumeEntry.confidenceLevel !== 'high' ? ` (~)` : ''
      return `${volumeEntry.explanation ?? `${volumeEntry.mlEquivalent}ml`}${confidence} ${ingredient.name}`
    }
  }

  return ingredient.raw
}

export function IngredientList({ ingredients }: IngredientListProps) {
  const [unitMode, setUnitMode] = useState<UnitMode>('original')
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set())

  function toggleSubs(id: string) {
    setExpandedSubs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section aria-labelledby="ingredients-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="ingredients-heading" className="text-lg font-headline text-forest">
          Ingredients
        </h2>

        {/* Unit toggle */}
        <div role="group" aria-label="Unit display mode" className="flex gap-1 text-xs">
          {(['original', 'metric', 'volume'] as UnitMode[]).map((mode) => (
            <Button
              key={mode}
              type="button"
              variant={unitMode === mode ? 'default' : 'outline'}
              size="xs"
              onClick={() => setUnitMode(mode)}
              aria-pressed={unitMode === mode}
            >
              {mode === 'original' ? 'As written' : mode === 'metric' ? 'Grams' : 'No scale'}
            </Button>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {ingredients.map((ingredient) => (
          <li key={ingredient.id} className="text-sm text-forest">
            <div className="flex items-start justify-between gap-2">
              <span>{formatUnit(ingredient, unitMode)}</span>

              {ingredient.substitutions && ingredient.substitutions.length > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => toggleSubs(ingredient.id)}
                  aria-expanded={expandedSubs.has(ingredient.id)}
                  className="flex-shrink-0 bg-amber-100 text-amber-800 hover:bg-amber-200"
                >
                  {expandedSubs.has(ingredient.id) ? 'Hide subs' : 'Substitutions'}
                </Button>
              )}
            </div>

            {ingredient.units[0]?.explanation && (
              <p className="mt-0.5 text-xs text-forest/60 italic">
                {ingredient.units[0].explanation}
              </p>
            )}

            {expandedSubs.has(ingredient.id) && ingredient.substitutions?.map((sub, i) => (
              <div key={i} className="mt-1 ml-3 rounded bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-gray-700">
                <span className="font-medium">{sub.original}</span>
                {' → '}
                <span>{sub.substitute}</span>
                {sub.note && <p className="mt-0.5 text-gray-500">{sub.note}</p>}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </section>
  )
}
