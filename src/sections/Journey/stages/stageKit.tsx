import { useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion'
import { useState, type ReactNode } from 'react'

/**
 * Shared drawing surface for the eight chapter stages.
 *
 * Every stage is authored in one 360×320 coordinate space. That is what lets the
 * eight *different* pictures still read as one system: the frame, the travel
 * spine and the accumulating chapter ticks are identical in every chapter, so
 * the eye recognises continuity even though the artwork changes completely.
 *
 * The spine is the thread motif from the rest of the portfolio (hero topology →
 * journey rail). It enters at the top of every stage and leaves at the bottom,
 * which is what makes eight chapters read as one route instead of eight
 * unrelated screenshots.
 */

/** Authoring space for every stage drawing. */
export const VB_W = 360
export const VB_H = 320

/** Text sizes inside the artwork. Kept ≥9 so the picture stays legible when the
 *  stage is only ~300px wide on a phone. Anything that matters is also written
 *  in the chapter's HTML beneath the picture. */
export const LABEL = 11
export const MICRO = 9

/** X position of the travel spine, shared by every stage. */
export const SPINE_X = 18

/** Spacing of the eight accumulating chapter ticks along the bottom edge. */
const TICK_GAP = 11
const TICK_X0 = SPINE_X + 4

/** Small monospaced label. SVG text is positioned by its baseline, hence `y`. */
export function Label({
  x,
  y,
  children,
  size = MICRO,
  fill = 'var(--text-muted)',
  anchor = 'start',
  weight = 400,
}: {
  x: number
  y: number
  children: ReactNode
  size?: number
  fill?: string
  anchor?: 'start' | 'middle' | 'end'
  weight?: number
}) {
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      fontFamily="'JetBrains Mono', ui-monospace, monospace"
    >
      {children}
    </text>
  )
}

interface StageFrameProps {
  /** rgb triplet for the chapter accent, e.g. "94,234,212". */
  rgb: string
  children: ReactNode
  /** Chapters the traveller has already passed, 0–8. */
  travelled: number
}

/**
 * The furniture every stage shares.
 *
 * Two ideas carry the continuity:
 *  - the spine, which the chapter's own drawing hangs off, so the route visibly
 *    continues from one chapter into the next;
 *  - the eight ticks along the bottom, which light one per chapter passed. That
 *    is the element that accumulates: by Chapter VIII all eight are lit, and the
 *    count is real (one tick per chapter, always).
 */
function StageFrame({ rgb, children, travelled }: StageFrameProps) {
  return (
    <>
      {/* Measured grid — the surface every chapter is drawn on. */}
      <g stroke="var(--border)" strokeWidth="1" opacity="0.45">
        {[80, 150, 220, 290].map((x) => (
          <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={VB_H} />
        ))}
        {[80, 160, 240].map((y) => (
          <line key={`gy${y}`} x1={0} y1={y} x2={VB_W} y2={y} />
        ))}
      </g>

      {/* Travel spine: enters above, leaves below. */}
      <line
        x1={SPINE_X}
        y1={0}
        x2={SPINE_X}
        y2={VB_H}
        stroke={`rgba(${rgb},0.16)`}
        strokeWidth={2}
      />
      <circle cx={SPINE_X} cy={0} r={2.5} fill={`rgba(${rgb},0.5)`} />
      <circle cx={SPINE_X} cy={VB_H} r={2.5} fill={`rgba(${rgb},0.5)`} />

      {children}

      {/* Accumulated chapters. */}
      <g transform={`translate(0, ${VB_H - 9})`}>
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`tick${i}`}
            x1={TICK_X0 + i * TICK_GAP}
            y1={-4}
            x2={TICK_X0 + i * TICK_GAP}
            y2={2}
            strokeWidth={2}
            strokeLinecap="round"
            stroke={i < travelled ? `rgb(${rgb})` : 'var(--border)'}
            opacity={i < travelled ? 1 : 0.7}
          />
        ))}
      </g>
    </>
  )
}

