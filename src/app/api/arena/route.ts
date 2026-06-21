import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { battleRewards, deriveStats, makeBot, BOT_DIFFICULTIES, computeEquipBonuses, type Attributes, type Combatant } from '@/lib/battle'
import { currentSeason } from '@/lib/seasons'
import { computeCharges, NPC_PLAYERS } from '@/lib/arena'
import { getRank, RANKS } from '@/lib/ranks'

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
  // Matchmaking por patente: mostra oponentes da mesma patente ± 1
  const currentRank = getRank(user.arenaPoints)
  const rankIdx = RANKS.findIndex(r => r.tier === currentRank.tier)
  const lowerMin = rankIdx > 0 ? RANKS[rankIdx - 1].min : 0
  const upperMax = rankIdx < RANKS.length - 2 ? RANKS[rankIdx + 2].min - 1 : 999999

  const nearby = await prisma.user.findMany({
    where: { id: { not: auth.userId }, arenaPoints: { gte: lowerMin, lte: upperMax } },
    include: { attributes: true, inventory: { where: { isEquipped: true }, include: { equipment: true } } },
    take: 4,
  })
  const realPlayers = nearby.map(opponent => {
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

  // NPCs: 2-3 do rank atual + 1-2 do rank adjacente
  const visibleNpcs = NPC_PLAYERS.filter(npc =>
    npc.rankTier === currentRank.tier ||
    (rankIdx > 0 && npc.rankTier === RANKS[rankIdx - 1].tier) ||
    (rankIdx < RANKS.length - 1 && npc.rankTier === RANKS[rankIdx + 1].tier)
  ).slice(0, 5)
  const npcPlayers = visibleNpcs.map(npc => ({
    id: npc.id, type: 'NPC', name: npc.name, icon: npc.icon,
    level: npc.level, power: 100 + npc.arenaPoints * 0.8, arenaPoints: npc.arenaPoints,
    risk: riskLabel(playerStats.power, 100 + npc.arenaPoints * 0.8),
    rewards: { xp: 35 + user.level * 3, essences: 15 + user.level, points: 12 },
  }))

  const players = [...realPlayers, ...npcPlayers]
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
