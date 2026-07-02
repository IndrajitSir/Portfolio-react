import { useRef, useEffect } from 'react'

export default function ProjectCanvas1() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let t = 0

        const draw = () => {
            const W = canvas.width = canvas.offsetWidth || 300
            const H = canvas.height = canvas.offsetHeight || 150
            ctx.clearRect(0, 0, W, H)

            const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

            // Grid
            ctx.strokeStyle = isDark ? 'rgba(94,234,212,0.06)' : 'rgba(8,145,178,0.08)'
            ctx.lineWidth = 1
            for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
            for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

            // Data bars
            const bars = 8
            const bw = W / bars
            for (let i = 0; i < bars; i++) {
                const bh = (Math.sin(t + i * 0.8) * 0.3 + 0.5) * H * 0.6
                const grad = ctx.createLinearGradient(0, H - bh, 0, H)
                grad.addColorStop(0, isDark ? 'rgba(94,234,212,0.6)' : 'rgba(8,145,178,0.6)')
                grad.addColorStop(1, isDark ? 'rgba(129,140,248,0.1)' : 'rgba(99,102,241,0.1)')
                ctx.fillStyle = grad
                ctx.fillRect(i * bw + 4, H - Math.max(0, bh), bw - 8, Math.max(0, bh))
            }
            t += 0.02
            animationFrameId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}
