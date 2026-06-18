import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { equipmentId } = await req.json()
  if (!equipmentId) return NextResponse.json({ error: 'ID do equipamento é obrigatório' }, { status: 400 })

  const [equipment, user] = await Promise.all([
    prisma.equipment.findUnique({ where: { id: equipmentId } }),
    prisma.user.findUnique({ where: { id: auth.userId } })
  ])

  if (!equipment) return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const alreadyOwned = await prisma.inventory.findFirst({ where: { userId: auth.userId, equipmentId } })
  if (alreadyOwned) return NextResponse.json({ error: 'Você já possui este item' }, { status: 400 })

  if (user.essences < equipment.price) {
    return NextResponse.json({ error: 'Essências insuficientes' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: auth.userId }, data: { essences: { decrement: equipment.price } } }),
    prisma.inventory.create({ data: { userId: auth.userId, equipmentId } }),
    prisma.activityHistory.create({
      data: {
        userId: auth.userId,
        type: 'ITEM_PURCHASED',
        description: `Item comprado: ${equipment.name}`,
        essenceChange: -equipment.price,
      }
    })
  ])

  return NextResponse.json({ message: `${equipment.name} adquirido com sucesso!`, essencesSpent: equipment.price })
}
