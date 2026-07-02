import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGithub, FiExternalLink, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { GlowCard, Tag, ProjectCanvas1, ProjectCanvas2 } from '@/components/ui'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }}
    >
      <GlowCard className="overflow-visible">
        {/* Visual header */}
        <div
          className="h-44 relative overflow-hidden rounded-t-2xl flex items-center justify-center"
          style={{
            background: index % 2 === 0
              ? 'linear-gradient(135deg, rgba(94,234,212,0.08) 0%, rgba(129,140,248,0.06) 100%)'
              : 'linear-gradient(135deg, rgba(129,140,248,0.08) 0%, rgba(251,146,60,0.06) 100%)',
          }}
          aria-hidden="true"
        >
          {/* Decorative canvas / visual */}
          {index === 0 ? (
            <ProjectCanvas1 />
          ) : index === 1 ? (
            <ProjectCanvas2 />
          ) : (
            <svg
              className="absolute inset-0 w-full h-full opacity-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id={`grid-${project.id}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${project.id})`} />
            </svg>
          )}

          {/* Project number */}
          <span
            className="font-display text-[5rem] font-light opacity-10 select-none"
            style={{ color: index % 2 === 0 ? 'var(--accent-teal)' : 'var(--accent-indigo)' }}
          >
            {project.number}
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

        <div className="p-7">
          {/* Number + Title */}
          <p
            className="font-mono-code text-[0.65rem] tracking-widest uppercase mb-2"
            style={{ color: 'var(--accent-teal)' }}
          >
            Project — {project.number}
          </p>
          <h3
            className="text-xl font-semibold leading-tight mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {project.title}
          </h3>
          <p
            className="font-mono-code text-[0.7rem] mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            {project.period}
          </p>

          {/* Short description */}
          <p
            className="text-sm leading-[1.75] mb-5"
            style={{ color: 'var(--text-secondary)' }}
          >
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
                  <span style={{ color: 'var(--accent-indigo)' }} aria-hidden="true">◆</span>
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

          {/* Expandable: Deep-dive */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="deep-dive"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-[var(--border)] space-y-5 mb-5">
                  {/* Long description */}
                  <p className="text-sm leading-[1.75]" style={{ color: 'var(--text-secondary)' }}>
                    {project.longDescription}
                  </p>

                  {/* Challenges */}
                  <div>
                    <p
                      className="font-mono-code text-[0.68rem] uppercase tracking-wider mb-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Challenges
                    </p>
                    <ul className="space-y-1.5">
                      {project.challenges.map((c, i) => (
                        <li
                          key={i}
                          className="flex gap-2 items-start text-[0.82rem] leading-[1.6]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <span style={{ color: 'var(--accent-orange)' }} aria-hidden="true">⚡</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Solutions */}
                  <div>
                    <p
                      className="font-mono-code text-[0.68rem] uppercase tracking-wider mb-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Solutions
                    </p>
                    <ul className="space-y-1.5">
                      {project.solutions.map((s, i) => (
                        <li
                          key={i}
                          className="flex gap-2 items-start text-[0.82rem] leading-[1.6]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <span style={{ color: 'var(--accent-teal)' }} aria-hidden="true">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Remaining features */}
                  {project.features.length > 3 && (
                    <div>
                      <p
                        className="font-mono-code text-[0.68rem] uppercase tracking-wider mb-2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        All features
                      </p>
                      <ul className="space-y-1.5">
                        {project.features.map((f, i) => (
                          <li
                            key={i}
                            className="flex gap-2 items-start text-[0.82rem] leading-[1.6]"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <span style={{ color: 'var(--accent-indigo)' }} aria-hidden="true">◆</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer: links + expand */}
          <div className="flex items-center justify-between flex-wrap gap-3">
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
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="
                flex items-center gap-1.5 text-[0.78rem] font-mono-code
                text-[var(--text-muted)] hover:text-[var(--accent-teal)]
                transition-colors duration-200
              "
            >
              {expanded ? (
                <><FiChevronUp size={14} /> Collapse</>
              ) : (
                <><FiChevronDown size={14} /> Case study</>
              )}
            </button>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  )
}
