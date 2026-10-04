import { useTransform, type MotionValue } from 'framer-motion'

/**
 * Re-window the chapter-local progress so each stage can choreograph its own
 * beats without touching the shared scroll value every other stage reads.
 *
 * Each stage owns a sequence: links draw, then the traveller moves, then the
 * label settles. Expressing that as windows over one 0→1 progress keeps the
 * choreography declarative — a stage declares *when* something happens, not how
 * to follow the scroll — and keeps every stage in step the instant the reader
 * arrives mid-chapter.
 */
export function useBeat(
  progress: MotionValue<number>,
  start: number,
  end: number,
): MotionValue<number> {
  return useTransform(progress, [start, end], [0, 1], { clamp: true })
}