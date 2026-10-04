import { motion, useReducedMotion, type MotionValue } from 'framer-motion'

/**
 * The thread — the one motif that runs through the whole portfolio.
 *
 * The hero opens on a cluster topology. The journey follows a single thread that
 * draws itself as you scroll, with a station at each chapter. Later sections
 * borrow the same track so the visitor keeps seeing one continuous path rather
 * than a stack of unrelated timelines.
 *
 * Geometry, and why it is odd:
 *  - The rail lives in a fixed 56px-wide SVG stretched to the container's
 *    height. Because only the y axis is scaled, the thread keeps its true
 *    silhouette; a full-bleed viewBox would squash the curve into a blob.
 *  - `vectorEffect="non-scaling-stroke"` keeps the line 2px at any length.
 *  - The curve only waves in x, so stations rendered as DOM at `top: n%` sit on
 *    the rail instead of drifting off it. Markers are DOM, not SVG, so text and
 *    circles are never distorted.
 *  - Drawing uses framer-motion's `pathLength` / `pathOffset`, so the browser
 *    interpolates the stroke without a measuring pass or a resize listener.
 *
 * The rail is always fully drawn underneath, so the route stays legible with
 * `prefers-reduced-motion` set — we stop animating rather than removing it.
 * Nothing here carries information on its own; the same facts are in the markup.
 */

/** Width of the rail in pixels. Stations are centred on this. */
export const THREAD_WIDTH = 56

/** Height of the coordinate space the path is authored in. */
export const THREAD_VIEWBOX_HEIGHT = 1000

/**
 * A gently waving vertical rail. The wave varies in x only, which keeps stations
 * pinned to the centre line.
 */
export const THREAD_PATH =
  'M28,0 C10,90 46,180 28,270 C10,360 46,450 28,540 C10,630 46,720 28,810 C14,880 40,940 28,1000'

interface ThreadTrackProps {
  /** Scroll progress through the owning section, 0-1. */
  progress: MotionValue<number>
  /** Unique id prefix for the gradient — must be unique per instance. */
  gradientId: string
  /** Accent colours for the travelled portion, top to bottom. */
  stops: string[]
  className?: string
}

export default function ThreadTrack({
  progress,
  gradientId,
  stops,
  className = '',
}: ThreadTrackProps) {
  const reduceMotion = useReducedMotion()

  return (
    <svg
      width={THREAD_WIDTH}
      height="100%"
      viewBox={`0 0 ${THREAD_WIDTH} ${THREAD_VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gradientId}-travelled`} x1="0" y1="0" x2="0" y2="1">
          {stops.map((color, i) => (
            <stop
              key={`${color}-${i}`}
              offset={stops.length > 1 ? `${(i / (stops.length - 1)) * 100}%` : '0%'}
              stopColor={color}
            />
          ))}
        </linearGradient>
      </defs>

      {/* Rail — always visible so the route reads without animation. */}
      <path
        d={THREAD_PATH}
        stroke="var(--border)"
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Travelled portion. */}
      {reduceMotion ? (
        <path
          d={THREAD_PATH}
          stroke={`url(#${gradientId}-travelled)`}
          strokeWidth={2.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.9}
        />
      ) : (
        <motion.path
          d={THREAD_PATH}
          stroke={`url(#${gradientId}-travelled)`}
          strokeWidth={2.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: progress, pathOffset: 1 }}
        />
      )}
    </svg>
  )
}