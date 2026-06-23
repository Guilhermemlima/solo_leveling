import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { upgradeCost, upgradeChance, UPGRADE_DURABILITY_DRAIN, MAX_UPGRADE } from '@/lib/forge'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { inventoryId } = await req.json().catch(() => ({}))
  if (!inventoryId) return NextResponse.json({ error: 'Item inválido' }, { status: 400 })

  const [item, user] = await Promise.all([
    prisma.inventory.findUnique({ where: { id: inventoryId }, include: { equipment: true } }),
    prisma.user.findUnique({ where: { id: auth.userId }, select: { essences: true } }),
  ])

  if (!item || item.userId !== auth.userId) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
  if (item.upgradeLevel >= MAX_UPGRADE) return NextResponse.json({ error: 'Item já está no nível máximo' }, { status: 400 })
  if (item.durability <= 0) return NextResponse.json({ error: 'Item quebrado — repare antes de forjar' }, { status: 400 })

  const cost = upgradeCost(item.upgradeLevel)
  if ((user?.essences ?? 0) < cost) return NextResponse.json({ error: `Moedas insuficientes (necessário: ${cost})` }, { status: 400 })

  const roll = Math.random()
  const chance = upgradeChance(item.upgradeLevel)
  const success = roll <= chance

  const newLevel = success ? item.upgradeLevel + 1 : item.upgradeLevel
  const newDurability = Math.max(0, item.durability - UPGRADE_DURABILITY_DRAIN)

  await prisma.$transaction([
    prisma.inventory.update({
      where: { id: inventoryId },
      data: { upgradeLevel: newLevel, durability: newDurability },
    }),
    prisma.user.update({
      where: { id: auth.userId },
      data: { essences: { decrement: cost } },
    }),
    prisma.forgeLog.create({
      data: {
        userId: auth.userId,
        inventoryId,
        action: 'UPGRADE',
        success,
        costEssences: cost,
        detail: success ? `${item.equipment.name} aprimorado para +${newLevel}` : `Tentativa falhou (${Math.round(chance * 100)}%)`,
      },
    }),
  ])

  return NextResponse.json({
    success,
    newLevel,
    newDurability,
    costPaid: cost,
    message: success
      ? `Aprimoramento bem-sucedido! ${item.equipment.name} agora é +${newLevel}`
      : `Aprimoramento falhou. A chance era ${Math.round(chance * 100)}%.`,
  })
}
