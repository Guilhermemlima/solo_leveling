import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center text-center px-4">
      <div>
        <div className="text-6xl mb-4">🌑</div>
        <h1 className="text-4xl font-black text-white mb-2">404</h1>
        <p className="text-slate-400 mb-8">Esta rota não existe no sistema, Ascendente.</p>
        <Link href="/dashboard"
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium transition-colors inline-block">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
