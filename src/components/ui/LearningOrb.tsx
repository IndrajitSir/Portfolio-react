import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { EASE_OUT_EXPO } from '@/utils/motion'

/**
 * A small, grabbable knowledge orb for the Learning section.
 *
 * A sphere is the one shape that *wants* to be dragged — it rolls, it squashes,
 * it settles — so this is the playful counterweight to the Credentials card's
 * physical weight: where that card is dense and deliberate, the orb is light and
 * elastic. It is deliberately the only decorative object added, and it floats in
 * its own bounded box so travelling can never nudge the timeline beside it.
 *
 * The whole thing is a transform: the orb sits at a fixed spot in its box and
 * only `x`/`y`/`scale`/`rotate` move, so a drag cannot reflow a single pixel of
 * the section. Release always springs back to the resting centre.
 *
 * Its size is a CSS expression, not a constant, because it sits on the Learning
 * section's eyebrow line and has to shrink as that line runs out of room — see
 * `SectionLabel`'s `trailing` slot. Everything else is derived from it: the play
 * area, and the drag bounds, which are measured off the rendered element at the
 * start of every gesture so a resized orb still travels the right distance.
 *
 * The box is `1.88 × size` and the orb sits centred in it, so the box needs
 * `-0.44 × size` of vertical margin on both sides to contribute only its own
 * diameter to the line it lives on — without that, a 60px orb would reserve
 * 128px of height in a 16px-tall eyebrow row.
 *
 * `prefers-reduced-motion` keeps the orb still in every sense that matters — no
 * spin on the ring, no squash, no bounce home, just a short glide.
 */

/** How far the orb may travel from centre, as a fraction of its diameter. */
const TRAVEL_RATIO = 0.44
/** The bounding box, as a multiple of the orb's diameter. */
const BOX_RATIO = 1 + TRAVEL_RATIO * 2
/** Reflection of the box ratio, for the negative margins above. */
export const ORB_BOX_MARGIN_RATIO = TRAVEL_RATIO

/** Default size: compact enough to sit on the eyebrow line at every width. */
const DEFAULT_SIZE = 'clamp(38px, 4.6vw, 60px)'

const KIND = 'a[href], button, input, textarea, select, label, [role="button"]'

/** A softer, bouncier spring than the card's — this thing is meant to wobble. */
const RETURN_SPRING = { type: 'spring', stiffness: 205, damping: 12, mass: 0.85 } as const
const SHAPE_SPRING = { type: 'spring', stiffness: 320, damping: 14, mass: 0.6 } as const

export interface LearningOrbProps {
  className?: string
  /** Accent for the ring, the core and the glow. */
  accent?: string
  /** Any CSS length (or `clamp()`) — the play area and travel scale with it. */
  size?: string
}

