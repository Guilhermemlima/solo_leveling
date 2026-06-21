'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CalendarDays, Download, FileText, LogOut, Save, Settings, ShieldAlert, Trash2, Upload, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { SPECIALIZATIONS } from '@/lib/specializations'
import { AvatarPicker } from '@/components/ui/AvatarPicker'

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
  const [resetInput, setResetInput] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

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
      new Notification('Ascend System', { body: 'Lembretes ativados. Sua próxima missão espera por você.', icon: '/icon.svg' })
    }
    setNotifications(next)
    try { await patchSettings({ notificationsEnabled: next }); toast('Preferência salva', 'success') }
    catch { setNotifications(!next); toast('Erro ao salvar', 'error') }
  }

  const resetProgress = async () => {
    setBusy(true)
    const response = await fetch('/api/user/reset', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: resetPassword }),
    })
    const data = await response.json()
    if (response.ok) { await refreshUser(); router.push('/dashboard'); toast('Progresso reiniciado', 'success') }
    else toast(data.error ?? 'Erro ao resetar', 'error')
    setBusy(false); setConfirmReset(false); setResetInput(''); setResetPassword('')
  }

  const deleteAccount = async () => {
    setBusy(true)
    const response = await fetch('/api/user/account', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: deletePassword }),
    })
    const data = await response.json()
    if (response.ok) { toast('Conta excluída', 'info'); router.push('/login') }
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

    {showAvatarPicker && (
      <AvatarPicker
        current={form.avatarUrl}
        onSelect={async (dataUrl) => {
          setForm(f => ({ ...f, avatarUrl: dataUrl }))
          setShowAvatarPicker(false)
          try {
            await fetch('/api/user/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ avatarUrl: dataUrl }),
            })
            await refreshUser()
            toast('Avatar atualizado!', 'success')
          } catch {
            toast('Erro ao salvar avatar', 'error')
          }
        }}
        onClose={() => setShowAvatarPicker(false)}
      />
    )}

    <form onSubmit={saveProfile} className="glass neon-border rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold text-slate-200">Perfil e evolução</h2>

      {/* Avatar picker trigger */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {form.avatarUrl ? (
            <img src={form.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/50" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)' }} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center text-3xl">👤</div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-200 mb-1">Foto de perfil</p>
          <p className="text-xs text-slate-500 mb-3">Escolha um avatar da galeria ou envie uma foto</p>
          <button
            type="button"
            onClick={() => setShowAvatarPicker(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-purple-500/20 transition-all"
          >
            <UserCircle size={15} /> Alterar avatar
          </button>
        </div>
      </div>

      <Input label="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
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
      <button onClick={() => window.open('/report', '_blank')} className="flex items-center justify-center gap-2 w-full rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-2.5 text-sm font-semibold text-purple-300 hover:bg-purple-500/20 transition-all">
        <FileText size={15} /> Gerar Relatório PDF de Evolução
      </button>
      <a href="/api/user/export" download><Button variant="secondary" className="w-full"><Download size={15} /> Exportar dados brutos (JSON)</Button></a>
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

    {confirmReset && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass neon-border rounded-2xl p-6 max-w-md w-full space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-red-400">Resetar todo o progresso?</h3>
            <p className="text-sm text-slate-400 mt-2">
              Esta ação é <strong className="text-red-400">irreversível</strong>. Tarefas, histórico, inventário, conquistas e todo seu progresso serão apagados permanentemente.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">
              Digite <strong className="text-red-400">RESETAR</strong> para confirmar:
            </label>
            <input
              type="text"
              value={resetInput}
              onChange={e => setResetInput(e.target.value.toUpperCase())}
              placeholder="RESETAR"
              className="w-full bg-slate-900/60 border border-red-500/30 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 px-4 py-2.5 text-sm"
            />
            <label className="text-sm text-slate-400">Sua senha para confirmar:</label>
            <input
              type="password"
              value={resetPassword}
              onChange={e => setResetPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/60 border border-red-500/30 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 px-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setConfirmReset(false); setResetInput('') }}
              className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={resetProgress}
              disabled={resetInput !== 'RESETAR' || !resetPassword || busy}
              className="flex-1 py-2.5 rounded-lg bg-red-500/80 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
            >
              {busy ? 'Resetando...' : 'Confirmar Reset'}
            </button>
          </div>
        </div>
      </div>
    )}
    <ConfirmModal open={confirmDelete} danger loading={busy} title="Excluir conta definitivamente?" message="Todos os seus dados serão removidos. Esta ação não pode ser desfeita." confirmLabel="Excluir conta" onConfirm={deleteAccount} onCancel={() => setConfirmDelete(false)} />
  </div>
}

function Toggle({ icon, title, description, checked, onClick }: { icon: React.ReactNode; title: string; description: string; checked: boolean; onClick: () => void }) {
  return <div className="flex items-center justify-between gap-4"><div className="flex gap-3">{icon}<div><p className="text-sm text-slate-200">{title}</p><p className="text-xs text-slate-500">{description}</p></div></div>
    <button role="switch" aria-checked={checked} onClick={onClick} className={`relative w-11 h-6 rounded-full shrink-0 ${checked ? 'bg-indigo-500' : 'bg-slate-700'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} /></button></div>
}
