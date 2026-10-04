import { FiGithub, FiExternalLink, FiArrowUpRight, FiCode, FiClock } from 'react-icons/fi'
import {
  GlowCard,
  Tag,
  ProjectCanvas1,
  ProjectCanvas2,
  NpmPublishScene,
  PlacementPipelineCanvas,
  WhatsAppAlertCanvas,
  OmniScriptCanvas,
  ResQGoCanvas,
} from '@/components/ui'
import { accentColor, accentRgb } from '@/utils/accents'
import { accentKey } from './accent'
import type { Project, ProjectVisual } from '@/types'

interface ProjectCardProps {
  project: Project
  index: number
  /**
   * Opens the case study. The study lives in a panel over the page rather than
   * inside the card: expanding it here grew the card by ~700px, which moved
   * every section below the carousel and lost the reader's place outright.
   */
  onOpenCaseStudy: (project: Project, trigger: HTMLButtonElement) => void
}

// Visual registry — a project points at its showcase through `project.visual`.
const projectVisuals: Partial<Record<ProjectVisual, () => JSX.Element>> = {
  'nest-auth': NpmPublishScene,
  'whatsapp-alert': WhatsAppAlertCanvas,
  placement: PlacementPipelineCanvas,
  omniscript: OmniScriptCanvas,
  resqgo: ResQGoCanvas,
}

export default function ProjectCard({ project, index, onOpenCaseStudy }: ProjectCardProps) {
  const even = index % 2 === 0
  const accent = accentKey(project, index)
  const accentHex = accentColor[accent]
  const rgb = accentRgb[accent]
  const Visual = (project.visual && projectVisuals[project.visual]) ?? (even ? ProjectCanvas1 : ProjectCanvas2)

  return (
    <GlowCard glowColor={`rgba(${rgb},0.16)`}>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* ── Visual panel ──────────────────────────────────── */}
        <div
          className="
            relative h-52 md:h-full md:min-h-[400px]
            overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none
            flex items-center justify-center
          "
          style={{
            background: `linear-gradient(135deg, rgba(${rgb},0.12) 0%, rgba(129,140,248,0.07) 55%, rgba(94,234,212,0.05) 100%)`,
          }}
          aria-hidden="true"
        >
          <Visual />

          {/* Project number watermark */}
          <span
            className="font-display text-[6.5rem] md:text-[7.5rem] font-light opacity-[0.1] select-none leading-none"
            style={{ color: accentHex }}
          >
            {project.number}
          </span>

          {/* Period — top-left stays clear so canvas HUDs never collide */}
          <span
            className="absolute top-4 left-4 flex items-center gap-1.5 font-mono-code text-[0.65rem] px-2.5 py-1 rounded-full"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-glow)',
              color: accentHex,
            }}
          >
            <FiClock size={10} />
            {project.period}
          </span>

          {/* Category badge */}
          <span
            className="absolute top-4 right-4 font-mono-code text-[0.65rem] px-2.5 py-1 rounded-full"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {project.category}
          </span>

        </div>

        {/* ── Content panel ─────────────────────────────────── */}
        <div className="p-7 md:p-8 flex flex-col">
          {/* Label + open-source marker */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p
              className="font-mono-code text-[0.65rem] tracking-widest uppercase"
              style={{ color: accentHex }}
            >
              Project — {project.number}
            </p>
            {project.openSource && (
              <span
                className="flex items-center gap-1 font-mono-code text-[0.6rem] px-2 py-0.5 rounded-full"
                style={{
                  background: `rgba(${rgb},0.12)`,
                  border: `1px solid rgba(${rgb},0.45)`,
                  color: accentHex,
                }}
              >
                <FiCode size={10} />
                Open source
              </span>
            )}
          </div>
          <h3 className="text-2xl font-semibold leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            {project.title}
          </h3>

          {project.highlight && (
            <p className="mb-3 font-mono-code text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>
              {project.highlight}
            </p>
          )}

          {/* Short description */}
          <p className="text-sm leading-[1.75] mb-5" style={{ color: 'var(--text-secondary)' }}>
            {project.description}
          </p>

          {/* Key features */}
          <div className="mb-5 space-y-1.5">
            <p
              className="font-mono-code text-[0.68rem] uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Key features
            </p>
            <ul className="space-y-1.5">
              {project.features.slice(0, 3).map((f, i) => (
                <li
                  key={i}
                  className="flex gap-2 items-start text-[0.82rem] leading-[1.6]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span style={{ color: accentHex }} aria-hidden="true">◆</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {project.technologies.map((tech) => (
              <Tag key={tech} label={tech} variant="indigo" />
            ))}
          </div>

          {/* Footer: links + the case study */}
          <div className="mt-auto flex items-center justify-between flex-wrap gap-3 pt-5 border-t border-[var(--border)]">
            <div className="flex gap-2">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Live preview of ${project.title}`}
                  className="
                    flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.78rem] font-semibold
                    bg-[var(--glow-teal)] border border-[var(--border-glow)] text-[var(--accent-teal)]
                    hover:bg-[var(--accent-teal)] hover:text-[var(--bg-primary)]
                    transition-all duration-200
                  "
                >
                  <FiExternalLink size={13} />
                  Live
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`GitHub repository for ${project.title}`}
                  className="
                    flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.78rem] font-semibold
                    border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]
                    hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
                    transition-all duration-200
                  "
                >
                  <FiGithub size={13} />
                  Code
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={(event) => onOpenCaseStudy(project, event.currentTarget)}
              aria-haspopup="dialog"
              className="
                flex items-center gap-1.5 text-[0.78rem] font-mono-code
                text-[var(--text-muted)] hover:text-[var(--accent-teal)]
                transition-colors duration-200
              "
            >
              <FiArrowUpRight size={13} /> Case study
            </button>
          </div>
        </div>
      </div>
    </GlowCard>
  )
}
