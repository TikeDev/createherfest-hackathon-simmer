import { useState, useCallback } from "react";
import { runRecipeAgent } from "@/agent/recipeAgent";
import { fetchRecipeFromUrl } from "@/agent/fetcher";
import { saveRecipe } from "@/storage/recipes";
import { classifyGroceries } from "@/agent/classifyGroceries";
import { toFriendlyError } from "@/lib/errors";
import type { FriendlyError } from "@/lib/errors";
import type { RecipeJSON } from "@/types/recipe";
import type { ExtractionStatus, ExtractionProgress } from "@/types/agent";

interface UseRecipeExtractionReturn {
  status: ExtractionStatus;
  progress: ExtractionProgress;
  result: RecipeJSON | null;
  error: FriendlyError | null;
  run: (input: { type: "url"; value: string } | { type: "text"; value: string }) => Promise<void>;
  reset: () => void;
}

const STEP_LABELS = {
  fetching: "Scraping recipe...",
  extracting: "Extracting recipe with AI...",
  classifying: "Organizing groceries by aisle...",
  saving: "Saving recipe...",
  done: "Done!",
};

const TOOL_LABELS: Record<string, string> = {
  extract_preamble: "Pulling out tips and notes...",
  parse_ingredients: "Reading the ingredient list...",
  extract_steps: "Reading the instructions...",
  convert_volume_to_weight: "Converting measurements...",
  convert_weight_to_volume: "Converting measurements...",
};

function friendlyAgentProgress(rawStep: string): string {
  if (import.meta.env.DEV) return rawStep;

  if (rawStep.includes("Calling model...")) return "Reading through the recipe...";
  if (rawStep.includes("Model stopped.")) return "Double-checking the recipe...";
  if (rawStep.includes("Parsing final recipe JSON...")) return "Almost done...";

  const toolMatch = rawStep.match(/(?:Tool: |✓ )(\w+)/);
  if (toolMatch) return TOOL_LABELS[toolMatch[1]] ?? "Working on it...";

  return "Working on it...";
}

export function useRecipeExtraction(): UseRecipeExtractionReturn {
  const [status, setStatus] = useState<ExtractionStatus>("idle");
  const [progress, setProgress] = useState<ExtractionProgress>({ step: "", completed: [] });
  const [result, setResult] = useState<RecipeJSON | null>(null);
  const [error, setError] = useState<FriendlyError | null>(null);

  const advanceStep = useCallback((step: string) => {
    setProgress((prev) => ({
      step,
      completed: prev.step ? [...prev.completed, prev.step] : prev.completed,
    }));
  }, []);

  const run = useCallback(
    async (input: { type: "url"; value: string } | { type: "text"; value: string }) => {
      setStatus("idle");
      setProgress({ step: "", completed: [] });
      setResult(null);
      setError(null);

      try {
        let recipeText: string;
        let sourceUrl: string | undefined;
        let titleHint: string | undefined;

        if (input.type === "url") {
          setStatus("fetching");
          advanceStep(STEP_LABELS.fetching);
          const fetched = await fetchRecipeFromUrl(input.value);
          recipeText = JSON.stringify(fetched.scrapedRecipe, null, 2);
          sourceUrl = input.value;
          titleHint = fetched.title;
        } else {
          recipeText = input.value;
        }

        setStatus("extracting");
        advanceStep(STEP_LABELS.extracting);

        const recipe = await runRecipeAgent({
          recipeText,
          sourceUrl,
          onProgress: (step) => {
            setProgress((prev) => ({ ...prev, step: friendlyAgentProgress(step) }));
          },
        });

        // If a URL was fetched and the model didn't extract a title, use the page title
        let finalRecipe: RecipeJSON =
          !recipe.title && titleHint ? { ...recipe, title: titleHint } : recipe;

        // Classify groceries and populate ingredient categories
        setStatus("extracting");
        advanceStep(STEP_LABELS.classifying);

        try {
          const categories = await classifyGroceries(finalRecipe.ingredients);
          finalRecipe = {
            ...finalRecipe,
            ingredients: finalRecipe.ingredients.map((ing) => ({
              ...ing,
              category: categories[ing.id] || "Other",
            })),
          };
        } catch (classifyError) {
          console.warn("Failed to classify groceries during import:", classifyError);
          // Continue without categories - they'll be classified on-demand in cooking mode
        }

        setStatus("saving");
        advanceStep(STEP_LABELS.saving);
        await saveRecipe(finalRecipe);

        setStatus("done");
        advanceStep(STEP_LABELS.done);
        setResult(finalRecipe);
      } catch (err) {
        setError(toFriendlyError(err));
        setStatus("error");
      }
    },
    [advanceStep]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress({ step: "", completed: [] });
    setResult(null);
    setError(null);
  }, []);

  return { status, progress, result, error, run, reset };
}
