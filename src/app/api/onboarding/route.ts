import { NextRequest, NextResponse } from 'next/server'
import { TaskDifficulty } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { parseJson, onboardingSchema } from '@/lib/validation'
import { XP_REWARDS, ESSENCE_REWARDS } from '@/lib/game-logic'

const suggestions: Record<string, { title: string; difficulty: TaskDifficulty; minutes: number }[]> = {
  HEALTH: [
    { title: 'Caminhada consciente', difficulty: 'EASY', minutes: 20 },
    { title: 'Preparar uma refeição equilibrada', difficulty: 'MEDIUM', minutes: 30 },
  ],
  TRAINING: [
    { title: 'Treino adaptável ao seu ambiente', difficulty: 'MEDIUM', minutes: 25 },
    { title: 'Mobilidade e alongamento', difficulty: 'EASY', minutes: 10 },
  ],
  STUDY: [
    { title: 'Sessão de estudo sem distrações', difficulty: 'MEDIUM', minutes: 30 },
    { title: 'Revisar o que aprendi', difficulty: 'EASY', minutes: 10 },
  ],
  WORK: [
    { title: 'Bloco de foco na prioridade do dia', difficulty: 'MEDIUM', minutes: 40 },
    { title: 'Planejar as três próximas ações', difficulty: 'EASY', minutes: 10 },
  ],
  FINANCE: [{ title: 'Registrar e revisar gastos', difficulty: 'EASY', minutes: 15 }],
  SPIRITUALITY: [{ title: 'Pausa de reflexão', difficulty: 'EASY', minutes: 10 }],
  SOCIAL: [{ title: 'Cultivar uma conexão importante', difficulty: 'EASY', minutes: 15 }],
  HOME: [{ title: 'Organizar um espaço da casa', difficulty: 'EASY', minutes: 15 }],
  PERSONAL_DEVELOPMENT: [{ title: 'Registrar uma lição do dia', difficulty: 'EASY', minutes: 10 }],
  CREATIVITY: [{ title: 'Criar sem julgamento', difficulty: 'MEDIUM', minutes: 25 }],
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const parsed = parseJson(onboardingSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const data = parsed.data
  const hasEquipment = data.availableEquipment.some(item => item !== 'NONE')

  const selected = data.goals.flatMap(goal => (suggestions[goal] || []).slice(0, 1))
    .slice(0, 4)
    .map(item => ({
      ...item,
      title: item.title === 'Treino adaptável ao seu ambiente' && !hasEquipment
        ? 'Circuito de treino sem equipamentos'
        : item.title,
    }))

  await prisma.$transaction(async tx => {
    await tx.user.update({
      where: { id: auth.userId },
      data: {
        ...data,
        healthNotes: data.healthNotes || null,
        onboardingCompleted: true,
      },
    })
    for (const item of selected) {
      const category = data.goals.find(goal => suggestions[goal]?.some(s => s.title === item.title))
        || (item.title.includes('treino') ? 'TRAINING' : data.goals[0])
      await tx.task.create({
        data: {
          userId: auth.userId,
          title: item.title,
          description: 'Sugestão inicial criada a partir das suas preferências. Você pode editar ou excluir.',
          category,
          difficulty: item.difficulty,
          recurrence: 'DAILY',
          estimatedMinutes: Math.min(item.minutes, data.availableMinutes),
          xpReward: XP_REWARDS[item.difficulty],
          essenceReward: ESSENCE_REWARDS[item.difficulty],
        },
      })
    }
  })

  return NextResponse.json({ ok: true, tasksCreated: selected.length })
}
