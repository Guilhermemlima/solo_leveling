import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { deriveStats, computeEquipBonuses, type Attributes, type Combatant } from '@/lib/battle'
import { readiness, enemyToStats } from '@/lib/pve'

const RANK_ORDER: Record<string, number> = { E: 0, D: 1, C: 2, B: 3, A: 4, S: 5 }

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: { attributes: true, inventory: { where: { isEquipped: true }, include: { equipment: true } } },
  })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

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

  const enemies = await prisma.enemy.findMany()
  enemies.sort((a, b) => (RANK_ORDER[a.rank] - RANK_ORDER[b.rank]) || (a.recommendedPower - b.recommendedPower))

  const list = enemies.map(e => ({
    id: e.id,
    key: e.key,
    name: e.name,
    rank: e.rank,
    type: e.type,
    isBoss: e.isBoss,
    icon: e.icon,
    imageUrl: e.imageUrl,
    hp: e.hp,
    attack: e.attack,
    defense: e.defense,
    weakness: e.weakness,
    resistance: e.resistance,
    specialMechanic: e.specialMechanic,
    recommendedPower: enemyToStats(e).power,
    drops: e.drops,
    readiness: readiness(playerStats.power, enemyToStats(e).power),
  }))

  const recentBattles = await prisma.battle.findMany({
    where: { userId: auth.userId, opponentType: 'ENEMY' },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })

  return NextResponse.json({ player: { name: user.name, level: user.level, power: playerStats.power, stats: playerStats }, enemies: list, recentBattles })
}
