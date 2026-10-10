import { useEffect, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FiPlus } from 'react-icons/fi'
import { projects, educationList } from '@/data'
import { useScrollReveal } from '@/hooks'

interface Metric {
  /** Final numeric value. */
  value: number
  /** Digits shown after the decimal point. */
  decimals?: number
  /** Rendered immediately after the number (e.g. "+"). */
  suffix?: string
  /** Small unit accent shown beside large values (e.g. "/ 10"). */
  unit?: string
  /** When set, the detail panel shows a meter filled to value / max. */
  max?: number
  label: string
  detail: string
}

/**
 * Headline numbers, derived from the portfolio data so they cannot drift.
 *
 * Each figure here is something a visitor can check elsewhere on the page: the
 * project count matches the Projects carousel, the model count comes from the
 * Distronix role, and the CGPA is the one recorded in the education data.
 */
const METRICS: Metric[] = [
  {
    value: projects.length,
    label: 'Projects Shipped',
    detail: 'Open-source packages, full-stack systems and mobile apps.',
  },
  {
    value: 150,
    suffix: '+',
    label: 'DB Models Indexed',
    detail: 'Reviewed at Distronix to find and fix the indexing strategy.',
  },
  {
    value: Number.parseFloat(educationList[0]?.score ?? '0'),
    decimals: 2,
    unit: '/ 10',
    max: 10,
    label: 'CGPA',
    detail: 'Bachelor in Computer Application, Kazi Nazrul University.',
  },
]

/** Sets the --i stagger index used by the CSS reveal delays. */
const stagger = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Counts up once when the metric scrolls into view. Kept in its own component
 * so per-frame updates never re-render the surrounding strip.
 */
function MetricValue({ metric }: { metric: Metric }) {
  const reduceMotion = useReducedMotion()
  const { ref, inView } = useScrollReveal({ threshold: 0.4, triggerOnce: true })
  const [display, setDisplay] = useState(reduceMotion ? metric.value : 0)

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(metric.value)
      return
    }
    if (!inView) return

    let raf = 0
    const duration = 1100
    const start = performance.now()

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(metric.value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduceMotion, metric.value])

  return (
    <span ref={ref} className="tabular-nums">
      {display.toFixed(metric.decimals ?? 0)}
    </span>
  )
}

/**
 * One metric tile. The details live in a panel that slides in from the right
 * behind a flowing wavy edge, so the tile never changes height.
 *
 * Mouse: hover opens/closes. Touch & pen: tap toggles. Keyboard: Enter/Space
 * toggles, Escape closes.
 */
function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)

  const isMouse = (e: PointerEvent) => e.pointerType === 'mouse'

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen((o) => !o)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const valueText = `${metric.value.toFixed(metric.decimals ?? 0)}${metric.suffix ?? ''}${
    metric.unit ? ` ${metric.unit}` : ''
  }`

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${metric.label}: ${valueText}. ${metric.detail}`}
      data-open={open}
      onPointerEnter={(e) => isMouse(e) && setOpen(true)}
      onPointerLeave={(e) => isMouse(e) && setOpen(false)}
      onPointerUp={(e) => { if (!isMouse(e)) setOpen((o) => !o) }}
      onKeyDown={onKeyDown}
      onBlur={() => setOpen(false)}
      className="
        mt-card relative min-h-[132px] overflow-hidden px-5 py-5 sm:px-6
        border-b border-[var(--border)] last:border-b-0
        sm:border-b-0 sm:border-r sm:last:border-r-0
        transition-colors duration-300
        hover:bg-[var(--surface-hover)]
        outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-teal)]
      "
    >
      {/* Luminous edge: draws across the top when open (sits above the panel) */}
      <span
        aria-hidden="true"
        className="mt-line absolute left-0 top-0 z-[3] h-px w-full"
        style={{ background: 'linear-gradient(90deg, var(--accent-teal), transparent)' }}
      />

      {/* Corner hint: a plus that turns into a close mark when open */}
      <FiPlus
        aria-hidden="true"
        size={14}
        className="mt-hint absolute right-3 top-3 z-[3]"
      />

      {/* Resting content */}
      <div className="mt-main">
        <div className="flex items-baseline gap-1">
          <span
            className="font-display text-3xl font-light leading-none sm:text-4xl"
            style={{ color: 'var(--text-primary)' }}
          >
            <MetricValue metric={metric} />
          </span>
          {metric.suffix && (
            <span
              className="font-display text-2xl font-light leading-none"
              style={{ color: 'var(--accent-teal)' }}
            >
              {metric.suffix}
            </span>
          )}
          {metric.unit && (
            <span
              className="font-mono-code text-xs font-medium"
              style={{ color: 'var(--accent-teal)' }}
            >
              {metric.unit}
            </span>
          )}
        </div>

        {/* Accent rule that draws into place */}
        <motion.span
          aria-hidden="true"
          className="mt-2 block h-px w-10"
          style={{ background: 'var(--accent-teal)', transformOrigin: 'left' }}
          initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 + index * 0.12, ease: [0.4, 0, 0.2, 1] }}
        />

        <p
          className="mt-2 font-mono-code text-[0.68rem] uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          {metric.label}
        </p>
      </div>

      {/* Detail panel: slides in from the right behind a flowing wavy edge */}
      <div className="mt-panel absolute inset-0 z-[1] flex flex-col justify-center gap-1.5 px-5 py-4 sm:px-6">
        <span
          aria-hidden="true"
          className="mt-edge absolute bottom-0 right-full top-0 w-[18px] overflow-hidden"
        >
          <svg
            className="mt-wave block h-[200%] w-full"
            viewBox="0 0 18 200"
            preserveAspectRatio="none"
          >
            <path
              style={{ fill: 'var(--mt-panel)' }}
              d="M18 0 H10 Q2 12.5 10 25 T10 50 T10 75 T10 100 T10 125 T10 150 T10 175 T10 200 H18 Z"
            />
          </svg>
        </span>

        <p
          className="mt-in font-mono-code text-[0.62rem] uppercase tracking-widest"
          style={{ ...stagger(0), color: 'var(--accent-teal)' }}
        >
          {metric.label}
        </p>

        <p
          className="mt-in text-[0.74rem] leading-5"
          style={{ ...stagger(1), color: 'var(--text-primary)' }}
        >
          {metric.detail}
        </p>

        {metric.max && (
          <div className="mt-in mt-1" style={stagger(2)}>
            <span
              className="relative block h-[3px] w-full overflow-hidden rounded-full"
              style={{ background: 'var(--border)' }}
            >
              <span
                className="mt-meter absolute inset-0 rounded-full"
                style={
                  {
                    background: 'var(--accent-teal)',
                    '--ratio': Math.min(1, metric.value / metric.max),
                  } as CSSProperties
                }
              />
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function AnimatedMetrics() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md"
      aria-label="Engineering statistics"
    >
      {/* Fine connecting line that threads the metrics together */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-6 right-6 top-[46px] hidden h-px sm:block"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--border-glow), var(--border-glow), transparent)',
        }}
      />

      <div className="relative grid grid-cols-1 sm:grid-cols-3">
        {METRICS.map((metric, i) => (
          <MetricCard key={metric.label} metric={metric} index={i} />
        ))}
      </div>
    </div>
  )
}