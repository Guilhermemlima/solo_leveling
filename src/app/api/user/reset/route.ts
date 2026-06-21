import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser, comparePassword } from '@/lib/auth'

/**
 * Reseta TODO o progresso do usuário mantendo a conta.
 * Requer confirmação via senha para evitar resets acidentais ou não autorizados.
 */
export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { password } = await req.json().catch(() => ({}))
  if (!password) return NextResponse.json({ error: 'Senha obrigatória para confirmar o reset' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { passwordHash: true } })
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

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
    prisma.userChest.deleteMany({ where: { userId: auth.userId } }),
    prisma.forgeLog.deleteMany({ where: { userId: auth.userId } }),
    prisma.chestOpeningLog.deleteMany({ where: { userId: auth.userId } }),
    prisma.attribute.upsert({
      where: { userId: auth.userId },
      update: { strength: 0, intelligence: 0, discipline: 0, focus: 0, vitality: 0, charisma: 0, wisdom: 0, creativity: 0 },
      create: { userId: auth.userId, strength: 0, intelligence: 0, discipline: 0, focus: 0, vitality: 0, charisma: 0, wisdom: 0, creativity: 0 },
    }),
    prisma.user.update({
      where: { id: auth.userId },
      data: {
        level: 1, currentXp: 0, totalXp: 0, essences: 0, fragments: 0,
        currentStreak: 0, bestStreak: 0, lastActiveDate: null,
        arenaWins: 0, arenaLosses: 0, arenaPoints: 0, seasonPoints: 0,
        arenaCharges: 5, arenaNextChargeAt: null,
      },
    }),
    prisma.userMission.createMany({
      data: allMissions.map(m => ({ userId: auth.userId, missionId: m.id })),
    }),
  ])

  return NextResponse.json({ message: 'Progresso resetado com sucesso' })
}
