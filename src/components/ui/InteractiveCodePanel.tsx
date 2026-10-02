import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiCheck, FiChevronDown, FiCode, FiLoader, FiPlay, FiTerminal } from 'react-icons/fi'

type Language = 'ts' | 'go' | 'yaml'

interface Snippet {
  id: string
  file: string
  language: Language
  lines: string[]
  /** Output produced by the local simulation for this snippet. */
  logs: { text: string; tone: 'muted' | 'info' | 'accent' | 'success' }[]
}

const SNIPPETS: Snippet[] = [
  {
    id: 'engineer',
    file: '~/backend/engineer.ts',
    language: 'ts',
    lines: [
      'const engineer = {',
      '  name: "Indrajit Mandal",',
      '  focus: ["Backend Systems", "API Design", "Open Source"],',
      '  mindset: "Build. Optimize. Scale."',
      '};',
    ],
    logs: [
      { text: '[init] allocating runtime — zero-copy buffers', tone: 'muted' },
      { text: '[tls]  mTLS handshake verified with cluster root CA', tone: 'info' },
      { text: '[bench] 10,000 synthetic RPC pings across 6 nodes', tone: 'info' },
      { text: '[stats] latency min=1.2ms avg=4.8ms p99=11.4ms', tone: 'accent' },
      { text: '[ready] architecture verified — zero packet loss', tone: 'success' },
    ],
  },
  {
    id: 'architecture',
    file: '~/backend/architecture.go',
    language: 'go',
    lines: [
      'package runtime',
      '',
      '// Horizontal scaling with graceful shutdown.',
      'func Serve(ctx context.Context, pool *ConnPool) error {',
      '  gateway := NewGateway(pool, WithRateLimit(50_000))',
      '  return gateway.ListenAndServe(ctx, ":8443")',
      '}',
    ],
    logs: [
      { text: '[build] compiling runtime module (go 1.23)', tone: 'muted' },
      { text: '[pool]  128 connections warm — 6 read replicas', tone: 'info' },
      { text: '[scale] autoscaler armed at 65% target CPU', tone: 'info' },
      { text: '[stats] sustained 42k rps — no back-pressure', tone: 'accent' },
      { text: '[ready] graceful shutdown hooks registered', tone: 'success' },
    ],
  },
  {
    id: 'deploy',
    file: '~/backend/deploy.yml',
    language: 'yaml',
    lines: [
      '# orchestrator deployment manifest',
      'service: api-gateway',
      'replicas: 6',
      'resources:',
      '  cpu: "2"',
      '  memory: 512Mi',
      'autoscale:',
      '  targetCPU: 65',
    ],
    logs: [
      { text: '[plan] resolving 8 resources across 2 zones', tone: 'muted' },
      { text: '[roll]  canary wave 1/3 healthy', tone: 'info' },
      { text: '[roll]  canary wave 2/3 healthy', tone: 'info' },
      { text: '[scale] replicas 6/6 ready — 0 rollout blocks', tone: 'accent' },
      { text: '[ready] deployment converged in 38s', tone: 'success' },
    ],
  },
]

interface Token {
  text: string
  kind: 'plain' | 'comment' | 'string' | 'keyword' | 'number' | 'prop'
}

const KEYWORDS = new Set([
  // TS / JS
  'const', 'let', 'var', 'function', 'return', 'import', 'export', 'from', 'new',
  'async', 'await', 'interface', 'type', 'extends', 'implements', 'if', 'else',
  'for', 'while', 'of', 'in', 'class', 'this', 'true', 'false', 'null', 'undefined',
  // Go
  'package', 'func', 'struct', 'range', 'go', 'defer', 'chan', 'map', 'string',
  'int', 'bool', 'nil', 'error', 'context',
])

