import { lazy, Suspense } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'
import { useLenis } from '@/hooks/useLenis'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import Preloader from '@/components/ui/Preloader'
import ScrollProgress from '@/components/ui/ScrollProgress'
import NoiseOverlay from '@/components/ui/NoiseOverlay'
import Hero from '@/sections/Hero/Hero'

// Lazy-load below-fold sections for performance
const About       = lazy(() => import('@/sections/About/About'))
const Skills      = lazy(() => import('@/sections/Skills/Skills'))
const Experience  = lazy(() => import('@/sections/Experience/Experience'))
const Projects    = lazy(() => import('@/sections/Projects/Projects'))
const Education   = lazy(() => import('@/sections/Education/Education'))
const Certifications = lazy(() => import('@/sections/Certifications/Certifications'))
const Contact     = lazy(() => import('@/sections/Contact/Contact'))

const SectionFallback = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-teal)] border-t-transparent animate-spin" />
  </div>
)

function AppInner() {
  useLenis()

  return (
    <div className="relative min-h-screen">
      <NoiseOverlay />
      <ScrollProgress />
      <CustomCursor />
      <Preloader />
      <Navbar />

      <main id="main-content" role="main">
        <Hero />
        <Suspense fallback={<SectionFallback />}>
          <About />
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

      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
