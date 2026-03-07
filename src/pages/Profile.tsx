import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'
import { handleRadioKeyDown } from '@/utils/a11y'
import {
  FDA_ALLERGENS,
  DIET_PATTERNS,
  TOOL_RESTRICTIONS,
  MOBILITY_LIMITS,
  DEXTERITY_LIMITS,
  PREP_ASSIST_OPTIONS,
  PREFERRED_APPLIANCES,
  COGNITIVE_LOAD_LEVELS,
  BUDGET_LEVELS,
  LIMITATION_DURATIONS,
} from '@/types/profile'

type ArrayField =
  | 'allergens'
  | 'excludedIngredients'
  | 'toolRestrictions'
  | 'mobilityLimits'
  | 'dexterityLimits'
  | 'dietPattern'
  | 'prepAssistPreferences'
  | 'preferredAppliances'

// --- Reusable sub-components ---

/** Multi-select toggle chip group */
function ChipGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string
  options: readonly string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-forest dark:text-cream">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(opt)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 ${
                isSelected
                  ? 'bg-sage text-white'
                  : 'border border-mist-pale bg-surface text-forest/70 hover:border-mist hover:text-forest dark:text-cream/70 dark:border-forest dark:hover:border-mist dark:hover:text-cream'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Single-select radio group (pill style) */
