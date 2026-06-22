import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, fitnessGoalUpdateSchema } from '@/lib/validation'
import { fitnessGoalProgress } from '@/lib/fitness'
import { grantReward } from '@/lib/rewards'
import { checkFitnessAchievements } from '@/lib/achievements'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  const existing = await prisma.fitnessGoal.findFirst({ where: { id, userId: auth.userId } })
  if (!existing) return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })

  const parsed = parseJson(fitnessGoalUpdateSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.data

  // Auto-conclusão quando o valor atual atinge a meta
  let autoComplete = false
  if (d.currentValue !== undefined && existing.status === 'ACTIVE') {
    const prog = fitnessGoalProgress(existing.startValue, d.currentValue, existing.targetValue)
    if (prog >= 100) autoComplete = true
  }

  const updated = await prisma.fitnessGoal.update({
    where: { id },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.currentValue !== undefined && { currentValue: d.currentValue }),
      ...(d.targetValue !== undefined && { targetValue: d.targetValue }),
      ...(d.unit !== undefined && { unit: d.unit }),
      ...(d.deadline !== undefined && { deadline: d.deadline ? new Date(d.deadline) : null }),
      ...((d.status !== undefined || autoComplete) && { status: autoComplete ? 'COMPLETED' : d.status }),
    },
  })

  let reward = null
  const becameCompleted = updated.status === 'COMPLETED' && existing.status !== 'COMPLETED'
  if (becameCompleted) {
    reward = await grantReward(auth.userId, {
      xp: 80, essences: 50, type: 'FITNESS',
      description: `Meta física concluída: ${updated.name} 🏆`,
      dailyCap: 300,
    }).catch(() => null)
  }

  const newAchievements = becameCompleted ? await checkFitnessAchievements(auth.userId).catch(() => []) : []

  return NextResponse.json({ goal: { ...updated, progress: fitnessGoalProgress(updated.startValue, updated.currentValue, updated.targetValue) }, reward, newAchievements })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  const existing = await prisma.fitnessGoal.findFirst({ where: { id, userId: auth.userId } })
  if (!existing) return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })

  await prisma.fitnessGoal.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
