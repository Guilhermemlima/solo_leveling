import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { getRank } from '@/lib/ranks'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      attributes: true,
      selectedClass: true,
      tasks: {
        include: { executions: true },
        orderBy: { createdAt: 'desc' },
      },
      userMissions: { include: { mission: true }, where: { completedAt: { not: null } } },
      inventory: { include: { equipment: true } },
      userAchievements: { include: { achievement: true } },
      activityHistory: { orderBy: { createdAt: 'desc' }, take: 60 },
      battles: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })

  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const completedTasks = user.tasks.filter(t => t.completedAt)
  const totalExecutions = user.tasks.reduce((s, t) => s + (t.executions?.length ?? 0), 0)

  const byCategory = completedTasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1
    return acc
  }, {})

  const arenaWins = user.battles.filter(b => b.won).length

  const { passwordHash: _, ...safeUser } = user

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    user: {
      name: safeUser.name,
      email: safeUser.email,
      level: safeUser.level,
      currentXp: safeUser.currentXp,
      totalXp: safeUser.totalXp,
      essences: safeUser.essences,
      streak: safeUser.currentStreak,
      bestStreak: safeUser.bestStreak,
      arenaWins: safeUser.arenaWins,
      arenaLosses: safeUser.arenaLosses,
      rank: getRank(safeUser.arenaPoints).tier,
      specialization: safeUser.specialization,
      selectedClass: safeUser.selectedClass,
      createdAt: safeUser.createdAt,
    },
    attributes: safeUser.attributes,
    stats: {
      totalTasks: user.tasks.length,
      completedTasks: completedTasks.length,
      totalExecutions,
      byCategory,
      arenaWins,
      arenaTotal: user.battles.length,
      missionsCompleted: user.userMissions.length,
      achievementsUnlocked: user.userAchievements.length,
      inventorySize: user.inventory.length,
      equippedItems: user.inventory.filter(i => i.isEquipped).length,
    },
    achievements: user.userAchievements.map(ua => ({
      name: ua.achievement.name,
      icon: ua.achievement.icon,
      description: ua.achievement.description,
      unlockedAt: ua.unlockedAt,
    })),
    inventory: user.inventory.map(i => ({
      name: i.equipment.name,
      type: i.equipment.type,
      rarity: i.equipment.rarity,
      icon: i.equipment.icon,
      description: i.equipment.description,
      upgradeLevel: i.upgradeLevel,
      isEquipped: i.isEquipped,
    })),
    recentActivity: user.activityHistory.slice(0, 30).map(a => ({
      date: a.createdAt,
      type: a.type,
      description: a.description,
      xpChange: a.xpChange,
      essenceChange: a.essenceChange,
    })),
    recentBattles: user.battles.slice(0, 10).map(b => ({
      opponentName: b.opponentName,
      result: b.won ? 'WIN' : 'LOSS',
      xpEarned: b.xpChange,
      createdAt: b.createdAt,
    })),
  })
}
