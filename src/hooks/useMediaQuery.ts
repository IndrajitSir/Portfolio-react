import { useEffect, useState } from 'react'

/**
 * Track a CSS media query from React.
 *
 * Used where the *structure* has to change rather than just the styling — the
 * journey gives each chapter its own stage on a phone, and pins one stage beside
 * the text on a desktop. Those are two different trees, so a CSS class cannot
 * express the difference and the breakpoint has to be read in JavaScript.
 *
 * The initial value is read synchronously so the first paint is already correct;
 * there is no server render in this app, so there is nothing to mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}