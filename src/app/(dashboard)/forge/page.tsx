'use client'
import { useEffect, useState } from 'react'
import { Hammer, Zap, Shield, Heart, Star, Wrench, ChevronRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

const RARITY_COLOR: Record<string, string> = {
  COMMON: '#94a3b8',
  UNCOMMON: '#22c55e',
  RARE: '#3b82f6',
  EPIC: '#8b5cf6',
  LEGENDARY: '#f59e0b',
  MYTHIC: '#ef4444',
}

const RARITY_LABEL: Record<string, string> = {
  COMMON: 'Comum', UNCOMMON: 'Incomum', RARE: 'Raro', EPIC: 'Épico', LEGENDARY: 'Lendário', MYTHIC: 'Mítico',
}

export default function ForgePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [working, setWorking] = useState(false)
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()
  const { refreshUser } = useAuth()

  const fetch_ = async () => {
    const res = await fetch('/api/forge')
    if (res.ok) {
      const d = await res.json()
      setData(d)
      // refresh selected to get updated state
      if (selected) setSelected((prev: any) => d.items.find((i: any) => i.id === prev?.id) ?? prev)
    }
    setLoading(false)
  }

  useEffect(() => { fetch_() }, []) // eslint-disable-line

  const upgrade = async () => {
    if (!selected) return
    setWorking(true)
    setLastResult(null)
    try {
      const res = await fetch('/api/forge/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryId: selected.id }),
      })
      const r = await res.json()
      if (!res.ok) { toast(r.error, 'error'); return }
      setLastResult({ success: r.success, message: r.message })
      await Promise.all([fetch_(), refreshUser()])
    } catch { toast('Erro na forja', 'error') }
    finally { setWorking(false) }
  }

  const repair = async () => {
    if (!selected) return
    setWorking(true)
    setLastResult(null)
    try {
      const res = await fetch('/api/forge/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryId: selected.id }),
      })
      const r = await res.json()
      if (!res.ok) { toast(r.error, 'error'); return }
      setLastResult({ success: true, message: r.message })
      await Promise.all([fetch_(), refreshUser()])
    } catch { toast('Erro no reparo', 'error') }
    finally { setWorking(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!data) return null

  const sel = selected ? data.items.find((i: any) => i.id === selected.id) ?? selected : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Hammer className="text-amber-400" /> Forja Sombria</h1>
        <p className="text-slate-400 text-sm">Aprimore e repare seus equipamentos com Essências. Cada aprimoramento aumenta o bônus do item em 5%.</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 w-fit">
        <Zap size={14} /> {data.essences} Essências disponíveis
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Item list */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Seus Equipamentos</p>
          {data.items.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center border border-slate-700/30">
              <p className="text-slate-400 text-sm">Você ainda não possui equipamentos.</p>
              <p className="text-slate-500 text-xs mt-1">Visite a Loja para adquirir itens.</p>
            </div>
          )}
          {data.items.map((item: any) => {
            const color = RARITY_COLOR[item.rarity]
            const isSel = sel?.id === item.id
            return (
              <button key={item.id} onClick={() => { setSelected(item); setLastResult(null) }}
                className={`w-full glass rounded-2xl p-3 border text-left flex items-center gap-3 transition-all ${isSel ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700/30 hover:border-slate-600/50'}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}40` }}>{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-200 truncate">{item.name}</p>
                    {item.upgradeLevel > 0 && <span className="text-xs text-amber-400 font-bold shrink-0">+{item.upgradeLevel}</span>}
                  </div>
                  <p className="text-xs truncate" style={{ color }}>{RARITY_LABEL[item.rarity]}</p>
                </div>
                <div className="text-right shrink-0">
                  <DurBar pct={item.durabilityPct} />
                  <p className="text-[10px] text-slate-600 mt-1">{item.durability}/{item.durabilityMax}</p>
                </div>
                {isSel && <ChevronRight size={14} className="text-indigo-400 shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Forge panel */}
        <div>
          {!sel ? (
            <div className="glass neon-border rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <Hammer size={40} className="text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">Selecione um equipamento para forjar</p>
            </div>
          ) : (
            <div className="glass neon-border rounded-2xl p-5 space-y-4">
              {/* Item header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0" style={{ background: `${RARITY_COLOR[sel.rarity]}18`, border: `1px solid ${RARITY_COLOR[sel.rarity]}40` }}>{sel.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{sel.name}</p>
                    {sel.upgradeLevel > 0 && <span className="text-amber-400 font-black">+{sel.upgradeLevel}</span>}
                  </div>
                  <p className="text-xs" style={{ color: RARITY_COLOR[sel.rarity] }}>{RARITY_LABEL[sel.rarity]} · {sel.type}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sel.bonusType}: {sel.baseBonus} → <span className="text-emerald-400 font-semibold">{sel.currentBonus}</span></p>
                </div>
              </div>

              {/* Durability */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1"><Shield size={11} /> Durabilidade</span>
                  <span>{sel.durability}/{sel.durabilityMax} ({sel.durabilityPct}%)</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${sel.durabilityPct > 60 ? 'bg-emerald-500' : sel.durabilityPct > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${sel.durabilityPct}%` }} />
                </div>
              </div>

              {/* Upgrade section */}
              <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"><Star size={12} className="text-amber-400" /> Aprimorar</p>
                {sel.maxed ? (
                  <p className="text-xs text-amber-400 text-center py-2">✨ Item no nível máximo (+{sel.upgradeLevel})</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800/60 rounded-lg p-2">
                        <p className="text-slate-500 mb-0.5">Nível atual</p>
                        <p className="text-white font-bold">{sel.upgradeLabel}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-2">
                        <p className="text-slate-500 mb-0.5">Próximo</p>
                        <p className="text-amber-400 font-bold">+{sel.upgradeLevel + 1}</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-2">
                        <p className="text-slate-500 mb-0.5">Custo</p>
                        <p className="text-amber-300 font-bold">{sel.nextCost} 💎</p>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-2">
                        <p className="text-slate-500 mb-0.5">Chance</p>
                        <p className={`font-bold ${parseFloat(sel.nextChance) >= 70 ? 'text-emerald-400' : parseFloat(sel.nextChance) >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{sel.nextChance}</p>
                      </div>
                    </div>
                    {sel.durability <= 0 && (
                      <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                        <AlertTriangle size={13} /> Item quebrado — repare primeiro
                      </div>
                    )}
                    <Button variant="primary" className="w-full" loading={working} disabled={!sel.canUpgrade || data.essences < sel.nextCost} onClick={upgrade}>
                      <Hammer size={14} /> Aprimorar (+{sel.upgradeLevel + 1}) · {sel.nextCost} 💎
                    </Button>
                  </>
                )}
              </div>

              {/* Repair section */}
              {sel.needsRepair && (
                <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"><Wrench size={12} className="text-blue-400" /> Reparar</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Durabilidade faltante: {sel.durabilityMax - sel.durability}</span>
                    <span>Custo: <span className="text-amber-300 font-semibold">{sel.repairCost} 💎</span></span>
                  </div>
                  <Button variant="secondary" className="w-full" loading={working} disabled={data.essences < sel.repairCost} onClick={repair}>
                    <Wrench size={14} /> Reparar Completamente · {sel.repairCost} 💎
                  </Button>
                </div>
              )}

              {/* Last action result */}
              {lastResult && (
                <div className={`rounded-xl p-3 text-sm text-center border ${lastResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                  {lastResult.success ? '✅' : '💥'} {lastResult.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent forge log */}
      {data.recent?.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-200 mb-3 flex items-center gap-2"><Hammer size={16} className="text-amber-400" /> Histórico da Forja</h2>
          <div className="glass neon-border rounded-2xl divide-y divide-slate-800/60">
            {data.recent.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-lg">{log.success ? (log.action === 'REPAIR' ? '🔧' : '⚡') : '💥'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${log.success ? 'text-slate-200' : 'text-red-300'}`}>{log.detail ?? log.action}</p>
                  <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <span className="text-xs text-amber-400 shrink-0">-{log.costEssences} 💎</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DurBar({ pct }: { pct: number }) {
  return (
    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${pct > 60 ? 'bg-emerald-500' : pct > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
