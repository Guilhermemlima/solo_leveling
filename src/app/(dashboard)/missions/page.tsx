'use client'
import { CoinIcon } from '@/components/ui/CoinIcon'
import { useEffect, useState, useCallback } from 'react'
import { Gift, CheckCircle, Clock, Calendar, Star, Zap, Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

type MissionTab = 'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL'

const TYPE_META: Record<string, { label: string; color: string; icon: React.ReactNode; accent: string }> = {
  DAILY:   { label: 'Diárias',   color: 'text-blue-400',   icon: <Zap size={14} />,      accent: '#3b82f6' },
  WEEKLY:  { label: 'Semanais',  color: 'text-purple-400', icon: <Calendar size={14} />,  accent: '#8b5cf6' },
  MONTHLY: { label: 'Mensais',   color: 'text-rose-400',   icon: <Star size={14} />,      accent: '#f43f5e' },
  SPECIAL: { label: 'Especiais', color: 'text-amber-400',  icon: <Target size={14} />,    accent: '#f59e0b' },
}

const CATEGORY_BADGES: Record<string, { label: string; color: string }> = {
  GERAL:   { label: 'Geral',    color: '#6b7280' },
  TREINO:  { label: 'Treino',   color: '#22c55e' },
  ESTUDO:  { label: 'Estudo',   color: '#3b82f6' },
  MARCO:   { label: 'Marco',    color: '#f59e0b' },
  'NÍVEL': { label: 'Nível',    color: '#8b5cf6' },
}

function formatCountdown(targetDate: string | Date): string {
  const now = new Date()
  const target = new Date(targetDate)
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return 'Resetando...'
  const diffSecs = Math.floor(diffMs / 1000)
  const hours = Math.floor(diffSecs / 3600)
  const mins = Math.floor((diffSecs % 3600) / 60)
  const secs = diffSecs % 60
  if (hours >= 48) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  if (hours >= 1) return `${hours}h ${mins}m`
  if (mins >= 2) return `${mins}m`
  return `${mins}m ${secs}s`
}

function Countdown({ nextReset, type }: { nextReset: string; type: string }) {
  const [label, setLabel] = useState(() => formatCountdown(nextReset))

  useEffect(() => {
    if (type === 'SPECIAL') return
    const id = setInterval(() => setLabel(formatCountdown(nextReset)), 10_000)
    return () => clearInterval(id)
  }, [nextReset, type])

  if (type === 'SPECIAL') return null

  return (
    <span className="flex items-center gap-1 text-[10px] text-slate-500">
      <Clock size={10} />
      reset em {label}
    </span>
  )
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [tab, setTab] = useState<MissionTab>('ALL')
  const { toast } = useToast()
  const { refreshUser } = useAuth()

  const fetchMissions = useCallback(async () => {
    const res = await fetch('/api/missions')
    if (res.ok) setMissions(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchMissions() }, [fetchMissions])

  const claimMission = async (userMissionId: string) => {
    setClaiming(userMissionId)
    try {
      const res = await fetch(`/api/missions/${userMissionId}/claim`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast(data.error, 'error'); return }
      toast(`+${data.xpGained} XP e +${data.essencesGained} Moedas recebidos!`, 'success')
      await Promise.all([fetchMissions(), refreshUser()])
    } catch { toast('Erro ao resgatar missão', 'error') }
    finally { setClaiming(null) }
  }

  const filtered = missions.filter(m => tab === 'ALL' || m.mission.type === tab)
  const groups = (['DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL'] as const).map(type => ({
    type,
    list: filtered.filter(m => m.mission.type === type),
  })).filter(g => g.list.length > 0)

  const tabs: MissionTab[] = ['ALL', 'DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL']
  const tabLabel = (t: MissionTab) => t === 'ALL' ? 'Todas' : TYPE_META[t].label

  // Counts for badge chips
  const readyCounts: Partial<Record<MissionTab, number>> = {}
  for (const type of ['DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL'] as const) {
    const n = missions.filter(m => m.mission.type === type && m.status === 'COMPLETED').length
    if (n > 0) readyCounts[type] = n
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Missões</h1>
        <p className="text-slate-400 text-sm">Complete missões para ganhar XP e Moedas extras</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => {
          const ready = t !== 'ALL' ? (readyCounts[t] ?? 0) : Object.values(readyCounts).reduce((a, b) => a + b, 0)
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${tab === t
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700/60'}`}
            >
              {tabLabel(t)}
              {ready > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {ready}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-slate-700/30">
          <p className="text-slate-400">Nenhuma missão nesta categoria ainda.</p>
          <p className="text-slate-500 text-sm mt-1">Continue usando o app para desbloquear mais missões!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ type, list }) => {
            const meta = TYPE_META[type]
            return (
              <div key={type}>
                <h2 className={`font-semibold mb-3 flex items-center gap-2 ${meta.color}`}>
                  {meta.icon}
                  {`Missões ${meta.label}`}
                  <span className="text-xs text-slate-600 font-normal">({list.length})</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {list.map((um: any) => {
                    const pct = Math.min((um.progress / um.mission.requirementValue) * 100, 100)
                    const isClaimed = um.status === 'CLAIMED'
                    const isCompleted = um.status === 'COMPLETED'
                    const cat = um.mission.category ? CATEGORY_BADGES[um.mission.category] : null

                    return (
                      <div
                        key={um.id}
                        className={`glass rounded-2xl p-5 border transition-all duration-200 ${
                          isClaimed ? 'opacity-50 border-slate-700/20'
                          : isCompleted ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-slate-700/40 hover:border-indigo-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-slate-200 text-sm leading-snug">{um.mission.title}</h3>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isClaimed && <CheckCircle size={15} className="text-emerald-400" />}
                            {isCompleted && !isClaimed && <Gift size={15} className="text-amber-400 float-anim" />}
                          </div>
                        </div>

                        {/* Category badge + countdown */}
                        <div className="flex items-center gap-2 mb-2">
                          {cat && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ color: cat.color, background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
                              {cat.label}
                            </span>
                          )}
                          {um.nextReset && <Countdown nextReset={um.nextReset} type={um.mission.type} />}
                        </div>

                        <p className="text-xs text-slate-500 mb-3">{um.mission.description}</p>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Progresso</span>
                            <span>{um.progress}/{um.mission.requirementValue}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isClaimed ? 'bg-slate-600' : ''}`}
                              style={{
                                width: `${pct}%`,
                                background: isClaimed ? undefined : `linear-gradient(90deg, ${meta.accent}aa, ${meta.accent})`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 text-xs">
                            <span className="text-indigo-400">+{um.mission.xpReward} XP</span>
                            <span className="text-amber-400">+{um.mission.essenceReward} <CoinIcon /></span>
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
