import { createContext, useCallback, useContext } from 'react'
import { scrollToSection } from '@/utils'

/**
 * Minimal hash router — context, constants and hooks.
 *
 * The portfolio already navigates with hashes (`#about`, `#projects`) and has no
 * routing dependency, so the Side Missions destination is layered on top of the
 * same primitive rather than pulling in a router library:
 *
 *   `#about`              → chapter page   → route `/`, section `about`
 *   `#/side-missions`     → route `/side-missions`
 *   `#/side-missions/:id` → route `/side-missions/:id`
 *
 * The home route is the hero and the whale; every portfolio chapter is its own
 * page reached from a container (or from any section link), because the whale is
 * the end of the free scroll, not the middle of a long page.
 *
 * Kept free of JSX so the provider component can live in its own file and the
 * module stays fast-refresh friendly.
 */

export const HOME_ROUTE = '/'
export const SIDE_MISSIONS_ROUTE = '/side-missions'

export interface RouteState {
  /** Current path, e.g. `/`, `/side-missions`, `/side-missions/grapify`. */
  path: string
  /** True when the current path is inside the Side Missions experience. */
  isSideMissions: boolean
  /** Selected mission id when on a mission detail route, otherwise null. */
  missionId: string | null
  /** Section id named by a plain section hash (`#projects`), otherwise null. */
  sectionPage: string | null
  /**
   * Navigate to a route. When returning to the home route you may pass the id of
   * a section to scroll to once the portfolio has rendered.
   */
  navigate: (path: string, opts?: { section?: string; replace?: boolean }) => void
}

export const RouteContext = createContext<RouteState | null>(null)

export function useRoute(): RouteState {
  const ctx = useContext(RouteContext)
  if (!ctx) throw new Error('useRoute must be used within a RouteProvider')
  return ctx
}

/**
 * Navigate to a portfolio section: a smooth scroll when that section is already
 * on screen, otherwise the hash change that opens its chapter page.
 */
export function useSectionNavigation() {
  return useCallback((sectionId: string) => scrollToSection(sectionId), [])
}
