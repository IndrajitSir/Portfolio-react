import { memo, useEffect, useRef } from 'react'

/**
 * Project 01 — the story of `@indrajitsir/nest-auth-*`.
 *
 * A miniature animation of a reusable authorization library being assembled and
 * published, staged as one continuous narrative rather than a loop of unrelated
 * motion:
 *
 *   1. Architecture — the core, the provider boundary, the SQL adapter and the
 *      application that consumes them resolve into a connected structure.
 *   2. Authorization — a request enters, the core evaluates it, the allow path
 *      lights and a rejected request is shown being turned away.
 *   3. Assembly — the modules pull in and a package boundary draws around them.
 *   4. Publication — the structure resolves into a package artifact that settles
 *      over the NPM wordmark and confirms itself.
 *
 * Everything is layered on a large `NPM` wordmark: the wordmark is the room the
 * work happens in, not a logo parked on top of it. The module names are the real
 * boundaries from `data/projects.ts`, and the strip below lists the two packages
 * this project actually shipped — no invented registry output.
 *
 * Cost model, because this section has to survive a long page:
 *  - one SVG of ~55 static shapes, no canvas, no per-frame JavaScript at all —
 *    the whole story is declarative CSS on opacity and transform;
 *  - React renders this exactly once. The off-screen pause writes a data
 *    attribute straight to the DOM, so scrolling never re-renders anything;
 *  - `prefers-reduced-motion` drops every animation, leaving the finished
 *    published composition as a static scene.
 *
 * The npm identity is typographic here on purpose: the project ships no official
 * npm logo asset, and drawing one from memory would be a fabrication.
 */

/** The three satellites, with the part each one plays. `pull` names the
    convergence vector for that module — the CSS owns the coordinates. */
const MODULES = [
  {
    id: 'app',
    box: { x: 28, y: 84, w: 96, h: 40 },
    label: 'Application',
    sub: 'nest app',
    delay: '-0.6s',
    pull: 'a',
  },
  {
    id: 'provider',
    box: { x: 276, y: 84, w: 96, h: 40 },
    label: 'Provider',
    sub: 'boundary',
    delay: '-0.85s',
    pull: 'b',
  },
  {
    id: 'adapter',
    box: { x: 28, y: 266, w: 96, h: 40 },
    label: 'SQL adapter',
    sub: 'pluggable',
    delay: '-1.1s',
    pull: 'c',
  },
] as const

/** The hero: the persistence-agnostic core every other piece talks to. */
const CORE = { x: 140, y: 152, w: 120, h: 56, cx: 200, cy: 180 } as const

/** The three connectors, drawn because a relationship appearing is the only
    motion in the scene that means something. Normalised to 100 so one
    keyframe can drive paths of different lengths. */
const LINKS = [
  { id: 'app', d: 'M124 104H132V180H140', delay: '-0.2s' },
  { id: 'provider', d: 'M276 104H268V180H260', delay: '-0.45s' },
  { id: 'adapter', d: 'M76 306V320H200V208', delay: '-0.7s' },
] as const

/** One line per story beat, revealed one at a time. */
const BEATS = [
  'architecture · core, boundary, adapter',
  'authorization · every request evaluated',
  'assembly · boundaries become one package',
  'published · reusable, versioned, public',
] as const

/** The two packages this project actually shipped (see `data/projects.ts`). */
const PACKAGES = [
  { name: '@indrajitsir/nest-auth-core', tag: 'v0.1.0' },
  { name: '@indrajitsir/nest-auth-sql-adapter', tag: 'v0.1.0' },
] as const

/** A labelled module block. */
const ModuleBlock = memo(function ModuleBlock({
  box,
  label,
  sub,
  delay,
  pull,
}: {
  box: { x: number; y: number; w: number; h: number }
  label: string
  sub: string
  delay: string
  pull: string
}) {
  return (
    <g className="npm-node" data-pull={pull} style={{ animationDelay: delay }}>
      <rect className="npm-node__edge" x={box.x} y={box.y} width={box.w} height={box.h} rx={8} />
      <rect className="npm-node__wash" x={box.x} y={box.y} width={box.w} height={box.h} rx={8} />
      <text
        className="npm-label hidden md:block"
        x={box.x + box.w / 2}
        y={box.y + 17}
        textAnchor="middle"
        style={{ animationDelay: delay }}
      >
        {label}
      </text>
      <text
        className="npm-label npm-label--dim hidden md:block"
        x={box.x + box.w / 2}
        y={box.y + 30}
        textAnchor="middle"
        style={{ animationDelay: delay }}
      >
        {sub}
      </text>
    </g>
  )
})

