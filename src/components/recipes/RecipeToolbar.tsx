import type { SortField, TimeRange, Complexity, FilterState } from '@/hooks/useRecipeFilters'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
        <Input
          ref={searchRef}
          id="recipe-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by title, ingredient, or source..."
          className="pl-9"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/40 dark:text-cream-text/40"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-forest/40 hover:text-forest focus:outline-none focus:ring-2 focus:ring-sage dark:text-cream-text/40 dark:hover:text-cream"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>

      {/* Sort + Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="recipe-sort" className="sr-only">Sort by</label>
        <Select value={sortField} onValueChange={(v) => onSortChange(v as SortField)}>
          <SelectTrigger id="recipe-sort" size="sm" className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label htmlFor="filter-time" className="sr-only">Filter by time</label>
        <Select value={filters.timeRange} onValueChange={(v) => onFilterChange('timeRange', v as TimeRange)}>
          <SelectTrigger id="filter-time" size="sm" className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label htmlFor="filter-complexity" className="sr-only">Filter by complexity</label>
        <Select value={filters.complexity} onValueChange={(v) => onFilterChange('complexity', v as Complexity)}>
          <SelectTrigger id="filter-complexity" size="sm" className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMPLEXITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {availableDomains.length > 1 && (
          <>
            <label htmlFor="filter-source" className="sr-only">Filter by source</label>
            <Select
              value={filters.sourceDomain ?? ''}
              onValueChange={(v) => onFilterChange('sourceDomain', v || null)}
            >
              <SelectTrigger id="filter-source" size="sm" className="text-xs">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sources</SelectItem>
                {availableDomains.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    <Badge variant="secondary" className="gap-1 bg-sage/10 text-sage hover:bg-sage/10">
      {label}
      <button
        type="button"
        onClick={onDismiss}
        aria-label={`Remove ${label} filter`}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-sage/20 focus:outline-none focus:ring-1 focus:ring-sage"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </Badge>
  )
}
