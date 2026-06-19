'use client'
import { useEffect, useState } from 'react'
import { Copy, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export default function CommunityPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const { toast } = useToast()
  const load = () => fetch('/api/community').then(r => r.json()).then(setGroups)
  useEffect(() => { void load() }, [])
  const submit = async (action: 'create' | 'join') => {
    const response = await fetch('/api/community', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action === 'join' ? { action, inviteCode } : { action, name }),
    })
    const data = await response.json()
    if (!response.ok) return toast(data.error, 'error')
    toast(action === 'join' ? 'Você entrou no grupo' : 'Grupo criado', 'success')
    setName(''); setInviteCode(''); load()
  }
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="text-emerald-400" /> Comunidade</h1>
      <p className="text-sm text-slate-400">Grupos privados e desafios cooperativos sem exposição pública desnecessária.</p></div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="glass rounded-2xl p-5 border border-slate-700/50"><h2 className="font-semibold text-white mb-3">Criar grupo</h2><Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do grupo" /><Button className="mt-3" onClick={() => submit('create')}><Plus size={15} /> Criar</Button></div>
      <div className="glass rounded-2xl p-5 border border-slate-700/50"><h2 className="font-semibold text-white mb-3">Entrar por convite</h2><Input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="Código de convite" /><Button className="mt-3" variant="secondary" onClick={() => submit('join')}>Entrar</Button></div>
    </div>
    {groups.map(membership => {
      const group = membership.group
      return <section key={group.id} className="glass neon-border rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-white">{group.name}</h2><p className="text-xs text-slate-500">{group.members.length} integrantes</p></div>
          <button onClick={() => { navigator.clipboard.writeText(group.inviteCode); toast('Código copiado', 'info') }} className="text-xs text-indigo-400 flex items-center gap-1"><Copy size={12} /> {group.inviteCode}</button></div>
        <div className="mt-4 space-y-3">{group.challenges.map((challenge: any) => {
          const progress = challenge.contributions.reduce((sum: number, item: any) => sum + item.value, 0)
          return <div key={challenge.id} className="rounded-xl bg-slate-900/50 p-4"><div className="flex justify-between text-sm"><span className="text-slate-200">{challenge.title}</span><span className="text-amber-400">+{challenge.reward} 💎</span></div>
            <div className="h-2 bg-slate-800 rounded-full mt-3 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${Math.min(100, progress / challenge.target * 100)}%` }} /></div>
            <p className="text-xs text-slate-500 mt-1">{progress}/{challenge.target} tarefas coletivas</p></div>
        })}</div>
      </section>
    })}
  </div>
}
