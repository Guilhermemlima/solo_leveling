'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap-init'

interface Particle {
  el: HTMLDivElement
  x: number
  y: number
  size: number
  color: string
}

const COLORS = [
  'rgba(168,85,247,0.6)',
  'rgba(99,102,241,0.5)',
  'rgba(34,211,238,0.4)',
  'rgba(236,72,153,0.35)',
  'rgba(245,197,66,0.3)',
]

export function AmbientParticles() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const COUNT = 28
    const particles: Particle[] = []

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('div')
      const size = Math.random() * 3 + 1
      const x = Math.random() * 100
      const y = Math.random() * 100
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      el.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:${color};
        left:${x}%;top:${y}%;
        pointer-events:none;
        box-shadow:0 0 ${size * 3}px ${color};
        will-change:transform,opacity;
      `
      container.appendChild(el)
      particles.push({ el, x, y, size, color })
    }

    particles.forEach((p, i) => {
      const dur = 6 + Math.random() * 10
      const dx = (Math.random() - 0.5) * 8
      const dy = -(Math.random() * 12 + 4)

      gsap.to(p.el, {
        x: `${dx}vw`,
        y: `${dy}vh`,
        opacity: 0,
        duration: dur,
        delay: Math.random() * dur,
        ease: 'none',
        repeat: -1,
        repeatRefresh: true,
        onRepeat() {
          gsap.set(p.el, { x: 0, y: 0, opacity: Math.random() * 0.7 + 0.3 })
        },
      })

      // gentle pulse
      gsap.to(p.el, {
        scale: 1.8,
        opacity: 0.1,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    })

    return () => {
      particles.forEach(p => {
        gsap.killTweensOf(p.el)
        p.el.remove()
      })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
