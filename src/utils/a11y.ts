import type { KeyboardEvent } from 'react'

/** Arrow-key handler for roving tabindex radio groups */
export function handleRadioKeyDown<T>(
  e: KeyboardEvent,
  options: T[],
  current: T,
  onChange: (val: T) => void,
) {
  const idx = options.indexOf(current)
  if (idx === -1) return
  let next: number | null = null
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % options.length
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + options.length) % options.length
  if (e.key === 'Home') next = 0
  if (e.key === 'End') next = options.length - 1
  if (next !== null) {
    e.preventDefault()
    onChange(options[next])
    const group = (e.target as HTMLElement).closest('[role="radiogroup"]')
    const buttons = group?.querySelectorAll<HTMLElement>('[role="radio"]')
    buttons?.[next]?.focus()
  }
}
