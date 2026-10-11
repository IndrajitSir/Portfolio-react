import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
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
} from "react-icons/fi";

interface Fact {
  label: string;
  value: string;
}

interface ModuleNode {
  id: string;
  name: string;
  short: string;
  role: string;
  spec: string;
  metric: string;
  icon: ComponentType<{ size?: number }>;
  accent: string;
  /** Position in the 400×400 viewbox space. */
  x: number;
  y: number;
  /** 0 (far) → 1 (near): drives scale/opacity to read as depth. */
  depth: number;
  /** Topology neighbours used for focus + context. */
  connectsTo: string[];
  facts: Fact[];
}

const CORE = { x: 200, y: 200 };

const MODULES: ModuleNode[] = [
  {
    id: "gateway",
    name: "API Gateway",
    short: "API Gateway",
    role: "Reverse proxy, routing & rate limiting",
    spec: "Envoy · Traefik · Go",
    metric: "p99 4.2ms",
    icon: FiCloud,
    accent: "var(--accent-teal)",
    x: 200,
    y: 46,
    depth: 0.55,
    connectsTo: ["services", "security"],
    facts: [
      { label: "Throughput", value: "42k rps" },
      { label: "p99", value: "4.2ms" },
      { label: "TLS", value: "mTLS 1.3" },
    ],
  },
  {
    id: "services",
    name: "Backend Services",
    short: "Services",
    role: "Async microservices & worker pipelines",
    spec: "Go · Node · gRPC",
    metric: "42k rps",
    icon: FiServer,
    accent: "var(--accent-indigo)",
    x: 334,
    y: 116,
    depth: 0.8,
    connectsTo: ["database", "cache", "gateway"],
    facts: [
      { label: "Replicas", value: "6 / 6" },
      { label: "Queue", value: "depth 0" },
      { label: "Runtimes", value: "Go · Node" },
    ],
  },
  {
    id: "database",
    name: "Database Cluster",
    short: "DB Cluster",
    role: "Relational shards & read replication",
    spec: "PostgreSQL · TimescaleDB",
    metric: "12.8k IOPS",
    icon: FiDatabase,
    accent: "var(--accent-teal)",
    x: 334,
    y: 284,
    depth: 0.95,
    connectsTo: ["cache", "services"],
    facts: [
      { label: "Shards", value: "8" },
      { label: "Replicas", value: "2 / shard" },
      { label: "IOPS", value: "12.8k" },
    ],
  },
  {
    id: "cache",
    name: "Distributed Cache",
    short: "Cache",
    role: "Key-value & session fabric",
    spec: "Redis · Dragonfly",
    metric: "98.4% hit",
    icon: FiHardDrive,
    accent: "var(--accent-orange)",
    x: 200,
    y: 354,
    depth: 0.45,
    connectsTo: ["services", "database"],
    facts: [
      { label: "Hit ratio", value: "98.4%" },
      { label: "Eviction", value: "LRU + TTL" },
      { label: "Nodes", value: "3" },
    ],
  },
  {
    id: "security",
    name: "Zero-Trust Security",
    short: "Security",
    role: "mTLS, JWT & vault policy enforcement",
    spec: "OAuth2 · SPIFFE · KMS",
    metric: "auth <2ms",
    icon: FiShield,
    accent: "var(--accent-indigo)",
    x: 66,
    y: 284,
    depth: 0.7,
    connectsTo: ["gateway", "services"],
    facts: [
      { label: "Auth", value: "<2ms" },
      { label: "Policy", value: "RBAC + ABAC" },
      { label: "Rotations", value: "24h" },
    ],
  },
  {
    id: "devtools",
    name: "Developer Tools",
    short: "Dev Tools",
    role: "CLI tooling, SDKs & telemetry",
    spec: "OpenTelemetry · Docker",
    metric: "100% traces",
    icon: FiTerminal,
    accent: "var(--accent-teal)",
    x: 66,
    y: 116,
    depth: 0.62,
    connectsTo: ["services", "gateway"],
    facts: [
      { label: "Traces", value: "100%" },
      { label: "SDKs", value: "4 langs" },
      { label: "CLI", value: "v1.4.0" },
    ],
  },
];

const CORE_INFO = {
  name: "Core Kernel",
  role: "Distributed scheduler & service registry",
  spec: "Cluster health 100% OK",
  metric: "p99 14ms",
  icon: FiCpu,
  accent: "var(--accent-teal)",
  facts: [
    { label: "Scheduler", value: "consistent hash" },
    { label: "Nodes", value: "6 healthy" },
    { label: "Failover", value: "auto" },
  ] as Fact[],
};

