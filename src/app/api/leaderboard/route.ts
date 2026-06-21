import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { getRank, nextRank, rankProgress } from '@/lib/ranks'
import { currentSeason, SEASON_REWARDS } from '@/lib/seasons'
import { NPC_PLAYERS } from '@/lib/arena'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const [users, seasonUsers] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ arenaPoints: 'desc' }, { totalXp: 'desc' }],
      take: 200,
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
    }),
    prisma.user.findMany({
      orderBy: { seasonPoints: 'desc' },
      take: 20,
      select: { id: true, name: true, level: true, seasonPoints: true },
    }),
  ])

  const realEntries = users.map(u => ({
    name: u.name,
    level: u.level,
    avatarUrl: u.avatarUrl ?? null,
    points: u.arenaPoints,
    wins: u.arenaWins,
    losses: u.arenaLosses,
    rankTier: getRank(u.arenaPoints).tier,
    selectedClass: u.selectedClass,
    isMe: u.id === auth.userId,
    isNpc: false,
  }))

  const npcEntries = NPC_PLAYERS.map(npc => ({
    name: npc.name,
    level: npc.level,
    avatarUrl: null,
    points: npc.arenaPoints,
    wins: npc.wins,
    losses: npc.losses,
    rankTier: npc.rankTier,
    selectedClass: { name: 'Caçador', icon: npc.icon, color: '#64748b' },
    isMe: false,
    isNpc: true,
  }))

  const combined = [...realEntries, ...npcEntries]
    .sort((a, b) => b.points - a.points)
    .map((e, i) => ({ ...e, position: i + 1 }))

  const meIndex = combined.findIndex(e => e.isMe)
  const mePoints = meIndex >= 0 ? combined[meIndex].points : 0
  const next = nextRank(mePoints)

  return NextResponse.json({
    leaderboard: combined.slice(0, 50),
    me: meIndex >= 0
      ? {
          position: combined[meIndex].position,
          total: combined.length,
          points: mePoints,
          rankTier: getRank(mePoints).tier,
          nextRankTier: next?.tier ?? null,
          pointsToNext: next ? next.min - mePoints : 0,
          progress: rankProgress(mePoints),
        }
      : null,
    season: currentSeason(),
    seasonRewards: SEASON_REWARDS,
    seasonLeaderboard: seasonUsers.map((entry, index) => ({
      position: index + 1,
      name: entry.name,
      level: entry.level,
      points: entry.seasonPoints,
      isMe: entry.id === auth.userId,
    })),
  })
}
