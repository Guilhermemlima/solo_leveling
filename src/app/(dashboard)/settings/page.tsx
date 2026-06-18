'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Save, LogOut, ShieldAlert, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [classes, setClasses] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', avatarUrl: '', selectedClassId: '' })
  const [saving, setSaving] = useState(false)
  const [penalties, setPenalties] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, avatarUrl: user.avatarUrl || '', selectedClassId: user.selectedClass?.id || '' })
      setPenalties(Boolean((user as any).penaltiesEnabled))
    }
    fetch('/api/classes').then(r => r.json()).then(setClasses)
  }, [user])

  const togglePenalties = async () => {
    const next = !penalties
    setPenalties(next)
    try {
      const res = await fetch('/api/user/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ penaltiesEnabled: next }) })
      if (!res.ok) { setPenalties(!next); toast('Erro ao salvar preferência', 'error'); return }
      await refreshUser()
      toast(next ? 'Penalidades leves ativadas' : 'Penalidades leves desativadas', 'success')
    } catch { setPenalties(!next); toast('Erro ao salvar', 'error') }
  }

  const resetProgress = async () => {
    setResetting(true)
    try {
      const res = await fetch('/api/user/reset', { method: 'POST' })
      if (!res.ok) { toast('Erro ao resetar', 'error'); return }
      await refreshUser()
      toast('Progresso resetado. Recomeçando do zero!', 'success')
      setConfirmReset(false)
      router.push('/dashboard')
    } catch { toast('Erro ao resetar', 'error') }
    finally { setResetting(false) }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { toast(data.error, 'error'); return }
      await refreshUser()
      toast('Perfil atualizado!', 'success')
    } catch { toast('Erro ao salvar', 'error') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="text-slate-400" /> Configurações</h1>
        <p className="text-slate-400 text-sm">Gerencie seu perfil e preferências</p>
      </div>

      {/* Profile */}
      <div className="glass neon-border rounded-2xl p-6">
        <h2 className="font-semibold text-slate-200 mb-4">Editar Perfil</h2>
        <form onSubmit={save} className="space-y-4">
          <Input label="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" required />
          <Input label="URL do Avatar (opcional)" value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." type="url" />
          <Select label="Classe" value={form.selectedClassId} onChange={e => setForm({ ...form, selectedClassId: e.target.value })}>
            <option value="">Sem classe</option>
            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </Select>

          {form.selectedClassId && (() => {
            const cls = classes.find(c => c.id === form.selectedClassId)
            return cls ? (
              <div className="p-3 rounded-xl border text-sm" style={{ borderColor: `${cls.color}30`, background: `${cls.color}08` }}>
                <p className="font-medium" style={{ color: cls.color }}>{cls.icon} {cls.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{cls.description}</p>
              </div>
            ) : null
          })()}

          <Button type="submit" variant="primary" loading={saving}><Save size={16} /> Salvar Alterações</Button>
        </form>
      </div>

      {/* Preferences */}
      <div className="glass neon-border rounded-2xl p-6">
        <h2 className="font-semibold text-slate-200 mb-4">Preferências</h2>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-200">Penalidades leves</p>
              <p className="text-xs text-slate-500 mt-0.5">Se ativo, ao perder a sequência por inatividade você perde algumas Essências. Nunca perde nível.</p>
            </div>
          </div>
          <button
            onClick={togglePenalties}
            role="switch"
            aria-checked={penalties}
            className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 ${penalties ? 'bg-indigo-500' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${penalties ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="glass neon-border rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold text-slate-200 mb-4">Conta</h2>
        <div className="p-3 bg-slate-800/40 rounded-xl text-sm">
          <p className="text-slate-500">Email</p>
          <p className="text-slate-200">{user?.email}</p>
        </div>
        <Button onClick={logout} variant="danger" className="w-full">
          <LogOut size={16} /> Sair da Conta
        </Button>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-6 border border-red-500/25">
        <h2 className="font-semibold text-red-400 mb-1 flex items-center gap-2"><Trash2 size={16} /> Zona de Perigo</h2>
        <p className="text-xs text-slate-500 mb-4">Resetar o progresso apaga tarefas, histórico, inventário, conquistas e zera nível, XP, Essências e atributos. A conta é mantida. Esta ação é irreversível.</p>
        <Button variant="danger" onClick={() => setConfirmReset(true)}>
          <Trash2 size={15} /> Resetar Progresso
        </Button>
      </div>

      <ConfirmModal
        open={confirmReset}
        danger
        loading={resetting}
        title="Resetar todo o progresso?"
        message="Você voltará ao nível 1 com tudo zerado. Tarefas, histórico, itens e conquistas serão apagados. Não dá para desfazer."
        confirmLabel="Sim, resetar tudo"
        onConfirm={resetProgress}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
