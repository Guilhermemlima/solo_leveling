import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, financialGoalSchema } from '@/lib/validation'
import { goalProgress } from '@/lib/finance'
import { grantReward } from '@/lib/rewards'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const goals = await prisma.financialGoal.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(goals.map(g => ({ ...g, progress: goalProgress(g.currentAmount, g.targetAmount) })))
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const parsed = parseJson(financialGoalSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.data

  const goal = await prisma.financialGoal.create({
    data: {
      userId: auth.userId,
      name: d.name,
      targetAmount: d.targetAmount,
      currentAmount: d.currentAmount,
      monthlyContribution: d.monthlyContribution,
      category: d.category,
      targetDate: d.targetDate ? new Date(d.targetDate) : null,
    },
  })

  // Gamificação: recompensa por criar meta (com teto diário)
  const reward = await grantReward(auth.userId, {
    xp: 20, essences: 10, type: 'FINANCE',
    description: `Nova meta financeira: ${goal.name}`,
    dailyCap: 120,
  }).catch(() => null)

  return NextResponse.json({ goal: { ...goal, progress: goalProgress(goal.currentAmount, goal.targetAmount) }, reward }, { status: 201 })
}
