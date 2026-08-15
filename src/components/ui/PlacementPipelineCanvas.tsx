import { useRef, useEffect } from 'react'

// Futuristic campus-placement pipeline: candidates stream from the campus hub
// through glowing stage gates (APPLY → TEST → INTERVIEW → OFFER) toward a
// pulsing offer portal.
export default function PlacementPipelineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId = 0

    // Floating ambient particles
    const particles = Array.from({ length: 22 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      speed: 0.4 + Math.random() * 1.1,
    }))

    // Candidates flowing through the pipeline
    const candidates = Array.from({ length: 11 }, (_, i) => ({
      phase: i / 11,
      speed: 0.055 + (i % 4) * 0.012,
      sway: (i % 5) * 1.3,
    }))

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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
      const teal = isDark ? '94,234,212' : '8,145,178'
      const indigo = isDark ? '129,140,248' : '99,102,241'
      const orange = isDark ? '251,146,60' : '234,88,12'
      const textMuted = isDark ? '148,163,184' : '71,85,105'

      const t = performance.now() / 1000

      // ── Bezier pipeline track ──────────────────────────────
      const p0 = { x: W * 0.08, y: H * 0.6 }
      const p1 = { x: W * 0.5, y: H * 0.28 }
      const p2 = { x: W * 0.92, y: H * 0.54 }
      const pointAt = (u: number) => {
        const inv = 1 - u
        return {
          x: inv * inv * p0.x + 2 * inv * u * p1.x + u * u * p2.x,
          y: inv * inv * p0.y + 2 * inv * u * p1.y + u * u * p2.y,
        }
      }

      // Animated dashed flow line
      ctx.setLineDash([5, 9])
      ctx.lineDashOffset = -t * 26
      ctx.strokeStyle = `rgba(${teal},${isDark ? 0.4 : 0.5})`
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y)
      ctx.stroke()
      ctx.setLineDash([])

      // ── Campus hub (left) ──────────────────────────────────
      const hubX = W * 0.06
      const hubY = H * 0.52
      const hubW = Math.max(14, W * 0.07)
      const hubH = Math.max(20, H * 0.2)
      // building body
      ctx.fillStyle = `rgba(${indigo},${isDark ? 0.28 : 0.22})`
      ctx.strokeStyle = `rgba(${indigo},0.6)`
      ctx.lineWidth = 1
      roundRect(ctx, hubX - hubW / 2, hubY - hubH, hubW, hubH, 3)
      ctx.fill()
      ctx.stroke()
      // antenna
      ctx.strokeStyle = `rgba(${indigo},0.7)`
      ctx.beginPath()
      ctx.moveTo(hubX, hubY - hubH - 4)
      ctx.lineTo(hubX, hubY - hubH - 2)
      ctx.moveTo(hubX, hubY - hubH - 4)
      ctx.lineTo(hubX + 3, hubY - hubH - 6)
      ctx.stroke()
      // window grid
      const cols = 3
      const rows = 4
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const lit = (c + r) % 3 !== 1
          ctx.fillStyle = lit ? `rgba(${teal},0.55)` : `rgba(${teal},0.12)`
          ctx.fillRect(
            hubX - hubW / 2 + 3 + c * ((hubW - 8) / cols),
            hubY - hubH + 4 + r * ((hubH - 8) / rows),
            (hubW - 8) / cols - 1.5,
            (hubH - 8) / rows - 1.5,
          )
        }
      }

      // ── Stage gates ────────────────────────────────────────
      const stages = [
        { u: 0.14, label: 'APPLY', color: indigo },
        { u: 0.4, label: 'TEST', color: teal },
        { u: 0.66, label: 'INTERVIEW', color: orange },
        { u: 0.9, label: 'OFFER', color: teal },
      ]
      const gatePos = stages.map((s) => ({ ...pointAt(s.u), ...s }))

      // Activity per gate: how many candidates are passing by
      gatePos.forEach((g, gi) => {
        let activity = 0
        candidates.forEach((c) => {
          const u = (t * c.speed + c.phase) % 1
          const pos = pointAt(u)
          const d = Math.hypot(pos.x - g.x, pos.y - g.y)
          activity += Math.exp(-d * d / 1800)
        })
        const pulse = Math.min(1, activity * 0.5)

        const size = Math.max(7, Math.min(W, H) * 0.045)
        // gate glow
        const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, size * 3)
        grad.addColorStop(0, `rgba(${g.color},${0.22 + pulse * 0.35})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(g.x, g.y, size * 3, 0, Math.PI * 2)
        ctx.fill()

        // hexagon gate
        ctx.strokeStyle = `rgba(${g.color},${0.55 + pulse * 0.45})`
        ctx.fillStyle = `rgba(${g.color},${0.1 + pulse * 0.3})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k + Math.PI / 6
          const hx = g.x + Math.cos(a) * size
          const hy = g.y + Math.sin(a) * size
          if (k === 0) ctx.moveTo(hx, hy)
          else ctx.lineTo(hx, hy)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // inner core dot
        ctx.fillStyle = `rgba(${g.color},${0.5 + pulse * 0.5})`
        ctx.beginPath()
        ctx.arc(g.x, g.y, 2 + pulse * 1.5, 0, Math.PI * 2)
        ctx.fill()

        // label
        ctx.font = `600 ${Math.max(7, size * 0.72)}px 'JetBrains Mono', monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = `rgba(${textMuted},${0.65 + pulse * 0.35})`
        ctx.fillText(g.label, g.x, g.y + size + 3)

        // index number under the label (01–04)
        ctx.font = `400 ${Math.max(6, size * 0.55)}px 'JetBrains Mono', monospace`
        ctx.fillStyle = `rgba(${textMuted},0.45)`
        ctx.fillText(`0${gi + 1}`, g.x, g.y + size + 12)
      })

      // ── Offer portal (right) ───────────────────────────────
      const portX = W * 0.94
      const portY = H * 0.5
      // expanding radar pings
      for (let i = 0; i < 3; i++) {
        const pr = (t * 14 + i * 18) % 42
        ctx.strokeStyle = `rgba(${teal},${Math.max(0, 0.5 - pr / 84)})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(portX, portY, 4 + pr, 0, Math.PI * 2)
        ctx.stroke()
      }
      // target ring
      ctx.strokeStyle = `rgba(${orange},0.8)`
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.arc(portX, portY, 7 + Math.sin(t * 2) * 1.2, 0, Math.PI * 2)
      ctx.stroke()
      // checkmark
      ctx.strokeStyle = `rgba(${teal},0.95)`
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.moveTo(portX - 3.4, portY + 0.4)
      ctx.lineTo(portX - 0.6, portY + 3)
      ctx.lineTo(portX + 4, portY - 3)
      ctx.stroke()

      // ── Candidates flowing ─────────────────────────────────
      candidates.forEach((c) => {
        const u = (t * c.speed + c.phase) % 1
        const pos = pointAt(u)
        // perpendicular sway + depth scale (bigger near the portal)
        const scale = 0.65 + u * 0.55
        const sway = Math.sin(u * 14 + c.sway) * 5 * scale
        // approximate tangent for perpendicular offset
        const u2 = Math.min(1, u + 0.02)
        const prev = pointAt(u2)
        const dx = prev.x - pos.x
        const dy = prev.y - pos.y
        const len = Math.hypot(dx, dy) || 1
        const px = pos.x + (-dy / len) * sway
        const py = pos.y + (dx / len) * sway

        // motion streak
        const streak = pointAt(Math.max(0, u - 0.035))
        ctx.strokeStyle = `rgba(${teal},${0.1 + u * 0.35})`
        ctx.lineWidth = 1.6 * scale
        ctx.beginPath()
        ctx.moveTo(streak.x, streak.y)
        ctx.lineTo(px, py)
        ctx.stroke()

        // head
        ctx.fillStyle = `rgba(${teal},${0.55 + u * 0.45})`
        ctx.beginPath()
        ctx.arc(px, py, 1.7 * scale, 0, Math.PI * 2)
        ctx.fill()
      })

      // ── Ambient particles ──────────────────────────────────
      particles.forEach((p) => {
        p.y -= p.speed * 0.003
        p.x += Math.cos(t * 0.4 + p.z * 9) * 0.0004
        if (p.y < -0.05) {
          p.y = 1.05
          p.x = Math.random()
        }
        ctx.fillStyle = `rgba(${indigo},${0.08 + p.z * 0.24})`
        ctx.beginPath()
        ctx.arc(p.x * W, p.y * H, 0.7 + p.z * 1.3, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
