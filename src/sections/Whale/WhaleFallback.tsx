import { scrollToSection } from '@/utils'
import { whaleChapters } from './whaleChapters'

/**
 * WebGL fallback: the same navigation as an ordinary page.
 *
 * No canvas, no camera and no GSAP — just the whale as an inline drawing and a
 * real link for every chapter, so a visitor without WebGL still reaches the
 * whole portfolio.
 */
export default function WhaleFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center px-5 py-24 sm:px-8">
      <div className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[rgba(6,11,21,0.92)] p-5 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <span className="font-mono-code text-[0.62rem] uppercase tracking-[0.2em]" style={{ color: 'var(--accent-teal)' }}>
            Static chapter map
          </span>
          <span className="font-mono-code text-[0.58rem] uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
            WebGL unavailable · navigation intact
          </span>
        </div>

        <svg
          viewBox="0 0 720 280"
          className="mx-auto block h-auto w-full max-w-xl"
          aria-hidden="true"
          role="presentation"
        >
          <g fill="none" stroke="#4f8fff" strokeOpacity="0.35" strokeWidth="1">
            <path d="M40 236 H680" strokeDasharray="3 6" />
            <path d="M76 84 V248 M664 84 V248" strokeDasharray="2 7" strokeOpacity="0.18" />
          </g>
          <path
            d="M60 190 C70 140 130 112 210 108 C320 102 430 108 520 132 C565 144 600 162 618 184 C604 196 570 204 530 206 C470 220 410 232 330 236 C250 240 160 232 110 214 C80 206 62 200 60 190 Z"
            fill="#1d63ed"
            fillOpacity="0.6"
            stroke="#8cc6ff"
            strokeOpacity="0.7"
            strokeWidth="1.4"
          />
          <path
            d="M600 182 C630 154 664 140 692 144 C686 165 668 184 646 196 C664 206 678 222 682 244 C652 242 622 224 604 200 Z"
            fill="#1a54c8"
            fillOpacity="0.75"
            stroke="#8cc6ff"
            strokeOpacity="0.6"
            strokeWidth="1.3"
          />
          <ellipse cx="252" cy="214" rx="52" ry="17" fill="#1a4bb4" transform="rotate(18 252 214)" />
          <circle cx="112" cy="168" r="7" fill="#04101f" />
          <circle cx="110" cy="166" r="2" fill="#d9efff" />
          <path d="M64 196 C88 208 116 210 142 202" fill="none" stroke="#08224d" strokeWidth="2" strokeLinecap="round" />
          <g fill="#8fd2ff" fillOpacity="0.65">
            <circle cx="128" cy="78" r="5" />
            <circle cx="138" cy="62" r="4" />
            <circle cx="120" cy="60" r="3.5" />
            <circle cx="146" cy="86" r="3" />
          </g>

          {[
            { x: 250, y: 72, width: 62, height: 36 },
            { x: 322, y: 72, width: 62, height: 36 },
            { x: 394, y: 72, width: 62, height: 36 },
            { x: 466, y: 72, width: 62, height: 36 },
            { x: 286, y: 35, width: 62, height: 34 },
            { x: 358, y: 35, width: 62, height: 34 },
          ].map((box, index) => (
            <rect
              key={index}
              {...box}
              rx="4"
              fill={['#1d5fe0', '#2a70f0', '#174fb8', '#2f7bf7', '#1f66e6', '#2563eb'][index]}
              stroke="#9bc9ff"
              strokeOpacity="0.55"
              strokeWidth="1"
            />
          ))}
        </svg>

        <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {whaleChapters.map((chapter) => (
            <li key={chapter.id}>
              <a
                href={chapter.href}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToSection(chapter.href.replace('#', ''))
                }}
                className="group flex h-full items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 transition-colors hover:border-[var(--accent-teal)]"
              >
                <span className="font-mono-code text-[0.6rem] tracking-widest" style={{ color: 'var(--accent-teal)' }}>
                  {chapter.code}
                </span>
                <span className="min-w-0">
                  <span className="block font-mono-code text-[0.72rem] uppercase tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>
                    {chapter.label}
                  </span>
                  <span className="mt-0.5 block text-[0.7rem] leading-4" style={{ color: 'var(--text-secondary)' }}>
                    {chapter.summary}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
