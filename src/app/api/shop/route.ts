import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const rarity = searchParams.get('rarity')
  const type = searchParams.get('type')

  const ownedIds = (await prisma.inventory.findMany({
    where: { userId: auth.userId },
    select: { equipmentId: true }
  })).map(i => i.equipmentId)

  const equipment = await prisma.equipment.findMany({
    where: {
      ...(rarity ? { rarity: rarity as any } : {}),
      ...(type ? { type: type as any } : {}),
    },
    orderBy: { price: 'asc' }
  })

  return NextResponse.json(equipment.map(e => ({ ...e, owned: ownedIds.includes(e.id) })))
}
