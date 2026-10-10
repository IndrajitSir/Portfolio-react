import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiSun, FiMoon, FiMenu, FiX, FiArrowUpRight, FiDownload } from 'react-icons/fi'
import { navItems } from '@/data/navigation'
import { personalInfo } from '@/data/personal'
import { useTheme } from '@/hooks/useTheme'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useRoute, useSectionNavigation, SIDE_MISSIONS_ROUTE, HOME_ROUTE } from '@/context/route'
// import MagneticButton from '@/components/ui/MagneticButton'
import { DURATION, EASE_OUT_EXPO, EASE_STANDARD, SPRING_LAYOUT } from '@/utils/motion'
import HireMeButton from '../ui/hireMeButton'

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()
  const { path, isSideMissions, navigate } = useRoute()
  const goToSection = useSectionNavigation()
  const reduceMotion = useReducedMotion()
  // Resolved by the shared hook rather than locally, because Strobi reads the
  // same value to choose its expression — one resolver, two readers.
  const activeSection = useActiveSection(path === HOME_ROUTE)
  const [scrolled,    setScrolled]    = useState(false)
  const [hoveredNav,  setHoveredNav]  = useState<string | null>(null)
  const [menuOpen,    setMenuOpen]    = useState(false)

  /* ── Scroll detection ─────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Active section ─────────────────────────────────── */
  // Owned by `useActiveSection` now — see the comment there for why the
  // scroll position is resolved rather than observed.

  /* ── Mobile menu helpers ──────────────────────────────── */
  const openMenu  = useCallback(() => {
    setMenuOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }, [])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeMenu])

  const handleNavClick = (href: string) => {
    // Route-aware: scrolls on the portfolio, or returns home first when invoked
    // from the Side Missions experience.
    goToSection(href.replace('#', ''))
    closeMenu()
  }

  /* ── Rail entrance ────────────────────────────────────── */
  // The bar drops in as one piece; the links then settle a beat apart so the
  // rail reads as a sequence instead of a wall of type. Fires once per mount
  // and holds no state afterwards, so hovering never re-renders the list.
  const railItem = (i: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: DURATION.quick,
      delay: reduceMotion ? 0 : 0.34 + i * 0.035,
      ease: EASE_OUT_EXPO,
    },
  })

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: DURATION.reveal, ease: EASE_STANDARD }}
        className={`
          fixed top-0 left-0 right-0 z-[100]
          grid grid-cols-2 items-center gap-x-6
          px-6 lg:px-8 xl:px-12 py-4
          transition-all duration-300
          ${scrolled
            ? 'backdrop-blur-2xl border-b border-[var(--border)]'
            : 'bg-transparent'}
        `}
        style={scrolled ? { background: isDark
          ? 'rgba(8,9,13,0.75)'
          : 'rgba(244,246,251,0.75)' } : {}}
      >
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); goToSection('hero') }}
          className="logo-link justify-self-start font-mono-code font-bold text-base tracking-wide"
          style={{ color: 'var(--accent-teal)' }}
          aria-label="Go to top"
        >
          IM<span className="logo-link__dot">.</span>
        </a>

        {/* Desktop links — the rail has to sit dead centre of the bar, and the
            logo and the controls are never the same width, so the rail is
            positioned against the viewport centre instead of being laid out
            between them (a justify-between row leaves it wherever the controls
            happen to end). The type scales at each breakpoint so the rail always
            clears the flanks with room to spare. */}
        <ul
          className="
            hidden lg:flex absolute left-1/2 top-0 h-full -translate-x-1/2
            items-center justify-center gap-x-2.5 xl:gap-x-4 2xl:gap-x-6
            text-[0.64rem] xl:text-[0.72rem] 2xl:text-[0.78rem]
            [--nav-track:0.06em] [--nav-track-hi:0.1em]
            xl:[--nav-track:0.09em] xl:[--nav-track-hi:0.14em]
          "
          role="list"
        >
          {navItems.map((item, i) => {
            const id = item.href.replace('#', '')
            const isActive = activeSection === id
            const indicatorId = hoveredNav ?? (activeSection || null)
            const showIndicator = indicatorId === id
            return (
              <motion.li key={item.href} {...railItem(i)}>
                <button
                  onClick={() => handleNavClick(item.href)}
                  onMouseEnter={() => setHoveredNav(id)}
                  onMouseLeave={() => setHoveredNav((h) => (h === id ? null : h))}
                  onFocus={() => setHoveredNav(id)}
                  onBlur={() => setHoveredNav((h) => (h === id ? null : h))}
                  aria-current={isActive ? 'true' : undefined}
                  className={`nav-link ${
                    isActive ? 'is-active' : ''
                  }`}
                >
                  <span className="nav-link__label">{item.label}</span>
                  {showIndicator && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="nav-indicator"
                      aria-hidden="true"
                      transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT}
                    />
                  )}
                </button>
              </motion.li>
            )
          })}

          {/* Side Missions — a route, not a section anchor, so it sits apart and
              carries its own indigo marker. */}
          <motion.li {...railItem(navItems.length)}>
            <button
              onClick={() => {
                navigate(SIDE_MISSIONS_ROUTE)
                closeMenu()
              }}
              aria-current={isSideMissions ? 'page' : undefined}
              className="nav-link nav-link--route group"
            >
              <span className="nav-link__label">Side Missions</span>
              <FiArrowUpRight
                size={12}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
              {isSideMissions && (
                <motion.span
                  layoutId="nav-route-indicator"
                  className="nav-indicator nav-indicator--route"
                  aria-hidden="true"
                  transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT}
                />
              )}
            </button>
          </motion.li>
        </ul>

        {/* Right controls */}
        <div className="flex items-center justify-self-end gap-3">
          {/* Resume — the one control a recruiter reaches for immediately. It
              waits for the widest breakpoint the rail can still clear; below
              that the hero, the drawer and Contact all carry their own copy. */}
          {personalInfo.resumeUrl && (
            <a
              href={personalInfo.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                hidden 2xl:inline-flex items-center gap-1.5 px-3.5 py-1.5
                rounded-full border border-[var(--border)] bg-[var(--surface)]
                font-mono-code text-[0.68rem] uppercase tracking-wider
                text-[var(--text-secondary)]
                hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
                transition-all duration-200
              "
            >
              <FiDownload size={12} aria-hidden="true" />
              Resume
            </a>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="
              w-9 h-9 rounded-full flex items-center justify-center overflow-hidden
              border border-[var(--border)] bg-[var(--surface)]
              hover:border-[var(--accent-teal)] hover:bg-[var(--glow-teal)]
              transition-all duration-200 text-[var(--text-secondary)]
              hover:text-[var(--accent-teal)]
            "
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: DURATION.quick, ease: EASE_STANDARD }}
                className="flex"
                aria-hidden="true"
              >
                {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
              </motion.span>
            </AnimatePresence>
          </button>

          {/* Hire Me CTA — desktop only, magnetic */}
          {/* <div className="hidden lg:block">
            <MagneticButton
              href="#contact"
              strength={0.18}
              onClick={(e) => { e?.preventDefault(); goToSection('contact') }}
              className="
                inline-flex items-center gap-2
                px-4 py-1.5 rounded-full border border-[var(--accent-teal)]
                text-[var(--accent-teal)] text-[0.72rem] font-semibold tracking-wide
                hover:bg-[var(--accent-teal)] hover:text-[var(--bg-primary)]
                transition-all duration-200
                2xl:px-5 2xl:py-2 2xl:text-[0.8rem]
              "
            >
              Hire Me
            </MagneticButton>
          </div> */}
          <HireMeButton onClick={(e) => { e?.preventDefault(); goToSection('contact') }} />
          {/* Hamburger — mobile only */}
          <button
            onClick={menuOpen ? closeMenu : openMenu}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="
              lg:hidden w-9 h-9 rounded-full flex items-center justify-center
              border border-[var(--border)] bg-[var(--surface)]
              text-[var(--text-primary)] transition-all duration-200
            "
          >
            {menuOpen ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile full-screen menu ──────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[98] lg:hidden"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={closeMenu}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="
                fixed top-0 right-0 bottom-0 z-[99] lg:hidden
                w-[min(320px,85vw)] flex flex-col
                pt-24 pb-10 px-8
              "
              style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Close button inside drawer */}
              <button
                onClick={closeMenu}
                aria-label="Close menu"
                className="
                  absolute top-5 right-5 w-9 h-9 rounded-full
                  flex items-center justify-center
                  border border-[var(--border)] bg-[var(--surface)]
                  text-[var(--text-secondary)] hover:text-[var(--accent-teal)]
                  hover:border-[var(--accent-teal)] transition-all duration-200
                "
              >
                <FiX size={16} />
              </button>

              <nav aria-label="Mobile navigation">
                <ul className="flex flex-col gap-2" role="list">
                  {navItems.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.35 }}
                    >
                      <button
                        onClick={() => handleNavClick(item.href)}
                        className="
                          w-full text-left py-4 border-b border-[var(--border)]
                          font-display text-2xl font-light italic
                          text-[var(--text-primary)] hover:text-[var(--accent-teal)]
                          transition-colors duration-200
                        "
                      >
                        {item.label}
                      </button>
                    </motion.li>
                  ))}

                  {/* Side Missions destination */}
                  <motion.li
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.07, duration: 0.35 }}
                  >
                    <button
                      onClick={() => {
                        navigate(SIDE_MISSIONS_ROUTE)
                        closeMenu()
                      }}
                      className="
                        flex w-full items-center gap-2 py-4 text-left
                        font-display text-2xl font-light italic
                        text-[var(--accent-indigo)]
                        transition-colors duration-200
                      "
                    >
                      Side Missions
                      <FiArrowUpRight size={18} aria-hidden="true" />
                    </button>
                  </motion.li>
                </ul>
              </nav>

              <div className="mt-auto space-y-3">
                {/* Resume stays reachable on mobile too — it is the control
                    recruiters reach for first. */}
                {personalInfo.resumeUrl && (
                  <a
                    href={personalInfo.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex items-center justify-center gap-2 py-3 rounded-full
                      border border-[var(--border)] bg-[var(--surface)]
                      font-mono-code text-xs uppercase tracking-wider
                      text-[var(--text-secondary)] hover:text-[var(--accent-teal)]
                      hover:border-[var(--accent-teal)] transition-all duration-200
                    "
                  >
                    <FiDownload size={13} aria-hidden="true" />
                    Resume
                  </a>
                )}
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); handleNavClick('#contact') }}
                  aria-label="Go to contact section"
                  className="
                    block text-center py-3 rounded-full
                    border border-[var(--accent-teal)] text-[var(--accent-teal)]
                    font-semibold text-sm tracking-wide
                    hover:bg-[var(--accent-teal)] hover:text-[var(--bg-primary)]
                    transition-all duration-200
                  "
                >
                  Hire Me
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
