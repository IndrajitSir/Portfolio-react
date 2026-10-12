import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

/**
 * Drives a companion element that trails the pointer and picks its own spot.
 *
 * The companion is *one* fixed element whose position is a transform written
 * once per animation frame. Nothing here calls `setState` on pointer movement —
 * a pointer crossing the screen is dozens of events a second and re-rendering
 * the companion for each would be the whole performance story. State is only
 * touched when something the UI actually depends on changes: which side of the
 * viewport the pill is resting on, whether it is visible, and whether it has
 * settled.
 *
 * Where it sits:
 *
 *  · Six candidate positions, always at a fixed clearance from the pointer, on
 *    either side and above/below. Candidate *offsets* are constant, so a frame
 *    is arithmetic and one transform write — not a layout pass.
 *  · Each candidate is scored on how far outside the viewport it would sit and
 *    on what is underneath it, sampled with `elementsFromPoint`. When all
 *    candidates are unusable the companion fades out rather than covering the
 *    content it exists to explain.
 *  · The score is re-run only after the pointer has travelled a real distance,
 *    and never more than roughly eight times a second. That budget is what keeps
 *    the hit-testing off the hot path — and, with a small bonus for staying put,
 *    what stops it oscillating between two equally-good positions.
 *
 * The element this returns is moved; it must live inside a `pointer-events-none`
 * wrapper, so the cursor can pass straight through it and it can never intercept
 * a click. The caller decides when to re-enable pointer events on the avatar's
 * button (only once the companion has settled).
 */

export type CompanionSide = 'left' | 'right'

export interface CursorCompanionState {
  /** Which half of the viewport the pill is on — steers the tip bubble. */
  side: CompanionSide
  /** False when no candidate position was safe. */
  visible: boolean
  /** True once the pointer has held still, or before it has moved at all. */
  settled: boolean
}

export interface UseCursorCompanionOptions {
  /** Off for touch, reduced motion and narrow screens — the caller docks instead. */
  enabled: boolean
  /** Clearance between the pointer and the near edge of the pill. */
  gap?: number
  /** Pointer stillness before the companion settles. */
  settleMs?: number
  /** Pointer travel that triggers a placement re-check. */
  reevalDistance?: number
  /** Floor on the interval between placement re-checks, in ms. */
  reevalIntervalMs?: number
}

export interface CursorCompanion extends CursorCompanionState {
  ref: RefObject<HTMLDivElement>
}

/** Anything that reads as "content" — used to rank a candidate position. */
const CONTENT_SELECTOR =
  'a[href], button, input, textarea, select, label, [role="button"], h1, h2, h3, h4, h5, h6, p, li, pre, code, img, svg, canvas, summary, form'
