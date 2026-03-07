import { Link } from 'react-router-dom'
import type { RecipeJSON } from '@/types/recipe'

interface RecipeCardProps {
  recipe: RecipeJSON
  /** Optional reason shown on suggestion cards (e.g. from the LLM) */
  reason?: string
}

export default function RecipeCard({ recipe, reason }: RecipeCardProps) {
  const savedDate = new Date(recipe.extractedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <li>
      <Link
        to={`/recipe/${recipe.id}`}
        className="block rounded-lg border border-mist-pale bg-surface px-4 py-4 hover:border-mist hover:shadow-sm transition-all"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-headline text-forest text-sm leading-snug">
            {recipe.title}
          </h2>
          <span className="flex-shrink-0 text-xs text-forest/50">{savedDate}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-forest/50">
          {recipe.sourceDomain && recipe.sourceDomain !== 'demo' && (
            <span>{recipe.sourceDomain}</span>
          )}
          {recipe.metadata.totalTimeMinutes && (
            <span>{recipe.metadata.totalTimeMinutes} min</span>
          )}
          {recipe.metadata.servings && <span>Serves {recipe.metadata.servings}</span>}
          <span>{recipe.ingredients.length} ingredients</span>
          <span>{recipe.steps.length} steps</span>
        </div>
        {reason && (
          <p className="mt-2 text-xs text-sage font-medium">{reason}</p>
        )}
      </Link>
    </li>
  )
}
