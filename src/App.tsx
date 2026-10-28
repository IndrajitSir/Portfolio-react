import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { RouteProvider } from '@/context/RouteContext'
import { useRoute } from '@/context/route'
import { useLenis } from '@/hooks/useLenis'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import ScrollProgress from '@/components/ui/ScrollProgress'
import NoiseOverlay from '@/components/ui/NoiseOverlay'
import Hero from '@/sections/Hero/Hero'

// Strobi is deferred rather than imported eagerly. Its avatar runtime pulls the
// whole JSON-schema validator (`ajv`) into whichever chunk loads it — ~150 kB of
// code that validates one avatar definition at import time. As global chrome it
// does not block the first paint: it wakes on its own timer a couple of seconds
// after mount, so loading it in parallel with the hero costs nothing visually
// and keeps the entry chunk free of the validator.
const StrobiCompanion = lazy(() => import('@/components/ui/StrobiCompanion'))

// The whale stage owns the Three.js scene, so it loads below the hero rather
// than in the entry chunk.
const Whale = lazy(() => import('@/sections/Whale/Whale'))

function DeferredWhale() {
  const placeholderRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(
    () => typeof window !== 'undefined' && window.location.hash.startsWith('#whale-'),
  )

  useEffect(() => {
    if (shouldLoad) return
    const placeholder = placeholderRef.current
    if (!placeholder) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin: '50% 0px' },
    )
    observer.observe(placeholder)
    return () => observer.disconnect()
  }, [shouldLoad])

  if (!shouldLoad) {
    return <div ref={placeholderRef} id="whale" aria-hidden="true" style={{ height: '1000svh' }} />
  }

  return (
    <Suspense fallback={<div id="whale" aria-hidden="true" style={{ height: '1000svh' }} />}>
      <Whale />
    </Suspense>
  )
}

function DeferredStrobiCompanion() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let timer = 0
    const onFirstInput = () => {
      window.removeEventListener('pointerdown', onFirstInput)
      window.removeEventListener('keydown', onFirstInput)
      window.removeEventListener('scroll', onFirstInput)
      timer = window.setTimeout(() => setReady(true), 1200)
    }
    window.addEventListener('pointerdown', onFirstInput, { once: true, passive: true })
    window.addEventListener('keydown', onFirstInput, { once: true })
    window.addEventListener('scroll', onFirstInput, { once: true, passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointerdown', onFirstInput)
      window.removeEventListener('keydown', onFirstInput)
      window.removeEventListener('scroll', onFirstInput)
    }
  }, [])

  return ready ? (
    <Suspense fallback={null}>
      <StrobiCompanion />
    </Suspense>
  ) : null
}

// Lazy-load below-fold sections for performance
const About       = lazy(() => import('@/sections/About/About'))
const Skills      = lazy(() => import('@/sections/Skills/Skills'))
const Experience  = lazy(() => import('@/sections/Experience/Experience'))
const Projects    = lazy(() => import('@/sections/Projects/Projects'))
const Journey     = lazy(() => import('@/sections/Journey/Journey'))
const Education   = lazy(() => import('@/sections/Education/Education'))
const Certifications = lazy(() => import('@/sections/Certifications/Certifications'))
const Contact     = lazy(() => import('@/sections/Contact/Contact'))
const SideMissions = lazy(() => import('@/sections/SideMissions/SideMissions'))

const SectionFallback = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-teal)] border-t-transparent animate-spin" />
  </div>
)

/**
 * Every portfolio chapter is its own page, keyed by the section id it renders.
 * The whale's containers are the way in; a section hash opens the same page.
 */
const chapterSections: Record<string, LazyExoticComponent<ComponentType>> = {
  about: About,
  journey: Journey,
  skills: Skills,
  experience: Experience,
  projects: Projects,
  education: Education,
  credentials: Certifications,
  contact: Contact,
}

function ChapterPage({ id }: { id: string }) {
  const Section = chapterSections[id]
  return (
    <main id="main-content" role="main" className="min-h-[100svh]">
      <Suspense fallback={<SectionFallback />}>
        <Section />
      </Suspense>
      <a
        href="#whale"
        className="fixed bottom-5 left-5 z-[80] inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(6,11,21,0.86)] px-3.5 py-2 font-mono-code text-[0.6rem] uppercase tracking-[0.14em] backdrop-blur-xl transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <FiArrowLeft size={12} aria-hidden="true" />
        Back to the whale
      </a>
    </main>
  )
}

function Portfolio() {
  return (
    <main id="main-content" role="main">
      <Hero />
      {/* Keep its full scroll space, but don't fetch Three.js until the stage is near. */}
      <DeferredWhale />
    </main>
  )
}

function AppInner() {
  useLenis()
  const { isSideMissions, sectionPage } = useRoute()
  const chapterId = sectionPage && chapterSections[sectionPage] ? sectionPage : null

  // A chapter page starts at its top. Coming back with `#whale` is different:
  // the whale resolves that hash itself and lands on the assembled carrier.
  useEffect(() => {
    if (chapterId || window.location.hash !== '#whale') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [chapterId])

  return (
    <div className="relative min-h-screen">
      <NoiseOverlay />
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      {!isSideMissions && <DeferredStrobiCompanion />}

      {isSideMissions ? (
        <Suspense fallback={<SectionFallback />}>
          <main id="main-content" role="main">
            <SideMissions />
          </main>
        </Suspense>
      ) : chapterId ? (
        <ChapterPage id={chapterId} />
      ) : (
        <Portfolio />
      )}

      <Footer />
    </div>
  )
}

/**
 * The portfolio ships dark-only. There is no theme provider, no persisted
 * preference and no toggle: `<html class="dark">` is set in `index.html`, so the
 * very first paint is already the finished theme and nothing can flash light.
 */
export default function App() {
  return (
    <RouteProvider>
      <AppInner />
    </RouteProvider>
  )
}
