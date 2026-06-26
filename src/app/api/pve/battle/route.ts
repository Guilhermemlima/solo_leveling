import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { calculateLevelUp } from '@/lib/game-logic'
import { deriveStats, simulateStats, computeEquipBonuses, type Attributes, type Combatant } from '@/lib/battle'
import { enemyToStats, readiness, pveRewards, pveChestDrop } from '@/lib/pve'
import { grantChest, CHESTS, type ChestRank } from '@/lib/chests'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const limiter = rateLimit(clientKey(req, 'pve-battle', auth.userId), 15, 60_000)
  if (!limiter.allowed) return NextResponse.json({ error: 'Aguarde antes de iniciar outra batalha PvE' }, { status: 429 })

  const { enemyId } = await req.json().catch(() => ({}))
  if (!enemyId) return NextResponse.json({ error: 'Inimigo inválido' }, { status: 400 })

  const [user, enemy] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      include: { attributes: true, inventory: { where: { isEquipped: true }, include: { equipment: true } } },
    }),
    prisma.enemy.findUnique({ where: { id: enemyId } }),
  ])
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  if (!enemy) return NextResponse.json({ error: 'Inimigo não encontrado' }, { status: 404 })

  const player: Combatant = {
    name: user.name, icon: '🧑', level: user.level,
    attributes: (user.attributes || {}) as Attributes,
    equipBonuses: computeEquipBonuses(user.inventory.map(i => ({
      bonusType: i.equipment.bonusType,
      bonusValue: i.equipment.bonusValue || 0,
      upgradeLevel: i.upgradeLevel,
    }))),
  }
  const playerStats = deriveStats(player)

  const enemyStats = enemyToStats(enemy)

  // Bloqueio por poder insuficiente (mesma escala de poder do jogador)
  const ready = readiness(playerStats.power, enemyStats.power)
  if (ready.locked) {
    return NextResponse.json({
      error: 'Você ainda não está pronto. Complete missões reais, melhore seus atributos e equipe itens melhores antes de enfrentar este inimigo.',
      locked: true,
    }, { status: 400 })
  }

  const result = simulateStats(playerStats, enemyStats)

  const rewards = pveRewards(enemy.rank, user.level, result.playerWon)
  const droppedRank = pveChestDrop(enemy.rank, result.playerWon)

  const { level, currentXp, levelUps } = calculateLevelUp(user.level, user.currentXp, rewards.xp)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: auth.userId },
      data: {
        level, currentXp,
        totalXp: { increment: rewards.xp },
        essences: { increment: rewards.essences },
      },
    }),
    prisma.battle.create({
      data: {
        userId: auth.userId,
        opponentName: enemy.name,
        opponentType: 'ENEMY',
        won: result.playerWon,
        xpChange: rewards.xp,
        essenceChange: rewards.essences,
      },
    }),
    prisma.activityHistory.create({
      data: {
        userId: auth.userId,
        type: 'PVE_BATTLE',
        description: `${result.playerWon ? 'Derrotou' : 'Foi derrotado por'} ${enemy.name}`,
        xpChange: rewards.xp,
        essenceChange: rewards.essences,
      },
    }),
  ])

  let chestDrop: { rank: string; name: string; icon: string } | null = null
  if (droppedRank) {
    const granted = await grantChest(auth.userId, droppedRank as ChestRank, 'PVE_DROP')
    if (granted) chestDrop = { rank: granted.rank, name: granted.name, icon: granted.icon }
  }

  return NextResponse.json({
    playerWon: result.playerWon,
    rounds: result.rounds,
    playerStats: result.playerStats,
    opponentStats: result.opponentStats,
    opponent: { name: enemy.name, icon: enemy.icon, level: enemy.recommendedPower },
    rewards: { xp: rewards.xp, essences: rewards.essences, points: 0 },
    levelUps,
    newLevel: level,
    chestDrop,
  })
}
