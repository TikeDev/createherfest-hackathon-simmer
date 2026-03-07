/**
 * suggestRecipes.ts
 * ─────────────────────────────────────────────────────────────
 * Pure, deterministic recipe suggestion function.
 *
 * Takes a natural language query, the user's current energy level (1–3),
 * their saved UserProfile, and the full recipe pool — and returns up to 3
 * ranked recipe suggestions.
 *
 * No API calls. Works fully offline.
 *
 * Pipeline
 * ────────
 * 1. Hard filter — allergens (ingredient name matching with keyword expansion)
 * 2. Hard filter — excluded ingredients (ingredient name / raw text matching)
 * 3. Hard filter — tool restrictions (step text matching with keyword expansion)
 * 4. Hard filter — cognitive score must be ≤ energyLevel
 * 5. Soft score  — NL query relevance (title 3pt, ingredient 2pt, preamble 1pt)
 * 6. Soft score  — time preference (penalise recipes significantly over limit)
 * 7. Soft score  — preferred appliances (boost if step text mentions one)
 * 8. Tie-break   — exact cognitiveScore match +0.5pt; simpler recipes rank first
 *
 * Profile fields not yet matchable (no recipe-side data):
 *   dietPattern, budgetLevel, prepAssistPreferences, mobilityLimits,
 *   dexterityLimits — these require recipe-level tags to be added in future.
 * ─────────────────────────────────────────────────────────────
 */

import type { RecipeJSON } from '../types/recipe'
import type { UserProfile } from '../types/profile'

export interface SuggestedRecipe {
  recipe: RecipeJSON
  matchReasons: string[]
}

// ─── Allergen keyword expansion ───────────────────────────────
// Maps FDA allergen names to ingredient keywords that signal their presence.

const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  'milk':      ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'ghee', 'dairy', 'lactose', 'cheddar', 'parmesan', 'mozzarella', 'brie', 'ricotta'],
  'eggs':      ['egg', 'eggs'],
  'fish':      ['fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'sardine', 'anchovy', 'anchovies', 'haddock', 'sea bass'],
  'shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'oyster', 'mussel', 'scallop', 'squid', 'octopus'],
  'tree nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'pine nut', 'brazil nut', 'chestnut'],
  'peanuts':   ['peanut'],
  'wheat':     ['wheat', 'flour', 'bread', 'pasta', 'semolina', 'durum', 'gluten', 'noodle', 'tortilla', 'crouton'],
  'soybeans':  ['soy', 'tofu', 'tempeh', 'edamame', 'miso', 'soybean'],
  'sesame':    ['sesame', 'tahini'],
}

// ─── Tool restriction keyword expansion ───────────────────────
// Maps profile tool restriction labels to keywords found in step text.

const TOOL_KEYWORDS: Record<string, string[]> = {
  'knife':                ['chop', 'dice', 'mince', 'slice', 'julienne', 'trim', 'halve', 'cut into', 'finely cut'],
  'heavy lifting (pots)': ['large pot', 'heavy pot', 'dutch oven', 'cast iron', 'stockpot', 'large saucepan'],
  'stovetop':             ['stovetop', 'over medium', 'over high', 'over low', 'skillet', 'sauté pan', 'frying pan', 'saucepan', 'hob', 'burner'],
  'oven':                 ['oven', 'bake', 'roast', 'broil', 'preheat'],
  'blender':              ['blend', 'blender', 'purée', 'puree', 'immersion blender'],
  'food processor':       ['food processor'],
  'grater':               ['grate', 'grater', 'zest', 'shred'],
  'peeler':               ['peel', 'peeler'],
  'rolling pin':          ['roll out', 'rolling pin'],
  'hand mixer':           ['hand mixer', 'electric mixer'],
  'stand mixer':          ['stand mixer'],
}

// ─── Appliance keywords ────────────────────────────────────────
// Maps preferred appliance labels to step-text keywords.

