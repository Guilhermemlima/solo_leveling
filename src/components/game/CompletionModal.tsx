'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'

export function CompletionModal({ task, loading, onClose, onConfirm }: {
  task: any | null
  loading: boolean
  onClose: () => void
  onConfirm: (data: Record<string, unknown>) => void
}) {
  const [form, setForm] = useState({ actualValue: '', durationMinutes: '', perceivedDifficulty: '3', notes: '' })
  if (!task) return null
  return <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="glass neon-border rounded-2xl p-6 w-full max-w-md">
      <h2 className="text-lg font-semibold text-white">Registrar conclusão</h2>
      <p className="text-sm text-slate-500 mb-5">{task.title}</p>
      <div className="space-y-4">
        {task.targetUnit && <Input label={`Resultado (${task.targetUnit})`} type="number" min={0} value={form.actualValue} onChange={e => setForm({ ...form, actualValue: e.target.value })} placeholder={task.targetValue ? `Meta: ${task.targetValue}` : 'Valor realizado'} />}
        <Input label="Duração real (minutos)" type="number" min={0} max={1440} value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} placeholder={task.estimatedMinutes ? `Planejado: ${task.estimatedMinutes}` : 'Opcional'} />
        <Select label="Dificuldade percebida" value={form.perceivedDifficulty} onChange={e => setForm({ ...form, perceivedDifficulty: e.target.value })}>
          <option value="1">1 · Muito fácil</option><option value="2">2 · Fácil</option><option value="3">3 · Equilibrada</option><option value="4">4 · Difícil</option><option value="5">5 · Muito difícil</option>
        </Select>
        <Input label="Nota rápida" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="O que funcionou? Qual é o próximo passo?" />
      </div>
      <div className="flex justify-end gap-2 mt-6"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button loading={loading} onClick={() => onConfirm({
        actualValue: form.actualValue ? Number(form.actualValue) : null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        perceivedDifficulty: Number(form.perceivedDifficulty),
        notes: form.notes || null,
      })}>Concluir e receber recompensa</Button></div>
    </div>
  </div>
}
