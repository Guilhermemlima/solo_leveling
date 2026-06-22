import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, exerciseSchema } from '@/lib/validation'
import { loadEvolution } from '@/lib/fitness'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const exercises = await prisma.exercise.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    include: { workouts: { orderBy: { date: 'desc' }, take: 30 } },
  })

  const enriched = exercises.map(ex => {
    const logs = ex.workouts
    const last = logs[0] ?? null
    const bestLoad = logs.reduce((max, l) => Math.max(max, l.weight ?? 0), 0)
    const bestReps = logs.reduce((max, l) => Math.max(max, l.reps ?? 0), 0)
    const chrono = [...logs].reverse()
    const firstLoad = chrono.find(l => (l.weight ?? 0) > 0)?.weight ?? 0
    const lastLoad = last?.weight ?? 0
    return {
      id: ex.id, name: ex.name, muscleGroup: ex.muscleGroup, type: ex.type, unit: ex.unit,
      lastWorkout: last,
      bestLoad, bestReps,
      evolution: loadEvolution(firstLoad, lastLoad),
      totalWorkouts: logs.length,
    }
  })

  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const parsed = parseJson(exerciseSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.data

  const exercise = await prisma.exercise.create({
    data: {
      userId: auth.userId,
      name: d.name,
      muscleGroup: d.muscleGroup ?? null,
      type: d.type,
      unit: d.unit,
    },
  })

  return NextResponse.json({ exercise }, { status: 201 })
}
