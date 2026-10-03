import type { ReactNode } from 'react'
import { FiGithub, FiExternalLink, FiInfo, FiMousePointer } from 'react-icons/fi'
import {
  GlowCard,
  Tag,
  GrapifyCanvas,
  TryOnixCanvas,
  BubbleGameCanvas,
} from '@/components/ui'
import { accentColor, accentRgb } from '@/utils/accents'
import type { ProjectVisual, SideProject } from '@/types'

interface SideProjectCardProps {
  project: SideProject
}

// Visual registry — add a key here and new side projects can reuse it.
const visuals: Partial<Record<ProjectVisual, () => JSX.Element>> = {
  grapify: GrapifyCanvas,
  tryonix: TryOnixCanvas,
  bubble: BubbleGameCanvas,
}

export default function SideProjectCard({ project }: SideProjectCardProps) {
  const wide = project.layout === 'wide'
  const Visual = visuals[project.visual]
  const accentHex = accentColor[project.accent]
  const rgb = accentRgb[project.accent]

  const preview = (
    <div
      className={`relative flex-none overflow-hidden ${
        wide ? 'h-52 lg:h-auto lg:w-[46%]' : 'h-44'
      }`}
      style={{
        background: `linear-gradient(135deg, rgba(${rgb},0.14) 0%, rgba(129,140,248,0.06) 60%, rgba(94,234,212,0.05) 100%)`,
      }}
    >
      {Visual && <Visual />}

      {/* Number badge */}
      <span
        className="pointer-events-none absolute left-3 top-3 rounded-full px-2 py-0.5 font-mono-code text-[0.6rem]"
        style={{ background: 'var(--surface)', border: `1px solid rgba(${rgb},0.4)`, color: accentHex }}
      >
        {project.number}
      </span>

      {/* Interaction hint — fades in on hover, never blocks the canvas */}
      {project.interaction && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
          <span
            className="flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 font-mono-code text-[0.6rem] opacity-0 translate-y-1 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <FiMousePointer size={10} style={{ color: accentHex }} />
            <span className="truncate">{project.interaction}</span>
          </span>
        </div>
      )}
    </div>
  )

  const content = (
    <div className="flex flex-1 flex-col p-5">
      <h3 className="text-[1.05rem] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
        {project.title}
      </h3>
      <p className="mb-2 font-mono-code text-[0.63rem] uppercase tracking-wide" style={{ color: accentHex }}>
        {project.tagline}
      </p>
      <p className="mb-4 text-[0.82rem] leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>
        {project.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <Tag key={tech} label={tech} variant="indigo" />
        ))}
      </div>

      {project.note && (
        <p className="mb-4 flex gap-2 text-[0.72rem] leading-[1.6]" style={{ color: 'var(--text-muted)' }}>
          <FiInfo size={12} className="mt-[3px] flex-shrink-0" aria-hidden="true" />
          {project.note}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open the live ${project.title} app`}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[0.76rem] font-semibold transition-all duration-200"
            style={{
              background: `rgba(${rgb},0.12)`,
              border: `1px solid rgba(${rgb},0.4)`,
              color: accentHex,
            }}
          >
            <FiExternalLink size={12} />
            Live demo
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View source code for ${project.title}`}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[0.76rem] font-semibold transition-all duration-200"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <FiGithub size={12} />
            Code
          </a>
        )}
      </div>
    </div>
  )

  return (
    <SideFrame wide={wide} rgb={rgb}>
      {preview}
      {content}
    </SideFrame>
  )
}

function SideFrame({ children, wide, rgb }: { children: ReactNode; wide: boolean; rgb: string }) {
  return (
    <GlowCard className="group h-full" glowColor={`rgba(${rgb},0.16)`}>
      <div className={`flex h-full flex-col ${wide ? 'lg:flex-row' : ''}`}>{children}</div>
    </GlowCard>
  )
}
