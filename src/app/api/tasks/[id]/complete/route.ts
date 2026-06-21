import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import {
  calculateLevelUp, ATTRIBUTE_GAINS, STREAK_REWARDS, classXpMultiplier, levelMultiplier,
} from '@/lib/game-logic'
import { completionSchema, parseJson } from '@/lib/validation'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { getSpecialization } from '@/lib/specializations'
import { chestRankForLevel, CHESTS } from '@/lib/chests'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const limiter = rateLimit(clientKey(req, 'complete-task', auth.userId), 20, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Muitas conclusões em sequência. Aguarde alguns segundos.' }, { status: 429 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = parseJson(completionSchema, body)
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const idempotencyKey = req.headers.get('idempotency-key') || body.idempotencyKey
  if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.length > 100) {
    return NextResponse.json({ error: 'Chave de idempotência ausente' }, { status: 400 })
  }

  const existing = await prisma.actionReceipt.findUnique({
    where: { userId_action_key: { userId: auth.userId, action: 'TASK_COMPLETE', key: idempotencyKey } },
  })
  if (existing?.result) return NextResponse.json(existing.result)

  // Limite diário de 30 conclusões
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayCompleted = await prisma.taskExecution.count({
    where: { userId: auth.userId, completedAt: { gte: todayStart } },
  })
  if (todayCompleted >= 30) {
    return NextResponse.json(
      { error: 'Limite diário de 30 tarefas atingido. Excelente trabalho, Ascendente! Volte amanhã.' },
      { status: 429 }
    )
  }

  try {
    const result = await prisma.$transaction(async tx => {
      await tx.actionReceipt.create({
        data: { userId: auth.userId, action: 'TASK_COMPLETE', key: idempotencyKey },
      })

      const task = await tx.task.findFirst({
        where: { id, userId: auth.userId },
        include: { subtasks: true },
      })
      if (!task) throw new Error('TASK_NOT_FOUND')

      const claimed = await tx.task.updateMany({
        where: { id, userId: auth.userId, status: 'PENDING' },
        data: { status: 'COMPLETED', completedAt: new Date() },
      })
      if (claimed.count !== 1) throw new Error('TASK_ALREADY_COMPLETED')

      const user = await tx.user.findUnique({
        where: { id: auth.userId },
        include: { attributes: true, selectedClass: true },
      })
      if (!user) throw new Error('USER_NOT_FOUND')

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null
      lastActive?.setHours(0, 0, 0, 0)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let newStreak = user.currentStreak
      if (!lastActive || lastActive.getTime() === yesterday.getTime()) newStreak += 1
      else if (lastActive.getTime() !== today.getTime()) newStreak = 1

      const keepsStreak = newStreak > user.currentStreak
      const streakReward = STREAK_REWARDS[newStreak] || null
      const classMult = classXpMultiplier(
        user.selectedClass?.bonusType,
        user.selectedClass?.bonusValue,
        task.category,
        keepsStreak
      )
      const specialization = getSpecialization(user.specialization)
      const specializationMatches =
        (specialization?.key === 'VANGUARD' && ['HEALTH', 'TRAINING'].includes(task.category)) ||
        (specialization?.key === 'SCHOLAR' && task.category === 'STUDY') ||
        (specialization?.key === 'ARCHITECT' && task.category === 'WORK') ||
        (specialization?.key === 'HARMONIZER' && ['SOCIAL', 'CREATIVITY'].includes(task.category))
      const specializationMult = specializationMatches ? 1.05 : 1

      const lvlMult = levelMultiplier(user.level)
      const xpGained = Math.round(task.xpReward * classMult * specializationMult * lvlMult)
      const essenceFromTask = Math.round(task.essenceReward * classMult * lvlMult)
      const { level, currentXp, levelUps } = calculateLevelUp(user.level, user.currentXp, xpGained)
      const levelUpBonus = levelUps.length * 50
      const totalEssences = essenceFromTask + (streakReward?.essences || 0) + levelUpBonus
      const FRAGMENT_PER_DIFFICULTY: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3, EXTREME: 5 }
      const fragmentsGained = FRAGMENT_PER_DIFFICULTY[task.difficulty] ?? 1

      const attrGains = ATTRIBUTE_GAINS[task.category] || {}
      const attrUpdate: Record<string, number> = {}
      for (const [attr, gain] of Object.entries(attrGains)) {
        attrUpdate[attr] =
          ((user.attributes?.[attr as keyof typeof user.attributes] as number) || 0) + Number(gain)
      }

      await tx.user.update({
        where: { id: auth.userId },
        data: {
          level,
          currentXp,
          totalXp: { increment: xpGained },
          essences: { increment: totalEssences },
          fragments: { increment: fragmentsGained },
          currentStreak: newStreak,
          bestStreak: Math.max(user.bestStreak, newStreak),
          lastActiveDate: new Date(),
        },
      })
      if (Object.keys(attrUpdate).length) {
        await tx.attribute.upsert({
          where: { userId: auth.userId },
          update: attrUpdate,
          create: { userId: auth.userId, ...attrUpdate },
        })
      }

      // Caixa de recompensa ao subir de nível (Chi Navy)
      let chestReward: { rank: string; name: string; icon: string } | null = null
      if (levelUps.length > 0) {
        const rank = chestRankForLevel(level)
        const chest = await tx.chest.findUnique({ where: { key: CHESTS[rank].key } })
        if (chest) {
          await tx.userChest.upsert({
            where: { userId_chestId: { userId: auth.userId, chestId: chest.id } },
            update: { quantity: { increment: 1 } },
            create: { userId: auth.userId, chestId: chest.id, quantity: 1, source: 'LEVEL_UP' },
          })
          chestReward = { rank, name: CHESTS[rank].name, icon: CHESTS[rank].icon }
        }
      }

      await tx.taskSubtask.updateMany({ where: { taskId: id }, data: { completed: true } })
      await tx.taskExecution.create({
        data: {
          taskId: id,
          userId: auth.userId,
          idempotencyKey,
          ...parsed.data,
          xpGained,
          essenceGained: totalEssences,
        },
      })
      await tx.activityHistory.create({
        data: {
          userId: auth.userId,
          type: 'TASK_COMPLETED',
          description: `Tarefa concluída: ${task.title}`,
          xpChange: xpGained,
          essenceChange: totalEssences,
        },
      })

      const activeChallenges = await tx.groupChallenge.findMany({
        where: {
          endsAt: { gte: new Date() },
          group: { members: { some: { userId: auth.userId } } },
        },
      })
      for (const challenge of activeChallenges) {
        await tx.groupContribution.upsert({
          where: { challengeId_userId: { challengeId: challenge.id, userId: auth.userId } },
          update: { value: { increment: 1 } },
          create: { challengeId: challenge.id, userId: auth.userId, value: 1 },
        })
      }

      const totalCompleted = await tx.taskExecution.count({ where: { userId: auth.userId } })
      const achievementChecks = [
        { type: 'TASKS_COMPLETED', value: totalCompleted },
        { type: 'LEVEL', value: level },
        { type: 'STREAK', value: newStreak },
        { type: 'TOTAL_XP', value: user.totalXp + xpGained },
      ]
      for (const check of achievementChecks) {
        const eligible = await tx.achievement.findMany({
          where: { requirementType: check.type, requirementValue: { lte: check.value } },
        })
        for (const achievement of eligible) {
          await tx.userAchievement.upsert({
            where: {
              userId_achievementId: { userId: auth.userId, achievementId: achievement.id },
            },
            update: {},
            create: { userId: auth.userId, achievementId: achievement.id },
          })
        }
      }

      const activeMissions = await tx.userMission.findMany({
        where: { userId: auth.userId, status: 'ACTIVE' },
        include: { mission: true },
      })
      for (const userMission of activeMissions) {
        const requirement = userMission.mission.requirementType
        const shouldIncrement =
          ['TASKS_COMPLETED', 'DAILY_TASKS', 'WEEKLY_TASKS', 'MONTHLY_TASKS'].includes(requirement) ||
          (requirement === 'CATEGORY_HEALTH_TRAINING' && ['HEALTH', 'TRAINING'].includes(task.category)) ||
          (requirement === 'CATEGORY_STUDY' && task.category === 'STUDY') ||
          (requirement === 'WEEKLY_TRAINING' && task.category === 'TRAINING') ||
          (requirement === 'WEEKLY_STUDY' && task.category === 'STUDY') ||
          (requirement === 'MONTHLY_TRAINING' && task.category === 'TRAINING') ||
          (requirement === 'MONTHLY_STUDY' && task.category === 'STUDY') ||
          (requirement === 'MONTHLY_HEALTH' && ['HEALTH', 'TRAINING'].includes(task.category))
        if (shouldIncrement) {
          const progress = userMission.progress + 1
          await tx.userMission.update({
            where: { id: userMission.id },
            data: {
              progress,
              ...(progress >= userMission.mission.requirementValue
                ? { status: 'COMPLETED', completedAt: new Date() }
                : {}),
            },
          })
        }
      }

      const response = {
        xpGained,
        essencesGained: totalEssences,
        fragmentsGained,
        levelUps,
        newLevel: level,
        newStreak,
        streakReward,
        attributeGains: attrGains,
        classBonus: classMult > 1
          ? { name: user.selectedClass?.name, percent: user.selectedClass?.bonusValue }
          : null,
        specializationBonus: specializationMatches
          ? { name: specialization?.name, percent: 5 }
          : null,
        chestReward,
      }

      await tx.actionReceipt.update({
        where: { userId_action_key: { userId: auth.userId, action: 'TASK_COMPLETE', key: idempotencyKey } },
        data: { result: JSON.parse(JSON.stringify(response)) as Prisma.InputJsonValue },
      })
      return response
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 15000 })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2034')) {
      const receipt = await prisma.actionReceipt.findUnique({
        where: { userId_action_key: { userId: auth.userId, action: 'TASK_COMPLETE', key: idempotencyKey } },
      })
      if (receipt?.result) return NextResponse.json(receipt.result)
    }
    const message = error instanceof Error ? error.message : ''
    if (message === 'TASK_NOT_FOUND') return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    if (message === 'TASK_ALREADY_COMPLETED') {
      return NextResponse.json({ error: 'Tarefa já concluída' }, { status: 409 })
    }
    console.error('Complete task error:', error)
    return NextResponse.json({ error: 'Não foi possível concluir a tarefa' }, { status: 500 })
  }
}