const pct = (v: number) => `${(v / 400) * 100}%`;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Pixel measurements of the card body, used to route the connector line. */
interface Geo {
  w: number;
  h: number;
  /** Stage origin + size, derived from layout (not from transformed rects, so tilt can't skew it). */
  sx: number;
  sy: number;
  size: number;
  /** Panel box. */
  px: number;
  py: number;
  pw: number;
  ph: number;
  side: "right" | "below";
}

const GLYPHS = "0123456789ABCDEF:-_";

/**
 * Text that "decodes" into place whenever its value changes, left to right.
 * The real text sits in an sr-only span so screen readers never hear the
 * scrambled frames. Spaces are preserved, and with a monospace face the width
 * never changes, so nothing around it can shift.
 */
function Scramble({
  text,
  duration = 320,
}: {
  text: string;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (reduceMotion) {
      setOut(text);
      return;
    }
    let raf = 0;
    let lastTick = 0;
    const start = performance.now();

    const tick = (now: number) => {
      // Throttle updates to ~25fps (every 40ms) to reduce CPU overhead across multi-instances
      if (now - lastTick > 40 || now - start >= duration) {
        lastTick = now;
        const p = Math.min(1, (now - start) / duration);
        const resolved = Math.floor(p * text.length);
        let next = "";
        for (let i = 0; i < text.length; i++) {
          next +=
            i < resolved || text[i] === " "
              ? text[i]
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setOut(p < 1 ? next : text);
      }
      if (performance.now() - start < duration) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, reduceMotion]);

  return (
    <>
      <span aria-hidden="true">{out}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}

interface SystemsConstellationProps {
  /**
   * Reports which node the reader is currently inspecting (hovered or pinned),
   * or null when none. The docked companion reads this so Strobi traces the
   * cluster the moment the reader does.
   */
  onActiveChange?: (id: string | null) => void;
}

export default function SystemsConstellation({
  onActiveChange,
}: SystemsConstellationProps) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [flowing, setFlowing] = useState(true);

  // Restrained pointer perspective — springed so it never snaps.
  const rxRaw = useMotionValue(0);
  const ryRaw = useMotionValue(0);
  const rotateX = useSpring(rxRaw, { stiffness: 120, damping: 20 });
  const rotateY = useSpring(ryRaw, { stiffness: 120, damping: 20 });
  const scale = useTransform(rotateY, [-6, 0, 6], [0.995, 1, 0.995]);

  const activeId = pinned ?? hovered;
  const activeModule = MODULES.find((m) => m.id === activeId);

  // Strobi follows this: an inspected node is a question worth thinking about,
  // so the companion changes expression the moment the reader does. The setter
  // is a stable setState, and React bails out when the id is unchanged.
  useEffect(() => {
    onActiveChange?.(activeId);
  }, [activeId, onActiveChange]);

  // Focus + context: when a node is active, its neighbours stay lit and the
  // rest recede, so the topology reads like a real dependency graph.
  const related = useMemo(() => {
    if (!activeModule) return null;
    return new Set<string>([activeModule.id, ...activeModule.connectsTo]);
  }, [activeModule]);

  const onStageMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      ryRaw.set(x * 12);
      rxRaw.set(-y * 12);
    },
    [reduceMotion, rxRaw, ryRaw],
  );

  const resetTilt = useCallback(() => {
    rxRaw.set(0);
    ryRaw.set(0);
  }, [rxRaw, ryRaw]);

  // Esc releases a pinned module — expected keyboard behaviour for a popover.
  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPinned(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned]);

  const pinsOpen = pinned !== null;
  const info = activeModule ?? CORE_INFO;
  const InfoIcon = info.icon;
  const neighbours = activeModule
    ? MODULES.filter((m) => activeModule.connectsTo.includes(m.id))
    : [];

  const bodyRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  const measure = useCallback(() => {
    const body = bodyRef.current;
    const wrap = wrapRef.current;
    const panel = panelRef.current;
    if (!body || !wrap || !panel) return;
    const inner = wrap.offsetWidth - 24; // wrap has p-3
    const size = Math.min(420, inner);
    setGeo({
      w: body.offsetWidth,
      h: body.offsetHeight,
      sx: wrap.offsetLeft + 12 + (inner - size) / 2,
      sy: wrap.offsetTop + 12,
      size,
      px: panel.offsetLeft,
      py: panel.offsetTop,
      pw: panel.offsetWidth,
      ph: panel.offsetHeight,
      side:
        panel.offsetLeft >= wrap.offsetLeft + wrap.offsetWidth - 1
          ? "right"
          : "below",
    });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (bodyRef.current) ro.observe(bodyRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // Curve from the active node to the panel. The tangents follow the layout:
  // horizontal when the panel is on the right, vertical when it is below.
  const connector = useMemo(() => {
    if (!geo || !activeModule) return null;
    const nx = geo.sx + (activeModule.x / 400) * geo.size;
    const ny = geo.sy + (activeModule.y / 400) * geo.size;

    if (geo.side === "right") {
      const x0 = nx + 22;
      const ax = geo.px;
      const ay = clamp(ny, geo.py + 20, geo.py + geo.ph - 20);
      const dx = Math.max(0, ax - x0) * 0.5; // never overshoot the endpoint
      return {
        d: `M ${x0} ${ny} C ${x0 + dx} ${ny}, ${ax - dx} ${ay}, ${ax} ${ay}`,
        ax,
        ay,
      };
    }

    const ax = clamp(nx, geo.px + 20, geo.px + geo.pw - 20);
    const ay = geo.py;
    const y0 = Math.min(ny + 22, ay - 6); // start right below node box, stay above panel
    const dy = Math.max(0, ay - y0) * 0.5;
    return {
      d: `M ${nx} ${y0} C ${nx} ${y0 + dy}, ${ax} ${ay - dy}, ${ax} ${ay}`,
      ax,
      ay,
    };
  }, [geo, activeModule]);

  return (
    <div className="cx relative w-full overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)] shadow-[var(--shadow-panel)]">
      {/* ── Header bar ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5"
        style={{ background: "var(--panel-raised)" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--accent-teal)" }} aria-hidden="true">
            <FiCpu size={16} />
          </span>
          <span
            className="font-mono-code text-[0.66rem] font-medium uppercase tracking-widest"
            style={{ color: "var(--text-primary)" }}
          >
            Cluster Topology
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFlowing((v) => !v)}
            aria-pressed={!flowing}
            aria-label={flowing ? "Pause traffic flow" : "Resume traffic flow"}
            title={flowing ? "Pause traffic flow" : "Resume traffic flow"}
            className="flex h-7 w-7 items-center justify-center rounded border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
          >
            {flowing ? <FiPause size={12} /> : <FiPlay size={12} />}
          </button>
          <span
            className="hidden rounded border border-[var(--border-glow)] bg-[var(--glow-teal)] px-2 py-0.5 font-mono-code text-[0.58rem] uppercase tracking-widest sm:inline-block"
            style={{ color: "var(--accent-teal)" }}
          >
            Live interactive
          </span>
        </div>
      </div>

      <div ref={bodyRef} className="cx-body relative">
        {/* Connector: node → panel (first in the DOM, so nodes paint on top) */}
        {geo && connector && activeModule && (
          <svg
            aria-hidden="true"
            width={geo.w}
            height={geo.h}
            fill="none"
            className="pointer-events-none absolute left-0 top-0 overflow-visible"
          >
            <motion.path
              key={`line-${activeModule.id}`}
              d={connector.d}
              stroke={activeModule.accent}
              strokeWidth={1.6}
              strokeLinecap="round"
              opacity={0.45}
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
            <motion.path
              key={`flow-${activeModule.id}`}
              d={connector.d}
              stroke={activeModule.accent}
              strokeWidth={1.6}
              strokeDasharray="4 4"
              strokeLinecap="round"
              className={flowing ? "beam-flow" : undefined}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 0.95 }}
              transition={{ delay: 0.45, duration: 0.3 }}
            />
            {/* Socket where the line plugs into the panel */}
            <motion.circle
              key={`dot-${activeModule.id}`}
              cx={connector.ax}
              cy={connector.ay}
              r={3.5}
              fill={activeModule.accent}
              initial={reduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.4,
                type: "spring",
                stiffness: 400,
                damping: 18,
              }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            {/* A packet travelling node → panel */}
            {!reduceMotion && flowing && (
              <circle
                key={`pkt-${activeModule.id}`}
                r={2.6}
                fill="var(--text-primary)"
              >
                <animateMotion
                  dur="1.6s"
                  repeatCount="indefinite"
                  path={connector.d}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </svg>
        )}

        {/* ── Spatial stage ──────────────────────────────── */}
        <div
          ref={wrapRef}
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
            style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
          >
            {/* Depth glow behind the core */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, var(--glow-teal), transparent 62%)",
              }}
            />

            {/* Radial beams, orbit guides and endpoints */}
            <svg
              viewBox="0 0 400 400"
              className="absolute inset-0 h-full w-full"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="200"
                cy="200"
                r="150"
                stroke="var(--border)"
                strokeDasharray="3 6"
              />
              <circle cx="200" cy="200" r="86" stroke="var(--border)" />

              {MODULES.map((m) => {
                const isActive = activeId === m.id;
                const isRelated = !related || related.has(m.id);
                return (
                  <g
                    key={m.id}
                    opacity={isRelated ? 1 : 0.28}
                    style={{ transition: "opacity 0.25s ease" }}
                  >
                    <line
                      x1={CORE.x}
                      y1={CORE.y}
                      x2={m.x}
                      y2={m.y}
                      stroke={isActive ? m.accent : "var(--border-glow)"}
                      strokeWidth={isActive ? 2 : 1.2}
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                      className={isActive && flowing ? "beam-flow" : undefined}
                      style={{ transition: "stroke-width 0.2s ease" }}
                    />
                    {/* Endpoint node at the module end of the beam */}
                    <circle
                      cx={m.x}
                      cy={m.y}
                      r={isActive ? 3 : 2}
                      fill={isActive ? m.accent : "var(--text-muted)"}
                      opacity={isActive ? 0.9 : 0.5}
                    />
                  </g>
                );
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
                      ease: "easeInOut",
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
                  initial={{
                    cx: activeModule.x,
                    cy: activeModule.y,
                    opacity: 0,
                  }}
                  animate={{
                    cx: [activeModule.x, CORE.x],
                    cy: [activeModule.y, CORE.y],
                    opacity: [0, 0.8, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.3,
                    repeat: Infinity,
                    repeatDelay: 1.1,
                    ease: "easeInOut",
                  }}
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
                    style={{
                      borderColor: "var(--accent-teal)",
                      width: 88,
                      height: 88,
                    }}
                    animate={{ scale: [0.92, 1.95], opacity: [0.34, 0] }}
                    transition={{
                      duration: 3.6,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: k * 1.8,
                      repeatDelay: 0.5,
                    }}
                  />
                ))}
              <motion.div
                className="flex h-20 w-20 flex-col items-center justify-center rounded-full border text-center shadow-[0_0_30px_var(--glow-teal)]"
                style={{
                  borderColor: "var(--border-glow)",
                  background:
                    "radial-gradient(circle at 30% 25%, var(--bg-tertiary), var(--bg-primary))",
                }}
                animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FiCpu
                  size={22}
                  style={{ color: "var(--accent-teal)" }}
                  aria-hidden="true"
                />
                <span
                  className="mt-1 font-mono-code text-[0.5rem] font-semibold uppercase tracking-tight"
                  style={{ color: "var(--accent-teal)" }}
                >
                  Core
                </span>
              </motion.div>
            </div>

            {/* Orbiting module nodes */}
            {MODULES.map((m, i) => {
              const Icon = m.icon;
              const isActive = activeId === m.id;
              const isPinned = pinned === m.id;
              const dimmed = !!related && !related.has(m.id);
              const nodeScale = 0.94 + m.depth * 0.1;

              return (
                // Plain div: owns position + centering (44px box, so -22px margins).
                // No transform here, so nothing can overwrite it.
                <div
                  key={m.id}
                  className="absolute z-30"
                  style={{
                    left: pct(m.x),
                    top: pct(m.y),
                    width: 44,
                    height: 44,
                    marginLeft: -22,
                    marginTop: -22,
                  }}
                >
                  <motion.button
                    type="button"
                    onClick={() =>
                      setPinned((prev) => (prev === m.id ? null : m.id))
                    }
                    onMouseEnter={() => setHovered(m.id)}
                    onMouseLeave={() =>
                      setHovered((h) => (h === m.id ? null : h))
                    }
                    onFocus={() => setHovered(m.id)}
                    onBlur={() => setHovered((h) => (h === m.id ? null : h))}
                    aria-label={`${m.name} — ${m.role}. ${m.metric}. ${
                      isPinned ? "Selected" : "Select for details"
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
                            y: {
                              duration: 4.5 + i * 0.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.35,
                            },
                            opacity: { duration: 0.25 },
                            scale: { duration: 0.3 },
                          }
                    }
                    className="group relative block h-full w-full outline-offset-4"
                  >
                    <span
                      className="relative flex h-full w-full items-center justify-center rounded-lg border transition-colors duration-200"
                      style={{
                        borderColor: isActive ? m.accent : "var(--border)",
                        background: isActive
                          ? "var(--glow-teal)"
                          : "var(--bg-secondary)",
                        color: isActive ? m.accent : "var(--text-secondary)",
                        boxShadow: isActive ? `0 0 18px ${m.accent}` : "none",
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
                          transition={{ duration: 1.1, ease: "easeOut" }}
                        />
                      )}
                      <Icon size={19} />
                    </span>

                    {/* Label hangs below the box, out of the layout flow, so the
                        square alone defines the node's centre */}
                    <span
                      className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap font-mono-code text-[0.58rem] font-medium uppercase tracking-tight transition-colors duration-200"
                      style={{
                        color: isActive
                          ? "var(--accent-teal)"
                          : "var(--text-muted)",
                      }}
                    >
                      {m.short}
                    </span>
                  </motion.button>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ── Details panel: always present, content swaps in place ── */}
        <div
          ref={panelRef}
          className="cx-panel relative flex flex-col overflow-hidden rounded-xl border transition-[border-color,box-shadow] duration-300"
          style={{
            background: "var(--panel-raised)",
            borderColor: activeId ? "var(--border-glow)" : "var(--border)",
            boxShadow: activeId ? `0 0 26px -10px ${info.accent}` : "none",
          }}
        >
          {/* Scan beam: replays whenever the subject changes */}
          {!reduceMotion && (
            <motion.span
              key={info.name}
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/5"
              style={{
                background: `linear-gradient(90deg, transparent, ${info.accent}, transparent)`,
                opacity: 0.18,
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "500%" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}

          {/* Identity */}
          <div role="status" className="p-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300"
                style={{
                  borderColor: "var(--border-glow)",
                  background: "var(--glow-teal)",
                  color: info.accent,
                }}
                aria-hidden="true"
              >
                <InfoIcon size={16} />
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate font-mono-code text-[0.7rem] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Scramble text={info.name} />
                </p>
                <p
                  className="truncate text-[0.68rem]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Scramble text={info.role} />
                </p>
              </div>

              {pinsOpen && (
                <button
                  type="button"
                  onClick={() => setPinned(null)}
                  aria-label="Clear selected module"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2 pt-2 border-t border-[var(--border)]/50">
              <span
                className="font-mono-code text-[0.7rem] font-semibold transition-colors duration-300"
                style={{ color: info.accent }}
              >
                <Scramble text={info.metric} />
              </span>
              <span
                className="font-mono-code text-[0.56rem] uppercase truncate"
                style={{ color: "var(--text-muted)" }}
              >
                <Scramble text={info.spec} />
              </span>
            </div>
          </div>

          {/* Facts */}
          <dl className="cx-facts grid gap-x-3 gap-y-2 border-t border-[var(--border)] px-3 py-2.5">
            {info.facts.map((fact, i) => (
              <div key={i} className="cx-fact">
                <dt
                  className="truncate font-mono-code text-[0.55rem] uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Scramble text={fact.label} />
                </dt>
                <dd
                  className="mt-0.5 truncate font-mono-code text-[0.68rem]"
                  style={{ color: "var(--text-primary)" }}
                  title={fact.value}
                >
                  <Scramble text={fact.value} />
                </dd>
              </div>
            ))}
          </dl>

          {/* Connections */}
          <div className="cx-links flex gap-1.5 border-t border-[var(--border)] px-3">
            {pinsOpen && activeModule ? (
              <>
                <span
                  className="cx-label shrink-0 font-mono-code text-[0.55rem] uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Connects to
                </span>
                {neighbours.map((n, i) => (
                  <motion.button
                    key={n.id}
                    type="button"
                    onClick={() => setPinned(n.id)}
                    initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.07, duration: 0.3 }}
                    className="shrink-0 rounded border border-[var(--border)] px-2 py-0.5 font-mono-code text-[0.6rem] uppercase tracking-tight transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {n.short}
                  </motion.button>
                ))}
              </>
            ) : (
              <span
                className="cx-hint font-mono-code text-[0.58rem] uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                {activeModule
                  ? "Click to pin and follow its connections"
                  : `Linked to all ${MODULES.length} modules`}
              </span>
            )}
          </div>
        </div>
      </div>

      <p
        className="px-4 pb-4 pt-1 text-center font-mono-code text-[0.6rem] uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {pinsOpen
          ? "Pinned — press Esc or the ✕ to release"
          : "Hover or tap a node to inspect"}
      </p>
    </div>
  );
}