/**
 * The SVG every stage is drawn into.
 *
 * `aria-hidden` on purpose: the picture restates the chapter text, so announcing
 * it twice would only be noise. Where a stage has something worth exploring its
 * controls are real buttons underneath the canvas rather than shapes trapped
 * inside it.
 */
export function StageCanvas({
  rgb,
  travelled,
  children,
}: {
  rgb: string
  travelled: number
  children: ReactNode
}) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="block h-auto w-full"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <StageFrame rgb={rgb} travelled={travelled}>
        {children}
      </StageFrame>
    </svg>
  )
}

/**
 * Controls for the stages that have something worth exploring.
 *
 * These are real buttons in the document, not shapes trapped inside the SVG, so
 * they are reachable by keyboard, announced by screen readers and usable by
 * touch. Choosing one only changes what the drawing emphasises — it never opens
 * or hides any of the chapter's text.
 */
export function ControlRow({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex flex-wrap items-center gap-1.5">{children}</div>
}

export function ControlChip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string
  active: boolean
  onClick: () => void
  accent: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full border px-2.5 py-1 font-mono-code text-[0.62rem] transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: active ? accent : 'var(--border)',
        background: active ? 'var(--surface-hover)' : 'var(--surface)',
        color: active ? accent : 'var(--text-secondary)',
      }}
    >
      {label}
    </button>
  )
}

/** The line under the controls that explains the current selection. */
export function ControlDetail({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-2 text-[0.74rem] leading-[1.6]"
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </p>
  )
}

/**
 * A wireframe panel: the chassis most chapters are built from (windows, service
 * cards, class boxes). Kept here so "box" means exactly one thing across all
 * eight drawings.
 */
export function Panel({
  x,
  y,
  w,
  h,
  rgb,
  lit = 0,
  r = 8,
}: {
  x: number
  y: number
  w: number
  h: number
  rgb: string
  /** 0 = dormant, 1 = fully lit. */
  lit?: number
  r?: number
}) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        fill={`rgba(${rgb},${0.03 + 0.09 * lit})`}
        stroke={lit > 0 ? `rgba(${rgb},${0.28 + 0.5 * lit})` : 'var(--border)'}
        strokeWidth={1}
      />
    </>
  )
}

/** A row of placeholder content inside a panel — an interface, not real text. */
export function Bars({
  x,
  y,
  widths,
  rgb,
  lit = 1,
  gap = 7,
  height = 4,
}: {
  x: number
  y: number
  widths: number[]
  rgb: string
  lit?: number
  gap?: number
  height?: number
}) {
  return (
    <g>
      {widths.map((w, i) => (
        <rect
          key={`bar${i}`}
          x={x}
          y={y + i * gap}
          width={w}
          height={height}
          rx={2}
          fill={`rgba(${rgb},${0.12 + 0.16 * lit})`}
        />
      ))}
    </g>
  )
}

/**
 * Animate a number that counts with scroll. Used where a milestone genuinely
 * carries a figure (150+ models) — the count is driven by real progress, never
 * by a timer, so it cannot overstate anything.
 *
 * Rounded to whole numbers, so the label re-renders at most once per integer
 * rather than once per animation frame.
 */
export function CountLabel({
  progress,
  from,
  to,
  range,
  x,
  y,
  suffix,
  size = LABEL,
  fill,
  anchor = 'start',
}: {
  progress: MotionValue<number>
  from: number
  to: number
  range: [number, number]
  x: number
  y: number
  suffix?: string
  size?: number
  fill: string
  anchor?: 'start' | 'middle' | 'end'
}) {
  const t = useTransform(progress, range, [0, 1], { clamp: true })
  const format = (value: number) => `${Math.round(from + (to - from) * value)}${suffix ?? ''}`
  const [text, setText] = useState(() => format(progress.get()))

  useMotionValueEvent(t, 'change', (value) => {
    const next = format(value)
    setText((prev) => (prev === next ? prev : next))
  })

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      fontWeight={500}
      textAnchor={anchor}
      fontFamily="'JetBrains Mono', ui-monospace, monospace"
    >
      {text}
    </text>
  )
}