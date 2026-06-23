'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getRank } from '@/lib/ranks'
import { xpForLevel } from '@/lib/game-logic'
import { gsap, EASE_OUT_EXPO } from '@/lib/gsap-init'

const RANK_COLORS: Record<string, string> = {
  E: '#9ca3af', D: '#22c55e', C: '#3b82f6', B: '#8b5cf6',
  A: '#f59e0b', S: '#ef4444', SS: '#ec4899', SSS: '#fbbf24',
}

function useCountUp(target: number, ref: React.RefObject<HTMLSpanElement | null>) {
  const prev = useRef(0)
  useEffect(() => {
    if (!ref.current) return
    const obj = { val: prev.current }
    gsap.to(obj, {
      val: target,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate() {
        if (ref.current) ref.current.textContent = Math.round(obj.val).toLocaleString('pt-BR')
      },
    })
    prev.current = target
  }, [target, ref])
}

export function ResourceBar() {
  const { user } = useAuth()
  const barRef = useRef<HTMLDivElement>(null)
  const essencesRef = useRef<HTMLSpanElement>(null)
  const fragmentsRef = useRef<HTMLSpanElement>(null)
  const xpRef = useRef<HTMLSpanElement>(null)
  const xpBarRef = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)

  const rank = getRank(user?.arenaPoints ?? 0)
  const rankColor = RANK_COLORS[rank.tier] ?? '#9ca3af'
  const xpNeeded = xpForLevel(user?.level ?? 1)
  const xpPct = user ? Math.min((user.currentXp / xpNeeded) * 100, 100) : 0

  // CountUp for essences, fragments and XP
  useCountUp(user?.essences ?? 0, essencesRef)
  useCountUp(user?.fragments ?? 0, fragmentsRef)
  useCountUp(user?.currentXp ?? 0, xpRef)

  // Entrance animation (once)
  useEffect(() => {
    if (!barRef.current || mounted.current) return
    mounted.current = true
    gsap.fromTo(
      barRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.1 }
    )
  }, [])

  // XP bar fill animation
  useEffect(() => {
    if (!xpBarRef.current) return
    gsap.to(xpBarRef.current, {
      width: `${xpPct}%`,
      duration: 1.4,
      ease: 'power3.out',
      delay: 0.3,
    })
  }, [xpPct])

  if (!user) return null

  return (
    <div
      ref={barRef}
      className="sticky top-0 z-20 w-full border-b border-purple-500/15"
      style={{ background: 'rgba(5,8,22,0.88)', backdropFilter: 'blur(16px)' }}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanline-overlay" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 lg:px-8 h-14 flex items-center gap-2 lg:gap-3 relative">

        {/* Moedas */}
        <Link
          href="/shop"
          className="resource-chip group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/8 hover:bg-amber-500/18 transition-colors shrink-0"
          onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.06, duration: 0.2, ease: 'power2.out' })}
          onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.25, ease: 'power2.out' })}
        >
          <img src="/assets/items/moeda.png" alt="Moedas" className="w-5 h-5 object-contain select-none shrink-0" />
          <div>
            <p className="text-[9px] text-amber-500/60 leading-none mb-0.5 uppercase tracking-wider">Moedas</p>
            <p className="text-sm font-black text-amber-400 leading-none tabular-nums">
              <span ref={essencesRef}>{(user.essences ?? 0).toLocaleString('pt-BR')}</span>
            </p>
          </div>
        </Link>

        {/* Level + XP bar */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="shrink-0 text-center w-10">
            <p className="text-[9px] text-purple-400/60 leading-none uppercase tracking-wider mb-0.5">LVL</p>
            <p className="text-sm font-black text-purple-300 leading-none">{user.level}</p>
          </div>
          <div className="flex-1 min-w-0">
            <div className="hidden sm:flex justify-between text-[9px] mb-0.5 leading-none">
              <span className="text-purple-400/60 tabular-nums">
                <span ref={xpRef}>{user.currentXp}</span> XP
              </span>
              <span className="text-slate-600">{xpNeeded} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden relative">
              {/* glow track */}
              <div
                ref={xpBarRef}
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: '0%',
                  background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#c084fc)',
                  boxShadow: '0 0 8px rgba(139,92,246,0.8)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div
          className={`hidden min-[400px]:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shrink-0 ${
            user.currentStreak > 0
              ? 'border-orange-500/25 bg-orange-500/8'
              : 'border-slate-700/40 bg-slate-800/20'
          }`}
        >
          <span className="text-base leading-none select-none">{user.currentStreak > 0 ? '🔥' : '💤'}</span>
          <div>
            <p className="text-[9px] text-orange-400/60 leading-none uppercase tracking-wider mb-0.5">Streak</p>
            <p className={`text-sm font-black leading-none ${user.currentStreak > 0 ? 'text-orange-400' : 'text-slate-600'}`}>
              {user.currentStreak}d
            </p>
          </div>
        </div>

        {/* Rank */}
        <Link
          href="/leaderboard"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shrink-0 transition-colors hover:opacity-80"
          style={{ borderColor: `${rankColor}30`, background: `${rankColor}0a` }}
          onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.06, duration: 0.2, ease: 'power2.out' })}
          onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.25, ease: 'power2.out' })}
        >
          <span className="text-base leading-none select-none">🏅</span>
          <div>
            <p className="text-[9px] leading-none uppercase tracking-wider mb-0.5" style={{ color: `${rankColor}80` }}>Patente</p>
            <p className="text-sm font-black leading-none" style={{ color: rankColor }}>{rank.tier}</p>
          </div>
        </Link>

        {/* Fragmentos de Forja */}
        <Link
          href="/forge"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-violet-500/20 bg-violet-500/8 hover:bg-violet-500/15 transition-colors shrink-0"
          onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.06, duration: 0.2, ease: 'power2.out' })}
          onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.25, ease: 'power2.out' })}
        >
          <span className="text-base leading-none select-none">⚗️</span>
          <div>
            <p className="text-[9px] text-violet-400/60 leading-none uppercase tracking-wider mb-0.5">Fragmentos</p>
            <p className="text-sm font-black text-violet-300 leading-none tabular-nums">
              <span ref={fragmentsRef}>{(user?.fragments ?? 0).toLocaleString('pt-BR')}</span>
            </p>
          </div>
        </Link>

      </div>
    </div>
  )
}
