'use client'
import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Swords, Shield, Zap, Trophy, Users, Bot, Flame, Heart, Medal,
  Search, Crown, Lock, AlertTriangle, Star, X, ChevronRight, Package, Skull,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BattleModal, type BattleData } from '@/components/game/BattleModal'
import { RankBadge } from '@/components/game/RankBadge'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Enemy {
  id: string
  key: string
  name: string
  rank: string
  type: string
  isBoss: boolean
  icon: string
  imageUrl?: string | null
  hp: number
  attack: number
  defense: number
  weakness: string | null
  resistance: string | null
  specialMechanic: string | null
  recommendedPower: number
  drops: string | null
  readiness: { state: string; label: string; color: string; ratio: number; locked: boolean }
}

interface EnemyPlayer {
  name: string
  level: number
  power: number
  stats: { hp: number; atk: number; def: number; power: number }
}

type RankFilter = 'ALL' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'BOSS'

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFF_STYLE: Record<string, { text: string; border: string; bg: string }> = {
  EASY:      { text: 'text-slate-400',   border: 'border-slate-600/40',   bg: 'bg-slate-700/10' },
  MEDIUM:    { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  HARD:      { text: 'text-amber-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/5' },
  ELITE:     { text: 'text-orange-400',  border: 'border-orange-500/30',  bg: 'bg-orange-500/5' },
  CHAMPION:  { text: 'text-red-400',     border: 'border-red-500/30',     bg: 'bg-red-500/5' },
  LEGENDARY: { text: 'text-purple-400',  border: 'border-purple-500/30',  bg: 'bg-purple-500/5' },
  NIGHTMARE: { text: 'text-pink-400',    border: 'border-pink-500/40',    bg: 'bg-pink-500/8' },
}

const RANK_COLORS: Record<string, string> = {
  E: '#9ca3af', D: '#22c55e', C: '#3b82f6', B: '#8b5cf6', 'B+': '#ef4444', A: '#f59e0b', S: '#ec4899',
}

const RANK_LABEL: Record<string, string> = {
  E: 'Rank E', D: 'Rank D', C: 'Rank C', B: 'Rank B', A: 'Rank A', S: 'Rank S',
}

const READINESS_STYLE: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  red:     { text: 'text-red-400',     bg: 'bg-red-500/8',     border: 'border-red-500/25',     dot: 'bg-red-500' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/8',   border: 'border-amber-500/25',   dot: 'bg-amber-400' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
}

// ─── Enemy sub-components ──────────────────────────────────────────────────────

function EnemyRankBadge({ rank, size = 'sm' }: { rank: string; size?: 'sm' | 'md' | 'lg' }) {
  const color = RANK_COLORS[rank] ?? '#94a3b8'
  const sz = size === 'lg' ? 'text-2xl w-10 h-10' : size === 'md' ? 'text-base w-7 h-7' : 'text-xs w-5 h-5'
  return (
    <span className={`inline-flex items-center justify-center rounded-md font-black ${sz}`}
      style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}>
      {rank}
    </span>
  )
}

function PowerRequirement({ playerPower, required }: { playerPower: number; required: number }) {
  const pct = Math.min((playerPower / Math.max(1, required)) * 100, 100)
  const over = playerPower >= required
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">Seu poder</span>
        <span className={over ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
          {playerPower} / {required}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: over ? '#22c55e' : 'linear-gradient(90deg,#ef4444,#f59e0b)' }} />
      </div>
    </div>
  )
}

function DropList({ drops }: { drops: string | null }) {
  if (!drops) return <p className="text-xs text-slate-600 italic">Nenhum drop registrado</p>
  const items = drops.split(',').map(d => d.trim()).filter(Boolean)
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((d, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300">
          <Package size={9} /> {d}
        </span>
      ))}
    </div>
  )
}

function EnemySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-4 border border-slate-800/40 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-xl bg-slate-800/60 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-slate-800/60 rounded-full w-3/4" />
              <div className="h-2.5 bg-slate-800/40 rounded-full w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1, 2, 3].map(j => <div key={j} className="h-10 bg-slate-800/40 rounded-xl" />)}
          </div>
          <div className="h-8 bg-slate-800/30 rounded-xl" />
        </div>
      ))}
    </div>
  )
}

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-slate-900/50 rounded-xl py-2 px-1">
      <div className="flex items-center gap-1 text-[10px]" style={{ color }}>{icon} <span className="text-slate-500">{label}</span></div>
      <p className="text-sm font-bold text-slate-200">{value.toLocaleString('pt-BR')}</p>
    </div>
  )
}

