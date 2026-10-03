import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  FiCloud,
  FiServer,
  FiDatabase,
  FiHardDrive,
  FiShield,
  FiTerminal,
  FiCpu,
  FiPause,
  FiPlay,
  FiX,
} from 'react-icons/fi'

interface Fact {
  label: string
  value: string
}

interface ModuleNode {
  id: string
  name: string
  short: string
  role: string
  spec: string
  metric: string
  icon: ComponentType<{ size?: number }>
  accent: string
  /** Position in the 400×400 viewbox space. */
  x: number
  y: number
  /** 0 (far) → 1 (near): drives scale/opacity to read as depth. */
  depth: number
  /** Topology neighbours used for focus + context. */
  connectsTo: string[]
  facts: Fact[]
}

const CORE = { x: 200, y: 200 }

const MODULES: ModuleNode[] = [
  {
    id: 'gateway',
    name: 'API Gateway',
    short: 'API Gateway',
    role: 'Reverse proxy, routing & rate limiting',
    spec: 'Envoy · Traefik · Go',
    metric: 'p99 4.2ms',
    icon: FiCloud,
    accent: 'var(--accent-teal)',
    x: 200,
    y: 46,
    depth: 0.55,
    connectsTo: ['services', 'security'],
    facts: [
      { label: 'Throughput', value: '42k rps' },
      { label: 'p99', value: '4.2ms' },
      { label: 'TLS', value: 'mTLS 1.3' },
    ],
  },
  {
    id: 'services',
    name: 'Backend Services',
    short: 'Services',
    role: 'Async microservices & worker pipelines',
    spec: 'Go · Node · gRPC',
    metric: '42k rps',
    icon: FiServer,
    accent: 'var(--accent-indigo)',
    x: 334,
    y: 116,
    depth: 0.8,
    connectsTo: ['database', 'cache', 'gateway'],
    facts: [
      { label: 'Replicas', value: '6 / 6' },
      { label: 'Queue', value: 'depth 0' },
      { label: 'Runtimes', value: 'Go · Node' },
    ],
  },
  {
    id: 'database',
    name: 'Database Cluster',
    short: 'DB Cluster',
    role: 'Relational shards & read replication',
    spec: 'PostgreSQL · TimescaleDB',
    metric: '12.8k IOPS',
    icon: FiDatabase,
    accent: 'var(--accent-teal)',
    x: 334,
    y: 284,
    depth: 0.95,
    connectsTo: ['cache', 'services'],
    facts: [
      { label: 'Shards', value: '8' },
      { label: 'Replicas', value: '2 / shard' },
      { label: 'IOPS', value: '12.8k' },
    ],
  },
  {
    id: 'cache',
    name: 'Distributed Cache',
    short: 'Cache',
    role: 'Key-value & session fabric',
    spec: 'Redis · Dragonfly',
    metric: '98.4% hit',
    icon: FiHardDrive,
    accent: 'var(--accent-orange)',
    x: 200,
    y: 354,
    depth: 0.45,
    connectsTo: ['services', 'database'],
    facts: [
      { label: 'Hit ratio', value: '98.4%' },
      { label: 'Eviction', value: 'LRU + TTL' },
      { label: 'Nodes', value: '3' },
    ],
  },
  {
    id: 'security',
    name: 'Zero-Trust Security',
    short: 'Security',
    role: 'mTLS, JWT & vault policy enforcement',
    spec: 'OAuth2 · SPIFFE · KMS',
    metric: 'auth <2ms',
    icon: FiShield,
    accent: 'var(--accent-indigo)',
    x: 66,
    y: 284,
    depth: 0.7,
    connectsTo: ['gateway', 'services'],
    facts: [
      { label: 'Auth', value: '<2ms' },
      { label: 'Policy', value: 'RBAC + ABAC' },
      { label: 'Rotations', value: '24h' },
    ],
  },
  {
    id: 'devtools',
    name: 'Developer Tools',
    short: 'Dev Tools',
    role: 'CLI tooling, SDKs & telemetry',
    spec: 'OpenTelemetry · Docker',
    metric: '100% traces',
    icon: FiTerminal,
    accent: 'var(--accent-teal)',
    x: 66,
    y: 116,
    depth: 0.62,
    connectsTo: ['services', 'gateway'],
    facts: [
      { label: 'Traces', value: '100%' },
      { label: 'SDKs', value: '4 langs' },
      { label: 'CLI', value: 'v1.4.0' },
    ],
  },
]

