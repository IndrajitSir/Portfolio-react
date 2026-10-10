import { useEffect, useState } from 'react'
import { navItems } from '@/data/navigation'

/**
 * The section id that currently owns the middle of the screen, or '' when none
 * does (or when `enabled` is false — the Side Missions route has none of these
 * anchors, so resolving there would only leave a stale highlight).
 *
 * Resolved from scroll position rather than with IntersectionObserver: every
 * section below the hero is a lazy chunk, the sections are far taller than the
 * viewport, and a fast smooth scroll can carry one across a threshold without
 * the observer ever reporting it. Asking "which section owns the middle of the
 * screen?" answers correctly whatever has mounted by then, in one pass.
 *
 * This lives here rather than inside the Navbar because the Navbar is no longer
 * its only consumer: Strobi reads it too, so the avatar can change expression as
 * the reader travels the page. One resolver, two readers — they can never
 * disagree about where the reader is.
 */
export const useActiveSection = (enabled = true): string => {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (!enabled) {
      setActive('')
      return
    }
    let frame = 0

    const resolve = () => {
      frame = 0
      const line = window.innerHeight / 2
      let current = ''
      navItems.forEach(({ href }) => {
        const id = href.replace('#', '')
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      })
      // Same answer as last frame → no re-render.
      setActive((prev) => (prev === current ? prev : current))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(resolve)
    }

    resolve()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [enabled])

  return active
}
