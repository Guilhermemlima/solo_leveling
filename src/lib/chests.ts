import { prisma } from '@/lib/db'

/**
 * Sistema de Caixas de Recompensa (Chi Navy System).
 * Caixas por rank E→S + Especial. Cada abertura sorteia Essências, XP,
 * possível ponto de atributo e possível equipamento (raridade escalada pelo rank).
 */

export type ChestRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SPECIAL'

export interface ChestConfig {
  rank: ChestRank
  key: string
  name: string
  description: string
  icon: string
  color: string
  essences: [number, number]
  xp: [number, number]
  itemChance: number
  rarities: { rarity: string; weight: number }[]
  attrChance: number
  attrPoints: [number, number]
}

export const ATTRIBUTE_KEYS = [
  'strength', 'intelligence', 'discipline', 'focus',
  'vitality', 'charisma', 'wisdom', 'creativity',
] as const

export const CHESTS: Record<ChestRank, ChestConfig> = {
  E: {
    rank: 'E', key: 'CHEST_E', name: 'Caixa Rank E', description: 'Uma caixa simples dos primeiros despertares.', icon: '📦', color: '#94a3b8',
    essences: [10, 25], xp: [10, 20], itemChance: 0.15, attrChance: 0.2, attrPoints: [1, 1],
    rarities: [{ rarity: 'COMMON', weight: 100 }],
  },
  D: {
    rank: 'D', key: 'CHEST_D', name: 'Caixa Rank D', description: 'Recompensas modestas para caçadores iniciantes.', icon: '🎁', color: '#22c55e',
    essences: [20, 45], xp: [20, 40], itemChance: 0.25, attrChance: 0.3, attrPoints: [1, 1],
    rarities: [{ rarity: 'COMMON', weight: 70 }, { rarity: 'UNCOMMON', weight: 30 }],
  },
  C: {
    rank: 'C', key: 'CHEST_C', name: 'Caixa Rank C', description: 'Brilho médio. Pode conter itens incomuns ou raros.', icon: '🧰', color: '#3b82f6',
    essences: [40, 80], xp: [40, 70], itemChance: 0.4, attrChance: 0.4, attrPoints: [1, 2],
    rarities: [{ rarity: 'UNCOMMON', weight: 65 }, { rarity: 'RARE', weight: 35 }],
  },
  B: {
    rank: 'B', key: 'CHEST_B', name: 'Caixa Rank B', description: 'Energia arcana intensa. Itens raros e épicos.', icon: '💎', color: '#8b5cf6',
    essences: [80, 150], xp: [70, 120], itemChance: 0.55, attrChance: 0.5, attrPoints: [2, 2],
    rarities: [{ rarity: 'RARE', weight: 65 }, { rarity: 'EPIC', weight: 35 }],
  },
  A: {
    rank: 'A', key: 'CHEST_A', name: 'Caixa Rank A', description: 'Partículas de poder. Itens épicos e lendários.', icon: '🏆', color: '#f59e0b',
    essences: [150, 300], xp: [120, 200], itemChance: 0.7, attrChance: 0.6, attrPoints: [2, 3],
    rarities: [{ rarity: 'EPIC', weight: 60 }, { rarity: 'LEGENDARY', weight: 40 }],
  },
  S: {
    rank: 'S', key: 'CHEST_S', name: 'Caixa Rank S', description: 'Explosão de aura. Itens lendários e míticos.', icon: '👑', color: '#ec4899',
    essences: [300, 600], xp: [200, 350], itemChance: 0.85, attrChance: 0.75, attrPoints: [3, 3],
    rarities: [{ rarity: 'LEGENDARY', weight: 60 }, { rarity: 'MYTHIC', weight: 40 }],
  },
  SPECIAL: {
    rank: 'SPECIAL', key: 'CHEST_SPECIAL', name: 'Caixa Especial', description: 'Um portal roxo de runas. Recompensa garantida e rara.', icon: '🔮', color: '#a855f7',
    essences: [400, 800], xp: [250, 400], itemChance: 1.0, attrChance: 1.0, attrPoints: [3, 4],
    rarities: [{ rarity: 'MYTHIC', weight: 100 }],
  },
}

export const CHEST_LIST = Object.values(CHESTS)

export interface RolledReward {
  type: 'ESSENCES' | 'XP' | 'ATTRIBUTE' | 'ITEM'
  amount?: number
  attribute?: string
  rarity?: string
}

function randInt([min, max]: [number, number]) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function weightedRarity(rarities: { rarity: string; weight: number }[]): string {
  const total = rarities.reduce((s, r) => s + r.weight, 0)
  let roll = Math.random() * total
  for (const r of rarities) {
    roll -= r.weight
    if (roll <= 0) return r.rarity
  }
  return rarities[rarities.length - 1].rarity
}

/** Sorteia as recompensas de uma caixa. `luck` (0..1) aumenta a chance de item. */
export function rollChest(rank: ChestRank, luck = 0): RolledReward[] {
  const cfg = CHESTS[rank]
  const rewards: RolledReward[] = []

  rewards.push({ type: 'ESSENCES', amount: randInt(cfg.essences) })
  rewards.push({ type: 'XP', amount: randInt(cfg.xp) })

  if (Math.random() < Math.min(1, cfg.itemChance + luck * 0.1)) {
    rewards.push({ type: 'ITEM', rarity: weightedRarity(cfg.rarities) })
  }
  if (Math.random() < cfg.attrChance) {
    const attribute = ATTRIBUTE_KEYS[Math.floor(Math.random() * ATTRIBUTE_KEYS.length)]
    rewards.push({ type: 'ATTRIBUTE', attribute, amount: randInt(cfg.attrPoints) })
  }
  return rewards
}

/** Rank de caixa concedido ao subir de nível. */
export function chestRankForLevel(level: number): ChestRank {
  if (level >= 75) return 'S'
  if (level >= 50) return 'A'
  if (level >= 30) return 'B'
  if (level >= 15) return 'C'
  if (level >= 5) return 'D'
  return 'E'
}

/**
 * Recompensa de caixa pela conclusão diária (seção 3 do spec):
 * <80% nenhuma; 80% Rank D; 100% Rank C + chance de Especial.
 */
export function chestForDailyRatio(ratio: number): { rank: ChestRank; special: boolean } | null {
  if (ratio >= 1) return { rank: 'C', special: Math.random() < 0.18 }
  if (ratio >= 0.8) return { rank: 'D', special: false }
  return null
}

/** Concede uma caixa ao usuário (incrementa a posse). */
export async function grantChest(userId: string, rank: ChestRank, source = 'REWARD') {
  const chest = await prisma.chest.findUnique({ where: { key: CHESTS[rank].key } })
  if (!chest) return null
  await prisma.userChest.upsert({
    where: { userId_chestId: { userId, chestId: chest.id } },
    update: { quantity: { increment: 1 } },
    create: { userId, chestId: chest.id, quantity: 1, source },
  })
  return { rank, name: CHESTS[rank].name, icon: CHESTS[rank].icon, color: CHESTS[rank].color }
}
