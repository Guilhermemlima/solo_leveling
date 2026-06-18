'use client'
import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { CATEGORY_LABELS } from '@/lib/game-logic'

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#14b8a6']

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 className="text-indigo-400" /> Relatórios</h1>
        <p className="text-slate-400 text-sm">Acompanhe sua evolução ao longo do tempo</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly tasks */}
        <div className="glass neon-border rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-400" /> Tarefas por Dia (últimos 7 dias)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.dailyTasks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
              <XAxis dataKey="day" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0f0f1e', border: '1px solid #6366f130', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#6366f1" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* XP per day */}
        <div className="glass neon-border rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4">XP por Dia</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.dailyXp}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
              <XAxis dataKey="day" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0f0f1e', border: '1px solid #8b5cf630', borderRadius: 8, color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="xp" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution */}
        <div className="glass neon-border rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4">Tarefas por Categoria</h3>
          {data.categoryDist.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Nenhuma tarefa concluída ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.categoryDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {data.categoryDist.map((_: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f0f1e', border: '1px solid #6366f130', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Streak history */}
        <div className="glass neon-border rounded-2xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4">Resumo Geral</h3>
          <div className="space-y-3">
            {[
              { label: 'Total de Tarefas Concluídas', value: data.totalTasks, color: 'text-emerald-400' },
              { label: 'XP Total Acumulado', value: data.totalXp?.toLocaleString(), color: 'text-indigo-400' },
              { label: 'Melhor Streak', value: `${data.bestStreak} dias`, color: 'text-orange-400' },
              { label: 'Streak Atual', value: `${data.currentStreak} dias`, color: 'text-amber-400' },
              { label: 'Total de Essências Ganhas', value: data.totalEssences?.toLocaleString(), color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl">
                <span className="text-sm text-slate-400">{label}</span>
                <span className={`font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
