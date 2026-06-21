'use client'
import { useEffect, useState, useCallback } from 'react'
import { CalendarPlus, Clock3, Layers3, Dices, X, Plus, RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/game-logic'

const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: 'Saúde', TRAINING: 'Treino', STUDY: 'Estudo', WORK: 'Trabalho',
  FINANCE: 'Finanças', PERSONAL_DEVELOPMENT: 'Dev. Pessoal',
  CREATIVITY: 'Criatividade', SOCIAL: 'Social', HOME: 'Casa', SPIRITUALITY: 'Espiritualidade',
}
const CATEGORY_COLORS: Record<string, string> = {
  HEALTH: '#22c55e', TRAINING: '#f97316', STUDY: '#3b82f6', WORK: '#8b5cf6',
  FINANCE: '#f59e0b', PERSONAL_DEVELOPMENT: '#6366f1',
  CREATIVITY: '#ec4899', SOCIAL: '#14b8a6', HOME: '#94a3b8', SPIRITUALITY: '#a78bfa',
}

const FILTER_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'HEALTH', label: 'Saúde' },
  { value: 'TRAINING', label: 'Treino' },
  { value: 'STUDY', label: 'Estudo' },
  { value: 'WORK', label: 'Trabalho' },
  { value: 'FINANCE', label: 'Finanças' },
  { value: 'PERSONAL_DEVELOPMENT', label: 'Dev. Pessoal' },
  { value: 'CREATIVITY', label: 'Criatividade' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'HOME', label: 'Casa' },
  { value: 'SPIRITUALITY', label: 'Espiritualidade' },
]

import type { TaskDifficulty } from '@prisma/client'

interface Idea {
  title: string
  description: string
  category: string
  difficulty: TaskDifficulty
  estimatedMinutes: number
}

function IdeasModal({ onClose }: { onClose: () => void }) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [category, setCategory] = useState('')
  const { toast } = useToast()

  const fetchIdeas = useCallback(async (cat?: string) => {
    setLoading(true)
    const params = new URLSearchParams({ count: '6' })
    if (cat) params.set('category', cat)
    const res = await fetch(`/api/routines/ideas?${params}`)
    if (res.ok) setIdeas(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchIdeas(category || undefined) }, [])

  const handleFilter = (cat: string) => {
    setCategory(cat)
    fetchIdeas(cat || undefined)
  }

  const addIdea = async (idea: Idea) => {
    const key = idea.title
    setAdding(key)
    try {
      const res = await fetch('/api/routines/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idea),
      })
      if (res.ok) {
        setAdded(prev => new Set([...prev, key]))
        toast(`"${idea.title}" adicionada às suas tarefas!`, 'success')
      } else {
        const data = await res.json()
        toast(data.error ?? 'Erro ao adicionar', 'error')
      }
    } catch {
      toast('Erro ao adicionar tarefa', 'error')
    }
    setAdding(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass neon-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/40 shrink-0">
          <div className="flex items-center gap-2">
            <Dices className="text-purple-400" size={20} />
            <div>
              <h2 className="font-bold text-white">Gerador de Ideias</h2>
              <p className="text-xs text-slate-500">Sorteie tarefas para se inspirar e evoluir</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleFilter(opt.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  category === opt.value
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 border border-slate-700/40 hover:border-slate-600/60 hover:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ideas list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            ideas.map((idea, i) => {
              const catColor = CATEGORY_COLORS[idea.category] ?? '#6b7280'
              const diffColor = DIFFICULTY_COLORS[idea.difficulty] ?? '#6b7280'
              const isAdded = added.has(idea.title)
              return (
                <div
                  key={i}
                  className={`rounded-xl p-4 border transition-all ${isAdded ? 'opacity-60 border-emerald-500/25 bg-emerald-500/5' : 'border-slate-700/40 bg-slate-900/40 hover:border-slate-600/60'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ color: catColor, background: `${catColor}18`, border: `1px solid ${catColor}30` }}
                        >
                          {CATEGORY_LABELS[idea.category] ?? idea.category}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ color: diffColor, background: `${diffColor}15`, border: `1px solid ${diffColor}25` }}
                        >
                          {DIFFICULTY_LABELS[idea.difficulty] ?? idea.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                          <Clock3 size={9} /> {idea.estimatedMinutes} min
                        </span>
                      </div>
                      <p className="font-semibold text-slate-200 text-sm leading-snug">{idea.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{idea.description}</p>
                    </div>
                    <div className="shrink-0">
                      {isAdded ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <CheckCircle size={14} /> Adicionada
                        </span>
                      ) : (
                        <button
                          onClick={() => addIdea(idea)}
                          disabled={adding === idea.title}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all disabled:opacity-50"
                        >
                          {adding === idea.title
                            ? <span className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                            : <Plus size={12} />
                          }
                          Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/40 shrink-0 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-600">Tarefas adicionadas ficam em <strong className="text-slate-500">Tarefas</strong> para você completar</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setAdded(new Set()); fetchIdeas(category || undefined) }}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Sortear novamente
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function RoutinesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [showIdeas, setShowIdeas] = useState(false)
  const { toast } = useToast()

  useEffect(() => { fetch('/api/routines').then(r => r.json()).then(setTemplates) }, [])

  const apply = async (templateId: string) => {
    setLoading(templateId)
    const response = await fetch('/api/routines', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId }),
    })
    const data = await response.json()
    if (response.ok) toast(`${data.created} tarefas adicionadas à sua rotina`, 'success')
    else toast(data.error, 'error')
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      {showIdeas && <IdeasModal onClose={() => setShowIdeas(false)} />}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers3 className="text-purple-400" /> Rotinas
          </h1>
          <p className="text-sm text-slate-400">Conjuntos reutilizáveis de tarefas. Você continua no controle de cada item.</p>
        </div>
        <button
          onClick={() => setShowIdeas(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all
            bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30
            text-purple-300 hover:from-purple-600/30 hover:to-indigo-600/30 hover:border-purple-500/50
            active:scale-95"
        >
          <Dices size={16} />
          Gerar Ideias Aleatórias
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {templates.map(template => (
          <article key={template.id} className="glass neon-border rounded-2xl p-5 flex flex-col">
            <h2 className="font-semibold text-white">{template.name}</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">{template.description}</p>
            <div className="space-y-2 flex-1">
              {template.tasks.map((task: any) => (
                <div key={task.title} className="rounded-lg bg-slate-900/50 p-2.5">
                  <p className="text-sm text-slate-300">{task.title}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock3 size={11} /> {task.estimatedMinutes} min
                  </p>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full" loading={loading === template.id} onClick={() => apply(template.id)}>
              <CalendarPlus size={15} /> Adicionar rotina
            </Button>
          </article>
        ))}
      </div>
    </div>
  )
}
