import { NextRequest, NextResponse } from 'next/server'
import { TaskCategory, TaskDifficulty, TaskRecurrence } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { taskSchema } from '@/lib/validation'
import { XP_REWARDS, ESSENCE_REWARDS } from '@/lib/game-logic'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const payload = await req.json()
  const rawTasks = Array.isArray(payload?.user?.tasks) ? payload.user.tasks : []
  if (!rawTasks.length || rawTasks.length > 500) {
    return NextResponse.json({ error: 'Arquivo sem tarefas válidas ou acima do limite' }, { status: 400 })
  }
  const valid = rawTasks.flatMap((raw: any) => {
    const result = taskSchema.safeParse({
      title: raw.title, description: raw.description, category: raw.category,
      difficulty: raw.difficulty, recurrence: raw.recurrence, dueDate: raw.dueDate,
      targetValue: raw.targetValue, targetUnit: raw.targetUnit,
      estimatedMinutes: raw.estimatedMinutes,
      subtasks: Array.isArray(raw.subtasks) ? raw.subtasks.map((item: any) => item.title) : [],
    })
    return result.success ? [result.data] : []
  })
  for (const task of valid) {
    await prisma.task.create({
      data: {
        userId: auth.userId,
        title: task.title,
        description: task.description,
        category: task.category as TaskCategory,
        difficulty: task.difficulty as TaskDifficulty,
        recurrence: task.recurrence as TaskRecurrence,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        targetValue: task.targetValue,
        targetUnit: task.targetUnit,
        estimatedMinutes: task.estimatedMinutes,
        xpReward: XP_REWARDS[task.difficulty as TaskDifficulty],
        essenceReward: ESSENCE_REWARDS[task.difficulty as TaskDifficulty],
        subtasks: { create: task.subtasks.map((title: string, position: number) => ({ title, position })) },
      },
    })
  }
  return NextResponse.json({ imported: valid.length })
}
