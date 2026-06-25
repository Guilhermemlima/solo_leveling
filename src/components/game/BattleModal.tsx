'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Swords, Zap, Shield, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CoinIcon } from '@/components/ui/CoinIcon'
import { Confetti } from '@/components/game/Confetti'

interface Round {
  attacker: 'player' | 'opponent'
  damage: number
  crit: boolean
  playerHp: number
  opponentHp: number
}

export interface BattleData {
  playerWon: boolean
  rounds: Round[]
  playerStats: { hp: number; atk: number; def: number; power: number }
  opponentStats: { hp: number; atk: number; def: number; power: number }
  opponent: { name: string; icon: string; level: number }
  rewards: { xp: number; essences: number; points: number }
  levelUps: number[]
  newLevel: number
  rankUp?: { tier: string; label: string; essences: number } | null
  rankBlocked?: { tier: string; label: string; missing: string[] } | null
  chestDrop?: { rank: string; name: string; icon: string } | null
}

interface Props {
  battle: BattleData | null
  playerName: string
  onClose: () => void
}

export function BattleModal({ battle, playerName, onClose }: Props) {
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)
  const [mounted, setMounted] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!battle) { setStep(0); setFinished(false); return }
    setStep(0)
    setFinished(false)
    let i = 0
    const tick = () => {
      i++
      setStep(i)
      if (i >= battle.rounds.length) { setFinished(true); return }
      timer.current = setTimeout(tick, 520)
    }
    timer.current = setTimeout(tick, 600)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [battle])

  if (!battle || !mounted) return null

  const maxPlayerHp = battle.playerStats.hp
  const maxOppHp = battle.opponentStats.hp
  const current = step > 0 ? battle.rounds[Math.min(step, battle.rounds.length) - 1] : null
  const playerHp = current ? current.playerHp : maxPlayerHp
  const oppHp = current ? current.opponentHp : maxOppHp
  const visibleRounds = battle.rounds.slice(0, step)

  const skip = () => {
    if (timer.current) clearTimeout(timer.current)
    setStep(battle.rounds.length)
    setFinished(true)
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {finished && battle.playerWon && <Confetti />}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={finished ? onClose : undefined} />
      <div className="relative z-10 w-full max-w-md glass neon-border rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #0f0f1e, #0a0a16)' }}>
        <div className="flex items-center justify-center gap-2 mb-5">
          <Swords size={18} className="text-indigo-400" />
          <h2 className="font-bold text-white">Arena de Batalha</h2>
        </div>

        {/* Combatentes */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <Fighter name={playerName} icon="🧑" hp={playerHp} maxHp={maxPlayerHp} side="left" />
          <span className="text-2xl shrink-0">⚔️</span>
          <Fighter name={battle.opponent.name} icon={battle.opponent.icon} hp={oppHp} maxHp={maxOppHp} side="right" />
        </div>

        {/* Log de rounds */}
        <div className="h-28 overflow-y-auto rounded-xl bg-black/30 border border-slate-800/60 p-2.5 mb-4 flex flex-col-reverse gap-1 text-xs">
          {[...visibleRounds].reverse().map((r, idx) => (
            <div key={visibleRounds.length - idx} className={`flex items-center gap-1.5 ${r.attacker === 'player' ? 'text-indigo-300' : 'text-red-300'}`}>
              <span>{r.attacker === 'player' ? '➤' : '◀'}</span>
              <span>{r.attacker === 'player' ? playerName : battle.opponent.name}</span>
              <span className="text-slate-500">causou</span>
              <span className={`font-semibold ${r.crit ? 'text-amber-400' : ''}`}>{r.damage}{r.crit ? ' ⚡CRIT' : ''}</span>
              <span className="text-slate-500">de dano</span>
            </div>
          ))}
          {visibleRounds.length === 0 && <div className="text-slate-600 text-center m-auto">Preparando combate...</div>}
        </div>

        {!finished ? (
          <Button variant="ghost" size="sm" onClick={skip} className="w-full">Pular animação</Button>
        ) : (
          <div className="text-center">
            <div className={`text-2xl font-black mb-2 ${battle.playerWon ? 'text-amber-400' : 'text-red-400'}`}>
              {battle.playerWon ? '🏆 VITÓRIA!' : '💀 DERROTA'}
            </div>
            {battle.levelUps.length > 0 && (
              <p className="text-amber-300 text-sm font-semibold mb-2">⚡ Subiu para o nível {battle.newLevel}!</p>
            )}
            {battle.rankUp && (
              <div className="mb-3 p-2.5 rounded-xl border bg-pink-500/10 border-pink-500/30">
                <p className="text-sm font-bold" style={{ color: '#ec4899' }}>🎖️ Promovido para {battle.rankUp.label}!</p>
                <p className="text-xs text-pink-300/80 mt-0.5">+{battle.rankUp.essences} Moedas de marco</p>
              </div>
            )}
            {battle.rankBlocked && (
              <div className="mb-3 p-2.5 rounded-xl border bg-amber-500/10 border-amber-500/30">
                <p className="text-sm font-bold text-amber-400">⚠️ Patente {battle.rankBlocked.label} bloqueada</p>
                {battle.rankBlocked.missing.length > 0 && (
                  <p className="text-xs text-amber-300/80 mt-0.5">Faltam: {battle.rankBlocked.missing.join(', ')}</p>
                )}
              </div>
            )}
            <div className="flex gap-2 justify-center mb-4">
              <span className="flex items-center gap-1 text-sm bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1.5 text-indigo-300">
                <Zap size={13} /> +{battle.rewards.xp} XP
              </span>
              {battle.rewards.essences > 0 && (
                <span className="flex items-center gap-1 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 text-amber-300">
                  <CoinIcon className="w-3.5 h-3.5 object-contain" /> +{battle.rewards.essences}
                </span>
              )}
              {battle.rewards.points !== 0 && (
                <span className={`flex items-center gap-1 text-sm rounded-lg px-3 py-1.5 border ${battle.rewards.points > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                  <Swords size={13} /> {battle.rewards.points > 0 ? '+' : ''}{battle.rewards.points} pts
                </span>
              )}
            </div>
            {battle.chestDrop && (
              <div className="mb-4 p-2.5 rounded-xl border bg-purple-500/10 border-purple-500/30 flex items-center justify-center gap-2">
                <span className="text-xl">{battle.chestDrop.icon}</span>
                <p className="text-sm font-semibold text-purple-300">Drop: {battle.chestDrop.name}!</p>
              </div>
            )}
            <Button variant="primary" onClick={onClose} className="w-full">Continuar</Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

function Fighter({ name, icon, hp, maxHp, side }: { name: string; icon: string; hp: number; maxHp: number; side: 'left' | 'right' }) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  return (
    <div className={`flex-1 ${side === 'right' ? 'text-right' : ''}`}>
      <div className={`flex items-center gap-2 mb-1.5 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
        <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-lg shrink-0">{icon}</div>
        <span className="text-sm font-medium text-slate-200 truncate">{name}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${pct > 50 ? 'bg-emerald-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-xs text-slate-500 mt-1 ${side === 'right' ? 'text-right' : ''}`}>{Math.round(hp)}/{maxHp} HP</p>
    </div>
  )
}
