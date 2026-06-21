import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { battleRewards, deriveStats, makeBot, BOT_DIFFICULTIES, computeEquipBonuses, type Attributes, type Combatant } from '@/lib/battle'
import { currentSeason } from '@/lib/seasons'
import { computeCharges } from '@/lib/arena'

function riskLabel(playerPower: number, opponentPower: number) {
  const ratio = opponentPower / Math.max(1, playerPower)
  if (ratio < 0.8) return { label: 'Favorável', color: 'emerald' }
  if (ratio < 1.1) return { label: 'Equilibrado', color: 'amber' }
  return { label: 'Alto risco', color: 'red' }
}

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: { attributes: true, inventory: { where: { isEquipped: true }, include: { equipment: true } } },
  })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  const player: Combatant = {
    name: user.name, icon: user.avatarUrl ? '🧑' : user.name.charAt(0).toUpperCase(),
    level: user.level, attributes: (user.attributes || {}) as Attributes,
    equipBonuses: computeEquipBonuses(user.inventory.map(i => ({
      bonusType: i.equipment.bonusType,
      bonusValue: i.equipment.bonusValue || 0,
      upgradeLevel: i.upgradeLevel,
    }))),
  }
  const playerStats = deriveStats(player)
  const bots = BOT_DIFFICULTIES.map(({ key, label, rankLabel }) => {
    const bot = makeBot(user.level, key)
    const stats = deriveStats(bot)
    return {
      id: `bot:${key}`, type: 'BOT', difficulty: key, difficultyLabel: label, rankLabel,
      name: bot.name, icon: bot.icon, imageUrl: bot.imageUrl, level: bot.level, power: stats.power,
      risk: riskLabel(playerStats.power, stats.power),
      rewards: battleRewards({ playerLevel: user.level, won: true, type: 'BOT', difficulty: key }),
    }
  })
  const nearby = await prisma.user.findMany({
    where: { id: { not: auth.userId }, level: { gte: Math.max(1, user.level - 3), lte: user.level + 3 } },
    include: { attributes: true, inventory: { where: { isEquipped: true }, include: { equipment: true } } },
    take: 6,
  })
  const players = nearby.map(opponent => {
    const power = deriveStats({
      name: opponent.name, icon: '🧑', level: opponent.level,
      attributes: (opponent.attributes || {}) as Attributes,
      equipBonuses: computeEquipBonuses(opponent.inventory.map(i => ({
        bonusType: i.equipment.bonusType,
        bonusValue: i.equipment.bonusValue || 0,
        upgradeLevel: i.upgradeLevel,
      }))),
    }).power
    return {
      id: `player:${opponent.id}`, type: 'PLAYER', name: opponent.name,
      icon: opponent.avatarUrl ? '🧑' : opponent.name.charAt(0).toUpperCase(),
      level: opponent.level, power, arenaPoints: opponent.arenaPoints,
      risk: riskLabel(playerStats.power, power),
      rewards: battleRewards({ playerLevel: user.level, won: true, type: 'PLAYER' }),
    }
  })
  const { charges, nextChargeAt: computedNextAt } = computeCharges(user.arenaCharges, user.arenaNextChargeAt)
  const recentBattles = await prisma.battle.findMany({ where: { userId: auth.userId }, orderBy: { createdAt: 'desc' }, take: 8 })

  return NextResponse.json({
    player: {
      name: user.name, level: user.level, stats: playerStats, wins: user.arenaWins,
      losses: user.arenaLosses, points: user.arenaPoints, seasonPoints: user.seasonPoints,
      lastBattleAt: user.lastBattleAt,
    },
    season: currentSeason(),
    charges,
    nextChargeAt: computedNextAt,
    bots, players, recentBattles,
  })
}
