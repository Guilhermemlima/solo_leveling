import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const RARITY_SELL_MULT: Record<string, number> = {
  COMMON: 0.30, UNCOMMON: 0.35, RARE: 0.40, EPIC: 0.45, LEGENDARY: 0.50, MYTHIC: 0.55,
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  const item = await prisma.inventory.findFirst({
    where: { id, userId: auth.userId },
    include: { equipment: true },
  })

  if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
  if (item.isEquipped) return NextResponse.json({ error: 'Desequipe o item antes de vender' }, { status: 400 })

  const mult = RARITY_SELL_MULT[item.equipment.rarity] ?? 0.30
  const baseEssences = Math.max(1, Math.round(item.equipment.price * mult))
  const upgradeBonus = Math.round(baseEssences * item.upgradeLevel * 0.10)
  const totalEssences = baseEssences + upgradeBonus

  await prisma.$transaction(async tx => {
    await tx.inventory.delete({ where: { id } })
    await tx.user.update({ where: { id: auth.userId }, data: { essences: { increment: totalEssences } } })
    await tx.activityHistory.create({
      data: {
        userId: auth.userId,
        type: 'ITEM_SOLD',
        description: `Vendido: ${item.equipment.name}${item.upgradeLevel > 0 ? ` +${item.upgradeLevel}` : ''} → +${totalEssences} 💎`,
        essenceChange: totalEssences,
      },
    })
  })

  return NextResponse.json({ success: true, essencesGained: totalEssences, message: `${item.equipment.name} vendido por ${totalEssences} 💎` })
}
