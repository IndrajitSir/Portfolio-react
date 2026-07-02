import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi'
import { navItems } from '@/data/navigation'
import { useTheme } from '@/hooks/useTheme'
import { scrollToSection } from '@/utils'

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()
  const [scrolled,    setScrolled]    = useState(false)
  const [activeSection, setActive]    = useState('')
  const [menuOpen,    setMenuOpen]    = useState(false)

  /* ── Scroll detection ─────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Active section via IntersectionObserver ──────────── */
  useEffect(() => {
    const ids = navItems.map((n) => n.href.replace('#', ''))
    const observers: IntersectionObserver[] = []

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { threshold: 0.35 },
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

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
    const id = href.replace('#', '')
    scrollToSection(id)
    closeMenu()
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`
          fixed top-0 left-0 right-0 z-[100]
          flex items-center justify-between
          px-6 md:px-12 py-4
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
          onClick={(e) => { e.preventDefault(); scrollToSection('hero') }}
          className="font-mono-code font-bold text-base tracking-wide"
          style={{ color: 'var(--accent-teal)' }}
          aria-label="Go to top"
        >
          IM<span style={{ color: 'var(--text-primary)' }}>.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {navItems.map((item) => {
            const id = item.href.replace('#', '')
            const isActive = activeSection === id
            return (
              <li key={item.href}>
                <button
                  onClick={() => handleNavClick(item.href)}
                  className={`
                    relative font-body text-[0.8rem] font-medium tracking-widest uppercase
                    transition-colors duration-200
                    ${isActive
                      ? 'text-[var(--accent-teal)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--accent-teal)]'}
                  `}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px"
                      style={{ background: 'var(--accent-teal)' }}
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle colour theme"
            className="
              w-9 h-9 rounded-full flex items-center justify-center
              border border-[var(--border)] bg-[var(--surface)]
              hover:border-[var(--accent-teal)] hover:bg-[var(--glow-teal)]
              transition-all duration-200 text-[var(--text-secondary)]
              hover:text-[var(--accent-teal)]
            "
          >
            {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
          </button>

          {/* Hire Me CTA — desktop only */}
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); scrollToSection('contact') }}
            className="
              hidden md:inline-flex items-center gap-2
              px-5 py-2 rounded-full border border-[var(--accent-teal)]
              text-[var(--accent-teal)] text-[0.8rem] font-semibold tracking-wide
              hover:bg-[var(--accent-teal)] hover:text-[var(--bg-primary)]
              transition-all duration-200
            "
          >
            Hire Me
          </a>

          {/* Hamburger — mobile only */}
          <button
            onClick={menuOpen ? closeMenu : openMenu}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="
              md:hidden w-9 h-9 rounded-full flex items-center justify-center
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
              className="fixed inset-0 z-[98] md:hidden"
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
                fixed top-0 right-0 bottom-0 z-[99] md:hidden
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
                </ul>
              </nav>

              <div className="mt-auto">
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); handleNavClick('#contact') }}
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
