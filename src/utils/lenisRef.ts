import type Lenis from 'lenis'

/**
 * A single place to reach the running Lenis instance.
 *
 * Lenis takes over the scroll position, so a plain `scrollIntoView` is undone
 * on the next animation frame. Every programmatic scroll in the portfolio has
 * to go *through* Lenis instead. Registering the instance here keeps that
 * knowledge in one module rather than threading it through every component.
 *
 * The type-only import avoids loading Lenis for consumers that never scroll
 * programmatically.
 */

let instance: Lenis | null = null

export const setLenis = (lenis: Lenis | null): void => {
  instance = lenis
}

export const getLenis = (): Lenis | null => instance