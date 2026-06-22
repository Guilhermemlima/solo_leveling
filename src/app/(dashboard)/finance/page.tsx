'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import {
  Wallet, Target, TrendingUp, Plus, X, Calculator, Trash2, CheckCircle2,
  PiggyBank, ShieldAlert, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import {
  INVESTMENT_ASSETS, RISK_LABELS, RISK_COLORS, GOAL_CATEGORIES, GOAL_STATUS,
  simulateInvestment, formatBRL, FINANCE_DISCLAIMER, type InvestmentAsset,
} from '@/lib/finance'

interface Goal {
  id: string; name: string; targetAmount: number; currentAmount: number
  monthlyContribution: number; category: string; status: string; progress: number
  targetDate: string | null
}
interface Contribution {
  id: string; amount: number; assetType: string | null; notes: string | null; date: string
}
interface Summary {
  totalInvested: number; monthInvested: number; goals: Goal[]; mainGoal: Goal | null
  contributions: Contribution[]; evolution: { date: string; total: number }[]
}

const DISCLAIMER = FINANCE_DISCLAIMER

export default function FinancePage() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGoal, setShowGoal] = useState(false)
  const [showContribution, setShowContribution] = useState(false)
  const [showSimulator, setShowSimulator] = useState(false)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/finance')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const completeGoal = async (id: string) => {
    const res = await fetch(`/api/finance/goals/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    if (res.ok) { toast('Meta concluída! 🏆', 'success'); fetchData() }
  }

  const deleteGoal = async (id: string) => {
    const res = await fetch(`/api/finance/goals/${id}`, { method: 'DELETE' })
    if (res.ok) { toast('Meta removida', 'success'); fetchData() }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="text-emerald-400" /> Finanças
          </h1>
          <p className="text-slate-400 text-sm mt-1">Acompanhe sua evolução financeira e simule investimentos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowSimulator(true)}><Calculator size={15} /> Simulador</Button>
          <Button variant="primary" size="sm" onClick={() => setShowContribution(true)}><Plus size={15} /> Aporte</Button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300/90 text-xs">
        <Info size={15} className="mt-0.5 shrink-0" /> {DISCLAIMER}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<PiggyBank size={18} />} label="Total investido" value={formatBRL(data?.totalInvested ?? 0)} color="#22c55e" />
        <StatCard icon={<TrendingUp size={18} />} label="Aportes do mês" value={formatBRL(data?.monthInvested ?? 0)} color="#6366f1" />
        <StatCard icon={<Target size={18} />} label="Metas ativas" value={String(data?.goals.filter(g => g.status === 'ACTIVE').length ?? 0)} color="#8b5cf6" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Metas concluídas" value={String(data?.goals.filter(g => g.status === 'COMPLETED').length ?? 0)} color="#f59e0b" />
      </div>

      {/* Main goal + evolution */}
      <div className="grid lg:grid-cols-2 gap-4">
        {data?.mainGoal ? (
          <div className="glass neon-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 uppercase tracking-wide">Meta principal</span>
              <span className="text-lg">{GOAL_CATEGORIES[data.mainGoal.category]?.icon ?? '🎯'}</span>
            </div>
            <h3 className="text-white font-semibold">{data.mainGoal.name}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">{formatBRL(data.mainGoal.currentAmount)}</span>
              <span className="text-slate-500 text-sm">/ {formatBRL(data.mainGoal.targetAmount)}</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                initial={{ width: 0 }} animate={{ width: `${data.mainGoal.progress}%` }} transition={{ duration: 0.8 }} />
            </div>
            <p className="text-right text-xs text-slate-400 mt-1">{data.mainGoal.progress}%</p>
          </div>
        ) : (
          <EmptyGoal onCreate={() => setShowGoal(true)} />
        )}

        <div className="glass neon-border rounded-2xl p-5">
          <span className="text-xs text-slate-400 uppercase tracking-wide">Evolução do patrimônio</span>
          {data && data.evolution.length > 1 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={data.evolution.map((e, i) => ({ i, total: e.total }))}>
                <defs>
                  <linearGradient id="fin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="i" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => formatBRL(Number(v))} labelFormatter={() => ''} />
                <Area type="monotone" dataKey="total" stroke="#22c55e" fill="url(#fin)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm py-12 text-center">Registre aportes para ver a evolução.</p>
          )}
        </div>
      </div>

      {/* Goals list */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Minhas metas</h2>
        <Button variant="secondary" size="sm" onClick={() => setShowGoal(true)}><Plus size={15} /> Criar meta</Button>
      </div>
      {data && data.goals.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {data.goals.map(g => (
            <div key={g.id} className="glass neon-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{GOAL_CATEGORIES[g.category]?.icon ?? '🎯'}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{g.name}</p>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full"
                      style={{ background: `${GOAL_STATUS[g.status]?.color}22`, color: GOAL_STATUS[g.status]?.color }}>
                      {GOAL_STATUS[g.status]?.label}
                    </span>
                  </div>
                </div>
                <button onClick={() => deleteGoal(g.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="flex items-baseline gap-1.5 mt-3 text-sm">
                <span className="font-bold text-emerald-400">{formatBRL(g.currentAmount)}</span>
                <span className="text-slate-500">/ {formatBRL(g.targetAmount)}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${g.progress}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">{g.progress}%</span>
                {g.status === 'ACTIVE' && g.progress >= 100 && (
                  <button onClick={() => completeGoal(g.id)} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Concluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm text-center py-8">Nenhuma meta ainda. Crie a primeira!</p>
      )}

      {/* Assets library */}
      <h2 className="text-lg font-semibold text-white pt-2">Ativos para simulação</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {INVESTMENT_ASSETS.map(a => <AssetCard key={a.key} asset={a} />)}
      </div>

      {/* Modals */}
      {showGoal && <GoalModal onClose={() => setShowGoal(false)} onSaved={() => { setShowGoal(false); fetchData() }} />}
      {showContribution && <ContributionModal goals={data?.goals ?? []} onClose={() => setShowContribution(false)} onSaved={() => { setShowContribution(false); fetchData() }} />}
      {showSimulator && <SimulatorModal onClose={() => setShowSimulator(false)} />}
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

function EmptyGoal({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="glass neon-border rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2">
      <Target size={28} className="text-slate-600" />
      <p className="text-slate-400 text-sm">Você ainda não tem uma meta principal.</p>
      <Button variant="primary" size="sm" onClick={onCreate}><Plus size={15} /> Criar meta</Button>
    </div>
  )
}

function AssetCard({ asset }: { asset: InvestmentAsset }) {
  return (
    <div className="glass neon-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-white font-medium text-sm">{asset.name}</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: `${RISK_COLORS[asset.riskLevel]}22`, color: RISK_COLORS[asset.riskLevel] }}>
          Risco {RISK_LABELS[asset.riskLevel]}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 mb-2">{asset.category} · Liquidez {asset.liquidity}</p>
      <p className="text-xs text-slate-400 leading-relaxed">{asset.description}</p>
      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-300/80">
        <ShieldAlert size={12} /> {asset.disclaimer}
      </div>
      {asset.estimatedAnnualReturn > 0 && (
        <p className="text-xs text-emerald-400 mt-2 font-mono">~{asset.estimatedAnnualReturn}% a.a. (estimativa)</p>
      )}
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
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', monthlyContribution: '', category: 'INVESTMENT' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const submit = async () => {
    if (!form.name.trim() || !form.targetAmount) { toast('Preencha nome e valor objetivo', 'error'); return }
    setSaving(true)
    const res = await fetch('/api/finance/goals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { toast('Meta criada! +XP', 'success'); onSaved() }
    else toast((await res.json()).error ?? 'Erro', 'error')
  }

  return (
    <ModalShell title="Criar meta financeira" onClose={onClose}>
      <div className="space-y-3">
        <Input label="Nome da meta" placeholder="Ex: Reserva de emergência" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Select label="Categoria" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {Object.entries(GOAL_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </Select>
        <Input label="Valor objetivo (R$)" type="number" min="0" placeholder="10000" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
        <Input label="Valor atual (R$)" type="number" min="0" placeholder="0" value={form.currentAmount} onChange={e => setForm({ ...form, currentAmount: e.target.value })} />
        <Input label="Aporte mensal planejado (R$)" type="number" min="0" placeholder="200" value={form.monthlyContribution} onChange={e => setForm({ ...form, monthlyContribution: e.target.value })} />
        <Button variant="primary" className="w-full" loading={saving} onClick={submit}>Criar meta</Button>
      </div>
    </ModalShell>
  )
}

function ContributionModal({ goals, onClose, onSaved }: { goals: Goal[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ amount: '', goalId: '', assetType: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const submit = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast('Informe um valor válido', 'error'); return }
    setSaving(true)
    const res = await fetch('/api/finance/contributions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, goalId: form.goalId || null, assetType: form.assetType || null }),
    })
    setSaving(false)
    const json = await res.json()
    if (res.ok) {
      toast(json.completionReward ? 'Aporte registrado e meta concluída! 🏆' : 'Aporte registrado! +XP', 'success')
      onSaved()
    } else toast(json.error ?? 'Erro', 'error')
  }

  return (
    <ModalShell title="Registrar aporte" onClose={onClose}>
      <div className="space-y-3">
        <Input label="Valor investido (R$)" type="number" min="0" placeholder="200" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
        <Select label="Meta (opcional)" value={form.goalId} onChange={e => setForm({ ...form, goalId: e.target.value })}>
          <option value="">Sem meta vinculada</option>
          {goals.filter(g => g.status === 'ACTIVE').map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </Select>
        <Select label="Ativo (opcional)" value={form.assetType} onChange={e => setForm({ ...form, assetType: e.target.value })}>
          <option value="">Não especificado</option>
          {INVESTMENT_ASSETS.map(a => <option key={a.key} value={a.key}>{a.name}</option>)}
        </Select>
        <Input label="Observação (opcional)" placeholder="Ex: 13º salário" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <Button variant="primary" className="w-full" loading={saving} onClick={submit}>Registrar aporte</Button>
      </div>
    </ModalShell>
  )
}

function SimulatorModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ initialAmount: '1000', monthlyContribution: '200', annualRate: '11', durationMonths: '60' })
  const result = simulateInvestment({
    initialAmount: Number(form.initialAmount) || 0,
    monthlyContribution: Number(form.monthlyContribution) || 0,
    annualRate: Number(form.annualRate) || 0,
    durationMonths: Number(form.durationMonths) || 0,
  })

  return (
    <ModalShell title="Simulador de investimentos" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Input label="Valor inicial (R$)" type="number" min="0" value={form.initialAmount} onChange={e => setForm({ ...form, initialAmount: e.target.value })} />
          <Input label="Aporte mensal (R$)" type="number" min="0" value={form.monthlyContribution} onChange={e => setForm({ ...form, monthlyContribution: e.target.value })} />
          <Input label="Taxa anual (%)" type="number" min="0" value={form.annualRate} onChange={e => setForm({ ...form, annualRate: e.target.value })} />
          <Input label="Prazo (meses)" type="number" min="1" value={form.durationMonths} onChange={e => setForm({ ...form, durationMonths: e.target.value })} />
        </div>

        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={result.series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" hide />
            <YAxis hide />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => formatBRL(Number(v))} labelFormatter={(m) => `Mês ${m}`} />
            <Line type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={2} dot={false} name="Patrimônio" />
            <Line type="monotone" dataKey="contributed" stroke="#6366f1" strokeWidth={2} dot={false} name="Aportado" />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-[10px] text-slate-400">Aportado</p>
            <p className="text-sm font-bold text-indigo-400">{formatBRL(result.totalContributed)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-[10px] text-slate-400">Rendimento</p>
            <p className="text-sm font-bold text-amber-400">{formatBRL(result.estimatedReturn)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-[10px] text-slate-400">Total estimado</p>
            <p className="text-sm font-bold text-emerald-400">{formatBRL(result.finalAmount)}</p>
          </div>
        </div>
        <p className="text-[11px] text-amber-300/80 flex items-start gap-1.5"><Info size={12} className="mt-0.5 shrink-0" /> {DISCLAIMER}</p>
      </div>
    </ModalShell>
  )
}
