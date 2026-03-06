import type { RefObject } from 'react'

interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
  panelSide: 'left' | 'right'
  buttonRef?: RefObject<HTMLButtonElement | null>
}

export default function HamburgerButton({ isOpen, onClick, panelSide, buttonRef }: HamburgerButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="side-panel"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className={`fixed top-4 z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg bg-white/90 shadow-md backdrop-blur-sm border border-mist-pale hover:bg-surface focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 motion-safe:transition-all duration-200 dark:bg-forest/90 dark:border-forest ${
        panelSide === 'left' ? 'left-4' : 'right-4'
      }`}
    >
      <span
        aria-hidden="true"
        className={`block h-0.5 w-5 rounded-full bg-forest motion-safe:transition-transform duration-200 dark:bg-cream ${
          isOpen ? 'translate-y-2 rotate-45' : ''
        }`}
      />
      <span
        aria-hidden="true"
        className={`block h-0.5 w-5 rounded-full bg-forest motion-safe:transition-opacity duration-200 dark:bg-cream ${
          isOpen ? 'opacity-0' : ''
        }`}
      />
      <span
        aria-hidden="true"
        className={`block h-0.5 w-5 rounded-full bg-forest motion-safe:transition-transform duration-200 dark:bg-cream ${
          isOpen ? '-translate-y-2 -rotate-45' : ''
        }`}
      />
    </button>
  )
}
