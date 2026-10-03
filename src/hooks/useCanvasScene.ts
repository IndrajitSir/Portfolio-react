import { useEffect, useRef } from 'react'
import { canvasPalette, type ScenePalette } from '@/utils/canvas'

export interface SceneFrame {
  ctx: CanvasRenderingContext2D
  W: number
  H: number
  /** Seconds since page load (monotonic, suitable for `%` cycles). */
  t: number
  pal: ScenePalette
}

/**
 * Drives a requestAnimationFrame canvas scene with the portfolio's shared
 * conventions:
 *  - DPR-aware sizing (capped at 2×) with zero layout thrash,
 *  - pauses when scrolled out of view or when the tab is hidden,
 *  - honours `prefers-reduced-motion` by painting a single static frame,
 *  - reads the current theme class each frame so it follows the theme toggle.
 *
 * The `draw` callback is kept in a ref, so passing an inline closure does not
 * re-subscribe the loop on every render.
 */
export function useCanvasScene(draw: (frame: SceneFrame) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = false
    let inView = false

    const render = () => {
      const W = canvas.offsetWidth || 300
      const H = canvas.offsetHeight || 150
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const tw = Math.round(W * dpr)
      const th = Math.round(H * dpr)
      if (canvas.width !== tw || canvas.height !== th) {
        canvas.width = tw
        canvas.height = th
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const isLight = document.documentElement.classList.contains('light')
      drawRef.current({ ctx, W, H, t: performance.now() / 1000, pal: canvasPalette(isLight) })
    }

    const loop = () => {
      render()
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (running || document.hidden) return
      running = true
      loop()
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      // Static frame only — but still repaint on interaction so the playable
      // previews keep responding to clicks for reduced-motion visitors.
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) render()
          })
        },
        { rootMargin: '120px' },
      )
      io.observe(canvas)
      const onInteract = () => render()
      canvas.addEventListener('pointerdown', onInteract)
      canvas.addEventListener('pointermove', onInteract)
      window.addEventListener('resize', onInteract)
      render()
      return () => {
        io.disconnect()
        canvas.removeEventListener('pointerdown', onInteract)
        canvas.removeEventListener('pointermove', onInteract)
        window.removeEventListener('resize', onInteract)
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting
          if (inView) start()
          else stop()
        })
      },
      { rootMargin: '120px' },
    )
    io.observe(canvas)

    const onVisibility = () => {
      if (document.hidden) stop()
      else if (inView) start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [])

  return canvasRef
}
