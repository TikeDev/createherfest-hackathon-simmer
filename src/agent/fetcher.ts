export interface ScrapedRecipe {
  title: string
  ingredients: string[]
  instructions_list: string[]
  yields: string
  total_time: number | null
  prep_time: number | null
  cook_time: number | null
  image: string
  host: string
  language: string
  description: string
}

export interface FetchedRecipe {
  scrapedRecipe: ScrapedRecipe
  title: string
  sourceDomain: string
}

const SCRAPER_ENDPOINT = '/api/scrape-recipe'

function isScrapedRecipe(value: unknown): value is ScrapedRecipe {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { ingredients?: unknown }).ingredients) &&
    Array.isArray((value as { instructions_list?: unknown }).instructions_list)
  )
}

/**
 * Fetches and parses a recipe URL via the Python scraper Vercel function.
 * Returns structured JSON from recipe-scrapers instead of raw HTML text.
 */
export async function fetchRecipeFromUrl(url: string): Promise<FetchedRecipe> {
  const apiBase = import.meta.env.VITE_API_BASE ?? ''
  const endpoint = `${apiBase}${SCRAPER_ENDPOINT}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const text = await response.text()
    let message = `Scraper request failed (${response.status}) at ${endpoint}.`
    try {
      const json = JSON.parse(text) as { error?: string }
      if (typeof json.error === 'string') message = json.error
    } catch {
      const snippet = text.trim().slice(0, 220)
      if (snippet) message = `${message} ${snippet}`
    }
    throw new Error(message)
  }

  const json: unknown = await response.json()

  if (!isScrapedRecipe(json)) {
    throw new Error('Scraper endpoint returned invalid JSON.')
  }

  const sourceDomain = new URL(url).hostname.replace(/^www\./, '')
  const title = json.title || sourceDomain

  return { scrapedRecipe: json, title, sourceDomain }
}
