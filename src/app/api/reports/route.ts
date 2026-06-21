import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { CATEGORY_LABELS } from '@/lib/game-logic'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const now = new Date()
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - index))
    date.setHours(0, 0, 0, 0)
    return date
  })
  const [executions, user, totalEssences] = await Promise.all([
    prisma.taskExecution.findMany({
      where: { userId: auth.userId },
      select: {
        completedAt: true,
        durationMinutes: true,
        xpGained: true,
        perceivedDifficulty: true,
        actualValue: true,
        task: { select: { category: true, estimatedMinutes: true, targetValue: true } },
      },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.user.findUnique({ where: { id: auth.userId }, select: { totalXp: true, currentStreak: true, bestStreak: true } }),
    prisma.activityHistory.aggregate({ where: { userId: auth.userId, essenceChange: { gt: 0 } }, _sum: { essenceChange: true } }),
  ])
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const recent = executions.filter(item => item.completedAt >= days[0])
  const dailyTasks = days.map(date => {
    const next = new Date(date); next.setDate(next.getDate() + 1)
    return { day: labels[date.getDay()], count: recent.filter(item => item.completedAt >= date && item.completedAt < next).length }
  })
  const dailyXp = days.map(date => {
    const next = new Date(date); next.setDate(next.getDate() + 1)
    return { day: labels[date.getDay()], xp: recent.filter(item => item.completedAt >= date && item.completedAt < next).reduce((sum, item) => sum + item.xpGained, 0) }
  })
  const categoryMap = new Map<string, number>()
  executions.forEach(item => categoryMap.set(item.task.category, (categoryMap.get(item.task.category) || 0) + 1))
  const categoryDist = [...categoryMap].map(([category, value]) => ({ name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category, value }))
  const withDuration = executions.filter(item => item.durationMinutes != null)
  const plannedMinutes = withDuration.reduce((sum, item) => sum + (item.task.estimatedMinutes || 0), 0)
  const actualMinutes = withDuration.reduce((sum, item) => sum + (item.durationMinutes || 0), 0)
  const withTarget = executions.filter(item => item.actualValue != null && item.task.targetValue != null)
  const targetCompletion = withTarget.length ? Math.round(withTarget.reduce((sum, item) => sum + Math.min(1, (item.actualValue || 0) / (item.task.targetValue || 1)), 0) / withTarget.length * 100) : 0
  const difficultyItems = executions.filter(item => item.perceivedDifficulty)
  const averageDifficulty = difficultyItems.length ? (difficultyItems.reduce((sum, item) => sum + (item.perceivedDifficulty || 0), 0) / difficultyItems.length).toFixed(1) : '0'
  const hours = executions.reduce<Record<string, number>>((map, item) => {
    const hour = String(item.completedAt.getHours()).padStart(2, '0')
    map[hour] = (map[hour] || 0) + 1
    return map
  }, {})
  const bestHour = Object.entries(hours).sort((a, b) => b[1] - a[1])[0]?.[0]
  return NextResponse.json({
    dailyTasks, dailyXp, categoryDist, totalTasks: executions.length, totalXp: user?.totalXp || 0,
    bestStreak: user?.bestStreak || 0, currentStreak: user?.currentStreak || 0,
    totalEssences: totalEssences._sum.essenceChange || 0, plannedMinutes, actualMinutes,
    targetCompletion, averageDifficulty, bestHour: bestHour ? `${bestHour}:00` : '—',
  })
}
