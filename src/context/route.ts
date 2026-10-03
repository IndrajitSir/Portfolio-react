import { createContext, useCallback, useContext } from 'react'
import { scrollToSectionWhenReady } from '@/utils'

/**
 * Minimal hash router — context, constants and hooks.
 *
 * The portfolio already navigates with hashes (`#about`, `#projects`) and has no
 * routing dependency, so the Side Missions destination is layered on top of the
 * same primitive rather than pulling in a router library:
 *
 *   `#about`              → section anchor  → route `/`
 *   `#/side-missions`     → route `/side-missions`
 *   `#/side-missions/:id` → route `/side-missions/:id`
 *
 * Any hash that does not start with `/` is treated as a section anchor on the
 * home route, so all existing navigation keeps working untouched.
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
 * Navigate to a portfolio section. On the home route this is a plain smooth
 * scroll; from the Side Missions route it returns home first, then scrolls.
 */
export function useSectionNavigation() {
  const { path, navigate } = useRoute()
  return useCallback(
    (sectionId: string) => {
      if (path === HOME_ROUTE) {
        // Sections are lazy-loaded, so tolerate a brief delay before they exist.
        scrollToSectionWhenReady(sectionId)
      } else {
        navigate(HOME_ROUTE, { section: sectionId })
      }
    },
    [path, navigate],
  )
}
