import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

/**
 * Reseta TODO o progresso do usuário mantendo a conta:
 * zera nível/XP/Essências/streak, limpa atributos, e remove tarefas,
 * histórico, inventário, conquistas e missões. As missões são
 * reatribuídas do zero.
 */
export async function POST() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const allMissions = await prisma.mission.findMany({ select: { id: true } })

  await prisma.$transaction([
    prisma.task.deleteMany({ where: { userId: auth.userId } }),
    prisma.activityHistory.deleteMany({ where: { userId: auth.userId } }),
    prisma.inventory.deleteMany({ where: { userId: auth.userId } }),
    prisma.userAchievement.deleteMany({ where: { userId: auth.userId } }),
    prisma.userMission.deleteMany({ where: { userId: auth.userId } }),
    prisma.battle.deleteMany({ where: { userId: auth.userId } }),
    prisma.actionReceipt.deleteMany({ where: { userId: auth.userId } }),
    prisma.groupContribution.deleteMany({ where: { userId: auth.userId } }),
    prisma.attribute.update({
      where: { userId: auth.userId },
      data: { strength: 0, intelligence: 0, discipline: 0, focus: 0, vitality: 0, charisma: 0, wisdom: 0, creativity: 0 },
    }),
    prisma.user.update({
      where: { id: auth.userId },
      data: {
        level: 1, currentXp: 0, totalXp: 0, essences: 0, currentStreak: 0,
        bestStreak: 0, lastActiveDate: null, arenaWins: 0, arenaLosses: 0,
        arenaPoints: 0, seasonPoints: 0,
      },
    }),
    prisma.userMission.createMany({
      data: allMissions.map(m => ({ userId: auth.userId, missionId: m.id })),
    }),
  ])

  return NextResponse.json({ message: 'Progresso resetado com sucesso' })
}
