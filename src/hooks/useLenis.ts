import { useEffect } from 'react'
import { setLenis } from '@/utils/lenisRef'

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
 *  3. Locomotive Scroll is deliberately absent. It would be a second controller
 *     for the same scroll container, and it would take over the document
 *     transform that Lenis already owns.
 *
 * Visitors who ask for reduced motion get native scrolling and no Lenis at all.
 */
export const useLenis = (): void => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let active = true
    let frame = 0
    let timeout = 0
    let idleId: number | null = null
    let lenis: import('lenis').default | null = null
    let observer: ResizeObserver | null = null
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }

    const start = async () => {
      const { default: Lenis } = await import('lenis')
      if (!active) return

      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })
      setLenis(lenis)

      // Drive Lenis directly so GSAP and ScrollTrigger stay out of the startup graph.
      const tick = (time: number) => {
        lenis?.raf(time)
        frame = window.requestAnimationFrame(tick)
      }
      frame = window.requestAnimationFrame(tick)

      // Sections mount lazily and change the document height, so refresh Lenis's limits.
      observer = new ResizeObserver(() => lenis?.resize())
      observer.observe(document.body)
    }

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(() => void start(), { timeout: 2500 })
    } else {
      timeout = window.setTimeout(() => void start(), 1200)
    }

    return () => {
      active = false
      if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId)
      window.clearTimeout(timeout)
      observer?.disconnect()
      window.cancelAnimationFrame(frame)
      lenis?.destroy()
      setLenis(null)
    }
  }, [])
}
