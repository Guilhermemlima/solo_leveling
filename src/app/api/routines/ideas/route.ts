import { NextRequest, NextResponse } from 'next/server'
import { TaskCategory, TaskDifficulty } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { getRandomIdeas } from '@/lib/task-ideas'
import { XP_REWARDS, ESSENCE_REWARDS } from '@/lib/game-logic'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const rawCategory = searchParams.get('category')
  const validCategories = ['HEALTH','TRAINING','STUDY','WORK','FINANCE','PERSONAL_DEVELOPMENT','CREATIVITY','SOCIAL','HOME','SPIRITUALITY']
  const category = rawCategory && validCategories.includes(rawCategory) ? rawCategory : undefined
  if (rawCategory && !category) return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
  const count = Math.min(parseInt(searchParams.get('count') ?? '6', 10), 12)

  const ideas = getRandomIdeas(count, category)
  return NextResponse.json(ideas)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const { title, description, category, difficulty, estimatedMinutes } = body

  if (!title || !category || !difficulty) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: {
      userId: auth.userId,
      title,
      description: description ?? '',
      category: category as TaskCategory,
      difficulty: difficulty as TaskDifficulty,
      recurrence: 'ONCE',
      estimatedMinutes: estimatedMinutes ?? 30,
      xpReward: XP_REWARDS[difficulty as TaskDifficulty],
      essenceReward: ESSENCE_REWARDS[difficulty as TaskDifficulty],
    },
  })

  return NextResponse.json({ ok: true, taskId: task.id })
}
