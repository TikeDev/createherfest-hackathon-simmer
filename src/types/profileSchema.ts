import { z } from 'zod'
import type { UserProfile } from '@/types/profile'

const UserProfileSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  role: z.enum(['primary', 'guest']),

  // Hard constraints
  allergens: z.array(z.string()),
  excludedIngredients: z.array(z.string()),
  toolRestrictions: z.array(z.string()),

  // Disability & physical
  limitationDuration: z.enum(['temporary', 'chronic', 'permanent', 'mixed']),
  mobilityLimits: z.array(z.string()),
  dexterityLimits: z.array(z.string()),

  // Preferences
  dietPattern: z.array(z.string()),
  prepAssistPreferences: z.array(z.string()),
  preferredAppliances: z.array(z.string()),
  cognitiveLoad: z.enum(['low', 'medium', 'high']),
  timePreferenceMinutes: z.number().positive().optional(),
  budgetLevel: z.enum(['low', 'medium', 'high']).optional(),
})

export interface ValidateProfileResult {
  valid: boolean
  errors: string[]
}

export function validateProfile(data: unknown): ValidateProfileResult {
  const result = UserProfileSchema.safeParse(data)
  if (result.success) return { valid: true, errors: [] }

  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`,
  )
  return { valid: false, errors }
}

export function parseUserProfile(raw: unknown): UserProfile {
  return UserProfileSchema.parse(raw) as UserProfile
}
