import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { CATEGORY_LABELS } from '@/lib/game-logic'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const now = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })

  const [tasks, user, activity] = await Promise.all([
    prisma.task.findMany({ where: { userId: auth.userId, status: 'COMPLETED', completedAt: { gte: days[0] } } }),
    prisma.user.findUnique({ where: { id: auth.userId }, select: { totalXp: true, essences: true, currentStreak: true, bestStreak: true } }),
    prisma.activityHistory.findMany({ where: { userId: auth.userId, createdAt: { gte: days[0] } } }),
    prisma.task.count({ where: { userId: auth.userId, status: 'COMPLETED' } }),
  ])

  const totalTasks = await prisma.task.count({ where: { userId: auth.userId, status: 'COMPLETED' } })
  const totalEssences = await prisma.activityHistory.aggregate({ where: { userId: auth.userId, essenceChange: { gt: 0 } }, _sum: { essenceChange: true } })

  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const dailyTasks = days.map(d => {
    const next = new Date(d); next.setDate(next.getDate() + 1)
    const count = tasks.filter(t => t.completedAt && t.completedAt >= d && t.completedAt < next).length
    return { day: dayLabels[d.getDay()], count }
  })

  const dailyXp = days.map(d => {
    const next = new Date(d); next.setDate(next.getDate() + 1)
    const xp = activity.filter(a => a.xpChange > 0 && a.createdAt >= d && a.createdAt < next).reduce((sum, a) => sum + a.xpChange, 0)
    return { day: dayLabels[d.getDay()], xp }
  })

  const catGroup = await prisma.task.groupBy({ by: ['category'], where: { userId: auth.userId, status: 'COMPLETED' }, _count: true })
  const categoryDist = catGroup.map(c => ({ name: CATEGORY_LABELS[c.category as keyof typeof CATEGORY_LABELS] || c.category, value: c._count }))

  return NextResponse.json({
    dailyTasks,
    dailyXp,
    categoryDist,
    totalTasks,
    totalXp: user?.totalXp || 0,
    bestStreak: user?.bestStreak || 0,
    currentStreak: user?.currentStreak || 0,
    totalEssences: totalEssences._sum.essenceChange || 0,
  })
}
