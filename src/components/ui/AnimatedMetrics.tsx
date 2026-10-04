import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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
    label: 'Database Models Analysed',
    detail: 'Reviewed at Distronix to find and fix the indexing strategy.',
  },
  {
    value: Number.parseFloat(educationList[0]?.score ?? '0'),
    decimals: 2,
    unit: '/ 10',
    label: 'CGPA',
    detail: 'Bachelor in Computer Application, Kazi Nazrul University.',
  },
]

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

export default function AnimatedMetrics() {
  const reduceMotion = useReducedMotion()

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
          <motion.div
            key={metric.label}
            initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: i * 0.12, ease: [0.4, 0, 0.2, 1] }}
            className="
              group relative px-5 py-5 sm:px-6
              border-b border-[var(--border)] last:border-b-0
              sm:border-b-0 sm:border-r sm:last:border-r-0
              transition-colors duration-300
              hover:bg-[var(--surface-hover)]
            "
          >
            {/* Luminous edge on hover */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
              style={{ background: 'linear-gradient(90deg, var(--accent-teal), transparent)' }}
            />

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
              transition={{ duration: 0.6, delay: 0.35 + i * 0.12, ease: [0.4, 0, 0.2, 1] }}
            />

            <p
              className="mt-2 font-mono-code text-[0.68rem] uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              {metric.label}
            </p>

            <p
              className="mt-1 max-h-0 overflow-hidden text-[0.72rem] leading-5 opacity-0 transition-all duration-300 group-hover:max-h-20 group-hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              {metric.detail}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
