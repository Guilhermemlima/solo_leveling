'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CheckSquare, Target, User, Package, ShoppingBag,
  Trophy, Clock, BarChart3, Settings, LogOut, Zap, ChevronRight, Swords, Medal,
  Layers3, BrainCircuit, Users, MessageCircle, Gift, Skull, Hammer
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { href: '/routines', icon: Layers3, label: 'Rotinas' },
  { href: '/missions', icon: Target, label: 'Missões' },
  { href: '/arena', icon: Swords, label: 'Arena' },
  { href: '/bestiary', icon: Skull, label: 'Bestiário' },
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

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#0a0a16] border-r border-indigo-500/10 fixed left-0 top-0 bottom-0 z-30">
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={17} className={active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
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
