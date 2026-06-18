import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const [all, unlocked] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({
      where: { userId: auth.userId },
      include: { achievement: true }
    })
  ])

  const unlockedIds = new Set(unlocked.map(u => u.achievementId))

  return NextResponse.json(
    all.map(a => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      unlockedAt: unlocked.find(u => u.achievementId === a.id)?.unlockedAt || null
    }))
  )
}
