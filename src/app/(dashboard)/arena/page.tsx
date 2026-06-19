'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Swords, Shield, Zap, Trophy, Users, Bot, Flame, Heart, Medal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BattleModal, type BattleData } from '@/components/game/BattleModal'
import { RankBadge } from '@/components/game/RankBadge'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

const DIFF_STYLE: Record<string, string> = {
  EASY: 'text-emerald-400 border-emerald-500/30',
  MEDIUM: 'text-amber-400 border-amber-500/30',
  HARD: 'text-red-400 border-red-500/30',
}

export default function ArenaPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [battle, setBattle] = useState<BattleData | null>(null)
  const [fighting, setFighting] = useState<string | null>(null)
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  const fetchArena = async () => {
    const res = await fetch('/api/arena')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchArena() }, [])

  const startBattle = async (opponent: any) => {
    setFighting(opponent.id)
    try {
      const body = opponent.type === 'BOT'
        ? { type: 'BOT', difficulty: opponent.difficulty }
        : { type: 'PLAYER', opponentId: opponent.id.replace('player:', '') }
      const res = await fetch('/api/arena/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(body),
      })
      const result = await res.json()
      if (!res.ok) { toast(result.error, 'error'); return }
      setBattle(result)
    } catch { toast('Erro na batalha', 'error') }
    finally { setFighting(null) }
  }

  const closeBattle = async () => {
    setBattle(null)
    await Promise.all([fetchArena(), refreshUser()])
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!data) return null

  const p = data.player
  const total = p.wins + p.losses
  const winRate = total > 0 ? Math.round((p.wins / total) * 100) : 0

  return (
    <>
      <BattleModal battle={battle} playerName={p.name} onClose={closeBattle} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Swords className="text-indigo-400" /> Arena de Batalha</h1>
            <p className="text-slate-400 text-sm">Lute contra bots ou jogadores do seu nível para evoluir. Seu poder vem dos atributos, nível e equipamentos.</p>
          </div>
          <Link href="/leaderboard">
            <Button variant="secondary"><Medal size={15} /> Ver Ranking</Button>
          </Link>
        </div>

        <div className="glass rounded-2xl p-4 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs text-purple-300 uppercase tracking-wider">{data.season.name}</p><p className="text-sm text-slate-300">{p.seasonPoints} pontos sazonais</p></div>
          <div className="text-right"><p className="text-xs text-slate-500">Batalhas restantes hoje</p><p className="text-xl font-bold text-white">{data.battlesRemaining}/20</p></div>
        </div>

        {/* Stats do jogador */}
        <div className="glass neon-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <RankBadge points={p.points} size="md" />
              <div>
                <p className="text-sm font-semibold text-white">Sua patente</p>
                <p className="text-xs text-slate-500">{p.points} Pontos de Arena</p>
              </div>
            </div>
            <Link href="/leaderboard" className="text-xs text-indigo-400 hover:text-indigo-300">Ver ranking →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <Stat icon={<Trophy size={18} className="text-amber-400" />} label="Vitórias" value={p.wins} />
            <Stat icon={<Swords size={18} className="text-red-400" />} label="Derrotas" value={p.losses} />
            <Stat icon={<Flame size={18} className="text-emerald-400" />} label="Aproveitamento" value={`${winRate}%`} />
            <Stat icon={<Shield size={18} className="text-indigo-400" />} label="Pontos de Arena" value={p.points} />
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <CombatStat icon={<Heart size={14} className="text-red-400" />} label="HP" value={p.stats.hp} />
            <CombatStat icon={<Swords size={14} className="text-orange-400" />} label="ATK" value={p.stats.atk} />
            <CombatStat icon={<Shield size={14} className="text-blue-400" />} label="DEF" value={p.stats.def} />
            <CombatStat icon={<Zap size={14} className="text-indigo-400" />} label="Poder" value={p.stats.power} />
          </div>
        </div>

        {/* Bots */}
        <div>
          <h2 className="font-semibold text-slate-200 mb-3 flex items-center gap-2"><Bot size={18} className="text-slate-400" /> Treino contra Autômatos</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {data.bots.map((bot: any) => (
              <div key={bot.id} className={`glass rounded-2xl p-4 border ${DIFF_STYLE[bot.difficulty]} flex flex-col`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-xl">{bot.icon}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{bot.name}</p>
                    <p className={`text-xs font-medium ${DIFF_STYLE[bot.difficulty].split(' ')[0]}`}>{bot.difficultyLabel} · Nv {bot.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                  <Zap size={12} className="text-indigo-400" /> Poder {bot.power}
                </div>
                <div className="text-[11px] text-slate-500 mb-3 flex justify-between">
                  <span className={bot.risk.color === 'red' ? 'text-red-400' : bot.risk.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}>{bot.risk.label}</span>
                  <span>+{bot.rewards.xp} XP · +{bot.rewards.essences} 💎</span>
                </div>
                <Button size="sm" variant="primary" className="w-full mt-auto" loading={fighting === bot.id} onClick={() => startBattle(bot)}>
                  <Swords size={13} /> Batalhar
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Jogadores */}
        <div>
          <h2 className="font-semibold text-slate-200 mb-3 flex items-center gap-2"><Users size={18} className="text-slate-400" /> Duelos contra Jogadores</h2>
          {data.players.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center border border-slate-700/30">
              <div className="text-4xl mb-2">🧑‍🤝‍🧑</div>
              <p className="text-slate-400 text-sm">Nenhum jogador do seu nível disponível agora.</p>
              <p className="text-slate-500 text-xs mt-1">Continue evoluindo — novos desafiantes aparecem conforme a comunidade cresce.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.players.map((pl: any) => (
                <div key={pl.id} className="glass rounded-2xl p-4 border border-slate-700/40 hover:border-purple-500/30 transition-all flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/25 to-indigo-500/25 border border-purple-500/30 flex items-center justify-center text-lg font-bold text-purple-200">{pl.icon}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{pl.name}</p>
                      <p className="text-xs text-slate-500">Nível {pl.level} · {pl.arenaPoints} pts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                    <Zap size={12} className="text-indigo-400" /> Poder {pl.power}
                  </div>
                  <div className="text-[11px] text-slate-500 mb-3 flex justify-between">
                    <span className={pl.risk.color === 'red' ? 'text-red-400' : pl.risk.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}>{pl.risk.label}</span>
                    <span>+{pl.rewards.xp} XP · +15 pts</span>
                  </div>
                  <Button size="sm" variant="secondary" className="w-full mt-auto" loading={fighting === pl.id} onClick={() => startBattle(pl)}>
                    <Swords size={13} /> Desafiar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico */}
        {data.recentBattles.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-200 mb-3">Últimas Batalhas</h2>
            <div className="glass neon-border rounded-2xl divide-y divide-slate-800/60">
              {data.recentBattles.map((b: any) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-lg">{b.won ? '🏆' : '💀'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${b.won ? 'text-emerald-300' : 'text-red-300'}`}>{b.won ? 'Vitória' : 'Derrota'} vs {b.opponentName}</p>
                    <p className="text-xs text-slate-500">{new Date(b.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <span className="text-indigo-400">+{b.xpChange} XP</span>
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
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">{icon}</div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

function CombatStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="bg-slate-800/40 rounded-xl py-2">
      <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-0.5">{icon} {label}</div>
      <p className="text-sm font-bold text-slate-200">{value}</p>
    </div>
  )
}
