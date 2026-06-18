import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { deriveStats, makeBot, BOT_DIFFICULTIES, type Attributes, type Combatant } from '@/lib/battle'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      attributes: true,
      inventory: { where: { isEquipped: true }, include: { equipment: true } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const equipBonus = user.inventory.reduce((s, i) => s + (i.equipment.bonusValue || 0), 0)
  const playerCombatant: Combatant = {
    name: user.name,
    icon: user.avatarUrl ? '🧑' : user.name.charAt(0).toUpperCase(),
    level: user.level,
    attributes: (user.attributes || {}) as Attributes,
    equipBonus,
  }
  const playerStats = deriveStats(playerCombatant)

  // Bots escalados
  const bots = BOT_DIFFICULTIES.map(({ key, label }) => {
    const bot = makeBot(user.level, key)
    return { id: `bot:${key}`, type: 'BOT', difficulty: key, difficultyLabel: label, name: bot.name, icon: bot.icon, level: bot.level, power: deriveStats(bot).power }
  })

  // Jogadores reais de nível próximo (±3), excluindo o próprio
  const nearby = await prisma.user.findMany({
    where: {
      id: { not: auth.userId },
      level: { gte: Math.max(1, user.level - 3), lte: user.level + 3 },
    },
    include: { attributes: true, inventory: { where: { isEquipped: true }, include: { equipment: true } } },
    take: 6,
  })

  const players = nearby.map(p => {
    const eq = p.inventory.reduce((s, i) => s + (i.equipment.bonusValue || 0), 0)
    const stats = deriveStats({ name: p.name, icon: '🧑', level: p.level, attributes: (p.attributes || {}) as Attributes, equipBonus: eq })
    return { id: `player:${p.id}`, type: 'PLAYER', name: p.name, icon: p.avatarUrl ? '🧑' : p.name.charAt(0).toUpperCase(), level: p.level, power: stats.power, arenaPoints: p.arenaPoints }
  })

  const recentBattles = await prisma.battle.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })

  return NextResponse.json({
    player: {
      name: user.name,
      level: user.level,
      stats: playerStats,
      wins: user.arenaWins,
      losses: user.arenaLosses,
      points: user.arenaPoints,
    },
    bots,
    players,
    recentBattles,
  })
}
