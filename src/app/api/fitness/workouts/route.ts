import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, workoutSchema } from '@/lib/validation'
import { grantReward } from '@/lib/rewards'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const workouts = await prisma.workoutLog.findMany({
    where: { userId: auth.userId },
    orderBy: { date: 'desc' },
    take: 100,
    include: { exercise: true },
  })
  return NextResponse.json(workouts)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const parsed = parseJson(workoutSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.data

  // Valida posse do exercício e detecta recorde (PR)
  let isPR = false
  let exerciseName = d.activity ?? 'Atividade'
  if (d.exerciseId) {
    const exercise = await prisma.exercise.findFirst({
      where: { id: d.exerciseId, userId: auth.userId },
      include: { workouts: { orderBy: { date: 'desc' }, take: 100 } },
    })
    if (!exercise) return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })
    exerciseName = exercise.name
    const prevBestLoad = exercise.workouts.reduce((max, l) => Math.max(max, l.weight ?? 0), 0)
    const prevBestReps = exercise.workouts.reduce((max, l) => Math.max(max, l.reps ?? 0), 0)
    if ((d.weight ?? 0) > prevBestLoad || (d.reps ?? 0) > prevBestReps) isPR = true
  }

  const workout = await prisma.workoutLog.create({
    data: {
      userId: auth.userId,
      exerciseId: d.exerciseId ?? null,
      activity: d.activity ?? null,
      weight: d.weight ?? null,
      reps: d.reps ?? null,
      sets: d.sets ?? null,
      distance: d.distance ?? null,
      duration: d.duration ?? null,
      calories: d.calories ?? null,
      intensity: d.intensity ?? null,
      notes: d.notes ?? null,
      date: d.date ? new Date(d.date) : new Date(),
    },
  })

  // Gamificação: recompensa por registrar treino + bônus por recorde
  const reward = await grantReward(auth.userId, {
    xp: isPR ? 35 : 18, essences: isPR ? 20 : 10, type: 'FITNESS',
    description: isPR ? `Novo recorde em ${exerciseName}! 💥` : `Treino registrado: ${exerciseName}`,
    dailyCap: 150,
  }).catch(() => null)

  return NextResponse.json({ workout, isPR, reward }, { status: 201 })
}
