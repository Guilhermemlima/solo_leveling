import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { calculateLevelUp } from '@/lib/game-logic'
import { rollChest, type ChestRank } from '@/lib/chests'

const ATTR_PT: Record<string, string> = {
  strength: 'Força', intelligence: 'Inteligência', discipline: 'Disciplina', focus: 'Foco',
  vitality: 'Vitalidade', charisma: 'Carisma', wisdom: 'Sabedoria', creativity: 'Criatividade',
}
const ATTR_ICON: Record<string, string> = {
  strength: '💪', intelligence: '🧠', discipline: '⚡', focus: '🎯',
  vitality: '❤️', charisma: '✨', wisdom: '🌟', creativity: '🎨',
}
const RARITY_LABEL: Record<string, string> = {
  COMMON: 'Comum', UNCOMMON: 'Incomum', RARE: 'Raro', EPIC: 'Épico', LEGENDARY: 'Lendário', MYTHIC: 'Mítico',
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params // id = userChest id

  const userChest = await prisma.userChest.findFirst({
    where: { id, userId: auth.userId },
    include: { chest: true },
  })
  if (!userChest || userChest.quantity < 1) {
    return NextResponse.json({ error: 'Caixa não encontrada' }, { status: 404 })
  }

  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const rank = userChest.chest.rank as ChestRank
  const rolled = rollChest(rank)

  // Resolve recompensas (itens precisam consultar o banco)
  let essencesGain = 0
  let xpGain = 0
  const attrIncrements: Record<string, number> = {}
  const resolved: any[] = []
  const ownedIds = (await prisma.inventory.findMany({ where: { userId: auth.userId }, select: { equipmentId: true } })).map(i => i.equipmentId)
  let newItemId: string | null = null

  for (const r of rolled) {
    if (r.type === 'ESSENCES') {
      essencesGain += r.amount || 0
      resolved.push({ type: 'ESSENCES', amount: r.amount, label: `${r.amount} Essências`, icon: '💎' })
    } else if (r.type === 'XP') {
      xpGain += r.amount || 0
      resolved.push({ type: 'XP', amount: r.amount, label: `${r.amount} XP`, icon: '⚡' })
    } else if (r.type === 'ATTRIBUTE' && r.attribute) {
      attrIncrements[r.attribute] = (attrIncrements[r.attribute] || 0) + (r.amount || 0)
      resolved.push({ type: 'ATTRIBUTE', attribute: r.attribute, amount: r.amount, label: `+${r.amount} ${ATTR_PT[r.attribute]}`, icon: ATTR_ICON[r.attribute] })
    } else if (r.type === 'ITEM' && r.rarity) {
      const excludeIds: string[] = newItemId ? [...ownedIds, newItemId] : [...ownedIds]
      const candidates = await prisma.equipment.findMany({
        where: { rarity: r.rarity as any, id: { notIn: excludeIds } },
      })
      if (candidates.length > 0) {
        const item = candidates[Math.floor(Math.random() * candidates.length)]
        newItemId = item.id
        resolved.push({ type: 'ITEM', equipmentId: item.id, name: item.name, icon: item.icon, rarity: item.rarity, label: item.name, rarityLabel: RARITY_LABEL[item.rarity] })
      } else {
        // sem item disponível dessa raridade → converte em Essências
        const bonus = 50
        essencesGain += bonus
        resolved.push({ type: 'ESSENCES', amount: bonus, label: `${bonus} Essências (item duplicado convertido)`, icon: '💎' })
      }
    }
  }

  const { level, currentXp, levelUps } = calculateLevelUp(user.level, user.currentXp, xpGain)

  const writes: any[] = [
    prisma.userChest.update({ where: { id }, data: { quantity: { decrement: 1 } } }),
    prisma.user.update({
      where: { id: auth.userId },
      data: { essences: { increment: essencesGain }, totalXp: { increment: xpGain }, level, currentXp },
    }),
    prisma.chestOpeningLog.create({ data: { userId: auth.userId, chestId: userChest.chestId, rewardsJson: resolved } }),
    prisma.activityHistory.create({
      data: { userId: auth.userId, type: 'CHEST_OPEN', description: `Abriu ${userChest.chest.name}`, xpChange: xpGain, essenceChange: essencesGain },
    }),
  ]
  if (Object.keys(attrIncrements).length > 0) {
    const data: Record<string, { increment: number }> = {}
    for (const [k, v] of Object.entries(attrIncrements)) data[k] = { increment: v }
    writes.push(prisma.attribute.update({ where: { userId: auth.userId }, data }))
  }
  if (newItemId) {
    writes.push(prisma.inventory.create({ data: { userId: auth.userId, equipmentId: newItemId } }))
  }

  await prisma.$transaction(writes)

  return NextResponse.json({
    chest: { rank, name: userChest.chest.name, icon: userChest.chest.icon },
    rewards: resolved,
    levelUps,
    newLevel: level,
  })
}