const APPLIANCE_KEYWORDS: Record<string, string[]> = {
  'slow cooker':         ['slow cooker', 'crockpot', 'crock pot'],
  'air fryer':           ['air fryer', 'air-fryer'],
  'Instant Pot':         ['instant pot', 'pressure cooker'],
  'microwave':           ['microwave'],
  'rice cooker':         ['rice cooker'],
  'toaster oven':        ['toaster oven'],
  'sheet pan (oven only)': ['sheet pan', 'baking sheet', 'sheet tray'],
}

// ─── Stop-words ───────────────────────────────────────────────

const STOPWORDS = new Set([
  'a', 'an', 'the', 'i', 'want', 'something', 'some', 'with', 'and', 'or',
  'for', 'me', 'my', 'to', 'can', 'do', 'have', 'make', 'cook', 'find',
  'please', 'need', 'like', 'using', 'use', 'that', 'is', 'it', 'of',
  'in', 'on', 'at', 'by', 'be', 'are', 'was', 'were', 'has', 'had',
  'get', 'just', 'any', 'give', 'show',
])

// ─── Energy level labels ──────────────────────────────────────

const ENERGY_LABEL: Record<1 | 2 | 3, string> = {
  1: 'Low-complexity — good for low-energy days',
  2: 'Medium complexity',
  3: 'More involved recipe — suits higher-energy days',
}

// ─── Helpers ──────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t))
}

/** Returns true if any ingredient name or raw text contains the keyword. */
function ingredientContains(recipe: RecipeJSON, keyword: string): boolean {
  return recipe.ingredients.some(
    ing =>
      ing.name.toLowerCase().includes(keyword) ||
      ing.raw.toLowerCase().includes(keyword),
  )
}

/** Returns true if any step text contains the keyword. */
function stepsContain(recipe: RecipeJSON, keyword: string): boolean {
  return recipe.steps.some(step => step.text.toLowerCase().includes(keyword))
}

// ─── Hard filter checks ────────────────────────────────────────

function failsAllergenCheck(recipe: RecipeJSON, allergens: string[]): string | null {
  for (const allergen of allergens) {
    const keywords = ALLERGEN_KEYWORDS[allergen] ?? [allergen.toLowerCase()]
    for (const kw of keywords) {
      if (ingredientContains(recipe, kw)) return allergen
    }
  }
  return null
}

function failsExclusionCheck(recipe: RecipeJSON, excluded: string[]): string | null {
  for (const item of excluded) {
    const kw = item.toLowerCase()
    if (ingredientContains(recipe, kw)) return item
  }
  return null
}

function failsToolCheck(recipe: RecipeJSON, restrictions: string[]): string | null {
  for (const tool of restrictions) {
    const keywords = TOOL_KEYWORDS[tool] ?? [tool.toLowerCase()]
    for (const kw of keywords) {
      if (stepsContain(recipe, kw)) return tool
    }
  }
  return null
}

// ─── Hard filter (exported for use by suggestionAgent) ────────

/**
 * Applies all hard filters — cognitive score, allergens, excluded ingredients,
 * and tool restrictions — and returns the safe, eligible recipe pool.
 *
 * This is the same gate used by suggestRecipes internally. The suggestion agent
 * imports this so it only sends pre-approved recipes to the LLM.
 */
export function hardFilterRecipes(
  recipes: RecipeJSON[],
  energyLevel: 1 | 2 | 3,
  profile: UserProfile | null | undefined,
): RecipeJSON[] {
  const allergens = profile?.allergens ?? []
  const excluded = profile?.excludedIngredients ?? []
  const toolRestrictions = profile?.toolRestrictions ?? []

  return recipes.filter(recipe => {
    const cs = recipe.metadata.cognitiveScore
    if (cs == null || cs > energyLevel) return false
    if (allergens.length > 0 && failsAllergenCheck(recipe, allergens)) return false
    if (excluded.length > 0 && failsExclusionCheck(recipe, excluded)) return false
    if (toolRestrictions.length > 0 && failsToolCheck(recipe, toolRestrictions)) return false
    return true
  })
}

