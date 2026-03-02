import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllRecipes } from '@/storage/recipes'
import type { RecipeJSON } from '@/types/recipe'

export default function Home() {
  const [recipes, setRecipes] = useState<RecipeJSON[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllRecipes()
      .then(setRecipes)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Recipes</h1>
        <Link
          to="/extract"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
        >
          + Add Recipe
        </Link>
      </div>

      {loading && (
        <p className="text-sm text-gray-500" role="status">
          Loading recipes...
        </p>
      )}

      {!loading && recipes.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center space-y-3">
          <p className="text-gray-500 text-sm">No recipes yet.</p>
          <Link
            to="/extract"
            className="inline-block text-sm text-emerald-600 font-medium underline hover:text-emerald-700"
          >
            Add your first recipe
          </Link>
        </div>
      )}

      {!loading && recipes.length > 0 && (
        <ul className="space-y-3">
          {recipes.map((recipe) => {
            const savedDate = new Date(recipe.extractedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })
            return (
              <li key={recipe.id}>
                <Link
                  to={`/recipe/${recipe.id}`}
                  className="block rounded-lg border border-gray-200 bg-white px-4 py-4 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-medium text-gray-900 text-sm leading-snug">
                      {recipe.title}
                    </h2>
                    <span className="flex-shrink-0 text-xs text-gray-400">{savedDate}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                    {recipe.sourceDomain && <span>{recipe.sourceDomain}</span>}
                    {recipe.metadata.totalTimeMinutes && (
                      <span>{recipe.metadata.totalTimeMinutes} min</span>
                    )}
                    {recipe.metadata.servings && <span>Serves {recipe.metadata.servings}</span>}
                    <span>{recipe.ingredients.length} ingredients</span>
                    <span>{recipe.steps.length} steps</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