export default function LearningOrb({
  className = '',
  accent = 'var(--accent-teal)',
  size = DEFAULT_SIZE,
}: LearningOrbProps) {
  const reduceMotion = useReducedMotion()
  const orbRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scaleX = useMotionValue(1)
  const scaleY = useMotionValue(1)
  const rotate = useMotionValue(0)
  const [dragging, setDragging] = useState(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => () => cleanupRef.current?.(), [])

  const beginDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if ((e.target as Element).closest(KIND)) return
    const id = e.pointerId
    const startX = e.clientX
    const startY = e.clientY
    let lastX = startX
    let lastY = startY
    let moved = false
    // Measured once per gesture: the orb's size is a CSS expression, so this is
    // the only way to know how far this particular orb may travel.
    const travel = (e.currentTarget.getBoundingClientRect().width || 60) * TRAVEL_RATIO

    /** Rubber band past the limit, with a ceiling so it cannot leave the box far. */
    const bound = (v: number) => {
      const a = Math.abs(v)
      if (a <= travel) return v
      return Math.sign(v) * Math.min(travel + (a - travel) * 0.3, travel * 1.4)
    }

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!moved) {
        if (Math.hypot(dx, dy) < 3) return
        moved = true
        setDragging(true)
      }
      ev.preventDefault()
      x.set(bound(dx))
      y.set(bound(dy))

      if (!reduceMotion) {
        // Squash along the direction of travel: fast horizontal → wider and
        // shorter; fast vertical → taller and narrower. Capped so it stays a
        // subtle deformation rather than a cartoon.
        const vx = ev.clientX - lastX
        const vy = ev.clientY - lastY
        const stretch = Math.min(Math.hypot(vx, vy) * 0.012, 0.12)
        const horizontal = Math.abs(vx) >= Math.abs(vy)
        scaleX.set(horizontal ? 1 + stretch : 1 - stretch * 0.7)
        scaleY.set(horizontal ? 1 - stretch * 0.7 : 1 + stretch)
        rotate.set(bound(dx) * 0.1)
        lastX = ev.clientX
        lastY = ev.clientY
      }
    }

    const finish = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return
      cleanupRef.current?.()
      if (!moved) return
      const home = reduceMotion ? { duration: 0.32, ease: EASE_OUT_EXPO } : RETURN_SPRING
      animate(x, 0, home)
      animate(y, 0, home)
      animate(scaleX, 1, reduceMotion ? { duration: 0.2, ease: EASE_OUT_EXPO } : SHAPE_SPRING)
      animate(scaleY, 1, reduceMotion ? { duration: 0.2, ease: EASE_OUT_EXPO } : SHAPE_SPRING)
      animate(rotate, 0, reduceMotion ? { duration: 0.2, ease: EASE_OUT_EXPO } : SHAPE_SPRING)
      setDragging(false)
    }

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      cleanupRef.current = null
    }
    cleanupRef.current = cleanup
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={
        {
          '--orb-size': size,
          width: `calc(var(--orb-size) * ${BOX_RATIO})`,
          height: `calc(var(--orb-size) * ${BOX_RATIO})`,
          // Give back the box's own padding vertically, so the orb contributes
          // roughly its diameter to whatever row it is placed in.
          marginTop: `calc(var(--orb-size) * -${ORB_BOX_MARGIN_RATIO})`,
          marginBottom: `calc(var(--orb-size) * -${ORB_BOX_MARGIN_RATIO})`,
        } as CSSProperties
      }
    >
      <motion.div
        ref={orbRef}
        role="img"
        aria-label="Learning orb — drag it and let it settle"
        onPointerDown={beginDrag}
        className="absolute flex cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
        style={{
          left: `calc(var(--orb-size) * ${TRAVEL_RATIO})`,
          top: `calc(var(--orb-size) * ${TRAVEL_RATIO})`,
          width: 'var(--orb-size)',
          height: 'var(--orb-size)',
          x,
          y,
          scaleX,
          scaleY,
          rotate: reduceMotion ? 0 : rotate,
          touchAction: 'none',
          willChange: dragging ? 'transform' : undefined,
          // Dark glass: a shaded body, a fine lit rim and a soft accent halo.
          background:
            'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 46%, transparent 72%), var(--panel)',
          border: `1px solid color-mix(in srgb, ${accent} 34%, var(--border))`,
          boxShadow: dragging
            ? `inset 0 1px 0 rgba(255,255,255,0.10), 0 0 34px color-mix(in srgb, ${accent} 40%, transparent)`
            : `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px var(--glow-teal)`,
        }}
      >
        {/* Technical markings: faint concentric rings and a slowly turning tick ring. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ opacity: 0.5 }}
        >
          <circle cx="50" cy="50" r="30" fill="none" stroke={accent} strokeOpacity="0.22" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent-indigo)" strokeOpacity="0.16" strokeWidth="0.7" />
          <circle cx="50" cy="50" r="22" fill="none" stroke={accent} strokeOpacity="0.14" strokeWidth="0.6" />
        </svg>

        {/* A slow, low-opacity dashed ring — motion you notice only if you look. */}
        <span
          aria-hidden="true"
          className="orb-ring pointer-events-none absolute rounded-full"
          style={{
            inset: 'calc(var(--orb-size) * 0.08)',
            border: `1px dashed color-mix(in srgb, ${accent} 30%, transparent)`,
            animation: reduceMotion ? undefined : 'learning-orb-spin 26s linear infinite',
          }}
        />

        <span className="relative flex flex-col items-center leading-none" aria-hidden="true">
          <span className="font-display" style={{ color: accent, fontSize: 'calc(var(--orb-size) * 0.26)' }}>
            ∞
          </span>
          <span
            className="font-mono-code uppercase"
            style={{ color: 'var(--text-muted)', fontSize: 'calc(var(--orb-size) * 0.085)', letterSpacing: '0.22em' }}
          >
            learn
          </span>
        </span>

        {/* Specular highlight, sold as light rather than a shape. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            left: '26%',
            top: '20%',
            width: 'calc(var(--orb-size) * 0.12)',
            height: 'calc(var(--orb-size) * 0.12)',
            background: 'rgba(255,255,255,0.35)',
            filter: 'blur(3px)',
          }}
        />
      </motion.div>
    </div>
  )
}
