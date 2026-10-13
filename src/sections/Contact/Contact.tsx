import { useRef } from 'react'
import { FiMail, FiPhone, FiGithub, FiArrowUpRight } from 'react-icons/fi'
import { useInView } from 'framer-motion'
import { SectionLabel, GlowCard } from '@/components/ui'
import EnergyRing from '@/components/originkit/ui/energy-ring'
import { personalInfo } from '@/data'
import { useAnimeReveal } from '@/hooks/useAnimeReveal'
import ContactForm from './ContactForm'

const channels = [
  {
    icon: <FiMail size={16} />,
    label: 'Email',
    value: personalInfo.email,
    href: `mailto:${personalInfo.email}`,
  },
  {
    icon: <FiPhone size={16} />,
    label: 'Phone',
    value: personalInfo.phone,
    href: `tel:${personalInfo.phone.replace(/\s/g, '')}`,
  },
  {
    icon: <FiGithub size={16} />,
    label: 'GitHub',
    value: 'github.com/IndrajitSir',
    href: personalInfo.github,
    external: true,
  },
]

/**
 * The closing scene.
 *
 * A conventional portfolio ends on a form. This one ends on a *handshake*: a
 * live signal panel on the left that a visitor can play with, and the message
 * composer on the right, framed as the destination rather than an afterthought.
 * The copy, the channels and the composer share one column rhythm so the eye
 * reads heading → context → channel → compose, top to bottom.
 * *  Entrance motion is Anime.js via `useAnimeReveal`: the section's own heading
 *  keeps its existing reveal (framer-motion, shared across every section), while
 *  the supporting copy, the signal panel, the channels and the composer's fields
 *  assemble underneath it.
 *
 *  The backdrop is OriginKit's `EnergyRing`: the section used to draw its own
 *  five ripple rings + beacon in `SectionBackground`, and this is the same
 *  idea — a pulsing ring that signals outward — executed as a live particle
 *  field instead. Palette is adapted from OriginKit's magenta/violet to the
 *  site's teal/indigo (`#5eead4` / `#818cf8`), the canvas background is
 *  transparent so the section keeps its own surface and top glow, and the ring
 *  only mounts while the section is near the viewport so the rAF loop never
 *  runs four screens away. Under `prefers-reduced-motion` the component draws
 *  one static frame and stops, so there is nothing to gate at this level.
 */
export default function Contact() {
  const revealRef = useAnimeReveal<HTMLDivElement>({ y: 18, stagger: 55, duration: 640 })
  const ringRef = useRef<HTMLDivElement>(null)
  const ringNear = useInView(ringRef, { margin: '240px 0px 240px 0px' })

  return (
    <section
      id="contact"
      aria-label="Contact section"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* The signal itself: an OriginKit energy ring, centred behind the
          composition and kept below the content (`z-0`, `pointer-events-none`)
          so links, fields and the send button all keep their gestures. */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 z-0 aspect-square w-[min(82vw,660px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.55]"
      >
        {ringNear && (
          <EnergyRing
            background="transparent"
            rimColor="#5eead4"
            baseColor="#818cf8"
            density={2600}
            speed={70}
            ringSize={74}
            hoverEnabled={false}
            style={{ minWidth: 0, minHeight: 0 }}
          />
        )}
      </div>

      {/* Atmospheric lift at the top, so the section reads as a lit space. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] z-0"
        style={{ background: 'radial-gradient(75% 100% at 50% 0%, var(--glow-teal), transparent 68%)' }}
      />

      <div ref={revealRef} className="max-container section-padding relative z-10">
        <SectionLabel
          index="08"
          label="Connect"
          title="Let's build something"
          titleAccent="together"
        />

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* ── Left: context, the signal panel, and the direct channels ── */}
          <div className="space-y-7">
            <div
              data-reveal
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono-code text-[0.66rem] uppercase tracking-widest"
              style={{
                borderColor: 'var(--border-glow)',
                background: 'var(--glow-teal)',
                color: 'var(--accent-teal)',
              }}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--accent-teal)' }}
              />
              Open to backend roles &amp; collaborations
            </div>

            <p
              data-reveal
              className="max-w-[46ch] text-[1.02rem] leading-[1.85]"
              style={{ color: 'var(--text-secondary)' }}
            >
              I'm actively seeking backend development roles, open-source
              collaborations and interesting engineering problems. If you have
              an idea or an opportunity, this is the handshake — the signal
              reaches me directly.
            </p>

            <div data-reveal>
              <p
                className="mb-3 font-mono-code text-[0.62rem] uppercase tracking-[0.2em]"
                style={{ color: 'var(--text-muted)' }}
              >
                Or reach me directly
              </p>
              <ul className="space-y-2.5">
                {channels.map((channel) => (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      target={channel.external ? '_blank' : undefined}
                      rel={channel.external ? 'noopener noreferrer' : undefined}
                      aria-label={`Contact via ${channel.label}`}
                      className="group block"
                    >
                      <GlowCard>
                        <div className="flex items-center gap-4 p-4">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                            style={{
                              background: 'var(--glow-teal)',
                              borderColor: 'var(--border-glow)',
                              color: 'var(--accent-teal)',
                            }}
                            aria-hidden="true"
                          >
                            {channel.icon}
                          </span>
                          <span className="min-w-0">
                            <span
                              className="block font-mono-code text-[0.64rem] uppercase tracking-widest"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {channel.label}
                            </span>
                            <span
                              className="mt-0.5 block truncate text-sm font-medium transition-colors duration-200 group-hover:text-[var(--accent-teal)]"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {channel.value}
                            </span>
                          </span>
                          <FiArrowUpRight
                            size={15}
                            aria-hidden="true"
                            className="ml-auto shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            style={{ color: 'var(--text-muted)' }}
                          />
                        </div>
                      </GlowCard>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Right: the composer ── */}
          <div data-reveal>
            <GlowCard>
              <div className="p-6 sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h3
                      className="font-display text-[1.15rem] font-light leading-tight tracking-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Send a transmission
                    </h3>
                    <p className="mt-1 font-mono-code text-[0.64rem]" style={{ color: 'var(--text-muted)' }}>
                      Opens in your mail client
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden font-mono-code text-[0.6rem] uppercase tracking-[0.2em] sm:block"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    &lt;encrypted/&gt;
                  </span>
                </div>

                <ContactForm />
              </div>
            </GlowCard>
          </div>
        </div>
      </div>
    </section>
  )
}
