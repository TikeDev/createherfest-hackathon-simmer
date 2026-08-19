import { useEffect } from "react";

/**
 * Updates document.title on mount and when the title changes.
 * Appends " | Simmer" suffix for brand consistency.
 *
 * @example useDocumentTitle('My Recipes')  // => "My Recipes | Simmer"
 * @example useDocumentTitle('Simmer')       // => "Simmer" (no suffix duplication)
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const fullTitle = title === "Simmer" ? "Simmer" : `${title} | Simmer`;
    document.title = fullTitle;
  }, [title]);
}
