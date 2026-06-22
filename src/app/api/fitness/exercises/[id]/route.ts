import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, exerciseSchema } from '@/lib/validation'
import { loadEvolution } from '@/lib/fitness'

/** Detalhe do exercício com histórico para gráfico de progresso. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  const exercise = await prisma.exercise.findFirst({
    where: { id, userId: auth.userId },
    include: { workouts: { orderBy: { date: 'asc' }, take: 60 } },
  })
  if (!exercise) return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })

  const logs = exercise.workouts
  const bestLoad = logs.reduce((max, l) => Math.max(max, l.weight ?? 0), 0)
  const bestReps = logs.reduce((max, l) => Math.max(max, l.reps ?? 0), 0)
  const firstLoad = logs.find(l => (l.weight ?? 0) > 0)?.weight ?? 0
  const lastLoad = [...logs].reverse().find(l => (l.weight ?? 0) > 0)?.weight ?? 0

  return NextResponse.json({
    exercise: { id: exercise.id, name: exercise.name, muscleGroup: exercise.muscleGroup, type: exercise.type, unit: exercise.unit },
    history: logs,
    bestLoad, bestReps,
    evolution: loadEvolution(firstLoad, lastLoad),
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  const existing = await prisma.exercise.findFirst({ where: { id, userId: auth.userId } })
  if (!existing) return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })

  const parsed = parseJson(exerciseSchema.partial(), await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.data

  const exercise = await prisma.exercise.update({
    where: { id },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.muscleGroup !== undefined && { muscleGroup: d.muscleGroup }),
      ...(d.type !== undefined && { type: d.type }),
      ...(d.unit !== undefined && { unit: d.unit }),
    },
  })
  return NextResponse.json({ exercise })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { id } = await params

  const existing = await prisma.exercise.findFirst({ where: { id, userId: auth.userId } })
  if (!existing) return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })

  await prisma.exercise.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
