import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { syncUserDaily } from '@/lib/daily-sync'

function getNextReset(type: string): Date {
  const now = new Date()
  if (type === 'DAILY') {
    const next = new Date(now)
    next.setDate(next.getDate() + 1)
    next.setHours(0, 0, 0, 0)
    return next
  }
  if (type === 'WEEKLY') {
    // Next Monday 00:00
    const next = new Date(now)
    const day = next.getDay() // 0=Sun, 1=Mon, ...
    const daysUntilMonday = day === 0 ? 1 : 8 - day
    next.setDate(next.getDate() + daysUntilMonday)
    next.setHours(0, 0, 0, 0)
    return next
  }
  if (type === 'MONTHLY') {
    // 1st of next month
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0)
    return next
  }
  // SPECIAL missions don't reset
  return new Date(8640000000000000)
}

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  await syncUserDaily(auth.userId)

  const missions = await prisma.userMission.findMany({
    where: { userId: auth.userId },
    include: { mission: { include: { itemReward: true } } },
    orderBy: [{ mission: { type: 'asc' } }, { assignedAt: 'desc' }],
  })

  const withReset = missions.map(um => ({
    ...um,
    nextReset: getNextReset(um.mission.type),
  }))

  return NextResponse.json(withReset)
}
