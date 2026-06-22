import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, contributionSchema } from '@/lib/validation'
import { grantReward } from '@/lib/rewards'
import { checkFinanceAchievements } from '@/lib/achievements'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const contributions = await prisma.financialContribution.findMany({
    where: { userId: auth.userId },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(contributions)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const parsed = parseJson(contributionSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.data

  // Valida posse da meta, se informada
  let goal = null
  if (d.goalId) {
    goal = await prisma.financialGoal.findFirst({ where: { id: d.goalId, userId: auth.userId } })
    if (!goal) return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
  }

  const result = await prisma.$transaction(async tx => {
    const contribution = await tx.financialContribution.create({
      data: {
        userId: auth.userId,
        goalId: goal?.id ?? null,
        amount: d.amount,
        assetType: d.assetType ?? null,
        source: d.source ?? null,
        notes: d.notes ?? null,
        date: d.date ? new Date(d.date) : new Date(),
      },
    })

    let goalCompleted = false
    if (goal) {
      const newAmount = goal.currentAmount + d.amount
      const reached = newAmount >= goal.targetAmount && goal.targetAmount > 0
      goalCompleted = reached && goal.status !== 'COMPLETED'
      await tx.financialGoal.update({
        where: { id: goal.id },
        data: {
          currentAmount: newAmount,
          ...(goalCompleted && { status: 'COMPLETED' }),
        },
      })
    }

    return { contribution, goalCompleted }
  })

  // Gamificação: recompensa por registrar aporte (teto diário evita farm)
  const reward = await grantReward(auth.userId, {
    xp: 15, essences: 8, type: 'FINANCE',
    description: `Aporte registrado: R$ ${d.amount.toFixed(2)}`,
    dailyCap: 120,
  }).catch(() => null)

  let completionReward = null
  if (result.goalCompleted && goal) {
    completionReward = await grantReward(auth.userId, {
      xp: 80, essences: 50, type: 'FINANCE',
      description: `Meta financeira concluída: ${goal.name} 🏆`,
      dailyCap: 300,
    }).catch(() => null)
  }

  const newAchievements = await checkFinanceAchievements(auth.userId).catch(() => [])

  return NextResponse.json({ ...result, reward, completionReward, newAchievements }, { status: 201 })
}
