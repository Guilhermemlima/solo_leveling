'use client'
import { useEffect, useState } from 'react'
import { Gift, CheckCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'SPECIAL'>('ALL')
  const { toast } = useToast()
  const { refreshUser } = useAuth()

  const fetchMissions = async () => {
    const res = await fetch('/api/missions')
    if (res.ok) setMissions(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchMissions() }, [])

  const claimMission = async (userMissionId: string) => {
    setClaiming(userMissionId)
    try {
      const res = await fetch(`/api/missions/${userMissionId}/claim`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast(data.error, 'error'); return }
      toast(`+${data.xpGained} XP e +${data.essencesGained} Essências recebidos!`, 'success')
      await Promise.all([fetchMissions(), refreshUser()])
    } catch { toast('Erro ao resgatar missão', 'error') }
    finally { setClaiming(null) }
  }

  const filtered = missions.filter(m => filter === 'ALL' || m.mission.type === filter)
  const byType = { DAILY: filtered.filter(m => m.mission.type === 'DAILY'), WEEKLY: filtered.filter(m => m.mission.type === 'WEEKLY'), SPECIAL: filtered.filter(m => m.mission.type === 'SPECIAL') }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Missões</h1>
        <p className="text-slate-400 text-sm">Complete missões para ganhar XP e Essências extras</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'DAILY', 'WEEKLY', 'SPECIAL'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${filter === f ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700/60'}`}
          >
            {f === 'ALL' ? 'Todas' : f === 'DAILY' ? 'Diárias' : f === 'WEEKLY' ? 'Semanais' : 'Especiais'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byType).map(([type, list]) => {
            if (filter !== 'ALL' && type !== filter) return null
            if (list.length === 0) return null
            const typeLabel = type === 'DAILY' ? 'Missões Diárias' : type === 'WEEKLY' ? 'Missões Semanais' : 'Missões Especiais'
            const typeColors: Record<string, string> = { DAILY: 'text-blue-400', WEEKLY: 'text-purple-400', SPECIAL: 'text-amber-400' }
            return (
              <div key={type}>
                <h2 className={`font-semibold mb-3 ${typeColors[type]}`}>{typeLabel}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {list.map((um: any) => {
                    const pct = Math.min((um.progress / um.mission.requirementValue) * 100, 100)
                    const isClaimed = um.status === 'CLAIMED'
                    const isCompleted = um.status === 'COMPLETED'
                    return (
                      <div key={um.id} className={`glass rounded-2xl p-5 border transition-all duration-200 ${isClaimed ? 'opacity-50 border-slate-700/20' : isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700/40 hover:border-indigo-500/30'}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-slate-200 text-sm">{um.mission.title}</h3>
                          {isClaimed && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
                          {isCompleted && !isClaimed && <Gift size={16} className="text-amber-400 shrink-0 float-anim" />}
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{um.mission.description}</p>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Progresso</span>
                            <span>{um.progress}/{um.mission.requirementValue}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${isClaimed ? 'bg-slate-600' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 text-xs">
                            <span className="text-indigo-400">+{um.mission.xpReward} XP</span>
                            <span className="text-amber-400">+{um.mission.essenceReward} 💎</span>
                          </div>
                          {isCompleted && !isClaimed && (
                            <Button size="sm" variant="gold" loading={claiming === um.id} onClick={() => claimMission(um.id)}>
                              <Gift size={13} /> Resgatar
                            </Button>
                          )}
                          {isClaimed && <span className="text-xs text-slate-500">Resgatado</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
