import { useLayoutEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { prefersReducedMotion } from '@/utils'

interface AnimeRevealOptions {
  /** Distance, in px, each element travels up into place. */
  y?: number
  /** Per-element delay, in ms. */
  stagger?: number
  /** Duration, in ms. */
  duration?: number
}

/**
 * A small Anime.js scroll-reveal for a *region* of the page.
 *
 * Every descendant carrying `data-reveal` is faded and lifted into place, one
 * after another, the first time the region scrolls into view. The elements are
 * rendered in their finished state in the markup, so if the engine never runs
 * (reduced motion, a thrown error) the content is simply there — the reveal is
 * never load-bearing.
 *
 * The arming (opacity 0 / translate) happens in `useLayoutEffect`, before the
 * browser paints, so a reveal can never flash the settled layout first.
 */
export function useAnimeReveal<T extends HTMLElement = HTMLDivElement>({
  y = 16,
  stagger: step = 65,
  duration = 700,
}: AnimeRevealOptions = {}) {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (targets.length === 0) return

    // Reduced motion: leave the finished state untouched, run nothing.
    if (prefersReducedMotion()) return

    for (const el of targets) {
      el.style.opacity = '0'
      el.style.transform = `translateY(${y}px)`
    }

    const settle = () => {
      for (const el of targets) {
        el.style.removeProperty('opacity')
        el.style.removeProperty('transform')
      }
    }

    let animation: ReturnType<typeof animate> | undefined
    let played = false

    const play = () => {
      if (played) return
      played = true
      try {
        animation = animate(targets, {
          opacity: [0, 1],
          translateY: [`${y}px`, '0px'],
          duration,
          delay: stagger(step),
          ease: 'outExpo',
          onComplete: settle,
        })
      } catch {
        // If the animation engine fails for any reason, show the content.
        settle()
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            play()
            io.disconnect()
            break
          }
        }
      },
      { rootMargin: '-60px 0px -60px 0px', threshold: 0.01 },
    )
    io.observe(root)

    return () => {
      io.disconnect()
      animation?.cancel()
    }
  }, [y, step, duration])

  return ref
}
