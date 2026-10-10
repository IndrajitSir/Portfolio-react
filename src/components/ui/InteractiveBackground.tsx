import { useEffect, useRef } from 'react'

/**
 * InteractiveBackground
 * --------------------------------------------------------------
 * A single, self-contained Canvas scene that backs the hero. It layers several
 * depth planes so the environment feels spatial rather than decorative:
 *
 *   Layer 0  · hairline grid / wireframe (slowest parallax)
 *   Layer 1  · circuit "routes" + travelling light packets
 *   Layer 2  · particle field with proximity links (medium parallax)
 *   Layer 3  · cursor light + nearest-particle filaments (fast, follows pointer)
 *
 * Design notes
 *   • One rAF loop drives everything — no DOM animation per particle.
 *   • Pointer state lives in refs, so moving the mouse never re-renders React.
 *   • `prefers-reduced-motion` renders a single calm frame instead of looping.
 *   • The loop pauses when the tab is hidden or the hero scrolls out of view.
 */

interface InteractiveBackgroundProps {
  className?: string
  /** Master opacity of the canvas (0–1). */
  opacity?: number
}

interface Particle {
  x: number
  y: number
  z: number // 0 (far) → 1 (near)
  vx: number
  vy: number
  r: number
  alpha: number
  tone: 0 | 1 // teal | indigo
}

interface Route {
  pts: { x: number; y: number }[]
  len: number[]
  total: number
  speed: number
  offset: number
}

const TAU = Math.PI * 2

function pointAtDist(route: Route, dist: number): { x: number; y: number } {
  for (let i = 1; i < route.pts.length; i++) {
    if (dist <= route.len[i]) {
      const seg = route.len[i] - route.len[i - 1]
      const r = seg > 0 ? (dist - route.len[i - 1]) / seg : 0
      return {
        x: route.pts[i - 1].x + (route.pts[i].x - route.pts[i - 1].x) * r,
        y: route.pts[i - 1].y + (route.pts[i].y - route.pts[i - 1].y) * r,
      }
    }
  }
  const last = route.pts[route.pts.length - 1]
  return { x: last.x, y: last.y }
}

