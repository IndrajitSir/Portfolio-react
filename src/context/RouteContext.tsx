import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { scrollToSectionWhenReady, scrollBehavior, sectionFromHash } from '@/utils'
import {
  HOME_ROUTE,
  RouteContext,
  SIDE_MISSIONS_ROUTE,
  type RouteState,
} from './route'

const readHash = (): string => {
  if (typeof window === 'undefined') return HOME_ROUTE
  const raw = window.location.hash.replace(/^#/, '')
  return raw.startsWith('/') ? raw : HOME_ROUTE
}

export function RouteProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(readHash)
  const pendingSection = useRef<string | null>(null)
  const isFirstRun = useRef(true)

  // Keep state in sync with browser back/forward and manual hash edits.
  useEffect(() => {
    const onHashChange = () => setPath(readHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // After a route change, land at the top of the new page — or, when coming back
  // to the portfolio with a target section, scroll to that section instead.
  useEffect(() => {
    const section = pendingSection.current
    pendingSection.current = null

    // First run: the browser attempts the native anchor jump from the URL hash,
    // but below-fold sections are lazy-loaded, so that jump usually runs before
    // the target exists. Re-run it (retried) for a section hash; for a bare
    // route like `#/side-missions` the page simply starts at the top already.
    if (isFirstRun.current) {
      isFirstRun.current = false
      const target = section ?? sectionFromHash(window.location.hash)
      if (target) scrollToSectionWhenReady(target)
      return
    }

    if (section) {
      scrollToSectionWhenReady(section)
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [path])

  const navigate = useCallback<RouteState['navigate']>((next, opts) => {
    const target = next.startsWith('/') ? next : HOME_ROUTE
    if (opts?.section && target === HOME_ROUTE) pendingSection.current = opts.section

    const hash = `#${target}`
    if (window.location.hash === hash) {
      // Same route: nothing to re-render, but still honour a section request.
      if (opts?.section) {
        scrollToSectionWhenReady(opts.section)
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: scrollBehavior('smooth') })
      }
      return
    }

    if (opts?.replace) {
      window.history.replaceState(null, '', hash)
      setPath(target)
    } else {
      window.location.hash = hash
    }
  }, [])

  const value = useMemo<RouteState>(() => {
    const isSideMissions = path === SIDE_MISSIONS_ROUTE || path.startsWith(`${SIDE_MISSIONS_ROUTE}/`)
    const segment = path.startsWith(`${SIDE_MISSIONS_ROUTE}/`)
      ? path.slice(SIDE_MISSIONS_ROUTE.length + 1)
      : null
    return {
      path,
      isSideMissions,
      missionId: segment && segment.length > 0 ? decodeURIComponent(segment) : null,
      navigate,
    }
  }, [path, navigate])

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
}

export default RouteProvider
