'use client'
import { useEffect, useState } from 'react'
import { CalendarPlus, Clock3, Layers3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export default function RoutinesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState<string | null>(null)
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

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><Layers3 className="text-purple-400" /> Rotinas</h1>
      <p className="text-sm text-slate-400">Conjuntos reutilizáveis de tarefas. Você continua no controle de cada item.</p></div>
    <div className="grid md:grid-cols-3 gap-4">
      {templates.map(template => <article key={template.id} className="glass neon-border rounded-2xl p-5 flex flex-col">
        <h2 className="font-semibold text-white">{template.name}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{template.description}</p>
        <div className="space-y-2 flex-1">{template.tasks.map((task: any) => <div key={task.title} className="rounded-lg bg-slate-900/50 p-2.5">
          <p className="text-sm text-slate-300">{task.title}</p><p className="text-xs text-slate-600 flex items-center gap-1"><Clock3 size={11} /> {task.estimatedMinutes} min</p>
        </div>)}</div>
        <Button className="mt-4 w-full" loading={loading === template.id} onClick={() => apply(template.id)}><CalendarPlus size={15} /> Adicionar rotina</Button>
      </article>)}
    </div>
  </div>
}
