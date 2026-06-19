'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CalendarDays, Download, LogOut, Save, Settings, ShieldAlert, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { SPECIALIZATIONS } from '@/lib/specializations'

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [classes, setClasses] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', avatarUrl: '', selectedClassId: '' })
  const [penalties, setPenalties] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const [specialization, setSpecialization] = useState('ARCHITECT')
  const [saving, setSaving] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, avatarUrl: user.avatarUrl || '', selectedClassId: user.selectedClass?.id || '' })
      setPenalties(Boolean(user.penaltiesEnabled))
      setNotifications(Boolean(user.notificationsEnabled))
      setSpecialization(user.specialization || 'ARCHITECT')
    }
    fetch('/api/classes').then(response => response.json()).then(setClasses)
  }, [user])

  const patchSettings = async (patch: Record<string, unknown>) => {
    const response = await fetch('/api/user/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
    })
    if (!response.ok) throw new Error()
    await refreshUser()
  }

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) return toast(data.error, 'error')
      await patchSettings({ specialization })
      toast('Perfil atualizado', 'success')
    } catch { toast('Erro ao salvar', 'error') } finally { setSaving(false) }
  }

  const toggleNotifications = async () => {
    const next = !notifications
    if (next && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return toast('Permissão de notificações não concedida', 'error')
      new Notification('Chi Navy System', { body: 'Lembretes ativados. Sua próxima missão espera por você.', icon: '/icon.svg' })
    }
    setNotifications(next)
    try { await patchSettings({ notificationsEnabled: next }); toast('Preferência salva', 'success') }
    catch { setNotifications(!next); toast('Erro ao salvar', 'error') }
  }

  const resetProgress = async () => {
    setBusy(true)
    const response = await fetch('/api/user/reset', { method: 'POST' })
    if (response.ok) { await refreshUser(); router.push('/dashboard'); toast('Progresso reiniciado', 'success') }
    else toast('Erro ao resetar', 'error')
    setBusy(false); setConfirmReset(false)
  }

  const deleteAccount = async () => {
    setBusy(true)
    const response = await fetch('/api/user/account', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: deletePassword }),
    })
    const data = await response.json()
    if (response.ok) { toast('Conta excluída', 'info'); router.push('/register') }
    else toast(data.error, 'error')
    setBusy(false); setConfirmDelete(false)
  }

  const importData = async (file?: File) => {
    if (!file) return
    try {
      const payload = JSON.parse(await file.text())
      const response = await fetch('/api/user/import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const data = await response.json()
      toast(response.ok ? `${data.imported} tarefas importadas` : data.error, response.ok ? 'success' : 'error')
    } catch {
      toast('Arquivo JSON inválido', 'error')
    }
  }

  return <div className="space-y-6 max-w-2xl">
    <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="text-slate-400" /> Configurações</h1>
      <p className="text-sm text-slate-400">Perfil, preferências, privacidade e seus dados.</p></div>

    <form onSubmit={saveProfile} className="glass neon-border rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold text-slate-200">Perfil e evolução</h2>
      <Input label="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
      <Input label="URL do avatar" type="url" value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." />
      <Select label="Classe" value={form.selectedClassId} onChange={e => setForm({ ...form, selectedClassId: e.target.value })}>
        <option value="">Sem classe</option>{classes.map(item => <option key={item.id} value={item.id}>{item.icon} {item.name}</option>)}
      </Select>
      <Select label="Especialização" value={specialization} onChange={e => setSpecialization(e.target.value)}>
        {SPECIALIZATIONS.map(item => <option key={item.key} value={item.key}>{item.icon} {item.name}</option>)}
      </Select>
      <Button type="submit" loading={saving}><Save size={15} /> Salvar alterações</Button>
    </form>

    <section className="glass neon-border rounded-2xl p-6 space-y-5">
      <h2 className="font-semibold text-slate-200">Preferências</h2>
      <Toggle icon={<ShieldAlert className="text-amber-400" size={18} />} title="Penalidades leves"
        description="Ao quebrar o streak, perde poucas Essências; nunca perde nível." checked={penalties}
        onClick={async () => { const next = !penalties; setPenalties(next); try { await patchSettings({ penaltiesEnabled: next }) } catch { setPenalties(!next) } }} />
      <Toggle icon={<Bell className="text-indigo-400" size={18} />} title="Lembretes do navegador"
        description="Ativa notificações locais. Você pode revogar a permissão no navegador." checked={notifications} onClick={toggleNotifications} />
    </section>

    <section className="glass neon-border rounded-2xl p-6 space-y-3">
      <h2 className="font-semibold text-slate-200">Conta e dados</h2>
      <div className="rounded-xl bg-slate-900/50 p-3 text-sm"><p className="text-slate-500">E-mail</p><p className="text-slate-200">{user?.email}</p></div>
      <a href="/api/user/export" download><Button variant="secondary" className="w-full"><Download size={15} /> Exportar todos os meus dados</Button></a>
      <a href="/api/user/calendar" download><Button variant="secondary" className="w-full"><CalendarDays size={15} /> Exportar tarefas para o calendário</Button></a>
      <label className="block">
        <input type="file" accept="application/json" className="hidden" onChange={event => void importData(event.target.files?.[0])} />
        <span className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 cursor-pointer"><Upload size={15} /> Restaurar tarefas de uma exportação</span>
      </label>
      <Button onClick={logout} variant="ghost" className="w-full"><LogOut size={15} /> Sair</Button>
    </section>

    <section className="glass rounded-2xl p-6 border border-red-500/25 space-y-4">
      <div><h2 className="font-semibold text-red-400 flex items-center gap-2"><Trash2 size={16} /> Zona de perigo</h2>
        <p className="text-xs text-slate-500 mt-1">Ações irreversíveis, sempre com confirmação.</p></div>
      <Button variant="danger" onClick={() => setConfirmReset(true)}>Resetar progresso</Button>
      <div className="border-t border-red-500/10 pt-4"><Input label="Senha para excluir a conta" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
        <Button variant="danger" className="mt-3" disabled={!deletePassword} onClick={() => setConfirmDelete(true)}>Excluir minha conta</Button></div>
    </section>

    <ConfirmModal open={confirmReset} danger loading={busy} title="Resetar progresso?" message="Tarefas, itens, conquistas e evolução serão apagados. Sua conta será mantida." confirmLabel="Resetar" onConfirm={resetProgress} onCancel={() => setConfirmReset(false)} />
    <ConfirmModal open={confirmDelete} danger loading={busy} title="Excluir conta definitivamente?" message="Todos os seus dados serão removidos. Esta ação não pode ser desfeita." confirmLabel="Excluir conta" onConfirm={deleteAccount} onCancel={() => setConfirmDelete(false)} />
  </div>
}

function Toggle({ icon, title, description, checked, onClick }: { icon: React.ReactNode; title: string; description: string; checked: boolean; onClick: () => void }) {
  return <div className="flex items-center justify-between gap-4"><div className="flex gap-3">{icon}<div><p className="text-sm text-slate-200">{title}</p><p className="text-xs text-slate-500">{description}</p></div></div>
    <button role="switch" aria-checked={checked} onClick={onClick} className={`relative w-11 h-6 rounded-full shrink-0 ${checked ? 'bg-indigo-500' : 'bg-slate-700'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} /></button></div>
}
