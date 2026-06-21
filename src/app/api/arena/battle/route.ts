import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { calculateLevelUp } from '@/lib/game-logic'
import { rankUpReward, rankUpBlocked } from '@/lib/ranks'
import { currentSeason } from '@/lib/seasons'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { computeCharges, MAX_CHARGES, CHARGE_MS } from '@/lib/arena'
import {
  simulateBattle, makeBot, battleRewards, computeEquipBonuses, type Attributes, type Combatant, type BotDifficulty,
} from '@/lib/battle'

async function buildCombatant(userId: string): Promise<Combatant | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { attributes: true, inventory: { where: { isEquipped: true }, include: { equipment: true } } },
  })
  if (!user) return null
  return {
    name: user.name,
    icon: user.avatarUrl ? '🧑' : user.name.charAt(0).toUpperCase(),
    level: user.level,
    attributes: (user.attributes || {}) as Attributes,
    equipBonuses: computeEquipBonuses(user.inventory.map(i => ({
      bonusType: i.equipment.bonusType,
      bonusValue: i.equipment.bonusValue || 0,
      upgradeLevel: i.upgradeLevel,
    }))),
  }
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const limiter = rateLimit(clientKey(req, 'arena', auth.userId), 10, 60_000)
  if (!limiter.allowed) return NextResponse.json({ error: 'Aguarde antes de iniciar outra batalha' }, { status: 429 })

  const idempotencyKey = req.headers.get('idempotency-key')
  if (!idempotencyKey) return NextResponse.json({ error: 'Chave de idempotência ausente' }, { status: 400 })
  const cached = await prisma.actionReceipt.findUnique({
    where: { userId_action_key: { userId: auth.userId, action: 'BATTLE', key: idempotencyKey } },
  })
  if (cached?.result) return NextResponse.json(cached.result)

  const body = await req.json()
  const user = await prisma.user.findUnique({ where: { id: auth.userId }, include: { attributes: true } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  // ── Charge pre-check (fast path) ──────────────────────────────────────────
  const { charges: preCheckCharges, nextChargeAt: preCheckNextAt } = computeCharges(
    user.arenaCharges,
    user.arenaNextChargeAt,
    Date.now(),
  )
  if (preCheckCharges <= 0) {
    const msUntil = user.arenaNextChargeAt!.getTime() - Date.now()
    const mins    = Math.ceil(msUntil / 60_000)
    return NextResponse.json(
      { error: `Sem cargas de batalha. Próxima carga em ${mins} minuto${mins !== 1 ? 's' : ''}.` },
      { status: 429 },
    )
  }
  // ──────────────────────────────────────────────────────────────────────────

  const player = await buildCombatant(auth.userId)
  if (!player) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  let opponent: Combatant
  let battleType: 'BOT' | 'PLAYER'
  let difficulty: BotDifficulty | undefined

  if (body.type === 'PLAYER') {
    if (!body.opponentId || body.opponentId === auth.userId)
      return NextResponse.json({ error: 'Oponente inválido' }, { status: 400 })
    const target = await prisma.user.findFirst({
      where: { id: body.opponentId, level: { gte: Math.max(1, user.level - 3), lte: user.level + 3 } },
    })
    if (!target) return NextResponse.json({ error: 'Oponente fora da faixa de nível' }, { status: 400 })
    const built = await buildCombatant(body.opponentId)
    if (!built) return NextResponse.json({ error: 'Oponente não encontrado' }, { status: 404 })
    opponent = built; battleType = 'PLAYER'
  } else {
    const VALID_DIFFICULTIES: BotDifficulty[] = ['EASY', 'MEDIUM', 'HARD', 'ELITE', 'CHAMPION', 'LEGENDARY', 'NIGHTMARE']
    difficulty = (VALID_DIFFICULTIES.includes(body.difficulty) ? body.difficulty : 'MEDIUM') as BotDifficulty
    opponent = makeBot(user.level, difficulty); battleType = 'BOT'
  }

  const simulation  = simulateBattle(player, opponent)
  const rewards     = battleRewards({ playerLevel: user.level, won: simulation.playerWon, type: battleType, difficulty })
  const levelResult = calculateLevelUp(user.level, user.currentXp, rewards.xp)
  const newPoints   = Math.max(0, user.arenaPoints + rewards.points)
  const userAttrs   = user.attributes as Record<string, number> | null
  const promotion   = rankUpReward(user.arenaPoints, newPoints, userAttrs)
  const blocked     = promotion ? null : rankUpBlocked(user.arenaPoints, newPoints, userAttrs)
  const totalEssences = rewards.essences + (promotion?.essences || 0)
  const season      = currentSeason()
  const seasonDelta = simulation.playerWon ? rewards.points : 0

  try {
    const response = await prisma.$transaction(async tx => {
      await tx.actionReceipt.create({ data: { userId: auth.userId, action: 'BATTLE', key: idempotencyKey } })

      // Re-read charges inside transaction to prevent race condition
      const txUser = await tx.user.findUnique({
        where: { id: auth.userId },
        select: { arenaCharges: true, arenaNextChargeAt: true },
      })
      if (!txUser) throw new Error('USER_NOT_FOUND')
      const { charges, nextChargeAt: computedNextAt } = computeCharges(txUser.arenaCharges, txUser.arenaNextChargeAt)
      if (charges <= 0) throw new Error('NO_CHARGES')
      const txNewCharges = charges - 1
      const txNewNextAt  = charges === MAX_CHARGES ? new Date(Date.now() + CHARGE_MS) : computedNextAt

      await tx.arenaSeason.upsert({
        where: { key: season.key },
        update: { active: true },
        create: { ...season, active: true },
      })
      await tx.user.update({
        where: { id: auth.userId },
        data: {
          level: levelResult.level,
          currentXp: levelResult.currentXp,
          totalXp:      { increment: rewards.xp },
          essences:     { increment: totalEssences },
          arenaWins:    { increment: simulation.playerWon ? 1 : 0 },
          arenaLosses:  { increment: simulation.playerWon ? 0 : 1 },
          arenaPoints:  newPoints,
          seasonPoints: { increment: seasonDelta },
          lastBattleAt:      new Date(),
          arenaCharges:      txNewCharges,
          arenaNextChargeAt: txNewNextAt,
        },
      })
      await tx.battle.create({
        data: {
          userId: auth.userId, opponentName: opponent.name, opponentType: battleType,
          won: simulation.playerWon, xpChange: rewards.xp, essenceChange: totalEssences,
          pointsChange: rewards.points, seasonKey: season.key,
        },
      })
      await tx.activityHistory.create({
        data: {
          userId: auth.userId, type: 'BATTLE',
          description: `${simulation.playerWon ? 'Vitória' : 'Derrota'} na Arena contra ${opponent.name}`,
          xpChange: rewards.xp, essenceChange: rewards.essences,
        },
      })
      if (promotion) {
        await tx.activityHistory.create({
          data: { userId: auth.userId, type: 'RANK_UP', description: `Promovido para ${promotion.label}!`, essenceChange: promotion.essences },
        })
      }

      const result = {
        playerWon: simulation.playerWon,
        rounds: simulation.rounds,
        playerStats: simulation.playerStats,
        opponentStats: simulation.opponentStats,
        opponent: { name: opponent.name, icon: opponent.icon, level: opponent.level },
        rewards: { ...rewards, essences: totalEssences, seasonPoints: seasonDelta },
        levelUps: levelResult.levelUps,
        newLevel: levelResult.level,
        rankUp:      promotion ? { tier: promotion.tier, label: promotion.label, essences: promotion.essences } : null,
        rankBlocked: blocked   ? { tier: blocked.tier, label: blocked.label, missing: blocked.missing } : null,
        chargesLeft: txNewCharges,
      }
      await tx.actionReceipt.update({
        where: { userId_action_key: { userId: auth.userId, action: 'BATTLE', key: idempotencyKey } },
        data: { result: JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue },
      })
      return result
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2034')) {
      const receipt = await prisma.actionReceipt.findUnique({
        where: { userId_action_key: { userId: auth.userId, action: 'BATTLE', key: idempotencyKey } },
      })
      if (receipt?.result) return NextResponse.json(receipt.result)
    }
    const message = error instanceof Error ? error.message : ''
    if (message === 'NO_CHARGES') {
      const msUntil = (user.arenaNextChargeAt?.getTime() ?? Date.now() + CHARGE_MS) - Date.now()
      const mins = Math.ceil(msUntil / 60_000)
      return NextResponse.json(
        { error: `Sem cargas de batalha. Próxima carga em ${mins} minuto${mins !== 1 ? 's' : ''}.` },
        { status: 429 },
      )
    }
    console.error('Battle error:', error)
    return NextResponse.json({ error: 'Não foi possível concluir a batalha' }, { status: 500 })
  }
}
