'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Flame, Coins, Zap, TrendingUp, CheckCircle, Clock, Target } from 'lucide-react'
import { XPBar } from '@/components/game/XPBar'
import { RewardModal } from '@/components/game/RewardModal'
import { RankBadge } from '@/components/game/RankBadge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { CATEGORY_ICONS, CATEGORY_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/game-logic'

interface DashboardData {
  user: any
  todayTasks: any[]
  activeMissions: any[]
  recentActivity: any[]
  weeklyCompleted: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reward, setReward] = useState<any>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const { refreshUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const fetchDashboard = async () => {
    const res = await fetch('/api/dashboard')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchDashboard() }, [])

  const completeTask = async (taskId: string) => {
    setCompleting(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' })
      const result = await res.json()
      if (!res.ok) { toast(result.error, 'error'); return }
      setReward(result)
      await Promise.all([fetchDashboard(), refreshUser()])
    } catch {
      toast('Erro ao concluir tarefa', 'error')
    } finally {
      setCompleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const u = data?.user

  return (
    <>
      <RewardModal reward={reward} onClose={() => setReward(null)} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                Bem-vindo, <span className="text-indigo-400">{u?.name?.split(' ')[0]}</span>
              </h1>
              {u && <RankBadge points={u.arenaPoints || 0} size="sm" />}
            </div>
            <p className="text-slate-400 text-sm mt-0.5">
              {u?.selectedClass ? `${u.selectedClass.icon} ${u.selectedClass.name}` : 'Escolha sua classe no perfil'}
            </p>
          </div>
          <Button onClick={() => router.push('/tasks?new=1')} variant="primary">
            <Plus size={16} /> Nova Tarefa
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Zap size={20} className="text-indigo-400" />} label="Nível" value={u?.level} color="indigo" />
          <StatCard icon={<Flame size={20} className="text-orange-400" />} label="Streak" value={`${u?.currentStreak} dias`} color="orange" />
          <StatCard icon={<Coins size={20} className="text-amber-400" />} label="Essências" value={u?.essences?.toLocaleString()} color="amber" />
          <StatCard icon={<TrendingUp size={20} className="text-emerald-400" />} label="XP Total" value={u?.totalXp?.toLocaleString()} color="emerald" />
        </div>

        {/* XP Bar */}
        <div className="glass neon-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-300">Progresso para o Nível {(u?.level || 0) + 1}</span>
            <span className="text-xs text-indigo-400">{data?.weeklyCompleted || 0} tarefas esta semana</span>
          </div>
          <XPBar currentXp={u?.currentXp || 0} xpForNextLevel={u?.xpForNextLevel || 100} level={u?.level || 1} />
        </div>

        {/* Today Tasks + Active Missions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                <CheckCircle size={18} className="text-indigo-400" /> Tarefas de Hoje
              </h2>
              <button onClick={() => router.push('/tasks')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Ver todas →
              </button>
            </div>

            {data?.todayTasks?.length === 0 ? (
              <EmptyState icon="📋" text="Nenhuma tarefa para hoje. Crie uma!" action={{ label: 'Criar tarefa', onClick: () => router.push('/tasks?new=1') }} />
            ) : (
              <div className="space-y-2">
                {data?.todayTasks?.slice(0, 5).map(task => (
                  <div key={task.id} className={`glass rounded-xl p-4 border transition-all duration-200 ${task.status === 'COMPLETED' ? 'opacity-50 border-emerald-500/20' : 'border-slate-700/40 hover:border-indigo-500/30'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{CATEGORY_ICONS[task.category as keyof typeof CATEGORY_ICONS]}</span>
                          <span className="text-sm font-medium text-slate-200 truncate">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: DIFFICULTY_COLORS[task.difficulty as keyof typeof DIFFICULTY_COLORS], borderColor: `${DIFFICULTY_COLORS[task.difficulty as keyof typeof DIFFICULTY_COLORS]}30` }}>
                            {DIFFICULTY_LABELS[task.difficulty as keyof typeof DIFFICULTY_LABELS]}
                          </span>
                          <span className="text-xs text-indigo-400">+{task.xpReward} XP</span>
                          <span className="text-xs text-amber-400">+{task.essenceReward} 💎</span>
                        </div>
                      </div>
                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => completeTask(task.id)}
                          disabled={completing === task.id}
                          className="shrink-0 w-7 h-7 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/60 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50"
                        >
                          {completing === task.id ? (
                            <div className="w-3.5 h-3.5 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle size={14} className="text-indigo-400" />
                          )}
                        </button>
                      )}
                      {task.status === 'COMPLETED' && (
                        <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                <Target size={18} className="text-purple-400" /> Missões Ativas
              </h2>
              <button onClick={() => router.push('/missions')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Ver todas →
              </button>
            </div>

            {data?.activeMissions?.length === 0 ? (
              <EmptyState icon="🎯" text="Nenhuma missão ativa." />
            ) : (
              <div className="space-y-2">
                {data?.activeMissions?.slice(0, 4).map((um: any) => {
                  const pct = Math.min((um.progress / um.mission.requirementValue) * 100, 100)
                  return (
                    <div key={um.id} className="glass rounded-xl p-4 border border-slate-700/40 hover:border-purple-500/30 transition-all duration-200">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-slate-200">{um.mission.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${um.mission.type === 'DAILY' ? 'bg-blue-500/15 text-blue-400' : um.mission.type === 'WEEKLY' ? 'bg-purple-500/15 text-purple-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          {um.mission.type === 'DAILY' ? 'Diária' : um.mission.type === 'WEEKLY' ? 'Semanal' : 'Especial'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{um.mission.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">{um.progress}/{um.mission.requirementValue}</span>
                      </div>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-xs text-indigo-400">+{um.mission.xpReward} XP</span>
                        <span className="text-xs text-amber-400">+{um.mission.essenceReward} 💎</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {data?.recentActivity && data.recentActivity.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <Clock size={18} className="text-slate-400" /> Atividade Recente
            </h2>
            <div className="glass neon-border rounded-2xl divide-y divide-slate-800/60">
              {data.recentActivity.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">
                    {activity.type === 'TASK_COMPLETED' ? '✅' : activity.type === 'MISSION_CLAIMED' ? '🎯' : activity.type === 'ITEM_PURCHASED' ? '🛍️' : '⚡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{activity.description}</p>
                    <p className="text-xs text-slate-500">{new Date(activity.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {activity.xpChange !== 0 && <p className="text-xs text-indigo-400">+{activity.xpChange} XP</p>}
                    {activity.essenceChange > 0 && <p className="text-xs text-amber-400">+{activity.essenceChange} 💎</p>}
                    {activity.essenceChange < 0 && <p className="text-xs text-red-400">{activity.essenceChange} 💎</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: any; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'border-indigo-500/20 bg-indigo-500/5',
    orange: 'border-orange-500/20 bg-orange-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
  }
  return (
    <div className={`glass rounded-2xl p-4 border ${colors[color]} transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-slate-500 font-medium">{label}</span></div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
    </div>
  )
}

function EmptyState({ icon, text, action }: { icon: string; text: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="glass rounded-xl p-6 border border-slate-700/30 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm text-slate-500 mb-3">{text}</p>
      {action && <Button onClick={action.onClick} variant="secondary" size="sm">{action.label}</Button>}
    </div>
  )
}
