'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Swords, Gift, Target, User } from 'lucide-react'

const mobileItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { href: '/chests', icon: Gift, label: 'Caixas' },
  { href: '/arena', icon: Swords, label: 'Arena' },
  { href: '/missions', icon: Target, label: 'Missões' },
  { href: '/profile', icon: User, label: 'Perfil' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a16]/95 backdrop-blur-md border-t border-indigo-500/15 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-200 ${
                active ? 'text-indigo-400' : 'text-slate-500'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && <div className="absolute bottom-0 w-1 h-1 rounded-full bg-indigo-400" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
