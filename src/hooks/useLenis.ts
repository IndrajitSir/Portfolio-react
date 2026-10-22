import { useEffect } from 'react'
import Lenis from 'lenis'
import { setLenis } from '@/utils/lenisRef'
import { gsap, ScrollTrigger } from '@/utils/gsap'

/**
 * Smooth scrolling for the whole page — the only scroll controller.
 *
 * Four things beyond the usual setup matter here:
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
 *  3. ScrollTrigger and Lenis share one clock. GSAP's ticker calls `lenis.raf`
 *     (instead of a second `requestAnimationFrame` loop), and every Lenis scroll
 *     event updates ScrollTrigger. Running both independently would let the two
 *     disagree about scroll position by a frame — the classic jitter that makes
 *     scroll-driven sequences look broken.
 *
 *  4. Locomotive Scroll is deliberately absent. It would be a second controller
 *     for the same scroll container, and it would take over the document
 *     transform that Lenis already owns.
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

    // Keep ScrollTrigger's notion of scroll position in lockstep with Lenis.
    lenis.on('scroll', ScrollTrigger.update)

    // One clock: GSAP's ticker advances Lenis. The previous version ran its own
    // rAF loop alongside GSAP's, which is two loops doing the same work.
    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // The document keeps growing as sections mount and scans decode. Lenis
    // needs a resize on every change; ScrollTrigger only needs a refresh when
    // the document's *height* settles at a new value. Refreshing on every
    // observer callback is a resize/refresh feedback loop, so the height is
    // compared first and the refresh is debounced.
    let lastHeight = document.body.scrollHeight
    let refreshTimer = 0
    const observer = new ResizeObserver(() => {
      lenis.resize()
      const height = document.body.scrollHeight
      if (height === lastHeight) return
      lastHeight = height
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 220)
    })
    observer.observe(document.body)

    return () => {
      observer.disconnect()
      window.clearTimeout(refreshTimer)
      lenis.off('scroll', ScrollTrigger.update)
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])
}
