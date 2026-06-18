'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, X, CheckCircle, Trash2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { RewardModal } from '@/components/game/RewardModal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { CATEGORY_ICONS, CATEGORY_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/game-logic'

const CATEGORIES = Object.entries(CATEGORY_LABELS)
const DIFFICULTIES = Object.entries(DIFFICULTY_LABELS)

function TasksContent() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [completing, setCompleting] = useState<string | null>(null)
  const [reward, setReward] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [form, setForm] = useState({ title: '', description: '', category: 'WORK', difficulty: 'MEDIUM', recurrence: 'ONCE', dueDate: '' })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true)
  }, [searchParams])

  const fetchTasks = async () => {
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (filterCategory) params.set('category', filterCategory)
    const res = await fetch(`/api/tasks?${params}`)
    if (res.ok) setTasks(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [filterStatus, filterCategory])

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { toast(data.error, 'error'); return }
      toast('Tarefa criada!', 'success')
      setShowForm(false)
      setForm({ title: '', description: '', category: 'WORK', difficulty: 'MEDIUM', recurrence: 'ONCE', dueDate: '' })
      fetchTasks()
    } catch { toast('Erro ao criar tarefa', 'error') }
    finally { setSubmitting(false) }
  }

  const completeTask = async (taskId: string) => {
    setCompleting(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' })
      const result = await res.json()
      if (!res.ok) { toast(result.error, 'error'); return }
      setReward(result)
      await Promise.all([fetchTasks(), refreshUser()])
    } catch { toast('Erro ao concluir tarefa', 'error') }
    finally { setCompleting(null) }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Excluir esta tarefa?')) return
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    if (res.ok) { toast('Tarefa excluída', 'info'); fetchTasks() }
  }

  const pending = tasks.filter(t => t.status === 'PENDING')
  const completed = tasks.filter(t => t.status === 'COMPLETED')

  return (
    <>
      <RewardModal reward={reward} onClose={() => setReward(null)} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Minhas Tarefas</h1>
            <p className="text-slate-400 text-sm">{pending.length} pendentes · {completed.length} concluídas</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="primary">
            {showForm ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Nova Tarefa</>}
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="glass neon-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Criar Nova Tarefa</h2>
            <form onSubmit={createTask} className="space-y-4">
              <Input label="Título" placeholder="Nome da tarefa" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Input label="Descrição (opcional)" placeholder="Descrição da tarefa" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Select label="Categoria" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{CATEGORY_ICONS[k as keyof typeof CATEGORY_ICONS]} {v}</option>)}
                </Select>
                <Select label="Dificuldade" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  {DIFFICULTIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
                <Select label="Recorrência" value={form.recurrence} onChange={e => setForm({ ...form, recurrence: e.target.value })}>
                  <option value="ONCE">Única vez</option>
                  <option value="DAILY">Diária</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensal</option>
                </Select>
                <Input label="Prazo (opcional)" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" loading={submitting}>Criar Tarefa</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-auto min-w-32">
            <option value="">Todos status</option>
            <option value="PENDING">Pendentes</option>
            <option value="COMPLETED">Concluídas</option>
            <option value="FAILED">Falhadas</option>
          </Select>
          <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-auto min-w-40">
            <option value="">Todas categorias</option>
            {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{CATEGORY_ICONS[k as keyof typeof CATEGORY_ICONS]} {v}</option>)}
          </Select>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : tasks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-slate-700/30">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-400">Nenhuma tarefa encontrada.</p>
            <Button onClick={() => setShowForm(true)} variant="secondary" className="mt-4"><Plus size={16} /> Criar tarefa</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className={`glass rounded-xl p-4 border transition-all duration-200 ${task.status === 'COMPLETED' ? 'opacity-60 border-emerald-500/15' : 'border-slate-700/40 hover:border-indigo-500/30'}`}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => task.status === 'PENDING' && completeTask(task.id)}
                    disabled={task.status !== 'PENDING' || completing === task.id}
                    className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${task.status === 'COMPLETED' ? 'bg-emerald-500/20 border-emerald-500/40 cursor-default' : 'border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/10 cursor-pointer'}`}
                  >
                    {completing === task.id ? (
                      <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    ) : task.status === 'COMPLETED' ? (
                      <CheckCircle size={13} className="text-emerald-400" />
                    ) : null}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm">{CATEGORY_ICONS[task.category as keyof typeof CATEGORY_ICONS]}</span>
                      <span className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</span>
                    </div>
                    {task.description && <p className="text-xs text-slate-500 mb-2">{task.description}</p>}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: DIFFICULTY_COLORS[task.difficulty as keyof typeof DIFFICULTY_COLORS], borderColor: `${DIFFICULTY_COLORS[task.difficulty as keyof typeof DIFFICULTY_COLORS]}30` }}>
                        {DIFFICULTY_LABELS[task.difficulty as keyof typeof DIFFICULTY_LABELS]}
                      </span>
                      <span className="text-xs text-slate-500">{CATEGORY_LABELS[task.category as keyof typeof CATEGORY_LABELS]}</span>
                      <span className="text-xs text-indigo-400">+{task.xpReward} XP</span>
                      <span className="text-xs text-amber-400">+{task.essenceReward} 💎</span>
                      {task.recurrence !== 'ONCE' && (
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          {task.recurrence === 'DAILY' ? '🔄 Diária' : task.recurrence === 'WEEKLY' ? '📅 Semanal' : '📆 Mensal'}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="shrink-0 w-7 h-7 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 flex items-center justify-center transition-all duration-200"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <TasksContent />
    </Suspense>
  )
}
