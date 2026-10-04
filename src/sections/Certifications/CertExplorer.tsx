import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiExternalLink, FiAward, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { CREDENTIAL_KIND_LABEL, CREDENTIAL_KIND_NOTE } from '@/data'
import { accentColor } from '@/utils/accents'
import { DURATION, EASE_OUT_EXPO, EASE_STANDARD } from '@/utils/motion'
import type { Credential, CredentialKind } from '@/types'

/**
 * Credentials as an explorable archive rather than a static grid.
 *
 * The important design decision here is honesty. A Microsoft Learn badge, a
 * professional certificate, a workshop you attended and a quiz you entered are
 * four different claims, so the archive filters by kind and spells out what each
 * kind actually means. Nothing is dressed up as a certification it is not.
 *
 * Interaction:
 *  - a kind filter that narrows the list (and tells you when it hides things),
 *  - selecting a credential to read its detail,
 *  - a verification link where a real one exists, the public post otherwise,
 *    and the supplied scan when there is one.
 *
 * Everything a recruiter needs — issuer, kind, period, description — is in the
 * DOM without any interaction, so the section works as a plain list too.
 */

interface CredentialExplorerProps {
  credentials: Credential[]
}

const ALL = 'all' as const
type Filter = CredentialKind | typeof ALL

