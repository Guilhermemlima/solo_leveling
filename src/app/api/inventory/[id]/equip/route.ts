import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  const item = await prisma.inventory.findFirst({
    where: { id, userId: auth.userId },
    include: { equipment: true }
  })

  if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })

  // Itens "Conjunto" são pacotes da loja (concedem as 4 peças) — não são equipáveis.
  if (item.equipment.isFullSet) {
    return NextResponse.json({ error: 'O Conjunto é um pacote — equipe as peças individuais (elmo, peitoral, calça, botas).' }, { status: 400 })
  }

  if (item.isEquipped) {
    await prisma.inventory.update({ where: { id }, data: { isEquipped: false } })
    return NextResponse.json({ message: 'Item desequipado', isEquipped: false })
  }

  await prisma.$transaction(async tx => {
    await tx.inventory.updateMany({
      where: { userId: auth.userId, equipment: { type: item.equipment.type }, isEquipped: true },
      data: { isEquipped: false },
    })
    await tx.inventory.update({ where: { id }, data: { isEquipped: true } })
  })
  return NextResponse.json({ message: 'Item equipado!', isEquipped: true })
}
