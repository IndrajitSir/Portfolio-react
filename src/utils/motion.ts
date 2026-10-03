/**
 * Shared motion language.
 *
 * Every storytelling animation in the portfolio reads its timing from here, so
 * the whole site speaks one motion dialect: entrances settle with the same
 * ease-out-expo curve, state changes use the same standard curve, and reveals
 * use the same viewport margin. Reuse these instead of inventing new timings.
 */

/** Entrances / reveals — decelerating, never bouncy. */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Interactive state changes (hover, expand, swap). */
export const EASE_STANDARD: [number, number, number, number] = [0.4, 0, 0.2, 1]

/** Duration scale in seconds. */
export const DURATION = {
  /** Micro feedback: colour/opacity transitions. */
  micro: 0.18,
  /** Small state changes: expand a panel, swap a detail. */
  quick: 0.28,
  /** Default content transition. */
  base: 0.45,
  /** Section reveals and large element entrances. */
  reveal: 0.7,
  /** Hero-scale entrances. */
  cinematic: 1,
} as const

/** Shared `viewport` prop for scroll reveals — consistent trigger depth. */
export const REVEAL_VIEWPORT = { once: true, margin: '-70px' } as const

/** Spring for pointer-following / magnetic motion. */
export const SPRING_POINTER = { type: 'spring', stiffness: 260, damping: 18, mass: 0.5 } as const

/** Spring for layout indicators (tab rails, active markers). */
export const SPRING_LAYOUT = { type: 'spring', stiffness: 380, damping: 32 } as const