import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { XP_REWARDS, ESSENCE_REWARDS } from '@/lib/game-logic'
import { TaskDifficulty } from '@prisma/client'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const category = searchParams.get('category')

  const tasks = await prisma.task.findMany({
    where: {
      userId: auth.userId,
      ...(status ? { status: status as any } : {}),
      ...(category ? { category: category as any } : {}),
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, description, category, difficulty, recurrence, dueDate } = body

    if (!title || !category || !difficulty) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const xpReward = XP_REWARDS[difficulty as TaskDifficulty]
    const essenceReward = ESSENCE_REWARDS[difficulty as TaskDifficulty]

    const task = await prisma.task.create({
      data: {
        userId: auth.userId,
        title,
        description,
        category,
        difficulty,
        recurrence: recurrence || 'ONCE',
        dueDate: dueDate ? new Date(dueDate) : null,
        xpReward,
        essenceReward,
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 })
  }
}
