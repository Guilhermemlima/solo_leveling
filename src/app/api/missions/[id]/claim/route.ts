import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { calculateLevelUp } from '@/lib/game-logic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  const userMission = await prisma.userMission.findFirst({
    where: { id, userId: auth.userId, status: 'COMPLETED' },
    include: { mission: true }
  })

  if (!userMission) return NextResponse.json({ error: 'Missão não encontrada ou não completa' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { level, currentXp, levelUps } = calculateLevelUp(user.level, user.currentXp, userMission.mission.xpReward)

  await prisma.$transaction([
    prisma.userMission.update({ where: { id }, data: { status: 'CLAIMED', claimedAt: new Date() } }),
    prisma.user.update({
      where: { id: auth.userId },
      data: {
        level,
        currentXp,
        totalXp: { increment: userMission.mission.xpReward },
        essences: { increment: userMission.mission.essenceReward },
      }
    }),
    prisma.activityHistory.create({
      data: {
        userId: auth.userId,
        type: 'MISSION_CLAIMED',
        description: `Missão resgatada: ${userMission.mission.title}`,
        xpChange: userMission.mission.xpReward,
        essenceChange: userMission.mission.essenceReward,
      }
    })
  ])

  return NextResponse.json({
    xpGained: userMission.mission.xpReward,
    essencesGained: userMission.mission.essenceReward,
    levelUps,
  })
}
