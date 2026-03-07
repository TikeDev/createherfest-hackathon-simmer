import { useState, useEffect, useRef } from 'react'
import { runSuggestionAgentWithFallback, type SmartSuggestion } from '@/agent/suggestionAgent'
import type { RecipeJSON } from '@/types/recipe'
import type { UserProfile } from '@/types/profile'
import type { EnergyLevel } from '@/pages/Landing'

const ENERGY_MAP: Record<EnergyLevel, 1 | 2 | 3> = {
  low: 1,
  medium: 2,
  high: 3,
}

/**
 * Calls the LLM suggestion agent (with pure-function fallback) when the user
 * arrives with a session. Waits for both recipes and profile to finish loading
 * before making the call, so the hard filters are fully informed.
 *
 * @param energyLabel   Energy level from Landing screen ('low' | 'medium' | 'high')
 * @param note          Free-text from the craving input
 * @param recipes       Recipe pool from IndexedDB (pass after they have loaded)
 * @param profile       User profile (pass null while profileLoading is true)
 * @param profileLoading Pass useProfile()'s loading flag to delay the call
 */
export function useSmartSuggestions(
  energyLabel: EnergyLevel | null | undefined,
  note: string | null | undefined,
  recipes: RecipeJSON[],
  profile: UserProfile | null,
  profileLoading: boolean,
) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  // Prevent re-running after the first successful call for this session
  const hasFetched = useRef(false)

  useEffect(() => {
    // Need at least one session signal
    if (!energyLabel && !note) return
    // Wait until both data sources are ready
    if (recipes.length === 0 || profileLoading) return
    // Only call once per session — re-runs if the component remounts
    if (hasFetched.current) return

    hasFetched.current = true

    const energyLevel = energyLabel ? ENERGY_MAP[energyLabel] : 2

    setLoading(true)
    runSuggestionAgentWithFallback(energyLevel, note ?? '', recipes, profile)
      .then(setSuggestions)
      .finally(() => setLoading(false))
  }, [energyLabel, note, recipes, profile, profileLoading])

  return { suggestions, loading }
}
