export * from './animations'

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

/** Smoothly scroll to an element by ID */
export const scrollToSection = (id: string): void => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/** Format a percentage value */
export const formatPct = (value: number): string => `${value}%`
