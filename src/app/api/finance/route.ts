import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { goalProgress, FINANCE_DISCLAIMER } from '@/lib/finance'

/** Resumo do módulo financeiro para a página de Finanças. */
export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [goals, contributions, monthAgg, totalAgg] = await Promise.all([
    prisma.financialGoal.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.financialContribution.findMany({
      where: { userId: auth.userId },
      orderBy: { date: 'desc' },
      take: 20,
    }),
    prisma.financialContribution.aggregate({
      where: { userId: auth.userId, date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.financialContribution.aggregate({
      where: { userId: auth.userId },
      _sum: { amount: true },
    }),
  ])

  const totalInvested = totalAgg._sum.amount ?? 0
  const monthInvested = monthAgg._sum.amount ?? 0

  // Meta principal: primeira ativa com maior progresso, ou a mais recente
  const active = goals.filter(g => g.status === 'ACTIVE')
  const mainGoal = active.sort((a, b) =>
    goalProgress(b.currentAmount, b.targetAmount) - goalProgress(a.currentAmount, a.targetAmount)
  )[0] ?? goals[0] ?? null

  // Série de evolução acumulada (para gráfico) — últimos aportes em ordem cronológica
  const chrono = [...contributions].reverse()
  let acc = 0
  const evolution = chrono.map(c => {
    acc += c.amount
    return { date: c.date, total: Math.round(acc * 100) / 100 }
  })

  return NextResponse.json({
    totalInvested,
    monthInvested,
    goals: goals.map(g => ({ ...g, progress: goalProgress(g.currentAmount, g.targetAmount) })),
    mainGoal: mainGoal
      ? { ...mainGoal, progress: goalProgress(mainGoal.currentAmount, mainGoal.targetAmount) }
      : null,
    contributions,
    evolution,
    disclaimer: FINANCE_DISCLAIMER,
  })
}
