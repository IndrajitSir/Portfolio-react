import { useRef, useEffect } from 'react'

// Futuristic per-section ambient backdrops with parallax: the canvas is taller
// than its section and is translated at a slower rate than the content, so the
// backdrop layer visibly lags as you scroll. Each variant reflects a trait of
// the owner's profile: code rain (backend engineer), circuit traces (devops
// arsenal), rising data (career growth), orbital rings (learning), award
// starfield (achievements), signal beacon (open to opportunities), floating
// packages (open source).
export type SectionBackgroundVariant =
  | 'code'
  | 'circuit'
  | 'rise'
  | 'orbit'
  | 'award'
  | 'signal'
  | 'packages'

interface SectionBackgroundProps {
  variant: SectionBackgroundVariant
}

interface DrawCtx {
  ctx: CanvasRenderingContext2D
  W: number
  H: number
  t: number
  teal: string
  indigo: string
  orange: string
  green: string
  gold: string
  isLight: boolean
}

const CODE_CHARS = '01NESTSQLTSAPI{}<>/=$'

interface Trace {
  pts: { x: number; y: number }[]
  len: number[]
  total: number
  pad: 'square' | 'dot'
  phase: number
  speed: number
}

interface Particle {
  x: number
  y: number
  z: number
  speed: number
  sway: number
}

interface Star {
  x: number
  y: number
  size: number
  speed: number
  phase: number
  c: number
}

interface Cube {
  x: number
  y: number
  size: number
  rot: number
  rotSpeed: number
  phase: number
  speed: number
  color: number
}

const genTraces = (W: number, H: number): Trace[] => {
  const traces: Trace[] = []
  const count = Math.max(10, Math.round(Math.min(W, H) / 42))
  const dirs = [1, -1]
  for (let i = 0; i < count; i++) {
    let x = Math.random() * W
    let y = Math.random() * H
    const pts = [{ x, y }]
    let horiz = Math.random() > 0.5
    const segments = 2 + Math.floor(Math.random() * 3)
    for (let s = 0; s < segments; s++) {
      const dist = 26 + Math.random() * 54
      if (horiz) x += dirs[Math.floor(Math.random() * 2)] * dist
      else y += dirs[Math.floor(Math.random() * 2)] * dist
      x = Math.max(6, Math.min(W - 6, x))
      y = Math.max(6, Math.min(H - 6, y))
      pts.push({ x, y })
      horiz = !horiz
    }
    const len: number[] = [0]
    let total = 0
    for (let s = 1; s < pts.length; s++) {
      total += Math.hypot(pts[s].x - pts[s - 1].x, pts[s].y - pts[s - 1].y)
      len.push(total)
    }
    traces.push({
      pts,
      len,
      total,
      pad: Math.random() > 0.5 ? 'square' : 'dot',
      phase: Math.random() * 10,
      speed: 0.3 + Math.random() * 0.55,
    })
  }
  return traces
}

const pointAtDist = (tr: Trace, dist: number): { x: number; y: number } => {
  for (let i = 1; i < tr.pts.length; i++) {
    if (dist <= tr.len[i]) {
      const segLen = tr.len[i] - tr.len[i - 1]
      const r = segLen > 0 ? (dist - tr.len[i - 1]) / segLen : 0
      return {
        x: tr.pts[i - 1].x + (tr.pts[i].x - tr.pts[i - 1].x) * r,
        y: tr.pts[i - 1].y + (tr.pts[i].y - tr.pts[i - 1].y) * r,
      }
    }
  }
  const last = tr.pts[tr.pts.length - 1]
  return { x: last.x, y: last.y }
}

// ── Variants ────────────────────────────────────────────────────────────