const CORE_INFO = {
  name: 'Core Kernel',
  role: 'Distributed scheduler & service registry',
  spec: 'Cluster health 100% OK',
  metric: 'p99 14ms',
  icon: FiCpu,
  accent: 'var(--accent-teal)',
  facts: [
    { label: 'Scheduler', value: 'consistent hash' },
    { label: 'Nodes', value: '6 healthy' },
    { label: 'Failover', value: 'auto' },
  ] as Fact[],
}

const pct = (v: number) => `${(v / 400) * 100}%`

export default function SystemsConstellation() {
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const [flowing, setFlowing] = useState(true)

  // Restrained pointer perspective — springed so it never snaps.
  const rxRaw = useMotionValue(0)
  const ryRaw = useMotionValue(0)
  const rotateX = useSpring(rxRaw, { stiffness: 120, damping: 20 })
  const rotateY = useSpring(ryRaw, { stiffness: 120, damping: 20 })
  const scale = useTransform(rotateY, [-6, 0, 6], [0.995, 1, 0.995])

  const activeId = pinned ?? hovered
  const activeModule = MODULES.find((m) => m.id === activeId)

  // Focus + context: when a node is active, its neighbours stay lit and the
  // rest recede, so the topology reads like a real dependency graph.
  const related = useMemo(() => {
    if (!activeModule) return null
    return new Set<string>([activeModule.id, ...activeModule.connectsTo])
  }, [activeModule])

  const onStageMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      ryRaw.set(x * 12)
      rxRaw.set(-y * 12)
    },
    [reduceMotion, rxRaw, ryRaw],
  )

  const resetTilt = useCallback(() => {
    rxRaw.set(0)
    ryRaw.set(0)
  }, [rxRaw, ryRaw])

  // Esc releases a pinned module — expected keyboard behaviour for a popover.
  useEffect(() => {
    if (!pinned) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinned(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pinned])

  const pinsOpen = pinned !== null
  const info = activeModule ?? CORE_INFO
  const InfoIcon = info.icon
  const neighbours = activeModule
    ? MODULES.filter((m) => activeModule.connectsTo.includes(m.id))
    : []

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl">
      {/* ── Header bar ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--accent-teal)' }} aria-hidden="true">
            <FiCpu size={16} />
          </span>
          <span
            className="font-mono-code text-[0.66rem] font-medium uppercase tracking-widest"
            style={{ color: 'var(--text-primary)' }}
          >
            Cluster Topology
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFlowing((v) => !v)}
            aria-pressed={!flowing}
            aria-label={flowing ? 'Pause traffic flow' : 'Resume traffic flow'}
            title={flowing ? 'Pause traffic flow' : 'Resume traffic flow'}
            className="flex h-7 w-7 items-center justify-center rounded border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
          >
            {flowing ? <FiPause size={12} /> : <FiPlay size={12} />}
          </button>
          <span
            className="hidden rounded border border-[var(--border-glow)] bg-[var(--glow-teal)] px-2 py-0.5 font-mono-code text-[0.58rem] uppercase tracking-widest sm:inline-block"
            style={{ color: 'var(--accent-teal)' }}
          >
            Live interactive
          </span>
        </div>
      </div>

      {/* ── Spatial stage ──────────────────────────────── */}
      <div
        role="group"
        aria-label="Interactive cluster topology — hover or focus a node to inspect"
        className="relative p-3"
        style={{ perspective: 1100 }}
        onMouseMove={onStageMove}
        onMouseLeave={resetTilt}
      >
        {/* 420px is the original cap and still governs phones/tablets. At lg+
            the stage is narrower than its (now wider) track, so the negative
            right margin in Hero — not this cap — drives the size increase. */}
        <motion.div
          className="relative mx-auto aspect-square w-full max-w-[420px]"
          style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
        >
          {/* Depth glow behind the core */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, var(--glow-teal), transparent 62%)',
            }}
          />

          {/* Radial beams, orbit guides and endpoints */}
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 h-full w-full"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="200" cy="200" r="150" stroke="var(--border)" strokeDasharray="3 6" />
            <circle cx="200" cy="200" r="86" stroke="var(--border)" />

            {MODULES.map((m) => {
              const isActive = activeId === m.id
              const isRelated = !related || related.has(m.id)
              return (
                <g key={m.id} opacity={isRelated ? 1 : 0.28} style={{ transition: 'opacity 0.25s ease' }}>
                  <line
                    x1={CORE.x}
                    y1={CORE.y}
                    x2={m.x}
                    y2={m.y}
                    stroke={isActive ? m.accent : 'var(--border-glow)'}
                    strokeWidth={isActive ? 2 : 1.2}
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    className={isActive && flowing ? 'beam-flow' : undefined}
                    style={{ transition: 'stroke-width 0.2s ease' }}
                  />
                  {/* Endpoint node at the module end of the beam */}
                  <circle
                    cx={m.x}
                    cy={m.y}
                    r={isActive ? 3 : 2}
                    fill={isActive ? m.accent : 'var(--text-muted)'}
                    opacity={isActive ? 0.9 : 0.5}
                  />
                </g>
              )
            })}

            {/* Outward request packets — one per edge, evenly staggered */}
            {!reduceMotion &&
              flowing &&
              MODULES.map((m, i) => (
                <motion.circle
                  key={`req-${m.id}`}
                  r={activeId === m.id ? 3.2 : 2.1}
                  fill={m.accent}
                  initial={{ cx: CORE.x, cy: CORE.y, opacity: 0 }}
                  animate={{
                    cx: [CORE.x, m.x],
                    cy: [CORE.y, m.y],
                    opacity: [0, 0.95, 0.95, 0],
                  }}
                  transition={{
                    duration: 1.7,
                    repeat: Infinity,
                    repeatDelay: 2 + i * 0.25,
                    ease: 'easeInOut',
                    delay: i * 0.55,
                  }}
                />
              ))}

            {/* Return traffic for the active edge — visually distinct */}
            {!reduceMotion && flowing && activeModule && (
              <motion.circle
                key={`res-${activeModule.id}`}
                r={2.4}
                fill="var(--text-primary)"
                initial={{ cx: activeModule.x, cy: activeModule.y, opacity: 0 }}
                animate={{
                  cx: [activeModule.x, CORE.x],
                  cy: [activeModule.y, CORE.y],
                  opacity: [0, 0.8, 0.8, 0],
                }}
                transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 1.1, ease: 'easeInOut' }}
              />
            )}
          </svg>

          {/* Core node: breathing (not rotating), with emitted pulses */}
          <div
            className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: pct(CORE.x), top: pct(CORE.y) }}
          >
            {!reduceMotion &&
              [0, 1].map((k) => (
                <motion.span
                  key={k}
                  aria-hidden="true"
                  className="absolute rounded-full border"
                  style={{ borderColor: 'var(--accent-teal)', width: 88, height: 88 }}
                  animate={{ scale: [0.92, 1.95], opacity: [0.34, 0] }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: k * 1.8,
                    repeatDelay: 0.5,
                  }}
                />
              ))}
            <motion.div
              className="flex h-20 w-20 flex-col items-center justify-center rounded-full border text-center shadow-[0_0_30px_var(--glow-teal)]"
              style={{
                borderColor: 'var(--border-glow)',
                background:
                  'radial-gradient(circle at 30% 25%, var(--bg-tertiary), var(--bg-primary))',
              }}
              animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FiCpu size={22} style={{ color: 'var(--accent-teal)' }} aria-hidden="true" />
              <span
                className="mt-1 font-mono-code text-[0.5rem] font-semibold uppercase tracking-tight"
                style={{ color: 'var(--accent-teal)' }}
              >
                Core
              </span>
            </motion.div>
          </div>

          {/* Orbiting module nodes */}
          {MODULES.map((m, i) => {
            const Icon = m.icon
            const isActive = activeId === m.id
            const isPinned = pinned === m.id
            const dimmed = !!related && !related.has(m.id)
            const nodeScale = 0.94 + m.depth * 0.1

            return (
              <motion.button
                key={m.id}
                type="button"
                onClick={() => setPinned((prev) => (prev === m.id ? null : m.id))}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered((h) => (h === m.id ? null : h))}
                onFocus={() => setHovered(m.id)}
                onBlur={() => setHovered((h) => (h === m.id ? null : h))}
                aria-label={`${m.name} — ${m.role}. ${m.metric}. ${
                  isPinned ? 'Selected' : 'Select for details'
                }`}
                aria-pressed={isPinned}
                animate={
                  reduceMotion
                    ? { scale: nodeScale, opacity: dimmed ? 0.4 : 1 }
                    : {
                        y: [0, -6, 0],
                        scale: nodeScale,
                        opacity: dimmed ? 0.4 : 1,
                      }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.25 }
                    : {
                        y: { duration: 4.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 },
                        opacity: { duration: 0.25 },
                        scale: { duration: 0.3 },
                      }
                }
                className="group absolute z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 outline-offset-4"
                style={{ left: pct(m.x), top: pct(m.y) }}
              >
                <span
                  className="relative flex h-11 w-11 items-center justify-center rounded-lg border transition-colors duration-200"
                  style={{
                    borderColor: isActive ? m.accent : 'var(--border)',
                    background: isActive ? 'var(--glow-teal)' : 'var(--bg-secondary)',
                    color: isActive ? m.accent : 'var(--text-secondary)',
                    boxShadow: isActive ? `0 0 18px ${m.accent}` : 'none',
                  }}
                >
                  {/* One-shot scan ring on activation */}
                  {isActive && !reduceMotion && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-lg"
                      style={{ border: `1px solid ${m.accent}` }}
                      initial={{ scale: 0.9, opacity: 0.7 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1.1, ease: 'easeOut' }}
                    />
                  )}
                  <Icon size={19} />
                </span>
                <span
                  className="whitespace-nowrap font-mono-code text-[0.58rem] font-medium uppercase tracking-tight transition-colors duration-200"
                  style={{ color: isActive ? 'var(--accent-teal)' : 'var(--text-muted)' }}
                >
                  {m.short}
                </span>
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      {/* ── Telemetry inspector ────────────────────────── */}
      <div className="px-4 pb-4">
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border bg-[var(--bg-primary)] px-3 py-3 backdrop-blur transition-colors duration-300"
          style={{ borderColor: activeId ? 'var(--border-glow)' : 'var(--border)' }}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
            style={{
              borderColor: 'var(--border-glow)',
              background: 'var(--glow-teal)',
              color: 'var(--accent-teal)',
            }}
            aria-hidden="true"
          >
            <InfoIcon size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="truncate font-mono-code text-[0.7rem] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-primary)' }}
            >
              {info.name}
            </p>
            <p className="truncate text-[0.72rem]" style={{ color: 'var(--text-secondary)' }}>
              {info.role}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p
              className="font-mono-code text-[0.72rem] font-semibold"
              style={{ color: 'var(--accent-teal)' }}
            >
              {info.metric}
            </p>
            <p className="font-mono-code text-[0.56rem] uppercase" style={{ color: 'var(--text-muted)' }}>
              {info.spec}
            </p>
          </div>
          {pinsOpen && (
            <button
              type="button"
              onClick={() => setPinned(null)}
              aria-label="Clear selected module"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
            >
              <FiX size={13} />
            </button>
          )}
        </div>

        {/* Contextual detail panel — revealed when a module is pinned */}
        <AnimatePresence initial={false}>
          {pinsOpen && activeModule && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-3">
                <dl className="grid grid-cols-3 gap-x-3 gap-y-2">
                  {activeModule.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt
                        className="font-mono-code text-[0.55rem] uppercase tracking-widest"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {fact.label}
                      </dt>
                      <dd
                        className="mt-0.5 font-mono-code text-[0.68rem]"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {neighbours.length > 0 && (
                  <div className="mt-3 border-t border-[var(--border)] pt-2.5">
                    <p
                      className="font-mono-code text-[0.55rem] uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Connects to
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {neighbours.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => setPinned(n.id)}
                          className="rounded border border-[var(--border)] px-2 py-0.5 font-mono-code text-[0.6rem] uppercase tracking-tight transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {n.short}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p
          className="mt-2 text-center font-mono-code text-[0.6rem] uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          {pinsOpen ? 'Pinned — press Esc or the ✕ to release' : 'Hover or tap a node to inspect'}
        </p>
      </div>
    </div>
  )
}
