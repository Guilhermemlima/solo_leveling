'use client'
import { CoinIcon } from '@/components/ui/CoinIcon'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Flame, Coins, Zap, TrendingUp, CheckCircle, Clock, Target, Heart, Shield, Swords, FlaskConical, Wallet, Dumbbell, Scale } from 'lucide-react'
import { XPBar } from '@/components/game/XPBar'
import { RewardModal } from '@/components/game/RewardModal'
import { RankBadge } from '@/components/game/RankBadge'
import { TitleBadge } from '@/components/game/TitleBadge'
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
  combatStats: { hp: number; atk: number; def: number; crit: number; power: number } | null
  financeSummary?: {
    totalInvested: number; monthInvested: number
    mainGoal: { name: string; current: number; target: number; progress: number } | null
  }
  fitnessSummary?: {
    latestWeight: number | null; trainedThisWeek: number
    mainGoal: { name: string; current: number; target: number; unit: string; progress: number } | null
  }
  title?: { title: string; icon: string; color: string } | null
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reward, setReward] = useState<any>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const [advisor, setAdvisor] = useState<any>(null)
  const { refreshUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const fetchDashboard = async () => {
    const res = await fetch('/api/dashboard', { cache: 'no-store' })
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  // Fetch on mount and every time the tab becomes visible again
  // (covers both first load and returning from inventory/forge)
  useEffect(() => {
    fetchDashboard()
    fetch('/api/ai/recommendations').then(r => r.ok ? r.json() : null).then(d => d && setAdvisor(d))
    const onVisible = () => { if (document.visibilityState === 'visible') fetchDashboard() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, []) // eslint-disable-line

  const completeTask = async (taskId: string) => {
    setCompleting(taskId)
    try {
      const key = crypto.randomUUID()
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
        body: JSON.stringify({}),
      })
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
        <div data-gsap className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">
                Bem-vindo, <span className="text-indigo-400">{u?.name?.split(' ')[0]}</span>
              </h1>
              {u && <RankBadge points={u.arenaPoints || 0} size="sm" />}
              {data?.title && <TitleBadge title={data.title} size="sm" />}
            </div>
            {u?.selectedClass ? (
              <p className="text-slate-400 text-sm mt-0.5">{u.selectedClass.icon} {u.selectedClass.name}</p>
            ) : (
              <button
                onClick={() => router.push('/settings')}
                className="mt-1 px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 hover:bg-indigo-500/25 transition-all flex items-center gap-1.5 w-fit"
              >
                ⚔️ Escolha sua classe para ganhar bônus de XP
              </button>
            )}
          </div>
          <Button onClick={() => router.push('/tasks?new=1')} variant="primary">
            <Plus size={16} /> Nova Tarefa
          </Button>
        </div>

        {/* Stats Row */}
        <div data-gsap className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Zap size={20} className="text-indigo-400" />} label="Nível" value={u?.level} color="indigo" />
          <StatCard icon={<Flame size={20} className="text-orange-400" />} label="Streak" value={`${u?.currentStreak} dias`} color="orange" />
          <StatCard icon={<img src="/assets/items/moeda.png" alt="Moedas" className="w-5 h-5 object-contain" />} label="Moedas" value={u?.essences?.toLocaleString()} color="amber" />
          <StatCard icon={<FlaskConical size={20} className="text-violet-400" />} label="Fragmentos" value={u?.fragments?.toLocaleString() ?? '0'} color="violet" />
        </div>

        {/* Combat Stats Row */}
        {data?.combatStats && (
          <div data-gsap className="grid grid-cols-3 gap-3">
            <CombatStatCard
              icon={<Heart size={18} className="text-red-400" />}
              label="HP"
              value={data.combatStats.hp}
              color="red"
              bg="bg-red-500/5"
              border="border-red-500/20"
            />
            <CombatStatCard
              icon={<Swords size={18} className="text-orange-400" />}
              label="ATK"
              value={data.combatStats.atk}
              color="orange"
              bg="bg-orange-500/5"
              border="border-orange-500/20"
            />
            <CombatStatCard
              icon={<Shield size={18} className="text-blue-400" />}
              label="DEF"
              value={data.combatStats.def}
              color="blue"
              bg="bg-blue-500/5"
              border="border-blue-500/20"
            />
          </div>
        )}

        {/* XP Bar */}
        <div data-gsap className="glass neon-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-300">Progresso para o Nível {(u?.level || 0) + 1}</span>
            <span className="text-xs text-indigo-400">{data?.weeklyCompleted || 0} tarefas esta semana</span>
          </div>
          <XPBar currentXp={u?.currentXp || 0} xpForNextLevel={u?.xpForNextLevel || 100} level={u?.level || 1} />
        </div>

        {/* Evolução: Finanças + Academia */}
        <div data-gsap className="grid sm:grid-cols-2 gap-4">
          {/* Finanças */}
          <button onClick={() => router.push('/finance')}
            className="glass neon-border rounded-2xl p-5 text-left hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-200 flex items-center gap-2"><Wallet size={17} className="text-emerald-400" /> Finanças</span>
              <span className="text-xs text-slate-500">Ver →</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.financeSummary?.totalInvested ?? 0)}
              </span>
              <span className="text-xs text-slate-500">investido</span>
            </div>
            {data?.financeSummary?.mainGoal ? (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span className="truncate">{data.financeSummary.mainGoal.name}</span>
                  <span>{data.financeSummary.mainGoal.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${data.financeSummary.mainGoal.progress}%` }} />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-3">+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.financeSummary?.monthInvested ?? 0)} este mês</p>
            )}
          </button>

          {/* Academia */}
          <button onClick={() => router.push('/fitness')}
            className="glass neon-border rounded-2xl p-5 text-left hover:border-orange-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-200 flex items-center gap-2"><Dumbbell size={17} className="text-orange-400" /> Academia</span>
              <span className="text-xs text-slate-500">Ver →</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-1.5">
                <Scale size={15} className="text-slate-500" />
                <span className="text-xl font-bold text-orange-400">{data?.fitnessSummary?.latestWeight != null ? `${data.fitnessSummary.latestWeight}kg` : '—'}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <Flame size={15} className="text-slate-500" />
                <span className="text-sm font-semibold text-slate-300">{data?.fitnessSummary?.trainedThisWeek ?? 0} treinos/sem</span>
              </div>
            </div>
            {data?.fitnessSummary?.mainGoal && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span className="truncate">{data.fitnessSummary.mainGoal.name}</span>
                  <span>{data.fitnessSummary.mainGoal.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${data.fitnessSummary.mainGoal.progress}%` }} />
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Today Tasks + Active Missions */}
        <div data-gsap className="grid lg:grid-cols-2 gap-6">
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
                          <span className="text-xs text-amber-400">+{task.essenceReward} <CoinIcon /></span>
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
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${um.mission.type === 'DAILY' ? 'bg-blue-500/15 text-blue-400' : um.mission.type === 'WEEKLY' ? 'bg-purple-500/15 text-purple-400' : um.mission.type === 'MONTHLY' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          {um.mission.type === 'DAILY' ? 'Diária' : um.mission.type === 'WEEKLY' ? 'Semanal' : um.mission.type === 'MONTHLY' ? 'Mensal' : 'Especial'}
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
                        <span className="text-xs text-amber-400">+{um.mission.essenceReward} <CoinIcon /></span>
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
                    {activity.essenceChange > 0 && <p className="text-xs text-amber-400">+{activity.essenceChange} <CoinIcon /></p>}
                    {activity.essenceChange < 0 && <p className="text-xs text-red-400">{activity.essenceChange} <CoinIcon /></p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Advisor */}
        {advisor && (
          <div className="glass rounded-2xl p-5 border border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-lg">🧠</div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-200 text-sm">Conselheiro do Sistema</h2>
                <p className="text-xs text-purple-400">Análise de atributos em tempo real</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold tracking-wider">IA</span>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
              <p className="text-xs text-amber-400 font-semibold mb-2">⚠️ Atributos mais fracos detectados</p>
              <div className="flex gap-3 mb-2">
                {advisor.weakest.map((w: any, i: number) => (
                  <div key={w.key} className={`flex items-center gap-1.5 ${i === 0 ? 'text-amber-300' : 'text-slate-400'}`}>
                    <span className="font-bold text-sm">{w.label}</span>
                    <span className="text-xs opacity-70">({w.value})</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic leading-relaxed">"{advisor.insight}"</p>
            </div>

            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Tarefas recomendadas para você</p>
            <div className="space-y-2">
              {advisor.suggestions.map((s: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-colors group">
                  <span className="text-lg shrink-0">{CATEGORY_ICONS[s.category as keyof typeof CATEGORY_ICONS] || '⚡'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium leading-snug">{s.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.reason}</p>
                    <p className="text-xs text-slate-600 mt-0.5">⏱ {s.estimatedMinutes >= 60 ? `${Math.round(s.estimatedMinutes / 60)}h` : `${s.estimatedMinutes} min`}</p>
                  </div>
                  <button
                    onClick={() => router.push('/tasks?new=1')}
                    className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/35 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    + Criar
                  </button>
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
    violet: 'border-violet-500/20 bg-violet-500/5',
  }
  return (
    <div className={`glass rounded-2xl p-4 border ${colors[color]} transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-slate-500 font-medium">{label}</span></div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
    </div>
  )
}

function CombatStatCard({ icon, label, value, color, bg, border }: {
  icon: React.ReactNode; label: string; value: number; color: string; bg: string; border: string
}) {
  const textColor: Record<string, string> = { red: 'text-red-400', orange: 'text-orange-400', blue: 'text-blue-400' }
  return (
    <div className={`glass rounded-2xl p-4 border ${border} ${bg} transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${textColor[color] ?? 'text-white'}`}>{value}</p>
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
