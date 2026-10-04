import { useEffect } from 'react'
import Lenis from 'lenis'
import { setLenis } from '@/utils/lenisRef'

/**
 * Smooth scrolling for the whole page.
 *
 * Two things beyond the usual setup matter here:
 *
 *  1. The instance is published through `setLenis`, because Lenis owns the
 *     scroll position — any code that scrolls programmatically must drive Lenis
 *     rather than the window, or its position is reverted on the next frame.
 *
 *  2. A `ResizeObserver` keeps Lenis's scroll limits correct. Sections are lazy
 *     loaded, so the document is still growing long after Lenis has cached its
 *     maximum scroll offset. Without this, links to lower sections silently
 *     fail to travel because the target is past a stale limit.
 *
 * Visitors who ask for reduced motion get native scrolling and no Lenis at all.
 */
export const useLenis = (): void => {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    setLenis(lenis)

    // The document keeps growing as sections mount and scans decode.
    const observer = new ResizeObserver(() => lenis.resize())
    observer.observe(document.body)

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      observer.disconnect()
      lenis.destroy()
      setLenis(null)
    }
  }, [])
}