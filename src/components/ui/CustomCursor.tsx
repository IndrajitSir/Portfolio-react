import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    let raf: number
    let ringX = 0, ringY = 0
    let dotX  = 0, dotY  = 0
    let mouseX = 0, mouseY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      dotX  += (mouseX - dotX)  * 0.9
      dotY  += (mouseY - dotY)  * 0.9
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12

      if (dotRef.current) {
        dotRef.current.style.left = `${dotX}px`
        dotRef.current.style.top  = `${dotY}px`
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`
        ringRef.current.style.top  = `${ringY}px`
      }
      raf = requestAnimationFrame(animate)
    }

    const onMouseEnterInteractive = () => setHovering(true)
    const onMouseLeaveInteractive = () => setHovering(false)

    const interactables = document.querySelectorAll(
      'a, button, [data-cursor-hover]',
    )
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', onMouseEnterInteractive)
      el.addEventListener('mouseleave', onMouseLeaveInteractive)
    })

    document.addEventListener('mousemove', onMouseMove)
    raf = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(raf)
      interactables.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnterInteractive)
        el.removeEventListener('mouseleave', onMouseLeaveInteractive)
      })
    }
  }, [])

  // Hide cursor on touch-only devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="cursor-dot"
        style={{
          width: hovering ? 20 : 10,
          height: hovering ? 20 : 10,
          borderRadius: '50%',
          background: 'var(--accent-teal)',
          opacity: hovering ? 0.5 : 1,
          transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="cursor-ring"
        style={{
          width: hovering ? 56 : 36,
          height: hovering ? 56 : 36,
          border: '1.5px solid var(--accent-teal)',
          opacity: hovering ? 0.3 : 0.5,
          transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease',
        }}
      />
    </>
  )
}