function RadioPillGroup<T extends string>({
  legend,
  options,
  selected,
  onChange,
  labels,
}: {
  legend: string
  options: readonly T[]
  selected: T
  onChange: (value: T) => void
  labels?: Record<T, string>
}) {
  return (
    <fieldset className="space-y-2" role="radiogroup">
      <legend className="text-sm font-semibold text-forest dark:text-cream">{legend}</legend>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const isSelected = selected === opt
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(opt)}
              onKeyDown={(e) =>
                handleRadioKeyDown(e, [...options], selected, onChange)
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 ${
                isSelected
                  ? 'bg-sage text-white'
                  : 'border border-mist-pale bg-surface text-forest/70 hover:bg-mist-pale dark:text-cream/70 dark:border-forest'
              }`}
            >
              {labels ? labels[opt] : opt}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Free-text chip input for excluded ingredients */
function FreeTextChips({
  legend,
  values,
  onAdd,
  onRemove,
}: {
  legend: string
  values: string[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = input.trim().toLowerCase()
      if (trimmed && !values.includes(trimmed)) {
        onAdd(trimmed)
      }
      setInput('')
    }
  }

  function handleRemove(value: string) {
    onRemove(value)
    inputRef.current?.focus()
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-forest dark:text-cream">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage"
          >
            {val}
            <button
              type="button"
              onClick={() => handleRemove(val)}
              aria-label={`Remove ${val}`}
              className="ml-0.5 rounded-full p-0.5 hover:bg-sage/20 focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </span>
        ))}
      </div>
      <label htmlFor="excluded-input" className="sr-only">
        Type an ingredient and press Enter
      </label>
      <input
        ref={inputRef}
        id="excluded-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type an ingredient and press Enter"
        className="w-full rounded-lg border border-mist-pale bg-surface px-3 py-2 text-sm text-forest placeholder:text-forest/40 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage dark:text-cream dark:border-forest dark:placeholder:text-cream/40 dark:focus:border-sage"
      />
    </fieldset>
  )
}

/** Collapsible section card */
function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-mist-pale bg-surface dark:border-forest"
    >
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-forest focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 rounded-xl dark:text-cream">
        <h2 className="text-base font-headline">{title}</h2>
        <span
          aria-hidden="true"
          className="text-forest/40 transition-transform group-open:rotate-180 dark:text-cream/40"
        >
          &#x25BE;
        </span>
      </summary>
      <div className="space-y-6 px-5 pb-5">{children}</div>
    </details>
  )
}

// --- Main page ---

export default function Profile() {
  const { profile, loading, saveStatus, update } = useProfile()

  if (loading || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-forest/60 dark:text-cream/60" role="status">
          Loading profile...
        </p>
      </div>
    )
  }

  function toggleArrayValue(field: ArrayField, value: string) {
    if (!profile) return
    const current = profile[field]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    update({ [field]: next })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline text-forest dark:text-cream">My Profile</h1>
        <div className="flex items-center gap-3">
          <span
            role="status"
            aria-live="polite"
            className="text-xs text-forest/50 dark:text-cream/50"
          >
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved'}
          </span>
          <Link
            to="/recipes"
            className="rounded-lg bg-surface border border-mist-pale px-3 py-1.5 text-xs font-medium text-forest/70 hover:border-mist hover:text-forest transition-colors focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 dark:text-cream/70 dark:border-forest dark:hover:text-cream"
          >
            Back to recipes
          </Link>
        </div>
      </div>

      <p className="text-sm text-forest/60 dark:text-cream/60">
        Your profile helps Simmer find recipes that work for your body and kitchen. Changes save automatically.
      </p>

      {/* Section 1: Safety & Allergens */}
      <Section title="Safety & Allergens" defaultOpen>
        <ChipGroup
          legend="Allergens (FDA top 9)"
          options={FDA_ALLERGENS}
          selected={profile.allergens}
          onToggle={(v) => toggleArrayValue('allergens', v)}
        />

        <FreeTextChips
          legend="Excluded ingredients"
          values={profile.excludedIngredients}
          onAdd={(v) => update({ excludedIngredients: [...profile.excludedIngredients, v] })}
          onRemove={(v) =>
            update({
              excludedIngredients: profile.excludedIngredients.filter((i) => i !== v),
            })
          }
        />

        <ChipGroup
          legend="Restricted tools & techniques"
          options={TOOL_RESTRICTIONS}
          selected={profile.toolRestrictions}
          onToggle={(v) => toggleArrayValue('toolRestrictions', v)}
        />
      </Section>

      {/* Section 2: Physical & Accessibility Needs */}
      <Section title="Physical & Accessibility Needs">
        <RadioPillGroup
          legend="How long have you had these limitations?"
          options={LIMITATION_DURATIONS}
          selected={profile.limitationDuration}
          onChange={(v) => update({ limitationDuration: v })}
        />

        <ChipGroup
          legend="Mobility"
          options={MOBILITY_LIMITS}
          selected={profile.mobilityLimits}
          onToggle={(v) => toggleArrayValue('mobilityLimits', v)}
        />

        <ChipGroup
          legend="Dexterity & fine motor"
          options={DEXTERITY_LIMITS}
          selected={profile.dexterityLimits}
          onToggle={(v) => toggleArrayValue('dexterityLimits', v)}
        />
      </Section>

      {/* Section 3: Cooking Preferences */}
      <Section title="Cooking Preferences">
        <ChipGroup
          legend="Diet patterns"
          options={DIET_PATTERNS}
          selected={profile.dietPattern}
          onToggle={(v) => toggleArrayValue('dietPattern', v)}
        />

        <ChipGroup
          legend="Preferred appliances"
          options={PREFERRED_APPLIANCES}
          selected={profile.preferredAppliances}
          onToggle={(v) => toggleArrayValue('preferredAppliances', v)}
        />

        <ChipGroup
          legend="Prep shortcuts you like"
          options={PREP_ASSIST_OPTIONS}
          selected={profile.prepAssistPreferences}
          onToggle={(v) => toggleArrayValue('prepAssistPreferences', v)}
        />

        <RadioPillGroup
          legend="Recipe complexity preference"
          options={COGNITIVE_LOAD_LEVELS}
          selected={profile.cognitiveLoad}
          onChange={(v) => update({ cognitiveLoad: v })}
          labels={{ low: 'Simple', medium: 'Moderate', high: 'Complex' }}
        />
      </Section>

      {/* Section 4: Time & Budget */}
      <Section title="Time & Budget">
        {/* Time preference */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-forest dark:text-cream">
            Max cooking time
          </legend>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-forest/70 dark:text-cream/70">
              <input
                type="checkbox"
                checked={profile.timePreferenceMinutes == null}
                onChange={(e) =>
                  update({
                    timePreferenceMinutes: e.target.checked ? undefined : 30,
                  })
                }
                className="rounded border-mist-pale text-sage focus:ring-2 focus:ring-sage focus:ring-offset-2"
              />
              No time preference
            </label>
          </div>
          {profile.timePreferenceMinutes != null && (
            <div className="space-y-1">
              <label htmlFor="time-range" className="sr-only">
                Maximum cooking time in minutes
              </label>
              <input
                id="time-range"
                type="range"
                min={15}
                max={120}
                step={15}
                value={profile.timePreferenceMinutes}
                onChange={(e) =>
                  update({ timePreferenceMinutes: Number(e.target.value) })
                }
                aria-valuetext={`${profile.timePreferenceMinutes} minutes`}
                className="w-full accent-sage focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 rounded-lg"
              />
              <div className="flex justify-between text-xs text-forest/50 dark:text-cream/50">
                <span>15 min</span>
                <span className="font-semibold text-sage">
                  {profile.timePreferenceMinutes} min
                </span>
                <span>120 min</span>
              </div>
            </div>
          )}
        </fieldset>

        {/* Budget */}
        <RadioPillGroup
          legend="Budget level"
          options={BUDGET_LEVELS}
          selected={profile.budgetLevel ?? 'medium'}
          onChange={(v) => update({ budgetLevel: v })}
          labels={{ low: 'Budget-friendly', medium: 'Moderate', high: 'No limit' }}
        />
      </Section>
    </div>
  )
}
