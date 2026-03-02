import type { ExtractionStatus, ExtractionProgress } from '@/types/agent'

interface ExtractionProgressProps {
  status: ExtractionStatus
  progress: ExtractionProgress
  error: string | null
}

export function ExtractionProgressDisplay({ status, progress, error }: ExtractionProgressProps) {
  if (status === 'idle') return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Extraction progress"
      className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3"
    >
      <h2 className="text-sm font-semibold text-gray-700">
        {status === 'error' ? 'Extraction failed' : 'Extracting recipe...'}
      </h2>

      <ul className="space-y-2">
        {progress.completed.map((step) => (
          <li key={step} className="flex items-center gap-2 text-sm text-gray-500">
            <span aria-hidden="true" className="text-emerald-500">✓</span>
            {step}
          </li>
        ))}

        {status !== 'done' && status !== 'error' && progress.step && (
          <li className="flex items-center gap-2 text-sm text-gray-900 font-medium">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"
            />
            {progress.step}
          </li>
        )}
      </ul>

      {status === 'error' && error && (
        <p role="alert" className="text-sm text-red-600 mt-2">
          {error}
        </p>
      )}

      {status === 'done' && (
        <p className="text-sm text-emerald-700 font-medium">Recipe saved successfully.</p>
      )}
    </div>
  )
}