export default function CredentialExplorer({ credentials }: CredentialExplorerProps) {
  const reduceMotion = useReducedMotion()
  const [filter, setFilter] = useState<Filter>(ALL)
  const [activeId, setActiveId] = useState<string | null>(credentials[0]?.id ?? null)

  const kinds = useMemo(() => {
    const present = new Set(credentials.map((c) => c.kind))
    return (Object.keys(CREDENTIAL_KIND_LABEL) as CredentialKind[]).filter((k) => present.has(k))
  }, [credentials])

  const visible = useMemo(
    () => (filter === ALL ? credentials : credentials.filter((c) => c.kind === filter)),
    [credentials, filter],
  )

  // When a filter hides the selected credential, fall back to the first visible
  // one rather than leaving an empty detail panel.
  const active = visible.find((c) => c.id === activeId) ?? visible[0]

  const counts = useMemo(() => {
    const map = new Map<Filter, number>()
    map.set(ALL, credentials.length)
    for (const kind of kinds) {
      map.set(kind, credentials.filter((c) => c.kind === kind).length)
    }
    return map
  }, [credentials, kinds])

  /**
   * The selector is a roving-tabindex listbox: Tab enters once, then arrow keys
   * move between credentials. Without this the visual affordance would promise
   * keyboard behaviour the markup does not deliver.
   */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!active || visible.length === 0) return
    const current = visible.findIndex((c) => c.id === active.id)
    let next: number | null = null

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (current + 1) % visible.length
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (current - 1 + visible.length) % visible.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = visible.length - 1
    else return

    e.preventDefault()
    const target = visible[next]
    if (!target) return
    setActiveId(target.id)
    document.getElementById(`credential-${target.id}`)?.focus()
  }

  if (credentials.length === 0) return null

  return (
    <div>
      {/* ── Kind filter ────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span
          className="font-mono-code text-[0.62rem] uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Show
        </span>
        <FilterChip
          label="Everything"
          count={counts.get(ALL) ?? 0}
          selected={filter === ALL}
          onSelect={() => setFilter(ALL)}
        />
        {kinds.map((kind) => (
          <FilterChip
            key={kind}
            label={CREDENTIAL_KIND_LABEL[kind]}
            count={counts.get(kind) ?? 0}
            selected={filter === kind}
            onSelect={() => setFilter(kind)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* ── The archive ──────────────────────────────────────────── */}
        <div
          role="listbox"
          aria-label="Credentials"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          className="flex max-h-[560px] flex-col gap-2.5 overflow-y-auto pr-1"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((cert, i) => (
              <CredentialRow
                key={cert.id}
                credential={cert}
                index={i}
                selected={!!active && cert.id === active.id}
                onSelect={() => setActiveId(cert.id)}
              />
            ))}
          </AnimatePresence>

          {filter !== ALL && (
            <button
              type="button"
              onClick={() => setFilter(ALL)}
              className="mt-1 self-start font-mono-code text-[0.7rem] underline underline-offset-4 transition-colors hover:text-[var(--accent-teal)]"
              style={{ color: 'var(--text-muted)' }}
            >
              Show all {credentials.length} entries
            </button>
          )}
        </div>

        {/* ── Detail ───────────────────────────────────────────────── */}
        {active && (
          <div className="lg:sticky lg:top-28 lg:self-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: DURATION.quick, ease: EASE_STANDARD }}
                id="credential-detail"
                role="tabpanel"
                aria-label={`${active.title} details`}
                className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-md outline-offset-4 sm:p-8"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(600px circle at 80% 0%, var(--glow-teal), transparent 65%)`,
                  }}
                />

                <div className="relative">
                  <div className="mb-5 flex items-start gap-4">
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl"
                      style={{
                        borderColor: 'var(--border-glow)',
                        background: 'var(--glow-teal)',
                      }}
                      aria-hidden="true"
                    >
                      {active.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono-code text-[0.6rem] uppercase tracking-wider"
                          style={{
                            background: 'var(--glow-teal)',
                            border: '1px solid var(--border-glow)',
                            color: accentColor[active.accent],
                          }}
                        >
                          {CREDENTIAL_KIND_LABEL[active.kind]}
                        </span>
                        {active.status === 'needs-review' && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono-code text-[0.6rem]"
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            <FiAlertCircle size={10} aria-hidden="true" />
                            Unverified details
                          </span>
                        )}
                      </div>

                      <h3
                        className="mt-2 font-display text-[clamp(1.15rem,2.2vw,1.5rem)] font-light leading-tight tracking-tight"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {active.title}
                      </h3>
                      <p className="mt-1 text-[0.82rem] font-medium" style={{ color: accentColor[active.accent] }}>
                        {active.issuer}
                      </p>
                      {active.period && (
                        <p className="mt-0.5 font-mono-code text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>
                          {active.period}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* What this kind of credential actually is — the sentence
                      that stops a badge from reading like a certification. */}
                  <p
                    className="mb-4 border-l-2 pl-3 font-mono-code text-[0.68rem] leading-[1.6]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    {CREDENTIAL_KIND_NOTE[active.kind]}
                  </p>

                  <p className="text-sm leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
                    {active.description}
                  </p>

                  <p className="mt-4 font-mono-code text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>
                    Area: <span style={{ color: accentColor[active.accent] }}>{active.area}</span>
                  </p>

                  {/* Supplied scan, shown only when one exists. */}
                  {active.evidenceImage && (
                    <a
                      href={active.evidenceImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 block overflow-hidden rounded-xl border transition-transform duration-200 hover:-translate-y-0.5"
                      style={{ borderColor: 'var(--border)' }}
                      aria-label={`Open the scanned document for ${active.title}`}
                    >
                      <img
                        src={active.evidenceImage}
                        alt={`Scanned document evidencing ${active.title}`}
                        loading="lazy"
                        decoding="async"
                        className="max-h-56 w-full object-cover object-top"
                      />
                    </a>
                  )}

                  {/* Links, ordered strongest evidence first. */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {active.url && (
                      <a
                        href={active.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          inline-flex items-center gap-2 rounded-lg border px-4 py-2.5
                          text-[0.78rem] font-semibold transition-all duration-200 hover:-translate-y-0.5
                        "
                        style={{
                          borderColor: accentColor[active.accent],
                          background: 'var(--glow-teal)',
                          color: accentColor[active.accent],
                        }}
                      >
                        <FiExternalLink size={13} />
                        Verify on issuer site
                      </a>
                    )}
                    {active.sourceUrl && (
                      <a
                        href={active.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          inline-flex items-center gap-2 rounded-lg border px-4 py-2.5
                          font-mono-code text-[0.72rem] transition-all duration-200 hover:-translate-y-0.5
                        "
                        style={{
                          borderColor: 'var(--border)',
                          background: 'var(--surface)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        View the post
                      </a>
                    )}
                    {!active.url && !active.sourceUrl && !active.evidenceImage && (
                      <p
                        className="inline-flex items-center gap-2 font-mono-code text-[0.7rem]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <FiAward size={13} aria-hidden="true" />
                        Issued offline — no public verification link.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

/** A filter pill with its count, so the visitor can see what a filter hides. */
function FilterChip({
  label,
  count,
  selected,
  onSelect,
}: {
  label: string
  count: number
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="
        inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5
        font-mono-code text-[0.68rem] transition-all duration-200
      "
      style={{
        borderColor: selected ? 'var(--accent-teal)' : 'var(--border)',
        background: selected ? 'var(--glow-teal)' : 'var(--surface)',
        color: selected ? 'var(--accent-teal)' : 'var(--text-secondary)',
      }}
    >
      {label}
      <span style={{ opacity: 0.65 }}>{count}</span>
    </button>
  )
}

/** One row in the archive. */
function CredentialRow({
  credential,
  index,
  selected,
  onSelect,
}: {
  credential: Credential
  index: number
  selected: boolean
  onSelect: () => void
}) {
  const reduceMotion = useReducedMotion()
  const accent = accentColor[credential.accent]

  return (
    <motion.button
      type="button"
      role="option"
      aria-selected={selected}
      id={`credential-${credential.id}`}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO, delay: Math.min(index, 6) * 0.05 }}
      className="
        group relative flex shrink-0 items-center gap-4 overflow-hidden rounded-2xl
        border p-4 text-left backdrop-blur-md transition-colors duration-300 sm:p-5
      "
      style={{
        borderColor: selected ? 'var(--border-glow)' : 'var(--border)',
        background: selected ? 'var(--glow-teal)' : 'var(--surface)',
      }}
    >
      {/* Selection marker reads without relying on colour. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-3 left-0 w-[3px] origin-top rounded-full transition-transform duration-300"
        style={{
          background: accent,
          transform: selected ? 'scaleY(1)' : 'scaleY(0)',
        }}
      />

      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl transition-colors duration-300"
        style={{
          borderColor: selected ? accent : 'var(--border)',
          background: selected ? 'var(--bg-primary)' : 'var(--surface-hover)',
        }}
        aria-hidden="true"
      >
        {credential.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[0.85rem] leading-snug" style={{ color: 'var(--text-primary)' }}>
          {credential.title}
        </span>
        <span className="mt-0.5 block text-[0.74rem]" style={{ color: accent }}>
          {credential.issuer}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 font-mono-code text-[0.58rem] uppercase tracking-wider"
            style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}
          >
            {CREDENTIAL_KIND_LABEL[credential.kind]}
          </span>
          {credential.period && (
            <span className="font-mono-code text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
              {credential.period}
            </span>
          )}
        </span>
      </span>

      {selected && (
        <motion.span
          aria-hidden="true"
          initial={reduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: DURATION.quick, ease: EASE_OUT_EXPO }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          style={{ background: accent, color: 'var(--bg-primary)' }}
        >
          <FiCheck size={12} />
        </motion.span>
      )}
    </motion.button>
  )
}