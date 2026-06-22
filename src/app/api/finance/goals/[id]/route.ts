import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, financialGoalUpdateSchema } from '@/lib/validation'
import { goalProgress } from '@/lib/finance'
import { grantReward } from '@/lib/rewards'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  const existing = await prisma.financialGoal.findFirst({ where: { id, userId: auth.userId } })
  if (!existing) return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })

  const parsed = parseJson(financialGoalUpdateSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.data

  const updated = await prisma.financialGoal.update({
    where: { id },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.targetAmount !== undefined && { targetAmount: d.targetAmount }),
      ...(d.currentAmount !== undefined && { currentAmount: d.currentAmount }),
      ...(d.monthlyContribution !== undefined && { monthlyContribution: d.monthlyContribution }),
      ...(d.category !== undefined && { category: d.category }),
      ...(d.status !== undefined && { status: d.status }),
      ...(d.targetDate !== undefined && { targetDate: d.targetDate ? new Date(d.targetDate) : null }),
    },
  })

  // Recompensa ao concluir a meta (uma vez, ao transicionar para COMPLETED)
  let reward = null
  if (d.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
    reward = await grantReward(auth.userId, {
      xp: 80, essences: 50, type: 'FINANCE',
      description: `Meta financeira concluída: ${updated.name} 🏆`,
      dailyCap: 300,
    }).catch(() => null)
  }

  return NextResponse.json({ goal: { ...updated, progress: goalProgress(updated.currentAmount, updated.targetAmount) }, reward })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  const existing = await prisma.financialGoal.findFirst({ where: { id, userId: auth.userId } })
  if (!existing) return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })

  await prisma.financialGoal.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
