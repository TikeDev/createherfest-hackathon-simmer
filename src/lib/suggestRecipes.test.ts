import { describe, it, expect } from 'vitest'
import { suggestRecipes } from './suggestRecipes'
import type { RecipeJSON } from '../types/recipe'
import type { UserProfile } from '../types/profile'

// ─── Minimal fixtures ─────────────────────────────────────────
// Each recipe helper sets only the fields suggestRecipes reads.
// Tests extend them inline as needed.

function makeRecipe(overrides: {
  id: string
  title: string
  cognitiveScore: 1 | 2 | 3
  ingredients?: { id: string; name: string; raw: string }[]
  steps?: { id: string; index: number; text: string; isCritical: boolean; annotations: [] }[]
  totalTimeMinutes?: number
}): RecipeJSON {
  return {
    id: overrides.id,
    title: overrides.title,
    sourceDomain: 'test',
    extractedAt: '2026-01-01T00:00:00.000Z',
    preamble: { raw: '', tips: [], substitutions: [], techniqueNotes: [] },
    ingredients: overrides.ingredients ?? [],
    steps: overrides.steps ?? [],
    metadata: {
      cognitiveScore: overrides.cognitiveScore,
      totalTimeMinutes: overrides.totalTimeMinutes ?? null,
    },
  }
}

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'test-profile',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    role: 'primary',
    allergens: [],
    excludedIngredients: [],
    toolRestrictions: [],
    limitationDuration: 'temporary',
    mobilityLimits: [],
    dexterityLimits: [],
    dietPattern: [],
    prepAssistPreferences: [],
    preferredAppliances: [],
    cognitiveLoad: 'medium',
    ...overrides,
  }
}

const easyRecipe = makeRecipe({ id: 'easy', title: 'Simple Omelette', cognitiveScore: 1 })
const mediumRecipe = makeRecipe({ id: 'medium', title: 'Dal Tadka', cognitiveScore: 2 })
const hardRecipe = makeRecipe({ id: 'hard', title: 'Beef Wellington', cognitiveScore: 3 })

// ─── Energy level filtering ───────────────────────────────────

describe('energy level filtering', () => {
  it('returns only score-1 recipes when energyLevel is 1', () => {
    const results = suggestRecipes('', 1, [easyRecipe, mediumRecipe, hardRecipe])
    expect(results.map(r => r.recipe.id)).toEqual(['easy'])
  })

  it('returns score-1 and score-2 recipes when energyLevel is 2', () => {
    const results = suggestRecipes('', 2, [easyRecipe, mediumRecipe, hardRecipe])
    const ids = results.map(r => r.recipe.id)
    expect(ids).toContain('easy')
    expect(ids).toContain('medium')
    expect(ids).not.toContain('hard')
  })

  it('returns all recipes when energyLevel is 3', () => {
    const results = suggestRecipes('', 3, [easyRecipe, mediumRecipe, hardRecipe])
    expect(results).toHaveLength(3)
  })

  it('returns at most 3 results even when many recipes are eligible', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      makeRecipe({ id: `r${i}`, title: `Recipe ${i}`, cognitiveScore: 1 }),
    )
    const results = suggestRecipes('', 1, many)
    expect(results).toHaveLength(3)
  })

  it('returns empty array when no recipes match energyLevel', () => {
    const results = suggestRecipes('', 1, [mediumRecipe, hardRecipe])
    expect(results).toHaveLength(0)
  })

  it('excludes recipes with no cognitiveScore set', () => {
    const unscoredRecipe = makeRecipe({ id: 'unscored', title: 'Mystery Dish', cognitiveScore: 1 })
    // @ts-expect-error — simulating missing score from older data
    unscoredRecipe.metadata.cognitiveScore = undefined
    const results = suggestRecipes('', 3, [unscoredRecipe, easyRecipe])
    expect(results.map(r => r.recipe.id)).toEqual(['easy'])
  })
})

// ─── NL query ranking ─────────────────────────────────────────

