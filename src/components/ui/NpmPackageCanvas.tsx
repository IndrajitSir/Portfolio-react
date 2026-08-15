import { useRef, useEffect } from 'react'

// 3D npm registry scene: a rotating package core with orbiting dependency
// nodes, drifting particles, and a live "npm install" terminal overlay.
export default function NpmPackageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId = 0

    // Floating background particles (normalized coords)
    const particles = Array.from({ length: 26 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      speed: 0.5 + Math.random() * 1.2,
    }))

    // Terminal overlay content — typed out on a loop
    const line1 = 'npm install @indrajitsir/nest-auth-core'
    const line2 = 'added 2 packages in 1.2s'
    const totalChars = line1.length + 2 + line2.length + 46 // +2 for "$ ", +46 pause

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
      const npmRed = '203,56,55'
      const textMain = isDark ? '232,234,240' : '15,17,23'

      const t = performance.now() / 1000
      const cx = W * 0.5
      const cy = H * 0.42
      const R = Math.min(W, H)
      const f = R * 1.6

      // ── Ambient glow behind the package core ───────────────
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5)
      glow.addColorStop(0, `rgba(${teal},0.14)`)
      glow.addColorStop(0.55, `rgba(${indigo},0.05)`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      // ── 3D rotating package core (wireframe cube) ──────────
      const half = R * 0.15
      const rotY = t * 0.55
      const rotX = Math.sin(t * 0.4) * 0.5
      const verts: number[][] = []
      for (let i = 0; i < 8; i++) {
        const x = (i & 1 ? 1 : -1) * half
        const y = (i & 2 ? 1 : -1) * half
        const z = (i & 4 ? 1 : -1) * half
        // Rotate Y
        const x1 = x * Math.cos(rotY) + z * Math.sin(rotY)
        const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY)
        // Rotate X
        const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX)
        const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX)
        const scale = f / (f + z2 + half * 2)
        verts.push([cx + x1 * scale, cy + y1 * scale, scale])
      }
      const edges = [
        [0, 1], [0, 2], [1, 3], [2, 3],
        [4, 5], [4, 6], [5, 7], [6, 7],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ]
      edges.forEach(([a, b]) => {
        const va = verts[a]
        const vb = verts[b]
        ctx.strokeStyle = `rgba(${teal},${(va[2] + vb[2]) * 0.3})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(va[0], va[1])
        ctx.lineTo(vb[0], vb[1])
        ctx.stroke()
      })
      // Vertex nodes
      verts.forEach((v) => {
        ctx.fillStyle = `rgba(${indigo},${0.35 + v[2] * 0.55})`
        ctx.beginPath()
        ctx.arc(v[0], v[1], 1.6 * v[2], 0, Math.PI * 2)
        ctx.fill()
      })

      // npm-red halo behind the "npm" tag
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, half * 1.7)
      coreGlow.addColorStop(0, `rgba(${npmRed},0.5)`)
      coreGlow.addColorStop(0.4, `rgba(${npmRed},0.1)`)
      coreGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = coreGlow
      ctx.fillRect(cx - half * 1.9, cy - half * 1.9, half * 3.8, half * 3.8)

      ctx.font = `700 ${Math.max(9, half * 0.7)}px 'JetBrains Mono', monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.95)'
      ctx.fillText('npm', cx, cy + 1)

      // ── Orbiting dependency nodes ──────────────────────────
      const nodeCount = 7
      for (let i = 0; i < nodeCount; i++) {
        const elevation = (i / nodeCount) * Math.PI - Math.PI / 2 + 0.35
        const orbitR = R * (0.3 + (i % 2) * 0.07)
        const phi = t * (0.5 + (i % 3) * 0.14) + i * 1.9
        const x = Math.cos(phi) * Math.cos(elevation) * orbitR
        const y = Math.sin(elevation) * orbitR * 0.75
        const z = Math.sin(phi) * Math.cos(elevation) * orbitR
        // Global Y rotation for slow depth drift
        const gy = t * 0.18
        const xr = x * Math.cos(gy) + z * Math.sin(gy)
        const zr = -x * Math.sin(gy) + z * Math.cos(gy)
        const depth = (zr + orbitR) / (orbitR * 2) // 0..1
        const scale = f / (f + zr + orbitR)
        const px = cx + xr * scale
        const py = cy + y * scale

        // Dependency link back to the core
        ctx.strokeStyle = `rgba(${teal},${0.05 + depth * 0.3})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(px, py)
        ctx.stroke()

        // Node dot
        ctx.fillStyle = `rgba(${i % 2 === 0 ? indigo : teal},${0.35 + depth * 0.55})`
        ctx.beginPath()
        ctx.arc(px, py, (1.5 + depth * 2.2) * scale, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── Drifting particles ─────────────────────────────────
      particles.forEach((p) => {
        p.y -= p.speed * 0.004
        p.x += Math.sin(t * 0.3 + p.z * 9) * 0.0004
        if (p.y < -0.05) {
          p.y = 1.05
          p.x = Math.random()
        }
        ctx.fillStyle = `rgba(${teal},${0.1 + p.z * 0.28})`
        ctx.beginPath()
        ctx.arc(p.x * W, p.y * H, 0.8 + p.z * 1.4, 0, Math.PI * 2)
        ctx.fill()
      })

      // ── Typing terminal overlay ────────────────────────────
      const termW = Math.min(W * 0.86, 252)
      const termH = 30
      const tx = (W - termW) / 2
      const ty = H - termH - 14
      ctx.font = "400 10px 'JetBrains Mono', monospace"
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'

      // Terminal panel
      ctx.fillStyle = isDark ? 'rgba(8,9,13,0.62)' : 'rgba(255,255,255,0.78)'
      ctx.strokeStyle = `rgba(${teal},0.28)`
      ctx.lineWidth = 1
      roundRect(ctx, tx, ty, termW, termH, 6)
      ctx.fill()
      ctx.stroke()

      // Traffic-light dots
      ctx.fillStyle = `rgba(${npmRed},0.95)`
      ctx.beginPath(); ctx.arc(tx + 10, ty + 9, 2.4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = isDark ? 'rgba(251,146,60,0.95)' : 'rgba(234,88,12,0.95)'
      ctx.beginPath(); ctx.arc(tx + 19, ty + 9, 2.4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = `rgba(${teal},0.95)`
      ctx.beginPath(); ctx.arc(tx + 28, ty + 9, 2.4, 0, Math.PI * 2); ctx.fill()

      // Typed output
      const chars = Math.floor((t * 9) % totalChars)
      const textY = ty + 21
      const typed1 = Math.max(0, Math.min(chars - 2, line1.length))
      ctx.fillStyle = `rgba(${textMain},0.85)`
      ctx.fillText('$ ', tx + 10, textY)
      if (typed1 > 0) {
        const npmChars = Math.min(typed1, 3)
        const npmWidth = ctx.measureText(line1.slice(0, npmChars)).width
        ctx.fillStyle = `rgba(${npmRed},1)`
        ctx.fillText(line1.slice(0, npmChars), tx + 24, textY)
        if (typed1 > npmChars) {
          ctx.fillStyle = `rgba(${textMain},0.85)`
          ctx.fillText(line1.slice(npmChars, typed1), tx + 24 + npmWidth, textY)
        }
      }
      const typed2 = Math.max(0, chars - line1.length - 2)
      if (typed2 > 0) {
        ctx.fillStyle = `rgba(${teal},0.95)`
        ctx.fillText(`\u2713 ${line2.slice(0, Math.min(typed2, line2.length))}`, tx + 10, textY + 12)
      }

      // Blinking cursor while typing
      if (chars < totalChars - 46) {
        const cursorText =
          typed1 < line1.length
            ? `$ ${line1.slice(0, typed1)}`
            : `$ ${line1} \u2713 ${line2.slice(0, Math.min(typed2, line2.length))}`
        const cursorX = tx + 10 + ctx.measureText(cursorText).width
        ctx.fillStyle = `rgba(${teal},${0.6 + Math.sin(t * 6) * 0.4})`
        ctx.fillRect(cursorX + 3, textY - 8, 5, 10)
      }

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
