'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Layers3, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { CompletionModal } from '@/components/game/CompletionModal'
import { RewardModal } from '@/components/game/RewardModal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { CATEGORY_ICONS, CATEGORY_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/game-logic'

const emptyForm = {
  title: '', description: '', category: 'WORK', difficulty: 'MEDIUM', recurrence: 'ONCE',
  dueDate: '', targetValue: '', targetUnit: '', estimatedMinutes: '', subtasksText: '', isTemplate: false,
}

function TasksContent() {
  const [tasks, setTasks] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [completing, setCompleting] = useState(false)
  const [reward, setReward] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => { if (searchParams.get('new') === '1') setShowForm(true) }, [searchParams])
  const load = async () => {
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (filterCategory) params.set('category', filterCategory)
    const response = await fetch(`/api/tasks?${params}`)
    if (response.ok) setTasks(await response.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [filterStatus, filterCategory])

  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitting(true)
    const payload = {
      ...form,
      targetValue: form.targetValue ? Number(form.targetValue) : null,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : null,
      dueDate: form.dueDate || null,
      subtasks: form.subtasksText.split('\n').map(item => item.trim()).filter(Boolean),
    }
    const response = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await response.json()
    if (response.ok) { toast('Tarefa criada', 'success'); setForm(emptyForm); setShowForm(false); load() }
    else toast(data.error, 'error')
    setSubmitting(false)
  }

  const complete = async (metrics: Record<string, unknown>) => {
    setCompleting(true)
    const key = crypto.randomUUID()
    const response = await fetch(`/api/tasks/${selectedTask.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify(metrics),
    })
    const data = await response.json()
    if (response.ok) { setReward(data); setSelectedTask(null); await Promise.all([load(), refreshUser()]) }
    else toast(data.error, 'error')
    setCompleting(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir esta tarefa?')) return
    const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (response.ok) { toast('Tarefa excluída', 'info'); load() }
  }

  const pending = tasks.filter(task => task.status === 'PENDING').length
  return <>
    <RewardModal reward={reward} onClose={() => setReward(null)} />
    <CompletionModal task={selectedTask} loading={completing} onClose={() => setSelectedTask(null)} onConfirm={complete} />
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-white">Minhas tarefas</h1><p className="text-sm text-slate-400">{pending} pendentes · cada execução fica registrada</p></div>
        <div className="flex gap-2"><Link href="/routines"><Button variant="secondary"><Layers3 size={15} /> Rotinas</Button></Link>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X size={15} /> Fechar</> : <><Plus size={15} /> Nova tarefa</>}</Button></div>
      </header>

      {showForm && <form onSubmit={create} className="glass neon-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Criar tarefa detalhada</h2>
        <Input label="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <Input label="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Categoria" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{Object.entries(CATEGORY_LABELS).map(([key, label]) => <option key={key} value={key}>{CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS]} {label}</option>)}</Select>
          <Select label="Dificuldade" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>{Object.entries(DIFFICULTY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select>
          <Select label="Recorrência" value={form.recurrence} onChange={e => setForm({ ...form, recurrence: e.target.value })}><option value="ONCE">Única</option><option value="DAILY">Diária</option><option value="WEEKLY">Semanal</option><option value="MONTHLY">Mensal</option></Select>
          <Input label="Prazo" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <Input label="Tempo planejado (min)" type="number" min={1} value={form.estimatedMinutes} onChange={e => setForm({ ...form, estimatedMinutes: e.target.value })} />
          <Input label="Meta numérica" type="number" min={0} value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} placeholder="Ex.: 30" />
          <Input label="Unidade da meta" value={form.targetUnit} onChange={e => setForm({ ...form, targetUnit: e.target.value })} placeholder="min, km, páginas, R$..." />
          <label className="flex items-center gap-2 text-sm text-slate-300 self-end pb-3"><input type="checkbox" checked={form.isTemplate} onChange={e => setForm({ ...form, isTemplate: e.target.checked })} /> Salvar como modelo reutilizável</label>
        </div>
        <label className="block"><span className="text-sm text-slate-300">Subtarefas, uma por linha</span><textarea value={form.subtasksText} onChange={e => setForm({ ...form, subtasksText: e.target.value })} className="mt-1 w-full min-h-24 rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-white" placeholder={'Preparar materiais\nExecutar etapa principal\nRegistrar resultado'} /></label>
        <Button type="submit" loading={submitting}>Criar tarefa</Button>
      </form>}

      <div className="flex flex-wrap gap-3">
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-auto"><option value="">Todos os status</option><option value="PENDING">Pendentes</option><option value="COMPLETED">Concluídas</option><option value="FAILED">Falhadas</option></Select>
        <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-auto"><option value="">Todas as categorias</option>{Object.entries(CATEGORY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select>
      </div>

      {loading ? <div className="py-12 text-center text-slate-500">Carregando...</div> : <div className="space-y-3">
        {tasks.map(task => <article key={task.id} className={`glass rounded-2xl p-4 border ${task.status === 'COMPLETED' ? 'border-emerald-500/20 opacity-70' : 'border-slate-700/50'}`}>
          <div className="flex gap-3">
            <button onClick={() => task.status === 'PENDING' && setSelectedTask(task)} disabled={task.status !== 'PENDING'} className="w-7 h-7 rounded-lg border border-slate-600 flex items-center justify-center hover:border-indigo-500">{task.status === 'COMPLETED' && <CheckCircle size={15} className="text-emerald-400" />}</button>
            <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span>{CATEGORY_ICONS[task.category as keyof typeof CATEGORY_ICONS]}</span><h2 className="text-sm font-medium text-slate-200">{task.title}</h2></div>
              {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
              {task.subtasks?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{task.subtasks.map((subtask: any) => <span key={subtask.id} className="text-[11px] px-2 py-1 rounded bg-slate-900/70 text-slate-500">✓ {subtask.title}</span>)}</div>}
              <div className="flex flex-wrap gap-2 mt-3 text-xs"><span style={{ color: DIFFICULTY_COLORS[task.difficulty as keyof typeof DIFFICULTY_COLORS] }}>{DIFFICULTY_LABELS[task.difficulty as keyof typeof DIFFICULTY_LABELS]}</span><span className="text-indigo-400">+{task.xpReward} XP</span><span className="text-amber-400">+{task.essenceReward} 💎</span>
                {task.estimatedMinutes && <span className="text-slate-500">⏱ {task.estimatedMinutes} min</span>}{task.targetValue && <span className="text-cyan-400">Meta {task.targetValue} {task.targetUnit}</span>}{task.templateName && <span className="text-purple-400">{task.templateName}</span>}</div>
            </div>
            <button onClick={() => remove(task.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
          </div>
        </article>)}
        {!tasks.length && <div className="glass rounded-2xl p-10 text-center text-slate-500">Nenhuma tarefa encontrada.</div>}
      </div>}
    </div>
  </>
}

export default function TasksPage() {
  return <Suspense fallback={<div className="py-12 text-center text-slate-500">Carregando...</div>}><TasksContent /></Suspense>
}
