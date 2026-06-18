import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { getRank, nextRank, rankProgress } from '@/lib/ranks'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const users = await prisma.user.findMany({
    orderBy: [{ arenaPoints: 'desc' }, { totalXp: 'desc' }],
    select: {
      id: true,
      name: true,
      level: true,
      avatarUrl: true,
      arenaPoints: true,
      arenaWins: true,
      arenaLosses: true,
      selectedClass: { select: { name: true, icon: true, color: true } },
    },
  })

  const entries = users.map((u, i) => {
    const rank = getRank(u.arenaPoints)
    return {
      position: i + 1,
      id: u.id,
      name: u.name,
      level: u.level,
      avatarUrl: u.avatarUrl,
      points: u.arenaPoints,
      wins: u.arenaWins,
      losses: u.arenaLosses,
      rankTier: rank.tier,
      selectedClass: u.selectedClass,
      isMe: u.id === auth.userId,
    }
  })

  const meIndex = entries.findIndex(e => e.isMe)
  const mePoints = meIndex >= 0 ? entries[meIndex].points : 0
  const next = nextRank(mePoints)

  return NextResponse.json({
    leaderboard: entries.slice(0, 50),
    me: meIndex >= 0
      ? {
          position: entries[meIndex].position,
          total: entries.length,
          points: mePoints,
          rankTier: getRank(mePoints).tier,
          nextRankTier: next?.tier ?? null,
          pointsToNext: next ? next.min - mePoints : 0,
          progress: rankProgress(mePoints),
        }
      : null,
  })
}
