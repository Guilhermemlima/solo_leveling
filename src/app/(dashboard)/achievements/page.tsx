'use client'
import { useEffect, useState } from 'react'
import { Trophy, Lock } from 'lucide-react'

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/achievements').then(r => r.json()).then(d => { setAchievements(d); setLoading(false) })
  }, [])

  const unlocked = achievements.filter(a => a.unlocked)
  const locked = achievements.filter(a => !a.unlocked)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Trophy className="text-amber-400" /> Conquistas</h1>
        <p className="text-slate-400 text-sm">{unlocked.length} / {achievements.length} desbloqueadas</p>
      </div>

      {/* Progress */}
      <div className="glass neon-border rounded-2xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-300 font-medium">Progresso Geral</span>
          <span className="text-amber-400">{achievements.length > 0 ? Math.round((unlocked.length / achievements.length) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700" style={{ width: `${achievements.length > 0 ? (unlocked.length / achievements.length) * 100 : 0}%` }} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {unlocked.length > 0 && (
            <div>
              <h2 className="font-semibold text-amber-400 mb-3">✅ Desbloqueadas</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlocked.map(a => (
                  <div key={a.id} className="glass rounded-2xl p-5 border border-amber-500/25 bg-amber-500/5">
                    <div className="text-3xl mb-3">{a.icon}</div>
                    <h3 className="font-semibold text-amber-300 mb-1">{a.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">{a.description}</p>
                    <p className="text-xs text-slate-500">🏆 {new Date(a.unlockedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {locked.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-500 mb-3">🔒 Bloqueadas</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locked.map(a => (
                  <div key={a.id} className="glass rounded-2xl p-5 border border-slate-700/30 opacity-60">
                    <div className="text-3xl mb-3 grayscale">{a.icon}</div>
                    <h3 className="font-semibold text-slate-500 mb-1">{a.name}</h3>
                    <p className="text-xs text-slate-600 mb-3">{a.description}</p>
                    <p className="text-xs text-slate-600 flex items-center gap-1"><Lock size={10} /> Bloqueada</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
