import type { ExtractionStatus, ExtractionProgress } from "@/types/agent";
import type { FriendlyError } from "@/lib/errors";
import { Icon } from "@/components/ui/icon";
import { Check } from "lucide-react";

interface ExtractionProgressProps {
  status: ExtractionStatus;
  progress: ExtractionProgress;
  error: FriendlyError | null;
}

export function ExtractionProgressDisplay({ status, progress, error }: ExtractionProgressProps) {
  if (status === "idle") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Extraction progress"
      className="rounded-lg border border-mist-pale bg-surface p-4 space-y-3"
    >
      <h2 className="text-sm font-semibold text-forest">
        {status === "error" ? "No worries, let's try that again." : "Simmer is thinking..."}
      </h2>

      <ul className="space-y-2">
        {progress.completed.map((step) => (
          <li key={step} className="flex items-center gap-2 text-sm text-forest/60">
            <Icon icon={Check} size="sm" decorative className="text-sage" />
            {step}
          </li>
        ))}

        {status !== "done" && status !== "error" && progress.step && (
          <li className="flex items-center gap-2 text-sm text-forest font-medium">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-full border-2 border-sage border-t-transparent animate-spin"
            />
            {progress.step}
          </li>
        )}
      </ul>

      {/* No role="alert" here: the container is already an aria-live region,
          and nesting an assertive region inside a polite one is undefined
          across screen readers. */}
      {status === "error" && error && (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-[#B85C00]">{error.friendly}</p>

          {error.technical && (
            <details className="text-xs text-forest/60">
              <summary className="cursor-pointer select-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage">
                Technical details
              </summary>
              {/* break-all, not break-words: the upstream text can be one
                  unbroken token with no break opportunities. */}
              <p className="mt-1 font-mono break-all whitespace-pre-wrap text-forest/70">
                {error.technical}
              </p>
            </details>
          )}
        </div>
      )}

      {status === "done" && (
        <p className="text-sm text-sage font-medium">Nice work. That recipe is saved.</p>
      )}
    </div>
  );
}
