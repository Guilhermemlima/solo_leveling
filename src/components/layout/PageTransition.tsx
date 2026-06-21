'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, EASE_OUT_EXPO } from '@/lib/gsap-init'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Kill any running tweens on the container children
    gsap.killTweensOf(el.querySelectorAll('[data-gsap]'))

    // Prefer explicit [data-gsap] targets, fall back to .glass cards
    const explicit = el.querySelectorAll('[data-gsap]')
    const targets = explicit.length > 0 ? explicit : el.querySelectorAll('.glass, section, h1, h2')

    if (targets.length) {
      gsap.fromTo(
        targets,
        { y: 28, opacity: 0, filter: 'blur(4px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.52,
          stagger: 0.055,
          ease: EASE_OUT_EXPO,
          clearProps: 'transform,filter',
        }
      )
    } else {
      gsap.fromTo(
        el,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: EASE_OUT_EXPO, clearProps: 'transform,opacity' }
      )
    }
  }, [pathname])

  return (
    <div ref={ref} className="relative" style={{ zIndex: 1 }}>
      {children}
    </div>
  )
}
