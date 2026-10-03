import { useEffect } from 'react'
import Lenis from 'lenis'

export const useLenis = (): void => {
  useEffect(() => {
    // Smooth scrolling is itself a motion effect. Visitors who ask for reduced
    // motion get native scrolling instead of the eased inertia.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])
}
