import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { chestForDailyRatio, grantChest, CHESTS } from '@/lib/chests'

function todayKey() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

/** Calcula a razão de conclusão das missões diárias e o estado do prêmio. */
async function dailyState(userId: string) {
  const daily = await prisma.userMission.findMany({
    where: { userId, mission: { type: 'DAILY' } },
    include: { mission: true },
  })
  const total = daily.length
  const completed = daily.filter(m => m.status === 'COMPLETED' || m.status === 'CLAIMED').length
  const ratio = total > 0 ? completed / total : 0
  return { total, completed, ratio }
}

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const state = await dailyState(auth.userId)
  const receipt = await prisma.actionReceipt.findUnique({
    where: { userId_action_key: { userId: auth.userId, action: 'DAILY_CHEST', key: todayKey() } },
  })
  const reward = chestForDailyRatio(state.ratio)

  return NextResponse.json({
    ...state,
    claimed: !!receipt,
    eligible: !!reward && !receipt,
    rewardPreview: reward ? { rank: reward.rank, name: CHESTS[reward.rank].name } : null,
  })
}

export async function POST() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const key = todayKey()
  const existing = await prisma.actionReceipt.findUnique({
    where: { userId_action_key: { userId: auth.userId, action: 'DAILY_CHEST', key } },
  })
  if (existing) return NextResponse.json({ error: 'Recompensa diária já resgatada hoje' }, { status: 400 })

  const state = await dailyState(auth.userId)
  const reward = chestForDailyRatio(state.ratio)
  if (!reward) {
    return NextResponse.json({ error: 'Conclua ao menos 80% das missões diárias para resgatar a caixa' }, { status: 400 })
  }

  try {
    const granted = await prisma.$transaction(async tx => {
      const receipt = await tx.actionReceipt.findUnique({
        where: { userId_action_key: { userId: auth.userId, action: 'DAILY_CHEST', key } },
      })
      if (receipt) throw new Error('ALREADY_CLAIMED')

      await tx.actionReceipt.create({
        data: { userId: auth.userId, action: 'DAILY_CHEST', key, result: { ratio: state.ratio, rank: reward.rank, special: reward.special } },
      })

      const results = [await grantChest(auth.userId, reward.rank, 'DAILY', tx)]
      if (reward.special) results.push(await grantChest(auth.userId, 'SPECIAL', 'DAILY', tx))

      await tx.activityHistory.create({
        data: { userId: auth.userId, type: 'DAILY_CHEST', description: `Recompensa diária resgatada (${Math.round(state.ratio * 100)}%)`, xpChange: 0, essenceChange: 0 },
      })

      return results
    })
    return NextResponse.json({ granted: granted.filter(Boolean) })
  } catch (err) {
    if (err instanceof Error && err.message === 'ALREADY_CLAIMED') {
      return NextResponse.json({ error: 'Recompensa diária já resgatada hoje' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Não foi possível resgatar a recompensa' }, { status: 500 })
  }
}
