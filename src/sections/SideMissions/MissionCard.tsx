import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FiArrowUpRight, FiPlay } from 'react-icons/fi'
import { GrapifyCanvas, TryOnixCanvas, BubbleGameCanvas } from '@/components/ui'
import { accentColor, accentRgb } from '@/utils/accents'
import { DURATION, EASE_OUT_EXPO } from '@/utils/motion'
import type { ProjectVisual, SideProject } from '@/types'

// Same registry shape as the old side-project card — a mission points at the
// animated preview it should render through `project.visual`.
const visuals: Partial<Record<ProjectVisual, () => JSX.Element>> = {
  grapify: GrapifyCanvas,
  tryonix: TryOnixCanvas,
  bubble: BubbleGameCanvas,
}

interface MissionCardProps {
  project: SideProject
  index: number
  selected: boolean
  onOpen: () => void
}

export default function MissionCard({ project, index, selected, onOpen }: MissionCardProps) {
  const reduceMotion = useReducedMotion()
  // Hover is a purely local affordance: it lifts the card and reveals the real
  // interaction hint without re-selecting the featured mission, so pointer
  // movement never remounts the large briefing canvas.
  const [hovered, setHovered] = useState(false)
  const Visual = visuals[project.visual]
  const accentHex = accentColor[project.accent]
  const rgb = accentRgb[project.accent]
  const active = selected || hovered

  return (
    <motion.article
      initial={reduceMotion ? undefined : { opacity: 0, y: 26 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO, delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative h-full"
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: active ? -5 : 0, borderColor: active ? accentHex : 'var(--border)' }
        }
        transition={{ duration: DURATION.quick, ease: EASE_OUT_EXPO }}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--surface)] backdrop-blur-md"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Glow that reacts to hover/selection, tying the card to its accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: active ? 1 : 0,
            background: `radial-gradient(520px circle at 50% 0%, rgba(${rgb},0.16), transparent 70%)`,
          }}
        />

        {/* ── Live preview: the real, interactive canvas ───────────── */}
        <div
          className="relative h-48 shrink-0 overflow-hidden border-b border-[var(--border)]"
          style={{
            background: `linear-gradient(135deg, rgba(${rgb},0.14) 0%, rgba(129,140,248,0.06) 60%, rgba(94,234,212,0.05) 100%)`,
          }}
        >
          {Visual && <Visual />}

          <span
            className="pointer-events-none absolute left-3 top-3 rounded-full px-2.5 py-0.5 font-mono-code text-[0.6rem]"
            style={{ background: 'var(--bg-primary)', border: `1px solid rgba(${rgb},0.4)`, color: accentHex }}
          >
            {project.number}
          </span>

          {project.interaction && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
              <span
                className="flex max-w-full translate-y-1 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono-code text-[0.58rem] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <FiPlay size={9} style={{ color: accentHex }} />
                <span className="truncate">{project.interaction}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Mission brief ────────────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col p-5">
          <h3 className="text-[1.05rem] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {project.title}
          </h3>
          <p className="mb-2 font-mono-code text-[0.63rem] uppercase tracking-wide" style={{ color: accentHex }}>
            {project.tagline}
          </p>
          <p className="mb-4 text-[0.82rem] leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>
            {project.description}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[var(--border)] px-2 py-0.5 font-mono-code text-[0.6rem]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {tech}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpen}
              aria-pressed={selected}
              className="group/btn inline-flex shrink-0 items-center gap-1.5 font-mono-code text-[0.68rem] uppercase tracking-wider transition-colors duration-200"
              style={{ color: accentHex }}
              aria-label={`Open mission briefing for ${project.title}`}
            >
              {selected ? 'Viewing' : 'Mission brief'}
              <FiArrowUpRight
                size={13}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.article>
  )
}
