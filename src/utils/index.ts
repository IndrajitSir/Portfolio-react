// Re-exported so `@/utils` remains a single entry point for helpers and the
// shared framer-motion variants.
export * from './animations'

import { getLenis } from './lenisRef'

/** Clamp a number between min and max */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

/** Linear interpolation */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** Map value from one range to another */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin

/** Convert degrees to radians */
export const degToRad = (deg: number): number => (deg * Math.PI) / 180

/** Delay utility for async/await */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/** True when the visitor has asked the OS/browser for reduced motion. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Scroll behaviour for programmatic navigation.
 *
 * An explicit `behavior` in JS overrides the page's CSS `scroll-behavior`, so
 * every scroll helper must ask this itself — otherwise reduced-motion visitors
 * would still get eased scrolling from the JS side.
 */
export const scrollBehavior = (preferred: ScrollBehavior = 'smooth'): ScrollBehavior =>
  prefersReducedMotion() ? 'auto' : preferred

/**
 * Scroll an element into view through Lenis when it is running.
 *
 * Lenis owns the scroll position while it is active, so calling
 * `scrollIntoView` directly is undone on the next animation frame. Routing
 * through the instance is what makes in-page navigation actually move. Without
 * Lenis (reduced-motion visitors) this falls back to native scrolling.
 */
const scrollElementIntoView = (el: HTMLElement): void => {
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(el, { offset: -96, duration: 1.1 })
    return
  }
  el.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
}

/** Smoothly scroll to an element by ID, honouring reduced motion. */
export const scrollToSection = (id: string): void => {
  const el = document.getElementById(id)
  if (el) {
    scrollElementIntoView(el)
  }
}

/**
 * Scroll to a section, retrying for a few frames first.
 *
 * Below-fold sections are lazy-loaded, so a deep link or cross-route handoff can
 * run before the target exists. Retrying for ~1s bridges that gap without
 * blocking; if the section never mounts we simply give up rather than loop.
 *
 * The retry is on a timer rather than rAF because it may be waiting on a
 * network-bound chunk to mount, and a rAF loop would burn frames for no reason.
 */
export const scrollToSectionWhenReady = (id: string, attempts = 60): void => {
  let remaining = attempts
  const tryScroll = () => {
    const el = document.getElementById(id)
    if (el) {
      scrollElementIntoView(el)
      return
    }
    if (remaining-- <= 0) return
    window.setTimeout(tryScroll, 16)
  }
  tryScroll()
}

/**
 * The section id encoded in a hash, or null when the hash is a route (or empty).
 * `#about` → `about`; `#/side-missions` → null.
 */
export const sectionFromHash = (hash: string): string | null => {
  const raw = hash.replace(/^#/, '')
  if (!raw || raw.startsWith('/')) return null
  return raw
}


/** Format a percentage value */
export const formatPct = (value: number): string => `${value}%`
