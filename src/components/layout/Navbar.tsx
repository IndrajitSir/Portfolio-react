import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, AnimatePresence, m, useMotionValue, useReducedMotion, type MotionValue } from 'framer-motion'
import { FiMenu, FiX, FiArrowUpRight, FiDownload } from 'react-icons/fi'
import { navItems } from '@/data/navigation'
import { personalInfo } from '@/data/personal'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useRoute, useSectionNavigation, SIDE_MISSIONS_ROUTE, HOME_ROUTE } from '@/context/route'
import { DURATION, EASE_OUT_EXPO, EASE_STANDARD, SPRING_LAYOUT } from '@/utils/motion'
import { getLenis } from '@/utils/lenisRef'
import HireMeButton from '../ui/HireMeButton'
import ResumeButton from '../ui/ResumeButton'

/**
 * The bar has two states and one morph between them.
 *
 * At the top of the page it is the page's own header: full width, no surface of
 * its own, the monogram hard against the left gutter and the controls against
 * the right. Once the reader scrolls past the header it tightens into a floating
 * pill — a translucent dark surface with a hairline edge, centred on the screen,
 * with the same monogram, rail and controls inside it.
 *
 * The morph is geometry, not a swap: one element is resized (and its padding,
 * radius and surface faded in) so nothing is ever unmounted and no link can
 * disappear mid-transition. Three details make it read as a single object:
 *
 *  1. **The compact width is measured, never guessed.** The pill hugs its own
 *     contents, so its width is derived from the rendered logo, rail and
 *     controls. A `ResizeObserver` on those three keeps it honest as the rail
 *     reflows across breakpoints or a webfont swaps in, and the rail reports 0
 *     width on phones — where it is not rendered at all — so the pill collapses
 *     to just the monogram and the menu button.
 *
 *  2. **The rail stays optically centred.** Centred at the viewport centre while
 *     expanded (the monogram and the controls are never the same width, so a flow
 *     layout would sit it off-centre) and centred between them once compact — the
 *     offset between those two is `(logo − controls) / 2`, animated alongside the
 *     width. The rail is absolutely positioned the whole way, so it can never
 *     push the pill's own width around and the morph stays a pure size change.
 *
 *  3. **The bar's height holds still.** As the pill grows its own padding the bar
 *     gives up the same amount, so the pill inflates around the same centre line
 *     instead of sinking, and the bar's outside height changes by a few pixels
 *     only. The bar is `fixed`, so none of it can move the page.
 *
 * On phones there is no follow behaviour to worry about: the same morph runs and
 * the pill simply becomes a monogram and a menu button. The mobile drawer is a
 * real modal — one close control, owned by the drawer; the bar's toggle only
 * opens.
 */

/** Clearance the pill keeps on each side of the rail, in px. */
const RAIL_CLEARANCE = 18
/** Padding inside the compact pill. */
const PILL_PAD_X = 14
const PILL_PAD_Y = 9
/** Padding the bar keeps around the pill, at the top of the page and once compact. */
const BAR_PAD = 16
const BAR_PAD_COMPACT = 12

/**
 * Scroll thresholds, with hysteresis. A single threshold makes the state flicker
 * when the reader parks the scrollbar on it; leaving a gap between the two means
 * the morph only ever reverses when the intent is clear.
 */
const COMPACT_AT = 72
const EXPANDED_AT = 40

/** The morph itself: decelerating, a touch slower than a hover. */
const MORPH = { duration: 0.42, ease: EASE_OUT_EXPO }

/**
 * Below this width the bar's scroll morph is deliberately switched off: the
 * mobile rail is not rendered, so compacting would only ever shrink to the
 * same monogram + menu pill the bar already is, and the fluid motion pays for
 * nothing. Scrolling a phone therefore keeps the bar in its static expanded
 * state — no measurement churn, no re-renders, one fewer scroll listener cost.
 * Matches Tailwind's `lg` breakpoint, where the drawer button appears.
 */
const MORPH_DISABLE_QUERY = '(max-width: 1023px)'

/** Everything a keyboard can land on inside the drawer. */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

const DRAWER_ID = 'mobile-navigation'

