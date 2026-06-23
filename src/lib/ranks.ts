/**
 * Patentes da Arena (E → S), estilo ranking de caçador.
 * Derivadas dos Pontos de Arena. E é a mais baixa, S a mais alta.
 * Para subir de patente o jogador precisa ter pontos suficientes E
 * cumprir os requisitos mínimos de atributos.
 */

export interface Rank {
  tier: 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
  label: string
  color: string
  min: number
  /** Atributos mínimos para ATINGIR esta patente */
  attrRequirements: Partial<Record<string, number>>
}

export const RANKS: Rank[] = [
  { tier: 'E', label: 'Patente E', color: '#94a3b8', min: 0,    attrRequirements: {} },
  { tier: 'D', label: 'Patente D', color: '#22c55e', min: 150,  attrRequirements: { discipline: 15 } },
  { tier: 'C', label: 'Patente C', color: '#3b82f6', min: 500,  attrRequirements: { discipline: 35, intelligence: 20 } },
  { tier: 'B', label: 'Patente B', color: '#8b5cf6', min: 1200, attrRequirements: { discipline: 70, strength: 30, intelligence: 45 } },
  { tier: 'A', label: 'Patente A', color: '#f59e0b', min: 2800, attrRequirements: { discipline: 120, strength: 60, intelligence: 75, vitality: 45 } },
  { tier: 'S', label: 'Patente S', color: '#ec4899', min: 6000, attrRequirements: { discipline: 200, strength: 100, intelligence: 120, vitality: 80, focus: 60 } },
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

/** Recompensa em Moedas ao alcançar cada patente (marco). E não dá bônus. */
export const RANK_REWARDS: Record<Rank['tier'], number> = {
  E: 0,
  D: 50,
  C: 100,
  B: 200,
  A: 400,
  S: 800,
}

/**
 * Verifica se os atributos do jogador atendem os requisitos de uma patente.
 * Retorna lista de atributos faltantes (vazia = aprovado).
 */
export function checkAttrRequirements(
  rank: Rank,
  attrs: Record<string, number> | null | undefined
): { attr: string; have: number; need: number }[] {
  const missing: { attr: string; have: number; need: number }[] = []
  for (const [attr, need] of Object.entries(rank.attrRequirements)) {
    if (need === undefined) continue
    const have = (attrs as Record<string, number>)?.[attr] ?? 0
    if (have < need) missing.push({ attr, have, need })
  }
  return missing
}

/**
 * Detecta subida de patente entre dois totais de pontos e retorna a recompensa.
 * Verifica atributos; se não cumpridos, bloqueia a promoção e retorna null
 * com `blocked` preenchido.
 */
export function rankUpReward(
  oldPoints: number,
  newPoints: number,
  attrs?: Record<string, number> | null
): { tier: Rank['tier']; label: string; color: string; essences: number } | null {
  const oldIdx = RANKS.findIndex(r => r.tier === getRank(oldPoints).tier)
  const newRank = getRank(newPoints)
  const newIdx = RANKS.findIndex(r => r.tier === newRank.tier)
  if (newIdx <= oldIdx) return null
  // Check attribute requirements for the new rank
  const missing = checkAttrRequirements(newRank, attrs)
  if (missing.length > 0) return null
  return { tier: newRank.tier, label: newRank.label, color: newRank.color, essences: RANK_REWARDS[newRank.tier] }
}

/**
 * Detecta subida de patente bloqueada por atributos insuficientes.
 * Retorna info de bloqueio ou null se não há tentativa de promoção.
 */
export function rankUpBlocked(
  oldPoints: number,
  newPoints: number,
  attrs?: Record<string, number> | null
): { tier: Rank['tier']; label: string; color: string; missing: { attr: string; have: number; need: number }[] } | null {
  const oldIdx = RANKS.findIndex(r => r.tier === getRank(oldPoints).tier)
  const newRank = getRank(newPoints)
  const newIdx = RANKS.findIndex(r => r.tier === newRank.tier)
  if (newIdx <= oldIdx) return null
  const missing = checkAttrRequirements(newRank, attrs)
  if (missing.length === 0) return null
  return { tier: newRank.tier, label: newRank.label, color: newRank.color, missing }
}

/** Progresso (0..100) dentro da patente atual rumo à próxima. */
export function rankProgress(points: number): number {
  const current = getRank(points)
  const next = nextRank(points)
  if (!next) return 100
  return Math.min(100, Math.round(((points - current.min) / (next.min - current.min)) * 100))
}
