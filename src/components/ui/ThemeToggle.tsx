import { useViewPreferences } from '@/contexts/ViewPreferencesContext'

interface ThemeToggleProps {
  compact?: boolean
}

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light', icon: '\u2600' },
  { value: 'dark' as const, label: 'Dark', icon: '\u263E' },
  { value: 'system' as const, label: 'System', icon: '\u2699' },
]

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { prefs, updatePrefs } = useViewPreferences()

  if (compact) {
    // Cycle through themes on click: light -> dark -> system -> light
    const nextTheme = () => {
      const order = ['light', 'dark', 'system'] as const
      const idx = order.indexOf(prefs.theme)
      updatePrefs({ theme: order[(idx + 1) % 3] })
    }

    const current = THEME_OPTIONS.find((o) => o.value === prefs.theme)!

    return (
      <button
        type="button"
        onClick={nextTheme}
        aria-label={`Theme: ${current.label}. Click to change.`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-mist-pale bg-white/90 text-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 motion-safe:transition-colors dark:bg-forest/80 dark:border-forest"
      >
        <span aria-hidden="true">{current.icon}</span>
      </button>
    )
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-forest/70 dark:text-cream/70">Theme</legend>
      <div className="flex gap-1" role="radiogroup" aria-label="Theme">
        {THEME_OPTIONS.map((opt) => {
          const selected = prefs.theme === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => updatePrefs({ theme: opt.value })}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium motion-safe:transition-colors ${
                selected
                  ? 'bg-sage text-white'
                  : 'bg-white border border-mist-pale text-forest/70 hover:bg-surface dark:bg-forest/50 dark:text-cream/70 dark:border-forest'
              }`}
            >
              <span aria-hidden="true" className="mr-1">{opt.icon}</span>
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
