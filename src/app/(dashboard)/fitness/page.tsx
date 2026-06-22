'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Dumbbell, Target, Plus, X, Trash2, Flame, Scale, TrendingUp, Trophy, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import {
  FITNESS_GOAL_TYPES, MUSCLE_GROUPS, EXERCISE_TYPES, DEFAULT_EXERCISES, FREE_ACTIVITIES,
  INTENSITY_LEVELS, FITNESS_GOAL_STATUS,
} from '@/lib/fitness'

interface FGoal {
  id: string; name: string; type: string; currentValue: number; startValue: number
  targetValue: number; unit: string; status: string; progress: number
}
interface Measurement {
  id: string; weight: number | null; waist: number | null; date: string
}
interface ExerciseSummary {
  id: string; name: string; muscleGroup: string | null; type: string; unit: string
  bestLoad: number; bestReps: number; evolution: number; totalWorkouts: number
  lastWorkout: { weight: number | null; reps: number | null; sets: number | null; date: string } | null
}
interface Summary {
  goals: FGoal[]; mainGoal: FGoal | null; measurements: Measurement[]
  exercises: ExerciseSummary[]; trainedThisWeek: number
  latestWeight: number | null; firstWeight: number | null
  recentWorkouts: { id: string; activity: string | null; date: string; exercise: { name: string } | null }[]
}

