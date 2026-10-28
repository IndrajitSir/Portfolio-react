import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import { FiArrowRight, FiX } from 'react-icons/fi'
import { useWebGLSupport } from '@/components/three/useWebGLSupport'
import { ScrollContainerContext } from '@/context/ScrollContainer'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { getLenis } from '@/utils/lenisRef'
import { scrollBehavior } from '@/utils'
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

const chapterContent = {
  about: lazy(() => import('../About/About')),
  journey: lazy(() => import('../Journey/Journey')),
  skills: lazy(() => import('../Skills/Skills')),
  projects: lazy(() => import('../Projects/Projects')),
  experience: lazy(() => import('../Experience/Experience')),
  contact: lazy(() => import('../Contact/Contact')),
}

/**
 * The inside of a container: shown while the camera sits past its doorway.
 *
 * It is deliberately not a dialog — scrolling is what moves the visitor between
 * containers, so this cannot trap the scroll, the focus or the history.
 */
function ChapterPanel({
  chapter,
  onClose,
}: {
  chapter: WhaleChapter
  onClose: () => void
}) {
  const ChapterContent = chapterContent[chapter.id as keyof typeof chapterContent]
  // The panel, not the window, is what scrolls once the chapter is open — the
  // sections it renders read this so their scroll-driven values keep moving.
  const panelRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      className="fixed inset-0 z-[120]"
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
        ref={panelRef}
        role="region"
        aria-label={`${chapter.label} chapter`}
        data-lenis-prevent
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 14 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-[#060c17] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.055) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      >
        <div className="sticky top-0 z-[130] flex items-center justify-between border-b border-[rgba(94,234,212,0.14)] bg-[rgba(5,11,21,0.9)] px-5 py-3 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <span className="font-mono-code text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: 'var(--accent-teal)' }}>
              {chapter.code}
            </span>
            <span aria-hidden="true" className="h-3 w-px" style={{ background: 'var(--border-strong)' }} />
            <span className="font-mono-code text-[0.56rem] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              {chapter.label} · full chapter
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Leave the chapter and return to the whale"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
          >
            <FiX size={16} aria-hidden="true" />
          </button>
        </div>

        <ScrollContainerContext.Provider value={panelRef}>
          <Suspense fallback={<div className="min-h-[60svh] animate-pulse bg-[var(--bg-primary)]" aria-label={`Loading ${chapter.label} chapter`} />}>
            <ChapterContent />
          </Suspense>
        </ScrollContainerContext.Provider>
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
                      aria-label={`${item.code} ${item.label}`}
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
          />
        )}
      </AnimatePresence>
    </section>
  )
}
