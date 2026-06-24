import { prisma } from '@/lib/db'

export interface AchievementCheck {
  type: string
  value: number
}

/**
 * Títulos honoríficos derivados de conquistas, em ordem crescente de
 * prestígio. O título exibido é o de maior prestígio que o usuário possui.
 */
export interface Title {
  achievement: string // nome da conquista que concede o título
  title: string
  icon: string
  color: string
}

export const TITLES: Title[] = [
  { achievement: 'Aprendiz Financeiro',    title: 'Aprendiz Financeiro',    icon: '🪙', color: '#22c55e' },
  { achievement: 'Primeiro Treino',        title: 'Iniciante Físico',       icon: '💪', color: '#f97316' },
  { achievement: 'Investidor Consistente', title: 'Investidor Consistente', icon: '💹', color: '#3b82f6' },
  { achievement: 'Discípulo da Força',     title: 'Discípulo da Força',     icon: '🏋️', color: '#3b82f6' },
  { achievement: 'Guardião da Reserva',    title: 'Guardião da Reserva',    icon: '🛡️', color: '#8b5cf6' },
  { achievement: 'Atleta em Evolução',     title: 'Atleta em Evolução',     icon: '🔥', color: '#8b5cf6' },
  { achievement: 'Corpo em Ascensão',      title: 'Corpo em Ascensão',      icon: '🌟', color: '#f59e0b' },
  { achievement: 'Grande Investidor',      title: 'Grande Investidor',      icon: '🏦', color: '#f59e0b' },
  { achievement: 'Fundador',               title: 'Fundador',               icon: '👑', color: '#fbbf24' },
]

/** Maior título (mais prestigioso) entre os nomes de conquistas desbloqueadas. */
export function highestTitle(unlockedNames: string[]): Title | null {
  for (let i = TITLES.length - 1; i >= 0; i--) {
    if (unlockedNames.includes(TITLES[i].achievement)) return TITLES[i]
  }
  return null
}

/** Busca o título de maior prestígio que o usuário conquistou (ou null). */
export async function getUserTitle(userId: string): Promise<Title | null> {
  const titleNames = TITLES.map(t => t.achievement)
  const owned = await prisma.userAchievement.findMany({
    where: { userId, achievement: { name: { in: titleNames } } },
    select: { achievement: { select: { name: true } } },
  })
  return highestTitle(owned.map(o => o.achievement.name))
}

/**
 * Busca o título de maior prestígio de vários usuários de uma vez (batch).
 * Retorna um mapa userId → Title (apenas para quem possui algum título).
 */
export async function getUsersTitles(userIds: string[]): Promise<Map<string, Title>> {
  const map = new Map<string, Title>()
  if (userIds.length === 0) return map
  const titleNames = TITLES.map(t => t.achievement)
  const owned = await prisma.userAchievement.findMany({
    where: { userId: { in: userIds }, achievement: { name: { in: titleNames } } },
    select: { userId: true, achievement: { select: { name: true } } },
  })
  const byUser = new Map<string, string[]>()
  for (const o of owned) {
    const arr = byUser.get(o.userId) ?? []
    arr.push(o.achievement.name)
    byUser.set(o.userId, arr)
  }
  for (const [userId, names] of byUser) {
    const t = highestTitle(names)
    if (t) map.set(userId, t)
  }
  return map
}

export interface UnlockedAchievement {
  name: string
  description: string
  icon: string
}

/**
 * Desbloqueia conquistas elegíveis para um conjunto de checagens
 * (requirementType + valor atual do usuário) e retorna apenas as que
 * foram desbloqueadas AGORA (para feedback/toast). Idempotente.
 */
export async function unlockAchievements(
  userId: string,
  checks: AchievementCheck[],
): Promise<UnlockedAchievement[]> {
  if (checks.length === 0) return []

  // Busca todas as conquistas elegíveis pelos tipos informados
  const eligible = await prisma.achievement.findMany({
    where: {
      OR: checks.map(c => ({ requirementType: c.type, requirementValue: { lte: c.value } })),
    },
  })
  if (eligible.length === 0) return []

  // Quais o usuário já possui
  const owned = await prisma.userAchievement.findMany({
    where: { userId, achievementId: { in: eligible.map(a => a.id) } },
    select: { achievementId: true },
  })
  const ownedIds = new Set(owned.map(o => o.achievementId))

  const toUnlock = eligible.filter(a => !ownedIds.has(a.id))
  if (toUnlock.length === 0) return []

  await prisma.userAchievement.createMany({
    data: toUnlock.map(a => ({ userId, achievementId: a.id })),
    skipDuplicates: true,
  })

  // Registra no histórico
  await prisma.activityHistory.createMany({
    data: toUnlock.map(a => ({
      userId,
      type: 'ACHIEVEMENT',
      description: `Conquista desbloqueada: ${a.name} ${a.icon}`,
    })),
  })

  return toUnlock.map(a => ({ name: a.name, description: a.description, icon: a.icon }))
}

/** Recalcula e desbloqueia conquistas do módulo de Finanças. */
export async function checkFinanceAchievements(userId: string): Promise<UnlockedAchievement[]> {
  const [contribCount, totalAgg, goalsCreated, goalsCompleted] = await Promise.all([
    prisma.financialContribution.count({ where: { userId } }),
    prisma.financialContribution.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.financialGoal.count({ where: { userId } }),
    prisma.financialGoal.count({ where: { userId, status: 'COMPLETED' } }),
  ])
  return unlockAchievements(userId, [
    { type: 'FINANCE_CONTRIBUTIONS', value: contribCount },
    { type: 'FINANCE_TOTAL_INVESTED', value: Math.floor(totalAgg._sum.amount ?? 0) },
    { type: 'FINANCE_GOALS_CREATED', value: goalsCreated },
    { type: 'FINANCE_GOAL_COMPLETED', value: goalsCompleted },
  ])
}

/** Recalcula e desbloqueia conquistas do módulo de Academia. */
export async function checkFitnessAchievements(userId: string): Promise<UnlockedAchievement[]> {
  const [workouts, prCount, goalsCompleted, measurements] = await Promise.all([
    prisma.workoutLog.count({ where: { userId } }),
    prisma.activityHistory.count({ where: { userId, type: 'FITNESS', description: { contains: 'recorde' } } }),
    prisma.fitnessGoal.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.bodyMeasurement.count({ where: { userId } }),
  ])
  return unlockAchievements(userId, [
    { type: 'FITNESS_WORKOUTS', value: workouts },
    { type: 'FITNESS_PR', value: prCount },
    { type: 'FITNESS_GOAL_COMPLETED', value: goalsCompleted },
    { type: 'FITNESS_MEASUREMENTS', value: measurements },
  ])
}
