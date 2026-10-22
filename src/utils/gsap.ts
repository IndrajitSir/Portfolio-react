import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * The single GSAP entry point for the portfolio.
 *
 * Imports from `gsap` elsewhere resolve to this same instance, but plugins are
 * registered once here rather than in every consumer — registering ScrollTrigger
 * twice is harmless, yet having one owner keeps the dependency graph obvious:
 *
 *   GSAP + ScrollTrigger  major timelines, scroll-triggered sequences
 *   Lenis                 the page's only smooth-scroll controller
 *   anime.js              localised micro-interactions
 *   Three.js / GLSL       everything inside a canvas (never tweened by GSAP
 *                         while the visitor is dragging it)
 */
gsap.registerPlugin(ScrollTrigger)

/**
 * ScrollTrigger must be told when Lenis moves the page, and Lenis's frame loop
 * is driven by GSAP's ticker in `useLenis` — one clock for both.
 */
export { gsap, ScrollTrigger }
