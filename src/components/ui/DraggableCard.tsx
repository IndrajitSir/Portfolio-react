import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type ValueAnimationTransition,
} from 'framer-motion'
import { EASE_OUT_EXPO } from '@/utils/motion'

/**
 * A physical, grabbable card that always springs back to where it started.
 *
 * The gesture is a *visual* one: nothing here touches layout, so the card keeps
 * its dimensions, its grid cell and its effect on neighbouring content even
 * mid-drag. Only a transform moves, and on release the transform is animated
 * back to zero — the card can never be dropped somewhere and left there.
 *
 * Two deliberate choices keep it from fighting the page:
 *
 *  · The drag begins on `pointerdown`, but nothing moves until the pointer has
 *    travelled a few pixels. A click on a link or button inside the card is
 *    therefore a click, not a one-pixel drag — and the listeners live on the
 *    window for the duration, so the gesture survives the pointer leaving the
 *    card and never needs `setPointerCapture` (which would swallow the click).
 *  · Interactive children keep their own gesture. A pointerdown on a link,
 *    button or field is left alone; on touch, where a body drag would steal the
 *    scroll, the dedicated grip is the only handle. That is the whole reason the
 *    grip exists.
 *
 * The motion itself is framer-motion springs on motion values, so following the
 * pointer is a transform write per frame with no React render. Rotation and the
 * lift are held back for `prefers-reduced-motion`, which gets a plain, short
 * tween home instead of a bounce.
 */

/** Anything that owns its own pointer gesture stays out of the drag. */
const INTERACTIVE_SELECTOR =
  'a[href], button, input, textarea, select, label, [role="button"], [data-no-drag]'

export interface DraggableCardProps {
  children: ReactNode
  /** Classes for the moving surface (sizing, radius — never position in flow). */
  className?: string
  /** Classes for the static outer wrapper. */
  wrapperClassName?: string
  /** Travelled pixels before resistance grows. */
  maxTravel?: number
  /** How much past `maxTravel` a drag can stretch (fraction, per pixel). */
  elastic?: number
  /** Spring that carries the card home. */
  spring?: ValueAnimationTransition<number>
  /** Peak rotation at full travel, in degrees. */
  rotate?: number
  /** Scale applied while gripped. */
  dragScale?: number
  /** Render the grab handle. Touch drags require it; fine pointers can grab anywhere. */
  grip?: boolean
  /** Accent for the grip and the lift tint. */
  accent?: string
  /** Suspend the whole gesture. */
  disabled?: boolean
}

const DEFAULT_SPRING: ValueAnimationTransition<number> = {
  type: 'spring',
  stiffness: 240,
  damping: 15,
  mass: 0.9,
}

export default function DraggableCard({
  children,
  className = '',
  wrapperClassName = '',
  maxTravel = 120,
  elastic = 0.34,
  spring = DEFAULT_SPRING,
  rotate: rotateDeg = 5.5,
  dragScale = 1.025,
  grip = true,
  accent = 'var(--accent-teal)',
  disabled = false,
}: DraggableCardProps) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const rig = useTransform(x, [-maxTravel, maxTravel], [-rotateDeg, rotateDeg])
  const [dragging, setDragging] = useState(false)

  /** Teardown for the in-flight gesture, so an unmount mid-drag leaves nothing. */
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => () => cleanupRef.current?.(), [])

  /**
   * Rubber-band travel: linear up to `maxTravel`, then increasingly resistant,
   * with a hard ceiling so a determined drag cannot fling the card across the
   * page. Symmetric, so a release from any direction returns the same distance.
   */
  const bound = (v: number): number => {
    const a = Math.abs(v)
    if (a <= maxTravel) return v
    const past = Math.min((a - maxTravel) * elastic, maxTravel * 0.55)
    return Math.sign(v) * (maxTravel + past)
  }

  const beginDrag = (e: ReactPointerEvent<HTMLElement>, fromGrip: boolean) => {
    if (disabled) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const target = e.target as Element
    // A link, button or field handles its own gesture — except the grip, which is
    // the one element in the card that means "drag me".
    if (!fromGrip && target.closest(INTERACTIVE_SELECTOR)) return
    // On touch, a body grab would fight the native scroll; the grip is the handle.
    if (e.pointerType === 'touch' && !fromGrip) return

    const id = e.pointerId
    const startX = e.clientX
    const startY = e.clientY
    // The grip is an explicit handle, so it drags at once; a body grab waits for
    // a few pixels so a click stays a click.
    const threshold = fromGrip ? 0 : 4
    let moved = false

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!moved) {
        if (Math.hypot(dx, dy) < threshold) return
        moved = true
        setDragging(true)
        if (!reduceMotion) scale.set(dragScale)
        document.body.style.cursor = 'grabbing'
      }
      // Stop the browser from starting a text/image drag under the pointer.
      ev.preventDefault()
      x.set(bound(dx))
      y.set(bound(dy))
    }

    const finish = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return
      cleanupRef.current?.()
      if (!moved) return
      animate(x, 0, reduceMotion ? { duration: 0.3, ease: EASE_OUT_EXPO } : spring)
      animate(y, 0, reduceMotion ? { duration: 0.3, ease: EASE_OUT_EXPO } : spring)
      if (!reduceMotion) animate(scale, 1, { duration: 0.22, ease: EASE_OUT_EXPO })
      setDragging(false)
    }

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      document.body.style.cursor = ''
      cleanupRef.current = null
    }
    cleanupRef.current = cleanup

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }

  return (
    <div className={wrapperClassName} style={{ position: 'relative' }}>
      <motion.div
        className={className}
        onPointerDown={(e) => beginDrag(e, false)}
        style={{
          position: 'relative',
          zIndex: dragging ? 40 : undefined,
          x,
          y,
          scale,
          rotate: reduceMotion ? 0 : rig,
          transformOrigin: 'center',
          willChange: dragging ? 'transform' : undefined,
          // A soft lift while gripped — the card reads as picked up off the page.
          // Held back under reduced motion, which wants the move and nothing more.
          filter: dragging && !reduceMotion ? 'drop-shadow(0 26px 34px rgba(0, 0, 0, 0.55))' : undefined,
        }}
      >
        {grip && (
          <span
            data-drag-grip=""
            aria-hidden="true"
            onPointerDown={(e) => {
              e.stopPropagation()
              beginDrag(e, true)
            }}
            // `touch-action: none` here (and only here) is what lets a finger drag
            // the card without the page scrolling out from under it.
            style={{ touchAction: 'none' }}
            className="absolute left-1/2 top-1.5 z-20 flex h-6 w-16 -translate-x-1/2 cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
          >
            <span
              className="h-1 w-7 rounded-full transition-opacity duration-200"
              style={{ background: accent, opacity: dragging ? 0.75 : 0.32 }}
            />
          </span>
        )}
        {children}
      </motion.div>
    </div>
  )
}
