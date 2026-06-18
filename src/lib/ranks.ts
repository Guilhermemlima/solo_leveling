/**
 * Patentes da Arena (E → S), estilo ranking de caçador.
 * Derivadas dos Pontos de Arena. E é a mais baixa, S a mais alta.
 */

export interface Rank {
  tier: 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
  label: string
  color: string
  min: number
}

export const RANKS: Rank[] = [
  { tier: 'E', label: 'Patente E', color: '#94a3b8', min: 0 },
  { tier: 'D', label: 'Patente D', color: '#22c55e', min: 30 },
  { tier: 'C', label: 'Patente C', color: '#3b82f6', min: 90 },
  { tier: 'B', label: 'Patente B', color: '#8b5cf6', min: 200 },
  { tier: 'A', label: 'Patente A', color: '#f59e0b', min: 400 },
  { tier: 'S', label: 'Patente S', color: '#ec4899', min: 750 },
]

/** Maior patente cujo limite mínimo o jogador já alcançou. */
export function getRank(points: number): Rank {
  let current = RANKS[0]
  for (const r of RANKS) {
    if (points >= r.min) current = r
  }
  return current
}

/** Próxima patente, ou null se já está na máxima (S). */
export function nextRank(points: number): Rank | null {
  const current = getRank(points)
  const idx = RANKS.findIndex(r => r.tier === current.tier)
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null
}

/** Recompensa em Essências ao alcançar cada patente (marco). E não dá bônus. */
export const RANK_REWARDS: Record<Rank['tier'], number> = {
  E: 0,
  D: 50,
  C: 100,
  B: 200,
  A: 400,
  S: 800,
}

/**
 * Detecta subida de patente entre dois totais de pontos e retorna a recompensa.
 * Retorna null se não houve promoção.
 */
export function rankUpReward(oldPoints: number, newPoints: number): { tier: Rank['tier']; label: string; color: string; essences: number } | null {
  const oldIdx = RANKS.findIndex(r => r.tier === getRank(oldPoints).tier)
  const newRank = getRank(newPoints)
  const newIdx = RANKS.findIndex(r => r.tier === newRank.tier)
  if (newIdx <= oldIdx) return null
  return { tier: newRank.tier, label: newRank.label, color: newRank.color, essences: RANK_REWARDS[newRank.tier] }
}

/** Progresso (0..100) dentro da patente atual rumo à próxima. */
export function rankProgress(points: number): number {
  const current = getRank(points)
  const next = nextRank(points)
  if (!next) return 100
  return Math.min(100, Math.round(((points - current.min) / (next.min - current.min)) * 100))
}
