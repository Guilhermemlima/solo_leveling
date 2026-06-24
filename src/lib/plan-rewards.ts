import { prisma } from '@/lib/db'
import { grantChest, type ChestRank } from '@/lib/chests'
import { planLabel } from '@/lib/resend'

/**
 * Recompensas de boas-vindas concedidas 1x por compra de cada plano.
 * A idempotência por compra é garantida pela tabela processed_webhooks
 * (dedup por transactionId) no webhook da Cakto.
 */
interface PlanReward {
  coins: number
  chests: [ChestRank, number][]
  founderTitle: boolean
  legendaryItem: boolean
}

export const PLAN_REWARDS: Record<string, PlanReward> = {
  mensal:    { coins: 100, chests: [['D', 1]],               founderTitle: false, legendaryItem: false },
  anual:     { coins: 300, chests: [['C', 2]],               founderTitle: true,  legendaryItem: false },
  vitalicio: { coins: 600, chests: [['A', 1], ['SPECIAL', 1]], founderTitle: true,  legendaryItem: true },
}

/**
 * Concede as recompensas do plano ao usuário. Aceita um cliente de
 * transação Prisma opcional. Não lança — registra erro e segue.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function grantPlanRewards(userId: string, plan: string | null | undefined, tx?: any) {
  const db = tx ?? prisma
  const key = (plan ?? '').toLowerCase()
  const cfg = PLAN_REWARDS[key]
  if (!cfg) return { granted: false }

  try {
    // Moedas
    if (cfg.coins > 0) {
      await db.user.update({ where: { id: userId }, data: { essences: { increment: cfg.coins } } })
    }

    // Caixas
    for (const [rank, qty] of cfg.chests) {
      for (let i = 0; i < qty; i++) await grantChest(userId, rank, 'PLAN_PURCHASE', db)
    }

    // Título "Fundador" (via conquista)
    if (cfg.founderTitle) {
      const ach = await db.achievement.findUnique({ where: { name: 'Fundador' }, select: { id: true } })
      if (ach) {
        await db.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: ach.id } },
          update: {},
          create: { userId, achievementId: ach.id },
        })
      }
    }

    // Item lendário inicial (maior valor entre os LEGENDARY)
    if (cfg.legendaryItem) {
      const item = await db.equipment.findFirst({
        where: { rarity: 'LEGENDARY' },
        orderBy: { price: 'desc' },
        select: { id: true },
      })
      if (item) await db.inventory.create({ data: { userId, equipmentId: item.id } })
    }

    // Histórico
    await db.activityHistory.create({
      data: {
        userId,
        type: 'PLAN_REWARD',
        description: `Recompensas do ${planLabel(key)} liberadas! 🎁`,
        essenceChange: cfg.coins,
      },
    })

    return { granted: true, ...cfg }
  } catch (e) {
    console.error('[PlanRewards] Falha ao conceder recompensas do plano:', (e as Error).message)
    return { granted: false }
  }
}
