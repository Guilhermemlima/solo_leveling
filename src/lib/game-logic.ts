import { TaskCategory, TaskDifficulty } from '@prisma/client'

export const XP_REWARDS: Record<TaskDifficulty, number> = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
  EXTREME: 100,
}

export const ESSENCE_REWARDS: Record<TaskDifficulty, number> = {
  EASY: 5,
  MEDIUM: 12,
  HARD: 25,
  EXTREME: 50,
}

export function xpForLevel(level: number): number {
  return 100 + level * 50
}

/**
 * Calcula o multiplicador de bônus de XP da classe para uma tarefa.
 * Retorna ex.: 1.12 para +12%. Bônus genéricos (XP geral, STREAK ao manter
 * sequência) também se aplicam. `bonusValue` é a porcentagem (ex.: 12).
 */
export function classXpMultiplier(
  bonusType: string | undefined | null,
  bonusValue: number | undefined | null,
  category: TaskCategory,
  keepsStreak: boolean
): number {
  if (!bonusType || !bonusValue) return 1
  const pct = bonusValue / 100

  const matchesCategory: Record<string, TaskCategory[]> = {
    WORK: ['WORK'],
    STUDY: ['STUDY'],
    HEALTH: ['HEALTH', 'TRAINING'],
    FOCUS: ['WORK'],
  }

  switch (bonusType) {
    case 'XP':
      return 1 + pct // bônus em todo XP
    case 'STREAK':
      return keepsStreak ? 1 + pct : 1 // bônus ao manter o streak
    case 'HABIT':
      return 1 + pct // recompensa por consistência
    case 'DAILY':
      return 1 + pct
    default:
      return matchesCategory[bonusType]?.includes(category) ? 1 + pct : 1
  }
}

export function totalXpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) total += xpForLevel(i)
  return total
}

export function calculateLevelUp(currentLevel: number, currentXp: number, xpGained: number) {
  let level = currentLevel
  let xp = currentXp + xpGained
  const levelUps: number[] = []

  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level)
    level++
    levelUps.push(level)
  }

  return { level, currentXp: xp, levelUps }
}

export const ATTRIBUTE_GAINS: Partial<Record<TaskCategory, Partial<Record<string, number>>>> = {
  TRAINING: { strength: 2, vitality: 1, discipline: 1 },
  HEALTH: { vitality: 2, discipline: 1 },
  STUDY: { intelligence: 2, focus: 1, discipline: 1 },
  WORK: { focus: 2, discipline: 1, intelligence: 1 },
  FINANCE: { intelligence: 1, discipline: 1, focus: 1 },
  SPIRITUALITY: { wisdom: 2, discipline: 1 },
  SOCIAL: { charisma: 2 },
  HOME: { discipline: 1, vitality: 1 },
  PERSONAL_DEVELOPMENT: { wisdom: 1, intelligence: 1, discipline: 1 },
  CREATIVITY: { creativity: 2, intelligence: 1 },
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  HEALTH: 'Saúde',
  TRAINING: 'Treino',
  STUDY: 'Estudo',
  WORK: 'Trabalho',
  FINANCE: 'Finanças',
  SPIRITUALITY: 'Espiritualidade',
  SOCIAL: 'Social',
  HOME: 'Casa',
  PERSONAL_DEVELOPMENT: 'Desenvolvimento Pessoal',
  CREATIVITY: 'Criatividade',
}

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  HEALTH: '❤️',
  TRAINING: '💪',
  STUDY: '📚',
  WORK: '💼',
  FINANCE: '💰',
  SPIRITUALITY: '🙏',
  SOCIAL: '👥',
  HOME: '🏠',
  PERSONAL_DEVELOPMENT: '🌱',
  CREATIVITY: '🎨',
}

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  EASY: 'Fácil',
  MEDIUM: 'Média',
  HARD: 'Difícil',
  EXTREME: 'Extrema',
}

export const DIFFICULTY_COLORS: Record<TaskDifficulty, string> = {
  EASY: '#22c55e',
  MEDIUM: '#f59e0b',
  HARD: '#ef4444',
  EXTREME: '#8b5cf6',
}

export const RARITY_COLORS: Record<string, string> = {
  COMMON: '#9ca3af',
  UNCOMMON: '#22c55e',
  RARE: '#3b82f6',
  EPIC: '#8b5cf6',
  LEGENDARY: '#f59e0b',
  MYTHIC: '#ec4899',
}

export const RARITY_LABELS: Record<string, string> = {
  COMMON: 'Comum',
  UNCOMMON: 'Incomum',
  RARE: 'Raro',
  EPIC: 'Épico',
  LEGENDARY: 'Lendário',
  MYTHIC: 'Mítico',
}

export const EQUIP_TYPE_LABELS: Record<string, string> = {
  WEAPON: 'Arma',
  ARMOR: 'Armadura',
  SHIELD: 'Escudo',
  RING: 'Anel',
  BRACELET: 'Bracelete',
  AMULET: 'Amuleto',
  BOOTS: 'Botas',
  BOOK: 'Livro',
  MEDAL: 'Medalha',
  RELIC: 'Relíquia',
  HELMET: 'Elmo',
  CHESTPLATE: 'Peitoral',
  PANTS: 'Calça',
}

/**
 * Multiplicador de recompensas baseado no nível do usuário.
 * +10% por nível, garantindo que o jogo se torne mais rentável
 * conforme o jogador sobe (necessário para equilibrar itens caros).
 */
export function levelMultiplier(level: number): number {
  return 1 + (level - 1) * 0.1
}

export const STREAK_REWARDS: Record<number, { essences: number; label: string }> = {
  3: { essences: 30, label: '3 dias de sequência!' },
  7: { essences: 75, label: '1 semana de sequência!' },
  14: { essences: 150, label: '2 semanas de sequência!' },
  30: { essences: 400, label: '1 mês de sequência!' },
  60: { essences: 1000, label: '2 meses de sequência!' },
  100: { essences: 2500, label: '100 dias de sequência!' },
}
