import type { AccentKey, ChapterKind, Experience } from '@/types'

/**
 * The companion's focus — which journey chapter or career role the reader is
 * standing in right now.
 *
 * Strobi's mood used to be resolved from the section alone, which is fine for a
 * card printed in the hero and useless for a companion that travels down the
 * page. `Journey` and `Experience` already measure exactly which chapter or role
 * the reader has reached; this module is where they publish it, so the docked
 * companion can change expression with the thread instead of duplicating the
 * scroll arithmetic. One resolver per thread, one reader.
 *
 * A tiny external store rather than context: a context value that changed on
 * every chapter would re-render the provider's whole subtree — the entire page.
 * Only the companion subscribes here, so only the companion re-renders. The
 * shape mirrors `lenisRef.ts`: a module singleton with a setter and getter.
 */

export type CompanionThread = 'journey' | 'experience'

interface CompanionFocusBase {
  /** Chapter id (journey) or role id (career). */
  id: string
  /** Short line for the companion's status, e.g. `V · Build a real system`. */
  label: string
  /** The thread's own accent, so the companion can borrow its colour. */
  accent: AccentKey
}

export interface JourneyFocus extends CompanionFocusBase {
  thread: 'journey'
  kind: ChapterKind
}

export interface CareerFocus extends CompanionFocusBase {
  thread: 'experience'
  type: Experience['type']
  /** True for the role the reader is in now — the end of the thread. */
  current: boolean
}

export type CompanionFocus = JourneyFocus | CareerFocus

export interface CompanionState {
  /**
   * The active chapter and role, kept per thread so a stale value in one section
   * can never shadow the other: the reader scrolling out of the career and back
   * into the journey leaves both slots populated, and the companion reads only
   * the slot belonging to the section it is actually in.
   */
  journey: JourneyFocus | null
  experience: CareerFocus | null
  /** True while a node in the hero topology is being inspected. */
  inspecting: boolean
}

let state: CompanionState = { journey: null, experience: null, inspecting: false }
const listeners = new Set<() => void>()

const emit = () => {
  listeners.forEach((listener) => listener())
}

/** Publish the journey chapter the reader has reached. */
export const publishJourneyFocus = (focus: JourneyFocus): void => {
  // Dedupe on the id: the section re-publishes on every measurement pass, and
  // only an actual chapter move should wake the subscriber.
  if (state.journey?.id === focus.id) return
  state = { ...state, journey: focus }
  emit()
}

/** Publish the career role the reader has reached. */
export const publishCareerFocus = (focus: CareerFocus): void => {
  if (state.experience?.id === focus.id) return
  state = { ...state, experience: focus }
  emit()
}

/** Report whether a node in the hero topology is being inspected. */
export const setCompanionInspecting = (inspecting: boolean): void => {
  if (state.inspecting === inspecting) return
  state = { ...state, inspecting }
  emit()
}

export const getCompanionState = (): CompanionState => state

export const subscribeCompanion = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
