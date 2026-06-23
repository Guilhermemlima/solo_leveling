import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

const RARITY_ORDER = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'] as const
type Rarity = typeof RARITY_ORDER[number]

const MERGE_FRAGMENT_COST: Record<Rarity, number> = {
  COMMON: 5,
  UNCOMMON: 12,
  RARE: 25,
  EPIC: 50,
  LEGENDARY: 100,
  MYTHIC: 0, // can't merge MYTHIC
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { inventoryIds } = body as { inventoryIds?: string[] }

  if (!Array.isArray(inventoryIds) || inventoryIds.length !== 3) {
    return NextResponse.json({ error: 'Selecione exatamente 3 itens para fusão' }, { status: 400 })
  }
  if (new Set(inventoryIds).size !== 3) {
    return NextResponse.json({ error: 'Os itens selecionados devem ser distintos' }, { status: 400 })
  }

  const items = await prisma.inventory.findMany({
    where: { id: { in: inventoryIds }, userId: auth.userId },
    include: { equipment: true },
  })

  if (items.length !== 3) {
    return NextResponse.json({ error: 'Um ou mais itens não pertencem ao seu inventário' }, { status: 404 })
  }

  const rarities = [...new Set(items.map(i => i.equipment.rarity))]
  if (rarities.length !== 1) {
    return NextResponse.json({ error: 'Os 3 itens devem ter a mesma raridade' }, { status: 400 })
  }

  const rarity = rarities[0] as Rarity
  const rarityIdx = RARITY_ORDER.indexOf(rarity)
  if (rarityIdx === -1 || rarityIdx >= RARITY_ORDER.length - 1) {
    return NextResponse.json({ error: 'Itens Míticos não podem ser fundidos' }, { status: 400 })
  }

  if (items.some(i => i.isEquipped)) {
    return NextResponse.json({ error: 'Desequipe os itens antes de fundir' }, { status: 400 })
  }

  const nextRarity = RARITY_ORDER[rarityIdx + 1]
  const fragmentCost = MERGE_FRAGMENT_COST[rarity]

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { fragments: true } })
  if (!user || user.fragments < fragmentCost) {
    return NextResponse.json({ error: `Fragmentos insuficientes. Necessário: ${fragmentCost} ⚗️` }, { status: 400 })
  }

  // Exclude items already owned and "Moeda do Sistema" from candidates
  const ownedEquipmentIds = (await prisma.inventory.findMany({
    where: { userId: auth.userId },
    select: { equipmentId: true },
  })).map(i => i.equipmentId)

  const candidates = await prisma.equipment.findMany({
    where: {
      rarity: nextRarity,
      id: { notIn: ownedEquipmentIds },
      NOT: { name: 'Moeda do Sistema' },
    },
  })

  // If all items of next rarity are already owned, give essence compensation
  if (candidates.length === 0) {
    const compensation = fragmentCost * 10
    await prisma.$transaction(async tx => {
      await tx.inventory.deleteMany({ where: { id: { in: inventoryIds }, userId: auth.userId } })
      await tx.user.update({
        where: { id: auth.userId },
        data: { fragments: { decrement: fragmentCost }, essences: { increment: compensation } },
      })
      await tx.activityHistory.create({
        data: {
          userId: auth.userId,
          type: 'FORGE_MERGE',
          description: `Fusão: 3x ${rarity} → ${compensation} Moedas (todos os itens já obtidos)`,
          essenceChange: compensation,
        },
      })
    })
    return NextResponse.json({
      success: true,
      message: `Você já possui todos os itens desta raridade! Recebeu ${compensation} Moedas como compensação.`,
      essenceCompensation: compensation,
      fragmentsSpent: fragmentCost,
    })
  }

  const resultEquipment = candidates[Math.floor(Math.random() * candidates.length)]

  try {
    const result = await prisma.$transaction(async tx => {
      await tx.inventory.deleteMany({ where: { id: { in: inventoryIds }, userId: auth.userId } })
      await tx.user.update({ where: { id: auth.userId }, data: { fragments: { decrement: fragmentCost } } })
      const newItem = await tx.inventory.create({
        data: { userId: auth.userId, equipmentId: resultEquipment.id },
        include: { equipment: true },
      })
      await tx.activityHistory.create({
        data: {
          userId: auth.userId,
          type: 'FORGE_MERGE',
          description: `Fusão: 3x ${rarity} → ${resultEquipment.name} (${nextRarity})`,
          essenceChange: 0,
        },
      })
      return newItem
    })

    return NextResponse.json({
      success: true,
      message: `Fusão concluída! ${result.equipment.icon} ${result.equipment.name} (${nextRarity}) criado!`,
      item: {
        id: result.id,
        name: result.equipment.name,
        icon: result.equipment.icon,
        rarity: result.equipment.rarity,
        type: result.equipment.type,
      },
      fragmentsSpent: fragmentCost,
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Race condition: item was acquired between our check and the transaction
      const compensation = fragmentCost * 10
      await prisma.user.update({
        where: { id: auth.userId },
        data: { essences: { increment: compensation } },
      })
      return NextResponse.json({
        success: true,
        message: `Item já obtido por outra ação simultânea. Recebeu ${compensation} Moedas como compensação.`,
        essenceCompensation: compensation,
        fragmentsSpent: fragmentCost,
      })
    }
    console.error('Forge merge error:', error)
    return NextResponse.json({ error: 'Erro na fusão' }, { status: 500 })
  }
}
