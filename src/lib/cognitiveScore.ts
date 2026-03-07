/**
 * cognitiveScore.ts
 * ─────────────────────────────────────────────────────────────
 * Computes the cognitive complexity score for a recipe.
 *
 * This is a pure, deterministic function — no API calls, no side effects.
 * The score maps directly to the three energy levels in the entry point UI:
 *   1 = Low energy
 *   2 = Medium
 *   3 = Feeling good
 *
 * Scores are pre-computed at data processing time and stored on
 * RecipeMetadata.cognitiveScore. For the demo, scores are set manually
 * on pre-seeded recipes using this function as the reference logic.
 *
 * See: docs/DECISION_LOG.md for architectural rationale.
 * ─────────────────────────────────────────────────────────────
 */

import type { RecipeJSON } from '../types/recipe'

// ─── Tuning constants ────────────────────────────────────────
// Adjust these thresholds as the recipe dataset grows.
// Each signal is normalized to 0–1 using these min/max values.

const THRESHOLDS = {
    steps: { low: 6, high: 20 },
    criticalSteps: { low: 0, high: 3 },
    techniqueAnnotations: { low: 0, high: 4 },
    activeTimingSteps: { low: 0, high: 3 },
    ingredientCount: { low: 8, high: 20 },
} as const

// ─── Signal weights (must sum to 1.0) ────────────────────────
const WEIGHTS = {
    steps: 0.30,
    criticalSteps: 0.25,
    techniqueAnnotations: 0.20,
    activeTimingSteps: 0.15,
    ingredientCount: 0.10,
} as const

// ─── Keyword lists for timing inference ──────────────────────
// Used to classify timed steps as active (high pressure) or passive (low pressure).
// A step is high-pressure only if timingMinutes <= SHORT_TIMER_THRESHOLD AND
// its text contains an active keyword.

const SHORT_TIMER_THRESHOLD = 5 // minutes

const ACTIVE_KEYWORDS = [
    'sauté', 'saute', 'stir', 'fry', 'whisk', 'fold', 'watch',
    'toss', 'flip', 'knead', 'beat', 'mix', 'scrape', 'deglaze', 'reduce',
]

const PASSIVE_KEYWORDS = [
    'simmer', 'rest', 'chill', 'marinate', 'soak', 'bake',
    'roast', 'steep', 'cool', 'refrigerate', 'freeze', 'rise', 'proof',
]

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Normalizes a raw value to a 0–1 range using soft min/max thresholds.
 * Values at or below `low` return 0; at or above `high` return 1.
 */
function normalize(value: number, low: number, high: number): number {
    if (high === low) return 0
    return Math.min(1, Math.max(0, (value - low) / (high - low)))
}

/**
 * Classifies a timed step as active or passive using keyword matching.
 * Returns true if the step text contains an active keyword and no passive keyword
 * that would override it (passive takes precedence on ambiguous steps).
 */
function isActiveStep(text: string): boolean {
    const lower = text.toLowerCase()
    const hasPassive = PASSIVE_KEYWORDS.some(kw => lower.includes(kw))
    if (hasPassive) return false
    return ACTIVE_KEYWORDS.some(kw => lower.includes(kw))
}

// ─── Main function ────────────────────────────────────────────

/**
 * Computes the cognitive complexity score for a recipe.
 *
 * @param recipe - A fully parsed RecipeJSON object
 * @returns 1 (low), 2 (medium), or 3 (high) cognitive load
 */
