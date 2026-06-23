import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { equipmentId } = await req.json()
  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } })
  if (!equipment) return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 })
  try {
    await prisma.$transaction(async tx => {
      const debit = await tx.user.updateMany({
        where: { id: auth.userId, essences: { gte: equipment.price } },
        data: { essences: { decrement: equipment.price } },
      })
      if (!debit.count) throw new Error('INSUFFICIENT')
      await tx.inventory.create({ data: { userId: auth.userId, equipmentId } })
      await tx.activityHistory.create({
        data: { userId: auth.userId, type: 'ITEM_PURCHASED', description: `Item comprado: ${equipment.name}`, essenceChange: -equipment.price },
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Você já possui este item' }, { status: 409 })
    }
    if (error instanceof Error && error.message === 'INSUFFICIENT') {
      return NextResponse.json({ error: 'Moedas insuficientes' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Não foi possível concluir a compra' }, { status: 500 })
  }
  return NextResponse.json({ message: `${equipment.name} adquirido com sucesso`, essencesSpent: equipment.price })
}
