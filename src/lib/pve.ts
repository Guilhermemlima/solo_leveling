import type { CombatStats } from '@/lib/battle'
import type { ChestRank } from '@/lib/chests'

/**
 * Sistema PvE (Bestiário): combate contra inimigos e chefes por rank.
 * Os inimigos têm HP/ATK/DEF próprios (não derivam de atributos) e um
 * "poder recomendado" que serve de aviso ao jogador.
 */

export type EnemyRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'

export interface EnemyLike {
  rank: string
  hp: number
  attack: number
  defense: number
  recommendedPower: number
}

const RANK_CRIT: Record<EnemyRank, number> = {
  E: 0.03, D: 0.05, C: 0.08, B: 0.12, A: 0.18, S: 0.25,
}

export const ENEMY_RANK_COLOR: Record<string, string> = {
  E: '#94a3b8', D: '#22c55e', C: '#3b82f6', B: '#8b5cf6', A: '#f59e0b', S: '#ef4444',
}

/** Converte um inimigo em stats de combate para a simulação. */
export function enemyToStats(e: EnemyLike): CombatStats {
  const rank = e.rank as EnemyRank
  return {
    hp: e.hp,
    atk: e.attack,
    def: e.defense,
    crit: RANK_CRIT[rank] ?? 0.05,
    speed: Math.round(e.recommendedPower / 28),
    power: e.recommendedPower,
  }
}

export type ReadinessState = 'LOCKED' | 'RISKY' | 'READY' | 'EASY'

export interface Readiness {
  state: ReadinessState
  label: string
  color: 'red' | 'amber' | 'emerald'
  ratio: number
  locked: boolean
}

/** Avalia se o jogador está pronto para enfrentar o inimigo. */
export function readiness(playerPower: number, recommendedPower: number): Readiness {
  const ratio = playerPower / Math.max(1, recommendedPower)
  if (ratio < 0.55) return { state: 'LOCKED', label: 'Você ainda não está pronto', color: 'red', ratio, locked: true }
  if (ratio < 0.9) return { state: 'RISKY', label: 'Alto risco', color: 'red', ratio, locked: false }
  if (ratio < 1.3) return { state: 'READY', label: 'Equilibrado', color: 'amber', ratio, locked: false }
  return { state: 'EASY', label: 'Favorável', color: 'emerald', ratio, locked: false }
}

const WIN_REWARDS: Record<EnemyRank, { xp: number; essences: number }> = {
  E: { xp: 20, essences: 10 },
  D: { xp: 35, essences: 18 },
  C: { xp: 60, essences: 30 },
  B: { xp: 100, essences: 50 },
  A: { xp: 160, essences: 80 },
  S: { xp: 260, essences: 140 },
}

/** Recompensas de XP/Essências por enfrentar o inimigo. */
export function pveRewards(rank: string, playerLevel: number, won: boolean): { xp: number; essences: number } {
  if (!won) return { xp: 6, essences: 0 }
  const base = WIN_REWARDS[rank as EnemyRank] || WIN_REWARDS.E
  return { xp: base.xp + playerLevel * 2, essences: base.essences + playerLevel }
}

const DROP_CHANCE: Record<EnemyRank, number> = {
  E: 0.25, D: 0.35, C: 0.45, B: 0.6, A: 0.75, S: 0.9,
}

/** Sorteia uma caixa de drop ao vencer. Chefes Rank S podem dropar Caixa Especial. */
export function pveChestDrop(rank: string, won: boolean): ChestRank | null {
  if (!won) return null
  const r = rank as EnemyRank
  if (Math.random() >= (DROP_CHANCE[r] ?? 0)) return null
  if (r === 'S' && Math.random() < 0.35) return 'SPECIAL'
  return r as ChestRank
}
