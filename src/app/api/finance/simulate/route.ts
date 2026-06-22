import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, simulationSchema } from '@/lib/validation'
import { simulateInvestment, FINANCE_DISCLAIMER } from '@/lib/finance'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const parsed = parseJson(simulationSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.data

  const result = simulateInvestment({
    initialAmount: d.initialAmount,
    monthlyContribution: d.monthlyContribution,
    annualRate: d.annualRate,
    durationMonths: d.durationMonths,
  })

  if (d.persist) {
    await prisma.investmentSimulation.create({
      data: {
        userId: auth.userId,
        initialAmount: d.initialAmount,
        monthlyContribution: d.monthlyContribution,
        annualRate: d.annualRate,
        durationMonths: d.durationMonths,
        totalContributed: result.totalContributed,
        estimatedReturn: result.estimatedReturn,
        finalAmount: result.finalAmount,
        assetType: d.assetType ?? null,
      },
    }).catch(() => null)
  }

  return NextResponse.json({ ...result, disclaimer: FINANCE_DISCLAIMER })
}
