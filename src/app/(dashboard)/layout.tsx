'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { MusicPlayer } from '@/components/game/MusicPlayer'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    else if (!loading && user && !user.onboardingCompleted && pathname !== '/onboarding') {
      router.push('/onboarding')
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Carregando Chi Navy System...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (!user.onboardingCompleted && pathname === '/onboarding') {
    return <main className="min-h-screen bg-grid">{children}</main>
  }

  return (
    <div className="flex min-h-screen bg-grid">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
      <MobileNav />
      <MusicPlayer />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <DashboardGuard>{children}</DashboardGuard>
      </ToastProvider>
    </AuthProvider>
  )
}
