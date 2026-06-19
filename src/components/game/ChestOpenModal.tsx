'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Confetti } from '@/components/game/Confetti'

const RARITY_COLORS: Record<string, string> = {
  COMMON: '#9ca3af', UNCOMMON: '#22c55e', RARE: '#3b82f6',
  EPIC: '#8b5cf6', LEGENDARY: '#f59e0b', MYTHIC: '#ec4899',
}

interface Reward {
  type: string
  label: string
  icon?: string
  rarity?: string
  rarityLabel?: string
}

export interface OpenResult {
  chest: { rank: string; name: string; icon: string }
  rewards: Reward[]
  levelUps: number[]
  newLevel: number
}

interface Props {
  // o userChest sendo aberto (id + dados visuais)
  opening: { id: string; rank: string; name: string; icon: string; color: string } | null
  onDone: () => void
}

const HIGH_RANKS = ['A', 'S', 'SPECIAL']

export function ChestOpenModal({ opening, onDone }: Props) {
  const [phase, setPhase] = useState<'shaking' | 'reveal'>('shaking')
  const [result, setResult] = useState<OpenResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const animDone = useRef(false)
  const resultRef = useRef<OpenResult | null>(null)

  useEffect(() => {
    if (!opening) { setPhase('shaking'); setResult(null); setError(null); animDone.current = false; resultRef.current = null; return }

    setPhase('shaking')
    setResult(null)
    setError(null)
    animDone.current = false
    resultRef.current = null

    // dispara a abertura no servidor
    fetch(`/api/chests/${opening.id}/open`, { method: 'POST' })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) { setError(data.error || 'Erro ao abrir'); return }
        resultRef.current = data
        if (animDone.current) reveal()
      })
      .catch(() => setError('Erro ao abrir a caixa'))

    // tempo mínimo de animação
    const t = setTimeout(() => {
      animDone.current = true
      if (resultRef.current) reveal()
    }, 1700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opening])

  const reveal = () => {
    setResult(resultRef.current)
    setPhase('reveal')
  }

  const skip = () => {
    animDone.current = true
    if (resultRef.current) reveal()
  }

  if (!opening) return null
  const highRank = HIGH_RANKS.includes(opening.rank)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {phase === 'reveal' && highRank && <Confetti />}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={phase === 'reveal' ? onDone : undefined} />

      <div className="relative z-10 w-full max-w-sm glass neon-border rounded-2xl p-6 text-center"
        style={{ borderColor: `${opening.color}55`, boxShadow: `0 0 40px ${opening.color}33` }}>

        {error ? (
          <>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <Button variant="secondary" onClick={onDone} className="w-full">Fechar</Button>
          </>
        ) : phase === 'shaking' ? (
          <div className="py-6">
            <div className="relative inline-flex items-center justify-center">
              <span className="absolute w-28 h-28 rounded-full aura-pulse" style={{ background: `radial-gradient(circle, ${opening.color}66, transparent 70%)` }} />
              <span className="text-7xl chest-shake relative">{opening.icon}</span>
            </div>
            <p className="text-slate-300 font-medium mt-6">Abrindo {opening.name}…</p>
            <p className="text-xs text-slate-500 mt-1">O Sistema avalia suas recompensas</p>
            <button onClick={skip} className="text-xs text-slate-500 hover:text-slate-300 mt-4">Pular animação</button>
          </div>
        ) : result ? (
          <>
            <div className="chest-pop">
              <div className="text-5xl mb-1">{result.chest.icon}</div>
              <h2 className="text-lg font-bold" style={{ color: opening.color }}>{result.chest.name}</h2>
              <p className="text-xs text-slate-500 mb-4">Recompensas obtidas</p>
            </div>

            {result.levelUps.length > 0 && (
              <p className="text-amber-300 text-sm font-semibold mb-3">⚡ Subiu para o nível {result.newLevel}!</p>
            )}

            <div className="space-y-2 mb-5">
              {result.rewards.map((r, i) => {
                const color = r.rarity ? RARITY_COLORS[r.rarity] : '#a855f7'
                return (
                  <div key={i} className="reward-in flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border"
                    style={{ borderColor: `${color}40`, animationDelay: `${i * 90}ms`, opacity: 0 }}>
                    <span className="text-2xl">{r.icon || '🎁'}</span>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate" style={r.type === 'ITEM' ? { color } : undefined}>{r.label}</p>
                      {r.rarityLabel && <p className="text-xs" style={{ color }}>{r.rarityLabel}</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            <Button variant="primary" onClick={onDone} className="w-full">Coletar</Button>
          </>
        ) : null}
      </div>
    </div>
  )
}
