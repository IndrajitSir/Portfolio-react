import { useSyncExternalStore } from 'react'
import {
  getCompanionState,
  subscribeCompanion,
  type CompanionState,
} from '@/utils/companionFocus'

/**
 * Subscribe to whatever the companion should be reacting to.
 *
 * The snapshot is the store's own object and is only replaced when a thread
 * actually moves, so a scroll that does not cross a chapter or role boundary
 * re-renders nothing. `useSyncExternalStore` rather than `useState` + an effect:
 * the store can be written to during a scroll frame, and this keeps the read
 * consistent with it without an extra render.
 */
export function useCompanionState(): CompanionState {
  return useSyncExternalStore(subscribeCompanion, getCompanionState, getCompanionState)
}
