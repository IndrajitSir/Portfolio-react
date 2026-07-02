import { useRef, useEffect } from 'react'

export default function ProjectCanvas2() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        const W = canvas.offsetWidth || 300
        const H = canvas.offsetHeight || 150
        // Initialize nodes based on initial width/height
        const nodes = Array.from({ length: 12 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        }))

        const draw = () => {
            const W = canvas.width = canvas.offsetWidth || 300
            const H = canvas.height = canvas.offsetHeight || 150

            const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
            ctx.fillStyle = isDark ? 'rgba(8,9,13,0.3)' : 'rgba(244,246,251,0.3)'
            ctx.fillRect(0, 0, W, H)

            // Move nodes
            nodes.forEach(n => {
                n.x += n.vx
                n.y += n.vy
                if (n.x < 0 || n.x > W) n.vx *= -1
                if (n.y < 0 || n.y > H) n.vy *= -1
            })

            // Draw connections
            nodes.forEach((n, i) => {
                nodes.forEach((m, j) => {
                    if (j <= i) return
                    const d = Math.hypot(m.x - n.x, m.y - n.y)
                    if (d < 100) {
                        ctx.strokeStyle = isDark
                            ? `rgba(94,234,212,${(1 - d / 100) * 0.4})`
                            : `rgba(8,145,178,${(1 - d / 100) * 0.35})`
                        ctx.lineWidth = 1
                        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
                    }
                })

                ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = isDark ? 'rgba(129,140,248,0.8)' : 'rgba(99,102,241,0.8)';
                ctx.fill();
            })

            animationFrameId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}
