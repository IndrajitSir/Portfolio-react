import { useRef, useEffect } from 'react'

// WhatsApp Smart Alert scene: a phone receives a live notification feed, a
// keyword scanner sweeps the screen, and matched messages fire alert bursts.
export default function WhatsAppAlertCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId = 0

    // Ambient particles
    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      speed: 0.4 + Math.random() * 1.1,
    }))

    // Floating keyword chips that orbit the phone
    const keywords = [
      { label: 'URGENT', color: '251,146,60' },
      { label: 'MEETING', color: '94,234,212' },
      { label: 'CUSTOM', color: '129,140,248' },
      { label: 'SOON', color: '37,211,102' },
    ]

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

      const isLight = document.documentElement.classList.contains('light')
      const teal = isLight ? '8,145,178' : '94,234,212'
      const indigo = isLight ? '99,102,241' : '129,140,248'
      const green = isLight ? '16,145,87' : '37,211,102'
      const textMain = isLight ? '15,17,23' : '232,234,240'

      const t = performance.now() / 1000
      const cx = W * 0.5
      const cy = H * 0.45

      // ── Background grid ────────────────────────────────────
      ctx.strokeStyle = `rgba(${teal},${isLight ? 0.05 : 0.06})`
      ctx.lineWidth = 1
      for (let x = 0; x < W; x += 26) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += 26) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // ── Ambient particles ──────────────────────────────────
      particles.forEach((p) => {
        p.y -= p.speed * 0.004
        p.x += Math.sin(t * 0.3 + p.z * 9) * 0.0004
        if (p.y < -0.05) {
          p.y = 1.05
          p.x = Math.random()
        }
        ctx.fillStyle = `rgba(${indigo},${0.08 + p.z * 0.26})`
        ctx.beginPath()
        ctx.arc(p.x * W, p.y * H, 0.8 + p.z * 1.3, 0, Math.PI * 2)
        ctx.fill()
      })

      // ── Phone ──────────────────────────────────────────────
      const phoneW = Math.max(92, Math.min(150, W * 0.3))
      const phoneH = phoneW * 1.85
      const px = cx - phoneW / 2
      const py = cy - phoneH / 2
      const radius = phoneW * 0.16

      // body glow
      const bodyGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, phoneH * 0.7)
      bodyGlow.addColorStop(0, `rgba(${green},0.12)`)
      bodyGlow.addColorStop(0.6, `rgba(${indigo},0.05)`)
      bodyGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = bodyGlow
      ctx.fillRect(cx - phoneH * 0.8, cy - phoneH * 0.8, phoneH * 1.6, phoneH * 1.6)

      // body
      ctx.fillStyle = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(8,9,13,0.75)'
      ctx.strokeStyle = `rgba(${green},0.55)`
      ctx.lineWidth = 1.4
      roundRect(ctx, px, py, phoneW, phoneH, radius)
      ctx.fill()
      ctx.stroke()

      // screen
      const sw = phoneW - 7
      const sh = phoneH - 9
      const sx = px + 3.5
      const sy = py + 4.5
      ctx.fillStyle = isLight ? 'rgba(240,243,248,0.95)' : 'rgba(10,12,17,0.9)'
      roundRect(ctx, sx, sy, sw, sh, phoneW * 0.1)
      ctx.fill()

      // camera dot
      ctx.fillStyle = `rgba(${indigo},0.7)`
      ctx.beginPath()
      ctx.arc(cx, py + 5.5, 1.6, 0, Math.PI * 2)
      ctx.fill()

      // ── Notification feed inside the screen ────────────────
      const barH = 8
      const gap = 14
      const scroll = (t * 15) % (sh + gap)
      const scanY = sy + (0.5 + Math.sin(t * 0.7) * 0.34) * sh

      for (let i = 0; i < 4; i++) {
        const y = sy + ((i * (barH + gap) - scroll + sh + gap * 2) % (sh + gap)) - barH
        const x = sx + sw * 0.08
        const w = sw * (i % 2 === 0 ? 0.78 : 0.62)
        // item near scan line → highlighted (keyword matched)
        const near = Math.abs(y + barH / 2 - scanY) < 11
        const itemBg = near
          ? `rgba(${green},${isLight ? 0.25 : 0.28})`
          : isLight ? 'rgba(15,17,23,0.08)' : 'rgba(255,255,255,0.07)'
        ctx.fillStyle = itemBg
        ctx.strokeStyle = near ? `rgba(${green},0.8)` : `rgba(${teal},${isLight ? 0.2 : 0.16})`
        ctx.lineWidth = near ? 1.2 : 1
        roundRect(ctx, x, y, w, barH + 6, 5)
        ctx.fill()
        ctx.stroke()
        // text bars
        ctx.fillStyle = near ? `rgba(${green},0.9)` : isLight ? 'rgba(15,17,23,0.35)' : 'rgba(232,234,240,0.3)'
        ctx.fillRect(x + 4, y + 3.5, w * 0.55, 2.4)
        ctx.fillRect(x + 4, y + 7.5, w * 0.35, 2.4)
        // matched → alert tag
        if (near) {
          ctx.fillStyle = `rgba(251,146,60,0.95)`
          ctx.font = "700 7px 'JetBrains Mono', monospace"
          ctx.textAlign = 'right'
          ctx.textBaseline = 'middle'
          ctx.fillText('⚡', x + w - 3, y + barH / 2 + 1)
        }
      }

      // scanner sweep line
      ctx.strokeStyle = `rgba(${teal},0.55)`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(sx + 2, scanY)
      ctx.lineTo(sx + sw - 2, scanY)
      ctx.stroke()
      // sweep head
      ctx.fillStyle = `rgba(${teal},0.9)`
      ctx.beginPath()
      ctx.arc(sx + sw - 4, scanY, 2.6, 0, Math.PI * 2)
      ctx.fill()

      // ── Orbiting keyword chips ─────────────────────────────
      keywords.forEach((k, i) => {
        const angle = t * 0.38 + (i * Math.PI) / 2
        const R = phoneW * 0.95 + Math.sin(t * 0.5 + i) * 3
        const kx = cx + Math.cos(angle) * R
        const ky = cy + Math.sin(angle) * R * 0.72
        const depth = (Math.sin(angle) + 1) / 2 // 0..1 brightness by screen depth

        // faint link to the phone
        ctx.strokeStyle = `rgba(${teal},${0.05 + depth * 0.14})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(kx, ky)
        ctx.stroke()

        // chip
        ctx.font = `700 ${Math.max(7, phoneW * 0.075)}px 'JetBrains Mono', monospace`
        const tw = ctx.measureText(k.label).width + 12
        ctx.fillStyle = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(8,9,13,0.72)'
        ctx.strokeStyle = `rgba(${k.color},${0.35 + depth * 0.6})`
        ctx.lineWidth = 1
        roundRect(ctx, kx - tw / 2, ky - 7, tw, 14, 7)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = `rgba(${k.color},${0.6 + depth * 0.4})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(k.label, kx, ky + 0.5)
      })

      // ── Alert burst (periodic) ─────────────────────────────
      const cycle = t % 3.2
      const burst = Math.max(0, 1 - cycle / 0.6)
      if (burst > 0) {
        const ax = px + phoneW
        const ay = py + 6
        for (let i = 0; i < 3; i++) {
          const r = 6 + (burst * 30 + i * 12)
          ctx.strokeStyle = `rgba(251,146,60,${(1 - burst) * 0.7})`
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.arc(ax, ay, r, 0, Math.PI * 2)
          ctx.stroke()
        }
        // exclamation badge
        ctx.fillStyle = `rgba(251,146,60,${0.75 + burst * 0.25})`
        ctx.beginPath()
        ctx.arc(ax, ay, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(8,9,13,0.9)'
        ctx.fillRect(ax - 1, ay - 3, 2, 4.4)
        ctx.fillRect(ax - 1, ay + 2, 2, 1.6)
      }

      // ── HUD status bar ─────────────────────────────────────
      ctx.font = "500 8px 'JetBrains Mono', monospace"
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      const hudY = H - 10
      ctx.fillStyle = `rgba(${textMain},0.55)`
      ctx.fillText('● monitoring', 10, hudY)
      ctx.fillStyle = `rgba(${green},${0.5 + Math.sin(t * 4) * 0.3})`
      ctx.fillRect(10, hudY - 4.5, 4, 4)
      ctx.textAlign = 'right'
      ctx.fillStyle = burst > 0 ? `rgba(251,146,60,0.95)` : `rgba(${textMain},0.45)`
      ctx.fillText(burst > 0 ? '⚡ alert: URGENT' : 'awaiting keyword', W - 10, hudY)

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