/** The subset that must never be covered at all — a hidden control is a lost control. */
const CONTROL_SELECTOR = 'a[href], button, input, textarea, select, label, [role="button"], summary'

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export function useCursorCompanion({
  enabled,
  gap = 26,
  settleMs = 1300,
  reevalDistance = 46,
  reevalIntervalMs = 120,
}: UseCursorCompanionOptions): CursorCompanion {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<CursorCompanionState>({
    side: 'right',
    visible: true,
    settled: true,
  })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (!enabled) {
      // Clear every inline override the follow loop may have written, so the
      // caller's own CSS positioning (the docked corner) takes over cleanly.
      // Without this, crossing the breakpoint away from follow would leave the
      // last transform behind and shove the docked pill off the edge of a phone.
      el.style.transform = ''
      el.style.opacity = ''
      el.style.willChange = ''
      setState((s) =>
        s.visible && s.settled && s.side === 'right'
          ? s
          : { side: 'right', visible: true, settled: true },
      )
      return
    }

    let width = el.offsetWidth || 260
    let height = el.offsetHeight || 56

    let vw = window.innerWidth
    let vh = window.innerHeight

    // Rendered position (viewport space), smoothed toward its target each frame.
    let curX = vw - width - 24
    let curY = vh - height - 24
    let pointerX = curX
    let pointerY = curY
    let hasPointer = false

    // The chosen candidate as an offset from the pointer. Constant per side, so
    // a frame never has to work out where the pill "should" be again.
    let offsetX = 0
    let offsetY = 0
    let side: CompanionSide = 'right'
    let visible = true
    let settled = true

    let forceEval = true
    let lastEvalX = Number.NaN
    let lastEvalY = Number.NaN
    let lastEvalAt = 0
    let lastMoveAt = performance.now()
    let raf = 0

    const pushState = () => {
      setState((prev) =>
        prev.side === side && prev.visible === visible && prev.settled === settled
          ? prev
          : { side, visible, settled },
      )
    }

    /** Fraction of a rectangle lying outside the viewport. */
    const outOfBounds = (x: number, y: number, w: number, h: number): number => {
      const ix = Math.max(0, Math.min(x + w, vw) - Math.max(x, 0))
      const iy = Math.max(0, Math.min(y + h, vh) - Math.max(y, 0))
      return 1 - (ix * iy) / (w * h)
    }

    /** Five sample points — four inset corners and the centre. */
    const samplePoints = (x: number, y: number, w: number, h: number): [number, number][] => {
      const ix = Math.min(9, w / 3)
      const iy = Math.min(9, h / 3)
      return [
        [x + ix, y + iy],
        [x + w - ix, y + iy],
        [x + ix, y + h - iy],
        [x + w - ix, y + h - iy],
        [x + w / 2, y + h / 2],
      ]
    }

    const candidates = () => [
      { dx: gap, dy: -height / 2 },
      { dx: -gap - width, dy: -height / 2 },
      { dx: gap * 0.7, dy: gap },
      { dx: -gap * 0.7 - width, dy: gap },
      { dx: gap * 0.7, dy: -gap - height },
      { dx: -gap * 0.7 - width, dy: -gap - height },
    ]

    const evaluate = () => {
      let best:
        | { dx: number; dy: number; score: number; oob: number; controlBlocked: boolean }
        | null = null

      for (const c of candidates()) {
        const x = pointerX + c.dx
        const y = pointerY + c.dy
        const oob = outOfBounds(x, y, width, height)
        let contentHits = 0
        let controlHits = 0
        for (const [sx, sy] of samplePoints(x, y, width, height)) {
          if (sx < 0 || sy < 0 || sx > vw || sy > vh) {
            contentHits++
            continue
          }
          let countedContent = false
          let countedControl = false
          for (const node of document.elementsFromPoint(sx, sy)) {
            if (node === document.documentElement || node === document.body) continue
            if (el.contains(node)) continue
            const match = node as Element
            if (!countedContent && match.matches?.(CONTENT_SELECTOR)) {
              contentHits++
              countedContent = true
            }
            if (!countedControl && match.matches?.(CONTROL_SELECTOR)) {
              controlHits++
              countedControl = true
            }
          }
          if (countedControl) continue
        }
        let score = oob * 60 + controlHits * 12 + contentHits * 4
        // A small bonus for the current spot: two equally-good positions should
        // not trade places every time the pointer twitches.
        if (c.dx === offsetX && c.dy === offsetY) score -= 4
        if (!best || score < best.score) {
          best = { dx: c.dx, dy: c.dy, score, oob, controlBlocked: controlHits >= 5 }
        }
      }

      if (!best) return
      offsetX = best.dx
      offsetY = best.dy
      // Fully off-screen, or every sample point is sitting on a control: there is
      // no honest place to stand, so the companion gets out of the way.
      const nextVisible = best.oob < 0.5 && !best.controlBlocked
      if (nextVisible !== visible) visible = nextVisible
      const centerX = pointerX + best.dx + width / 2
      const nextSide: CompanionSide = centerX > vw / 2 ? 'right' : 'left'
      if (nextSide !== side) side = nextSide
      pushState()
    }

    const frame = () => {
      vw = window.innerWidth
      vh = window.innerHeight
      const now = performance.now()

      if (hasPointer) {
        const moved = Math.hypot(pointerX - lastEvalX, pointerY - lastEvalY)
        if (
          forceEval ||
          (moved > reevalDistance && now - lastEvalAt > reevalIntervalMs) ||
          !Number.isFinite(lastEvalX)
        ) {
          forceEval = false
          lastEvalX = pointerX
          lastEvalY = pointerY
          lastEvalAt = now
          evaluate()
        }
      }

      // Without a pointer there is nothing to be relative to: the companion
      // holds wherever it was, so the offset never becomes a drifting target.
      const targetX = hasPointer ? pointerX + offsetX : curX
      const targetY = hasPointer ? pointerY + offsetY : curY
      curX += (targetX - curX) * 0.16
      curY += (targetY - curY) * 0.16

      const renderX = clamp(curX, 6, Math.max(6, vw - width - 6))
      const renderY = clamp(curY, 6, Math.max(6, vh - height - 6))
      el.style.transform = `translate3d(${renderX.toFixed(2)}px, ${renderY.toFixed(2)}px, 0)`
      el.style.opacity = visible ? '1' : '0'

      const nextSettled = !hasPointer || now - lastMoveAt > settleMs
      if (nextSettled !== settled) {
        settled = nextSettled
        pushState()
      }

      raf = window.requestAnimationFrame(frame)
    }

    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX
      pointerY = e.clientY
      lastMoveAt = performance.now()
      if (!hasPointer) {
        hasPointer = true
        forceEval = true
        lastEvalAt = 0
        lastEvalX = Number.NaN
      }
    }

    const onPointerLeave = () => {
      hasPointer = false
      visible = false
      settled = false
      pushState()
    }

    const onViewportChange = () => {
      forceEval = true
      lastEvalAt = 0
    }

    const ro = new ResizeObserver(() => {
      width = el.offsetWidth || width
      height = el.offsetHeight || height
      forceEval = true
    })
    ro.observe(el)

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerMove, { passive: true })
    window.addEventListener('blur', onPointerLeave)
    window.addEventListener('scroll', onViewportChange, { passive: true })
    window.addEventListener('resize', onViewportChange)
    document.addEventListener('pointerleave', onPointerLeave)

    // Paint the dock position immediately, before the pointer has moved: the
    // companion opens where it always has, then glides out to the cursor on the
    // first move rather than appearing on top of it.
    el.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`
    el.style.opacity = '1'
    raf = window.requestAnimationFrame(frame)

    return () => {
      window.cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerMove)
      window.removeEventListener('blur', onPointerLeave)
      window.removeEventListener('scroll', onViewportChange)
      window.removeEventListener('resize', onViewportChange)
      document.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [enabled, gap, settleMs, reevalDistance, reevalIntervalMs])

  return { ref, ...state }
}
