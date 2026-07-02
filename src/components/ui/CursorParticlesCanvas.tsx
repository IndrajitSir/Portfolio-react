import { useRef, useEffect } from 'react'

export default function CursorParticlesCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Create a persistent state for mouse to track it without triggering re-renders
    const mousePos = useRef({ x: -1000, y: -1000 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY }
        }
        // We listen to the window to get screen-space, or we can listen to the canvas
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        const particles: { x: number, y: number, vx: number, vy: number, s: number }[] = []
        const PARTICLE_COUNT = 150

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        window.addEventListener('resize', resize)
        resize()

        // Initialize
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                s: Math.random() * 1.5 + 0.5
            })
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
            ctx.fillStyle = isDark ? 'rgba(94, 234, 212, 0.4)' : 'rgba(8, 145, 178, 0.4)'

            particles.forEach(p => {
                // Base movement
                p.x += p.vx
                p.y += p.vy

                // Attraction to mouse
                const mx = mousePos.current.x
                const my = mousePos.current.y
                const dx = mx - p.x
                const dy = my - p.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < 300) {
                    const force = (300 - dist) / 300
                    p.vx += (dx / dist) * force * 0.05
                    p.vy += (dy / dist) * force * 0.05
                }

                // Friction / speed limit
                p.vx *= 0.99
                p.vy *= 0.99

                // Screen wrap or bounce
                if (p.x < 0) p.x = canvas.width
                if (p.x > canvas.width) p.x = 0
                if (p.y < 0) p.y = canvas.height
                if (p.y > canvas.height) p.y = 0

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
                ctx.fill()
            })

            animationFrameId = requestAnimationFrame(draw)
        }

        draw()
        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    )
}
