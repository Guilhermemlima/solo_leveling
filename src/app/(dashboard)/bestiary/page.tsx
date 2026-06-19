'use client'
import { useEffect, useState } from 'react'
import { Skull, Zap, Heart, Swords, Shield, Lock, AlertTriangle, Crown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BattleModal, type BattleData } from '@/components/game/BattleModal'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

const RANK_COLOR: Record<string, string> = {
  E: '#94a3b8', D: '#22c55e', C: '#3b82f6', B: '#8b5cf6', A: '#f59e0b', S: '#ef4444',
}
const RISK_COLOR: Record<string, string> = {
  red: 'text-red-400 border-red-500/30 bg-red-500/5',
  amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
}

export default function BestiaryPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [battle, setBattle] = useState<BattleData | null>(null)
  const [fighting, setFighting] = useState<string | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  const fetchBestiary = async () => {
    const res = await fetch('/api/bestiary')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }
  useEffect(() => { fetchBestiary() }, [])

  const fight = async (enemy: any) => {
    setFighting(enemy.id)
    try {
      const res = await fetch('/api/pve/battle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enemyId: enemy.id }),
      })
      const result = await res.json()
      if (!res.ok) { toast(result.error, 'error'); return }
      setSelected(null)
      setBattle(result)
    } catch { toast('Erro na batalha', 'error') }
    finally { setFighting(null) }
  }

  const closeBattle = async () => {
    setBattle(null)
    await Promise.all([fetchBestiary(), refreshUser()])
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!data) return null

  return (
    <>
      <BattleModal battle={battle} playerName={data.player.name} onClose={closeBattle} />

      {/* Detalhe do inimigo */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm glass neon-border rounded-2xl p-6" onClick={e => e.stopPropagation()}
            style={{ borderColor: `${RANK_COLOR[selected.rank]}55` }}>
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">{selected.icon}</div>
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                {selected.isBoss && <Crown size={16} className="text-amber-400" />}
              </div>
              <p className="text-xs" style={{ color: RANK_COLOR[selected.rank] }}>Rank {selected.rank} · {selected.type}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <Stat icon={<Heart size={13} className="text-red-400" />} label="HP" value={selected.hp} />
              <Stat icon={<Swords size={13} className="text-orange-400" />} label="ATK" value={selected.attack} />
              <Stat icon={<Shield size={13} className="text-blue-400" />} label="DEF" value={selected.defense} />
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 mb-4">
              {selected.weakness && <p>🎯 Fraqueza: <span className="text-slate-200">{selected.weakness}</span></p>}
              {selected.resistance && <p>🛡️ Resistência: <span className="text-slate-200">{selected.resistance}</span></p>}
              {selected.specialMechanic && <p>⚙️ {selected.specialMechanic}</p>}
              {selected.drops && <p>🎁 Drops: <span className="text-purple-300">{selected.drops}</span></p>}
              <p>⚡ Poder recomendado: <span className="text-slate-200">{selected.recommendedPower}</span> · Seu poder: <span style={{ color: RANK_COLOR[selected.rank] }}>{data.player.power}</span></p>
            </div>
            {selected.readiness.locked ? (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                <AlertTriangle size={18} className="text-red-400 mx-auto mb-1" />
                <p className="text-xs text-red-300">Você ainda não está pronto. Complete missões reais, melhore seus atributos e equipe itens melhores antes de enfrentar este inimigo.</p>
              </div>
            ) : (
              <Button variant="primary" className="w-full" loading={fighting === selected.id} onClick={() => fight(selected)}>
                <Swords size={14} /> Enfrentar
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Skull className="text-red-400" /> Bestiário</h1>
          <p className="text-slate-400 text-sm">Enfrente inimigos e chefes para ganhar XP, Essências e caixas. Seu poder atual: <span className="text-purple-300 font-semibold">{data.player.power}</span></p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.enemies.map((enemy: any) => {
            const color = RANK_COLOR[enemy.rank]
            const r = enemy.readiness
            return (
              <button key={enemy.id} onClick={() => setSelected(enemy)}
                className="glass rounded-2xl p-4 border text-left transition-transform hover:scale-[1.02] flex flex-col"
                style={{ borderColor: `${color}30` }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>{enemy.icon}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-slate-200 truncate">{enemy.name}</p>
                      {enemy.isBoss && <Crown size={13} className="text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-xs" style={{ color }}>Rank {enemy.rank} · {enemy.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                  <Zap size={11} className="text-purple-400" /> Poder {enemy.recommendedPower}
                </div>
                <span className={`text-[11px] px-2 py-1 rounded-lg border self-start mt-auto flex items-center gap-1 ${RISK_COLOR[r.color]}`}>
                  {r.locked && <Lock size={10} />} {r.label}
                </span>
              </button>
            )
          })}
        </div>

        {data.recentBattles?.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-200 mb-3">Caçadas Recentes</h2>
            <div className="glass neon-border rounded-2xl divide-y divide-slate-800/60">
              {data.recentBattles.map((b: any) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-lg">{b.won ? '🏆' : '💀'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${b.won ? 'text-emerald-300' : 'text-red-300'}`}>{b.won ? 'Vitória' : 'Derrota'} vs {b.opponentName}</p>
                    <p className="text-xs text-slate-500">{new Date(b.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <span className="text-purple-400">+{b.xpChange} XP</span>
                    {b.essenceChange > 0 && <span className="text-amber-400 ml-2">+{b.essenceChange} 💎</span>}
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="bg-slate-800/40 rounded-xl py-2">
      <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-0.5">{icon} {label}</div>
      <p className="text-sm font-bold text-slate-200">{value.toLocaleString()}</p>
    </div>
  )
}
