import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { equipmentId } = await req.json()
  if (!equipmentId) return NextResponse.json({ error: 'equipmentId obrigatório' }, { status: 400 })

  const fullSetItem = await prisma.equipment.findUnique({ where: { id: equipmentId } })
  if (!fullSetItem || !fullSetItem.isFullSet || !fullSetItem.setKey) {
    return NextResponse.json({ error: 'Item inválido para compra de conjunto' }, { status: 400 })
  }

  // Find all individual pieces of this set (non-fullSet, same setKey)
  const pieces = await prisma.equipment.findMany({
    where: { setKey: fullSetItem.setKey, isFullSet: false },
  })

  if (pieces.length === 0) {
    return NextResponse.json({ error: 'Peças do conjunto não encontradas' }, { status: 400 })
  }

  // Find which pieces the user already owns
  const ownedInventory = await prisma.inventory.findMany({
    where: { userId: auth.userId, equipmentId: { in: pieces.map(p => p.id) } },
    select: { equipmentId: true },
  })
  const ownedPieceIds = new Set(ownedInventory.map(i => i.equipmentId))
  const missingPieces = pieces.filter(p => !ownedPieceIds.has(p.id))

  if (missingPieces.length === 0) {
    return NextResponse.json({ error: 'Você já possui todas as peças deste conjunto!' }, { status: 409 })
  }

  // Cost = full set price - sum of prices of already-owned pieces
  const ownedPiecesValue = pieces
    .filter(p => ownedPieceIds.has(p.id))
    .reduce((sum, p) => sum + p.price, 0)
  const effectiveCost = Math.max(0, fullSetItem.price - ownedPiecesValue)

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { essences: true } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  if (user.essences < effectiveCost) {
    return NextResponse.json({ error: `Moedas insuficientes! Você precisa de ${effectiveCost} Moedas.` }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: auth.userId }, data: { essences: { decrement: effectiveCost } } })
    for (const piece of missingPieces) {
      await tx.inventory.create({ data: { userId: auth.userId, equipmentId: piece.id } })
    }
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

  const pieceNames = missingPieces.map(p => p.name).join(', ')
  const msg = missingPieces.length === pieces.length
    ? `Conjunto completo adquirido! Recebeu: ${pieceNames}`
    : `Peças adicionadas ao seu inventário: ${pieceNames}`

  return NextResponse.json({ message: msg, piecesAdded: missingPieces.length, cost: effectiveCost })
}
