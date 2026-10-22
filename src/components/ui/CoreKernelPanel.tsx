import { motion, useReducedMotion } from 'framer-motion'
import {
  telemetryRows,
  telemetryStream,
  telemetryTarget,
} from '@/data/telemetry'

/**
 * CoreKernelPanel
 * ─────────────────────────────────────────────────────────────────────────────
 * The hero's one instrument: a runtime readout of the system this engineer
 * works on.
 *
 * It replaces the old interactive cluster topology. That instrument was a
 * diagram you could poke — but the hero's job is to be read in three seconds,
 * and a diagram of six modules asks for attention the headline needs. A
 * readout answers the same question ("what does this person run?") in one
 * glance, and it sits still, so the photograph behind it stays the picture.
 *
 * The figures live in `src/data/telemetry.ts`, not here, so the panel stays a
 * view of them.
 */

/** Turns the normalised samples into an SVG path across a 100×28 box. */
function streamPath(samples: number[]): string {
  const last = samples.length - 1
  return samples
    .map((value, i) => {
      const x = (i / last) * 100
      const y = 26 - value * 22
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

/** The four corner brackets that make the panel read as a mounted instrument. */
function Brackets() {
  const common =
    'pointer-events-none absolute h-3.5 w-3.5 border-[var(--accent-teal)] opacity-40'
  return (
    <>
      <span aria-hidden="true" className={`${common} left-1.5 top-1.5 border-l border-t`} />
      <span aria-hidden="true" className={`${common} right-1.5 top-1.5 border-r border-t`} />
      <span aria-hidden="true" className={`${common} bottom-1.5 left-1.5 border-b border-l`} />
      <span aria-hidden="true" className={`${common} bottom-1.5 right-1.5 border-b border-r`} />
    </>
  )
}

export default function CoreKernelPanel() {
  const reduceMotion = useReducedMotion()
  const path = streamPath(telemetryStream.samples)

  return (
    <section
      aria-label="Core kernel telemetry"
      className="relative overflow-hidden rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-panel)] backdrop-blur-xl"
      style={{ background: 'color-mix(in srgb, var(--panel) 78%, transparent)' }}
    >
      <Brackets />

      {/* ── Header ────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: 'var(--accent-green)' }}
            aria-hidden="true"
          />
          <h2
            className="truncate font-mono-code text-[0.56rem] font-medium uppercase tracking-widest sm:text-[0.64rem]"
            style={{ color: 'var(--text-primary)' }}
          >
            Core Kernel // Telemetry
          </h2>
        </div>
        <span
          className="flex shrink-0 items-center gap-1.5 rounded border border-[var(--border-glow)] bg-[var(--glow-teal)] px-2 py-0.5 font-mono-code text-[0.55rem] uppercase tracking-widest"
          style={{ color: 'var(--accent-teal)' }}
        >
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: 'var(--accent-green)' }}
            aria-hidden="true"
          />
          60 FPS · Live
        </span>
      </header>

      {/* ── Readout ───────────────────────────────────────────── */}
      <dl className="divide-y divide-[var(--border)]/70 px-4">
        {telemetryRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 py-2 font-mono-code text-[0.66rem] uppercase tracking-[0.12em]"
          >
            <dt style={{ color: 'var(--text-muted)' }}>{row.label}:</dt>
            <dd
              className="flex items-center gap-1.5 truncate"
              style={{
                color:
                  row.label === 'Throughput'
                    ? 'var(--text-primary)'
                    : 'var(--accent-teal)',
              }}
            >
              {row.status === 'nominal' && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--accent-green)' }}
                  aria-hidden="true"
                />
              )}
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* ── Packet stream ────────────────────────────────────── */}
      <div className="border-t border-[var(--border)] px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className="font-mono-code text-[0.58rem] uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            {telemetryStream.label}
          </span>
          <span
            className="font-mono-code text-[0.58rem] tracking-widest"
            style={{ color: 'var(--accent-teal)' }}
          >
            {telemetryStream.average}
          </span>
        </div>

        <div
          className="relative mt-2 overflow-hidden rounded border border-[var(--border)]"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <svg
            viewBox="0 0 100 28"
            preserveAspectRatio="none"
            className="h-12 w-full"
            role="img"
            aria-label={`Packet stream trace, ${telemetryStream.average}`}
          >
            {/* A faint bed line so the trace reads against the panel. */}
            <line
              x1="0"
              y1="26"
              x2="100"
              y2="26"
              stroke="var(--border)"
              strokeWidth="0.4"
            />
            <motion.path
              d={path}
              fill="none"
              stroke="var(--accent-teal)"
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            />
            {/* A travelling highlight — the stream is live, not a still. */}
            {!reduceMotion && (
              <motion.path
                d={path}
                fill="none"
                stroke="var(--text-primary)"
                strokeWidth="1.4"
                strokeDasharray="3 9"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                animate={{ strokeDashoffset: [0, -48] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </svg>
        </div>
      </div>

      {/* ── Specialisation ───────────────────────────────────── */}
      <div className="border-t border-[var(--border)] px-4 py-3">
        <span
          className="font-mono-code text-[0.55rem] uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          {telemetryTarget.label}
        </span>
        <p
          className="mt-1 font-mono-code text-[0.68rem] leading-snug"
          style={{ color: 'var(--text-primary)' }}
        >
          <span style={{ color: 'var(--accent-teal)' }} aria-hidden="true">
            ▸{' '}
          </span>
          {telemetryTarget.value}
        </p>
      </div>

      {/* ── Target ────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-2.5"
        style={{ background: 'var(--panel-raised)' }}
      >
        <span
          className="font-mono-code text-[0.55rem] uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Target: {telemetryTarget.target}
        </span>
        <span
          className="flex items-center gap-1.5 font-mono-code text-[0.55rem] uppercase tracking-widest"
          style={{ color: 'var(--accent-teal)' }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--accent-green)' }}
            aria-hidden="true"
          />
          {telemetryTarget.state}
        </span>
      </div>
    </section>
  )
}
