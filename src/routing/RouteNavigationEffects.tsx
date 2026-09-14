import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

function resetScrollPosition() {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

/** Reset scroll (and mobile focus-zoom) when the SPA route changes. */
export function RouteNavigationEffects() {
  const { pathname, search } = useLocation()

  useLayoutEffect(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      active.blur()
    }

    resetScrollPosition()
  }, [pathname, search])

  return null
}
