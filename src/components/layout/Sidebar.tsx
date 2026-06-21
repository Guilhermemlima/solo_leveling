'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  LayoutDashboard, CheckSquare, Target, User, Package, ShoppingBag,
  Trophy, Clock, BarChart3, Settings, LogOut, ChevronRight, Swords, Medal,
  Layers3, BrainCircuit, Users, MessageCircle, Gift, Hammer
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { gsap, EASE_OUT_EXPO } from '@/lib/gsap-init'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { href: '/routines', icon: Layers3, label: 'Rotinas' },
  { href: '/missions', icon: Target, label: 'Missões' },
  { href: '/arena', icon: Swords, label: 'Arena' },
  { href: '/leaderboard', icon: Medal, label: 'Ranking' },
  { href: '/progression', icon: BrainCircuit, label: 'Progressão' },
  { href: '/community', icon: Users, label: 'Comunidade' },
  { href: '/profile', icon: User, label: 'Perfil' },
  { href: '/chests', icon: Gift, label: 'Caixas' },
  { href: '/inventory', icon: Package, label: 'Inventário' },
  { href: '/forge', icon: Hammer, label: 'Forja' },
  { href: '/shop', icon: ShoppingBag, label: 'Loja' },
  { href: '/achievements', icon: Trophy, label: 'Conquistas' },
  { href: '/history', icon: Clock, label: 'Histórico' },
  { href: '/reports', icon: BarChart3, label: 'Relatórios' },
  { href: '/support', icon: MessageCircle, label: 'Suporte' },
  { href: '/settings', icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const sidebarRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)

  // Entrance animation on mount
  useEffect(() => {
    if (!sidebarRef.current) return
    gsap.fromTo(
      sidebarRef.current,
      { x: -80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.05 }
    )
  }, [])

  // Stagger nav items on mount
  useEffect(() => {
    if (!navRef.current) return
    const items = navRef.current.querySelectorAll('a')
    gsap.fromTo(
      items,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.025, ease: EASE_OUT_EXPO, delay: 0.3 }
    )
  }, [])

  return (
    <aside ref={sidebarRef} className="hidden lg:flex flex-col w-64 min-h-screen bg-[#0a0a16] border-r border-indigo-500/10 fixed left-0 top-0 bottom-0 z-30" style={{ opacity: 0 }}>
      {/* Logo */}
      <div className="p-4 border-b border-indigo-500/10">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Ascend System" width={40} height={40} className="rounded-lg" priority />
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide">ASCEND</h1>
            <p className="text-xs text-purple-400 tracking-[0.2em]">SYSTEM</p>
          </div>
        </div>
      </div>

      {/* User mini */}
      {user && (
        <div className="p-4 border-b border-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center text-lg">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-indigo-400">Nível {user.level}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav ref={navRef} className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group ${
                active
                  ? 'text-indigo-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/4'
              }`}
              style={active ? { background: 'linear-gradient(90deg,rgba(139,92,246,0.14),rgba(99,102,241,0.06))' } : undefined}
              onMouseEnter={e => {
                if (!active) gsap.to(e.currentTarget, { x: 3, duration: 0.18, ease: 'power2.out' })
              }}
              onMouseLeave={e => {
                if (!active) gsap.to(e.currentTarget, { x: 0, duration: 0.2, ease: 'power2.out' })
              }}
            >
              {/* Active left bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-indigo-400" style={{ boxShadow: '0 0 8px #a855f7' }} />
              )}
              <Icon size={17} className={active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
              {item.label}
              {active && (
                <>
                  <ChevronRight size={14} className="ml-auto text-indigo-400/70" />
                  {/* Pulsing dot */}
                  <span className="relative ml-0 flex h-1.5 w-1.5 shrink-0">
                    <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  </span>
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-indigo-500/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-200"
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </aside>
  )
}
