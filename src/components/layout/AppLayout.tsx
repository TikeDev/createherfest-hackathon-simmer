import { useState, useRef, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useViewPreferences } from '@/contexts/ViewPreferencesContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import HamburgerButton from './HamburgerButton'
import SidePanel from './SidePanel'

export default function AppLayout() {
  const { prefs } = useViewPreferences()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  // Desktop defaults open, mobile defaults closed
  useEffect(() => {
    setIsMenuOpen(isDesktop)
  }, [isDesktop])

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const closeMenu = () => {
    setIsMenuOpen(false)
    // Return focus to hamburger on mobile close
    if (!isDesktop) {
      setTimeout(() => hamburgerRef.current?.focus(), 50)
    }
  }

  const panel = (
    <SidePanel
      isOpen={isMenuOpen}
      onClose={closeMenu}
      isMobile={!isDesktop}
    />
  )

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-sage focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen">
        {prefs.panelSide === 'left' && panel}

        <div className="flex flex-1 flex-col min-w-0">
          <HamburgerButton
            isOpen={isMenuOpen}
            onClick={toggleMenu}
            panelSide={prefs.panelSide}
            buttonRef={hamburgerRef}
          />
          <main id="main-content" className="flex-1">
            <Outlet />
          </main>
        </div>

        {prefs.panelSide === 'right' && panel}
      </div>
    </>
  )
}
