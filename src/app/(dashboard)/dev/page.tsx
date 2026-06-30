'use client'
import { useEffect, useState, useCallback } from 'react'
import { Terminal, Coins, FlaskConical, Zap, Package, Gift, Target, Swords, ShieldOff, ShoppingCart, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface DevData {
  user: { name: string; email: string; level: number; essences: number; fragments: number; plan: string | null; arenaPoints: number; currentStreak: number; penaltiesEnabled: boolean } | null
  counts: { items: number; chests: number; dailyMissions: number }
  webhooks: { provider: string; status: string; action: string | null; email: string | null; emailStatus: string | null; processedAt: string }[]
  activity: { type: string; description: string; createdAt: string }[]
}

export default function DevPage() {
  const [data, setData] = useState<DevData | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [coinAmt, setCoinAmt] = useState('100000')
  const [fragAmt, setFragAmt] = useState('10000')
  const [xpAmt, setXpAmt] = useState('5000')
  const [level, setLevel] = useState('50')
  const [plan, setPlan] = useState('vitalicio')
  const [confirmReset, setConfirmReset] = useState(false)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/dev')
    if (res.status === 403) { setForbidden(true); setLoading(false); return }
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const run = async (action: string, params: Record<string, unknown> = {}) => {
    setBusy(action)
    try {
      const res = await fetch('/api/dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...params }) })
      const json = await res.json()
      if (res.ok) { toast(json.message || 'Feito!', 'success'); await fetchData() }
      else toast(json.error || 'Erro', 'error')
    } catch { toast('Erro de rede', 'error') }
    finally { setBusy(null) }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (forbidden) return (
    <div className="glass neon-border rounded-2xl p-8 text-center max-w-md mx-auto mt-10">
      <ShieldOff size={32} className="text-red-400 mx-auto mb-3" />
      <h1 className="text-lg font-bold text-white">Acesso restrito</h1>
      <p className="text-slate-400 text-sm mt-1">Esta área é exclusiva para desenvolvedores autorizados.</p>
    </div>
  )

  const u = data?.user

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Terminal className="text-emerald-400" />
        <h1 className="text-2xl font-bold text-white">Painel de Desenvolvedor</h1>
      </div>

      {/* Estado atual */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Nível" value={u?.level} />
        <Stat label="Moedas" value={u?.essences?.toLocaleString('pt-BR')} />
        <Stat label="Fragmentos" value={u?.fragments?.toLocaleString('pt-BR')} />
        <Stat label="Itens / Caixas" value={`${data?.counts.items} / ${data?.counts.chests}`} />
      </div>

      {/* Recursos */}
      <Section title="Recursos">
        <Row>
          <Input label="Moedas" type="number" value={coinAmt} onChange={e => setCoinAmt(e.target.value)} icon={<Coins size={15} />} />
          <Button variant="primary" loading={busy==='addCoins'} onClick={() => run('addCoins', { amount: Number(coinAmt) })}>Dar moedas</Button>
        </Row>
        <Row>
          <Input label="Fragmentos" type="number" value={fragAmt} onChange={e => setFragAmt(e.target.value)} icon={<FlaskConical size={15} />} />
          <Button variant="primary" loading={busy==='addFragments'} onClick={() => run('addFragments', { amount: Number(fragAmt) })}>Dar fragmentos</Button>
        </Row>
        <Row>
          <Input label="XP" type="number" value={xpAmt} onChange={e => setXpAmt(e.target.value)} icon={<Zap size={15} />} />
          <Button variant="primary" loading={busy==='addXp'} onClick={() => run('addXp', { amount: Number(xpAmt) })}>Dar XP</Button>
        </Row>
        <Row>
          <Input label="Definir nível" type="number" value={level} onChange={e => setLevel(e.target.value)} />
          <Button variant="secondary" loading={busy==='setLevel'} onClick={() => run('setLevel', { level: Number(level) })}>Definir nível</Button>
        </Row>
      </Section>

      {/* Conteúdo */}
      <Section title="Conteúdo">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" loading={busy==='grantAllItems'} onClick={() => run('grantAllItems')}><Package size={15} /> Todos os itens</Button>
          <Button variant="secondary" loading={busy==='grantAllChests'} onClick={() => run('grantAllChests')}><Gift size={15} /> +10 de cada caixa</Button>
          <Button variant="secondary" loading={busy==='maxAttributes'} onClick={() => run('maxAttributes')}><Zap size={15} /> Atributos máx</Button>
          <Button variant="secondary" loading={busy==='maxArena'} onClick={() => run('maxArena')}><Swords size={15} /> Arena Rank S</Button>
          <Button variant="secondary" loading={busy==='resetDailyMissions'} onClick={() => run('resetDailyMissions')}><Target size={15} /> Reiniciar diárias</Button>
          <Button variant="secondary" loading={busy==='togglePenalties'} onClick={() => run('togglePenalties')}><ShieldOff size={15} /> Penalidades: {u?.penaltiesEnabled ? 'ON' : 'OFF'}</Button>
        </div>
      </Section>

      {/* Simular compra */}
      <Section title="Simular compra">
        <Row>
          <Select label="Plano" value={plan} onChange={e => setPlan(e.target.value)}>
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
            <option value="vitalicio">Fundador (Vitalício)</option>
          </Select>
          <Button variant="gold" loading={busy==='simulatePurchase'} onClick={() => run('simulatePurchase', { plan })}><ShoppingCart size={15} /> Simular compra + recompensas</Button>
        </Row>
        <p className="text-xs text-slate-500">Plano atual: <span className="text-amber-400">{u?.plan ?? 'nenhum'}</span></p>
      </Section>

      {/* Reset */}
      <Section title="Zona de risco">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-400 flex items-center gap-1.5"><AlertTriangle size={14} className="text-red-400" /> Reseta sua conta ao estado de novo usuário (apaga itens, caixas, metas, histórico).</p>
          <Button variant="danger" onClick={() => setConfirmReset(true)}><RotateCcw size={15} /> Resetar progresso</Button>
        </div>
      </Section>

      {/* Webhooks */}
      <Section title="Webhooks recentes (Cakto)">
        {data?.webhooks.length ? (
          <div className="space-y-1.5 text-xs">
            {data.webhooks.map((w, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap text-slate-400">
                <span className="text-slate-600">{new Date(w.processedAt).toLocaleString('pt-BR')}</span>
                <span className={`px-1.5 py-0.5 rounded ${w.status==='processed'?'bg-emerald-500/15 text-emerald-400':w.status==='auth_failed'?'bg-red-500/15 text-red-400':'bg-slate-700/40'}`}>{w.status}</span>
                <span>{w.action}</span>
                <span className="text-slate-300">{w.email}</span>
                {w.emailStatus && <span className={w.emailStatus==='sent'?'text-emerald-400':'text-red-400'}>email:{w.emailStatus}</span>}
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-slate-500">Nenhum webhook processado ainda.</p>}
      </Section>

      <ConfirmModal
        open={confirmReset}
        title="Resetar progresso?"
        message="Sua conta voltará ao estado de novo usuário. Itens, caixas, metas e histórico serão apagados. Não dá pra desfazer."
        confirmLabel="Resetar"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => { setConfirmReset(false); run('resetProgress') }}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="glass neon-border rounded-xl p-3"><p className="text-lg font-bold text-white truncate">{value ?? '—'}</p><p className="text-[11px] text-slate-400">{label}</p></div>
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="glass neon-border rounded-2xl p-5 space-y-3"><h2 className="font-semibold text-slate-200">{title}</h2>{children}</div>
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-end gap-2 flex-wrap [&>div]:flex-1 [&>div]:min-w-[140px]">{children}</div>
}
