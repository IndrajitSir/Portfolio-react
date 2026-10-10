import { useRef, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { DURATION, EASE_OUT_EXPO } from '@/utils/motion'

/**
 * Shared scroll-entrance vocabulary.
 *
 * Three primitives, one motion dialect (EASE_OUT_EXPO, DURATION.reveal):
 *
 *   MaskReveal — the content is uncovered through a moving clip mask, so a
 *                heading appears to be printed rather than faded in.
 *   SlideIn    — a horizontal entrance that gives a column a direction: text
 *                travelling in from the edge it belongs to.
 *   Parallax   — a slower-than-scroll drift on a decorative or framing layer.
 *
 * All three read `prefers-reduced-motion`. When it is set they render their
 * finished state immediately with no transform and no observer, so the content
 * is complete with every animation switched off.
 */

interface MaskRevealProps {
  children: ReactNode
  className?: string
  /** Stagger offset in seconds. */
  delay?: number
  /** `block` for headings that wrap, `inline` for a word inside a line. */
  display?: 'block' | 'inline'
  once?: boolean
}

export function MaskReveal({
  children,
  className = '',
  delay = 0,
  display = 'block',
  once = true,
}: MaskRevealProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  // Observe the *wrapper*, not the content: the content starts translated a full
  // box below the clip, so an observer on it would see zero intersection and
  // never fire. The wrapper is always in normal flow.
  const inView = useInView(ref, { once, margin: '-60px' })
  const revealed = reduceMotion || inView

  return (
    <span
      ref={ref}
      className={`${display === 'block' ? 'block' : 'inline-block'} overflow-hidden pb-[0.08em] ${className}`}
    >
      <motion.span
        className="block"
        initial={false}
        animate={revealed ? { y: '0%', opacity: 1 } : { y: '112%', opacity: 0 }}
        transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

interface SlideInProps {
  children: ReactNode
  className?: string
  /** Edge the content travels in from. */
  from?: 'left' | 'right'
  /** Travel distance in pixels. */
  distance?: number
  delay?: number
  once?: boolean
}

export function SlideIn({
  children,
  className = '',
  from = 'left',
  distance = 44,
  delay = 0,
  once = true,
}: SlideInProps) {
  const reduceMotion = useReducedMotion()
  const dir = from === 'left' ? -1 : 1

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, x: dir * distance }}
      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxProps {
  children: ReactNode
  className?: string
  /** Half the total travel, in pixels, across the element's full pass. */
  distance?: number
}

export function Parallax({ children, className = '', distance = 36 }: ParallaxProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
    // The section is code-split, so the ref can be null on the first layout
    // pass; measuring in an effect avoids framer-motion's hydration warning.
    layoutEffect: false,
  })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  return (
    <motion.div ref={ref} className={className} style={reduceMotion ? undefined : { y }}>
      {children}
    </motion.div>
  )
}