const TOKEN_RE = /(#.*$|\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:_\d+)*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g

function tokenize(line: string, language: Language): Token[] {
  if (language === 'yaml') {
    // YAML: comment + key + string/number, rest plain.
    const hash = line.indexOf('#')
    if (hash === 0) return [{ text: line, kind: 'comment' }]
    const keyMatch = /^(\s*)([\w-]+)(:)(.*)$/.exec(line)
    if (keyMatch) {
      const [, indent, key, colon, rest] = keyMatch
      const tokens: Token[] = []
      if (indent) tokens.push({ text: indent, kind: 'plain' })
      tokens.push({ text: key, kind: 'prop' })
      tokens.push({ text: colon, kind: 'plain' })
      const value = rest.trim()
      if (value) {
        tokens.push({ text: ' ', kind: 'plain' })
        tokens.push({ text: value, kind: /^\d+$/.test(value) ? 'number' : 'string' })
      }
      return tokens
    }
    return [{ text: line, kind: 'plain' }]
  }

  const tokens: Token[] = []
  let last = 0
  let match: RegExpExecArray | null
  TOKEN_RE.lastIndex = 0
  while ((match = TOKEN_RE.exec(line)) !== null) {
    if (match.index > last) tokens.push({ text: line.slice(last, match.index), kind: 'plain' })
    const [full, comment, str, num, word] = match
    if (comment) tokens.push({ text: full, kind: 'comment' })
    else if (str) tokens.push({ text: full, kind: 'string' })
    else if (num) tokens.push({ text: full, kind: 'number' })
    else if (word) tokens.push({ text: full, kind: KEYWORDS.has(word) ? 'keyword' : 'plain' })
    else tokens.push({ text: full, kind: 'plain' })
    last = match.index + full.length
  }
  if (last < line.length) tokens.push({ text: line.slice(last), kind: 'plain' })
  return tokens
}

const TOKEN_CLASS: Record<Token['kind'], string> = {
  plain: '',
  comment: 'italic',
  string: '',
  keyword: '',
  number: '',
  prop: '',
}

const TOKEN_COLOR: Record<Token['kind'], string> = {
  plain: 'var(--text-primary)',
  comment: 'var(--text-muted)',
  string: 'var(--accent-indigo)',
  keyword: 'var(--accent-teal)',
  number: 'var(--accent-orange)',
  prop: 'var(--text-secondary)',
}

export default function InteractiveCodePanel({ className = '' }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const [tabIndex, setTabIndex] = useState(0)
  const [codeOpen, setCodeOpen] = useState(true)
  const [consoleOpen, setConsoleOpen] = useState(true)
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState<Snippet['logs']>([])
  const [elapsed, setElapsed] = useState(0)

  const timers = useRef<number[]>([])
  const snippet = SNIPPETS[tabIndex]

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  // Runtime timer while the simulation is active.
  useEffect(() => {
    if (!running) return
    const started = performance.now()
    const id = window.setInterval(() => setElapsed((performance.now() - started) / 1000), 100)
    return () => window.clearInterval(id)
  }, [running])

  const runSimulation = useCallback(() => {
    if (running) return
    clearTimers()
    setRunning(true)
    setConsoleOpen(true)
    setLogs([])
    setElapsed(0)

    snippet.logs.forEach((line, i) => {
      const id = window.setTimeout(() => setLogs((prev) => [...prev, line]), 260 + i * 430)
      timers.current.push(id)
    })
    const done = window.setTimeout(
      () => setRunning(false),
      320 + snippet.logs.length * 430,
    )
    timers.current.push(done)
  }, [running, snippet.logs, clearTimers])

  const selectTab = useCallback(
    (i: number) => {
      if (i === tabIndex) return
      clearTimers()
      setRunning(false)
      setLogs([])
      setElapsed(0)
      setTabIndex(i)
    },
    [tabIndex, clearTimers],
  )

  const toneColor: Record<Snippet['logs'][number]['tone'], string> = {
    muted: 'var(--text-muted)',
    info: 'var(--text-secondary)',
    accent: 'var(--accent-indigo)',
    success: 'var(--accent-teal)',
  }

  return (
    <figure
      className={`overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)]/95 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.75)] backdrop-blur-xl ${className}`}
      aria-label="Interactive code panel — run a local simulation"
    >
      {/* ── Title bar ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span
            className="ml-1 flex min-w-0 items-center gap-1.5 rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 font-mono-code text-[0.62rem]"
            style={{ color: 'var(--accent-teal)' }}
          >
            <FiCode size={11} />
            <span className="truncate">{snippet.file}</span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={runSimulation}
            disabled={running}
            className="
              inline-flex items-center gap-1.5 rounded border px-2.5 py-1
              font-mono-code text-[0.62rem] font-medium uppercase tracking-wider
              transition-all duration-200 disabled:cursor-progress
            "
            style={{
              borderColor: 'var(--border-glow)',
              background: running ? 'var(--accent-teal)' : 'var(--glow-teal)',
              color: running ? 'var(--bg-primary)' : 'var(--accent-teal)',
            }}
            aria-label="Run local simulation"
          >
            {running ? (
              <motion.span
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              >
                <FiLoader size={12} />
              </motion.span>
            ) : (
              <FiPlay size={12} aria-hidden="true" />
            )}
            {running ? 'Running' : elapsed > 0 ? 'Re-run' : 'Run'}
          </button>

          <button
            type="button"
            onClick={() => setCodeOpen((v) => !v)}
            aria-expanded={codeOpen}
            aria-label={codeOpen ? 'Collapse code' : 'Expand code'}
            className="flex h-7 w-7 items-center justify-center rounded border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
          >
            <motion.span
              animate={{ rotate: codeOpen ? 0 : -90 }}
              transition={{ duration: 0.25 }}
              aria-hidden="true"
            >
              <FiChevronDown size={14} />
            </motion.span>
          </button>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Code files"
        className="flex items-center gap-1 border-b border-[var(--border)] px-2"
      >
        {SNIPPETS.map((s, i) => {
          const active = i === tabIndex
          return (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => selectTab(i)}
              className="relative px-2.5 py-2 font-mono-code text-[0.66rem] transition-colors duration-200"
              style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {s.file.split('/').pop()}
              {active && (
                <motion.span
                  layoutId="code-tab-underline"
                  className="absolute inset-x-1 -bottom-px h-px"
                  style={{ background: 'var(--accent-teal)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Code body ───────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {codeOpen && (
          <motion.div
            key="code"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto px-3 py-3">
              <div className="grid min-w-max grid-cols-[1.6rem_1fr] gap-x-3 font-mono-code text-[0.72rem] leading-6">
                <div className="select-none text-right" aria-hidden="true">
                  {snippet.lines.map((_, i) => (
                    <div key={i} style={{ color: 'var(--text-muted)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  ))}
                </div>
                <code aria-live="off">
                  {snippet.lines.map((line, i) => (
                    <motion.div
                      key={`${snippet.id}-${i}`}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 + i * 0.07, duration: 0.3 }}
                      className="min-h-[1.5rem] rounded px-1 transition-colors duration-150 hover:bg-[var(--surface-hover)]"
                    >
                      {tokenize(line, snippet.language).map((tok, j) => (
                        <span
                          key={j}
                          className={TOKEN_CLASS[tok.kind]}
                          style={{ color: TOKEN_COLOR[tok.kind] }}
                        >
                          {tok.text}
                        </span>
                      ))}
                      {i === snippet.lines.length - 1 && !running && (
                        <span className="editor-cursor" aria-hidden="true" />
                      )}
                    </motion.div>
                  ))}
                </code>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Simulation console ──────────────────────────── */}
      <div className="border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setConsoleOpen((v) => !v)}
          aria-expanded={consoleOpen}
          className="flex w-full items-center justify-between px-3 py-2 font-mono-code text-[0.6rem] uppercase tracking-widest transition-colors hover:bg-[var(--surface-hover)]"
        >
          <span className="flex items-center gap-1.5" style={{ color: 'var(--accent-teal)' }}>
            <FiTerminal size={12} aria-hidden="true" />
            Local simulation
            <span className="normal-case tracking-normal" style={{ color: 'var(--text-muted)' }}>
              — not a remote server
            </span>
          </span>
          <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <span>T+ {elapsed.toFixed(3)}s</span>
            <motion.span
              animate={{ rotate: consoleOpen ? 0 : -90 }}
              transition={{ duration: 0.25 }}
              aria-hidden="true"
            >
              <FiChevronDown size={13} />
            </motion.span>
          </span>
        </button>

        <AnimatePresence initial={false}>
          {consoleOpen && (
            <motion.div
              key="console"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div
                className="max-h-36 space-y-1 overflow-y-auto px-3 pb-3 font-mono-code text-[0.66rem] leading-5"
                role="log"
                aria-live="polite"
                aria-label="Simulation output"
              >
                {logs.length === 0 && (
                  <p style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--accent-indigo)' }}>[idle]</span> Runtime warmed
                    and awaiting execution — press Run.
                  </p>
                )}
                {logs.map((log, i) => (
                  <motion.p
                    key={i}
                    initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ color: toneColor[log.tone] }}
                  >
                    {log.text}
                  </motion.p>
                ))}
                {running && (
                  <p style={{ color: 'var(--text-muted)' }} aria-hidden="true">
                    ▍
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visually-hidden status for assistive tech. */}
      <p className="sr-only" role="status">
        {running ? 'Simulation running' : logs.length > 0 ? 'Simulation complete' : 'Simulation idle'}
      </p>

      {logs.length > 0 && !running && (
        <div
          className="flex items-center justify-center gap-1.5 border-t border-[var(--border)] py-1.5 font-mono-code text-[0.58rem] uppercase tracking-widest"
          style={{ color: 'var(--accent-teal)' }}
        >
          <FiCheck size={11} aria-hidden="true" />
          Simulation complete
        </div>
      )}
    </figure>
  )
}
