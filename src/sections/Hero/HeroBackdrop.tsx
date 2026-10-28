import { m, useReducedMotion } from 'framer-motion'

/**
 * HeroBackdrop
 * ─────────────────────────────────────────────────────────────────────────────
 * The hero's photographic layer: the cinematic portrait, displayed as the
 * background the content sits on.
 *
 * It is the photograph the brief asked for, shown full-bleed rather than
 * framed — the subject is the person, not an object in a case. The scrims
 * below it do the work a mount used to: the left side falls to near-black so
 * the headline and the CTAs read cleanly, the bottom dissolves into the page,
 * and a teal rim sits on the subject's shoulder so the portrait belongs to this
 * site's palette instead of sitting on top of it.
 */

/* WebP at q90: 50 kB against the PNG's 1.1 MB, same 1376×768 pixels. This is
   the LCP element, so the saving lands directly on first paint. Browsers old
   enough to lack WebP are already missing `color-mix()` elsewhere in the CSS. */
const BACKDROP_SRC = 'my_images/cinematic_hero.webp'

export default function HeroBackdrop() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* One viewport tall, not hero-tall: the mobile hero is much taller than
          the screen, and letting the photo stretch with it would blow the
          subject's head up to twice its size. */}
      <m.div
        className="absolute inset-x-0 top-0 h-[100svh]"
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={BACKDROP_SRC}
          alt=""
          className="h-full w-full object-cover object-[72%_top] sm:object-[80%_top] lg:object-[88%_top]"
          style={{ opacity: 0.88 }}
          loading="eager"
          /* The hero paints over the photograph, so it is the LCP candidate —
             priority keeps it ahead of the deferred scripts that follow. */
          fetchPriority="high"
          decoding="async"
        />

        {/* The photo's own edges, faded so they never read as a rectangle. */}
        <div
          className="absolute inset-x-0 top-0 h-[16%]"
          style={{
            background: 'linear-gradient(180deg, var(--bg-primary), transparent)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[24%]"
          style={{
            background: 'linear-gradient(0deg, var(--bg-primary), transparent)',
          }}
        />

        {/* Below lg the text sits over the whole frame, one column wide. */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,9,13,0.72) 0%, rgba(8,9,13,0.82) 45%, rgba(8,9,13,0.95) 100%)',
          }}
        />
      </m.div>

      {/* The scrim: dark under the text, open over the subject. */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,9,13,0.97) 0%, rgba(8,9,13,0.9) 28%, rgba(8,9,13,0.52) 52%, rgba(8,9,13,0.14) 74%, rgba(8,9,13,0.3) 100%)',
        }}
      />

      {/* Rim light on the subject — the photograph joins the teal palette. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 38% 52% at 74% 40%, rgba(94,234,212,0.16) 0%, rgba(94,234,212,0.05) 45%, transparent 72%)',
        }}
      />

      {/* The page takes the bottom of the hero back, so it has no edge. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, var(--bg-primary) 0%, rgba(8,9,13,0.3) 22%, transparent 55%)',
        }}
      />
    </div>
  )
}
