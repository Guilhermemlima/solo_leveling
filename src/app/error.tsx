'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center text-center px-4">
      <div>
        <div className="text-6xl mb-4">💀</div>
        <h2 className="text-xl font-bold text-white mb-2">Algo deu errado</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-sm">
          {error.message || 'Erro inesperado no sistema. Tente novamente.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium transition-colors">
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