// ─── Main export ──────────────────────────────────────────────

/**
 * Suggests up to 3 recipes matching the user's energy level, profile
 * constraints, and optional NL query.
 *
 * @param query       Free-text input from the user (may be empty)
 * @param energyLevel 1 = low energy, 2 = medium, 3 = feeling good
 * @param recipes     Full recipe pool (all recipes from IndexedDB)
 * @param profile     User profile for hard filters and soft scoring (optional)
 */
export function suggestRecipes(
  query: string,
  energyLevel: 1 | 2 | 3,
  recipes: RecipeJSON[],
  profile?: UserProfile | null,
): SuggestedRecipe[] {
  const tokens = tokenize(query)

  const timeLimit = profile?.timePreferenceMinutes ?? null
  const preferredAppliances = profile?.preferredAppliances ?? []

  // ── Steps 1–4: Hard filters ───────────────────────────────
  const eligible = hardFilterRecipes(recipes, energyLevel, profile)

  // ── Steps 5–8: Soft scoring ───────────────────────────────
  const scored = eligible.map(recipe => {
    let relevance = 0
    const matchReasons: string[] = []

    const cs = recipe.metadata.cognitiveScore as 1 | 2 | 3

    // Energy level reason (always shown)
    matchReasons.push(ENERGY_LABEL[cs])

    // Prefer exact cognitive score match
    if (cs === energyLevel) relevance += 0.5

    // ── NL query relevance ──────────────────────────────────
    if (tokens.length > 0) {
      const titleLower = recipe.title.toLowerCase()
      const preambleLower = recipe.preamble.raw.toLowerCase()
      const ingredientNames = recipe.ingredients.map(i => i.name.toLowerCase())

      const matchedIngredients: string[] = []

      for (const token of tokens) {
        if (titleLower.includes(token)) {
          relevance += 3
        }

        for (const name of ingredientNames) {
          if (name.includes(token) && !matchedIngredients.includes(name)) {
            matchedIngredients.push(name)
            relevance += 2
          }
        }

        if (preambleLower.includes(token)) {
          relevance += 1
        }
      }

      if (matchedIngredients.length > 0) {
        matchReasons.push(`Contains: ${matchedIngredients.slice(0, 3).join(', ')}`)
      }
    }

    // ── Time preference ─────────────────────────────────────
    const time = recipe.metadata.totalTimeMinutes
    if (time != null) {
      if (timeLimit != null) {
        if (time <= timeLimit) {
          relevance += 1
          matchReasons.push(`Within your time limit (${time} min)`)
        } else {
          // Penalise proportionally — up to -2 for recipes twice the limit
          const overage = (time - timeLimit) / timeLimit
          relevance -= Math.min(overage * 2, 2)
          matchReasons.push(`${time} min total`)
        }
      } else {
        matchReasons.push(`${time} min total`)
      }
    }

    // ── Preferred appliances ─────────────────────────────────
    if (preferredAppliances.length > 0) {
      const stepsText = recipe.steps.map(s => s.text.toLowerCase()).join(' ')
      for (const appliance of preferredAppliances) {
        const keywords = APPLIANCE_KEYWORDS[appliance] ?? [appliance.toLowerCase()]
        if (keywords.some(kw => stepsText.includes(kw))) {
          relevance += 1.5
          matchReasons.push(`Uses your preferred appliance: ${appliance}`)
          break // only count once per recipe
        }
      }
    }

    return { recipe, relevance, matchReasons }
  })

  // Sort: relevance desc, then cognitiveScore asc within ties
  scored.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance
    return (a.recipe.metadata.cognitiveScore ?? 3) - (b.recipe.metadata.cognitiveScore ?? 3)
  })

  return scored
    .slice(0, 3)
    .map(({ recipe, matchReasons }) => ({ recipe, matchReasons }))
}
