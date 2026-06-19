'use client'
import { useEffect, useState } from 'react'
import { Gift, Sparkles, Package, Info, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ChestOpenModal } from '@/components/game/ChestOpenModal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

const RANK_COLOR: Record<string, string> = {
  E: '#94a3b8', D: '#22c55e', C: '#3b82f6', B: '#8b5cf6', A: '#f59e0b', S: '#ec4899', SPECIAL: '#a855f7',
}

export default function ChestsPage() {
  const [data, setData] = useState<any>(null)
  const [daily, setDaily] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState<any>(null)
  const [claiming, setClaiming] = useState(false)
  const [showOdds, setShowOdds] = useState(false)
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  const fetchAll = async () => {
    const [c, d] = await Promise.all([
      fetch('/api/chests').then(r => r.json()),
      fetch('/api/chests/daily-claim').then(r => r.json()),
    ])
    setData(c)
    setDaily(d)
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const claimDaily = async () => {
    setClaiming(true)
    try {
      const res = await fetch('/api/chests/daily-claim', { method: 'POST' })
      const result = await res.json()
      if (!res.ok) { toast(result.error, 'error'); return }
      const names = result.granted.map((g: any) => g.name).join(' + ')
      toast(`Recompensa diária: ${names}!`, 'success')
      await fetchAll()
    } catch { toast('Erro ao resgatar', 'error') }
    finally { setClaiming(false) }
  }

  const closeOpen = async () => {
    setOpening(null)
    await Promise.all([fetchAll(), refreshUser()])
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>

  const chests = data?.userChests || []
  const totalChests = chests.reduce((s: number, c: any) => s + c.quantity, 0)

  return (
    <>
      <ChestOpenModal opening={opening} onDone={closeOpen} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Gift className="text-purple-400" /> Caixas de Recompensa</h1>
            <p className="text-slate-400 text-sm">{totalChests} {totalChests === 1 ? 'caixa' : 'caixas'} para abrir</p>
          </div>
          <button onClick={() => setShowOdds(!showOdds)} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
            <Info size={13} /> Ver chances
          </button>
        </div>

        {/* Recompensa diária */}
        {daily && (
          <div className="glass rounded-2xl p-5 border border-purple-500/25">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center"><Calendar size={18} className="text-purple-400" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Recompensa diária do Sistema</p>
                  <p className="text-xs text-slate-500">{daily.completed}/{daily.total} missões diárias concluídas ({Math.round(daily.ratio * 100)}%)</p>
                  <div className="mt-2 h-1.5 w-40 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all" style={{ width: `${Math.min(100, daily.ratio * 100)}%` }} />
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                {daily.claimed ? (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">✓ Resgatada hoje</span>
                ) : daily.eligible ? (
                  <Button variant="gold" loading={claiming} onClick={claimDaily}><Gift size={14} /> Resgatar {daily.rewardPreview?.name}</Button>
                ) : (
                  <span className="text-xs text-slate-500 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2">Conclua 80% das diárias</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Odds */}
        {showOdds && (
          <div className="glass rounded-2xl p-5 border border-slate-700/40">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2"><Sparkles size={14} className="text-purple-400" /> Chances por caixa que você possui</h3>
            {data.odds.length === 0 ? <p className="text-xs text-slate-500">Você não tem caixas no momento.</p> : (
              <div className="space-y-2">
                {data.odds.map((o: any) => (
                  <div key={o.rank} className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold w-8" style={{ color: RANK_COLOR[o.rank] }}>{o.rank}</span>
                    <span className="text-slate-400">💎 {o.essences[0]}–{o.essences[1]}</span>
                    <span className="text-slate-400">⚡ {o.xp[0]}–{o.xp[1]} XP</span>
                    <span className="text-purple-300">Item: {o.itemChance}%</span>
                    <span className="text-cyan-300">Atributo: {o.attrChance}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grid de caixas */}
        {chests.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-slate-700/30">
            <div className="text-5xl mb-4">🗝️</div>
            <p className="text-slate-400">Você não tem caixas ainda.</p>
            <p className="text-slate-500 text-sm mt-1">Suba de nível e conclua suas missões diárias para ganhar caixas!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {chests.map((uc: any) => {
              const color = RANK_COLOR[uc.chest.rank] || '#a855f7'
              return (
                <div key={uc.id} className="glass rounded-2xl p-5 border text-center flex flex-col items-center transition-transform hover:scale-[1.03]"
                  style={{ borderColor: `${color}33`, boxShadow: `0 0 20px ${color}14` }}>
                  <div className="relative mb-2">
                    <span className="absolute inset-0 flex items-center justify-center text-5xl blur-md opacity-40">{uc.chest.icon}</span>
                    <span className="relative text-5xl float-anim">{uc.chest.icon}</span>
                    {uc.quantity > 1 && (
                      <span className="absolute -top-1 -right-2 text-xs font-bold bg-slate-900 border border-slate-700 rounded-full w-6 h-6 flex items-center justify-center text-slate-200">×{uc.quantity}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold" style={{ color }}>{uc.chest.name}</p>
                  <p className="text-[11px] text-slate-500 mb-3 line-clamp-2">{uc.chest.description}</p>
                  <Button size="sm" variant="primary" className="w-full mt-auto"
                    onClick={() => setOpening({ id: uc.id, rank: uc.chest.rank, name: uc.chest.name, icon: uc.chest.icon, color })}>
                    <Gift size={13} /> Abrir
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {/* Histórico */}
        {data.recentOpenings?.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-200 mb-3 flex items-center gap-2"><Package size={18} className="text-slate-400" /> Aberturas Recentes</h2>
            <div className="glass neon-border rounded-2xl divide-y divide-slate-800/60">
              {data.recentOpenings.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-lg">{log.chest.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">{log.chest.name}</p>
                    <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[55%]">
                    {(log.rewardsJson as any[]).map((r, i) => (
                      <span key={i} className="text-[10px] bg-slate-800/60 border border-slate-700/50 rounded px-1.5 py-0.5 text-slate-300">{r.icon} {r.label}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
