import { Readability } from '@mozilla/readability'

export interface FetchedRecipe {
  text: string
  title: string
  sourceDomain: string
}

/**
 * Fetches a recipe URL via the Vercel serverless proxy (to bypass CORS),
 * then extracts the article body with @mozilla/readability.
 */
export async function fetchRecipeFromUrl(url: string): Promise<FetchedRecipe> {
  const apiBase = import.meta.env.VITE_API_BASE ?? ''
  const proxyUrl = `${apiBase}/api/fetch-recipe?url=${encodeURIComponent(url)}`
  const response = await fetch(proxyUrl)

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      (body as { error?: string }).error ?? `Failed to fetch recipe: ${response.status}`,
    )
  }

  const html = await response.text()
  const sourceDomain = new URL(url).hostname.replace(/^www\./, '')

  // Parse HTML in a virtual document so Readability can extract the article
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Fix relative URLs so Readability doesn't complain
  const base = doc.createElement('base')
  base.href = url
  doc.head.prepend(base)

  const reader = new Readability(doc)
  const article = reader.parse()

  if (!article) {
    throw new Error(
      'Could not extract recipe content from this page. Try pasting the recipe text directly.',
    )
  }

  // Strip remaining HTML tags from the extracted content
  const textContent = (article.textContent ?? '').replace(/\s{3,}/g, '\n\n').trim()

  return {
    text: textContent,
    title: article.title || sourceDomain,
    sourceDomain,
  }
}
