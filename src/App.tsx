import { lazy, Suspense } from 'react'
import { RouteProvider } from '@/context/RouteContext'
import { useRoute } from '@/context/route'
import { useLenis } from '@/hooks/useLenis'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import Preloader from '@/components/ui/Preloader'
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

function Portfolio() {
  return (
    <main id="main-content" role="main">
      <Hero />
      <Suspense fallback={<SectionFallback />}>
        <About />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Journey />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Skills />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Experience />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Projects />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Education />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Certifications />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Contact />
      </Suspense>
    </main>
  )
}

function AppInner() {
  useLenis()
  const { isSideMissions } = useRoute()

  return (
    <div className="relative min-h-screen">
      <NoiseOverlay />
      <ScrollProgress />
      <CustomCursor />
      <Preloader />
      <Navbar />
      {!isSideMissions && (
        <Suspense fallback={null}>
          <StrobiCompanion />
        </Suspense>
      )}

      {isSideMissions ? (
        <Suspense fallback={<SectionFallback />}>
          <main id="main-content" role="main">
            <SideMissions />
          </main>
        </Suspense>
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
