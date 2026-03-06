import type { SortField, TimeRange, Complexity, FilterState } from '@/hooks/useRecipeFilters'

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'date-newest', label: 'Newest first' },
  { value: 'date-oldest', label: 'Oldest first' },
  { value: 'time-asc', label: 'Quickest' },
  { value: 'time-desc', label: 'Longest' },
  { value: 'title-az', label: 'Title A–Z' },
  { value: 'title-za', label: 'Title Z–A' },
  { value: 'ingredients-asc', label: 'Fewest ingredients' },
  { value: 'ingredients-desc', label: 'Most ingredients' },
  { value: 'steps-asc', label: 'Fewest steps' },
  { value: 'steps-desc', label: 'Most steps' },
]

const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'all', label: 'Any time' },
  { value: 'quick', label: '≤30 min' },
  { value: 'medium', label: '30–60 min' },
  { value: 'long', label: '60+ min' },
]

const COMPLEXITY_OPTIONS: { value: Complexity; label: string }[] = [
  { value: 'all', label: 'Any complexity' },
  { value: 'simple', label: 'Simple (≤7)' },
  { value: 'moderate', label: 'Moderate (8–15)' },
  { value: 'complex', label: 'Complex (16+)' },
]

const TIME_CHIP_LABELS: Record<TimeRange, string> = {
  all: '',
  quick: '≤30 min',
  medium: '30–60 min',
  long: '60+ min',
}

const COMPLEXITY_CHIP_LABELS: Record<Complexity, string> = {
  all: '',
  simple: 'Simple',
  moderate: 'Moderate',
  complex: 'Complex',
}

const selectClass =
  'rounded-lg border border-mist-pale bg-white px-2 py-1.5 text-xs text-forest focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 dark:border-forest dark:bg-forest/30 dark:text-cream'

interface RecipeToolbarProps {
  query: string
  onQueryChange: (q: string) => void
  sortField: SortField
  onSortChange: (f: SortField) => void
  filters: FilterState
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  onReset: () => void
  hasActiveFilters: boolean
  availableDomains: string[]
  searchRef: React.RefObject<HTMLInputElement | null>
}

export default function RecipeToolbar({
  query,
  onQueryChange,
  sortField,
  onSortChange,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  availableDomains,
  searchRef,
}: RecipeToolbarProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <label htmlFor="recipe-search" className="sr-only">
        Search recipes
      </label>
      <div className="relative">
        <input
          ref={searchRef}
          id="recipe-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by title, ingredient, or source..."
          className="w-full rounded-lg border border-mist-pale bg-white px-4 py-2 pl-9 text-sm text-forest placeholder:text-forest/40 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 dark:border-forest dark:bg-forest/30 dark:text-cream dark:placeholder:text-cream/40"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/40 dark:text-cream/40"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-forest/40 hover:text-forest focus:outline-none focus:ring-2 focus:ring-sage dark:text-cream/40 dark:hover:text-cream"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>

      {/* Sort + Filters — single row of compact selects */}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="recipe-sort" className="sr-only">Sort by</label>
        <select id="recipe-sort" value={sortField} onChange={(e) => onSortChange(e.target.value as SortField)} className={selectClass}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label htmlFor="filter-time" className="sr-only">Filter by time</label>
        <select id="filter-time" value={filters.timeRange} onChange={(e) => onFilterChange('timeRange', e.target.value as TimeRange)} className={selectClass}>
          {TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label htmlFor="filter-complexity" className="sr-only">Filter by complexity</label>
        <select id="filter-complexity" value={filters.complexity} onChange={(e) => onFilterChange('complexity', e.target.value as Complexity)} className={selectClass}>
          {COMPLEXITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {availableDomains.length > 1 && (
          <>
            <label htmlFor="filter-source" className="sr-only">Filter by source</label>
            <select id="filter-source" value={filters.sourceDomain ?? ''} onChange={(e) => onFilterChange('sourceDomain', e.target.value || null)} className={selectClass}>
              <option value="">All sources</option>
              {availableDomains.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {query && (
            <Chip label={`"${query}"`} onDismiss={() => onQueryChange('')} />
          )}
          {filters.timeRange !== 'all' && (
            <Chip label={TIME_CHIP_LABELS[filters.timeRange]} onDismiss={() => onFilterChange('timeRange', 'all')} />
          )}
          {filters.complexity !== 'all' && (
            <Chip label={COMPLEXITY_CHIP_LABELS[filters.complexity]} onDismiss={() => onFilterChange('complexity', 'all')} />
          )}
          {filters.sourceDomain && (
            <Chip label={filters.sourceDomain} onDismiss={() => onFilterChange('sourceDomain', null)} />
          )}
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-sage font-medium hover:text-sage-dark focus:outline-none focus:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

function Chip({ label, onDismiss }: { label: string; onDismiss: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-0.5 text-xs font-medium text-sage">
      {label}
      <button
        type="button"
        onClick={onDismiss}
        aria-label={`Remove ${label} filter`}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-sage/20 focus:outline-none focus:ring-1 focus:ring-sage"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </span>
  )
}