export default function Navbar() {
  const { path, isSideMissions, navigate } = useRoute()
  const goToSection = useSectionNavigation()
  const reduceMotion = useReducedMotion()
  // Resolved by the shared hook rather than locally, because Strobi reads the
  // same value to choose its expression — one resolver, two readers.
  const activeSection = useActiveSection(path === HOME_ROUTE)
  const [compact, setCompact] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  /* ── Scroll detection ─────────────────────────────────── */
  // Throttled to one read per frame: a wheel gesture fires dozens of events and
  // the only thing that matters is where the page actually ended up. React bails
  // out when the answer has not changed, so hovering the rail is the only thing
  // left that re-renders the bar.
  //
  // On phones the morph is skipped entirely (see `MORPH_DISABLE_QUERY`): the
  // compact geometry would be the same pill the bar already is, so the listener
  // stills the state forever instead of chasing scroll positions.
  useEffect(() => {
    const compactDisabled = window.matchMedia(MORPH_DISABLE_QUERY)
    let frame = 0
    const resolve = () => {
      frame = 0
      if (compactDisabled.matches) {
        setCompact(false)
        return
      }
      const y = window.scrollY
      setCompact((prev) => (prev ? y > EXPANDED_AT : y > COMPACT_AT))
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(resolve)
    }
    const onModeChange = () => resolve()
    resolve()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    compactDisabled.addEventListener?.('change', onModeChange)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      compactDisabled.removeEventListener?.('change', onModeChange)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  /* ── Active section ─────────────────────────────────── */
  // Owned by `useActiveSection` now — see the comment there for why the
  // scroll position is resolved rather than observed.

  /* ── The morph ────────────────────────────────────────── */
  const barRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLAnchorElement>(null)
  const railRef = useRef<HTMLUListElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  /** Width, shift and centre line, all read from the real layout. */
  const metrics = useRef({ expandedW: 0, compactW: 0, shift: 0 })
  const applyRef = useRef<(animated: boolean) => void>(() => {})
  const compactRef = useRef(compact)
  compactRef.current = compact

  /*
   * Every property the morph touches is a motion value. One animation per value,
   * written straight to the DOM by the motion components below, so a state flip
   * is a handful of style writes and never a React render — hovering the rail
   * while the pill is morphing costs nothing. The first value starts as `100%`
   * so the very first paint is the plain full-width bar even before the
   * measurement below has run.
   */
  const width = useMotionValue<string | number>('100%')
  const padX = useMotionValue(0)
  const padY = useMotionValue(0)
  const barPad = useMotionValue(BAR_PAD)
  const radius = useMotionValue(0)
  const surfaceOpacity = useMotionValue(0)
  const railShift = useMotionValue(0)

  useLayoutEffect(() => {
    const bar = barRef.current
    const logo = logoRef.current
    const rail = railRef.current
    const controls = controlsRef.current
    if (!bar || !logo || !rail || !controls) return

    // ResizeObserver supplies post-layout content-box measurements; caching them
    // avoids synchronous geometry reads in a layout effect after rendering.
    const widths = new Map<Element, number>()
    const measure = () => {
      const expandedW = widths.get(bar) ?? 0
      const logoW = widths.get(logo) ?? 0
      const controlsW = widths.get(controls) ?? 0
      const railW = widths.get(rail) ?? 0
      if (!expandedW || !logoW || !controlsW) return
      metrics.current = {
        expandedW,
        compactW: PILL_PAD_X * 2 + logoW + controlsW + RAIL_CLEARANCE * 2 + railW,
        shift: (logoW - controlsW) / 2,
      }
    }

    /**
     * Put the current state on screen. `animated` is false for measurement and
     * resize, where the pill has to be correct immediately rather than travel to
     * where it already was — a settle, not a morph.
     */
    const apply = (animated: boolean) => {
      const isCompact = compactRef.current
      const { expandedW, compactW, shift } = metrics.current
      if (!compactW || !expandedW) return
      const travel = animated && !reduceMotion ? MORPH : null
      // `animate` from a value to itself is a warning, not a no-op, so the
      // instant path is a plain write.
      const move = (value: MotionValue<number>, to: number) => {
        if (travel) animate(value, to, travel)
        else value.set(to)
      }

      if (travel) animate(width, isCompact ? compactW : expandedW, travel)
      else width.set(isCompact ? compactW : expandedW)
      move(padX, isCompact ? PILL_PAD_X : 0)
      move(padY, isCompact ? PILL_PAD_Y : 0)
      // The bar gives back exactly what the pill takes, so the centre line
      // holds and the pill inflates rather than sinking.
      move(barPad, isCompact ? BAR_PAD_COMPACT : BAR_PAD)
      // Any value past half the pill's height is clamped to a true pill shape,
      // so the radius never has to know how tall the content is.
      move(radius, isCompact ? 999 : 0)
      move(surfaceOpacity, isCompact ? 1 : 0)
      move(railShift, isCompact ? shift : 0)
    }

    applyRef.current = (animated: boolean) => {
      measure()
      apply(animated)
    }

    // Re-measure when any part of the bar changes size: the rail reflows at
    // breakpoints, the resume button arrives at 2xl, and a webfont swaps in after
    // first paint. Each of those changes what "hug the contents" means.
    //
    // A measurement that comes back identical is dropped rather than re-applied.
    // The bar is observed too, and the morph animates the bar's own padding —
    // which resizes its content box, and so fires this observer on every frame
    // of the morph. Re-applying then would snap the animation to its end point
    // on the first frame; comparing first means the morph is left alone, and an
    // observer that has nothing new to say costs two integer comparisons.
    const observer = new ResizeObserver((entries) => {
      const before = metrics.current
      entries.forEach((entry) => widths.set(entry.target, entry.contentRect.width))
      measure()
      const after = metrics.current
      if (
        after.expandedW === before.expandedW &&
        after.compactW === before.compactW &&
        after.shift === before.shift
      ) {
        return
      }
      apply(false)
    })
    observer.observe(bar)
    observer.observe(logo)
    observer.observe(rail)
    observer.observe(controls)
    applyRef.current(false)

    return () => {
      observer.disconnect()
      // Nothing is left animating or listening once the bar is gone.
      for (const value of [width, padX, padY, barPad, radius, surfaceOpacity, railShift]) {
        value.stop()
      }
      applyRef.current = () => {}
    }
  }, [reduceMotion, width, padX, padY, barPad, radius, surfaceOpacity, railShift])

  // The state itself, animated. Skipped on the first pass: the pill is already
  // painted in its expanded geometry by the effect above, and travelling to it
  // from the same place would only risk a stutter behind the preloader.
  const firstApply = useRef(true)
  useLayoutEffect(() => {
    if (firstApply.current) {
      firstApply.current = false
      return
    }
    applyRef.current(true)
  }, [compact, reduceMotion])

  /* ── Mobile drawer ────────────────────────────────────── */
  const openMenu = useCallback(() => setMenuOpen(true), [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  /**
   * While the drawer is open the page behind it is frozen, exactly the way the
   * case-study panel does it: Lenis is what actually stops the page moving, and
   * the root overflow covers visitors who have no Lenis at all. Focus moves to
   * the drawer's close control on open and back to the toggle on close, so a
   * keyboard never gets lost behind the scrim.
   */
  useEffect(() => {
    if (!menuOpen) return
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousOverflowY = root.style.overflowY
    const lenis = getLenis()
    lenis?.stop()
    if (lenis) {
      // A stopped Lenis clips the root, which would take the scrollbar away and
      // widen the page by its width. The bar is what stops the page here, not the
      // geometry change, so keep `scroll-y` on the root.
      root.style.overflowY = 'scroll'
    } else {
      root.style.overflow = 'clip'
    }
    closeRef.current?.focus()
    // Read once: on the way out this has to be the toggle that opened the
    // drawer, not whatever `current` points at by then.
    const toggle = toggleRef.current

    return () => {
      root.style.overflow = previousOverflow
      root.style.overflowY = previousOverflowY
      lenis?.start()
      toggle?.focus()
    }
  }, [menuOpen])

  /**
   * Escape closes, Tab stays inside the drawer. The listener is only attached
   * while the drawer is open, so an Escape keypress anywhere else on the page
   * cannot reach in and unlock the scroll.
   */
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeMenu()
        return
      }
      if (event.key !== 'Tab') return
      const drawer = drawerRef.current
      if (!drawer) return
      const focusable = [...drawer.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === drawer)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, closeMenu])

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
      {/* The bar itself is transparent to the pointer and only the pill takes
          clicks, so the empty gutters beside the floating pill never swallow a
          click meant for the page underneath. */}
      <m.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: DURATION.reveal, ease: EASE_STANDARD }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[90]"
      >
        <m.div
          ref={barRef}
          className="flex justify-center px-4 sm:px-6 xl:px-12"
          style={{ paddingTop: barPad, paddingBottom: barPad }}
        >
          {/* ── The pill ─────────────────────────────────────── */}
          {/* The width starts at `100%` — the plain full-width bar — and the
              measurement above replaces it with a px width before the first
              paint, so there is no unmeasured frame. */}
          <m.div
            className="pointer-events-auto relative flex shrink-0 items-center justify-between"
            style={{
              width,
              paddingLeft: padX,
              paddingRight: padX,
              paddingTop: padY,
              paddingBottom: padY,
              borderRadius: radius,
            }}
          >
            {/* The surface. Its shape is inherited from the pill's own animated
                radius, so the two can never disagree, and its opacity is the
                whole fade: background, edge, blur and lift arrive together. */}
            <m.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 backdrop-blur-xl"
              style={{
                borderRadius: 'inherit',
                opacity: surfaceOpacity,
                // A raised plane rather than the page's own black: at 76% the
                // base panel is invisible against the hero, and the point of the
                // pill is that the content behind it stays readable *through* it.
                background: 'color-mix(in srgb, var(--panel-raised) 84%, transparent)',
                // The edge carries a trace of the portfolio's teal, so the pill
                // reads as this site's surface rather than a generic glass bar.
                border: '1px solid color-mix(in srgb, var(--accent-teal) 10%, var(--border))',
                boxShadow:
                  'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 18px 46px -26px rgba(0, 0, 0, 0.9)',
              }}
            />

            {/* Logo */}
            <a
              ref={logoRef}
              href="#hero"
              onClick={(e) => { e.preventDefault(); goToSection('hero') }}
              className="logo-link relative z-10 shrink-0 whitespace-nowrap font-mono-code font-bold text-base tracking-wide"
              style={{ color: 'var(--accent-teal)' }}
              aria-label="IM. — back to the top"
            >
              IM<span className="logo-link__dot">.</span>
            </a>

            {/* Desktop links — the rail has to sit dead centre of the viewport
                while the bar is expanded, and the logo and the controls are never
                the same width, so the rail is centred by its own shell rather
                than laid out between them (a justify-between row leaves it
                wherever the controls happen to end). The shell carries the
                centring; the list inside carries the compact-state offset the
                morph animates. Type scales at each breakpoint so the rail always
                clears the flanks with room to spare. */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 lg:block">
              <m.ul
                ref={railRef}
                style={{ x: railShift }}
                className="
                  pointer-events-auto flex h-full items-center justify-center
                  gap-x-2.5 xl:gap-x-4 2xl:gap-x-6
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
                    <m.li key={item.href} {...railItem(i)}>
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
                          <m.span
                            layoutId="nav-indicator"
                            className="nav-indicator"
                            aria-hidden="true"
                            transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT}
                          />
                        )}
                      </button>
                    </m.li>
                  )
                })}

                {/* Side Missions — a route, not a section anchor, so it sits apart and
                    carries its own indigo marker. */}
                <m.li {...railItem(navItems.length)}>
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
                      <m.span
                        layoutId="nav-route-indicator"
                        className="nav-indicator nav-indicator--route"
                        aria-hidden="true"
                        transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT}
                      />
                    )}
                  </button>
                </m.li>
              </m.ul>
            </div>

            {/* Right controls */}
            <div
              ref={controlsRef}
              className="relative z-10 flex shrink-0 items-center gap-3"
            >
              {/* Resume — the one control a recruiter reaches for immediately. It
                  waits for the widest breakpoint the rail can still clear; below
                  that the hero, the drawer and Contact all carry their own copy. */}
              {personalInfo.resumeUrl && <ResumeButton href={personalInfo.resumeUrl} />}

              {/* Hire Me CTA — desktop only, magnetic */}
              <HireMeButton onClick={(e) => { e?.preventDefault(); goToSection('contact') }} />

              {/* The menu button only ever opens. The drawer owns closing — its own
                  close control, the backdrop and Escape — so exactly one close
                  control is ever on screen, and while the drawer is open the whole
                  bar sits behind the scrim and this button is inert. */}
              <button
                ref={toggleRef}
                onClick={openMenu}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls={DRAWER_ID}
                aria-haspopup="dialog"
                disabled={menuOpen}
                className="
                  lg:hidden w-9 h-9 shrink-0 rounded-full flex items-center justify-center
                  border border-[var(--border)] bg-[var(--surface)]
                  text-[var(--text-primary)] transition-all duration-200
                "
              >
                <FiMenu size={16} />
              </button>
            </div>
          </m.div>
        </m.div>
      </m.nav>

      {/* ── Mobile full-screen menu ──────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop. It sits above the bar — an open modal covers the page's
                own chrome — and closes the drawer when it is clicked. */}
            <m.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[95] lg:hidden"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={closeMenu}
              aria-hidden="true"
            />

            {/* Drawer */}
            <m.div
              key="drawer"
              id={DRAWER_ID}
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="
                fixed top-0 right-0 bottom-0 z-[96] lg:hidden
                w-[min(320px,85vw)] flex flex-col
                pt-24 pb-10 px-8 overflow-y-auto overscroll-contain
              "
              style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              /* A stopped Lenis swallows every wheel gesture it is not told to
                 ignore, so the drawer has to claim its own scrolling. */
              data-lenis-prevent
            >
              {/* The drawer's close control, and the only one: it is the owner of
                  this interaction, so it is what appears when the drawer opens. */}
              <button
                ref={closeRef}
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
                    <m.li
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
                    </m.li>
                  ))}

                  {/* Side Missions destination */}
                  <m.li
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
                  </m.li>
                </ul>
              </nav>

              <div className="mt-auto space-y-3 pt-8">
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
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