export function computeCognitiveScore(recipe: RecipeJSON): 1 | 2 | 3 {
    const { steps, ingredients } = recipe

    // Signal 1: Total step count
    const stepCount = steps.length

    // Signal 2: Critical step count
    const criticalCount = steps.filter(s => s.isCritical).length

    // Signal 3: Steps with at least one technique annotation
    const techniqueCount = steps.filter(s =>
        s.annotations.some(a => a.type === 'technique')
    ).length

    // Signal 4: Short active timed steps (urgency windows)
    const activeTimingCount = steps.filter(s =>
        typeof s.timingMinutes === 'number' &&
        s.timingMinutes <= SHORT_TIMER_THRESHOLD &&
        isActiveStep(s.text)
    ).length

    // Signal 5: Ingredient count
    const ingredientCount = ingredients.length

    // Normalize each signal to 0–1
    const normalized = {
        steps: normalize(stepCount, THRESHOLDS.steps.low, THRESHOLDS.steps.high),
        criticalSteps: normalize(criticalCount, THRESHOLDS.criticalSteps.low, THRESHOLDS.criticalSteps.high),
        techniqueAnnotations: normalize(techniqueCount, THRESHOLDS.techniqueAnnotations.low, THRESHOLDS.techniqueAnnotations.high),
        activeTimingSteps: normalize(activeTimingCount, THRESHOLDS.activeTimingSteps.low, THRESHOLDS.activeTimingSteps.high),
        ingredientCount: normalize(ingredientCount, THRESHOLDS.ingredientCount.low, THRESHOLDS.ingredientCount.high),
    }

    // Weighted sum → raw score 0–1
    const rawScore =
        normalized.steps * WEIGHTS.steps +
        normalized.criticalSteps * WEIGHTS.criticalSteps +
        normalized.techniqueAnnotations * WEIGHTS.techniqueAnnotations +
        normalized.activeTimingSteps * WEIGHTS.activeTimingSteps +
        normalized.ingredientCount * WEIGHTS.ingredientCount

    // Map to 1–3 output
    if (rawScore <= 0.40) return 1
    if (rawScore <= 0.70) return 2
    return 3
}

/**
 * Returns both the bucketed score and the raw 0–1 float.
 * Use this during development to tune thresholds against real recipes.
 *
 * @example
 * const { score, raw } = computeCognitiveScoreDebug(recipe)
 * console.log(`Score: ${score} (raw: ${raw.toFixed(3)})`)
 */
export function computeCognitiveScoreDebug(recipe: RecipeJSON): {
    score: 1 | 2 | 3
    raw: number
    signals: Record<string, number>
} {
    const { steps, ingredients } = recipe

    const stepCount = steps.length
    const criticalCount = steps.filter(s => s.isCritical).length
    const techniqueCount = steps.filter(s =>
        s.annotations.some(a => a.type === 'technique')
    ).length
    const activeTimingCount = steps.filter(s =>
        typeof s.timingMinutes === 'number' &&
        s.timingMinutes <= SHORT_TIMER_THRESHOLD &&
        isActiveStep(s.text)
    ).length
    const ingredientCount = ingredients.length

    const signals = {
        steps: normalize(stepCount, THRESHOLDS.steps.low, THRESHOLDS.steps.high),
        criticalSteps: normalize(criticalCount, THRESHOLDS.criticalSteps.low, THRESHOLDS.criticalSteps.high),
        techniqueAnnotations: normalize(techniqueCount, THRESHOLDS.techniqueAnnotations.low, THRESHOLDS.techniqueAnnotations.high),
        activeTimingSteps: normalize(activeTimingCount, THRESHOLDS.activeTimingSteps.low, THRESHOLDS.activeTimingSteps.high),
        ingredientCount: normalize(ingredientCount, THRESHOLDS.ingredientCount.low, THRESHOLDS.ingredientCount.high),
    }

    const raw =
        signals.steps * WEIGHTS.steps +
        signals.criticalSteps * WEIGHTS.criticalSteps +
        signals.techniqueAnnotations * WEIGHTS.techniqueAnnotations +
        signals.activeTimingSteps * WEIGHTS.activeTimingSteps +
        signals.ingredientCount * WEIGHTS.ingredientCount

    const score: 1 | 2 | 3 = raw <= 0.40 ? 1 : raw <= 0.70 ? 2 : 3

    return { score, raw, signals }
}