/** The published package strip — real names, no invented registry output. */
function PackageStrip() {
  return (
    <div className="npm-strip" aria-hidden="true">
      <span className="npm-strip__bar" />
      <ul>
        {PACKAGES.map((pkg) => (
          <li key={pkg.name}>
            <span className="npm-strip__pkg">▣</span>
            <span className="npm-strip__name">{pkg.name}</span>
            <span className="npm-strip__tag">{pkg.tag}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function NpmPublishScene() {
  const rootRef = useRef<HTMLDivElement>(null)

  // Off-screen pause. Written to the DOM rather than to state so scrolling the
  // portfolio never triggers a React render.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const io = new IntersectionObserver(
      ([entry]) => {
        root.dataset.paused = entry.isIntersecting ? 'false' : 'true'
      },
      { rootMargin: '160px 0px' },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={rootRef} className="npm-scene" data-paused="false">
      {/* ── Layer 1 · background: the room the work happens in ──── */}
      <div className="npm-scene__bg" aria-hidden="true" />
      <div className="npm-scene__wordmark" aria-hidden="true">
        NPM
      </div>
      <div className="npm-scene__floor" aria-hidden="true" />

      {/* ── Layers 2 + 3 · the story ───────────────────────────── */}
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        className="npm-scene__stage"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {LINKS.map((link) => (
          <path key={link.id} className="npm-link" d={link.d} pathLength={100} style={{ animationDelay: link.delay }} />
        ))}

        {/* Assembly: a highlight running along each connection as the package
            closes around them. */}
        {LINKS.map((link) => (
          <path
            key={`${link.id}-pulse`}
            className="npm-linkpulse"
            d={link.d}
            pathLength={100}
            style={{ animationDelay: link.delay }}
          />
        ))}

        {/* A request turned away: shown once, briefly, so the engine reads as a
            decision rather than a pipe. */}
        <path className="npm-deny" d="M200 152V136" />
        <g className="npm-deny__mark">
          <circle cx={200} cy={128} r={9} />
          <path d="M196 124l8 8M204 124l-8 8" />
        </g>

        {MODULES.map((m) => (
          <ModuleBlock key={m.id} box={m.box} label={m.label} sub={m.sub} delay={m.delay} pull={m.pull} />
        ))}

        {/* The core. */}
        <g className="npm-node" style={{ animationDelay: '-0.35s' }}>
          <rect
            className="npm-node__edge npm-node__edge--core"
            x={CORE.x}
            y={CORE.y}
            width={CORE.w}
            height={CORE.h}
            rx={10}
          />
          <rect className="npm-node__wash npm-node__wash--core" x={CORE.x} y={CORE.y} width={CORE.w} height={CORE.h} rx={10} />
          <text
            className="npm-label npm-label--strong hidden md:block"
            x={CORE.cx}
            y={CORE.cy - 2}
            textAnchor="middle"
          >
            Authorization core
          </text>
          <text
            className="npm-label npm-label--dim hidden md:block"
            x={CORE.cx}
            y={CORE.cy + 14}
            textAnchor="middle"
          >
            persistence-agnostic
          </text>
        </g>

        {/* The decision itself — a pulse on the core when a request clears. */}
        <circle className="npm-verdict" cx={CORE.cx} cy={CORE.cy} r={34} />

        {/* The request, travelling the real path: in at the application, through
            the core. Piecewise translate, so it stays on the connector. */}
        <circle className="npm-request" cx={124} cy={104} r={3.2} />

        {/* Assembly: the boundary drawn around everything it gathered. */}
        <rect
          className="npm-boundary"
          x={16}
          y={72}
          width={368}
          height={244}
          rx={16}
          pathLength={100}
        />

        {/* Publication: the package that results. */}
        <g className="npm-package">
          <rect x={162} y={142} width={76} height={76} rx={12} />
          <path d="M162 166h76" />
          <path d="M192 186h16M200 178v16" />
        </g>
        <circle className="npm-pulse" cx={CORE.cx} cy={CORE.cy} r={52} />
        <circle className="npm-pulse" cx={CORE.cx} cy={CORE.cy} r={52} style={{ animationDelay: '-1.15s' }} />

        {/* One beat of the story at a time. Each beat is the same keyframe,
            started 21% of the cycle later than the one before it, so the four
            lines hand over to each other across the four stages. */}
        {BEATS.map((beat, i) => (
          <text
            key={beat}
            className="npm-beat hidden md:block"
            x={200}
            y={352}
            textAnchor="middle"
            style={{ animationDelay: `${i * 3.99}s` }}
          >
            {beat}
          </text>
        ))}
      </svg>

      {/* Reduced motion gets one honest summary line where the beats would sit. */}
      <p className="npm-static-note">
        <span>published</span> · reusable, versioned, public
      </p>

      <PackageStrip />
    </div>
  )
}