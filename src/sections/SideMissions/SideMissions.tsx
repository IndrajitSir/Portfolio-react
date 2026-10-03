import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  FiArrowLeft,
  FiExternalLink,
  FiGithub,
  FiInfo,
  FiLayers,
  FiMousePointer,
} from 'react-icons/fi'
import { sideProjects } from '@/data'
import { SectionBackground, Tag } from '@/components/ui'
import { accentColor, accentRgb } from '@/utils/accents'
import { DURATION, EASE_OUT_EXPO, EASE_STANDARD } from '@/utils/motion'
import { useRoute, SIDE_MISSIONS_ROUTE, HOME_ROUTE } from '@/context/route'
import MissionCard from './MissionCard'
import MissionPreview from './MissionPreview'

const EASE = EASE_STANDARD

export default function SideMissions() {
  const reduceMotion = useReducedMotion()
  const { missionId, navigate } = useRoute()

  // Route is the source of truth: a deep link like `#/side-missions/tryonix`
  // preselects that mission, and selecting one updates the URL so the view is
  // shareable and back/forward work naturally.
  const [selectedId, setSelectedId] = useState<string>(() => missionId ?? sideProjects[0].id)

  useEffect(() => {
    if (missionId && sideProjects.some((p) => p.id === missionId)) setSelectedId(missionId)
  }, [missionId])

  const select = useCallback(
    (id: string) => {
      setSelectedId(id)
      if (id !== missionId) {
        window.history.replaceState(null, '', `#${SIDE_MISSIONS_ROUTE}/${id}`)
      }
    },
    [missionId],
  )

  const selected = sideProjects.find((p) => p.id === selectedId) ?? sideProjects[0]
  const accentHex = accentColor[selected.accent]
  const rgb = accentRgb[selected.accent]

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <SectionBackground variant="packages" />

      <div className="max-container section-padding relative z-10 pt-28">
        {/* ── Return + header ──────────────────────────────────────── */}
        <motion.button
          type="button"
          onClick={() => navigate(HOME_ROUTE, { section: 'projects' })}
          initial={reduceMotion ? undefined : { opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO }}
          className="group mb-8 inline-flex items-center gap-2 font-mono-code text-[0.68rem] uppercase tracking-widest transition-colors duration-200"
          style={{ color: 'var(--text-muted)' }}
        >
          <FiArrowLeft
            size={14}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          <span className="transition-colors duration-200 group-hover:text-[var(--accent-teal)]">
            Back to portfolio
          </span>
        </motion.button>

        <motion.header
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
          className="mb-12"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="block h-px w-6" style={{ background: 'var(--accent-indigo)' }} />
            <span
              className="font-mono-code text-xs uppercase tracking-widest"
              style={{ color: 'var(--accent-indigo)' }}
            >
              Side Missions
            </span>
          </div>
          <h1
            className="font-display font-light leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', color: 'var(--text-primary)' }}
          >
            The{' '}
            <em className="not-italic" style={{ color: 'var(--accent-indigo)' }}>
              experimental lab
            </em>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
            Smaller builds kept deliberately separate from the main work: a graph canvas, a
            virtual try-on pipeline and a browser game. Hover a mission to wake its preview,
            then open the brief to see how it actually works.
          </p>
        </motion.header>

        {/* ── Featured mission: the active briefing ────────────────── */}
        <section aria-label="Selected mission" className="mb-16">
          <div
            className="relative overflow-hidden rounded-2xl border bg-[var(--surface)] backdrop-blur-md"
            style={{ borderColor: `rgba(${rgb},0.35)` }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(700px circle at 20% 0%, rgba(${rgb},0.12), transparent 65%)` }}
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              {/* Live interactive preview */}
              <div
                className="relative h-64 border-b border-[var(--border)] lg:h-auto lg:min-h-[380px] lg:border-b-0 lg:border-r"
                style={{
                  background: `linear-gradient(135deg, rgba(${rgb},0.12) 0%, rgba(129,140,248,0.06) 55%, rgba(94,234,212,0.04) 100%)`,
                }}
              >
                <MissionPreview project={selected} />
                <span
                  className="pointer-events-none absolute left-4 top-4 rounded-full px-2.5 py-1 font-mono-code text-[0.62rem]"
                  style={{ background: 'var(--surface)', border: `1px solid rgba(${rgb},0.45)`, color: accentHex }}
                >
                  {selected.number} · {selected.title}
                </span>
              </div>

              {/* Briefing */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: DURATION.quick, ease: EASE }}
                  className="flex flex-col p-6 sm:p-8"
                >
                  <p
                    className="font-mono-code text-[0.65rem] uppercase tracking-widest"
                    style={{ color: accentHex }}
                  >
                    Mission {selected.number}
                  </p>
                  <h2
                    className="mt-1 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-light leading-tight tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selected.title}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {selected.tagline}
                  </p>

                  <p className="mt-4 text-sm leading-[1.75]" style={{ color: 'var(--text-secondary)' }}>
                    {selected.description}
                  </p>

                  {selected.interaction && (
                    <p
                      className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 font-mono-code text-[0.68rem] leading-[1.6]"
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
                    >
                      <FiMousePointer size={13} className="mt-[3px] shrink-0" style={{ color: accentHex }} aria-hidden="true" />
                      {selected.interaction}
                    </p>
                  )}

                  {selected.note && (
                    <p className="mt-3 flex items-start gap-2 text-[0.72rem] leading-[1.6]" style={{ color: 'var(--text-muted)' }}>
                      <FiInfo size={12} className="mt-[3px] shrink-0" aria-hidden="true" />
                      {selected.note}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {selected.technologies.map((tech) => (
                      <Tag key={tech} label={tech} variant="indigo" />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-5 lg:mt-auto">
                    {selected.liveUrl && (
                      <a
                        href={selected.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open the live ${selected.title} app`}
                        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.78rem] font-semibold transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: `rgba(${rgb},0.14)`,
                          border: `1px solid rgba(${rgb},0.45)`,
                          color: accentHex,
                        }}
                      >
                        <FiExternalLink size={13} />
                        Live demo
                      </a>
                    )}
                    {selected.githubUrl && (
                      <a
                        href={selected.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View source code for ${selected.title}`}
                        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[0.78rem] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <FiGithub size={13} />
                        Source
                      </a>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── Mission selection grid ───────────────────────────────── */}
        <section aria-label="All missions">
          <div className="mb-6 flex items-center gap-3">
            <FiLayers size={14} style={{ color: 'var(--accent-indigo)' }} aria-hidden="true" />
            <span className="font-mono-code text-[0.68rem] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              All missions ({String(sideProjects.length).padStart(2, '0')})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sideProjects.map((project, i) => (
              <MissionCard
                key={project.id}
                project={project}
                index={i}
                selected={project.id === selectedId}
                onOpen={() => select(project.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
