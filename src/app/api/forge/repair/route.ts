import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { repairCost } from '@/lib/forge'

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

  const missing = item.durabilityMax - item.durability
  if (missing === 0) return NextResponse.json({ error: 'Item já está com durabilidade máxima' }, { status: 400 })

  const cost = repairCost(missing)
  if ((user?.essences ?? 0) < cost) return NextResponse.json({ error: `Essências insuficientes (necessário: ${cost})` }, { status: 400 })

  await prisma.$transaction([
    prisma.inventory.update({
      where: { id: inventoryId },
      data: { durability: item.durabilityMax },
    }),
    prisma.user.update({
      where: { id: auth.userId },
      data: { essences: { decrement: cost } },
    }),
    prisma.forgeLog.create({
      data: {
        userId: auth.userId,
        inventoryId,
        action: 'REPAIR',
        success: true,
        costEssences: cost,
        detail: `${item.equipment.name} reparado (+${missing} durabilidade)`,
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    newDurability: item.durabilityMax,
    costPaid: cost,
    message: `${item.equipment.name} foi completamente reparado.`,
  })
}
