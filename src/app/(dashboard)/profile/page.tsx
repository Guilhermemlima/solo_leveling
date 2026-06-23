'use client'
import { useEffect, useState } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Heart, Swords, Shield, Zap, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { XPBar } from '@/components/game/XPBar'
import { RankBadge } from '@/components/game/RankBadge'
import { TitleBadge } from '@/components/game/TitleBadge'
import { EvolutionAvatar } from '@/components/game/EvolutionAvatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { xpForLevel, CATEGORY_LABELS } from '@/lib/game-logic'
import { getRank } from '@/lib/ranks'

const ATTR_ICONS: Record<string, string> = { strength: '💪', intelligence: '🧠', discipline: '⚡', focus: '🎯', vitality: '❤️', charisma: '✨', wisdom: '🌟', creativity: '🎨' }
const ATTR_LABELS: Record<string, string> = { strength: 'Força', intelligence: 'Inteligência', discipline: 'Disciplina', focus: 'Foco', vitality: 'Vitalidade', charisma: 'Carisma', wisdom: 'Sabedoria', creativity: 'Criatividade' }
const ATTR_SHORT: Record<string, string> = { strength: 'Força', intelligence: 'Intel.', discipline: 'Discip.', focus: 'Foco', vitality: 'Vital.', charisma: 'Carisma', wisdom: 'Sabed.', creativity: 'Criativ.' }

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(d => { setProfile(d); setLoading(false) })
  }, [])

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!profile) return null

  const attrs = profile.attributes || {}
  const equipped = profile.inventory || []
  const radarData = Object.entries(ATTR_LABELS).map(([key, label]) => ({
    label: ATTR_SHORT[key] || label,
    value: (attrs[key] as number) || 0,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Perfil do Personagem</h1>

      {/* Hero Card */}
      <div className="glass neon-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <EvolutionAvatar name={profile.name} avatarUrl={profile.avatarUrl} level={profile.level} />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
              <RankBadge points={profile.arenaPoints || 0} size="sm" />
            </div>
            {profile.title && (
              <div className="mt-1 flex justify-center sm:justify-start">
                <TitleBadge title={profile.title} size="md" />
              </div>
            )}
            {profile.selectedClass && (
              <p className="text-sm font-medium mt-0.5" style={{ color: profile.selectedClass.color }}>
                {profile.selectedClass.icon} {profile.selectedClass.name}
              </p>
            )}
            <p className="text-slate-500 text-sm">{profile.email}</p>
            <p className="text-xs mt-0.5" style={{ color: getRank(profile.arenaPoints || 0).color }}>
              🎖️ {getRank(profile.arenaPoints || 0).label} · {profile.arenaPoints || 0} pts de Arena
            </p>
            <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{profile.level}</p>
                <p className="text-xs text-slate-500">Nível</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-amber-400">{profile.essences?.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Moedas</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-orange-400">{profile.currentStreak}</p>
                <p className="text-xs text-slate-500">Streak</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-indigo-400">{profile.totalXp?.toLocaleString()}</p>
                <p className="text-xs text-slate-500">XP Total</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <XPBar currentXp={profile.currentXp} xpForNextLevel={xpForLevel(profile.level)} level={profile.level} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attributes — Radar */}
        <div className="glass neon-border rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Atributos</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#1e1e3a" />
                <PolarAngleAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="#6366f1" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
              {Object.entries(ATTR_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">{ATTR_ICONS[key]} {label}</span>
                  <span className="text-indigo-400 font-semibold">{(attrs[key] as number) || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Combat stats derived from attributes */}
          {profile.combatStats && (
            <div className="border-t border-slate-800/60 pt-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Poder de combate</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-slate-900/50 rounded-xl py-2.5">
                  <Heart size={13} className="text-red-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500">HP</p>
                  <p className="text-sm font-bold text-red-300">{profile.combatStats.hp}</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl py-2.5">
                  <Swords size={13} className="text-orange-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500">ATK</p>
                  <p className="text-sm font-bold text-orange-300">{profile.combatStats.atk}</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl py-2.5">
                  <Shield size={13} className="text-blue-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500">DEF</p>
                  <p className="text-sm font-bold text-blue-300">{profile.combatStats.def}</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl py-2.5">
                  <Zap size={13} className="text-purple-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500">Poder</p>
                  <p className="text-sm font-bold text-purple-300">{profile.combatStats.power}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-2 text-center">Inclui bônus de equipamentos equipados</p>
            </div>
          )}
        </div>

        {/* Equipped Items */}
        <div className="space-y-4">
          <div className="glass neon-border rounded-2xl p-5">
            <h3 className="font-semibold text-slate-200 mb-4">Equipamentos Ativos</h3>
            {equipped.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Nenhum item equipado</p>
            ) : (
              <div className="space-y-2">
                {equipped.map((inv: any) => (
                  <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                    <span className="text-2xl">{inv.equipment.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{inv.equipment.name}</p>
                      <p className="text-xs text-slate-500">{inv.equipment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Achievements */}
          <div className="glass neon-border rounded-2xl p-5">
            <h3 className="font-semibold text-slate-200 mb-4">Conquistas Recentes</h3>
            {profile.userAchievements?.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Nenhuma conquista ainda</p>
            ) : (
              <div className="space-y-2">
                {profile.userAchievements?.map((ua: any) => (
                  <div key={ua.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <span className="text-2xl">{ua.achievement.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-amber-300">{ua.achievement.name}</p>
                      <p className="text-xs text-slate-500">{new Date(ua.unlockedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="glass neon-border rounded-2xl p-5">
        <h3 className="font-semibold text-slate-200 mb-4">Estatísticas Gerais</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-800/40 rounded-xl">
            <p className="text-2xl font-bold text-white">{profile.stats?.totalTasksCompleted || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Tarefas Concluídas</p>
          </div>
          <div className="text-center p-4 bg-slate-800/40 rounded-xl">
            <p className="text-2xl font-bold text-indigo-400">{profile.totalXp?.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">XP Total</p>
          </div>
          <div className="text-center p-4 bg-slate-800/40 rounded-xl">
            <p className="text-2xl font-bold text-orange-400">{profile.bestStreak}</p>
            <p className="text-xs text-slate-500 mt-1">Melhor Streak</p>
          </div>
          <div className="text-center p-4 bg-slate-800/40 rounded-xl">
            <p className="text-2xl font-bold text-amber-400">{profile.essences?.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Moedas</p>
          </div>
        </div>
        {profile.stats?.tasksByCategory?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 mb-2">Categorias mais trabalhadas</p>
            <div className="flex flex-wrap gap-2">
              {profile.stats.tasksByCategory.sort((a: any, b: any) => b._count - a._count).slice(0, 5).map((c: any) => (
                <span key={c.category} className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 border border-slate-700/60">
                  {CATEGORY_LABELS[c.category as keyof typeof CATEGORY_LABELS]} — {c._count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Segurança — Trocar senha */}
      <ChangePasswordCard />
    </div>
  )
}

function ChangePasswordCard() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.next !== form.confirm) { toast('A confirmação não confere', 'error'); return }
    if (form.next.length < 8 || !/\d/.test(form.next)) {
      toast('A nova senha deve ter ao menos 8 caracteres e 1 número', 'error'); return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast('Senha alterada com sucesso!', 'success')
        setForm({ current: '', next: '', confirm: '' })
      } else {
        toast(data.error ?? 'Não foi possível alterar a senha', 'error')
      }
    } catch {
      toast('Erro ao alterar a senha', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="glass neon-border rounded-2xl p-5">
      <h3 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
        <Lock size={17} className="text-indigo-400" /> Segurança
      </h3>
      <p className="text-xs text-slate-500 mb-4">Altere sua senha de acesso. Você continuará logado após a troca.</p>
      <form onSubmit={submit} className="space-y-3 max-w-md">
        <Input
          label="Senha atual"
          type="password"
          placeholder="Sua senha atual"
          value={form.current}
          onChange={e => setForm({ ...form, current: e.target.value })}
          icon={<Lock size={16} />}
          autoComplete="current-password"
          required
        />
        <Input
          label="Nova senha"
          type="password"
          placeholder="Mínimo 8 caracteres com 1 número"
          value={form.next}
          onChange={e => setForm({ ...form, next: e.target.value })}
          icon={<Lock size={16} />}
          autoComplete="new-password"
          required
        />
        <Input
          label="Confirmar nova senha"
          type="password"
          placeholder="Repita a nova senha"
          value={form.confirm}
          onChange={e => setForm({ ...form, confirm: e.target.value })}
          icon={<Lock size={16} />}
          autoComplete="new-password"
          required
        />
        <Button type="submit" variant="primary" loading={saving}>
          Alterar senha
        </Button>
      </form>
    </div>
  )
}