function drawCodeRain(d: DrawCtx) {
  const { ctx, W, H, t, teal, isLight } = d
  const cell = 16
  const cols = Math.floor(W / cell)
  const base = isLight ? 0.055 : 0.07
  ctx.font = `400 ${Math.max(9, cell - 5)}px 'JetBrains Mono', monospace`
  for (let c = 0; c < cols; c++) {
    const speed = 0.55 + ((c * 7) % 9) * 0.1
    const head = (t * speed * 13 + (c * 37) % 100) % (H + 260) - 130
    for (let k = 0; k < 12; k++) {
      const y = head - k * cell
      if (y < -12 || y > H + 12) continue
      const fade = 1 - k / 12
      const ch = CODE_CHARS[(c * 31 + k * 7) % CODE_CHARS.length]
      ctx.fillStyle = `rgba(${teal},${base * fade * (k === 0 ? 2.4 : 1)})`
      ctx.fillText(ch, c * cell + 4, y)
    }
  }
}

function drawCircuit(d: DrawCtx, traces: Trace[]) {
  const { ctx, t, teal, indigo, isLight } = d
  const lineAlpha = isLight ? 0.16 : 0.17
  for (const tr of traces) {
    ctx.strokeStyle = `rgba(${teal},${lineAlpha})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(tr.pts[0].x, tr.pts[0].y)
    for (let i = 1; i < tr.pts.length; i++) ctx.lineTo(tr.pts[i].x, tr.pts[i].y)
    ctx.stroke()

    const end = tr.pts[tr.pts.length - 1]
    ctx.fillStyle = `rgba(${indigo},0.4)`
    if (tr.pad === 'square') ctx.fillRect(end.x - 2, end.y - 2, 4, 4)
    else {
      ctx.beginPath()
      ctx.arc(end.x, end.y, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    const travel = (t * tr.speed + tr.phase) % 1
    const dist = travel * tr.total
    const p = pointAtDist(tr, dist)
    const p2 = pointAtDist(tr, Math.min(tr.total, dist + 16))
    ctx.strokeStyle = `rgba(${teal},0.62)`
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()

    ctx.fillStyle = `rgba(${teal},0.85)`
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.7, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawRise(d: DrawCtx, particles: Particle[]) {
  const { ctx, W, H, t, teal, indigo, isLight } = d
  for (let i = 0; i < 5; i++) {
    const bx = W * (0.1 + i * 0.2)
    const bw = 3 + Math.sin(t * 0.8 + i * 2.1) * 1.5
    const bh = H * (0.28 + 0.22 * Math.sin(t * 0.6 + i * 1.7))
    const grad = ctx.createLinearGradient(0, H, 0, H - bh)
    grad.addColorStop(0, `rgba(${teal},${isLight ? 0.11 : 0.12})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(bx, H - bh, bw, bh)
  }
  for (const p of particles) {
    p.y -= p.speed * 0.0035
    p.x += Math.sin(t * 0.4 + p.sway) * 0.0006
    if (p.y < -0.05) {
      p.y = 1.05
      p.x = Math.random()
    }
    const py = p.y * H
    const alpha = (0.1 + p.z * 0.22) * (1 - p.y * 0.6)
    ctx.fillStyle = `rgba(${indigo},${alpha})`
    ctx.beginPath()
    ctx.arc(p.x * W, py, 0.8 + p.z * 1.2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawOrbit(d: DrawCtx) {
  const { ctx, W, H, t, teal, indigo, isLight } = d
  const cx = W * 0.5
  const cy = H * 0.4
  const R = Math.min(W, H) * 0.34
  const pulse = 0.5 + Math.sin(t * 1.6) * 0.5

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55)
  core.addColorStop(0, `rgba(${teal},${0.1 + pulse * 0.06})`)
  core.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = core
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2)

  ctx.fillStyle = `rgba(${teal},${0.55 + pulse * 0.3})`
  ctx.beginPath()
  ctx.arc(cx, cy, 2 + pulse * 1.3, 0, Math.PI * 2)
  ctx.fill()

  const rings = [
    { tilt: 0.5, phase: 0, ry: 0.32, color: teal, speed: 0.7 },
    { tilt: -0.35, phase: 2.1, ry: 0.5, color: indigo, speed: -0.5 },
    { tilt: 1.25, phase: 4.2, ry: 0.22, color: teal, speed: 0.42 },
  ]
  for (const ring of rings) {
    const rx = R * Math.abs(Math.cos(t * ring.speed + ring.phase))
    if (rx < 2) continue
    ctx.strokeStyle = `rgba(${ring.color},${isLight ? 0.09 : 0.11})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, R * ring.ry, ring.tilt, 0, Math.PI * 2)
    ctx.stroke()

    const a = t * ring.speed * 1.6 + ring.phase * 1.9
    const px0 = rx * Math.cos(a)
    const py0 = R * ring.ry * Math.sin(a)
    const sx = cx + px0 * Math.cos(ring.tilt) - py0 * Math.sin(ring.tilt)
    const sy = cy + px0 * Math.sin(ring.tilt) + py0 * Math.cos(ring.tilt)
    ctx.fillStyle = `rgba(${ring.color},0.75)`
    ctx.beginPath()
    ctx.arc(sx, sy, 1.6, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawAward(d: DrawCtx, stars: Star[]) {
  const { ctx, W, H, t, teal, indigo, gold, isLight } = d
  const colors = [teal, indigo, gold]
  for (const s of stars) {
    const tw = 0.5 + Math.sin(t * s.speed + s.phase) * 0.5
    const color = colors[s.c % colors.length]
    const alpha = (0.07 + tw * 0.2) * (isLight ? 0.85 : 1)
    ctx.fillStyle = `rgba(${color},${alpha})`
    ctx.beginPath()
    ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2)
    ctx.fill()
    if (tw > 0.93) {
      const px = s.x * W
      const py = s.y * H
      ctx.strokeStyle = `rgba(${color},${(tw - 0.9) * 2.2})`
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(px - 4, py)
      ctx.lineTo(px + 4, py)
      ctx.moveTo(px, py - 4)
      ctx.lineTo(px, py + 4)
      ctx.stroke()
    }
  }
  const centers: [number, number][] = [
    [W * 0.2, H * 0.3],
    [W * 0.8, H * 0.35],
    [W * 0.5, H * 0.68],
  ]
  centers.forEach(([cxx, cyy], i) => {
    const ping = (t * 0.45 + i * 0.34) % 1
    const maxR = Math.min(W, H) * 0.22
    ctx.strokeStyle = `rgba(${gold},${(1 - ping) * 0.26})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cxx, cyy, 2 + ping * maxR, 0, Math.PI * 2)
    ctx.stroke()
  })
}

