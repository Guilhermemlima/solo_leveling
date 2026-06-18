import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { calculateLevelUp, ATTRIBUTE_GAINS, STREAK_REWARDS, classXpMultiplier } from '@/lib/game-logic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  const task = await prisma.task.findFirst({ where: { id, userId: auth.userId } })
  if (!task) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
  if (task.status === 'COMPLETED') return NextResponse.json({ error: 'Tarefa já concluída' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: { attributes: true, selectedClass: true }
  })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  // Streak calculation (precisa vir antes do XP por causa do bônus de classe de streak)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null
  lastActive?.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let newStreak = user.currentStreak
  let streakBonus = 0
  const streakReward = { essences: 0, label: '' }

  if (!lastActive || lastActive.getTime() === yesterday.getTime()) {
    newStreak = user.currentStreak + 1
  } else if (lastActive.getTime() !== today.getTime()) {
    newStreak = 1
  }
  const keepsStreak = newStreak > user.currentStreak

  if (STREAK_REWARDS[newStreak]) {
    streakBonus = STREAK_REWARDS[newStreak].essences
    streakReward.essences = streakBonus
    streakReward.label = STREAK_REWARDS[newStreak].label
  }

  // Bônus de classe aplicado a XP e Essências da tarefa
  const classMult = classXpMultiplier(user.selectedClass?.bonusType, user.selectedClass?.bonusValue, task.category, keepsStreak)
  const classBonusActive = classMult > 1
  const xpGained = Math.round(task.xpReward * classMult)
  const essenceFromTask = Math.round(task.essenceReward * classMult)

  // Level up calculation (com o XP já bonificado)
  const { level, currentXp, levelUps } = calculateLevelUp(user.level, user.currentXp, xpGained)

  const levelUpBonus = levelUps.length > 0 ? levelUps.length * 50 : 0
  const totalEssences = essenceFromTask + streakBonus + levelUpBonus

  // Attribute gains
  const attrGains = ATTRIBUTE_GAINS[task.category] || {}
  const attrUpdate: Record<string, number> = {}
  for (const [attr, gain] of Object.entries(attrGains)) {
    attrUpdate[attr] = (user.attributes?.[attr as keyof typeof user.attributes] as number || 0) + (gain as number)
  }

  await prisma.$transaction([
    prisma.task.update({ where: { id }, data: { status: 'COMPLETED', completedAt: new Date() } }),
    prisma.user.update({
      where: { id: auth.userId },
      data: {
        level,
        currentXp,
        totalXp: { increment: xpGained },
        essences: { increment: totalEssences },
        currentStreak: newStreak,
        bestStreak: Math.max(user.bestStreak, newStreak),
        lastActiveDate: new Date(),
      }
    }),
    ...(Object.keys(attrUpdate).length > 0
      ? [prisma.attribute.update({ where: { userId: auth.userId }, data: attrUpdate })]
      : []),
    prisma.activityHistory.create({
      data: {
        userId: auth.userId,
        type: 'TASK_COMPLETED',
        description: `Tarefa concluída: ${task.title}`,
        xpChange: xpGained,
        essenceChange: totalEssences,
      }
    }),
  ])

  // Check achievements
  const [totalCompleted, totalXpUser] = await Promise.all([
    prisma.task.count({ where: { userId: auth.userId, status: 'COMPLETED' } }),
    prisma.user.findUnique({ where: { id: auth.userId }, select: { totalXp: true, level: true, currentStreak: true } }),
  ])

  const achievementChecks = [
    { type: 'TASKS_COMPLETED', value: totalCompleted },
    { type: 'LEVEL', value: totalXpUser?.level || 1 },
    { type: 'STREAK', value: totalXpUser?.currentStreak || 0 },
    { type: 'TOTAL_XP', value: (totalXpUser?.totalXp || 0) + xpGained },
  ]

  for (const check of achievementChecks) {
    const eligible = await prisma.achievement.findMany({
      where: { requirementType: check.type, requirementValue: { lte: check.value } }
    })
    for (const ach of eligible) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId: auth.userId, achievementId: ach.id } },
        update: {},
        create: { userId: auth.userId, achievementId: ach.id }
      })
    }
  }

  // Update mission progress
  const activeMissions = await prisma.userMission.findMany({
    where: { userId: auth.userId, status: 'ACTIVE' },
    include: { mission: true }
  })

  for (const um of activeMissions) {
    const m = um.mission
    let newProgress = um.progress
    const shouldIncrement = (
      m.requirementType === 'TASKS_COMPLETED' ||
      m.requirementType === 'DAILY_TASKS' ||
      m.requirementType === 'WEEKLY_TASKS' ||
      (m.requirementType === 'CATEGORY_HEALTH_TRAINING' && (task.category === 'HEALTH' || task.category === 'TRAINING')) ||
      (m.requirementType === 'CATEGORY_STUDY' && task.category === 'STUDY') ||
      (m.requirementType === 'WEEKLY_TRAINING' && task.category === 'TRAINING') ||
      (m.requirementType === 'WEEKLY_STUDY' && task.category === 'STUDY')
    )

    if (shouldIncrement) {
      newProgress = um.progress + 1
      const isComplete = newProgress >= m.requirementValue
      await prisma.userMission.update({
        where: { id: um.id },
        data: { progress: newProgress, ...(isComplete ? { status: 'COMPLETED', completedAt: new Date() } : {}) }
      })
    }
  }

  return NextResponse.json({
    xpGained,
    essencesGained: totalEssences,
    levelUps,
    newLevel: level,
    newStreak,
    streakReward: streakBonus > 0 ? streakReward : null,
    attributeGains: attrGains,
    classBonus: classBonusActive ? { name: user.selectedClass?.name, percent: user.selectedClass?.bonusValue } : null,
  })
}
