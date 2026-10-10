import type { StrobiAnimation } from '@/types'

/**
 * The cues the rest of the page sends to Strobi.
 *
 * `companionFocus` carries where the reader *is*; this carries what just
 * *happened*. They are different in kind, which is why they are two modules: the
 * focus is a value that is read on every render, and a cue is an event that is
 * fired once and forgotten.
 *
 * An event bus rather than a store, for that reason. A store would need a
 * "consumed" flag plus a nonce to tell two identical submissions apart, and the
 * companion would have to fight React to avoid replaying a stale value on the
 * next render. Here the only cost is a subscriber that has nothing to do when
 * there is nothing to say — and when the companion is not mounted at all (the
 * Side Missions route), the contact form's cues go nowhere, which is correct.
 */
export type CompanionCue = Extract<StrobiAnimation, 'celebrate' | 'confused'>

const listeners = new Set<(cue: CompanionCue) => void>()

/** Tell the companion that something worth a face just happened. */
export const notifyCompanionCue = (cue: CompanionCue): void => {
  listeners.forEach((listener) => listener(cue))
}

export const subscribeCompanionCues = (listener: (cue: CompanionCue) => void): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
