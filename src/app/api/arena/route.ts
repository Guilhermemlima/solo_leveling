import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { battleRewards, deriveStats, makeBot, BOT_DIFFICULTIES, type Attributes, type Combatant } from '@/lib/battle'
import { currentSeason } from '@/lib/seasons'

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
  const equipBonus = user.inventory.reduce((sum, item) => sum + (item.equipment.bonusValue || 0) * (1 + item.upgradeLevel * 0.05), 0)
  const player: Combatant = {
    name: user.name, icon: user.avatarUrl ? '🧑' : user.name.charAt(0).toUpperCase(),
    level: user.level, attributes: (user.attributes || {}) as Attributes, equipBonus,
  }
  const playerStats = deriveStats(player)
  const bots = BOT_DIFFICULTIES.map(({ key, label }) => {
    const bot = makeBot(user.level, key)
    const stats = deriveStats(bot)
    return {
      id: `bot:${key}`, type: 'BOT', difficulty: key, difficultyLabel: label,
      name: bot.name, icon: bot.icon, level: bot.level, power: stats.power,
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
      equipBonus: opponent.inventory.reduce((sum, item) => sum + (item.equipment.bonusValue || 0) * (1 + item.upgradeLevel * 0.05), 0),
    }).power
    return {
      id: `player:${opponent.id}`, type: 'PLAYER', name: opponent.name,
      icon: opponent.avatarUrl ? '🧑' : opponent.name.charAt(0).toUpperCase(),
      level: opponent.level, power, arenaPoints: opponent.arenaPoints,
      risk: riskLabel(playerStats.power, power),
      rewards: battleRewards({ playerLevel: user.level, won: true, type: 'PLAYER' }),
    }
  })
  const [recentBattles, todayBattles] = await Promise.all([
    prisma.battle.findMany({ where: { userId: auth.userId }, orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.battle.count({ where: { userId: auth.userId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
  ])
  return NextResponse.json({
    player: {
      name: user.name, level: user.level, stats: playerStats, wins: user.arenaWins,
      losses: user.arenaLosses, points: user.arenaPoints, seasonPoints: user.seasonPoints,
    },
    season: currentSeason(),
    battlesRemaining: Math.max(0, 20 - todayBattles),
    bots, players, recentBattles,
  })
}
