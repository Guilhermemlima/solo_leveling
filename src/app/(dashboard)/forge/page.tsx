'use client'
import { useEffect, useState } from 'react'
import { Hammer, Zap, Shield, Star, Wrench, ChevronRight, AlertTriangle, Flame, Trash2, Shuffle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

const RARITY_COLOR: Record<string, string> = {
  COMMON: '#94a3b8', UNCOMMON: '#22c55e', RARE: '#3b82f6',
  EPIC: '#8b5cf6', LEGENDARY: '#f59e0b', MYTHIC: '#ef4444',
}
const RARITY_LABEL: Record<string, string> = {
  COMMON: 'Comum', UNCOMMON: 'Incomum', RARE: 'Raro', EPIC: 'Épico', LEGENDARY: 'Lendário', MYTHIC: 'Mítico',
}
const RARITY_ORDER = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC']
const MERGE_COST: Record<string, number> = { COMMON: 5, UNCOMMON: 12, RARE: 25, EPIC: 50, LEGENDARY: 100 }
const DISMANTLE_FRAGS: Record<string, number> = { COMMON: 2, UNCOMMON: 5, RARE: 12, EPIC: 25, LEGENDARY: 50, MYTHIC: 100 }

type Tab = 'forge' | 'fusao'

export default function ForgePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('forge')
  const [selected, setSelected] = useState<any>(null)
  const [mergeSelected, setMergeSelected] = useState<string[]>([])
  const [working, setWorking] = useState(false)
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const router = useRouter()

  const fetch_ = async () => {
    const res = await fetch('/api/forge')
    if (res.ok) {
      const d = await res.json()
      setData(d)
      if (selected) setSelected((prev: any) => d.items.find((i: any) => i.id === prev?.id) ?? null)
    }
    setLoading(false)
  }

  useEffect(() => { fetch_() }, []) // eslint-disable-line

  const upgrade = async () => {
    if (!selected) return
    setWorking(true); setLastResult(null)
    try {
      const res = await fetch('/api/forge/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inventoryId: selected.id }) })
      const r = await res.json()
      if (!res.ok) { toast(r.error, 'error'); return }
      setLastResult({ success: r.success, message: r.message })
      router.refresh()
      await Promise.all([fetch_(), refreshUser()])
    } catch { toast('Erro na forja', 'error') }
    finally { setWorking(false) }
  }

  const repair = async () => {
    if (!selected) return
    setWorking(true); setLastResult(null)
    try {
      const res = await fetch('/api/forge/repair', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inventoryId: selected.id }) })
      const r = await res.json()
      if (!res.ok) { toast(r.error, 'error'); return }
      setLastResult({ success: true, message: r.message })
      router.refresh()
      await Promise.all([fetch_(), refreshUser()])
    } catch { toast('Erro no reparo', 'error') }
    finally { setWorking(false) }
  }

  const dismantle = async (invId: string) => {
    setWorking(true); setLastResult(null)
    try {
      const res = await fetch('/api/forge/dismantle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inventoryId: invId }) })
      const r = await res.json()
      if (!res.ok) { toast(r.error, 'error'); return }
      setLastResult({ success: true, message: r.message })
      if (selected?.id === invId) setSelected(null)
      router.refresh()
      await Promise.all([fetch_(), refreshUser()])
    } catch { toast('Erro ao desmantelar', 'error') }
    finally { setWorking(false) }
  }

  const merge = async () => {
    if (mergeSelected.length !== 3) return
    setWorking(true); setLastResult(null)
    try {
      const res = await fetch('/api/forge/merge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inventoryIds: mergeSelected }) })
      const r = await res.json()
      if (!res.ok) { toast(r.error, 'error'); return }
      setLastResult({ success: true, message: r.message })
      setMergeSelected([])
      router.refresh()
      await Promise.all([fetch_(), refreshUser()])
    } catch { toast('Erro na fusão', 'error') }
    finally { setWorking(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!data) return null

  const sel = selected ? data.items.find((i: any) => i.id === selected.id) ?? selected : null

  // Merge logic
  const mergeItems = data.items.filter((i: any) => !i.isEquipped)
  const selectedMergeItems = mergeItems.filter((i: any) => mergeSelected.includes(i.id))
  const mergeRarities = [...new Set(selectedMergeItems.map((i: any) => i.equipment?.rarity ?? i.rarity))]
  const mergeTypes = [...new Set(selectedMergeItems.map((i: any) => i.equipment?.type ?? i.type))]
  const mergeValid = mergeSelected.length === 3 && mergeRarities.length === 1
  const mergeRarity = selectedMergeItems[0]?.equipment?.rarity ?? selectedMergeItems[0]?.rarity
  const mergeCost = mergeRarity ? MERGE_COST[mergeRarity] ?? 0 : 0
  const nextRarity = mergeRarity ? RARITY_ORDER[RARITY_ORDER.indexOf(mergeRarity) + 1] : null

  const toggleMerge = (id: string) => {
    setMergeSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Hammer className="text-amber-400" /> Forja Sombria</h1>
        <p className="text-slate-400 text-sm">Aprimore equipamentos com Moedas · Funda itens usando Fragmentos de Forja</p>
      </div>

      {/* Currency display */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
          <Zap size={14} /> {data.essences} Moedas
        </div>
        <div className="flex items-center gap-2 text-sm text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2">
          <Flame size={14} /> {data.fragments} Fragmentos de Forja ⚗️
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 rounded-xl p-1 w-fit border border-slate-800/60">
        {([['forge', '⚒️ Aprimorar'], ['fusao', '🔮 Fusão']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => { setTab(t); setLastResult(null) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-indigo-600/70 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── FORGE TAB ── */}
      {tab === 'forge' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Item list */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Seus Equipamentos</p>
            {data.items.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center border border-slate-700/30">
                <p className="text-slate-400 text-sm">Você ainda não possui equipamentos.</p>
              </div>
            )}
            {data.items.map((item: any) => {
              const color = RARITY_COLOR[item.rarity]
              const isSel = sel?.id === item.id
              return (
                <button key={item.id} onClick={() => { setSelected(item); setLastResult(null) }}
                  className={`w-full glass rounded-2xl p-3 border text-left flex items-center gap-3 transition-all ${isSel ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700/30 hover:border-slate-600/50'}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 overflow-hidden" style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                    {item.imageUrl ? <OptimizedImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : item.icon}
                  </div>
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
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 overflow-hidden" style={{ background: `${RARITY_COLOR[sel.rarity]}18`, border: `1px solid ${RARITY_COLOR[sel.rarity]}40` }}>
                    {sel.imageUrl ? <OptimizedImage src={sel.imageUrl} alt={sel.name} className="w-full h-full object-cover" /> : sel.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{sel.name}</p>
                      {sel.upgradeLevel > 0 && <span className="text-amber-400 font-black">+{sel.upgradeLevel}</span>}
                    </div>
                    <p className="text-xs" style={{ color: RARITY_COLOR[sel.rarity] }}>{RARITY_LABEL[sel.rarity]} · {sel.type}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sel.bonusType}: {sel.baseBonus} → <span className="text-emerald-400 font-semibold">{sel.currentBonus}</span></p>
                  </div>
                  {/* Dismantle button */}
                  {!sel.isEquipped && (
                    <button
                      onClick={() => dismantle(sel.id)}
                      disabled={working}
                      className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition-all disabled:opacity-50"
                      title="Desmantelar"
                    >
                      <Trash2 size={13} />
                      <span className="text-[9px]">+{(DISMANTLE_FRAGS[sel.rarity] ?? 2) + sel.upgradeLevel}⚗️</span>
                    </button>
                  )}
                </div>

                {/* Durability */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Shield size={11} /> Durabilidade</span>
                    <span>{sel.durability}/{sel.durabilityMax} ({sel.durabilityPct}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${sel.durabilityPct > 60 ? 'bg-emerald-500' : sel.durabilityPct > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${sel.durabilityPct}%` }} />
                  </div>
                </div>

                {/* Upgrade */}
                <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"><Star size={12} className="text-amber-400" /> Aprimorar</p>
                  {sel.maxed ? (
                    <p className="text-xs text-amber-400 text-center py-2">✨ Item no nível máximo (+{sel.upgradeLevel})</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-800/60 rounded-lg p-2"><p className="text-slate-500 mb-0.5">Nível atual</p><p className="text-white font-bold">{sel.upgradeLabel}</p></div>
                        <div className="bg-slate-800/60 rounded-lg p-2"><p className="text-slate-500 mb-0.5">Próximo</p><p className="text-amber-400 font-bold">+{sel.upgradeLevel + 1}</p></div>
                        <div className="bg-slate-800/60 rounded-lg p-2"><p className="text-slate-500 mb-0.5">Custo</p><p className="text-amber-300 font-bold">{sel.nextCost} 💎</p></div>
                        <div className="bg-slate-800/60 rounded-lg p-2"><p className="text-slate-500 mb-0.5">Chance</p><p className={`font-bold ${parseFloat(sel.nextChance) >= 70 ? 'text-emerald-400' : parseFloat(sel.nextChance) >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{sel.nextChance}</p></div>
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

                {/* Repair */}
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

                {lastResult && (
                  <div className={`rounded-xl p-3 text-sm text-center border ${lastResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                    {lastResult.success ? '✅' : '💥'} {lastResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FUSÃO TAB ── */}
      {tab === 'fusao' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Item picker */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Selecione 3 itens da mesma raridade (qualquer tipo)</p>
              <p className="text-xs text-slate-600">Itens equipados não podem ser fundidos</p>
            </div>
            {mergeItems.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center border border-slate-700/30">
                <p className="text-slate-400 text-sm">Nenhum item disponível para fusão.</p>
              </div>
            )}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {mergeItems.map((item: any) => {
                const color = RARITY_COLOR[item.rarity]
                const isSel = mergeSelected.includes(item.id)
                const disabled = !isSel && mergeSelected.length >= 3
                return (
                  <button key={item.id}
                    onClick={() => !disabled && toggleMerge(item.id)}
                    disabled={disabled}
                    className={`w-full glass rounded-xl p-3 border text-left flex items-center gap-3 transition-all ${isSel ? 'border-purple-500/60 bg-purple-500/8' : disabled ? 'border-slate-800/20 opacity-40' : 'border-slate-700/30 hover:border-slate-600/50'}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSel ? 'border-purple-400 bg-purple-500/20' : 'border-slate-600'}`}>
                      {isSel && <span className="text-purple-300 text-xs font-black">{mergeSelected.indexOf(item.id) + 1}</span>}
                    </div>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 overflow-hidden" style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                      {item.imageUrl ? <OptimizedImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-slate-200 truncate">{item.name}</p>
                        {item.upgradeLevel > 0 && <span className="text-[10px] text-amber-400 font-bold">+{item.upgradeLevel}</span>}
                      </div>
                      <p className="text-xs" style={{ color }}>{RARITY_LABEL[item.rarity]}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fusion panel */}
          <div>
            <div className="glass neon-border rounded-2xl p-5 space-y-5">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shuffle size={13} className="text-purple-400" /> Painel de Fusão
              </p>

              {/* Selected items */}
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => {
                  const item = selectedMergeItems[i]
                  const color = item ? RARITY_COLOR[item.rarity] : '#334155'
                  return (
                    <div key={i} className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all"
                      style={{ borderColor: item ? `${color}60` : '#334155', background: item ? `${color}0c` : 'rgba(15,23,42,0.4)' }}>
                      {item ? (
                        <>
                          {item.imageUrl
                            ? <OptimizedImage src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                            : <span className="text-2xl">{item.icon}</span>}
                          <span className="text-[9px] text-slate-400 text-center px-1 leading-tight truncate w-full text-center">{item.name}</span>
                        </>
                      ) : (
                        <span className="text-slate-700 text-2xl">?</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Arrow + result */}
              <div className="text-center space-y-3">
                <div className="text-2xl">{mergeSelected.length === 3 ? '⬇️' : '···'}</div>
                {nextRarity && mergeValid ? (
                  <div className="rounded-xl border p-3 text-center space-y-1" style={{ borderColor: `${RARITY_COLOR[nextRarity]}40`, background: `${RARITY_COLOR[nextRarity]}0a` }}>
                    <p className="text-xs text-slate-400">Resultado</p>
                    <p className="font-bold text-lg" style={{ color: RARITY_COLOR[nextRarity] }}>✨ {RARITY_LABEL[nextRarity]}</p>
                    <p className="text-xs text-slate-500">Item aleatório de qualquer tipo</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 p-3 text-center">
                    <p className="text-slate-600 text-sm">Selecione 3 itens de mesma raridade</p>
                  </div>
                )}
              </div>

              {/* Validation warnings */}
              {mergeSelected.length === 3 && !mergeValid && (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                  <AlertTriangle size={13} />
                  Raridades diferentes — selecione 3 itens da mesma raridade
                </div>
              )}

              {/* Cost */}
              {mergeValid && (
                <div className="flex items-center justify-between text-sm bg-slate-900/50 rounded-xl px-4 py-3">
                  <span className="text-slate-400">Custo de fusão</span>
                  <span className={`font-bold ${data.fragments >= mergeCost ? 'text-purple-300' : 'text-red-400'}`}>
                    {mergeCost} ⚗️ {data.fragments < mergeCost && '(insuficiente)'}
                  </span>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
                loading={working}
                disabled={!mergeValid || data.fragments < mergeCost}
                onClick={merge}
                style={{ background: mergeValid ? 'linear-gradient(135deg,#7c3aed,#6366f1)' : undefined }}
              >
                <Shuffle size={14} /> Fundir 3 Itens · {mergeCost} ⚗️
              </Button>

              {lastResult && (
                <div className={`rounded-xl p-3 text-sm text-center border ${lastResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                  {lastResult.success ? '✨' : '💥'} {lastResult.message}
                </div>
              )}

              {/* How it works */}
              <div className="text-xs text-slate-600 space-y-1 border-t border-slate-800/60 pt-3">
                <p className="text-slate-500 font-medium mb-1">Como funciona:</p>
                <p>• Selecione 3 itens da <strong className="text-slate-400">mesma raridade</strong> (qualquer tipo ou classe)</p>
                <p>• Os 3 itens são consumidos na fusão</p>
                <p>• Você recebe 1 item aleatório da <strong className="text-slate-400">raridade superior</strong></p>
                <p>• Fragmentos ⚗️ são ganhos ao completar tarefas e desmantelar itens</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forge log */}
      {data.recent?.length > 0 && tab === 'forge' && (
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
