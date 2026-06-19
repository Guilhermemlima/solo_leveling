'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Clock, Dumbbell, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/game-logic'
import { SPECIALIZATIONS } from '@/lib/specializations'

const goalEntries = Object.entries(CATEGORY_LABELS)
const equipmentOptions = ['NONE', 'DUMBBELLS', 'GYM', 'RESISTANCE_BANDS', 'BIKE', 'RUNNING']
const equipmentLabels: Record<string, string> = {
  NONE: 'Nenhum equipamento', DUMBBELLS: 'Halteres', GYM: 'Academia',
  RESISTANCE_BANDS: 'Elásticos', BIKE: 'Bicicleta', RUNNING: 'Corrida/caminhada',
}

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    goals: ['WORK'] as string[],
    availableMinutes: 30,
    experienceLevel: 'BEGINNER',
    availableEquipment: ['NONE'] as string[],
    healthNotes: '',
    specialization: 'ARCHITECT',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
  })

  const toggle = (field: 'goals' | 'availableEquipment', value: string) => {
    setForm(current => {
      const values = current[field]
      const next = values.includes(value) ? values.filter(item => item !== value) : [...values, value]
      return { ...current, [field]: next.length ? next : values }
    })
  }

  const finish = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) return toast(data.error || 'Não foi possível concluir', 'error')
      await refreshUser()
      toast(`${data.tasksCreated} missões iniciais foram sugeridas`, 'success')
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
            <Sparkles className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Construa uma jornada compatível com você</h1>
          <p className="text-slate-400 mt-2">As sugestões são opcionais e respeitam seu tempo, experiência e recursos.</p>
          <div className="flex justify-center gap-2 mt-5">
            {[1, 2, 3].map(item => <span key={item} className={`h-1.5 rounded-full transition-all ${item <= step ? 'w-10 bg-indigo-500' : 'w-6 bg-slate-800'}`} />)}
          </div>
        </div>

        <div className="glass neon-border rounded-3xl p-6 md:p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">O que você quer evoluir?</h2>
              <p className="text-sm text-slate-500 mb-5">Escolha de uma a cinco áreas. Você poderá mudar depois.</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {goalEntries.map(([key, label]) => (
                  <button key={key} onClick={() => toggle('goals', key)}
                    className={`text-left rounded-xl p-3 border transition-all ${form.goals.includes(key) ? 'border-indigo-500 bg-indigo-500/12 text-indigo-200' : 'border-slate-700/50 text-slate-400 hover:border-slate-600'}`}>
                    <span className="mr-2">{CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS]}</span>{label}
                    {form.goals.includes(key) && <Check size={14} className="inline ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Qual é a sua realidade hoje?</h2>
                <p className="text-sm text-slate-500">Nada de recomendar academia para quem treina em casa.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Minutos disponíveis por dia" type="number" min={10} max={240}
                  value={form.availableMinutes} onChange={event => setForm({ ...form, availableMinutes: Number(event.target.value) })} />
                <Select label="Experiência" value={form.experienceLevel} onChange={event => setForm({ ...form, experienceLevel: event.target.value })}>
                  <option value="BEGINNER">Iniciante</option><option value="INTERMEDIATE">Intermediário</option><option value="ADVANCED">Avançado</option>
                </Select>
              </div>
              <div>
                <p className="text-sm text-slate-300 mb-2 flex items-center gap-2"><Dumbbell size={15} /> Recursos disponíveis</p>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map(item => <button key={item} onClick={() => toggle('availableEquipment', item)}
                    className={`px-3 py-2 rounded-lg text-sm border ${form.availableEquipment.includes(item) ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 text-slate-500'}`}>{equipmentLabels[item]}</button>)}
                </div>
              </div>
              <Input label="Limitações ou observações de saúde (opcional)" value={form.healthNotes}
                onChange={event => setForm({ ...form, healthNotes: event.target.value })}
                placeholder="Ex.: evitar impacto no joelho. Não substitui orientação médica." />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Escolha sua especialização</h2>
              <p className="text-sm text-slate-500 mb-5">Ela dá direção à jornada, sem limitar suas outras áreas.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {SPECIALIZATIONS.map(item => (
                  <button key={item.key} onClick={() => setForm({ ...form, specialization: item.key })}
                    className={`text-left rounded-2xl p-4 border transition-all ${form.specialization === item.key ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700/50 hover:border-slate-600'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div><p className="font-semibold" style={{ color: item.color }}>{item.name}</p><p className="text-xs text-slate-500">{item.description}</p></div>
                    </div>
                    <ul className="mt-3 space-y-1">{item.perks.map(perk => <li key={perk} className="text-xs text-slate-400">• {perk}</li>)}</ul>
                  </button>
                ))}
              </div>
              <div className="mt-5 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-200/80">
                <Clock size={14} className="inline mr-2" />As sugestões respeitarão o limite de {form.availableMinutes} minutos por dia.
              </div>
            </div>
          )}

          <div className="flex justify-between mt-7">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>Voltar</Button>
            {step < 3
              ? <Button onClick={() => setStep(step + 1)}>Continuar <ArrowRight size={15} /></Button>
              : <Button loading={saving} onClick={finish}>Iniciar minha jornada <Sparkles size={15} /></Button>}
          </div>
        </div>
      </div>
    </div>
  )
}
