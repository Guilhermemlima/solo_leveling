import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { calculateLevelUp } from '@/lib/game-logic'
import { grantChest, chestRankForLevel } from '@/lib/chests'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params
  try {
    const reward = await prisma.$transaction(async tx => {
      const userMission = await tx.userMission.findFirst({
        where: { id, userId: auth.userId, status: 'COMPLETED' },
        include: { mission: true },
      })
      if (!userMission) throw new Error('NOT_AVAILABLE')
      const claimed = await tx.userMission.updateMany({
        where: { id, userId: auth.userId, status: 'COMPLETED' },
        data: { status: 'CLAIMED', claimedAt: new Date() },
      })
      if (!claimed.count) throw new Error('NOT_AVAILABLE')
      const user = await tx.user.findUniqueOrThrow({ where: { id: auth.userId } })
      const progress = calculateLevelUp(user.level, user.currentXp, userMission.mission.xpReward)
      await tx.user.update({
        where: { id: auth.userId },
        data: {
          level: progress.level, currentXp: progress.currentXp,
          totalXp: { increment: userMission.mission.xpReward },
          essences: { increment: userMission.mission.essenceReward },
        },
      })
      await tx.activityHistory.create({
        data: {
          userId: auth.userId, type: 'MISSION_CLAIMED',
          description: `Missão resgatada: ${userMission.mission.title}`,
          xpChange: userMission.mission.xpReward, essenceChange: userMission.mission.essenceReward,
        },
      })
      let chestReward = null
      if (progress.levelUps.length > 0) {
        const rank = chestRankForLevel(progress.level)
        chestReward = await grantChest(auth.userId, rank, 'LEVEL_UP', tx)
      }
      return { xpGained: userMission.mission.xpReward, essencesGained: userMission.mission.essenceReward, levelUps: progress.levelUps, chestReward }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    return NextResponse.json(reward)
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_AVAILABLE') {
      return NextResponse.json({ error: 'Missão não disponível para resgate' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Não foi possível resgatar a missão' }, { status: 500 })
  }
}
