import { useState, useEffect, useMemo } from "react";
import { getAllRecipes } from "@/storage/recipes";
import { suggestRecipes, type SuggestedRecipe } from "@/lib/suggestRecipes";
import type { RecipeJSON } from "@/types/recipe";
import type { UserProfile } from "@/types/profile";

/**
 * Returns up to 3 recipe suggestions based on the user's energy level,
 * profile constraints, and optional natural language query.
 *
 * Pass the profile from your existing useProfile() call — this hook does
 * not load the profile itself to avoid double-fetching.
 *
 * Recipes are loaded once from IndexedDB on mount.
 * Suggestions recompute synchronously on query, energyLevel, or profile change.
 *
 * @example
 * const { profile } = useProfile()
 * const { suggestions, loading } = useRecipeSuggestions(query, energyLevel, profile)
 */
export function useRecipeSuggestions(
  query: string,
  energyLevel: 1 | 2 | 3,
  profile: UserProfile | null
) {
  const [recipes, setRecipes] = useState<RecipeJSON[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getAllRecipes().then((all) => {
      setRecipes(all);
      setLoading(false);
    });
  }, []);

  const suggestions: SuggestedRecipe[] = useMemo(
    () => suggestRecipes(query, energyLevel, recipes, profile),
    [query, energyLevel, recipes, profile]
  );

  return { suggestions, loading };
}
