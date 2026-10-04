import { memo, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import { accentColor } from '@/utils/accents'
import { DURATION, EASE_OUT_EXPO } from '@/utils/motion'
import { clamp } from '@/utils'
import { fadeInUp, staggerContainerFast } from '@/utils/animations'
import type { Experience, FlowStage } from '@/types'
import { TYPE_LABEL, accentFor, roleAnchor, roleIndex, roleKind } from './experienceMeta'

/**
 * One role, read as a milestone instead of a card.
 *
 * The old card spent ~540px of height per role on chrome - a bordered surface, a
 * padded header, a badge row, a tabbed animated story, a collapsible list and a
 * tag strip - and put the responsibilities, the part a recruiter actually reads,
 * behind a click. This states the same verified facts as an editorial milestone
 * on the career thread, and spends its motion on the one thing a list cannot do:
 * the systems the work ran through, lit in order as the reader travels the role.
 *
 * Nothing important is behind a click. Role, company, period, engagement type,
 * summary and every responsibility are visible by default. The supporting layer -
 * what each stage of a workflow actually did - is revealed by scrolling, and a
 * reader who wants to linger on one can hover, focus or click a stage to hold it
 * there. Stage descriptions are never swapped out of the DOM: they are stacked in
 * a single slot, so the text stays available to a reader, a screen reader or a
 * search.
 *
 * Reduced motion holds the finished state: every stage lit, every description
 * printed, so the section is complete with every animation switched off.
 */

/** A stage of a workflow, plus the workflow it belongs to. */
type Milestone = FlowStage & { flowLabel: string }

interface CareerRoleProps {
  experience: Experience
  index: number
  /** True while this is the role the career has reached. */
  active: boolean
  /** How far the reader has travelled through this role, 0-1. */
  progress: MotionValue<number>
}

/**
 * Where a stage sits on the role's own 0-1 progress, and how sharply it fades.
 *
 * The windows are stretched 20% past both ends of the role, so the first stage is
 * already lit when the role arrives and the last is still lit when it is behind
 * you, while the spacing keeps exactly one stage bright at any moment. The fade
 * is short: a caption should be legible for most of its stage, not half of it.
 */
const stageWindow = (index: number, total: number) => ({
  centre: -0.1 + (index + 0.5) * (1.2 / total),
  half: 0.62 / total,
  fade: 0.14 / total,
})

function CareerRole({ experience, index, active, progress }: CareerRoleProps) {
  const reduceMotion = useReducedMotion()
  const accent = accentColor[accentFor(experience.id)]
  const kind = roleKind(experience)

  const flows = experience.story?.flows ?? []
  // Every stage of every flow in order: one continuous sequence of what the work
  // did, and the unit the reader travels through this role.
  const milestones: Milestone[] = flows.flatMap((flow) =>
    flow.stages.map((stage) => ({ ...stage, flowLabel: flow.label })),
  )
  const total = Math.max(1, milestones.length)

  /**
   * A stage the reader has chosen to linger on. `held` tells a deliberate click
   * apart from a passing hover or focus, so moving the pointer away releases the
   * caption while a click keeps it there.
   */
  const [pinned, setPinned] = useState<{ id: string; held: boolean } | null>(null)
  // 1 while something is chosen, 0 otherwise. A motion value, so lighting and
  // releasing a caption never re-renders the roles around it.
  const holding = useMotionValue(0)
  // Mirrored in a ref so the handlers below stay correct when a scroll lands a
  // mouseleave in the same tick as a click.
  const pinnedRef = useRef<{ id: string; held: boolean } | null>(null)

  const setPin = (next: { id: string; held: boolean } | null) => {
    pinnedRef.current = next
    setPinned(next)
    holding.set(next ? 1 : 0)
  }
  const choose = (id: string, held: boolean) => {
    // Hovering or focusing a stage the reader has already clicked must not
    // downgrade the hold to a preview, or the next click could never release it.
    const current = pinnedRef.current
    if (current && current.held && current.id === id) return
    setPin({ id, held })
  }
  const release = () => {
    if (!pinnedRef.current?.held) setPin(null)
  }
  const toggle = (id: string) => {
    if (pinnedRef.current?.held && pinnedRef.current.id === id) setPin(null)
    else choose(id, true)
  }

  return (
    <motion.article
      id={roleAnchor(experience.id)}
      aria-labelledby={`${experience.id}-role`}
      initial={reduceMotion ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
      className="relative scroll-mt-44"
    >
      {/* ── Identity ────────────────────────────────────────────────── */}
      {/* One line carries the whole record: position in the career, kind of
          engagement, its duration, the company, and whether it is current. */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="font-mono-code text-[0.62rem]" style={{ color: accent }}>
          {roleIndex(index)}
        </span>
        <span
          className="font-mono-code text-[0.62rem] uppercase tracking-widest"
          style={{ color: accent }}
        >
          {kind.glyph} {kind.label}
        </span>
        <span className="font-mono-code text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
          {experience.type === 'internship'
            ? ` · ${experience.period}`
            : ` · ${TYPE_LABEL[experience.type]} · ${experience.period}`}
        </span>
        {experience.companyUrl ? (
          <a
            href={experience.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded font-mono-code text-[0.62rem] transition-colors duration-200 hover:text-[var(--accent-teal)]"
            style={{ color: 'var(--accent-indigo)' }}
          >
            · {experience.company}
            <FiArrowUpRight size={9} aria-hidden="true" />
          </a>
        ) : (
          <span className="font-mono-code text-[0.62rem]" style={{ color: 'var(--accent-indigo)' }}>
            · {experience.company}
          </span>
        )}
        {experience.current && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-[0.1rem] font-mono-code text-[0.58rem] uppercase tracking-wider"
            style={{
              background: 'rgba(94,234,212,0.1)',
              border: '1px solid rgba(94,234,212,0.25)',
              color: 'var(--accent-teal)',
            }}
          >
            <span className="h-1 w-1 rounded-full bg-[var(--accent-teal)]" aria-hidden="true" />
            Current
          </span>
        )}
        <span
          className="hidden font-mono-code text-[0.62rem] sm:inline"
          style={{ color: active ? accent : 'var(--text-muted)' }}
        >
          {active ? '· reading now' : ''}
        </span>
      </div>

      <h3
        id={`${experience.id}-role`}
        className="mt-1.5 font-display text-[clamp(1.3rem,2.6vw,1.7rem)] font-light leading-[1.15] tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {experience.role}
      </h3>

      {/* ── Narrative and systems, side by side on a wide screen ────────── */}
      {/* Two columns rather than one tall stack: the prose and the systems the
          work ran through are read side by side, so a role costs the height of
          its taller half instead of the sum of both. */}
      <div className="mt-2.5 grid gap-x-10 gap-y-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* ── What the role was, and what it involved ─────────────────── */}
        <div className="min-w-0">
          {experience.story && (
            <p
              className="max-w-[60ch] text-[0.9rem] leading-[1.75]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {experience.story.summary}
            </p>
          )}

          {/* Responsibilities — always visible. */}
          <motion.ul
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-3 space-y-1.5"
          >
            {experience.description.map((point, i) => (
              <motion.li
                key={i}
                variants={reduceMotion ? undefined : fadeInUp}
                className="flex gap-2.5 text-[0.8rem] leading-[1.6]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span
                  className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full"
                  style={{ background: accent }}
                  aria-hidden="true"
                />
                <span>{point}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* ── Systems in play ────────────────────────────────────────── */}
        {flows.length > 0 && (
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2.5">
              <p
                className="font-mono-code text-[0.62rem] uppercase tracking-widest"
                style={{ color: accent }}
              >
                systems in play
              </p>
              <p className="font-mono-code text-[0.6rem]" style={{ color: 'var(--text-muted)' }}>
                {flows.length} workflow{flows.length === 1 ? '' : 's'} · {milestones.length} stages ·
                scroll or hover a stage to trace it
              </p>
            </div>

            {reduceMotion ? (
              <SystemsList milestones={milestones} accent={accent} />
            ) : (
              <>
                {/* The stage ribbon: every workflow and every stage on screen at
                    once. Only the lighting follows the scroll. */}
                <div className="mt-2.5 space-y-1.5">
                  {flows.map((flow) => (
                    <div key={flow.id} className="flex items-center gap-2.5">
                      <span
                        className="w-[5.5rem] shrink-0 font-mono-code text-[0.58rem] uppercase leading-tight tracking-wide"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {flow.label}
                      </span>
                      <ol className="no-scrollbar flex min-w-0 flex-1 items-center overflow-x-auto">
                        {flow.stages.map((stage) => (
                          <StageChip
                            key={stage.id}
                            label={stage.label}
                            accent={accent}
                            progress={progress}
                            chosen={pinned?.id === stage.id}
                            onPreview={() => choose(stage.id, false)}
                            onRelease={release}
                            onToggle={() => toggle(stage.id)}
                            {...stageWindow(
                              milestones.findIndex((m) => m.id === stage.id),
                              total,
                            )}
                          />
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>

                {/* One caption slot for the whole role, reserved to its tallest
                    description so switching stages never shifts the text. */}
                <div
                  className="mt-2.5 grid min-h-[3.4rem] gap-y-2 border-l-2 pl-3"
                  style={{ borderColor: accent }}
                >
                  {milestones.map((stage, i) => (
                    <StageCaption
                      key={stage.id}
                      milestone={stage}
                      accent={accent}
                      progress={progress}
                      holding={holding}
                      pinned={pinned?.id === stage.id}
                      {...stageWindow(i, total)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* ── Stack and evidence ────────────────────────────────────── */}
            <div
              className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t pt-2.5"
              style={{ borderColor: 'var(--border)' }}
            >
              {experience.technologies?.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full px-2 py-[0.1rem] font-mono-code text-[0.6rem]"
                  style={{
                    border: `1px solid ${accent}33`,
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {tech}
                </span>
              ))}
              {experience.sourceUrl && (
                <a
                  href={experience.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 font-mono-code text-[0.62rem] transition-colors duration-200 hover:text-[var(--accent-teal)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  public post
                  <FiArrowUpRight size={10} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.article>
  )
}

/**
 * Memoised so the four roles do not all re-render every time the active role
 * changes. Role data is a stable module constant and only the two roles at the
 * boundary of a move receive new props, so the section's React work stays
 * proportional to the move rather than to the length of the section.
 */
export default memo(CareerRole)

/** One stage on the ribbon, lit by how far the reader has travelled. */
function StageChip({
  label,
  accent,
  progress,
  chosen,
  onPreview,
  onRelease,
  onToggle,
  centre,
  half,
  fade,
}: {
  label: string
  accent: string
  progress: MotionValue<number>
  chosen: boolean
  onPreview: () => void
  onRelease: () => void
  onToggle: () => void
} & ReturnType<typeof stageWindow>) {
  // Derived from the scroll value, so lighting the ribbon never re-renders React.
  const lit = useTransform(progress, (v) =>
    clamp((half - Math.abs(v - centre)) / fade, 0, 1),
  )

  return (
    <li className="flex shrink-0 items-center">
      <motion.button
        type="button"
        aria-pressed={chosen}
        aria-label={`Read stage: ${label}`}
        onMouseEnter={onPreview}
        onMouseLeave={onRelease}
        onFocus={onPreview}
        onBlur={onRelease}
        onClick={onToggle}
        className="flex items-center rounded px-0.5 py-0.5 outline-offset-2"
        style={{ opacity: lit }}
      >
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: accent }}
        />
        <span
          className="ml-1.5 whitespace-nowrap font-mono-code text-[0.6rem] uppercase leading-none tracking-wide"
          style={{ color: chosen ? accent : 'var(--text-secondary)' }}
        >
          {label}
        </span>
      </motion.button>
      <motion.span
        aria-hidden="true"
        className="mx-1.5 h-px w-3.5 shrink-0"
        style={{ background: accent, opacity: lit }}
      />
    </li>
  )
}

/**
 * One stage description, cross-faded into the role's single caption slot.
 *
 * Lit by the scroll position, and held open while the reader has chosen a stage,
 * so the ambient pass never runs away faster than the eye.
 */
function StageCaption({
  milestone,
  accent,
  progress,
  holding,
  pinned,
  centre,
  half,
  fade,
}: {
  milestone: Milestone
  accent: string
  progress: MotionValue<number>
  holding: MotionValue<number>
  pinned: boolean
} & ReturnType<typeof stageWindow>) {
  const ambient = useTransform(progress, (v) =>
    clamp((half - Math.abs(v - centre)) / fade, 0, 1),
  )
  const opacity = useTransform<number, number>(
    [ambient, holding],
    (values) => (pinned && values[1] > 0.5 ? 1 : values[0]),
  )

  return (
    <motion.p
      className="[grid-area:1/1] text-[0.82rem] leading-[1.7]"
      style={{ opacity, color: 'var(--text-secondary)' }}
    >
      <span
        className="mr-2 font-mono-code text-[0.6rem] uppercase tracking-widest"
        style={{ color: accent }}
      >
        {milestone.flowLabel} · {milestone.label}
      </span>
      {milestone.detail}
    </motion.p>
  )
}

/**
 * Reduced motion: the ribbon becomes a plain two-column list of every stage and
 * what it did. Nothing is lit, nothing is hidden, and the section is complete
 * with every animation switched off.
 */
function SystemsList({
  milestones,
  accent,
}: {
  milestones: Milestone[]
  accent: string
}) {
  return (
    <ul className="mt-2.5 grid gap-x-6 gap-y-1.5">
      {milestones.map((milestone) => (
        <li
          key={milestone.id}
          className="text-[0.8rem] leading-[1.65]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span
            className="mr-2 font-mono-code text-[0.6rem] uppercase tracking-widest"
            style={{ color: accent }}
          >
            {milestone.flowLabel} · {milestone.label}
          </span>
          {milestone.detail}
        </li>
      ))}
    </ul>
  )
}