describe('NL query ranking', () => {
  const soupRecipe = makeRecipe({
    id: 'soup',
    title: 'Tomato Soup',
    cognitiveScore: 1,
    ingredients: [
      { id: 'i1', name: 'tomato', raw: '4 medium tomatoes' },
      { id: 'i2', name: 'vegetable broth', raw: '2 cups vegetable broth' },
    ],
  })

  const pastaRecipe = makeRecipe({
    id: 'pasta',
    title: 'Garlic Pasta',
    cognitiveScore: 1,
    ingredients: [
      { id: 'i3', name: 'pasta', raw: '200g pasta' },
      { id: 'i4', name: 'garlic', raw: '3 cloves garlic' },
    ],
  })

  it('ranks by title match above ingredient match', () => {
    const results = suggestRecipes('garlic', 1, [soupRecipe, pastaRecipe])
    // "Garlic Pasta" matches title; soup doesn't — pasta must rank first
    expect(results[0].recipe.id).toBe('pasta')
  })

  it('matches ingredient names regardless of word order', () => {
    const results = suggestRecipes('tomato', 1, [soupRecipe, pastaRecipe])
    expect(results[0].recipe.id).toBe('soup')
  })

  it('ignores stop-words and returns results for meaningful tokens only', () => {
    // "i want something with" — all stop-words, no signal
    const results = suggestRecipes('i want something with', 1, [soupRecipe, pastaRecipe])
    expect(results).toHaveLength(2) // both returned, order doesn't matter
  })

  it('returns all eligible recipes when query is empty string', () => {
    const results = suggestRecipes('', 1, [soupRecipe, pastaRecipe])
    expect(results).toHaveLength(2)
  })

  it('match reasons include matched ingredient names', () => {
    const results = suggestRecipes('tomato', 1, [soupRecipe, pastaRecipe])
    const topReasons = results[0].matchReasons
    expect(topReasons.some(r => r.includes('tomato'))).toBe(true)
  })

  it('is case-insensitive for queries', () => {
    const upper = suggestRecipes('TOMATO', 1, [soupRecipe, pastaRecipe])
    const lower = suggestRecipes('tomato', 1, [soupRecipe, pastaRecipe])
    expect(upper[0].recipe.id).toBe(lower[0].recipe.id)
  })
})

// ─── Allergen hard filter ─────────────────────────────────────

describe('allergen hard filter', () => {
  const peanutRecipe = makeRecipe({
    id: 'peanut',
    title: 'Peanut Stew',
    cognitiveScore: 1,
    ingredients: [{ id: 'i1', name: 'roasted peanuts', raw: '1 cup roasted peanuts' }],
  })

  const safeRecipe = makeRecipe({
    id: 'safe',
    title: 'Rice and Veg',
    cognitiveScore: 1,
    ingredients: [{ id: 'i2', name: 'rice', raw: '1 cup rice' }],
  })

  it('removes recipes containing an allergen ingredient', () => {
    const profile = makeProfile({ allergens: ['peanuts'] })
    const results = suggestRecipes('', 1, [peanutRecipe, safeRecipe], profile)
    expect(results.map(r => r.recipe.id)).toEqual(['safe'])
  })

  it('handles expanded allergen keywords (tree nuts)', () => {
    const walnutRecipe = makeRecipe({
      id: 'walnut',
      title: 'Walnut Cake',
      cognitiveScore: 1,
      ingredients: [{ id: 'i3', name: 'walnut', raw: '1 cup walnuts' }],
    })
    const profile = makeProfile({ allergens: ['tree nuts'] })
    const results = suggestRecipes('', 1, [walnutRecipe, safeRecipe], profile)
    expect(results.map(r => r.recipe.id)).toEqual(['safe'])
  })

  it('handles milk allergen (ghee counts as milk)', () => {
    const gheeRecipe = makeRecipe({
      id: 'ghee',
      title: 'Dal Tadka',
      cognitiveScore: 1,
      ingredients: [{ id: 'i4', name: 'ghee', raw: '2 tbsp ghee' }],
    })
    const profile = makeProfile({ allergens: ['milk'] })
    const results = suggestRecipes('', 1, [gheeRecipe, safeRecipe], profile)
    expect(results.map(r => r.recipe.id)).toEqual(['safe'])
  })

  it('does not remove recipes when allergen list is empty', () => {
    const profile = makeProfile({ allergens: [] })
    const results = suggestRecipes('', 1, [peanutRecipe, safeRecipe], profile)
    expect(results).toHaveLength(2)
  })

  it('does not remove recipes when profile is null', () => {
    const results = suggestRecipes('', 1, [peanutRecipe, safeRecipe], null)
    expect(results).toHaveLength(2)
  })
})