function drawSignal(d: DrawCtx, particles: Particle[]) {
  const { ctx, W, H, t, teal, indigo, isLight } = d
  const cx = W * 0.5
  const cy = H * 0.8
  for (let k = 0; k < 3; k++) {
    const r = (t * 26 + k * 55) % 175
    const a = Math.max(0, 1 - r / 175)
    ctx.strokeStyle = `rgba(${teal},${a * 0.38})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, r, Math.PI, Math.PI * 2)
    ctx.stroke()
  }
  for (const p of particles) {
    const dx = cx - p.x * W
    const dy = cy - p.y * H
    p.x += (dx / W) * 0.0022
    p.y += (dy / H) * 0.0022
    p.x += Math.sin(t * 0.3 + p.sway) * 0.0005
    p.y += Math.cos(t * 0.35 + p.sway * 2) * 0.0004
    if (Math.hypot(dx, dy) < 14) {
      p.x = Math.random()
      p.y = Math.random() * 0.6
    }
    const d2 = Math.hypot(cx - p.x * W, cy - p.y * H)
    const alpha = (0.1 + p.z * 0.2) * (0.35 + (1 - Math.min(1, d2 / (H * 0.8))) * 0.65) * (isLight ? 0.85 : 1)
    ctx.fillStyle = `rgba(${indigo},${alpha})`
    ctx.beginPath()
    ctx.arc(p.x * W, p.y * H, 0.8 + p.z * 1.2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawPackages(d: DrawCtx, cubes: Cube[]) {
  const { ctx, W, H, teal, indigo } = d
  // faint links between nearby packages
  for (let i = 0; i < cubes.length; i++) {
    for (let j = i + 1; j < cubes.length; j++) {
      const a = cubes[i]
      const c = cubes[j]
      const dx = (a.x - c.x) * W
      const dy = (a.y - c.y) * H
      const dist = Math.hypot(dx, dy)
      if (dist < 150) {
        ctx.strokeStyle = `rgba(${teal},${(1 - dist / 150) * 0.08})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(a.x * W, a.y * H)
        ctx.lineTo(c.x * W, c.y * H)
        ctx.stroke()
      }
    }
  }
  for (const c of cubes) {
    c.y -= c.speed * 0.003
    c.rot += c.rotSpeed * 0.008
    if (c.y < -0.18) {
      c.y = 1.12
      c.x = Math.random()
    }
    const cx = c.x * W
    const cy = c.y * H
    const s = c.size
    const alpha = 0.09 + 0.05 * Math.sin(c.rot * 2 + c.phase)
    const color = c.color === 0 ? teal : indigo
    const w = s
    const h = s * 0.42

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(Math.sin(c.rot) * 0.45)
    ctx.strokeStyle = `rgba(${color},${alpha})`
    ctx.lineWidth = 1
    // top face
    ctx.beginPath()
    ctx.moveTo(0, -h)
    ctx.lineTo(w * 0.92, 0)
    ctx.lineTo(0, h)
    ctx.lineTo(-w * 0.92, 0)
    ctx.closePath()
    ctx.stroke()
    // left face
    ctx.beginPath()
    ctx.moveTo(-w * 0.92, 0)
    ctx.lineTo(0, h)
    ctx.lineTo(0, h + h * 0.92)
    ctx.lineTo(-w * 0.92, h * 0.92)
    ctx.closePath()
    ctx.stroke()
    // right face
    ctx.beginPath()
    ctx.moveTo(w * 0.92, 0)
    ctx.lineTo(0, h)
    ctx.lineTo(0, h + h * 0.92)
    ctx.lineTo(w * 0.92, h * 0.92)
    ctx.closePath()
    ctx.stroke()
    // corner node
    ctx.fillStyle = `rgba(${color},${Math.min(1, alpha * 2)})`
    ctx.beginPath()
    ctx.arc(0, 0, 1.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// ── Component ────────────────────────────────────────────────────────────

export default function SectionBackground({ variant }: SectionBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tracesRef = useRef<Trace[]>([])
  const particlesRef = useRef<Particle[]>([])
  const starsRef = useRef<Star[]>([])
  const cubesRef = useRef<Cube[]>([])
  const seededRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId = 0
    let running = false
    let lastW = 0
    let lastH = 0
    canvas.style.willChange = 'transform'

    const seed = (W: number, H: number) => {
      tracesRef.current = genTraces(W, H)
      particlesRef.current = Array.from({ length: 24 }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        speed: 0.4 + Math.random() * 1.2,
        sway: Math.random() * 9,
      }))
      starsRef.current = Array.from({ length: 42 }, () => ({
        x: Math.random(),
        y: Math.random(),
        size: 0.6 + Math.random() * 1.3,
        speed: 0.8 + Math.random() * 1.8,
        phase: Math.random() * 9,
        c: Math.floor(Math.random() * 3),
      }))
      cubesRef.current = Array.from({ length: 7 }, () => ({
        x: Math.random(),
        y: Math.random(),
        size: 12 + Math.random() * 22,
        rot: Math.random() * 6.3,
        rotSpeed: (Math.random() - 0.5) * 2,
        phase: Math.random() * 9,
        speed: 0.3 + Math.random() * 0.9,
        color: Math.floor(Math.random() * 2),
      }))
      seededRef.current = true
    }

    const draw = () => {
      const W = canvas.offsetWidth || 300
      const H = canvas.offsetHeight || 150
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const targetW = Math.round(W * dpr)
      const targetH = Math.round(H * dpr)
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
      }
      if (!seededRef.current || W !== lastW || H !== lastH) {
        seed(W, H)
        lastW = W
        lastH = H
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const isLight = document.documentElement.classList.contains('light')

      // ── Parallax: shift the canvas at a slower rate than content
      const section = canvas.parentElement
      if (section) {
        const rect = section.getBoundingClientRect()
        const vh = window.innerHeight || 1
        const offset = rect.top + rect.height / 2 - vh / 2
        const maxShift = rect.height * 0.15
        const shift = Math.max(-maxShift, Math.min(maxShift, offset * 0.12))
        canvas.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`
      }

      const d: DrawCtx = {
        ctx,
        W,
        H,
        t: performance.now() / 1000,
        teal: isLight ? '8,145,178' : '94,234,212',
        indigo: isLight ? '99,102,241' : '129,140,248',
        orange: isLight ? '234,88,12' : '251,146,60',
        green: isLight ? '16,145,87' : '37,211,102',
        gold: isLight ? '202,138,4' : '251,191,36',
        isLight,
      }

      // ── Shared ambient layer: drifting glow blobs ──────────
      const blob1 = ctx.createRadialGradient(
        W * 0.2 + Math.sin(d.t * 0.18) * W * 0.05, H * 0.3 + Math.cos(d.t * 0.14) * H * 0.05, 0,
        W * 0.2, H * 0.3, Math.max(W, H) * 0.42,
      )
      blob1.addColorStop(0, `rgba(${d.teal},${isLight ? 0.06 : 0.055})`)
      blob1.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = blob1
      ctx.fillRect(0, 0, W, H)

      const blob2 = ctx.createRadialGradient(
        W * 0.8 + Math.cos(d.t * 0.16) * W * 0.04, H * 0.7 + Math.sin(d.t * 0.12) * H * 0.04, 0,
        W * 0.8, H * 0.7, Math.max(W, H) * 0.36,
      )
      blob2.addColorStop(0, `rgba(${d.indigo},${isLight ? 0.06 : 0.055})`)
      blob2.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = blob2
      ctx.fillRect(0, 0, W, H)

      // ── Variant signature ──────────────────────────────────
      switch (variant) {
        case 'code':
          drawCodeRain(d)
          break
        case 'circuit':
          drawCircuit(d, tracesRef.current)
          break
        case 'rise':
          drawRise(d, particlesRef.current)
          break
        case 'orbit':
          drawOrbit(d)
          break
        case 'award':
          drawAward(d, starsRef.current)
          break
        case 'signal':
          drawSignal(d, particlesRef.current)
          break
        case 'packages':
          drawPackages(d, cubesRef.current)
          break
      }

      // ── Shared: occasional comet streak ────────────────────
      const comet = (d.t / 4.6) % 1
      const cx0 = -60 + comet * (W + 120)
      const cy0 = H * 0.1 + comet * H * 0.6
      const fade = Math.sin(comet * Math.PI)
      if (fade > 0.02) {
        const grad = ctx.createLinearGradient(cx0 - 70, cy0 - 26, cx0, cy0)
        grad.addColorStop(0, 'rgba(0,0,0,0)')
        grad.addColorStop(1, `rgba(${d.teal},${0.16 * fade})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(cx0 - 70, cy0 - 26)
        ctx.lineTo(cx0, cy0)
        ctx.stroke()
        ctx.fillStyle = `rgba(${d.teal},${0.3 * fade})`
        ctx.beginPath()
        ctx.arc(cx0, cy0, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const start = () => {
      if (running) return
      running = true
      const loop = () => {
        draw()
        animationFrameId = requestAnimationFrame(loop)
      }
      loop()
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(animationFrameId)
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start()
          else stop()
        })
      },
      { rootMargin: '80px' },
    )
    io.observe(canvas)

    return () => {
      io.disconnect()
      stop()
    }
  }, [variant])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-x-0 -top-[15%] w-full h-[130%] pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
