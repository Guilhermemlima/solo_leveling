import { NextRequest, NextResponse } from 'next/server'
import { TaskDifficulty } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { XP_REWARDS, ESSENCE_REWARDS } from '@/lib/game-logic'
import { parseJson, taskSchema } from '@/lib/validation'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const templatesOnly = searchParams.get('templates') === '1'
  const pageParam = searchParams.get('page')
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const page = Math.max(1, parseInt(pageParam || '1'))
  const skip = (page - 1) * limit

  const where = {
    userId: auth.userId,
    ...(status ? { status: status as never } : {}),
    ...(category ? { category: category as never } : {}),
    ...(templatesOnly ? { isTemplate: true } : {}),
  }

  // Se não houver paginação explícita, retorna tudo (compatibilidade com outros usos)
  if (!pageParam) {
    const tasks = await prisma.task.findMany({
      where,
      include: {
        subtasks: { orderBy: { position: 'asc' } },
        executions: { orderBy: { completedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tasks)
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        subtasks: { orderBy: { position: 'asc' } },
        executions: { orderBy: { completedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ])

  return NextResponse.json({ tasks, total, page, totalPages: Math.ceil(total / limit), hasMore: page * limit < total })
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const limiter = rateLimit(clientKey(req, 'create-task', auth.userId), 15, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: `Muitas tarefas criadas em sequência. Tente novamente em ${limiter.retryAfter}s.` },
      { status: 429 }
    )
  }

  try {
    const parsed = parseJson(taskSchema, await req.json())
    if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const {
      title, description, category, difficulty, recurrence, dueDate,
      targetValue, targetUnit, estimatedMinutes, isTemplate, templateName, subtasks,
    } = parsed.data

    const task = await prisma.task.create({
      data: {
        userId: auth.userId,
        title,
        description,
        category,
        difficulty,
        recurrence,
        dueDate: dueDate ? new Date(dueDate) : null,
        targetValue,
        targetUnit,
        estimatedMinutes,
        isTemplate,
        templateName,
        xpReward: XP_REWARDS[difficulty as TaskDifficulty],
        essenceReward: ESSENCE_REWARDS[difficulty as TaskDifficulty],
        subtasks: {
          create: subtasks.map((subtask, position) => ({ title: subtask, position })),
        },
      },
      include: { subtasks: { orderBy: { position: 'asc' } } },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 })
  }
}
