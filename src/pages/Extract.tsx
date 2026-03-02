import { useNavigate } from 'react-router-dom'
import { RecipeInput } from '@/components/extraction/RecipeInput'
import { ExtractionProgressDisplay } from '@/components/extraction/ExtractionProgress'
import { useRecipeExtraction } from '@/hooks/useRecipeExtraction'

export default function Extract() {
  const navigate = useNavigate()
  const { status, progress, result, error, run, reset } = useRecipeExtraction()

  // Navigate to recipe detail once extraction is done
  if (status === 'done' && result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-2xl">✓</p>
        <h1 className="text-xl font-semibold text-gray-900">{result.title}</h1>
        <p className="text-sm text-gray-500">Recipe saved successfully.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(`/recipe/${result.id}`)}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            View Recipe
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Add Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add a Recipe</h1>
        <p className="mt-1 text-sm text-gray-500">
          Import from a URL or paste recipe text. The AI will extract and structure it for you.
        </p>
      </div>

      <RecipeInput status={status} onSubmit={run} />

      <ExtractionProgressDisplay status={status} progress={progress} error={error} />
    </div>
  )
}
