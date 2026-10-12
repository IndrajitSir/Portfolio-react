import { useCallback, useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { useReducedMotion } from 'framer-motion'
import { FiSend, FiCheck, FiLoader } from 'react-icons/fi'

export type SendStatus = 'idle' | 'sending' | 'success' | 'error'

interface SendButtonProps {
  status: SendStatus
  label: string
  /** Disabled only while a submission is actually in flight. */
  disabled?: boolean
}

/**
 * The Connect section's focal control.
 *
 * The label and the button's box never move — the button is always full width
 * and a fixed height — so swapping "Send message" for "Sending…" costs no
 * layout. The motion lives entirely in the icon slot, driven by Anime.js:
 *
 *   hover   the arrow nudges forward
 *   press   the whole button dips, then springs back
 *   submit  the arrow flies forward and hands over to a spinner
 *   success the spinner yields to a check, with a single ring burst
 *   failure the arrow returns and the button shakes *once*
 *
 * Every animation is one-shot and tracked in a ref, so each is cancelled before
 * the next state runs and all of them are cancelled on unmount. With
 * `prefers-reduced-motion` the states are set directly and no animation plays —
 * including the success burst, which would otherwise be a misleading flourish.
 */
export default function SendButton({ status, label, disabled = false }: SendButtonProps) {
  const reduceMotion = useReducedMotion()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const checkRef = useRef<HTMLSpanElement>(null)
  const loaderRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const animations = useRef<ReturnType<typeof animate>[]>([])

  // `track`/`cancelAll` only touch a ref, so they are stable across renders and
  // can sit in the effect's dependency list without re-firing it.
  const track = useCallback((animation: ReturnType<typeof animate>) => {
    animations.current.push(animation)
    return animation
  }, [])
  const cancelAll = useCallback(() => {
    animations.current.forEach((animation) => animation.cancel())
    animations.current = []
  }, [])

  useEffect(() => {
    const arrow = arrowRef.current
    const check = checkRef.current
    const loader = loaderRef.current
    const ring = ringRef.current
    const button = buttonRef.current
    if (!arrow || !check || !loader) return

    cancelAll()

    const show = (el: HTMLElement | null, visible: boolean) => {
      if (el) el.style.opacity = visible ? '1' : '0'
    }

    // Reduced motion: land on the finished state with no travel at all.
    if (reduceMotion) {
      const idleArrow = status === 'idle' || status === 'error'
      show(arrow, idleArrow)
      show(check, status === 'success')
      show(loader, status === 'sending')
      if (arrow) arrow.style.removeProperty('transform')
      if (check) check.style.removeProperty('transform')
      return cancelAll
    }

    if (status === 'sending') {
      track(animate(arrow, { translateX: [0, 30], opacity: [1, 0], duration: 260, ease: 'outQuad' }))
      track(
        animate(loader, {
          opacity: [0, 1],
          rotate: 360,
          duration: 240,
          delay: 170,
          ease: 'outBack',
          loop: true,
        }),
      )
    } else if (status === 'success') {
      track(animate(loader, { opacity: 0, duration: 140 }))
      track(animate(check, { opacity: [0, 1], scale: [0.4, 1], duration: 340, delay: 60, ease: 'outBack' }))
      if (ring) {
        track(animate(ring, { scale: [0.5, 2.4], opacity: [0.8, 0], duration: 650, delay: 60, ease: 'outQuad' }))
      }
    } else if (status === 'error') {
      // A clear failure state: the arrow returns and the button shakes once.
      // Nothing here reads as success.
      track(animate(loader, { opacity: 0, duration: 140 }))
      track(animate(arrow, { opacity: [0, 1], scale: [0.6, 1], translateX: [30, 0], duration: 260, ease: 'outBack' }))
      if (button) track(animate(button, { translateX: [0, -5, 5, -3, 3, 0], duration: 380, ease: 'outQuad' }))
    } else {
      track(animate(loader, { opacity: 0, duration: 140 }))
      track(animate(check, { opacity: 0, scale: 0.6, duration: 140 }))
      track(animate(arrow, { opacity: 1, scale: 1, translateX: 0, duration: 240, ease: 'outBack' }))
    }

    return cancelAll
  }, [status, reduceMotion, track, cancelAll])

  const interactive = !disabled && status === 'idle'

  const onEnter = () => {
    const arrow = arrowRef.current
    if (reduceMotion || !interactive || !arrow) return
    track(animate(arrow, { translateX: 4, duration: 260, ease: 'outQuad' }))
  }
  const onLeave = () => {
    const arrow = arrowRef.current
    if (reduceMotion || !interactive || !arrow) return
    track(animate(arrow, { translateX: 0, duration: 260, ease: 'outQuad' }))
  }
  const onDown = () => {
    const button = buttonRef.current
    if (reduceMotion || disabled || !button) return
    track(animate(button, { scale: 0.975, duration: 120, ease: 'outQuad' }))
  }
  const onUp = () => {
    const button = buttonRef.current
    if (reduceMotion || disabled || !button) return
    track(animate(button, { scale: 1, duration: 240, ease: 'outBack' }))
  }

  return (
    <button
      ref={buttonRef}
      type="submit"
      disabled={disabled}
      data-status={status}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="
        group relative flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden
        rounded-full bg-[var(--accent-teal)] text-[0.9rem] font-semibold
        text-[var(--bg-primary)] transition-shadow duration-300
        hover:shadow-[0_0_44px_var(--glow-teal)] focus-visible:shadow-[0_0_44px_var(--glow-teal)]
        disabled:cursor-not-allowed disabled:opacity-70
      "
    >
      {/* Success ring, burst outward from the icon slot. Centred with `m-auto`
          rather than a translate, so Anime.js owns the transform outright. */}
      <span
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto h-10 w-10 rounded-full border opacity-0"
        style={{ borderColor: 'var(--bg-primary)' }}
      />

      <span className="relative flex items-center justify-center gap-2.5">
        <span className="relative block h-[18px] w-[18px]" aria-hidden="true">
          <span ref={arrowRef} className="absolute inset-0 grid place-items-center">
            <FiSend size={15} />
          </span>
          <span ref={checkRef} className="absolute inset-0 grid place-items-center opacity-0">
            <FiCheck size={16} />
          </span>
          <span ref={loaderRef} className="absolute inset-0 grid place-items-center opacity-0">
            <FiLoader size={16} />
          </span>
        </span>
        <span>{label}</span>
      </span>
    </button>
  )
}
