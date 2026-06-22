import { prisma } from '@/lib/db'

export interface AchievementCheck {
  type: string
  value: number
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
