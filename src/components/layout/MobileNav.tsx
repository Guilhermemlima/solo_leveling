'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CheckSquare, Swords, Target, Gift,
  Package, ShoppingBag, Trophy, Clock, BarChart3, Settings,
  Menu, X, Medal, LogOut, Layers3, Wallet, Dumbbell,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const primaryItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { href: '/arena', icon: Swords, label: 'Arena' },
  { href: '/missions', icon: Target, label: 'Missões' },
]

const moreItems = [
  { href: '/finance', icon: Wallet, label: 'Finanças' },
  { href: '/fitness', icon: Dumbbell, label: 'Academia' },
  { href: '/routines', icon: Layers3, label: 'Rotinas' },
  { href: '/chests', icon: Gift, label: 'Caixas' },
  { href: '/inventory', icon: Package, label: 'Inventário' },
  { href: '/shop', icon: ShoppingBag, label: 'Loja' },
  { href: '/achievements', icon: Trophy, label: 'Conquistas' },
  { href: '/leaderboard', icon: Medal, label: 'Ranking' },
  { href: '/history', icon: Clock, label: 'Histórico' },
  { href: '/reports', icon: BarChart3, label: 'Relatórios' },
  { href: '/settings', icon: Settings, label: 'Config.' },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()

  const isMoreActive = moreItems.some(i => i.href === pathname)

  return (
    <>
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />
      )}

      {open && (
        <div className="lg:hidden fixed bottom-20 left-0 right-0 z-50 px-4">
          <div className="glass neon-border rounded-2xl p-4 grid grid-cols-4 gap-2">
            {moreItems.map(item => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 ${
                    active ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}>
                  <Icon size={20} />
                  <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                </Link>
              )
            })}
            <button onClick={() => { logout(); setOpen(false) }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
              <LogOut size={20} />
              <span className="text-[10px] font-medium">Sair</span>
            </button>
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a16]/95 backdrop-blur-md border-t border-indigo-500/15 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {primaryItems.map(item => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  active ? 'text-indigo-400' : 'text-slate-500'
                }`}>
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          <button onClick={() => setOpen(!open)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
              isMoreActive || open ? 'text-indigo-400' : 'text-slate-500'
            }`}>
            {open ? <X size={20} /> : <Menu size={20} />}
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        </div>
      </nav>
    </>
  )
}
