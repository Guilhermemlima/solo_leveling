import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, measurementSchema } from '@/lib/validation'
import { grantReward } from '@/lib/rewards'
import { checkFitnessAchievements } from '@/lib/achievements'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: auth.userId },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(measurements)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const parsed = parseJson(measurementSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.data

  const measurement = await prisma.bodyMeasurement.create({
    data: {
      userId: auth.userId,
      weight: d.weight ?? null,
      waist: d.waist ?? null,
      chest: d.chest ?? null,
      arm: d.arm ?? null,
      leg: d.leg ?? null,
      hip: d.hip ?? null,
      bodyFat: d.bodyFat ?? null,
      notes: d.notes ?? null,
      date: d.date ? new Date(d.date) : new Date(),
    },
  })

  const reward = await grantReward(auth.userId, {
    xp: 12, essences: 6, type: 'FITNESS',
    description: 'Medidas corporais registradas',
    dailyCap: 120,
  }).catch(() => null)

  const newAchievements = await checkFitnessAchievements(auth.userId).catch(() => [])

  return NextResponse.json({ measurement, reward, newAchievements }, { status: 201 })
}
