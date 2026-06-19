import { NextRequest, NextResponse } from 'next/server'
import { TaskCategory, TaskDifficulty } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ROUTINE_TEMPLATES } from '@/lib/routine-templates'
import { XP_REWARDS, ESSENCE_REWARDS } from '@/lib/game-logic'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  return NextResponse.json(ROUTINE_TEMPLATES)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { templateId } = await req.json()
  const template = ROUTINE_TEMPLATES.find(item => item.id === templateId)
  if (!template) return NextResponse.json({ error: 'Rotina não encontrada' }, { status: 404 })

  const tasks = await prisma.$transaction(
    template.tasks.map(item => prisma.task.create({
      data: {
        userId: auth.userId,
        title: item.title,
        description: `Parte da rotina: ${template.name}`,
        category: item.category as TaskCategory,
        difficulty: item.difficulty as TaskDifficulty,
        recurrence: 'DAILY',
        estimatedMinutes: item.estimatedMinutes,
        targetValue: 'targetValue' in item ? item.targetValue : null,
        targetUnit: 'targetUnit' in item ? item.targetUnit : null,
        xpReward: XP_REWARDS[item.difficulty as TaskDifficulty],
        essenceReward: ESSENCE_REWARDS[item.difficulty as TaskDifficulty],
        isTemplate: true,
        templateName: template.name,
      },
    }))
  )
  return NextResponse.json({ ok: true, created: tasks.length })
}
