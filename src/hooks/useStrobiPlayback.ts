import { useCallback, useMemo, useRef, useState } from 'react'
import type { StrobiAnimation, StrobiExpression } from '@/types'

/**
 * Drives Strobi through a controller, the way the avatar's own `AvatarController`
 * would.
 *
 * The package ships an imperative controller behind a `ref`, and this hook exists
 * because that ref cannot be attached on this project's React. `Avatar` reads its
 * controller from `props.ref`, which React only passes through for a function
 * component on React 19; on React 18 the ref is dropped (with a warning in the
 * console) and every `play()` would silently do nothing. The options were a React
 * major for the whole site, a fork of the package's renderer, or this: the same
 * commands, expressed through the public controlled props, which is enough for
 * every reaction the companion needs.
 *
 *   play(animation)      → render `animation={animation}`
 *   setExpression(key)   → render `expression={key}`
 *   stop()               → the still, neutral face — no timeline at all
 *   getState()           → what is on screen right now
 *
 * One method of the package's controller is missing on purpose. `pause()` freezes
 * a timeline mid-step, and a controlled prop cannot express that: switching to an
 * expression eases to that expression's pose instead of holding the current frame.
 * Nothing the companion does needs it, so it is absent rather than faked — and
 * when the project does reach React 19, this file's body becomes a `ref` and the
 * companion does not change at all.
 */
export type PlaybackTarget =
  | { kind: 'animation'; animation: StrobiAnimation }
  | { kind: 'expression'; expression: StrobiExpression }

export type PlaybackStatus = 'playing' | 'stopped'

export interface StrobiPlaybackState {
  activeAnimation?: StrobiAnimation
  activeExpression: StrobiExpression
  status: PlaybackStatus
}

export interface StrobiController {
  /** Start an animation from its first step, replacing whatever was playing. */
  play(animation: StrobiAnimation): void
  /** Show one expression, with the timeline stopped. */
  setExpression(expression: StrobiExpression): void
  /** Stop the timeline on the neutral face. */
  stop(): void
  getState(): StrobiPlaybackState
}

export interface StrobiPlayback {
  /** What the avatar should render — spread-ready, one source of truth. */
  target: PlaybackTarget
  controller: StrobiController
  /** Hand to the avatar's `onExpressionChange`. */
  onExpressionChange: (expression: string) => void
}

export function useStrobiPlayback(initial: StrobiAnimation): StrobiPlayback {
  const [target, setTarget] = useState<PlaybackTarget>({ kind: 'animation', animation: initial })
  const [status, setStatus] = useState<PlaybackStatus>('playing')
  const [activeExpression, setActiveExpression] = useState<StrobiExpression>('neutral')

  // Only an animation timeline has an active animation; a still expression is,
  // by definition, not one.
  const activeAnimation = target.kind === 'animation' ? target.animation : undefined

  // The controller goes into an effect's dependency list, so it has to keep a
  // single identity for the life of the component — a fresh object every render
  // would make that effect re-run, and re-`play` on every render. `getState` reads
  // through a ref for the same reason: it reports live values without taking a
  // dependency on them.
  const latest = useRef<StrobiPlaybackState>({
    activeAnimation: initial,
    activeExpression: 'neutral',
    status: 'playing',
  })
  latest.current = { activeAnimation, activeExpression, status }

  const controller = useMemo<StrobiController>(
    () => ({
      play(animation) {
        setTarget({ kind: 'animation', animation })
        setStatus('playing')
      },
      setExpression(expression) {
        setTarget({ kind: 'expression', expression })
        setStatus('playing')
      },
      stop() {
        setTarget({ kind: 'expression', expression: 'neutral' })
        setStatus('stopped')
      },
      getState: () => latest.current,
    }),
    [],
  )

  // The runtime reports the expression it is actually showing — including each
  // step of a running animation — so this is the real expression, not the one we
  // last asked for. It can only ever report a key from the definition, which is
  // why the narrowing is safe rather than a guess.
  const onExpressionChange = useCallback((expression: string) => {
    setActiveExpression(expression as StrobiExpression)
  }, [])

  return { target, controller, onExpressionChange }
}
