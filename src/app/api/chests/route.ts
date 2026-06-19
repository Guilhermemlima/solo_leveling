import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { CHESTS, type ChestRank } from '@/lib/chests'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const [userChests, recentOpenings] = await Promise.all([
    prisma.userChest.findMany({
      where: { userId: auth.userId, quantity: { gt: 0 } },
      include: { chest: true },
      orderBy: { acquiredAt: 'desc' },
    }),
    prisma.chestOpeningLog.findMany({
      where: { userId: auth.userId },
      include: { chest: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  // chances/ranges para a tela "ver chances"
  const odds = userChests.map(uc => {
    const cfg = CHESTS[uc.chest.rank as ChestRank]
    return {
      rank: uc.chest.rank,
      essences: cfg.essences,
      xp: cfg.xp,
      itemChance: Math.round(cfg.itemChance * 100),
      attrChance: Math.round(cfg.attrChance * 100),
      rarities: cfg.rarities,
    }
  })

  return NextResponse.json({ userChests, recentOpenings, odds })
}