function EnemyFilters({
  filter, setFilter, query, setQuery,
}: {
  filter: RankFilter
  setFilter: (f: RankFilter) => void
  query: string
  setQuery: (q: string) => void
}) {
  const ranks: { key: RankFilter; label: string; color?: string }[] = [
    { key: 'ALL', label: 'Todos' },
    { key: 'E', label: 'E', color: RANK_COLORS.E },
    { key: 'D', label: 'D', color: RANK_COLORS.D },
    { key: 'C', label: 'C', color: RANK_COLORS.C },
    { key: 'B', label: 'B', color: RANK_COLORS.B },
    { key: 'A', label: 'A', color: RANK_COLORS.A },
    { key: 'S', label: 'S', color: RANK_COLORS.S },
    { key: 'BOSS', label: '👑 Chefes' },
  ]
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar inimigo..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            <X size={14} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {ranks.map(r => {
          const active = filter === r.key
          return (
            <button key={r.key} onClick={() => setFilter(r.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${active ? 'text-white' : 'text-slate-500 border-slate-700/40 bg-slate-900/40 hover:border-slate-600/60 hover:text-slate-300'}`}
              style={active ? { background: r.color ? `${r.color}25` : 'rgba(99,102,241,0.2)', borderColor: r.color ? `${r.color}60` : 'rgba(99,102,241,0.5)', color: r.color ?? '#c4b5fd' } : {}}>
              {r.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EnemyCard({ enemy, playerPower, onDetails, onBattle, fighting }: {
  enemy: Enemy
  playerPower: number
  onDetails: (e: Enemy) => void
  onBattle: (e: Enemy) => void
  fighting: string | null
}) {
  const color = RANK_COLORS[enemy.rank] ?? '#94a3b8'
  const rs = READINESS_STYLE[enemy.readiness.color] ?? READINESS_STYLE.amber
  const isFighting = fighting === enemy.id

  return (
    <div className="glass rounded-2xl border flex flex-col transition-all duration-200 hover:scale-[1.015] hover:shadow-lg group"
      style={{ borderColor: `${color}25` }}>
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-14 h-14 rounded-xl shrink-0 relative overflow-hidden"
            style={{ background: `${color}12`, border: `1.5px solid ${color}35` }}>
            {enemy.imageUrl ? (
              <img src={enemy.imageUrl} alt={enemy.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-3xl">{enemy.icon}</span>
            )}
            {enemy.isBoss && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                <Crown size={9} className="text-amber-900" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <EnemyRankBadge rank={enemy.rank} />
              {enemy.isBoss && <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">CHEFE</span>}
            </div>
            <p className="font-bold text-slate-100 text-sm leading-tight truncate">{enemy.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{enemy.type}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <StatPill icon={<Heart size={9} />} label="HP" value={enemy.hp} color="#f87171" />
          <StatPill icon={<Swords size={9} />} label="ATK" value={enemy.attack} color="#fb923c" />
          <StatPill icon={<Shield size={9} />} label="DEF" value={enemy.defense} color="#60a5fa" />
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-600 flex items-center gap-1"><Zap size={9} className="text-purple-500" /> Poder recomendado</span>
            <span className="text-slate-400 font-semibold">{enemy.recommendedPower}</span>
          </div>
          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (playerPower / Math.max(1, enemy.recommendedPower)) * 100)}%`,
                background: enemy.readiness.locked ? 'linear-gradient(90deg,#ef4444,#f97316)' : '#22c55e',
              }} />
          </div>
        </div>

        {enemy.weakness && (
          <p className="text-[11px] text-slate-500 mb-3 truncate">
            🎯 <span className="text-slate-400">{enemy.weakness}</span>
          </p>
        )}

        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${rs.bg} ${rs.border} ${rs.text}`}>
          {enemy.readiness.locked ? <Lock size={10} /> : <span className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} />}
          {enemy.readiness.label}
        </div>
      </div>

      <div className="p-3 pt-0 mt-auto flex gap-2">
        <button onClick={() => onDetails(enemy)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:border-slate-600/60 hover:bg-slate-800/70 transition-all flex items-center justify-center gap-1.5">
          <ChevronRight size={12} /> Ver detalhes
        </button>
        <button onClick={() => onBattle(enemy)}
          disabled={enemy.readiness.locked || isFighting}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          style={enemy.readiness.locked
            ? { background: 'rgba(100,100,120,0.2)', color: '#64748b', border: '1px solid rgba(100,100,120,0.2)' }
            : { background: `linear-gradient(135deg,${color}30,${color}18)`, color, border: `1px solid ${color}50` }}>
          {isFighting
            ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : enemy.readiness.locked ? <><Lock size={10} /> Bloqueado</> : <><Swords size={11} /> Batalhar</>}
        </button>
      </div>
    </div>
  )
}

function EnemyDetailsModal({ enemy, player, onClose, onBattle, fighting }: {
  enemy: Enemy
  player: EnemyPlayer
  onClose: () => void
  onBattle: (e: Enemy) => void
  fighting: string | null
}) {
  const color = RANK_COLORS[enemy.rank] ?? '#94a3b8'
  const isFighting = fighting === enemy.id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative z-10 w-full max-w-md glass rounded-2xl overflow-hidden"
        style={{ border: `1.5px solid ${color}40`, boxShadow: `0 0 40px ${color}15` }}
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-7 h-7 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <X size={14} />
        </button>

        <div className="relative px-6 pt-6 pb-5 text-center"
          style={{ background: `linear-gradient(160deg,${color}10 0%,transparent 60%)` }}>
          <div className="text-6xl mb-3 relative inline-block">
            {enemy.icon}
            {enemy.isBoss && (
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                <Crown size={12} className="text-amber-900" />
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <EnemyRankBadge rank={enemy.rank} size="md" />
            <h2 className="text-xl font-black text-white">{enemy.name}</h2>
          </div>
          <p className="text-sm" style={{ color }}>{RANK_LABEL[enemy.rank]} · {enemy.type}</p>
          {enemy.isBoss && (
            <span className="inline-block mt-1.5 text-[11px] font-bold text-amber-400 bg-amber-500/12 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
              ⚠️ INIMIGO CHEFE
            </span>
          )}
        </div>

        <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Estatísticas de combate</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/60">
                <Heart size={14} className="text-red-400 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500">HP</p>
                <p className="text-base font-black text-red-300">{enemy.hp.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/60">
                <Swords size={14} className="text-orange-400 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500">ATK</p>
                <p className="text-base font-black text-orange-300">{enemy.attack.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/60">
                <Shield size={14} className="text-blue-400 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500">DEF</p>
                <p className="text-base font-black text-blue-300">{enemy.defense.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Poder recomendado</p>
              <div className="flex items-center gap-1.5">
                <Zap size={11} className="text-purple-400" />
                <span className="text-sm font-black" style={{ color }}>{enemy.recommendedPower}</span>
              </div>
            </div>
            <PowerRequirement playerPower={player.power} required={enemy.recommendedPower} />
          </div>

          {(enemy.weakness || enemy.resistance) && (
            <div className="grid grid-cols-2 gap-2">
              {enemy.weakness && (
                <div className="bg-red-500/8 rounded-xl p-3 border border-red-500/15">
                  <p className="text-[10px] text-red-400/70 uppercase tracking-wider mb-1">🎯 Fraqueza</p>
                  <p className="text-xs text-slate-300">{enemy.weakness}</p>
                </div>
              )}
              {enemy.resistance && (
                <div className="bg-blue-500/8 rounded-xl p-3 border border-blue-500/15">
                  <p className="text-[10px] text-blue-400/70 uppercase tracking-wider mb-1">🛡️ Resistência</p>
                  <p className="text-xs text-slate-300">{enemy.resistance}</p>
                </div>
              )}
            </div>
          )}

          {enemy.specialMechanic && (
            <div className="bg-amber-500/8 rounded-xl p-3 border border-amber-500/15">
              <p className="text-[10px] text-amber-400/70 uppercase tracking-wider mb-1">⚙️ Mecânica especial</p>
              <p className="text-xs text-slate-300">{enemy.specialMechanic}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">🎁 Drops possíveis</p>
            <DropList drops={enemy.drops} />
          </div>

          {enemy.readiness.locked ? (
            <div className="rounded-xl p-4 bg-red-500/8 border border-red-500/20 text-center space-y-2">
              <AlertTriangle size={20} className="text-red-400 mx-auto" />
              <p className="text-sm font-semibold text-red-300">Você ainda não está pronto</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete missões reais, melhore seus atributos e equipe itens melhores antes de enfrentar este inimigo.
              </p>
            </div>
          ) : (
            <button
              onClick={() => { onBattle(enemy); onClose() }}
              disabled={isFighting}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${color}40,${color}20)`, color, border: `1.5px solid ${color}50`, boxShadow: `0 4px 20px ${color}20` }}>
              {isFighting
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <><Swords size={15} /> Iniciar Batalha</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Arena helper components ──────────────────────────────────────────────────

const MAX_CHARGES = 5

function ChargesDisplay({ charges, nextChargeAt }: { charges: number; nextChargeAt: string | null }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!nextChargeAt || charges >= MAX_CHARGES) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [nextChargeAt, charges])

  const msUntil = nextChargeAt ? Math.max(0, new Date(nextChargeAt).getTime() - now) : 0
  const mins    = Math.floor(msUntil / 60_000)
  const secs    = Math.floor((msUntil % 60_000) / 1000)

  return (
    <div className="text-right">
      <p className="text-xs text-slate-500 mb-1">Cargas de batalha</p>
      <div className="flex items-center gap-1.5 justify-end">
        {Array.from({ length: MAX_CHARGES }).map((_, i) => (
          <span key={i} className={`w-4 h-4 rounded-full border transition-all ${i < charges ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_6px_#6366f1]' : 'bg-slate-800 border-slate-600'}`} />
        ))}
      </div>
      {charges < MAX_CHARGES && nextChargeAt && (
        <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 justify-end">
          ⏳ +1 em {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
      )}
      {charges === 0 && (
        <p className="text-[10px] text-red-400/70 mt-0.5">Sem cargas</p>
      )}
    </div>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'battles' | 'enemies'

export default function ArenaPage() {
  const [tab, setTab] = useState<Tab>('battles')

  // Arena (battles) state
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [battle, setBattle] = useState<BattleData | null>(null)
  const [fighting, setFighting] = useState<string | null>(null)

  // Enemies state
  const [enemyData, setEnemyData] = useState<{ player: EnemyPlayer; enemies: Enemy[]; recentBattles: any[] } | null>(null)
  const [enemyLoading, setEnemyLoading] = useState(false)
  const [enemyError, setEnemyError] = useState(false)
  const [enemyLoaded, setEnemyLoaded] = useState(false)
  const [enemyFilter, setEnemyFilter] = useState<RankFilter>('ALL')
  const [enemyQuery, setEnemyQuery] = useState('')
  const [selected, setSelected] = useState<Enemy | null>(null)
  const [pveBattle, setPveBattle] = useState<BattleData | null>(null)
  const [pveFighting, setPveFighting] = useState<string | null>(null)

  const { refreshUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // ── Arena data ──────────────────────────────────────────────────────────────

  const fetchArena = useCallback(async () => {
    const res = await fetch('/api/arena')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchArena() }, [fetchArena])

  const startBattle = async (opponent: any) => {
    setFighting(opponent.id)
    try {
      const body = opponent.type === 'BOT'
        ? { type: 'BOT', difficulty: opponent.difficulty }
        : opponent.type === 'NPC'
          ? { type: 'NPC', npcId: opponent.id }
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

  // ── Enemy data ──────────────────────────────────────────────────────────────

  const fetchEnemies = useCallback(async () => {
    setEnemyError(false)
    setEnemyLoading(true)
    try {
      const res = await fetch('/api/bestiary', { cache: 'no-store' })
      if (res.status === 401) { router.push('/login'); return }
      if (!res.ok) { setEnemyError(true); return }
      setEnemyData(await res.json())
      setEnemyLoaded(true)
    } catch {
      setEnemyError(true)
    } finally {
      setEnemyLoading(false)
    }
  }, [router])

  // Lazy-load enemies on first tab switch
  useEffect(() => {
    if (tab === 'enemies' && !enemyLoaded && !enemyLoading) {
      fetchEnemies()
    }
  }, [tab, enemyLoaded, enemyLoading, fetchEnemies])

  const fight = useCallback(async (enemy: Enemy) => {
    if (enemy.readiness.locked) return
    setPveFighting(enemy.id)
    try {
      const res = await fetch('/api/pve/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enemyId: enemy.id }),
      })
      const result = await res.json()
      if (!res.ok) { toast(result.error ?? 'Erro na batalha', 'error'); return }
      setSelected(null)
      setPveBattle(result)
    } catch {
      toast('Erro ao iniciar batalha', 'error')
    } finally {
      setPveFighting(null)
    }
  }, [toast])

  const closePveBattle = useCallback(async () => {
    setPveBattle(null)
    await Promise.all([fetchEnemies(), refreshUser()])
  }, [fetchEnemies, refreshUser])

  const filteredEnemies = useMemo(() => {
    if (!enemyData) return []
    return enemyData.enemies.filter(e => {
      const matchRank = enemyFilter === 'ALL' ? true : enemyFilter === 'BOSS' ? e.isBoss : e.rank === enemyFilter
      const matchQuery = !enemyQuery || e.name.toLowerCase().includes(enemyQuery.toLowerCase()) || e.type.toLowerCase().includes(enemyQuery.toLowerCase())
      return matchRank && matchQuery
    })
  }, [enemyData, enemyFilter, enemyQuery])

  const bosses = useMemo(() => filteredEnemies.filter(e => e.isBoss), [filteredEnemies])
  const regulars = useMemo(() => filteredEnemies.filter(e => !e.isBoss), [filteredEnemies])

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!data) return null

  const p = data.player
  const total = p.wins + p.losses
  const winRate = total > 0 ? Math.round((p.wins / total) * 100) : 0

  return (
    <>
      <BattleModal battle={battle} playerName={p.name} onClose={closeBattle} />
      {pveBattle && enemyData && <BattleModal battle={pveBattle} playerName={enemyData.player.name} onClose={closePveBattle} />}
      {selected && enemyData && (
        <EnemyDetailsModal
          enemy={selected}
          player={enemyData.player}
          onClose={() => setSelected(null)}
          onBattle={fight}
          fighting={pveFighting}
        />
      )}

      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Swords className="text-indigo-400" /> Arena</h1>
            <p className="text-slate-400 text-sm">Lute contra autômatos, jogadores e inimigos para evoluir.</p>
          </div>
          <Link href="/leaderboard">
            <Button variant="secondary"><Medal size={15} /> Ver Ranking</Button>
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-700/40 rounded-xl w-fit">
          <button
            onClick={() => setTab('battles')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'battles' ? 'bg-indigo-600/80 text-white border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'}`}>
            <span className="flex items-center gap-2"><Bot size={14} /> Batalhas</span>
          </button>
          <button
            onClick={() => setTab('enemies')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'enemies' ? 'bg-indigo-600/80 text-white border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'}`}>
            <span className="flex items-center gap-2"><Skull size={14} /> Inimigos da Arena</span>
          </button>
        </div>

        {/* ── TAB: BATALHAS ─────────────────────────────────────────────────── */}
        {tab === 'battles' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-4 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs text-purple-300 uppercase tracking-wider">{data.season.name}</p><p className="text-sm text-slate-300">{p.seasonPoints} pontos sazonais</p></div>
              <ChargesDisplay charges={data.charges} nextChargeAt={data.nextChargeAt} />
            </div>

            {/* Player stats */}
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <CombatStat icon={<Heart size={14} className="text-red-400" />} label="HP" value={p.stats.hp} />
                <CombatStat icon={<Swords size={14} className="text-orange-400" />} label="ATK" value={p.stats.atk} />
                <CombatStat icon={<Shield size={14} className="text-blue-400" />} label="DEF" value={p.stats.def} />
                <CombatStat icon={<Zap size={14} className="text-indigo-400" />} label="Poder" value={p.stats.power} />
              </div>
            </div>

            {/* Bots */}
            <div>
              <h2 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Bot size={18} className="text-slate-400" /> Treino contra Autômatos
                <span className="text-xs text-slate-600 font-normal ml-1">{data.bots.length} oponentes disponíveis</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.bots.map((bot: any) => {
                  const ds = DIFF_STYLE[bot.difficulty] ?? DIFF_STYLE.MEDIUM
                  const rankColor = RANK_COLORS[bot.rankLabel] ?? '#9ca3af'
                  return (
                    <div key={bot.id} className={`glass rounded-2xl p-4 border ${ds.border} ${ds.bg} flex flex-col`}>
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3"
                        style={{ background: `${rankColor}12`, border: `1px solid ${rankColor}25` }}>
                        {bot.imageUrl ? (
                          <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">{bot.icon}</div>
                        )}
                        <span className="absolute top-1.5 right-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none"
                          style={{ background: `${rankColor}25`, color: rankColor, border: `1px solid ${rankColor}50` }}>
                          {bot.rankLabel}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-200 truncate mb-0.5">{bot.name}</p>
                      <p className={`text-xs font-medium mb-2 ${ds.text}`}>{bot.difficultyLabel} · Nv {bot.level}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                        <span className="flex items-center gap-0.5"><Zap size={10} className="text-indigo-400" /> {bot.power}</span>
                        <span className={bot.risk.color === 'red' ? 'text-red-400' : bot.risk.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}>{bot.risk.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 mb-3">
                        +{bot.rewards.xp} XP · +{bot.rewards.essences} 💎 · +{bot.rewards.points} pts
                      </div>
                      <Button size="sm" variant="primary" className="w-full mt-auto" loading={fighting === bot.id} onClick={() => startBattle(bot)}>
                        <Swords size={12} /> Batalhar
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Players */}
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

            {/* History */}
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
        )}

        {/* ── TAB: INIMIGOS DA ARENA ─────────────────────────────────────────── */}
        {tab === 'enemies' && (
          <div className="space-y-6">
            {/* Player power bar */}
            {enemyData && (
              <div className="flex items-center gap-3 glass rounded-xl px-4 py-2.5 border border-indigo-500/15 w-fit">
                <div className="text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Seu Poder</p>
                  <p className="text-xl font-black text-purple-300">{enemyData.player.power}</p>
                </div>
                <div className="w-px h-8 bg-slate-700/60" />
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div><p className="text-slate-600">HP</p><p className="text-red-400 font-bold">{enemyData.player.stats.hp}</p></div>
                  <div><p className="text-slate-600">ATK</p><p className="text-orange-400 font-bold">{enemyData.player.stats.atk}</p></div>
                  <div><p className="text-slate-600">DEF</p><p className="text-blue-400 font-bold">{enemyData.player.stats.def}</p></div>
                </div>
              </div>
            )}

            <EnemyFilters filter={enemyFilter} setFilter={setEnemyFilter} query={enemyQuery} setQuery={setEnemyQuery} />

            {enemyLoading ? (
              <EnemySkeleton />
            ) : enemyError ? (
              <div className="glass rounded-2xl p-12 border border-red-500/20 text-center">
                <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">Erro ao carregar inimigos</p>
                <p className="text-slate-500 text-sm mt-1 mb-4">Verifique sua conexão e tente novamente.</p>
                <button onClick={fetchEnemies}
                  className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/25 transition-colors">
                  Tentar novamente
                </button>
              </div>
            ) : filteredEnemies.length === 0 && enemyLoaded ? (
              <div className="glass rounded-2xl p-12 border border-slate-800/30 text-center">
                <Skull size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">Nenhum inimigo encontrado</p>
                <p className="text-slate-600 text-sm mt-1">
                  {enemyQuery ? `Sem resultados para "${enemyQuery}"` : `Sem inimigos de ${enemyFilter === 'BOSS' ? 'Chefe' : `Rank ${enemyFilter}`}`}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {bosses.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Crown size={16} className="text-amber-400" />
                      <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Chefes</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
                      <span className="text-xs text-amber-500/60">{bosses.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {bosses.map(e => (
                        <EnemyCard key={e.id} enemy={e} playerPower={enemyData!.player.power}
                          onDetails={setSelected} onBattle={fight} fighting={pveFighting} />
                      ))}
                    </div>
                  </section>
                )}

                {regulars.length > 0 && (
                  <section>
                    {bosses.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Skull size={14} className="text-slate-500" />
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Inimigos</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-slate-700/50 to-transparent" />
                        <span className="text-xs text-slate-600">{regulars.length}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {regulars.map(e => (
                        <EnemyCard key={e.id} enemy={e} playerPower={enemyData!.player.power}
                          onDetails={setSelected} onBattle={fight} fighting={pveFighting} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Recent PvE battles */}
            {enemyData?.recentBattles && enemyData.recentBattles.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={15} className="text-indigo-400" />
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Caçadas Recentes</h2>
                </div>
                <div className="glass neon-border rounded-2xl divide-y divide-slate-800/50 overflow-hidden">
                  {enemyData.recentBattles.map((b: any) => (
                    <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/20 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${b.won ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        {b.won ? '🏆' : '💀'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${b.won ? 'text-emerald-300' : 'text-red-300'}`}>
                          {b.won ? 'Vitória' : 'Derrota'} <span className="text-slate-400">vs</span> {b.opponentName}
                        </p>
                        <p className="text-xs text-slate-600">{new Date(b.createdAt).toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="text-right text-xs shrink-0 space-y-0.5">
                        {b.xpChange > 0 && <p className="text-indigo-400 font-semibold">+{b.xpChange} XP</p>}
                        {b.essenceChange > 0 && <p className="text-amber-400">+{b.essenceChange} 💎</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  )
}
