import { prisma } from '@/lib/db'

/** Início do dia (00:00) para uma data. */
function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** Início da semana (domingo 00:00). */
function startOfWeek(d: Date): Date {
  const x = startOfDay(d)
  x.setDate(x.getDate() - x.getDay())
  return x
}

/** Início do mês (dia 1, 00:00). */
function startOfMonth(d: Date): Date {
  const x = startOfDay(d)
  x.setDate(1)
  return x
}

const PENALTY_ESSENCES = 15

/**
 * Sincroniza o estado "temporal" do usuário toda vez que ele carrega o app:
 *  - Reabre tarefas recorrentes cujo período já virou (diária/semanal/mensal).
 *  - Reinicia missões diárias/semanais quando o período passou.
 *  - Quebra o streak se o usuário pulou um dia inteiro (e aplica penalidade leve, se ativa).
 *
 * É idempotente: rodar várias vezes no mesmo dia não muda nada.
 */
export async function syncUserDaily(userId: string) {
  const now = new Date()
  const today = startOfDay(now)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  const ops: Promise<unknown>[] = []

  // 1) Reabrir tarefas recorrentes concluídas em período anterior
  ops.push(
    prisma.task.updateMany({
      where: { userId, recurrence: 'DAILY', status: 'COMPLETED', completedAt: { lt: today } },
      data: { status: 'PENDING', completedAt: null },
    }),
    prisma.task.updateMany({
      where: { userId, recurrence: 'WEEKLY', status: 'COMPLETED', completedAt: { lt: weekStart } },
      data: { status: 'PENDING', completedAt: null },
    }),
    prisma.task.updateMany({
      where: { userId, recurrence: 'MONTHLY', status: 'COMPLETED', completedAt: { lt: monthStart } },
      data: { status: 'PENDING', completedAt: null },
    }),
    prisma.taskSubtask.updateMany({
      where: { task: { userId, status: 'PENDING' } },
      data: { completed: false },
    }),
  )

  // 2) Reiniciar missões diárias/semanais/mensais cujo período passou.
  //    Inclui COMPLETED: uma recompensa de período anterior não resgatada é
  //    perdida no virar do período (comportamento de ciclo diário), senão a
  //    missão fica presa "concluída" para sempre e a caixa diária vira grátis.
  const staleMissions = await prisma.userMission.findMany({
    where: {
      userId,
      status: { in: ['ACTIVE', 'CLAIMED', 'COMPLETED'] },
      mission: { type: { in: ['DAILY', 'WEEKLY', 'MONTHLY'] } },
      OR: [
        { mission: { type: 'DAILY' }, assignedAt: { lt: today } },
        { mission: { type: 'WEEKLY' }, assignedAt: { lt: weekStart } },
        { mission: { type: 'MONTHLY' }, assignedAt: { lt: monthStart } },
      ],
    },
    include: { mission: true },
  })

  for (const um of staleMissions) {
    ops.push(
      prisma.userMission.update({
        where: { id: um.id },
        data: { progress: 0, status: 'ACTIVE', completedAt: null, claimedAt: null, assignedAt: now },
      })
    )
  }

  // 3a) Desbloqueio progressivo: atribuir missões que o usuário ainda não tem
  //     com base em quantos dias se passaram desde o cadastro
  const daysSinceCreation = Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const [availableMissions, existingUserMissions] = await Promise.all([
    prisma.mission.findMany({
      where: { minDayUnlock: { lte: daysSinceCreation } },
      select: { id: true },
    }),
    prisma.userMission.findMany({ where: { userId }, select: { missionId: true } }),
  ])
  const existingIds = new Set(existingUserMissions.map(um => um.missionId))
  const toAssign = availableMissions.filter(m => !existingIds.has(m.id))
  if (toAssign.length > 0) {
    ops.push(
      prisma.userMission.createMany({
        data: toAssign.map(m => ({ userId, missionId: m.id })),
        skipDuplicates: true,
      })
    )
  }

  // 3) Quebra de streak: último dia ativo foi antes de ontem → perdeu a sequência
  if (user.lastActiveDate) {
    const lastActive = startOfDay(user.lastActiveDate)
    const yesterday = startOfDay(now)
    yesterday.setDate(yesterday.getDate() - 1)

    if (lastActive < yesterday && user.currentStreak > 0) {
      const data: Record<string, unknown> = { currentStreak: 0 }
      if (user.penaltiesEnabled && user.essences > 0) {
        const penalty = Math.min(PENALTY_ESSENCES, user.essences)
        data.essences = { decrement: penalty }
        ops.push(
          prisma.activityHistory.create({
            data: {
              userId,
              type: 'STREAK_LOST',
              description: 'Sequência perdida por inatividade',
              essenceChange: -penalty,
            },
          })
        )
      }
      ops.push(prisma.user.update({ where: { id: userId }, data }))
    }
  }

  await Promise.all(ops)
}