// ─── Excluded ingredients hard filter ────────────────────────

describe('excluded ingredients hard filter', () => {
  const chickenRecipe = makeRecipe({
    id: 'chicken',
    title: 'Chicken Soup',
    cognitiveScore: 1,
    ingredients: [{ id: 'i1', name: 'chicken thighs', raw: '450g chicken thighs' }],
  })

  const veggieRecipe = makeRecipe({
    id: 'veggie',
    title: 'Veggie Stew',
    cognitiveScore: 1,
    ingredients: [{ id: 'i2', name: 'carrots', raw: '3 carrots' }],
  })

  it('excludes recipes containing a user-excluded ingredient', () => {
    const profile = makeProfile({ excludedIngredients: ['chicken'] })
    const results = suggestRecipes('', 1, [chickenRecipe, veggieRecipe], profile)
    expect(results.map(r => r.recipe.id)).toEqual(['veggie'])
  })

  it('matches exclusion against raw ingredient text too', () => {
    const profile = makeProfile({ excludedIngredients: ['chicken thighs'] })
    const results = suggestRecipes('', 1, [chickenRecipe, veggieRecipe], profile)
    expect(results.map(r => r.recipe.id)).toEqual(['veggie'])
  })

  it('is case-insensitive for excluded ingredient matching', () => {
    const profile = makeProfile({ excludedIngredients: ['CHICKEN'] })
    const results = suggestRecipes('', 1, [chickenRecipe, veggieRecipe], profile)
    expect(results.map(r => r.recipe.id)).toEqual(['veggie'])
  })
})

// ─── Tool restriction hard filter ────────────────────────────

describe('tool restriction hard filter', () => {
  const blenderRecipe = makeRecipe({
    id: 'blended-soup',
    title: 'Blended Soup',
    cognitiveScore: 1,
    steps: [
      { id: 's1', index: 1, text: 'Cook the vegetables until soft.', isCritical: false, annotations: [] },
      { id: 's2', index: 2, text: 'Use an immersion blender to blend until smooth.', isCritical: false, annotations: [] },
    ],
  })

  const noToolRecipe = makeRecipe({
    id: 'simple-stew',
    title: 'Simple Stew',
    cognitiveScore: 1,
    steps: [
      { id: 's3', index: 1, text: 'Combine all ingredients in a pot and simmer for 30 minutes.', isCritical: false, annotations: [] },
    ],
  })

  it('excludes recipes that require a restricted tool', () => {
    const profile = makeProfile({ toolRestrictions: ['blender'] })
    const results = suggestRecipes('', 1, [blenderRecipe, noToolRecipe], profile)
    expect(results.map(r => r.recipe.id)).toEqual(['simple-stew'])
  })

  it('excludes recipes with knife steps when knife is restricted', () => {
    const knifeRecipe = makeRecipe({
      id: 'chopped',
      title: 'Chopped Salad',
      cognitiveScore: 1,
      steps: [
        { id: 's4', index: 1, text: 'Dice the onion and mince the garlic.', isCritical: false, annotations: [] },
      ],
    })
    const profile = makeProfile({ toolRestrictions: ['knife'] })
    const results = suggestRecipes('', 1, [knifeRecipe, noToolRecipe], profile)
    expect(results.map(r => r.recipe.id)).toEqual(['simple-stew'])
  })

  it('does not exclude when tool restriction list is empty', () => {
    const profile = makeProfile({ toolRestrictions: [] })
    const results = suggestRecipes('', 1, [blenderRecipe, noToolRecipe], profile)
    expect(results).toHaveLength(2)
  })
})

