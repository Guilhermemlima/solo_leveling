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
      NOT: { name: 'Moeda do Sistema' },
      imageUrl: { not: null },
      ...(rarity ? { rarity: rarity as any } : {}),
      ...(type ? { type: type as any } : {}),
    },
    orderBy: { price: 'asc' }
  })

  // For full-set items, compute piece ownership and effective price
  const fullSets = equipment.filter(e => e.isFullSet && e.setKey)
  const setKeyToPieces: Record<string, { total: number; owned: number; ownedValue: number }> = {}
  if (fullSets.length > 0) {
    const setKeys = fullSets.map(e => e.setKey!)
    const pieces = await prisma.equipment.findMany({
      where: { setKey: { in: setKeys }, isFullSet: false },
      select: { id: true, setKey: true, price: true },
    })
    for (const sk of setKeys) {
      const skPieces = pieces.filter(p => p.setKey === sk)
      const ownedPieces = skPieces.filter(p => ownedIds.includes(p.id))
      setKeyToPieces[sk] = {
        total: skPieces.length,
        owned: ownedPieces.length,
        ownedValue: ownedPieces.reduce((s, p) => s + p.price, 0),
      }
    }
  }

  return NextResponse.json(equipment.map(e => {
    if (e.isFullSet && e.setKey && setKeyToPieces[e.setKey]) {
      const { total, owned: ownedPieces, ownedValue } = setKeyToPieces[e.setKey]
      return {
        ...e,
        owned: ownedPieces >= total,
        ownedPieces,
        totalPieces: total,
        effectivePrice: Math.max(0, e.price - ownedValue),
      }
    }
    return { ...e, owned: ownedIds.includes(e.id) }
  }))
}
