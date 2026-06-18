import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { calculateLevelUp } from '@/lib/game-logic'
import { rankUpReward } from '@/lib/ranks'
import {
  simulateBattle, makeBot, battleRewards, deriveStats,
  type Attributes, type Combatant, type BotDifficulty,
} from '@/lib/battle'

async function buildCombatant(userId: string): Promise<Combatant | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    include: { attributes: true, inventory: { where: { isEquipped: true }, include: { equipment: true } } },
  })
  if (!u) return null
  const equipBonus = u.inventory.reduce((s, i) => s + (i.equipment.bonusValue || 0), 0)
  return {
    name: u.name,
    icon: u.avatarUrl ? '🧑' : u.name.charAt(0).toUpperCase(),
    level: u.level,
    attributes: (u.attributes || {}) as Attributes,
    equipBonus,
  }
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { type, difficulty, opponentId } = await req.json()

  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const player = await buildCombatant(auth.userId)
  if (!player) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  let opponent: Combatant
  let battleType: 'BOT' | 'PLAYER'

  if (type === 'PLAYER') {
    if (!opponentId) return NextResponse.json({ error: 'Oponente inválido' }, { status: 400 })
    if (opponentId === auth.userId) return NextResponse.json({ error: 'Você não pode batalhar contra si mesmo' }, { status: 400 })
    const opp = await buildCombatant(opponentId)
    if (!opp) return NextResponse.json({ error: 'Oponente não encontrado' }, { status: 404 })
    opponent = opp
    battleType = 'PLAYER'
  } else {
    const diff = (['EASY', 'MEDIUM', 'HARD'].includes(difficulty) ? difficulty : 'MEDIUM') as BotDifficulty
    opponent = makeBot(user.level, diff)
    battleType = 'BOT'
  }

  const result = simulateBattle(player, opponent)

  const rewards = battleRewards({
    playerLevel: user.level,
    won: result.playerWon,
    type: battleType,
    difficulty: battleType === 'BOT' ? (difficulty as BotDifficulty) : undefined,
  })

  const { level, currentXp, levelUps } = calculateLevelUp(user.level, user.currentXp, rewards.xp)
  const newPoints = Math.max(0, user.arenaPoints + rewards.points)

  // Marco de patente: bônus de Essências ao ser promovido (E→D→C→B→A→S)
  const promotion = rankUpReward(user.arenaPoints, newPoints)
  const promoBonus = promotion?.essences || 0
  const totalEssences = rewards.essences + promoBonus

  await prisma.$transaction([
    prisma.user.update({
      where: { id: auth.userId },
      data: {
        level,
        currentXp,
        totalXp: { increment: rewards.xp },
        essences: { increment: totalEssences },
        arenaWins: { increment: result.playerWon ? 1 : 0 },
        arenaLosses: { increment: result.playerWon ? 0 : 1 },
        arenaPoints: newPoints,
      },
    }),
    prisma.battle.create({
      data: {
        userId: auth.userId,
        opponentName: opponent.name,
        opponentType: battleType,
        won: result.playerWon,
        xpChange: rewards.xp,
        essenceChange: totalEssences,
        pointsChange: rewards.points,
      },
    }),
    prisma.activityHistory.create({
      data: {
        userId: auth.userId,
        type: 'BATTLE',
        description: `${result.playerWon ? 'Vitória' : 'Derrota'} na Arena contra ${opponent.name}`,
        xpChange: rewards.xp,
        essenceChange: rewards.essences,
      },
    }),
    ...(promotion
      ? [prisma.activityHistory.create({
          data: {
            userId: auth.userId,
            type: 'RANK_UP',
            description: `Promovido para ${promotion.label}!`,
            essenceChange: promoBonus,
          },
        })]
      : []),
  ])

  return NextResponse.json({
    playerWon: result.playerWon,
    rounds: result.rounds,
    playerStats: result.playerStats,
    opponentStats: result.opponentStats,
    opponent: { name: opponent.name, icon: opponent.icon, level: opponent.level },
    rewards,
    levelUps,
    newLevel: level,
    rankUp: promotion ? { tier: promotion.tier, label: promotion.label, essences: promotion.essences } : null,
  })
}
