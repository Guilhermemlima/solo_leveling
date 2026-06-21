import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { xpForLevel } from '@/lib/game-logic'
import { syncUserDaily } from '@/lib/daily-sync'
import { computeEquipBonuses, deriveStats, type Attributes, type Combatant } from '@/lib/battle'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // Reabre recorrências, reinicia missões do período e ajusta o streak
  await syncUserDaily(auth.userId)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const weekStart = new Date(today)
  // getDay() returns 0=Sun..6=Sat; shift so week starts Monday
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))

  const [user, todayTasks, activeMissions, recentActivity, weeklyStats, equippedItems] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      include: { selectedClass: true, attributes: true }
    }),
    prisma.task.findMany({
      where: {
        userId: auth.userId,
        OR: [
          { recurrence: 'DAILY' },
          { recurrence: 'ONCE', status: 'PENDING' },
          { createdAt: { gte: today, lt: tomorrow } }
        ]
      },
      include: { subtasks: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.userMission.findMany({
      where: { userId: auth.userId, status: 'ACTIVE' },
      include: { mission: true },
      take: 5
    }),
    prisma.activityHistory.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.taskExecution.findMany({
      where: {
        userId: auth.userId,
        completedAt: { gte: weekStart }
      }
    }),
    prisma.inventory.findMany({
      where: { userId: auth.userId, isEquipped: true },
      include: { equipment: true },
    }),
  ])

  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const equipBonuses = computeEquipBonuses(
    equippedItems.map(i => ({ ...i.equipment, upgradeLevel: i.upgradeLevel }))
  )
  const combatant: Combatant = {
    name: user.name, icon: '🧑', level: user.level,
    attributes: (user.attributes || {}) as Attributes, equipBonuses,
  }
  const combatStats = deriveStats(combatant)

  const { passwordHash: _, ...safeUser } = user

  return NextResponse.json({
    user: { ...safeUser, xpForNextLevel: xpForLevel(user.level) },
    todayTasks,
    activeMissions,
    recentActivity,
    weeklyCompleted: weeklyStats.length,
    combatStats,
  })
}
