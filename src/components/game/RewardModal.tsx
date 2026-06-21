'use client'
import { useEffect, useState } from 'react'
import { Zap, Coins, TrendingUp, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Confetti } from '@/components/game/Confetti'

interface RewardModalProps {
  reward: {
    xpGained: number
    essencesGained: number
    levelUps: number[]
    newLevel: number
    newStreak: number
    streakReward?: { essences: number; label: string } | null
    attributeGains?: Record<string, number>
    classBonus?: { name?: string; percent?: number } | null
    specializationBonus?: { name?: string; percent?: number } | null
    chestReward?: { rank: string; name: string; icon: string } | null
  } | null
  onClose: () => void
}

export function RewardModal({ reward, onClose }: RewardModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reward) setTimeout(() => setVisible(true), 50)
    else setVisible(false)
  }, [reward])

  if (!reward) return null

  const isLevelUp = reward.levelUps.length > 0

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      {isLevelUp && <Confetti />}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative z-10 w-full max-w-sm rounded-2xl border transition-all duration-500 overflow-hidden ${visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'} ${isLevelUp ? 'border-amber-500/50 shadow-2xl shadow-amber-500/20' : 'border-indigo-500/40 shadow-2xl shadow-indigo-500/20'}`}
        style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #0a0a16 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow top */}
        <div className={`absolute top-0 left-0 right-0 h-px ${isLevelUp ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent' : 'bg-gradient-to-r from-transparent via-indigo-500 to-transparent'}`} />

        <div className="p-6 text-center">
          {isLevelUp ? (
            <>
              <div className="text-5xl mb-3 float-anim">⚡</div>
              <h2 className="text-2xl font-bold text-amber-400 mb-1">LEVEL UP!</h2>
              <p className="text-slate-400 text-sm mb-4">Você alcançou o nível</p>
              <div className="text-6xl font-black text-transparent bg-clip-text mb-4"
                style={{ backgroundImage: 'linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)' }}>
                {reward.newLevel}
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">✅</div>
              <h2 className="text-xl font-bold text-indigo-400 mb-1">Tarefa Concluída!</h2>
              <p className="text-slate-400 text-sm mb-4">Recompensas recebidas</p>
            </>
          )}

          <div className="flex gap-3 justify-center mb-4">
            <div className="flex flex-col items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3">
              <Zap size={18} className="text-indigo-400" />
              <span className="text-xl font-bold text-white">+{reward.xpGained}</span>
              <span className="text-xs text-slate-500">XP</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <Coins size={18} className="text-amber-400" />
              <span className="text-xl font-bold text-white">+{reward.essencesGained}</span>
              <span className="text-xs text-slate-500">Essências</span>
            </div>
            {reward.newStreak > 1 && (
              <div className="flex flex-col items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                <Star size={18} className="text-orange-400" />
                <span className="text-xl font-bold text-white">{reward.newStreak}</span>
                <span className="text-xs text-slate-500">Streak</span>
              </div>
            )}
          </div>

          {reward.classBonus && (
            <div className="mb-3 p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center gap-1.5">
              <Sparkles size={13} className="text-indigo-400" />
              <p className="text-indigo-300 text-xs font-medium">
                Bônus de classe <span className="font-semibold">{reward.classBonus.name}</span> (+{reward.classBonus.percent}%) aplicado!
              </p>
            </div>
          )}

          {reward.streakReward && (
            <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <p className="text-orange-300 text-sm font-semibold">🔥 {reward.streakReward.label}</p>
              <p className="text-orange-400 text-xs mt-0.5">+{reward.streakReward.essences} Essências bônus!</p>
            </div>
          )}

          {reward.specializationBonus && (
            <div className="mb-3 p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center gap-1.5">
              <Sparkles size={13} className="text-violet-400" />
              <p className="text-violet-300 text-xs font-medium">
                Especialização <span className="font-semibold">{reward.specializationBonus.name}</span> (+{reward.specializationBonus.percent}%) aplicada!
              </p>
            </div>
          )}

          {reward.chestReward && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
              <span className="text-2xl">{reward.chestReward.icon}</span>
              <div>
                <p className="text-amber-300 text-sm font-semibold">Caixa desbloqueada!</p>
                <p className="text-amber-400 text-xs mt-0.5">{reward.chestReward.name} adicionada ao seu inventário</p>
              </div>
            </div>
          )}

          {reward.attributeGains && Object.keys(reward.attributeGains).length > 0 && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-purple-300 text-xs font-semibold mb-2 flex items-center gap-1">
                <TrendingUp size={12} /> Atributos aumentados
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                {Object.entries(reward.attributeGains).map(([attr, val]) => (
                  <span key={attr} className="text-xs bg-purple-500/20 px-2 py-0.5 rounded text-purple-300">
                    +{val} {attr}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button onClick={onClose} variant="primary" className="w-full">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
