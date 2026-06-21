import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const RARITY_FRAGMENTS: Record<string, number> = {
  COMMON: 2,
  UNCOMMON: 5,
  RARE: 12,
  EPIC: 25,
  LEGENDARY: 50,
  MYTHIC: 100,
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { inventoryId } = body as { inventoryId?: string }

  if (!inventoryId) return NextResponse.json({ error: 'ID do item ausente' }, { status: 400 })

  const item = await prisma.inventory.findFirst({
    where: { id: inventoryId, userId: auth.userId },
    include: { equipment: true },
  })
  if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
  if (item.isEquipped) return NextResponse.json({ error: 'Desequipe o item antes de desmantelar' }, { status: 400 })

  const baseFragments = RARITY_FRAGMENTS[item.equipment.rarity] ?? 2
  const upgradeBonus = item.upgradeLevel
  const totalFragments = baseFragments + upgradeBonus

  await prisma.$transaction(async tx => {
    await tx.inventory.delete({ where: { id: inventoryId } })
    await tx.user.update({ where: { id: auth.userId }, data: { fragments: { increment: totalFragments } } })
    await tx.activityHistory.create({
      data: {
        userId: auth.userId,
        type: 'FORGE_DISMANTLE',
        description: `Desmontado: ${item.equipment.name} → +${totalFragments} ⚗️`,
        essenceChange: 0,
      },
    })
  })

  return NextResponse.json({
    success: true,
    message: `${item.equipment.name} desmontado! +${totalFragments} Fragmentos obtidos`,
    fragmentsGained: totalFragments,
  })
}
