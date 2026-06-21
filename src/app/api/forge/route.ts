import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { upgradeCost, upgradeChance, upgradedBonusValue, repairCost, upgradeLabel, chanceLabel, MAX_UPGRADE } from '@/lib/forge'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const inventory = await prisma.inventory.findMany({
    where: { userId: auth.userId },
    include: { equipment: true },
    orderBy: { acquiredAt: 'desc' },
  })

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { essences: true, fragments: true } })

  const items = inventory.map(item => {
    const nextCost = item.upgradeLevel < MAX_UPGRADE ? upgradeCost(item.upgradeLevel) : null
    const nextChance = item.upgradeLevel < MAX_UPGRADE ? upgradeChance(item.upgradeLevel) : null
    const currentBonus = upgradedBonusValue(item.equipment.bonusValue, item.upgradeLevel)
    const missingDur = item.durabilityMax - item.durability
    return {
      id: item.id,
      equipmentId: item.equipmentId,
      name: item.equipment.name,
      type: item.equipment.type,
      rarity: item.equipment.rarity,
      icon: item.equipment.icon,
      imageUrl: item.equipment.imageUrl,
      isEquipped: item.isEquipped,
      bonusType: item.equipment.bonusType,
      baseBonus: item.equipment.bonusValue,
      currentBonus: Math.round(currentBonus * 100) / 100,
      upgradeLevel: item.upgradeLevel,
      upgradeLabel: upgradeLabel(item.upgradeLevel),
      durability: item.durability,
      durabilityMax: item.durabilityMax,
      durabilityPct: Math.round((item.durability / item.durabilityMax) * 100),
      canUpgrade: item.upgradeLevel < MAX_UPGRADE && item.durability > 0,
      maxed: item.upgradeLevel >= MAX_UPGRADE,
      nextCost,
      nextChance: nextChance !== null ? chanceLabel(nextChance) : null,
      repairCost: missingDur > 0 ? repairCost(missingDur) : 0,
      needsRepair: item.durability < item.durabilityMax,
    }
  })

  const recent = await prisma.forgeLog.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return NextResponse.json({ items, essences: user?.essences ?? 0, fragments: user?.fragments ?? 0, recent })
}
