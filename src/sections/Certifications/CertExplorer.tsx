import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiExternalLink, FiAward, FiCheck } from 'react-icons/fi'
import { DURATION, EASE_OUT_EXPO, EASE_STANDARD } from '@/utils/motion'
import type { Certification } from '@/types'

/**
 * Credentials as an explorable set rather than a static grid.
 *
 * Each credential is a selectable seal; choosing one reveals the issuer, what it
 * actually covers, and — where one exists — the verification link. A slow accent
 * sweep marks the selected seal so the current choice is legible at a glance
 * without relying on colour alone.
 */
export default function CertExplorer({ certifications }: { certifications: Certification[] }) {
  const reduceMotion = useReducedMotion()
  const [activeId, setActiveId] = useState(certifications[0]?.id ?? '')
  const active = certifications.find((c) => c.id === activeId) ?? certifications[0]

  /**
   * Tabs are a roving-tabindex widget: Tab enters the group once, then
   * Up/Down/Home/End move between credentials and activate them. Without this,
   * `role="tab"` promises keyboard behaviour that plain buttons do not deliver.
   */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const count = certifications.length
    if (count === 0) return
    const current = certifications.findIndex((c) => c.id === active.id)
    let next: number | null = null

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (current + 1) % count
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (current - 1 + count) % count
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = count - 1
    else return

    e.preventDefault()
    const target = certifications[next]
    setActiveId(target.id)
    // Move focus with selection, which is the tabs pattern's contract.
    document.getElementById(`cert-tab-${target.id}`)?.focus()
  }

  if (!active) return null

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* ── Selector: the credential seals ───────────────────────── */}
      <div
        className="flex flex-col gap-3"
        role="tablist"
        aria-label="Certifications"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {certifications.map((cert, i) => {
          const selected = cert.id === active.id
          return (
            <motion.button
              key={cert.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="cert-detail"
              id={`cert-tab-${cert.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(cert.id)}
              initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO, delay: i * 0.1 }}
              className="
                group relative flex items-center gap-4 overflow-hidden rounded-2xl border
                p-4 text-left backdrop-blur-md transition-colors duration-300 sm:p-5
              "
              style={{
                borderColor: selected ? 'var(--border-glow)' : 'var(--border)',
                background: selected ? 'var(--glow-teal)' : 'var(--surface)',
              }}
            >
              {/* Selection marker: a filled rail, so state reads without colour */}
              <span
                aria-hidden="true"
                className="absolute inset-y-3 left-0 w-[3px] origin-top rounded-full transition-transform duration-300"
                style={{
                  background: 'linear-gradient(to bottom, var(--accent-teal), var(--accent-indigo))',
                  transform: selected ? 'scaleY(1)' : 'scaleY(0)',
                }}
              />

              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl transition-colors duration-300"
                style={{
                  borderColor: selected ? 'var(--accent-teal)' : 'var(--border)',
                  background: selected ? 'var(--bg-primary)' : 'var(--glow-teal)',
                }}
                aria-hidden="true"
              >
                {cert.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className="block font-semibold text-[0.85rem] leading-snug"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {cert.title}
                </span>
                <span className="mt-0.5 block text-[0.75rem]" style={{ color: 'var(--accent-indigo)' }}>
                  {cert.issuer}
                </span>
              </span>

              {selected && (
                <motion.span
                  aria-hidden="true"
                  initial={reduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: DURATION.quick, ease: EASE_OUT_EXPO }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'var(--accent-teal)', color: 'var(--bg-primary)' }}
                >
                  <FiCheck size={12} />
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* ── Detail panel ─────────────────────────────────────────── */}
      <div
        id="cert-detail"
        role="tabpanel"
        aria-labelledby={`cert-tab-${active.id}`}
        tabIndex={0}
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-md outline-offset-4 sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(600px circle at 80% 0%, var(--glow-teal), transparent 65%)' }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: DURATION.quick, ease: EASE_STANDARD }}
            className="relative"
          >
            <div className="mb-5 flex items-start gap-4">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl"
                style={{ borderColor: 'var(--border-glow)', background: 'var(--glow-teal)' }}
                aria-hidden="true"
              >
                {active.icon}
              </span>
              <div>
                <p className="font-mono-code text-[0.6rem] uppercase tracking-widest" style={{ color: 'var(--accent-teal)' }}>
                  Verified credential
                </p>
                <h3 className="mt-1 font-display text-[clamp(1.15rem,2.2vw,1.5rem)] font-light leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {active.title}
                </h3>
                <p className="mt-1 text-[0.82rem] font-medium" style={{ color: 'var(--accent-indigo)' }}>
                  {active.issuer}
                </p>
              </div>
            </div>

            <p className="text-sm leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
              {active.description}
            </p>

            {active.url ? (
              <a
                href={active.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--accent-teal)]
                  bg-[var(--glow-teal)] px-4 py-2.5 text-[0.78rem] font-semibold
                  text-[var(--accent-teal)] transition-all duration-200 hover:-translate-y-0.5
                  hover:bg-[var(--accent-teal)] hover:text-[var(--bg-primary)]
                "
                aria-label={`Verify ${active.title} on the issuer's site`}
              >
                <FiExternalLink size={13} />
                Verify credential
              </a>
            ) : (
              <p
                className="mt-6 inline-flex items-center gap-2 font-mono-code text-[0.7rem]"
                style={{ color: 'var(--text-muted)' }}
              >
                <FiAward size={13} aria-hidden="true" />
                Certificate issued offline — verification link not available.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
