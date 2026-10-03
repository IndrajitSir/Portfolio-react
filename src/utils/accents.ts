import type { AccentKey } from '@/types'

/** Theme-aware CSS colour for an accent key. */
export const accentColor: Record<AccentKey, string> = {
  teal: 'var(--accent-teal)',
  indigo: 'var(--accent-indigo)',
  orange: 'var(--accent-orange)',
  violet: 'var(--accent-violet)',
  green: 'var(--accent-green)',
}

/** rgb triplet (no alpha) for an accent key — matches the canvas palette. */
export const accentRgb: Record<AccentKey, string> = {
  teal: '94,234,212',
  indigo: '129,140,248',
  orange: '251,146,60',
  violet: '167,139,250',
  green: '37,211,102',
}