export default function FitnessPage() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'goal' | 'exercise' | 'workout' | 'measure'>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/fitness')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const deleteExercise = async (id: string) => {
    const res = await fetch(`/api/fitness/exercises/${id}`, { method: 'DELETE' })
    if (res.ok) { toast('Exercício removido', 'success'); fetchData() }
  }
  const deleteGoal = async (id: string) => {
    const res = await fetch(`/api/fitness/goals/${id}`, { method: 'DELETE' })
    if (res.ok) { toast('Meta removida', 'success'); fetchData() }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  }

  const weightSeries = data ? [...data.measurements].filter(m => m.weight != null).reverse().map((m, i) => ({ i, weight: m.weight })) : []
  const weightDelta = data?.latestWeight != null && data?.firstWeight != null ? data.latestWeight - data.firstWeight : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="text-orange-400" /> Academia
          </h1>
          <p className="text-slate-400 text-sm mt-1">Acompanhe sua evolução física, treinos e recordes.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setModal('measure')}><Scale size={15} /> Peso</Button>
          <Button variant="secondary" size="sm" onClick={() => setModal('exercise')}><Plus size={15} /> Exercício</Button>
          <Button variant="primary" size="sm" onClick={() => setModal('workout')}><Plus size={15} /> Treino</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Scale size={18} />} label="Peso atual" value={data?.latestWeight != null ? `${data.latestWeight} kg` : '—'} color="#22c55e" />
        <StatCard icon={<Activity size={18} />} label="Treinos na semana" value={String(data?.trainedThisWeek ?? 0)} color="#f97316" />
        <StatCard icon={<Target size={18} />} label="Metas ativas" value={String(data?.goals.filter(g => g.status === 'ACTIVE').length ?? 0)} color="#8b5cf6" />
        <StatCard icon={<Dumbbell size={18} />} label="Exercícios" value={String(data?.exercises.length ?? 0)} color="#6366f1" />
      </div>

      {/* Main goal + weight chart */}
      <div className="grid lg:grid-cols-2 gap-4">
        {data?.mainGoal ? (
          <div className="glass neon-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 uppercase tracking-wide">Meta principal</span>
              <span className="text-lg">{FITNESS_GOAL_TYPES[data.mainGoal.type]?.icon ?? '🎯'}</span>
            </div>
            <h3 className="text-white font-semibold">{data.mainGoal.name}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-orange-400">{data.mainGoal.currentValue}{data.mainGoal.unit}</span>
              <span className="text-slate-500 text-sm">/ {data.mainGoal.targetValue}{data.mainGoal.unit}</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                initial={{ width: 0 }} animate={{ width: `${data.mainGoal.progress}%` }} transition={{ duration: 0.8 }} />
            </div>
            <p className="text-right text-xs text-slate-400 mt-1">{data.mainGoal.progress}%</p>
          </div>
        ) : (
          <div className="glass neon-border rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2">
            <Target size={28} className="text-slate-600" />
            <p className="text-slate-400 text-sm">Sem meta física definida.</p>
            <Button variant="primary" size="sm" onClick={() => setModal('goal')}><Plus size={15} /> Criar meta física</Button>
          </div>
        )}

        <div className="glass neon-border rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wide">Evolução do peso</span>
            {weightDelta != null && (
              <span className={`text-xs font-semibold ${weightDelta < 0 ? 'text-emerald-400' : weightDelta > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
              </span>
            )}
          </div>
          {weightSeries.length > 1 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={weightSeries}>
                <defs>
                  <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="i" hide />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => `${v} kg`} labelFormatter={() => ''} />
                <Area type="monotone" dataKey="weight" stroke="#f97316" fill="url(#wt)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm py-12 text-center">Registre seu peso para ver a evolução.</p>
          )}
        </div>
      </div>

      {/* Goals */}
      {data && data.goals.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Metas físicas</h2>
            <Button variant="secondary" size="sm" onClick={() => setModal('goal')}><Plus size={15} /> Criar meta</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.goals.map(g => (
              <div key={g.id} className="glass neon-border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{FITNESS_GOAL_TYPES[g.type]?.icon ?? '🎯'}</span>
                    <div>
                      <p className="text-white font-medium text-sm">{g.name}</p>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${FITNESS_GOAL_STATUS[g.status]?.color}22`, color: FITNESS_GOAL_STATUS[g.status]?.color }}>
                        {FITNESS_GOAL_STATUS[g.status]?.label}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(g.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={15} /></button>
                </div>
                <div className="flex items-baseline gap-1.5 mt-3 text-sm">
                  <span className="font-bold text-orange-400">{g.currentValue}{g.unit}</span>
                  <span className="text-slate-500">/ {g.targetValue}{g.unit}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${g.progress}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{g.progress}%</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Exercises */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-semibold text-white">Progressão de exercícios</h2>
        <Button variant="secondary" size="sm" onClick={() => setModal('exercise')}><Plus size={15} /> Novo</Button>
      </div>
      {data && data.exercises.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.exercises.map(ex => (
            <div key={ex.id} className="glass neon-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{ex.name}</p>
                  {ex.muscleGroup && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full"
                      style={{ background: `${MUSCLE_GROUPS[ex.muscleGroup]?.color}22`, color: MUSCLE_GROUPS[ex.muscleGroup]?.color }}>
                      {MUSCLE_GROUPS[ex.muscleGroup]?.label}
                    </span>
                  )}
                </div>
                <button onClick={() => deleteExercise(ex.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-3 text-center">
                <div className="bg-slate-800/40 rounded-lg p-1.5">
                  <p className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5"><Trophy size={9} /> Melhor</p>
                  <p className="text-sm font-bold text-amber-400">{ex.bestLoad || '—'}{ex.bestLoad ? ex.unit : ''}</p>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-1.5">
                  <p className="text-[9px] text-slate-500">Reps</p>
                  <p className="text-sm font-bold text-cyan-400">{ex.bestReps || '—'}</p>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-1.5">
                  <p className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5"><TrendingUp size={9} /> Evol.</p>
                  <p className={`text-sm font-bold ${ex.evolution > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>{ex.evolution > 0 ? '+' : ''}{ex.evolution}%</p>
                </div>
              </div>
              {ex.lastWorkout && (
                <p className="text-[11px] text-slate-500 mt-2">
                  Último: {ex.lastWorkout.weight ?? 0}{ex.unit} × {ex.lastWorkout.reps ?? 0} {ex.lastWorkout.sets ? `(${ex.lastWorkout.sets} séries)` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm text-center py-6">Crie exercícios para acompanhar a progressão de carga.</p>
      )}

      {/* Modals */}
      {modal === 'goal' && <GoalModal onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchData() }} />}
      {modal === 'exercise' && <ExerciseModal onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchData() }} />}
      {modal === 'workout' && <WorkoutModal exercises={data?.exercises ?? []} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchData() }} />}
      {modal === 'measure' && <MeasureModal onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchData() }} />}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="glass neon-border rounded-xl p-4">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: `${color}22`, color }}>{icon}</div>
      <p className="text-lg font-bold text-white truncate">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  )
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="glass neon-border rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

function GoalModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', type: 'WEIGHT', currentValue: '', targetValue: '', unit: 'kg' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const onType = (type: string) => setForm({ ...form, type, unit: FITNESS_GOAL_TYPES[type]?.unit ?? 'kg' })

  const submit = async () => {
    if (!form.name.trim() || !form.targetValue) { toast('Preencha nome e objetivo', 'error'); return }
    setSaving(true)
    const res = await fetch('/api/fitness/goals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, startValue: form.currentValue || 0 }),
    })
    setSaving(false)
    const json = await res.json().catch(() => ({}))
    if (res.ok) {
      toast('Meta criada! +XP', 'success')
      json.newAchievements?.forEach((a: { name: string; icon: string }) => toast(`Conquista: ${a.name} ${a.icon}`, 'success'))
      onSaved()
    } else toast(json.error ?? 'Erro', 'error')
  }

  return (
    <ModalShell title="Criar meta física" onClose={onClose}>
      <div className="space-y-3">
        <Input label="Nome da meta" placeholder="Ex: Perder 10 kg" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Select label="Tipo" value={form.type} onChange={e => onType(e.target.value)}>
          {Object.entries(FITNESS_GOAL_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Input label={`Atual (${form.unit})`} type="number" min="0" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} />
          <Input label={`Objetivo (${form.unit})`} type="number" min="0" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} />
        </div>
        <Button variant="primary" className="w-full" loading={saving} onClick={submit}>Criar meta</Button>
      </div>
    </ModalShell>
  )
}

function ExerciseModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', muscleGroup: 'PEITO', type: 'STRENGTH', unit: 'kg' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const submit = async () => {
    if (!form.name.trim()) { toast('Informe o nome do exercício', 'error'); return }
    setSaving(true)
    const res = await fetch('/api/fitness/exercises', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { toast('Exercício criado!', 'success'); onSaved() }
    else toast((await res.json()).error ?? 'Erro', 'error')
  }

  return (
    <ModalShell title="Criar exercício" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_EXERCISES.map(ex => (
            <button key={ex.name} onClick={() => setForm({ name: ex.name, muscleGroup: ex.muscleGroup, type: ex.type, unit: ex.unit })}
              className="text-[11px] px-2 py-1 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors">
              {ex.name}
            </button>
          ))}
        </div>
        <Input label="Nome" placeholder="Ex: Supino reto" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Select label="Grupo muscular" value={form.muscleGroup} onChange={e => setForm({ ...form, muscleGroup: e.target.value })}>
            {Object.entries(MUSCLE_GROUPS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <Select label="Tipo" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {Object.entries(EXERCISE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>
        <Button variant="primary" className="w-full" loading={saving} onClick={submit}>Criar exercício</Button>
      </div>
    </ModalShell>
  )
}

function WorkoutModal({ exercises, onClose, onSaved }: { exercises: ExerciseSummary[]; onClose: () => void; onSaved: () => void }) {
  const [tab, setTab] = useState<'gym' | 'free'>('gym')
  const [form, setForm] = useState({ exerciseId: '', activity: '', weight: '', reps: '', sets: '', distance: '', duration: '', intensity: 'MODERADA' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const submit = async () => {
    const payload = tab === 'gym'
      ? { exerciseId: form.exerciseId, weight: form.weight || null, reps: form.reps || null, sets: form.sets || null }
      : { activity: form.activity, reps: form.reps || null, distance: form.distance || null, duration: form.duration || null, intensity: form.intensity }
    if (tab === 'gym' && !form.exerciseId) { toast('Selecione um exercício', 'error'); return }
    if (tab === 'free' && !form.activity) { toast('Escolha uma atividade', 'error'); return }
    setSaving(true)
    const res = await fetch('/api/fitness/workouts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    setSaving(false)
    const json = await res.json()
    if (res.ok) {
      toast(json.isPR ? 'Novo recorde! 💥 +XP' : 'Treino registrado! +XP', 'success')
      json.newAchievements?.forEach((a: { name: string; icon: string }) => toast(`Conquista: ${a.name} ${a.icon}`, 'success'))
      onSaved()
    } else toast(json.error ?? 'Erro', 'error')
  }

  return (
    <ModalShell title="Registrar treino" onClose={onClose}>
      <div className="flex gap-1 mb-3 bg-slate-800/50 rounded-lg p-1">
        <button onClick={() => setTab('gym')} className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${tab === 'gym' ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-400'}`}>
          <Dumbbell size={13} className="inline mr-1" /> Academia
        </button>
        <button onClick={() => setTab('free')} className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${tab === 'free' ? 'bg-orange-500/30 text-orange-300' : 'text-slate-400'}`}>
          <Flame size={13} className="inline mr-1" /> Sem aparelhos
        </button>
      </div>

      {tab === 'gym' ? (
        <div className="space-y-3">
          <Select label="Exercício" value={form.exerciseId} onChange={e => setForm({ ...form, exerciseId: e.target.value })}>
            <option value="">Selecione...</option>
            {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </Select>
          {exercises.length === 0 && <p className="text-[11px] text-amber-300/80">Crie um exercício primeiro.</p>}
          <div className="grid grid-cols-3 gap-2">
            <Input label="Carga (kg)" type="number" min="0" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
            <Input label="Reps" type="number" min="0" value={form.reps} onChange={e => setForm({ ...form, reps: e.target.value })} />
            <Input label="Séries" type="number" min="0" value={form.sets} onChange={e => setForm({ ...form, sets: e.target.value })} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {FREE_ACTIVITIES.map(a => (
              <button key={a.key} onClick={() => setForm({ ...form, activity: a.label })}
                className={`text-[11px] px-2 py-1 rounded-lg transition-colors ${form.activity === a.label ? 'bg-orange-500/30 text-orange-300' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}`}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input label="Reps" type="number" min="0" value={form.reps} onChange={e => setForm({ ...form, reps: e.target.value })} />
            <Input label="Dist. (km)" type="number" min="0" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} />
            <Input label="Tempo (min)" type="number" min="0" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
          </div>
          <Select label="Intensidade" value={form.intensity} onChange={e => setForm({ ...form, intensity: e.target.value })}>
            {Object.entries(INTENSITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>
      )}
      <Button variant="primary" className="w-full mt-3" loading={saving} onClick={submit}>Registrar treino</Button>
    </ModalShell>
  )
}

function MeasureModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ weight: '', waist: '', chest: '', arm: '', leg: '', hip: '', bodyFat: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const submit = async () => {
    const filled = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''))
    if (Object.keys(filled).length === 0) { toast('Informe ao menos uma medida', 'error'); return }
    setSaving(true)
    const res = await fetch('/api/fitness/measurements', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filled),
    })
    setSaving(false)
    const json = await res.json().catch(() => ({}))
    if (res.ok) {
      toast('Medidas registradas! +XP', 'success')
      json.newAchievements?.forEach((a: { name: string; icon: string }) => toast(`Conquista: ${a.name} ${a.icon}`, 'success'))
      onSaved()
    } else toast(json.error ?? 'Erro', 'error')
  }

  return (
    <ModalShell title="Registrar peso e medidas" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        <Input label="Peso (kg)" type="number" min="0" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
        <Input label="% Gordura" type="number" min="0" value={form.bodyFat} onChange={e => setForm({ ...form, bodyFat: e.target.value })} />
        <Input label="Cintura (cm)" type="number" min="0" value={form.waist} onChange={e => setForm({ ...form, waist: e.target.value })} />
        <Input label="Peito (cm)" type="number" min="0" value={form.chest} onChange={e => setForm({ ...form, chest: e.target.value })} />
        <Input label="Braço (cm)" type="number" min="0" value={form.arm} onChange={e => setForm({ ...form, arm: e.target.value })} />
        <Input label="Perna (cm)" type="number" min="0" value={form.leg} onChange={e => setForm({ ...form, leg: e.target.value })} />
        <Input label="Quadril (cm)" type="number" min="0" value={form.hip} onChange={e => setForm({ ...form, hip: e.target.value })} />
      </div>
      <Button variant="primary" className="w-full mt-3" loading={saving} onClick={submit}>Registrar</Button>
    </ModalShell>
  )
}
