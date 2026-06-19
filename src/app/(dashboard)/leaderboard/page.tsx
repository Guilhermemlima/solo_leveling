'use client'
import { useEffect, useState } from 'react'
import { Crown, Trophy, Medal, Swords } from 'lucide-react'
import { RankBadge } from '@/components/game/RankBadge'
import { RANKS, getRank } from '@/lib/ranks'

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!data) return null

  const me = data.me

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Trophy className="text-amber-400" /> Ranking de Patentes</h1>
        <p className="text-slate-400 text-sm">Suba de patente (E → S) acumulando Pontos de Arena em duelos contra jogadores.</p>
      </div>

      <div className="glass rounded-2xl p-5 border border-purple-500/20">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div><p className="text-xs uppercase tracking-wider text-purple-300">{data.season?.name}</p><p className="text-sm text-slate-500">Ranking sazonal com recompensas cosméticas e Essências.</p></div>
          <Swords className="text-purple-400" />
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {data.seasonLeaderboard.slice(0, 3).map((entry: any) => (
            <div key={entry.id} className={`rounded-xl p-3 border ${entry.isMe ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-slate-700/50 bg-slate-900/40'}`}>
              <p className="text-xs text-slate-500">#{entry.position}</p>
              <p className="text-sm font-semibold text-slate-200 truncate">{entry.name}</p>
              <p className="text-xs text-purple-300">{entry.points} pts sazonais</p>
            </div>
          ))}
        </div>
      </div>

      {/* Minha patente */}
      {me && (
        <div className="glass neon-border rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <RankBadge points={me.points} size="lg" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-white">Sua patente: <span style={{ color: getRank(me.points).color }}>{getRank(me.points).label}</span></p>
                <span className="text-sm text-slate-400">#{me.position} de {me.total}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{me.points} Pontos de Arena</p>
              {me.nextRankTier ? (
                <>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${me.progress}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Faltam <span className="text-indigo-400 font-semibold">{me.pointsToNext} pts</span> para a Patente {me.nextRankTier}</p>
                </>
              ) : (
                <p className="text-xs text-pink-400 font-semibold">🏆 Patente máxima alcançada!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Escala de patentes */}
      <div className="glass rounded-2xl p-4 border border-slate-700/40">
        <p className="text-xs text-slate-500 mb-3">Escala de patentes</p>
        <div className="flex flex-wrap items-center gap-2">
          {RANKS.map((r, i) => (
            <div key={r.tier} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm" style={{ color: r.color, background: `${r.color}18`, border: `1px solid ${r.color}55` }}>{r.tier}</span>
                <span className="text-xs text-slate-400">{r.min}+</span>
              </div>
              {i < RANKS.length - 1 && <span className="text-slate-600">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="glass neon-border rounded-2xl overflow-hidden">
        <div className="divide-y divide-slate-800/60">
          {data.leaderboard.map((e: any) => (
            <div
              key={e.id}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${e.isMe ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'}`}
            >
              {/* Posição */}
              <div className="w-8 text-center shrink-0">
                {e.position === 1 ? <Crown size={18} className="text-amber-400 mx-auto" />
                  : e.position === 2 ? <Medal size={18} className="text-slate-300 mx-auto" />
                  : e.position === 3 ? <Medal size={18} className="text-amber-700 mx-auto" />
                  : <span className="text-sm font-semibold text-slate-500">{e.position}</span>}
              </div>

              {/* Avatar + nome */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/25 to-purple-600/25 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-200 shrink-0">
                {e.avatarUrl ? <img src={e.avatarUrl} alt={e.name} className="w-full h-full rounded-xl object-cover" /> : e.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate flex items-center gap-1.5">
                  {e.name}
                  {e.isMe && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">você</span>}
                </p>
                <p className="text-xs text-slate-500">
                  Nível {e.level}{e.selectedClass ? ` · ${e.selectedClass.icon} ${e.selectedClass.name}` : ''}
                </p>
              </div>

              {/* W/L */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 shrink-0">
                <span className="text-emerald-400">{e.wins}V</span>
                <span>/</span>
                <span className="text-red-400">{e.losses}D</span>
              </div>

              {/* Pontos */}
              <div className="text-right shrink-0 w-16">
                <p className="text-sm font-bold text-white">{e.points}</p>
                <p className="text-[10px] text-slate-500">pts</p>
              </div>

              {/* Patente */}
              <RankBadge points={e.points} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
