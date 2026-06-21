export const MAX_CHARGES = 5
export const CHARGE_MS   = 30 * 60 * 1000 // 30 min

export function computeCharges(stored: number, nextChargeAt: Date | null, now = Date.now()) {
  if (stored >= MAX_CHARGES) return { charges: MAX_CHARGES, nextChargeAt: null as Date | null }
  if (!nextChargeAt)         return { charges: MAX_CHARGES, nextChargeAt: null as Date | null }

  const msUntilNext = nextChargeAt.getTime() - now
  if (msUntilNext > 0) return { charges: stored, nextChargeAt }

  const regenerated = Math.floor(Math.abs(msUntilNext) / CHARGE_MS) + 1
  const newCharges  = Math.min(MAX_CHARGES, stored + regenerated)
  if (newCharges >= MAX_CHARGES) return { charges: MAX_CHARGES, nextChargeAt: null as Date | null }

  const newNext = new Date(nextChargeAt.getTime() + regenerated * CHARGE_MS)
  return { charges: newCharges, nextChargeAt: newNext }
}

export type NpcRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
export type NpcDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE' | 'CHAMPION' | 'LEGENDARY' | 'NIGHTMARE'

export interface NpcProfile {
  id: string
  name: string
  icon: string
  level: number
  arenaPoints: number
  rankTier: NpcRank
  botDifficulty: NpcDifficulty
  wins: number
  losses: number
}

export const NPC_PLAYERS: NpcProfile[] = [
  // Rank E
  { id: 'npc:zela',   name: 'Zela, a Iniciante',         icon: '🔰', level:  2, arenaPoints:   40, rankTier: 'E', botDifficulty: 'EASY',      wins:   3, losses:  8 },
  { id: 'npc:korin',  name: 'Korin das Brumas',           icon: '🌫️', level:  4, arenaPoints:   95, rankTier: 'E', botDifficulty: 'EASY',      wins:   7, losses: 12 },
  { id: 'npc:yuna',   name: 'Yuna Sombria',               icon: '🌑', level:  5, arenaPoints:  135, rankTier: 'E', botDifficulty: 'EASY',      wins:  10, losses:  9 },
  // Rank D
  { id: 'npc:draven', name: 'Draven, o Veloz',            icon: '⚡', level:  7, arenaPoints:  200, rankTier: 'D', botDifficulty: 'MEDIUM',    wins:  18, losses: 10 },
  { id: 'npc:mira',   name: 'Mira das Flechas',           icon: '🏹', level: 10, arenaPoints:  340, rankTier: 'D', botDifficulty: 'MEDIUM',    wins:  25, losses: 15 },
  { id: 'npc:skar',   name: 'Skar, Caçador',              icon: '🎯', level: 12, arenaPoints:  470, rankTier: 'D', botDifficulty: 'MEDIUM',    wins:  32, losses: 18 },
  // Rank C
  { id: 'npc:azure',  name: 'Azul, o Mago',               icon: '🔵', level: 15, arenaPoints:  610, rankTier: 'C', botDifficulty: 'HARD',      wins:  45, losses: 22 },
  { id: 'npc:kira',   name: 'Kira das Sombras',           icon: '🗡️', level: 18, arenaPoints:  870, rankTier: 'C', botDifficulty: 'HARD',      wins:  60, losses: 28 },
  { id: 'npc:theron', name: 'Theron Combatente',          icon: '⚔️', level: 22, arenaPoints: 1100, rankTier: 'C', botDifficulty: 'HARD',      wins:  78, losses: 35 },
  // Rank B
  { id: 'npc:vorash', name: 'Vorash, o Guerreiro',        icon: '🛡️', level: 25, arenaPoints: 1400, rankTier: 'B', botDifficulty: 'ELITE',     wins:  95, losses: 40 },
  { id: 'npc:nessa',  name: 'Nessa, Lâmina Vazia',        icon: '🔴', level: 30, arenaPoints: 1950, rankTier: 'B', botDifficulty: 'CHAMPION',  wins: 120, losses: 48 },
  { id: 'npc:gram',   name: 'Gram, Cavaleiro das Sombras',icon: '💜', level: 35, arenaPoints: 2600, rankTier: 'B', botDifficulty: 'CHAMPION',  wins: 155, losses: 55 },
  // Rank A
  { id: 'npc:selaen', name: 'Selaen, a Élite',            icon: '✨', level: 38, arenaPoints: 3200, rankTier: 'A', botDifficulty: 'LEGENDARY', wins: 190, losses: 60 },
  { id: 'npc:ruvik',  name: 'Ruvik das Ruínas',           icon: '🌋', level: 43, arenaPoints: 4600, rankTier: 'A', botDifficulty: 'LEGENDARY', wins: 240, losses: 70 },
  { id: 'npc:lhara',  name: 'Lhara, Arauta do Abismo',   icon: '🌌', level: 48, arenaPoints: 5700, rankTier: 'A', botDifficulty: 'LEGENDARY', wins: 290, losses: 80 },
  // Rank S
  { id: 'npc:kael',   name: 'Kael, o Abissal',            icon: '👑', level: 55, arenaPoints: 7500, rankTier: 'S', botDifficulty: 'NIGHTMARE', wins: 350, losses: 85 },
  { id: 'npc:nyx',    name: 'Nyx, Monarca das Sombras',   icon: '💀', level: 62, arenaPoints: 9800, rankTier: 'S', botDifficulty: 'NIGHTMARE', wins: 430, losses: 90 },
  { id: 'npc:zhan',   name: 'Zhan, o Lendário',           icon: '☄️', level: 70, arenaPoints:12500, rankTier: 'S', botDifficulty: 'NIGHTMARE', wins: 520, losses: 95 },
]
