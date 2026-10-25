import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import { FiArrowRight, FiArrowUpRight, FiX } from 'react-icons/fi'
import { useWebGLSupport } from '@/components/three/useWebGLSupport'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { getLenis } from '@/utils/lenisRef'
import { scrollToSection, scrollBehavior } from '@/utils'
import WhaleCanvas from './WhaleCanvas'
import WhaleFallback from './WhaleFallback'
import {
  ASSEMBLY_END,
  WHALE_STAGE_HEIGHT,
  progressForChapter,
  tourState,
  whaleChapters,
  type WhaleChapter,
} from './whaleChapters'

const CHAPTER_COUNT = whaleChapters.length
const HASH_PREFIX = 'whale-'

/**
 * The inside of a container: shown while the camera sits past its doorway.
 *
 * It is deliberately not a dialog — scrolling is what moves the visitor between
 * containers, so this cannot trap the scroll, the focus or the history.
 */
function ChapterPanel({
  chapter,
  onClose,
  onOpenFull,
}: {
  chapter: WhaleChapter
  onClose: () => void
  onOpenFull: (href: string) => void
}) {
  const externalLinks = chapter.links.filter((link) => link.external)

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.26 }}
    >
      {/* The container the camera is standing in stays faintly visible around
          the chapter, so the interior reads as a place rather than a modal. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 58% 54% at 50% 50%, rgba(2,5,12,0.92) 0%, rgba(3,7,16,0.74) 56%, rgba(3,7,16,0.3) 100%)',
        }}
      />

      <motion.div
        role="region"
        aria-labelledby="whale-chapter-title"
        data-lenis-prevent
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.99 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[82svh] w-full max-w-3xl overflow-y-auto border border-[rgba(94,234,212,0.22)] bg-[#060c17] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.055) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      >
        {/* Container seams. */}
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[rgba(94,234,212,0.45)]" />
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-[rgba(94,234,212,0.25)]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(94,234,212,0.14)] bg-[rgba(5,11,21,0.72)] px-5 py-3 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="font-mono-code text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: 'var(--accent-teal)' }}>
              {chapter.code}
            </span>
            <span aria-hidden="true" className="hidden h-3 w-px sm:block" style={{ background: 'var(--border-strong)' }} />
            <span className="hidden font-mono-code text-[0.56rem] uppercase tracking-[0.2em] sm:block" style={{ color: 'var(--text-muted)' }}>
              Container interior · carrier 01
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Leave the container and return to the whale"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
          >
            <FiX size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-6 sm:px-7 sm:py-8">
          <p className="font-mono-code text-[0.62rem] uppercase tracking-[0.22em]" style={{ color: 'var(--accent-teal)' }}>
            {chapter.label} — chapter {chapter.code.replace('CH-', '')}
          </p>
          <h2
            id="whale-chapter-title"
            className="mt-2 font-display text-[clamp(1.9rem,4.6vw,3rem)] font-light leading-[1.05] tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {chapter.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
            {chapter.summary}
          </p>

          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <p className="mb-3 font-mono-code text-[0.58rem] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              Manifest
            </p>
            <ul className="space-y-2">
              {chapter.facts.map((fact, index) => (
                <li key={fact} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-0.5 font-mono-code text-[0.6rem]" style={{ color: 'var(--accent-teal)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {externalLinks.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {externalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 font-mono-code text-[0.66rem] transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {link.label}
                  <FiArrowUpRight size={12} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenFull(chapter.href)}
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--accent-teal)] px-4 py-2.5 font-mono-code text-[0.72rem] font-semibold uppercase tracking-wider text-[var(--bg-primary)] transition-colors hover:bg-[#7ff3e0]"
            >
              Open the full chapter
              <FiArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-lg border border-[var(--border)] px-4 py-2.5 font-mono-code text-[0.7rem] uppercase tracking-wider transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Back to the whale
            </button>
          </div>

          <p className="mt-5 font-mono-code text-[0.56rem] uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
            Keep scrolling to leave this container for the next
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Whale() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)

  const reduceMotion = useReducedMotion()
  const compact = useMediaQuery('(max-width: 767px)')
  const webgl = useWebGLSupport()
  const inView = useInView(stageRef, { margin: '15% 0px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const [assembled, setAssembled] = useState(false)
  const [inside, setInside] = useState(false)

  const syncProgress = useCallback((value: number) => {
    progressRef.current = value
    const state = tourState(value)
    setActive((current) => (current === state.index ? current : state.index))
    setInside(state.inside)
    setAssembled(value >= ASSEMBLY_END - 0.005)
    // Scrolling back out of the containers leaves the hash behind it.
    if (value <= ASSEMBLY_END + 0.002 && window.location.hash.startsWith(`#${HASH_PREFIX}`)) {
      window.history.replaceState(null, '', '#whale')
    }
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', syncProgress)

  useEffect(() => {
    syncProgress(scrollYProgress.get())
  }, [scrollYProgress, syncProgress])

  /** Move the page to an arbitrary point of the tour. */
  const scrollToProgress = useCallback((progress: number, immediate = false) => {
    const section = sectionRef.current
    if (!section) return
    const top = section.getBoundingClientRect().top + window.scrollY
    const travel = Math.max(1, section.offsetHeight - window.innerHeight)
    const target = top + progress * travel
    const lenis = getLenis()
    if (lenis) {
      // Coming from a short chapter page, Lenis still holds that page's scroll
      // limit and would clamp this target; remeasure before travelling.
      lenis.resize()
      lenis.scrollTo(target, { duration: immediate ? 0 : 1.15, immediate })
    } else {
      window.scrollTo({ top: target, behavior: immediate ? 'auto' : scrollBehavior() })
    }
  }, [])

  /** Select a container: the scroll lands the camera inside it, and the
   *  interior panel follows from that position like every other frame. */
  const openChapter = useCallback(
    (index: number) => {
      scrollToProgress(progressForChapter(index), reduceMotion ?? false)
      const hash = `#${HASH_PREFIX}${whaleChapters[index].id}`
      if (window.location.hash !== hash) window.history.pushState(null, '', hash)
    },
    [reduceMotion, scrollToProgress],
  )

  const returnToWhale = useCallback(() => {
    scrollToProgress(ASSEMBLY_END, reduceMotion ?? false)
    if (window.location.hash.startsWith(`#${HASH_PREFIX}`)) {
      window.history.replaceState(null, '', '#whale')
    }
  }, [reduceMotion, scrollToProgress])

  const openFullChapter = useCallback((href: string) => {
    // No section exists on this page — the hash is what opens its chapter page.
    scrollToSection(href.replace('#', ''))
  }, [])

  /* Escape leaves the container; it does not fight the scroll. */
  useEffect(() => {
    if (!inside) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      returnToWhale()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [inside, returnToWhale])

  /* Deep links and browser history: #whale-about starts inside that container,
     #whale (or plain history back) returns to the assembled whale. */
  useEffect(() => {
    let first = true
    const readHash = () => {
      const raw = window.location.hash.replace(/^#/, '')
      const index = raw.startsWith(HASH_PREFIX)
        ? whaleChapters.findIndex((chapter) => chapter.id === raw.slice(HASH_PREFIX.length))
        : -1
      const wasFirst = first
      first = false
      if (index >= 0) {
        scrollToProgress(progressForChapter(index), true)
        return
      }
      if (wasFirst && raw !== 'whale') return
      scrollToProgress(ASSEMBLY_END, true)
    }

    window.addEventListener('popstate', readHash)
    window.addEventListener('hashchange', readHash)
    readHash()
    return () => {
      window.removeEventListener('popstate', readHash)
      window.removeEventListener('hashchange', readHash)
    }
  }, [scrollToProgress])

  const chapter = whaleChapters[active]

  return (
    <section
      ref={sectionRef}
      id="whale"
      aria-label="3D whale navigation through the portfolio chapters"
      className="relative"
      style={{ height: webgl ? WHALE_STAGE_HEIGHT : '100vh', background: 'var(--bg-primary)' }}
    >
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Blueprint atmosphere. The 3D object itself carries the depth. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 62% 54% at 50% 48%, rgba(29,99,237,0.20) 0%, rgba(8,14,28,0.65) 48%, #05070d 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(56,132,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(56,132,255,0.07) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 82%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 82%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: 'linear-gradient(180deg, var(--bg-primary), transparent)' }}
        />

        <h2 className="sr-only">
          Portfolio navigation: six clickable containers on a 3D whale, one for each chapter.
        </h2>

        <p className="sr-only" aria-live="polite">
          {inside ? `Inside container ${chapter.code}: ${chapter.label}` : ''}
        </p>

        {webgl ? (
          <>
            <div className="absolute inset-0 z-0">
              <WhaleCanvas
                progressRef={progressRef}
                hovered={inside ? null : hovered}
                assembled={assembled}
                inside={inside}
                reduceMotion={reduceMotion ?? false}
                compact={compact}
                inView={inView}
                onHover={setHovered}
                onSelect={openChapter}
              />
            </div>

            {/* Header */}
            <div className="pointer-events-none absolute left-5 top-24 z-20 max-w-[19rem] sm:left-8 sm:max-w-sm xl:left-16">
              <div className="flex items-center gap-3">
                <span className="block h-px w-6" style={{ background: 'var(--accent-teal)' }} />
                <span className="font-mono-code text-[0.6rem] uppercase tracking-[0.22em]" style={{ color: 'var(--accent-teal)' }}>
                  03 — Navigation
                </span>
              </div>
              <p
                className="mt-3 font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-light leading-[1.08] tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                A whale carrying
                <br />
                <em className="not-italic" style={{ color: 'var(--accent-teal)' }}>
                  your route through the work.
                </em>
              </p>
              <p
                className="mt-2 hidden text-[0.78rem] leading-5 sm:block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Six containers, six real chapters. Scroll to enter each one in turn.
              </p>
            </div>

            {/* Status */}
            <div className="pointer-events-none absolute right-5 top-24 z-20 text-right sm:right-8 xl:right-16">
              <p className="font-mono-code text-[0.56rem] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                Carrier / Moby-01
              </p>
              <p className="mt-1 flex items-center justify-end gap-1.5 font-mono-code text-[0.58rem] uppercase tracking-[0.18em]" style={{ color: assembled ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: assembled ? 'var(--accent-teal)' : 'var(--accent-indigo)' }}
                />
                {inside
                  ? `Inside ${chapter.code}`
                  : assembled
                    ? 'Stack online · 06'
                    : 'Assembling stack'}
              </p>
            </div>

            {/* Scroll-driven chapter readout */}
            <div className="pointer-events-none absolute right-8 top-1/2 z-20 hidden w-[17.5rem] -translate-y-1/2 xl:block 2xl:right-16">
              <div className="border-l pl-4" style={{ borderColor: 'var(--border)' }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={chapter.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="font-mono-code text-[0.56rem] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                      {chapter.code} / {String(CHAPTER_COUNT).padStart(2, '0')}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                      {chapter.label}
                    </h3>
                    <p className="mt-2 text-[0.78rem] leading-5" style={{ color: 'var(--text-secondary)' }}>
                      {chapter.summary}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <button
                  type="button"
                  onClick={() => openChapter(active)}
                  className="pointer-events-auto mt-4 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-2 font-mono-code text-[0.64rem] uppercase tracking-wider transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Enter container
                  <FiArrowRight size={12} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Chapter rail: the keyboard-and-touch equivalent of the containers. */}
            <div className="absolute bottom-4 left-1/2 z-20 w-[min(1180px,calc(100%-1.5rem))] -translate-x-1/2 sm:bottom-6">
              <div className="mb-2 flex items-center justify-between font-mono-code text-[0.54rem] uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
                <span>Container manifest</span>
                <span className="hidden sm:inline">
                  {assembled ? 'Scroll container to container · select to jump' : 'Scroll to assemble the carrier'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                {whaleChapters.map((item, index) => {
                  const isActive = index === active
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openChapter(index)}
                      onMouseEnter={() => setHovered(index)}
                      onMouseLeave={() => setHovered((current) => (current === index ? null : current))}
                      onFocus={() => setHovered(index)}
                      onBlur={() => setHovered((current) => (current === index ? null : current))}
                      aria-label={`Enter container ${item.code}: ${item.label}`}
                      aria-current={isActive ? 'true' : undefined}
                      className="group relative overflow-hidden border px-2 py-2 text-left transition-colors duration-200 sm:px-3"
                      style={{
                        borderColor: isActive ? 'var(--accent-teal)' : 'var(--border)',
                        background: isActive ? 'rgba(94,234,212,0.10)' : 'rgba(7,12,22,0.72)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-px transition-opacity"
                        style={{
                          background: 'var(--accent-teal)',
                          opacity: isActive ? 1 : 0,
                        }}
                      />
                      <span className="block font-mono-code text-[0.52rem] tracking-[0.16em]" style={{ color: isActive ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                        {item.code}
                      </span>
                      <span className="mt-0.5 block font-mono-code text-[0.64rem] uppercase tracking-[0.08em]" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 z-10">
            <WhaleFallback />
          </div>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
          style={{ background: 'linear-gradient(0deg, var(--bg-primary), transparent)' }}
        />
      </div>

      <AnimatePresence>
        {inside && (
          <ChapterPanel
            key={chapter.id}
            chapter={chapter}
            onClose={returnToWhale}
            onOpenFull={openFullChapter}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
