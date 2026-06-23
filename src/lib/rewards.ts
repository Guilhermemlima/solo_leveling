import { prisma } from '@/lib/db'
import { calculateLevelUp } from '@/lib/game-logic'

/**
 * Concede XP + moedas a um usuário de forma segura e idempotente em volume,
 * registrando no histórico. Usado pelos módulos de Finanças e Academia para
 * conectar ações à progressão (EXP, nível, moedas) SEM tocar no sistema de
 * missões existente.
 *
 * Possui um teto diário por `capKey` para evitar farm: o usuário só recebe XP
 * até `dailyCap` pontos de XP por dia naquela categoria de ação.
 */
export interface RewardInput {
  xp: number
  essences: number
  type: string          // tipo no ActivityHistory (ex.: 'FINANCE', 'FITNESS')
  description: string
  capKey?: string        // chave para o teto diário (default = type)
  dailyCap?: number      // teto de XP por dia nessa categoria (default = 150)
}

export interface RewardResult {
  granted: boolean
  xp: number
  essences: number
  leveledUp: boolean
  newLevel: number
}

export async function grantReward(userId: string, input: RewardInput): Promise<RewardResult> {
  const dailyCap = input.dailyCap ?? 150
  const capKey = input.capKey ?? input.type

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  // Soma o XP já concedido hoje nessa categoria
  const todays = await prisma.activityHistory.aggregate({
    where: { userId, type: capKey, createdAt: { gte: startOfDay } },
    _sum: { xpChange: true },
  })
  const earnedToday = todays._sum.xpChange ?? 0
  const remaining = Math.max(0, dailyCap - earnedToday)

  const xp = Math.max(0, Math.min(input.xp, remaining))
  const essences = xp > 0 ? input.essences : 0

  if (xp <= 0 && essences <= 0) {
    return { granted: false, xp: 0, essences: 0, leveledUp: false, newLevel: 0 }
  }

  const result = await prisma.$transaction(async tx => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { level: true, currentXp: true },
    })
    if (!user) throw new Error('USER_NOT_FOUND')

    const lvl = calculateLevelUp(user.level, user.currentXp, xp)
    await tx.user.update({
      where: { id: userId },
      data: {
        level: lvl.level,
        currentXp: lvl.currentXp,
        totalXp: { increment: xp },
        essences: { increment: essences },
      },
    })
    await tx.activityHistory.create({
      data: { userId, type: capKey, description: input.description, xpChange: xp, essenceChange: essences },
    })
    return { leveledUp: lvl.levelUps.length > 0, newLevel: lvl.level }
  })

  return { granted: true, xp, essences, leveledUp: result.leveledUp, newLevel: result.newLevel }
}
