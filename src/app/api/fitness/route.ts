import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { fitnessGoalProgress, loadEvolution } from '@/lib/fitness'

/** Resumo do módulo fitness para a página de Academia. */
export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))

  const [goals, measurements, exercises, recentWorkouts, weekWorkouts] = await Promise.all([
    prisma.fitnessGoal.findMany({ where: { userId: auth.userId }, orderBy: { createdAt: 'desc' } }),
    prisma.bodyMeasurement.findMany({ where: { userId: auth.userId }, orderBy: { date: 'desc' }, take: 30 }),
    prisma.exercise.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      include: { workouts: { orderBy: { date: 'desc' }, take: 50 } },
    }),
    prisma.workoutLog.findMany({
      where: { userId: auth.userId },
      orderBy: { date: 'desc' },
      take: 15,
      include: { exercise: true },
    }),
    prisma.workoutLog.findMany({
      where: { userId: auth.userId, date: { gte: weekStart } },
      select: { date: true },
    }),
  ])

  // Dias distintos com treino nesta semana
  const trainedDays = new Set(weekWorkouts.map(w => new Date(w.date).toDateString())).size

  const latestWeight = measurements.find(m => m.weight != null)?.weight ?? null
  const firstWeight = [...measurements].reverse().find(m => m.weight != null)?.weight ?? null

  const active = goals.filter(g => g.status === 'ACTIVE')
  const mainGoal = active[0] ?? goals[0] ?? null

  // Enriquece exercícios com melhor carga, recorde de reps, evolução e último treino
  const enrichedExercises = exercises.map(ex => {
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

  return NextResponse.json({
    goals: goals.map(g => ({ ...g, progress: fitnessGoalProgress(g.startValue, g.currentValue, g.targetValue) })),
    mainGoal: mainGoal
      ? { ...mainGoal, progress: fitnessGoalProgress(mainGoal.startValue, mainGoal.currentValue, mainGoal.targetValue) }
      : null,
    measurements,
    exercises: enrichedExercises,
    recentWorkouts,
    trainedThisWeek: trainedDays,
    latestWeight,
    firstWeight,
  })
}
