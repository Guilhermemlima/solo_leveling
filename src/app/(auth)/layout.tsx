import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-grid flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-purple-950/20 pointer-events-none" />
          {children}
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}