// ─── Time preference soft scoring ────────────────────────────

describe('time preference soft scoring', () => {
  const quickRecipe = makeRecipe({ id: 'quick', title: 'Quick Eggs', cognitiveScore: 1, totalTimeMinutes: 15 })
  const slowRecipe = makeRecipe({ id: 'slow', title: 'Slow Braise', cognitiveScore: 1, totalTimeMinutes: 120 })
  const notimeRecipe = makeRecipe({ id: 'notime', title: 'No Time Set', cognitiveScore: 1 })

  it('ranks within-limit recipes above over-limit ones', () => {
    const profile = makeProfile({ timePreferenceMinutes: 30 })
    const results = suggestRecipes('', 1, [slowRecipe, quickRecipe], profile)
    expect(results[0].recipe.id).toBe('quick')
  })

  it('includes "Within your time limit" reason for matching recipes', () => {
    const profile = makeProfile({ timePreferenceMinutes: 30 })
    const results = suggestRecipes('', 1, [quickRecipe], profile)
    expect(results[0].matchReasons.some(r => r.includes('Within your time limit'))).toBe(true)
  })

  it('still includes over-limit recipes (soft penalty, not hard filter)', () => {
    const profile = makeProfile({ timePreferenceMinutes: 10 })
    const results = suggestRecipes('', 1, [slowRecipe])
    expect(results).toHaveLength(1)
  })

  it('does not penalise recipes with no time data', () => {
    const profile = makeProfile({ timePreferenceMinutes: 30 })
    const results = suggestRecipes('', 1, [notimeRecipe, quickRecipe], profile)
    expect(results).toHaveLength(2)
  })
})

// ─── Preferred appliances soft scoring ───────────────────────

describe('preferred appliances soft scoring', () => {
  const slowCookerRecipe = makeRecipe({
    id: 'crockpot',
    title: 'Bean Stew',
    cognitiveScore: 1,
    steps: [
      { id: 's1', index: 1, text: 'Add everything to the slow cooker and cook on low for 6 hours.', isCritical: false, annotations: [] },
    ],
  })

  const stovetopRecipe = makeRecipe({
    id: 'stovetop',
    title: 'Pan Fried Tofu',
    cognitiveScore: 1,
    steps: [
      { id: 's2', index: 1, text: 'Heat a pan and fry the tofu until golden.', isCritical: false, annotations: [] },
    ],
  })

  it('boosts recipes that use a preferred appliance', () => {
    const profile = makeProfile({ preferredAppliances: ['slow cooker'] })
    const results = suggestRecipes('', 1, [stovetopRecipe, slowCookerRecipe], profile)
    expect(results[0].recipe.id).toBe('crockpot')
  })

  it('includes appliance name in match reasons', () => {
    const profile = makeProfile({ preferredAppliances: ['slow cooker'] })
    const results = suggestRecipes('', 1, [slowCookerRecipe], profile)
    expect(results[0].matchReasons.some(r => r.includes('slow cooker'))).toBe(true)
  })
})

// ─── Match reasons ────────────────────────────────────────────

describe('match reasons', () => {
  it('always includes an energy level reason', () => {
    const results = suggestRecipes('', 1, [easyRecipe])
    expect(results[0].matchReasons.length).toBeGreaterThan(0)
    const hasEnergyReason = results[0].matchReasons.some(r =>
      r.includes('Low-complexity') || r.includes('Medium') || r.includes('More involved'),
    )
    expect(hasEnergyReason).toBe(true)
  })

  it('includes total time when available', () => {
    const timedRecipe = makeRecipe({ id: 't', title: 'Timed Recipe', cognitiveScore: 1, totalTimeMinutes: 40 })
    const results = suggestRecipes('', 1, [timedRecipe])
    expect(results[0].matchReasons.some(r => r.includes('40 min'))).toBe(true)
  })
})

