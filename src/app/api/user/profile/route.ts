import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      selectedClass: true,
      attributes: true,
      inventory: { where: { isEquipped: true }, include: { equipment: true } },
      userAchievements: { include: { achievement: true }, orderBy: { unlockedAt: 'desc' }, take: 6 },
    }
  })

  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const [totalTasks, tasksByCategory] = await Promise.all([
    prisma.task.count({ where: { userId: auth.userId, status: 'COMPLETED' } }),
    prisma.task.groupBy({ by: ['category'], where: { userId: auth.userId, status: 'COMPLETED' }, _count: true }),
  ])

  const { passwordHash: _, ...safeUser } = user

  return NextResponse.json({
    ...safeUser,
    stats: {
      totalTasksCompleted: totalTasks,
      tasksByCategory,
    }
  })
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { name, avatarUrl, selectedClassId } = await req.json()

  const updated = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      ...(name ? { name } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(selectedClassId !== undefined ? { selectedClassId } : {}),
    },
    include: { selectedClass: true }
  })

  const { passwordHash: _, ...safeUser } = updated
  return NextResponse.json(safeUser)
}
