'use client'
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  TASK_COMPLETED: { icon: '✅', color: 'text-emerald-400' },
  MISSION_CLAIMED: { icon: '🎯', color: 'text-purple-400' },
  ITEM_PURCHASED: { icon: '🛍️', color: 'text-blue-400' },
  LEVEL_UP: { icon: '⚡', color: 'text-amber-400' },
  BATTLE: { icon: '⚔️', color: 'text-red-400' },
  RANK_UP: { icon: '🎖️', color: 'text-pink-400' },
  STREAK_LOST: { icon: '💔', color: 'text-slate-400' },
}

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/history').then(r => r.json()).then(d => { setHistory(d); setLoading(false) })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Clock className="text-slate-400" /> Histórico de Evolução</h1>
        <p className="text-slate-400 text-sm">Sua linha do tempo de atividades</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : history.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-slate-700/30">
          <div className="text-5xl mb-4">📜</div>
          <p className="text-slate-400">Nenhuma atividade registrada ainda.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-transparent" />
          <div className="space-y-4 pl-12">
            {history.map((item: any) => {
              const config = TYPE_CONFIG[item.type] || { icon: '⚡', color: 'text-slate-400' }
              return (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[2.65rem] w-9 h-9 rounded-xl bg-[#0f0f1e] border border-indigo-500/30 flex items-center justify-center text-sm">
                    {config.icon}
                  </div>
                  <div className="glass rounded-xl p-4 border border-slate-700/40 hover:border-indigo-500/30 transition-all duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm font-medium ${config.color}`}>{item.description}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(item.createdAt).toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {item.xpChange > 0 && <p className="text-xs text-indigo-400">+{item.xpChange} XP</p>}
                        {item.essenceChange > 0 && <p className="text-xs text-amber-400">+{item.essenceChange} 💎</p>}
                        {item.essenceChange < 0 && <p className="text-xs text-red-400">{item.essenceChange} 💎</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
