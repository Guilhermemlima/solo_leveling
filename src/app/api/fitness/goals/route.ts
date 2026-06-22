import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, fitnessGoalSchema } from '@/lib/validation'
import { fitnessGoalProgress } from '@/lib/fitness'
import { grantReward } from '@/lib/rewards'
import { checkFitnessAchievements } from '@/lib/achievements'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const goals = await prisma.fitnessGoal.findMany({ where: { userId: auth.userId }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(goals.map(g => ({ ...g, progress: fitnessGoalProgress(g.startValue, g.currentValue, g.targetValue) })))
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const parsed = parseJson(fitnessGoalSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.data

  const goal = await prisma.fitnessGoal.create({
    data: {
      userId: auth.userId,
      name: d.name,
      type: d.type,
      currentValue: d.currentValue,
      startValue: d.startValue ?? d.currentValue,
      targetValue: d.targetValue,
      unit: d.unit,
      deadline: d.deadline ? new Date(d.deadline) : null,
    },
  })

  const reward = await grantReward(auth.userId, {
    xp: 20, essences: 10, type: 'FITNESS',
    description: `Nova meta física: ${goal.name}`,
    dailyCap: 120,
  }).catch(() => null)

  const newAchievements = await checkFitnessAchievements(auth.userId).catch(() => [])

  return NextResponse.json({ goal: { ...goal, progress: fitnessGoalProgress(goal.startValue, goal.currentValue, goal.targetValue) }, reward, newAchievements }, { status: 201 })
}
