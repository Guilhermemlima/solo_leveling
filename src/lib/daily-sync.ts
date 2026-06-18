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
  )

  // 2) Reiniciar missões diárias/semanais cujo período passou (resgatadas ou não)
  const staleMissions = await prisma.userMission.findMany({
    where: {
      userId,
      mission: { type: { in: ['DAILY', 'WEEKLY'] } },
      OR: [
        { mission: { type: 'DAILY' }, assignedAt: { lt: today } },
        { mission: { type: 'WEEKLY' }, assignedAt: { lt: weekStart } },
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