export default function InteractiveBackground({
  className = '',
  opacity = 1,
}: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Pointer + parallax state kept in refs (no re-renders on mouse move).
  const pointer = useRef({ x: -9999, y: -9999, tx: 0.5, ty: 0.5 })
  const smooth = useRef({ x: -9999, y: -9999, px: 0, py: 0, active: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches

    let width = 0
    let height = 0
    let dpr = 1
    let particles: Particle[] = []
    let routes: Route[] = []
    let raf = 0
    let running = false
    let startTime = 0

    const seed = () => {
      const area = width * height
      // In light mode the decorative field is thinned as well as dimmed: a cyan
      // particle haze that reads as atmosphere on near-black reads as noise on
      // ivory, so there are simply fewer points and routes to begin with.
      const isLight = document.documentElement.classList.contains('light')
      // Device-appropriate density: fewer points on small / touch screens.
      const density = coarse ? 1 / 26000 : 1 / 14000
      const count = Math.max(24, Math.min(140, Math.round(area * density * (isLight ? 0.65 : 1))))
      particles = Array.from({ length: count }, (_, i) => {
        const z = Math.random()
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          vx: (Math.random() - 0.5) * (0.15 + z * 0.28),
          vy: (Math.random() - 0.5) * (0.15 + z * 0.28),
          r: 0.5 + z * 1.5,
          alpha: 0.12 + z * 0.32,
          tone: (i % 4 === 0 ? 1 : 0) as 0 | 1,
        }
      })

      // Generate a handful of Manhattan circuit routes across the viewport.
      const routeCount = (coarse ? 5 : 8) - (isLight ? 2 : 0)
      routes = Array.from({ length: routeCount }, () => {
        let x = Math.random() * width
        let y = Math.random() * height
        const pts = [{ x, y }]
        let horiz = Math.random() > 0.5
        const segments = 3 + Math.floor(Math.random() * 3)
        for (let s = 0; s < segments; s++) {
          const dist = 40 + Math.random() * 120
          if (horiz) x += Math.random() > 0.5 ? dist : -dist
          else y += Math.random() > 0.5 ? dist : -dist
          x = Math.max(8, Math.min(width - 8, x))
          y = Math.max(8, Math.min(height - 8, y))
          pts.push({ x, y })
          horiz = !horiz
        }
        const len: number[] = [0]
        let total = 0
        for (let i = 1; i < pts.length; i++) {
          total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
          len.push(total)
        }
        return {
          pts,
          len,
          total,
          speed: 0.16 + Math.random() * 0.24,
          offset: Math.random(),
        }
      })
    }

    const resize = () => {
      const parent = canvas.parentElement
      width = parent?.clientWidth || window.innerWidth
      height = parent?.clientHeight || window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const drawGrid = (ox: number, oy: number, isLight: boolean) => {
      const step = 54
      // The grid stays in light mode as a technical substrate, but at roughly
      // half the weight so it never competes with the hero content.
      const alpha = isLight ? 0.028 : 0.045
      ctx.strokeStyle = `rgba(${isLight ? '8,145,178' : '94,234,212'},${alpha})`
      ctx.lineWidth = 1
      ctx.beginPath()
      const gx = ((ox % step) + step) % step
      const gy = ((oy % step) + step) % step
      for (let x = -gx; x <= width; x += step) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = -gy; y <= height; y += step) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()
    }

    const drawRoutes = (ox: number, oy: number, t: number, isLight: boolean) => {
      const teal = isLight ? '8,145,178' : '94,234,212'
      ctx.save()
      ctx.translate(ox, oy)
      for (const route of routes) {
        ctx.strokeStyle = `rgba(${teal},${isLight ? 0.06 : 0.11})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(route.pts[0].x, route.pts[0].y)
        for (let i = 1; i < route.pts.length; i++) ctx.lineTo(route.pts[i].x, route.pts[i].y)
        ctx.stroke()

        // Travelling light packet along the route.
        const travel = (t * route.speed + route.offset) % 1
        const dist = travel * route.total
        const p = pointAtDist(route, dist)
        const p2 = pointAtDist(route, Math.min(route.total, dist + 18))
        ctx.strokeStyle = `rgba(${teal},0.55)`
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
        ctx.fillStyle = `rgba(${teal},0.9)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.8, 0, TAU)
        ctx.fill()
      }
      ctx.restore()
    }

    const drawParticles = (ox: number, oy: number, isLight: boolean) => {
      const teal = isLight ? '8,145,178' : '94,234,212'
      const indigo = isLight ? '99,102,241' : '129,140,248'
      const maxLink = coarse ? 96 : 118

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        // Gentle wrap so the field never collapses at the edges.
        if (p.x < -20) p.x = width + 20
        if (p.x > width + 20) p.x = -20
        if (p.y < -20) p.y = height + 20
        if (p.y > height + 20) p.y = -20

        const px = p.x + ox * (0.35 + p.z * 0.65)
        const py = p.y + oy * (0.35 + p.z * 0.65)

        // Proximity links.
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const qx = q.x + ox * (0.35 + q.z * 0.65)
          const qy = q.y + oy * (0.35 + q.z * 0.65)
          const dx = px - qx
          const dy = py - qy
          const d2 = dx * dx + dy * dy
          if (d2 < maxLink * maxLink) {
            const a = (1 - Math.sqrt(d2) / maxLink) * (isLight ? 0.09 : 0.16)
            ctx.strokeStyle = `rgba(${teal},${a})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(qx, qy)
            ctx.stroke()
          }
        }

        ctx.fillStyle = `rgba(${p.tone === 1 ? indigo : teal},${p.alpha})`
        ctx.beginPath()
        ctx.arc(px, py, p.r, 0, TAU)
        ctx.fill()
      }
    }

    const drawCursor = (isLight: boolean) => {
      const { x, y, active } = smooth.current
      if (active < 0.01) return
      const teal = isLight ? '8,145,178' : '94,234,212'
      const radius = coarse ? 160 : 220

      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
      grad.addColorStop(0, `rgba(${teal},${0.1 * active})`)
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)

      // Filaments from the pointer to nearby particles.
      ctx.strokeStyle = `rgba(${teal},${0.32 * active})`
      ctx.lineWidth = 0.9
      ctx.beginPath()
      for (const p of particles) {
        const dx = p.x - x
        const dy = p.y - y
        const dist = Math.hypot(dx, dy)
        if (dist < 150) {
          ctx.moveTo(x, y)
          ctx.lineTo(p.x, p.y)
        }
      }
      ctx.stroke()
    }

    const render = (time: number) => {
      const t = (time - startTime) / 1000
      const isLight = document.documentElement.classList.contains('light')

      // Gently respond to scroll: the field drifts down and dims as the hero
      // leaves the viewport. Reading scrollY is cheap and does not force layout.
      const vh = window.innerHeight || 1
      const scrollP = Math.min(1, Math.max(0, window.scrollY / vh))
      const dim = 1 - scrollP * 0.6

      // Interpolate the smoothed pointer + parallax offsets.
      smooth.current.x += (pointer.current.x - smooth.current.x) * 0.12
      smooth.current.y += (pointer.current.y - smooth.current.y) * 0.12
      smooth.current.px += (pointer.current.tx - 0.5 - smooth.current.px) * 0.05
      smooth.current.py += (pointer.current.ty - 0.5 - smooth.current.py) * 0.05
      smooth.current.active += ((pointer.current.x > -9000 ? 1 : 0) - smooth.current.active) * 0.06

      const ox = -smooth.current.px * 46
      const oy = -smooth.current.py * 46 + scrollP * 90

      ctx.clearRect(0, 0, width, height)
      // In light mode the whole decorative field sits back: a continuous cyan
      // haze is exactly what made the old light theme read as washed out.
      ctx.globalAlpha = dim * (isLight ? 0.55 : 1)
      drawGrid(ox * 0.35, oy * 0.35, isLight)
      drawRoutes(ox * 0.6, oy * 0.6, t, isLight)
      drawParticles(ox, oy, isLight)
      drawCursor(isLight)
      ctx.globalAlpha = 1
    }

    const loop = (time: number) => {
      render(time)
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running) return
      running = true
      startTime = performance.now()
      raf = requestAnimationFrame(loop)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    // ── Pointer tracking (window-level so the whole hero reacts) ──
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.current.x = e.clientX - rect.left
      pointer.current.y = e.clientY - rect.top
      pointer.current.tx = e.clientX / window.innerWidth
      pointer.current.ty = e.clientY / window.innerHeight
    }
    const onLeave = () => {
      pointer.current.x = -9999
      pointer.current.y = -9999
    }

    resize()
    window.addEventListener('resize', resize)

    if (!coarse) {
      window.addEventListener('mousemove', onMove, { passive: true })
      window.addEventListener('mouseleave', onLeave)
    }

    // ── Visibility + viewport gating ──
    const onVisibility = () => {
      if (reduceMotion) return
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduceMotion) return
        if (entry.isIntersecting) start()
        else stop()
      },
      { rootMargin: '120px' },
    )
    io.observe(canvas)

    if (reduceMotion) {
      // One calm, static frame — no loop, no pointer reactivity.
      render(performance.now())
    } else {
      start()
    }

    return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    />
  )
}