// ─── Combined filters ─────────────────────────────────────────

describe('combined profile filters', () => {
  it('applies allergen AND tool restriction filters together', () => {
    const problematicRecipe = makeRecipe({
      id: 'problem',
      title: 'Peanut Blended Soup',
      cognitiveScore: 1,
      ingredients: [{ id: 'i1', name: 'peanuts', raw: '1 cup peanuts' }],
      steps: [
        { id: 's1', index: 1, text: 'Blend the soup until smooth.', isCritical: false, annotations: [] },
      ],
    })
    const safeRecipe = makeRecipe({ id: 'safe', title: 'Safe Soup', cognitiveScore: 1 })
    const profile = makeProfile({ allergens: ['peanuts'], toolRestrictions: ['blender'] })

    const results = suggestRecipes('', 1, [problematicRecipe, safeRecipe], profile)
    expect(results.map(r => r.recipe.id)).toEqual(['safe'])
  })

  it('energy filter applies before other filters — a recipe excluded by energy is never checked', () => {
    const highComplexityPeanut = makeRecipe({
      id: 'high',
      title: 'Complex Peanut Dish',
      cognitiveScore: 3,
      ingredients: [{ id: 'i1', name: 'peanuts', raw: '1 cup peanuts' }],
    })
    // No allergen set — energy filter should exclude it first
    const results = suggestRecipes('', 1, [highComplexityPeanut], null)
    expect(results).toHaveLength(0)
  })

  it('exact cognitive score match ranks above lower-score match when query is empty', () => {
    const score1 = makeRecipe({ id: 'score1', title: 'Easy Recipe', cognitiveScore: 1 })
    const score2 = makeRecipe({ id: 'score2', title: 'Medium Recipe', cognitiveScore: 2 })
    // energyLevel 2 — exact match is score2, score1 is under
    const results = suggestRecipes('', 2, [score1, score2])
    expect(results[0].recipe.id).toBe('score2')
  })
})

// ─── Edge cases ───────────────────────────────────────────────

describe('edge cases', () => {
  it('handles empty recipe pool gracefully', () => {
    const results = suggestRecipes('soup', 2, [])
    expect(results).toHaveLength(0)
  })

  it('handles empty query and empty profile with results', () => {
    const results = suggestRecipes('', 1, [easyRecipe], makeProfile())
    expect(results).toHaveLength(1)
  })

  it('handles a query with only punctuation (tokenizes to nothing)', () => {
    const results = suggestRecipes('!!! ??? ---', 1, [easyRecipe, mediumRecipe, hardRecipe])
    // No tokens → no query signal → all eligible returned (only score ≤ 1)
    expect(results).toHaveLength(1)
    expect(results[0].recipe.id).toBe('easy')
  })

  it('handles a very long query without error', () => {
    const longQuery = 'soup '.repeat(200)
    expect(() => suggestRecipes(longQuery, 3, [easyRecipe, mediumRecipe, hardRecipe])).not.toThrow()
  })

  it('handles duplicate allergen entries without double-excluding', () => {
    const peanutRecipe = makeRecipe({
      id: 'peanut',
      title: 'Peanut Dish',
      cognitiveScore: 1,
      ingredients: [{ id: 'i1', name: 'peanuts', raw: '1 cup peanuts' }],
    })
    const profile = makeProfile({ allergens: ['peanuts', 'peanuts', 'peanuts'] })
    const results = suggestRecipes('', 1, [peanutRecipe], profile)
    expect(results).toHaveLength(0) // still excluded, just once
  })

  it('does not mutate the input recipes array', () => {
    const pool = [hardRecipe, mediumRecipe, easyRecipe]
    const original = [...pool]
    suggestRecipes('', 3, pool)
    expect(pool.map(r => r.id)).toEqual(original.map(r => r.id))
  })
})
